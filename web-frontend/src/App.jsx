import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
  };

  return (
    <div className="App">
      {isAuthenticated ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Login onLogin={handleLogin} />
      )}
      <Toaster
        position="top-center"
        toastOptions={{
          className: '',
          style: {
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            padding: '12px 24px',
            color: '#1e293b',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '600',
          },
          success: {
            iconTheme: {
              primary: '#0d9488',
              secondary: 'white',
            },
            style: {
              border: '1px solid rgba(13, 148, 136, 0.2)',
              background: 'rgba(240, 253, 250, 0.9)',
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: 'white',
            },
            style: {
              border: '1px solid rgba(239, 68, 68, 0.2)',
              background: 'rgba(254, 242, 242, 0.9)',
            }
          },
        }}
      />
    </div>
  );
}

export default App;
