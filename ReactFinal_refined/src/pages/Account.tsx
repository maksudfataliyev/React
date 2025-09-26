import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { applyTheme } from '../components/theme';
import '../Account.css';

const Account: React.FC = () => {
  const { t } = useTranslation();
  const username = localStorage.getItem('loggedInUser') || 'Guest';
  const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
  const email = storedUsers[username]?.email || t('account.noEmail');

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

  return (
    <div className="account-page">
      <h2 className="account-title">{t('account.title')}</h2>
      <p className="account-greeting">
        {t('account.welcome')}, <strong className="account-username">{username}</strong>!
      </p>

      <div className="account-details">
        <div className="account-item">
          <span className="item-label">{t('account.email')}:</span>
          <span className="item-value">{email}</span>
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
