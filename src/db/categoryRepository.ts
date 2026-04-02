import { getCategories, saveCategories } from './database';
import { Category } from '../types';

export async function getAllCategories(): Promise<Category[]> {
  const categories = await getCategories();
  return categories.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function insertCategory(category: Category): Promise<void> {
  const categories = await getCategories();
  categories.push(category);
  await saveCategories(categories);
}

export async function updateCategory(category: Category): Promise<void> {
  const categories = await getCategories();
  const index = categories.findIndex(c => c.id === category.id);
  if (index !== -1) {
    categories[index] = category;
    await saveCategories(categories);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const categories = await getCategories();
  await saveCategories(categories.filter(c => c.id !== id));
}
