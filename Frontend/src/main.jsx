import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { EventProvider } from './shared/context/eventProvider.jsx'
import { SnackbarProvider } from './features/events/hod/utils/useSnackbar.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EventProvider>
      <SnackbarProvider>
        <App />
      </SnackbarProvider>
    </EventProvider>
  </StrictMode>,
)
