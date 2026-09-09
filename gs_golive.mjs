import puppeteer from 'puppeteer';
import fs from 'fs';
import { execSync } from 'child_process';

const BASE = 'http://localhost:8012';
const OUT = '/tmp/claude-1000/-home-darshit-smk-apps/c493ba98-31dc-4153-9620-b624ae703172/scratchpad';
const SHOT = OUT + '/shots_golive';
fs.rmSync(SHOT, { recursive: true, force: true });
fs.mkdirSync(SHOT, { recursive: true });
const ADMIN_PWD = 'Sanskar';
const NEW_EMAIL = 'gs.newjoiner@gstest.local';
const NEW_PWD = 'GoLive@12345';
const SEAT = 'ACC-02';
const SO_SRC = 'SMK/SO/LO/25-26/001';
const PE_ANY = 'ACC-PAY-2026-00002';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slug = (dt) => dt.toLowerCase().replace(/ /g, '-');
const today = new Date().toISOString().slice(0, 10);
const nextyr = new Date(Date.now() + 364 * 864e5).toISOString().slice(0, 10);
const DENY = /not permitted|no permission|do not have (?:enough )?permission|don't have (?:enough )?permission|not allowed to|does not have doctype access|no role seat/i;
const R = [];
const rec = (id, desc, pass, obs) => { R.push({ id, desc, pass, obs }); console.log(`${pass === true ? 'PASS' : pass === false ? 'FAIL' : '????'}  ${id.padEnd(6)} ${desc}\n        => ${obs}`); };
const T = (p, ms, t) => Promise.race([p, new Promise((_, j) => setTimeout(() => j(new Error('timeout:' + t)), ms))]);
const ev = (pg, fn, a, ms = 12000, t = 'ev') => T(pg.evaluate(fn, a), ms, t);
let n = 0;
const shot = async (pg, nm) => { try { await T(pg.screenshot({ path: `${SHOT}/${String(++n).padStart(2, '0')}_${nm}.png` }), 8000, 's'); } catch {} };
const bench = (fn) => execSync(`cd /home/darshit/smk && bench --site smk.local execute governance_security.gs_uat_tmp.${fn} 2>&1`).toString();

