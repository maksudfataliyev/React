import { useEffect, useState } from 'react';
import { validateUser } from './auth';
import { Link } from 'react-router-dom';
import { applyTheme } from '../../components/theme';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import './Login.css'

export default function Login() {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(''); // Clear previous errors

    if (!username.trim() || !password.trim()) {
      setErrorMessage(t('fillAllFields') || 'Please fill all fields');
      return;
    }

    setIsLoading(true);

    try {
      const result = await validateUser(username.trim(), password);

      if (result.success) {
        localStorage.setItem('loggedInUser', username);
        // No success message - just redirect
        window.location.href = '/';
      } else {
        // Translate the backend error message
        if (result.message && result.message.toLowerCase().includes('invalid')) {
          setErrorMessage(t('invalidCredentials'));
        } else {
          setErrorMessage(result.message || t('invalidCredentials'));
        }
      }
    } catch (error) {
      setErrorMessage('Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <div className="auth-page">
      <LanguageSwitcher />
      <div className="theme-controls">
        <div className="account-item">
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
          </button>
        </div>
      </div>
      <h1 className='login_title'>{t('loginTitle')}</h1>
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label className="input-label" htmlFor="username">
            {t('usernamePlaceholder')}
          </label>
          <input
            id="username"
            className="username-input"
            type="text"
            value={username}
            onChange={e => {
              setUsername(e.target.value);
              setErrorMessage(''); // Clear error when typing
            }}
            required
            disabled={isLoading}
          />
        </div>
        <div className="input-group">
          <label className="input-label" htmlFor="password">
            {t('passwordPlaceholder')}
          </label>
          <input
            id="password"
            className="password-input"
            type="password"
            value={password}
            onChange={e => {
              setPassword(e.target.value);
              setErrorMessage(''); // Clear error when typing
            }}
            required
            disabled={isLoading}
          />
        </div>

        {/* Error message displayed below password field */}
        {errorMessage && (
          <div style={{
            color: '#ff4444',
            fontSize: '14px',
            marginTop: '10px',
            marginBottom: '10px',
            textAlign: 'center',
            padding: '8px',
            backgroundColor: 'rgba(255, 68, 68, 0.1)',
            borderRadius: '4px',
            border: '1px solid rgba(255, 68, 68, 0.3)'
          }}>
            {errorMessage}
          </div>
        )}

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : t('loginButton')}
        </button>
      </form>
      <p>
        {t('noAccount')} <Link to="/register">{t('registerLink')}</Link>
      </p>
    </div>
  );
}