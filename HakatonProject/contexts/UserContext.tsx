import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface UserContextType {
  joinedEvents: string[];
  toggleEvent: (eventId: string) => void;
  isJoined: (eventId: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [joinedEvents, setJoinedEvents] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('joinedEvents');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('joinedEvents', JSON.stringify(joinedEvents));
  }, [joinedEvents]);

  const toggleEvent = (eventId: string) => {
    setJoinedEvents(prev => {
      if (prev.includes(eventId)) {
        return prev.filter(id => id !== eventId);
      } else {
        return [...prev, eventId];
      }
    });
  };

  const isJoined = (eventId: string) => joinedEvents.includes(eventId);

  return (
    <UserContext.Provider value={{ joinedEvents, toggleEvent, isJoined }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};