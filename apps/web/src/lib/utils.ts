import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const gradeColors: Record<string, string> = {
  A: 'text-emerald-400',
  'A+': 'text-emerald-300',
  B: 'text-emerald-300',
  C: 'text-amber-400',
  F: 'text-rose-400'
};
