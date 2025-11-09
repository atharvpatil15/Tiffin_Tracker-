'use client';

import TiffinDashboard from '@/components/tiffin-dashboard';
import { Card, CardContent } from '@/components/ui/card';
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
      <div className="min-h-screen w-full bg-background">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm md:px-6">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold font-headline text-foreground">
              TiffinTrack
            </h1>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.displayName || user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          )}
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <TiffinDashboard />
        </main>
      </div>
    </AuthWrapper>
  );
}
