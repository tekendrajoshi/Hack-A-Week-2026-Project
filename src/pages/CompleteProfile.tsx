import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Loader2 } from 'lucide-react';

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

const CompleteProfile: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNo, setPhoneNo] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [sector, setSector] = useState('');
  const [description, setDescription] = useState('');
  
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    } else if (profile?.profile_completed) {
      navigate('/');
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!educationLevel || !sector) {
      toast({
        title: 'Missing information',
        description: 'Please select your education level and sector.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        phone_no: phoneNo || null,
        education_level: educationLevel,
        sector: sector,
        description: description || null,
        profile_completed: true,
      })
      .eq('id', user!.id);

    setIsLoading(false);

    if (error) {
      toast({
        title: 'Error saving profile',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      await refreshProfile();
      toast({
        title: 'Profile complete!',
        description: 'Welcome to PeerLearn. Start exploring!',
      });
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <GraduationCap className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Tell us about yourself so we can personalize your learning experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+977 98XXXXXXXX"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">Education Level *</Label>
              <Select value={educationLevel} onValueChange={setEducationLevel} disabled={isLoading}>
                <SelectTrigger id="education">
                  <SelectValue placeholder="Select your education level" />
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
              <Label htmlFor="sector">Sector / Field *</Label>
              <Select value={sector} onValueChange={setSector} disabled={isLoading}>
                <SelectTrigger id="sector">
                  <SelectValue placeholder="Select your field of study" />
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
              <Label htmlFor="description">Describe Yourself (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Tell us about your interests, goals, or what you want to learn..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                rows={4}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Complete Profile'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteProfile;
