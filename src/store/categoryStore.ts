import { create } from 'zustand';
import { Category } from '../types';
import * as categoryRepo from '../db/categoryRepository';
import { generateId } from '../utils/uuid';

interface CategoryStore {
  categories: Category[];
  loading: boolean;
  load: () => Promise<void>;
  add: (name: string, emoji: string) => Promise<void>;
  update: (category: Category) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  loading: true,

  load: async () => {
    let categories = await categoryRepo.getAllCategories();
    if (categories.length === 0) {
      const now = new Date().toISOString();
      const defaults: Category[] = [
        { id: generateId(), name: 'Breakfast', emoji: '\u{1F963}', sortOrder: 0, createdAt: now },
        { id: generateId(), name: 'Soups', emoji: '\u{1F372}', sortOrder: 1, createdAt: now },
        { id: generateId(), name: 'Curries', emoji: '\u{1F35B}', sortOrder: 2, createdAt: now },
        { id: generateId(), name: 'Desserts', emoji: '\u{1F370}', sortOrder: 3, createdAt: now },
      ];
      for (const cat of defaults) {
        await categoryRepo.insertCategory(cat);
      }
      categories = defaults;
    }
    set({ categories, loading: false });
  },

  add: async (name: string, emoji: string) => {
    const category: Category = {
      id: generateId(),
      name,
      emoji,
      sortOrder: get().categories.length,
      createdAt: new Date().toISOString(),
    };
    await categoryRepo.insertCategory(category);
    set({ categories: [...get().categories, category] });
  },

  update: async (category: Category) => {
    await categoryRepo.updateCategory(category);
    set({
      categories: get().categories.map(c => (c.id === category.id ? category : c)),
    });
  },

  remove: async (id: string) => {
    // Recipes + ingredients are cascade-deleted by Supabase foreign keys
    await categoryRepo.deleteCategory(id);
    set({ categories: get().categories.filter(c => c.id !== id) });
  },
}));
