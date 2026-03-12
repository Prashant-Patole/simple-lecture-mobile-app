import { useState, useCallback, memo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, fontSize } from '../constants/theme';

interface MathTextProps {
  content: string;
  style?: object;
  textStyle?: object;
  color?: string;
}

const containsLatex = (text: string): boolean => {
  const latexPatterns = [
    /\$\$.+?\$\$/s,
    /\$.+?\$/,
    /\\\(.+?\\\)/s,
    /\\\[.+?\\\]/s,
    /\\frac/,
    /\\sqrt/,
    /\\sum/,
    /\\int/,
    /\\alpha|\\beta|\\gamma|\\delta|\\theta|\\lambda|\\mu|\\sigma|\\omega/,
    /\\times|\\div|\\pm|\\cdot/,
    /\^{.+?}|_{.+?}/,
    /\\text{/,
    /\\mathbf|\\mathrm|\\mathit/,
    /\\left|\\right/,
    /\\begin|\\end/,
  ];
  return latexPatterns.some(pattern => pattern.test(text));
};

const MathText = memo(({ content, style, textStyle, color = colors.gray900 }: MathTextProps) => {
  const { width } = useWindowDimensions();
  const [webViewHeight, setWebViewHeight] = useState(50);

  const hasLatex = containsLatex(content);

  const onMessage = useCallback((event: any) => {
    const height = parseInt(event.nativeEvent.data, 10);
    if (height && height > 0) {
      setWebViewHeight(height + 10);
    }
  }, []);

  if (!hasLatex) {
    return (
      <View style={style}>
        <Text style={[styles.plainText, { color }, textStyle]}>
          {content}
        </Text>
      </View>
    );
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
      <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        html, body {
          background-color: transparent;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 16px;
          line-height: 1.5;
          color: ${color};
          padding: 4px;
          word-wrap: break-word;
        }
        .katex {
          font-size: 1.1em;
        }
        .katex-display {
          margin: 8px 0;
          overflow-x: auto;
          overflow-y: hidden;
        }
        p {
          margin-bottom: 8px;
        }
      </style>
    </head>
    <body>
      <div id="content">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</div>
      <script>
        document.addEventListener("DOMContentLoaded", function() {
          renderMathInElement(document.getElementById("content"), {
            delimiters: [
              {left: "$$", right: "$$", display: true},
              {left: "$", right: "$", display: false},
              {left: "\\\\[", right: "\\\\]", display: true},
              {left: "\\\\(", right: "\\\\)", display: false}
            ],
            throwOnError: false,
            errorColor: "#cc0000",
            trust: true
          });
          
          setTimeout(function() {
            const height = document.body.scrollHeight;
            window.ReactNativeWebView.postMessage(height.toString());
          }, 100);
        });
      </script>
    </body>
    </html>
  `;

  return (
    <View style={[styles.container, style, { height: webViewHeight }]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webView}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onMessage={onMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={false}
        cacheEnabled={true}
        startInLoadingState={false}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  plainText: {
    fontSize: fontSize.md,
    lineHeight: 24,
  },
});

export default MathText;
