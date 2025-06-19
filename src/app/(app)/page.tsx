
import { DailyTimeline } from '@/components/daily/DailyTimeline';
import { TaskList } from '@/components/daily/TaskList';

export default function DailyCommandPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2 h-full">
        <DailyTimeline />
      </div>
      <div className="lg:col-span-1 h-full flex flex-col gap-6">
        <TaskList />
      </div>
    </div>
  );
}
