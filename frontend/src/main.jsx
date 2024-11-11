import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { NextUIProvider } from '@nextui-org/react'
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId='737820697464-pu6tne7mvgcr3h4fvlng32ph5um90mjl.apps.googleusercontent.com'>
    <StrictMode>
      <NextUIProvider>
        <main className='dark text-foreground bg-background'>
          <App />
        </main>
       
      </NextUIProvider>
    </StrictMode>
  </GoogleOAuthProvider>
)
