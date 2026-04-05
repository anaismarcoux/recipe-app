import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/constants/colors';
import { useEffect } from 'react';

export default function App() {
  const [fontsLoaded] = useFonts({ Pacifico_400Regular });

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const base = '/recipe-app';
      if (!window.location.pathname.startsWith(base)) {
        window.history.replaceState(null, '', base + '/');
      }
      // Prevent website-like scrolling behavior on web
      const style = document.createElement('style');
      style.textContent = `
        html, body, #root {
          height: 100%;
          overflow: hidden;
          overscroll-behavior: none;
          -webkit-overflow-scrolling: touch;
          position: fixed;
          width: 100%;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <NavigationContainer>
          <RootNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </PaperProvider>
    </GestureHandlerRootView>
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
