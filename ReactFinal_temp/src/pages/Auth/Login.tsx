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

  const [theme, setTheme] = useState<'light' | 'dark'>(
      (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
    );
  
    useEffect(() => {
      applyTheme(theme);
    }, [theme]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateUser(username, password)) {
      localStorage.setItem('loggedInUser', username);
      window.location.href = '/';
    } else {
      alert(t('invalidCredentials'));
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
            onChange={e => setUsername(e.target.value)}
            required
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
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">{t('loginButton')}</button>
      </form>

      <p>
        {t('noAccount')} <Link to="/register">{t('registerLink')}</Link>
      </p>
    </div>
  );
}