"use client";

import { useState, useEffect } from 'react';
import { HabitForm } from '@/components/habits/HabitForm';
import { HabitTrackerGrid } from '@/components/habits/HabitTrackerGrid';
import type { Habit } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, LayoutGrid, List } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Mock functions for fetching and saving habits (replace with actual storage)
const fetchHabits = async (): Promise<Habit[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const storedHabits = localStorage.getItem('habits');
  if (storedHabits) {
    const parsedHabits = JSON.parse(storedHabits) as Habit[];
    // Ensure completions is an object
    return parsedHabits.map(h => ({ ...h, completions: h.completions || {} }));
  }
  return [ // Default habits if none stored
    { id: 'habit-1', name: 'Morning Run', category: 'Exercise', color: 'hsl(var(--chart-1))', completions: {}, createdAt: Date.now() - 200000},
    { id: 'habit-2', name: 'Read 30 mins', category: 'Learning', color: 'hsl(var(--chart-5))', completions: {}, createdAt: Date.now() - 100000},
    { id: 'habit-3', name: 'Meditate 10 mins', category: 'Mindfulness', color: 'hsl(var(--chart-3))', completions: {}, createdAt: Date.now()},
  ];
};

const saveHabits = async (habits: Habit[]) => {
  localStorage.setItem('habits', JSON.stringify(habits));
};


export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    setIsLoading(true);
    fetchHabits().then(fetchedHabits => {
      setHabits(fetchedHabits.sort((a,b) => a.createdAt - b.createdAt));
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveHabits(habits);
    }
  }, [habits, isLoading]);

  const handleAddHabit = (newHabitData: Omit<Habit, 'id' | 'completions' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...newHabitData,
      id: `habit-${Date.now()}`,
      completions: {},
      createdAt: Date.now(),
    };
    setHabits(prevHabits => [...prevHabits, newHabit]);
    setIsFormOpen(false); // Close dialog after adding
  };

  const handleToggleHabitCompletion = (habitId: string, date: string, completed: boolean) => {
    setHabits(prevHabits =>
      prevHabits.map(habit => {
        if (habit.id === habitId) {
          const newCompletions = { ...habit.completions };
          if (completed) {
            newCompletions[date] = true;
          } else {
            delete newCompletions[date];
          }
          return { ...habit, completions: newCompletions };
        }
        return habit;
      })
    );
  };

  if (isLoading) {
    return <div className="container mx-auto p-4 md:p-6 lg:p-8">Loading habits...</div>;
  }

  return (
    <div className="container mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-headline font-bold">Habit Tracker</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Habit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-headline">Add New Habit</DialogTitle>
            </DialogHeader>
            <HabitForm onSubmit={handleAddHabit} />
          </DialogContent>
        </Dialog>
      </div>
      
      <HabitTrackerGrid 
        habits={habits} 
        onToggleHabitCompletion={handleToggleHabitCompletion}
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
      />
    </div>
  );
}
