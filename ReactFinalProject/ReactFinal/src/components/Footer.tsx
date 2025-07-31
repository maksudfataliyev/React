import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p>&copy; 2025 iCases.az.</p>
        <nav>
          <Link to="/contact">{t('contact')}</Link>
          <Link to="/products">{t('products')}</Link>
          <Link to="/">{t('home')}</Link>
        </nav>
      </div>
    </footer>
  );
}
