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
    // Wait until user loading is complete
    if (isUserLoading) {
      return;
    }

    // If no user, redirect to login
    if (!user) {
      router.push('/login');
      return;
    }

    // Once user is loaded, wait for user doc loading to complete
    if (isUserDocLoading) {
      return;
    }

    // After user doc has been checked
    if (userData === null) {
      // User is authenticated but has no profile document.
      // This is the state where we should redirect to create a profile,
      // which includes the phone number.
      // The creation logic itself is in tiffin-dashboard.tsx.
      // However, if the phone number is a mandatory step, this is the place to redirect.
      if (!window.location.pathname.includes('/phone-verification')) {
        router.push('/phone-verification');
      }
    } else if (!userData.phoneNumber) {
      // User has a profile but is missing a phone number.
      if (!window.location.pathname.includes('/phone-verification')) {
        router.push('/phone-verification');
      }
    }
  }, [user, isUserLoading, router, userData, isUserDocLoading]);

  const isLoading = isUserLoading || isUserDocLoading;

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <TiffinLoader />
      </div>
    );
  }
  
  if (!userData?.phoneNumber && !window.location.pathname.includes('/phone-verification')) {
     return (
      <div className="flex min-h-screen items-center justify-center">
        <TiffinLoader text="Redirecting to add phone number..." />
      </div>
    );
  }


  return <>{children}</>;
}
