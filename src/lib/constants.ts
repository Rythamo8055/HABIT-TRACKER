import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, CheckSquare, Target, Brain, CalendarDays, Settings } from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match?: (pathname: string) => boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Daily Command', icon: LayoutDashboard, match: (pathname) => pathname === '/' },
  { href: '/habits', label: 'Habit Tracker', icon: CheckSquare },
  { href: '/goals', label: 'Goal Setting', icon: Target },
  { href: '/schedule', label: 'AI Scheduler', icon: CalendarDays },
  // { href: '/journal', label: 'Journal & Logs', icon: BookOpenText }, // Future
  // { href: '/settings', label: 'Settings', icon: Settings }, // Future
];

export const APP_NAME = "Life Architect";

export const HABIT_CATEGORIES_EXAMPLES: { name: string; color: string }[] = [
  { name: "Exercise", color: "hsl(var(--chart-1))" },
  { name: "Diet", color: "hsl(var(--chart-2))" },
  { name: "Mindfulness", color: "hsl(var(--chart-3))" },
  { name: "Work", color: "hsl(var(--chart-4))" },
  { name: "Learning", color: "hsl(var(--chart-5))" },
];
