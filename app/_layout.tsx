import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

import { AppProvider } from '@/context/AppContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LogBox, Platform } from 'react-native';

LogBox.ignoreLogs([
  'THREE.WARNING: Multiple instances of Three.js being imported.',
  'EXGL: gl.pixelStorei()',
  'THREE.WebGLRenderer: EXT_color_buffer_float',
]);

// ... (imports)

function RootLayoutNav() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme(); // Get colorScheme here for ThemeProvider

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (user && inAuthGroup) {
      // Redirect to the home page if already logged in
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
      return null; // Or a splash screen
  }

  return (
    <SafeAreaProvider>
      <AppProvider>
        {/* AppProvider Mounted */}
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />

            <Stack.Screen name="completed" options={{ title: '完了したタスク', headerBackTitle: '戻る' }} />
            <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
      ...(Platform.OS === 'web' ? {} : MaterialIcons.font),
  });

  const isReady = loaded;

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <AuthProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
            <RootLayoutNav />
        </GestureHandlerRootView>
    </AuthProvider>
  );
}
