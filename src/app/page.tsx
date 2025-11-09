'use client';

import TiffinDashboard from '@/components/tiffin-dashboard';
import { UtensilsCrossed, LogOut } from 'lucide-react';
import AuthWrapper from '@/components/auth-wrapper';
import { useAuth, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';

export default function Home() {
  const auth = useAuth();
  const { user } = useUser();

  const handleSignOut = () => {
    if (auth) {
      auth.signOut();
    }
  };

  return (
    <AuthWrapper>
      <div className="flex h-screen w-full flex-col bg-transparent">
        <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between border-b border-white/10 bg-background/50 px-4 backdrop-blur-lg md:px-6">
          <div className="flex items-center gap-3">
            <UtensilsCrossed className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold font-headline text-white">
              TiffinTrack
            </h1>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.displayName || user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                 <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          )}
        </header>
        <main className="flex-1 overflow-auto">
          <TiffinDashboard />
        </main>
      </div>
    </AuthWrapper>
  );
}