async function login(browser, user, pwd) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 1500, height: 900 });
  await T(page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' }), 30000, 'gl');
  await page.waitForSelector('#login_email', { timeout: 20000 });
  await page.type('#login_email', user, { delay: 12 });
  await page.type('#login_password', pwd, { delay: 12 });
  await page.click('.btn-login');
  const ok = await T(page.waitForFunction(() => location.pathname.startsWith('/app'), { timeout: 30000 }), 32000, 'wa').then(() => true).catch(() => false);
  await sleep(1500);
  await ev(page, () => document.querySelectorAll('.modal.show [data-dismiss="modal"],.modal.show .btn-modal-close').forEach((b) => b.click()), null, 4000).catch(() => {});
  console.log(`  · login ${user} -> ${ok ? 'OK' : 'FAILED'}`);
  return { ctx, page, ok };
}
async function openForm(page, dt, name) {
  await T(page.goto(`${BASE}/app/${slug(dt)}/${encodeURIComponent(name)}`, { waitUntil: 'domcontentloaded' }), 30000, 'g');
  await T(page.waitForFunction(() => document.querySelector('.title-area .title-text') || document.querySelector('.page-card') || document.querySelector('.modal.show'), { timeout: 15000 }), 16000, 'w').catch(() => {});
  await sleep(1800);
}
async function st(page) {
  return await ev(page, () => {
    const c = (s) => (s || '').replace(/\s+/g, ' ').trim();
    return {
      docname: (() => { try { return cur_frm.doc.name; } catch { return ''; } })(),
      doc: (() => { try { return JSON.parse(JSON.stringify(cur_frm.doc)); } catch { return {}; } })(),
      dirty: (() => { try { return !!cur_frm.is_dirty(); } catch { return null; } })(),
      docstatus: (() => { try { return cur_frm.doc.docstatus; } catch { return null; } })(),
      modal: [...document.querySelectorAll('.modal.show')].map((m) => c(m.innerText)).filter(Boolean),
      body: c(document.body.innerText).slice(0, 300),
    };
  }, null, 10000, 'st');
}
const deny = (s) => { const h = [...(s.modal || []), s.body].join(' || '); const i = h.search(DENY); return i >= 0 ? h.slice(Math.max(0, i - 45), i + 120) : null; };
async function setF(page, o) {
  return await ev(page, (obj) => new Promise(async (res) => { try { for (const [k, v] of Object.entries(obj)) await cur_frm.set_value(k, v); res({ ok: true }); } catch (e) { res({ ok: false, e: String(e && (e.message || e)) }); } }), o, 20000, 'sf').catch((e) => ({ ok: false, e: String(e) }));
}
async function save(page) { const r = await ev(page, () => new Promise((res) => cur_frm.save().then(() => res({ ok: true })).catch((e) => res({ ok: false, e: String(e && (e.message || e)) }))), null, 25000, 'sv').catch((e) => ({ ok: false, e: String(e) })); await sleep(1500); return r; }
async function wf(page, action) {
  const r = await ev(page, (a) => new Promise((res) => frappe.xcall('frappe.model.workflow.apply_workflow', { doc: cur_frm.doc, action: a }).then((d) => res({ ok: true, state: d && (d.final_status || d.workflow_state) })).catch((e) => res({ ok: false, e: String(e && (e.message || e)) }))), action, 20000, 'wf').catch((e) => ({ ok: false, e: String(e) }));
  await sleep(1500); return r;
}
async function clickSubmit(page) {
  await ev(page, () => { const b = [...document.querySelectorAll('.page-actions button')].find((x) => x.offsetParent && /^\s*submit\s*$/i.test(x.innerText)); if (b) b.click(); }, null, 5000).catch(() => {});
  await sleep(1200);
  await ev(page, () => { const y = [...document.querySelectorAll('.modal.show .btn-primary,.modal.show .btn-modal-primary')].find((b) => b.offsetParent); if (y) y.click(); }, null, 4000).catch(() => {});
  await sleep(2500);
}

