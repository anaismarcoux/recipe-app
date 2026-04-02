import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AllRecipesScreen from '../screens/AllRecipesScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import AddEditRecipeScreen from '../screens/AddEditRecipeScreen';
import { colors } from '../constants/colors';

const Stack = createNativeStackNavigator();

export default function AllRecipesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text },
      }}
    >
      <Stack.Screen name="AllRecipes" component={AllRecipesScreen} options={{ title: 'All Recipes' }} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: 'Recipe' }} />
      <Stack.Screen name="AddEditRecipe" component={AddEditRecipeScreen} options={{ title: 'New Recipe' }} />
    </Stack.Navigator>
  );
}
