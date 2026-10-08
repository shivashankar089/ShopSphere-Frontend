import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useCurrency } from '../context/CurrencyContext.jsx'
import BecomeSellerModal from './BecomeSellerModal.jsx'
import {
  LogoIcon,
  SearchIcon,
  BagIcon,
  UserIcon,
  LocationPinIcon,
  OrderBoxIcon,
  StoreIcon,
  ShieldIcon,
  SignOutIcon,
  CloseIcon,
} from './Icons.jsx'

export default function Navbar({ searchQuery, setSearchQuery, selectedDistance, setSelectedDistance }) {
  const navigate = useNavigate()
  const { totalItems } = useCart()
  const { country, setCountry, city, pincode, setCity, setPincode } = useCurrency()
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showSellerModal, setShowSellerModal] = useState(false)

  const [tempCity, setTempCity] = useState(city || 'Hyderabad')
  const [tempPin, setTempPin] = useState(pincode || '500081')

  function handleLogout() {
    localStorage.clear()
    navigate('/login')
  }

  function handleSearchSubmit(e) {
    e.preventDefault()
    if (window.location.pathname !== '/home') {
      navigate('/home')
    }
  }

  function handleSaveLocation(e) {
    e.preventDefault()
    setCity(tempCity)
    setPincode(tempPin)
    setShowLocationModal(false)
  }

  const displayName = user?.name ? user.name.split(' ')[0] : 'Account'

  return (
    <>
      {/* Apple Style Announcement Ribbon */}
      <div className="apple-announcement-ribbon">
        <span>
          Get up to ₹7,000 instant savings on eligible cards with 3-4 day express delivery across Hyderabad.{' '}
          <Link to="/home" className="ribbon-link">Shop Store ›</Link>
        </span>
      </div>

      {/* Apple Translucent Frosted Glass Navbar */}
      <header className="apple-navbar">
        <div className="apple-nav-container">
          {/* Brand Logo & Name */}
          <Link to="/home" className="apple-brand" title="ShopSphere Home">
            <span className="apple-logo-icon">
              <LogoIcon size={18} />
            </span>
            <span className="apple-brand-name">ShopSphere</span>
          </Link>

          {/* Search Pill */}
          <form className="apple-search-form" onSubmit={handleSearchSubmit}>
            <span className="apple-search-icon">
              <SearchIcon size={15} />
            </span>
            <input
              type="text"
              placeholder="Search products, brands and stores"
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              className="apple-search-input"
            />
          </form>

          {/* Nav Controls */}
          <div className="apple-nav-actions">
            {/* Delivery Location Pill */}
            <button
              className="apple-nav-loc-btn"
              onClick={() => setShowLocationModal(true)}
              title="Select Delivery Location"
            >
              <LocationPinIcon size={14} />
              <span>Deliver to <strong>{city} {pincode}</strong></span>
            </button>

            {/* Currency Switcher Pill */}
            <div className="apple-currency-toggle">
              <button
                type="button"
                className={`apple-curr-btn ${country === 'India' ? 'active' : ''}`}
                onClick={() => setCountry('India')}
                title="Indian Rupees (₹)"
              >
                ₹ INR
              </button>
              <button
                type="button"
                className={`apple-curr-btn ${country === 'USA' ? 'active' : ''}`}
                onClick={() => setCountry('USA')}
                title="US Dollars ($)"
              >
                $ USD
              </button>
            </div>

            {/* Account Menu */}
            {user ? (
              <div className="apple-dropdown-wrap">
                <button
                  className="apple-account-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-expanded={showUserMenu}
                >
                  <UserIcon size={15} />
                  <span>{displayName}</span>
                  <span style={{ fontSize: '10px', color: '#86868b' }}>▾</span>
                </button>

                {showUserMenu && (
                  <div className="apple-dropdown-menu">
                    <div className="apple-menu-header">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>
                    <hr className="apple-menu-divider" />

                    <Link to="/orders" className="apple-menu-item" onClick={() => setShowUserMenu(false)}>
                      <OrderBoxIcon size={15} /> Order History
                    </Link>

                    {user.role !== 'SELLER' && (
                      <button
                        className="apple-menu-item highlight-item"
                        onClick={() => {
                          setShowUserMenu(false)
                          setShowSellerModal(true)
                        }}
                      >
                        <StoreIcon size={15} /> Merchant Business Hub
                      </button>
                    )}

                    {(user.role === 'SELLER' || user.role === 'ADMIN') && (
                      <Link to="/seller" className="apple-menu-item" onClick={() => setShowUserMenu(false)}>
                        <StoreIcon size={15} /> Merchant Dashboard
                      </Link>
                    )}

                    {user.role === 'ADMIN' && (
                      <Link to="/admin" className="apple-menu-item" onClick={() => setShowUserMenu(false)}>
                        <ShieldIcon size={15} /> Platform Governance
                      </Link>
                    )}

                    <hr className="apple-menu-divider" />

                    <button className="apple-menu-item logout-link" onClick={handleLogout}>
                      <SignOutIcon size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link to="/login" className="apple-btn-pill apple-btn-pill-secondary apple-btn-pill-sm">
                  Sign In
                </Link>
              </div>
            )}

            {/* Cart Bag */}
            <Link to="/cart" className="apple-cart-btn" aria-label="Shopping Bag">
              <span className="apple-bag-icon">
                <BagIcon size={17} />
              </span>
              {totalItems > 0 && <span className="apple-cart-badge">{totalItems}</span>}
            </Link>
          </div>
        </div>
      </header>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="modal-backdrop" onClick={() => setShowLocationModal(false)}>
          <div className="product-modal-card" style={{ maxWidth: '480px', padding: '32px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-brand-row">
              <span className="modal-brand">Delivery Location</span>
              <button className="modal-close-btn" onClick={() => setShowLocationModal(false)} aria-label="Close">
                <CloseIcon size={12} />
              </button>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Select Delivery Zone</h3>
            <p style={{ fontSize: '13.5px', color: '#6e6e73', marginBottom: '20px' }}>
              ShopSphere delivers to all zones across Greater Hyderabad & Cyberabad Metro with express 3-4 day dispatch.
            </p>

            <form onSubmit={handleSaveLocation}>
              <div className="apple-form-group">
                <label className="apple-form-label">City / Operating Zone</label>
                <select
                  value={tempCity}
                  onChange={(e) => setTempCity(e.target.value)}
                  className="apple-form-select"
                >
                  <option value="Hyderabad">Hyderabad (All Zones)</option>
                  <option value="Hitec City, Hyderabad">Hitec City / Madhapur</option>
                  <option value="Gachibowli, Hyderabad">Gachibowli / Financial Dist</option>
                  <option value="Banjara Hills, Hyderabad">Banjara Hills / Jubilee Hills</option>
                  <option value="Secunderabad">Secunderabad</option>
                  <option value="Kukatpally, Hyderabad">Kukatpally / Miyapur</option>
                </select>
              </div>

              <div className="apple-form-group">
                <label className="apple-form-label">PIN Code</label>
                <input
                  type="text"
                  value={tempPin}
                  onChange={(e) => setTempPin(e.target.value)}
                  className="apple-form-input"
                  placeholder="500081"
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button type="button" className="apple-btn-pill apple-btn-pill-secondary" style={{ flex: 1 }} onClick={() => setShowLocationModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="apple-btn-pill apple-btn-pill-primary" style={{ flex: 1 }}>
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Become a Seller Modal */}
      {showSellerModal && (
        <BecomeSellerModal
          onClose={() => setShowSellerModal(false)}
          onSellerRegistered={() => {
            setShowSellerModal(false)
            navigate('/seller')
          }}
        />
      )}
    </>
  )
}
