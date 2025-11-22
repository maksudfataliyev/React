import React, { useState } from 'react';

interface TooltipContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TooltipContext = React.createContext<TooltipContextType>({
  open: false,
  setOpen: () => {},
});

export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const Tooltip: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  
  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">
        {children}
      </div>
    </TooltipContext.Provider>
  );
};

interface TooltipTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

export const TooltipTrigger = React.forwardRef<HTMLDivElement, TooltipTriggerProps>(
  ({ children }, ref) => {
    const { setOpen } = React.useContext(TooltipContext);

    return (
      <div
        ref={ref}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="inline-block"
      >
        {children}
      </div>
    );
  }
);

TooltipTrigger.displayName = 'TooltipTrigger';

export const TooltipContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { open } = React.useContext(TooltipContext);

  if (!open) return null;

  return (
    <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 overflow-hidden rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--popover))] px-3 py-1.5 text-sm text-[hsl(var(--popover-foreground))] shadow-md animate-in fade-in-0 zoom-in-95">
      {children}
    </div>
  );
};