import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase as supabaseService } from '../services/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const colors = {
  primary: '#2BBD6E',
  primaryLight: '#DCFCE7',
  background: '#FFFFFF',
  white: '#FFFFFF',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  userBubble: '#2BBD6E',
  aiBubble: '#F3F4F6',
  error: '#EF4444',
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface DoubtsTabProps {
  subjectId: string;
  subjectName?: string;
  studentId?: string;
}

const formatMarkdown = (text: string) => {
  const lines = text.split('\n');
  const elements: { type: string; content: string; level?: number }[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      elements.push({ type: 'spacer', content: '' });
    } else if (trimmed.startsWith('### ')) {
      elements.push({ type: 'h3', content: trimmed.slice(4) });
    } else if (trimmed.startsWith('## ')) {
      elements.push({ type: 'h2', content: trimmed.slice(3) });
    } else if (trimmed.startsWith('# ')) {
      elements.push({ type: 'h1', content: trimmed.slice(2) });
    } else if (trimmed.match(/^[-*•]\s/)) {
      elements.push({ type: 'bullet', content: trimmed.slice(2) });
    } else if (trimmed.match(/^\d+\.\s/)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)$/);
      if (match) {
        elements.push({ type: 'numbered', content: match[2], level: parseInt(match[1]) });
      }
    } else {
      elements.push({ type: 'text', content: trimmed });
    }
  }

  return elements;
};

const renderFormattedText = (text: string) => {
  const parts: { text: string; bold: boolean }[] = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), bold: false });
    }
    parts.push({ text: match[1], bold: true });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), bold: false });
  }

  return parts.map((part, i) => (
    <Text key={i} style={part.bold ? { fontWeight: '700' } : undefined}>{part.text}</Text>
  ));
};

const AIMessageContent = ({ content }: { content: string }) => {
  const elements = formatMarkdown(content);

  return (
    <View>
      {elements.map((el, i) => {
        switch (el.type) {
          case 'h1':
            return <Text key={i} style={mdStyles.h1}>{renderFormattedText(el.content)}</Text>;
          case 'h2':
            return <Text key={i} style={mdStyles.h2}>{renderFormattedText(el.content)}</Text>;
          case 'h3':
            return <Text key={i} style={mdStyles.h3}>{renderFormattedText(el.content)}</Text>;
          case 'bullet':
            return (
              <View key={i} style={mdStyles.bulletRow}>
                <Text style={mdStyles.bulletDot}>•</Text>
                <Text style={mdStyles.bulletText}>{renderFormattedText(el.content)}</Text>
              </View>
            );
          case 'numbered':
            return (
              <View key={i} style={mdStyles.bulletRow}>
                <Text style={mdStyles.numberedNum}>{el.level}.</Text>
                <Text style={mdStyles.bulletText}>{renderFormattedText(el.content)}</Text>
              </View>
            );
          case 'spacer':
            return <View key={i} style={{ height: 6 }} />;
          default:
            return <Text key={i} style={mdStyles.body}>{renderFormattedText(el.content)}</Text>;
        }
      })}
    </View>
  );
};

const TypingIndicator = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.messageBubble, styles.aiBubble]}>
      <Text style={styles.typingText}>Thinking{dots}</Text>
    </View>
  );
};

const INPUT_BAR_HEIGHT = 56;

