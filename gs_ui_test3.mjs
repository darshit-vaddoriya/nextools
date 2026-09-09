import puppeteer from 'puppeteer';
import fs from 'fs';

const BASE = 'http://localhost:8012';
const OUT = '/tmp/claude-1000/-home-darshit-smk-apps/c493ba98-31dc-4153-9620-b624ae703172/scratchpad';
const SHOT = OUT + '/shots3';
fs.rmSync(SHOT, { recursive: true, force: true });
fs.mkdirSync(SHOT, { recursive: true });

const CREDS = {
  'gs.ia01': 'GovTest@12345',
  'gs.acc01': 'GovTest@12345',
  'gs.fin03': 'GovTest@12345',
  'gs.acc02': 'GovTest@12345',
  Administrator: null, // filled from arg
};
const ADMIN_PWD = process.argv[2];

const SO_DRAFT = 'SMK/SO/LO/26-27/001';
const SO_SRC = 'SMK/SO/LO/25-26/001';
const PE_SRC = 'ACC-PAY-2025-00005';
const DN = 'DN-25-00005';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slug = (dt) => dt.toLowerCase().replace(/ /g, '-');
const DENY_RE = /not permitted|no permission|insufficient permission|do not have (?:enough )?permission|don't have (?:enough )?permission|not allowed to|sod|separation of dut|conflict/i;
const results = [];
function record(r) {
  results.push(r);
  const m = r.pass === true ? 'PASS' : r.pass === false ? 'FAIL' : '????';
  console.log(`${m}  ${r.id.padEnd(4)} ${r.user.padEnd(9)} ${r.desc}\n        => ${r.observed}`);
}
function T(p, ms, tag) { return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout:' + tag)), ms))]); }
const ev = (page, fn, arg, ms = 8000, tag = 'ev') => T(page.evaluate(fn, arg), ms, tag);
async function shot(page, id) { try { await T(page.screenshot({ path: `${SHOT}/${id}.png` }), 8000, 'shot'); } catch {} }

async function login(browser, user, pwd) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 1500, height: 900 });
  await T(page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' }), 30000, 'goto-login');
  await page.waitForSelector('#login_email', { timeout: 20000 });
  await page.type('#login_email', user.includes('@') || user === 'Administrator' ? user : `${user}@gstest.local`, { delay: 12 });
  await page.type('#login_password', pwd, { delay: 12 });
  await page.click('.btn-login');
  await T(page.waitForFunction(() => location.pathname.startsWith('/app'), { timeout: 30000 }), 32000, 'wait-app').catch(() => {});
  await sleep(1500);
  await ev(page, () => document.querySelectorAll('.modal.show [data-dismiss="modal"],.modal.show .btn-modal-close').forEach((b) => b.click()), null, 4000).catch(() => {});
  return { ctx, page };
}

