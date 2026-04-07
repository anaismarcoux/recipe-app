import { Ingredient } from '../types';

const FRACTIONS: [number, string][] = [
  [0.125, '1/8'], [0.25, '1/4'], [0.333, '1/3'], [0.375, '3/8'],
  [0.5, '1/2'], [0.625, '5/8'], [0.667, '2/3'], [0.75, '3/4'], [0.875, '7/8'],
];

export function toFraction(value: number): string {
  if (value <= 0) return '0';
  const whole = Math.floor(value);
  const decimal = value - whole;
  if (decimal < 0.05) return String(whole || '0');
  const match = FRACTIONS.find(([d]) => Math.abs(decimal - d) < 0.05);
  if (!match) return String(value);
  const frac = match[1];
  return whole > 0 ? `${whole} ${frac}` : frac;
}

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
