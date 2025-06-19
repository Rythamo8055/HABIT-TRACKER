
import { GoalDecompositionForm } from '@/components/goals/GoalDecompositionForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

export default function GoalsPage() {
  return (
    <div className="container mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold">Goal Setting with AI</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
           <GoalDecompositionForm />
        </div>
        <Card className="md:col-span-1 rounded-none border-transparent shadow-none bg-transparent text-foreground md:rounded-lg md:border md:border-border md:bg-card md:text-card-foreground md:shadow-sm">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-primary" />
              How it Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Simply describe a high-level goal you want to achieve. Our AI will analyze your input
              and break it down into smaller, actionable habits and tasks.
            </p>
            <p>
              For example, instead of just "get healthy," try something like:
              <em className="block my-1 p-2 bg-muted rounded text-foreground">"I want to improve my cardiovascular health and lose 5kg in the next 3 months."</em>
            </p>
            <p>
              The more specific your goal, the better the AI can assist you in creating a realistic plan.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
