'use client';

import { cn } from '@/lib/utils';

interface TiffinLoaderProps {
  className?: string;
  text?: string;
}

export default function TiffinLoader({
  className,
  text = 'Loading...',
}: TiffinLoaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4',
        className
      )}
    >
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      <p className="text-lg text-muted-foreground">{text}</p>
    </div>
  );
}
