
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label'; // Added import for Label

export function IntegratedLog() {
  // In a real app, these values would come from state and be saved.
  // For now, they are just uncontrolled Textarea components.
  return (
    <Card className="flex-shrink-0">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Integrated Log</CardTitle>
        <CardDescription>Capture your thoughts, meals, and cues.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="journal-entry" className="block text-sm font-medium mb-1">Daily Journal</Label>
          <Textarea id="journal-entry" placeholder="What's on your mind? Highlights of the day..." className="min-h-[100px]" />
        </div>
        <div>
          <Label htmlFor="food-diary" className="block text-sm font-medium mb-1">Food Diary</Label>
          <Textarea id="food-diary" placeholder="Log your meals and drinks..." className="min-h-[80px]" />
        </div>
        <div>
          <Label htmlFor="cue-tracker" className="block text-sm font-medium mb-1">Cue Tracker</Label>
          <Textarea id="cue-tracker" placeholder="Note triggers and feelings for habits..." className="min-h-[80px]" />
        </div>
      </CardContent>
    </Card>
  );
}
