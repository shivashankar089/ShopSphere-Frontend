import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { LogoIcon, RefreshIcon, CheckIcon, ShieldIcon, StarIcon } from '../components/Icons.jsx'
import { useCurrency } from '../context/CurrencyContext.jsx'
import api from '../api.js'

export default function AdminPortal() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const { formatPrice } = useCurrency()

  const [overview, setOverview] = useState(null)
  const [pendingSellers, setPendingSellers] = useState([])
  const [products, setProducts] = useState([])
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending-sellers') // 'pending-sellers', 'moderation', 'stores'
  const [actionNotice, setActionNotice] = useState('')

  useEffect(() => {
    fetchAdminData()
  }, [])

  async function fetchAdminData() {
    setLoading(true)
    try {
      const [overviewRes, pendingRes, prodRes, storeRes] = await Promise.all([
        api.get('/admin/overview').catch(() => ({ data: {} })),
        api.get('/admin/pending-sellers').catch(() => ({ data: [] })),
        api.get('/admin/moderation/products').catch(() => ({ data: [] })),
        api.get('/stores').catch(() => ({ data: [] })),
      ])
      setOverview(overviewRes.data)
      setPendingSellers(pendingRes.data || [])
      setProducts(prodRes.data || [])
      setStores(storeRes.data || [])
    } catch (err) {
      console.error('Failed to load admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleApproveSeller(userId) {
    try {
      await api.post(`/admin/approve-seller/${userId}`)
      setActionNotice('Merchant account and store approved successfully.')
      setTimeout(() => setActionNotice(''), 4000)
      fetchAdminData()
    } catch (err) {
      alert('Failed to approve seller.')
    }
  }

  async function handleRejectSeller(userId) {
    const reason = prompt('Enter rejection reason for vendor:', 'Incomplete business license or compliance documentation.')
    if (!reason) return
    try {
      await api.post(`/admin/reject-seller/${userId}`, { reason })
      setActionNotice('Merchant application rejected.')
      setTimeout(() => setActionNotice(''), 4000)
      fetchAdminData()
    } catch (err) {
      alert('Failed to reject seller.')
    }
  }

  async function handleModerateProduct(productId, status, notes) {
    try {
      await api.post(`/admin/moderate-product/${productId}`, { status, notes })
      setActionNotice(`Product marked as ${status}.`)
      setTimeout(() => setActionNotice(''), 3000)
      fetchAdminData()
    } catch (err) {
      alert('Failed to update product moderation.')
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
          <p>Loading Governance Center…</p>
        </div>
      </div>
    )
  }

  const flaggedProducts = products.filter((p) => p.restrictedItem || p.status === 'PENDING_REVIEW')

  return (
    <div className="apple-page-wrapper">
      <Navbar />

      <main className="apple-main-content">
        <div className="apple-portal-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span className="apple-portal-badge" style={{ color: '#1d1d1f', background: '#f0f0f2' }}>PLATFORM GOVERNANCE CENTER</span>
              <h1 className="apple-portal-title">Administrator Oversight & Verification</h1>
              <p style={{ fontSize: '14px', color: '#6e6e73', marginTop: '4px' }}>
                Review merchant onboarding applications, inspect business licenses, and moderate catalog compliance.
              </p>
            </div>
            <button className="apple-btn-pill apple-btn-pill-secondary apple-btn-pill-sm" onClick={fetchAdminData}>
              <RefreshIcon size={13} /> Refresh
            </button>
          </div>
        </div>

        {actionNotice && (
          <div className="apple-alert-success" style={{ marginBottom: '24px' }}>
            {actionNotice}
          </div>
        )}

        {/* Apple Metrics Grid */}
        <div className="apple-metrics-grid">
          <div className="apple-metric-card">
            <div className="apple-metric-val" style={{ color: '#0071e3' }}>
              {overview?.pendingSellers || pendingSellers.length}
            </div>
            <div className="apple-metric-label">Pending Merchant Applications</div>
          </div>

          <div className="apple-metric-card">
            <div className="apple-metric-val" style={{ color: flaggedProducts.length > 0 ? '#ff3b30' : '#1d1d1f' }}>
              {flaggedProducts.length}
            </div>
            <div className="apple-metric-label">Flagged Products for Review</div>
          </div>

          <div className="apple-metric-card">
            <div className="apple-metric-val">{stores.length}</div>
            <div className="apple-metric-label">Active Verified Stores</div>
          </div>

          <div className="apple-metric-card">
            <div className="apple-metric-val">{overview?.totalProducts || products.length}</div>
            <div className="apple-metric-label">Total Catalog Products</div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="apple-filter-toolbar" style={{ marginTop: 0 }}>
          <div className="apple-toolbar-tabs">
            <button
              className={`apple-tab-btn ${activeTab === 'pending-sellers' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending-sellers')}
            >
              Pending Merchants ({pendingSellers.length})
            </button>
            <button
              className={`apple-tab-btn ${activeTab === 'moderation' ? 'active' : ''}`}
              onClick={() => setActiveTab('moderation')}
            >
              Safety Moderation ({flaggedProducts.length})
            </button>
            <button
              className={`apple-tab-btn ${activeTab === 'stores' ? 'active' : ''}`}
              onClick={() => setActiveTab('stores')}
            >
              All Stores ({stores.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Pending Merchant Review */}
        {activeTab === 'pending-sellers' && (
          <div className="apple-table-wrap">
            {pendingSellers.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: '#6e6e73' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', color: '#1d1d1f' }}>
                  <CheckIcon size={32} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1d1d1f', marginBottom: '4px' }}>All Merchant Applications Verified</h3>
                <p style={{ fontSize: '13.5px' }}>There are currently no merchant accounts awaiting administrative review.</p>
              </div>
            ) : (
              <table className="apple-table">
                <thead>
                  <tr>
                    <th>Merchant / Business</th>
                    <th>Contact & Location</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingSellers.map((seller) => (
                    <tr key={seller.id}>
                      <td>
                        <strong>{seller.name}</strong>
                        <div style={{ fontSize: '12px', color: '#6e6e73' }}>{seller.email}</div>
                      </td>
                      <td>
                        <div>{seller.phone || 'N/A'}</div>
                        <div style={{ fontSize: '12px', color: '#6e6e73' }}>{seller.city}, {seller.pincode}</div>
                      </td>
                      <td>
                        <span className="apple-cat-badge">Retail Merchant</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#ff9500', background: '#fff7eb', padding: '4px 10px', borderRadius: '980px' }}>
                          Pending Verification
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="apple-btn-pill apple-btn-pill-primary apple-btn-pill-sm"
                            onClick={() => handleApproveSeller(seller.id)}
                          >
                            Approve Merchant
                          </button>
                          <button
                            className="apple-btn-pill apple-btn-pill-secondary apple-btn-pill-sm"
                            style={{ color: '#ff3b30' }}
                            onClick={() => handleRejectSeller(seller.id)}
                          >
                            Reject
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

        {/* Tab 2: Safety Moderation Queue */}
        {activeTab === 'moderation' && (
          <div className="apple-table-wrap">
            {flaggedProducts.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: '#6e6e73' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', color: '#1d1d1f' }}>
                  <ShieldIcon size={32} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1d1d1f', marginBottom: '4px' }}>Zero Safety Violations</h3>
                <p style={{ fontSize: '13.5px' }}>All catalog listings comply with consumer safety regulations.</p>
              </div>
            ) : (
              <table className="apple-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Store / Seller</th>
                    <th>Safety Scanner Flag</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {flaggedProducts.map((p) => (
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
                            <div style={{ fontSize: '12px', color: '#6e6e73' }}>{p.category?.name || 'General'}</div>
                          </div>
                        </div>
                      </td>
                      <td>{p.store?.name || 'Pending Store'}</td>
                      <td>
                        <span style={{ fontSize: '12px', color: p.restrictedItem ? '#ff3b30' : '#ff9500' }}>
                          {p.moderationNotes || 'Requires admin review'}
                        </span>
                      </td>
                      <td>{formatPrice(p.price)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="apple-btn-pill apple-btn-pill-primary apple-btn-pill-sm"
                            onClick={() => handleModerateProduct(p.id, 'APPROVED', 'Approved by admin')}
                          >
                            Approve
                          </button>
                          <button
                            className="apple-btn-pill apple-btn-pill-secondary apple-btn-pill-sm"
                            style={{ color: '#ff3b30' }}
                            onClick={() => handleModerateProduct(p.id, 'REJECTED', 'Prohibited item')}
                          >
                            Reject
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

        {/* Tab 3: Stores Directory */}
        {activeTab === 'stores' && (
          <div className="apple-table-wrap">
            <table className="apple-table">
              <thead>
                <tr>
                  <th>Store Name</th>
                  <th>Location</th>
                  <th>Distance</th>
                  <th>Rating</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <strong>{s.name}</strong>
                      <div style={{ fontSize: '12px', color: '#6e6e73' }}>{s.description}</div>
                    </td>
                    <td>{s.address}, {s.city}</td>
                    <td>{s.distanceKm} km</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <StarIcon size={12} filled />
                        {s.rating ? s.rating.toFixed(1) : '4.8'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#1d1d1f', background: '#f0f0f2', padding: '4px 10px', borderRadius: '980px' }}>
                        Verified & Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
