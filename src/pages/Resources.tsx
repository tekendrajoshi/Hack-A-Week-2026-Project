import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Plus,
  FileIcon,
  Download,
  Trash2,
  User,
  Clock,
  FolderOpen,
  Loader2,
  Upload,
} from 'lucide-react';

interface Resource {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string;
  file_type: string | null;
  education_level: string;
  created_at: string;
  profiles?: {
    username: string;
  };
}

const Resources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const fetchResources = async () => {
    if (!profile?.education_level) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching resources:', error);
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      setResources([]);
      setLoading(false);
      return;
    }

    // Get user profiles
    const userIds = [...new Set(data.map((r) => r.user_id))];
    const { data: profilesData } = await supabase
      .from('public_profiles')
      .select('id, username')
      .in('id', userIds);

    const profilesMap = new Map(profilesData?.map((p) => [p.id, p]) || []);
    const resourcesWithProfiles = data.map((r) => ({
      ...r,
      profiles: profilesMap.get(r.user_id) || { username: 'Unknown' },
    }));

    setResources(resourcesWithProfiles);
    setLoading(false);
  };

  useEffect(() => {
    fetchResources();
  }, [profile?.education_level]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Maximum file size is 50MB',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim() || !user || !profile?.education_level) return;

    setUploading(true);

    // Upload file to storage
    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(fileName, selectedFile);

    if (uploadError) {
      toast({
        title: 'Upload failed',
        description: uploadError.message,
        variant: 'destructive',
      });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);

    // Create resource entry
    const { error: insertError } = await supabase.from('resources').insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      file_url: urlData.publicUrl,
      file_name: selectedFile.name,
      file_type: selectedFile.type,
      education_level: profile.education_level,
    });

    if (insertError) {
      toast({
        title: 'Error',
        description: 'Failed to save resource',
        variant: 'destructive',
      });
      setUploading(false);
      return;
    }

    toast({ title: 'Resource added successfully!' });
    setTitle('');
    setDescription('');
    setSelectedFile(null);
    setIsDialogOpen(false);
    setUploading(false);
    fetchResources();
  };

  const handleDelete = async (resourceId: string) => {
    const { error } = await supabase.from('resources').delete().eq('id', resourceId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete resource',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Resource deleted' });
      fetchResources();
    }
  };

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <FileIcon className="h-8 w-8" />;
    if (fileType.startsWith('image/')) return <FileIcon className="h-8 w-8 text-primary" />;
    if (fileType.includes('pdf')) return <FileIcon className="h-8 w-8 text-destructive" />;
    if (fileType.includes('word') || fileType.includes('document'))
      return <FileIcon className="h-8 w-8 text-blue-500" />;
    return <FileIcon className="h-8 w-8" />;
  };

  if (!profile?.profile_completed) {
    return (
      <Layout>
        <div className="text-center py-12">
          <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Complete your profile first</h2>
          <p className="text-muted-foreground">
            You need to complete your profile to access resources.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Resources</h1>
            <p className="text-muted-foreground">
              Study materials for {profile.education_level} students
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Resource
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Resource</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="Resource title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {selectedFile ? (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                      <FileIcon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm truncate flex-1">{selectedFile.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setSelectedFile(null)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      Choose File
                    </Button>
                  )}
                </div>
                <Button
                  className="w-full"
                  onClick={handleUpload}
                  disabled={!selectedFile || !title.trim() || uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    'Upload Resource'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No resources yet</h2>
              <p className="text-muted-foreground mb-4">
                Be the first to share study materials for your level!
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>Add Resource</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {resources.map((resource) => (
              <Card key={resource.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      {getFileIcon(resource.file_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{resource.title}</h3>
                      {resource.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {resource.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{resource.profiles?.username}</span>
                        <Clock className="h-3 w-3 ml-2" />
                        <span>
                          {formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      asChild
                    >
                      <a href={resource.file_url} target="_blank" rel="noopener noreferrer" download>
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </Button>
                    {user?.id === resource.user_id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDelete(resource.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Resources;
