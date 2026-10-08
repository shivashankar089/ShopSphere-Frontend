import { Link } from 'react-router-dom'
import { LogoIcon } from '../components/Icons.jsx'

export default function Landing() {
  return (
    <div className="apple-page-wrapper">
      {/* Apple Frosted Navbar */}
      <header className="apple-navbar">
        <div className="apple-nav-container">
          <Link to="/" className="apple-brand">
            <span className="apple-logo-icon">
              <LogoIcon size={18} />
            </span>
            <span className="apple-brand-name">ShopSphere</span>
          </Link>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/login" className="apple-btn-pill apple-btn-pill-secondary apple-btn-pill-sm">
              Sign In
            </Link>
            <Link to="/register" className="apple-btn-pill apple-btn-pill-primary apple-btn-pill-sm">
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ maxWidth: '1080px', margin: '0 auto', padding: '80px 24px 60px', textAlign: 'center' }}>
        <span style={{ display: 'inline-block', fontSize: '12px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#0071e3', background: '#f0f7ff', padding: '6px 14px', borderRadius: '980px', marginBottom: '20px' }}>
          Next-Gen Commerce Platform
        </span>

        <h1 style={{ fontSize: '56px', fontWeight: '700', letterSpacing: '-0.04em', lineHeight: '1.08', color: '#1d1d1f', marginBottom: '20px' }}>
          Discover products you love.<br />
          <span style={{ color: '#86868b' }}>Fulfilled by verified local merchants.</span>
        </h1>

        <p style={{ fontSize: '19px', color: '#6e6e73', lineHeight: '1.5', maxWidth: '680px', margin: '0 auto 36px', letterSpacing: '-0.015em' }}>
          Shop hundreds of curated products across Electronics, Gaming, Groceries, Home & Living, Health, Handmade crafts, and Fashion with 3-4 day express delivery across Hyderabad.
        </p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '60px' }}>
          <Link to="/home" className="apple-btn-pill apple-btn-pill-primary apple-btn-pill-lg">
            Explore Store
          </Link>
          <Link to="/register" className="apple-btn-pill apple-btn-pill-secondary apple-btn-pill-lg">
            Create Account
          </Link>
        </div>

        {/* 3 Showcase Tiles (Inspired by Apple.com) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', textAlign: 'left' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e5e5ea', borderRadius: '24px', padding: '36px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#0071e3', letterSpacing: '0.05em' }}>VERIFIED MERCHANTS</span>
            <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#1d1d1f', margin: '8px 0 10px' }}>Direct Store Dispatch</h3>
            <p style={{ fontSize: '14px', color: '#6e6e73', lineHeight: '1.45' }}>
              Authorized independent retailers in Hitec City, Jubilee Hills, and Banjara Hills ship directly with parcel tracking.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e5e5ea', borderRadius: '24px', padding: '36px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#0071e3', letterSpacing: '0.05em' }}>MULTI-VENDOR CART</span>
            <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#1d1d1f', margin: '8px 0 10px' }}>Seamless Split Orders</h3>
            <p style={{ fontSize: '14px', color: '#6e6e73', lineHeight: '1.45' }}>
              Combine items from multiple stores into a single checkout with itemized delivery schedules and transparent receipts.
            </p>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e5e5ea', borderRadius: '24px', padding: '36px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#0071e3', letterSpacing: '0.05em' }}>SAFETY GOVERNANCE</span>
            <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#1d1d1f', margin: '8px 0 10px' }}>100% Genuine Items</h3>
            <p style={{ fontSize: '14px', color: '#6e6e73', lineHeight: '1.45' }}>
              Every merchant license and listed product undergoes admin governance and catalog compliance screening.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
