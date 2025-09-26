import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../Header.css';
import {
  Avatar,
  AvatarImage,
  AvatarFallback
} from '@/components/ui/avatar';

interface HeaderProps {
  cart: any[];
}

export default function Header({ cart }: HeaderProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [profilePic, setProfilePic] = useState<string | null>(null);

  useEffect(() => {
    const username = localStorage.getItem('loggedInUser');
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (username && users[username]?.profilePic) {
      setProfilePic(users[username].profilePic);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    navigate('/login');
  };

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="site-header">
      <div className="header-top">
        <div className="logo">
          <Link to="/">{t('logo')}</Link>
        </div>

        <div className="language-switcher">
          <button onClick={() => handleLanguageChange('en')} className={i18n.language === 'en' ? 'active-lang' : ''}>EN</button>
          <button onClick={() => handleLanguageChange('ru')} className={i18n.language === 'ru' ? 'active-lang' : ''}>RU</button>
          <button onClick={() => handleLanguageChange('az')} className={i18n.language === 'az' ? 'active-lang' : ''}>AZ</button>
        </div>
      </div>

      <nav>
        <ul className="nav-list">
          <li><Link to="/">{t('home')}</Link></li>
          <li><Link to="/products">{t('products')}</Link></li>
          <li><Link to="/contact">{t('contact')}</Link></li>
          <li><Link to="/cart">{t('cart')} ({cart.length})</Link></li>

          <li className="account-wrapper flex items-center">
            <Link to="/account" className="header-account flex items-center gap-2 text-gray-800 hover:text-blue-600">
              <Avatar className="w-9 h-9 rounded-full border-[1.5px] border-gray-300 overflow-hidden">
                <AvatarImage
                  src={profilePic || 'https://i.pinimg.com/736x/c6/1f/7a/c61f7a74a565c857fa7384d2a2850796.jpg'} 
                  alt="User avatar"
                  className="w-full h-full object-cover"
                />
                <AvatarFallback className="flex items-center justify-center w-full h-full font-semibold text-gray-700 text-xs bg-gray-100">
                  <img src="https://i.pinimg.com/736x/c6/1f/7a/c61f7a74a565c857fa7384d2a2850796.jpg"/>
                </AvatarFallback>
              </Avatar>
            </Link>
          </li>

          <li>
            <button onClick={handleLogout} className="logout-button">
              {t('logout')}
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
}
