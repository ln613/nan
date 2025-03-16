import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Todo from './components/Todo.jsx'
import ImgList from './components/ImgList.jsx'
import Navigation from './components/Navigation.jsx'
import DBTool from './components/DBTool.jsx'
import { OAuth } from './components/oauth.jsx'
import app from './store/app.js'
import { observer } from 'mobx-react-lite'

// Create an observed App component that will re-render when the app store changes
const AppRoutes = observer(() => {
  // Get the image list from the app store - this will now be reactive
  const xsnsModels = app.getImgList('xsns.models')
  const xsnsAlbums = app.getImgList('xsns.albums')
  const xsnsImages = app.getImgList('xsns.images')
  
  return (
    <OAuth>
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <main className="flex-grow">
          <Routes>
            <Route path="/xsns.models" element={<ImgList list={xsnsModels} />} />
            <Route path="/xsns.albums" element={<ImgList list={xsnsAlbums} />} />
            <Route path="/xsns.images" element={<ImgList list={xsnsImages} />} />
            <Route path="/todo" element={<Todo />} />
            <Route path="/dbtool" element={<DBTool />} />
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
