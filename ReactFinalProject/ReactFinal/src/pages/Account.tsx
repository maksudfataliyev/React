import React from 'react';
import { useTranslation } from 'react-i18next';

const Account: React.FC = () => {
  const { t } = useTranslation();

  const username = localStorage.getItem('loggedInUser') || 'Guest';
  const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
  const email = storedUsers[username]?.email || t('account.noEmail');

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
          <span className="item-value">🌞 Light</span>
        </div>
      </div>
    </div>
  );
};

export default Account;
