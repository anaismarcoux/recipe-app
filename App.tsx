import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import RootNavigator from './src/navigation/RootNavigator';
import LoginScreen from './src/screens/LoginScreen';
import { useAuthStore } from './src/store/authStore';
import { colors } from './src/constants/colors';

export default function App() {
  const [fontsLoaded] = useFonts({ Pacifico_400Regular });
  const { session, loading: authLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const base = '/recipe-app';
      if (!window.location.pathname.startsWith(base)) {
        window.history.replaceState(null, '', base + '/');
      }
      // Lock viewport: no zoom, no bounce, no double-tap zoom
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content',
          'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
        );
      }
      const style = document.createElement('style');
      style.textContent = `
        html, body {
          margin: 0;
          overflow: hidden;
          overscroll-behavior: none;
          touch-action: pan-x pan-y;
          -webkit-text-size-adjust: 100%;
        }
        * { -webkit-tap-highlight-color: transparent; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (!fontsLoaded || authLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!session) {
    return (
      <PaperProvider>
        <LoginScreen />
        <StatusBar style="auto" />
      </PaperProvider>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <PaperProvider>
        <NavigationContainer>
          <RootNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </PaperProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
