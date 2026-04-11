import React, { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { useRecipeStore } from '../store/recipeStore';
import RecipeCard from '../components/RecipeCard';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';

export default function AllRecipesScreen({ navigation }: any) {
  const { recipes, loading, loadAll } = useRecipeStore();
  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [])
  );

  const filtered = (search.trim()
    ? recipes.filter(r => r.title.toLowerCase().includes(search.toLowerCase()))
    : recipes
  ).sort((a, b) => a.title.localeCompare(b.title));

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchBar value={search} onChangeText={setSearch} />
      </View>
      {filtered.length === 0 && !loading ? (
        <EmptyState
          message={search ? 'No recipes found' : 'No recipes yet'}
          submessage={search ? 'Try a different search term' : 'Add recipes from a category'}
        />
      ) : (
        <FlatList
          data={filtered}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  list: {
    padding: 16,
  },
});
