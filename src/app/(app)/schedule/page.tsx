
import { NaturalLanguageSchedulingForm } from '@/components/scheduling/NaturalLanguageSchedulingForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SchedulePage() {
  return (
    <div className="space-y-6 md:container md:mx-auto">
      <div className="flex items-center justify-between px-4 md:px-0">
        <h1 className="text-3xl font-headline font-bold">AI Powered Scheduling</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-6">
        <div className="md:col-span-2">
          <NaturalLanguageSchedulingForm />
        </div>
        <Card className={cn(
            "md:col-span-1 rounded-none border-transparent shadow-none bg-transparent text-foreground",
            "md:rounded-lg md:border md:border-border md:bg-card md:text-card-foreground md:shadow-sm"
          )}>
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Wand2 className="h-6 w-6 text-primary" />
              How it Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Describe your day's plan in natural language. The AI will attempt to extract events
              and their timings to create a structured schedule.
            </p>
            <p>
              For instance, you could say:
              <em className="block my-1 p-2 bg-muted rounded text-foreground">"Team meeting from 10 to 11am, work on the report until 1pm, then lunch. Pick up kids at 3:30pm."</em>
            </p>
            <p>
              The AI works best with clear time references (e.g., "at 2 PM", "from 9 to 5", "for 2 hours starting 10 AM") and distinct activities.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
