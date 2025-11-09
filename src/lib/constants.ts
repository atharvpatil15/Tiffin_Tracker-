import type { UserID } from './types';

export const USERS: { id: UserID; name: string }[] = [
  { id: "user1", name: "User 1" },
  { id: "user2", name: "User 2" },
] as const;

export const MEAL_PRICES = {
  breakfast: 20,
  lunch: 50,
  dinner: 60,
};
