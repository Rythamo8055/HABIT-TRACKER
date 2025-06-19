// src/components/daily/EventForm.tsx
"use client";

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { CalendarEvent, EventFormData } from '@/lib/types';
import { format, parseISO, setHours, setMinutes, parse } from 'date-fns';

interface EventFormProps {
  onSubmit: (data: EventFormData) => void;
  onCancel: () => void;
  initialData?: CalendarEvent;
  currentDate: Date; 
}

// Schema expects HH:mm format for time strings
const timeStringSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:mm format");

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  startTime: timeStringSchema, // e.g., "09:00"
  endTime: timeStringSchema,   // e.g., "10:30"
  description: z.string().max(500, "Description is too long").optional(),
}).refine(data => {
  // Compare time strings directly HH:mm vs HH:mm
  return data.endTime > data.startTime;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});


export function EventForm({ onSubmit, onCancel, initialData, currentDate }: EventFormProps) {
  
  const defaultStartTime = setMinutes(setHours(currentDate, 9),0); // Default to 9:00 AM of current date
  const defaultEndTime = setMinutes(setHours(currentDate, 10),0);   // Default to 10:00 AM of current date

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      startTime: initialData ? format(parseISO(initialData.startTime), "HH:mm") : format(defaultStartTime, "HH:mm"),
      endTime: initialData ? format(parseISO(initialData.endTime), "HH:mm") : format(defaultEndTime, "HH:mm"),
      description: initialData?.description || '',
    },
  });

  const handleSubmitInternal: SubmitHandler<z.infer<typeof formSchema>> = (data) => {
    const finalData: EventFormData = {
      ...data,
      source: initialData?.source || 'user_planned', 
    };
    onSubmit(finalData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitInternal)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Team Meeting" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  {/* Input type "time" naturally provides HH:mm format */}
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Add more details about the event..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">{initialData ? 'Save Changes' : 'Add Event'}</Button>
        </div>
      </form>
    </Form>
  );
}
