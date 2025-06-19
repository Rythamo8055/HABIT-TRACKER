"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { GoalDecompositionForm } from "@/components/goals/GoalDecompositionForm";
import { NaturalLanguageSchedulingForm } from "@/components/scheduling/NaturalLanguageSchedulingForm";
import { BotMessageSquare, CalendarPlus, CheckCircle, Lightbulb } from "lucide-react";

type CommandKDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CommandKDialog({ open, onOpenChange }: CommandKDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2 font-headline text-2xl">
            <BotMessageSquare className="h-6 w-6 text-primary" />
            AI Command Center
          </DialogTitle>
          <DialogDescription>
            Leverage AI to decompose goals, schedule your day, and more.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6">
          <Tabs defaultValue="goal-decomposition" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="goal-decomposition">
                <Lightbulb className="mr-2 h-4 w-4" /> Decompose Goal
              </TabsTrigger>
              <TabsTrigger value="schedule-day">
                <CalendarPlus className="mr-2 h-4 w-4" /> Schedule Day
              </TabsTrigger>
            </TabsList>
            <TabsContent value="goal-decomposition">
              <GoalDecompositionForm onSuccessfulDecomposition={() => onOpenChange(false)} />
            </TabsContent>
            <TabsContent value="schedule-day">
              <NaturalLanguageSchedulingForm onSuccessfulScheduling={() => onOpenChange(false)} />
            </TabsContent>
          </Tabs>
        </div>
        {/* <DialogFooter className="p-6 pt-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
