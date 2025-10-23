import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { phones, earbuds, watches, cases, headphones, cables } from '../data/products';
import type { Phone, Earbuds, Watch, Case, Headphone, Cable } from '../data/products';
import '../Home.css';
import { useTranslation } from 'react-i18next';

type Product = Phone | Earbuds | Watch | Case | Headphone | Cable;

const Home = () => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<Product[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const { t } = useTranslation();
  const navigate = useNavigate();

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

  const handleCategoryClick = (category: string) => {
    const filters = {
      selectedCategory: [category.toLowerCase()],
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

    navigate(`/products?category=${category.toLowerCase()}`);
  };

  type Category = { name: string; count: number };
  const categories: Category[] = [
    { name: 'Phones', count: phones.length },
    { name: 'Earbuds', count: earbuds.length },
    { name: 'Watches', count: watches.length },
    { name: 'Cases', count: cases.length },
    { name: 'Headphones', count: headphones.length },
    { name: 'Cables', count: cables.length },
  ];

  const features = [
    { 
      title: 'Quality Guaranteed', 
      description: 'All products are authentic and come with warranty' 
    },
    { 
      title: 'Fast Delivery', 
      description: 'Free shipping on orders over $50' 
    },
    { 
      title: 'Secure Payment', 
      description: 'Multiple payment options available' 
    },
    { 
      title: 'Best Prices', 
      description: 'Competitive pricing and regular discounts' 
    },
  ];

  const allProducts = [...phones, ...earbuds, ...watches, ...cases, ...headphones, ...cables];
  const featuredProducts = allProducts.slice(0, 3);

  const stats = [
    { value: '10K+', label: 'Happy Customers' },
    { value: '500+', label: 'Products' },
    { value: '50+', label: 'Brands' },
    { value: '4.8★', label: 'Average Rating' },
  ];

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">✨ Premium Tech Accessories</span>
          
          <h1>Welcome to <span>iCases.az</span></h1>
          
          <p className="hero-subtitle">
            Discover premium phone accessories, cases, and tech essentials at unbeatable prices
          </p>

          <div className="search-bar">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={handleSearch}>{t('search')}</button>
          </div>

          <Link to="/products" className="cta-button">
            Browse All Products
          </Link>
        </div>
      </section>

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

      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-item">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="categories-section">
        <div className="section-header">
          <h2>Shop by Category</h2>
          <p>Explore our wide range of products</p>
        </div>

        <div className="categories-grid">
          {categories.map((category) => (
            <div
              key={category.name}
              className="category-card"
              onClick={() => handleCategoryClick(category.name)}
              style={{ cursor: 'pointer' }}
            >
              <div className="category-icon">{getCategoryIcon(category.name)}</div>
              <h3>{category.name}</h3>
              <p>{category.count}+ items</p>  
            </div>
          ))}
        </div>
      </section>

      <section className="featured-section">
        <div className="section-header-row">
          <div>
            <h2>Featured Products</h2>
            <p>Handpicked deals just for you</p>
          </div>
          <Link to="/products" className="view-all-button">View All</Link>
        </div>

        <div className="products-grid">
          {featuredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image-wrapper">
                {product.discount && (
                  <span className="product-badge badge-sale">
                    -{product.discount}% OFF
                  </span>
                )}
                <img src={product.image} alt={product.title} />
              </div>
              
              <div className="product-info">
                <h3>{product.title}</h3>
                <div className="product-price">
                  <span className="current-price">${product.price.toFixed(2)}</span>
                  {product.discount && (
                    <>
                      <span className="original-price">
                        ${(product.price / (1 - product.discount / 100)).toFixed(2)}
                      </span>
                      <span className="discount-badge">-{product.discount}%</span>
                    </>
                  )}
                </div>
                <Link to={`/products/${product.id}`} className="view-button">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="features-section">
        <div className="section-header">
          <h2>Why Choose Us</h2>
          <p>Your satisfaction is our priority</p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{getFeatureIcon(index)}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="newsletter-section">
        <div className="newsletter-content">
          <h2>Stay Updated with Latest Offers</h2>
          <p>Subscribe to our newsletter and never miss exclusive deals and new arrivals</p>
          
          <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
            <input
              type="email"
              placeholder="Enter your email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
            />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </section>

      <section className="social-section">
        <h3>Follow Us</h3>
        <div className="social-links">
          <a href="https://ru.tap.az/shops/almastorebaku" target="_blank" rel="noopener noreferrer">
            Tap.az
          </a>
          <a href="https://www.instagram.com/almastorebakuaz/" target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
          <a href="https://www.google.com/maps/place/Icases.az/@40.3803957,49.8537579,17z" target="_blank" rel="noopener noreferrer">
            Google Maps
          </a>
        </div>
      </section>
    </div>
  );
};

const getCategoryIcon = (name: string) => {
  const icons: { [key: string]: string } = {
    'Phones': '📱',
    'Earbuds': '🎧',
    'Watches': '⌚',
    'Cases': '🛡️',
    'Headphones': '🎧',
    'Cables': '🔌',
  };
  return icons[name] || '📦';
};

const getFeatureIcon = (index: number) => {
  const icons = ['🛡️', '🚚', '💳', '🏆'];
  return icons[index] || '✨';
};

export default Home;