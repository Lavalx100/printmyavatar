import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { useAvatar } from '@/contexts/AvatarContext';
import { format } from 'date-fns';
import { Clock, ArrowRight } from 'lucide-react';

export default function History() {
  const navigate = useNavigate();
  const { history, setCurrentAvatar } = useAvatar();

  const handleAvatarClick = (avatar: typeof history[0]) => {
    setCurrentAvatar(avatar);
    navigate('/create');
  };

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="bg-card border-b border-border sticky top-0 z-30">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <h1 className="text-2xl font-bold text-center">History</h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-muted mx-auto flex items-center justify-center">
            <Clock className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">No avatars yet</h2>
          <p className="text-muted-foreground">
            Create your first avatar to see it appear here
          </p>
        </div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-center">History</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-4">
          {history.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => handleAvatarClick(avatar)}
              className="group relative bg-card rounded-2xl overflow-hidden transition-all hover:scale-105"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              {/* Avatar Image */}
              <div className="aspect-square relative">
                <img
                  src={avatar.thumbnailUrl || avatar.imageUrl}
                  alt="Avatar thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Hover Action */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-3 space-y-1">
                <p className="text-sm font-medium capitalize truncate">
                  {avatar.category || 'Personal'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(avatar.createdAt, 'MMM d, yyyy')}
                </p>
                {avatar.notes.length > 1 && (
                  <div className="flex items-center gap-1 text-xs text-primary">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>{avatar.notes.length - 1} modifications</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
