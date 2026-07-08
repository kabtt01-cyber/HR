import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

// Try to get credentials from environment variables
const ENV_URL = (import.meta as any).env.VITE_SUPABASE_URL || '';
const ENV_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';


// Initialize client if environment variables are present
if (ENV_URL && ENV_KEY) {
  try {
    supabaseInstance = createClient(ENV_URL, ENV_KEY);
  } catch (err) {
    console.error('Failed to initialize Supabase from environment variables:', err);
  }
}

/**
 * Initializes the Supabase client with custom credentials at runtime.
 */
export function initSupabase(url: string, key: string): SupabaseClient {
  try {
    supabaseInstance = createClient(url, key);
    return supabaseInstance;
  } catch (err) {
    console.error('Failed to initialize custom Supabase client:', err);
    throw err;
  }
}

/**
 * Gets the current Supabase client instance or null if not configured.
 */
export function getSupabase(): SupabaseClient | null {
  return supabaseInstance;
}

/**
 * Helper to check if Supabase is connected and configured.
 */
export function isSupabaseConfigured(): boolean {
  return supabaseInstance !== null;
}

// Database Interfaces
export interface WorkflowRequest {
  id?: number;
  request_number: string;
  request_type: string;
  employee_name: string;
  employee_id: string;
  department: string;
  section: string;
  request_date: string; // YYYY-MM-DD
  request_time: string; // HH:MM
  details: string;
  attachments?: string;
  status: 'جديد' | 'قيد المراجعة' | 'بانتظار المدير' | 'مقبول' | 'مرفوض' | 'ملغي' | 'مكتمل';
  
  // Decision Info
  reviewer_name?: string | null;
  decision_date?: string | null;
  decision_time?: string | null;
  rejection_reason?: string | null;
  
  created_at?: string;
}

export interface WorkflowAuditLog {
  id?: number;
  request_id?: number;
  request_number: string;
  action: string;
  user_name: string;
  details: string;
  created_at?: string;
}

export interface WorkflowNotification {
  id?: number;
  employee_id: string;
  message: string;
  is_read: boolean;
  created_at?: string;
}
