
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BotMessageSquare } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { APP_NAME } from "@/lib/constants";
import { CommandKDialog } from "@/components/shared/CommandKDialog";
import { useState } from "react";

export function Header() {
  const [isCommandKOpen, setIsCommandKOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <Link href="/" className="flex items-center gap-2 mr-auto">
        <BotMessageSquare className="h-7 w-7 text-primary" />
        <span className="font-headline text-lg font-semibold hidden sm:inline">{APP_NAME}</span>
      </Link>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={() => setIsCommandKOpen(true)} className="h-9 w-9">
          <BotMessageSquare className="h-5 w-5" />
          <span className="sr-only">Open AI Command Bar</span>
        </Button>
        <ThemeToggle />
      </div>
      <CommandKDialog open={isCommandKOpen} onOpenChange={setIsCommandKOpen} />
    </header>
  );
}
