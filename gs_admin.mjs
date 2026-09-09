import puppeteer from 'puppeteer';
import fs from 'fs';

const BASE = 'http://localhost:8012';
const OUT = '/tmp/claude-1000/-home-darshit-smk-apps/c493ba98-31dc-4153-9620-b624ae703172/scratchpad';
const SHOT = OUT + '/shots_admin';
fs.rmSync(SHOT, { recursive: true, force: true });
fs.mkdirSync(SHOT, { recursive: true });
const ADMIN_PWD = 'Sanskar';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slug = (dt) => dt.toLowerCase().replace(/ /g, '-');
const today = new Date().toISOString().slice(0, 10);
const nextyr = new Date(Date.now() + 364 * 864e5).toISOString().slice(0, 10);
const yday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
const DENY_RE = /not permitted|no permission|insufficient permission|do not have (?:enough )?permission|don't have (?:enough )?permission|not allowed to|segregation of dut|sod[- ]?\d|conflict|separation of dut/i;
const results = [];
function rec(r) { results.push(r); console.log(`${r.pass === true ? 'PASS' : r.pass === false ? 'FAIL' : '????'}  ${r.id.padEnd(5)} ${r.desc}\n        => ${r.observed}`); }
function T(p, ms, t) { return Promise.race([p, new Promise((_, j) => setTimeout(() => j(new Error('timeout:' + t)), ms))]); }
const ev = (pg, fn, a, ms = 8000, t = 'ev') => T(pg.evaluate(fn, a), ms, t);
async function shot(pg, id) { try { await T(pg.screenshot({ path: `${SHOT}/${id}.png` }), 8000, 's'); } catch {} }

