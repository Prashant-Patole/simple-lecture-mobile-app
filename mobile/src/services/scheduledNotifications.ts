import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

const WELCOME_SHOWN_KEY = 'welcome_notification_shown';
const LOGIN_WELCOME_LAST_KEY = 'login_welcome_last_sent';
const MOTIVATIONAL_NOTIF_ID = 'motivational_recurring';
const LOGIN_WELCOME_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const BLOG_MORNING_NOTIF_ID = 'blog_daily_morning';

function isExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

const motivationalMessages = [
  { title: 'Dream Big, Start Small', body: 'Every expert was once a beginner. Open a lesson and take the first step today.' },
  { title: 'Your Future Self Will Thank You', body: 'The effort you put in today shapes the success of tomorrow. Keep learning!' },
  { title: 'Greatness Takes Patience', body: 'Rome was not built in a day, but they were laying bricks every hour. Lay yours now.' },
  { title: 'Unlock Your Potential', body: 'You have abilities you have not discovered yet. A new lesson could reveal them.' },
  { title: 'Small Steps, Big Results', body: 'Just 15 minutes of focused study can change your understanding of a subject.' },
  { title: 'Discipline Beats Motivation', body: 'Motivation gets you started, but discipline keeps you going. Show up today.' },
  { title: 'Curiosity Is Your Superpower', body: 'The most successful people never stop asking questions. What will you learn today?' },
  { title: 'Be Unstoppable', body: 'Obstacles are what you see when you take your eyes off the goal. Stay focused!' },
  { title: 'Invest In Your Mind', body: 'The best investment you can make is in yourself. Knowledge pays the best dividends.' },
  { title: 'You Are Closer Than You Think', body: 'Every lesson completed brings you one step closer to mastery. Keep going!' },
  { title: 'Turn Minutes Into Mastery', body: 'Success is the sum of small efforts repeated day after day. Start now.' },
  { title: 'Rise Above Average', body: 'Average people watch TV. Extraordinary people learn. Which one are you today?' },
  { title: 'The Power of Consistency', body: 'A river cuts through rock not because of its power, but because of its persistence.' },
  { title: 'Feed Your Ambition', body: 'Your brain is hungry for knowledge. Feed it with a new lecture today.' },
  { title: 'Make Today Count', body: 'You will never get this day back. Make it a day of growth and learning.' },
  { title: 'Knowledge Is Freedom', body: 'Education is the most powerful weapon you can use to change the world.' },
  { title: 'Challenge Yourself', body: 'Growth happens outside your comfort zone. Try a difficult topic today.' },
  { title: 'The Secret to Success', body: 'Successful people do what unsuccessful people are not willing to do. Study now.' },
  { title: 'Build Your Empire', body: 'Every subject you master is a brick in the empire of your career. Keep building.' },
  { title: 'Stay Hungry, Stay Curious', body: 'The day you stop learning is the day you stop growing. Never stop.' },
  { title: 'Your Brain Deserves This', body: 'Give your mind the workout it deserves. A quick lesson can make a huge difference.' },
  { title: 'Winners Never Quit', body: 'The difference between a winner and a loser is that a winner tries one more time.' },
  { title: 'Focus Creates Champions', body: 'Concentrate all your thoughts on the task at hand. Focused effort wins every time.' },
  { title: 'Believe In Your Journey', body: 'Trust the process. Every hour you study brings you closer to your dreams.' },
  { title: 'Ignite Your Passion', body: 'Passion fueled by knowledge is unstoppable. Discover something exciting today.' },
  { title: 'Learn Like a Pro', body: 'Professionals practice daily. Make learning your daily habit and watch yourself grow.' },
  { title: 'Break Your Limits', body: 'The only limits that exist are the ones you place on yourself. Push beyond them.' },
  { title: 'Wisdom Awaits You', body: 'Behind every great achievement is a person who never stopped learning. Be that person.' },
  { title: 'Your Time Is Now', body: 'Stop waiting for the perfect moment. The best time to learn is right now.' },
  { title: 'Think Big, Act Bold', body: 'Big dreams require bold actions. Take one bold step toward your goal today.' },
  { title: 'Excellence Is a Habit', body: 'We are what we repeatedly do. Excellence is not an act but a habit.' },
  { title: 'Embrace the Struggle', body: 'Difficult roads often lead to beautiful destinations. Keep pushing through.' },
  { title: 'Shine Brighter Every Day', body: 'You are a work in progress, and every lesson makes you shine a little brighter.' },
  { title: 'Own Your Success', body: 'Nobody will hand you success. You have to earn it one lesson at a time.' },
  { title: 'The World Needs You', body: 'The world needs educated, passionate people. Your learning matters more than you know.' },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function ensureNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Simple Lecture',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2BBD6E',
      sound: 'default',
    });
    console.log('[Notifications] Android channel created');
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  console.log('[Notifications] Permission status:', finalStatus);
  return finalStatus === 'granted';
}

