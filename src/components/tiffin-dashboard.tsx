'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, startOfDay } from 'date-fns';
import {
  useFirestore,
  useUser,
  useCollection,
  useDoc,
  setDocumentNonBlocking,
  updateDocumentNonBlocking,
  useMemoFirebase,
} from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

import type { UserData, TiffinDay, TiffinOrder } from '@/lib/types';
import TiffinCalendar from './tiffin-calendar';
import BillingSummary from './billing-summary';
import TiffinEditor from './tiffin-editor';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import TiffinLoader from './tiffin-loader';

const TiffinDashboard = () => {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [month, setMonth] = useState(new Date());

  const [editorState, setEditorState] = useState<{
    open: boolean;
    date: Date | null;
  }>({ open: false, date: null });

  const userDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userData, isLoading: isUserDocLoading } = useDoc<UserData>(userDocRef);

  const tiffinOrdersRef = useMemoFirebase(
    () => (user ? collection(firestore, 'users', user.uid, 'tiffinOrders') : null),
    [firestore, user]
  );

  const {
    data: tiffinData,
    isLoading: isTiffinLoading,
    error: tiffinError,
  } = useCollection<TiffinOrder>(tiffinOrdersRef);
  
  useEffect(() => {
    if (!isUserLoading && user && !isUserDocLoading && !userData) {
      const newUser: UserData = {
        name: user.displayName || 'New User',
        email: user.email || '',
        billingStartDate: 1,
      };
      const userRef = doc(firestore, 'users', user.uid);
      setDoc(userRef, newUser).catch((e) =>
        console.error('Failed to create user profile:', e)
      );
    }
  }, [user, isUserLoading, userData, isUserDocLoading, firestore]);

  const handleDayClick = (date: Date) => {
    setEditorState({ open: true, date: startOfDay(date) });
  };

  const handleEditorSave = (meals: TiffinDay) => {
    if (!editorState.date || !user) return;

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

  const handleBillingDateChange = (newDate: number) => {
    if (!userDocRef) return;
    updateDocumentNonBlocking(userDocRef, { billingStartDate: newDate });
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

  const isLoading = isUserLoading || isUserDocLoading || isTiffinLoading;

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-4 md:p-6">
        <TiffinLoader />
      </div>
    );
  }

  if (tiffinError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {tiffinError.message ||
              'Failed to load tiffin data. Check your connection and permissions.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const fullUserData = userData ? { ...userData, tiffins: tiffinLog, id: user!.uid, displayName: user!.displayName || user!.email || '' } : null;

  return (
    <>
      <div className="grid h-full grid-cols-1 items-start gap-8 p-4 md:p-8 lg:grid-cols-5 xl:grid-cols-3">
        <div className="lg:col-span-3 xl:col-span-2 flex justify-center">
          <Card className="w-full max-w-2xl p-2 sm:p-4">
              <TiffinCalendar
                tiffinLog={tiffinLog}
                onDayClick={handleDayClick}
                month={month}
                setMonth={setMonth}
              />
          </Card>
        </div>
        <div className="lg:col-span-2 xl:col-span-1 space-y-6">
          {fullUserData && (
            <BillingSummary
              user={fullUserData}
              onBillingDateChange={handleBillingDateChange}
            />
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
