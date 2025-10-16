import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import '../Footer.css';
export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p className='copyright'>&copy; 2025 iCases.az.</p>
        <nav>
          <Link to="/contact" className='contact-link'>{t('contact')}</Link>
          <Link to="/products" className='product-link'>{t('products')}</Link>
          <Link to="/" className='home-link'>{t('home')}</Link>
        </nav>
      </div>
    </footer>
  );
}
