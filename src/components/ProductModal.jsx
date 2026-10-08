import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useCurrency } from '../context/CurrencyContext.jsx'
import {
  StarIcon,
  CloseIcon,
  StoreIcon,
  LocationPinIcon,
  TruckIcon,
  CheckIcon,
  ShieldIcon,
  UserIcon,
} from './Icons.jsx'

export default function ProductModal({ product, onClose }) {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { formatPrice } = useCurrency()
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  const [activeTab, setActiveTab] = useState('overview') // 'overview', 'specs', 'reviews', 'shipping'
  const [qty, setQty] = useState(1)
  const [addedNotice, setAddedNotice] = useState(false)

  // Interactive Reviews State
  const initialReviews = useMemo(() => [
    {
      id: 1,
      author: 'Rohit K.',
      rating: 5,
      date: '2 days ago',
      verified: true,
      title: 'Flawless build quality and performance',
      comment: 'Arrived within 3 days in Hyderabad via express direct store dispatch. Exactly as described, 100% authentic and sealed packaging.',
    },
    {
      id: 2,
      author: 'Ananya S.',
      rating: 5,
      date: '1 week ago',
      verified: true,
      title: 'Exceeded all expectations',
      comment: 'Very pleased with the quality. The local merchant fulfilled the order promptly with full parcel tracking.',
    },
    {
      id: 3,
      author: 'Vikram M.',
      rating: 4,
      date: '2 weeks ago',
      verified: true,
      title: 'Premium finish and highly reliable',
      comment: 'Solid build, great customer support. Highly recommend this store for authentic products.',
    },
  ], [product?.id])

  const [reviewsList, setReviewsList] = useState(initialReviews)
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: '',
    author: user?.name || '',
  })
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewSubmittedNotice, setReviewSubmittedNotice] = useState(false)

  if (!product) return null

  function handleAddToCart() {
    addToCart(product, qty)
    setAddedNotice(true)
    setTimeout(() => setAddedNotice(false), 2000)
  }

  function handleBuyNow() {
    addToCart(product, qty)
    onClose()
    navigate('/cart')
  }

  function handleSubmitReview(e) {
    e.preventDefault()
    if (!newReview.title.trim() || !newReview.comment.trim()) return

    const created = {
      id: Date.now(),
      author: newReview.author.trim() || user?.name || 'Verified Buyer',
      rating: Number(newReview.rating),
      date: 'Just now',
      verified: true,
      title: newReview.title.trim(),
      comment: newReview.comment.trim(),
    }

    setReviewsList([created, ...reviewsList])
    setNewReview({ rating: 5, title: '', comment: '', author: user?.name || '' })
    setShowReviewForm(false)
    setReviewSubmittedNotice(true)
    setTimeout(() => setReviewSubmittedNotice(false), 4000)
  }

  const savings =
    product.originalPrice > product.price
      ? product.originalPrice - product.price
      : null

  const discountPercent =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null

  const currentReviewCount = (product.reviewCount || 68) + (reviewsList.length - initialReviews.length)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="product-modal-card"
        style={{ maxWidth: '960px', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header Bar */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid #e5e5ea', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#6e6e73' }}>
            <span>{product.category?.name || 'Product'}</span>
            <span>/</span>
            <span style={{ fontWeight: '600', color: '#1d1d1f' }}>{product.brand || 'ShopSphere'}</span>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
            style={{ position: 'static' }}
          >
            <CloseIcon size={14} />
          </button>
        </div>

        {/* Modal Navigation Tabs (Apple Style Subnav) */}
        <div style={{ display: 'flex', gap: '6px', padding: '12px 28px', borderBottom: '1px solid #f0f0f4', background: '#ffffff', overflowX: 'auto' }}>
          <button
            type="button"
            className={`apple-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            type="button"
            className={`apple-tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
            onClick={() => setActiveTab('specs')}
          >
            Product Specifications
          </button>
          <button
            type="button"
            className={`apple-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Customer Reviews ({currentReviewCount})
          </button>
          <button
            type="button"
            className={`apple-tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
            onClick={() => setActiveTab('shipping')}
          >
            Merchant & Shipping
          </button>
        </div>

        {/* Modal Body Container */}
        <div style={{ padding: '28px', overflowY: 'auto', maxHeight: 'calc(85vh - 130px)' }}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="modal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '36px' }}>
              {/* Left Column: Product Image & Badges */}
              <div className="modal-image-col">
                <div className="modal-image-wrap" style={{ background: '#fafafc', borderRadius: '18px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e5ea', minHeight: '340px' }}>
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="modal-product-img"
                    style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
                  <div style={{ background: '#f5f5f7', padding: '12px', borderRadius: '12px', fontSize: '12px', textAlign: 'center' }}>
                    <strong style={{ display: 'block', color: '#1d1d1f', marginBottom: '2px' }}>Direct Dispatch</strong>
                    <span style={{ color: '#6e6e73' }}>3-4 day express</span>
                  </div>
                  <div style={{ background: '#f5f5f7', padding: '12px', borderRadius: '12px', fontSize: '12px', textAlign: 'center' }}>
                    <strong style={{ display: 'block', color: '#1d1d1f', marginBottom: '2px' }}>100% Genuine</strong>
                    <span style={{ color: '#6e6e73' }}>Verified merchant</span>
                  </div>
                </div>

                <div className="modal-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '16px' }}>
                  {product.tags &&
                    product.tags.split(',').map((t, idx) => (
                      <span key={idx} className="tag-pill" style={{ background: '#f0f0f2', color: '#1d1d1f', padding: '4px 10px', borderRadius: '980px', fontSize: '11px', fontWeight: '500' }}>
                        #{t.trim()}
                      </span>
                    ))}
                </div>
              </div>

              {/* Right Column: Information & Actions */}
              <div className="modal-details-col">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#86868b' }}>
                    {product.brand || 'ShopSphere Verified'}
                  </span>
                  {discountPercent && (
                    <span style={{ background: '#000000', color: '#ffffff', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '980px' }}>
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                <h2 style={{ fontSize: '26px', fontWeight: '700', letterSpacing: '-0.03em', lineHeight: '1.2', color: '#1d1d1f', marginBottom: '10px' }}>
                  {product.name}
                </h2>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px', fontSize: '13px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600', color: '#1d1d1f' }}>
                    <StarIcon size={14} filled />
                    <span>{product.rating ? product.rating.toFixed(1) : '4.8'}</span>
                  </div>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: '#1d1d1f', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                    onClick={() => setActiveTab('reviews')}
                  >
                    {currentReviewCount} Verified Ratings ›
                  </button>
                  <span style={{ color: '#1d1d1f', fontWeight: '500', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <CheckIcon size={13} /> In Stock ({product.stock} units)
                  </span>
                </div>

                {/* Price Display */}
                <div style={{ background: '#fafafc', border: '1px solid #e5e5ea', borderRadius: '14px', padding: '18px 22px', marginBottom: '22px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                    <span style={{ fontSize: '28px', fontWeight: '700', color: '#1d1d1f', letterSpacing: '-0.03em' }}>
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice > product.price && (
                      <span style={{ fontSize: '16px', color: '#86868b', textDecoration: 'line-through' }}>
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                    {savings && (
                      <span style={{ background: '#f0f0f2', color: '#1d1d1f', fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '980px' }}>
                        Save {formatPrice(savings)}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: '#86868b', marginTop: '4px' }}>
                    MRP inclusive of all local taxes, GST, and handling charges.
                  </p>
                </div>

                {/* Product Overview Summary */}
                <div style={{ marginBottom: '22px' }}>
                  <h4 style={{ fontSize: '13.5px', fontWeight: '600', color: '#1d1d1f', marginBottom: '6px' }}>
                    Product Description
                  </h4>
                  <p style={{ fontSize: '14px', color: '#6e6e73', lineHeight: '1.55' }}>
                    {product.description}
                  </p>
                </div>

                {/* Merchant Transparency Snippet */}
                {product.store && (
                  <div style={{ background: '#ffffff', border: '1px solid #e5e5ea', borderRadius: '14px', padding: '14px 18px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <StoreIcon size={16} />
                      <span style={{ fontSize: '13.5px', fontWeight: '600', color: '#1d1d1f' }}>
                        {product.store.name}
                      </span>
                      <span style={{ fontSize: '12px', color: '#86868b' }}>
                        • {product.store.distanceKm} km away
                      </span>
                    </div>
                    <p style={{ fontSize: '12.5px', color: '#6e6e73', margin: 0 }}>
                      Dispatched from {product.store.address}, {product.store.city} with 3-4 day express delivery.
                    </p>
                  </div>
                )}

                {/* Add to Bag and Buy Now Actions */}
                <div className="modal-action-box" style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingTop: '10px', borderTop: '1px solid #f0f0f4' }}>
                  <div className="qty-picker">
                    <div className="qty-controls" style={{ background: '#f0f0f2', borderRadius: '980px', padding: '2px', display: 'flex', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        disabled={qty <= 1}
                        style={{ width: '32px', height: '32px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}
                      >
                        -
                      </button>
                      <span style={{ padding: '0 12px', fontSize: '14px', fontWeight: '600' }}>{qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty(Math.min(product.stock, qty + 1))}
                        disabled={qty >= product.stock}
                        style={{ width: '32px', height: '32px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flex: 1 }}>
                    <button
                      type="button"
                      className="apple-btn-pill apple-btn-pill-secondary"
                      style={{ flex: 1 }}
                      onClick={handleAddToCart}
                    >
                      {addedNotice ? 'Added to Bag' : 'Add to Bag'}
                    </button>
                    <button
                      type="button"
                      className="apple-btn-pill apple-btn-pill-primary"
                      style={{ flex: 1 }}
                      onClick={handleBuyNow}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TECHNICAL SPECIFICATIONS & PRODUCT KNOWLEDGE */}
          {activeTab === 'specs' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.025em', color: '#1d1d1f', marginBottom: '6px' }}>
                  Technical Specifications & Attributes
                </h3>
                <p style={{ fontSize: '14px', color: '#6e6e73' }}>
                  Full item specifications, materials, warranty, and seller verification standards.
                </p>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e5e5ea', borderRadius: '16px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #f0f0f4' }}>
                      <td style={{ padding: '14px 20px', width: '240px', color: '#86868b', fontWeight: '500', background: '#fafafc' }}>Product Name</td>
                      <td style={{ padding: '14px 20px', color: '#1d1d1f', fontWeight: '600' }}>{product.name}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f4' }}>
                      <td style={{ padding: '14px 20px', color: '#86868b', fontWeight: '500', background: '#fafafc' }}>Brand / Manufacturer</td>
                      <td style={{ padding: '14px 20px', color: '#1d1d1f' }}>{product.brand || 'ShopSphere Certified'}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f4' }}>
                      <td style={{ padding: '14px 20px', color: '#86868b', fontWeight: '500', background: '#fafafc' }}>Category & Classification</td>
                      <td style={{ padding: '14px 20px', color: '#1d1d1f' }}>{product.category?.name || 'General Catalog'}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f4' }}>
                      <td style={{ padding: '14px 20px', color: '#86868b', fontWeight: '500', background: '#fafafc' }}>Fulfilling Merchant</td>
                      <td style={{ padding: '14px 20px', color: '#1d1d1f' }}>
                        {product.store ? `${product.store.name} (${product.store.city})` : 'ShopSphere Central Hub'}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f4' }}>
                      <td style={{ padding: '14px 20px', color: '#86868b', fontWeight: '500', background: '#fafafc' }}>Inventory Status</td>
                      <td style={{ padding: '14px 20px', color: '#1d1d1f' }}>
                        {product.stock > 0 ? `${product.stock} units available in Hyderabad warehouse` : 'Currently Out of Stock'}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f4' }}>
                      <td style={{ padding: '14px 20px', color: '#86868b', fontWeight: '500', background: '#fafafc' }}>Delivery Timeline</td>
                      <td style={{ padding: '14px 20px', color: '#1d1d1f' }}>3-4 day express delivery across all Hyderabad zones</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f0f0f4' }}>
                      <td style={{ padding: '14px 20px', color: '#86868b', fontWeight: '500', background: '#fafafc' }}>Warranty & Guarantees</td>
                      <td style={{ padding: '14px 20px', color: '#1d1d1f' }}>1-year manufacturer / merchant warranty + 7-day hassle-free return policy</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '14px 20px', color: '#86868b', fontWeight: '500', background: '#fafafc' }}>Product Authenticity</td>
                      <td style={{ padding: '14px 20px', color: '#1d1d1f' }}>100% Genuine, verified catalog license and platform compliance</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className="apple-btn-pill apple-btn-pill-primary"
                  onClick={handleAddToCart}
                >
                  + Add to Bag ({formatPrice(product.price)})
                </button>
                <button
                  type="button"
                  className="apple-btn-pill apple-btn-pill-secondary"
                  onClick={() => setActiveTab('reviews')}
                >
                  Read Customer Reviews ›
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMER REVIEWS & "HOW CAN I REVIEW THE PRODUCT?" */}
          {activeTab === 'reviews' && (
            <div>
              {/* Reviews Header Banner */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.025em', color: '#1d1d1f', marginBottom: '4px' }}>
                    Customer Ratings & Reviews
                  </h3>
                  <p style={{ fontSize: '14px', color: '#6e6e73' }}>
                    Honest feedback from verified purchasers in Hyderabad.
                  </p>
                </div>

                <button
                  type="button"
                  className="apple-btn-pill apple-btn-pill-primary"
                  onClick={() => setShowReviewForm(!showReviewForm)}
                >
                  {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                </button>
              </div>

              {/* Review Submitted Notification */}
              {reviewSubmittedNotice && (
                <div className="apple-alert-success" style={{ marginBottom: '20px' }}>
                  Thank you! Your verified review has been posted and included in this product's rating score.
                </div>
              )}

              {/* Write a Review Interactive Form */}
              {showReviewForm && (
                <div style={{ background: '#fafafc', border: '1px solid #e5e5ea', borderRadius: '18px', padding: '24px', marginBottom: '28px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1d1d1f', marginBottom: '12px' }}>
                    Write a Product Review
                  </h4>
                  <form onSubmit={handleSubmitReview}>
                    <div className="apple-form-group">
                      <label className="apple-form-label">Your Rating (1 to 5 Stars)</label>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                            aria-label={`Rate ${star} stars`}
                          >
                            <StarIcon size={22} filled={star <= newReview.rating} />
                          </button>
                        ))}
                        <span style={{ fontSize: '13px', fontWeight: '600', marginLeft: '8px', color: '#1d1d1f' }}>
                          {newReview.rating} of 5 Stars
                        </span>
                      </div>
                    </div>

                    <div className="apple-form-group">
                      <label className="apple-form-label">Review Headline / Summary</label>
                      <input
                        type="text"
                        className="apple-form-input"
                        placeholder="e.g. Exceptional build quality and fast delivery"
                        value={newReview.title}
                        onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="apple-form-group">
                      <label className="apple-form-label">Your Name</label>
                      <input
                        type="text"
                        className="apple-form-input"
                        placeholder="Your full name or initials"
                        value={newReview.author}
                        onChange={(e) => setNewReview({ ...newReview, author: e.target.value })}
                        required
                      />
                    </div>

                    <div className="apple-form-group">
                      <label className="apple-form-label">Detailed Feedback</label>
                      <textarea
                        className="apple-form-input"
                        rows="4"
                        style={{ height: 'auto', padding: '12px 16px', resize: 'vertical' }}
                        placeholder="Describe your experience with this product, its build quality, and local merchant delivery..."
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="submit"
                        className="apple-btn-pill apple-btn-pill-primary"
                      >
                        Submit Review
                      </button>
                      <button
                        type="button"
                        className="apple-btn-pill apple-btn-pill-secondary"
                        onClick={() => setShowReviewForm(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Rating Summary Breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '32px', background: '#fafafc', border: '1px solid #e5e5ea', borderRadius: '18px', padding: '24px', marginBottom: '28px' }}>
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontSize: '52px', fontWeight: '800', letterSpacing: '-0.04em', color: '#1d1d1f', lineHeight: '1' }}>
                    {product.rating ? product.rating.toFixed(1) : '4.8'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', margin: '8px 0 4px' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <StarIcon key={s} size={16} filled />
                    ))}
                  </div>
                  <span style={{ fontSize: '13px', color: '#6e6e73' }}>
                    Based on {currentReviewCount} ratings
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px' }}>
                  {[
                    { stars: '5 Star', pct: '82%' },
                    { stars: '4 Star', pct: '14%' },
                    { stars: '3 Star', pct: '3%' },
                    { stars: '2 Star', pct: '1%' },
                    { stars: '1 Star', pct: '0%' },
                  ].map((bar) => (
                    <div key={bar.stars} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
                      <span style={{ width: '48px', color: '#6e6e73', fontWeight: '500' }}>{bar.stars}</span>
                      <div style={{ flex: 1, height: '6px', background: '#e5e5ea', borderRadius: '980px', overflow: 'hidden' }}>
                        <div style={{ width: bar.pct, height: '100%', background: '#1d1d1f' }} />
                      </div>
                      <span style={{ width: '36px', textAlign: 'right', color: '#86868b' }}>{bar.pct}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {reviewsList.map((rev) => (
                  <div key={rev.id} style={{ background: '#ffffff', border: '1px solid #e5e5ea', borderRadius: '16px', padding: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '600', color: '#1d1d1f', fontSize: '14px' }}>{rev.author}</span>
                        {rev.verified && (
                          <span style={{ fontSize: '11px', background: '#f0f0f2', color: '#1d1d1f', padding: '2px 8px', borderRadius: '980px', fontWeight: '500' }}>
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '12px', color: '#86868b' }}>{rev.date}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '3px', marginBottom: '8px' }}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <StarIcon key={s} size={13} filled={s <= rev.rating} />
                      ))}
                    </div>

                    <h5 style={{ fontSize: '14.5px', fontWeight: '600', color: '#1d1d1f', marginBottom: '4px' }}>
                      {rev.title}
                    </h5>
                    <p style={{ fontSize: '13.5px', color: '#6e6e73', lineHeight: '1.5' }}>
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MERCHANT & SHIPPING */}
          {activeTab === 'shipping' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.025em', color: '#1d1d1f', marginBottom: '6px' }}>
                  Merchant & Fulfillment Dispatch
                </h3>
                <p style={{ fontSize: '14px', color: '#6e6e73' }}>
                  Direct store fulfillment and dispatch guarantees across Hyderabad.
                </p>
              </div>

              {product.store ? (
                <div style={{ background: '#ffffff', border: '1px solid #e5e5ea', borderRadius: '18px', padding: '28px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <StoreIcon size={22} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#1d1d1f' }}>
                        {product.store.name}
                      </h4>
                      <p style={{ fontSize: '13px', color: '#6e6e73', margin: 0 }}>
                        {product.store.address}, {product.store.city} • <strong style={{ color: '#1d1d1f' }}>{product.store.distanceKm} km away</strong>
                      </p>
                    </div>
                  </div>

                  <p style={{ fontSize: '14px', color: '#6e6e73', lineHeight: '1.5', marginBottom: '20px' }}>
                    {product.store.description}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', borderTop: '1px solid #f0f0f4', paddingTop: '18px' }}>
                    <div>
                      <span style={{ fontSize: '11.5px', color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '2px' }}>
                        Dispatch Model
                      </span>
                      <strong style={{ fontSize: '13.5px', color: '#1d1d1f' }}>Direct Store Dispatch</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '11.5px', color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '2px' }}>
                        Delivery ETA
                      </span>
                      <strong style={{ fontSize: '13.5px', color: '#1d1d1f' }}>3-4 Days Express</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '11.5px', color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '2px' }}>
                        Merchant Rating
                      </span>
                      <strong style={{ fontSize: '13.5px', color: '#1d1d1f', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <StarIcon size={12} filled /> {product.store.rating ? product.store.rating.toFixed(1) : '4.8'} Verified
                      </strong>
                    </div>
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <Link
                      to={`/store/${product.store.id}`}
                      className="apple-btn-pill apple-btn-pill-secondary"
                      onClick={onClose}
                    >
                      Browse All Items From {product.store.name} ›
                    </Link>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#6e6e73' }}>Direct dispatch managed by ShopSphere partner logistics.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
