import puppeteer from 'puppeteer';
import fs from 'fs';

const BASE = 'http://localhost:8012';
const PWD = 'GovTest@12345';
const OUT = '/tmp/claude-1000/-home-darshit-smk-apps/c493ba98-31dc-4153-9620-b624ae703172/scratchpad';
const SHOT = OUT + '/shots';
fs.rmSync(SHOT, { recursive: true, force: true });
fs.mkdirSync(SHOT, { recursive: true });

const SO_DRAFT = 'SMK/SO/LO/26-27/001';
const SO_SUBMITTED = 'SMK/SO/LO/25-26/001';
const PE_DRAFT = 'ACC-PAY-2026-00002';
const PDR = 'PDR-2026-0001';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slug = (dt) => dt.toLowerCase().replace(/ /g, '-');
const routeOf = (dt, name) => `${BASE}/app/${slug(dt)}/${encodeURIComponent(name)}`;
const newRoute = (dt) => `${BASE}/app/${slug(dt)}/new`;
const DENY_RE = /not permitted|no permission|insufficient permission|do not have (?:enough )?permission|don't have (?:enough )?permission|not allowed to/i;

const results = [];
function record(r) {
  results.push(r);
  const mark = r.pass === true ? 'PASS' : r.pass === false ? 'FAIL' : '????';
  console.log(`${mark}  ${r.id.padEnd(4)} ${r.user.padEnd(9)} ${r.desc}\n        => ${r.observed}`);
}

function T(promise, ms, tag) {
  return Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error('timeout:' + (tag || ''))), ms)),
  ]);
}
const ev = (page, fn, arg, ms = 8000, tag = 'evaluate') => T(page.evaluate(fn, arg), ms, tag);

async function shot(page, id) {
  try { await T(page.screenshot({ path: `${SHOT}/${id}.png` }), 8000, 'shot'); } catch {}
}

async function login(browser, email) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 1500, height: 900 });
  await T(page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' }), 30000, 'goto-login');
  await page.waitForSelector('#login_email', { timeout: 20000 });
  await page.type('#login_email', email, { delay: 15 });
  await page.type('#login_password', PWD, { delay: 15 });
  await page.click('.btn-login');
  await T(page.waitForFunction(() => location.pathname.startsWith('/app'), { timeout: 30000 }), 32000, 'wait-app').catch(() => {});
  await sleep(1500);
  await closeModals(page);
  return { ctx, page };
}

async function closeModals(page) {
  try {
    await ev(page, () => {
      document.querySelectorAll('.modal.show .btn-modal-close,.modal.show [data-dismiss="modal"]').forEach((b) => b.click());
    }, null, 4000, 'closeModals');
  } catch {}
  await sleep(300);
}

async function readState(page) {
  return await ev(page, () => {
    const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
    const modal = Array.from(document.querySelectorAll('.modal.show, .modal.in')).map((m) => clean(m.innerText)).filter(Boolean);
    const alerts = Array.from(document.querySelectorAll('.desk-alert, .alert-message, #alert-container .alert, .toast-body')).map((a) => clean(a.innerText)).filter(Boolean);
    const pageCard = clean((document.querySelector('.page-card') || {}).innerText);
    let route = '', docname = '', docstatus = null, dirty = null;
    try { route = (window.frappe && frappe.get_route && frappe.get_route().join('/')) || ''; } catch {}
    try { docname = (window.cur_frm && cur_frm.doc && cur_frm.doc.name) || ''; } catch {}
    try { docstatus = window.cur_frm && cur_frm.doc ? cur_frm.doc.docstatus : null; } catch {}
    try { dirty = window.cur_frm ? !!cur_frm.is_dirty() : null; } catch {}
    const title = clean((document.querySelector('.title-area .title-text, .title-area h1') || {}).innerText);
    const indicator = clean((document.querySelector('.title-area .indicator-pill, .title-area .indicator') || {}).innerText);
    const body = clean(document.body.innerText).slice(0, 300);
    return { modal, alerts, pageCard, route, docname, docstatus, dirty, title, indicator, body };
  }, null, 8000, 'readState');
}

