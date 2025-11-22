import { useState, useEffect } from 'react';
import { saveUser, isUsernameTaken, isEmailTaken } from './auth';
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
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
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

  // Check username availability
  const handleUsernameBlur = async () => {
    if (username.trim().length >= 3) {
      const taken = await isUsernameTaken(username.trim());
      if (taken) {
        setUsernameError('Username already taken');
      } else {
        setUsernameError('');
      }
    }
  };

  // Check email availability
  const handleEmailBlur = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email.trim())) {
      const taken = await isEmailTaken(email.trim());
      if (taken) {
        setEmailError('Email already registered');
      } else {
        setEmailError('');
      }
    }
  };

  const isValidUsername = username.trim().length >= 3;
  const isValidPassword = password.trim().length >= 6 && /\d/.test(password);
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidUsername) {
      setUsernameError(t('invalidUsername'));
      return;
    }

    if (usernameError) {
      return;
    }

    if (!isValidPassword) {
      alert(t('invalidPassword'));
      return;
    }

    if (!isValidEmail) {
      setEmailError(t('invalidEmail'));
      return;
    }

    if (emailError) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await saveUser(
        username.trim(),
        password,
        profilePicUrl.trim() || undefined,
        email.trim()
      );

      if (result.success) {
        navigate('/login');
      } else {
        // Check which field caused the error
        if (result.message.toLowerCase().includes('username')) {
          setUsernameError(result.message);
        } else if (result.message.toLowerCase().includes('email')) {
          setEmailError(result.message);
        } else {
          alert(result.message);
        }
      }
    } catch (error) {
      alert('Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
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
          onChange={e => {
            setUsername(e.target.value);
            setUsernameError('');
          }}
          onBlur={handleUsernameBlur}
          required
          disabled={isLoading}
          style={{ borderColor: usernameError ? 'red' : undefined }}
        />
        {usernameError && <p style={{ color: 'red', fontSize: '12px', margin: '4px 0' }}>{usernameError}</p>}
        
        <label htmlFor="register-email">{t('registerEmail')}</label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={e => {
            setEmail(e.target.value);
            setEmailError('');
          }}
          onBlur={handleEmailBlur}
          required
          disabled={isLoading}
          style={{ borderColor: emailError ? 'red' : undefined }}
        />
        {emailError && <p style={{ color: 'red', fontSize: '12px', margin: '4px 0' }}>{emailError}</p>}
        
        <label htmlFor="register-password">{t('registerPassword')}</label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
        
        <label htmlFor="register-profile-pic">{t('registerProfilePic')}</label>
        <input
          id="register-profile-pic"
          type="url"
          placeholder="https://example.com/image.jpg"
          value={profilePicUrl}
          onChange={e => setProfilePicUrl(e.target.value)}
          disabled={isLoading}
        />
        {profilePicUrl && (
          <div style={{ margin: '10px 0' }}>
            <img 
              src={profilePicUrl} 
              alt="Profile preview" 
              style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                objectFit: 'cover',
                border: '2px solid #ccc'
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=Invalid';
              }}
            />
          </div>
        )}
        
        <button type="submit" disabled={isLoading || !!usernameError || !!emailError}>
          {isLoading ? 'Registering...' : t('registerButton')}
        </button>
      </form>
      <p>
        {t('haveAccount')} <Link to="/login">{t('loginHere')}</Link>
      </p>
    </div>
  );
}