import { create } from 'zustand';
import { Recipe, Ingredient, RecipeWithIngredients } from '../types';
import * as recipeRepo from '../db/recipeRepository';
import * as ingredientRepo from '../db/ingredientRepository';
import { generateId } from '../utils/uuid';

interface RecipeStore {
  recipes: Recipe[];
  loading: boolean;
  loadAll: () => Promise<void>;
  loadByCategory: (categoryId: string) => Promise<void>;
  getWithIngredients: (id: string) => Promise<RecipeWithIngredients | null>;
  add: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>, ingredients: Omit<Ingredient, 'id' | 'recipeId'>[]) => Promise<void>;
  update: (recipe: Recipe, ingredients: Omit<Ingredient, 'id' | 'recipeId'>[]) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useRecipeStore = create<RecipeStore>((set, get) => ({
  recipes: [],
  loading: true,

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
    const recipe: Recipe = {
      ...recipeData,
      id: recipeId,
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
    const updated = { ...recipe, updatedAt: new Date().toISOString() };
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
    await recipeRepo.deleteRecipe(id);
    set({ recipes: get().recipes.filter(r => r.id !== id) });
  },
}));
