import puppeteer from 'puppeteer';
import fs from 'fs';

const BASE = 'http://localhost:8012';
const PWD = 'GovTest@12345';
const SHOT = '/tmp/claude-1000/-home-darshit-smk-apps/c493ba98-31dc-4153-9620-b624ae703172/scratchpad/shots';
fs.mkdirSync(SHOT, { recursive: true });

const SO_DRAFT = 'SMK/SO/LO/26-27/001';
const SO_SUBMITTED = 'SMK/SO/LO/25-26/001';
const PE_DRAFT = 'ACC-PAY-2026-00002';
const PDR = 'PDR-2026-0001';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const routeOf = (dt, name) =>
  `${BASE}/app/${dt.toLowerCase().replace(/ /g, '-')}/${encodeURIComponent(name)}`;
const newRoute = (dt) => `${BASE}/app/${dt.toLowerCase().replace(/ /g, '-')}/new`;

const results = [];

function record(r) {
  results.push(r);
  const mark = r.pass === true ? 'PASS' : r.pass === false ? 'FAIL' : '????';
  console.log(
    `${mark}  ${r.id.padEnd(4)} ${r.user.padEnd(9)} ${r.desc}\n        -> ${r.observed}`
  );
}

async function login(browser, email) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 1500, height: 900 });
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle2' });
  await page.waitForSelector('#login_email', { timeout: 20000 });
  await page.type('#login_email', email, { delay: 20 });
  await page.type('#login_password', PWD, { delay: 20 });
  await Promise.all([
    page.click('.btn-login'),
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {}),
  ]);
  await sleep(1500);
  // dismiss any onboarding/whats-new modal
  await dismissModals(page);
  return { ctx, page };
}

async function dismissModals(page) {
  try {
    await page.evaluate(() => {
      document.querySelectorAll('.modal.show .btn-modal-close, .modal.show [data-dismiss="modal"]').forEach((b) => b.click());
    });
  } catch {}
  await sleep(300);
}

