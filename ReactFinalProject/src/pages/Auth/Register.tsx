import { useState } from 'react';
import { saveUser } from './auth';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

export default function Register() {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      saveUser(username, password);
      alert(t('registerSuccess'));
      navigate('/login');
    } else {
      alert(t('registerError'));
    }
  };

  return (
    <div className="auth-page">
      <LanguageSwitcher />
      <h1>{t('registerTitle')}</h1>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder={t('registerUsername')}
          required
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder={t('registerPassword')}
          required
        />
        <button type="submit">{t('registerButton')}</button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        {t('haveAccount')} <Link to="/login">{t('loginHere')}</Link>
      </p>
    </div>
  );
}
