import { getDatabase } from './database';
import { Ingredient } from '../types';

export async function getIngredientsByRecipe(recipeId: string): Promise<Ingredient[]> {
  const db = await getDatabase();
  return db.getAllAsync<Ingredient>(
    'SELECT * FROM ingredients WHERE recipeId = ? ORDER BY sortOrder ASC',
    recipeId
  );
}

export async function replaceIngredients(recipeId: string, ingredients: Ingredient[]): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM ingredients WHERE recipeId = ?', recipeId);
  for (const ing of ingredients) {
    await db.runAsync(
      'INSERT INTO ingredients (id, recipeId, name, amount, unit, calories, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ing.id, ing.recipeId, ing.name, ing.amount, ing.unit, ing.calories, ing.sortOrder
    );
  }
}

export async function deleteIngredientsByRecipe(recipeId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM ingredients WHERE recipeId = ?', recipeId);
}
