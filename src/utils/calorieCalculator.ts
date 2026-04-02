import { Ingredient } from '../types';

export function totalCalories(ingredients: Ingredient[]): number {
  return ingredients.reduce((sum, ing) => sum + ing.calories, 0);
}

export function caloriesPerUnit(total: number, yieldAmount: number | null): number | null {
  if (!yieldAmount || yieldAmount <= 0) return null;
  return Math.round(total / yieldAmount);
}

export function caloriesPer100g(total: number, totalWeightGrams: number | null): number | null {
  if (!totalWeightGrams || totalWeightGrams <= 0) return null;
  return Math.round((total / totalWeightGrams) * 100);
}
