import React, { useRef, useCallback, useEffect, useState, forwardRef, useImperativeHandle, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';

export interface ChromaKeyVideoRef {
  playAsync: () => Promise<AVPlaybackStatus>;
  pauseAsync: () => Promise<AVPlaybackStatus>;
  setPositionAsync: (positionMillis: number) => Promise<AVPlaybackStatus>;
  getStatusAsync: () => Promise<AVPlaybackStatus>;
}

interface ChromaKeyVideoProps {
  source: { uri: string };
  style?: any;
  shouldPlay?: boolean;
  isLooping?: boolean;
  isMuted?: boolean;
  onPlaybackStatusUpdate?: (status: AVPlaybackStatus) => void;
  onLoad?: () => void;
  onError?: (error: string) => void;
  greenThreshold?: number;
  greenMultiplier?: number;
}

const generateChromaKeyHTML = (
  videoUrl: string,
  isLooping: boolean,
  isMuted: boolean,
  greenThreshold: number,
  greenMultiplier: number
) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { 
      width: 100%; 
      height: 100%; 
      overflow: hidden; 
      background: transparent;
    }
    #container {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
    }
    #video {
      position: absolute;
      opacity: 0;
      pointer-events: none;
      width: 1px;
      height: 1px;
    }
    #canvas {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
  </style>
