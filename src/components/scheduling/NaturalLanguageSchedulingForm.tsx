
"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { naturalLanguageScheduling, NaturalLanguageSchedulingInput, NaturalLanguageSchedulingOutput } from '@/ai/flows/natural-language-scheduling';
import type { ScheduledEventItem, CalendarEvent } from '@/lib/types';
import { Loader2, CheckCircle, AlertTriangle, CalendarClock } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { format, parse, startOfDay, isValid, parseISO as dateFnsParseISO } from 'date-fns'; // Renamed to avoid conflict
import { useToast } from '@/hooks/use-toast';
import { addEventsToDate } from '@/lib/timeline-event-storage';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  scheduleDescription: z.string().min(10, { message: "Schedule description must be at least 10 characters." }).max(500, { message: "Schedule description must be at most 500 characters."}),
});

type NaturalLanguageSchedulingFormValues = z.infer<typeof formSchema>;

interface NaturalLanguageSchedulingFormProps {
  onSuccessfulScheduling?: (events: ScheduledEventItem[]) => void;
}

const parseFlexibleDateTime = (timeString: string, referenceDate: Date): Date | null => {
  const now = referenceDate;
  let parsedDate: Date | null = null;

  const timeFormats = [
    "h a", "ha", "h:mm a", "h:mma",
    "H", "HH", "HH:mm",
  ];
  
  try {
    const d = dateFnsParseISO(timeString); 
    if (isValid(d)) return d;
  } catch {}

  for (const fmt of timeFormats) {
    try {
      const d = parse(timeString, fmt, now);
      if (isValid(d)) {
        if (d.getFullYear() === new Date(0).getFullYear() || format(d, 'yyyy-MM-dd') === format(new Date(0), 'yyyy-MM-dd')) {
             d.setFullYear(now.getFullYear(), now.getMonth(), now.getDate());
        }
        parsedDate = d;
        break;
      }
    } catch {}
  }
  
  if (!parsedDate && timeString.toLowerCase().includes("tomorrow")) {
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
     for (const fmt of timeFormats) {
        try {
            const timeOnlyString = timeString.replace(/tomorrow/i, '').trim();
            const d = parse(timeOnlyString, fmt, tomorrow);
            if (isValid(d)) {
                d.setFullYear(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
                parsedDate = d;
                break;
            }
        } catch {}
    }
  }

  return parsedDate;
};


export function NaturalLanguageSchedulingForm({ onSuccessfulScheduling }: NaturalLanguageSchedulingFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [aiScheduledEvents, setAiScheduledEvents] = useState<ScheduledEventItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<NaturalLanguageSchedulingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      scheduleDescription: '',
    },
  });

  const onSubmit: SubmitHandler<NaturalLanguageSchedulingFormValues> = async (data) => {
    setIsLoading(true);
    setAiScheduledEvents(null);
    setError(null);
    const today = startOfDay(new Date());

    try {
      const input: NaturalLanguageSchedulingInput = { scheduleDescription: data.scheduleDescription };
      const result: NaturalLanguageSchedulingOutput = await naturalLanguageScheduling(input);
      
      if (!Array.isArray(result.scheduledEvents) || !result.scheduledEvents.every(e => typeof e.startTime === 'string' && typeof e.endTime === 'string' && typeof e.description === 'string')) {
        throw new Error("AI response is not in the expected format (array of {startTime, endTime, description}).");
      }

      setAiScheduledEvents(result.scheduledEvents);

      const calendarEventsToAdd: CalendarEvent[] = [];
      for (const aiEvent of result.scheduledEvents) {
        const parsedStart = parseFlexibleDateTime(aiEvent.startTime, today);
        const parsedEnd = parseFlexibleDateTime(aiEvent.endTime, today);

        if (parsedStart && parsedEnd && parsedEnd > parsedStart) {
          calendarEventsToAdd.push({
            id: `ai-event-${Date.now()}-${Math.random().toString(16).slice(2)}`,
            title: aiEvent.description,
            startTime: parsedStart.toISOString(),
            endTime: parsedEnd.toISOString(),
            source: 'ai_scheduled',
            description: `AI: ${aiEvent.description}`,
          });
        } else {
          console.warn("Could not parse event times or invalid range:", aiEvent);
        }
      }

      if (calendarEventsToAdd.length > 0) {
        await addEventsToDate(today, calendarEventsToAdd); 
        toast({
          title: "Day Scheduled!",
          description: `${calendarEventsToAdd.length} event(s) added to today's timeline.`,
        });
      } else if (result.scheduledEvents.length > 0) {
         toast({
          title: "Scheduled Events Parsed",
          description: "AI provided events, but times could not be fully processed for timeline. See raw output.",
          variant: "default"
        });
      } else {
         toast({
          title: "No Events Scheduled",
          description: "The AI couldn't extract any specific events from your description.",
          variant: "default" 
        });
      }
      
      if (onSuccessfulScheduling) { 
        onSuccessfulScheduling(result.scheduledEvents);
      }

    } catch (e) {
      console.error("Error scheduling day:", e);
      const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred.";
      setError(errorMessage);
      toast({
        title: "Scheduling Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDisplayEventTime = (timeString: string) => {
    const parsed = parseFlexibleDateTime(timeString, new Date());
    if (parsed) return format(parsed, 'p');
    return timeString; 
  };


  return (
    <Card className={cn(
      "w-full rounded-none border-transparent shadow-none bg-transparent text-foreground",
      "md:rounded-lg md:border md:border-border md:bg-card md:text-card-foreground md:shadow-sm"
    )}>
      <CardHeader>
        <CardTitle className="font-headline text-lg">Plan Your Day with AI</CardTitle>
        <CardDescription>Describe your day in plain English (e.g., "Team meeting 10-11am, lunch 1pm, work on report until 5pm"). AI will try to create a schedule for today.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="scheduleDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="schedule-description">Daily Plan Description</FormLabel>
                  <FormControl>
                    <Textarea
                      id="schedule-description"
                      placeholder="e.g., Morning workout at 7 AM, project work from 9 to 12, lunch meeting at 1 PM, and family dinner at 7 PM."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-4">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Generate & Add to Today's Timeline
            </Button>
             {error && (
              <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-md flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </CardFooter>
        </form>
      </Form>
      {aiScheduledEvents && aiScheduledEvents.length > 0 && (
        <div className="p-6 border-t md:border-border">
          <h3 className="text-md font-semibold mb-2 font-headline">AI Generated Output:</h3>
          <ScrollArea className="h-[200px] pr-3">
            <ul className="space-y-3">
              {aiScheduledEvents.map((event, index) => (
                <li key={index} className="p-3 bg-muted/50 rounded-md text-sm">
                  <p className="font-semibold text-primary flex items-center gap-2">
                    <CalendarClock className="h-4 w-4" />
                    {event.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 ml-6">
                    {formatDisplayEventTime(event.startTime)} - {formatDisplayEventTime(event.endTime)}
                  </p>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      )}
      {aiScheduledEvents && aiScheduledEvents.length === 0 && !error && (
        <div className="p-6 border-t md:border-border">
          <p className="text-muted-foreground text-sm">No specific events were scheduled by AI based on your input.</p>
        </div>
      )}
    </Card>
  );
}
