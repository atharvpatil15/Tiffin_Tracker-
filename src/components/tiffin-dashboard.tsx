'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, startOfDay } from 'date-fns';
import {
  useFirestore,
  useUser,
  useCollection,
  useDoc,
  setDocumentNonBlocking,
  useMemoFirebase,
} from '@/firebase';
import { collection, doc, setDoc, updateDoc } from 'firebase/firestore';

import type { UserData, TiffinDay, TiffinOrder } from '@/lib/types';
import TiffinCalendar from './tiffin-calendar';
import BillingSummary from './billing-summary';
import TiffinEditor from './tiffin-editor';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import TiffinLoader from './tiffin-loader';
import { useToast } from '@/hooks/use-toast';

const TiffinDashboard = () => {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [month, setMonth] = useState(new Date());
  const { toast } = useToast();

  const [editorState, setEditorState] = useState<{
    open: boolean;
    date: Date | null;
  }>({ open: false, date: null });

  const userDocRef = useMemoFirebase(
    () => (firestore && user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userData, isLoading: isUserDocLoading, error: userDocError } = useDoc<UserData>(userDocRef);

  const tiffinOrdersRef = useMemoFirebase(
    () => (firestore && user ? collection(firestore, 'users', user.uid, 'tiffinOrders') : null),
    [firestore, user]
  );

  const {
    data: tiffinData,
    isLoading: isTiffinLoading,
    error: tiffinError,
  } = useCollection<TiffinOrder>(tiffinOrdersRef);
  
  useEffect(() => {
    const createNewUserDocIfNeeded = async () => {
      // Conditions to create a new user doc:
      // 1. Auth is resolved and we have a user object.
      // 2. The user document loading is complete (`isUserDocLoading` is false).
      // 3. The user document does not exist (`userData` is null).
      // 4. There was no error fetching the document (`userDocError` is null).
      // 5. We have a valid `userDocRef`.
      if (!isUserLoading && user && !isUserDocLoading && !userData && !userDocError && userDocRef) {
        console.log("Creating new user document for UID:", user.uid);
        const newUser: UserData = {
          name: user.displayName || user.email || 'New User',
          email: user.email || '',
          billingStartDate: 1, // Default billing start date
        };
        try {
          // Use `setDoc` for this one-time creation. No `await` is needed if we trust the `useDoc` hook to update.
          // However, for this critical step, `await` ensures it completes before any other logic might depend on it.
          await setDoc(userDocRef, newUser);
           toast({
             title: 'Profile Created',
             description: 'Your TiffinTrack profile has been set up.',
           });
        } catch (error) {
           console.error("Failed to create user document:", error);
           toast({
                variant: 'destructive',
                title: 'Error creating profile',
                description: 'Could not save your user profile. Please refresh and try again.',
           });
        }
      }
    }
    createNewUserDocIfNeeded();
  }, [user, isUserLoading, userData, isUserDocLoading, userDocError, userDocRef, toast]);


  const handleDayClick = (date: Date) => {
    setEditorState({ open: true, date: startOfDay(date) });
  };

  const handleEditorSave = (meals: TiffinDay) => {
    if (!editorState.date || !user || !firestore) return;

    const dateKey = format(editorState.date, 'yyyy-MM-dd');
    const orderId = dateKey;
    const tiffinDocRef = doc(
      firestore,
      'users',
      user.uid,
      'tiffinOrders',
      orderId
    );

    const mealsToSave: Partial<TiffinOrder> = {
      userId: user.uid,
      date: dateKey,
      breakfast: meals.breakfast || false,
      lunch: meals.lunch || false,
      dinner: meals.dinner || false,
    };

    setDocumentNonBlocking(tiffinDocRef, mealsToSave, { merge: true });
    setEditorState({ open: false, date: null });
  };

  const handleBillingDateChange = async (newDate: number) => {
    if (!userDocRef) {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'User profile not found. Cannot update billing date.',
      });
      return;
    }
    try {
      // Use `updateDoc` which is the correct operation for modifying an existing document.
      await updateDoc(userDocRef, { billingStartDate: newDate });
      toast({
        title: 'Success!',
        description: `Billing start date changed to the ${newDate}th of the month.`,
      });
    } catch (error) {
      console.error('Failed to update billing date:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Failed to save the new billing date. Please check your connection and try again.',
      });
    }
  };

  const tiffinLog = useMemo(() => {
    if (!tiffinData) return {};
    return tiffinData.reduce((acc, order) => {
      acc[order.date] = {
        breakfast: order.breakfast,
        lunch: order.lunch,
        dinner: order.dinner,
      };
      return acc;
    }, {} as { [date: string]: Partial<TiffinDay> });
  }, [tiffinData]);
  
  // Combined loading state. We are loading if auth is loading OR if user doc is loading.
  const isLoading = isUserLoading || isUserDocLoading;

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-4 md:p-6">
        <TiffinLoader />
      </div>
    );
  }

  const combinedError = userDocError || tiffinError;
  if (combinedError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {combinedError.message ||
              'Failed to load data. Check your connection and permissions.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const fullUserData = userData && user ? { ...userData, tiffins: tiffinLog, id: user.uid, displayName: user.displayName || user.email || '' } : null;

  return (
    <>
      <div className="grid h-full grid-cols-1 items-start gap-8 p-4 md:p-8 lg:grid-cols-5 xl:grid-cols-3">
        <div className="lg:col-span-3 xl:col-span-2 flex justify-center">
          <Card className="w-full max-w-2xl p-2 sm:p-4">
            {isTiffinLoading ? <TiffinLoader text="Loading meals..."/> : (
              <TiffinCalendar
                tiffinLog={tiffinLog}
                onDayClick={handleDayClick}
                month={month}
                setMonth={setMonth}
              />
            )}
          </Card>
        </div>
        <div className="lg:col-span-2 xl:col-span-1 space-y-6">
          {fullUserData ? (
            <BillingSummary
              user={fullUserData}
              onBillingDateChange={handleBillingDateChange}
            />
          ) : (
            <Card className="flex items-center justify-center p-6 h-64">
                <p className="text-muted-foreground">Waiting for user data...</p>
            </Card>
          )}
        </div>
      </div>
      {editorState.date && (
        <TiffinEditor
          open={editorState.open}
          onOpenChange={(open) =>
            setEditorState({ open, date: open ? editorState.date : null })
          }
          date={editorState.date}
          initialMeals={
            tiffinLog[format(editorState.date, 'yyyy-MM-dd')] || {}
          }
          onSave={handleEditorSave}
        />
      )}
    </>
  );
};

export default TiffinDashboard;
