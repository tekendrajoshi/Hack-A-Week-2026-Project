import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, HelpCircle, Users, MessageSquare, Trophy, ArrowRight, Loader2 } from 'lucide-react';

const Index: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && profile && !profile.profile_completed) {
      navigate('/complete-profile');
    }
  }, [user, profile, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="border-b border-border bg-card/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">PeerLearn</span>
            </div>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>

        <main className="container mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Learn Together, <span className="text-primary">Grow Together</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Join Nepal's student community where you can ask questions, help juniors, 
              chat with an AI tutor, and earn recognition for your contributions.
            </p>
            <Link to="/auth">
              <Button size="lg" className="gap-2">
                Join PeerLearn <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: HelpCircle, title: 'Ask Questions', desc: 'Get help from students at your level' },
              { icon: Users, title: 'Help Juniors', desc: 'Share knowledge and earn points' },
              { icon: MessageSquare, title: 'AI Tutor', desc: 'Get personalized study help 24/7' },
              { icon: Trophy, title: 'Leaderboard', desc: 'Track your contributions and grow' },
            ].map((feature, i) => (
              <Card key={i} className="text-center">
                <CardContent className="pt-6">
                  <feature.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.username}!</h1>
          <p className="text-muted-foreground">What would you like to do today?</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { path: '/questions', icon: HelpCircle, title: 'Questions', desc: 'See questions from your level', color: 'text-blue-500' },
            { path: '/help-juniors', icon: Users, title: 'Help Juniors', desc: 'Answer junior questions', color: 'text-pink-500' },
            { path: '/ai-tutor', icon: MessageSquare, title: 'AI Tutor', desc: 'Get AI-powered study help', color: 'text-green-500' },
            { path: '/leaderboard', icon: Trophy, title: 'Leaderboard', desc: 'See top contributors', color: 'text-yellow-500' },
          ].map((item) => (
            <Link key={item.path} to={item.path}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className={`p-3 rounded-full bg-muted ${item.color}`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Index;
