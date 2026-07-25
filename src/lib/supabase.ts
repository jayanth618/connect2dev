import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidHttpUrl = (urlStr: string | undefined): boolean => {
  if (!urlStr) return false;
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const defaultUrl = 'https://placeholder-supabase.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.placeholder';

const supabaseUrl = isValidHttpUrl(rawUrl) && rawUrl !== 'https://your-supabase-project.supabase.co' 
  ? rawUrl! 
  : defaultUrl;

const supabaseAnonKey = rawKey && rawKey !== 'your-supabase-anon-key' 
  ? rawKey 
  : defaultKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = (): boolean => {
  return (
    isValidHttpUrl(rawUrl) &&
    rawUrl !== 'https://your-supabase-project.supabase.co' &&
    rawUrl !== defaultUrl &&
    !!rawKey &&
    rawKey !== 'your-supabase-anon-key' &&
    rawKey !== defaultKey
  );
};

