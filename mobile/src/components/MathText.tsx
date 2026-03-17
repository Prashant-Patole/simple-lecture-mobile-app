import { useState, useCallback, useRef, memo } from 'react';
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

function buildKatexHtml(bodyHtml: string, textColor: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
html,body{background:transparent;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:14px;line-height:1.45;color:${textColor};padding:2px 0;word-wrap:break-word;}
.katex{font-size:1.05em;}
.katex-display{margin:2px 0;overflow-x:auto;overflow-y:hidden;}
p{margin-bottom:4px;}
</style>
</head>
<body>
${bodyHtml}
<script>
document.addEventListener("DOMContentLoaded",function(){
renderMathInElement(document.body,{
delimiters:[
{left:"$$",right:"$$",display:true},
{left:"$",right:"$",display:false},
{left:"\\\\[",right:"\\\\]",display:true},
{left:"\\\\(",right:"\\\\)",display:false}
],throwOnError:false,errorColor:"#cc0000",trust:true
});
function s(){var h=document.body.scrollHeight;if(h>0)window.ReactNativeWebView.postMessage(h.toString());}
setTimeout(s,100);setTimeout(s,300);setTimeout(s,600);setTimeout(s,1200);
});
</script>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
}

const MathText = memo(({ content, style, textStyle, color = colors.gray900 }: MathTextProps) => {
  const { width } = useWindowDimensions();
  const [webViewHeight, setWebViewHeight] = useState(20);

  const hasLatex = containsLatex(content);

  const webViewRef = useRef<WebView>(null);

  const onMessage = useCallback((event: any) => {
    const height = parseInt(event.nativeEvent.data, 10);
    if (height && height > 0) {
      setWebViewHeight(height);
    }
  }, []);

  const onLoadEnd = useCallback(() => {
    webViewRef.current?.injectJavaScript(
      'var h=document.body.scrollHeight;if(h>0)window.ReactNativeWebView.postMessage(h.toString());true;'
    );
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

  const bodyHtml = `<div>${escapeHtml(content)}</div>`;
  const htmlContent = buildKatexHtml(bodyHtml, color);

  return (
    <View style={[styles.container, style, { height: webViewHeight }]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webView}
        scrollEnabled={false}
        nestedScrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onMessage={onMessage}
        onLoadEnd={onLoadEnd}
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

export { containsLatex, buildKatexHtml, escapeHtml };
export default MathText;
