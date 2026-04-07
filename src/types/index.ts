export interface Category {
  id: string;
  name: string;
  emoji: string;
  imageUri: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface Recipe {
  id: string;
  categoryId: string;
  title: string;
  imageUri: string | null;
  about: string | null;
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
  grams: number | null;
  calories: number;
  sortOrder: number;
}

export interface RecipeWithIngredients extends Recipe {
  ingredients: Ingredient[];
}

export interface GroceryCategory {
  id: string;
  name: string;
  sortOrder: number;
}

export interface GroceryItem {
  id: string;
  categoryId: string;
  name: string;
  needed: boolean;
  taken: boolean;
  sortOrder: number;
}
