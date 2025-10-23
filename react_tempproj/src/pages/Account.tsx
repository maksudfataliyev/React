import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { applyTheme } from '../components/theme';
import '../Account.css';

const Account: React.FC = () => {
  const { t } = useTranslation();
  const username = localStorage.getItem('loggedInUser') || 'Guest';
  const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
  
  const [email, setEmail] = useState(storedUsers[username]?.email || t('account.noEmail'));
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const handleEditEmail = () => {
    setNewEmail(email);
    setIsEditingEmail(true);
  };

  const handleSaveEmail = () => {
    if (newEmail.trim() === '') {
      alert(t('account.emailRequired'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      alert(t('account.invalidEmail'));
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[username]) {
      users[username].email = newEmail;
      localStorage.setItem('users', JSON.stringify(users));
      setEmail(newEmail);
      setIsEditingEmail(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingEmail(false);
    setNewEmail('');
  };

  return (
    <div className="account-page">
      <h2 className="account-title">{t('account.title')}</h2>
      <p className="account-greeting">
        {t('account.welcome')}, <strong className="account-username">{username}</strong>!
      </p>

      <div className="account-details">
        <div className="account-item">
          <span className="item-label">{t('account.email')}:</span>
          {!isEditingEmail ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="item-value">{email}</span>
              <button onClick={handleEditEmail} className="edit-email-btn">
                {t('account.edit')}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="email-input"
              />
              <button onClick={handleSaveEmail} className="email-save-btn">
                {t('account.save')}
              </button>
              <button onClick={handleCancelEdit} className="email-cancel-btn">
                {t('account.cancel')}
              </button>
            </div>
          )}
        </div>
        <div className="account-item">
          <span className="item-label">{t('account.language')}:</span>
          <span className="item-value">AZ / RU / EN</span>
        </div>
        <div className="account-item">
          <span className="item-label">{t('account.theme')}:</span>
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            style={{
              background: 'none',
              color: 'inherit',
              border: 'none',
              boxShadow: 'none',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: 'pointer',
              padding: 0
            }}
            onMouseOver={e => (e.currentTarget.style.background = 'none')}
            onMouseOut={e => (e.currentTarget.style.background = 'none')}
          >
            {theme === 'light' ? '🌞 Light' : '🌙 Dark'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Account;