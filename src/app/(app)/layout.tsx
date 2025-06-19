"use client";

import React from 'react';
import { BotMessageSquare } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { Header } from '@/components/layout/Header';
import { SidebarNav } from '@/components/layout/SidebarNav';
import { BottomNavBar } from '@/components/layout/BottomNavBar';
import { APP_NAME } from '@/lib/constants';
import Link from 'next/link';

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { isMobile } = useSidebar();

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 pb-[calc(4rem+1rem)]"> {/* Adjusted padding for bottom nav (h-16 is 4rem) */}
          {children}
        </main>
        <BottomNavBar />
      </div>
    );
  }

  // Desktop layout
  return (
    <>
      <Sidebar variant="sidebar" collapsible="icon" className="border-r">
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <BotMessageSquare className="h-7 w-7 text-primary" />
            <span className="font-headline text-xl font-semibold group-data-[collapsible=icon]:hidden">{APP_NAME}</span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-2 group-data-[collapsible=icon]:hidden">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} {APP_NAME}</p>
        </SidebarFooter>
      </Sidebar>
      <SidebarRail />
      <SidebarInset className="flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
}
