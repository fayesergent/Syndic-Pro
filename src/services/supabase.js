import { createClient } from "@supabase/supabase-js";

const SUPA_URL = import.meta.env.VITE_SUPABASE_URL || "https://orgrwqsxtzvnezzealrd.supabase.co";
const SUPA_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_Y9bKALl8VfcV_Wakn-Slfg_zFqb49FS";

export const supabase = createClient(SUPA_URL, SUPA_KEY);

export const uid = () => crypto.randomUUID();
