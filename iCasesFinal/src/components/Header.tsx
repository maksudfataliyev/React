import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutGroup, motion } from "motion/react";
import '../Header.css';
import {
  Avatar,
  AvatarImage,
  AvatarFallback
} from '@/components/ui/avatar';
import { TextRotate } from '@/components/ui/text-rotate';

interface HeaderProps {
  cart: any[];
}

export default function Header({ cart }: HeaderProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [profilePic, setProfilePic] = useState<string | null>(null);

  const categories = ['phones', 'cases', 'headphones', 'earbuds', 'cables', 'watches'];

  useEffect(() => {
    const loadProfilePic = () => {
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) return;
      
      try {
        const currentUser = JSON.parse(currentUserStr);
        if (currentUser?.profilePic) {
          setProfilePic(currentUser.profilePic);
        }
      } catch (error) {
        console.error('Error parsing currentUser:', error);
      }
    };

    loadProfilePic();

    const handleProfileUpdate = () => {
      loadProfilePic();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    window.addEventListener('storage', loadProfilePic);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('storage', loadProfilePic);
    };
  }, []);

  const handleCategoryClick = (category: string) => {
    const filters = {
      selectedCategory: [category],
      selectedColor: ['all'],
      selectedDesigner: ['all'],
      selectedDiscount: ['all'],
      selectedOS: ['all'],
      selectedRam: ['all'],
      selectedStorage: ['all'],
      selectedYear: ['all'],
    };

    Object.entries(filters).forEach(([key, value]) => {
      sessionStorage.setItem(key, JSON.stringify(value));
    });
  };

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
          <Link to="/">
            <LayoutGroup>
              <motion.span className="flex whitespace-pre" layout>
                <motion.span
                  layout
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                >
                  {t('make_it')}{" "}
                </motion.span>
                <TextRotate
                  texts={[t('right'), t('fun'), t('cool'), "iCases"]}
                  mainClassName="highlight-box"
                  staggerFrom="last"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-1.5"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={2000}
                />
              </motion.span>
            </LayoutGroup>
          </Link>
        </div>

        <div className="language-switcher">
          <button
            onClick={() => handleLanguageChange('en')}
            className={i18n.language === 'en' ? 'active-lang' : ''}
          >
            EN
          </button>
          <button
            onClick={() => handleLanguageChange('ru')}
            className={i18n.language === 'ru' ? 'active-lang' : ''}
          >
            RU
          </button>
          <button
            onClick={() => handleLanguageChange('az')}
            className={i18n.language === 'az' ? 'active-lang' : ''}
          >
            AZ
          </button>
        </div>
      </div>

      <nav>
        <ul className="nav-list">
          <li>
            <Link to="/">{t('home')}</Link>
          </li>
          <li className="products-dropdown">
            <div className="dropdown-trigger">
              <Link to="/products">{t('products')}</Link>
              <div className="dropdown-content">
                {categories.map((category) => (
                  <Link
                    key={category}
                    to={`/products?category=${category}`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    {t(category)}
                  </Link>
                ))}
              </div>
            </div>
          </li>
          <li>
            <Link to="/order-history">
            {t('orderHistory')}
            </Link>
          </li>
          <li>
            <Link to="/cart">
              {t('cart')} ({cart.length})
            </Link>
          </li>

          <li className="account-wrapper flex items-center">
            <Link
              to="/account"
              className="header-account flex items-center gap-2 text-gray-800 hover:text-blue-600"
            >
              <Avatar className="w-9 h-9 rounded-full border-[1.5px] border-gray-300 overflow-hidden">
                <AvatarImage
                  src={
                    profilePic ||
                    'https://i.pinimg.com/736x/c6/1f/7a/c61f7a74a565c857fa7384d2a2850796.jpg'
                  }
                  alt="User avatar"
                  className="w-full h-full object-cover"
                />
                <AvatarFallback className="flex items-center justify-center w-full h-full font-semibold text-gray-700 text-xs bg-gray-100">
                  <img src="https://i.pinimg.com/736x/c6/1f/7a/c61f7a74a565c857fa7384d2a2850796.jpg" />
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
