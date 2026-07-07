// FullBeat — Supabase Configuration
var SUPABASE_URL = 'https://mamfbhcbbwlemhxstzrg.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hbWZiaGNiYndsZW1oeHN0enJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MjMzMTUsImV4cCI6MjA5ODk5OTMxNX0.79G-AFqbhbWFTXyw8cvymvsbDBWwFb4890TuA7bGCZc';

// The CDN UMD build assigns the library to window.supabase
var _supabaseLib = window.supabase;
var supabase = null;
try {
    if (_supabaseLib && typeof _supabaseLib.createClient === 'function') {
        supabase = _supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: true,
                storageKey: 'fullbeat-auth',
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        });
        console.log('[FullBeat] Supabase connected');
    } else {
        console.warn('[FullBeat] Supabase SDK not loaded');
    }
} catch (e) {
    console.warn('[FullBeat] Supabase init failed:', e.message);
}
