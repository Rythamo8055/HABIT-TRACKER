"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, NavItem } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function SidebarNav() {
  const pathname = usePathname();
  const { state: sidebarState } = useSidebar();

  const isActive = (item: NavItem) => {
    if (item.match) return item.match(pathname);
    return pathname.startsWith(item.href);
  };

  return (
    <SidebarMenu>
      {NAV_ITEMS.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} legacyBehavior passHref>
            <SidebarMenuButton
              asChild={false} // Explicitly false for Link compatibility with legacyBehavior
              isActive={isActive(item)}
              tooltip={{ children: item.label, className: "capitalize" }}
              className="justify-start"
            >
              <item.icon className={cn("h-5 w-5", isActive(item) ? "text-primary" : "")} />
              {sidebarState === "expanded" && (
                <span className={cn(isActive(item) ? "font-semibold" : "")}>{item.label}</span>
              )}
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
