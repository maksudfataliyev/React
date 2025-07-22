import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Phone, Earbuds, Watch, Case, Headphone, Cable } from '../data/products';
import './Home.css';
import { phones, earbuds, watches, cases, headphones, cables } from '../data/products';

type Product = Phone | Earbuds | Watch | Case | Headphone | Cable;

export default function Home() {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<Product[]>([]);


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

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Welcome to <span>iCases.az</span></h1>
        <p>Discover the latest in tech and gadgets</p>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        <Link to="/products" className="cta-button">Browse Products</Link>
      </div>
      {results.length > 0 && (
        <div className="search-results">
          <h2>Search Results:</h2>
          <div className="featured-section">
            {results.map(product => (
              <div key={product.id} className="product-card">
                <img src={product.image} alt={product.title} />
                <h3>{product.title}</h3>
                <p className="price">${product.price.toFixed(2)}</p>
                <Link to={`/products/${product.id}`} className="view-button">
                  View Product
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="featured-section">
        <h2>Trending Products</h2>
        {trending && (
          <div className="product-card">
            <img src={trending.image} alt={trending.title} className='home-trend'/>
            <h3>{trending.title}</h3>
            <p className="price">${trending.price.toFixed(2)}</p>
            <Link to={`/products/${trending.id}`} className="view-button">View Product</Link>
          </div>
        )}
        {newlyReleased && (
          <div className="product-card">
            <img src={newlyReleased.image} alt={newlyReleased.title} className='home-new'/>
            <h3>{newlyReleased.title}</h3>
            <p className="price">${newlyReleased.price.toFixed(2)}</p>
            <Link to={`/products/${newlyReleased.id}`} className="view-button">View Product</Link>
          </div>
        )}
      </div>
      <div className="newsletter-section">
        <h2>Subscribe to Our Newsletter</h2>
        <form>
          <input type="email" placeholder="Enter your email" />
          <button type="submit" className='subscribe-button'>Subscribe</button>
        </form>
      </div>
      <div className="social-media-section">
        <h2>Follow Us & Find Us</h2>
        <div className="social-media-links">
          <a href="https://tap.az/shops/icases_az" target="_blank" className='tapaz'>Tap.az</a>
          <a href="https://www.instagram.com/icases_az/" target="_blank" className='instagram'>Instagram</a>
          <a href="https://www.google.com/maps/place/Icases.az" target="_blank" className='google_maps'>Google Maps</a>
        </div>
      </div>
    </div>
  );
}
