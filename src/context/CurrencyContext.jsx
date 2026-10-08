import { createContext, useContext, useState, useEffect } from 'react'

const CurrencyContext = createContext(null)

// Approximate exchange rate: 1 USD = 83 INR
const USD_TO_INR = 83.0

export function CurrencyProvider({ children }) {
  const [country, setCountry] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if (user?.country) return user.country
    return localStorage.getItem('shopsphere_country') || 'India'
  })

  const [city, setCity] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if (user?.city) return user.city
    return localStorage.getItem('shopsphere_city') || 'Hyderabad'
  })

  const [pincode, setPincode] = useState(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if (user?.pincode) return user.pincode
    return localStorage.getItem('shopsphere_pincode') || '500081'
  })

  const currency = country === 'India' ? 'INR' : 'USD'
  const currencySymbol = country === 'India' ? '₹' : '$'

  useEffect(() => {
    localStorage.setItem('shopsphere_country', country)
    localStorage.setItem('shopsphere_city', city)
    localStorage.setItem('shopsphere_pincode', pincode)
  }, [country, city, pincode])

  // Helper to format price based on selected currency
  function formatPrice(amountInINR) {
    if (amountInINR == null || isNaN(amountInINR)) return `${currencySymbol}0`

    if (currency === 'INR') {
      // Indian numbering format e.g. ₹26,990 or ₹492
      const rounded = Math.round(amountInINR)
      return `₹${rounded.toLocaleString('en-IN')}`
    } else {
      // USD conversion
      const inUSD = amountInINR / USD_TO_INR
      return `$${inUSD.toFixed(2)}`
    }
  }

  // Check if given city / pincode is within Hyderabad deliverable bounds
  function isDeliverable(checkCity = city, checkPincode = pincode) {
    const cleanCity = (checkCity || '').toLowerCase().trim()
    const cleanPin = (checkPincode || '').toString().trim()

    const hyderabadKeywords = [
      'hyderabad',
      'secunderabad',
      'cyberabad',
      'telangana',
      'hitec city',
      'madhapur',
      'gachibowli',
      'banjara hills',
      'jubilee hills',
      'kondapur',
      'kukatpally',
      'miyapur',
      'begumpet',
      'uppal',
      'dilsukhnagar',
    ]
    const isCityMatch = hyderabadKeywords.some((k) => cleanCity.includes(k))

    // Hyderabad pincodes start with 500xxx
    const isPinMatch = /^500\d{3}$/.test(cleanPin)

    return isCityMatch || isPinMatch
  }

  function updateLocation(newCountry, newCity, newPincode) {
    if (newCountry) setCountry(newCountry)
    if (newCity) setCity(newCity)
    if (newPincode) setPincode(newPincode)
  }

  return (
    <CurrencyContext.Provider
      value={{
        country,
        setCountry,
        city,
        setCity,
        pincode,
        setPincode,
        currency,
        currencySymbol,
        formatPrice,
        isDeliverable,
        updateLocation,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return ctx
}
