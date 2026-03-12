import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, User } from '../services/supabase';
import { sendWelcomeLoginNotification } from '../services/scheduledNotifications';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasSelectedInterests: boolean;
  isNewSignup: boolean;
  pushToken: string | null;
  setPushToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, fullName: string, phone: string) => Promise<{ success: boolean; error?: string }>;
  loginWithOtp: (user: User, isSignup?: boolean) => void;
  loginWithGoogle: (idToken: string, isSignup?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  markInterestsSelected: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [hasSelectedInterests, setHasSelectedInterests] = useState(true);
  const [isNewSignup, setIsNewSignup] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedUser = await supabase.getStoredUser();
      const interestsFlag = await AsyncStorage.getItem('@interests_selected');
      setHasSelectedInterests(interestsFlag === 'true');
      if (storedUser) {
        setUser(storedUser);
        const refreshResult = await supabase.refreshSession();
        if (!refreshResult.success) {
          const freshUser = await supabase.getStoredUser();
          if (freshUser) setUser(freshUser);
        }
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const markInterestsSelected = () => {
    setHasSelectedInterests(true);
    setIsNewSignup(false);
  };

  const login = async (email: string, password: string) => {
    const result = await supabase.login(email, password);
    if (result.success && result.user) {
      setUser(result.user);
      sendWelcomeLoginNotification();
    }
    return { success: result.success, error: result.error };
  };

  const signup = async (email: string, password: string, fullName: string, phone: string) => {
    const result = await supabase.signup(email, password, fullName, phone);
    if (result.success && result.user) {
      setUser(result.user);
      setIsNewSignup(true);
      sendWelcomeLoginNotification();
    }
    return { success: result.success, error: result.error };
  };

  const loginWithOtp = (userData: User, isSignup: boolean = false) => {
    setUser(userData);
    if (isSignup) setIsNewSignup(true);
    sendWelcomeLoginNotification();
  };

  const loginWithGoogle = async (idToken: string, isSignup: boolean = false) => {
    const result = await supabase.signInWithGoogle(idToken);
    if (result.success && result.user) {
      setUser(result.user);
      if (isSignup) setIsNewSignup(true);
      sendWelcomeLoginNotification();
    }
    return { success: result.success, error: result.error };
  };

  const logout = async () => {
    if (pushToken) {
      await supabase.removePushToken(pushToken);
      setPushToken(null);
    }
    await supabase.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        hasSelectedInterests,
        isNewSignup,
        pushToken,
        setPushToken,
        login,
        signup,
        loginWithOtp,
        loginWithGoogle,
        logout,
        markInterestsSelected,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
