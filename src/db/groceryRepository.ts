import { supabase } from '../lib/supabase';
import { GroceryCategory, GroceryItem } from '../types';

function toCategory(row: any): GroceryCategory {
  return { id: row.id, name: row.name, sortOrder: row.sort_order };
}

function toItem(row: any): GroceryItem {
  return {
    id: row.id,
    categoryId: row.category_id,
    name: row.name,
    needed: row.needed,
    taken: row.taken,
    sortOrder: row.sort_order,
  };
}

// --- Categories ---

export async function getGroceryCategories(): Promise<GroceryCategory[]> {
  const { data, error } = await supabase
    .from('grocery_categories')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return (data || []).map(toCategory);
}

export async function insertGroceryCategory(cat: GroceryCategory): Promise<void> {
  const { error } = await supabase.from('grocery_categories').insert({
    id: cat.id,
    name: cat.name,
    sort_order: cat.sortOrder,
  });
  if (error) throw error;
}

export async function updateGroceryCategory(cat: GroceryCategory): Promise<void> {
  const { error } = await supabase
    .from('grocery_categories')
    .update({ name: cat.name, sort_order: cat.sortOrder })
    .eq('id', cat.id);
  if (error) throw error;
}

export async function deleteGroceryCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('grocery_categories')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// --- Items ---

export async function getGroceryItems(): Promise<GroceryItem[]> {
  const { data, error } = await supabase
    .from('grocery_items')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return (data || []).map(toItem);
}

export async function insertGroceryItem(item: GroceryItem): Promise<void> {
  const { error } = await supabase.from('grocery_items').insert({
    id: item.id,
    category_id: item.categoryId,
    name: item.name,
    needed: item.needed,
    taken: item.taken,
    sort_order: item.sortOrder,
  });
  if (error) throw error;
}

export async function updateGroceryItem(item: GroceryItem): Promise<void> {
  const { error } = await supabase
    .from('grocery_items')
    .update({
      name: item.name,
      needed: item.needed,
      taken: item.taken,
      sort_order: item.sortOrder,
      category_id: item.categoryId,
    })
    .eq('id', item.id);
  if (error) throw error;
}

export async function deleteGroceryItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('grocery_items')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function resetAllItems(): Promise<void> {
  const { error } = await supabase
    .from('grocery_items')
    .update({ needed: false, taken: false })
    .neq('id', '');
  if (error) throw error;
}
