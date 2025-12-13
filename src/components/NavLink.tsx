"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
}

export const NavLink = ({ to, children, className, activeClassName }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === to;

  return (
    <Link
      href={to}
      className={cn(className, isActive && activeClassName)}
    >
      {children}
    </Link>
  );
};
