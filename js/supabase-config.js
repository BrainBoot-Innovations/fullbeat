// FullBeat — Supabase Configuration
const SUPABASE_URL = 'https://dmiynjnxwwilbxjygvzi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtaXluam54d3dpbGJ4anlndnppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzMzI0OTIsImV4cCI6MjA4OTkwODQ5Mn0.Y2h1KahlOtdvmBjAAlUilKt5MKPO3NJUB2OEZyU1D5E';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
