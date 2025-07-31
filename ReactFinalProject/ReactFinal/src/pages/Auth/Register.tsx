import { useState } from 'react';
import { saveUser } from './auth';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

export default function Register() {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const navigate = useNavigate();

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
          type="text"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={t('registerEmail')}
          required
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder={t('registerPassword')}
          required
        />
        <input
          value={profilePicUrl}
          onChange={e => setProfilePicUrl(e.target.value)}
          placeholder={t('registerProfilePic')}
        />
        <button type="submit">{t('registerButton')}</button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        {t('haveAccount')} <Link to="/login">{t('loginHere')}</Link>
      </p>
    </div>
  );
}
