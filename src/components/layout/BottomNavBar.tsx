// src/components/layout/BottomNavBar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, NavItem } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function BottomNavBar() {
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (item.match) return item.match(pathname);
    return item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
  };

  return (
    <TooltipProvider delayDuration={100}>
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-auto max-w-xs sm:max-w-sm md:max-w-md mx-auto z-50
                     flex items-center justify-center gap-1 p-1.5 sm:p-2
                     bg-card/70 dark:bg-card/60 backdrop-blur-lg 
                     rounded-full shadow-xl border border-border/30">
        {NAV_ITEMS.map((item) => (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center justify-center p-3 h-12 w-12 rounded-full transition-colors",
                  isActive(item)
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                )}
                aria-current={isActive(item) ? "page" : undefined}
                aria-label={item.label}
              >
                <item.icon className={cn("h-6 w-6", isActive(item) ? "text-primary" : "")} />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </nav>
    </TooltipProvider>
  );
}
