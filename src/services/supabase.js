import { createClient } from "@supabase/supabase-js";

const SUPA_URL = import.meta.env.VITE_SUPABASE_URL || "https://kygmnmtmmzysbbytvatr.supabase.co";
const SUPA_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5Z21ubXRtbXp5c2JieXR2YXRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjcyNTksImV4cCI6MjA5Mzg0MzI1OX0.lmT87OvX-Fqbq_GvKDEdV6WmtLfdbzJKKpglMFgTQKU";

export const supabase = createClient(SUPA_URL, SUPA_KEY);

export const uid = () => crypto.randomUUID();
