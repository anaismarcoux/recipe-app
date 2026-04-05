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
  moveCategoryUp: (id: string) => Promise<void>;
  moveCategoryDown: (id: string) => Promise<void>;
  moveItemUp: (item: GroceryItem) => Promise<void>;
  moveItemDown: (item: GroceryItem) => Promise<void>;
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

  moveCategoryUp: async (id: string) => {
    const cats = [...get().categories].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = cats.findIndex(c => c.id === id);
    if (idx <= 0) return;
    const prev = cats[idx - 1];
    const curr = cats[idx];
    const updatedCurr = { ...curr, sortOrder: prev.sortOrder };
    const updatedPrev = { ...prev, sortOrder: curr.sortOrder };
    await Promise.all([repo.updateGroceryCategory(updatedCurr), repo.updateGroceryCategory(updatedPrev)]);
    set({ categories: get().categories.map(c => c.id === curr.id ? updatedCurr : c.id === prev.id ? updatedPrev : c) });
  },

  moveCategoryDown: async (id: string) => {
    const cats = [...get().categories].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = cats.findIndex(c => c.id === id);
    if (idx < 0 || idx >= cats.length - 1) return;
    const next = cats[idx + 1];
    const curr = cats[idx];
    const updatedCurr = { ...curr, sortOrder: next.sortOrder };
    const updatedNext = { ...next, sortOrder: curr.sortOrder };
    await Promise.all([repo.updateGroceryCategory(updatedCurr), repo.updateGroceryCategory(updatedNext)]);
    set({ categories: get().categories.map(c => c.id === curr.id ? updatedCurr : c.id === next.id ? updatedNext : c) });
  },

  moveItemUp: async (item: GroceryItem) => {
    const catItems = get().items.filter(i => i.categoryId === item.categoryId).sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = catItems.findIndex(i => i.id === item.id);
    if (idx <= 0) return;
    const prev = catItems[idx - 1];
    const updatedCurr = { ...item, sortOrder: prev.sortOrder };
    const updatedPrev = { ...prev, sortOrder: item.sortOrder };
    await Promise.all([repo.updateGroceryItem(updatedCurr), repo.updateGroceryItem(updatedPrev)]);
    set({ items: get().items.map(i => i.id === item.id ? updatedCurr : i.id === prev.id ? updatedPrev : i) });
  },

  moveItemDown: async (item: GroceryItem) => {
    const catItems = get().items.filter(i => i.categoryId === item.categoryId).sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = catItems.findIndex(i => i.id === item.id);
    if (idx < 0 || idx >= catItems.length - 1) return;
    const next = catItems[idx + 1];
    const updatedCurr = { ...item, sortOrder: next.sortOrder };
    const updatedNext = { ...next, sortOrder: item.sortOrder };
    await Promise.all([repo.updateGroceryItem(updatedCurr), repo.updateGroceryItem(updatedNext)]);
    set({ items: get().items.map(i => i.id === item.id ? updatedCurr : i.id === next.id ? updatedNext : i) });
  },
}));
