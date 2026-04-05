import { create } from 'zustand';
import { Category } from '../types';
import * as categoryRepo from '../db/categoryRepository';
import { generateId } from '../utils/uuid';

interface CategoryStore {
  categories: Category[];
  loading: boolean;
  load: () => Promise<void>;
  add: (name: string, emoji: string, imageUri?: string | null) => Promise<void>;
  update: (category: Category) => Promise<void>;
  remove: (id: string) => Promise<void>;
  reorder: (data: Category[]) => Promise<void>;
  moveUp: (id: string) => Promise<void>;
  moveDown: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  categories: [],
  loading: true,

  load: async () => {
    let categories = await categoryRepo.getAllCategories();
    if (categories.length === 0) {
      const now = new Date().toISOString();
      const defaults: Category[] = [
        { id: generateId(), name: 'Breakfast', emoji: '\u{1F963}', imageUri: null, sortOrder: 0, createdAt: now },
        { id: generateId(), name: 'Soups', emoji: '\u{1F372}', imageUri: null, sortOrder: 1, createdAt: now },
        { id: generateId(), name: 'Curries', emoji: '\u{1F35B}', imageUri: null, sortOrder: 2, createdAt: now },
        { id: generateId(), name: 'Desserts', emoji: '\u{1F370}', imageUri: null, sortOrder: 3, createdAt: now },
      ];
      for (const cat of defaults) {
        await categoryRepo.insertCategory(cat);
      }
      categories = defaults;
    }
    set({ categories, loading: false });
  },

  add: async (name: string, emoji: string, imageUri?: string | null) => {
    const category: Category = {
      id: generateId(),
      name,
      emoji,
      imageUri: imageUri || null,
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

  reorder: async (data: Category[]) => {
    const updated = data.map((cat, i) => ({ ...cat, sortOrder: i }));
    await Promise.all(updated.map(cat => categoryRepo.updateCategory(cat)));
    set({ categories: updated });
  },

  moveUp: async (id: string) => {
    const cats = [...get().categories].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = cats.findIndex(c => c.id === id);
    if (idx <= 0) return;
    const prev = cats[idx - 1];
    const curr = cats[idx];
    const updatedCurr = { ...curr, sortOrder: prev.sortOrder };
    const updatedPrev = { ...prev, sortOrder: curr.sortOrder };
    await Promise.all([categoryRepo.updateCategory(updatedCurr), categoryRepo.updateCategory(updatedPrev)]);
    set({ categories: get().categories.map(c => c.id === curr.id ? updatedCurr : c.id === prev.id ? updatedPrev : c) });
  },

  moveDown: async (id: string) => {
    const cats = [...get().categories].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = cats.findIndex(c => c.id === id);
    if (idx < 0 || idx >= cats.length - 1) return;
    const next = cats[idx + 1];
    const curr = cats[idx];
    const updatedCurr = { ...curr, sortOrder: next.sortOrder };
    const updatedNext = { ...next, sortOrder: curr.sortOrder };
    await Promise.all([categoryRepo.updateCategory(updatedCurr), categoryRepo.updateCategory(updatedNext)]);
    set({ categories: get().categories.map(c => c.id === curr.id ? updatedCurr : c.id === next.id ? updatedNext : c) });
  },
}));
