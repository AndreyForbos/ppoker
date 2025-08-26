import { createContext, useState, useEffect, useCallback, ReactNode, useContext } from 'react';

const USER_ID_KEY = 'planning-poker-user-id';
const USER_NAME_KEY = 'planning-poker-user-name';

export interface UserProfile {
  id: string;
  name: string | null;
}

interface UserContextType {
  user: UserProfile | null;
  setUserName: (name: string) => void;
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

    setUser({ id: storedUserId, name: storedUserName });
    setLoading(false);
  }, []);

  const setUserName = useCallback((name: string) => {
    localStorage.setItem(USER_NAME_KEY, name);
    setUser(prev => (prev ? { ...prev, name } : null));
  }, []);

  return (
    <UserContext.Provider value={{ user, setUserName, loading }}>
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