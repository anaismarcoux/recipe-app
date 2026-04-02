import AsyncStorage from '@react-native-async-storage/async-storage';
import { Category, Recipe, Ingredient } from '../types';

const CATEGORIES_KEY = '@recipebook_categories';
const RECIPES_KEY = '@recipebook_recipes';
const INGREDIENTS_KEY = '@recipebook_ingredients';

export async function getCategories(): Promise<Category[]> {
  const data = await AsyncStorage.getItem(CATEGORIES_KEY);
  return data ? JSON.parse(data) : [];
}

export async function saveCategories(categories: Category[]): Promise<void> {
  await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

export async function getRecipes(): Promise<Recipe[]> {
  const data = await AsyncStorage.getItem(RECIPES_KEY);
  return data ? JSON.parse(data) : [];
}

export async function saveRecipes(recipes: Recipe[]): Promise<void> {
  await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(recipes));
}

export async function getIngredients(): Promise<Ingredient[]> {
  const data = await AsyncStorage.getItem(INGREDIENTS_KEY);
  return data ? JSON.parse(data) : [];
}

export async function saveIngredients(ingredients: Ingredient[]): Promise<void> {
  await AsyncStorage.setItem(INGREDIENTS_KEY, JSON.stringify(ingredients));
}

export async function initDatabase(): Promise<void> {
  const categories = await getCategories();
  if (categories.length === 0) {
    const now = new Date().toISOString();
    const defaults: Category[] = [
      { id: 'default-breakfast', name: 'Breakfast', emoji: '🥣', sortOrder: 0, createdAt: now },
      { id: 'default-soups', name: 'Soups', emoji: '🍲', sortOrder: 1, createdAt: now },
      { id: 'default-curries', name: 'Curries', emoji: '🍛', sortOrder: 2, createdAt: now },
      { id: 'default-desserts', name: 'Desserts', emoji: '🍰', sortOrder: 3, createdAt: now },
    ];
    await saveCategories(defaults);
  }
}
