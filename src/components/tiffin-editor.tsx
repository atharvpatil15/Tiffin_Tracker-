"use client";

import type { FC } from "react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { TiffinDay } from "@/lib/types";
import { MEAL_PRICES } from "@/lib/constants";
import { Sunrise, Sun, Moon } from "lucide-react";

interface TiffinEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  initialMeals: Partial<TiffinDay>;
  onSave: (meals: TiffinDay) => void;
}

const TiffinEditor: FC<TiffinEditorProps> = ({
  open,
  onOpenChange,
  date,
  initialMeals,
  onSave,
}) => {
  const [meals, setMeals] = useState<TiffinDay>({
    breakfast: false,
    lunch: false,
    dinner: false,
    ...initialMeals,
  });

  useEffect(() => {
    setMeals({
      breakfast: false,
      lunch: false,
      dinner: false,
      ...initialMeals,
    });
  }, [initialMeals, date]);

  const handleSave = () => {
    onSave(meals);
  };

  const handleCheckedChange = (meal: keyof TiffinDay, checked: boolean) => {
    setMeals((prev) => ({ ...prev, [meal]: checked }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline">
            Log Tiffin for {format(date, "MMMM d, yyyy")}
          </DialogTitle>
          <DialogDescription>
            Select the meals you took on this day.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-3 rounded-md border p-4 transition-all has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
            <Checkbox
              id="breakfast"
              checked={meals.breakfast}
              onCheckedChange={(checked) => handleCheckedChange("breakfast", !!checked)}
            />
            <Label
              htmlFor="breakfast"
              className="flex-1 flex justify-between items-center text-sm font-medium cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sunrise className="h-5 w-5 text-accent" />
                Breakfast
              </div>
              <span className="font-mono text-muted-foreground">₹{MEAL_PRICES.breakfast.toFixed(2)}</span>
            </Label>
          </div>
          <div className="flex items-center space-x-3 rounded-md border p-4 transition-all has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
            <Checkbox
              id="lunch"
              checked={meals.lunch}
              onCheckedChange={(checked) => handleCheckedChange("lunch", !!checked)}
            />
            <Label
              htmlFor="lunch"
              className="flex-1 flex justify-between items-center text-sm font-medium cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sun className="h-5 w-5 text-accent" />
                Lunch
              </div>
              <span className="font-mono text-muted-foreground">₹{MEAL_PRICES.lunch.toFixed(2)}</span>
            </Label>
          </div>
          <div className="flex items-center space-x-3 rounded-md border p-4 transition-all has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
            <Checkbox
              id="dinner"
              checked={meals.dinner}
              onCheckedChange={(checked) => handleCheckedChange("dinner", !!checked)}
            />
            <Label
              htmlFor="dinner"
              className="flex-1 flex justify-between items-center text-sm font-medium cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Moon className="h-5 w-5 text-accent" />
                Dinner
              </div>
              <span className="font-mono text-muted-foreground">₹{MEAL_PRICES.dinner.toFixed(2)}</span>
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TiffinEditor;
