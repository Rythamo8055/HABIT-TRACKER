
"use client";

import React, { useMemo, useEffect, useRef } from 'react';
import type { Habit } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isToday, isSameDay, isFuture, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, X, Edit3, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HabitTrackerGridProps {
  habits: Habit[];
  onToggleHabitCompletion: (habitId: string, date: string, completed: boolean) => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habit: Habit) => void;
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function HabitTrackerGrid({ habits, onToggleHabitCompletion, currentMonth, setCurrentMonth, onEditHabit, onDeleteHabit }: HabitTrackerGridProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const cardContentRef = useRef<HTMLDivElement>(null);
  const todayHeaderCellRef = useRef<HTMLDivElement>(null);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const habitChains = useMemo(() => {
    return habits.map(habit => {
      let consecutiveDays = 0;
      let allPastOrTodayDaysInMonthCompleted = true;

      const relevantDaysInMonth = daysInMonth.filter(d => !isFuture(startOfDay(d)) || isSameDay(d, startOfDay(new Date())));

      if (relevantDaysInMonth.length === 0) {
        allPastOrTodayDaysInMonthCompleted = false;
      } else {
        for (const day of relevantDaysInMonth) {
          if (habit.completions[format(day, 'yyyy-MM-dd')]) {
            consecutiveDays++;
          } else {
            allPastOrTodayDaysInMonthCompleted = false;
            break;
          }
        }
      }
      const isFullMonthChainCheck = allPastOrTodayDaysInMonthCompleted && (relevantDaysInMonth.length > 0 ? consecutiveDays >= relevantDaysInMonth.length : false) ;
      return {
        habitId: habit.id,
        isFullMonthChain: isFullMonthChainCheck,
      };
    });
  }, [habits, daysInMonth]);

 useEffect(() => {
    if (cardContentRef.current && todayHeaderCellRef.current) {
        const container = cardContentRef.current;
        const todayCell = todayHeaderCellRef.current;
        
        const containerWidth = container.offsetWidth;
        const todayCellOffsetLeft = todayCell.offsetLeft;
        const todayCellWidth = todayCell.offsetWidth;
        
        const scrollLeftPosition = todayCellOffsetLeft - (containerWidth / 2) + (todayCellWidth / 2);
        
        container.scrollLeft = Math.max(0, scrollLeftPosition);
    }
  }, [currentMonth, habits, daysInMonth]); 


  if (habits.length === 0) {
    return (
      <Card className={cn(
        "rounded-none border-transparent shadow-none bg-transparent text-foreground",
        "md:rounded-lg md:border md:border-border md:bg-card md:text-card-foreground md:shadow-sm"
      )}>
        <CardHeader>
          <CardTitle className="font-headline text-xl">Habit Tracker</CardTitle>
          <CardDescription>No habits yet. Add some habits to start tracking!</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
     <Card
      className={cn(
        "rounded-none border-transparent shadow-none bg-transparent text-foreground flex flex-col flex-grow",
        "md:rounded-lg md:border md:border-border md:bg-card md:text-card-foreground md:shadow-sm"
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between sticky left-0 bg-transparent md:bg-card z-20 px-4 md:px-6">
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
      <CardContent ref={cardContentRef} className="pt-0 px-0 md:px-6 md:pb-6 flex-grow overflow-x-auto overflow-y-hidden">
          <div className="grid gap-px min-w-max" style={{ gridTemplateColumns: `minmax(100px, auto) repeat(${daysInMonth.length}, minmax(38px, 1fr))` }}>
            {/* Header Row: Habit Name */}
            <div className="sticky left-0 z-10 bg-transparent md:bg-card px-1 py-1 md:px-2 border-b border-r flex items-center justify-start h-12">
              <span className="font-semibold truncate hidden sm:inline-block">Habit</span>
            </div>
            {/* Header Row: Day Numbers */}
            {daysInMonth.map((day, dayIndex) => (
              <div
                key={day.toString()}
                ref={isToday(day) ? todayHeaderCellRef : null}
                className={cn(
                  "p-1 text-center border-b flex flex-col items-center justify-center h-12",
                  isToday(day) ? "bg-accent/20 text-accent-foreground" : "",
                  dayIndex === daysInMonth.length - 1 ? "" : "border-r"
                )}
              >
                <div className="text-xs">{dayNames[getDay(day)].slice(0,3)}</div>
                <div className="text-sm font-semibold">{format(day, 'd')}</div>
              </div>
            ))}

            {/* Habit Rows */}
            {habits.map((habit, habitIndex) => {
              const chainInfo = habitChains.find(c => c.habitId === habit.id);
              return (
                <React.Fragment key={habit.id}>
                  <div
                    className="sticky left-0 z-10 bg-transparent md:bg-card px-1 py-1 md:px-2 border-r flex items-center justify-between group min-h-[44px]"
                    style={{ borderBottomWidth: habitIndex === habits.length -1 ? '0px' : '1px' }}
                  >
                    <div className="flex items-center overflow-hidden whitespace-nowrap w-full justify-start">
                      <span className="w-3 h-3 rounded-full mr-1.5 shrink-0" style={{ backgroundColor: habit.color }} />
                      <span className="truncate text-sm" title={habit.name}>{habit.name}</span>
                    </div>
                    <div className="flex items-center shrink-0 ml-0 sm:ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEditHabit(habit)}>
                        <Edit3 className="h-3.5 w-3.5" />
                         <span className="sr-only">Edit habit</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => onDeleteHabit(habit)}>
                        <Trash2 className="h-3.5 w-3.5" />
                         <span className="sr-only">Delete habit</span>
                      </Button>
                    </div>
                  </div>
                  {daysInMonth.map((day, dayIndex) => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const isCompleted = !!habit.completions[dateKey];
                    const isFutureDay = isFuture(startOfDay(day)) && !isSameDay(day, startOfDay(new Date()));

                    return (
                      <div
                        key={dateKey}
                        className={cn(
                          "relative p-0 border-b flex items-center justify-center min-h-[44px]",
                          dayIndex === daysInMonth.length - 1 ? "" : "border-r",
                          isToday(day) && !isCompleted && !isFutureDay ? "bg-accent/20" : "",
                          chainInfo?.isFullMonthChain && isCompleted && !isFutureDay ? "bg-chart-1/20" : "",
                           isFutureDay ? "bg-muted/30" : ""
                        )}
                        style={{ borderBottomWidth: habitIndex === habits.length -1 ? '0px' : '1px' }}
                      >
                        <Button
                          variant={isCompleted ? 'default' : 'ghost'}
                          size="icon"
                          className={cn(
                              "h-6 w-6 rounded-full transition-all duration-150",
                              isCompleted && !isFutureDay ? `opacity-100 scale-100 text-primary-foreground` : "opacity-60 hover:opacity-100 hover:bg-accent scale-90 hover:scale-100",
                              isFutureDay ? "cursor-not-allowed opacity-30 hover:bg-transparent !important" : ""
                          )}
                          style={isCompleted && !isFutureDay ? { backgroundColor: habit.color } : {}}
                          onClick={(e) => {
                             if (isFutureDay) {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  return;
                             }
                             onToggleHabitCompletion(habit.id, dateKey, !isCompleted)
                          }}
                          disabled={isFutureDay}
                          aria-pressed={isCompleted && !isFutureDay}
                          aria-label={`Mark habit ${habit.name} as ${isCompleted ? 'incomplete' : 'complete'} for ${format(day, 'MMMM do')}${isFutureDay ? ' (future date, disabled)' : ''}`}
                        >
                          {isCompleted && !isFutureDay && <X className="h-3.5 w-3.5" />}
                        </Button>
                        {chainInfo?.isFullMonthChain && isCompleted && !isFutureDay && (
                          <div className="absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2 opacity-40" style={{backgroundColor: habit.color, zIndex: -1 }}/>
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

