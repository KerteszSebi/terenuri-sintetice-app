import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AuthProvider, useAuth } from '@/auth/auth-context';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import LoginScreen from '@/components/login-screen';

SplashScreen.preventAutoHideAsync();

function AuthenticatedContent() {
  const { isLoggedIn, login } = useAuth();

  return (
    <>
      <AnimatedSplashOverlay />
      {isLoggedIn === null ? null : isLoggedIn ? (
        <AppTabs />
      ) : (
        <LoginScreen onLogin={login} />
      )}
    </>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <AuthenticatedContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
