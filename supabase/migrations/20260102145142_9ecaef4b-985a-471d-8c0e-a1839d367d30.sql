-- Create a public view that excludes sensitive fields (email, phone_no)
-- Users can see their own sensitive data, others only see public fields
CREATE OR REPLACE VIEW public.public_profiles AS
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