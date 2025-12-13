"use client";

import { ReactNode } from "react";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";

interface LayoutProps {
  children: ReactNode;
  streak?: number;
  showBranding?: boolean;
}

export const Layout = ({ children, streak, showBranding = true }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <TopBar streak={streak} showBranding={showBranding} />
      <main className="pt-16 pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  );
};