export async function setupAndScheduleNotifications(): Promise<void> {
  console.log('[Notifications] ========== FULL NOTIFICATION SETUP START ==========');
  console.log('[Notifications] Platform:', Platform.OS);
  console.log('[Notifications] isExpoGo:', isExpoGo());
  try {
    const granted = await requestNotificationPermissions();
    console.log('[Notifications] Permission granted:', granted);
    if (!granted) {
      console.log('[Notifications] ABORTED: Permission not granted');
      console.log('[Notifications] ========== FULL NOTIFICATION SETUP END ==========');
      return;
    }

    await ensureNotificationChannel();
    console.log('[Notifications] Channel ensured');

    const beforeCancel = await Notifications.getAllScheduledNotificationsAsync();
    console.log('[Notifications] Notifications before cancel:', beforeCancel.length);
    beforeCancel.forEach(n => console.log(`[Notifications]   Before: id=${n.identifier}, title="${n.content.title}"`));

    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[Notifications] Cleared all previously scheduled notifications');

    if (isExpoGo()) {
      console.log('[Notifications] Running in Expo Go — skipping repeating notifications');
      console.log('[Notifications] ========== FULL NOTIFICATION SETUP END ==========');
      return;
    }

    console.log('[Notifications] Step 1/3: Scheduling motivational notifications...');
    await scheduleMotivationalNotifications();
    console.log('[Notifications] Step 2/3: Sending first open welcome...');
    await sendFirstOpenWelcome();
    console.log('[Notifications] Step 3/3: Scheduling daily blog notifications...');
    await scheduleBlogNotifications();
    console.log('[Notifications] All notifications scheduled successfully');

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log('[Notifications] Total scheduled after setup:', scheduled.length);
    scheduled.forEach(n => console.log(`[Notifications]   Final: id=${n.identifier}, title="${n.content.title}", trigger=${JSON.stringify(n.trigger)}`));
    console.log('[Notifications] ========== FULL NOTIFICATION SETUP END ==========');
  } catch (error) {
    console.error('[Notifications] FATAL Setup failed:', error);
    console.log('[Notifications] ========== FULL NOTIFICATION SETUP END (ERROR) ==========');
  }
}

export async function scheduleMotivationalNotifications(): Promise<void> {
  if (isExpoGo()) {
    console.log('[Notifications] Skipping repeating notifications in Expo Go (not supported)');
    return;
  }

  try {
    const msg = pickRandom(motivationalMessages);
    await Notifications.scheduleNotificationAsync({
      identifier: MOTIVATIONAL_NOTIF_ID,
      content: {
        title: msg.title,
        body: msg.body,
        sound: 'default',
        data: { type: 'motivation', screen: 'MainTabs' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 18000,
        repeats: true,
      },
    });
    console.log('[Notifications] Scheduled motivational notification every 5 hours');
  } catch (error) {
    console.error('[Notifications] Failed to schedule motivational notifications:', error);
  }
}

async function sendFirstOpenWelcome(): Promise<void> {
  try {
    const alreadyShown = await AsyncStorage.getItem(WELCOME_SHOWN_KEY);
    if (alreadyShown) {
      console.log('[Notifications] Welcome notification already shown');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Welcome to Simple Lecture!',
        body: 'We are thrilled to have you here. Explore courses, watch AI-powered lectures, and start your learning journey today.',
        sound: 'default',
        data: { type: 'welcome', screen: 'MainTabs' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 30,
        repeats: false,
      },
    });

    await AsyncStorage.setItem(WELCOME_SHOWN_KEY, 'true');
    console.log('[Notifications] Welcome notification scheduled for first open (30s delay)');
  } catch (error) {
    console.error('[Notifications] Failed to send welcome notification:', error);
  }
}

