import { getIngredients, saveIngredients } from './database';
import { Ingredient } from '../types';

export async function getIngredientsByRecipe(recipeId: string): Promise<Ingredient[]> {
  const ingredients = await getIngredients();
  return ingredients
    .filter(ing => ing.recipeId === recipeId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function replaceIngredients(recipeId: string, newIngredients: Ingredient[]): Promise<void> {
  const ingredients = await getIngredients();
  const filtered = ingredients.filter(ing => ing.recipeId !== recipeId);
  await saveIngredients([...filtered, ...newIngredients]);
}

export async function deleteIngredientsByRecipe(recipeId: string): Promise<void> {
  const ingredients = await getIngredients();
  await saveIngredients(ingredients.filter(ing => ing.recipeId !== recipeId));
}
