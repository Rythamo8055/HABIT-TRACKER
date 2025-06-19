
// src/lib/timeline-event-storage.ts
'use client';

import type { CalendarEvent } from '@/lib/types';
import { format, parseISO, startOfDay } from 'date-fns';

const getEventsDateKey = (date: Date): string => {
  return `timeline_events_${format(date, 'yyyy-MM-dd')}`;
};

export const fetchEventsForDate = async (date: Date): Promise<CalendarEvent[]> => {
  // await new Promise(resolve => setTimeout(resolve, 50));
  const dateKey = getEventsDateKey(date);
  const storedEvents = localStorage.getItem(dateKey);
  if (storedEvents) {
    try {
      const parsedEvents = JSON.parse(storedEvents) as CalendarEvent[];
      return parsedEvents.sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime());
    } catch (e) {
      console.error("Failed to parse events from localStorage for key:", dateKey, e);
      return [];
    }
  }
  return [];
};

export const saveEventsForDate = async (date: Date, events: CalendarEvent[]): Promise<void> => {
  const dateKey = getEventsDateKey(date);
  localStorage.setItem(dateKey, JSON.stringify(events.sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime())));
};

export const addEventsToDate = async (date: Date, eventsToAdd: CalendarEvent[]): Promise<void> => {
  const existingEvents = await fetchEventsForDate(date);
  const updatedEvents = [...existingEvents, ...eventsToAdd];
  await saveEventsForDate(date, updatedEvents);
};
