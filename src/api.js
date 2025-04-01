// Function to get the current Google OAuth token
const getAuthToken = () => {
  // Get the token from localStorage
  const token = localStorage.getItem('googleToken');
  
  // If no token exists, return null
  if (!token) {
    return null;
  }
  
  // Return the token if it exists
  return token;
}

// generate api url with key/value pairs from the parameters ps
const url = (db, ps) => {
  const ps1 = {db, ...ps}
  const p = Object.keys(ps1).map(x => `${x}=${encodeURIComponent(ps1[x])}`).join('&')
  return `${import.meta.env.DEV ? 'http://localhost:704' : ''}/.netlify/functions/api?${p}`
}

// Create headers with authorization token if available
const createHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

export const api = db => ({
  get: ps => fetch(url(db, ps), {
    headers: createHeaders()
  }).then(r => r.json()),
  
  post: (ps, data) => fetch(url(db, ps), {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify(data)
  }).then(r => r.json()),
  
  save: (ps, data) => fetch(url(db, { type: 'save', ...ps }), {
    method: 'POST',
    headers: createHeaders(),
    body: JSON.stringify(data)
  }).then(r => r.json()),
})
