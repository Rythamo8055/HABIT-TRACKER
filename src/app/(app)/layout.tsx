
import React from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNavBar } from '@/components/layout/BottomNavBar';
import { cn } from '@/lib/utils';

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className={cn(
        "flex-1 overflow-y-auto p-4 pb-[calc(6rem+env(safe-area-inset-bottom))] md:p-6 lg:p-8",
        "no-scrollbar"
      )}>
        {children}
      </main>
      <BottomNavBar />
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutContent>{children}</AppLayoutContent>;
}
