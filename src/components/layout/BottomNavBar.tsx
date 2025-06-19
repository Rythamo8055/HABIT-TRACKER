
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, NavItem } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function BottomNavBar() {
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (item.match) return item.match(pathname);
    return item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
  };

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-auto max-w-xs sm:max-w-sm md:max-w-md mx-auto z-50
                   flex items-center justify-center gap-1 p-1.5 sm:p-2
                   bg-card/80 dark:bg-card/70 backdrop-blur-md 
                   rounded-full shadow-xl border border-border/50">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex flex-col items-center justify-center p-2 h-14 w-16 rounded-full transition-colors text-xs",
            isActive(item)
              ? "bg-primary/20 text-primary font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
          )}
          aria-current={isActive(item) ? "page" : undefined}
          title={item.label}
        >
          <item.icon className={cn("h-5 w-5 mb-0.5", isActive(item) ? "text-primary" : "")} />
          <span className="truncate text-xs sm:text-sm">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
