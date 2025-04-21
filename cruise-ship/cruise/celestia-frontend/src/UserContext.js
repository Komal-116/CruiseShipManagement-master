import React, { createContext, useState, useEffect } from 'react';
import { auth } from './firebaseConfig';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onIdTokenChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserId(currentUser.uid);
        const idToken = await currentUser.getIdToken(true); // Force refresh token
        localStorage.setItem('idToken', idToken);
      } else {
        setUser(null);
        setUserId(null);
        localStorage.removeItem('idToken');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, userId, loading }}>
      {children}
    </UserContext.Provider>
  );
};