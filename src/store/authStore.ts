import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import * as categoryRepo from '../db/categoryRepository';
import { generateId } from '../utils/uuid';
import { Category } from '../types';

interface AuthStore {
  session: Session | null;
  loading: boolean;
  initialize: () => void;
  signUp: (email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

async function seedDefaults() {
  const existing = await categoryRepo.getAllCategories();
  if (existing.length > 0) return;
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
}

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  loading: true,

  initialize: () => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, loading: false });
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session });
      if (_event === 'SIGNED_IN' && session) {
        seedDefaults();
      }
    });
  },

  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return error?.message || null;
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message || null;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null });
  },
}));
