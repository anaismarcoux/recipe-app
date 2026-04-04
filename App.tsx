import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import RootNavigator from './src/navigation/RootNavigator';
import AuthScreen from './src/screens/AuthScreen';
import { useAuthStore } from './src/store/authStore';
import { colors } from './src/constants/colors';

export default function App() {
  const { session, loading: authLoading, initialize } = useAuthStore();
  const [fontsLoaded] = useFonts({ Pacifico_400Regular });

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const base = '/recipe-app';
      if (!window.location.pathname.startsWith(base)) {
        window.history.replaceState(null, '', base + '/');
      }
    }
  });

  if (authLoading || !fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!session) {
    return (
      <PaperProvider>
        <AuthScreen />
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
