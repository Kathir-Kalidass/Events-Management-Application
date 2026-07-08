import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { EventProvider } from './shared/context/eventProvider.jsx'
// Ensure API base URL is normalized before the app renders
import './shared/utils/runtimeApiBase.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EventProvider>
      <App />
    </EventProvider>
  </StrictMode>,
)
