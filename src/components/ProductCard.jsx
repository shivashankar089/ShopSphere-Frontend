import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useCurrency } from '../context/CurrencyContext.jsx'
import { StarIcon } from './Icons.jsx'

export default function ProductCard({ product, onSelectProduct }) {
  const { addToCart, cart } = useCart()
  const { formatPrice } = useCurrency()

  const discountPercent =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null

  const cartItem = cart.find((i) => i.product.id === product.id)
  const qtyInCart = cartItem ? cartItem.quantity : 0

  return (
    <article className="apple-product-card">
      {/* Product Image Clickable to Open Detail Modal */}
      <div
        className="apple-card-image-box"
        onClick={() => onSelectProduct && onSelectProduct(product)}
        role="button"
        tabIndex={0}
        aria-label={`View details for ${product.name}`}
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="apple-card-img"
          loading="lazy"
        />
        {discountPercent && (
          <span className="apple-discount-pill">{discountPercent}% OFF</span>
        )}
      </div>

      <div className="apple-card-info">
        {/* Brand & Store Origin */}
        <div className="apple-card-brand-row">
          <span className="apple-card-brand-tag">{product.brand || 'ShopSphere'}</span>
          {product.store && (
            <Link
              to={`/store/${product.store.id}`}
              className="apple-card-store-link"
              onClick={(e) => e.stopPropagation()}
              title={`Dispatched by ${product.store.name}`}
            >
              {product.store.name} • {product.store.distanceKm} km
            </Link>
          )}
        </div>

        {/* Product Title */}
        <h3
          className="apple-card-title"
          onClick={() => onSelectProduct && onSelectProduct(product)}
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Customer Rating */}
        <div className="apple-card-rating-line">
          <span className="apple-rating-stars" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <StarIcon size={12} filled />
            {product.rating ? product.rating.toFixed(1) : '4.8'}
          </span>
          <span>({product.reviewCount || 68} reviews)</span>
        </div>

        {/* Pricing Block */}
        <div className="apple-card-pricing">
          <span className="apple-price-current">{formatPrice(product.price)}</span>
          {product.originalPrice > product.price && (
            <span className="apple-price-mrp">{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        {/* Action Button */}
        <div className="apple-card-actions">
          <button
            type="button"
            className="apple-card-add-btn"
            onClick={() => addToCart(product, 1)}
            disabled={product.stock <= 0}
            aria-label={`Add ${product.name} to cart`}
          >
            {product.stock <= 0 ? 'Out of Stock' : qtyInCart > 0 ? `In Bag (${qtyInCart}) +` : '+ Add to Bag'}
          </button>
        </div>
      </div>
    </article>
  )
}