async function readState(page) {
  return await page.evaluate(() => {
    const txt = (document.body.innerText || '').replace(/\s+/g, ' ').trim();
    const modal = Array.from(document.querySelectorAll('.modal.show, .modal.in'))
      .map((m) => (m.innerText || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    const alerts = Array.from(document.querySelectorAll('.desk-alert, .alert, .toast'))
      .map((a) => (a.innerText || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    const pageCardTitle = (document.querySelector('.page-card .page-card-head, .page-card h1, .page-card .head') || {}).innerText || '';
    let route = '';
    let docname = '';
    let dirty = null;
    try { route = (window.frappe && frappe.get_route && frappe.get_route().join('/')) || ''; } catch {}
    try { docname = (window.cur_frm && cur_frm.doc && cur_frm.doc.name) || ''; } catch {}
    try { dirty = window.cur_frm ? !!cur_frm.is_dirty() : null; } catch {}
    const indicator = (document.querySelector('.title-area .indicator-pill') || {}).innerText || '';
    return { bodySnippet: txt.slice(0, 400), modal, alerts, pageCardTitle, route, docname, indicator, dirty };
  });
}

const DENY_RE = /not permitted|no permission|insufficient permission|do not have enough permission|don't have enough permission|not allowed to (?:create|submit|write|edit)/i;

function looksDenied(st) {
  const hay = [st.pageCardTitle, ...(st.modal || []), ...(st.alerts || []), st.bodySnippet].join(' || ');
  return DENY_RE.test(hay);
}

async function openDoc(page, dt, name) {
  await page.goto(routeOf(dt, name), { waitUntil: 'networkidle2', timeout: 30000 });
  await sleep(2000);
  await dismissModals(page);
  await sleep(500);
  return readState(page);
}

// try to set a field then save via the form; returns state after save attempt
async function editAndSave(page, fieldname, value) {
  const setRes = await page.evaluate(
    async ({ fieldname, value }) => {
      if (!window.cur_frm) return { ok: false, why: 'no cur_frm' };
      try {
        await cur_frm.set_value(fieldname, value);
      } catch (e) {
        return { ok: false, why: 'set_value threw: ' + (e.message || e) };
      }
      return { ok: true, dirty: !!cur_frm.is_dirty() };
    },
    { fieldname, value }
  );
  await sleep(600);
  const saveRes = await page.evaluate(async () => {
    if (!window.cur_frm) return { ok: false, why: 'no cur_frm' };
    try {
      await cur_frm.save();
      return { ok: true, error: null };
    } catch (e) {
      return { ok: false, error: (e && (e.message || String(e))) || 'rejected' };
    }
  });
  await sleep(1500);
  const st = await readState(page);
  return { setRes, saveRes, st };
}

async function clickSubmit(page) {
  // Frappe: primary action button in page becomes "Submit"; then a confirm dialog.
  const clicked = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.page-actions .primary-action, .page-actions button'))
      .find((b) => /submit/i.test(b.innerText));
    if (btn) { btn.click(); return true; }
    if (window.cur_frm && cur_frm.savesubmit) { cur_frm.savesubmit(); return 'api'; }
    return false;
  });
  await sleep(1200);
  // confirm dialog
  await page.evaluate(() => {
    const yes = Array.from(document.querySelectorAll('.modal.show .btn-primary, .modal.show .btn-modal-primary'))
      .find((b) => b.offsetParent !== null);
    if (yes) yes.click();
  });
  await sleep(2500);
  const st = await readState(page);
  return { clicked, st };
}

async function shot(page, id) {
  try { await page.screenshot({ path: `${SHOT}/${id}.png`, fullPage: false }); } catch {}
}

async function main() {
  const exe = await puppeteer.executablePath();
  console.log('chrome:', exe);
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 35,
    executablePath: exe,
    args: ['--start-maximized', '--no-sandbox', '--window-size=1500,950', '--window-position=0,0'],
    defaultViewport: null,
    env: { ...process.env, DISPLAY: ':0' },
  });

  const plan = [
    // D. No policy = no access
    { id: 'D1', user: 'gs.nobody', kind: 'open', dt: 'Sales Order', name: SO_SUBMITTED, expect: 'deny',
      desc: 'nobody opens a Sales Order (holds native Sales User)' },
    { id: 'D2', user: 'gs.nobody', kind: 'open', dt: 'Payment Entry', name: PE_DRAFT, expect: 'deny',
      desc: 'nobody opens a Payment Entry (holds native Accounts User)' },

    // C. Audit independence  (ia01 = read-only on SO + PE)
    { id: 'C1', user: 'gs.ia01', kind: 'open', dt: 'Sales Order', name: SO_SUBMITTED, expect: 'allow',
      desc: 'auditor opens a Sales Order (read granted)' },
    { id: 'C2', user: 'gs.ia01', kind: 'edit', dt: 'Sales Order', name: SO_SUBMITTED, field: 'po_no',
      value: 'IA-EDIT-TEST', expect: 'deny', desc: 'auditor edits + saves a Sales Order' },
    { id: 'C3', user: 'gs.ia01', kind: 'edit', dt: 'Payment Entry', name: PE_DRAFT, field: 'remarks',
      value: 'IA edit test', expect: 'deny', desc: 'auditor edits + saves a Payment Entry' },

    // A. Maker / checker on Sales Order
    { id: 'A-r', user: 'gs.acc02', kind: 'open', dt: 'Sales Order', name: SO_DRAFT, expect: 'allow',
      desc: 'AR maker opens the draft Sales Order (create+edit granted)' },
    { id: 'A2', user: 'gs.acc02', kind: 'submit', dt: 'Sales Order', name: SO_DRAFT, expect: 'deny',
      desc: 'AR maker tries to SUBMIT its own Sales Order' },
    { id: 'A4', user: 'gs.acc01', kind: 'create', dt: 'Sales Order', field: 'title', value: 'ACC01 create test',
      expect: 'deny', desc: 'reviewer tries to CREATE a Sales Order' },
    { id: 'A3', user: 'gs.acc01', kind: 'submit', dt: 'Sales Order', name: SO_DRAFT, expect: 'allow',
      desc: 'reviewer SUBMITs the same Sales Order' },

    // B. Payment maker vs approver (no workflow on Payment Entry -> clean submit test)
    { id: 'B-r', user: 'gs.fin02', kind: 'edit', dt: 'Payment Entry', name: PE_DRAFT, field: 'remarks',
      value: 'FIN02 maker edit', expect: 'allow', desc: 'payment maker edits + saves the draft Payment Entry' },
    { id: 'B2', user: 'gs.fin02', kind: 'submit', dt: 'Payment Entry', name: PE_DRAFT, expect: 'deny',
      desc: 'payment maker tries to SUBMIT its own payment' },
    { id: 'B4', user: 'gs.fin03', kind: 'create', dt: 'Payment Entry', field: 'reference_no', value: 'FIN03-CREATE',
      expect: 'deny', desc: 'payment approver tries to CREATE a payment' },
    { id: 'B3', user: 'gs.fin03', kind: 'submit', dt: 'Payment Entry', name: PE_DRAFT, expect: 'allow',
      desc: 'payment approver SUBMITs the same payment' },

    // E. Cross-layer isolation
    { id: 'E1', user: 'gs.acc02', kind: 'open', dt: 'Personal Data Register', name: PDR, expect: 'deny',
      desc: 'finance maker opens a Personal Data Register (HR/DPDP layer)' },
    { id: 'E2', user: 'gs.acc02', kind: 'open', dt: 'Payment Entry', name: PE_DRAFT, expect: 'deny',
      desc: 'AR maker opens a Payment Entry (banking sub-layer)' },
    { id: 'E3', user: 'gs.qahead', kind: 'edit', dt: 'Personal Data Register', name: PDR, field: 'purpose',
      value: 'QA head edit ' + Date.now(), expect: 'allow',
      desc: 'QA-HEAD (a System Manager) edits a Personal Data Register' },
  ];

  // group by user, fresh incognito context per user
  const byUser = [];
  for (const t of plan) {
    let g = byUser.find((x) => x.user === t.user);
    if (!g) { g = { user: t.user, tests: [] }; byUser.push(g); }
    g.tests.push(t);
  }

  for (const g of byUser) {
    const email = `${g.user}@gstest.local`;
    console.log(`\n==================  logging in as ${email}  ==================`);
    let session;
    try {
      session = await login(browser, email);
    } catch (e) {
      for (const t of g.tests) record({ ...t, pass: null, observed: 'LOGIN FAILED: ' + e.message });
      continue;
    }
    const { ctx, page } = session;

    for (const t of g.tests) {
      try {
        if (t.kind === 'open') {
          const st = await openDoc(page, t.dt, t.name);
          await shot(page, t.id);
          const denied = looksDenied(st) || (st.route && !st.route.includes(t.dt.toLowerCase().replace(/ /g, '-')) && !st.docname);
          const opened = !!st.docname && !looksDenied(st);
          const pass = t.expect === 'deny' ? denied && !opened : opened;
          record({ ...t, pass,
            observed: `route=${st.route || '-'} docname=${st.docname || '-'} card="${st.pageCardTitle}" modal=${JSON.stringify(st.modal).slice(0,180)} body="${st.bodySnippet.slice(0,120)}"` });
        } else if (t.kind === 'edit') {
          const open = await openDoc(page, t.dt, t.name);
          if (looksDenied(open) || !open.docname) {
            await shot(page, t.id);
            record({ ...t, pass: t.expect === 'deny',
              observed: `blocked already at READ: card="${open.pageCardTitle}" body="${open.bodySnippet.slice(0,120)}"` });
            continue;
          }
          const { setRes, saveRes, st } = await editAndSave(page, t.field, t.value);
          await shot(page, t.id);
          const denied = !saveRes.ok && (DENY_RE.test(saveRes.error || '') || looksDenied(st));
          const saved = saveRes.ok && !looksDenied(st);
          const pass = t.expect === 'deny' ? denied : saved;
          record({ ...t, pass,
            observed: `set=${JSON.stringify(setRes)} save=${JSON.stringify(saveRes).slice(0,200)} indicator="${st.indicator}" modal=${JSON.stringify(st.modal).slice(0,160)}` });
        } else if (t.kind === 'submit') {
          const open = await openDoc(page, t.dt, t.name);
          if (looksDenied(open) || !open.docname) {
            await shot(page, t.id);
            record({ ...t, pass: t.expect === 'deny',
              observed: `blocked already at READ: body="${open.bodySnippet.slice(0,140)}"` });
            continue;
          }
          const before = await page.evaluate(() => (window.cur_frm && cur_frm.doc.docstatus) || 0);
          const { clicked, st } = await clickSubmit(page);
          const after = await page.evaluate(() => (window.cur_frm && cur_frm.doc && cur_frm.doc.docstatus) || 0);
          await shot(page, t.id);
          const denied = looksDenied(st) && after !== 1;
          const submitted = after === 1 && before !== 1;
          const pass = t.expect === 'deny' ? denied : submitted;
          record({ ...t, pass,
            observed: `clicked=${clicked} docstatus ${before}->${after} modal=${JSON.stringify(st.modal).slice(0,200)} alerts=${JSON.stringify(st.alerts).slice(0,120)}` });
        } else if (t.kind === 'create') {
          await page.goto(newRoute(t.dt), { waitUntil: 'networkidle2', timeout: 30000 });
          await sleep(2500);
          await dismissModals(page);
          const preState = await readState(page);
          if (looksDenied(preState)) {
            await shot(page, t.id);
            record({ ...t, pass: t.expect === 'deny',
              observed: `blocked at NEW route: body="${preState.bodySnippet.slice(0,140)}"` });
            continue;
          }
          const { setRes, saveRes, st } = await editAndSave(page, t.field, t.value);
          await shot(page, t.id);
          const denied = !saveRes.ok && (DENY_RE.test(saveRes.error || '') || looksDenied(st));
          const created = saveRes.ok && !looksDenied(st) && !!st.docname;
          const pass = t.expect === 'deny' ? denied : created;
          record({ ...t, pass,
            observed: `set=${JSON.stringify(setRes)} save=${JSON.stringify(saveRes).slice(0,220)} modal=${JSON.stringify(st.modal).slice(0,160)}` });
        }
      } catch (e) {
        await shot(page, t.id + '_err');
        record({ ...t, pass: null, observed: 'EXCEPTION: ' + (e.message || e) });
      }
      await sleep(400);
    }

    await ctx.close();
  }

  console.log('\n\n================  SUMMARY  ================');
  const pass = results.filter((r) => r.pass === true).length;
  const fail = results.filter((r) => r.pass === false).length;
  const err = results.filter((r) => r.pass === null).length;
  for (const r of results) {
    const mark = r.pass === true ? 'PASS' : r.pass === false ? 'FAIL' : '????';
    console.log(`${mark}  ${r.id.padEnd(4)} ${r.user.padEnd(9)} expect=${(r.expect||'').padEnd(5)} ${r.desc}`);
  }
  console.log(`\n${pass} pass / ${fail} fail / ${err} error  of ${results.length}`);
  fs.writeFileSync(SHOT + '/../gs_ui_results.json', JSON.stringify(results, null, 2));

  await sleep(1500);
  await browser.close();
}

main().catch((e) => { console.error('FATAL', e); process.exit(1); });
