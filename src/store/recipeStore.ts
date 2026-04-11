import { create } from 'zustand';
import { Recipe, Ingredient, RecipeWithIngredients } from '../types';
import * as recipeRepo from '../db/recipeRepository';
import { getFavoriteRecipes, toggleFavorite as toggleFavoriteRepo } from '../db/recipeRepository';
import * as ingredientRepo from '../db/ingredientRepository';
import { generateId } from '../utils/uuid';
import { uploadImage, isLocalUri } from '../lib/supabase';

interface RecipeStore {
  recipes: Recipe[];
  loading: boolean;
  loadAll: () => Promise<void>;
  loadByCategory: (categoryId: string) => Promise<void>;
  getWithIngredients: (id: string) => Promise<RecipeWithIngredients | null>;
  favorites: Recipe[];
  loadFavorites: () => Promise<void>;
  toggleFavorite: (recipe: Recipe) => Promise<void>;
  add: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>, ingredients: Omit<Ingredient, 'id' | 'recipeId'>[]) => Promise<void>;
  update: (recipe: Recipe, ingredients: Omit<Ingredient, 'id' | 'recipeId'>[]) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useRecipeStore = create<RecipeStore>((set, get) => ({
  recipes: [],
  favorites: [],
  loading: true,

  loadFavorites: async () => {
    const favorites = await getFavoriteRecipes();
    set({ favorites });
  },

  toggleFavorite: async (recipe: Recipe) => {
    const newVal = !recipe.isFavorite;
    await toggleFavoriteRepo(recipe.id, newVal);
    const updated = { ...recipe, isFavorite: newVal };
    set({
      recipes: get().recipes.map(r => r.id === recipe.id ? updated : r),
      favorites: newVal
        ? [...get().favorites.filter(r => r.id !== recipe.id), updated]
        : get().favorites.filter(r => r.id !== recipe.id),
    });
  },

  loadAll: async () => {
    const recipes = await recipeRepo.getAllRecipes();
    set({ recipes, loading: false });
  },

  loadByCategory: async (categoryId: string) => {
    const recipes = await recipeRepo.getRecipesByCategory(categoryId);
    set({ recipes, loading: false });
  },

  getWithIngredients: async (id: string) => {
    const recipe = await recipeRepo.getRecipeById(id);
    if (!recipe) return null;
    const ingredients = await ingredientRepo.getIngredientsByRecipe(id);
    return { ...recipe, ingredients };
  },

  add: async (recipeData, ingredientData) => {
    const now = new Date().toISOString();
    const recipeId = generateId();

    let imageUri = recipeData.imageUri;
    if (imageUri && isLocalUri(imageUri)) {
      try {
        imageUri = await uploadImage(imageUri, `recipes/${recipeId}.jpg`);
      } catch { /* keep local */ }
    }

    const recipe: Recipe = {
      ...recipeData,
      imageUri,
      id: recipeId,
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
    };
    await recipeRepo.insertRecipe(recipe);

    const ingredients: Ingredient[] = ingredientData.map((ing, i) => ({
      ...ing,
      id: generateId(),
      recipeId,
      sortOrder: i,
    }));
    await ingredientRepo.replaceIngredients(recipeId, ingredients);

    set({ recipes: [recipe, ...get().recipes] });
  },

  update: async (recipe, ingredientData) => {
    let imageUri = recipe.imageUri;
    if (imageUri && isLocalUri(imageUri)) {
      try {
        imageUri = await uploadImage(imageUri, `recipes/${recipe.id}.jpg`);
      } catch { /* keep local */ }
    }
    const updated = { ...recipe, imageUri, updatedAt: new Date().toISOString() };
    await recipeRepo.updateRecipe(updated);

    const ingredients: Ingredient[] = ingredientData.map((ing, i) => ({
      ...ing,
      id: generateId(),
      recipeId: recipe.id,
      sortOrder: i,
    }));
    await ingredientRepo.replaceIngredients(recipe.id, ingredients);

    set({
      recipes: get().recipes.map(r => (r.id === recipe.id ? updated : r)),
    });
  },

  remove: async (id: string) => {
    // Ingredients are cascade-deleted by Supabase foreign keys
    await recipeRepo.deleteRecipe(id);
    set({ recipes: get().recipes.filter(r => r.id !== id) });
  },
}));
