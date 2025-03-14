import { post, get } from './http'
import { tap } from '.'
import { jwtDecode } from 'jwt-decode'

export const translate = (txt, to = 'en') => post(
  tap(`https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_API_KEY}`),
  tap({ q: txt, target: to })
).then(r => r.data.translations[0].translatedText)

// Verify Google OAuth token
export const verifyGoogleToken = async (token) => {
  if (!token) return null;
  
  try {
    // Decode the token to get the payload
    const decoded = jwtDecode(token);
    
    // Check if the token is expired
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      return null;
    }
    
    // Check if the email is authorized
    if (decoded.email !== 'ln613@hotmail.com') {
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Error verifying Google token:', error);
    return null;
  }
}
