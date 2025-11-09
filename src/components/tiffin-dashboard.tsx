"use client";

import { useState, useEffect } from "react";
import { get, ref, onValue, set, update } from "firebase/database";
import { format } from "date-fns";
import { database } from "@/lib/firebase";
import type { UserData, MealType, TiffinDay } from "@/lib/types";
import { USERS } from "@/lib/constants";
import UserSwitcher from "./user-switcher";
import TiffinCalendar from "./tiffin-calendar";
import BillingSummary from "./billing-summary";
import TiffinEditor from "./tiffin-editor";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

type AllUsersData = Record<(typeof USERS)[number]["id"], UserData>;

const TiffinDashboard = () => {
  const [activeUserId, setActiveUserId] = useState<(typeof USERS)[number]["id"]>(USERS[0].id);
  const [allUsersData, setAllUsersData] = useState<AllUsersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [month, setMonth] = useState(new Date());

  const [editorState, setEditorState] = useState<{
    open: boolean;
    date: Date | null;
  }>({ open: false, date: null });

  useEffect(() => {
    const usersRef = ref(database, 'users');

    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        // Ensure default values are present
        for (const userId in data) {
          if (!data[userId].billingStartDate) {
            data[userId].billingStartDate = 1;
          }
           if (!data[userId].name) {
            data[userId].name = USERS.find(u => u.id === userId)?.name || 'User';
          }
           if (!data[userId].tiffins) {
            data[userId].tiffins = {};
          }
        }
        setAllUsersData(data);

      } else {
        // Initialize data if it doesn't exist in Firebase
        const initialData: AllUsersData = {
          user1: { name: 'User 1', billingStartDate: 21, tiffins: {} },
          user2: { name: 'User 2', billingStartDate: 1, tiffins: {} },
        };
        set(usersRef, initialData).catch(e => console.error("Failed to initialize data:", e));
        setAllUsersData(initialData);
      }
      setLoading(false);
    }, (err) => {
      console.error(err);
      setError("Failed to connect to the database. Please check your Firebase setup and network connection.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDayClick = (date: Date) => {
    setEditorState({ open: true, date });
  };

  const handleEditorSave = (meals: TiffinDay) => {
    if (!editorState.date) return;
    const dateKey = format(editorState.date, "yyyy-MM-dd");
    const tiffinRef = ref(database, `users/${activeUserId}/tiffins/${dateKey}`);
    
    // Filter out meals that are false
    const mealsToSave = Object.entries(meals).reduce((acc, [meal, value]) => {
      if (value) {
        acc[meal as MealType] = true;
      }
      return acc;
    }, {} as Partial<TiffinDay>);

    set(tiffinRef, Object.keys(mealsToSave).length > 0 ? mealsToSave : null)
      .then(() => {
        setEditorState({ open: false, date: null });
      })
      .catch((err) => {
        console.error("Failed to save tiffin data: ", err);
        setError("Could not save your changes. Please try again.");
      });
  };

  const handleBillingDateChange = (newDate: number) => {
    const userRef = ref(database, `users/${activeUserId}`);
    update(userRef, { billingStartDate: newDate })
      .catch((err) => {
        console.error("Failed to update billing date: ", err);
        setError("Could not save billing date. Please try again.");
      });
  };

  const activeUserData = allUsersData ? allUsersData[activeUserId] : null;

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div className="xl:col-span-3 lg:col-span-2">
            <Skeleton className="h-[96px] w-full mb-4"/>
            <Skeleton className="h-[600px] w-full" />
        </div>
        <div className="lg:col-span-1 xl:col-span-1">
            <Skeleton className="h-[400px] w-full"/>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
    );
  }

  return (
    <>
      <UserSwitcher activeUser={activeUserId} onUserChange={setActiveUserId} />
      <div className="mt-4 grid flex-1 items-start gap-4 lg:grid-cols-3 xl:grid-cols-4">
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 xl:col-span-3">
          {activeUserData && (
            <TiffinCalendar
              tiffinLog={activeUserData.tiffins || {}}
              onDayClick={handleDayClick}
              month={month}
              setMonth={setMonth}
            />
          )}
        </div>
        <div className="lg:col-span-1 xl:col-span-1">
           {activeUserData && (
            <BillingSummary
                user={activeUserData}
                onBillingDateChange={handleBillingDateChange}
            />
           )}
        </div>
      </div>
      {editorState.date && (
        <TiffinEditor
          open={editorState.open}
          onOpenChange={(open) => setEditorState({ open, date: open ? editorState.date : null })}
          date={editorState.date}
          initialMeals={activeUserData?.tiffins?.[format(editorState.date, "yyyy-MM-dd")] || {}}
          onSave={handleEditorSave}
        />
      )}
    </>
  );
};

export default TiffinDashboard;
