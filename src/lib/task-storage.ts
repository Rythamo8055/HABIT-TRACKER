
// src/lib/task-storage.ts
'use client';

import type { Task } from '@/lib/types';
import { format, startOfDay } from 'date-fns';

const getTasksDateKey = (date: Date): string => {
  return `tasks_${format(date, 'yyyy-MM-dd')}`;
};

export const fetchTasksForDate = async (date: Date): Promise<Task[]> => {
  // Simulate async if needed, but localStorage is sync
  // await new Promise(resolve => setTimeout(resolve, 50)); 
  const dateKey = getTasksDateKey(date);
  const storedTasks = localStorage.getItem(dateKey);
  if (storedTasks) {
    try {
      const parsedTasks = JSON.parse(storedTasks) as Task[];
      return parsedTasks.sort((a,b) => a.createdAt - b.createdAt);
    } catch (e) {
      console.error("Failed to parse tasks from localStorage for key:", dateKey, e);
      return [];
    }
  }
  return [];
};

export const saveTasksForDate = async (date: Date, tasks: Task[]): Promise<void> => {
  const dateKey = getTasksDateKey(date);
  localStorage.setItem(dateKey, JSON.stringify(tasks.sort((a,b) => a.createdAt - b.createdAt)));
};

export const addTaskToDate = async (date: Date, taskToAdd: Omit<Task, 'id' | 'dueDate' | 'createdAt'>): Promise<Task> => {
  const existingTasks = await fetchTasksForDate(date);
  const newTask: Task = {
    ...taskToAdd,
    id: `task-${Date.now()}`,
    dueDate: format(date, 'yyyy-MM-dd'),
    createdAt: Date.now(),
  };
  const updatedTasks = [...existingTasks, newTask];
  await saveTasksForDate(date, updatedTasks);
  return newTask;
};
