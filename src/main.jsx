import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import { instalarAuthFetch } from './service/authFetch'

// Agrega el token JWT a todas las llamadas a /api antes de iniciar la app
instalarAuthFetch()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
