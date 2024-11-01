import { post } from './http'
import { tap } from '.'

export const translate = (txt, to = 'en') => post(
  tap(`https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_API_KEY}`),
  tap({ q: txt, target: to })
).then(r => r.data.translations[0].translatedText)