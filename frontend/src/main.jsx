/**
 * ============================================================
 * MediMeet Frontend — Application Entry Point (main.jsx)
 * ============================================================
 * Bootstraps the React application by rendering the root
 * component tree into the DOM. Wraps the app with:
 *  - React.StrictMode: Enables additional development warnings
 *  - BrowserRouter: Provides client-side routing via React Router
 *  - AuthProvider: Supplies authentication context to all components
 * ============================================================
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'

// Mount the React app into the #root DOM element
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
