import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const removeLoader = () => {
  const el = document.getElementById('app-loader');
  if (el) {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 500);
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

removeLoader();