async function loginNew(browser, user, pwd) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 1500, height: 900 });
  await T(page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' }), 30000, 'gl');
  await page.waitForSelector('#login_email', { timeout: 20000 });
  await page.type('#login_email', user, { delay: 12 });
  await page.type('#login_password', pwd, { delay: 12 });
  await page.click('.btn-login');
  await T(page.waitForFunction(() => location.pathname.startsWith('/app'), { timeout: 30000 }), 32000, 'wa').catch(() => {});
  await sleep(1500);
  await ev(page, () => document.querySelectorAll('.modal.show [data-dismiss="modal"],.modal.show .btn-modal-close').forEach((b) => b.click()), null, 4000).catch(() => {});
  return { ctx, page };
}
async function st(page) {
  return await ev(page, () => {
    const c = (s) => (s || '').replace(/\s+/g, ' ').trim();
    return {
      modal: [...document.querySelectorAll('.modal.show,.modal.in')].map((m) => c(m.innerText)).filter(Boolean),
      alerts: [...document.querySelectorAll('.desk-alert,.alert-message,#alert-container .alert')].map((a) => c(a.innerText)).filter(Boolean),
      pageCard: c((document.querySelector('.page-card') || {}).innerText),
      route: (() => { try { return frappe.get_route().join('/'); } catch { return ''; } })(),
      docname: (() => { try { return cur_frm.doc.name; } catch { return ''; } })(),
      islocal: (() => { try { return !!cur_frm.doc.__islocal; } catch { return null; } })(),
      dirty: (() => { try { return !!cur_frm.is_dirty(); } catch { return null; } })(),
      docstatus: (() => { try { return cur_frm.doc.docstatus; } catch { return null; } })(),
      reportRows: (() => { try { return frappe.query_report.data.length; } catch { return null; } })(),
      title: c((document.querySelector('.title-area .title-text') || {}).innerText),
      indicator: c((document.querySelector('.title-area .indicator-pill') || {}).innerText),
      body: c(document.body.innerText).slice(0, 320),
    };
  }, null, 8000, 'st');
}
function deny(s) { const h = [s.pageCard, ...(s.modal || []), ...(s.alerts || []), s.body].join(' || '); const i = h.search(DENY_RE); return i >= 0 ? h.slice(Math.max(0, i - 50), i + 130) : null; }
async function kbSave(page) {
  await page.keyboard.down('Control'); await page.keyboard.press('KeyS'); await page.keyboard.up('Control');
  await T(page.waitForFunction(() => {
    const b = document.body.innerText || '';
    if (/not permitted|no permission|do not have|don't have|segregation of dut|conflict|separation of dut/i.test(b)) return true;
    if (document.querySelector('#alert-container .alert,.desk-alert')) return true;
    if (window.cur_frm && !cur_frm.is_dirty() && cur_frm.doc && !cur_frm.doc.__islocal) return true;
    return false;
  }, { timeout: 9000 }), 10000, 'sv').catch(() => {});
  await sleep(1200);
}

// ---- RSA creation (Administrator) ----
async function newRSA(page, { id, user, employee, seat, expect, desc, cleanup }) {
  await T(page.goto(`${BASE}/app/role-seat-assignment/new`, { waitUntil: 'domcontentloaded' }), 30000, 'g');
  await sleep(2500);
  const set = await ev(page, (v) => new Promise(async (res) => {
    try {
      await cur_frm.set_value('user', v.user);
      await cur_frm.set_value('employee', v.employee);
      await cur_frm.set_value('role_seat', v.seat);
      await cur_frm.set_value('assignment_type', 'Primary');
      await cur_frm.set_value('status', 'Draft');
      await cur_frm.set_value('effective_from', v.today);
      await cur_frm.set_value('effective_to', v.nextyr);
      res({ ok: true });
    } catch (e) { res({ ok: false, e: String(e) }); }
  }), { user, employee, seat, today, nextyr }, 15000).catch((e) => ({ ok: false, e: String(e) }));
  await sleep(800);
  await kbSave(page);
  const s = await st(page);
  await shot(page, id);
  const d = deny(s);
  const saved = !d && s.dirty === false && s.docname && !/new-/.test(s.docname);
  rec({ id, desc, expect, pass: expect === 'deny' ? !!d && !saved : saved, observed: `set=${JSON.stringify(set)} doc=${s.docname || '-'} dirty=${s.dirty} ${d ? 'DENY="' + d + '"' : 'no-deny'} modal=${JSON.stringify(s.modal).slice(0, 240)}` });
  if (saved && cleanup) {
    // delete the just-created draft RSA to keep state clean
    await ev(page, () => new Promise((r) => { frappe.db.delete_doc(cur_frm.doctype, cur_frm.doc.name).then(r).catch(r); }), null, 8000).catch(() => {});
    await sleep(800);
    console.log(`        (cleanup: deleted ${s.docname})`);
  }
  return s;
}

// ---- generic open (as any user) ----
async function open(page, dt, name) {
  await T(page.goto(`${BASE}/app/${slug(dt)}/${encodeURIComponent(name)}`, { waitUntil: 'domcontentloaded' }), 30000, 'g');
  await T(page.waitForFunction(() => document.querySelector('.title-area .title-text') || document.querySelector('.page-card') || document.querySelector('.modal.show'), { timeout: 15000 }), 16000, 'w').catch(() => {});
  await sleep(1800);
  return st(page);
}

async function main() {
  const exe = await puppeteer.executablePath();
  const browser = await puppeteer.launch({ headless: false, slowMo: 12, executablePath: exe, args: ['--no-sandbox', '--window-size=1520,950', '--window-position=0,0'], defaultViewport: null, env: { ...process.env, DISPLAY: ':0' } });

  // ============ PART 1 : Administrator drives SoD-at-assignment + Gate 7 setup ============
  console.log('\n############  Administrator  ############');
  const adm = await loginNew(browser, 'Administrator', ADMIN_PWD);

  await newRSA(adm.page, { id: 'G1', user: 'gs.fin02@gstest.local', employee: 'HR-REG-00013', seat: 'FIN-03', expect: 'deny',
    desc: 'SoD: give FIN-03 (approver) seat to the payment MAKER gs.fin02  →  expect SOD-2026-0002' });
  await newRSA(adm.page, { id: 'G2', user: 'gs.fin03@gstest.local', employee: 'HR-REG-00014', seat: 'MDM-OWNER', expect: 'deny',
    desc: 'SoD: give MDM-OWNER seat to the payment APPROVER gs.fin03  →  expect SOD-2026-0006' });
  await newRSA(adm.page, { id: 'G3', user: 'gs.ia01@gstest.local', employee: 'HR-REG-00016', seat: 'FIN-01', expect: 'deny',
    desc: 'SoD: give a Finance seat (FIN-01) to the AUDITOR gs.ia01  →  expect SOD-2026-0004' });
  await newRSA(adm.page, { id: 'G4ctl', user: 'gs.acc02@gstest.local', employee: 'HR-REG-00011', seat: 'QA-HEAD', expect: 'allow',
    desc: 'SoD control: give the non-conflicting QA-HEAD seat to gs.acc02  →  expect SUCCESS (then auto-deleted)', cleanup: true });

  // Gate 7 setup through the IAP form (add an Output Access row)
  await T(adm.page.goto(`${BASE}/app/information-access-policy/IAP-2026-00012`, { waitUntil: 'domcontentloaded' }), 30000, 'g');
  await sleep(2500);
  const f7 = await ev(adm.page, () => new Promise(async (res) => {
    try {
      const row = cur_frm.add_child('output_access', { target: 'Delivery Note', channel: 'Query Report only', output_allowed: 1, doctype_read: 0 });
      cur_frm.refresh_field('output_access');
      await cur_frm.save();
      res({ ok: true, rows: (cur_frm.doc.output_access || []).map((r) => [r.target, r.channel, r.output_allowed, r.doctype_read]) });
    } catch (e) { res({ ok: false, e: String(e) }); }
  }), null, 15000).catch((e) => ({ ok: false, e: String(e) }));
  await sleep(1000);
  await shot(adm.page, 'F0_setup');
  rec({ id: 'F0', desc: 'Administrator adds a Gate-7 Output Access row (Delivery Note / Query Report only) to IA-01 policy', expect: 'allow', pass: !!(f7 && f7.ok), observed: JSON.stringify(f7).slice(0, 260) });

  await adm.ctx.close();

  // ============ PART 2 : the auditor lives with Gate 7 ============
  console.log('\n############  gs.ia01 (Gate 7)  ############');
  const ia = await loginNew(browser, 'gs.ia01@gstest.local', 'GovTest@12345');
  {
    const s = await open(ia.page, 'Delivery Note', 'DN-25-00005');
    await shot(ia.page, 'F2');
    const d = deny(s);
    rec({ id: 'F2', desc: 'auditor opens the Delivery Note DOCUMENT  →  expect blocked (Gate 7)', expect: 'deny', pass: !!d && !s.docname, observed: `doc=${s.docname || '-'} ${d ? 'DENY="' + d + '"' : 'no-deny'}` });
  }
  {
    await T(ia.page.goto(`${BASE}/app/query-report/Delivery Note Trends`, { waitUntil: 'domcontentloaded' }), 30000, 'g');
    await sleep(4000);
    const s = await st(ia.page);
    await shot(ia.page, 'F1');
    const d = deny(s);
    rec({ id: 'F1', desc: 'same auditor runs the Delivery Note REPORT  →  expect allowed (Gate 7)', expect: 'allow', pass: !d && s.reportRows !== null, observed: `reportRows=${s.reportRows} ${d ? 'DENY' : 'no-deny'} route=${s.route}` });
  }
  await ia.ctx.close();

  // ============ PART 3 : re-confirm maker/checker on Payment Entry ============
  console.log('\n############  gs.fin02 / gs.fin03 (maker vs approver)  ############');
  for (const [who, pass_expected] of [['gs.fin02', 'deny'], ['gs.fin03', 'deny']]) {
    const s0 = await loginNew(browser, `${who}@gstest.local`, 'GovTest@12345');
    await open(s0.page, 'Payment Entry', 'ACC-PAY-2026-00002');
    const before = await ev(s0.page, () => cur_frm.doc.docstatus, null, 5000).catch(() => null);
    await ev(s0.page, () => {
      const b = [...document.querySelectorAll('.page-actions button')].find((x) => x.offsetParent && /^\s*submit\s*$/i.test(x.innerText));
      if (b) b.click();
    }, null, 5000).catch(() => {});
    await sleep(1500);
    await ev(s0.page, () => { const y = [...document.querySelectorAll('.modal.show .btn-primary,.modal.show .btn-modal-primary')].find((b) => b.offsetParent); if (y) y.click(); }, null, 4000).catch(() => {});
    await sleep(2500);
    const s = await st(s0.page);
    await shot(s0.page, who === 'gs.fin02' ? 'B2' : 'B3');
    const d = deny(s);
    rec({ id: who === 'gs.fin02' ? 'B2' : 'B3',
      desc: who === 'gs.fin02' ? 'payment MAKER gs.fin02 clicks Submit  →  expect blocked' : 'payment APPROVER gs.fin03 clicks Submit  →  expect blocked by the write-before-submit gap',
      expect: 'deny', pass: !!d && s.docstatus !== 1,
      observed: `docstatus ${before}->${s.docstatus} ${d ? 'DENY="' + d + '"' : 'no-deny'}` });
    await s0.ctx.close();
  }

  // ============ PART 4 : Gate 7 teardown (Administrator, via the form) ============
  console.log('\n############  Administrator teardown  ############');
  const adm2 = await loginNew(browser, 'Administrator', ADMIN_PWD);
  await T(adm2.page.goto(`${BASE}/app/information-access-policy/IAP-2026-00012`, { waitUntil: 'domcontentloaded' }), 30000, 'g');
  await sleep(2500);
  const td = await ev(adm2.page, () => new Promise(async (res) => {
    try {
      cur_frm.doc.output_access = (cur_frm.doc.output_access || []).filter((r) => r.target !== 'Delivery Note');
      cur_frm.refresh_field('output_access');
      cur_frm.dirty();
      await cur_frm.save();
      res({ ok: true, rows: (cur_frm.doc.output_access || []).length });
    } catch (e) { res({ ok: false, e: String(e) }); }
  }), null, 15000).catch((e) => ({ ok: false, e: String(e) }));
  console.log('  Gate 7 row removed:', JSON.stringify(td));
  await adm2.ctx.close();

  console.log('\n############  SUMMARY  ############');
  for (const r of results) console.log(`${r.pass === true ? 'PASS' : r.pass === false ? 'FAIL' : '????'}  ${r.id.padEnd(5)} expect=${(r.expect || '').padEnd(5)} ${r.desc}`);
  const p = results.filter((r) => r.pass === true).length, f = results.filter((r) => r.pass === false).length, e = results.filter((r) => r.pass === null).length;
  console.log(`\n${p} pass / ${f} fail / ${e} error  of ${results.length}`);
  fs.writeFileSync(OUT + '/gs_admin_results.json', JSON.stringify(results, null, 2));
  await sleep(1200);
  await browser.close();
}
main().catch((e) => { console.error('FATAL', e); fs.writeFileSync(OUT + '/gs_admin_results.json', JSON.stringify(results, null, 2)); process.exit(1); });
