import { Link, useLocation } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { authStore } from '../components/oauth.jsx'
import { runInAction } from 'mobx'

export const Navigation = observer(() => {
  const location = useLocation()
  
  const handleSignOut = () => {
    authStore.signOut();
    
    // Also update todos store if it's already loaded
    import('../store/todos').then(module => {
      runInAction(() => {
        module.todos.isSignedIn = false;
      });
    });
  }
  
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">My App</div>
        <div className="flex space-x-4">
          <Link
            to="/xsns"
            className={`px-3 py-2 rounded-md ${
              location.pathname === '/xsns'
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            Image Gallery
          </Link>
          <Link
            to="/apps"
            className={`px-3 py-2 rounded-md ${
              location.pathname === '/apps'
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            App Store
          </Link>
          <Link
            to="/todo"
            className={`px-3 py-2 rounded-md ${
              location.pathname === '/note'
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            Todo App
          </Link>
          {authStore.isSignedIn && (
            <button
              onClick={handleSignOut}
              className="px-3 py-2 rounded-md text-gray-300 hover:bg-gray-700"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </nav>
  )
})

export default Navigation
