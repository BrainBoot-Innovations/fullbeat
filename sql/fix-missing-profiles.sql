-- FIX: Insert missing user profiles
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- This creates profiles for users that the trigger didn't catch

INSERT INTO user_profiles (id, email, display_name, tester_code, role, must_change_password, is_active)
SELECT
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'display_name', split_part(au.email, '@', 1)),
    COALESCE(au.raw_user_meta_data->>'tester_code', 'T00'),
    COALESCE((au.raw_user_meta_data->>'role')::user_role, 'engineer'),
    false,  -- don't force password change since they already set one
    true
FROM auth.users au
LEFT JOIN user_profiles up ON up.id = au.id
WHERE up.id IS NULL;

-- Verify
SELECT id, email, display_name, tester_code, role, is_active
FROM user_profiles
ORDER BY tester_code;
