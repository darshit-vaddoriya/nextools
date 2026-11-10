// Runs once on every page (was src/main.tsx under Vite).
import { AD_CONFIG } from './config/ads';
import { initPwa } from './lib/pwa';

initPwa();

// Same rule as the tag loader in src/astro/head.html: only the live site asks for ads.
const liveHost = location.hostname === 'nexttool.click' || location.hostname === 'www.nexttool.click';

if (liveHost && AD_CONFIG.enabled && !AD_CONFIG.client.includes('XXXX')) {
  const adScript = document.createElement('script');
  adScript.async = true;
  adScript.crossOrigin = 'anonymous';
  adScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CONFIG.client}`;
  document.head.appendChild(adScript);
}
