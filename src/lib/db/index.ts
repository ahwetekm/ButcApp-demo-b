import { createClient } from '@supabase/supabase-js';

// Hardcoded environment variables to fix Next.js loading issue
const supabaseUrl = "https://dfiwgngtifuqrrxkvknn.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmaXdnbmd0aWZ1cXJyeGt2a25uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTI3NzMyMSwiZXhwIjoyMDgwODUzMzIxfQ.uCfJ5DzQ2QCiyXycTrHEaKh1EvAFbuP8HBORmBSPbX8";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Export supabase client
export { supabase };

// Test connection function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('Supabase connection error:', error.message);
      return false;
    }
    console.log('✓ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Connection test failed:', error.message);
    return false;
  }
};

// Initialize connection on module load
testConnection().catch(console.error);