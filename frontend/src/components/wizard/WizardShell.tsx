"use client";

import { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface WizardShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  step?: number;
  totalSteps?: number;
  headerExtras?: ReactNode;
  children: ReactNode;
}

export function WizardShell({
  open,
  onOpenChange,
  title,
  step,
  totalSteps,
  headerExtras,
  children,
}: WizardShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {(step !== undefined && totalSteps !== undefined) && (
            <DialogDescription>
              Step {step} of {totalSteps}
            </DialogDescription>
          )}
          {headerExtras}
        </DialogHeader>

        <div className="space-y-3">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}


