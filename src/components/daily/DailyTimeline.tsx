
// src/components/daily/DailyTimeline.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CalendarEvent, EventFormData } from '@/lib/types';
import { EventForm } from './EventForm';
import { format, startOfDay, addHours, isSameDay, parseISO, parse } from 'date-fns';
import { CheckCircle, Clock, Zap, Calendar as CalendarIcon, PlusCircle, Edit3, Trash2 } from 'lucide-react';
import { fetchEventsForDate, saveEventsForDate } from '@/lib/timeline-event-storage';
import { cn } from '@/lib/utils';

const getInitialSampleEvents = (date: Date): CalendarEvent[] => {
  const today = startOfDay(new Date());
   if (isSameDay(date, today)) {
    return [
      { id: '1', title: 'Morning Standup', startTime: addHours(today, 9).toISOString(), endTime: addHours(today, 9.5).toISOString(), source: 'synced_calendar', description: 'Team daily sync' },
      { id: '2', title: 'Deep Work: Project Phoenix', startTime: addHours(today, 10).toISOString(), endTime: addHours(today, 12).toISOString(), source: 'user_planned' },
      { id: '3', title: 'Lunch Break', startTime: addHours(today, 12).toISOString(), endTime: addHours(today, 13).toISOString(), source: 'habit_log', description: 'Logged meal' },
      { id: '4', title: 'Client Meeting', startTime: addHours(today, 14).toISOString(), endTime: addHours(today, 15).toISOString(), source: 'synced_calendar' },
      { id: '5', title: 'Gym Session', startTime: addHours(today, 17.5).toISOString(), endTime: addHours(today, 18.5).toISOString(), source: 'habit_log', description: 'Completed workout habit' },
      { id: '6', title: 'AI Scheduled: Prep for tomorrow', startTime: addHours(today, 16).toISOString(), endTime: addHours(today, 16.5).toISOString(), source: 'ai_scheduled', description: 'Generated by AI scheduler'},
    ].sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime());
  }
  return [];
};


const EventIcon = ({ source }: { source: CalendarEvent['source'] }) => {
  switch (source) {
    case 'synced_calendar': return <CalendarIcon className="h-4 w-4 text-blue-500" />;
    case 'user_planned': return <Clock className="h-4 w-4 text-purple-500" />;
    case 'habit_log': return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'ai_scheduled': return <Zap className="h-4 w-4 text-orange-500" />;
    default: return <CalendarIcon className="h-4 w-4 text-muted-foreground" />;
  }
};

