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
import { Label } from "@/components/ui/label";
import type { TiffinDay, MealType } from "@/lib/types";
import { MEAL_PRICES } from "@/lib/constants";
import { Sunrise, Sun, Moon, Minus, Plus } from "lucide-react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

interface TiffinEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  initialMeals: Partial<TiffinDay>;
  onSave: (meals: TiffinDay) => void;
}

const QuantityInput: FC<{
  meal: MealType;
  value: number;
  onChange: (value: number) => void;
  icon: React.ReactNode;
  price: number;
}> = ({ meal, value, onChange, icon, price }) => {
  const handleIncrement = () => onChange(value + 1);
  const handleDecrement = () => onChange(Math.max(0, value - 1));
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    onChange(isNaN(newValue) || newValue < 0 ? 0 : newValue);
  };

  return (
    <div
      className={cn(
        "flex items-center space-x-3 rounded-md border p-4 transition-all",
        value > 0 && "bg-primary/10 border-primary"
      )}
    >
      <Label
        htmlFor={meal}
        className="flex-1 flex justify-between items-center text-sm font-medium cursor-pointer"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="capitalize">{meal}</span>
        </div>
        <span className="font-mono text-muted-foreground">
          Rs. {price.toFixed(2)}
        </span>
      </Label>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={handleDecrement}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          id={meal}
          type="number"
          value={value}
          onChange={handleInputChange}
          className="w-16 h-8 text-center"
          min="0"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={handleIncrement}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const TiffinEditor: FC<TiffinEditorProps> = ({
  open,
  onOpenChange,
  date,
  initialMeals,
  onSave,
}) => {
  const [meals, setMeals] = useState<TiffinDay>({
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    ...initialMeals,
  });

  useEffect(() => {
    setMeals({
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      ...initialMeals,
    });
  }, [initialMeals, date]);

  const handleSave = () => {
    onSave(meals);
  };

  const handleQuantityChange = (meal: MealType, quantity: number) => {
    setMeals((prev) => ({ ...prev, [meal]: quantity }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline">
            Log Tiffin for {format(date, "MMMM d, yyyy")}
          </DialogTitle>
          <DialogDescription>
            Select the quantity for each meal you took on this day.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <QuantityInput
            meal="breakfast"
            value={meals.breakfast}
            onChange={(q) => handleQuantityChange("breakfast", q)}
            icon={<Sunrise className="h-5 w-5 text-accent" />}
            price={MEAL_PRICES.breakfast}
          />
          <QuantityInput
            meal="lunch"
            value={meals.lunch}
            onChange={(q) => handleQuantityChange("lunch", q)}
            icon={<Sun className="h-5 w-5 text-accent" />}
            price={MEAL_PRICES.lunch}
          />
          <QuantityInput
            meal="dinner"
            value={meals.dinner}
            onChange={(q) => handleQuantityChange("dinner", q)}
            icon={<Moon className="h-5 w-5 text-accent" />}
            price={MEAL_PRICES.dinner}
          />
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
