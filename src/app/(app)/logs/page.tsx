
import { IntegratedLog } from '@/components/logs/IntegratedLog';

export default function LogsPage() {
  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold">My Logs</h1>
      </div>
      <IntegratedLog />
    </div>
  );
}