function deniedText(st) {
  const hay = [st.pageCard, ...(st.modal || []), ...(st.alerts || []), st.body].join(' || ');
  const idx = hay.search(DENY_RE);
  return idx >= 0 ? hay.slice(Math.max(0, idx - 45), idx + 95) : null;
}

async function gotoDoc(page, dt, name) {
  await T(page.goto(routeOf(dt, name), { waitUntil: 'domcontentloaded' }), 30000, 'goto-doc');
  await T(page.waitForFunction(() =>
    document.querySelector('.title-area .title-text') || document.querySelector('.page-card') || document.querySelector('.modal.show'),
    { timeout: 15000 }), 16000, 'wait-doc').catch(() => {});
  await sleep(1600);
}

async function pressSave(page) {
  await page.keyboard.down('Control');
  await page.keyboard.press('KeyS');
  await page.keyboard.up('Control');
  await T(page.waitForFunction(() => {
    const b = document.body.innerText || '';
    if (/not permitted|no permission|do not have|don't have/i.test(b)) return true;
    if (document.querySelector('#alert-container .alert, .desk-alert')) return true;
    if (window.cur_frm && !cur_frm.is_dirty()) return true;
    return false;
  }, { timeout: 7000 }), 8000, 'wait-save').catch(() => {});
  await sleep(900);
}

async function setField(page, fieldname, value) {
  return await ev(page, ({ fieldname, value }) => new Promise((resolve) => {
    if (!window.cur_frm) return resolve({ ok: false, why: 'no cur_frm' });
    try {
      const p = cur_frm.set_value(fieldname, value);
      const done = () => resolve({ ok: true, dirty: !!cur_frm.is_dirty(), val: cur_frm.doc[fieldname] });
      if (p && typeof p.then === 'function') { p.then(done).catch((e) => resolve({ ok: false, why: String(e) })); setTimeout(done, 2500); }
      else done();
    } catch (e) { resolve({ ok: false, why: String(e && (e.message || e)) }); }
  }), { fieldname, value }, 6000, 'setField');
}

async function clickSubmitBtn(page) {
  const clicked = await ev(page, () => {
    const cand = Array.from(document.querySelectorAll('.page-actions button, .standard-actions button, .primary-action'));
    const b = cand.find((x) => x.offsetParent !== null && /^\s*submit\s*$/i.test(x.innerText));
    if (b) { b.click(); return b.innerText.trim(); }
    return null;
  }, null, 5000, 'find-submit');
  await sleep(1300);
  await ev(page, () => {
    const btn = Array.from(document.querySelectorAll('.modal.show .btn-primary, .modal.show .btn-modal-primary')).find((b) => b.offsetParent !== null);
    if (btn) btn.click();
  }, null, 4000, 'confirm').catch(() => {});
  await T(page.waitForFunction(() => {
    const b = document.body.innerText || '';
    if (/not permitted|no permission|do not have|don't have/i.test(b)) return true;
    if (window.cur_frm && cur_frm.doc && cur_frm.doc.docstatus === 1) return true;
    return false;
  }, { timeout: 8000 }), 9000, 'wait-submit').catch(() => {});
  await sleep(1000);
  return clicked;
}

async function runOpen(page, t) {
  await gotoDoc(page, t.dt, t.name);
  const st = await readState(page);
  await shot(page, t.id);
  const dtxt = deniedText(st);
  const opened = !!st.docname && !dtxt;
  const denied = !!dtxt || (!st.docname && !st.title);
  const pass = t.expect === 'deny' ? denied && !opened : opened;
  record({ ...t, pass, observed: `route=${st.route} doc=${st.docname || '-'} title="${st.title}" ${dtxt ? 'DENY="' + dtxt + '"' : 'no-deny-text'}` });
}

async function runEditOrCreate(page, t) {
  if (t.kind === 'create') {
    await T(page.goto(newRoute(t.dt), { waitUntil: 'domcontentloaded' }), 30000, 'goto-new');
    await sleep(2600);
    await closeModals(page);
    const pre = await readState(page);
    const preDenied = deniedText(pre);
    if (preDenied || (!pre.docname && !pre.title)) {
      await shot(page, t.id);
      return record({ ...t, pass: t.expect === 'deny', observed: `blocked at NEW route: ${preDenied || 'form did not open'}` });
    }
  } else {
    await gotoDoc(page, t.dt, t.name);
    const rs = await readState(page);
    if (deniedText(rs) || (!rs.docname && !rs.title)) {
      await shot(page, t.id);
      return record({ ...t, pass: t.expect === 'deny', observed: `blocked at READ: ${deniedText(rs) || 'no form'}` });
    }
  }
  const setRes = await setField(page, t.field, t.value).catch((e) => ({ ok: false, why: String(e) }));
  await sleep(500);
  await pressSave(page);
  const st = await readState(page);
  await shot(page, t.id);
  const dtxt = deniedText(st);
  const saved = st.dirty === false && !dtxt && !!st.docname;
  const pass = t.expect === 'deny' ? !!dtxt : saved;
  record({ ...t, pass, observed: `set=${JSON.stringify(setRes)} dirtyAfter=${st.dirty} doc=${st.docname || '-'} ${dtxt ? 'DENY="' + dtxt + '"' : 'no-deny-text'} ind="${st.indicator}"` });
}

async function runSubmit(page, t) {
  await gotoDoc(page, t.dt, t.name);
  const rs = await readState(page);
  if (deniedText(rs) || (!rs.docname && !rs.title)) {
    await shot(page, t.id);
    return record({ ...t, pass: t.expect === 'deny', observed: `blocked at READ: ${deniedText(rs) || 'no form'}` });
  }
  const before = rs.docstatus;
  const clicked = await clickSubmitBtn(page);
  const st = await readState(page);
  await shot(page, t.id);
  const dtxt = deniedText(st);
  const submitted = st.docstatus === 1 && before !== 1;
  const pass = t.expect === 'deny' ? !!dtxt && !submitted : submitted;
  record({ ...t, pass, observed: `submitBtn=${clicked} docstatus ${before}->${st.docstatus} ${dtxt ? 'DENY="' + dtxt + '"' : 'no-deny-text'} modal=${JSON.stringify(st.modal).slice(0, 200)}` });
}

const PLAN = [
  { id: 'D1', user: 'gs.nobody', kind: 'open', dt: 'Sales Order', name: SO_SUBMITTED, expect: 'deny', desc: 'nobody opens a Sales Order (has native Sales User)' },
  { id: 'D2', user: 'gs.nobody', kind: 'open', dt: 'Payment Entry', name: PE_DRAFT, expect: 'deny', desc: 'nobody opens a Payment Entry (has native Accounts User)' },

  { id: 'C1', user: 'gs.ia01', kind: 'open', dt: 'Sales Order', name: SO_SUBMITTED, expect: 'allow', desc: 'auditor opens a Sales Order (read granted)' },
  { id: 'C3r', user: 'gs.ia01', kind: 'open', dt: 'Payment Entry', name: PE_DRAFT, expect: 'allow', desc: 'auditor opens a Payment Entry (read granted)' },
  { id: 'C3', user: 'gs.ia01', kind: 'edit', dt: 'Payment Entry', name: PE_DRAFT, field: 'remarks', value: 'IA edit attempt', expect: 'deny', desc: 'auditor edits + saves a Payment Entry' },

  { id: 'Ar', user: 'gs.acc02', kind: 'open', dt: 'Sales Order', name: SO_DRAFT, expect: 'allow', desc: 'AR maker opens the draft Sales Order' },
  { id: 'E1', user: 'gs.acc02', kind: 'open', dt: 'Personal Data Register', name: PDR, expect: 'deny', desc: 'AR maker opens a Personal Data Register (HR/DPDP layer)' },
  { id: 'E2', user: 'gs.acc02', kind: 'open', dt: 'Payment Entry', name: PE_DRAFT, expect: 'deny', desc: 'AR maker opens a Payment Entry (banking sub-layer)' },
  { id: 'A2', user: 'gs.acc02', kind: 'submit', dt: 'Sales Order', name: SO_DRAFT, expect: 'deny', desc: 'AR maker tries to SUBMIT its own Sales Order' },

  { id: 'A4', user: 'gs.acc01', kind: 'create', dt: 'Sales Order', field: 'title', value: 'ACC01 create test', expect: 'deny', desc: 'reviewer tries to CREATE a Sales Order' },
  { id: 'A3', user: 'gs.acc01', kind: 'submit', dt: 'Sales Order', name: SO_DRAFT, expect: 'allow', desc: 'reviewer SUBMITs the same Sales Order' },

  { id: 'B1', user: 'gs.fin02', kind: 'edit', dt: 'Payment Entry', name: PE_DRAFT, field: 'remarks', value: 'FIN02 maker edit', expect: 'allow', desc: 'payment maker edits + saves the draft Payment Entry' },
  { id: 'B2', user: 'gs.fin02', kind: 'submit', dt: 'Payment Entry', name: PE_DRAFT, expect: 'deny', desc: 'payment maker tries to SUBMIT its own payment' },

  { id: 'B4', user: 'gs.fin03', kind: 'create', dt: 'Payment Entry', field: 'reference_no', value: 'FIN03-CREATE', expect: 'deny', desc: 'payment approver tries to CREATE a payment' },
  { id: 'B3', user: 'gs.fin03', kind: 'submit', dt: 'Payment Entry', name: PE_DRAFT, expect: 'allow', desc: 'payment approver SUBMITs the same payment' },

  { id: 'E3', user: 'gs.qahead', kind: 'edit', dt: 'Personal Data Register', name: PDR, field: 'purpose', value: 'QA head edit ' + Date.now(), expect: 'allow', desc: 'QA-HEAD (a System Manager) edits a Personal Data Register' },
];

async function main() {
  const exe = await puppeteer.executablePath();
  console.log('chrome:', exe);
  const browser = await puppeteer.launch({
    headless: false, slowMo: 12, executablePath: exe,
    args: ['--no-sandbox', '--window-size=1520,950', '--window-position=0,0'],
    defaultViewport: null, env: { ...process.env, DISPLAY: ':0' },
  });

  const groups = [];
  for (const t of PLAN) {
    let g = groups.find((x) => x.user === t.user);
    if (!g) groups.push((g = { user: t.user, tests: [] }));
    g.tests.push(t);
  }

  for (const g of groups) {
    const email = `${g.user}@gstest.local`;
    console.log(`\n===============  ${email}  ===============`);
    let session;
    try { session = await T(login(browser, email), 60000, 'login'); }
    catch (e) { g.tests.forEach((t) => record({ ...t, pass: null, observed: 'LOGIN FAIL: ' + e.message })); continue; }
    const { ctx, page } = session;
    for (const t of g.tests) {
      try {
        const job = t.kind === 'open' ? runOpen(page, t) : t.kind === 'submit' ? runSubmit(page, t) : runEditOrCreate(page, t);
        await T(job, 90000, 'test:' + t.id);
      } catch (e) {
        await shot(page, t.id + '_err');
        record({ ...t, pass: null, observed: 'EXCEPTION: ' + (e.message || e) });
        try { await page.goto(`${BASE}/app`, { waitUntil: 'domcontentloaded' }); } catch {}
      }
      await sleep(400);
    }
    try { await ctx.close(); } catch {}
  }

  const pass = results.filter((r) => r.pass === true).length;
  const fail = results.filter((r) => r.pass === false).length;
  const err = results.filter((r) => r.pass === null).length;
  console.log('\n\n===============  SUMMARY  ===============');
  for (const r of results) {
    const mark = r.pass === true ? 'PASS' : r.pass === false ? 'FAIL' : '????';
    console.log(`${mark}  ${r.id.padEnd(4)} ${r.user.padEnd(10)} expect=${(r.expect || '').padEnd(5)} ${r.desc}`);
  }
  console.log(`\n${pass} pass / ${fail} fail / ${err} error  of ${results.length}`);
  fs.writeFileSync(OUT + '/gs_ui_results.json', JSON.stringify(results, null, 2));
  await sleep(1000);
  await browser.close();
}
main().catch((e) => { console.error('FATAL', e); fs.writeFileSync(OUT + '/gs_ui_results.json', JSON.stringify(results, null, 2)); process.exit(1); });
