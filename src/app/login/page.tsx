'use client';

import { useAuth } from '@/firebase';
import { GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, LogIn } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/provider';

export default function LoginPage() {
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google: ', error);
    }
  };

  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <UtensilsCrossed className="mb-4 h-16 w-16 text-primary" />
          <h1 className="text-4xl font-bold font-headline text-foreground">
            TiffinTrack
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to manage your tiffin service.
          </p>
        </div>

        <div className="mt-8">
          <Button
            onClick={handleGoogleSignIn}
            className="w-full"
            variant="default"
            size="lg"
          >
            <LogIn className="mr-2 h-5 w-5" />
            Sign In with Google
          </Button>
        </div>
         <p className="mt-8 px-8 text-center text-sm text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
      </div>
    </div>
  );
}
