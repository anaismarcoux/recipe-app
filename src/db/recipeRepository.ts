import { supabase } from '../lib/supabase';
import { Recipe } from '../types';

function toRecipe(row: any): Recipe {
  return {
    id: row.id,
    categoryId: row.category_id,
    title: row.title,
    imageUri: row.image_uri,
    about: row.about,
    steps: row.steps || '',
    notes: row.notes,
    yieldAmount: row.yield_amount,
    yieldUnit: row.yield_unit,
    totalWeightGrams: row.total_weight_grams,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');
  return session.user.id;
}

export async function getAllRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(toRecipe);
}

export async function getRecipesByCategory(categoryId: string): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('category_id', categoryId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(toRecipe);
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? toRecipe(data) : null;
}

export async function insertRecipe(recipe: Recipe): Promise<void> {
  const userId = await getUserId();
  const { error } = await supabase.from('recipes').insert({
    id: recipe.id,
    user_id: userId,
    category_id: recipe.categoryId,
    title: recipe.title,
    image_uri: recipe.imageUri,
    about: recipe.about,
    steps: recipe.steps,
    notes: recipe.notes,
    yield_amount: recipe.yieldAmount,
    yield_unit: recipe.yieldUnit,
    total_weight_grams: recipe.totalWeightGrams,
    created_at: recipe.createdAt,
    updated_at: recipe.updatedAt,
  });
  if (error) throw error;
}

export async function updateRecipe(recipe: Recipe): Promise<void> {
  const { error } = await supabase
    .from('recipes')
    .update({
      category_id: recipe.categoryId,
      title: recipe.title,
      image_uri: recipe.imageUri,
      about: recipe.about,
      steps: recipe.steps,
      notes: recipe.notes,
      yield_amount: recipe.yieldAmount,
      yield_unit: recipe.yieldUnit,
      total_weight_grams: recipe.totalWeightGrams,
      updated_at: recipe.updatedAt,
    })
    .eq('id', recipe.id);
  if (error) throw error;
}

export async function deleteRecipe(id: string): Promise<void> {
  // Ingredients are cascade-deleted by foreign key
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