export default function DoubtsTab({ subjectId, subjectName, studentId }: DoubtsTabProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  useEffect(() => {
    if (keyboardHeight > 0) {
      scrollToBottom();
    }
  }, [keyboardHeight]);

  const handleSend = async () => {
    const question = inputText.trim();
    if (!question || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: question };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);
    scrollToBottom();

    const messageIndex = updatedMessages.length - 1;

    try {
      const result = await supabaseService.askDoubt({
        question,
        subjectId,
        messages: updatedMessages,
        studentId,
      });

      if (result.success && result.answer) {
        setMessages(prev => [...prev, { role: 'assistant', content: result.answer! }]);
      } else {
        setMessages(prev => prev.filter((_, i) => i !== messageIndex));
        setInputText(question);
        Alert.alert('Error', result.error || 'Could not get a response. Please try again.');
      }
    } catch {
      setMessages(prev => prev.filter((_, i) => i !== messageIndex));
      setInputText(question);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  if (!subjectId) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.textLight} />
        <Text style={styles.emptyTitle}>No Subject Selected</Text>
        <Text style={styles.emptyText}>Please select a subject to ask doubts.</Text>
      </View>
    );
  }

  const isKeyboardOpen = keyboardHeight > 0;
  const bottomOffset = isKeyboardOpen && Platform.OS === 'ios' ? keyboardHeight : 0;
  const inputBottomPadding = isKeyboardOpen ? 4 : Math.max(insets.bottom, 8);
  const scrollPaddingBottom = INPUT_BAR_HEIGHT + inputBottomPadding + 8;

  return (
    <View style={styles.container}>
      {messages.length === 0 ? (
        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={[styles.welcomeScrollContent, { paddingBottom: scrollPaddingBottom }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.welcomeInner}>
            <View style={styles.welcomeIcon}>
              <Ionicons name="chatbubbles" size={40} color={colors.primary} />
            </View>
            <Text style={styles.welcomeTitle}>Ask Your Doubts</Text>
            <Text style={styles.welcomeSubtitle}>
              {subjectName
                ? `Ask any question about ${subjectName} and get AI-powered answers based on your lecture content.`
                : 'Ask any question about your course content and get AI-powered answers based on your lectures.'}
            </Text>
            <View style={styles.suggestionContainer}>
              {['Explain the key concepts', 'Summarize the important formulas', 'Give me practice questions'].map((suggestion, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.suggestionChip}
                  onPress={() => {
                    setInputText(suggestion);
                  }}
                  testID={`button-suggestion-${i}`}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={[styles.messagesContent, { paddingBottom: scrollPaddingBottom }]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg, index) => (
            <View
              key={index}
              style={[
                styles.messageRow,
                msg.role === 'user' ? styles.userRow : styles.aiRow,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  msg.role === 'user' ? styles.userBubble : styles.aiBubble,
                ]}
              >
                {msg.role === 'user' ? (
                  <Text style={styles.userText}>{msg.content}</Text>
                ) : (
                  <AIMessageContent content={msg.content} />
                )}
              </View>
            </View>
          ))}
          {isLoading && (
            <View style={[styles.messageRow, styles.aiRow]}>
              <TypingIndicator />
            </View>
          )}
        </ScrollView>
      )}

      <View style={[styles.inputContainer, { bottom: bottomOffset, paddingBottom: inputBottomPadding }]}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask a doubt..."
            placeholderTextColor={colors.textLight}
            multiline
            maxLength={2000}
            editable={!isLoading}
            blurOnSubmit={false}
            testID="input-doubt-text"
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
            testID="button-send-doubt"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="send" size={18} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const mdStyles = StyleSheet.create({
  h1: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 6, marginTop: 4 },
  h2: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4, marginTop: 4 },
  h3: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 3, marginTop: 3 },
  body: { fontSize: 13.5, lineHeight: 20, color: colors.text },
  bulletRow: { flexDirection: 'row', marginBottom: 3, paddingRight: 8 },
  bulletDot: { fontSize: 13.5, color: colors.primary, marginRight: 6, lineHeight: 20, fontWeight: '700' },
  numberedNum: { fontSize: 13.5, color: colors.primary, marginRight: 6, lineHeight: 20, fontWeight: '600', minWidth: 16 },
  bulletText: { flex: 1, fontSize: 13.5, lineHeight: 20, color: colors.text },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 6,
    textAlign: 'center',
  },
  welcomeScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 20,
  },
  welcomeInner: {
    alignItems: 'center',
  },
  welcomeIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  suggestionContainer: {
    width: '100%',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  suggestionText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
    maxWidth: '85%',
  },
  userRow: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  aiRow: {
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  aiAvatarSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: SCREEN_WIDTH * 0.92,
  },
  userBubble: {
    backgroundColor: colors.userBubble,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: colors.aiBubble,
    borderBottomLeftRadius: 4,
    flexDirection: 'column',
  },
  userText: {
    fontSize: 14,
    color: colors.white,
    lineHeight: 20,
  },
  typingText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  inputContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    maxHeight: 100,
    minHeight: 40,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.textLight,
    opacity: 0.6,
  },
});
