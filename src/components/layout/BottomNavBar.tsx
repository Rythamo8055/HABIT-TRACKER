"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, NavItem } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

export function BottomNavBar() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();

  const isActive = (item: NavItem) => {
    if (item.match) return item.match(pathname);
    // For root, exact match, otherwise startsWith
    return item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
  };

  if (!isMobile) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border flex z-50">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-1 p-2 text-xs transition-colors",
            isActive(item) ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
          )}
          aria-current={isActive(item) ? "page" : undefined}
        >
          <item.icon className={cn("h-5 w-5", isActive(item) ? "text-primary" : "")} />
          <span className="truncate">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
