"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BotMessageSquare } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { APP_NAME } from "@/lib/constants";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { CommandKDialog } from "@/components/shared/CommandKDialog";
import { useState } from "react";

export function Header() {
  const { isMobile } = useSidebar();
  const [isCommandKOpen, setIsCommandKOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      {!isMobile && (
        <SidebarTrigger className="h-9 w-9" />
      )}

      <div className="flex w-full items-center gap-4">
        {isMobile && (
           <Link href="/" className="flex items-center gap-2 mr-auto">
              <BotMessageSquare className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">{APP_NAME}</span>
          </Link>
        )}
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
