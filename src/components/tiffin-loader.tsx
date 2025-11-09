'use client';

import { UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TiffinLoaderProps {
  className?: string;
  text?: string;
}

export default function TiffinLoader({ className, text = 'Loading...' }: TiffinLoaderProps) {
  return (
    <div
      className={cn('flex flex-col items-center justify-center gap-4', className)}
    >
      <UtensilsCrossed className="h-16 w-16 animate-spin text-primary" />
      <p className="text-lg text-muted-foreground">{text}</p>
    </div>
  );
}
