# Simple Lecture - E-Learning Mobile App

## Overview
Simple Lecture is an e-learning mobile application designed to provide an engaging and comprehensive educational experience. It aims to offer students a platform for course browsing, personalized learning paths, detailed progress tracking, and interactive AI-powered assistance. The project's vision is to deliver a cutting-edge educational tool that integrates advanced features for a modern learning environment.

## User Preferences
I prefer iterative development with clear communication on progress. Please ask before making any major architectural changes or introducing new libraries. Ensure all solutions are mobile-first and responsive.

## System Architecture

### UI/UX Decisions
The application employs a mobile-first design featuring a consistent green/mint theme (`#2BBD6E`) with gradients and shadows. It utilizes Shadcn UI (Radix UI primitives) with Tailwind CSS for consistent components and Framer Motion for smooth transitions. Key UI elements include a fixed bottom navigation, a slide-out sidebar, rounded cards, gradient headers, and elevated search bars. Typography uses Lora for headings and Inter for body text, drawing inspiration from a Udemy-style editorial look. Course cards are structured with thumbnails, titles, descriptions, ratings, prices, and optional bestseller badges.

### Technical Implementations
The mobile app is built with Expo SDK 52 (React 18.3.1, React Native 0.76.9) for stable Expo Go compatibility. The web frontend uses React, TypeScript, Wouter for routing, and TanStack Query for state management and data fetching. The backend is an Express.js server integrated with a PostgreSQL database via Drizzle ORM. The application also leverages `expo-file-system` for efficient video caching.

### Feature Specifications
The application includes:
- **Onboarding & Authentication**: Multi-step onboarding with various login methods (Phone OTP, Email OTP, Email+Password, Google Sign-In), OTP verification, signup flows, and a forgot password process. Google Sign-In uses `expo-auth-session` with Google OAuth. User interests are selected post-signup for personalized content.
- **Course Management**: A 3-level category hierarchy, detailed course views, and enrollment via a cart system.
- **Personalized Learning**: Dashboards, learning paths, and progress tracking functionalities.
- **Interactive Learning**: Topic details with video lessons, resources, quizzes, and an AI Teaching Assistant featuring rich slides, diagrams, and audio narration.
- **Assessments**: Configurable MCQ tests, Daily Practice Problems (DPP) with AI grading for subjective questions, and a Results tab for performance history.
- **Learning Content Tabs**: Standardized tabs per document (Classes, AI, Questions, Assignments, DPP, PYQ's, Results, Doubts) with specific content and functionalities like read-only PYQ's with LaTeX support.
- **User Profile & Cart**: Comprehensive profile management, settings, and an e-commerce cart.
- **Recordings**: A "My Recordings" section with search, filters, progress tracking, quality selection, and HLS streaming.
- **Detailed Progress**: Extensive student data overview across multiple tabs (Overview, My Progress, My Tests, My Attendance, My Timetable, My Courses, AI & Learning, My Engagement).
- **Navigation**: A fixed bottom navigation bar for ease of access.
- **Doubts Tab (AI Chat)**: An AI-powered Q&A chat for subject-specific questions, supporting multi-turn conversations and markdown rendering.
- **Forum System**: A Q&A-style discussion platform with categories, posts, replies, upvoting, and AI-generated reply badges.
- **Blog**: Blog listing screen (featured post + card grid) and blog detail screen (hero image, table of contents, sections with drop cap/dividers/gradient placeholders, keyword pills, share/copy, course CTA). Data from `blog_posts` Supabase table via `getBlogPosts()` and `getBlogPostBySlug()`. Accessible from sidebar. Screens: `BlogListScreen.tsx`, `BlogDetailScreen.tsx`.
- **Language Top-Up System**: Allows purchase of regional language access for AI lectures, supporting 13 Indian languages plus English, integrated with Razorpay.
- **GST (18%)**: Applied on top of course prices in the Cart/Checkout flow. GST utilities (`calculateGST`, `GST_RATE`, `calculateTotalWithGST`) are in `mobile/src/services/payment.ts`. Cart sends GST-inclusive amount to Razorpay. Language Top-Up shows GST in UI but actual amount is server-calculated by edge function.

### System Design Choices
- **Data Flow**: Frontend interacts with APIs, with some screens directly leveraging Supabase APIs.
- **Performance**: Utilizes parallel data fetching and optimized rendering techniques.
- **Robustness**: Includes comprehensive error handling, loading, and empty states.
- **Media Handling**: CDN proxy for image and video rendering, with specific handling for course thumbnails and beat images.
- **AI Lecture Player Architecture**: A 4-layer rendering system for synchronized content and AI avatar narration, featuring background, content, avatar, and video overlay layers.
- **Portrait Mode Layout**: Unified design with a header bar, 16:9 stage (content, avatar, video overlay), controls bar, and a quick actions grid.
- **Content Display Pattern**: Single-beat display for content/example sections (swap pattern) and progressive accumulation for summary sections.
- **Timing System**: Avatar video acts as the master clock for all content reveals.
- **Section Types**: Seven distinct section types (INTRO, SUMMARY, CONTENT, EXAMPLE, QUIZ, MEMORY, RECAP) with specific choreographies.
- **Teach/Show Pattern**: Alternating phases for avatar narration ("TEACH") and full-screen animations ("SHOW").
- **Media URL Resolution (CDN Proxy)**: All student-side media is resolved via a Supabase edge function CDN proxy.
- **Avatar Selection Priority**: A defined priority system for resolving avatar video URLs based on language, section fields, and default patterns.
- **Real-Time Chroma Keying**: Employs a WebView + HTML5 Canvas for real-time green screen removal with an HSL-based algorithm, including edge softening and spill suppression.
- **Video Preloading**: Preloads initial sections' avatar and beat videos with background downloading for subsequent sections, including retry mechanisms and cache cleanup.
- **Beat Video Playback**: Uses async cache resolution with disk fallback and remote URL option.
- **Avatar Playback**: Avatar videos use remote HTTPS URLs for WebView, while beat videos use cached file URIs via Expo-AV.
- **Avatar Buffering Overlay**: Displays a loading overlay during avatar buffering with safety timeouts.
- **Push Notifications**: Uses `expo-notifications` for all local notifications — no server-side push. Three notification types: (1) Motivational — repeating every 5 hours with random inspirational messages, (2) Welcome — first-open and login welcome with 30s delay, (3) Blog — pre-scheduled local notifications based on `notification_time` column in `blog_posts` table. Blog notifications are scheduled at exact future times using TIME_INTERVAL triggers, with AsyncStorage dedup to avoid re-scheduling. On app open, `setupAndScheduleNotifications()` clears all scheduled notifications and reschedules everything fresh. On foreground return, only blog notifications are re-checked via AppState listener. Tapping a blog notification navigates to `BlogDetail` screen with the post slug. Notification icon: `mobile/assets/notification-icon.png` (white silhouette, RGBA PNG32, 96x96px). Android channel named "Simple Lecture". Server-side push pipeline (Edge Function, PostgreSQL triggers, push token registration) has been disabled. Edge Function code kept in repo as reference at `mobile/supabase-functions/send-blog-notification.ts`.

## External Dependencies

- **Database**: PostgreSQL
- **Backend Framework**: Express.js
- **UI Libraries**: Shadcn UI, Tailwind CSS
- **Animation Library**: Framer Motion
- **State Management/Data Fetching**: TanStack Query
- **Video Playback**: Expo-AV, Vimeo
- **Text-to-Speech**: Sarvam TTS
- **Backend-as-a-Service**: Supabase
- **Payment Gateway**: Razorpay