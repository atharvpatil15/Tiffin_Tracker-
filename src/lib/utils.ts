import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { addMonths, subMonths, getDate, eachDayOfInterval, format } from 'date-fns';
import type { TiffinLog } from './types';
import { MEAL_PRICES } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
