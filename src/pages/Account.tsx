import { useState, useEffect } from 'react';
import { BottomNav } from '@/components/BottomNav';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Mail, Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function Account() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('en');

  // Load from localStorage on mount
  useEffect(() => {
    const savedAccount = localStorage.getItem('userAccount');
    if (savedAccount) {
      try {
        const data = JSON.parse(savedAccount);
        setName(data.name || '');
        setEmail(data.email || '');
        setLanguage(data.language || 'en');
      } catch (e) {
        console.error('Failed to load account:', e);
      }
    }
  }, []);

  const handleSave = () => {
    const accountData = { name, email, language };
    localStorage.setItem('userAccount', JSON.stringify(accountData));
    toast.success('Account settings saved!');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-center">My Account</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Picture Placeholder */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <User className="w-12 h-12 text-primary-foreground" />
          </div>
        </div>

        {/* Account Form */}
        <div className="bg-card rounded-2xl p-6 space-y-6" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Display Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
            />
            <p className="text-xs text-muted-foreground">
              No authentication required - for contact purposes only
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language" className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              Interface Language
            </Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Prototype: Language selection stored but not implemented
            </p>
          </div>

          <Button onClick={handleSave} className="w-full rounded-full" size="lg">
            Save Changes
          </Button>
        </div>

        {/* App Info */}
        <div className="text-center text-sm text-muted-foreground space-y-1">
          <p>3D Avatar Studio Prototype v1.0</p>
          <p>© 2026 Photography Studio</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
