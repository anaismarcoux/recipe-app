import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const SUPABASE_URL = 'https://ozefuhnwxhyufrlleyxm.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZWZ1aG53eGh5dWZybGxleXhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMTE0NDYsImV4cCI6MjA5MDg4NzQ0Nn0.p33FeupBE_vQ9vlIzoBWRfZj4gyngbSc6IovIbTcrOE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

export function isLocalUri(uri: string | null): boolean {
  if (!uri) return false;
  return !uri.startsWith('http://') && !uri.startsWith('https://');
}

export async function uploadImage(uri: string, path: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  const { error } = await supabase.storage
    .from('recipe-images')
    .upload(path, blob, { upsert: true, contentType: 'image/jpeg' });

  if (error) throw error;

  const { data } = supabase.storage
    .from('recipe-images')
    .getPublicUrl(path);

  return data.publicUrl;
}