async function main() {
  const exe = await puppeteer.executablePath();
  const browser = await puppeteer.launch({ headless: false, slowMo: 28, executablePath: exe, args: ['--no-sandbox', '--window-size=1520,950', '--window-position=0,0'], defaultViewport: null, env: { ...process.env, DISPLAY: ':0' } });

  // ================= STAGE A : IT / HR provisions the account (as Administrator) =================
  console.log('\n########  GO-LIVE ONBOARDING — new joiner, AR-maker (ACC-02) seat  ########');
  console.log('\n=== STAGE A: provision Employee + User (Administrator) ===');
  const a = await login(browser, 'Administrator', ADMIN_PWD);

  // A1 - Employee
  await T(a.page.goto(`${BASE}/app/employee/new`, { waitUntil: 'domcontentloaded' }), 30000, 'g'); await sleep(2500);
  const eSet = await setF(a.page, { first_name: 'Priya', last_name: 'Newjoiner', company: 'SMK Petrochemicals India Private Limited', date_of_joining: today, date_of_birth: '1995-05-05', gender: 'Prefer not to say', status: 'Active', user_id: NEW_EMAIL });
  await sleep(400);
  // Employee often needs ignore_mandatory-ish fields; try save, fall back
  let eSave = await save(a.page);
  let es = await st(a.page); await shot(a.page, 'A1_employee');
  const empName = es.docname;
  rec('A1', 'HR creates the Employee master (linked to the new login by user_id)', eSave.ok && !!empName && !/new-/.test(empName), `set=${JSON.stringify(eSet)} saved=${JSON.stringify(eSave)} employee=${empName}`);

  // A2 - User
  await T(a.page.goto(`${BASE}/app/user/new`, { waitUntil: 'domcontentloaded' }), 30000, 'g'); await sleep(2500);
  const uSet = await setF(a.page, { email: NEW_EMAIL, first_name: 'Priya', last_name: 'Newjoiner', user_type: 'System User', send_welcome_email: 0, role_profile_name: 'Accounts', new_password: NEW_PWD });
  await sleep(400);
  await ev(a.page, () => { if (!(cur_frm.doc.roles || []).some((r) => r.role === 'Sales User')) { cur_frm.add_child('roles', { role: 'Sales User' }); cur_frm.refresh_field('roles'); cur_frm.dirty(); } }, null, 6000).catch(() => {});
  await sleep(400);
  let uSave = await save(a.page);
  let us = await st(a.page); await shot(a.page, 'A2_user');
  rec('A2', 'IT creates the User: System User, Role Profile "Accounts" (native security layer) + native "Sales User" role, no welcome email', uSave.ok && us.docname === NEW_EMAIL, `set=${JSON.stringify(uSet)} saved=${JSON.stringify(uSave)} roleprofile=${us.doc.role_profile_name}`);
  await a.ctx.close();

  // ================= STAGE B : Day-0 — account works, but grants NOTHING governed =================
  console.log('\n=== STAGE B: new joiner logs in on day 0 — has login + native roles but NO Role Seat yet ===');
  const b = await login(browser, NEW_EMAIL, NEW_PWD);
  rec('B0', 'the new joiner can log into the desk', b.ok, `login ok=${b.ok}`);
  await openForm(b.page, 'Sales Order', SO_SRC);
  let bs = await st(b.page); await shot(b.page, 'B1_day0_blocked');
  const d0 = deny(bs);
  rec('B1', 'on day 0 (no Role Seat, no Access Request) the new joiner is BLOCKED from Sales Order despite holding the native Sales User role', (!!d0 || !bs.docname), `doc=${bs.docname || '-'} ${d0 ? 'DENY="' + d0 + '"' : 'body="' + bs.body.slice(0, 90) + '"'}`);
  await b.ctx.close();

  // ================= STAGE C : access granted through the Access Request workflow =================
  console.log('\n=== STAGE C: Access Request raised, SoD-checked, approved and applied (Administrator) ===');
  const c = await login(browser, 'Administrator', ADMIN_PWD);
  await T(c.page.goto(`${BASE}/app/access-request/new`, { waitUntil: 'domcontentloaded' }), 30000, 'g'); await sleep(2500);
  await setF(c.page, { request_type: 'New', user: NEW_EMAIL, employee: empName, role_seat: SEAT, business_reason: 'GO-LIVE-UAT onboard Priya as AR maker', effective_from: today, effective_to: nextyr });
  await sleep(500);
  const cSave = await save(c.page);
  let cs = await st(c.page); await shot(c.page, 'C1_access_request');
  rec('C1', `Access Request created for the new joiner (seat ${SEAT}), SoD auto-check = Pass`, cSave.ok && cs.doc.sod_check_result === 'Pass', `saved=${JSON.stringify(cSave)} name=${cs.docname} sod=${cs.doc.sod_check_result}`);

  for (const act of ['Send for Approval', 'Approve', 'Apply']) {
    const w = await wf(c.page, act);
    await c.page.reload({ waitUntil: 'domcontentloaded' }); await sleep(2500);
    cs = await st(c.page);
    console.log(`     workflow ${act}: ${JSON.stringify(w)} -> ${cs.doc.final_status}`);
  }
  await shot(c.page, 'C2_applied');
  const rsa = cs.doc.resulting_role_seat_assignment;
  rec('C2', 'Access Request Applied → a submitted Role Seat Assignment is created for the new joiner', cs.doc.final_status === 'Applied' && !!rsa, `final_status=${cs.doc.final_status} rsa=${rsa}`);
  if (rsa) {
    await openForm(c.page, 'Role Seat Assignment', rsa);
    const rs = await st(c.page); await shot(c.page, 'C3_rsa');
    rec('C3', 'the Role Seat Assignment is live: submitted, Active, training gate passed, inside its date window', rs.doc.docstatus === 1 && rs.doc.status === 'Active' && rs.doc.training_gate_passed == 1, `docstatus=${rs.doc.docstatus} status=${rs.doc.status} tgp=${rs.doc.training_gate_passed} ${rs.doc.effective_from}..${rs.doc.effective_to}`);
  }
  await c.ctx.close();

  // ================= STAGE D : the new joiner can now work — within seat scope only =================
  console.log('\n=== STAGE D: new joiner logs back in — now has ACC-02 access, and only that ===');
  const d = await login(browser, NEW_EMAIL, NEW_PWD);
  await openForm(d.page, 'Sales Order', SO_SRC);
  let ds = await st(d.page); await shot(d.page, 'D1_can_read_SO');
  rec('D1', 'the new joiner can now OPEN a Sales Order (seat ACC-02 grants read + create + edit)', !!ds.docname && !deny(ds), `doc=${ds.docname || '-'}`);

  // D2 - create via Duplicate
  await ev(d.page, () => cur_frm.copy_doc(), null, 8000).catch(() => {});
  await sleep(2500);
  await ev(d.page, () => { try { cur_frm.set_value('title', 'NEWJOINER go-live create test'); } catch {} }, null, 6000).catch(() => {});
  await sleep(500);
  const dSave = await save(d.page);
  ds = await st(d.page); await shot(d.page, 'D2_create_SO');
  rec('D2', 'the new joiner can CREATE a Sales Order (ACC-02 = maker)', dSave.ok && !!ds.docname && !/new-/.test(ds.docname) && !deny(ds), `saved=${JSON.stringify(dSave)} doc=${ds.docname || '-'}`);

  // D3 - submit blocked
  if (dSave.ok && ds.docname && !/new-/.test(ds.docname)) {
    const before = ds.docstatus;
    await clickSubmit(d.page);
    ds = await st(d.page); await shot(d.page, 'D3_submit_blocked');
    const d3 = deny(ds);
    rec('D3', 'the new joiner CANNOT submit it — maker/checker split (submit needs the ACC-01 seat)', !!d3 && ds.docstatus !== 1, `docstatus ${before}->${ds.docstatus} ${d3 ? 'DENY="' + d3 + '"' : 'no-deny'}`);
  } else {
    rec('D3', 'submit-blocked check skipped (create did not land a saved doc)', null, `doc=${ds.docname}`);
  }

  // D4 - out of scope doctype
  await openForm(d.page, 'Payment Entry', PE_ANY);
  ds = await st(d.page); await shot(d.page, 'D4_payment_blocked');
  const d4 = deny(ds);
  rec('D4', 'the new joiner CANNOT open a Payment Entry — outside the ACC-02 seat scope', (!!d4 || !ds.docname), `doc=${ds.docname || '-'} ${d4 ? 'DENY="' + d4 + '"' : 'body="' + ds.body.slice(0, 90) + '"'}`);
  await d.ctx.close();

  console.log('\n########  SUMMARY  ########');
  for (const r of R) console.log(`${r.pass === true ? 'PASS' : r.pass === false ? 'FAIL' : '????'}  ${r.id.padEnd(6)} ${r.desc}`);
  const p = R.filter((r) => r.pass === true).length, f = R.filter((r) => r.pass === false).length, e = R.filter((r) => r.pass === null).length;
  console.log(`\n${p} pass / ${f} fail / ${e} error  of ${R.length}`);
  fs.writeFileSync(OUT + '/gs_golive_results.json', JSON.stringify(R, null, 2));
  console.log('\n[teardown]');
  console.log(bench('golive_teardown').trim().split('\n').pop());
  await sleep(1500);
  await browser.close();
}
main().catch((e) => { console.error('FATAL', e); fs.writeFileSync(OUT + '/gs_golive_results.json', JSON.stringify(R, null, 2)); try { execSync(`cd /home/darshit/smk && bench --site smk.local execute governance_security.gs_uat_tmp.golive_teardown 2>&1`); } catch {} process.exit(1); });