async function state(page) {
  return await ev(page, () => {
    const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
    const modal = [...document.querySelectorAll('.modal.show,.modal.in')].map((m) => clean(m.innerText)).filter(Boolean);
    const alerts = [...document.querySelectorAll('.desk-alert,.alert-message,#alert-container .alert')].map((a) => clean(a.innerText)).filter(Boolean);
    const pageCard = clean((document.querySelector('.page-card') || {}).innerText);
    let route = '', docname = '', dirty = null, docstatus = null;
    try { route = frappe.get_route().join('/'); } catch {}
    try { docname = cur_frm && cur_frm.doc && cur_frm.doc.name || ''; } catch {}
    try { dirty = cur_frm ? !!cur_frm.is_dirty() : null; } catch {}
    try { docstatus = cur_frm && cur_frm.doc ? cur_frm.doc.docstatus : null; } catch {}
    const reportRows = (() => { try { return frappe.query_report && frappe.query_report.data ? frappe.query_report.data.length : null; } catch { return null; } })();
    const title = clean((document.querySelector('.title-area .title-text,.title-area h1') || {}).innerText);
    const indicator = clean((document.querySelector('.title-area .indicator-pill') || {}).innerText);
    const body = clean(document.body.innerText).slice(0, 300);
    return { modal, alerts, pageCard, route, docname, dirty, docstatus, reportRows, title, indicator, body };
  }, null, 8000, 'state');
}
function deny(st) {
  const hay = [st.pageCard, ...(st.modal || []), ...(st.alerts || []), st.body].join(' || ');
  const i = hay.search(DENY_RE);
  return i >= 0 ? hay.slice(Math.max(0, i - 45), i + 110) : null;
}
async function goto(page, url, waitSel) {
  await T(page.goto(url, { waitUntil: 'domcontentloaded' }), 30000, 'goto');
  await T(page.waitForFunction(() => document.querySelector('.title-area .title-text') || document.querySelector('.page-card') || document.querySelector('.modal.show') || document.querySelector('.report-wrapper,.dt-scrollable'), { timeout: 15000 }), 16000, 'wait').catch(() => {});
  await sleep(1800);
}
async function saveViaKb(page) {
  await page.keyboard.down('Control'); await page.keyboard.press('KeyS'); await page.keyboard.up('Control');
  await T(page.waitForFunction(() => {
    const b = document.body.innerText || '';
    if (/not permitted|no permission|do not have|don't have|sod|conflict|separation of dut/i.test(b)) return true;
    if (document.querySelector('#alert-container .alert,.desk-alert')) return true;
    if (window.cur_frm && !cur_frm.is_dirty() && cur_frm.doc && !cur_frm.doc.__islocal) return true;
    return false;
  }, { timeout: 8000 }), 9000, 'save').catch(() => {});
  await sleep(1000);
}

async function tEditDeny(page, t) { // open existing doc, edit field, expect deny
  await goto(page, `${BASE}/app/${slug(t.dt)}/${encodeURIComponent(t.name)}`);
  let st = await state(page);
  if (deny(st) || !st.docname) { await shot(page, t.id); return record({ ...t, pass: t.expect === 'deny', observed: `blocked at READ: ${deny(st) || 'no form'}` }); }
  const set = await ev(page, ({ f, v }) => { try { cur_frm.set_value(f, v); return { ok: true, dirty: !!cur_frm.is_dirty() }; } catch (e) { return { ok: false, e: String(e) }; } }, { f: t.field, v: t.value }, 6000).catch((e) => ({ ok: false, e: String(e) }));
  await sleep(500); await saveViaKb(page);
  st = await state(page); await shot(page, t.id);
  const d = deny(st);
  record({ ...t, pass: t.expect === 'deny' ? !!d : st.dirty === false && !d, observed: `set=${JSON.stringify(set)} dirtyAfter=${st.dirty} ${d ? 'DENY="' + d + '"' : 'no-deny'} ind="${st.indicator}"` });
}

async function tOpenDeny(page, t) {
  await goto(page, `${BASE}/app/${slug(t.dt)}/${encodeURIComponent(t.name)}`);
  const st = await state(page); await shot(page, t.id);
  const d = deny(st);
  const opened = !!st.docname && !d;
  record({ ...t, pass: t.expect === 'deny' ? (!!d || (!st.docname && !st.title)) && !opened : opened, observed: `route=${st.route} doc=${st.docname || '-'} title="${st.title}" ${d ? 'DENY="' + d + '"' : 'no-deny'}` });
}

async function tReport(page, t) {
  await goto(page, `${BASE}/app/query-report/${encodeURIComponent(t.report)}`);
  await sleep(3500);
  const st = await state(page); await shot(page, t.id);
  const d = deny(st);
  const ranOk = !d && (st.reportRows !== null || /report|no records|total|delivery/i.test(st.body));
  record({ ...t, pass: t.expect === 'allow' ? ranOk : !!d, observed: `route=${st.route} reportRows=${st.reportRows} ${d ? 'DENY="' + d + '"' : 'no-deny'} body="${st.body.slice(0, 110)}"` });
}

async function tDuplicateDeny(page, t) { // open src, copy_doc, set field, save -> expect create deny
  await goto(page, `${BASE}/app/${slug(t.dt)}/${encodeURIComponent(t.src)}`);
  let st = await state(page);
  if (!st.docname) { await shot(page, t.id); return record({ ...t, pass: null, observed: 'could not open source doc: ' + (deny(st) || st.body.slice(0, 120)) }); }
  await ev(page, () => cur_frm.copy_doc(), null, 8000).catch(() => {});
  await sleep(2500);
  st = await state(page);
  const set = await ev(page, ({ f, v }) => { try { cur_frm.set_value(f, v); return { ok: true, islocal: !!cur_frm.doc.__islocal }; } catch (e) { return { ok: false, e: String(e) }; } }, { f: t.field, v: t.value }, 6000).catch((e) => ({ ok: false, e: String(e) }));
  await sleep(500); await saveViaKb(page);
  st = await state(page); await shot(page, t.id);
  const d = deny(st);
  const created = !d && st.dirty === false && st.docname && !/new-/.test(st.docname);
  record({ ...t, pass: t.expect === 'deny' ? !!d && !created : created, observed: `set=${JSON.stringify(set)} doc=${st.docname || '-'} dirtyAfter=${st.dirty} ${d ? 'DENY="' + d + '"' : 'no-deny'}` });
}

async function tNewSoD(page, t) { // Administrator: new Role Seat Assignment -> expect SoD block on save
  await goto(page, `${BASE}/app/role-seat-assignment/new`);
  await sleep(1500);
  const set = await ev(page, (v) => new Promise(async (resolve) => {
    try {
      await cur_frm.set_value('user', v.user);
      await cur_frm.set_value('employee', v.employee);
      await cur_frm.set_value('role_seat', v.seat);
      await cur_frm.set_value('assignment_type', 'Primary');
      await cur_frm.set_value('status', 'Draft');
      await cur_frm.set_value('effective_from', v.from);
      await cur_frm.set_value('effective_to', v.to);
      resolve({ ok: true });
    } catch (e) { resolve({ ok: false, e: String(e) }); }
  }), t.vals, 15000).catch((e) => ({ ok: false, e: String(e) }));
  await sleep(800); await saveViaKb(page);
  const st = await state(page); await shot(page, t.id);
  const d = deny(st);
  record({ ...t, pass: t.expect === 'deny' ? !!d : st.dirty === false, observed: `set=${JSON.stringify(set)} dirtyAfter=${st.dirty} ${d ? 'DENY="' + d + '"' : 'no-deny'} modal=${JSON.stringify(st.modal).slice(0, 220)}` });
}

async function main() {
  const exe = await puppeteer.executablePath();
  const browser = await puppeteer.launch({ headless: false, slowMo: 12, executablePath: exe, args: ['--no-sandbox', '--window-size=1520,950', '--window-position=0,0'], defaultViewport: null, env: { ...process.env, DISPLAY: ':0' } });

  const today = new Date().toISOString().slice(0, 10);
  const nextyr = new Date(Date.now() + 364 * 864e5).toISOString().slice(0, 10);

  const groups = [
    { user: 'gs.ia01', pwd: 'GovTest@12345', tests: [
      { id: 'C2', kind: 'editDeny', dt: 'Sales Order', name: SO_DRAFT, field: 'po_no', value: 'IA edit SO', expect: 'deny', desc: 'auditor edits + saves a (draft) Sales Order' },
      { id: 'F2', kind: 'openDeny', dt: 'Delivery Note', name: DN, expect: 'deny', desc: 'Gate 7: auditor opens the Delivery Note document (output permit = report only)' },
      { id: 'F1', kind: 'report', report: 'Delivery Note Trends', expect: 'allow', desc: 'Gate 7: auditor runs a Delivery Note report (output permitted)' },
    ]},
    { user: 'gs.acc01', pwd: 'GovTest@12345', tests: [
      { id: 'A4d', kind: 'dupDeny', dt: 'Sales Order', src: SO_SRC, field: 'po_no', value: 'ACC01 dup', expect: 'deny', desc: 'reviewer duplicates a Sales Order and saves (create)' },
    ]},
    { user: 'gs.fin03', pwd: 'GovTest@12345', tests: [
      { id: 'B4d', kind: 'dupDeny', dt: 'Payment Entry', src: PE_SRC, field: 'reference_no', value: 'FIN03 dup', expect: 'deny', desc: 'payment approver duplicates a Payment Entry and saves (create)' },
    ]},
    { user: 'gs.acc02', pwd: 'GovTest@12345', tests: [
      { id: 'H', kind: 'openDeny', dt: 'Sales Order', name: SO_DRAFT, expect: 'deny', desc: 'time-bound: AR maker opens the draft SO AFTER its seat was expired (was allowed before)' },
    ]},
    { user: 'gs.qahead', pwd: 'GovTest@12345', tests: [
      { id: 'G', kind: 'newSoD', expect: 'deny', desc: 'SoD at assignment (as System Manager qahead): assign FIN-03 seat to payment maker gs.fin02',
        vals: { user: 'gs.fin02@gstest.local', employee: 'HR-REG-00013', seat: 'FIN-03', from: today, to: nextyr } },
    ]},
  ];

  for (const g of groups) {
    if (g.user === 'Administrator' && !g.pwd) { g.tests.forEach((t) => record({ ...t, user: g.user, pass: null, observed: 'no admin password provided' })); continue; }
    console.log(`\n===============  ${g.user}  ===============`);
    let s;
    try { s = await T(login(browser, g.user, g.pwd), 60000, 'login'); }
    catch (e) { g.tests.forEach((t) => record({ ...t, user: g.user, pass: null, observed: 'LOGIN FAIL: ' + e.message })); continue; }
    for (const t of g.tests) {
      t.user = g.user;
      try {
        const j = t.kind === 'editDeny' ? tEditDeny(s.page, t)
          : t.kind === 'openDeny' ? tOpenDeny(s.page, t)
          : t.kind === 'report' ? tReport(s.page, t)
          : t.kind === 'dupDeny' ? tDuplicateDeny(s.page, t)
          : tNewSoD(s.page, t);
        await T(j, 90000, 'test:' + t.id);
      } catch (e) { await shot(s.page, t.id + '_err'); record({ ...t, pass: null, observed: 'EXCEPTION: ' + (e.message || e) }); }
      await sleep(400);
    }
    try { await s.ctx.close(); } catch {}
  }

  console.log('\n===============  SUMMARY  ===============');
  for (const r of results) console.log(`${r.pass === true ? 'PASS' : r.pass === false ? 'FAIL' : '????'}  ${r.id.padEnd(4)} ${r.user.padEnd(10)} expect=${(r.expect || '').padEnd(5)} ${r.desc}`);
  const p = results.filter((r) => r.pass === true).length, f = results.filter((r) => r.pass === false).length, e = results.filter((r) => r.pass === null).length;
  console.log(`\n${p} pass / ${f} fail / ${e} error  of ${results.length}`);
  fs.writeFileSync(OUT + '/gs_ui_results3.json', JSON.stringify(results, null, 2));
  await sleep(1000);
  await browser.close();
}
main().catch((e) => { console.error('FATAL', e); fs.writeFileSync(OUT + '/gs_ui_results3.json', JSON.stringify(results, null, 2)); process.exit(1); });
