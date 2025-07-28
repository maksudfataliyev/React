import { useState } from 'react';
import { validateUser } from './auth';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

export default function Login() {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateUser(username, password)) {
      localStorage.setItem('loggedInUser', username);
      navigate('/products');
    } else {
      alert(t('invalidCredentials'));
    }
  };

  return (
    <div className="auth-page">
      <LanguageSwitcher />
      <h1>{t('loginTitle')}</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder={t('usernamePlaceholder')}
          required
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder={t('passwordPlaceholder')}
          required
        />
        <button type="submit">{t('loginButton')}</button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        {t('noAccount')} <Link to="/register">{t('registerLink')}</Link>
      </p>
    </div>
  );
}
