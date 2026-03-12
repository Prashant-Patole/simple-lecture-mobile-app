import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  ScrollView,
  Animated,
  Modal,
  Pressable,
  Platform,
  useWindowDimensions,
  Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { ChromaKeyVideo, ChromaKeyVideoRef } from '../components/ChromaKeyVideo';
import { LatexText } from '../components/LatexText';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp, useFocusEffect, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import * as ScreenOrientation from 'expo-screen-orientation';
import { extractJobIdFromUrl, getMediaUrl, getCdnMediaUrl, getAvatarVideoPath, getPresentationUrl } from '../utils/mediaResolver';
import { usePrefetchVideos } from '../hooks/usePrefetchVideos';
import { getVideoUri, getVideoUriAsync, downloadVideo, downloadVideoBatch, isVideoCached, isVideoCachedAsync, registerCachedUri, clearCorruptCache } from '../services/videoCacheService';
import type { VideoDownloadResult } from '../services/videoCacheService';


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const colors = {
  primary: '#2BBD6E',
  primaryLight: '#4ADE80',
  background: '#123447',
  backgroundDark: '#0a1f2d',
  white: '#FFFFFF',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  success: '#22c55e',
  warning: '#f59e0b',
  info: '#3b82f6',
};

interface Segment {
  segment_id: string;
  text: string;
  duration_seconds: number;
  start_time?: number;
  end_time?: number;
  display_directives?: {
    text_layer?: string;
    visual_layer?: string;
    avatar_layer?: string;
  };
  beat_videos?: string[];
  purpose?: string;
}

interface VisualBeat {
  beat_id: string;
  segment_id?: string;
  visual_type: string;
  display_text: string | string[];
  start_time?: number;
  end_time?: number;
  latex_content?: string;
  image_id?: string;
  video_asset?: string;
  markdown_pointer?: {
    start_phrase: string;
    end_phrase: string;
  };
}

interface Flashcard {
  front: string;
  back: string;
  id?: string;
}

interface AvatarLanguage {
  language: string;
  video_path: string;
  status: string;
  speaker?: string;
  task_id?: string;
  duration?: number;
}

interface Section {
  section_id: number;
  section_type: 'intro' | 'summary' | 'content' | 'example' | 'quiz' | 'memory' | 'recap';
  title: string;
  renderer?: string;
  text_layer?: string;
  visual_layer?: string;
  avatar_layer?: string;
  avatar_video?: string;
  vimeo_url?: string;
  avatar_languages?: AvatarLanguage[];
  narration: {
    full_text?: string;
    segments: Segment[];
    total_duration_seconds: number;
  };
  visual_beats?: VisualBeat[];
  flashcards?: Flashcard[];
  content?: string;
}

interface PresentationData {
  presentation_title: string;
  sections: Section[];
  base_url?: string;
}

type AILecturePlayerScreenRouteProp = RouteProp<RootStackParamList, 'AILecturePlayer'>;

