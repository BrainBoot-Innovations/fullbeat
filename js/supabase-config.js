// FullBeat — Supabase Configuration
var SUPABASE_URL = 'https://dmiynjnxwwilbxjygvzi.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtaXluam54d3dpbGJ4anlndnppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMzI0OTIsImV4cCI6MjA4OTkwODQ5Mn0.Y2h1KahlOtdvmBjAAlUilKt5MKPO3NJUB2OEZyU1D5E';

// The CDN UMD build assigns the library to window.supabase
// We need to grab createClient BEFORE overwriting the variable
var _supabaseLib = window.supabase;
var supabase = null;
try {
    if (_supabaseLib && typeof _supabaseLib.createClient === 'function') {
        supabase = _supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('[FullBeat] Supabase connected');
    } else {
        console.warn('[FullBeat] Supabase SDK not loaded — will use DEV mode mock data');
    }
} catch (e) {
    console.warn('[FullBeat] Supabase init failed:', e.message);
}
