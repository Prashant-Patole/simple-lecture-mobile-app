import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { CourseCardSkeleton } from '../components/SkeletonLoader';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, fontSize, borderRadius, fontFamily } from '../constants/theme';
import { RootStackParamList } from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, User, ExploreCourse } from '../services/supabase';
import { getUnreadCount } from '../services/notificationStorage';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MENU_ITEMS = [
  { icon: 'home', label: 'Home', route: 'MainTabs' },
  { icon: 'grid', label: 'Dashboard', route: 'Dashboard' },
  { icon: 'document-text', label: 'My Courses', route: 'MyCourses' },
  { icon: 'compass', label: 'Explore Courses', route: 'Courses' },
  { icon: 'videocam', label: 'Live Classes', route: 'LiveClasses' },
  { icon: 'play-circle', label: 'My Recordings', route: 'Recordings' },
  { icon: 'chatbubbles', label: 'Forum', route: 'Forum' },
  { icon: 'newspaper', label: 'Blog', route: 'Blog' },
  { icon: 'help-circle', label: 'Support', route: 'Support' },
];

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));
  const [user, setUser] = useState<User | null>(null);
  
  const [featuredCourses, setFeaturedCourses] = useState<ExploreCourse[]>([]);
  const [newestCourses, setNewestCourses] = useState<ExploreCourse[]>([]);
  const [bestCourses, setBestCourses] = useState<ExploreCourse[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingNewest, setLoadingNewest] = useState(true);
  const [loadingBest, setLoadingBest] = useState(true);
  const [notifUnreadCount, setNotifUnreadCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      getUnreadCount().then(setNotifUnreadCount);
    }, [])
  );

  useEffect(() => {
    const fetchUserProfile = async () => {
      const result = await supabase.getUserProfile();
      if (result.success && result.user) {
        setUser(result.user);
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      let savedInterests: string[] = [];
      try {
        const raw = await AsyncStorage.getItem('@user_interests');
        if (raw) savedInterests = JSON.parse(raw);
      } catch {}

      const featuredPromise = savedInterests.length > 0
        ? supabase.getCoursesByCategory(savedInterests)
        : supabase.getFeaturedCourses(3);

      const [featuredRes, newestRes, bestRes] = await Promise.all([
        featuredPromise,
        supabase.getNewestCourses(5),
        supabase.getBestCourses(5),
      ]);

      if (featuredRes.success && featuredRes.courses) {
        setFeaturedCourses(featuredRes.courses);
      }
      setLoadingFeatured(false);

      if (newestRes.success && newestRes.courses) {
        setNewestCourses(newestRes.courses);
      }
      setLoadingNewest(false);

      if (bestRes.success && bestRes.courses) {
        setBestCourses(bestRes.courses);
      }
      setLoadingBest(false);
    };
    fetchCourses();
  }, []);

  const formatDuration = (months: number | null) => {
    if (!months) return 'Self-paced';
    return months === 1 ? '1 Month' : `${months} Months`;
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'Free';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const toggleSidebar = () => {
    const toValue = isSidebarOpen ? 0 : 1;
    Animated.spring(animatedValue, {
      toValue,
      useNativeDriver: true,
      friction: 8,
      tension: 65,
    }).start();
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    if (isSidebarOpen) {
      Animated.spring(animatedValue, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 65,
      }).start();
      setIsSidebarOpen(false);
    }
  };

  const handleMenuItemPress = (route: string) => {
    closeSidebar();
    if (route === 'Courses') {
      navigation.navigate('Courses');
    } else if (route === 'Dashboard') {
      navigation.navigate('MainTabs', { screen: 'Dashboard' });
    } else if (route === 'MyCourses') {
      navigation.navigate('MainTabs', { screen: 'MyCourses' });
    } else if (route === 'LiveClasses') {
      navigation.navigate('LiveClasses');
    } else if (route === 'Recordings') {
      navigation.navigate('Recordings');
    } else if (route === 'Forum') {
      navigation.navigate('Forum');
    } else if (route === 'Blog') {
      navigation.navigate('Blog');
    } else if (route === 'Support') {
      navigation.navigate('Support');
    }
  };

  const mainContentStyle = {
    transform: [
      {
        translateX: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 260],
        }),
      },
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.85],
        }),
      },
    ],
    borderRadius: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 30],
    }),
  };

  return (
    <View style={styles.container}>
      {/* Sidebar Menu */}
      <LinearGradient
        colors={[colors.primary, '#4ADE80', '#34D07B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.sidebar}
      >
        <TouchableOpacity 
          style={styles.sidebarProfile}
          onPress={() => {
            closeSidebar();
            navigation.navigate('MainTabs', { screen: 'Profile' });
          }}
          data-testid="button-sidebar-profile"
        >
          <View style={styles.sidebarAvatar}>
            <Text style={styles.avatarText}>
              {user?.full_name 
                ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                : user?.email?.[0]?.toUpperCase() || 'S'}
            </Text>
          </View>
          <View>
            <Text style={styles.sidebarName}>{user?.full_name || user?.email?.split('@')[0] || 'Student'}</Text>
            <Text style={styles.sidebarSubtext}>Let's start learning!</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.sidebarMenu}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem,
                index === 0 && styles.menuItemActive,
              ]}
              onPress={() => handleMenuItemPress(item.route)}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon as any} size={20} color={index === 0 ? colors.primary : colors.white} />
              </View>
              <Text style={[styles.menuItemText, index === 0 && styles.menuItemTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => navigation.navigate('Login')}
        >
          <View style={styles.logoutIconContainer}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          </View>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Main Content */}
      <Animated.View style={[styles.mainContent, mainContentStyle]}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.mainContentInner}
          onPress={closeSidebar}
          disabled={!isSidebarOpen}
        >
          <LinearGradient
            colors={[colors.primary, '#4ADE80']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.header}
          >
            <View style={styles.headerTop}>
              <TouchableOpacity style={styles.menuButton} onPress={toggleSidebar}>
                <Ionicons name="menu" size={28} color={colors.white} />
              </TouchableOpacity>
              <View style={styles.greeting}>
                <Text style={styles.greetingName}>Hi {user?.full_name || user?.email?.split('@')[0] || 'there'}</Text>
                <Text style={styles.greetingSubtext}>Let's start learning!</Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.searchIconButton}
                  onPress={() => navigation.navigate('Courses')}
                  data-testid="button-search-courses"
                >
                  <View style={styles.searchIconInner}>
                    <Ionicons name="search" size={20} color={colors.primary} />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => navigation.navigate('Cart')}
                >
                  <Ionicons name="cart-outline" size={22} color={colors.white} />
                  <View style={styles.badge} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => navigation.navigate('Notifications')}
                  data-testid="button-notifications"
                >
                  <Ionicons name="notifications-outline" size={22} color={colors.white} />
                  {notifUnreadCount > 0 && (
                    <View style={styles.notifBadge}>
                      <Text style={styles.notifBadgeText}>
                        {notifUnreadCount > 9 ? '9+' : notifUnreadCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>

          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            scrollEnabled={!isSidebarOpen}
          >
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.sectionIconContainer}>
                    <Ionicons name="star" size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.sectionTitle}>Featured Courses</Text>
                </View>
                <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('Courses')}>
                  <Text style={styles.viewAll}>View All</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
              
              {loadingFeatured ? (
                <CourseCardSkeleton variant="featured" />
              ) : featuredCourses.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconContainer}>
                    <Ionicons name="school-outline" size={40} color={colors.primary} />
                  </View>
                  <Text style={styles.emptyStateText}>No featured courses available</Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  <View style={styles.coursesRow}>
                    {featuredCourses.map((course) => (
                      <TouchableOpacity 
                        key={course.id}
                        style={styles.courseCard}
                        onPress={() => navigation.navigate('ViewCourse', { courseId: course.id })}
                        data-testid={`card-featured-course-${course.id}`}
                      >
                        {course.thumbnail_url && !course.thumbnail_url.startsWith('data:') ? (
                          <Image 
                            source={{ uri: course.thumbnail_url }} 
                            style={styles.courseImagePlaceholder}
                            resizeMode="cover"
                          />
                        ) : (
                          <LinearGradient
                            colors={['#DCFCE7', '#D1FAE5', '#BBF7D0']}
                            style={styles.courseImagePlaceholder}
                          >
                            <View style={styles.smallPlayIcon}>
                              <Ionicons name="play" size={20} color={colors.primary} />
                            </View>
                          </LinearGradient>
                        )}
                        <View style={styles.cardInfo}>
                          <Text style={styles.cardTitle} numberOfLines={2}>{course.name}</Text>
                          {course.short_description && (
                            <Text style={styles.cardDescription} numberOfLines={1}>
                              {course.short_description}
                            </Text>
                          )}
                          {!!course.rating && (
                            <View style={styles.ratingRow}>
                              <Text style={styles.ratingNumber}>{course.rating.toFixed(1)}</Text>
                              <View style={styles.starsRow}>
                                {[1, 2, 3, 4, 5].map((i) => (
                                  <Ionicons 
                                    key={i} 
                                    name={i <= Math.floor(course.rating || 0) ? "star" : i - 0.5 <= (course.rating || 0) ? "star-half" : "star-outline"} 
                                    size={12} 
                                    color="#F59E0B" 
                                  />
                                ))}
                              </View>
                              {!!course.review_count && (
                                <Text style={styles.reviewCount}>({course.review_count.toLocaleString()})</Text>
                              )}
                            </View>
                          )}
                          <Text style={styles.cardPrice}>{formatPrice(course.price_inr)}</Text>
                          {course.is_coming_soon ? (
                            <View style={styles.comingSoonBadge}>
                              <Text style={styles.comingSoonText}>Coming Soon</Text>
                            </View>
                          ) : (!!course.rating && course.rating >= 4.5 && (
                            <View style={styles.bestsellerBadge}>
                              <Text style={styles.bestsellerText}>Bestseller</Text>
                            </View>
                          ))}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.sectionIconContainer}>
                    <Ionicons name="sparkles" size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.sectionTitle}>Newest Courses</Text>
                </View>
                <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('Courses')}>
                  <Text style={styles.viewAll}>View All</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
              {loadingNewest ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  <View style={styles.coursesRow}>
                    <CourseCardSkeleton variant="compact" />
                    <CourseCardSkeleton variant="compact" />
                    <CourseCardSkeleton variant="compact" />
                  </View>
                </ScrollView>
              ) : newestCourses.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconContainer}>
                    <Ionicons name="school-outline" size={40} color={colors.primary} />
                  </View>
                  <Text style={styles.emptyStateText}>No new courses available</Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  <View style={styles.coursesRow}>
                    {newestCourses.map((course) => (
                      <TouchableOpacity 
                        key={course.id} 
                        style={styles.courseCard}
                        onPress={() => navigation.navigate('ViewCourse', { courseId: course.id })}
                        data-testid={`card-newest-course-${course.id}`}
                      >
                        {course.thumbnail_url && !course.thumbnail_url.startsWith('data:') ? (
                          <Image 
                            source={{ uri: course.thumbnail_url }} 
                            style={styles.courseImagePlaceholder}
                            resizeMode="cover"
                          />
                        ) : (
                          <LinearGradient
                            colors={['#DCFCE7', '#D1FAE5', '#BBF7D0']}
                            style={styles.courseImagePlaceholder}
                          >
                            <View style={styles.smallPlayIcon}>
                              <Ionicons name="play" size={20} color={colors.primary} />
                            </View>
                          </LinearGradient>
                        )}
                        <View style={styles.cardInfo}>
                          <Text style={styles.cardTitle} numberOfLines={2}>{course.name}</Text>
                          {course.short_description && (
                            <Text style={styles.cardDescription} numberOfLines={1}>
                              {course.short_description}
                            </Text>
                          )}
                          {!!course.rating && (
                            <View style={styles.ratingRow}>
                              <Text style={styles.ratingNumber}>{course.rating.toFixed(1)}</Text>
                              <View style={styles.starsRow}>
                                {[1, 2, 3, 4, 5].map((i) => (
                                  <Ionicons 
                                    key={i} 
                                    name={i <= Math.floor(course.rating || 0) ? "star" : i - 0.5 <= (course.rating || 0) ? "star-half" : "star-outline"} 
                                    size={12} 
                                    color="#F59E0B" 
                                  />
                                ))}
                              </View>
                              {!!course.review_count && (
                                <Text style={styles.reviewCount}>({course.review_count.toLocaleString()})</Text>
                              )}
                            </View>
                          )}
                          <Text style={styles.cardPrice}>{formatPrice(course.price_inr)}</Text>
                          {course.is_coming_soon ? (
                            <View style={styles.comingSoonBadge}>
                              <Text style={styles.comingSoonText}>Coming Soon</Text>
                            </View>
                          ) : (!!course.rating && course.rating >= 4.5 && (
                            <View style={styles.bestsellerBadge}>
                              <Text style={styles.bestsellerText}>Bestseller</Text>
                            </View>
                          ))}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.sectionIconContainer}>
                    <Ionicons name="trophy" size={18} color={colors.primary} />
                  </View>
                  <Text style={styles.sectionTitle}>Best Rated</Text>
                </View>
                <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('Courses')}>
                  <Text style={styles.viewAll}>View All</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
              
              {loadingBest ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  <View style={styles.coursesRow}>
                    <CourseCardSkeleton variant="compact" />
                    <CourseCardSkeleton variant="compact" />
                    <CourseCardSkeleton variant="compact" />
                  </View>
                </ScrollView>
              ) : bestCourses.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconContainer}>
                    <Ionicons name="ribbon-outline" size={40} color={colors.primary} />
                  </View>
                  <Text style={styles.emptyStateText}>Top rated courses coming soon</Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  <View style={styles.coursesRow}>
                    {bestCourses.map((course) => (
                      <TouchableOpacity 
                        key={course.id} 
                        style={styles.courseCard}
                        onPress={() => navigation.navigate('ViewCourse', { courseId: course.id })}
                        data-testid={`card-best-course-${course.id}`}
                      >
                        {course.thumbnail_url && !course.thumbnail_url.startsWith('data:') ? (
                          <Image 
                            source={{ uri: course.thumbnail_url }} 
                            style={styles.courseImagePlaceholder}
                            resizeMode="cover"
                          />
                        ) : (
                          <LinearGradient
                            colors={['#DCFCE7', '#D1FAE5', '#BBF7D0']}
                            style={styles.courseImagePlaceholder}
                          >
                            <View style={styles.smallPlayIcon}>
                              <Ionicons name="play" size={20} color={colors.primary} />
                            </View>
                          </LinearGradient>
                        )}
                        <View style={styles.cardInfo}>
                          <Text style={styles.cardTitle} numberOfLines={2}>{course.name}</Text>
                          {course.short_description && (
                            <Text style={styles.cardDescription} numberOfLines={1}>
                              {course.short_description}
                            </Text>
                          )}
                          {!!course.rating && (
                            <View style={styles.ratingRow}>
                              <Text style={styles.ratingNumber}>{course.rating.toFixed(1)}</Text>
                              <View style={styles.starsRow}>
                                {[1, 2, 3, 4, 5].map((i) => (
                                  <Ionicons 
                                    key={i} 
                                    name={i <= Math.floor(course.rating || 0) ? "star" : i - 0.5 <= (course.rating || 0) ? "star-half" : "star-outline"} 
                                    size={12} 
                                    color="#F59E0B" 
                                  />
                                ))}
                              </View>
                              {!!course.review_count && (
                                <Text style={styles.reviewCount}>({course.review_count.toLocaleString()})</Text>
                              )}
                            </View>
                          )}
                          <Text style={styles.cardPrice}>{formatPrice(course.price_inr)}</Text>
                          {course.is_coming_soon ? (
                            <View style={styles.comingSoonBadge}>
                              <Text style={styles.comingSoonText}>Coming Soon</Text>
                            </View>
                          ) : (!!course.rating && course.rating >= 4.5 && (
                            <View style={styles.bestsellerBadge}>
                              <Text style={styles.bestsellerText}>Bestseller</Text>
                            </View>
                          ))}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              )}
            </View>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.75,
    paddingTop: 60,
    paddingLeft: spacing.lg,
    paddingRight: spacing.md,
  },
  sidebarProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  sidebarAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: '800',
  },
  sidebarName: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  sidebarSubtext: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  sidebarMenu: {
    flex: 1,
    gap: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
  },
  menuItemActive: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  menuItemTextActive: {
    color: colors.primary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    marginBottom: 90,
  },
  logoutIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  mainContentInner: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  menuButton: {
    marginRight: spacing.md,
    padding: spacing.xs,
  },
  greeting: {
    flex: 1,
  },
  greetingName: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontFamily: fontFamily.bold,
  },
  greetingSubtext: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: fontSize.sm,
    fontFamily: fontFamily.regular,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 10,
    borderRadius: 14,
    position: 'relative',
  },
  searchIconButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  searchIconInner: {
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  notifBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notifBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: spacing.sm,
  },
  section: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.heading,
    color: colors.text,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAll: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  cardInfo: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  horizontalScroll: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  coursesRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingRight: spacing.md,
  },
  courseCard: {
    width: 170,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  courseImagePlaceholder: {
    height: 100,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  smallPlayIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.bold,
    color: colors.text,
    lineHeight: 18,
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    lineHeight: 15,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  ratingNumber: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.bold,
    color: '#B4690E',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  reviewCount: {
    fontSize: 10,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  cardPrice: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.extraBold,
    color: colors.text,
  },
  bestsellerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECEB98',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 4,
  },
  bestsellerText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#3D3C0A',
  },
  comingSoonBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 4,
  },
  comingSoonText: {
    fontSize: 10,
    fontFamily: fontFamily.bold,
    color: '#0369A1',
  },
  loadingContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyState: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyStateText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 100,
  },
});
