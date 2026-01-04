-- Create storage bucket for uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

-- Storage policies for uploads bucket
CREATE POLICY "Anyone can view uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'uploads');

CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'uploads' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own uploads"
ON storage.objects FOR DELETE
USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add file_url column to comments
ALTER TABLE public.comments ADD COLUMN file_url TEXT DEFAULT NULL;

-- Add file_url column to messages
ALTER TABLE public.messages ADD COLUMN file_url TEXT DEFAULT NULL;

-- Create resources table for education-level specific files
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  education_level TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on resources
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Resources are viewable by users of the same education level
CREATE POLICY "Users can view resources for their level"
ON public.resources FOR SELECT
USING (
  education_level = (SELECT education_level FROM public.profiles WHERE id = auth.uid())
);

-- Authenticated users can add resources
CREATE POLICY "Authenticated users can add resources"
ON public.resources FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own resources
CREATE POLICY "Users can delete their own resources"
ON public.resources FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for resources
ALTER PUBLICATION supabase_realtime ADD TABLE public.resources;