export default function AILecturePlayerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<AILecturePlayerScreenRouteProp>();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { presentationUrl, presentationJson, videoUrl, jobId: passedJobId, topicTitle, startFullscreen, initialLanguage } = route.params || {};
  const playerLanguage = initialLanguage || 'english';
  
  // Extract jobId from videoUrl if not directly provided
  const jobId = passedJobId || extractJobIdFromUrl(videoUrl);

  const [loading, setLoading] = useState(true);
  const [preloadingVideos, setPreloadingVideos] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState({ loaded: 0, total: 0 });
  const [allVideosReady, setAllVideosReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [presentationData, setPresentationData] = useState<PresentationData | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const currentTimeRef = useRef(0);
  const [displayTime, setDisplayTime] = useState(0);
  const displayTimeThrottleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [revealedBeats, setRevealedBeats] = useState<string[]>([]);
  const [phase, setPhase] = useState<'teach' | 'show'>('teach');
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(startFullscreen ?? false);
  const [orientationReady, setOrientationReady] = useState(!startFullscreen); // Wait for orientation lock if starting fullscreen
  const savedPositionRef = useRef<number | null>(null); // Store position during fullscreen toggle
  const savedWasPlayingRef = useRef<boolean>(false); // Store play state during fullscreen toggle
  const [pendingPositionRestore, setPendingPositionRestore] = useState<number | null>(null); // Trigger restore when avatar ready
  const isTransitioningRef = useRef(false);
  const lastSectionEndRef = useRef(0);
  const lastOverlaySyncRef = useRef(0);
  const overlayStartTimeRef = useRef(0);
  const stableVideoSourceRef = useRef<{ uri: string } | null>(null);
  const stableVideoUriRef = useRef<string>('');
  const [flashcardFlipped, setFlashcardFlipped] = useState<number | null>(null);
  const [activeQuickAction, setActiveQuickAction] = useState<string | null>(null);

  // Note: avatarARef and avatarBRef are used instead (dual-layer system)
  const contentVideoRef = useRef<Video>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const flashcardTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [useTimerFallback, setUseTimerFallback] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [quizPhase, setQuizPhase] = useState<'introduce' | 'pause' | 'reveal'>('introduce');
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [autoFlipIndex, setAutoFlipIndex] = useState(-1);
  const [beatVideoLoading, setBeatVideoLoading] = useState(false);
  const [beatVideoReady, setBeatVideoReady] = useState(false);
  const [preBufferedVideoUrl, setPreBufferedVideoUrl] = useState<string | null>(null);
  const [currentBeatVideoUrl, setCurrentBeatVideoUrl] = useState<string | null>(null);
  
  // Dual avatar layer system - keeps two ChromaKeyVideo instances for seamless transitions
  // Avatar A and B alternate between being the active (visible) and preload (hidden) layer
  const [avatarAUrl, setAvatarAUrl] = useState<string | null>(null);
  const [avatarBUrl, setAvatarBUrl] = useState<string | null>(null);
  const [avatarAReady, setAvatarAReady] = useState(false);
  const [avatarBReady, setAvatarBReady] = useState(false);
  const [activeAvatarLayer, setActiveAvatarLayer] = useState<'A' | 'B'>('A');
  // Flag to indicate we're waiting for active avatar to be ready before starting playback
  const [pendingAvatarStart, setPendingAvatarStart] = useState(false);
  const [pendingLayerSwap, setPendingLayerSwap] = useState<'A' | 'B' | null>(null);
  const [avatarIsBuffering, setAvatarIsBuffering] = useState(false);
  
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const avatarARef = useRef<ChromaKeyVideoRef>(null);
  const avatarBRef = useRef<ChromaKeyVideoRef>(null);
  
  // Animation for smooth video overlay transitions
  const videoOverlayOpacity = useRef(new Animated.Value(0)).current;
  const preBufferVideoRef = useRef<Video>(null);
  
  // Track which URLs have been preloaded to avoid redundant loads
  const preloadedUrlsRef = useRef<Set<string>>(new Set());
  // Track URLs that failed to download (404 or other errors)
  const failedUrlsRef = useRef<Set<string>>(new Set());
  
  // Use ref to track revealed beats to avoid stale closure issues in callbacks
  const revealedBeatsRef = useRef<string[]>([]);

  const currentSection = presentationData?.sections[currentSectionIndex];
  
  // Prefetch next section's videos while current section plays
  // Disabled when allVideosReady=true since we preload everything on open
  usePrefetchVideos({
    sections: allVideosReady ? null : (presentationData?.sections || null),
    currentSectionIndex,
    jobId,
    isPlaying,
    onPrefetchProgress: undefined,
  });

  useEffect(() => {
    loadPresentation();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (flashcardTimerRef.current) {
        clearInterval(flashcardTimerRef.current);
      }
      if (displayTimeThrottleRef.current) {
        clearTimeout(displayTimeThrottleRef.current);
      }
    };
  }, [presentationUrl, presentationJson, jobId]);

  // Timer fallback when avatar video fails to load
  useEffect(() => {
    if (useTimerFallback && isPlaying && duration > 0) {
      timerRef.current = setInterval(() => {
        const newTime = currentTimeRef.current + 0.1;
        if (newTime >= duration) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleSectionEnd();
          currentTimeRef.current = duration;
          setDisplayTime(duration);
          return;
        }
        onTimeUpdate(newTime);
      }, 100);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [useTimerFallback, isPlaying, duration]);

  // Helper function to calculate segment start time consistently
  const getSegmentStartTime = (segmentIdx: number): number => {
    if (!currentSection) return 0;
    const segments = currentSection.narration.segments;
    
    // If segment has explicit start_time, use it
    if (segments[segmentIdx]?.start_time !== undefined) {
      return segments[segmentIdx].start_time!;
    }
    
    // Otherwise, calculate from cumulative durations
    let time = 0;
    for (let i = 0; i < segmentIdx; i++) {
      time += segments[i].duration_seconds;
    }
    return time;
  };

  const overlayPlayingSegmentRef = useRef<string | null>(null);

  useEffect(() => {
    const handlePhaseTransition = async () => {
      if (!contentVideoRef.current) return;
      
      const segment = currentSection?.narration.segments[currentSegmentIndex];
      const hasVideo = segment?.beat_videos && segment.beat_videos.length > 0;
      const shouldShowOverlay = (phase === 'show' || 
        (currentSection?.section_type === 'recap' && hasVideo));
      
      const segmentKey = `${currentSectionIndex}_${currentSegmentIndex}`;
      
      if (shouldShowOverlay && isPlaying && beatVideoReady) {
        if (overlayPlayingSegmentRef.current === segmentKey) {
          return;
        }
        try {
          await contentVideoRef.current.setPositionAsync(0);
          await contentVideoRef.current.playAsync();
          overlayPlayingSegmentRef.current = segmentKey;
          overlayStartTimeRef.current = Date.now();
          lastOverlaySyncRef.current = Date.now();
          console.log('[AILecturePlayer] Phase transition: STARTED overlay playback');
        } catch (e) {
          console.log('[AILecturePlayer] Overlay phase transition error:', e);
        }
      } else if (!shouldShowOverlay) {
        try {
          await contentVideoRef.current.pauseAsync();
        } catch (e) {}
        overlayPlayingSegmentRef.current = null;
      }
    };
    
    handlePhaseTransition();
  }, [phase, currentSegmentIndex, beatVideoReady, isPlaying]);

  useEffect(() => {
    let cancelled = false;
    overlayPlayingSegmentRef.current = null;
    const segment = currentSection?.narration.segments[currentSegmentIndex];
    const beatVideos = segment?.beat_videos;
    
    if (beatVideos && beatVideos.length > 0) {
      const syncUrl = resolveMediaUrl(beatVideos[0], 'video');
      const isCachedUri = syncUrl.startsWith('file://');
      
      const remoteUrl = isCachedUri ? '' : syncUrl;
      if (failedUrlsRef.current.has(remoteUrl)) {
        console.log('[AILecturePlayer] [BEAT] Skipping failed video (404)');
        setCurrentBeatVideoUrl(null);
        setBeatVideoReady(true);
        setBeatVideoLoading(false);
        return;
      }
      
      if (isCachedUri) {
        console.log(`[AILecturePlayer] [BEAT] Playing from CACHE: ${syncUrl.substring(syncUrl.lastIndexOf('/') + 1)}`);
        setCurrentBeatVideoUrl(syncUrl);
        setBeatVideoReady(true);
        setBeatVideoLoading(false);
      } else {
        setBeatVideoLoading(true);
        const resolveAsync = async () => {
          try {
            const asyncUri = await getVideoUriAsync(syncUrl);
            if (cancelled) return;
            const isFromCache = asyncUri.startsWith('file://');
            console.log(`[AILecturePlayer] [BEAT] Playing from ${isFromCache ? 'CACHE (async)' : 'REMOTE'}: ${asyncUri.substring(asyncUri.lastIndexOf('/') + 1)}`);
            setCurrentBeatVideoUrl(asyncUri);
            setBeatVideoReady(true);
            setBeatVideoLoading(false);
          } catch {
            if (cancelled) return;
            console.log(`[AILecturePlayer] [BEAT] Async resolve failed, using remote: ${syncUrl.substring(syncUrl.lastIndexOf('/') + 1)}`);
            setCurrentBeatVideoUrl(syncUrl);
            setBeatVideoReady(true);
            setBeatVideoLoading(false);
          }
        };
        resolveAsync();
      }
    } else {
      setCurrentBeatVideoUrl(null);
      setBeatVideoReady(true);
      setBeatVideoLoading(false);
    }

    const nextSegment = currentSection?.narration.segments[currentSegmentIndex + 1];
    const nextBeatVideos = nextSegment?.beat_videos;
    if (nextBeatVideos && nextBeatVideos.length > 0) {
      const nextUrl = resolveMediaUrl(nextBeatVideos[0], 'video');
      if (nextUrl && !nextUrl.startsWith('file://')) {
        getVideoUriAsync(nextUrl).then(uri => {
          if (!cancelled) setPreBufferedVideoUrl(uri);
        }).catch(() => {});
      } else if (nextUrl) {
        setPreBufferedVideoUrl(nextUrl);
      }
    } else {
      setPreBufferedVideoUrl(null);
    }

    return () => { cancelled = true; };
  }, [currentSegmentIndex, currentSectionIndex, currentSection, allVideosReady]);

  // Fade in/out video overlay based on phase and video ready state
  useEffect(() => {
    const shouldShow = phase === 'show' && beatVideoReady;
    
    Animated.timing(videoOverlayOpacity, {
      toValue: shouldShow ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [phase, beatVideoReady]);

  // Auto-flip memory flashcards every 10 seconds
  useEffect(() => {
    if (currentSection?.section_type === 'memory' && isPlaying) {
      const flashcards = currentSection.flashcards || [];
      if (flashcards.length === 0) return;
      
      flashcardTimerRef.current = setInterval(() => {
        setAutoFlipIndex(prev => {
          const nextIndex = prev + 1;
          if (nextIndex >= flashcards.length * 2) {
            return 0;
          }
          // Toggle flip state for current card
          const cardIndex = Math.floor(nextIndex / 2);
          if (nextIndex % 2 === 1) {
            setFlashcardFlipped(cardIndex);
          } else {
            setFlashcardFlipped(null);
          }
          return nextIndex;
        });
      }, 5000); // 5 seconds per side
    }
    
    return () => {
      if (flashcardTimerRef.current) {
        clearInterval(flashcardTimerRef.current);
      }
    };
  }, [currentSection?.section_type, isPlaying]);

  // Safety timeout for avatar buffering - prevent overlay from getting stuck
  useEffect(() => {
    if (pendingAvatarStart) {
      const timeout = setTimeout(() => {
        console.log('[AILecturePlayer] Avatar buffering timeout (8s) - forcing start');
        setPendingAvatarStart(false);
        setUseTimerFallback(true);
        if (!isPlaying) setIsPlaying(true);
      }, 8000);
      return () => clearTimeout(timeout);
    }
  }, [pendingAvatarStart]);

  // Handle startFullscreen param - force fullscreen immediately when screen gains focus
  useFocusEffect(
    useCallback(() => {
      if (startFullscreen) {
        console.log('[AILecturePlayer] Starting in fullscreen mode on focus');
        // Lock orientation immediately and then signal ready
        // Add timeout to prevent getting stuck if lock fails
        const timeout = setTimeout(() => {
          console.log('[AILecturePlayer] Orientation lock timeout - proceeding anyway');
          setIsFullscreen(true);
          setOrientationReady(true);
        }, 1000);
        
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)
          .then(() => {
            clearTimeout(timeout);
            setIsFullscreen(true);
            setOrientationReady(true);
          })
          .catch((err) => {
            console.log('[AILecturePlayer] Orientation lock failed:', err);
            clearTimeout(timeout);
            setIsFullscreen(true);
            setOrientationReady(true);
          });
      }
    }, [startFullscreen])
  );

  useEffect(() => {
    if (isFullscreen) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).then(() => {
        setTimeout(() => {
          ScreenOrientation.unlockAsync();
        }, 300);
      });
    }
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, [isFullscreen]);

  const loadPresentation = async () => {
    try {
      setLoading(true);
      setError(null);

      let data: PresentationData;

      // Priority 1: Use presentationJson if directly provided (from database)
      if (presentationJson) {
        console.log('[AILecturePlayer] Using presentation JSON from database');
        data = presentationJson as PresentationData;
      }
      // Priority 2: Fetch from URL if provided
      else if (presentationUrl) {
        console.log('[AILecturePlayer] Fetching from presentation URL');
        const response = await fetch(presentationUrl);
        if (!response.ok) {
          throw new Error(`Failed to load presentation: ${response.status}`);
        }
        data = await response.json();
        
        // Derive base_url from URL for legacy fallback
        const baseUrl = presentationUrl.substring(0, presentationUrl.lastIndexOf('/') + 1);
        data.base_url = baseUrl;
      }
      // Priority 3: Fetch via jobId proxy if available
      else if (jobId) {
        console.log('[AILecturePlayer] Fetching presentation via jobId proxy:', jobId);
        const proxyUrl = getPresentationUrl(jobId);
        if (!proxyUrl) {
          throw new Error('Could not construct presentation URL from jobId');
        }
        const response = await fetch(proxyUrl);
        if (!response.ok) {
          throw new Error(`Failed to load presentation from proxy: ${response.status}`);
        }
        data = await response.json();
      }
      // No valid data source
      else {
        setError('No presentation data provided');
        setLoading(false);
        return;
      }

      // Mark that we're using jobId for media resolution
      if (jobId) {
        data.base_url = 'use_media_resolver';
      }

      setPresentationData(data);
      if (data.sections.length > 0) {
        setDuration(data.sections[0].narration.total_duration_seconds);
      }
      setLoading(false);
      
      // Start preloading all videos
      preloadAllVideos(data);
    } catch (err) {
      console.error('[AILecturePlayer] Error loading presentation:', err);
      setError(err instanceof Error ? err.message : 'Failed to load presentation');
      setLoading(false);
    }
  };

  const getPlayableAvatarUri = async (remoteUrl: string): Promise<string> => {
    console.log('[AILecturePlayer] [Avatar] Using remote URL for WebView playback:', remoteUrl);
    return remoteUrl;
  };

  const getAvatarPathForSection = (section: Section, language: string = 'english'): string | null => {
    if (language !== 'english' && section.avatar_languages) {
      const langAvatar = section.avatar_languages.find(
        al => al.language.toLowerCase() === language.toLowerCase() && al.status === 'completed'
      );
      if (langAvatar?.video_path) {
        console.log(`[AILecturePlayer] Using ${language} avatar: ${langAvatar.video_path}`);
        return langAvatar.video_path;
      }
      console.log(`[AILecturePlayer] No ${language} avatar found for section ${section.section_id}, falling back to English`);
    }
    
    if (section.avatar_video) {
      return section.avatar_video;
    }
    
    if ((section as any).avatar?.video_path) {
      return (section as any).avatar.video_path;
    }
    
    return getAvatarVideoPath(section.section_id);
  };

  const INITIAL_PRELOAD_SECTIONS = 3;

  const preloadAllVideos = async (data: PresentationData) => {
    setPreloadingVideos(true);
    await clearCorruptCache();

    const getFullUrl = (path: string, type: 'avatar' | 'video'): string | null => {
      if (path.startsWith('http')) return path;
      
      if (jobId) {
        let fullPath = path;
        if (type === 'avatar' && !path.includes('avatars/')) {
          fullPath = 'avatars/' + path;
        } else if (type === 'video' && !path.includes('videos/')) {
          fullPath = 'videos/' + path;
        }
        if (!fullPath.match(/\.(mp4|webm|mov)$/i)) {
          fullPath = fullPath + '.mp4';
        }
        return getMediaUrl(jobId, fullPath);
      }
      
      if (data.base_url && data.base_url !== 'use_media_resolver') {
        let fullPath = path;
        if (type === 'avatar' && !path.includes('avatars/')) {
          fullPath = 'avatars/' + path;
        } else if (type === 'video' && !path.includes('videos/')) {
          fullPath = 'videos/' + path;
        }
        return data.base_url + fullPath;
      }
      
      return null;
    };

    const collectSectionVideos = (section: any): { url: string; type: 'avatar' | 'video' }[] => {
      const videos: { url: string; type: 'avatar' | 'video' }[] = [];
      const seen = new Set<string>();
      const avatarPath = getAvatarPathForSection(section, playerLanguage);
      if (avatarPath) {
        const avatarUrl = getFullUrl(avatarPath, 'avatar');
        if (avatarUrl && !seen.has(avatarUrl)) {
          seen.add(avatarUrl);
          videos.push({ url: avatarUrl, type: 'avatar' });
        }
      }
      for (const segment of section.narration.segments) {
        if (segment.beat_videos && segment.beat_videos.length > 0) {
          for (const beatVideo of segment.beat_videos) {
            const videoUrl = getFullUrl(beatVideo, 'video');
            if (videoUrl && !seen.has(videoUrl)) {
              seen.add(videoUrl);
              videos.push({ url: videoUrl, type: 'video' });
            }
          }
        }
      }
      return videos;
    };

    const initialVideos: { url: string; type: 'avatar' | 'video' }[] = [];
    const backgroundVideos: { url: string; type: 'avatar' | 'video' }[] = [];
    const allSeenUrls = new Set<string>();

    for (let i = 0; i < data.sections.length; i++) {
      const sectionVideos = collectSectionVideos(data.sections[i]);
      const target = i < INITIAL_PRELOAD_SECTIONS ? initialVideos : backgroundVideos;
      for (const v of sectionVideos) {
        if (!allSeenUrls.has(v.url)) {
          allSeenUrls.add(v.url);
          target.push(v);
        }
      }
    }

    const initialAvatars = initialVideos.filter(v => v.type === 'avatar').length;
    const initialBeats = initialVideos.filter(v => v.type === 'video').length;
    console.log(`[AILecturePlayer] ===== PRELOAD START (first ${INITIAL_PRELOAD_SECTIONS} sections) =====`);
    console.log(`[AILecturePlayer] Initial: ${initialVideos.length} videos (${initialAvatars} AVATAR, ${initialBeats} BEAT), Background: ${backgroundVideos.length} videos`);
    setPreloadProgress({ loaded: 0, total: initialVideos.length });

    if (initialVideos.length === 0) {
      console.log(`[AILecturePlayer] No videos to preload, auto-starting`);
      setPreloadingVideos(false);
      setAllVideosReady(true);
      setIsPlaying(true);
      if (backgroundVideos.length > 0) {
        downloadVideoBatch(backgroundVideos, 2).then(bgResults => {
          for (const r of bgResults) {
            if (r.status !== 'failed') preloadedUrlsRef.current.add(r.url);
            else failedUrlsRef.current.add(r.url);
          }
          console.log(`[AILecturePlayer] ===== BACKGROUND PRELOAD COMPLETE: ${bgResults.filter(r => r.status !== 'failed').length}/${bgResults.length} =====`);
        }).catch(e => console.warn('[AILecturePlayer] Background preload error:', e));
      }
      return;
    }

    const results = await downloadVideoBatch(
      initialVideos,
      3,
      (completed, total) => {
        setPreloadProgress({ loaded: completed, total });
      }
    );

    const failedResults = results.filter(r => r.status === 'failed');
    const successResults = results.filter(r => r.status !== 'failed');

    for (const r of successResults) {
      preloadedUrlsRef.current.add(r.url);
    }
    for (const r of failedResults) {
      failedUrlsRef.current.add(r.url);
    }

    if (failedResults.length > 0) {
      console.log(`[AILecturePlayer] ${failedResults.length} initial videos failed, retrying once...`);
      const retryVideos = failedResults.map(r => ({ url: r.url, type: r.type }));
      const retryResults = await downloadVideoBatch(retryVideos, 2);
      for (const r of retryResults) {
        if (r.status !== 'failed') {
          preloadedUrlsRef.current.add(r.url);
          failedUrlsRef.current.delete(r.url);
        }
      }
    }

    console.log(`[AILecturePlayer] ===== INITIAL PRELOAD COMPLETE =====`);
    console.log(`[AILecturePlayer] Cached: ${preloadedUrlsRef.current.size}, Failed: ${failedUrlsRef.current.size}`);

    const firstSection = data.sections[0];
    const firstAvatarPath = firstSection ? getAvatarPathForSection(firstSection, playerLanguage) : null;
    if (firstSection && firstAvatarPath) {
      const avatarRemoteUrl = getFullUrl(firstAvatarPath, 'avatar');
      if (avatarRemoteUrl) {
        const playableUri = await getPlayableAvatarUri(avatarRemoteUrl);
        console.log('[AILecturePlayer] [Avatar] First section avatar, loading into layer A:', playableUri === avatarRemoteUrl ? 'REMOTE' : 'CACHED', 'URI:', playableUri);
        setAvatarAUrl(playableUri);
        setAvatarAReady(false);
        setActiveAvatarLayer('A');
        setPendingAvatarStart(true);
        setPreloadingVideos(false);
        setAllVideosReady(true);
        setBeatVideoReady(true);
      }
    } else {
      console.log('[AILecturePlayer] No avatar video to preload. Auto-starting playback...');
      setPreloadingVideos(false);
      setAllVideosReady(true);
      setBeatVideoReady(true);
      setIsPlaying(true);
    }

    if (backgroundVideos.length > 0) {
      console.log(`[AILecturePlayer] Starting background download of ${backgroundVideos.length} remaining videos...`);
      downloadVideoBatch(backgroundVideos, 2).then(bgResults => {
        for (const r of bgResults) {
          if (r.status !== 'failed') preloadedUrlsRef.current.add(r.url);
          else failedUrlsRef.current.add(r.url);
        }
        const bgSuccess = bgResults.filter(r => r.status !== 'failed').length;
        console.log(`[AILecturePlayer] ===== BACKGROUND PRELOAD COMPLETE: ${bgSuccess}/${bgResults.length} =====`);
      }).catch(e => console.warn('[AILecturePlayer] Background preload error:', e));
    }
  };
  
  // Pre-fetch next section's avatar into the inactive layer while current section plays
  useEffect(() => {
    if (!presentationData) return;
    
    const nextIndex = currentSectionIndex + 1;
    if (nextIndex >= presentationData.sections.length) {
      return; // No next section
    }
    
    const nextSection = presentationData.sections[nextIndex];
    const nextAvatarPath = getAvatarPathForSection(nextSection, playerLanguage);
    if (!nextAvatarPath) {
      return;
    }
    
    const currentAvatarPath = currentSection ? getAvatarPathForSection(currentSection, playerLanguage) : null;
    if (nextAvatarPath === currentAvatarPath) {
      return;
    }
    
    const remoteUrl = resolveMediaUrl(nextAvatarPath, 'avatar', true);
    if (!remoteUrl) return;
    
    // Load into the inactive layer
    const inactiveLayer = activeAvatarLayer === 'A' ? 'B' : 'A';
    const currentInactiveUrl = inactiveLayer === 'A' ? avatarAUrl : avatarBUrl;
    
    const loadAvatarIntoLayer = async () => {
      const playableUri = await getPlayableAvatarUri(remoteUrl);
      if (playableUri !== currentInactiveUrl) {
        console.log(`[AILecturePlayer] [Avatar] Pre-fetching next avatar into layer ${inactiveLayer}:`, playableUri === remoteUrl ? 'REMOTE' : 'CACHED', 'URI:', playableUri);
        if (inactiveLayer === 'A') {
          setAvatarAUrl(playableUri);
          setAvatarAReady(false);
        } else {
          setAvatarBUrl(playableUri);
          setAvatarBReady(false);
        }
      }
    };
    loadAvatarIntoLayer();
  }, [currentSectionIndex, presentationData, currentSection, activeAvatarLayer, avatarAUrl, avatarBUrl]);

  // Ensure playback starts on the active layer after layer swaps
  // This handles the case where onLoad already fired during pre-fetch
  useEffect(() => {
    if (!isPlaying) return;
    
    // Small delay to ensure React state has propagated to the WebView
    const timer = setTimeout(() => {
      const activeRef = activeAvatarLayer === 'A' ? avatarARef : avatarBRef;
      const activeReady = activeAvatarLayer === 'A' ? avatarAReady : avatarBReady;
      
      if (activeRef.current && activeReady) {
        console.log(`[AILecturePlayer] Ensuring playback on active layer ${activeAvatarLayer}`);
        activeRef.current.playAsync();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [activeAvatarLayer, isPlaying, avatarAReady, avatarBReady]);

  const resolveMediaUrl = (path: string | undefined, type: 'avatar' | 'video' | 'audio' = 'video', useRemoteUrl: boolean = false): string => {
    if (!path) return '';
    
    // If path is already a full URL, check cache first then return (unless useRemoteUrl is true)
    if (path.startsWith('http')) {
      // For WebView-based components (like ChromaKeyVideo), use remote URL directly
      // because WebViews can't access file:// URIs on iOS
      if (useRemoteUrl) return path;
      return getVideoUri(path);
    }
    
    // Priority 1: Use jobId-based media resolver (for database-sourced JSON)
    if (jobId) {
      // Construct the path with appropriate subfolder if not present
      let fullPath = path;
      const hasSubfolder = path.includes('avatars/') || path.includes('videos/') || path.includes('audio/');
      if (!hasSubfolder) {
        if (type === 'avatar') fullPath = 'avatars/' + path;
        else if (type === 'video') fullPath = 'videos/' + path;
        else if (type === 'audio') fullPath = 'audio/' + path;
      }
      
      // Add .mp4 extension if missing for video/avatar files
      if ((type === 'video' || type === 'avatar') && !fullPath.match(/\.(mp4|webm|mov)$/i)) {
        fullPath = fullPath + '.mp4';
      }
      
      const remoteUrl = getMediaUrl(jobId, fullPath);
      // For WebView-based components (like ChromaKeyVideo), use remote URL directly
      // because WebViews can't access file:// URIs on iOS
      if (useRemoteUrl) return remoteUrl;
      // Check if we have a cached version
      return getVideoUri(remoteUrl);
    }
    
    // Priority 2: Use base_url for legacy URL-fetched presentations
    if (!presentationData?.base_url || presentationData.base_url === 'use_media_resolver') {
      return '';
    }
    
    const hasSubfolder = path.includes('avatars/') || path.includes('videos/') || path.includes('audio/');
    if (hasSubfolder) {
      return presentationData.base_url + path;
    }

    if (type === 'avatar') return presentationData.base_url + 'avatars/' + path;
    if (type === 'video') return presentationData.base_url + 'videos/' + path;
    if (type === 'audio') return presentationData.base_url + 'audio/' + path;
    
    return presentationData.base_url + path;
  };

  const onTimeUpdate = useCallback((time: number) => {
    if (!currentSection) return;

    currentTimeRef.current = time;
    if (!displayTimeThrottleRef.current) {
      displayTimeThrottleRef.current = setTimeout(() => {
        setDisplayTime(currentTimeRef.current);
        displayTimeThrottleRef.current = null;
      }, 500);
    }

    const segments = currentSection.narration.segments;
    let cumulativeTime = 0;
    let activeSegmentIdx = 0;
    
    for (let i = 0; i < segments.length; i++) {
      const segStart = segments[i].start_time ?? cumulativeTime;
      const segEnd = segments[i].end_time ?? (segStart + segments[i].duration_seconds);
      
      if (time >= segStart && time < segEnd) {
        activeSegmentIdx = i;
        break;
      }
      cumulativeTime = segEnd;
    }

    if (activeSegmentIdx !== currentSegmentIndex) {
      setCurrentSegmentIndex(activeSegmentIdx);
    }

    const activeSegment = segments[activeSegmentIdx];
    const isRecapWithVideo = currentSection.section_type === 'recap' && 
      activeSegment?.beat_videos && activeSegment.beat_videos.length > 0;
    if (!isRecapWithVideo) {
      if (activeSegment?.display_directives?.visual_layer === 'show') {
        if (phase !== 'show') setPhase('show');
      } else {
        if (phase !== 'teach') setPhase('teach');
      }
    }

    // Beat reveal logic following V2.5 spec (Progressive Reveal):
    // Beats are revealed progressively and remain visible once revealed
    // Uses start_time for reveal timing, end_time is not used for hiding (progressive model)
    // Use ref to avoid stale closure issues
    const currentRevealedBeats = revealedBeatsRef.current;
    const newRevealedBeats: string[] = [...currentRevealedBeats]; // Keep previously revealed beats
    const totalBeats = currentSection.visual_beats?.length || 0;
    
    // For SUMMARY sections: map beats to segments for proper timing
    // Each learning objective should appear when its corresponding segment starts
    const isSummarySection = currentSection.section_type === 'summary';
    
    currentSection.visual_beats?.forEach((beat, beatIndex) => {
      // Use synthetic beat_id for beats without one (index-based for SUMMARY sections)
      const beatIdentifier = beat.beat_id ?? `summary_beat_${beatIndex}`;
      
      // Skip if already revealed
      if (newRevealedBeats.includes(beatIdentifier)) return;
      
      let shouldReveal = false;
      
      // For SUMMARY sections, ALWAYS use segment-based timing
      // This ensures learning objectives appear one-by-one as the avatar narrates each one
      if (isSummarySection && segments.length > 0 && totalBeats > 0) {
        // Find first non-intro segment by checking purpose
        let firstNonIntroIdx = 0;
        if (segments[0]?.purpose?.toLowerCase().includes('intro')) {
          firstNonIntroIdx = 1;
        }
        
        const usableSegments = segments.length - firstNonIntroIdx;
        
        // Case 1: Equal beats and usable segments - direct 1:1 mapping
        if (totalBeats === usableSegments) {
          const mappedSegmentIdx = firstNonIntroIdx + beatIndex;
          const segStart = getSegmentStartTime(mappedSegmentIdx);
          shouldReveal = time >= segStart;
        }
        // Case 2: More usable segments than beats - map beats to segments sequentially
        else if (usableSegments > totalBeats) {
          const mappedSegmentIdx = Math.min(firstNonIntroIdx + beatIndex, segments.length - 1);
          const segStart = getSegmentStartTime(mappedSegmentIdx);
          shouldReveal = time >= segStart;
        }
        // Case 3: More beats than usable segments - distribute within segment durations
        else if (usableSegments > 0) {
          // Calculate which segment this beat falls into and where within it
          const beatsPerSegment = Math.ceil(totalBeats / usableSegments);
          const segmentForBeat = Math.min(
            firstNonIntroIdx + Math.floor(beatIndex / beatsPerSegment),
            segments.length - 1
          );
          const beatWithinSegment = beatIndex % beatsPerSegment;
          
          // Get segment timing
          const segStart = getSegmentStartTime(segmentForBeat);
          const segDuration = segments[segmentForBeat]?.duration_seconds || 0;
          
          // Distribute beats within segment duration (use 90% to leave buffer)
          const beatRevealTime = beatsPerSegment > 1
            ? segStart + (beatWithinSegment / beatsPerSegment) * (segDuration * 0.9)
            : segStart;
          shouldReveal = time >= beatRevealTime;
        }
      }
      // Strategy 1: Explicit start_time - reveal when time reaches start_time (non-SUMMARY only)
      else if (beat.start_time !== undefined && beat.start_time > 0) {
        shouldReveal = time >= beat.start_time;
      }
      // Strategy 1b: For beats with start_time = 0, reveal immediately (non-SUMMARY only)
      else if (beat.start_time === 0) {
        shouldReveal = time >= 0;
      }
      // Strategy 2: Linked to segment_id - reveal when segment becomes active
      else if (beat.segment_id) {
        const beatSegmentIdx = segments.findIndex(s => s.segment_id === beat.segment_id);
        if (beatSegmentIdx >= 0 && activeSegmentIdx >= beatSegmentIdx) {
          const segStart = getSegmentStartTime(beatSegmentIdx);
          shouldReveal = time >= segStart;
        } else if (beatSegmentIdx === -1 && totalBeats > 0) {
          const revealWindow = duration * 0.7;
          const beatRevealTime = totalBeats > 1 
            ? (beatIndex / (totalBeats - 1)) * revealWindow 
            : 0;
          shouldReveal = time >= beatRevealTime;
          if (shouldReveal) {
            console.log('[BeatDebug] Strategy2 fallback: beat', beatIdentifier, 'idx', beatIndex, 'revealTime', beatRevealTime.toFixed(1), 'currentTime', time.toFixed(1));
          }
        }
      }
      // Strategy 3 (fallback): Distribute evenly across 70% duration
      else if (totalBeats > 0) {
        const revealWindow = duration * 0.7;
        const beatRevealTime = totalBeats > 1 
          ? (beatIndex / (totalBeats - 1)) * revealWindow 
          : 0;
        shouldReveal = time >= beatRevealTime;
      }
      
      if (shouldReveal) {
        // beatIdentifier already defined at top of forEach with synthetic id for undefined beat_ids
        newRevealedBeats.push(beatIdentifier);
      }
    });
    
    if (newRevealedBeats.length !== currentRevealedBeats.length) {
      const newlyRevealed = newRevealedBeats.filter(b => !currentRevealedBeats.includes(b));
      console.log('[BeatDebug] Revealed', newRevealedBeats.length, '/', totalBeats, 'new:', newlyRevealed.join(', '), 'time:', time.toFixed(1));
      revealedBeatsRef.current = newRevealedBeats;
      setRevealedBeats(newRevealedBeats);
    }

    // Quiz choreography: 3-step dance using explicit segment purpose
    if (currentSection.section_type === 'quiz') {
      const segment = segments[activeSegmentIdx];
      const segmentPurpose = segment?.purpose?.toLowerCase() || '';
      
      // Calculate question index based on segment structure
      // Count how many "introduce" or first segments we've passed
      let questionIdx = 0;
      for (let i = 0; i < activeSegmentIdx; i++) {
        const segPurpose = segments[i].purpose?.toLowerCase() || '';
        if (segPurpose.includes('introduce') || segPurpose.includes('question')) {
          questionIdx++;
        } else if (i % 3 === 0) {
          // Fallback: every 3rd segment starts a new question
          questionIdx = Math.floor(i / 3);
        }
      }
      // Always set quiz index
      setCurrentQuizIndex(questionIdx);
      
      // Determine phase from explicit purpose or fallback to position
      if (segmentPurpose.includes('introduce') || segmentPurpose.includes('question')) {
        setQuizPhase('introduce');
      } else if (segmentPurpose.includes('pause') || segmentPurpose.includes('think')) {
        setQuizPhase('pause');
      } else if (segmentPurpose.includes('reveal') || segmentPurpose.includes('answer')) {
        setQuizPhase('reveal');
      } else {
        // Fallback: Use position within question group (0=introduce, 1=pause, 2=reveal)
        const posInGroup = activeSegmentIdx % 3;
        if (posInGroup === 0) {
          setQuizPhase('introduce');
        } else if (posInGroup === 1) {
          setQuizPhase('pause');
        } else {
          setQuizPhase('reveal');
        }
      }
    }

    // For recap sections, force phase to show if there are beat videos
    if (currentSection.section_type === 'recap') {
      const segment = segments[activeSegmentIdx];
      if (segment?.beat_videos && segment.beat_videos.length > 0) {
        if (phase !== 'show') setPhase('show');
      }
    }
  }, [currentSection, currentSegmentIndex, phase, duration]);

  const handleAvatarPlaybackStatus = async (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error && !useTimerFallback) {
        console.log('[AILecturePlayer] Avatar load error, switching to timer fallback');
        setAvatarLoadError(true);
        setUseTimerFallback(true);
      }
      return;
    }
    
    if (savedPositionRef.current !== null) {
      console.log('[FSToggle] Ignoring playback status update during restore, saved:', savedPositionRef.current, 'reported:', status.positionMillis);
      return;
    }
    
    if (status.isBuffering && status.shouldPlay) {
      setAvatarIsBuffering(true);
    } else if (!status.isBuffering && status.isPlaying) {
      setAvatarIsBuffering(false);
    }
    
    const timeInSeconds = status.positionMillis / 1000;
    
    // Sync overlay video with avatar time during SHOW phase or recap
    const segment = currentSection?.narration.segments[currentSegmentIndex];
    const hasVideo = segment?.beat_videos && segment.beat_videos.length > 0;
    const shouldSyncOverlay = (phase === 'show' || 
      (currentSection?.section_type === 'recap' && hasVideo)) && contentVideoRef.current;
    
    if (shouldSyncOverlay && contentVideoRef.current) {
      const now = Date.now();
      const timeSinceStart = now - overlayStartTimeRef.current;
      const timeSinceLastSync = now - lastOverlaySyncRef.current;
      
      if (timeSinceStart > 2000 && timeSinceLastSync > 3000) {
        try {
          const ref = contentVideoRef.current;
          if (!ref) return;
          const segmentStartTime = getSegmentStartTime(currentSegmentIndex);
          const segmentRelativeTime = Math.max(0, timeInSeconds - segmentStartTime);
          const overlayPositionMs = segmentRelativeTime * 1000;
          
          const overlayStatus = await ref.getStatusAsync();
          if (overlayStatus.isLoaded) {
            const drift = Math.abs(overlayStatus.positionMillis - overlayPositionMs);
            if (drift > 1000) {
              await ref.setPositionAsync(overlayPositionMs);
            }
            if (status.isPlaying && !overlayStatus.isPlaying) {
              await ref.playAsync();
            } else if (!status.isPlaying && overlayStatus.isPlaying) {
              await ref.pauseAsync();
            }
          }
          lastOverlaySyncRef.current = now;
        } catch (e) {
          // Overlay ref may become null during transitions
        }
      }
    }
    
    onTimeUpdate(timeInSeconds);

    if (status.didJustFinish) {
      const posMs = status.positionMillis || 0;
      const durMs = status.durationMillis || 0;
      if (durMs > 0 && (durMs - posMs) > 1500) {
        console.log('[AILecturePlayer] Ignoring false didJustFinish, pos:', posMs, 'dur:', durMs);
        return;
      }
      handleSectionEnd();
    }
  };

  const handleAvatarError = (error: string) => {
    setAvatarLoadError(true);
    setUseTimerFallback(true);
  };

  const handleSectionEnd = () => {
    if (!presentationData) return;
    
    const now = Date.now();
    if (now - lastSectionEndRef.current < 1000) {
      console.log('[AILecturePlayer] Ignoring duplicate handleSectionEnd (debounce)');
      return;
    }
    lastSectionEndRef.current = now;
    
    if (currentSectionIndex < presentationData.sections.length - 1) {
      transitionToSection(currentSectionIndex + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const transitionToSection = async (index: number) => {
    if (isTransitioningRef.current) {
      console.log('[AILecturePlayer] Skipping transition to section', index, '(already transitioning)');
      return;
    }
    isTransitioningRef.current = true;
    console.log('[AILecturePlayer] Transitioning to section:', index, 'Type:', presentationData?.sections[index]?.section_type);
    
    try {
    const targetSection = presentationData?.sections[index];
    const targetAvatarPath = targetSection ? getAvatarPathForSection(targetSection, playerLanguage) : null;
    const currentAvatarPathCheck = currentSection ? getAvatarPathForSection(currentSection, playerLanguage) : null;
    const hasNewAvatar = targetAvatarPath && targetAvatarPath !== currentAvatarPathCheck;
    
    if (hasNewAvatar) {
      const inactiveLayer = activeAvatarLayer === 'A' ? 'B' : 'A';
      const inactiveUrl = inactiveLayer === 'A' ? avatarAUrl : avatarBUrl;
      const inactiveReady = inactiveLayer === 'A' ? avatarAReady : avatarBReady;
      const targetRemoteUrl = resolveMediaUrl(targetAvatarPath!, 'avatar', true);
      const targetAvatarUrl = await getPlayableAvatarUri(targetRemoteUrl);
      console.log('[AILecturePlayer] [Avatar] Target avatar URL:', targetAvatarUrl === targetRemoteUrl ? 'REMOTE' : 'CACHED', 'URI:', targetAvatarUrl);
      
      if (inactiveUrl === targetAvatarUrl && inactiveReady) {
        console.log(`[AILecturePlayer] Seamless transition: swapping to layer ${inactiveLayer}`);
        setActiveAvatarLayer(inactiveLayer);
        const newActiveRef = inactiveLayer === 'A' ? avatarARef : avatarBRef;
        newActiveRef.current?.setPositionAsync(0);
        newActiveRef.current?.playAsync();
        setIsPlaying(true);
      } else {
        console.log(`[AILecturePlayer] Loading new avatar into layer ${inactiveLayer}, keeping current active`);
        if (inactiveLayer === 'A') {
          setAvatarAUrl(targetAvatarUrl);
          setAvatarAReady(false);
        } else {
          setAvatarBUrl(targetAvatarUrl);
          setAvatarBReady(false);
        }
        setPendingLayerSwap(inactiveLayer);
        setPendingAvatarStart(true);
      }
    } else if (currentAvatarPathCheck) {
      // Same avatar - seek to start and ensure playback continues
      const activeRef = activeAvatarLayer === 'A' ? avatarARef : avatarBRef;
      activeRef.current?.setPositionAsync(0);
      activeRef.current?.playAsync();
      setIsPlaying(true);
    }
    
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setCurrentSectionIndex(index);
      setCurrentSegmentIndex(0);
      currentTimeRef.current = 0;
      setDisplayTime(0);
      revealedBeatsRef.current = [];
      setRevealedBeats([]);
      setPhase('teach');
      lastContentRef.current = null;
      overlayPlayingSegmentRef.current = null;
      setFlashcardFlipped(null);
      setQuizPhase('introduce');
      setCurrentQuizIndex(0);
      setAutoFlipIndex(-1);
      
      if (presentationData?.sections[index]) {
        setDuration(presentationData.sections[index].narration.total_duration_seconds);
      }
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        isTransitioningRef.current = false;
      });
    });
    } catch (e) {
      console.log('[AILecturePlayer] Transition error:', e);
      isTransitioningRef.current = false;
    }
  };

  const hideControls = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }
    Animated.timing(controlsOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowControls(false);
    });
  }, [controlsOpacity]);

  const resetControlsVisibility = useCallback((playing: boolean) => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }
    
    controlsOpacity.stopAnimation();
    setShowControls(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
    
    if (playing) {
      controlsTimeoutRef.current = setTimeout(() => {
        hideControls();
      }, 3000);
    }
  }, [controlsOpacity, hideControls]);

  const handleScreenTap = useCallback(() => {
    if (showControls && isPlaying) {
      hideControls();
    } else {
      resetControlsVisibility(isPlaying);
    }
  }, [showControls, isPlaying, hideControls, resetControlsVisibility]);

  const handleControlInteraction = useCallback(() => {
    resetControlsVisibility(isPlaying);
  }, [isPlaying, resetControlsVisibility]);

  // Handle fullscreen toggle while preserving playback position
  const handleFullscreenToggle = useCallback(() => {
    handleControlInteraction();
    console.log('[FSToggle] Toggling fullscreen, isFullscreen:', !isFullscreen, 'position:', currentTimeRef.current * 1000, 'ms');
    setIsFullscreen(!isFullscreen);
  }, [handleControlInteraction, isFullscreen]);

  // Restore position when avatar becomes ready after fullscreen toggle
  useEffect(() => {
    const isActiveLayerReady = activeAvatarLayer === 'A' ? avatarAReady : avatarBReady;
    
    const isReadyToRestore = pendingPositionRestore !== null && 
                             orientationReady && 
                             (isActiveLayerReady || useTimerFallback) &&
                             !pendingLayerSwap &&
                             !pendingAvatarStart;
    
    if (pendingPositionRestore !== null && !isReadyToRestore) {
      console.log('[FSToggle] Waiting to restore. orientationReady:', orientationReady, 
        'activeLayer:', activeAvatarLayer, 'layerReady:', isActiveLayerReady,
        'timerFallback:', useTimerFallback, 'pendingSwap:', pendingLayerSwap, 'pendingStart:', pendingAvatarStart);
    }
    
    if (isReadyToRestore) {
      const positionToRestore = pendingPositionRestore;
      const wasPlaying = savedWasPlayingRef.current;
      
      console.log('[FSToggle] Restoring position:', positionToRestore, 'ms, wasPlaying:', wasPlaying, 'activeLayer:', activeAvatarLayer);
      
      const timeInSeconds = positionToRestore / 1000;
      currentTimeRef.current = timeInSeconds;
      setDisplayTime(timeInSeconds);
      
      setPendingPositionRestore(null);
      
      (async () => {
        try {
          if (!useTimerFallback) {
            const activeRef = activeAvatarLayer === 'A' ? avatarARef : avatarBRef;
            console.log('[FSToggle] Seeking avatar to', positionToRestore, 'ms');
            await activeRef.current?.setPositionAsync(positionToRestore);
            console.log('[FSToggle] Seek complete');
          }
          
          if (contentVideoRef.current && phase === 'show') {
            try {
              await contentVideoRef.current.setPositionAsync(positionToRestore);
            } catch (e) {
              // ignore
            }
          }
          
          if (wasPlaying) {
            if (!useTimerFallback) {
              const activeRef = activeAvatarLayer === 'A' ? avatarARef : avatarBRef;
              console.log('[FSToggle] Resuming playback after seek');
              await activeRef.current?.playAsync();
            }
            setIsPlaying(true);
          }
          
          console.log('[FSToggle] Restore complete, clearing guard');
          savedPositionRef.current = null;
        } catch (e) {
          console.log('[FSToggle] Restore error:', e);
          savedPositionRef.current = null;
        }
      })();
    }
  }, [pendingPositionRestore, orientationReady, activeAvatarLayer, avatarAReady, avatarBReady, useTimerFallback, phase, pendingLayerSwap, pendingAvatarStart]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying && showControls) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        hideControls();
      }, 3000);
    } else if (!isPlaying && controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }
  }, [isPlaying, showControls, hideControls]);

  const togglePlay = async () => {
    // Get the active avatar ref
    const activeAvatarRef = activeAvatarLayer === 'A' ? avatarARef : avatarBRef;
    
    const willBePlaying = !isPlaying;
    
    if (useTimerFallback) {
      // Timer fallback mode - just toggle state
      setIsPlaying(willBePlaying);
    } else if (activeAvatarRef.current) {
      if (isPlaying) {
        await activeAvatarRef.current.pauseAsync();
        // Also pause overlay video if in SHOW phase
        if (contentVideoRef.current) {
          await contentVideoRef.current.pauseAsync();
        }
      } else {
        await activeAvatarRef.current.playAsync();
        // Also play overlay video if in SHOW phase
        if (phase === 'show' && contentVideoRef.current) {
          await contentVideoRef.current.playAsync();
        }
      }
      setIsPlaying(willBePlaying);
    } else {
      // No avatar loaded yet, enable timer fallback
      setUseTimerFallback(true);
      setIsPlaying(willBePlaying);
    }
    
    // Start auto-hide timer when starting playback with controls visible
    if (willBePlaying && showControls) {
      resetControlsVisibility(true);
    }
  };

  const seekTo = async (time: number) => {
    const activeAvatarRef = activeAvatarLayer === 'A' ? avatarARef : avatarBRef;
    if (activeAvatarRef.current) {
      await activeAvatarRef.current.setPositionAsync(time * 1000);
    }
  };

  const goToPrevSection = () => {
    if (currentSectionIndex > 0) {
      transitionToSection(currentSectionIndex - 1);
    }
  };

  const goToNextSection = () => {
    if (presentationData && currentSectionIndex < presentationData.sections.length - 1) {
      transitionToSection(currentSectionIndex + 1);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const lastContentRef = useRef<React.JSX.Element | null>(null);

  const renderContentLayer = () => {
    if (!currentSection) return null;

    if (phase === 'show') {
      return lastContentRef.current || <View />;
    }

    const sectionType = currentSection.section_type;

    let content: React.JSX.Element | null;
    switch (sectionType) {
      case 'intro':
        content = renderIntroSection();
        break;
      case 'summary':
        content = renderSummarySection();
        break;
      case 'content':
      case 'example':
        content = renderContentSection();
        break;
      case 'quiz':
        content = renderQuizSection();
        break;
      case 'memory':
        content = renderMemorySection();
        break;
      case 'recap':
        content = renderRecapSection();
        break;
      default:
        content = renderContentSection();
        break;
    }
    lastContentRef.current = content;
    return content;
  };

  const renderIntroSection = () => {
    const p = !isFullscreen;
    return (
      <View style={styles.introContainer}>
        <Text style={[styles.introTitle, p && styles.pIntroTitle]}>{currentSection?.title || 'Welcome'}</Text>
        <Text style={[styles.introSubtitle, p && styles.pIntroSubtitle]}>{presentationData?.presentation_title}</Text>
      </View>
    );
  };

  const renderSummarySection = () => {
    const beats = currentSection?.visual_beats || [];
    const p = !isFullscreen;
    const revealedBeatsData = beats.filter((beat, index) => {
      const beatIdentifier = beat.beat_id ?? `summary_beat_${index}`;
      return revealedBeats.includes(beatIdentifier);
    });
    
    return (
      <View style={styles.contentArea}>
        <Text style={[styles.sectionTitle, p && styles.pSectionTitle]}>{currentSection?.title}</Text>
        <ScrollView style={styles.bulletList}>
          {revealedBeatsData.map((beat, index) => {
            const textContent = Array.isArray(beat.display_text) 
              ? beat.display_text.join('\n')
              : beat.display_text;
            
            return (
              <Animated.View 
                key={beat.beat_id || `summary-beat-${index}`}
                style={[
                  styles.bulletItem,
                  p && styles.pBulletItem,
                  { opacity: fadeAnim }
                ]}
              >
                <Ionicons 
                  name="checkmark-circle" 
                  size={p ? 12 : 20} 
                  color={colors.success} 
                />
                <View style={{ flex: 1 }}>
                  <LatexText style={[styles.bulletText, p && styles.pBulletText]}>
                    {textContent}
                  </LatexText>
                  {beat.image_id && jobId ? (
                    <Image
                      source={{ uri: getCdnMediaUrl(jobId, `images/${beat.image_id.replace(/\.[^.]+$/, '')}.png`) }}
                      style={[styles.beatImage, p && styles.pBeatImage]}
                      resizeMode="contain"
                    />
                  ) : null}
                </View>
              </Animated.View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderContentSection = () => {
    const beats = currentSection?.visual_beats || [];
    const p = !isFullscreen;
    const revealedBeatsData = beats.filter((beat, index) => {
      const beatIdentifier = beat.beat_id ?? `summary_beat_${index}`;
      return revealedBeats.includes(beatIdentifier);
    });
    
    const latestBeat = revealedBeatsData.length > 0 ? revealedBeatsData[revealedBeatsData.length - 1] : null;
    const latestBeatOriginalIndex = latestBeat ? beats.indexOf(latestBeat) : -1;
    
    return (
      <View style={styles.contentArea}>
        <Text style={[styles.sectionTitle, p && styles.pSectionTitle]}>{currentSection?.title}</Text>
        <ScrollView style={styles.beatsContainer}>
          {latestBeat ? (
            <Animated.View 
              key={latestBeat.beat_id || `content-beat-${latestBeatOriginalIndex}`}
              style={[styles.beatBlock, p && styles.pBeatBlock, { opacity: fadeAnim }]}
            >
              {latestBeat.visual_type === 'bullet_list' ? (
                <View style={styles.bulletListBlock}>
                  {(Array.isArray(latestBeat.display_text) ? latestBeat.display_text : [latestBeat.display_text])
                    .map((item, idx) => (
                      <View key={idx} style={[styles.bulletItem, p && styles.pBulletItem]}>
                        <Text style={[styles.bulletMarker, p && styles.pBulletMarker]}>•</Text>
                        <LatexText style={[styles.bulletText, p && styles.pBulletText]}>{item}</LatexText>
                      </View>
                    ))}
                </View>
              ) : latestBeat.visual_type === 'formula' ? (
                <View style={[styles.formulaBlock, p && styles.pFormulaBlock]}>
                  <LatexText style={[styles.formulaText, p && styles.pFormulaText]}>
                    {latestBeat.latex_content || (Array.isArray(latestBeat.display_text) ? latestBeat.display_text.join('\n') : latestBeat.display_text) || ''}
                  </LatexText>
                </View>
              ) : (
                <View style={[styles.textBlock, p && styles.pTextBlock]}>
                  <LatexText style={[styles.contentText, p && styles.pContentText]}>
                    {Array.isArray(latestBeat.display_text) 
                      ? latestBeat.display_text.join('\n')
                      : (latestBeat.display_text || '')}
                  </LatexText>
                </View>
              )}
              {latestBeat.image_id && jobId ? (
                <Image
                  source={{ uri: getCdnMediaUrl(jobId, `images/${latestBeat.image_id.replace(/\.[^.]+$/, '')}.png`) }}
                  style={[styles.beatImage, p && styles.pBeatImage]}
                  resizeMode="contain"
                />
              ) : null}
            </Animated.View>
          ) : null}
        </ScrollView>
      </View>
    );
  };

  const renderQuizSection = () => {
    const beats = currentSection?.visual_beats || [];
    
    const p = !isFullscreen;
    // Quiz uses 3-step choreography: introduce (question), pause (thinking), reveal (answer)
    return (
      <View style={styles.contentArea}>
        <View style={styles.quizHeader}>
          <Text style={[styles.sectionTitle, p && styles.pSectionTitle]}>Quiz</Text>
          <View style={styles.quizPhaseIndicator}>
            <View style={[styles.quizPhaseDot, quizPhase === 'introduce' && styles.quizPhaseDotActive]} />
            <View style={[styles.quizPhaseDot, quizPhase === 'pause' && styles.quizPhaseDotActive]} />
            <View style={[styles.quizPhaseDot, quizPhase === 'reveal' && styles.quizPhaseDotActive]} />
          </View>
        </View>
        <ScrollView style={styles.quizContainer}>
          {beats
            .map((beat, index) => ({ beat, index, questionIndex: Math.floor(index / 1) }))
            .filter(({ beat, questionIndex }) => 
              revealedBeats.includes(beat.beat_id) || questionIndex === currentQuizIndex
            )
            .map(({ beat, index, questionIndex }) => {
            const isCurrentQuestion = questionIndex === currentQuizIndex;
            const displayContent = Array.isArray(beat.display_text) ? beat.display_text : [beat.display_text];

            return (
              <View 
                key={beat.beat_id || `quiz-${index}`} 
                style={[
                  styles.quizCard,
                  isCurrentQuestion && styles.quizCardActive,
                  quizPhase === 'reveal' && isCurrentQuestion && styles.quizCardRevealed
                ]}
              >
                <Text style={styles.quizQuestion}>{displayContent[0]}</Text>
                
                {/* Options A/B/C/D */}
                {displayContent.length > 1 && (
                  <View style={styles.quizOptions}>
                    {displayContent.slice(1).map((option, optIdx) => (
                      <View key={optIdx} style={[
                        styles.quizOption,
                        quizPhase === 'reveal' && optIdx === 0 && styles.quizOptionCorrect
                      ]}>
                        <Text style={styles.quizOptionLabel}>
                          {String.fromCharCode(65 + optIdx)}
                        </Text>
                        <Text style={styles.quizOptionText}>{option}</Text>
                      </View>
                    ))}
                  </View>
                )}
                
                {/* Pause phase - thinking time indicator */}
                {quizPhase === 'pause' && isCurrentQuestion && (
                  <View style={styles.thinkingIndicator}>
                    <Ionicons name="hourglass-outline" size={24} color={colors.warning} />
                    <Text style={styles.thinkingText}>Think about it...</Text>
                  </View>
                )}
                
                {/* Reveal phase - show answer */}
                {quizPhase === 'reveal' && isCurrentQuestion && (
                  <View style={styles.answerReveal}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                    <Text style={styles.answerText}>Correct!</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderMemorySection = () => {
    const flashcards = currentSection?.flashcards || [];
    
    return (
      <View style={styles.contentArea}>
        <Text style={[styles.sectionTitle, !isFullscreen && styles.pSectionTitle]}>Memory Cards</Text>
        <ScrollView 
          horizontal 
          style={styles.flashcardsContainer}
          showsHorizontalScrollIndicator={false}
        >
          {flashcards.map((card, index) => (
            <TouchableOpacity 
              key={card.id || index}
              style={[styles.flashcard, flashcardFlipped === index && styles.flashcardFlipped]}
              onPress={() => setFlashcardFlipped(flashcardFlipped === index ? null : index)}
            >
              <Text style={styles.flashcardText}>
                {flashcardFlipped === index ? card.back : card.front}
              </Text>
              <Text style={styles.flashcardHint}>
                {flashcardFlipped === index ? 'Answer' : 'Tap to flip'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderRecapSection = () => {
    // Recap section shows full-screen video segments (cinematic closure)
    const segment = currentSection?.narration.segments[currentSegmentIndex];
    const hasVideo = segment?.beat_videos && segment.beat_videos.length > 0;
    
    if (hasVideo) {
      // Full-screen video mode for recap
      return null; // Let video overlay handle it
    }
    
    // Fallback if no video - show summary with trophy
    return (
      <View style={styles.contentArea}>
        <Text style={[styles.sectionTitle, !isFullscreen && styles.pSectionTitle]}>{currentSection?.title || 'Recap'}</Text>
        <View style={styles.recapContent}>
          <Ionicons name="trophy" size={60} color={colors.warning} />
          <Text style={styles.recapText}>Great job completing this lesson!</Text>
          {(currentSection?.visual_beats || [])
            .filter(beat => revealedBeats.includes(beat.beat_id))
            .map((beat, index) => (
              <View key={beat.beat_id || `recap-beat-${index}`} style={styles.recapItem}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={styles.recapItemText}>
                  {Array.isArray(beat.display_text) ? beat.display_text[0] : beat.display_text}
                </Text>
              </View>
            ))}
        </View>
      </View>
    );
  };

  // Dual avatar layer rendering - both A and B layers are always mounted
  // Active layer is visible and playing, inactive layer is hidden and pre-buffering
  const renderDualAvatarLayers = () => {
    // Always render the avatar container structure to prevent layout shifts
    // Use different avatar layer styles for portrait vs fullscreen
    const avatarLayerStyle = isFullscreen ? styles.avatarLayer : styles.portraitAvatarLayer;
    
    const currentSectionAvatarPath = currentSection ? getAvatarPathForSection(currentSection, playerLanguage) : null;
    if (!currentSectionAvatarPath) {
      if (!useTimerFallback) setUseTimerFallback(true);
      return <View style={avatarLayerStyle} />;
    }

    const isHidden = currentSection.avatar_layer === 'hide';
    const isAActive = activeAvatarLayer === 'A';
    
    return (
      <>
        {/* Avatar Layer A */}
        {avatarAUrl && (
          <View style={[
            avatarLayerStyle, 
            (isHidden || !isAActive) && styles.avatarHidden
          ]}>
            <ChromaKeyVideo
              ref={avatarARef}
              source={{ uri: avatarAUrl }}
              style={styles.avatarVideo}
              shouldPlay={isPlaying && isAActive}
              isLooping={false}
              onPlaybackStatusUpdate={isAActive ? handleAvatarPlaybackStatus : undefined}
              isMuted={!isAActive}
              greenThreshold={0.95}
              greenMultiplier={1.3}
              onError={() => {
                console.log('[AILecturePlayer] Avatar A load error');
                setAvatarLoadError(true);
                setUseTimerFallback(true);
                setAvatarAReady(true);
                if (pendingLayerSwap === 'A') {
                  setPendingLayerSwap(null);
                  setPendingAvatarStart(false);
                }
                if (!isPlaying && savedPositionRef.current === null) setIsPlaying(true);
              }}
              onLoad={() => {
                console.log('[AILecturePlayer] Avatar A loaded, pendingRestore:', savedPositionRef.current);
                setAvatarAReady(true);
                if (savedPositionRef.current !== null) {
                  console.log('[AILecturePlayer] Avatar A skipping auto-start (position restore pending)');
                  return;
                }
                if (pendingLayerSwap === 'A') {
                  console.log('[AILecturePlayer] Pending layer A ready, executing swap');
                  setActiveAvatarLayer('A');
                  setPendingLayerSwap(null);
                  setPendingAvatarStart(false);
                  avatarARef.current?.setPositionAsync(0);
                  avatarARef.current?.playAsync();
                  setIsPlaying(true);
                } else if (isAActive && pendingAvatarStart) {
                  console.log('[AILecturePlayer] Active layer A ready, auto-starting playback');
                  setPendingAvatarStart(false);
                  setIsPlaying(true);
                  avatarARef.current?.playAsync();
                }
              }}
            />
          </View>
        )}
        
        {/* Avatar Layer B */}
        {avatarBUrl && (
          <View style={[
            avatarLayerStyle, 
            (isHidden || isAActive) && styles.avatarHidden
          ]}>
            <ChromaKeyVideo
              ref={avatarBRef}
              source={{ uri: avatarBUrl }}
              style={styles.avatarVideo}
              shouldPlay={isPlaying && !isAActive}
              isLooping={false}
              onPlaybackStatusUpdate={!isAActive ? handleAvatarPlaybackStatus : undefined}
              isMuted={isAActive}
              greenThreshold={0.95}
              greenMultiplier={1.3}
              onError={() => {
                console.log('[AILecturePlayer] Avatar B load error');
                setAvatarLoadError(true);
                setUseTimerFallback(true);
                setAvatarBReady(true);
                if (pendingLayerSwap === 'B') {
                  setPendingLayerSwap(null);
                  setPendingAvatarStart(false);
                }
                if (!isPlaying && savedPositionRef.current === null) setIsPlaying(true);
              }}
              onLoad={() => {
                console.log('[AILecturePlayer] Avatar B loaded, pendingRestore:', savedPositionRef.current);
                setAvatarBReady(true);
                if (savedPositionRef.current !== null) {
                  console.log('[AILecturePlayer] Avatar B skipping auto-start (position restore pending)');
                  return;
                }
                if (pendingLayerSwap === 'B') {
                  console.log('[AILecturePlayer] Pending layer B ready, executing swap');
                  setActiveAvatarLayer('B');
                  setPendingLayerSwap(null);
                  setPendingAvatarStart(false);
                  avatarBRef.current?.setPositionAsync(0);
                  avatarBRef.current?.playAsync();
                  setIsPlaying(true);
                } else if (!isAActive && pendingAvatarStart) {
                  console.log('[AILecturePlayer] Active layer B ready, auto-starting playback');
                  setPendingAvatarStart(false);
                  setIsPlaying(true);
                  avatarBRef.current?.playAsync();
                }
              }}
            />
          </View>
        )}
      </>
    );
  };

  // Legacy function kept for compatibility - now uses dual layer system
  const renderAvatarLayer = () => {
    return renderDualAvatarLayers();
  };

  const renderVideoOverlay = () => {
    const segment = currentSection?.narration.segments[currentSegmentIndex];
    const beatVideos = segment?.beat_videos;
    const isRecapWithVideo = currentSection?.section_type === 'recap' && beatVideos && beatVideos.length > 0;
    
    const vimeoUrl = currentSection?.vimeo_url;
    const isPlayableVimeoUrl = vimeoUrl && (
      vimeoUrl.includes('player.vimeo.com') || 
      vimeoUrl.includes('.m3u8') ||
      vimeoUrl.endsWith('.mp4')
    );
    
    const hasBeatVideos = beatVideos && beatVideos.length > 0;
    
    let videoUrl = '';
    if (hasBeatVideos && currentBeatVideoUrl) {
      videoUrl = currentBeatVideoUrl;
    } else if (hasBeatVideos) {
      videoUrl = resolveMediaUrl(beatVideos[0], 'video');
    } else if (isPlayableVimeoUrl && vimeoUrl) {
      videoUrl = vimeoUrl;
    }
    
    if (!videoUrl) {
      return null;
    }
    
    if (videoUrl !== stableVideoUriRef.current) {
      stableVideoUriRef.current = videoUrl;
      stableVideoSourceRef.current = { uri: videoUrl };
    }
    const stableSource = stableVideoSourceRef.current!;
    
    // Should the overlay be visible?
    const shouldShowOverlay = phase === 'show' || isRecapWithVideo || 
      (currentSection?.section_type === 'recap' && isPlayableVimeoUrl);
    
    // Show loading indicator when in SHOW phase but video not ready
    const showLoading = shouldShowOverlay && !beatVideoReady && beatVideoLoading;

    return (
      <>
        {/* Single Video component - always rendered for prebuffering, visibility controlled by Animated.View */}
        <Animated.View 
          style={[
            styles.videoOverlay,
            { opacity: videoOverlayOpacity }
          ]}
          pointerEvents={shouldShowOverlay && beatVideoReady ? 'auto' : 'none'}
        >
          <Video
            ref={contentVideoRef}
            source={stableSource}
            style={styles.overlayVideo}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={Boolean(shouldShowOverlay && beatVideoReady && isPlaying)}
            isLooping={false}
            isMuted={true}
            progressUpdateIntervalMillis={0}
            onError={(error) => {
              console.log('[AILecturePlayer] VideoOverlay error:', error);
              setBeatVideoLoading(false);
            }}
            onLoadStart={() => {
              setBeatVideoLoading(true);
            }}
            onLoad={() => {
              console.log('[AILecturePlayer] VideoOverlay loaded successfully');
            }}
            onReadyForDisplay={async () => {
              console.log('[AILecturePlayer] VideoOverlay ready for display');
              setBeatVideoReady(true);
              setBeatVideoLoading(false);
              
              if (phase === 'show' && isPlaying && contentVideoRef.current) {
                try {
                  await contentVideoRef.current.playAsync();
                  overlayStartTimeRef.current = Date.now();
                } catch (e) {
                  console.log('[AILecturePlayer] Auto-start error:', e);
                }
              }
            }}
          />
        </Animated.View>
        
        {/* Loading indicator when video is buffering */}
        {showLoading && (
          <View style={styles.videoLoadingOverlay}>
            <ActivityIndicator size="large" color={colors.white} />
            <Text style={styles.videoLoadingText}>Loading animation...</Text>
          </View>
        )}
        
        {/* Hidden pre-buffer for next segment's video - only when overlay is not actively playing */}
        {!shouldShowOverlay && preBufferedVideoUrl && preBufferedVideoUrl !== videoUrl && (
          <View style={styles.hiddenPreBuffer}>
            <Video
              ref={preBufferVideoRef}
              source={{ uri: preBufferedVideoUrl }}
              style={{ width: 1, height: 1 }}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={false}
              isMuted={true}
              onLoad={() => {
                console.log('[AILecturePlayer] Pre-buffered next video:', preBufferedVideoUrl.substring(0, 50));
              }}
            />
          </View>
        )}
      </>
    );
  };

  const renderControls = () => {
    return (
      <Pressable 
        style={styles.controlsBar} 
        onTouchStart={handleControlInteraction}
      >
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={() => {
            handleControlInteraction();
            goToPrevSection();
          }}
          disabled={currentSectionIndex === 0}
        >
          <Ionicons 
            name="play-skip-back" 
            size={24} 
            color={currentSectionIndex === 0 ? colors.gray600 : colors.white} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.playButton} 
          onPress={() => {
            handleControlInteraction();
            togglePlay();
          }}
        >
          <Ionicons 
            name={isPlaying ? 'pause' : 'play'} 
            size={32} 
            color={colors.white} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={() => {
            handleControlInteraction();
            goToNextSection();
          }}
          disabled={!presentationData || currentSectionIndex === presentationData.sections.length - 1}
        >
          <Ionicons 
            name="play-skip-forward" 
            size={24} 
            color={!presentationData || currentSectionIndex === presentationData.sections.length - 1 
              ? colors.gray600 
              : colors.white} 
          />
        </TouchableOpacity>

        <View style={styles.timelineContainer}>
          <View style={styles.timelineTrack}>
            <View 
              style={[
                styles.timelineFill, 
                { width: `${duration > 0 ? (displayTime / duration) * 100 : 0}%` }
              ]} 
            />
          </View>
          <Text style={styles.timeDisplay}>
            {formatTime(displayTime)} / {formatTime(duration)}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={() => {
            handleControlInteraction();
            setShowSectionPicker(true);
          }}
        >
          <Ionicons name="list" size={24} color={colors.white} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={handleFullscreenToggle}
        >
          <Ionicons 
            name={isFullscreen ? 'contract' : 'expand'} 
            size={24} 
            color={colors.white} 
          />
        </TouchableOpacity>
      </Pressable>
    );
  };

  const renderPortraitControls = () => {
    const totalSections = presentationData?.sections.length || 0;
    return (
      <View style={styles.portraitControlsContainer} onTouchStart={handleControlInteraction}>
        <View style={styles.portraitSingleRow}>
          <Text style={styles.portraitTimeTextInline}>{formatTime(displayTime)}</Text>
          <View style={styles.portraitTimelineTrack}>
            <View 
              style={[
                styles.portraitTimelineFill, 
                { width: `${duration > 0 ? (displayTime / duration) * 100 : 0}%` }
              ]} 
            />
          </View>
          <Text style={styles.portraitTimeTextInline}>{formatTime(duration)}</Text>
          <TouchableOpacity 
            style={styles.portraitControlBtnInline} 
            onPress={() => { handleControlInteraction(); goToPrevSection(); }}
            disabled={currentSectionIndex === 0}
          >
            <Ionicons name="play-skip-back" size={16} color={currentSectionIndex === 0 ? colors.gray600 : colors.white} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.portraitPlayBtnInline} 
            onPress={() => { handleControlInteraction(); togglePlay(); }}
          >
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={18} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.portraitControlBtnInline} 
            onPress={() => { handleControlInteraction(); goToNextSection(); }}
            disabled={!presentationData || currentSectionIndex === totalSections - 1}
          >
            <Ionicons name="play-skip-forward" size={16} color={!presentationData || currentSectionIndex === totalSections - 1 ? colors.gray600 : colors.white} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.portraitSectionCounterInline}
            onPress={() => { handleControlInteraction(); setShowSectionPicker(true); }}
          >
            <Text style={styles.portraitSectionCounterTextInline}>{currentSectionIndex + 1}/{totalSections}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.portraitControlBtnInline} onPress={handleFullscreenToggle}>
            <Ionicons name="expand" size={16} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSectionPickerModal = () => {
    return (
      <Modal
        visible={showSectionPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSectionPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sectionPickerContainer}>
            <View style={styles.sectionPickerHeader}>
              <Text style={styles.sectionPickerTitle}>Sections</Text>
              <TouchableOpacity onPress={() => setShowSectionPicker(false)}>
                <Ionicons name="close" size={24} color={colors.white} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.sectionList} nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
              {presentationData?.sections.map((section, index) => (
                <TouchableOpacity
                  key={section.section_id}
                  style={[
                    styles.sectionItem,
                    index === currentSectionIndex && styles.sectionItemActive
                  ]}
                  onPress={() => {
                    transitionToSection(index);
                    setShowSectionPicker(false);
                  }}
                >
                  <View style={styles.sectionItemIcon}>
                    <Ionicons 
                      name={getSectionIcon(section.section_type)} 
                      size={20} 
                      color={index === currentSectionIndex ? colors.primary : colors.gray400} 
                    />
                  </View>
                  <View style={styles.sectionItemContent}>
                    <Text style={[
                      styles.sectionItemTitle,
                      index === currentSectionIndex && styles.sectionItemTitleActive
                    ]}>
                      {section.title}
                    </Text>
                    <Text style={styles.sectionItemType}>
                      {section.section_type.charAt(0).toUpperCase() + section.section_type.slice(1)}
                    </Text>
                  </View>
                  <Text style={styles.sectionItemDuration}>
                    {formatTime(section.narration.total_duration_seconds)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const getSectionIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'intro': return 'hand-left';
      case 'summary': return 'list';
      case 'content': return 'document-text';
      case 'example': return 'bulb';
      case 'quiz': return 'help-circle';
      case 'memory': return 'albums';
      case 'recap': return 'trophy';
      default: return 'ellipse';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading lesson...</Text>
      </View>
    );
  }

  // Show preloading screen while downloading all videos
  if (preloadingVideos) {
    const progressPercent = preloadProgress.total > 0 
      ? Math.round((preloadProgress.loaded / preloadProgress.total) * 100) 
      : 0;
    
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Preparing your lesson...</Text>
        <Text style={styles.preloadProgressText}>
          Loading videos: {preloadProgress.loaded} / {preloadProgress.total}
        </Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
        </View>
        <Text style={styles.preloadHintText}>
          This ensures smooth playback without interruptions
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={60} color={colors.gray400} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadPresentation}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show fullscreen placeholder while waiting for orientation to lock
  if (!orientationReady) {
    return (
      <View style={styles.orientationPlaceholder}>
        <StatusBar hidden />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Handle cancel button - stop video and go back
  const handleCancel = () => {
    // Stop playback
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Navigate back
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, isFullscreen ? styles.fullscreenContainer : { backgroundColor: '#ffffff' }]} edges={['bottom']}>
      <StatusBar hidden={isFullscreen} />
      
      {!isFullscreen && (
        <View style={[styles.portraitHeader, { paddingTop: insets.top }]}>
          <Text style={styles.portraitHeaderTitle} numberOfLines={1}>
            {currentSection?.title || presentationData?.presentation_title || ''}
          </Text>
          <View style={styles.portraitHeaderBadge}>
            <Text style={styles.portraitHeaderBadgeText}>
              {currentSection?.section_type || 'intro'}
            </Text>
          </View>
          <TouchableOpacity style={styles.portraitHeaderClose} onPress={handleCancel} data-testid="button-cancel-lecture">
            <Ionicons name="close" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      )}

      <Pressable style={isFullscreen ? styles.stage : styles.portraitUnifiedStage} onPress={handleScreenTap}>
        <View style={[styles.backgroundLayer, { backgroundColor: '#000' }]} />

        <Animated.View style={[
          isFullscreen ? styles.contentLayer : styles.portraitStageContentLayer,
          phase === 'show' && styles.contentLayerHidden,
          { opacity: fadeAnim }
        ]}>
          <ScrollView
            style={isFullscreen ? styles.landscapeContentScroll : { flex: 1 }}
            contentContainerStyle={isFullscreen ? styles.landscapeContentScrollContainer : undefined}
            showsVerticalScrollIndicator={isFullscreen}
            nestedScrollEnabled={true}
          >
            {renderContentLayer()}
          </ScrollView>
        </Animated.View>

        {renderAvatarLayer()}
        {renderVideoOverlay()}

        {avatarIsBuffering && isPlaying && !pendingAvatarStart && !preloadingVideos && (
          <View style={styles.midPlaybackBuffering} pointerEvents="none">
            <View style={styles.midPlaybackBufferingCircle}>
              <ActivityIndicator size="large" color={colors.white} />
            </View>
          </View>
        )}
      </Pressable>

      {!isFullscreen && renderPortraitControls()}

      {!isFullscreen && (
        <ScrollView style={styles.quickActionsScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.quickActionsTopicRow}>
            <TouchableOpacity onPress={handleCancel} style={{ padding: 4 }}>
              <Ionicons name="arrow-back" size={20} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.quickActionsTopicTitle} numberOfLines={1}>
              {topicTitle || presentationData?.presentation_title || ''}
            </Text>
          </View>
          <Text style={styles.quickActionsHeading}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {[
              { key: 'ai', icon: 'sparkles', label: 'Ask AI', desc: 'Have a doubt? Get help' },
              { key: 'questions', icon: 'help-circle-outline', label: 'Questions', desc: 'Browse Q&A' },
              { key: 'assignments', icon: 'clipboard-outline', label: 'Assignments', desc: 'View your tasks' },
              { key: 'dpp', icon: 'disc-outline', label: 'DPP', desc: 'Daily Practice Problems' },
              { key: 'doubts', icon: 'chatbubble-ellipses-outline', label: 'Doubts', desc: 'Ask lecture doubts' },
              { key: 'pyqs', icon: 'document-text-outline', label: "PYQ's", desc: 'Previous year questions' },
              { key: 'results', icon: 'bar-chart-outline', label: 'Results', desc: 'View your scores' },
            ].map((item) => {
              const isActive = activeQuickAction === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.quickActionButton, isActive && styles.quickActionButtonActive]}
                  onPress={() => {
                    setActiveQuickAction(item.key);
                    const state = navigation.getState();
                    const currentIndex = state?.index ?? 0;
                    if (currentIndex > 0) {
                      const prevRoute = state.routes[currentIndex - 1];
                      if (prevRoute?.name === 'TopicDetails') {
                        navigation.dispatch({
                          ...CommonActions.setParams({ ...(prevRoute.params as any), openTab: item.key }),
                          source: prevRoute.key,
                        });
                      }
                    }
                    navigation.goBack();
                  }}
                  data-testid={`button-quick-action-${item.key}`}
                >
                  <View style={[styles.quickActionIcon, isActive && styles.quickActionIconActive]}>
                    <Ionicons name={item.icon as any} size={18} color={isActive ? '#fff' : '#6b7280'} />
                  </View>
                  <Text style={styles.quickActionLabel}>{item.label}</Text>
                  <Text style={styles.quickActionDesc}>{item.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}

      {isFullscreen && (
        <Animated.View style={[styles.controlsWrapper, { opacity: controlsOpacity }]} pointerEvents={showControls ? 'auto' : 'none'}>
          {renderControls()}
        </Animated.View>
      )}
      {renderSectionPickerModal()}

      {/* Avatar buffering overlay - shown when active avatar is not ready */}
      {!loading && !preloadingVideos && pendingAvatarStart && (
        <View style={styles.avatarBufferingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.avatarBufferingText}>Loading avatar...</Text>
          <Text style={styles.avatarBufferingHint}>Preparing your AI instructor</Text>
        </View>
      )}
      
      {isFullscreen && (
        <TouchableOpacity 
          style={styles.exitFullscreenButton}
          onPress={handleFullscreenToggle}
        >
          <Ionicons name="close" size={28} color={colors.white} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fullscreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  orientationPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    marginTop: 16,
    color: colors.gray300,
    fontSize: 16,
  },
  preloadProgressText: {
    marginTop: 12,
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  progressBarContainer: {
    width: '60%',
    height: 6,
    backgroundColor: colors.gray700,
    borderRadius: 3,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  preloadHintText: {
    marginTop: 16,
    color: colors.gray400,
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  hiddenPreloadContainer: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
  },
  hiddenPreloadVideo: {
    width: 1,
    height: 1,
  },
  midPlaybackBuffering: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  midPlaybackBufferingCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBufferingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  avatarBufferingText: {
    marginTop: 12,
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  avatarBufferingHint: {
    marginTop: 8,
    color: colors.gray400,
    fontSize: 13,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  errorText: {
    color: colors.gray300,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backButtonText: {
    color: colors.gray400,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    backgroundColor: colors.backgroundDark,
  },
  headerBackButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  headerSpacer: {
    width: 32,
  },
  stage: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  portraitOuterContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  portraitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 6,
    backgroundColor: 'rgba(15, 15, 26, 0.98)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(99, 102, 241, 0.2)',
  },
  portraitHeaderTitle: {
    flex: 1,
    color: '#e5e7eb',
    fontSize: 13,
    fontWeight: '500',
  },
  portraitHeaderBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  portraitHeaderBadgeText: {
    color: '#86EFAC',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  portraitHeaderClose: {
    padding: 6,
    marginLeft: 8,
  },
  portraitUnifiedStage: {
    aspectRatio: 16 / 9,
    width: '100%',
    position: 'relative',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  portraitStageContentLayer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '65%',
    height: '100%',
    zIndex: 10,
    padding: 6,
  },
  portraitAvatarLayer: {
    position: 'absolute',
    right: -80,
    bottom: 0,
    width: '55%',
    height: '95%',
    zIndex: 25,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    overflow: 'hidden',
  },
  portraitControlsContainer: {
    backgroundColor: 'rgba(15, 15, 26, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  portraitSingleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  portraitTimeTextInline: {
    color: '#94a3b8',
    fontSize: 9,
    fontVariant: ['tabular-nums'],
    minWidth: 24,
    textAlign: 'center',
  },
  portraitTimelineTrack: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  portraitTimelineFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  portraitControlBtnInline: {
    padding: 4,
  },
  portraitPlayBtnInline: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  portraitSectionCounterInline: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  portraitSectionCounterTextInline: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  quickActionsScroll: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  quickActionsTopicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    gap: 10,
  },
  quickActionsTopicTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  quickActionsHeading: {
    fontSize: 14,
    color: '#6b7280',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 10,
    paddingBottom: 20,
  },
  quickActionButton: {
    width: '47%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    padding: 14,
  },
  quickActionButtonActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(43, 189, 110, 0.08)',
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionIconActive: {
    backgroundColor: colors.primary,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },
  quickActionDesc: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  pSectionTitle: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 3,
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  pContentText: {
    fontSize: 10,
    lineHeight: 14,
  },
  pBulletText: {
    fontSize: 10,
    lineHeight: 14,
  },
  pBulletItem: {
    marginBottom: 3,
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  pBulletMarker: {
    fontSize: 10,
    marginRight: 4,
  },
  pBeatBlock: {
    padding: 5,
    marginBottom: 3,
  },
  pBeatImage: {
    height: 70,
    marginTop: 4,
  },
  pIntroTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  pIntroSubtitle: {
    fontSize: 11,
  },
  pFormulaText: {
    fontSize: 12,
  },
  pFormulaBlock: {
    padding: 8,
  },
  pTextBlock: {
    padding: 3,
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  contentLayer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '70%',
    height: '100%',
    zIndex: 5,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    margin: 10,
  },
  landscapeContentScroll: {
    flex: 1,
  },
  landscapeContentScrollContainer: {
    flexGrow: 1,
  },
  contentLayerHidden: {
    opacity: 0,
    pointerEvents: 'none' as const,
  },
  avatarLayer: {
    position: 'absolute',
    right: -140,
    bottom: 0,
    width: '65%',
    height: '80%',
    zIndex: 25,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    overflow: 'hidden',
  },
  avatarHidden: {
    opacity: 0,
    pointerEvents: 'none' as const,
  },
  avatarVideo: {
    width: '110%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hiddenOverlay: {
    opacity: 0,
  },
  hiddenPreBuffer: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    overflow: 'hidden',
  },
  videoLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 21,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoLoadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 12,
    opacity: 0.8,
  },
  overlayVideo: {
    width: '100%',
    height: '100%',
  },
  contentArea: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray200,
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    backgroundColor: 'rgba(43, 189, 110, 0.15)',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  introContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  introTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 12,
  },
  introSubtitle: {
    fontSize: 18,
    color: colors.gray300,
    textAlign: 'center',
  },
  bulletList: {
    flex: 1,
  },
  bulletListBlock: {
    marginBottom: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  bulletMarker: {
    color: colors.info,
    fontSize: 16,
    marginRight: 10,
  },
  bulletText: {
    flex: 1,
    color: colors.gray200,
    fontSize: 15,
    lineHeight: 22,
  },
  bulletTextHidden: {
    color: colors.gray600,
  },
  beatsContainer: {
    flex: 1,
  },
  beatBlock: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  textBlock: {
    padding: 8,
  },
  contentText: {
    color: colors.gray200,
    fontSize: 15,
    lineHeight: 24,
  },
  formulaBlock: {
    padding: 20,
    backgroundColor: 'rgba(43, 189, 110, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
  },
  formulaText: {
    color: colors.white,
    fontSize: 18,
    fontFamily: 'monospace',
  },
  beatImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  quizContainer: {
    flex: 1,
  },
  quizHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quizPhaseIndicator: {
    flexDirection: 'row',
    gap: 6,
  },
  quizPhaseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  quizPhaseDotActive: {
    backgroundColor: colors.primary,
  },
  quizCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quizCardActive: {
    borderColor: 'rgba(59, 130, 246, 0.5)',
    shadowColor: colors.info,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  quizCardRevealed: {
    borderColor: colors.success,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  quizQuestion: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    marginBottom: 16,
  },
  quizOptions: {
    gap: 10,
  },
  quizOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quizOptionCorrect: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: colors.success,
  },
  quizOptionLabel: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 28,
    marginRight: 12,
  },
  quizOptionText: {
    flex: 1,
    color: colors.gray200,
    fontSize: 14,
    lineHeight: 20,
  },
  thinkingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
  },
  thinkingText: {
    color: colors.warning,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  answerReveal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 8,
  },
  answerText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  flashcardsContainer: {
    paddingVertical: 20,
  },
  flashcard: {
    width: 200,
    height: 150,
    backgroundColor: colors.primary,
    borderRadius: 16,
    marginRight: 16,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashcardFlipped: {
    backgroundColor: colors.success,
  },
  flashcardText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  flashcardHint: {
    position: 'absolute',
    bottom: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  recapContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recapText: {
    color: colors.gray200,
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  recapItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 8,
    width: '100%',
    maxWidth: 350,
  },
  recapItemText: {
    color: colors.gray200,
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  controlsWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    gap: 8,
  },
  controlButton: {
    padding: 8,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  timelineTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  timelineFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  timeDisplay: {
    color: colors.gray300,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  exitFullscreenButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  sectionPickerContainer: {
    backgroundColor: colors.backgroundDark,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  sectionPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionPickerTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  sectionList: {
    padding: 16,
    paddingBottom: 30,
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 8,
  },
  sectionItemActive: {
    backgroundColor: 'rgba(43, 189, 110, 0.2)',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  sectionItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionItemContent: {
    flex: 1,
  },
  sectionItemTitle: {
    color: colors.gray200,
    fontSize: 15,
    fontWeight: '500',
  },
  sectionItemTitleActive: {
    color: colors.white,
  },
  sectionItemType: {
    color: colors.gray400,
    fontSize: 12,
    marginTop: 2,
  },
  sectionItemDuration: {
    color: colors.gray400,
    fontSize: 13,
  },
});
