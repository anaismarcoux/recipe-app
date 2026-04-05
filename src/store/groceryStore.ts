import { create } from 'zustand';
import { GroceryCategory, GroceryItem } from '../types';
import * as repo from '../db/groceryRepository';
import { generateId } from '../utils/uuid';

interface GroceryStore {
  categories: GroceryCategory[];
  items: GroceryItem[];
  loading: boolean;
  load: () => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  updateCategory: (cat: GroceryCategory) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  addItem: (categoryId: string, name: string) => Promise<void>;
  updateItem: (item: GroceryItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  cycleItem: (item: GroceryItem) => Promise<void>;
  resetWeek: () => Promise<void>;
}

export const useGroceryStore = create<GroceryStore>((set, get) => ({
  categories: [],
  items: [],
  loading: true,

  load: async () => {
    const [categories, items] = await Promise.all([
      repo.getGroceryCategories(),
      repo.getGroceryItems(),
    ]);
    set({ categories, items, loading: false });
  },

  addCategory: async (name: string) => {
    const cat: GroceryCategory = {
      id: generateId(),
      name,
      sortOrder: get().categories.length,
    };
    await repo.insertGroceryCategory(cat);
    set({ categories: [...get().categories, cat] });
  },

  updateCategory: async (cat: GroceryCategory) => {
    await repo.updateGroceryCategory(cat);
    set({
      categories: get().categories.map(c => (c.id === cat.id ? cat : c)),
    });
  },

  removeCategory: async (id: string) => {
    await repo.deleteGroceryCategory(id);
    set({
      categories: get().categories.filter(c => c.id !== id),
      items: get().items.filter(i => i.categoryId !== id),
    });
  },

  addItem: async (categoryId: string, name: string) => {
    const catItems = get().items.filter(i => i.categoryId === categoryId);
    const item: GroceryItem = {
      id: generateId(),
      categoryId,
      name,
      needed: false,
      taken: false,
      sortOrder: catItems.length,
    };
    await repo.insertGroceryItem(item);
    set({ items: [...get().items, item] });
  },

  updateItem: async (item: GroceryItem) => {
    await repo.updateGroceryItem(item);
    set({
      items: get().items.map(i => (i.id === item.id ? item : i)),
    });
  },

  removeItem: async (id: string) => {
    await repo.deleteGroceryItem(id);
    set({ items: get().items.filter(i => i.id !== id) });
  },

  cycleItem: async (item: GroceryItem) => {
    let updated: GroceryItem;
    if (!item.needed) {
      // inactive → needed
      updated = { ...item, needed: true, taken: false };
    } else if (!item.taken) {
      // needed → taken
      updated = { ...item, taken: true };
    } else {
      // taken → inactive
      updated = { ...item, needed: false, taken: false };
    }
    await repo.updateGroceryItem(updated);
    set({
      items: get().items.map(i => (i.id === item.id ? updated : i)),
    });
  },

  resetWeek: async () => {
    await repo.resetAllItems();
    set({
      items: get().items.map(i => ({ ...i, needed: false, taken: false })),
    });
  },
}));
