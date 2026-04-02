import { getRecipes, saveRecipes, getIngredients, saveIngredients } from './database';
import { Recipe } from '../types';

export async function getAllRecipes(): Promise<Recipe[]> {
  const recipes = await getRecipes();
  return recipes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getRecipesByCategory(categoryId: string): Promise<Recipe[]> {
  const recipes = await getRecipes();
  return recipes
    .filter(r => r.categoryId === categoryId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const recipes = await getRecipes();
  return recipes.find(r => r.id === id) || null;
}

export async function insertRecipe(recipe: Recipe): Promise<void> {
  const recipes = await getRecipes();
  recipes.push(recipe);
  await saveRecipes(recipes);
}

export async function updateRecipe(recipe: Recipe): Promise<void> {
  const recipes = await getRecipes();
  const index = recipes.findIndex(r => r.id === recipe.id);
  if (index !== -1) {
    recipes[index] = recipe;
    await saveRecipes(recipes);
  }
}

export async function deleteRecipe(id: string): Promise<void> {
  const recipes = await getRecipes();
  await saveRecipes(recipes.filter(r => r.id !== id));
  // Also delete associated ingredients
  const ingredients = await getIngredients();
  await saveIngredients(ingredients.filter(ing => ing.recipeId !== id));
}
