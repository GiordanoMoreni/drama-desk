-- Populate user_profiles from auth.users (idempotent)
INSERT INTO user_profiles (id, first_name, last_name, email, created_at, updated_at)
SELECT
  u.id,
  split_part(u.raw_user_meta_data->>'full_name', ' ', 1) AS first_name,
  NULLIF(trim(substring(u.raw_user_meta_data->>'full_name' FROM ' (.*)$') ), '') AS last_name,
  u.email,
  NOW(),
  NOW()
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = u.id);
