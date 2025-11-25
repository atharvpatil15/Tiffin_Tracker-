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

  const shouldRedirect =
    !isUserLoading &&
    user &&
    !isUserDocLoading &&
    (!userData || !userData.phoneNumber) &&
    !window.location.pathname.includes('/phone-verification');

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

    // Once auth is resolved, wait for the user's document to be loaded or confirmed non-existent
    if (isUserDocLoading) {
      return;
    }
    
    // Now we know for sure whether the user doc exists and if it has a phone number.
    // If the document or phone number is missing, and we're not already on the verification page, redirect.
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
  
  if (shouldRedirect) {
     return (
      <div className="flex min-h-screen items-center justify-center">
        <TiffinLoader text="Redirecting..." />
      </div>
    );
  }


  return <>{children}</>;
}
