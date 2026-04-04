import { supabase } from '../lib/supabase';
import { Category } from '../types';

function toCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

export async function getAllCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return (data || []).map(toCategory);
}

export async function insertCategory(category: Category): Promise<void> {
  const { error } = await supabase.from('categories').insert({
    id: category.id,
    name: category.name,
    emoji: category.emoji,
    sort_order: category.sortOrder,
    created_at: category.createdAt,
  });
  if (error) throw error;
}

export async function updateCategory(category: Category): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .update({
      name: category.name,
      emoji: category.emoji,
      sort_order: category.sortOrder,
    })
    .eq('id', category.id);
  if (error) throw error;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
