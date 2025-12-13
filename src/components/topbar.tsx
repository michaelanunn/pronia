"use client";

import { Flame, User } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { ProfilePopup } from "./ProfilePopup";

interface TopBarProps {
  streak?: number;
  showBranding?: boolean;
}

export const TopBar = ({ streak = 0, showBranding = true }: TopBarProps) => {
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-background border-b border-border z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex-1" />
          
          {showBranding && (
            <h1 className="absolute left-1/2 -translate-x-1/2 text-xl font-bold tracking-tight" style={{ fontFamily: 'Times New Roman, serif' }}>
              PRONIA
            </h1>
          )}
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-full">
              <span className="text-sm font-semibold">{streak}</span>
              <Flame className="h-4 w-4 text-[#ff6b35]" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9"
              onClick={() => setShowProfilePopup(true)}
            >
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
            </Button>
          </div>
        </div>
      </header>

      <ProfilePopup 
        isOpen={showProfilePopup} 
        onClose={() => setShowProfilePopup(false)} 
      />
    </>
  );
};
