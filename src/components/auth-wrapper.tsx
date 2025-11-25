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
  const { data: userData, isLoading: isUserDocLoading } = useDoc<UserData>(userDocRef);

  useEffect(() => {
    if (isUserLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (!isUserDocLoading && userData) {
      // User document exists, check for phone verification
      if (!userData.phoneVerified) {
        router.push('/phone-verification');
      }
    }
  }, [user, isUserLoading, router, userData, isUserDocLoading]);
  
  const isLoading = isUserLoading || isUserDocLoading;

  if (isLoading || !user || !userData || !userData.phoneVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <TiffinLoader />
      </div>
    );
  }

  return <>{children}</>;
}
