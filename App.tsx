import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import { initDatabase } from './src/db/database';
import { colors } from './src/constants/colors';

const linking: any = {
  prefixes: [],
  config: {
    screens: {
      CategoriesTab: {
        screens: {
          Categories: '',
          CategoryDetail: 'category/:categoryId',
          RecipeDetail: 'recipe/:recipeId',
          AddEditRecipe: 'add-recipe',
        },
      },
      AllRecipesTab: {
        screens: {
          AllRecipes: 'all',
          RecipeDetail: 'all/recipe/:recipeId',
          AddEditRecipe: 'all/add-recipe',
        },
      },
    },
  },
};

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initDatabase().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const content = (
    <PaperProvider>
      <NavigationContainer linking={linking}>
        <RootNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </PaperProvider>
  );

  if (Platform.OS === 'web') {
    return <View style={{ flex: 1 }}>{content}</View>;
  }

  const { GestureHandlerRootView } = require('react-native-gesture-handler');
  return <GestureHandlerRootView style={{ flex: 1 }}>{content}</GestureHandlerRootView>;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
  },
});
