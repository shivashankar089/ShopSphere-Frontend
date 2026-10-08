import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CloseIcon, CheckIcon, ShieldIcon } from './Icons.jsx'
import api from '../api.js'

export default function BecomeSellerModal({ onClose, onSellerRegistered }) {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  const [step, setStep] = useState(1)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    storeName: user?.name ? `${user.name}'s Official Store` : '',
    category: 'Electronics',
    gstin: '36AAAAA0000A1Z5',
    phone: user?.phone || '+91 98490 12345',
    description: 'Specializing in verified authentic merchandise with direct local warehouse dispatch.',
    address: 'Road No. 36, Jubilee Hills',
    city: 'Hyderabad',
    pincode: '500033',
    distanceKm: 2.5,
    bankAccountNumber: '9182736450192',
    ifscCode: 'HDFC0001234',
    termsAccepted: true,
  })

  const updateField = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.termsAccepted) {
      setError('Please accept the seller terms and anti-malpractice policy.')
      return
    }

    setBusy(true)
    setError('')
    try {
      const res = await api.post('/seller/become-seller', {
        storeName: form.storeName,
        description: form.description,
        address: `${form.address}, ${form.pincode}`,
        city: form.city,
        distanceKm: parseFloat(form.distanceKm) || 2.5,
        phone: form.phone,
        gstin: form.gstin,
        category: form.category,
      })

      if (user) {
        user.role = 'SELLER'
        localStorage.setItem('user', JSON.stringify(user))
      }

      setSuccess(true)
      if (onSellerRegistered) onSellerRegistered(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit seller application.')
    } finally {
      setBusy(false)
    }
  }

  function handleGoToSellerHub() {
    onClose()
    navigate('/seller')
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="product-modal-card" style={{ maxWidth: '640px', padding: '36px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#1d1d1f', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              MERCHANT BUSINESS REGISTRATION
            </span>
            <h2 style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.025em', color: '#1d1d1f', margin: '4px 0 6px' }}>
              Register as a Merchant
            </h2>
            <p style={{ fontSize: '13.5px', color: '#6e6e73' }}>
              Onboard your Hyderabad retail store to reach thousands of customers with direct warehouse fulfillment.
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <CloseIcon size={12} />
          </button>
        </div>

        {error && (
          <div className="apple-alert-error" style={{ marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', color: '#1d1d1f' }}>
              <CheckIcon size={44} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Merchant Application Submitted</h3>
            <p style={{ fontSize: '14px', color: '#6e6e73', maxWidth: '440px', margin: '0 auto 24px', lineHeight: '1.45' }}>
              Your store (<strong>{form.storeName}</strong>) has been registered. The Administrator will review and verify your license details.
            </p>
            <button className="apple-btn-pill apple-btn-pill-primary apple-btn-pill-lg" onClick={handleGoToSellerHub}>
              Open Merchant Portal ›
            </button>
          </div>
        ) : (
          <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); setStep(step + 1) }}>
            {step === 1 && (
              <div>
                <div className="apple-form-group">
                  <label className="apple-form-label">Store / Business Name *</label>
                  <input
                    type="text"
                    className="apple-form-input"
                    required
                    placeholder="e.g. Apex Tech & Electronics"
                    value={form.storeName}
                    onChange={updateField('storeName')}
                  />
                </div>

                <div className="apple-form-row-2">
                  <div className="apple-form-group">
                    <label className="apple-form-label">Primary Category *</label>
                    <select className="apple-form-select" value={form.category} onChange={updateField('category')}>
                      <option value="Electronics">Electronics & Computing</option>
                      <option value="Gaming">Gaming & Consoles</option>
                      <option value="Groceries">Groceries & Gourmet</option>
                      <option value="Home & Living">Home & Living</option>
                      <option value="Health & Fitness">Health & Fitness</option>
                      <option value="Handmade & Artisan">Handmade & Artisan</option>
                      <option value="Beauty & Care">Beauty & Personal Care</option>
                      <option value="Fashion">Fashion & Apparel</option>
                      <option value="Books & Stationery">Books & Stationery</option>
                    </select>
                  </div>

                  <div className="apple-form-group">
                    <label className="apple-form-label">GSTIN / Business Tax ID *</label>
                    <input
                      type="text"
                      className="apple-form-input"
                      required
                      placeholder="e.g. 36AAAAA0000A1Z5"
                      value={form.gstin}
                      onChange={updateField('gstin')}
                    />
                  </div>
                </div>

                <div className="apple-form-group">
                  <label className="apple-form-label">Store Description</label>
                  <textarea
                    rows={2}
                    className="apple-form-input"
                    style={{ height: 'auto', padding: '12px 16px' }}
                    placeholder="Describe your retail catalog and specialties..."
                    value={form.description}
                    onChange={updateField('description')}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                  <button type="button" className="apple-btn-pill apple-btn-pill-secondary" style={{ flex: 1 }} onClick={onClose}>
                    Cancel
                  </button>
                  <button type="submit" className="apple-btn-pill apple-btn-pill-primary" style={{ flex: 1 }}>
                    Next: Location Details ›
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div className="apple-form-group">
                  <label className="apple-form-label">Warehouse / Store Street Address *</label>
                  <input
                    type="text"
                    className="apple-form-input"
                    required
                    placeholder="e.g. Unit 402, Cyber Towers, Madhapur"
                    value={form.address}
                    onChange={updateField('address')}
                  />
                </div>

                <div className="apple-form-row-2">
                  <div className="apple-form-group">
                    <label className="apple-form-label">City / Zone</label>
                    <input
                      type="text"
                      className="apple-form-input"
                      required
                      value={form.city}
                      onChange={updateField('city')}
                    />
                  </div>
                  <div className="apple-form-group">
                    <label className="apple-form-label">PIN Code</label>
                    <input
                      type="text"
                      className="apple-form-input"
                      required
                      placeholder="500081"
                      value={form.pincode}
                      onChange={updateField('pincode')}
                    />
                  </div>
                </div>

                <div className="apple-form-group">
                  <label className="apple-form-label">Merchant Contact Phone *</label>
                  <input
                    type="tel"
                    className="apple-form-input"
                    required
                    placeholder="+91 98490 12345"
                    value={form.phone}
                    onChange={updateField('phone')}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                  <button type="button" className="apple-btn-pill apple-btn-pill-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>
                    ‹ Back
                  </button>
                  <button type="submit" className="apple-btn-pill apple-btn-pill-primary" style={{ flex: 1 }}>
                    Next: Verification & Compliance ›
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="apple-form-row-2">
                  <div className="apple-form-group">
                    <label className="apple-form-label">Bank Account Number *</label>
                    <input
                      type="text"
                      className="apple-form-input"
                      required
                      value={form.bankAccountNumber}
                      onChange={updateField('bankAccountNumber')}
                    />
                  </div>
                  <div className="apple-form-group">
                    <label className="apple-form-label">IFSC Code *</label>
                    <input
                      type="text"
                      className="apple-form-input"
                      required
                      value={form.ifscCode}
                      onChange={updateField('ifscCode')}
                    />
                  </div>
                </div>

                <div style={{ background: '#fafafc', border: '1px solid #e5e5ea', borderRadius: '14px', padding: '18px', margin: '20px 0' }}>
                  <h4 style={{ fontSize: '13.5px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldIcon size={16} /> Seller Quality & Compliance Standards
                  </h4>
                  <ul style={{ fontSize: '12.5px', color: '#6e6e73', paddingLeft: '18px', lineHeight: '1.5', marginBottom: '14px' }}>
                    <li>100% genuine and authentic merchandise only.</li>
                    <li>Strict prohibition against illegal or restricted substances.</li>
                    <li>All products undergo automated safety scanning and Admin review.</li>
                  </ul>
                  <label style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '12.5px', color: '#1d1d1f', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.termsAccepted}
                      onChange={(e) => setForm({ ...form, termsAccepted: e.target.checked })}
                      required
                      style={{ marginTop: '2px', accentColor: '#1d1d1f' }}
                    />
                    <span>I declare that all business information is authentic and agree to terms.</span>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" className="apple-btn-pill apple-btn-pill-secondary" style={{ flex: 1 }} onClick={() => setStep(2)}>
                    ‹ Back
                  </button>
                  <button type="submit" className="apple-btn-pill apple-btn-pill-primary" style={{ flex: 1 }} disabled={busy}>
                    {busy ? 'Submitting Application…' : 'Submit Application'}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
