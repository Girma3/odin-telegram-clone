import { createClient } from "@supabase/supabase-js";

const supaBaseKey = import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_URL;
const supaBaseUrl = import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const initSupabase = createClient(supaBaseKey, supaBaseUrl);

export default initSupabase;
