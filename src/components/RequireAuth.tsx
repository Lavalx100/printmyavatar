import { Loader2 } from 'lucide-react';
import { AuthPanel } from '@/components/AuthPanel';
import { useAuth } from '@/contexts/AuthContext';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Checking your session…
      </div>
    );
  }
  return session ? children : <AuthPanel />;
}
