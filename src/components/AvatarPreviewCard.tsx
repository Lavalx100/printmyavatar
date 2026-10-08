import { AvatarResult } from '@/lib/avatarAI';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AvatarPreviewCardProps {
  avatar: AvatarResult | null;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  showDownload?: boolean;
}

export function AvatarPreviewCard({ avatar, className, size = 'large', showDownload = false }: AvatarPreviewCardProps) {
  const handleDownload = async () => {
    if (!avatar?.imageUrl) return;
    
    try {
      const response = await fetch(avatar.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `avatar-${avatar.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Avatar downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download avatar');
    }
  };
  const sizeClasses = {
    small: 'h-32',
    medium: 'h-48',
    large: 'h-80',
  };

  return (
    <div
      className={cn(
        'relative bg-card rounded-3xl overflow-hidden',
        'transition-all duration-300',
        className
      )}
      style={{
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* 3D Base Platform Effect */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-gradient-to-t from-muted/40 to-transparent rounded-full blur-sm" />
      
      {/* Avatar Image Container */}
      <div className={cn('relative flex items-end justify-center p-6', sizeClasses[size])}>
        {avatar ? (
          <>
            <img
              src={avatar.imageUrl}
              alt="Avatar preview"
              className="w-full h-full object-contain drop-shadow-2xl"
              style={{
                filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.15))',
              }}
            />
            {showDownload && (
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2 rounded-full"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
            <div className="w-32 h-32 rounded-full bg-muted/50 mb-4" />
            <p className="text-sm">No avatar yet</p>
            <p className="text-xs">Upload a photo to get started</p>
          </div>
        )}
      </div>

      {/* Modification Tags */}
      {avatar && avatar.notes.length > 1 && (
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {avatar.notes.slice(1, 4).map((note, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary font-medium"
              >
                {note.replace('AI Modification: ', '').slice(0, 30)}
                {note.length > 30 ? '...' : ''}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
