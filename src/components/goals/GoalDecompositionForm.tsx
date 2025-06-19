"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { goalDecomposition, GoalDecompositionInput, GoalDecompositionOutput } from '@/ai/flows/goal-decomposition';
import { DecomposedTask } from '@/lib/types';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  goal: z.string().min(10, { message: "Goal description must be at least 10 characters." }).max(500, { message: "Goal description must be at most 500 characters." }),
});

type GoalDecompositionFormValues = z.infer<typeof formSchema>;

interface GoalDecompositionFormProps {
  onSuccessfulDecomposition?: (tasks: DecomposedTask[]) => void;
}

export function GoalDecompositionForm({ onSuccessfulDecomposition }: GoalDecompositionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [decomposedTasks, setDecomposedTasks] = useState<DecomposedTask[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<GoalDecompositionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goal: '',
    },
  });

  const onSubmit: SubmitHandler<GoalDecompositionFormValues> = async (data) => {
    setIsLoading(true);
    setDecomposedTasks(null);
    setError(null);
    try {
      const input: GoalDecompositionInput = { goal: data.goal };
      const result: GoalDecompositionOutput = await goalDecomposition(input);
      
      // The output 'plan' is a JSON string, so we need to parse it.
      let parsedTasks: DecomposedTask[] = [];
      try {
        parsedTasks = JSON.parse(result.plan);
        if (!Array.isArray(parsedTasks) || !parsedTasks.every(t => typeof t.task === 'string' && typeof t.reason === 'string')) {
          throw new Error("AI response is not in the expected format (array of {task, reason}).");
        }
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        setError("AI response was not in the expected format. Raw: " + result.plan);
        toast({
          title: "Error",
          description: "Could not parse AI response. Please try rephrasing your goal.",
          variant: "destructive",
        });
        parsedTasks = []; // Set to empty array on parse error
      }

      setDecomposedTasks(parsedTasks);
      if (parsedTasks.length > 0 && onSuccessfulDecomposition) {
        onSuccessfulDecomposition(parsedTasks);
      }
       if (parsedTasks.length > 0) {
        toast({
          title: "Goal Decomposed!",
          description: "Your goal has been broken down into actionable tasks.",
        });
      }

    } catch (e) {
      console.error("Error decomposing goal:", e);
      const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred.";
      setError(errorMessage);
      toast({
        title: "Decomposition Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline text-lg">Decompose Your Goal</CardTitle>
        <CardDescription>Describe your high-level goal, and AI will break it down into actionable tasks.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="goal-description">Goal Description</FormLabel>
                  <FormControl>
                    <Textarea
                      id="goal-description"
                      placeholder="e.g., I want to get fit enough to run a 10k in 3 months."
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
              Decompose Goal
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
      {decomposedTasks && decomposedTasks.length > 0 && (
        <div className="p-6 border-t">
          <h3 className="text-md font-semibold mb-2 font-headline">Generated Tasks:</h3>
          <ScrollArea className="h-[200px] pr-3">
            <ul className="space-y-3">
              {decomposedTasks.map((item, index) => (
                <li key={index} className="p-3 bg-muted/50 rounded-md text-sm">
                  <p className="font-semibold text-primary">{item.task}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      )}
       {decomposedTasks && decomposedTasks.length === 0 && !error && (
        <div className="p-6 border-t">
          <p className="text-muted-foreground text-sm">No tasks were generated. This might happen if the AI couldn't process the goal or if the response format was unexpected.</p>
        </div>
      )}
    </Card>
  );
}
