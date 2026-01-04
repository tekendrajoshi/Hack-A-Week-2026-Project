import React, { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Paperclip, X, FileIcon, Loader2 } from 'lucide-react';

interface FileUploadProps {
  userId: string;
  onFileUploaded: (url: string, fileName: string) => void;
  onFileClear?: () => void;
  uploadedFile?: { url: string; name: string } | null;
  compact?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  userId,
  onFileUploaded,
  onFileClear,
  uploadedFile,
  compact = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 10MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('uploads')
      .upload(fileName, file);

    if (error) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName);

    onFileUploaded(urlData.publicUrl, file.name);
    setUploading(false);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    onFileClear?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (uploadedFile) {
    return (
      <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
        <FileIcon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm truncate flex-1">{uploadedFile.name}</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleClear}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelect}
        accept="*/*"
      />
      <Button
        variant="ghost"
        size={compact ? 'icon' : 'sm'}
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        type="button"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Paperclip className="h-4 w-4" />
            {!compact && <span className="ml-2">Attach File</span>}
          </>
        )}
      </Button>
    </>
  );
};

export default FileUpload;
