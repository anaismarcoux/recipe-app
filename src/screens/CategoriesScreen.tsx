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
  const { categories, loading: catLoading, load, add, update, remove, reorder, moveUp, moveDown } = useCategoryStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [recipesByCategory, setRecipesByCategory] = useState<Record<string, Recipe[]>>({});
  const [movingCategoryId, setMovingCategoryId] = useState<string | null>(null);

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

  const handleMoveCategory = (targetId: string) => {
    if (!movingCategoryId || movingCategoryId === targetId) {
      setMovingCategoryId(null);
      return;
    }
    const sorted = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
    const fromIdx = sorted.findIndex(c => c.id === movingCategoryId);
    const toIdx = sorted.findIndex(c => c.id === targetId);
    if (fromIdx < 0 || toIdx < 0) return;
    const moved = sorted.splice(fromIdx, 1)[0];
    sorted.splice(toIdx, 0, moved);
    reorder(sorted);
    setMovingCategoryId(null);
  };

  const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

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
      {movingCategoryId && (
        <View style={styles.movingBanner}>
          <Text style={styles.movingBannerText}>
            Tap a category to move it there
          </Text>
          <TouchableOpacity onPress={() => setMovingCategoryId(null)}>
            <Text style={styles.movingCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.scroll}>
        {sortedCategories.map((category, idx) => {
          const recipes = recipesByCategory[category.id] || [];
          const isMoving = movingCategoryId === category.id;
          const isTarget = movingCategoryId && movingCategoryId !== category.id;

          return (
            <View key={category.id}>
              {/* Drop target indicator above this category */}
              {isTarget && (
                <TouchableOpacity
                  style={styles.dropTarget}
                  onPress={() => handleMoveCategory(category.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.dropLine} />
                </TouchableOpacity>
              )}

              <View style={[styles.section, isMoving && styles.sectionMoving]}>
                <TouchableOpacity
                  style={styles.sectionHeader}
                  onPress={() => {
                    if (movingCategoryId) {
                      handleMoveCategory(category.id);
                    } else {
                      navigation.navigate('CategoryDetail', {
                        categoryId: category.id,
                        categoryName: category.name,
                      });
                    }
                  }}
                  onLongPress={() => {
                    if (!movingCategoryId) setMovingCategoryId(category.id);
                  }}
                  delayLongPress={300}
                >
                  {isMoving && (
                    <Ionicons name="move" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                  )}
                  <Text style={[styles.sectionTitle, { flex: 1 }]}>{category.name}</Text>
                  {!movingCategoryId && (
                    <View style={styles.headerActions}>
                      <TouchableOpacity
                        onPress={() => moveUp(category.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.moveBtn}
                      >
                        <Ionicons name="chevron-up" size={20} color={idx === 0 ? colors.border : colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => moveDown(category.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.moveBtn}
                      >
                        <Ionicons name="chevron-down" size={20} color={idx === sortedCategories.length - 1 ? colors.border : colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => openEdit(category)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>

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
            </View>
          );
        })}
      </ScrollView>

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
  movingBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  movingBannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  movingCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  scroll: {
    paddingBottom: 80,
    paddingTop: 12,
    paddingHorizontal: 12,
  },
  dropTarget: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  dropLine: {
    height: 3,
    width: '80%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  section: {
    backgroundColor: '#ECECEC',
    borderRadius: 16,
    overflow: 'hidden',
    paddingBottom: 4,
    marginBottom: 14,
  },
  sectionMoving: {
    opacity: 0.6,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moveBtn: {
    padding: 2,
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
});
