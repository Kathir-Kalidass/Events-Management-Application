import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { EventProvider } from './context/eventProvider.jsx'
import { SnackbarProvider } from './pages/HOD/utils/useSnackbar.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EventProvider>
      <SnackbarProvider>
        <App />
      </SnackbarProvider>
    </EventProvider>
  </StrictMode>,
)
