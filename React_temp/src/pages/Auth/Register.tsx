import { useState, useEffect } from 'react';
import { saveUser } from './auth';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { applyTheme } from '../../components/theme';
import './Register.css';

export default function Register() {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );
  const navigate = useNavigate();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const isValidUsername = username.trim().length >= 3;
  const isValidPassword = password.trim().length >= 6 && /\d/.test(password);
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const usernameTaken = users[username.trim()];
    const emailTaken = Object.values(users).some(
      (user: any) => user.email === email.trim()
    );

    if (!isValidUsername) {
      alert(t('invalidUsername'));
      return;
    }

    if (!isValidPassword) {
      alert(t('invalidPassword'));
      return;
    }

    if (!isValidEmail) {
      alert(t('invalidEmail'));
      return;
    }

    if (usernameTaken) {
      alert(t('usernameTaken'));
      return;
    }

    if (emailTaken) {
      alert(t('emailTaken'));
      return;
    }

    saveUser(username.trim(), password, profilePicUrl, email.trim());
    alert(t('registerSuccess'));
    navigate('/login');
  };

  return (
    <div className="auth-page">
      <div className="register-header">
        <h1 className="register_text">{t('registerTitle')}</h1>
        <div className="header-controls">
          <LanguageSwitcher />
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === 'light' ? '🌞 Light' : '🌙 Dark'}
          </button>
        </div>
      </div>
      <form onSubmit={handleRegister}>
        <label htmlFor="register-username">{t('registerUsername')}</label>
        <input
          id="register-username"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <label htmlFor="register-email">{t('registerEmail')}</label>
        <input
          id="register-email"
          type="text"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <label htmlFor="register-password">{t('registerPassword')}</label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <label htmlFor="register-profile-pic">{t('registerProfilePic')}</label>
        <input
          id="register-profile-pic"
          value={profilePicUrl}
          onChange={e => setProfilePicUrl(e.target.value)}
        />
        <button type="submit">{t('registerButton')}</button>
      </form>
      <p>
        {t('haveAccount')} <Link to="/login">{t('loginHere')}</Link>
      </p>
    </div>
  );
}
