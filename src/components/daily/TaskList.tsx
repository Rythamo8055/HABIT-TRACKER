
"use client";

import { useState, useEffect } from 'react';
import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Trash2, ChevronsRight, Edit3, GripVertical } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, type Active } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format, addDays, startOfDay, parseISO } from 'date-fns'; // Ensured parseISO is imported

// Mock function to simulate fetching tasks
const fetchTasks = async (date: string): Promise<Task[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const storedTasks = localStorage.getItem(`tasks_${date}`);
  if (storedTasks) return JSON.parse(storedTasks);
  
  // Sample tasks for today
  if (date === format(startOfDay(new Date()), 'yyyy-MM-dd')) {
    return [
      { id: 'task-1', text: 'Review PR #123', isCompleted: false, dueDate: date, createdAt: Date.now() - 100000 },
      { id: 'task-2', text: 'Draft project proposal', isCompleted: false, dueDate: date, createdAt: Date.now() - 50000 },
      { id: 'task-3', text: 'Follow up with Jane Doe', isCompleted: true, dueDate: date, createdAt: Date.now() - 200000 },
    ];
  }
  return [];
};

// Mock function to save tasks
const saveTasks = async (date: string, tasks: Task[]) => {
  localStorage.setItem(`tasks_${date}`, JSON.stringify(tasks));
};

interface SortableTaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (id: string, newText: string) => void;
}

function SortableTaskItem({ task, onToggleComplete, onDeleteTask, onEditTask }: SortableTaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleEdit = () => {
    if (isEditing && editText.trim() !== task.text && editText.trim() !== '') {
      onEditTask(task.id, editText.trim());
    } else if (isEditing && editText.trim() === '') {
      setEditText(task.text); // Reset if submitted empty
    }
    setIsEditing(!isEditing);
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-2 bg-card hover:bg-accent/50 rounded-md group">
      <Button variant="ghost" size="icon" {...attributes} {...listeners} className="cursor-grab p-1 h-auto touch-none">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </Button>
      <Checkbox
        id={`task-${task.id}`}
        checked={task.isCompleted}
        onCheckedChange={() => onToggleComplete(task.id)}
        aria-labelledby={`task-label-${task.id}`}
      />
      {isEditing ? (
        <Input 
          value={editText} 
          onChange={(e) => setEditText(e.target.value)} 
          onBlur={handleEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleEdit();
            if (e.key === 'Escape') {
              setEditText(task.text);
              setIsEditing(false);
            }
          }}
          className="h-8 flex-grow"
          autoFocus
        />
      ) : (
        <label
          id={`task-label-${task.id}`}
          htmlFor={`task-${task.id}`}
          className={`flex-grow cursor-pointer ${task.isCompleted ? 'line-through text-muted-foreground' : ''}`}
        >
          {task.text}
        </label>
      )}
      <Button variant="ghost" size="icon" onClick={handleEdit} className="h-7 w-7 opacity-0 group-hover:opacity-100">
        <Edit3 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => onDeleteTask(task.id)} className="h-7 w-7 opacity-0 group-hover:opacity-100">
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}


export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentDateKey, setCurrentDateKey] = useState(format(startOfDay(new Date()), 'yyyy-MM-dd'));
  const [activeDragItem, setActiveDragItem] = useState<Active | null>(null);


  useEffect(() => {
    setIsLoading(true);
    fetchTasks(currentDateKey).then(fetchedTasks => {
      setTasks(fetchedTasks.sort((a,b) => a.createdAt - b.createdAt));
      setIsLoading(false);
    });
  }, [currentDateKey]);

  useEffect(() => {
    if (!isLoading) {
      saveTasks(currentDateKey, tasks);
    }
  }, [tasks, currentDateKey, isLoading]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddTask = () => {
    if (newTaskText.trim() === '') return;
    const newTask: Task = {
      id: `task-${Date.now()}`,
      text: newTaskText.trim(),
      isCompleted: false,
      dueDate: currentDateKey,
      createdAt: Date.now(),
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
    setNewTaskText('');
  };

  const handleToggleComplete = (id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };
  
  const handleEditTask = (id: string, newText: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id ? { ...task, text: newText } : task
      )
    );
  };

  const handleMigrateTasks = () => {
    const incompleteTasks = tasks.filter(task => !task.isCompleted);
    if (incompleteTasks.length === 0) {
      alert("No incomplete tasks to migrate.");
      return;
    }
    const currentParsedDate = parseISO(currentDateKey); // Make sure parseISO is in scope
    const nextDayKey = format(addDays(currentParsedDate, 1), 'yyyy-MM-dd');
    
    const completedTasks = tasks.filter(task => task.isCompleted);
    setTasks(completedTasks); 

    fetchTasks(nextDayKey).then(nextDayTasks => {
      const migratedTasks = incompleteTasks.map(task => ({ ...task, dueDate: nextDayKey, createdAt: Date.now() })); // Update createdAt for new sort order
      saveTasks(nextDayKey, [...nextDayTasks, ...migratedTasks].sort((a,b) => a.createdAt - b.createdAt));
      alert(`${incompleteTasks.length} task(s) migrated to ${format(parseISO(nextDayKey), 'MMM do')}.`);
    });
  };

  function handleDragStart(event: any) {
    setActiveDragItem(event.active);
  }

  function handleDragEnd(event: any) {
    setActiveDragItem(null);
    const { active, over } = event;
    if (active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }
  
  const activeTask = activeDragItem ? tasks.find(task => task.id === activeDragItem.id) : null;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline text-xl">Actionable Tasks</CardTitle>
        <Button variant="outline" size="sm" onClick={handleMigrateTasks} disabled={!tasks.some(t => !t.isCompleted)}>
          <ChevronsRight className="mr-2 h-4 w-4" /> Migrate Incomplete
        </Button>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4 overflow-hidden">
        <div className="flex gap-2">
          <Input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a new task..."
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            aria-label="New task input"
          />
          <Button onClick={handleAddTask} aria-label="Add new task">
            <PlusCircle className="mr-2 h-4 w-4" /> Add
          </Button>
        </div>
        {isLoading ? (
          <p>Loading tasks...</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <ScrollArea className="flex-grow h-[calc(100vh-350px)]"> {/* Adjust height as needed */}
              {tasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No tasks for today. Add some!</p>
              ) : (
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-1">
                    {tasks.map(task => (
                       <SortableTaskItem 
                          key={task.id} 
                          task={task} 
                          onToggleComplete={handleToggleComplete}
                          onDeleteTask={handleDeleteTask}
                          onEditTask={handleEditTask}
                        />
                    ))}
                  </div>
                </SortableContext>
              )}
            </ScrollArea>
             <DragOverlay>
              {activeTask ? (
                 <div className="flex items-center gap-2 p-2 bg-accent shadow-lg rounded-md">
                   <Button variant="ghost" size="icon" className="cursor-grabbing p-1 h-auto">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                   </Button>
                   <Checkbox checked={activeTask.isCompleted} readOnly />
                   <label className={`flex-grow ${activeTask.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                     {activeTask.text}
                   </label>
                 </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
}
