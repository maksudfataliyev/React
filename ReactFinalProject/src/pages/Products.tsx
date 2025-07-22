import { useState } from 'react';
import { Link } from 'react-router-dom';
import { phones, earbuds, watches, cases, headphones, cables } from '../data/products';
import type { Phone, Earbuds, Watch, Case, Headphone, Cable } from '../data/products';

type Product = Phone | Earbuds | Watch | Case | Headphone | Cable;

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDesigner, setSelectedDesigner] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedStorage, setSelectedStorage] = useState<string>('all');
  const [selectedRam, setSelectedRam] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedOS, setSelectedOS] = useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  const allProducts: Product[] = [
    ...phones,
    ...earbuds,
    ...watches,
    ...cases,
    ...headphones,
    ...cables,
  ];

  const filteredProducts = allProducts.filter((item) => {
    const matchDesigner = selectedDesigner === 'all' || item.designer === selectedDesigner;
    const matchCategory = selectedCategory === 'all' || (item as any).category === selectedCategory;
    const matchColor = selectedColor === 'all' || (item as any).color === selectedColor;
    const matchStorage = selectedStorage === 'all' || (item as any).storage?.toString() === selectedStorage;
    const matchRam = selectedRam === 'all' || (item as any).ram?.toString() === selectedRam;
    const matchYear = selectedYear === 'all' || (item as any).year?.toString() === selectedYear;
    const matchOS = selectedOS === 'all' || (item as any).operating_system === selectedOS;

    return matchCategory && matchDesigner && matchColor && matchStorage && matchRam && matchYear && matchOS;
  });

  const colors = Array.from(new Set(allProducts.map(item => (item as any).color).filter(Boolean)));
  const storages = Array.from(new Set(allProducts.map(item => (item as any).storage).filter(Boolean)));
  const rams = Array.from(new Set(allProducts.map(item => (item as any).ram).filter(Boolean)));
  const years = Array.from(new Set(allProducts.map(item => (item as any).year).filter(Boolean)));
  const operatingSystems = Array.from(new Set(allProducts.map(item => (item as any).operating_system).filter(Boolean)));

  return (
    <div className="products-page">
      <h1>All Products</h1>
      <div className="filter-bar">
        <button className="advanced-filters-toggle" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
          Advanced Filters
        </button>
        <section>
          <strong>Category:</strong>
          <div className="filter-buttons">
            <button onClick={() => setSelectedCategory('all')} className={selectedCategory === 'all' ? 'active-filter' : ''}>All</button>
            <button onClick={() => setSelectedCategory('phones')} className={selectedCategory === 'phones' ? 'active-filter' : ''}>Phones</button>
            <button onClick={() => setSelectedCategory('cases')} className={selectedCategory === 'cases' ? 'active-filter' : ''}>Cases</button>
            <button onClick={() => setSelectedCategory('headphones')} className={selectedCategory === 'headphones' ? 'active-filter' : ''}>Headphones</button>
            <button onClick={() => setSelectedCategory('earbuds')} className={selectedCategory === 'earbuds' ? 'active-filter' : ''}>Earbuds</button>
            <button onClick={() => setSelectedCategory('cables')} className={selectedCategory === 'cables' ? 'active-filter' : ''}>Cables</button>
            <button onClick={() => setSelectedCategory('watches')} className={selectedCategory === 'watches' ? 'active-filter' : ''}>Watches</button>
          </div>
        </section>
        <section>
          <strong>Designer:</strong>
          <div className="filter-buttons">
            <button onClick={() => setSelectedDesigner('all')} className={selectedDesigner === 'all' ? 'active-filter' : ''}>All</button>
            <button onClick={() => setSelectedDesigner('Apple')} className={selectedDesigner === 'Apple' ? 'active-filter' : ''}>Apple</button>
            <button onClick={() => setSelectedDesigner('Samsung')} className={selectedDesigner === 'Samsung' ? 'active-filter' : ''}>Samsung</button>
            <button onClick={() => setSelectedDesigner('Xiaomi')} className={selectedDesigner === 'Xiaomi' ? 'active-filter' : ''}>Xiaomi</button>
          </div>
        </section>
      </div>

      {showAdvancedFilters && (
        <div className="modal-overlay" onClick={() => setShowAdvancedFilters(false)}>
          <div className="advanced-filters-modal" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowAdvancedFilters(false)}>×</button>
            <h3>Advanced Filters</h3>
            <section className="filter-section">
              <strong>Color:</strong>
              <div className="filter-buttons">
                <button onClick={() => setSelectedColor('all')} className={selectedColor === 'all' ? 'active-filter' : ''}>All</button>
                {colors.map(color => (
                  <button key={color} onClick={() => setSelectedColor(color)} className={selectedColor === color ? 'active-filter' : ''}>
                    {color}
                  </button>
                ))}
              </div>
            </section>
            <section className="filter-section">
              <strong>Storage:</strong>
              <div className="filter-buttons">
                <button onClick={() => setSelectedStorage('all')} className={selectedStorage === 'all' ? 'active-filter' : ''}>All</button>
                {storages.map(storage => (
                  <button key={storage} onClick={() => setSelectedStorage(storage.toString())} className={selectedStorage === storage.toString() ? 'active-filter' : ''}>
                    {storage} GB
                  </button>
                ))}
              </div>
            </section>
            <section className="filter-section">
              <strong>RAM:</strong>
              <div className="filter-buttons">
                <button onClick={() => setSelectedRam('all')} className={selectedRam === 'all' ? 'active-filter' : ''}>All</button>
                {rams.map(ram => (
                  <button key={ram} onClick={() => setSelectedRam(ram.toString())} className={selectedRam === ram.toString() ? 'active-filter' : ''}>
                    {ram} GB
                  </button>
                ))}
              </div>
            </section>
            <section className="filter-section">
              <strong>Year:</strong>
              <div className="filter-buttons">
                <button onClick={() => setSelectedYear('all')} className={selectedYear === 'all' ? 'active-filter' : ''}>All</button>
                {years.map(year => (
                  <button key={year} onClick={() => setSelectedYear(year.toString())} className={selectedYear === year.toString() ? 'active-filter' : ''}>
                    {year}
                  </button>
                ))}
              </div>
            </section>
            <section className="filter-section">
              <strong>Operating System:</strong>
              <div className="filter-buttons">
                <button onClick={() => setSelectedOS('all')} className={selectedOS === 'all' ? 'active-filter' : ''}>All</button>
                {operatingSystems.map(os => (
                  <button key={os} onClick={() => setSelectedOS(os)} className={selectedOS === os ? 'active-filter' : ''}>
                    {os}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      <div className="product-grid">
        {filteredProducts.map((item) => (
          <div key={item.id} className="product-card">
            <img src={item.image} alt={item.title} className="thumbnail" />
            <h3>{item.title}</h3>
            <p>${item.price.toFixed(2)}</p>
            <p><strong>Designer:</strong> {item.designer}</p>
            <Link to={`/products/${item.id}`} className="details-button">
              View Details
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
