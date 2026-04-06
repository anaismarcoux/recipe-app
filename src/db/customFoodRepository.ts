import { supabase } from '../lib/supabase';
import { FoodEntry } from '../data/foodDatabase';

export interface CustomFood {
  id: string;
  name: string;
  category: string;
  calPer100g: number;
  gramsPerCup: number | null;
}

function toCustomFood(row: any): CustomFood {
  return {
    id: row.id,
    name: row.name,
    category: row.category || 'Custom',
    calPer100g: row.cal_per_100g,
    gramsPerCup: row.grams_per_cup,
  };
}

export async function getAllCustomFoods(): Promise<CustomFood[]> {
  const { data, error } = await supabase
    .from('custom_foods')
    .select('*')
    .order('name');
  if (error) throw error;
  return (data || []).map(toCustomFood);
}

export async function insertCustomFood(food: CustomFood): Promise<void> {
  const { error } = await supabase.from('custom_foods').insert({
    id: food.id,
    name: food.name,
    category: food.category,
    cal_per_100g: food.calPer100g,
    grams_per_cup: food.gramsPerCup,
  });
  if (error) throw error;
}

export async function deleteCustomFood(id: string): Promise<void> {
  const { error } = await supabase
    .from('custom_foods')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export function customFoodToFoodEntry(food: CustomFood): FoodEntry {
  return {
    name: food.name,
    category: food.category,
    calPer100g: food.calPer100g,
    gramsPerCup: food.gramsPerCup,
  };
}
