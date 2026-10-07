import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Pico styles plain HTML elements. index.css comes after it so our rules win.
import '@picocss/pico/css/pico.classless.blue.min.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
