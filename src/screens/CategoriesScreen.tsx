import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet, View, Text, ScrollView,
  TouchableOpacity, Image, ActivityIndicator, Alert
} from 'react-native';
import { FAB } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { useCategoryStore } from '../store/categoryStore';
import { Category, Recipe } from '../types';
import AddEditCategoryModal from '../components/AddEditCategoryModal';
import EmptyState from '../components/EmptyState';
import * as recipeRepo from '../db/recipeRepository';
import { uploadImage, isLocalUri } from '../lib/supabase';
import { generateId } from '../utils/uuid';

const CARD_WIDTH = 160;

export default function CategoriesScreen({ navigation }: any) {
  const { categories, loading: catLoading, load, add, update, remove, moveUp, moveDown } = useCategoryStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [recipesByCategory, setRecipesByCategory] = useState<Record<string, Recipe[]>>({});

  const loadRecipes = useCallback(async (cats: Category[]) => {
    if (cats.length === 0) return;
    const map: Record<string, Recipe[]> = {};
    await Promise.all(
      cats.map(async (cat) => {
        map[cat.id] = await recipeRepo.getRecipesByCategory(cat.id);
      })
    );
    setRecipesByCategory(map);
  }, []);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    loadRecipes(categories);
  }, [categories]);

  useFocusEffect(
    useCallback(() => {
      loadRecipes(categories);
    }, [categories])
  );

  const handleSave = async (name: string, emoji: string, imageUri: string | null) => {
    let finalImageUri = imageUri;
    if (imageUri && isLocalUri(imageUri)) {
      try {
        const path = `categories/${generateId()}.jpg`;
        finalImageUri = await uploadImage(imageUri, path);
      } catch {
        // Keep local URI as fallback
      }
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
    Alert.alert(
      'Delete Category',
      `Delete "${editingCategory.name}" and all its recipes?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await remove(editingCategory.id);
            setModalVisible(false);
            setEditingCategory(null);
          },
        },
      ]
    );
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setModalVisible(true);
  };

  const openCreate = () => {
    setEditingCategory(null);
    setModalVisible(true);
  };

  const handleChangeImage = async (recipe: Recipe) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      let newImageUri = result.assets[0].uri;
      if (isLocalUri(newImageUri)) {
        try {
          const path = `recipes/${recipe.id}.jpg`;
          newImageUri = await uploadImage(newImageUri, path);
        } catch {
          // Keep local URI as fallback
        }
      }
      const updated: Recipe = {
        ...recipe,
        imageUri: newImageUri,
        updatedAt: new Date().toISOString(),
      };
      await recipeRepo.updateRecipe(updated);
      setRecipesByCategory(prev => ({
        ...prev,
        [recipe.categoryId]: (prev[recipe.categoryId] || []).map(r =>
          r.id === recipe.id ? updated : r
        ),
      }));
    }
  };

  if (catLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (categories.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          message="No categories yet"
          submessage='Tap "+" to create your first category'
        />
        <FAB icon="plus" style={styles.fab} onPress={openCreate} color="#fff" />
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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {categories.map(category => {
          const recipes = recipesByCategory[category.id] || [];
          return (
            <View key={category.id} style={styles.section}>
              {reorderMode ? (
                <View style={styles.sectionHeaderReorder}>
                  <Text style={[styles.sectionTitle, { flex: 1 }]}>{category.name}</Text>
                  <TouchableOpacity onPress={() => moveUp(category.id)} style={styles.arrowBtn}>
                    <Ionicons name="chevron-up" size={22} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => moveDown(category.id)} style={styles.arrowBtn}>
                    <Ionicons name="chevron-down" size={22} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.sectionHeader}
                  onPress={() =>
                    navigation.navigate('CategoryDetail', {
                      categoryId: category.id,
                      categoryName: category.name,
                    })
                  }
                  onLongPress={() => openEdit(category)}
                >
                  <Text style={styles.sectionTitle}>{category.name}</Text>
                </TouchableOpacity>
              )}

              {category.imageUri && (
                <TouchableOpacity
                  style={styles.coverImageWrap}
                  onPress={() =>
                    navigation.navigate('CategoryDetail', {
                      categoryId: category.id,
                      categoryName: category.name,
                    })
                  }
                  onLongPress={() => openEdit(category)}
                  activeOpacity={0.9}
                >
                  <Image source={{ uri: category.imageUri }} style={styles.coverImage} />
                </TouchableOpacity>
              )}

              {recipes.length === 0 ? (
                <View style={styles.emptyRow}>
                  <Text style={styles.emptyRowText}>No recipes yet — tap the category to add one</Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.recipeRow}
                >
                  {recipes.map(recipe => (
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
                          <Text style={styles.placeholderText}>No Photo</Text>
                        </View>
                      )}
                      <TouchableOpacity
                        style={styles.cameraButton}
                        onPress={() => handleChangeImage(recipe)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="camera" size={14} color="#fff" />
                      </TouchableOpacity>
                      <View style={styles.recipeInfo}>
                        <Text style={styles.recipeTitle} numberOfLines={2}>
                          {recipe.title}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          );
        })}
      </ScrollView>

      {reorderMode ? (
        <FAB icon="check" style={styles.fab} onPress={() => setReorderMode(false)} color="#fff" />
      ) : (
        <>
          <FAB icon="plus" style={styles.fab} onPress={openCreate} color="#fff" />
          <TouchableOpacity style={styles.reorderFab} onPress={() => setReorderMode(true)}>
            <Ionicons name="swap-vertical" size={22} color="#fff" />
          </TouchableOpacity>
        </>
      )}

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
    paddingBottom: 80,
    paddingTop: 12,
    paddingHorizontal: 12,
    gap: 14,
  },
  section: {
    backgroundColor: '#ECECEC',
    borderRadius: 16,
    overflow: 'hidden',
    paddingBottom: 4,
  },
  sectionHeaderReorder: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  arrowBtn: {
    padding: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  coverImageWrap: {
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: 160,
  },
  emptyRow: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyRowText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
  },
  recipeRow: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
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
  placeholderText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  cameraButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
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
  reorderFab: {
    position: 'absolute',
    right: 24,
    bottom: 80,
    backgroundColor: colors.textSecondary,
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
