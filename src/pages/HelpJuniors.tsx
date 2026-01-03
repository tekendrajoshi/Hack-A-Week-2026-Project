import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import PostCard from '@/components/PostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Heart } from 'lucide-react';

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

const educationLevelOrder: Record<string, number> = {
  'SEE and below': 1,
  '+2 Science': 2,
  '+2 Management': 2,
  'Entrance level': 3,
  'Bachelor Engineering': 4,
  'Bachelor Medicine': 4,
};

const HelpJuniors: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile, user } = useAuth();

  const fetchJuniorPosts = async () => {
    if (!profile?.education_level) {
      setLoading(false);
      return;
    }

    const userLevel = educationLevelOrder[profile.education_level] || 0;
    
    // Get all levels below the user's level
    const juniorLevels = Object.entries(educationLevelOrder)
      .filter(([_, order]) => order < userLevel)
      .map(([level]) => level);

    if (juniorLevels.length === 0) {
      setLoading(false);
      return;
    }

    // Fetch posts
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .in('level_tag', juniorLevels)
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
    fetchJuniorPosts();
  }, [profile?.education_level]);

  if (!profile?.profile_completed) {
    return (
      <Layout>
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Complete your profile first</h2>
          <p className="text-muted-foreground">You need to complete your profile to help juniors.</p>
        </div>
      </Layout>
    );
  }

  const userLevel = educationLevelOrder[profile.education_level || ''] || 0;

  if (userLevel <= 1) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <Heart className="mx-auto h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Keep Learning!</h2>
            <p className="text-muted-foreground">
              As you progress in your education, you'll be able to help students in lower levels.
              Focus on learning for now, and soon you'll be helping others!
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            Help Juniors
          </h1>
          <p className="text-muted-foreground">
            Answer questions from junior students and earn points
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border border-border">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No questions from juniors</h2>
            <p className="text-muted-foreground">
              Check back later to help junior students with their questions!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user?.id}
                onUpdate={fetchJuniorPosts}
                showHelpBadge
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HelpJuniors;