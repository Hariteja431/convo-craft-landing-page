// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://kticxszsefvklkjiqxvy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0aWN4c3pzZWZ2a2xramlxeHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NjIzNTMsImV4cCI6MjA2NjQzODM1M30.vx4XY3NPEZKo1fup5gBEtv412orbprtdQbozoXyC1pk";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);