
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Habit, HabitCategory } from '@/lib/types';
import { HABIT_CATEGORIES_EXAMPLES } from '@/lib/constants';
import { Card, CardContent } from '../ui/card'; // Removed unused Header/Description

interface HabitFormProps {
  onSubmit: (habit: Omit<Habit, 'id' | 'completions' | 'createdAt'>) => void;
  onCancel: () => void; // Added for closing dialog
  existingHabit?: Habit;
}

const predefinedCategories: HabitCategory[] = HABIT_CATEGORIES_EXAMPLES.map((cat, index) => ({
  id: `cat-${index}`,
  name: cat.name,
  color: cat.color,
}));

export function HabitForm({ onSubmit, onCancel, existingHabit }: HabitFormProps) {
  const [name, setName] = useState('');
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    if (existingHabit) {
      setName(existingHabit.name);
      setCategoryName(existingHabit.category);
    } else {
      // Set default for new habit
      setName('');
      setCategoryName(predefinedCategories[0]?.name || '');
    }
  }, [existingHabit]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryName) return;
    
    const selectedCategoryObject = predefinedCategories.find(c => c.name === categoryName);
    const color = selectedCategoryObject?.color || HABIT_CATEGORIES_EXAMPLES[0].color;

    onSubmit({ name, category: categoryName, color });
    // Resetting form for add is handled by parent closing dialog and remounting or parent state.
    // For edit, parent will close dialog.
  };

  return (
    <Card className="border-0 shadow-none">
        <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div>
                <Label htmlFor="habit-name">Habit Name</Label>
                <Input
                id="habit-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Drink 2L of water"
                required
                className="mt-1"
                />
            </div>
            <div>
                <Label htmlFor="habit-category">Category</Label>
                <Select value={categoryName} onValueChange={setCategoryName}>
                    <SelectTrigger id="habit-category" className="mt-1">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        {predefinedCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                            <span className="flex items-center">
                            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: cat.color }} />
                            {cat.name}
                            </span>
                        </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">
                    {existingHabit ? 'Save Changes' : 'Add Habit'}
                </Button>
            </div>
            </form>
        </CardContent>
    </Card>
  );
}
