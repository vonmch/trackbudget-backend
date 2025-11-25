import { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

// ----------------------------------------------------
// NOTE: CHANGE THIS TO YOUR LIVE URL WHEN DEPLOYING
// ----------------------------------------------------
// const PROD_URL = 'http://localhost:4000/api'; 
const PROD_URL = 'https://trackbudgetbuild.onrender.com/api'; 

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. On load, check if we have a token saved
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token with backend
          const res = await fetch(`${PROD_URL}/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
          } else {
            localStorage.removeItem('token');
          }
        } catch (err) {
          console.error("Session restore failed", err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  // 2. Login Function
  const login = (userData, token) => {
    localStorage.setItem('token', token); // Save to browser memory
    setUser(userData);
  };

  // 3. Logout Function
  const logout = () => {
    localStorage.removeItem('token'); // Delete from memory
    setUser(null);
    window.location.href = '/login'; // Force redirect
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, PROD_URL }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext;