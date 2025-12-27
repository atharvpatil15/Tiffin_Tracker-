'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import TiffinLoader from './tiffin-loader';

interface AuthWrapperProps {
  children: ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If auth state is still resolving, do nothing.
    if (isUserLoading) {
      return;
    }

    // If no user is logged in after auth has resolved, redirect to the login page.
    if (!user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // While checking for authentication or if there's no user (and redirecting), show a loader.
  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <TiffinLoader />
      </div>
    );
  }

  // If user is logged in, render the children.
  return <>{children}</>;
}
