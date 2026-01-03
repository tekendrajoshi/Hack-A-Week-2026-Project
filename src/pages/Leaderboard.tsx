import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Medal, Award, Crown, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface LeaderboardEntry {
  id: string;
  username: string;
  education_level: string | null;
  points: number;
}

const Leaderboard: React.FC = () => {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase
        .from('public_profiles')
        .select('id, username, education_level, points')
        .order('points', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching leaderboard:', error);
      } else {
        setLeaders(data as LeaderboardEntry[]);
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <Award className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-800';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20 border-gray-200 dark:border-gray-700';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-card';
    }
  };

  const handleMessage = (userId: string, username: string) => {
    navigate(`/messages?to=${userId}&name=${username}`);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Trophy className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">
            Top contributors helping the community
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Students</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : leaders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No contributors yet. Be the first to help others!
              </div>
            ) : (
              <div className="space-y-2">
                {leaders.map((leader, index) => {
                  const rank = index + 1;
                  const isCurrentUser = leader.id === user?.id;

                  return (
                    <div
                      key={leader.id}
                      className={`flex items-center gap-4 p-3 rounded-lg border ${getRankStyle(rank)} ${
                        isCurrentUser ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <div className="w-10 flex justify-center">
                        {rank <= 3 ? (
                          getRankIcon(rank)
                        ) : (
                          <span className="text-lg font-semibold text-muted-foreground">
                            {rank}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {leader.username}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-primary">(You)</span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {leader.education_level || 'Level not set'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-primary">{leader.points}</span>
                        <span className="text-sm text-muted-foreground ml-1">pts</span>
                      </div>
                      {user && leader.id !== user.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMessage(leader.id, leader.username)}
                          title="Send message"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Leaderboard;
