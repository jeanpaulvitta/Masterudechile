import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './styles/index.css';
import './styles/fonts.css';
import './styles/tailwind.css';
import './styles/theme.css';

// Detectar si está offline
window.addEventListener('load', () => {
  function updateOnlineStatus() {
    const statusElement = document.getElementById('offline-indicator');
    
    if (!navigator.onLine) {
      if (!statusElement) {
        const indicator = document.createElement('div');
        indicator.id = 'offline-indicator';
        indicator.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #ef4444;
          color: white;
          padding: 8px;
          text-align: center;
          font-size: 14px;
          font-weight: 600;
          z-index: 10000;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        `;
        indicator.textContent = '📵 Sin conexión - Modo offline';
        document.body.appendChild(indicator);
      }
    } else {
      if (statusElement) {
        statusElement.style.background = '#10b981';
        statusElement.textContent = '✅ Conexión restaurada';
        setTimeout(() => {
          statusElement.remove();
        }, 3000);
      }
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Verificar estado inicial
  updateOnlineStatus();
});

// Renderizar la aplicación
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
