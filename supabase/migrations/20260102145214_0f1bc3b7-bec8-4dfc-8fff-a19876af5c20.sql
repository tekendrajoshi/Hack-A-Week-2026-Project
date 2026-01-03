-- Drop and recreate the view with security_invoker = true
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT 
  id,
  username,
  education_level,
  sector,
  description,
  profile_completed,
  points,
  created_at,
  CASE WHEN id = auth.uid() THEN email ELSE NULL END as email,
  CASE WHEN id = auth.uid() THEN phone_no ELSE NULL END as phone_no
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;