"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        style: {
          borderRadius: "1rem",
          fontSize: "14px",
          fontWeight: 500,
        },
        classNames: {
          toast: "shadow-card border border-border/60",
          success: "text-foreground",
        },
      }}
    />
  );
}
