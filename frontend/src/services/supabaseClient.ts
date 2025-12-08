import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.DATABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.ANON_DATABASE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

// console.log("Supabase Client Init:", {
//   url: supabaseUrl,
//   keyLength: supabaseAnonKey?.length,
// });

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL or Anon Key not found. Please check your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: "public",
  },
  auth: {
    persistSession: true,
  },
});
