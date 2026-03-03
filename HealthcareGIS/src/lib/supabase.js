import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oqphbfuhehulxqumyqlh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcGhiZnVoZWh1bHhxdW15cWxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDYzMTMsImV4cCI6MjA4ODEyMjMxM30.7VNe_J5WfHsrrhJtPXR5kbb3HZPkaeabkJvIJlJwY6k';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
