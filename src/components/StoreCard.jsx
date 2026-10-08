import { Link } from 'react-router-dom'
import { LocationPinIcon, StoreIcon, StarIcon } from './Icons.jsx'

export default function StoreCard({ store }) {
  return (
    <div className="apple-store-card">
      <div>
        <div className="apple-store-dist-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <LocationPinIcon size={12} />
          <span>{store.distanceKm} km away • {store.city}</span>
        </div>
        <h4 className="apple-store-name">{store.name}</h4>
        <p className="apple-store-desc">{store.description || 'Authorized independent retailer with verified local fulfillment.'}</p>
        <div style={{ fontSize: '12.5px', color: '#6e6e73', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <StoreIcon size={13} />
          <span>{store.address}</span>
        </div>
      </div>

      <div className="apple-store-meta">
        <span style={{ color: '#1d1d1f', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <StarIcon size={13} filled />
          <span>{store.rating ? store.rating.toFixed(1) : '4.8'}</span>
        </span>
        <Link to={`/store/${store.id}`} className="apple-btn-pill apple-btn-pill-primary apple-btn-pill-sm">
          Visit Store ›
        </Link>
      </div>
    </div>
  )
}
