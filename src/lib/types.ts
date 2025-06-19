export interface Task {
  id: string;
  text: string;
  isCompleted: boolean;
  goalId?: string;
  dueDate: string; // YYYY-MM-DD
  createdAt: number; // Timestamp
}

export interface Goal {
  id: string;
  name: string;
  description: string;
  decomposedTasks: DecomposedTask[];
  createdAt: number; // Timestamp
}

export interface Habit {
  id: string;
  name: string;
  category: string;
  color: string; // Hex color for the category or category identifier
  completions: { [date: string]: boolean }; // date: YYYY-MM-DD
  createdAt: number; // Timestamp
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  source: 'synced_calendar' | 'user_planned' | 'habit_log' | 'ai_scheduled';
  description?: string;
  isAllDay?: boolean;
}

// For AI Goal Decomposition Output (parsed from string)
export interface DecomposedTask {
  task: string;
  reason: string;
}

// For Natural Language Scheduling Output
export interface ScheduledEventItem {
  startTime: string; // Could be ISO string or specific format
  endTime: string;   // Could be ISO string or specific format
  description: string;
}

export type HabitCategory = {
  id: string;
  name: string;
  color: string; // e.g., 'red', 'blue', or a hex code like '#FF0000'
};

// Data for creating/updating calendar events
export interface EventFormData {
  title: string;
  startTime: string; // Expected as YYYY-MM-DDTHH:mm
  endTime: string;   // Expected as YYYY-MM-DDTHH:mm
  description?: string;
  source: CalendarEvent['source'];
}