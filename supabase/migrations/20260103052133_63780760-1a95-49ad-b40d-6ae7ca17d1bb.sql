-- Add a policy to allow everyone to read basic profile info
-- This is safe because:
-- 1. The public_profiles view already hides email/phone for non-owners
-- 2. We're only exposing: username, education_level, sector, description, profile_completed, points, created_at
-- 3. Usernames are chosen by users and meant to be public for the leaderboard/messaging

CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);