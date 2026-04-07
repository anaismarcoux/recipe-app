import { supabase } from '../lib/supabase';
import { Ingredient } from '../types';

function toIngredient(row: any): Ingredient {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    name: row.name,
    amount: row.amount,
    unit: row.unit,
    grams: row.grams ?? null,
    calories: row.calories,
    sortOrder: row.sort_order,
  };
}

export async function getIngredientsByRecipe(recipeId: string): Promise<Ingredient[]> {
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .eq('recipe_id', recipeId)
    .order('sort_order');
  if (error) throw error;
  return (data || []).map(toIngredient);
}

export async function replaceIngredients(
  recipeId: string,
  newIngredients: Ingredient[],
): Promise<void> {
  // Delete existing ingredients for this recipe
  const { error: deleteError } = await supabase
    .from('ingredients')
    .delete()
    .eq('recipe_id', recipeId);
  if (deleteError) throw deleteError;

  if (newIngredients.length === 0) return;

  // Insert new ingredients
  const rows = newIngredients.map((ing) => ({
    id: ing.id,
    recipe_id: ing.recipeId,
    name: ing.name,
    amount: ing.amount,
    unit: ing.unit,
    grams: ing.grams,
    calories: ing.calories,
    sort_order: ing.sortOrder,
  }));
  const { error: insertError } = await supabase.from('ingredients').insert(rows);
  if (insertError) throw insertError;
}

export async function deleteIngredientsByRecipe(recipeId: string): Promise<void> {
  const { error } = await supabase
    .from('ingredients')
    .delete()
    .eq('recipe_id', recipeId);
  if (error) throw error;
}
