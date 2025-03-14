import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import { jwtDecode } from "jwt-decode"
import { observer } from 'mobx-react-lite'
import { makeAutoObservable, runInAction } from 'mobx'

// Create a separate auth store to avoid circular dependencies
class AuthStore {
  isSignedIn = false;
  error = null;
  
  constructor() {
    makeAutoObservable(this);
    
    // Check if there's an existing token
    const token = localStorage.getItem('googleToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.email === 'ln613@hotmail.com' && decoded.exp > Date.now() / 1000) {
          this.isSignedIn = true;
        }
      } catch (e) {
        localStorage.removeItem('googleToken');
      }
    }
  }
  
  signIn = (credential) => {
    localStorage.setItem('googleToken', credential);
    this.isSignedIn = true;
    this.error = null;
  }
  
  signOut = () => {
    localStorage.removeItem('googleToken');
    this.isSignedIn = false;
  }
  
  setError = (message) => {
    this.error = message;
    console.error(`Auth error: ${message}`);
  }
}

export const authStore = new AuthStore();

export const OAuth = observer(({ children }) => {
  // Get client ID from environment or use a fallback for testing
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  if (!clientId) {
    console.error("Missing Google client ID");
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded">
        <h3 className="font-bold">Configuration Error</h3>
        <p>Google OAuth client ID is missing. Please check your environment configuration.</p>
      </div>
    );
  }
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {authStore.isSignedIn ? children :
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-2xl mb-4">App Login</h2>
          <GoogleLogin
            onSuccess={r => {
              const credential = r.credential;
              const c = jwtDecode(credential);
              
              if (c.email === 'ln613@hotmail.com') {
                // Store the token in localStorage for API requests
                authStore.signIn(credential);
                
                // Import todos dynamically to avoid circular dependency
                import('../store/todos').then(module => {
                  runInAction(() => {
                    module.todos.isSignedIn = true;
                  });
                });
              } else {
                console.log('Unauthorized');
                authStore.setError('Unauthorized email address');
              }
            }}
            onError={(e) => {
              console.log('Login Failed', e);
              authStore.setError('Login failed');
              localStorage.removeItem('googleToken');
            }}
            auto_select
            useOneTap
          />
          {authStore.error && (
            <div className="mt-4 p-2 bg-red-100 text-red-800 rounded">
              {authStore.error}
            </div>
          )}
        </div>
      }
    </GoogleOAuthProvider>
  );
});
