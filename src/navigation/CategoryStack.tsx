import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import CategoriesScreen from '../screens/CategoriesScreen';
import CategoryDetailScreen from '../screens/CategoryDetailScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import AddEditRecipeScreen from '../screens/AddEditRecipeScreen';
import { colors } from '../constants/colors';
import { useAuthStore } from '../store/authStore';

const Stack = createNativeStackNavigator();

export default function CategoryStack() {
  const signOut = useAuthStore(s => s.signOut);

  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text },
      }}
    >
      <Stack.Screen
        name="Categories"
        component={CategoriesScreen}
        options={{
          headerTitle: () => (
            <Text style={{ fontFamily: 'Pacifico_400Regular', fontSize: 28, color: colors.text }}>
              P&#233;pin's cookbook
            </Text>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={signOut} style={{ marginRight: 8 }}>
              <Ionicons name="log-out-outline" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen name="CategoryDetail" component={CategoryDetailScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: 'Recipe' }} />
      <Stack.Screen name="AddEditRecipe" component={AddEditRecipeScreen} options={{ title: 'New Recipe' }} />
    </Stack.Navigator>
  );
}
