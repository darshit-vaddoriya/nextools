// Tells IndexNow search engines (Bing, Yandex, Seznam and others) which pages a
// deploy just published or changed, so new guides are crawled in hours rather
// than whenever the crawler next comes round.
//
// Netlify runs a function named `deploy-succeeded` after every successful
// production deploy. It reads the live sitemap and submits the pages whose
// <lastmod> is today, plus the home page and the guide index, which list them.
// The key file it points to is public/<key>.txt; IndexNow fetches it to check
// that this site really sent the request.
const SITE = 'https://nexttool.click';
const HOST = 'nexttool.click';
const KEY = 'be3443894d2cd9e75097aff16cfc5571';

export const handler = async () => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const xml = await (await fetch(`${SITE}/sitemap.xml`, { cache: 'no-store' })).text();
    const changed = [...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>(?:(?!<\/url>)[\s\S])*?<lastmod>([^<]+)<\/lastmod>/g)]
      .filter(([, , lastmod]) => lastmod.slice(0, 10) === today)
      .map(([, loc]) => loc);
    const urlList = [...new Set([`${SITE}/`, `${SITE}/blog`, ...changed])];

    const res = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
    });
    console.log(`IndexNow: submitted ${urlList.length} URL(s), status ${res.status}`);
  } catch (err) {
    // Never fail the deploy over a notification.
    console.error('IndexNow submission failed:', err);
  }
  return { statusCode: 200, body: '' };
};
