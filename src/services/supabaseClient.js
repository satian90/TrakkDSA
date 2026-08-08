import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://mfqrobqectaeqhgcahjd.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ECJ4cVfsa1tkplyYJLnWTw_vQH1vDKo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
