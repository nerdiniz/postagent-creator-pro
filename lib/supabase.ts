import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wublvffnbhfxebjvkluy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1Ymx2ZmZuYmhmeGVianZrbHV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyODc3MDYsImV4cCI6MjA4NTg2MzcwNn0.x5arNrzNkYJ70Tenv4tALvqe0YXzwP5QgrAfij7Te14';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
