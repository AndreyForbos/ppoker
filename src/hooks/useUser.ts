import { useState, useEffect, useCallback } from 'react';

const USER_ID_KEY = 'planning-poker-user-id';
const USER_NAME_KEY = 'planning-poker-user-name';

export interface UserProfile {
  id: string;
  name: string | null;
}

export const useUser = () => {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    let storedUserId = localStorage.getItem(USER_ID_KEY);
    if (!storedUserId) {
      storedUserId = `user_${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem(USER_ID_KEY, storedUserId);
    }
    
    const storedUserName = localStorage.getItem(USER_NAME_KEY);

    setUser({ id: storedUserId, name: storedUserName });
  }, []);

  const setUserName = useCallback((name: string) => {
    localStorage.setItem(USER_NAME_KEY, name);
    setUser(prev => (prev ? { ...prev, name } : null));
  }, []);

  return { user, setUserName };
};