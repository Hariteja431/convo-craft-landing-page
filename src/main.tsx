
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'

const PUBLISHABLE_KEY = 'pk_test_aGlwLWxvdXNlLTMzLmNsZXJrLmFjY291bnRzLmRldiQ'

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key')
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
    <App />
  </ClerkProvider>
);
