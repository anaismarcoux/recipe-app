import { getDatabase } from './database';
import { Category } from '../types';

export async function getAllCategories(): Promise<Category[]> {
  const db = await getDatabase();
  return db.getAllAsync<Category>('SELECT * FROM categories ORDER BY sortOrder ASC');
}

export async function insertCategory(category: Category): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO categories (id, name, emoji, sortOrder, createdAt) VALUES (?, ?, ?, ?, ?)',
    category.id, category.name, category.emoji, category.sortOrder, category.createdAt
  );
}

export async function updateCategory(category: Category): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE categories SET name = ?, emoji = ?, sortOrder = ? WHERE id = ?',
    category.name, category.emoji, category.sortOrder, category.id
  );
}

export async function deleteCategory(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM categories WHERE id = ?', id);
}
