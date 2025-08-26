import { createContext, useState, useEffect, useCallback, ReactNode, useContext } from 'react';

const USER_ID_KEY = 'planning-poker-user-id';
const USER_NAME_KEY = 'planning-poker-user-name';
const USER_SPECTATOR_KEY = 'planning-poker-user-spectator';

export interface UserProfile {
  id: string;
  name: string | null;
  isSpectator: boolean;
}

interface UserContextType {
  user: UserProfile | null;
  setUserName: (name: string) => void;
  joinAsSpectator: () => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let storedUserId = localStorage.getItem(USER_ID_KEY);
    if (!storedUserId) {
      storedUserId = `user_${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem(USER_ID_KEY, storedUserId);
    }
    
    const storedUserName = localStorage.getItem(USER_NAME_KEY);
    const storedIsSpectator = localStorage.getItem(USER_SPECTATOR_KEY) === 'true';

    setUser({ id: storedUserId, name: storedUserName, isSpectator: storedIsSpectator });
    setLoading(false);
  }, []);

  const setUserName = useCallback((name: string) => {
    localStorage.setItem(USER_NAME_KEY, name);
    localStorage.setItem(USER_SPECTATOR_KEY, 'false');
    setUser(prev => (prev ? { ...prev, name, isSpectator: false } : null));
  }, []);

  const joinAsSpectator = useCallback(() => {
    const spectatorName = 'Espectador';
    localStorage.setItem(USER_NAME_KEY, spectatorName);
    localStorage.setItem(USER_SPECTATOR_KEY, 'true');
    setUser(prev => (prev ? { ...prev, name: spectatorName, isSpectator: true } : null));
  }, []);

  return (
    <UserContext.Provider value={{ user, setUserName, joinAsSpectator, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};