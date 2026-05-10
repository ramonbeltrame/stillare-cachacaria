"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { step: 1, label: "Identificação" },
  { step: 2, label: "Frete" },
  { step: 3, label: "Pagamento" },
];

interface CheckoutStepsProps {
  currentStep: 1 | 2 | 3;
}

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((s, i) => {
          const isCompleted = s.step < currentStep;
          const isCurrent = s.step === currentStep;
          const isFuture = s.step > currentStep;

          return (
            <div key={s.step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full text-sm font-semibold transition-all duration-300",
                    isCompleted &&
                      "bg-green-500 text-white",
                    isCurrent &&
                      "bg-amber-500 text-[#1a0f07] ring-4 ring-amber-500/20",
                    isFuture &&
                      "border-2 border-amber-500/20 text-amber-100/30"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{s.step}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium text-center transition-colors",
                    isCompleted && "text-green-400",
                    isCurrent && "text-amber-400 font-bold",
                    isFuture && "text-amber-100/30"
                  )}
                >
                  {s.label}
                </span>
              </div>

              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "h-[2px] flex-1 mx-2 -mt-6 transition-colors duration-500",
                    s.step < currentStep ? "bg-green-500" : "bg-amber-500/20"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
