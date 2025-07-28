
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { phones, earbuds, watches, cases, headphones, cables } from '../data/products';
import type { Phone, Earbuds, Watch, Case, Headphone, Cable } from '../data/products';

type Product = Phone | Earbuds | Watch | Case | Headphone | Cable;

export default function Products() {
  const { t } = useTranslation();

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
      <h1>{t('allProducts')}</h1>
      <div className="filter-bar">
        <button className="advanced-filters-toggle" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
          {t('advancedFilters')}
        </button>

        <section>
          <strong>{t('category')}:</strong>
          <div className="filter-buttons">
            <button onClick={() => setSelectedCategory('all')} className={selectedCategory === 'all' ? 'active-filter' : ''}>{t('all')}</button>
            <button onClick={() => setSelectedCategory('phones')} className={selectedCategory === 'phones' ? 'active-filter' : ''}>{t('phones')}</button>
            <button onClick={() => setSelectedCategory('cases')} className={selectedCategory === 'cases' ? 'active-filter' : ''}>{t('cases')}</button>
            <button onClick={() => setSelectedCategory('headphones')} className={selectedCategory === 'headphones' ? 'active-filter' : ''}>{t('headphones')}</button>
            <button onClick={() => setSelectedCategory('earbuds')} className={selectedCategory === 'earbuds' ? 'active-filter' : ''}>{t('earbuds')}</button>
            <button onClick={() => setSelectedCategory('cables')} className={selectedCategory === 'cables' ? 'active-filter' : ''}>{t('cables')}</button>
            <button onClick={() => setSelectedCategory('watches')} className={selectedCategory === 'watches' ? 'active-filter' : ''}>{t('watches')}</button>
          </div>
        </section>

        <section>
          <strong>{t('designer')}:</strong>
          <div className="filter-buttons">
            <button onClick={() => setSelectedDesigner('all')} className={selectedDesigner === 'all' ? 'active-filter' : ''}>{t('all')}</button>
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
            <h3>{t('advancedFilters')}</h3>

            <section className="filter-section">
              <strong>{t('color')}:</strong>
              <div className="filter-buttons">
                <button onClick={() => setSelectedColor('all')} className={selectedColor === 'all' ? 'active-filter' : ''}>{t('all')}</button>
                {colors.map(color => (
                  <button key={color} onClick={() => setSelectedColor(color)} className={selectedColor === color ? 'active-filter' : ''}>
                    {t(`colors.${color}`)}
                  </button>
                ))}
              </div>
            </section>

            <section className="filter-section">
              <strong>{t('storage')}:</strong>
              <div className="filter-buttons">
                <button onClick={() => setSelectedStorage('all')} className={selectedStorage === 'all' ? 'active-filter' : ''}>{t('all')}</button>
                {storages.map(storage => (
                  <button key={storage} onClick={() => setSelectedStorage(storage.toString())} className={selectedStorage === storage.toString() ? 'active-filter' : ''}>
                    {storage} GB
                  </button>
                ))}
              </div>
            </section>

            <section className="filter-section">
              <strong>{t('ram')}:</strong>
              <div className="filter-buttons">
                <button onClick={() => setSelectedRam('all')} className={selectedRam === 'all' ? 'active-filter' : ''}>{t('all')}</button>
                {rams.map(ram => (
                  <button key={ram} onClick={() => setSelectedRam(ram.toString())} className={selectedRam === ram.toString() ? 'active-filter' : ''}>
                    {ram} GB
                  </button>
                ))}
              </div>
            </section>

            <section className="filter-section">
              <strong>{t('year')}:</strong>
              <div className="filter-buttons">
                <button onClick={() => setSelectedYear('all')} className={selectedYear === 'all' ? 'active-filter' : ''}>{t('all')}</button>
                {years.map(year => (
                  <button key={year} onClick={() => setSelectedYear(year.toString())} className={selectedYear === year.toString() ? 'active-filter' : ''}>
                    {year}
                  </button>
                ))}
              </div>
            </section>

            <section className="filter-section">
              <strong>{t('os')}:</strong>
              <div className="filter-buttons">
                <button onClick={() => setSelectedOS('all')} className={selectedOS === 'all' ? 'active-filter' : ''}>{t('all')}</button>
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
            <img src={item.image}  alt={t(`productss.${item.id}`)} className="thumbnail" />
            <h3>{t(`productss.${item.id}`)}</h3>
            <p>${item.price.toFixed(2)}</p>
            <p><strong>{t('designer')}:</strong> {item.designer}</p>
            <Link to={`/products/${item.id}`} className="details-button">
              {t('viewDetails')}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}