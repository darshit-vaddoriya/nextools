import React from 'react';
import ReactDOM from 'react-dom/client';
// One sans carries the whole UI; mono is for code and numeric readouts.
// Both are self-hosted, so the app makes no third-party font request.
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource-variable/jetbrains-mono';
import { App } from './App';
import { ToastProvider } from './components/Toast';
import { AD_CONFIG } from './config/ads';
import './index.css';

if (AD_CONFIG.enabled && !AD_CONFIG.client.includes('XXXX')) {
  const adScript = document.createElement('script');
  adScript.async = true;
  adScript.crossOrigin = 'anonymous';
  adScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CONFIG.client}`;
  document.head.appendChild(adScript);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>
);