</head>
<body>
  <div id="container">
    <video id="video" playsinline ${isMuted ? 'muted' : ''} ${isLooping ? 'loop' : ''}>
      <source src="${videoUrl}" type="video/mp4">
    </video>
    <canvas id="canvas"></canvas>
  </div>
  <script>
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    const SENSITIVITY = ${greenThreshold};
    
    const HUE_MIN = 70;
    const HUE_MAX = 170;
    const SAT_MIN = 0.10;
    const LIGHT_MIN = 0.05;
    const LIGHT_MAX = 0.90;
    const EDGE_RANGE = 15;
    
    let animationId = null;
    let isPlaying = false;
    let isVideoReady = false;
    let lastStatusTime = 0;
    let pendingCommands = [];
    let canvasIsTainted = false;
    
    function sendMessage(type, data) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type, ...data }));
      }
    }
    
    function getStatus() {
      return {
        positionMillis: Math.floor(video.currentTime * 1000),
        durationMillis: Math.floor((video.duration || 0) * 1000),
        isPlaying: !video.paused && !video.ended,
        isBuffering: video.readyState < 3,
        didJustFinish: video.ended,
        shouldPlay: isPlaying,
        rate: 1,
        volume: video.muted ? 0 : 1,
        isMuted: video.muted
      };
    }
    
    function renderFrame() {
      if (video.readyState < 2) {
        animationId = requestAnimationFrame(renderFrame);
        return;
      }
      
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      if (!canvasIsTainted) {
        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          const len = data.length;
          
          for (let i = 0; i < len; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            if (g < 10) continue;
            const maxRB = r > b ? r : b;
            if (g < maxRB * 0.85) continue;
            
            const rn = r / 255;
            const gn = g / 255;
            const bn = b / 255;
            const cmax = rn > gn ? (rn > bn ? rn : bn) : (gn > bn ? gn : bn);
            const cmin = rn < gn ? (rn < bn ? rn : bn) : (gn < bn ? gn : bn);
            const delta = cmax - cmin;
            
            if (delta < 0.02) continue;
            
            let h = 0;
            if (cmax === gn) {
              h = 60 * (((bn - rn) / delta) + 2);
            } else if (cmax === rn) {
              h = 60 * (((gn - bn) / delta) % 6);
            } else {
              h = 60 * (((rn - gn) / delta) + 4);
            }
            if (h < 0) h += 360;
            
            if (h < HUE_MIN - EDGE_RANGE || h > HUE_MAX + EDGE_RANGE) continue;
            
            const l = (cmax + cmin) / 2;
            if (l < LIGHT_MIN || l > LIGHT_MAX) continue;
            
            const s = delta / (1 - Math.abs(2 * l - 1));
            if (s < SAT_MIN) continue;
            
            const inCoreHue = h >= HUE_MIN && h <= HUE_MAX;
            const satStrength = s > 0.30 ? 1.0 : (s - SAT_MIN) / 0.20;
            
            let alpha;
            if (inCoreHue) {
              const hueCenter = (HUE_MIN + HUE_MAX) / 2;
              const hueDistFromEdge = Math.min(h - HUE_MIN, HUE_MAX - h);
              const hueDepth = hueDistFromEdge / ((HUE_MAX - HUE_MIN) / 2);
              const baseKey = 0.85 + hueDepth * 0.15;
              const keyStrength = satStrength * baseKey * SENSITIVITY;
              alpha = Math.round(255 * (1 - keyStrength));
            } else {
              const edgeDist = h < HUE_MIN ? HUE_MIN - h : h - HUE_MAX;
              const edgeFactor = 1 - (edgeDist / EDGE_RANGE);
              alpha = Math.round(255 * (1 - edgeFactor * edgeFactor * satStrength * 0.6 * SENSITIVITY));
            }
            
            if (alpha < 0) alpha = 0;
            if (alpha > 255) alpha = 255;
            data[i + 3] = alpha;
            
            if (alpha > 0 && alpha < 220) {
              const spillFactor = (1 - alpha / 255);
              const avg = (r + b) / 2;
              if (g > avg) {
                data[i + 1] = Math.round(avg + (g - avg) * (alpha / 255) * 0.6);
              }
            }
          }
          
          ctx.putImageData(imageData, 0, 0);
        } catch (e) {
          canvasIsTainted = true;
          sendMessage('debug', { event: 'canvas_tainted', message: e.message });
        }
      }
      
      const now = performance.now();
      if (now - lastStatusTime > 100) {
        sendMessage('timeUpdate', getStatus());
        lastStatusTime = now;
      }
      
      animationId = requestAnimationFrame(renderFrame);
    }
    
    function processPendingCommands() {
      while (pendingCommands.length > 0) {
        const cmd = pendingCommands.shift();
        executeCommand(cmd.commandId, cmd.command, cmd.params);
      }
    }
    
    function executeCommand(commandId, command, params) {
      params = params || {};
      
      switch (command) {
        case 'play':
          isPlaying = true;
          video.play()
            .then(() => {
              sendMessage('commandResult', { commandId, command: 'play', success: true, status: getStatus() });
            })
            .catch(e => {
              sendMessage('commandResult', { commandId, command: 'play', success: false, error: e.message, status: getStatus() });
            });
          break;
          
        case 'pause':
          isPlaying = false;
          video.pause();
          sendMessage('commandResult', { commandId, command: 'pause', success: true, status: getStatus() });
          break;
          
        case 'seek':
          const targetTime = (params.positionMs || 0) / 1000;
          video.currentTime = targetTime;
          // Wait for seeked event before resolving
          const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked);
            sendMessage('commandResult', { commandId, command: 'seek', success: true, status: getStatus() });
          };
          video.addEventListener('seeked', onSeeked);
          // Timeout fallback
          setTimeout(() => {
            video.removeEventListener('seeked', onSeeked);
            sendMessage('commandResult', { commandId, command: 'seek', success: true, status: getStatus() });
          }, 500);
          break;
          
        case 'setMuted':
          video.muted = !!params.muted;
          sendMessage('commandResult', { commandId, command: 'setMuted', success: true, status: getStatus() });
          break;
          
        case 'getStatus':
          sendMessage('commandResult', { commandId, command: 'getStatus', success: true, status: getStatus() });
          break;
      }
    }
    
    let loadTimeout = null;
    
    video.addEventListener('loadstart', () => {
      sendMessage('debug', { event: 'loadstart', src: video.currentSrc || video.src || 'unknown' });
      if (loadTimeout) clearTimeout(loadTimeout);
      loadTimeout = setTimeout(() => {
        if (!isVideoReady) {
          sendMessage('error', { 
            message: 'Video load timeout - no data received after 8s', 
            code: -2, 
            src: video.currentSrc || 'unknown',
            readyState: video.readyState,
            networkState: video.networkState
          });
        }
      }, 8000);
    });

    video.addEventListener('loadeddata', () => {
      if (loadTimeout) { clearTimeout(loadTimeout); loadTimeout = null; }
      isVideoReady = true;
      sendMessage('loaded', { 
        durationMillis: Math.floor(video.duration * 1000),
        width: video.videoWidth,
        height: video.videoHeight
      });
      animationId = requestAnimationFrame(renderFrame);
      processPendingCommands();
      if (isPlaying) {
        video.play().catch(e => sendMessage('error', { message: e.message }));
      }
    });

    video.addEventListener('stalled', () => {
      sendMessage('debug', { event: 'stalled', readyState: video.readyState, networkState: video.networkState });
      sendMessage('statusUpdate', getStatus());
    });

    video.addEventListener('waiting', () => {
      sendMessage('debug', { event: 'waiting', readyState: video.readyState, currentTime: video.currentTime });
      sendMessage('statusUpdate', getStatus());
    });

    video.addEventListener('playing', () => {
      sendMessage('statusUpdate', getStatus());
    });
    
    video.addEventListener('play', () => {
      sendMessage('statusUpdate', getStatus());
    });
    
    video.addEventListener('pause', () => {
      sendMessage('statusUpdate', getStatus());
    });
    
    video.addEventListener('ended', () => {
      sendMessage('ended', getStatus());
    });
    
    video.addEventListener('error', (e) => {
      var errCode = video.error ? video.error.code : -1;
      var errMsg = video.error ? video.error.message : 'Unknown video error';
      sendMessage('error', { message: errMsg, code: errCode, src: video.currentSrc || 'unknown' });
    });
    
    // Global command handler for React Native
    window.handleCommand = function(commandId, command, params) {
      if (!isVideoReady) {
        pendingCommands.push({ commandId, command, params });
        return;
      }
      executeCommand(commandId, command, params);
    };
    
    sendMessage('debug', { event: 'calling_video_load', src: '${videoUrl}'.substring(0, 120) });
    video.load();
  </script>
