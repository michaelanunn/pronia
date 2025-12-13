"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface PracticeSession {
  id: string;
  date: string;
  duration: number; // in seconds
  piece?: string;
  composer?: string;
  notes?: string;
}

interface PracticeContextType {
  sessions: PracticeSession[];
  addSession: (session: Omit<PracticeSession, "id">) => void;
  getTotalPracticeTime: () => number; // in seconds
  getWeeklyPracticeTime: () => number; // in seconds
  getWeeklyPracticeByDay: () => { day: string; hours: number }[];
}

const PracticeContext = createContext<PracticeContextType | undefined>(undefined);

const STORAGE_KEY = "pronia_practice_sessions";

export const PracticeProvider = ({ children }: { children: ReactNode }) => {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);

  // Load stored sessions on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSessions(JSON.parse(stored));
    }
  }, []);

  // Save to localStorage whenever sessions change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const addSession = (session: Omit<PracticeSession, "id">) => {
    const newSession: PracticeSession = {
      ...session,
      id: Date.now().toString(),
    };
    setSessions((prev) => [newSession, ...prev]);
  };

  const getTotalPracticeTime = () => {
    return sessions.reduce((total, session) => total + session.duration, 0);
  };

  const getWeeklyPracticeTime = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    return sessions
      .filter((session) => new Date(session.date) >= weekStart)
      .reduce((total, session) => total + session.duration, 0);
  };

  const getWeeklyPracticeByDay = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const dayTotals: Record<string, number> = {};
    days.forEach((day) => (dayTotals[day] = 0));

    sessions
      .filter((session) => new Date(session.date) >= weekStart)
      .forEach((session) => {
        const sessionDate = new Date(session.date);
        const dayName = days[sessionDate.getDay()];
        dayTotals[dayName] += session.duration / 3600; // Convert to hours
      });

    return days.map((day) => ({
      day,
      hours: Math.round(dayTotals[day] * 10) / 10,
    }));
  };

  return (
    <PracticeContext.Provider
      value={{
        sessions,
        addSession,
        getTotalPracticeTime,
        getWeeklyPracticeTime,
        getWeeklyPracticeByDay,
      }}
    >
      {children}
    </PracticeContext.Provider>
  );
};

export const usePractice = () => {
  const context = useContext(PracticeContext);
  if (context === undefined) {
    throw new Error("usePractice must be used within a PracticeProvider");
  }
  return context;
};

