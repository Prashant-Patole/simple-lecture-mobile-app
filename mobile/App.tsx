import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, Text as RNText, TextInput as RNTextInput, StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import {
  Lora_400Regular,
  Lora_600SemiBold,
  Lora_700Bold,
} from '@expo-google-fonts/lora';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import * as Notifications from 'expo-notifications';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { setupAndScheduleNotifications } from './src/services/scheduledNotifications';
import AppNavigator, { navigationRef } from './src/navigation/AppNavigator';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const FONT_WEIGHT_MAP: Record<string, string> = {
  '100': 'Inter_400Regular',
  '200': 'Inter_400Regular',
  '300': 'Inter_400Regular',
  '400': 'Inter_400Regular',
  'normal': 'Inter_400Regular',
  '500': 'Inter_500Medium',
  '600': 'Inter_600SemiBold',
  '700': 'Inter_700Bold',
  'bold': 'Inter_700Bold',
  '800': 'Inter_800ExtraBold',
  '900': 'Inter_800ExtraBold',
};

function getRenderAndTarget(Component: any): { render: Function; target: any } | null {
  if ((Component as any).type?.render) {
    return { render: (Component as any).type.render, target: (Component as any).type };
  }
  if ((Component as any).render) {
    return { render: (Component as any).render, target: Component };
  }
  return null;
}

function applyGlobalFonts() {
  if (!(RNText as any).__fontPatched) {
    const textInfo = getRenderAndTarget(RNText);
    if (textInfo) {
      (RNText as any).__fontPatched = true;
      const originalRender = textInfo.render;
      textInfo.target.render = function(props: any, ref: any) {
        const flatStyle = StyleSheet.flatten(props.style) || {};
        const { fontFamily, fontWeight } = flatStyle as any;

        if (fontFamily && fontFamily !== 'System') {
          return originalRender.call(this, props, ref);
        }

        const mappedFont = fontWeight
          ? (FONT_WEIGHT_MAP[String(fontWeight)] || 'Inter_400Regular')
          : 'Inter_400Regular';

        return originalRender.call(this, {
          ...props,
          style: [props.style, { fontFamily: mappedFont }],
        }, ref);
      };
    }
  }

  if (!(RNTextInput as any).__fontPatched) {
    const inputInfo = getRenderAndTarget(RNTextInput);
    if (inputInfo) {
      (RNTextInput as any).__fontPatched = true;
      const originalRender = inputInfo.render;
      inputInfo.target.render = function(props: any, ref: any) {
        const flatStyle = StyleSheet.flatten(props.style) || {};
        const { fontFamily, fontWeight } = flatStyle as any;

        if (fontFamily && fontFamily !== 'System') {
          return originalRender.call(this, props, ref);
        }

        const mappedFont = FONT_WEIGHT_MAP[String(fontWeight || '400')] || 'Inter_400Regular';
        return originalRender.call(this, {
          ...props,
          style: [props.style, { fontFamily: mappedFont }],
        }, ref);
      };
    }
  }
}

const queryClient = new QueryClient();

function NotificationScheduler() {
  useEffect(() => {
    console.log('[App] Setting up notifications on app open...');
    setupAndScheduleNotifications();
  }, []);

  return null;
}

function NotificationTapHandler() {
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      handleNotificationNavigation(data as Record<string, any>);
    });

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        const data = response.notification.request.content.data;
        setTimeout(() => {
          handleNotificationNavigation(data as Record<string, any>);
        }, 1000);
      }
    });

    return () => subscription.remove();
  }, []);

  const handleNotificationNavigation = (data: Record<string, any>) => {
    const nav = navigationRef.current;
    if (!nav?.isReady()) return;

    if (data?.screen === 'BlogDetail' && data?.blogSlug) {
      try {
        nav.navigate('BlogDetail' as any, { slug: data.blogSlug });
      } catch {
        nav.navigate('Blog' as any);
      }
    } else if (data?.screen) {
      try {
        nav.navigate(data.screen as any, data.params || {});
      } catch {
        nav.navigate('Notifications' as any);
      }
    } else {
      nav.navigate('Notifications' as any);
    }
  };

  return null;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    Lora_400Regular,
    Lora_600SemiBold,
    Lora_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2BBD6E' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  applyGlobalFonts();

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <StatusBar style="light" />
            <NotificationScheduler />
            <NotificationTapHandler />
            <AppNavigator />
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
