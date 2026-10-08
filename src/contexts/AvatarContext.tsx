import React, { createContext, useContext, useState, useEffect } from 'react';
import { AvatarResult, AvatarOptions } from '@/lib/avatarAI';

interface AvatarContextType {
  currentAvatar: AvatarResult | null;
  setCurrentAvatar: (avatar: AvatarResult | null) => void;
  options: AvatarOptions;
  setOptions: (options: AvatarOptions) => void;
  updateOption: (key: keyof AvatarOptions, value: string) => void;
  addModification: (note: string) => void;
  resetAvatar: () => void;
  history: AvatarResult[];
  addToHistory: (avatar: AvatarResult) => void;
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

export function AvatarProvider({ children }: { children: React.ReactNode }) {
  const [currentAvatar, setCurrentAvatar] = useState<AvatarResult | null>(null);
  const [options, setOptions] = useState<AvatarOptions>({
    category: 'single',
    baseDoll: 'standard',
    background: 'none',
    size: 'medium',
    material: 'resin',
    peopleCount: 2,
  });
  const [history, setHistory] = useState<AvatarResult[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('avatarHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
        })));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('avatarHistory', JSON.stringify(history));
    }
  }, [history]);

  const updateOption = (key: keyof AvatarOptions, value: string) => {
    setOptions(prev => ({ 
      ...prev, 
      [key]: key === 'peopleCount' ? parseInt(value) : value 
    }));
  };

  const addModification = (note: string) => {
    if (currentAvatar) {
      setCurrentAvatar({
        ...currentAvatar,
        notes: [...currentAvatar.notes, note],
      });
    }
  };

  const resetAvatar = () => {
    setCurrentAvatar(null);
    setOptions({
      category: 'single',
      baseDoll: 'standard',
      background: 'none',
      size: 'medium',
      material: 'resin',
      peopleCount: 2,
    });
  };

  const addToHistory = (avatar: AvatarResult) => {
    setHistory(prev => [avatar, ...prev].slice(0, 50)); // Keep last 50
  };

  return (
    <AvatarContext.Provider
      value={{
        currentAvatar,
        setCurrentAvatar,
        options,
        setOptions,
        updateOption,
        addModification,
        resetAvatar,
        history,
        addToHistory,
      }}
    >
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatar() {
  const context = useContext(AvatarContext);
  if (context === undefined) {
    throw new Error('useAvatar must be used within an AvatarProvider');
  }
  return context;
}
