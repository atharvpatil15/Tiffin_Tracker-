export type MealType = 'breakfast' | 'lunch' | 'dinner';

export type TiffinDay = {
  breakfast: number;
  lunch: number;
  dinner: number;
};

export type TiffinLog = {
  [date: string]: Partial<TiffinDay>; // date format YYYY-MM-DD
};

export interface UserData {
  name: string;
  email: string;
  billingStartDate: number;
  phoneNumber?: string;
  phoneVerified?: boolean;
}

export interface TiffinOrder {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  breakfast: number;
  lunch: number;
  dinner: number;
}
