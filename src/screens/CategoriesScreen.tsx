import React, { useEffect, useCallback } from 'react';
import {
  StyleSheet, View, Text, ScrollView,
  TouchableOpacity, Image, ActivityIndicator, Alert, Platform,
} from 'react-native';
import { FAB } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { useCategoryStore } from '../store/categoryStore';
import { useRecipeStore } from '../store/recipeStore';
import { Category } from '../types';
import AddEditCategoryModal from '../components/AddEditCategoryModal';
import { uploadImage, isLocalUri } from '../lib/supabase';
import { generateId } from '../utils/uuid';
import { useState } from 'react';

const CARD_WIDTH = 150;

export default function CategoriesScreen({ navigation }: any) {
  const { categories, loading: catLoading, load, add, update, remove, moveUp, moveDown } = useCategoryStore();
  const { favorites, loadFavorites, toggleFavorite } = useRecipeStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    load();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const handleSave = async (name: string, emoji: string, imageUri: string | null) => {
    let finalImageUri = imageUri;
    if (imageUri && isLocalUri(imageUri)) {
      try {
        const path = `categories/${generateId()}.jpg`;
        finalImageUri = await uploadImage(imageUri, path);
      } catch { /* keep local */ }
    }
    if (editingCategory) {
      await update({ ...editingCategory, name, emoji, imageUri: finalImageUri });
    } else {
      await add(name, emoji, finalImageUri);
    }
    setModalVisible(false);
    setEditingCategory(null);
  };

  const handleDelete = () => {
    if (!editingCategory) return;
    if (Platform.OS === 'web') {
      if (confirm(`Delete "${editingCategory.name}" and all its recipes?`)) {
        remove(editingCategory.id);
        setModalVisible(false);
        setEditingCategory(null);
      }
    } else {
      Alert.alert('Delete Category', `Delete "${editingCategory.name}" and all its recipes?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            await remove(editingCategory.id);
            setModalVisible(false);
            setEditingCategory(null);
          },
        },
      ]);
    }
  };

  const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  if (catLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Category chips */}
        <Text style={styles.sectionLabel}>Categories</Text>
        <View style={styles.chipsWrap}>
          {sortedCategories.map((cat, idx) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.chip}
              onPress={() => navigation.navigate('CategoryDetail', { categoryId: cat.id, categoryName: cat.name })}
              onLongPress={() => { setEditingCategory(cat); setModalVisible(true); }}
            >
              <Text style={styles.chipText}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Favorites */}
        <Text style={styles.sectionLabel}>My Favorites</Text>
        {favorites.length === 0 ? (
          <View style={styles.emptyFavorites}>
            <Ionicons name="bookmark-outline" size={32} color={colors.border} />
            <Text style={styles.emptyText}>No favorites yet</Text>
            <Text style={styles.emptySubtext}>Open a recipe and tap the bookmark icon</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.favRow}
          >
            {favorites.map(recipe => (
              <TouchableOpacity
                key={recipe.id}
                style={styles.recipeCard}
                onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe.id })}
                activeOpacity={0.8}
              >
                {recipe.imageUri ? (
                  <Image source={{ uri: recipe.imageUri }} style={styles.recipeImage} />
                ) : (
                  <View style={styles.recipeImagePlaceholder}>
                    <Ionicons name="restaurant-outline" size={28} color={colors.textSecondary} />
                  </View>
                )}
                <TouchableOpacity
                  style={styles.bookmarkBtn}
                  onPress={() => toggleFavorite(recipe)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="bookmark" size={16} color={colors.primary} />
                </TouchableOpacity>
                <View style={styles.recipeInfo}>
                  <Text style={styles.recipeTitle} numberOfLines={2}>{recipe.title}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

      </ScrollView>

      <FAB icon="plus" style={styles.fab} onPress={() => { setEditingCategory(null); setModalVisible(true); }} color="#fff" />

      <AddEditCategoryModal
        visible={modalVisible}
        category={editingCategory}
        onSave={handleSave}
        onDelete={editingCategory ? handleDelete : undefined}
        onClose={() => { setModalVisible(false); setEditingCategory(null); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: 90,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyFavorites: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  favRow: {
    gap: 12,
    paddingBottom: 4,
    paddingRight: 4,
  },
  recipeCard: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  recipeImage: {
    width: CARD_WIDTH,
    height: 120,
  },
  recipeImagePlaceholder: {
    width: CARD_WIDTH,
    height: 120,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarkBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeInfo: {
    padding: 8,
  },
  recipeTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: colors.primary,
    borderRadius: 28,
  },
});
