// Runs once on every page (was src/main.tsx under Vite).
import { AD_CONFIG } from './config/ads';
import { initPwa } from './lib/pwa';

initPwa();

if (AD_CONFIG.enabled && !AD_CONFIG.client.includes('XXXX')) {
  const adScript = document.createElement('script');
  adScript.async = true;
  adScript.crossOrigin = 'anonymous';
  adScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CONFIG.client}`;
  document.head.appendChild(adScript);
}
