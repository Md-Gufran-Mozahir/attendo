import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, verifyToken, logout as authServiceLogout } from '../services/authService';

const UserContext = createContext();

const AuthContext = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          // Try to get user from localStorage first (faster initial load)
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const userData = JSON.parse(storedUser);
              if (userData && userData.userId) {
                setUser(userData);
              } else {
                console.error('Stored user data is invalid:', storedUser);
                throw new Error('Invalid user data');
              }
            } catch (parseError) {
              console.error('Error parsing stored user data:', parseError);
              throw new Error('Error parsing user data');
            }
          }
          
          // Then verify with the server
          try {
            const { data } = await verifyToken();
            if (data && data.user) {
              setUser(data.user);
              localStorage.setItem('user', JSON.stringify(data.user));
            } else {
              console.error('Verification response missing user data:', data);
              throw new Error('Verification response missing user data');
            }
          } catch (verifyError) {
            console.error('Token verification failed:', verifyError);
            // If token verification fails, clear auth data
            setUser(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } else {
          setUser(null);
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    
    verifyUser();
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    authServiceLogout();
  };

  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useAuth = () => useContext(UserContext);

export default AuthContext;