export function DailyTimeline() {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [currentTimeLine, setCurrentTimeLine] = useState<Date | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    setCurrentDate(startOfDay(new Date()));
    setCurrentTimeLine(new Date()); // Initialize currentTimeLine
    const timerId = setInterval(() => {
      setCurrentTimeLine(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    if (currentDate) {
      setIsLoadingEvents(true);
      fetchEventsForDate(currentDate).then(fetchedEvents => {
        if (fetchedEvents.length === 0 && isSameDay(currentDate, startOfDay(new Date())) && !localStorage.getItem(`timeline_initial_samples_loaded_${format(currentDate, 'yyyy-MM-dd')}`)) {
          const sampleEvents = getInitialSampleEvents(currentDate);
          setEvents(sampleEvents);
          saveEventsForDate(currentDate, sampleEvents);
          localStorage.setItem(`timeline_initial_samples_loaded_${format(currentDate, 'yyyy-MM-dd')}`, 'true');
        } else {
          setEvents(fetchedEvents);
        }
        setIsLoadingEvents(false);
      });
    }
  }, [currentDate]);

  useEffect(() => {
    if (currentDate && !isLoadingEvents) {
      saveEventsForDate(currentDate, events);
    }
  }, [events, currentDate, isLoadingEvents]);


  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const baseDateForSlot = currentDate || startOfDay(new Date()); // Use currentDate if available
    const hour = startOfDay(baseDateForSlot);
    hour.setHours(i);
    return hour;
  });

  const handleOpenForm = (eventToEdit?: CalendarEvent) => {
    if (!currentDate) return;
    setEditingEvent(eventToEdit || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingEvent(null);
  };

  const handleFormSubmit = (data: EventFormData) => {
    if (!currentDate) return;

    const parsedStartTime = parse(data.startTime, "HH:mm", new Date(currentDate));
    const parsedEndTime = parse(data.endTime, "HH:mm", new Date(currentDate));

    const finalStartTime = new Date(currentDate);
    finalStartTime.setHours(parsedStartTime.getHours(), parsedStartTime.getMinutes(), 0, 0);

    const finalEndTime = new Date(currentDate);
    finalEndTime.setHours(parsedEndTime.getHours(), parsedEndTime.getMinutes(), 0, 0);

    if (finalEndTime <= finalStartTime) {
        alert("End time must be after start time.");
        return;
    }

    const startTimeISO = finalStartTime.toISOString();
    const endTimeISO = finalEndTime.toISOString();

    if (editingEvent) {
      setEvents(prevEvents =>
        prevEvents.map(ev =>
          ev.id === editingEvent.id ? { ...ev, title: data.title, description: data.description, source: data.source, startTime: startTimeISO, endTime: endTimeISO } : ev
        ).sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime())
      );
    } else {
      const newEvent: CalendarEvent = {
        id: `event-${Date.now()}`,
        title: data.title,
        description: data.description,
        source: data.source,
        startTime: startTimeISO,
        endTime: endTimeISO,
      };
      setEvents(prevEvents => [...prevEvents, newEvent].sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime()));
    }
    handleCloseForm();
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prevEvents => prevEvents.filter(ev => ev.id !== eventId));
  };

  const renderCurrentTimeIndicator = () => {
    if (!currentTimeLine || !currentDate || !isSameDay(currentDate, currentTimeLine)) {
      return null;
    }
    // Calculate minutes past midnight for the current time
    const minutesPastMidnight = currentTimeLine.getHours() * 60 + currentTimeLine.getMinutes();
    // Each hour slot is 6rem high (24 slots * 0.25rem/minute if 1 hour = 6rem)
    // So, top position in rem = (minutesPastMidnight / 60) * heightOfOneHourSlotInRem
    // Assuming heightOfOneHourSlotInRem = 6rem (24px in tailwind for h-24 / 4 = 6rem)
    
    return (
      <div
        className="absolute left-16 right-0 ml-1 h-0.5 bg-red-500 z-10 flex items-center"
        style={{ top: `${minutesPastMidnight / 60 * 6}rem` }} // 6rem per hour
        aria-label="Current time"
      >
        <div className="absolute -left-2 h-2 w-2 rounded-full bg-red-500 -translate-x-full"></div>
      </div>
    );
  };

  if (!currentDate) {
    return (
      <Card className={cn(
        "h-full flex flex-col",
        "rounded-none border-transparent shadow-none bg-transparent text-foreground",
        "md:rounded-lg md:border md:border-border md:bg-card md:text-card-foreground md:shadow-sm"
      )}>
        <CardHeader className="flex flex-row items-center justify-between px-4 md:px-6">
          <div>
            <CardTitle className="font-headline text-xl">
              Daily Timeline - Loading date...
            </CardTitle>
            <CardDescription>View and manage your day's schedule.</CardDescription>
          </div>
          <Button disabled>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Event
          </Button>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden px-4 md:px-6">
          <div className="flex items-center justify-center h-full">
            <p>Initializing timeline...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "h-full flex flex-col",
      "rounded-none border-transparent shadow-none bg-transparent text-foreground",
      "md:rounded-lg md:border md:border-border md:bg-card md:text-card-foreground md:shadow-sm"
    )}>
      <CardHeader className="flex flex-row items-center justify-between px-4 md:px-6">
        <div>
          <CardTitle className="font-headline text-xl">
            Daily Timeline - {format(currentDate, 'EEEE, MMMM do')}
          </CardTitle>
          <CardDescription>View and manage your day's schedule.</CardDescription>
        </div>
        <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) handleCloseForm(); else setIsFormOpen(true); }}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenForm()} disabled={!currentDate}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle className="font-headline">{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
            </DialogHeader>
            {currentDate && ( // Ensure currentDate is not null before rendering EventForm
              <EventForm
                onSubmit={handleFormSubmit}
                onCancel={handleCloseForm}
                initialData={editingEvent || undefined}
                currentDate={currentDate}
              />
            )}
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden px-0 md:px-6 pb-6">
        {isLoadingEvents ? (
          <div className="flex items-center justify-center h-full px-4 md:px-0">
            <p>Loading timeline...</p>
          </div>
        ) : (
          <ScrollArea className={cn("h-[calc(100vh-280px)] md:pr-4 relative", "scroll-area-hide-scrollbar")}>
            <div className="relative px-4 md:px-0">
              {timeSlots.map((slot, index) => (
                <div key={index} className="flex items-start h-24 border-b border-dashed">
                  <div className="w-16 pr-2 text-right text-xs text-muted-foreground pt-1 sticky top-0 bg-inherit md:bg-card">
                    {format(slot, 'ha')}
                  </div>
                  <div className="flex-1 relative"></div> {/* Placeholder for event rendering area */}
                </div>
              ))}

              {renderCurrentTimeIndicator()}

              {events.map(event => {
                const start = parseISO(event.startTime);
                const end = parseISO(event.endTime);
                const startMinutesPastMidnight = start.getHours() * 60 + start.getMinutes();
                const endMinutesPastMidnight = end.getHours() * 60 + end.getMinutes();

                const topOffsetRem = startMinutesPastMidnight / 60 * 6; // 6rem per hour
                const durationMinutes = endMinutesPastMidnight - startMinutesPastMidnight;
                const heightRem = Math.max(durationMinutes / 60 * 6, 1.5); // Min height 1.5rem (e.g. for a 15min event)

                return (
                  <div
                    key={event.id}
                    className="absolute left-16 right-0 ml-2 p-2 rounded-lg shadow-md group"
                    style={{
                      top: `${topOffsetRem}rem`,
                      height: `${heightRem}rem`,
                      backgroundColor: 'hsl(var(--primary) / 0.1)', // Softer primary background
                      borderLeft: '4px solid hsl(var(--primary))', // Primary color left border
                    }}
                    aria-label={`Event: ${event.title} from ${format(start, 'p')} to ${format(end, 'p')}`}
                  >
                    <div className="flex items-start justify-between h-full">
                        <div className="flex items-start gap-2 overflow-hidden">
                            <EventIcon source={event.source} />
                            <div className="flex-grow">
                                <p className="font-semibold text-sm text-primary-foreground leading-tight truncate">{event.title}</p>
                                <p className="text-xs text-muted-foreground leading-tight">
                                {format(start, 'p')} - {format(end, 'p')}
                                </p>
                                {event.description && <p className="text-xs text-muted-foreground mt-1 leading-tight truncate">{event.description}</p>}
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenForm(event)}>
                                <Edit3 className="h-5 w-5" />
                                <span className="sr-only">Edit event</span>
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                        <Trash2 className="h-5 w-5" />
                                        <span className="sr-only">Delete event</span>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the event
                                    "{event.title}".
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteEvent(event.id)} className="bg-destructive hover:bg-destructive/90">
                                    Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

