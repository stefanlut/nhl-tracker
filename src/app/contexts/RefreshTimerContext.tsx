'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { REFRESH_INTERVAL_SECONDS, NO_GAMES_REFRESH_INTERVAL_SECONDS } from '@/constants';

interface RefreshTimerState {
  secondsLeft: number;
  refreshInterval: number;
  isActive: boolean;
}

interface RefreshTimerContextType {
  getTimerState: (type: 'daily' | 'weekly', hasGames?: boolean) => RefreshTimerState;
  startTimer: (type: 'daily' | 'weekly', interval: number) => void;
  resetTimer: (type: 'daily' | 'weekly') => void;
}

const RefreshTimerContext = createContext<RefreshTimerContextType | null>(null);

interface RefreshTimerProviderProps {
  children: ReactNode;
}

export function RefreshTimerProvider({ children }: RefreshTimerProviderProps) {
  const [timers, setTimers] = useState<Record<string, RefreshTimerState>>({});
  const [intervals, setIntervals] = useState<Record<string, NodeJS.Timeout>>({});

  const getTimerState = (type: 'daily' | 'weekly', hasGames?: boolean): RefreshTimerState => {
    const key = type;
    const currentTimer = timers[key];
    
    if (!currentTimer) {
      const interval = type === 'weekly' || hasGames 
        ? REFRESH_INTERVAL_SECONDS 
        : NO_GAMES_REFRESH_INTERVAL_SECONDS;
      
      return {
        secondsLeft: interval,
        refreshInterval: interval,
        isActive: false
      };
    }
    
    return currentTimer;
  };

  const startTimer = (type: 'daily' | 'weekly', interval: number) => {
    const key = type;
    
    // Clear existing timer if any
    if (intervals[key]) {
      clearInterval(intervals[key]);
    }
    
    // Restore from localStorage if available
    const storageKey = `globalRefreshTimer_${type}`;
    let initialSeconds = interval;
    
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const { timestamp, interval: storedInterval, secondsLeft } = JSON.parse(stored);
        const elapsed = Math.floor((Date.now() - timestamp) / 1000);
        
        if (storedInterval === interval) {
          const remaining = Math.max(0, secondsLeft - elapsed);
          if (remaining > 0) {
            initialSeconds = remaining;
          } else {
            // Timer expired, trigger refresh
            window.location.reload();
            return;
          }
        }
      }
    } catch (error) {
      console.warn('Could not restore global timer state:', error);
    }

    // Set initial state
    setTimers(prev => ({
      ...prev,
      [key]: {
        secondsLeft: initialSeconds,
        refreshInterval: interval,
        isActive: true
      }
    }));

    // Start countdown
    const timer = setInterval(() => {
      setTimers(prev => {
        const current = prev[key];
        if (!current) return prev;

        const newSeconds = current.secondsLeft - 1;
        
        if (newSeconds <= 0) {
          // Timer expired, trigger refresh
          window.location.reload();
          return prev;
        }

        const newState = { ...current, secondsLeft: newSeconds };
        
        // Save to localStorage
        try {
          localStorage.setItem(storageKey, JSON.stringify({
            timestamp: Date.now(),
            interval: current.refreshInterval,
            secondsLeft: newSeconds
          }));
        } catch (error) {
          console.warn('Could not save global timer state:', error);
        }

        return { ...prev, [key]: newState };
      });
    }, 1000);

    setIntervals(prev => ({ ...prev, [key]: timer }));
  };

  const resetTimer = (type: 'daily' | 'weekly') => {
    const key = type;
    
    if (intervals[key]) {
      clearInterval(intervals[key]);
    }
    
    setTimers(prev => {
      const newTimers = { ...prev };
      delete newTimers[key];
      return newTimers;
    });

    setIntervals(prev => {
      const newIntervals = { ...prev };
      delete newIntervals[key];
      return newIntervals;
    });

    // Clean up localStorage
    try {
      localStorage.removeItem(`globalRefreshTimer_${type}`);
    } catch {
      // Ignore cleanup errors
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  }, [intervals]);

  return (
    <RefreshTimerContext.Provider value={{ getTimerState, startTimer, resetTimer }}>
      {children}
    </RefreshTimerContext.Provider>
  );
}

export function useRefreshTimer() {
  const context = useContext(RefreshTimerContext);
  if (!context) {
    throw new Error('useRefreshTimer must be used within a RefreshTimerProvider');
  }
  return context;
}
