import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import StartupDashboard from './pages/StartupDashboard';
import CreatorDashboard from './pages/CreatorDashboard';

import { ThemeProvider } from './context/ThemeContext';

import ChatBot from './components/ChatBot';

function App() {
  const [user, setUser] = React.useState(null);
  const [isChatOpen, setIsChatOpen] = React.useState(false);

  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <ThemeProvider>
      <div className="App bg-background text-foreground min-h-screen transition-colors duration-300">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage user={user} />} />
            <Route
              path="/auth"
              element={user ? <Navigate to={user.role === 'startup' ? '/startup' : '/creator'} /> : <AuthPage onLogin={handleLogin} />}
            />
            <Route
              path="/startup"
              element={user && user.role === 'startup' ? <StartupDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/auth" />}
            />
            <Route
              path="/creator"
              element={user && user.role === 'creator' ? <CreatorDashboard user={user} onLogout={handleLogout} onOpenChat={() => setIsChatOpen(true)} /> : <Navigate to="/auth" />}
            />
          </Routes>
          {user && <ChatBot isOpen={isChatOpen} setIsOpen={setIsChatOpen} />}
        </BrowserRouter>
        <Toaster position="top-right" />
      </div>
    </ThemeProvider>
  );
}

export default App;