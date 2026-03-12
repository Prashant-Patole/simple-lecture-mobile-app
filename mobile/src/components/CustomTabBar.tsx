import { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../constants/theme';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const TAB_ICONS: Record<string, { outline: string; filled: string }> = {
  Home: { outline: 'home-outline', filled: 'home' },
  MyCourses: { outline: 'book-outline', filled: 'book' },
  Dashboard: { outline: 'grid-outline', filled: 'grid' },
  Profile: { outline: 'person-outline', filled: 'person' },
};

interface AnimatedTabProps {
  isFocused: boolean;
  iconName: string;
  onPress: () => void;
  onLongPress: () => void;
}

function AnimatedTab({ isFocused, iconName, onPress, onLongPress }: AnimatedTabProps) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isFocused ? -4 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isFocused, translateY]);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabButton}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          isFocused && styles.iconContainerActive,
          { transform: [{ translateY }] },
        ]}
      >
        <Ionicons
          name={iconName as any}
          size={24}
          color={isFocused ? colors.white : 'rgba(255,255,255,0.5)'}
        />
      </Animated.View>
      {isFocused && <View style={styles.indicator} />}
    </TouchableOpacity>
  );
}

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, '#4ADE80', '#22C55E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, { paddingBottom: Math.max(insets.bottom, 6) }]}
      >
        <View style={styles.tabsContainer}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            const icons = TAB_ICONS[route.name] || { outline: 'help-outline', filled: 'help' };
            const iconName = isFocused ? icons.filled : icons.outline;

            return (
              <AnimatedTab
                key={route.key}
                isFocused={isFocused}
                iconName={iconName}
                onPress={onPress}
                onLongPress={onLongPress}
              />
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  gradient: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.white,
    marginTop: 4,
  },
});
