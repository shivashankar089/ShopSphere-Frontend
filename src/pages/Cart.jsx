import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useCurrency } from '../context/CurrencyContext.jsx'
import { BagIcon, LocationPinIcon, CheckIcon, StoreIcon } from '../components/Icons.jsx'
import api from '../api.js'

export default function Cart() {
  const navigate = useNavigate()
  const { cart, updateQuantity, removeFromCart, clearCart, totalPrice, groupedByStore } = useCart()
  const { formatPrice, isDeliverable, city: defaultCity, pincode: defaultPincode } = useCurrency()
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  const [checkoutStep, setCheckoutStep] = useState(1) // 1: Review, 2: Address, 3: Payment
  const [addressForm, setAddressForm] = useState({
    fullName: user?.name || 'Shivashankar',
    phone: user?.phone || '+91 98490 12345',
    street: 'Flat 402, Cyber Heights, Road No. 36, Jubilee Hills',
    city: defaultCity || 'Hyderabad',
    state: 'Telangana',
    pincode: defaultPincode || '500033',
    landmark: 'Near Cyber Towers',
  })

  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const serviceable = isDeliverable(addressForm.city, addressForm.pincode)
  const updateAddr = (k) => (e) => setAddressForm({ ...addressForm, [k]: e.target.value })

  async function handlePlaceOrder(e) {
    if (e) e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }
    if (!serviceable) {
      setError('Please provide a deliverable address within Hyderabad & Cyberabad Metro boundaries.')
      return
    }
    if (cart.length === 0) return

    setSubmitting(true)
    setError('')
    try {
      const fullShippingAddress = `${addressForm.fullName}, ${addressForm.street}, ${addressForm.landmark ? addressForm.landmark + ', ' : ''}${addressForm.city}, ${addressForm.state} - ${addressForm.pincode}`
      const items = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }))

      await api.post('/orders', {
        shippingAddress: fullShippingAddress,
        contactPhone: addressForm.phone,
        paymentMethod,
        items,
      })

      clearCart()
      navigate('/orders')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="apple-page-wrapper">
        <Navbar />
        <main style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center', background: '#ffffff', borderRadius: '24px', padding: '60px 40px', border: '1px solid #e5e5ea', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: '#1d1d1f' }}>
            <BagIcon size={52} />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '-0.03em', marginBottom: '8px', color: '#1d1d1f' }}>
            Your Bag is empty.
          </h2>
          <p style={{ fontSize: '15px', color: '#6e6e73', marginBottom: '28px' }}>
            Explore verified Hyderabad merchant stores and discover amazing products.
          </p>
          <Link to="/home" className="apple-btn-pill apple-btn-pill-primary apple-btn-pill-lg">
            Continue Shopping ›
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="apple-page-wrapper">
      <Navbar />

      <main className="apple-cart-page">
        {/* Apple Stepper Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <h1 className="apple-cart-title" style={{ margin: 0 }}>Review your Bag.</h1>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className={`apple-tab-btn ${checkoutStep === 1 ? 'active' : ''}`}
              onClick={() => setCheckoutStep(1)}
            >
              1. Review Items
            </button>
            <button
              className={`apple-tab-btn ${checkoutStep === 2 ? 'active' : ''}`}
              onClick={() => setCheckoutStep(2)}
            >
              2. Shipping Address
            </button>
            <button
              className={`apple-tab-btn ${checkoutStep === 3 ? 'active' : ''}`}
              onClick={() => setCheckoutStep(3)}
            >
              3. Payment
            </button>
          </div>
        </div>

        {error && (
          <div className="apple-alert-error" style={{ marginBottom: '24px' }}>
            {error}
          </div>
        )}

        <div className="apple-cart-layout">
          {/* Left Column: Items or Checkout Forms */}
          <div>
            {checkoutStep === 1 && (
              <div>
                {groupedByStore.map((group, gIdx) => (
                  <div key={group.storeId || gIdx} style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e5e5ea', padding: '24px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid #f0f0f4', paddingBottom: '14px', marginBottom: '18px' }}>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#1d1d1f', letterSpacing: '0.06em' }}>
                          SHIPMENT {gIdx + 1} OF {groupedByStore.length}
                        </span>
                        <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1d1d1f', margin: '4px 0 2px' }}>
                          {group.storeName}
                        </h3>
                        <span style={{ fontSize: '12.5px', color: '#6e6e73', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <LocationPinIcon size={13} /> {group.distanceKm} km away • Express 3-4 day delivery
                        </span>
                      </div>
                      <Link to={`/store/${group.storeId}`} style={{ fontSize: '13px', color: '#1d1d1f', fontWeight: '500' }}>
                        Store catalog ›
                      </Link>
                    </div>

                    {group.items.map((item) => (
                      <div key={item.product.id} className="apple-cart-item-card" style={{ border: 'none', padding: '12px 0', borderBottom: '1px solid #f5f5f7' }}>
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="apple-cart-item-img"
                        />
                        <div className="apple-cart-item-info">
                          <div>
                            <h4 className="apple-cart-item-title">{item.product.name}</h4>
                            <span className="apple-cart-item-store">{item.product.brand || 'ShopSphere'}</span>
                          </div>

                          <div className="apple-cart-item-price-row">
                            <div className="qty-controls">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              >
                                -
                              </button>
                              <span className="qty-val">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                disabled={item.quantity >= item.product.stock}
                              >
                                +
                              </button>
                            </div>

                            <span className="apple-cart-price">
                              {formatPrice(item.product.price * item.quantity)}
                            </span>

                            <button
                              type="button"
                              className="apple-cart-remove-btn"
                              onClick={() => removeFromCart(item.product.id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {checkoutStep === 2 && (
              <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e5e5ea', padding: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>Where should we deliver?</h3>
                <p style={{ fontSize: '13.5px', color: '#6e6e73', marginBottom: '24px' }}>
                  Enter your address in Greater Hyderabad for multi-vendor direct dispatch.
                </p>

                <div className="apple-form-group">
                  <label className="apple-form-label">Full Name</label>
                  <input
                    type="text"
                    className="apple-form-input"
                    value={addressForm.fullName}
                    onChange={updateAddr('fullName')}
                    required
                  />
                </div>

                <div className="apple-form-row-2">
                  <div className="apple-form-group">
                    <label className="apple-form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="apple-form-input"
                      value={addressForm.phone}
                      onChange={updateAddr('phone')}
                      required
                    />
                  </div>
                  <div className="apple-form-group">
                    <label className="apple-form-label">PIN Code</label>
                    <input
                      type="text"
                      className="apple-form-input"
                      value={addressForm.pincode}
                      onChange={updateAddr('pincode')}
                      required
                    />
                  </div>
                </div>

                <div className="apple-form-group">
                  <label className="apple-form-label">Street Address & Flat / Building</label>
                  <input
                    type="text"
                    className="apple-form-input"
                    value={addressForm.street}
                    onChange={updateAddr('street')}
                    required
                  />
                </div>

                <div className="apple-form-row-2">
                  <div className="apple-form-group">
                    <label className="apple-form-label">City / Region</label>
                    <input
                      type="text"
                      className="apple-form-input"
                      value={addressForm.city}
                      onChange={updateAddr('city')}
                      required
                    />
                  </div>
                  <div className="apple-form-group">
                    <label className="apple-form-label">Landmark</label>
                    <input
                      type="text"
                      className="apple-form-input"
                      value={addressForm.landmark}
                      onChange={updateAddr('landmark')}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="apple-btn-pill apple-btn-pill-primary apple-btn-pill-lg"
                  style={{ width: '100%', marginTop: '12px' }}
                  onClick={() => setCheckoutStep(3)}
                >
                  Continue to Payment ›
                </button>
              </div>
            )}

            {checkoutStep === 3 && (
              <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e5e5ea', padding: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '6px' }}>Select Payment Method</h3>
                <p style={{ fontSize: '13.5px', color: '#6e6e73', marginBottom: '24px' }}>
                  All transactions are secured with enterprise 256-bit encryption.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                  {['UPI', 'Credit / Debit Card', 'Net Banking', 'Cash on Delivery'].map((m) => (
                    <label
                      key={m}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '16px 20px',
                        borderRadius: '14px',
                        border: paymentMethod === m ? '2px solid #000000' : '1px solid #e5e5ea',
                        background: paymentMethod === m ? '#f5f5f7' : '#ffffff',
                        cursor: 'pointer',
                        fontWeight: paymentMethod === m ? '600' : '400',
                      }}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === m}
                        onChange={() => setPaymentMethod(m)}
                        style={{ accentColor: '#000000' }}
                      />
                      <span>{m}</span>
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  className="apple-checkout-btn"
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                >
                  {submitting ? 'Placing Order…' : `Place Order • ${formatPrice(totalPrice)}`}
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary Card */}
          <div>
            <div className="apple-summary-card">
              <h2 className="apple-summary-title">Order Summary</h2>

              <div className="apple-summary-row">
                <span>Items Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>

              <div className="apple-summary-row">
                <span>Estimated Shipping</span>
                <span style={{ color: '#1d1d1f', fontWeight: '600' }}>FREE</span>
              </div>

              <div className="apple-summary-row">
                <span>Applicable GST / Taxes</span>
                <span>Included</span>
              </div>

              <div className="apple-summary-row total-row">
                <span>Total</span>
                <span style={{ fontSize: '22px', color: '#1d1d1f' }}>{formatPrice(totalPrice)}</span>
              </div>

              {checkoutStep === 1 && (
                <button
                  type="button"
                  className="apple-checkout-btn"
                  onClick={() => {
                    if (!user) {
                      navigate('/login')
                    } else {
                      setCheckoutStep(2)
                    }
                  }}
                >
                  Check Out ›
                </button>
              )}

              <div style={{ marginTop: '20px', fontSize: '12.5px', color: '#6e6e73', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <CheckIcon size={13} /> 100% genuine verified products
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <CheckIcon size={13} /> 3-4 day express dispatch across Hyderabad
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <CheckIcon size={13} /> Free 7-day hassle-free returns
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
