import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import PostCard from '@/components/PostCard';
import CreatePostDialog from '@/components/CreatePostDialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, HelpCircle } from 'lucide-react';

interface Post {
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
}

const Questions: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { profile, user } = useAuth();

  const fetchPosts = async () => {
    if (!profile?.education_level) {
      setLoading(false);
      return;
    }

    // Fetch posts
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .eq('level_tag', profile.education_level)
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      setLoading(false);
      return;
    }

    if (!postsData || postsData.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }

    // Get unique user IDs
    const userIds = [...new Set(postsData.map(p => p.user_id))];

    // Fetch author profiles from public_profiles view
    const { data: profilesData } = await supabase
      .from('public_profiles')
      .select('id, username, education_level')
      .in('id', userIds);

    // Map profiles to posts
    const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
    const postsWithProfiles = postsData.map(post => ({
      ...post,
      profiles: profilesMap.get(post.user_id) || { username: 'Unknown', education_level: null }
    }));

    setPosts(postsWithProfiles as Post[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [profile?.education_level]);

  const handlePostCreated = () => {
    setIsCreateOpen(false);
    fetchPosts();
  };

  if (!profile?.profile_completed) {
    return (
      <Layout>
        <div className="text-center py-12">
          <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Complete your profile first</h2>
          <p className="text-muted-foreground">You need to complete your profile to see questions from your level.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Questions</h1>
            <p className="text-muted-foreground">
              Questions from {profile.education_level} students
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Ask Question
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No questions yet</h2>
            <p className="text-muted-foreground mb-4">
              Be the first to ask a question at your level!
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>Ask a Question</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user?.id}
                onUpdate={fetchPosts}
              />
            ))}
          </div>
        )}

        <CreatePostDialog
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={handlePostCreated}
          defaultLevel={profile.education_level}
        />
      </div>
    </Layout>
  );
};

export default Questions;