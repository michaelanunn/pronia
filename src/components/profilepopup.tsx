"use client";

import { X, User, Heart, BookMarked, FileText, Settings, LogOut, Library } from "lucide-react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

interface ProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: User, label: "Profile", path: "/profile" },
  { icon: Heart, label: "Notifications", path: "/notifications" },
  { icon: FileText, label: "Journal", path: "/journal" },
  { icon: Library, label: "Library", path: "/library" },
  { icon: BookMarked, label: "Saved Posts", path: "/saved" },
  { icon: FileText, label: "Log Practice", path: "/log-practice" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export const ProfilePopup = ({ isOpen, onClose }: ProfilePopupProps) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-card z-50 shadow-2xl animate-in slide-in-from-right">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
            
            <div className="flex flex-col items-center text-center mt-8">
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
                <User className="h-12 w-12" />
              </div>
              <h2 className="text-xl font-bold">Emma Smith</h2>
              <p className="text-sm text-muted-foreground">@emmasmith</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary transition-colors text-left"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Log Out</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
