
"use client";

import { useState, useEffect } from 'react';
import { HabitForm } from '@/components/habits/HabitForm';
import { HabitTrackerGrid } from '@/components/habits/HabitTrackerGrid';
import type { Habit } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'; // Removed AlertDialogTrigger as it's not directly used here for delete
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Mock functions for fetching and saving habits (replace with actual storage)
const fetchHabits = async (): Promise<Habit[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const storedHabits = localStorage.getItem('habits');
  if (storedHabits) {
    const parsedHabits = JSON.parse(storedHabits) as Habit[];
    return parsedHabits.map(h => ({ ...h, completions: h.completions || {} }));
  }
  return [ 
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
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { toast } = useToast();

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
    setHabits(prevHabits => [...prevHabits, newHabit].sort((a,b) => a.createdAt - b.createdAt));
    setIsAddFormOpen(false);
    toast({ title: "Habit Added", description: `"${newHabit.name}" has been added.` });
  };

  const handleOpenEditForm = (habit: Habit) => {
    setEditingHabit(habit);
    setIsEditFormOpen(true);
  };

  const handleUpdateHabit = (updatedData: Omit<Habit, 'id' | 'completions' | 'createdAt'>) => {
    if (!editingHabit) return;
    setHabits(prevHabits =>
      prevHabits.map(h =>
        h.id === editingHabit.id ? { ...h, ...updatedData, color: updatedData.color || h.color } : h
      ).sort((a,b) => a.createdAt - b.createdAt)
    );
    setIsEditFormOpen(false);
    setEditingHabit(null);
    toast({ title: "Habit Updated", description: `"${updatedData.name}" has been updated.` });
  };
  
  const handleOpenDeleteDialog = (habit: Habit) => {
    setHabitToDelete(habit);
  };

  const handleConfirmDelete = () => {
    if (!habitToDelete) return;
    setHabits(prevHabits => prevHabits.filter(h => h.id !== habitToDelete.id));
    toast({ title: "Habit Deleted", description: `"${habitToDelete.name}" has been deleted.`, variant: "destructive" });
    setHabitToDelete(null);
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
    return <div className="space-y-6 md:px-0">Loading habits...</div>;
  }

  return (
    <div className="space-y-6 md:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 md:px-0">
        <h1 className="text-3xl font-headline font-bold">Habit Tracker</h1>
        <Dialog open={isAddFormOpen} onOpenChange={setIsAddFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Habit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-headline">Add New Habit</DialogTitle>
              <DialogDescription>Define a new habit to track.</DialogDescription>
            </DialogHeader>
            <HabitForm onSubmit={handleAddHabit} onCancel={() => setIsAddFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <HabitTrackerGrid 
        habits={habits} 
        onToggleHabitCompletion={handleToggleHabitCompletion}
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
        onEditHabit={handleOpenEditForm}
        onDeleteHabit={handleOpenDeleteDialog}
      />

      <Card className={cn(
        "mt-6 rounded-none border-transparent shadow-none bg-transparent text-foreground",
        "md:rounded-lg md:border md:border-border md:bg-card md:text-card-foreground md:shadow-sm"
      )}>
        <CardContent className="p-2 md:p-4 flex justify-center">
           <Calendar
            mode="single"
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="p-0"
            classNames={{
                caption_label: "text-lg font-headline",
                head_cell: "w-10 md:w-12",
                day: "h-10 w-10 md:h-12 md:w-12",
                day_selected: "rounded-md",
                day_today: "rounded-md",
            }}
          />
        </CardContent>
      </Card>


      {editingHabit && (
        <Dialog open={isEditFormOpen} onOpenChange={(open) => {
          if (!open) {
            setEditingHabit(null);
          }
          setIsEditFormOpen(open);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-headline">Edit Habit</DialogTitle>
              <DialogDescription>Update the details of your habit.</DialogDescription>
            </DialogHeader>
            <HabitForm 
              onSubmit={handleUpdateHabit} 
              existingHabit={editingHabit} 
              onCancel={() => { setIsEditFormOpen(false); setEditingHabit(null); }}
            />
          </DialogContent>
        </Dialog>
      )}

      {habitToDelete && (
        <AlertDialog open={!!habitToDelete} onOpenChange={(open) => !open && setHabitToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the habit
                "{habitToDelete.name}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setHabitToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