</body>
</html>
`;

export const ChromaKeyVideo = forwardRef<ChromaKeyVideoRef, ChromaKeyVideoProps>(({
  source,
  style,
  shouldPlay = false,
  isLooping = false,
  isMuted = false,
  onPlaybackStatusUpdate,
  onLoad,
  onError,
  greenThreshold = 0.95,
  greenMultiplier = 1.3,
}, ref) => {
  const webViewRef = useRef<WebView>(null);
  const [isReady, setIsReady] = useState(false);
  const lastPlayState = useRef(false);
  const commandResolvers = useRef<Map<string, (status: AVPlaybackStatus) => void>>(new Map());
  const lastStatusRef = useRef<AVPlaybackStatus>({ isLoaded: false } as AVPlaybackStatus);
  const commandIdCounter = useRef(0);

  const createStatus = useCallback((data: any): AVPlaybackStatus => {
    const status: AVPlaybackStatusSuccess = {
      isLoaded: true,
      uri: source.uri,
      progressUpdateIntervalMillis: 100,
      positionMillis: data.positionMillis || 0,
      durationMillis: data.durationMillis || 0,
      playableDurationMillis: data.durationMillis || 0,
      shouldPlay: data.shouldPlay ?? data.isPlaying,
      isPlaying: data.isPlaying,
      isBuffering: data.isBuffering || false,
      rate: data.rate || 1,
      shouldCorrectPitch: false,
      volume: data.volume ?? (isMuted ? 0 : 1),
      isMuted: data.isMuted ?? isMuted,
      isLooping: isLooping,
      didJustFinish: data.didJustFinish || false,
      audioPan: 0,
    };
    lastStatusRef.current = status;
    return status;
  }, [source.uri, isMuted, isLooping]);

  const sendCommand = useCallback((command: string, params?: any): Promise<AVPlaybackStatus> => {
    return new Promise((resolve) => {
      if (!webViewRef.current) {
        resolve(lastStatusRef.current);
        return;
      }
      
      // Generate unique command ID
      const commandId = `cmd_${++commandIdCounter.current}_${Date.now()}`;
      commandResolvers.current.set(commandId, resolve);
      
      const paramsStr = params ? JSON.stringify(params) : '{}';
      webViewRef.current.injectJavaScript(`
        window.handleCommand('${commandId}', '${command}', ${paramsStr});
        true;
      `);
      
      // Timeout fallback - commands should resolve within 2 seconds
      setTimeout(() => {
        if (commandResolvers.current.has(commandId)) {
          commandResolvers.current.delete(commandId);
          resolve(lastStatusRef.current);
        }
      }, 2000);
    });
  }, []);

  useImperativeHandle(ref, () => ({
    playAsync: () => sendCommand('play'),
    pauseAsync: () => sendCommand('pause'),
    setPositionAsync: (positionMillis: number) => sendCommand('seek', { positionMs: positionMillis }),
    getStatusAsync: () => sendCommand('getStatus'),
  }), [sendCommand]);

  useEffect(() => {
    console.log('[ChromaKey] Source URI set:', source.uri?.substring(0, 150));
  }, [source.uri]);

  useEffect(() => {
    if (lastPlayState.current !== shouldPlay) {
      lastPlayState.current = shouldPlay;
      const command = shouldPlay ? 'play' : 'pause';
      console.log('[ChromaKey] Sending command:', command, 'isReady:', isReady);
      sendCommand(command);
    }
  }, [shouldPlay, sendCommand]);

  // When video becomes ready, send play command if shouldPlay is true
  useEffect(() => {
    if (isReady && shouldPlay) {
      console.log('[ChromaKey] Video ready, auto-starting playback');
      sendCommand('play');
    }
  }, [isReady, shouldPlay, sendCommand]);

  const handleMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'loaded':
          console.log('[ChromaKey] Video loaded:', data);
          setIsReady(true);
          onLoad?.();
          break;
          
        case 'timeUpdate':
        case 'statusUpdate':
          const status = createStatus(data);
          onPlaybackStatusUpdate?.(status);
          break;
          
        case 'ended':
          const endStatus = createStatus({ ...data, didJustFinish: true, isPlaying: false });
          onPlaybackStatusUpdate?.(endStatus);
          break;
          
        case 'commandResult':
          if (data.commandId && data.status) {
            const resultStatus = createStatus(data.status);
            // Resolve the specific command by its ID
            const resolver = commandResolvers.current.get(data.commandId);
            if (resolver) {
              commandResolvers.current.delete(data.commandId);
              resolver(resultStatus);
            }
            // Also emit status update for timing sync
            onPlaybackStatusUpdate?.(resultStatus);
          }
          break;
          
        case 'debug':
          console.log('[ChromaKey] Debug:', data.event, data);
          break;

        case 'error':
          console.log('[ChromaKey] Video error:', data.message, 'code:', data.code);
          onError?.(data.message);
          break;
      }
    } catch (e) {
      console.log('[ChromaKey] Message parse error:', e);
    }
  }, [createStatus, onLoad, onPlaybackStatusUpdate, onError]);

  const html = useMemo(() => generateChromaKeyHTML(
    source.uri,
    isLooping,
    isMuted,
    greenThreshold,
    greenMultiplier
  ), [source.uri, isLooping, isMuted, greenThreshold, greenMultiplier]);

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html, baseUrl: 'file:///' }}
        style={styles.webView}
        originWhitelist={['*']}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        onMessage={handleMessage}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        mixedContentMode="always"
        renderError={() => (
          <View style={{ flex: 1, backgroundColor: 'transparent' }} />
        )}
        onHttpError={(e) => {
          console.log('[ChromaKey] WebView HTTP error:', e.nativeEvent.statusCode, e.nativeEvent.url);
        }}
        onError={(e) => {
          console.log('[ChromaKey] WebView error:', e.nativeEvent);
          onError?.('WebView error');
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default ChromaKeyVideo;
