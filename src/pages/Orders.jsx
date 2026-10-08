import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { useCurrency } from '../context/CurrencyContext.jsx'
import {
  LogoIcon,
  OrderBoxIcon,
  LocationPinIcon,
  PhoneIcon,
  StoreIcon,
  CheckIcon,
} from '../components/Icons.jsx'
import api from '../api.js'

export default function Orders() {
  const { formatPrice } = useCurrency()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    setLoading(true)
    try {
      const res = await api.get('/orders/my-orders')
      setOrders(res.data || [])
    } catch (err) {
      console.error('Failed to load orders:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="apple-page-wrapper">
      <Navbar />

      <main className="apple-main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '36px', fontWeight: '700', letterSpacing: '-0.035em', color: '#1d1d1f', marginBottom: '4px' }}>
              Your Orders
            </h1>
            <p style={{ fontSize: '14px', color: '#6e6e73' }}>
              Track parcel dispatches and delivery timelines across Hyderabad.
            </p>
          </div>
          <Link to="/home" className="apple-btn-pill apple-btn-pill-secondary apple-btn-pill-sm">
            Continue Shopping ›
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#6e6e73' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <LogoIcon size={32} />
            </div>
            <p>Loading your orders…</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ background: '#ffffff', borderRadius: '24px', padding: '60px 32px', textAlign: 'center', border: '1px solid #e5e5ea', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px', color: '#1d1d1f' }}>
              <OrderBoxIcon size={44} />
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#1d1d1f', marginBottom: '8px' }}>No Orders Placed Yet</h3>
            <p style={{ color: '#6e6e73', marginBottom: '24px' }}>You haven't placed any orders yet. Discover items from verified Hyderabad merchants.</p>
            <Link to="/home" className="apple-btn-pill apple-btn-pill-primary apple-btn-pill-lg">
              Explore Store ›
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {orders.map((order) => (
              <div key={order.id} style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e5e5ea', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #f0f0f4', paddingBottom: '16px', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#86868b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>ORDER #{order.id}</span>
                    <div style={{ fontSize: '13px', color: '#6e6e73', marginTop: '2px' }}>
                      Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#1d1d1f' }}>{formatPrice(order.totalAmount)}</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#1d1d1f', background: '#f0f0f2', padding: '4px 10px', borderRadius: '980px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckIcon size={12} /> {order.status}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '13px', color: '#6e6e73', background: '#fafafc', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <LocationPinIcon size={13} /> <strong>Delivering to:</strong> {order.shippingAddress}
                  </span>
                  <span>•</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <PhoneIcon size={13} /> {order.contactPhone}
                  </span>
                  <span>•</span>
                  <strong style={{ color: '#1d1d1f' }}>Express 3-4 days dispatch</strong>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {order.items &&
                    order.items.map((item, idx) => (
                      <div key={item.id || idx} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <img
                          src={item.product?.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80'}
                          alt={item.product?.name}
                          style={{ width: '70px', height: '70px', objectFit: 'contain', background: '#fafafc', borderRadius: '12px', padding: '6px' }}
                        />
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#1d1d1f', marginBottom: '2px' }}>{item.product?.name}</h4>
                          <span style={{ fontSize: '12.5px', color: '#6e6e73', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <StoreIcon size={12} /> Dispatched by: {item.store?.name || 'Verified Store'} ({item.store?.distanceKm || 2.3} km)
                          </span>
                          <div style={{ fontSize: '13px', fontWeight: '500', color: '#1d1d1f', marginTop: '4px' }}>
                            Qty: {item.quantity} × {formatPrice(item.price)}
                          </div>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#1d1d1f', background: '#f0f0f2', padding: '4px 10px', borderRadius: '980px' }}>
                          {item.parcelStatus || 'DISPATCH READY'}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

