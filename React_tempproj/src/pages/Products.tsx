import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import '../Product.css'

import {
  phones,
  earbuds,
  watches,
  cases,
  headphones,
  cables,
} from '../data/products'
import type {
  Phone,
  Earbuds,
  Watch,
  Case,
  Headphone,
  Cable,
} from '../data/products'

type Product = Phone | Earbuds | Watch | Case | Headphone | Cable

const getDiscountedPrice = (price: number, discount: number | null): number =>
  discount ? price - (price * discount) / 100 : price

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    className="search-icon"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </svg>
)

export default function Products() {
  const { t } = useTranslation()


  const getStored = <T,>(key: string, defaultValue: T): T => {
    const stored = sessionStorage.getItem(key)
    try {
      return stored ? (JSON.parse(stored) as T) : defaultValue
    } catch {
      return defaultValue
    }
  }

  const [queryInput, setQueryInput] = useState<string>(
    getStored('queryInput', '')
  )
  const [query, setQuery] = useState<string>(getStored('query', ''))
  const [selectedColor, setSelectedColor] = useState<string[]>(
    getStored('selectedColor', ['all'])
  )
  const [selectedStorage, setSelectedStorage] = useState<string[]>(
    getStored('selectedStorage', ['all'])
  )
  const [selectedRam, setSelectedRam] = useState<string[]>(
    getStored('selectedRam', ['all'])
  )
  const [selectedYear, setSelectedYear] = useState<string[]>(
    getStored('selectedYear', ['all'])
  )
  const [selectedOS, setSelectedOS] = useState<string[]>(
    getStored('selectedOS', ['all'])
  )
  const [selectedDiscount, setSelectedDiscount] = useState<string[]>(
    getStored('selectedDiscount', ['all'])
  )
  const [selectedCategory, setSelectedCategory] = useState<string[]>(
    getStored('selectedCategory', ['all'])
  )
  const [selectedDesigner, setSelectedDesigner] = useState<string[]>(
    getStored('selectedDesigner', ['all'])
  )
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    sessionStorage.setItem('queryInput', JSON.stringify(queryInput))
    sessionStorage.setItem('query', JSON.stringify(query))
    sessionStorage.setItem('selectedColor', JSON.stringify(selectedColor))
    sessionStorage.setItem('selectedStorage', JSON.stringify(selectedStorage))
    sessionStorage.setItem('selectedRam', JSON.stringify(selectedRam))
    sessionStorage.setItem('selectedYear', JSON.stringify(selectedYear))
    sessionStorage.setItem('selectedOS', JSON.stringify(selectedOS))
    sessionStorage.setItem('selectedDiscount', JSON.stringify(selectedDiscount))
    sessionStorage.setItem('selectedCategory', JSON.stringify(selectedCategory))
    sessionStorage.setItem(
      'selectedDesigner',
      JSON.stringify(selectedDesigner)
    )
  }, [
    queryInput,
    query,
    selectedColor,
    selectedStorage,
    selectedRam,
    selectedYear,
    selectedOS,
    selectedDiscount,
    selectedCategory,
    selectedDesigner,
  ])

  useEffect(() => {
    if (queryInput === '') {
      setQuery('')
    }
  }, [queryInput])

  const isMatch = (
    selected: string[],
    value: string | number | undefined,
    skipIfMissing = true
  ) => {
    if (skipIfMissing && value === undefined) return true
    if (value === undefined || value === null) return false
    const val = value.toString()
    return selected.includes('all') || selected.includes(val)
  }

  const allProducts: Product[] = [
    ...phones,
    ...earbuds,
    ...watches,
    ...cases,
    ...headphones,
    ...cables,
  ]


  const filteredProducts = allProducts.filter((item) => {
    const matchQuery =
      query === '' ||
      item.title.toLowerCase().includes(query.toLowerCase())
    const matchColor = isMatch(selectedColor, (item as any).color)
    const matchStorage = isMatch(selectedStorage, (item as any).storage)
    const matchRam = isMatch(selectedRam, (item as any).ram)
    const matchYear = isMatch(selectedYear, (item as any).year)
    const matchOS = isMatch(selectedOS, (item as any).operating_system)
    const itemDiscount = item.discount ? item.discount.toString() : 'none'
    const matchDiscount = isMatch(selectedDiscount, itemDiscount)
    const matchCategory = isMatch(selectedCategory, (item as any).category)
    const matchDesigner = isMatch(selectedDesigner, item.designer)

    return (
      matchQuery &&
      matchColor &&
      matchStorage &&
      matchRam &&
      matchYear &&
      matchOS &&
      matchDiscount &&
      matchCategory &&
      matchDesigner
    )
  })

  const searchSuggestions =
    queryInput.length > 0
      ? allProducts
          .filter(
            (item) =>
              item.title.toLowerCase().includes(queryInput.toLowerCase()) ||
              item.designer.toLowerCase().includes(queryInput.toLowerCase())
          )
          .slice(0, 5)
          .map((item) => item.title)
      : []

  const colors = Array.from(
    new Set(allProducts.map((item) => (item as any).color).filter(Boolean))
  )
  const storages = Array.from(
    new Set(
      allProducts
        .map((item) => (item as any).storage)
        .filter((s): s is number | string => Boolean(s))
    )
  )
  const rams = Array.from(
    new Set(allProducts.map((item) => (item as any).ram).filter(Boolean))
  )
  const years = Array.from(
    new Set(allProducts.map((item) => (item as any).year).filter(Boolean))
  )
  const operatingSystems = Array.from(
    new Set(
      allProducts
        .map((item) => (item as any).operating_system)
        .filter(Boolean)
    )
  )
  const discounts = Array.from(
    new Set(
      allProducts
        .map((item) => item.discount)
        .filter((d): d is number => d != null)
    )
  )
  const categories = [
    'phones',
    'cases',
    'headphones',
    'earbuds',
    'cables',
    'watches',
  ]
  const designers = ['Apple', 'Samsung', 'Xiaomi']

  const filterConfig = [
    {
      label: t('category'),
      options: categories,
      state: selectedCategory,
      setter: setSelectedCategory,
    },
    {
      label: t('designer'),
      options: designers,
      state: selectedDesigner,
      setter: setSelectedDesigner,
    },
    {
      label: t('color'),
      options: colors,
      state: selectedColor,
      setter: setSelectedColor,
    },
    {
      label: t('storage'),
      options: storages.map((s) => s.toString()),
      state: selectedStorage,
      setter: setSelectedStorage,
    },
    {
      label: t('ram'),
      options: rams.map((r) => r.toString()),
      state: selectedRam,
      setter: setSelectedRam,
    },
    {
      label: t('year'),
      options: years.map((y) => y.toString()),
      state: selectedYear,
      setter: setSelectedYear,
    },
    {
      label: t('os'),
      options: operatingSystems,
      state: selectedOS,
      setter: setSelectedOS,
    },
    {
      label: t('discount'),
      options: [...discounts.map((d) => d.toString()), 'none'],
      state: selectedDiscount,
      setter: setSelectedDiscount,
    },
  ] as const

  const toggleFilter = (
    value: string,
    state: string[],
    setter: (val: string[]) => void
  ) => {
    if (value === 'all') {
      setter(['all'])
      return
    }
    const newState = state.includes('all')
      ? [value]
      : state.includes(value)
      ? state.filter((v) => v !== value)
      : [...state, value]
    setter(newState.length ? newState : ['all'])
  }

  const handleSearch = () => {
    setQuery(queryInput)
    setShowSuggestions(false)
  }

  const handleSuggestionClick = (s: string) => {
    setQueryInput(s)
    setQuery(s)
    setShowSuggestions(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="products-page">
      <div className="search-hero">
        <div className="search-hero-content">
          <h1>{t('findYourPerfectDevice')}</h1>
          <p>{t('discoverLatestTechWithBestDeals')}</p>

          <div className="search-container">
            <div className="search-wrapper">
              <SearchIcon />
              <input
                type="text"
                className="search-input"
                placeholder={t('searchPlaceholder')}
                value={queryInput}
                onChange={(e) => {
                  const val = e.target.value
                  setQueryInput(val)
                  setShowSuggestions(val.length > 0)
                }}
                onKeyPress={handleKeyPress}
                onFocus={() => setShowSuggestions(queryInput.length > 0)}
                onBlur={() =>
                  setTimeout(() => setShowSuggestions(false), 200)
                }
              />
              <button
                className="search-button"
                onClick={handleSearch}
              >
                {t('search')}
              </button>
            </div>

            {showSuggestions && (
              <ul className="suggestions-list">
                {searchSuggestions.map((s) => (
                  <li
                    key={s}
                    onClick={() => handleSuggestionClick(s)}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <button
        className="advanced-filters-toggle"
        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
      >
        ⚙️ {t('advancedFilters')}
      </button>

      {showAdvancedFilters && (
        <div
          className="modal-overlay"
          onClick={() => setShowAdvancedFilters(false)}
        >
          <div
            className="advanced-filters-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-modal"
              onClick={() => setShowAdvancedFilters(false)}
            >
              ×
            </button>
            <h3>{t('advancedFilters')}</h3>

            {filterConfig.map(({ label, options, state, setter }) => (
              <section className="filter-section" key={label as string}>
                <strong>{label}:</strong>
                <div className="filter-buttons">
                  <button
                    onClick={() => toggleFilter('all', state, setter)}
                    className={state.includes('all') ? 'active-filter' : ''}
                  >
                    {t('all')}
                  </button>
                  {options.map((option) => (
                    <button
                      key={option}
                      onClick={() => toggleFilter(option, state, setter)}
                      className={state.includes(option) ? 'active-filter' : ''}
                    >
                      {t(option)}
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}

      <div className="product-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((item) => {
            const finalPrice = getDiscountedPrice(
              item.price,
              item.discount ?? null
            );
            return (
              <div key={item.id} className="product-card">
                <img
                  src={item.image}
                  alt={t(`productss.${item.id}`)}
                  className="thumbnail"
                />
                <h3>{t(`productss.${item.id}`)}</h3>
                <p>
                  {item.discount ? (
                    <>
                      <span
                        className="discounted-price"
                        style={{ textDecoration: 'line-through' }}
                      >
                        ${item.price.toFixed(2)}
                      </span>{' '}
                      <span style={{ color: 'red', fontWeight: 'bold' }}>
                        ${finalPrice.toFixed(2)}
                      </span>{' '}
                      <span style={{ color: 'green', fontSize: '0.9rem' }}>
                        ({item.discount}% {t('off')})
                      </span>
                    </>
                  ) : (
                    <span>${item.price.toFixed(2)}</span>
                  )}
                </p>
                <p className="designer-text">
                  <strong>{t('designer')}:</strong> {item.designer}
                </p>
                <Link to={`/products/${item.id}`} className="details-button">
                  {t('viewDetails')}
                </Link>
              </div>
            );
          })
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            color: 'var(--text-color)',
            opacity: 0.7,
            fontSize: '1.1rem'
          }}>
            {t('noProductsFound')}
          </div>
        )}
      </div>
    </div>
  );
}