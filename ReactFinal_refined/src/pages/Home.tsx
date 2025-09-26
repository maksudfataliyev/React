import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import '../Home.css';
import type { Phone, Earbuds, Watch, Case, Headphone, Cable } from '../data/products';
import { phones, earbuds, watches, cases, headphones, cables } from '../data/products';

type Product = Phone | Earbuds | Watch | Case | Headphone | Cable;

export default function Home() {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<Product[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const { t } = useTranslation();

  const allProducts: Product[] = [
    ...phones,
    ...earbuds,
    ...watches,
    ...cases,
    ...headphones,
    ...cables
  ];

  const trending = allProducts.find(p => p.id === '1');
  const newlyReleased = allProducts.find(p => p.id === '9');

  const handleSearch = () => {
    const filtered = allProducts.filter(p =>
      p.title.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailRegex.test(emailInput.trim())) {
      alert(t('invalidEmail'));
      return;
    }

    alert(t('newsletterSuccess'));
    setEmailInput('');
  };

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1><Trans i18nKey="welcome"><span>iCases.az</span></Trans></h1>
        <p>{t('subtitle')}</p>
        <div className="search-bar">
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={handleSearch}>{t('search')}</button>
        </div>
        <Link to="/products" className="cta-button">{t('browse')}</Link>
      </div>

      {results.length > 0 && (
        <div className="search-results">
          <div className="featured-section">
            {results.map(product => {
              const finalPrice = product.discount != null
                ? product.price - (product.price * product.discount) / 100
                : product.price;

              return (
                <div key={product.id} className="product-card">
                  <img src={product.image} alt={product.title} />
                  <h3>{product.title}</h3>
                  <p className="price">
                    {product.discount ? (
                      <>
                        <span style={{ textDecoration: 'line-through', color: '#777' }}>
                          ${product.price.toFixed(2)}
                        </span>{' '}
                        <span style={{ color: 'red', fontWeight: 'bold' }}>
                          ${finalPrice.toFixed(2)}
                        </span>{' '}
                        <span style={{ color: 'green', fontSize: '0.9rem' }}>
                          ({product.discount}% {t('off')})
                        </span>
                      </>
                    ) : (
                      `$${product.price.toFixed(2)}`
                    )}
                  </p>
                  <Link to={`/products/${product.id}`} className="view-button">
                    {t('viewProduct')}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="featured-section">
        <h2>{t('trending')}</h2>
        {trending && (
          <div className="product-card">
            <img src={trending.image} alt={trending.title} className="home-trend" />
            <h3>{t('productss.1')}</h3>
            <p className="price">${trending.price.toFixed(2)}</p>
            <Link to={`/products/${trending.id}`} className="view-button">{t('viewProduct')}</Link>
          </div>
        )}
        {newlyReleased && (
          <div className="product-card">
            <img src={newlyReleased.image} alt={newlyReleased.title} className="home-new" />
            <h3>{t('productss.1')}</h3>
            <p className="price">${newlyReleased.price.toFixed(2)}</p>
            <Link to={`/products/${newlyReleased.id}`} className="view-button">{t('viewProduct')}</Link>
          </div>
        )}
      </div>

      <div className="newsletter-section">
        <h2>{t('subscribe')}</h2>
        <form onSubmit={handleNewsletterSubmit}>
          <input
            type="text" 
            className="newsletter-input"
            placeholder={t('emailPlaceholder')}
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            required
/>
          <button type="submit" className="subscribe-button">{t('subscribeButton')}</button>
        </form>
      </div>

      <div className="social-media-section">
        <h2>{t('followUs')}</h2>
        <div className="social-media-links">
          <a href="https://tap.az/shops/icases_az" target="_blank" rel="noopener noreferrer" className="tapaz">Tap.az</a>
          <a href="https://www.instagram.com/icases_az/" target="_blank" rel="noopener noreferrer" className="instagram">Instagram</a>
          <a href="https://www.google.com/maps/place/Icases.az/@40.3803957,49.8537579,17z/data=!3m1!4b1!4m6!3m5!1s0x40307d5dd07a4f61:0x8a40fe513cfde120!8m2!3d40.3803957!4d49.8563328!16s%2Fg%2F11wqxw7q9w?entry=ttu" target="_blank" rel="noopener noreferrer" className="google_maps">Google Maps</a>
        </div>
      </div>
    </div>
  );
}
