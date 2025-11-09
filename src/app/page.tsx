'use client';

import TiffinDashboard from '@/components/tiffin-dashboard';
import { UtensilsCrossed } from 'lucide-react';
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
      <div className="flex h-screen w-full flex-col bg-background">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm md:px-6">
          <div className="flex items-center gap-3">
            <UtensilsCrossed className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold font-headline text-foreground">
              TiffinTrack
            </h1>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.displayName || user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
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
