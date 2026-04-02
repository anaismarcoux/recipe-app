import React, { useEffect, useCallback, useState } from 'react';
import { StyleSheet, View, FlatList, Alert } from 'react-native';
import { FAB } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { useRecipeStore } from '../store/recipeStore';
import RecipeCard from '../components/RecipeCard';
import EmptyState from '../components/EmptyState';

export default function CategoryDetailScreen({ route, navigation }: any) {
  const { categoryId, categoryName } = route.params;
  const { recipes, loading, loadByCategory, remove } = useRecipeStore();

  useEffect(() => {
    navigation.setOptions({ title: categoryName });
  }, [categoryName]);

  useFocusEffect(
    useCallback(() => {
      loadByCategory(categoryId);
    }, [categoryId])
  );

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Delete Recipe', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => remove(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      {recipes.length === 0 && !loading ? (
        <EmptyState
          message="No recipes yet"
          submessage='Tap "+" to add your first recipe'
        />
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item}
              onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
            />
          )}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditRecipe', { categoryId })}
        color="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: colors.primary,
    borderRadius: 28,
  },
});
