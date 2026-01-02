import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User, Trophy, Loader2, Save } from 'lucide-react';

const educationLevels = [
  'SEE and below',
  '+2 Science',
  '+2 Management',
  'Entrance level',
  'Bachelor Engineering',
  'Bachelor Medicine',
];

const sectors = [
  'Science (Physical)',
  'Science (Biological)',
  'Engineering',
  'Medicine',
  'Management',
  'Arts & Humanities',
  'Computer Science',
  'Other',
];

const Profile: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    phone_no: profile?.phone_no || '',
    education_level: profile?.education_level || '',
    sector: profile?.sector || '',
    description: profile?.description || '',
  });

  if (!user || !profile) {
    navigate('/auth');
    return null;
  }

  const handleSave = async () => {
    setIsSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        username: formData.username,
        phone_no: formData.phone_no || null,
        education_level: formData.education_level,
        sector: formData.sector,
        description: formData.description || null,
      })
      .eq('id', user.id);

    setIsSaving(false);

    if (error) {
      if (error.code === '23505') {
        toast({
          title: 'Username taken',
          description: 'This username is already in use. Please choose another.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    } else {
      await refreshProfile();
      setIsEditing(false);
      toast({
        title: 'Profile updated',
        description: 'Your changes have been saved.',
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{profile.username}</CardTitle>
                  <CardDescription>{profile.email}</CardDescription>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-primary">
                  <Trophy className="h-5 w-5" />
                  <span className="text-2xl font-bold">{profile.points}</span>
                </div>
                <p className="text-sm text-muted-foreground">Points earned</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {isEditing ? (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone_no}
                      onChange={(e) => setFormData({ ...formData, phone_no: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="education">Education Level</Label>
                    <Select
                      value={formData.education_level}
                      onValueChange={(value) => setFormData({ ...formData, education_level: value })}
                    >
                      <SelectTrigger id="education">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {educationLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sector">Sector / Field</Label>
                    <Select
                      value={formData.sector}
                      onValueChange={(value) => setFormData({ ...formData, sector: value })}
                    >
                      <SelectTrigger id="sector">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sectors.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">About Me</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{profile.phone_no || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Education Level</p>
                    <p className="font-medium">{profile.education_level || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sector</p>
                    <p className="font-medium">{profile.sector || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-medium">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {profile.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">About Me</p>
                    <p>{profile.description}</p>
                  </div>
                )}

                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;
