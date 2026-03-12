import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import { supabase, PyqQuestion } from '../services/supabase';
import MathText from './MathText';

interface PYQTabProps {
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
}

const PYQ_TYPES = [
  { key: 'consolidated', label: 'Consolidated' },
  { key: 'important', label: 'Important' },
  { key: 'predictive', label: 'Predictive' },
] as const;

const DIFFICULTY_COLORS: Record<string, string> = {
  Low: '#10B981',
  Medium: '#F59E0B',
  Intermediate: '#F97316',
  Advanced: '#EF4444',
};

function convertMathpixToStandard(text: string): string {
  if (!text) return '';
  let result = text;
  result = result.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
  result = result.replace(/\\\[/g, '$$').replace(/\\\]/g, '$$');
  return result;
}

function getOptionText(value: string | { text: string }): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'text' in value) return value.text;
  return String(value);
}

export default function PYQTab({ subjectId, chapterId, topicId }: PYQTabProps) {
  const [activePyqType, setActivePyqType] = useState<string>('consolidated');
  const [questions, setQuestions] = useState<PyqQuestion[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchQuestions = useCallback(async () => {
    if (!subjectId) return;
    setLoading(true);
    try {
      const result = await supabase.getPyqQuestions(subjectId, activePyqType, chapterId, topicId);
      if (result.success && result.questions) {
        setQuestions(result.questions);
      } else {
        setQuestions([]);
      }
    } catch (error) {
      console.error('[PYQTab] Error fetching questions:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [subjectId, activePyqType, chapterId, topicId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.skeletonCard} />
      ))}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={48} color={colors.gray300} />
      <Text style={styles.emptyText}>
        No {activePyqType} questions available yet.
      </Text>
    </View>
  );

  const renderOptions = (question: PyqQuestion) => {
    if (question.question_format === 'true_false') {
      return (
        <View style={styles.trueFalseRow}>
          <View style={styles.trueFalsePill}>
            <Text style={styles.trueFalseText}>True</Text>
          </View>
          <View style={styles.trueFalsePill}>
            <Text style={styles.trueFalseText}>False</Text>
          </View>
        </View>
      );
    }

    if (question.question_format === 'mcq' && question.options) {
      const entries = Object.entries(question.options);
      return (
        <View style={styles.optionsList}>
          {entries.map(([key, value]) => {
            const optionText = getOptionText(value);
            const normalizedText = convertMathpixToStandard(optionText);
            return (
              <View key={key} style={styles.optionPill}>
                <Text style={styles.optionLabel}>{key}.</Text>
                <View style={styles.optionTextContainer}>
                  <MathText content={normalizedText} color={colors.gray700} />
                </View>
              </View>
            );
          })}
        </View>
      );
    }

    return null;
  };

  const renderBadges = (question: PyqQuestion) => (
    <View style={styles.badgeRow}>
      <View style={styles.badgeOutline}>
        <Text style={styles.badgeOutlineText}>
          {question.question_format === 'true_false' ? 'true/false' : question.question_format}
        </Text>
      </View>
      {question.difficulty && (
        <View style={[styles.badgeFilled, { backgroundColor: (DIFFICULTY_COLORS[question.difficulty] || colors.gray400) + '20' }]}>
          <Text style={[styles.badgeFilledText, { color: DIFFICULTY_COLORS[question.difficulty] || colors.gray400 }]}>
            {question.difficulty}
          </Text>
        </View>
      )}
      {question.marks != null && (
        <View style={styles.badgeSecondary}>
          <Text style={styles.badgeSecondaryText}>{question.marks} marks</Text>
        </View>
      )}
    </View>
  );

  const renderQuestionCard = (question: PyqQuestion, index: number) => {
    const normalizedText = convertMathpixToStandard(question.question_text);
    return (
      <View key={question.id} style={styles.questionCard} data-testid={`card-pyq-question-${question.id}`}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionNumber}>Q{index + 1}.</Text>
          <View style={styles.questionTextContainer}>
            <MathText content={normalizedText} color={colors.gray800} />
          </View>
        </View>
        {question.question_image_url ? (
          <Image
            source={{ uri: question.question_image_url }}
            style={styles.questionImage}
            resizeMode="contain"
          />
        ) : null}
        {renderOptions(question)}
        {renderBadges(question)}
      </View>
    );
  };

  if (!subjectId) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.gray300} />
        <Text style={styles.emptyText}>No subject selected.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="document-text-outline" size={20} color={colors.primary} />
        <Text style={styles.headerTitle}>PYQ's</Text>
      </View>

      <View style={styles.tabStrip}>
        {PYQ_TYPES.map((type) => {
          const isActive = activePyqType === type.key;
          return (
            <TouchableOpacity
              key={type.key}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => setActivePyqType(type.key)}
              data-testid={`button-pyq-type-${type.key}`}
            >
              <Text style={[styles.tabButtonText, isActive && styles.tabButtonTextActive]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? renderSkeleton() : questions.length === 0 ? renderEmpty() : (
        <View style={styles.questionsList}>
          {questions.map((q, i) => renderQuestionCard(q, i))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray900,
  },
  tabStrip: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: colors.gray100,
    borderRadius: 10,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray500,
  },
  tabButtonTextActive: {
    color: '#fff',
  },
  questionsList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray200,
    marginBottom: 12,
  },
  questionHeader: {
    flexDirection: 'row',
    gap: 8,
  },
  questionNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
  },
  questionTextContainer: {
    flex: 1,
  },
  questionImage: {
    width: '100%',
    height: 192,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray200,
    marginTop: 12,
  },
  optionsList: {
    marginTop: 12,
    gap: 8,
  },
  optionPill: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.gray50,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray600,
    marginTop: 2,
  },
  optionTextContainer: {
    flex: 1,
  },
  trueFalseRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  trueFalsePill: {
    flex: 1,
    backgroundColor: colors.gray50,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  trueFalseText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray600,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  badgeOutline: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeOutlineText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.gray500,
    textTransform: 'uppercase',
  },
  badgeFilled: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeFilledText: {
    fontSize: 11,
    fontWeight: '600',
  },
  badgeSecondary: {
    backgroundColor: colors.gray100,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeSecondaryText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.gray500,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: colors.gray400,
    textAlign: 'center',
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  skeletonCard: {
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.gray100,
  },
});
