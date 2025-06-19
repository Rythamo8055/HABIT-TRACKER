"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, BotMessageSquare } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { APP_NAME, NAV_ITEMS } from "@/lib/constants";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { CommandKDialog } from "@/components/shared/CommandKDialog";
import { useState } from "react";

export function Header() {
  const { isMobile } = useSidebar();
  const [isCommandKOpen, setIsCommandKOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      {isMobile ? (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden h-9 w-9">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col bg-sidebar text-sidebar-foreground">
            <nav className="grid gap-2 text-lg font-medium">
              <Link
                href="/"
                className="flex items-center gap-2 text-lg font-semibold mb-4 text-primary"
              >
                <BotMessageSquare className="h-7 w-7" />
                <span>{APP_NAME}</span>
              </Link>
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      ) : (
        <SidebarTrigger className="hidden md:flex h-9 w-9" />
      )}

      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <Link href="/" className="flex items-center gap-2 md:hidden">
          <BotMessageSquare className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">{APP_NAME}</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setIsCommandKOpen(true)} className="h-9 w-9">
            <BotMessageSquare className="h-5 w-5" />
            <span className="sr-only">Open AI Command Bar</span>
          </Button>
          <ThemeToggle />
        </div>
      </div>
      <CommandKDialog open={isCommandKOpen} onOpenChange={setIsCommandKOpen} />
    </header>
  );
}
