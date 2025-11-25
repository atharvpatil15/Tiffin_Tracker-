'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import type { UserData } from '@/lib/types';
import { doc } from 'firebase/firestore';

import TiffinLoader from '@/components/tiffin-loader';
import PhoneVerificationForm from '@/components/phone-verification-form';
import { UtensilsCrossed } from 'lucide-react';

export default function PhoneVerificationPage() {
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

    if (!isUserDocLoading && userData?.phoneVerified) {
      router.push('/');
    }
  }, [user, isUserLoading, router, userData, isUserDocLoading]);
  
  const isLoading = isUserLoading || isUserDocLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <TiffinLoader />
      </div>
    );
  }

  if (!user) {
     return null; // or a redirect, handled by useEffect
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <UtensilsCrossed className="mb-4 h-16 w-16 text-primary" />
          <h1 className="text-4xl font-bold font-headline text-foreground">
            Verify Your Phone
          </h1>
          <p className="mt-2 text-muted-foreground">
            To enable WhatsApp bill reminders, please verify your phone number.
          </p>
        </div>

        <PhoneVerificationForm user={user} userDocRef={userDocRef} />
        
        <p className="mt-8 px-8 text-center text-sm text-muted-foreground">
          A 6-digit code will be sent to your mobile number via SMS.
        </p>
      </div>
    </div>
  );
}
