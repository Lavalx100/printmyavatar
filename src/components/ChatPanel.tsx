import { useState } from 'react';
import { Send, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AvatarPreviewCard } from './AvatarPreviewCard';
import { useAvatar } from '@/contexts/AvatarContext';
import { refineAvatar } from '@/lib/avatarAI';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatPanelProps {
  onClose: () => void;
}

export function ChatPanel({ onClose }: ChatPanelProps) {
  const { currentAvatar, setCurrentAvatar, addModification } = useAvatar();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: 'Please tell me how you would like to modify this avatar.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  // Track the latest refined avatar locally to ensure we always use the most recent version
  const [latestAvatar, setLatestAvatar] = useState(currentAvatar);

  const handleSend = async () => {
    if (!input.trim() || !currentAvatar || isProcessing) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    const userPrompt = input;
    setInput('');
    setIsProcessing(true);

    // Add loading message
    const loadingMessage: Message = {
      role: 'assistant',
      content: 'Generating your refined avatar...',
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Call AI refinement with the latest avatar to ensure cumulative changes
      const refined = await refineAvatar(latestAvatar, userPrompt);
      setCurrentAvatar(refined);
      setLatestAvatar(refined); // Update local state with the latest refined avatar
      addModification(userPrompt);

      // Replace loading message with success and show the image
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: 'assistant',
          content: `I've updated your avatar based on: "${userPrompt}"`,
        };
        return newMessages;
      });

      toast.success('Avatar refined successfully!');
    } catch (error) {
      console.error('Refinement error:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
        };
        return newMessages;
      });
      toast.error('Failed to refine avatar');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 md:relative md:inset-auto bg-background md:bg-card md:rounded-2xl md:shadow-lg flex flex-col h-screen md:h-auto md:max-h-[600px] z-40">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Refine with AI</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Avatar Preview */}
      <div className="p-4 border-b border-border">
        <AvatarPreviewCard avatar={latestAvatar} size="large" showDownload />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : message.role === 'system'
                  ? 'bg-muted text-muted-foreground text-center w-full'
                  : 'bg-accent text-accent-foreground'
              }`}
            >
              {message.role === 'assistant' && message.content.includes('Generating') ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{message.content}</span>
                </div>
              ) : (
                <p className="text-sm">{message.content}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="e.g., Make the hair blonde and eyes blue"
            disabled={isProcessing}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isProcessing || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
