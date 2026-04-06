import { create } from 'zustand';
import { FoodEntry } from '../data/foodDatabase';
import { CustomFood, getAllCustomFoods, insertCustomFood, deleteCustomFood, customFoodToFoodEntry } from '../db/customFoodRepository';
import { generateId } from '../utils/uuid';

interface CustomFoodStore {
  foods: CustomFood[];
  loaded: boolean;
  load: () => Promise<void>;
  add: (name: string, calPer100g: number, gramsPerCup: number | null) => Promise<FoodEntry>;
  remove: (id: string) => Promise<void>;
  searchCustom: (query: string, limit?: number) => FoodEntry[];
}

export const useCustomFoodStore = create<CustomFoodStore>((set, get) => ({
  foods: [],
  loaded: false,

  load: async () => {
    if (get().loaded) return;
    const foods = await getAllCustomFoods();
    set({ foods, loaded: true });
  },

  add: async (name: string, calPer100g: number, gramsPerCup: number | null) => {
    const food: CustomFood = {
      id: generateId(),
      name,
      category: 'Custom',
      calPer100g,
      gramsPerCup,
    };
    await insertCustomFood(food);
    set({ foods: [...get().foods, food] });
    return customFoodToFoodEntry(food);
  },

  remove: async (id: string) => {
    await deleteCustomFood(id);
    set({ foods: get().foods.filter(f => f.id !== id) });
  },

  searchCustom: (query: string, limit = 8): FoodEntry[] => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return get().foods
      .filter(f => f.name.toLowerCase().includes(q))
      .slice(0, limit)
      .map(customFoodToFoodEntry);
  },
}));
