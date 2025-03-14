import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Todo from './components/Todo.jsx'
import ImgList from './components/ImgList.jsx'
import Navigation from './components/Navigation.jsx'
import { OAuth } from './components/oauth.jsx'
import app from './store/app.js'
import { observer } from 'mobx-react-lite'

// Create an observed App component that will re-render when the app store changes
const AppRoutes = observer(() => {
  // Get the image list from the app store - this will now be reactive
  const xsnsImgList = app.getImgList('xsns')
  
  return (
    <OAuth>
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <main className="flex-grow p-4">
          <Routes>
            <Route path="/xsns" element={<ImgList list={xsnsImgList} />} />
            <Route path="/todo" element={<Todo />} />
          </Routes>
        </main>
      </div>
    </OAuth>
  )
})

// Delay rendering to avoid circular dependency issues
setTimeout(() => {
  createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}, 0)
