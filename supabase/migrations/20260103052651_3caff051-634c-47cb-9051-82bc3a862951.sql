-- Create table for storing call signals (WebRTC signaling)
CREATE TABLE public.call_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  caller_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  signal_type TEXT NOT NULL, -- 'offer', 'answer', 'ice-candidate', 'call-ended', 'call-rejected'
  signal_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.call_signals ENABLE ROW LEVEL SECURITY;

-- Policies for call signals
CREATE POLICY "Users can view their own call signals"
ON public.call_signals
FOR SELECT
USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create call signals"
ON public.call_signals
FOR INSERT
WITH CHECK (auth.uid() = caller_id);

CREATE POLICY "Users can delete their own call signals"
ON public.call_signals
FOR DELETE
USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'message', 'comment', 'call'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  reference_id UUID, -- ID of the related item (message, post, etc.)
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- Allow service role to insert notifications (for triggers)
CREATE POLICY "Service role can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Enable realtime for call signals
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_signals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create trigger to notify on new message
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_name TEXT;
BEGIN
  -- Get sender username
  SELECT username INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;
  
  -- Create notification for receiver
  INSERT INTO public.notifications (user_id, type, title, message, reference_id)
  VALUES (
    NEW.receiver_id,
    'message',
    'New message from ' || COALESCE(sender_name, 'Someone'),
    LEFT(NEW.message_text, 100),
    NEW.id
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_message
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_message();

-- Create trigger to notify on new comment
CREATE OR REPLACE FUNCTION public.notify_new_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_author_id UUID;
  commenter_name TEXT;
  post_title TEXT;
BEGIN
  -- Get post author and title
  SELECT user_id, title INTO post_author_id, post_title FROM public.posts WHERE id = NEW.post_id;
  
  -- Don't notify if commenting on own post
  IF post_author_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get commenter username
  SELECT username INTO commenter_name FROM public.profiles WHERE id = NEW.user_id;
  
  -- Create notification for post author
  INSERT INTO public.notifications (user_id, type, title, message, reference_id)
  VALUES (
    post_author_id,
    'comment',
    COALESCE(commenter_name, 'Someone') || ' commented on your question',
    LEFT(post_title || ': ' || NEW.content, 100),
    NEW.post_id
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_comment
AFTER INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_comment();