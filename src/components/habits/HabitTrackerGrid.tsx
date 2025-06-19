"use client";

import { useState, useEffect, useMemo } from 'react';
import type { Habit } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, getDaysInMonth, isSameMonth, isToday, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HabitTrackerGridProps {
  habits: Habit[];
  onToggleHabitCompletion: (habitId: string, date: string, completed: boolean) => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function HabitTrackerGrid({ habits, onToggleHabitCompletion, currentMonth, setCurrentMonth }: HabitTrackerGridProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfMonth = getDay(monthStart); // 0 for Sunday, 1 for Monday, etc.

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  
  const getChainLength = (habit: Habit, date: Date): number => {
    let chain = 0;
    let currentDate = new Date(date);
    while (habit.completions[format(currentDate, 'yyyy-MM-dd')]) {
      chain++;
      currentDate.setDate(currentDate.getDate() - 1);
      if (!isSameMonth(currentDate, date) && chain < getDaysInMonth(date)) break; // Stop if crosses month boundary unless it's a full month chain
    }
    return chain;
  };

  // "Don't Break the Chain" visualization
  const habitChains = useMemo(() => {
    return habits.map(habit => {
      const daysInCurrentDisplayMonth = getDaysInMonth(currentMonth);
      let consecutiveDays = 0;
      for (const day of daysInMonth) {
        if (habit.completions[format(day, 'yyyy-MM-dd')]) {
          consecutiveDays++;
        } else {
          break; 
        }
      }
      return {
        habitId: habit.id,
        isFullMonthChain: consecutiveDays === daysInCurrentDisplayMonth,
      };
    });
  }, [habits, daysInMonth, currentMonth]);


  if (habits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Habit Tracker</CardTitle>
          <CardDescription>No habits yet. Add some habits to start tracking!</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="overflow-x-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="font-headline text-xl">Habit Tracker</CardTitle>
            <CardDescription>{format(currentMonth, 'MMMM yyyy')}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-px" style={{ gridTemplateColumns: `minmax(150px, 1fr) repeat(${daysInMonth.length}, minmax(40px, 1fr))` }}>
          {/* Header Row: Habit Name */}
          <div className="sticky left-0 z-10 bg-card p-2 font-semibold border-b border-r">Habit</div>
          {/* Header Row: Day Numbers */}
          {daysInMonth.map(day => (
            <div key={day.toString()} className={cn("p-2 text-center font-medium border-b", isToday(day) ? "bg-primary/10 text-primary font-bold" : "")}>
              <div>{dayNames[getDay(day)].slice(0,1)}</div>
              <div>{format(day, 'd')}</div>
            </div>
          ))}

          {/* Habit Rows */}
          {habits.map((habit, habitIndex) => {
            const chainInfo = habitChains.find(c => c.habitId === habit.id);
            return (
              <React.Fragment key={habit.id}>
                <div 
                  className="sticky left-0 z-10 bg-card p-2 border-r flex items-center whitespace-nowrap overflow-hidden text-ellipsis"
                  style={{ borderBottomWidth: habitIndex === habits.length -1 ? '0px' : '1px' }}
                >
                  <span className="w-3 h-3 rounded-full mr-2 shrink-0" style={{ backgroundColor: habit.color }} />
                  <span className="truncate" title={habit.name}>{habit.name}</span>
                </div>
                {daysInMonth.map((day, dayIndex) => {
                  const dateKey = format(day, 'yyyy-MM-dd');
                  const isCompleted = !!habit.completions[dateKey];
                  
                  return (
                    <div 
                      key={dateKey} 
                      className={cn(
                        "relative p-0 border-b flex items-center justify-center",
                        dayIndex === daysInMonth.length - 1 ? "" : "border-r", // No right border for last cell in row
                        isToday(day) && !isCompleted ? "bg-accent/20" : "",
                        chainInfo?.isFullMonthChain && isCompleted ? "bg-green-500/30" : "" // Highlight for chain
                      )}
                      style={{ borderBottomWidth: habitIndex === habits.length -1 ? '0px' : '1px' }}
                    >
                      <Button
                        variant={isCompleted ? 'default' : 'ghost'}
                        size="icon"
                        className={cn(
                            "h-8 w-8 rounded-full transition-all duration-150",
                            isCompleted ? `opacity-100 scale-100 bg-[${habit.color}] hover:bg-[${habit.color}]/90 text-primary-foreground` : "opacity-50 hover:opacity-100 hover:bg-accent scale-90 hover:scale-100"
                        )}
                        style={isCompleted ? { backgroundColor: habit.color } : {}}
                        onClick={() => onToggleHabitCompletion(habit.id, dateKey, !isCompleted)}
                        aria-pressed={isCompleted}
                        aria-label={`Mark habit ${habit.name} as ${isCompleted ? 'incomplete' : 'complete'} for ${format(day, 'MMMM do')}`}
                      >
                        {isCompleted && <X className="h-4 w-4" />}
                      </Button>
                      {/* "Don't Break the Chain" Line */}
                      {chainInfo?.isFullMonthChain && isCompleted && (
                        <div className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 opacity-50" style={{backgroundColor: habit.color, zIndex: -1 }}/>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
import React from 'react'; // Add missing import
