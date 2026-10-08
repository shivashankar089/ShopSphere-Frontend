import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useCurrency } from '../context/CurrencyContext.jsx'
import { LogoIcon } from '../components/Icons.jsx'
import api from '../api.js'

export default function Auth({ mode }) {
  const isRegister = mode === 'register'
  const navigate = useNavigate()
  const location = useLocation()
  const { updateLocation } = useCurrency()

  const [form, setForm] = useState({
    name: '',
    email: location.state?.email || '',
    password: '',
    confirmPassword: '',
    country: 'India',
    city: 'Hyderabad',
    pincode: '500081',
    phone: '',
  })
  const [error, setError] = useState('')
  const [successNotice, setSuccessNotice] = useState(
    location.state?.registeredSuccess
      ? 'Account created successfully. Please sign in with your credentials.'
      : ''
  )
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (location.state?.registeredSuccess) {
      setSuccessNotice('Account created successfully. Please sign in with your credentials.')
      if (location.state.email) {
        setForm((prev) => ({ ...prev, email: location.state.email }))
      }
    }
  }, [location.state])

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  async function submit(e) {
    if (e) e.preventDefault()
    setError('')
    setSuccessNotice('')

    if (isRegister && form.confirmPassword && form.password !== form.confirmPassword) {
      setError('Passwords do not match. Please verify.')
      return
    }

    setBusy(true)

    try {
      if (isRegister) {
        // Register customer account in backend
        await api.post('/auth/register', {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          country: form.country,
          city: form.city,
          pincode: form.pincode,
          phone: form.phone,
          role: 'CUSTOMER',
        })

        // CRITICAL FIX: After registration, ALWAYS redirect directly to Login page with notification
        navigate('/login', {
          state: {
            registeredSuccess: true,
            email: form.email.trim(),
          },
        })
      } else {
        // Sign in flow for Customer, Merchant / Seller, and Platform Admin
        const { data } = await api.post('/auth/login', {
          email: form.email.trim(),
          password: form.password,
        })

        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data))
        updateLocation(data.country || 'India', data.city || 'Hyderabad', data.pincode || '500081')

        // Route based on authenticated role
        if (data.role === 'SELLER') {
          navigate('/seller')
        } else if (data.role === 'ADMIN') {
          navigate('/admin')
        } else {
          navigate('/home')
        }
      }
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to the server. It may be waking up, so please try again in a minute.')
      } else if (err.response.data?.message) {
        setError(err.response.data.message)
      } else if (err.response.status === 401) {
        setError('Incorrect email or password. Please check your credentials.')
      } else if (err.response.status === 403) {
        setError('Access forbidden. Your account may be disabled or pending review.')
      } else {
        setError(`Server error (${err.response.status}). Please try again later.`)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="apple-auth-page">
      {/* Centered Account Card */}
      <div className="apple-auth-container">
        <div className="apple-auth-header">
          <Link to="/" className="apple-auth-logo-box" title="Return to ShopSphere">
            <LogoIcon size={24} />
          </Link>

          <h1 className="apple-auth-title">
            {isRegister ? 'Create Your Account' : 'Sign In'}
          </h1>
          <p className="apple-auth-subtext">
            {isRegister ? (
              <>
                One account is all you need to access all ShopSphere merchant services.{' '}
                <Link to="/login">Sign In ›</Link>
              </>
            ) : (
              <>
                Enter your credentials to continue to ShopSphere.{' '}
                <Link to="/register">Create an account ›</Link>
              </>
            )}
          </p>
        </div>

        {/* Success Alert Banner (Shown after registration redirect) */}
        {successNotice && (
          <div className="apple-alert-success">
            {successNotice}
          </div>
        )}

        {/* Error Alert Banner */}
        {error && (
          <div className="apple-alert-error">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="apple-pure-form">
          {isRegister && (
            <>
              <div className="apple-form-group">
                <label className="apple-form-label" htmlFor="reg-name">Full name</label>
                <input
                  id="reg-name"
                  type="text"
                  className="apple-form-input"
                  value={form.name}
                  onChange={set('name')}
                  required
                  placeholder="First and last name"
                  autoComplete="name"
                />
              </div>

              <div className="apple-form-row-2">
                <div className="apple-form-group">
                  <label className="apple-form-label" htmlFor="reg-country">Country / Region</label>
                  <select
                    id="reg-country"
                    className="apple-form-select"
                    value={form.country}
                    onChange={set('country')}
                  >
                    <option value="India">India</option>
                    <option value="USA">United States</option>
                    <option value="International">Other / Global</option>
                  </select>
                </div>

                <div className="apple-form-group">
                  <label className="apple-form-label" htmlFor="reg-city">City</label>
                  <input
                    id="reg-city"
                    type="text"
                    className="apple-form-input"
                    value={form.city}
                    onChange={set('city')}
                    required
                    placeholder="e.g. Hyderabad"
                  />
                </div>
              </div>

              <div className="apple-form-row-2">
                <div className="apple-form-group">
                  <label className="apple-form-label" htmlFor="reg-pincode">PIN code</label>
                  <input
                    id="reg-pincode"
                    type="text"
                    className="apple-form-input"
                    value={form.pincode}
                    onChange={set('pincode')}
                    required
                    placeholder="500081"
                  />
                </div>

                <div className="apple-form-group">
                  <label className="apple-form-label" htmlFor="reg-phone">Phone number</label>
                  <input
                    id="reg-phone"
                    type="tel"
                    className="apple-form-input"
                    value={form.phone}
                    onChange={set('phone')}
                    placeholder="+91 98490 12345"
                  />
                </div>
              </div>
            </>
          )}

          <div className="apple-form-group">
            <label className="apple-form-label" htmlFor="auth-email">Email address</label>
            <input
              id="auth-email"
              type="email"
              className="apple-form-input"
              value={form.email}
              onChange={set('email')}
              required
              placeholder="name@example.com"
              autoComplete="email"
            />
          </div>

          <div className="apple-form-group">
            <label className="apple-form-label" htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              className="apple-form-input"
              value={form.password}
              onChange={set('password')}
              minLength={6}
              required
              placeholder="Password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </div>

          {isRegister && (
            <div className="apple-form-group">
              <label className="apple-form-label" htmlFor="auth-confirm">Confirm password</label>
              <input
                id="auth-confirm"
                type="password"
                className="apple-form-input"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                minLength={6}
                required
                placeholder="Confirm password"
                autoComplete="new-password"
              />
            </div>
          )}

          {!isRegister && (
            <div style={{ marginTop: '4px', marginBottom: '14px', padding: '10px 14px', background: '#f5f5f7', borderRadius: '12px', border: '1px solid #e5e5ea' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#86868b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Fill Demo Credentials:
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, email: 'customer@shopsphere.com', password: 'Customer@123' }))}
                  style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '980px', border: '1px solid #d2d2d7', background: '#fff', cursor: 'pointer', fontWeight: '500', color: '#1d1d1f' }}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, email: 'seller@shopsphere.com', password: 'Seller@123' }))}
                  style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '980px', border: '1px solid #d2d2d7', background: '#fff', cursor: 'pointer', fontWeight: '500', color: '#1d1d1f' }}
                >
                  Seller
                </button>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, email: 'admin@shopsphere.com', password: 'Admin@123' }))}
                  style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '980px', border: '1px solid #d2d2d7', background: '#fff', cursor: 'pointer', fontWeight: '500', color: '#1d1d1f' }}
                >
                  Admin
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="apple-auth-submit-btn" disabled={busy}>
            {busy ? 'Authenticating…' : isRegister ? 'Continue' : 'Sign In'}
          </button>

          <div className="apple-auth-switch-footer">
            <span>{isRegister ? 'Already have an account? ' : 'New to ShopSphere? '}</span>
            <Link to={isRegister ? '/login' : '/register'}>
              {isRegister ? 'Sign In' : 'Create yours now'}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
