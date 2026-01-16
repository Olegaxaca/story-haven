-- Create a public view for profile data that can be shown in comments
CREATE VIEW public.public_profiles
WITH (security_invoker = on) AS
SELECT 
  user_id,
  display_name,
  avatar_url
FROM public.profiles;

-- Allow anyone to read the public_profiles view
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);

-- Drop the old restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;