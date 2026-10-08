import { NavLink } from '@/components/NavLink';
import { Sparkles, Clock, ShoppingBag, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          <NavLink
            to="/create"
            className="flex flex-col items-center gap-1 px-4 py-2 transition-colors"
            activeClassName="text-primary"
            pendingClassName="text-muted-foreground"
          >
            {({ isActive }) => (
              <>
                <Sparkles className="w-6 h-6" />
                <span className="text-xs font-medium">Creation</span>
              </>
            )}
          </NavLink>

          <NavLink
            to="/history"
            className="flex flex-col items-center gap-1 px-4 py-2 transition-colors text-muted-foreground"
            activeClassName="!text-primary"
          >
            <Clock className="w-6 h-6" />
            <span className="text-xs font-medium">History</span>
          </NavLink>

          <NavLink
            to="/order"
            className="flex flex-col items-center gap-1 px-4 py-2 transition-colors text-muted-foreground"
            activeClassName="!text-primary"
          >
            <ShoppingBag className="w-6 h-6" />
            <span className="text-xs font-medium">Orders</span>
          </NavLink>

          <NavLink
            to="/account"
            className="flex flex-col items-center gap-1 px-4 py-2 transition-colors text-muted-foreground"
            activeClassName="!text-primary"
          >
            <User className="w-6 h-6" />
            <span className="text-xs font-medium">My Account</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
