import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';

export function AuthPanel() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setErrorMessage('');

    try {
      if (mode === 'sign-in') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) {
          setMessage('Check your email to confirm your account, then come back to sign in.');
        }
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Authentication failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-md space-y-6">
        <Button variant="ghost" onClick={() => navigate('/')} className="-ml-3">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to home
        </Button>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {mode === 'sign-in' ? <ShieldCheck className="h-6 w-6" /> : <Mail className="h-6 w-6" />}
          </div>
          <h1 className="text-2xl font-bold">{mode === 'sign-in' ? 'Sign in to continue' : 'Create your account'}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Avatar generation uses paid AI credits. Sign in first; each account is limited to five generations per hour.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="auth-email">Email</Label>
              <Input id="auth-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auth-password">Password</Label>
              <Input
                id="auth-password"
                type="password"
                autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                minLength={mode === 'sign-up' ? 8 : undefined}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              {mode === 'sign-up' && <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>}
            </div>
            {message && <p role="status" className="text-sm text-primary">{message}</p>}
            {errorMessage && <p role="alert" className="text-sm text-destructive">{errorMessage}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'sign-in' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {mode === 'sign-in' ? 'New here?' : 'Already have an account?'}{' '}
            <button
              type="button"
              className="font-medium text-primary underline-offset-4 hover:underline"
              onClick={() => { setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); setMessage(''); setErrorMessage(''); }}
            >
              {mode === 'sign-in' ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </section>
      </div>
    </main>
  );
}
