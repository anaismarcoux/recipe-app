import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import RootNavigator from './src/navigation/RootNavigator';
import { initDatabase } from './src/db/database';
import { colors } from './src/constants/colors';

const linking: any = {
  prefixes: [],
  config: {
    screens: {
      CategoriesTab: {
        screens: {
          Categories: 'recipe-app',
          CategoryDetail: 'recipe-app/category/:categoryId',
          RecipeDetail: 'recipe-app/recipe/:recipeId',
          AddEditRecipe: 'recipe-app/add-recipe',
        },
      },
      AllRecipesTab: {
        screens: {
          AllRecipes: 'recipe-app/all',
          RecipeDetail: 'recipe-app/all/recipe/:recipeId',
          AddEditRecipe: 'recipe-app/all/add-recipe',
        },
      },
    },
  },
};

export default function App() {
  const [ready, setReady] = useState(false);
  const [fontsLoaded] = useFonts({ Pacifico_400Regular });

  useEffect(() => {
    initDatabase().then(() => setReady(true));
  }, []);

  if (!ready || !fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <PaperProvider>
        <NavigationContainer linking={linking}>
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
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
  },
});
