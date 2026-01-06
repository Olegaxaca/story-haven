-- Update handle_new_user function with input validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NULLIF(TRIM(SUBSTRING(NEW.raw_user_meta_data ->> 'display_name', 1, 100)), ''),
      'User'
    )
  );
  RETURN NEW;
END;
$$;