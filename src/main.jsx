import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { OAuth } from './components/oauth.jsx'

createRoot(document.getElementById('root')).render(<OAuth><App /></OAuth>)
