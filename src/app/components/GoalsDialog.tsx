import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Target } from "lucide-react";
import type { Swimmer, SwimmerGoal } from "../data/swimmers";
import { GoalsManager } from "./GoalsManager";

interface GoalsDialogProps {
  swimmer: Swimmer;
  onUpdateGoals: (swimmerId: string, goals: SwimmerGoal[]) => void;
}

export function GoalsDialog({ swimmer, onUpdateGoals }: GoalsDialogProps) {
  const [open, setOpen] = useState(false);

  const handleUpdateGoals = (goals: SwimmerGoal[]) => {
    onUpdateGoals(swimmer.id, goals);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Target className="w-4 h-4" />
          Metas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Metas y Objetivos - {swimmer.name}</DialogTitle>
        </DialogHeader>
        <GoalsManager swimmer={swimmer} onUpdateGoals={handleUpdateGoals} />
      </DialogContent>
    </Dialog>
  );
}
