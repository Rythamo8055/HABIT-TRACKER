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
import { ScheduledEventItem } from '@/lib/types';
import { Loader2, CheckCircle, AlertTriangle, CalendarClock } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  scheduleDescription: z.string().min(10, { message: "Schedule description must be at least 10 characters." }).max(500, { message: "Schedule description must be at most 500 characters."}),
});

type NaturalLanguageSchedulingFormValues = z.infer<typeof formSchema>;

interface NaturalLanguageSchedulingFormProps {
  onSuccessfulScheduling?: (events: ScheduledEventItem[]) => void;
}

export function NaturalLanguageSchedulingForm({ onSuccessfulScheduling }: NaturalLanguageSchedulingFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [scheduledEvents, setScheduledEvents] = useState<ScheduledEventItem[] | null>(null);
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
    setScheduledEvents(null);
    setError(null);
    try {
      const input: NaturalLanguageSchedulingInput = { scheduleDescription: data.scheduleDescription };
      const result: NaturalLanguageSchedulingOutput = await naturalLanguageScheduling(input);
      
      // Assuming result.scheduledEvents is already in the correct format
      // No parsing needed here as per NaturalLanguageSchedulingOutputSchema
      if (!Array.isArray(result.scheduledEvents) || !result.scheduledEvents.every(e => typeof e.startTime === 'string' && typeof e.endTime === 'string' && typeof e.description === 'string')) {
        throw new Error("AI response is not in the expected format (array of {startTime, endTime, description}).");
      }

      setScheduledEvents(result.scheduledEvents);
      if (result.scheduledEvents.length > 0 && onSuccessfulScheduling) {
        onSuccessfulScheduling(result.scheduledEvents);
      }
      if (result.scheduledEvents.length > 0) {
        toast({
          title: "Day Scheduled!",
          description: "Your schedule has been generated based on your input.",
        });
      } else {
         toast({
          title: "No Events Scheduled",
          description: "The AI couldn't extract any specific events from your description. Try being more precise.",
          variant: "default" 
        });
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

  const formatEventTime = (timeString: string) => {
    try {
      // Check if it's already a simple time string like "9 AM" or "14:00"
      if (/^\d{1,2}(:\d{2})?\s?(AM|PM)?$/i.test(timeString)) {
        return timeString;
      }
      // Otherwise, assume ISO and format
      return format(parseISO(timeString), 'p');
    } catch {
      return timeString; // Fallback to raw string if parsing fails
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-lg">Plan Your Day with AI</CardTitle>
        <CardDescription>Describe your day in plain English, and AI will create a schedule for you.</CardDescription>
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
                      placeholder="e.g., Tomorrow: Morning workout at 7 AM, project work from 9 to 12, lunch meeting at 1 PM, and family dinner at 7 PM."
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
              Generate Schedule
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
      {scheduledEvents && scheduledEvents.length > 0 && (
        <div className="p-6 border-t">
          <h3 className="text-md font-semibold mb-2 font-headline">Generated Schedule:</h3>
          <ScrollArea className="h-[200px] pr-3">
            <ul className="space-y-3">
              {scheduledEvents.map((event, index) => (
                <li key={index} className="p-3 bg-muted/50 rounded-md text-sm">
                  <p className="font-semibold text-primary flex items-center gap-2">
                    <CalendarClock className="h-4 w-4" />
                    {event.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 ml-6">
                    {formatEventTime(event.startTime)} - {formatEventTime(event.endTime)}
                  </p>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      )}
      {scheduledEvents && scheduledEvents.length === 0 && !error && (
        <div className="p-6 border-t">
          <p className="text-muted-foreground text-sm">No specific events were scheduled based on your input. Try to be more explicit with times and activities.</p>
        </div>
      )}
    </Card>
  );
}
