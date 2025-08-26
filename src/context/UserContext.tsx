import { createContext, useState, useEffect, useCallback, ReactNode, useContext } from 'react';

const USER_ID_KEY = 'planning-poker-user-id';
const USER_NAME_KEY = 'planning-poker-user-name';
const USER_ROLE_KEY = 'planning-poker-user-role';

export type UserRole = 'player' | 'spectator';

export interface UserProfile {
  id: string;
  name: string | null;
  role: UserRole | null;
}

interface UserContextType {
  user: UserProfile | null;
  setUserName: (name: string) => void;
  setUserAsSpectator: () => void;
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
    const storedUserRole = localStorage.getItem(USER_ROLE_KEY) as UserRole | null;

    setUser({ id: storedUserId, name: storedUserName, role: storedUserRole });
    setLoading(false);
  }, []);

  const setUserName = useCallback((name: string) => {
    localStorage.setItem(USER_NAME_KEY, name);
    localStorage.setItem(USER_ROLE_KEY, 'player');
    setUser(prev => (prev ? { ...prev, name, role: 'player' } : null));
  }, []);

  const setUserAsSpectator = useCallback(() => {
    localStorage.removeItem(USER_NAME_KEY);
    localStorage.setItem(USER_ROLE_KEY, 'spectator');
    setUser(prev => (prev ? { ...prev, name: null, role: 'spectator' } : null));
  }, []);

  return (
    <UserContext.Provider value={{ user, setUserName, setUserAsSpectator, loading }}>
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