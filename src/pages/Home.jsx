import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import ProductCard from '../components/ProductCard.jsx'
import ProductModal from '../components/ProductModal.jsx'
import StoreCard from '../components/StoreCard.jsx'
import { CategoryIcon, LogoIcon, CloseIcon } from '../components/Icons.jsx'
import { useCurrency } from '../context/CurrencyContext.jsx'
import api from '../api.js'

// Clean Apple Store Category Ribbon Tabs with monochrome vector icons
const CATEGORY_TABS = [
  { id: null, slug: 'all', label: 'All Products' },
  { id: 1, slug: 'electronics', label: 'Electronics' },
  { id: 6, slug: 'gaming', label: 'Gaming' },
  { id: 2, slug: 'groceries', label: 'Groceries' },
  { id: 7, slug: 'home-living', label: 'Home & Living' },
  { id: 8, slug: 'health-fitness', label: 'Health & Fitness' },
  { id: 9, slug: 'handmade-artisan', label: 'Handmade' },
  { id: 10, slug: 'beauty-care', label: 'Beauty & Care' },
  { id: 3, slug: 'fashion', label: 'Fashion' },
  { id: 11, slug: 'books-stationery', label: 'Books & Stationery' },
]

export default function Home() {
  const { city } = useCurrency()
  const [products, setProducts] = useState([])
  const [stores, setStores] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedDistance, setSelectedDistance] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('featured')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all') // 'all', 'stores'

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, selectedDistance, searchQuery])

  async function fetchInitialData() {
    setLoading(true)
    try {
      const [catRes, storeRes, prodRes] = await Promise.all([
        api.get('/categories').catch(() => ({ data: [] })),
        api.get('/stores').catch(() => ({ data: [] })),
        api.get('/products').catch(() => ({ data: [] })),
      ])
      setCategories(catRes.data || [])
      setStores(storeRes.data || [])
      setProducts(prodRes.data || [])
    } catch (err) {
      console.error('Failed to load marketplace data:', err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchProducts() {
    try {
      const params = {}
      if (selectedCategory) params.categoryId = selectedCategory
      if (selectedDistance) params.maxDistance = selectedDistance
      if (searchQuery.trim()) params.search = searchQuery.trim()

      const res = await api.get('/products', { params })
      setProducts(res.data || [])
    } catch (err) {
      console.error('Failed to filter products:', err)
    }
  }

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price
    if (sortBy === 'price-high') return b.price - a.price
    if (sortBy === 'distance') {
      const distA = a.store?.distanceKm || 99
      const distB = b.store?.distanceKm || 99
      return distA - distB
    }
    if (sortBy === 'rating') return b.rating - a.rating
    return 0
  })

  // Apple Store Latest Feature Cards (Featured Showcase)
  const featuredShowcase = [
    {
      id: 1,
      type: 'dark',
      kicker: 'FLAGSHIP AUDIO',
      heading: 'Sony WH-1000XM5',
      desc: 'Industry-leading noise cancelation with 30-hour battery life and quick charge.',
      priceText: 'From ₹26,990',
      categorySlug: 'electronics',
      productId: products.find((p) => p.name?.includes('Sony WH-1000XM5'))?.id,
    },
    {
      id: 2,
      type: 'light',
      kicker: 'ORGANIC GOURMET',
      heading: 'Artisanal Single-Origin Coffee & Matcha',
      desc: 'Sourced from high altitude estates. Freshly roasted and delivered to your doorstep.',
      priceText: 'From ₹899',
      categorySlug: 'groceries',
      productId: products.find((p) => p.name?.includes('Arabica Dark Roast'))?.id,
    },
    {
      id: 3,
      type: 'dark',
      kicker: 'NEXT-GEN GAMING',
      heading: 'PlayStation 5 & Mixed Reality',
      desc: 'Experience lightning-fast SSD loading, ray tracing, and ultra-high FPS gameplay.',
      priceText: 'From ₹31,990',
      categorySlug: 'gaming',
      productId: products.find((p) => p.name?.includes('PlayStation 5'))?.id,
    },
  ]

  return (
    <div className="apple-page-wrapper">
      {/* Frosted Glass Navigation Bar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedDistance={selectedDistance}
        setSelectedDistance={setSelectedDistance}
      />

      {/* Apple Store Style Horizontal Category Ribbon */}
      <nav className="apple-category-bar" aria-label="Store Categories">
        <div className="apple-category-container">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.label}
              className={`apple-cat-item ${selectedCategory === tab.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory(tab.id)
                setActiveTab('all')
              }}
            >
              <span className="apple-cat-icon">
                <CategoryIcon slug={tab.slug} size={20} />
              </span>
              <span className="apple-cat-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="apple-main-content">
        {/* Apple Store Big Title (Screenshot 2) */}
        <header className="apple-store-hero-header">
          <div className="apple-store-title-row">
            <h1 className="apple-store-title">
              Store. <span>The best way to buy the products you love.</span>
            </h1>

            <div className="apple-store-help-links">
              <span style={{ color: '#6e6e73' }}>Direct fulfillment across {city}</span>
              <Link to="/orders">Track active orders ›</Link>
            </div>
          </div>
        </header>

        {/* "The latest. Take a look at what's new" Section (Screenshot 2) */}
        {!selectedCategory && !searchQuery && (
          <section>
            <h2 className="apple-section-headline">
              The latest. <span>Take a look at what’s new.</span>
            </h2>

            <div className="apple-showcase-grid">
              {featuredShowcase.map((card) => (
                <div
                  key={card.id}
                  className={`apple-feature-card ${card.type === 'dark' ? 'dark-card' : 'light-card'}`}
                  onClick={() => {
                    const found = products.find((p) => p.id === card.productId)
                    if (found) setSelectedProduct(found)
                  }}
                >
                  <div>
                    <span className="apple-card-kicker">{card.kicker}</span>
                    <h3 className="apple-card-heading">{card.heading}</h3>
                    <p className="apple-card-desc">{card.desc}</p>
                  </div>

                  <div>
                    <div className="apple-card-price-tag">{card.priceText}</div>
                    <div className="apple-card-bottom">
                      <button
                        type="button"
                        className="apple-btn-pill apple-btn-pill-primary apple-btn-pill-sm"
                      >
                        Explore Product
                      </button>
                      <span className="apple-link-arrow">
                        Learn more ›
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Filter and Sorting Toolbar */}
        <div className="apple-filter-toolbar">
          <div className="apple-toolbar-tabs">
            <button
              className={`apple-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Products ({products.length})
            </button>
            <button
              className={`apple-tab-btn ${activeTab === 'stores' ? 'active' : ''}`}
              onClick={() => setActiveTab('stores')}
            >
              Verified Stores in {city} ({stores.length})
            </button>
          </div>

          <div className="apple-sort-wrap">
            <label htmlFor="apple-sort-select">Sort by:</label>
            <select
              id="apple-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="apple-sort-select"
            >
              <option value="featured">Featured & Best Deals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="distance">Nearest Merchant</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(selectedCategory !== null || searchQuery) && (
          <div className="apple-active-chips-row">
            <span style={{ fontSize: '13px', color: '#6e6e73' }}>Filtered by:</span>
            {selectedCategory !== null && (
              <span className="apple-filter-chip">
                {CATEGORY_TABS.find((c) => c.id === selectedCategory)?.label || 'Category'}
                <button onClick={() => setSelectedCategory(null)} title="Remove category filter" aria-label="Remove category filter">
                  <CloseIcon size={11} />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="apple-filter-chip">
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')} title="Clear search" aria-label="Clear search">
                  <CloseIcon size={11} />
                </button>
              </span>
            )}
            <button
              className="apple-clear-all-link"
              onClick={() => {
                setSelectedCategory(null)
                setSearchQuery('')
              }}
            >
              Clear all
            </button>
          </div>
        )}

        {/* Stores Tab or Products Grid */}
        {activeTab === 'stores' ? (
          <section className="apple-stores-section">
            <div className="apple-stores-header">
              <div>
                <h3>Authorized Merchant Stores in {city}</h3>
                <p>Verified independent retailers fulfilling multi-vendor split orders</p>
              </div>
            </div>

            <div className="apple-stores-grid">
              {stores.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          </section>
        ) : (
          <section>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6e6e73' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                  <LogoIcon size={32} />
                </div>
                <p>Loading catalog from verified Hyderabad merchants…</p>
              </div>
            ) : sortedProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '18px', border: '1px solid #e5e5ea' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>No matching products found</h3>
                <p style={{ color: '#6e6e73', marginBottom: '20px' }}>Try resetting your category or search filter.</p>
                <button
                  className="apple-btn-pill apple-btn-pill-primary"
                  onClick={() => {
                    setSelectedCategory(null)
                    setSearchQuery('')
                  }}
                >
                  View All Products
                </button>
              </div>
            ) : (
              <div className="apple-products-grid">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelectProduct={(p) => setSelectedProduct(p)}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Product Detail Modal Dialog */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}
