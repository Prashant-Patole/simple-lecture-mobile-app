import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, Category } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, borderRadius, fontSize, fontFamily } from '../constants/theme';

interface SubcategoryGroup {
  parentName: string;
  parentIcon: string;
  subcategories: Category[];
}

export default function SubcategorySelectionScreen({ navigation, route }: any) {
  const { markInterestsSelected } = useAuth();
  const selectedCategoryIds: string[] = route.params?.selectedCategoryIds || [];
  const [groups, setGroups] = useState<SubcategoryGroup[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubcategories();
  }, []);

  const fetchSubcategories = async () => {
    const result = await supabase.getCategories();
    if (result.success && result.categories) {
      const allCategories = result.categories;
      const parentMap = new Map<string, Category>();
      allCategories
        .filter((c) => c.level === 1 && selectedCategoryIds.includes(c.id))
        .forEach((c) => parentMap.set(c.id, c));

      const subcats = allCategories.filter(
        (c) => c.level === 2 && c.parent_id && selectedCategoryIds.includes(c.parent_id)
      );

      const grouped: SubcategoryGroup[] = [];
      parentMap.forEach((parent) => {
        const children = subcats.filter((s) => s.parent_id === parent.id);
        if (children.length > 0) {
          grouped.push({
            parentName: parent.name,
            parentIcon: getCategoryIcon(parent.icon, parent.name),
            subcategories: children,
          });
        }
      });

      if (grouped.length === 0) {
        await AsyncStorage.setItem('@interests_selected', 'true');
        markInterestsSelected();
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
        return;
      }

      setGroups(grouped);
    }
    setLoading(false);
  };

  const getCategoryIcon = (icon: string | null, name: string) => {
    if (icon && icon.length <= 2) return icon;
    const iconMap: Record<string, string> = {
      'Board Exams': '📚',
      'Medical Entrance': '🩺',
      'Engineering Entrance': '⚙️',
      'Pharmacy Courses': '💊',
      'Integrated Programs': '🎯',
      'Research': '🔬',
      'Business Studies': '💼',
      'Accounts': '📊',
      'Data Science': '📈',
      'Architecture': '🏛️',
      'Economics': '💰',
      'Puc': '📖',
    };
    return iconMap[name] || '📖';
  };

  const toggleSubcategory = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('@interests_selected', 'true');
    markInterestsSelected();
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  };

  const handleContinue = () => {
    completeOnboarding();
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title} data-testid="text-subcategory-title">Select your subjects</Text>
              <Text style={styles.subtitle} data-testid="text-subcategory-subtitle">
                Choose specific subjects you'd like to explore
              </Text>
            </View>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton} data-testid="button-skip-subcategories">
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>

        {groups.map((group) => (
          <View key={group.parentName} style={styles.groupContainer}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupIcon}>{group.parentIcon}</Text>
              <Text style={styles.groupTitle}>{group.parentName}</Text>
            </View>
            <View style={styles.grid}>
              {group.subcategories.map((sub) => {
                const isSelected = selectedIds.includes(sub.id);
                return (
                  <TouchableOpacity
                    key={sub.id}
                    style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
                    onPress={() => toggleSubcategory(sub.id)}
                    activeOpacity={0.7}
                    data-testid={`button-subcategory-${sub.id}`}
                  >
                    <Text style={styles.categoryIcon}>
                      {getCategoryIcon(sub.icon, sub.name)}
                    </Text>
                    <Text style={[styles.categoryName, isSelected && styles.categoryNameSelected]}>
                      {sub.name}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Text style={styles.selectedCount} data-testid="text-subcategory-selected-count">
          {selectedIds.length} selected
        </Text>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          data-testid="button-continue-subcategories"
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  header: {
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontFamily: fontFamily.heading,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  skipButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: 4,
  },
  skipText: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.semiBold,
    color: colors.primary,
  },
  groupContainer: {
    marginBottom: spacing.xl,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  groupIcon: {
    fontSize: 22,
    marginRight: spacing.sm,
  },
  groupTitle: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.bold,
    color: colors.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    position: 'relative',
  },
  categoryCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F0FDF4',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  categoryName: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.semiBold,
    color: colors.text,
    textAlign: 'center',
  },
  categoryNameSelected: {
    color: colors.primary,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedCount: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    minWidth: 140,
    alignItems: 'center',
  },
  continueText: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.bold,
    color: colors.white,
  },
});
