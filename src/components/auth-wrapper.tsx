'use client';

import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import TiffinLoader from './tiffin-loader';
import type { UserData } from '@/lib/types';
import { doc } from 'firebase/firestore';

interface AuthWrapperProps {
  children: ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userData, isLoading: isUserDocLoading } =
    useDoc<UserData>(userDocRef);

  useEffect(() => {
    // Wait until authentication is resolved
    if (isUserLoading) {
      return;
    }

    // If no user is logged in, redirect to the login page
    if (!user) {
      router.push('/login');
      return;
    }

    // Once auth is resolved, wait for the user's document to be loaded
    if (isUserDocLoading) {
      return;
    }
    
    // If user document is loaded and phone number is missing, redirect to verification page
    // This check runs only after we are sure about the user's auth and data state.
    if ((!userData || !userData.phoneNumber) && !window.location.pathname.includes('/phone-verification')) {
        router.push('/phone-verification');
    }

  }, [user, isUserLoading, userData, isUserDocLoading, router]);
  
  const isLoading = isUserLoading || isUserDocLoading;

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <TiffinLoader />
      </div>
    );
  }
  
  // This condition will briefly be true while the router is transitioning after the push command.
  // It shows a loader instead of a brief flash of the old page.
  if ((!userData || !userData.phoneNumber) && !window.location.pathname.includes('/phone-verification')) {
     return (
      <div className="flex min-h-screen items-center justify-center">
        <TiffinLoader text="Redirecting..." />
      </div>
    );
  }


  return <>{children}</>;
}
