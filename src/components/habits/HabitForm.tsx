"use client";

import { useState } from 'react';
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
import { HABIT_CATEGORIES_EXAMPLES } from '@/lib/constants'; // Using examples as predefined categories for now
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface HabitFormProps {
  onSubmit: (habit: Omit<Habit, 'id' | 'completions' | 'createdAt'>) => void;
  existingHabit?: Habit; // For editing
}

const predefinedCategories: HabitCategory[] = HABIT_CATEGORIES_EXAMPLES.map((cat, index) => ({
  id: `cat-${index}`,
  name: cat.name,
  color: cat.color,
}));

export function HabitForm({ onSubmit, existingHabit }: HabitFormProps) {
  const [name, setName] = useState(existingHabit?.name || '');
  const [category, setCategory] = useState(existingHabit?.category || predefinedCategories[0]?.name || '');
  // Color is derived from category for simplicity in this version
  // const [customColor, setCustomColor] = useState(existingHabit?.color || HABIT_CATEGORIES_EXAMPLES[0]?.color || '#CCCCCC');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category) return;
    
    const selectedCategory = predefinedCategories.find(c => c.name === category);
    const color = selectedCategory?.color || HABIT_CATEGORIES_EXAMPLES[0].color;

    onSubmit({ name, category, color });
    if (!existingHabit) { // Reset form if adding new
        setName('');
        setCategory(predefinedCategories[0]?.name || '');
    }
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle className="font-headline text-lg">{existingHabit ? 'Edit Habit' : 'Add New Habit'}</CardTitle>
            <CardDescription>{existingHabit ? 'Update the details of your habit.' : 'Define a new habit to track.'}</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="habit-name">Habit Name</Label>
                <Input
                id="habit-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Drink 2L of water"
                required
                />
            </div>
            <div>
                <Label htmlFor="habit-category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="habit-category">
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
            {/* <div>
                <Label htmlFor="habit-color">Color (debugging, derived from category)</Label>
                <Input id="habit-color" type="color" value={predefinedCategories.find(c => c.name === category)?.color || '#CCCCCC'} disabled/>
            </div> */}
            <Button type="submit" className="w-full">
                {existingHabit ? 'Save Changes' : 'Add Habit'}
            </Button>
            </form>
        </CardContent>
    </Card>
  );
}
