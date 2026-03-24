// FullBeat — Supabase Configuration
var SUPABASE_URL = 'https://dmiynjnxwwilbxjygvzi.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtaXluam54d3dpbGJ4anlndnppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMzI0OTIsImV4cCI6MjA4OTkwODQ5Mn0.Y2h1KahlOtdvmBjAAlUilKt5MKPO3NJUB2OEZyU1D5E';

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
