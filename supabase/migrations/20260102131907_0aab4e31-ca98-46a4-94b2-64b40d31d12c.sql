-- Fix function search path mutable warning by recreating functions with explicit search_path
DROP FUNCTION IF EXISTS public.education_level_order(text);

CREATE OR REPLACE FUNCTION public.education_level_order(level TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  RETURN CASE level
    WHEN 'SEE and below' THEN 1
    WHEN '+2 Science' THEN 2
    WHEN '+2 Management' THEN 2
    WHEN 'Entrance level' THEN 3
    WHEN 'Bachelor Engineering' THEN 4
    WHEN 'Bachelor Medicine' THEN 4
    ELSE 0
  END;
END;
$$;