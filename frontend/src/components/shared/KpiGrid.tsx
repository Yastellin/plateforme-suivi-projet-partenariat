// src/components/shared/KpiGrid.tsx

import { cn } from '@/lib/utils';

export function KpiGrid({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('mb-[22px] grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {children}
    </div>
  );
}