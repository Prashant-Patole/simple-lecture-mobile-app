import { createRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomTabBar from '../components/CustomTabBar';
import { useAuth } from '../context/AuthContext';

import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import DashboardScreen from '../screens/DashboardScreen';
import CoursesScreen from '../screens/CoursesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MyCoursesScreen from '../screens/MyCoursesScreen';
import CourseDetailsScreen from '../screens/CourseDetailsScreen';
import CurriculumScreen from '../screens/CurriculumScreen';
import TopicDetailsScreen from '../screens/TopicDetailsScreen';
import DetailedProgressScreen from '../screens/DetailedProgressScreen';
import LearningPathScreen from '../screens/LearningPathScreen';
import CartScreen from '../screens/CartScreen';
import LiveClassesScreen from '../screens/LiveClassesScreen';
import PreviousYearTestScreen from '../screens/PreviousYearTestScreen';
import ChapterContentScreen from '../screens/ChapterContentScreen';
import RecordingsScreen from '../screens/RecordingsScreen';
import WatchRecordingScreen from '../screens/WatchRecordingScreen';
import ViewCourseScreen from '../screens/ViewCourseScreen';
import SupportScreen from '../screens/SupportScreen';
import ForumScreen from '../screens/ForumScreen';
import ForumCategoryScreen from '../screens/ForumCategoryScreen';
import ForumPostScreen from '../screens/ForumPostScreen';
import GroupChatScreen from '../screens/GroupChatScreen';
import GroupInfoScreen from '../screens/GroupInfoScreen';
import AILecturePlayerScreen from '../screens/AILecturePlayerScreen';
import LanguageTopupScreen from '../screens/LanguageTopupScreen';
import ChaptersListScreen from '../screens/ChaptersListScreen';
import OtpVerificationScreen from '../screens/OtpVerificationScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import InterestSelectionScreen from '../screens/InterestSelectionScreen';
import SubcategorySelectionScreen from '../screens/SubcategorySelectionScreen';
import BlogListScreen from '../screens/BlogListScreen';
import BlogDetailScreen from '../screens/BlogDetailScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  MainTabs: { screen?: string } | undefined;
  Courses: { searchQuery?: string } | undefined;
  CourseDetails: { courseId: string };
  Curriculum: { subjectId?: string; subjectName?: string };
  TopicDetails: { topicId?: string; subjectId?: string; subjectName?: string; openAITab?: boolean; openTab?: string; chapterNumber?: number; topicNumber?: number; topicTitle?: string; chapterId?: string };
  ChapterContent: { chapterId: string; chapterTitle: string; chapterNumber: number; subjectId: string; subjectName: string };
  DetailedProgress: undefined;
  LearningPath: undefined;
  Cart: undefined;
  LiveClasses: undefined;
  PreviousYearTest: { subjectId?: string; subjectName?: string };
  Recordings: undefined;
  WatchRecording: { recording: any };
  ViewCourse: { courseId: string };
  Support: undefined;
  Forum: undefined;
  ForumCategory: { categoryId: string; categoryName: string };
  ForumPost: { postId: string };
  GroupChat: { groupId: string; groupName: string };
  GroupInfo: { groupId: string; groupName: string };
  AILecturePlayer: { 
    jobId: string; 
    topicTitle: string; 
    presentationJson?: any;
    topicId?: string;
    subjectId?: string;
    initialLanguage?: string;
  };
  LanguageTopup: {
    courseId: string;
    courseName: string;
    availableLanguages: string[];
    purchasedLanguages: string[];
    price: number;
  };
  ChaptersList: { subjectId: string; subjectName: string };
  OtpVerification: {
    contactInfo: string;
    contactType: 'phone' | 'email';
    isLogin: boolean;
    fullName?: string;
    password?: string;
  };
  ForgotPassword: undefined;
  Notifications: undefined;
  InterestSelection: undefined;
  SubcategorySelection: { selectedCategoryIds: string[] };
  Blog: undefined;
  BlogDetail: { slug: string };
};

export const navigationRef = createRef<NavigationContainerRef<RootStackParamList>>();

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="MyCourses" component={MyCoursesScreen} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading, hasSelectedInterests, hasSeenOnboarding, isNewSignup } = useAuth();

  if (isLoading) {
    return (
      <View style={authLoadingStyles.container}>
        <ActivityIndicator size="large" color="#2BBD6E" />
      </View>
    );
  }

  const getInitialRoute = () => {
    if (!isAuthenticated) {
      return hasSeenOnboarding ? 'Login' : 'Onboarding';
    }
    if (isNewSignup || !hasSelectedInterests) return 'InterestSelection';
    return 'MainTabs';
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName={getInitialRoute()}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="Courses" component={CoursesScreen} />
        <Stack.Screen name="CourseDetails" component={CourseDetailsScreen} />
        <Stack.Screen name="Curriculum" component={CurriculumScreen} />
        <Stack.Screen name="TopicDetails" component={TopicDetailsScreen} />
        <Stack.Screen name="ChapterContent" component={ChapterContentScreen} />
        <Stack.Screen name="DetailedProgress" component={DetailedProgressScreen} />
        <Stack.Screen name="LearningPath" component={LearningPathScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="LiveClasses" component={LiveClassesScreen} />
        <Stack.Screen name="PreviousYearTest" component={PreviousYearTestScreen} />
        <Stack.Screen name="Recordings" component={RecordingsScreen} />
        <Stack.Screen name="WatchRecording" component={WatchRecordingScreen} />
        <Stack.Screen name="ViewCourse" component={ViewCourseScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
        <Stack.Screen name="Forum" component={ForumScreen} />
        <Stack.Screen name="ForumCategory" component={ForumCategoryScreen} />
        <Stack.Screen name="ForumPost" component={ForumPostScreen} />
        <Stack.Screen name="GroupChat" component={GroupChatScreen} />
        <Stack.Screen name="GroupInfo" component={GroupInfoScreen} />
        <Stack.Screen name="AILecturePlayer" component={AILecturePlayerScreen} />
        <Stack.Screen name="LanguageTopup" component={LanguageTopupScreen} />
        <Stack.Screen name="ChaptersList" component={ChaptersListScreen} />
        <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="InterestSelection" component={InterestSelectionScreen} />
        <Stack.Screen name="SubcategorySelection" component={SubcategorySelectionScreen} />
        <Stack.Screen name="Blog" component={BlogListScreen} />
        <Stack.Screen name="BlogDetail" component={BlogDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const authLoadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
});
