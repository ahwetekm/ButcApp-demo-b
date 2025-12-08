// Environment-specific API configuration
const getApiBaseUrl = () => {
  const hostname = window.location.hostname
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return '' // Local development - same origin
  } else if (hostname.includes('space.z.ai')) {
    return '' // Preview environment - same origin
  } else {
    return '' // Production - same origin
  }
}

export const API_BASE_URL = getApiBaseUrl()