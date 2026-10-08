import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/BottomNav';
import { CategoryCarousel } from '@/components/CategoryCarousel';
import { AvatarPreviewCard } from '@/components/AvatarPreviewCard';
import { ChatPanel } from '@/components/ChatPanel';
import { useAvatar } from '@/contexts/AvatarContext';
import { processAvatar } from '@/lib/avatarAI';
import { Upload, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export default function Create() {
  const navigate = useNavigate();
  const { currentAvatar, setCurrentAvatar, options, updateOption, addToHistory } = useAvatar();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsProcessing(true);
    toast.loading('Generating your avatar...', { id: 'processing' });

    try {
      // MOCK: Process avatar (currently returns same image)
      const result = await processAvatar(file, options);
      setCurrentAvatar(result);
      addToHistory(result);
      toast.success('Avatar generated successfully!', { id: 'processing' });
    } catch (error) {
      console.error('Avatar processing error:', error);
      toast.error('Failed to generate avatar', { id: 'processing' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    updateOption('category', categoryId);
  };

  const handleProceedToOrder = () => {
    if (!currentAvatar) {
      toast.error('Please create an avatar first');
      return;
    }
    navigate('/order');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-center">Creation Workshop</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Category Selection */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Choose Category</h2>
          <CategoryCarousel
            selectedCategory={options.category}
            onSelectCategory={handleCategorySelect}
          />
          
          {/* Number of People Selector (only for Multiple category) */}
          {options.category === 'multiple' && (
            <div className="flex items-center gap-3 p-4 bg-card rounded-2xl border border-border">
              <label className="text-sm font-medium flex-shrink-0">Number of People:</label>
              <div className="flex gap-2">
                {[2, 3, 4, 5].map((count) => (
                  <Button
                    key={count}
                    variant={options.peopleCount === count ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateOption('peopleCount', count.toString())}
                    className="rounded-full w-10 h-10 p-0"
                  >
                    {count}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar Preview Card */}
        <div className="relative">
          <AvatarPreviewCard avatar={currentAvatar} showDownload />

          {/* Upload Button Overlay (shown when no avatar) */}
          {!currentAvatar && !isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                size="lg"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full px-8 py-6"
                style={{ boxShadow: 'var(--shadow-soft)' }}
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload a Photo
              </Button>
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-3xl backdrop-blur-sm">
              <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                <div>
                  <p className="font-semibold">Generating your avatar</p>
                  <p className="text-sm text-muted-foreground">This may take a few seconds...</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {currentAvatar && (
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full rounded-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload New Photo
            </Button>

            <Button
              variant="secondary"
              className="w-full rounded-full"
              onClick={() => setShowChatPanel(true)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Refine with AI
            </Button>

            <Button
              className="w-full rounded-full"
              size="lg"
              onClick={handleProceedToOrder}
            >
              (Prototype) Proceed to Order
            </Button>
          </div>
        )}

        {/* Chat Panel Overlay */}
        {showChatPanel && (
          <>
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
              onClick={() => setShowChatPanel(false)}
            />
            <div className="fixed inset-x-0 bottom-20 top-20 md:top-auto md:bottom-24 md:right-4 md:left-auto md:w-96 z-40">
              <ChatPanel onClose={() => setShowChatPanel(false)} />
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
