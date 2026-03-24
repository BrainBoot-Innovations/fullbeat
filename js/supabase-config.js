// FullBeat — Supabase Configuration
var SUPABASE_URL = 'https://dmiynjnxwwilbxjygvzi.supabase.co';
var SUPABASE_ANON_KEY = 'sb_publishable_AZeeo2TyJYzHdrnZYwH0NQ_ZHNfs44v';

// Guard: only create client if Supabase SDK loaded
var supabase = null;
try {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('[FullBeat] Supabase connected');
    } else {
        console.warn('[FullBeat] Supabase SDK not loaded — DEV mode will use mock data');
    }
} catch (e) {
    console.warn('[FullBeat] Supabase init failed:', e.message);
}
