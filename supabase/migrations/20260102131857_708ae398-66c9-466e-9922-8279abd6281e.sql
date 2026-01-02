-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 1. PROFILES: Stores user info & contribution points
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  phone_no TEXT,
  email TEXT UNIQUE,
  education_level TEXT CHECK (education_level IN ('SEE and below', '+2 Science', '+2 Management', 'Entrance level', 'Bachelor Engineering', 'Bachelor Medicine')),
  sector TEXT,
  description TEXT,
  points INTEGER DEFAULT 0,
  profile_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. POSTS: The questions students ask
CREATE TABLE public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  level_tag TEXT NOT NULL,
  sector_tag TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Posts are viewable by everyone" ON public.posts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON public.posts
  FOR DELETE USING (auth.uid() = user_id);

-- 3. COMMENTS: The answers provided by students
CREATE TABLE public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- 4. COMMENT_LIKES: Track who liked which comment (for preventing duplicate likes)
CREATE TABLE public.comment_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id)
);

-- Enable RLS on comment_likes
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- Comment likes policies
CREATE POLICY "Comment likes are viewable by everyone" ON public.comment_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like comments" ON public.comment_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own likes" ON public.comment_likes
  FOR DELETE USING (auth.uid() = user_id);

-- 5. AI_CHATS: Stores history with AI tutor
CREATE TABLE public.ai_chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('user', 'model')) NOT NULL,
  message TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on ai_chats
ALTER TABLE public.ai_chats ENABLE ROW LEVEL SECURITY;

-- AI chats policies (private - users can only see their own)
CREATE POLICY "Users can view their own AI chats" ON public.ai_chats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI chats" ON public.ai_chats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI chats" ON public.ai_chats
  FOR DELETE USING (auth.uid() = user_id);

-- 6. MESSAGES: Private 1-on-1 chat between users
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Messages policies (users can only see messages they sent or received)
CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can delete messages they sent" ON public.messages
  FOR DELETE USING (auth.uid() = sender_id);

-- 7. USER_ROLES: For admin management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to handle comment likes and update points
CREATE OR REPLACE FUNCTION public.handle_comment_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  comment_author_id UUID;
BEGIN
  -- Get the comment author
  SELECT user_id INTO comment_author_id FROM public.comments WHERE id = NEW.comment_id;
  
  -- Increment likes_count on the comment
  UPDATE public.comments SET likes_count = likes_count + 1 WHERE id = NEW.comment_id;
  
  -- Add points to the comment author
  UPDATE public.profiles SET points = points + 1 WHERE id = comment_author_id;
  
  RETURN NEW;
END;
$$;

-- Function to handle comment unlike and update points
CREATE OR REPLACE FUNCTION public.handle_comment_unlike()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  comment_author_id UUID;
BEGIN
  -- Get the comment author
  SELECT user_id INTO comment_author_id FROM public.comments WHERE id = OLD.comment_id;
  
  -- Decrement likes_count on the comment
  UPDATE public.comments SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.comment_id;
  
  -- Remove points from the comment author
  UPDATE public.profiles SET points = GREATEST(0, points - 1) WHERE id = comment_author_id;
  
  RETURN OLD;
END;
$$;

-- Triggers for like/unlike
CREATE TRIGGER on_comment_liked
  AFTER INSERT ON public.comment_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_comment_like();

CREATE TRIGGER on_comment_unliked
  AFTER DELETE ON public.comment_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_comment_unlike();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Function to get education level order for comparison
CREATE OR REPLACE FUNCTION public.education_level_order(level TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
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