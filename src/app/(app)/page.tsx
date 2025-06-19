import { DailyTimeline } from '@/components/daily/DailyTimeline';
import { TaskList } from '@/components/daily/TaskList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function DailyCommandPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2 h-full">
        <DailyTimeline />
      </div>
      <div className="lg:col-span-1 h-full flex flex-col gap-6">
        <TaskList />
        <IntegratedLog />
      </div>
    </div>
  );
}

function IntegratedLog() {
  return (
    <Card className="flex-shrink-0">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Integrated Log</CardTitle>
        <CardDescription>Capture your thoughts, meals, and cues.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="journal-entry" className="block text-sm font-medium mb-1">Daily Journal</label>
          <Textarea id="journal-entry" placeholder="What's on your mind? Highlights of the day..." className="min-h-[80px]" />
        </div>
        <div>
          <label htmlFor="food-diary" className="block text-sm font-medium mb-1">Food Diary</label>
          <Textarea id="food-diary" placeholder="Log your meals and drinks..." className="min-h-[60px]" />
        </div>
        <div>
          <label htmlFor="cue-tracker" className="block text-sm font-medium mb-1">Cue Tracker</label>
          <Textarea id="cue-tracker" placeholder="Note triggers and feelings for habits..." className="min-h-[60px]" />
        </div>
      </CardContent>
    </Card>
  )
}
