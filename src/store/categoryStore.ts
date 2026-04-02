import { create } from 'zustand';
import { Category } from '../types';
import * as categoryRepo from '../db/categoryRepository';
import { initDatabase } from '../db/database';
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
    await initDatabase();
    const categories = await categoryRepo.getAllCategories();
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
    await categoryRepo.deleteCategory(id);
    set({ categories: get().categories.filter(c => c.id !== id) });
  },
}));
