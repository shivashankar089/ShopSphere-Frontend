import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import ProductCard from '../components/ProductCard.jsx'
import ProductModal from '../components/ProductModal.jsx'
import {
  LogoIcon,
  StoreIcon,
  PhoneIcon,
  OrderBoxIcon,
  StarIcon,
} from '../components/Icons.jsx'
import { useCurrency } from '../context/CurrencyContext.jsx'
import api from '../api.js'

export default function StoreDetail() {
  const { id } = useParams()
  const { city } = useCurrency()
  const [store, setStore] = useState(null)
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchStoreDetails()
  }, [id])

  async function fetchStoreDetails() {
    setLoading(true)
    try {
      const [storeRes, prodRes] = await Promise.all([
        api.get(`/stores/${id}`),
        api.get(`/stores/${id}/products`),
      ])
      setStore(storeRes.data)
      setProducts(prodRes.data || [])
    } catch (err) {
      console.error('Failed to load store profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((p) => {
    if (!searchQuery.trim()) return true
    return (
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.tags && p.tags.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })

  if (loading) {
    return (
      <div className="apple-page-wrapper">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6e6e73' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <LogoIcon size={32} />
          </div>
          <p>Loading storefront details…</p>
        </div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="apple-page-wrapper">
        <Navbar />
        <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', background: '#fff', padding: '40px', borderRadius: '18px', border: '1px solid #e5e5ea' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>Store Not Found</h2>
          <p style={{ color: '#6e6e73', marginBottom: '20px' }}>The requested merchant store could not be found.</p>
          <Link to="/home" className="apple-btn-pill apple-btn-pill-primary">Return to Store</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="apple-page-wrapper">
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <main className="apple-main-content">
        <div style={{ fontSize: '13px', color: '#6e6e73', marginBottom: '20px' }}>
          <Link to="/home" style={{ color: '#1d1d1f' }}>Store</Link> <span> / </span> <span>Merchants</span> <span> / </span> <strong style={{ color: '#1d1d1f' }}>{store.name}</strong>
        </div>

        {/* Store Profile Hero */}
        <div style={{ background: '#ffffff', borderRadius: '24px', border: '1px solid #e5e5ea', padding: '36px', marginBottom: '36px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#86868b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              AUTHORIZED HYDERABAD MERCHANT • {store.distanceKm} KM AWAY
            </span>
            <span style={{ fontSize: '13px', color: '#1d1d1f', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <StarIcon size={13} filled /> {store.rating ? store.rating.toFixed(1) : '4.8'} ({store.reviewCount || 120} reviews)
            </span>
          </div>

          <h1 style={{ fontSize: '36px', fontWeight: '700', letterSpacing: '-0.03em', color: '#1d1d1f', marginBottom: '10px' }}>
            {store.name}
          </h1>
          <p style={{ fontSize: '15px', color: '#6e6e73', lineHeight: '1.5', maxWidth: '720px', marginBottom: '20px' }}>
            {store.description}
          </p>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px', color: '#86868b', borderTop: '1px solid #f0f0f4', paddingTop: '16px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <StoreIcon size={14} /> {store.address}, {store.city}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <PhoneIcon size={14} /> {store.phone || '+91 98490 12345'}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <OrderBoxIcon size={14} /> {products.length} Products Cataloged
            </span>
          </div>
        </div>

        {/* Products Section */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.025em', color: '#1d1d1f' }}>
              Products from {store.name}
            </h2>
            <span style={{ fontSize: '13px', color: '#6e6e73' }}>{filteredProducts.length} items ready for direct dispatch</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div style={{ background: '#ffffff', borderRadius: '18px', padding: '40px', textAlign: 'center', border: '1px solid #e5e5ea' }}>
              <p style={{ color: '#6e6e73', marginBottom: '14px' }}>No products matching your search in this store.</p>
              <button className="apple-btn-pill apple-btn-pill-secondary" onClick={() => setSearchQuery('')}>
                Clear Search
              </button>
            </div>
          ) : (
            <div className="apple-products-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}
