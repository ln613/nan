import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import { jwtDecode } from "jwt-decode"
import { observer } from 'mobx-react-lite'
import { todos } from '../store/todos'

export const OAuth = observer(({ children }) => 
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    {todos.isSignedIn ? children :
      <GoogleLogin
        onSuccess={r => {
          const c = jwtDecode(r.credential)
          if (c.email == 'ln613@hotmail.com') {
            todos.isSignedIn = true
          } else {
            console.log('Unauthorized')
          }
        }}
        onError={() => {
          console.log('Login Failed')
        }}
        auto_select
        useOneTap
      />
    }
  </GoogleOAuthProvider>
)