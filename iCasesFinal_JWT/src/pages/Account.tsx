import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { applyTheme } from '../components/theme';
import { getCurrentUser, updateUserEmail } from './Auth/auth';
import '../Account.css';

const Account: React.FC = () => {
  const { t } = useTranslation();
  const currentUser = getCurrentUser();
  const username = currentUser?.username || 'Guest';
  
  const [email, setEmail] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [emailError, setEmailError] = useState('');

  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Fetch user data from backend on component mount
  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email || t('account.noEmail'));
      setProfilePic(currentUser.profilePic || '');
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [currentUser, t]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const handleEditEmail = () => {
    setNewEmail(email);
    setIsEditingEmail(true);
    setEmailError('');
  };

  const handleSaveEmail = async () => {
    if (newEmail.trim() === '') {
      setEmailError(t('account.emailRequired'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailError(t('account.invalidEmail'));
      return;
    }

    // Update email in backend
    setIsLoading(true);
    const result = await updateUserEmail(username, newEmail);
    setIsLoading(false);

    if (result.success) {
      setEmail(newEmail);
      setIsEditingEmail(false);
      setEmailError('');
    } else {
      setEmailError(result.message);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingEmail(false);
    setNewEmail('');
    setEmailError('');
  };

  if (isLoading) {
    return (
      <div className="account-page">
        <p>Loading...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="account-page">
        <h2 className="account-title">{t('account.title')}</h2>
        <p>Please log in to view your account.</p>
      </div>
    );
  }

  return (
    <div className="account-page">
      <h2 className="account-title">{t('account.title')}</h2>
      
      {/* Profile Picture */}
      {profilePic && (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <img 
            src={profilePic} 
            alt="Profile" 
            style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              objectFit: 'cover',
              border: '3px solid var(--primary-color, #007bff)'
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                    setEmailError('');
                  }}
                  className="email-input"
                />
                <button onClick={handleSaveEmail} className="email-save-btn">
                  {t('account.save')}
                </button>
                <button onClick={handleCancelEdit} className="email-cancel-btn">
                  {t('account.cancel')}
                </button>
              </div>
              {emailError && (
                <span style={{ 
                  color: '#ff4444', 
                  fontSize: '12px',
                  marginLeft: '0.5rem'
                }}>
                  {emailError}
                </span>
              )}
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