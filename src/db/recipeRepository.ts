import { getDatabase } from './database';
import { Recipe } from '../types';

export async function getAllRecipes(): Promise<Recipe[]> {
  const db = await getDatabase();
  return db.getAllAsync<Recipe>('SELECT * FROM recipes ORDER BY updatedAt DESC');
}

export async function getRecipesByCategory(categoryId: string): Promise<Recipe[]> {
  const db = await getDatabase();
  return db.getAllAsync<Recipe>(
    'SELECT * FROM recipes WHERE categoryId = ? ORDER BY updatedAt DESC',
    categoryId
  );
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Recipe>('SELECT * FROM recipes WHERE id = ?', id);
}

export async function insertRecipe(recipe: Recipe): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO recipes (id, categoryId, title, imageUri, steps, cookTimeMinutes, notes, yieldAmount, yieldUnit, totalWeightGrams, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    recipe.id, recipe.categoryId, recipe.title, recipe.imageUri, recipe.steps,
    recipe.cookTimeMinutes, recipe.notes, recipe.yieldAmount, recipe.yieldUnit,
    recipe.totalWeightGrams, recipe.createdAt, recipe.updatedAt
  );
}

export async function updateRecipe(recipe: Recipe): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE recipes SET categoryId = ?, title = ?, imageUri = ?, steps = ?, cookTimeMinutes = ?,
     notes = ?, yieldAmount = ?, yieldUnit = ?, totalWeightGrams = ?, updatedAt = ?
     WHERE id = ?`,
    recipe.categoryId, recipe.title, recipe.imageUri, recipe.steps, recipe.cookTimeMinutes,
    recipe.notes, recipe.yieldAmount, recipe.yieldUnit, recipe.totalWeightGrams,
    recipe.updatedAt, recipe.id
  );
}

export async function deleteRecipe(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM recipes WHERE id = ?', id);
}
