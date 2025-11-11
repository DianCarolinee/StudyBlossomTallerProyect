
"use client";

import React from 'react';
import { cn } from "@/lib/utils";

interface PlantProps extends React.SVGProps<SVGSVGElement> {
  stage: number;
}

export const Plant = ({ stage, className, ...props }: PlantProps) => {
  const getPlantPath = () => {
    switch (stage) {
      case 1: // Seed
        return (
          <g className="animate-in fade-in zoom-in-50 duration-1000">
            <path d="M12 18C10.3431 18 9 16.6569 9 15C9 13.3431 10.3431 12 12 12C13.6569 12 15 13.3431 15 15C15 16.6569 13.6569 18 12 18Z" fill="hsl(var(--primary))" stroke="hsl(var(--primary-foreground))" strokeWidth="0.5" />
            <path d="M12 20C15.3137 20 18 17.3137 18 14" stroke="hsl(var(--border))" strokeWidth="1" strokeLinecap="round" />
          </g>
        );
      case 2: // Sprout
        return (
          <g className="animate-in fade-in-0 slide-in-from-bottom-5 duration-1000">
            <path d="M12 20V12" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M12 12C10 12 9 10 10 8" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M12 12C14 12 15 10 14 8" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        );
      case 3: // Young stalk
        return (
          <g className="animate-in fade-in-0 slide-in-from-bottom-5 duration-1000">
            <path d="M12 20V8" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M12 14C10 14 9 12 10.5 10" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M12 14C14 14 15 12 13.5 10" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M12 8C10.5 6 9.5 5 11 4" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M12 8C13.5 6 14.5 5 13 4" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        );
      case 4: // Strong Plant
        return (
          <g className="animate-in fade-in-0 slide-in-from-bottom-5 duration-1000">
            <path d="M12 20V6" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" />
            <ellipse cx="8.5" cy="10" rx="2.5" ry="4" fill="hsl(var(--accent))" stroke="hsl(var(--primary))" strokeWidth="1.5" transform="rotate(-30 8.5 10)" />
            <ellipse cx="15.5" cy="10" rx="2.5" ry="4" fill="hsl(var(--accent))" stroke="hsl(var(--primary))" strokeWidth="1.5" transform="rotate(30 15.5 10)" />
             <ellipse cx="10" cy="5.5" rx="3" ry="2.5" fill="hsl(var(--accent))" stroke="hsl(var(--primary))" strokeWidth="1.5" transform="rotate(15 10 5.5)" />
             <ellipse cx="14" cy="5.5" rx="3" ry="2.5" fill="hsl(var(--accent))" stroke="hsl(var(--primary))" strokeWidth="1.5" transform="rotate(-15 14 5.5)" />
          </g>
        );
      case 5: // Flowering
         return (
           <g className="animate-in fade-in-0 zoom-in-75 duration-1000">
            <path d="M12 20V9" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" />
            <path d="M9 16a3 3 0 01-3-3V9h6v4a3 3 0 01-3 3z" fill="hsl(var(--accent))" opacity="0.6" stroke="hsl(var(--primary))" strokeWidth="1.5" />
            <path d="M15 16a3 3 0 003-3V9h-6v4a3 3 0 003 3z" fill="hsl(var(--accent))" opacity="0.6" stroke="hsl(var(--primary))" strokeWidth="1.5" />
            {/* Flower */}
            <circle cx="12" cy="7" r="2" fill="yellow" stroke="hsl(var(--primary-foreground))" strokeWidth="0.5"/>
            <path d="M12 7a2.5 2.5 0 00-2.5-2.5 2.5 2.5 0 100 5 2.5 2.5 0 002.5-2.5z" fill="hsl(var(--primary))" transform="translate(-2, -2) rotate(45 12 7)" />
            <path d="M12 7a2.5 2.5 0 00-2.5-2.5 2.5 2.5 0 100 5 2.5 2.5 0 002.5-2.5z" fill="hsl(var(--primary))" transform="translate(2, -2) rotate(135 12 7)" />
            <path d="M12 7a2.5 2.5 0 00-2.5-2.5 2.5 2.5 0 100 5 2.5 2.5 0 002.5-2.5z" fill="hsl(var(--primary))" transform="translate(2, 2) rotate(225 12 7)" />
            <path d="M12 7a2.5 2.5 0 00-2.5-2.5 2.5 2.5 0 100 5 2.5 2.5 0 002.5-2.5z" fill="hsl(var(--primary))" transform="translate(-2, 2) rotate(315 12 7)" />
          </g>
        );
      case 6: // Wise Tree
        return (
          <g className="animate-in fade-in-0 zoom-in-75 duration-1000">
            {/* Trunk */}
            <path d="M12 20v-8" strokeWidth="4" stroke="hsl(var(--primary))" strokeLinecap="round" />
            <path d="M12 12l-4 4" strokeWidth="3" stroke="hsl(var(--primary))" strokeLinecap="round" />
            <path d="M12 12l4 4" strokeWidth="3" stroke="hsl(var(--primary))" strokeLinecap="round" />
            {/* Crown */}
            <circle cx="12" cy="7" r="5" fill="hsl(var(--accent))" opacity="0.8" />
            <circle cx="8" cy="8" r="4" fill="hsl(var(--accent))" opacity="0.8" />
            <circle cx="16" cy="8" r="4" fill="hsl(var(--accent))" opacity="0.8" />
            <circle cx="10" cy="4" r="3" fill="hsl(var(--primary))" opacity="0.6" />
            <circle cx="14" cy="4" r="3" fill="hsl(var(--primary))" opacity="0.6" />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-primary", className)}
      {...props}
    >
      {getPlantPath()}
      {/* Ground */}
      <path d="M4 20h16" strokeWidth="1" stroke="hsl(var(--border))" />
    </svg>
  );
};

    