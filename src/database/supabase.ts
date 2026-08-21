import { createClient } from "@supabase/supabase-js";

import { env } from "../config/env.js";

import type { Database } from "./types.js";

export const supabase = createClient<Database>(
  env.supabase.url,
  env.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  },
);
