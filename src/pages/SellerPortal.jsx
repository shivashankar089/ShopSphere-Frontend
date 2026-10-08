import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { LogoIcon, CloseIcon, CheckIcon, ShieldIcon } from '../components/Icons.jsx'
import { useCurrency } from '../context/CurrencyContext.jsx'
import api from '../api.js'

export default function SellerPortal() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const { formatPrice } = useCurrency()

  const [storeData, setStoreData] = useState(null)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('inventory') // 'inventory', 'orders', 'profile'
  const [showAddModal, setShowAddModal] = useState(false)

  // Product Form
  const [prodForm, setProdForm] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    stock: 10,
    imageUrl: '',
    brand: '',
    categoryId: '',
    deliveryTimeEstimate: 'Delivery in 3-4 days across Hyderabad',
    tags: '',
  })
  const [safetyWarning, setSafetyWarning] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Store Profile Form
  const [profileForm, setProfileForm] = useState({
    name: '',
    description: '',
    address: '',
    city: 'Hyderabad',
    distanceKm: 2.3,
    phone: '',
  })
  const [profileSavedNotice, setProfileSavedNotice] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchSellerData()
  }, [])

  async function fetchSellerData() {
    setLoading(true)
    try {
      const [storeRes, prodRes, catRes, orderRes] = await Promise.all([
        api.get('/seller/store').catch(() => ({ data: {} })),
        api.get('/seller/products').catch(() => ({ data: [] })),
        api.get('/categories').catch(() => ({ data: [] })),
        api.get('/seller/orders').catch(() => ({ data: [] })),
      ])

      setStoreData(storeRes.data)
      setProducts(prodRes.data || [])
      setCategories(catRes.data || [])
      setOrders(orderRes.data || [])

      if (storeRes.data?.store) {
        setProfileForm({
          name: storeRes.data.store.name || '',
          description: storeRes.data.store.description || '',
          address: storeRes.data.store.address || '',
          city: storeRes.data.store.city || 'Hyderabad',
          distanceKm: storeRes.data.store.distanceKm || 2.3,
          phone: storeRes.data.store.phone || '',
        })
      }
    } catch (err) {
      console.error('Failed to load seller data:', err)
    } finally {
      setLoading(false)
    }
  }

  function handleProductInputChange(field, value) {
    setProdForm({ ...prodForm, [field]: value })

    const prohibited = ['drug', 'narcotic', 'weed', 'cannabis', 'opioid', 'contraband', 'weapon', 'prescription pill', 'steroid']
    const text = (value + ' ' + prodForm.name + ' ' + prodForm.description).toLowerCase()
    const detected = prohibited.find((p) => text.includes(p))
    if (detected) {
      setSafetyWarning(`Safety Compliance Alert: "${detected}" detected. Requires Admin review.`)
    } else {
      setSafetyWarning('')
    }
  }

  async function handleAddProduct(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/seller/products', {
        name: prodForm.name,
        description: prodForm.description,
        price: parseFloat(prodForm.price) || 999.0,
        originalPrice: parseFloat(prodForm.originalPrice) || (parseFloat(prodForm.price) * 1.25) || 1299.0,
        stock: parseInt(prodForm.stock) || 10,
        imageUrl: prodForm.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
        brand: prodForm.brand || storeData?.store?.name || 'Local Seller',
        categoryId: prodForm.categoryId ? parseInt(prodForm.categoryId) : (categories[0]?.id || 1),
        deliveryTimeEstimate: prodForm.deliveryTimeEstimate || 'Delivery in 3-4 days across Hyderabad',
        tags: prodForm.tags,
      })

      setShowAddModal(false)
      setProdForm({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        stock: 10,
        imageUrl: '',
        brand: '',
        categoryId: '',
        deliveryTimeEstimate: 'Delivery in 3-4 days across Hyderabad',
        tags: '',
      })
      fetchSellerData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add product.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleUpdateStock(productId, currentStock, delta) {
    const newStock = Math.max(0, currentStock + delta)
    try {
      await api.put(`/seller/products/${productId}/stock`, { stock: newStock })
      setProducts(products.map((p) => (p.id === productId ? { ...p, stock: newStock } : p)))
    } catch (err) {
      alert('Failed to update inventory count.')
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault()
    try {
      await api.put('/seller/store', profileForm)
      setProfileSavedNotice(true)
      setTimeout(() => setProfileSavedNotice(false), 3000)
      fetchSellerData()
    } catch (err) {
      alert('Failed to save store profile.')
    }
  }

  if (loading) {
    return (
      <div className="apple-page-wrapper">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6e6e73' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <LogoIcon size={32} />
          </div>
          <p>Loading Merchant Portal…</p>
        </div>
      </div>
    )
  }

  const isApproved = storeData?.approved ?? true
  const totalStockCount = products.reduce((sum, p) => sum + (p.stock || 0), 0)

  return (
    <div className="apple-page-wrapper">
      <Navbar />

      <main className="apple-main-content">
        <div className="apple-portal-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span className="apple-portal-badge" style={{ color: '#1d1d1f', background: '#f0f0f2' }}>MERCHANT BUSINESS HUB</span>
              <h1 className="apple-portal-title">{storeData?.store?.name || `${user?.name}'s Store`}</h1>
              <p style={{ fontSize: '14px', color: '#6e6e73', marginTop: '4px' }}>
                Manage warehouse catalog, inventory balances, and dispatch timelines.
              </p>
            </div>

            <button
              className="apple-btn-pill apple-btn-pill-primary"
              onClick={() => setShowAddModal(true)}
            >
              + Add New Product
            </button>
          </div>
        </div>

        {!isApproved && (
          <div className="apple-alert-error" style={{ marginBottom: '24px' }}>
            <strong>Application Under Review:</strong> Your store is currently awaiting Admin license and compliance verification. Products added will be staged until approved.
          </div>
        )}

        {profileSavedNotice && (
          <div className="apple-alert-success" style={{ marginBottom: '24px' }}>
            Store profile details updated successfully.
          </div>
        )}

        {/* Metrics Grid */}
        <div className="apple-metrics-grid">
          <div className="apple-metric-card">
            <div className="apple-metric-val">{products.length}</div>
            <div className="apple-metric-label">Catalog Products Listed</div>
          </div>
          <div className="apple-metric-card">
            <div className="apple-metric-val">{totalStockCount}</div>
            <div className="apple-metric-label">Total Units in Inventory</div>
          </div>
          <div className="apple-metric-card">
            <div className="apple-metric-val">{orders.length}</div>
            <div className="apple-metric-label">Store Dispatches</div>
          </div>
          <div className="apple-metric-card">
            <div className="apple-metric-val" style={{ color: '#1d1d1f' }}>
              {isApproved ? 'Verified' : 'Pending Review'}
            </div>
            <div className="apple-metric-label">License Status</div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="apple-filter-toolbar" style={{ marginTop: 0 }}>
          <div className="apple-toolbar-tabs">
            <button
              className={`apple-tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveTab('inventory')}
            >
              Catalog Inventory ({products.length})
            </button>
            <button
              className={`apple-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              Customer Dispatches ({orders.length})
            </button>
            <button
              className={`apple-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Store Profile Settings
            </button>
          </div>
        </div>

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="apple-table-wrap">
            {products.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: '#6e6e73' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1d1d1f', marginBottom: '8px' }}>No Products in Catalog</h3>
                <p style={{ fontSize: '13.5px', marginBottom: '20px' }}>Start adding items to your store catalog for customers across Hyderabad.</p>
                <button className="apple-btn-pill apple-btn-pill-primary" onClick={() => setShowAddModal(true)}>
                  + Add First Product
                </button>
              </div>
            ) : (
              <table className="apple-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock Units</th>
                    <th>Status</th>
                    <th>Inventory Controls</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            style={{ width: '44px', height: '44px', objectFit: 'contain', background: '#fafafc', borderRadius: '8px', padding: '4px' }}
                          />
                          <div>
                            <strong>{p.name}</strong>
                            <div style={{ fontSize: '12px', color: '#6e6e73' }}>{p.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td>{p.category?.name || 'General'}</td>
                      <td><strong>{formatPrice(p.price)}</strong></td>
                      <td>
                        <span style={{ fontWeight: '600', color: p.stock <= 5 ? '#ff3b30' : '#1d1d1f' }}>
                          {p.stock} units
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: p.status === 'APPROVED' ? '#34c759' : '#ff9500', background: p.status === 'APPROVED' ? '#eafaf1' : '#fff7eb', padding: '4px 10px', borderRadius: '980px' }}>
                          {p.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="apple-btn-pill apple-btn-pill-secondary apple-btn-pill-sm"
                            onClick={() => handleUpdateStock(p.id, p.stock, -1)}
                            disabled={p.stock <= 0}
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            className="apple-btn-pill apple-btn-pill-secondary apple-btn-pill-sm"
                            onClick={() => handleUpdateStock(p.id, p.stock, 5)}
                          >
                            +5
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Dispatches Tab */}
        {activeTab === 'orders' && (
          <div className="apple-table-wrap">
            {orders.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: '#6e6e73' }}>
                <p style={{ fontSize: '14px' }}>No active dispatches for your store yet.</p>
              </div>
            ) : (
              <table className="apple-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer Location</th>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Payout</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td>#{o.id}</td>
                      <td>{o.shippingAddress}</td>
                      <td>{o.productName}</td>
                      <td>{o.quantity}</td>
                      <td>{formatPrice(o.totalPrice)}</td>
                      <td>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#0071e3', background: '#f0f7ff', padding: '4px 10px', borderRadius: '980px' }}>
                          {o.parcelStatus || 'DISPATCH READY'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Profile Settings Tab */}
        {activeTab === 'profile' && (
          <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e5e5ea', padding: '36px', maxWidth: '680px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>Store Profile & Fulfillment Zone</h3>
            <p style={{ fontSize: '13.5px', color: '#6e6e73', marginBottom: '24px' }}>
              Update your merchant address and delivery radius details.
            </p>

            <form onSubmit={handleSaveProfile}>
              <div className="apple-form-group">
                <label className="apple-form-label">Store Name</label>
                <input
                  type="text"
                  className="apple-form-input"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="apple-form-group">
                <label className="apple-form-label">Store Description</label>
                <textarea
                  rows={2}
                  className="apple-form-input"
                  style={{ height: 'auto', padding: '12px 16px' }}
                  value={profileForm.description}
                  onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                />
              </div>

              <div className="apple-form-group">
                <label className="apple-form-label">Street Address</label>
                <input
                  type="text"
                  className="apple-form-input"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  required
                />
              </div>

              <div className="apple-form-row-2">
                <div className="apple-form-group">
                  <label className="apple-form-label">City</label>
                  <input
                    type="text"
                    className="apple-form-input"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    required
                  />
                </div>
                <div className="apple-form-group">
                  <label className="apple-form-label">Distance to Central Hub (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="apple-form-input"
                    value={profileForm.distanceKm}
                    onChange={(e) => setProfileForm({ ...profileForm, distanceKm: parseFloat(e.target.value) || 2.0 })}
                  />
                </div>
              </div>

              <div className="apple-form-group">
                <label className="apple-form-label">Merchant Phone</label>
                <input
                  type="tel"
                  className="apple-form-input"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                />
              </div>

              <button type="submit" className="apple-btn-pill apple-btn-pill-primary" style={{ marginTop: '12px' }}>
                Save Store Settings
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="product-modal-card" style={{ maxWidth: '640px', padding: '36px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '700' }}>Add Product to Catalog</h2>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)} aria-label="Close">
                <CloseIcon size={12} />
              </button>
            </div>

            {safetyWarning && (
              <div className="apple-alert-error" style={{ marginBottom: '16px' }}>
                {safetyWarning}
              </div>
            )}

            <form onSubmit={handleAddProduct}>
              <div className="apple-form-group">
                <label className="apple-form-label">Product Name *</label>
                <input
                  type="text"
                  className="apple-form-input"
                  required
                  placeholder="e.g. Wireless Mechanical Keyboard"
                  value={prodForm.name}
                  onChange={(e) => handleProductInputChange('name', e.target.value)}
                />
              </div>

              <div className="apple-form-row-2">
                <div className="apple-form-group">
                  <label className="apple-form-label">Category *</label>
                  <select
                    className="apple-form-select"
                    value={prodForm.categoryId}
                    onChange={(e) => handleProductInputChange('categoryId', e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="apple-form-group">
                  <label className="apple-form-label">Brand Name</label>
                  <input
                    type="text"
                    className="apple-form-input"
                    placeholder="e.g. Sony / Apple"
                    value={prodForm.brand}
                    onChange={(e) => handleProductInputChange('brand', e.target.value)}
                  />
                </div>
              </div>

              <div className="apple-form-row-2">
                <div className="apple-form-group">
                  <label className="apple-form-label">Selling Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="apple-form-input"
                    required
                    placeholder="2499.00"
                    value={prodForm.price}
                    onChange={(e) => handleProductInputChange('price', e.target.value)}
                  />
                </div>

                <div className="apple-form-group">
                  <label className="apple-form-label">Initial Stock Units *</label>
                  <input
                    type="number"
                    className="apple-form-input"
                    required
                    value={prodForm.stock}
                    onChange={(e) => handleProductInputChange('stock', e.target.value)}
                  />
                </div>
              </div>

              <div className="apple-form-group">
                <label className="apple-form-label">Image URL</label>
                <input
                  type="url"
                  className="apple-form-input"
                  placeholder="https://images.unsplash.com/..."
                  value={prodForm.imageUrl}
                  onChange={(e) => handleProductInputChange('imageUrl', e.target.value)}
                />
              </div>

              <div className="apple-form-group">
                <label className="apple-form-label">Product Description</label>
                <textarea
                  rows={2}
                  className="apple-form-input"
                  style={{ height: 'auto', padding: '12px 16px' }}
                  placeholder="Key features and technical specifications..."
                  value={prodForm.description}
                  onChange={(e) => handleProductInputChange('description', e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button type="button" className="apple-btn-pill apple-btn-pill-secondary" style={{ flex: 1 }} onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="apple-btn-pill apple-btn-pill-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? 'Listing Product…' : 'Publish Product ›'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
