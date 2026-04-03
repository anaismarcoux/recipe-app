export interface Category {
  id: string;
  name: string;
  emoji: string;
  sortOrder: number;
  createdAt: string;
}

export interface Recipe {
  id: string;
  categoryId: string;
  title: string;
  imageUri: string | null;
  steps: string;

  notes: string | null;
  yieldAmount: number | null;
  yieldUnit: string | null;
  totalWeightGrams: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Ingredient {
  id: string;
  recipeId: string;
  name: string;
  amount: number;
  unit: string;
  calories: number;
  sortOrder: number;
}

export interface RecipeWithIngredients extends Recipe {
  ingredients: Ingredient[];
}