export async function sendWelcomeLoginNotification(): Promise<void> {
  if (isExpoGo()) {
    console.log('[Notifications] Skipping login welcome in Expo Go');
    return;
  }

  try {
    const lastSent = await AsyncStorage.getItem(LOGIN_WELCOME_LAST_KEY);
    if (lastSent) {
      const elapsed = Date.now() - parseInt(lastSent, 10);
      if (elapsed < LOGIN_WELCOME_COOLDOWN_MS) {
        console.log('[Notifications] Login welcome skipped (cooldown active)');
        return;
      }
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Welcome Back to Simple Lecture!',
        body: 'You are all set! Dive into your courses, track your progress, and achieve greatness. Your learning journey continues now.',
        sound: 'default',
        data: { type: 'welcome_login', screen: 'MainTabs' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 30,
        repeats: false,
      },
    });

    await AsyncStorage.setItem(LOGIN_WELCOME_LAST_KEY, Date.now().toString());
    console.log('[Notifications] Login welcome notification scheduled (30s delay)');
  } catch (error) {
    console.error('[Notifications] Failed to send login welcome notification:', error);
  }
}

const blogMessages = [
  {
    title: 'Simple Lecture — Fresh Blog Alert!',
    body: 'Our team has published new content on Simple Lecture!\n\nFrom exam strategies to subject deep-dives, our blog is packed with insights that can give you an edge.\n\nTap to explore the latest articles and level up your preparation.',
  },
  {
    title: 'Simple Lecture — New Reads Await You!',
    body: 'Knowledge never sleeps, and neither does Simple Lecture!\n\nCheck out our latest blog posts covering study tips, career guidance, and smart learning techniques.\n\nStay curious, stay ahead. Tap to read now.',
  },
  {
    title: 'Simple Lecture — Blog Update!',
    body: 'Your daily dose of learning wisdom is here!\n\nDiscover expert-written articles on exam preparation, subject mastery, and proven study methods.\n\nDon\'t miss out — tap to read the latest from Simple Lecture.',
  },
  {
    title: 'Simple Lecture — Learn Beyond Lectures!',
    body: 'Great learners read beyond the classroom!\n\nOur blog features curated articles on study hacks, success stories, and in-depth subject guides written by experts.\n\nTap to fuel your learning journey today.',
  },
  {
    title: 'Simple Lecture — Wisdom Worth Reading!',
    body: 'The best students combine courses with reading!\n\nOur blog has fresh articles on exam tips, career insights, and strategies that top scorers swear by.\n\nGive yourself an advantage — tap to read now.',
  },
  {
    title: 'Simple Lecture — Blog Spotlight!',
    body: 'Spotlight on learning! New articles are live on Simple Lecture.\n\nWhether it is conquering JEE, mastering NEET, or acing board exams, our blog has got you covered.\n\nTap to discover what is new today.',
  },
  {
    title: 'Simple Lecture — Your Reading Corner!',
    body: 'Take a break from videos and explore our blog!\n\nFresh perspectives on education, study planning, and achieving your academic goals await you.\n\nTap to read and grow a little wiser today.',
  },
  {
    title: 'Simple Lecture — Stay Informed!',
    body: 'Stay informed, stay inspired with Simple Lecture!\n\nOur latest blog posts bring you actionable study strategies, motivational insights, and expert advice.\n\nTap to explore and keep your preparation sharp.',
  },
];

export async function scheduleBlogNotifications(): Promise<void> {
  if (isExpoGo()) {
    console.log('[BlogNotif] Skipping daily blog notifications in Expo Go (repeating triggers not supported)');
    return;
  }

  try {
    const morningMsg = pickRandom(blogMessages);

    console.log('[BlogNotif] Scheduling daily blog notification at 6:40 AM...');
    await Notifications.scheduleNotificationAsync({
      identifier: BLOG_MORNING_NOTIF_ID,
      content: {
        title: morningMsg.title,
        body: morningMsg.body,
        sound: 'default',
        ...(Platform.OS === 'android' ? { channelId: 'default' } : {}),
        data: { type: 'new_blog', screen: 'Blog' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 6,
        minute: 40,
        repeats: true,
        ...(Platform.OS === 'android' ? { channelId: 'default' } : {}),
      },
    });
    console.log('[BlogNotif] Daily blog notification scheduled (6:40 AM)');
  } catch (error) {
    console.error('[BlogNotif] Failed to schedule daily blog notifications:', error);
  }
}

export async function cancelDailyNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('[Notifications] All notifications cancelled');
}

