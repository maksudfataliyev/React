import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getAllProducts, getProductImageUrl } from '../components/productsService'
import type { Product } from '../components/productsService'
import '../Product.css'

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

const FilterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    style={{ width: '20px', height: '20px' }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
    />
  </svg>
)

export default function Products() {
  const { t } = useTranslation()
  const location = useLocation()

  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load products from backend
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true)
      const products = await getAllProducts()
      setAllProducts(products)
      setIsLoading(false)
    }
    loadProducts()
  }, [])

  const getStored = <T,>(key: string, defaultValue: T): T => {
    const stored = sessionStorage.getItem(key)
    try {
      return stored ? (JSON.parse(stored) as T) : defaultValue
    } catch {
      return defaultValue
    }
  }

  const searchParams = new URLSearchParams(location.search)
  const urlSearchQuery = searchParams.get('search') || ''

  const [queryInput, setQueryInput] = useState<string>(
    urlSearchQuery || getStored('queryInput', '')
  )
  const [query, setQuery] = useState<string>(
    urlSearchQuery || getStored('query', '')
  )
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
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showAllSuggestions, setShowAllSuggestions] = useState(false)

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
    value: string | number | undefined | null
  ) => {
    // If "all" is selected, show all products regardless of whether they have this property
    if (selected.includes('all')) return true
    
    // If a specific filter is selected but product doesn't have this property, hide it
    if (value === undefined || value === null) return false
    
    // Check if the product's value matches any selected filter
    const val = value.toString()
    return selected.includes(val)
  }

  const filteredProducts = allProducts.filter((item) => {
    const matchQuery =
      query === '' ||
      item.title.toLowerCase().includes(query.toLowerCase())
    const matchColor = isMatch(selectedColor, item.color)
    const matchStorage = isMatch(selectedStorage, item.storage)
    const matchRam = isMatch(selectedRam, item.ram)
    const matchYear = isMatch(selectedYear, item.year)
    const matchOS = isMatch(selectedOS, item.operatingSystem)
    
    const itemDiscount = item.discount !== null && item.discount !== undefined && item.discount > 0
        ? item.discount.toString() 
        : 'none'
        
    const matchDiscount = isMatch(selectedDiscount, itemDiscount)
    const matchCategory = isMatch(selectedCategory, item.category)
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
          .slice(0, 10)
      : []

  const visibleSuggestions = showAllSuggestions
    ? searchSuggestions
    : searchSuggestions.slice(0, 3)

  const getUniqueValues = (key: keyof Product) => {
     return Array.from(new Set(
        allProducts
            .map(p => p[key])
            .filter((v): v is string | number => v !== null && v !== undefined)
     ))
  }

  const colors = getUniqueValues('color') as string[]
  const storages = getUniqueValues('storage') as number[]
  const rams = getUniqueValues('ram') as number[]
  const years = getUniqueValues('year') as number[]
  const operatingSystems = getUniqueValues('operatingSystem') as string[]
  
  const discounts = Array.from(
    new Set(
      allProducts
        .map((item) => item.discount)
        .filter((d): d is number => d !== null && d !== undefined && d > 0)
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
  const designers = ['Apple', 'Samsung', 'Xiaomi', 'Sony']

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
    const withoutAll = state.filter(v => v !== 'all')
    
    if (withoutAll.includes(value)) {
      const newState = withoutAll.filter((v) => v !== value)
      setter(newState.length ? newState : ['all'])
    } else {
      setter([...withoutAll, value])
    }
  }

  const handleSearch = () => {
    setQuery(queryInput)
    setShowSuggestions(false)
  }

  const handleSuggestionClick = (item: Product) => {
    setQueryInput(item.title)
    setQuery(item.title)
    setShowSuggestions(false)
    setShowAllSuggestions(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const clearAllFilters = () => {
    setSelectedCategory(['all'])
    setSelectedDesigner(['all'])
    setSelectedColor(['all'])
    setSelectedStorage(['all'])
    setSelectedRam(['all'])
    setSelectedYear(['all'])
    setSelectedOS(['all'])
    setSelectedDiscount(['all'])
  }

  const hasActiveFilters =
    !selectedCategory.includes('all') ||
    !selectedDesigner.includes('all') ||
    !selectedColor.includes('all') ||
    !selectedStorage.includes('all') ||
    !selectedRam.includes('all') ||
    !selectedYear.includes('all') ||
    !selectedOS.includes('all') ||
    !selectedDiscount.includes('all')

  const FilterSection = () => (
    <div className="filters-content">
      <div className="filters-header">
        <h3>
          <FilterIcon />
          {t('filters')}
        </h3>
        {hasActiveFilters && (
          <button className="clear-filters-btn" onClick={clearAllFilters}>
            {t('clearAll')}
          </button>
        )}
      </div>

      {filterConfig.map(({ label, options, state, setter }) => (
        <div className="filter-group" key={label as string}>
          <h4 className="filter-title">{label}</h4>
          <div className="filter-options">
            <label className="filter-option">
              <input
                type="radio"
                checked={state.includes('all')}
                onChange={() => toggleFilter('all', state, setter)}
              />
              <span className="filter-label">{t('all')}</span>
            </label>
            {options.map((option) => (
              <label className="filter-option" key={option}>
                <input
                  type="checkbox"
                  checked={state.includes(option)}
                  onChange={() => toggleFilter(option, state, setter)}
                />
                <span className="filter-label">
                  {label === t('color') ? t(`colors.${option}`) : t(option)}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  if (isLoading) {
    return (
      <div className="products-page">
        <div className="loading-spinner" style={{ textAlign: 'center', padding: '100px' }}>
          Loading products...
        </div>
      </div>
    )
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

            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="suggestions-container">
                <div className="suggestions-grid">
                  {visibleSuggestions.map((item) => {
                    const finalPrice = getDiscountedPrice(
                      item.price,
                      item.discount ?? null
                    );
                    return (
                      <div
                        key={item.id}
                        className="suggestion-card"
                        onClick={() => handleSuggestionClick(item)}
                      >
                        <img
                          src={getProductImageUrl(item.image)}
                          alt={item.title}
                          className="suggestion-thumbnail"
                        />
                        <div className="suggestion-info">
                          <h4>{item.title}</h4>
                          <p className="suggestion-price">
                            {item.discount ? (
                              <>
                                <span className="suggestion-old-price">
                                  ${item.price.toFixed(2)}
                                </span>{' '}
                                <span className="suggestion-new-price">
                                  ${finalPrice.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span>${item.price.toFixed(2)}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {searchSuggestions.length > 3 && (
                  <button
                    className="toggle-suggestions-btn"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setShowAllSuggestions(!showAllSuggestions);
                    }}
                  >
                    {showAllSuggestions ? t('showLess') : t('showMore')}
                    <span className="toggle-icon">
                      {showAllSuggestions ? '▲' : '▼'}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="content-wrapper">
        <aside className="filters-sidebar">
          <FilterSection />
        </aside>

        <button
          className="mobile-filters-toggle"
          onClick={() => setShowMobileFilters(true)}
        >
          <FilterIcon />
          {t('filters')}
        </button>

        {showMobileFilters && (
          <div
            className="mobile-filters-overlay"
            onClick={() => setShowMobileFilters(false)}
          >
            <div
              className="mobile-filters-drawer"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mobile-filters-header">
                <h3>{t('filters')}</h3>
                <button
                  className="close-mobile-filters"
                  onClick={() => setShowMobileFilters(false)}
                >
                  ×
                </button>
              </div>
              <FilterSection />
              <div className="mobile-filters-footer">
                <button
                  className="apply-filters-btn"
                  onClick={() => setShowMobileFilters(false)}
                >
                  {t('showResults')} ({filteredProducts.length})
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="products-main">
          <div className="products-header">
            <h2>{filteredProducts.length} {t('productsFound')}</h2>
          </div>

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
                      src={getProductImageUrl(item.image)}
                      alt={item.title}
                      className="thumbnail"
                    />
                    <h3>{item.title}</h3>
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
              <div className="no-products">
                {t('noProductsFound')}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}