import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  cart: any[];
}

export default function Header({ cart }: HeaderProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

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
