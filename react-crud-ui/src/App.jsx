import React, { useState, useEffect } from 'react';
import { LogOut, Sun, Moon, Briefcase, User } from 'lucide-react';
import { userService } from './services/userService';
import UserList from './components/UserList';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // Load existing session
    const user = userService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }

    // Set initial dark theme
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await userService.login(email, password);
      if (res.success) {
        // Retrieve current logged in user from local storage
        setCurrentUser(userService.getCurrentUser());
      } else {
        setLoginError(res.message || 'Login failed.');
      }
    } catch (err) {
      console.error(err);
      setLoginError(err.response?.data?.message || 'Connection failed. Verify Node backend is running on port 5000.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    userService.logout();
    setCurrentUser(null);
  };

  // Auth screen layout
  if (!currentUser) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card animate-zoom-in">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div className="avatar" style={{ width: '56px', height: '56px', fontSize: '1.5rem' }}>
              <Briefcase size={28} />
            </div>
          </div>
          <h1 className="auth-title">HRMS Enterprise</h1>
          <p className="auth-subtitle">Sign in to manage company employees</p>
          
          {loginError && (
            <div className="alert alert-danger animate-fade-in">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <input
                type="email"
                id="login-email"
                placeholder="admin@company.com"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label" htmlFor="login-password">Password</label>
              <input
                type="password"
                id="login-password"
                placeholder="••••••••"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem' }}
              disabled={loginLoading}
            >
              {loginLoading ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            <p>💡 Tip: Login using your HRMS database credentials</p>
            <p>(e.g. your Admin / HR email & password)</p>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard screen layout
  return (
    <div className="app-container">
      <header className="header animate-fade-in">
        <div className="header-brand">
          <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}>
            <Briefcase size={16} />
          </div>
          <span>HRMS PORTAL</span>
        </div>
        
        <div className="header-actions">
          <button onClick={toggleTheme} className="theme-toggle" title="Toggle Light/Dark mode">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingRight: '0.5rem', borderRight: '1px solid var(--border-color)' }}>
            <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}>
              <User size={16} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{currentUser.name || 'User'}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{currentUser.role_name || 'Admin'}</span>
            </div>
          </div>

          <button onClick={handleLogout} className="btn btn-secondary btn-icon-only" title="Sign Out">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="main-content">
        <UserList />
      </main>
    </div>
  );
}

export default App;
