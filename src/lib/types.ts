import { USERS } from './constants';

export type UserID = (typeof USERS)[number]["id"];

export type MealType = "breakfast" | "lunch" | "dinner";

export type TiffinDay = {
  [key in MealType]: boolean;
};

export type TiffinLog = {
  [date: string]: Partial<TiffinDay>; // date format YYYY-MM-DD
};

export interface UserData {
  name: string;
  billingStartDate: number;
  tiffins: TiffinLog;
}
