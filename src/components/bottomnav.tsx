"use client";

import { Home, Music2, PlayCircle, LayoutDashboard, User } from "lucide-react";
import { NavLink } from "./NavLink";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Music2, label: "Library", path: "/library" },
  { icon: PlayCircle, label: "Record", path: "/record" },
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: User, label: "Profile", path: "/profile" },
];

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors text-muted-foreground"
            activeClassName="text-foreground bg-secondary"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
