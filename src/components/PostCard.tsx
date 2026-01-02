import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { 
  MessageCircle, 
  ThumbsUp, 
  User, 
  Clock, 
  Send,
  Heart,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Comment {
  id: string;
  user_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  profiles: {
    username: string;
  };
  hasLiked?: boolean;
}

interface PostCardProps {
  post: {
    id: string;
    user_id: string;
    title: string;
    content: string;
    image_url: string | null;
    level_tag: string;
    sector_tag: string | null;
    created_at: string;
    profiles: {
      username: string;
      education_level: string | null;
    };
  };
  currentUserId?: string;
  onUpdate?: () => void;
  showHelpBadge?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUserId, onUpdate, showHelpBadge }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadComments = async () => {
    if (!showComments) return;
    
    setIsLoadingComments(true);
    
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (username)
      `)
      .eq('post_id', post.id)
      .order('created_at', { ascending: true });

    if (commentsError) {
      console.error('Error loading comments:', commentsError);
      setIsLoadingComments(false);
      return;
    }

    // Check which comments the current user has liked
    if (currentUserId && commentsData) {
      const commentIds = commentsData.map(c => c.id);
      const { data: likesData } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', currentUserId)
        .in('comment_id', commentIds);

      const likedIds = new Set(likesData?.map(l => l.comment_id));
      const commentsWithLikes = commentsData.map(c => ({
        ...c,
        hasLiked: likedIds.has(c.id)
      }));
      setComments(commentsWithLikes as Comment[]);
    } else {
      setComments(commentsData as Comment[]);
    }
    
    setIsLoadingComments(false);
  };

  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments, post.id, currentUserId]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !currentUserId) return;

    setIsSubmitting(true);
    const { error } = await supabase.from('comments').insert({
      post_id: post.id,
      user_id: currentUserId,
      content: newComment.trim(),
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to post comment',
        variant: 'destructive',
      });
    } else {
      setNewComment('');
      loadComments();
    }
    setIsSubmitting(false);
  };

  const handleLikeComment = async (commentId: string, hasLiked: boolean) => {
    if (!currentUserId) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to like comments',
        variant: 'destructive',
      });
      return;
    }

    if (hasLiked) {
      await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', currentUserId);
    } else {
      await supabase.from('comment_likes').insert({
        comment_id: commentId,
        user_id: currentUserId,
      });
    }

    loadComments();
  };

  const handleDeletePost = async () => {
    if (!currentUserId || post.user_id !== currentUserId) return;

    const { error } = await supabase.from('posts').delete().eq('id', post.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete post',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Post deleted' });
      onUpdate?.();
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const { error } = await supabase.from('comments').delete().eq('id', commentId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete comment',
        variant: 'destructive',
      });
    } else {
      loadComments();
    }
  };

  const handleMessageUser = () => {
    navigate(`/messages?to=${post.user_id}&name=${post.profiles.username}`);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <button
                onClick={handleMessageUser}
                className="font-medium hover:text-primary transition-colors"
              >
                {post.profiles.username}
              </button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showHelpBadge && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <Heart className="h-3 w-3 mr-1" />
                Help Junior
              </Badge>
            )}
            <Badge variant="outline">{post.level_tag}</Badge>
            {post.sector_tag && <Badge variant="secondary">{post.sector_tag}</Badge>}
            {currentUserId === post.user_id && (
              <Button variant="ghost" size="icon" onClick={handleDeletePost}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">{post.content}</p>
        </div>

        {post.image_url && (
          <img
            src={post.image_url}
            alt="Post attachment"
            className="rounded-lg max-h-96 object-contain"
          />
        )}

        <Button
          variant="ghost"
          className="w-full justify-between"
          onClick={() => setShowComments(!showComments)}
        >
          <span className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            {comments.length > 0 ? `${comments.length} Comments` : 'Add Comment'}
          </span>
          {showComments ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {showComments && (
          <div className="space-y-4 border-t border-border pt-4">
            {isLoadingComments ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : (
              <>
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{comment.profiles.username}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{comment.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 px-2 ${comment.hasLiked ? 'text-primary' : ''}`}
                          onClick={() => handleLikeComment(comment.id, !!comment.hasLiked)}
                        >
                          <ThumbsUp className={`h-3 w-3 mr-1 ${comment.hasLiked ? 'fill-current' : ''}`} />
                          {comment.likes_count}
                        </Button>
                        {currentUserId === comment.user_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-destructive"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {currentUserId && (
                  <div className="flex gap-2">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      rows={2}
                      className="resize-none"
                    />
                    <Button
                      onClick={handleSubmitComment}
                      disabled={isSubmitting || !newComment.trim()}
                      size="icon"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostCard;
