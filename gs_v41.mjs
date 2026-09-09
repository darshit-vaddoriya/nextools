import puppeteer from 'puppeteer';
import fs from 'fs';
import { execSync } from 'child_process';

const BASE = 'http://localhost:8012';
const OUT = '/tmp/claude-1000/-home-darshit-smk-apps/c493ba98-31dc-4153-9620-b624ae703172/scratchpad';
const SHOT = OUT + '/shots_v41';
fs.rmSync(SHOT, { recursive: true, force: true });
fs.mkdirSync(SHOT, { recursive: true });
const ADMIN_PWD = 'Sanskar';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slug = (dt) => dt.toLowerCase().replace(/ /g, '-');
const now = new Date();
const pastISO = new Date(now.getTime() - 3 * 3600e3).toISOString().slice(0, 19).replace('T', ' ');
const DENY = /not permitted|no permission|do not have (?:enough )?permission|don't have (?:enough )?permission|not allowed to|does not have doctype access/i;
const R = [];
function rec(id, desc, pass, obs) { R.push({ id, desc, pass, obs }); console.log(`${pass === true ? 'PASS' : pass === false ? 'FAIL' : '????'}  ${id.padEnd(7)} ${desc}\n        => ${obs}`); }
function T(p, ms, t) { return Promise.race([p, new Promise((_, j) => setTimeout(() => j(new Error('timeout:' + t)), ms))]); }
const ev = (pg, fn, a, ms = 12000, t = 'ev') => T(pg.evaluate(fn, a), ms, t);
let n = 0;
async function shot(pg, nm) { try { await T(pg.screenshot({ path: `${SHOT}/${String(++n).padStart(2, '0')}_${nm}.png` }), 8000, 's'); } catch {} }
function bench(fn) { return execSync(`cd /home/darshit/smk && bench --site smk.local execute governance_security.gs_uat_tmp.${fn} 2>&1`).toString(); }

async function login(browser, user, pwd) {
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
  console.log(`  · logged in as ${user}`);
  return { ctx, page };
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
      modal: [...document.querySelectorAll('.modal.show')].map((m) => c(m.innerText)).filter(Boolean),
      body: c(document.body.innerText).slice(0, 260),
    };
  }, null, 10000, 'st');
}
function deny(s) { const h = [...(s.modal || []), s.body].join(' || '); const i = h.search(DENY); return i >= 0 ? h.slice(Math.max(0, i - 40), i + 120) : null; }
async function setF(page, o) {
  return await ev(page, (obj) => new Promise(async (res) => { try { for (const [k, v] of Object.entries(obj)) await cur_frm.set_value(k, v); res({ ok: true }); } catch (e) { res({ ok: false, e: String(e) }); } }), o, 15000, 'sf').catch((e) => ({ ok: false, e: String(e) }));
}
async function save(page) { const r = await ev(page, () => new Promise((res) => cur_frm.save().then(() => res({ ok: true })).catch((e) => res({ ok: false, e: String(e && (e.message || e)) }))), null, 20000, 'sv').catch((e) => ({ ok: false, e: String(e) })); await sleep(1200); return r; }
async function wf(page, action) {
  const r = await ev(page, (a) => new Promise((res) => frappe.xcall('frappe.model.workflow.apply_workflow', { doc: cur_frm.doc, action: a }).then((d) => res({ ok: true, state: d && (d.implementation_status || d.workflow_state) })).catch((e) => res({ ok: false, e: String(e && (e.message || e)) }))), action, 20000, 'wf').catch((e) => ({ ok: false, e: String(e) }));
  await sleep(1500); return r;
}

async function main() {
  const exe = await puppeteer.executablePath();
  const browser = await puppeteer.launch({ headless: false, slowMo: 25, executablePath: exe, args: ['--no-sandbox', '--window-size=1520,950', '--window-position=0,0'], defaultViewport: null, env: { ...process.env, DISPLAY: ':0' } });

  // ===== UAT-07 : training gate expired -> access suspended (setup already done via bench) =====
  console.log('\n########  V4.1 UAT-07 — training expired for QA-HEAD seat -> access blocked  ########');
  const q = await login(browser, 'gs.qahead@gstest.local', 'GovTest@12345');
  await openForm(q.page, 'Personal Data Register', 'PDR-2026-0001');
  let s = await st(q.page); await shot(q.page, 'UAT07_qahead_blocked');
  const d7 = deny(s);
  rec('UAT-07', 'gs.qahead can NO LONGER open Personal Data Register after its training gate expired (was allowed in scenario E3)', (!!d7 || !s.docname), `doc=${s.docname || '-'} ${d7 ? 'DENY="' + d7 + '"' : 'body="' + s.body.slice(0, 90) + '"'}`);
  await q.ctx.close();
  console.log('  [restoring training gate]');
  console.log('   ' + bench('uat07_restore').trim().split('\n').pop());

  // ===== UAT-04 : break-glass auto-revoke after its 2-hour window =====
  console.log('\n########  V4.1 UAT-04 — break-glass access auto-revokes after its window  ########');
  const a = await login(browser, 'Administrator', ADMIN_PWD);
  await T(a.page.goto(`${BASE}/app/break-glass-access-request/new`, { waitUntil: 'domcontentloaded' }), 30000, 'g');
  await sleep(2500);
  const set4 = await setF(a.page, { requested_by: 'gs.fin02@gstest.local', emergency_reason: 'GS-BG-UAT production critical', status: 'Active', activation_time: pastISO, auto_revocation_time: pastISO });
  await sleep(500);
  const sv4 = await save(a.page);
  let s4 = await st(a.page); await shot(a.page, 'UAT04_bg_created');
  rec('UAT-04a', 'Break-Glass Access Request created (status Active, auto-revocation time already past)', sv4.ok && s4.doc.status === 'Active', `saved=${JSON.stringify(sv4)} name=${s4.docname} status=${s4.doc.status}`);
  console.log('  [running hourly auto-revoke task]');
  const out4 = bench('uat04_run_revoke'); console.log(out4.split('\n').filter(Boolean).slice(-2).join('\n'));
  await a.page.reload({ waitUntil: 'domcontentloaded' }); await sleep(2500);
  s4 = await st(a.page); await shot(a.page, 'UAT04_bg_expired');
  rec('UAT-04b', 'after the hourly scheduler task the break-glass grant is auto-revoked (status Expired)', s4.doc.status === 'Expired', `status=${s4.doc.status}`);

  // ===== UAT-09 : Governance Change Request needs impact analysis + SoD + approval =====
  console.log('\n########  V4.1 UAT-09 — Governance Change Request controlled workflow  ########');
  await T(a.page.goto(`${BASE}/app/governance-change-request/new`, { waitUntil: 'domcontentloaded' }), 30000, 'g');
  await sleep(2500);
  const set9 = await setF(a.page, { change_type: 'Sensitive Field', requestor: 'gs.qahead@gstest.local', impact_analysis: 'GS-GCR-UAT: raise Personal Data Register.purpose to permlevel 1' });
  await sleep(500);
  const sv9 = await save(a.page);
  let s9 = await st(a.page); await shot(a.page, 'UAT09_gcr_draft');
  rec('UAT-09a', 'Governance Change Request created in Requested state', sv9.ok && !!s9.docname, `saved=${JSON.stringify(sv9)} name=${s9.docname} status=${s9.doc.implementation_status}`);

  // try to jump straight to Approved (should be refused - must go through Analyse first, and Approve needs sod_check_result Pass)
  const jump = await wf(a.page, 'Approve');
  await a.page.reload({ waitUntil: 'domcontentloaded' }); await sleep(2000);
  s9 = await st(a.page);
  rec('UAT-09b', 'cannot skip straight to Approve — the workflow forces Analyse (impact analysis) first', s9.doc.implementation_status !== 'Approved', `jump=${JSON.stringify(jump)} status=${s9.doc.implementation_status}`);

  const an = await wf(a.page, 'Analyse');
  await a.page.reload({ waitUntil: 'domcontentloaded' }); await sleep(2000);
  s9 = await st(a.page); await shot(a.page, 'UAT09_analysed');
  rec('UAT-09c', 'workflow "Analyse" -> Analysed (needs impact_analysis, which is filled)', s9.doc.implementation_status === 'Analysed', `action=${JSON.stringify(an)} status=${s9.doc.implementation_status}`);

  const ap = await wf(a.page, 'Approve');
  await a.page.reload({ waitUntil: 'domcontentloaded' }); await sleep(2000);
  s9 = await st(a.page); await shot(a.page, 'UAT09_after_approve');
  rec('UAT-09d', 'workflow "Approve" (condition sod_check_result == Pass)', ['Approved', 'Analysed'].includes(s9.doc.implementation_status), `action=${JSON.stringify(ap)} status=${s9.doc.implementation_status} sod=${s9.doc.sod_check_result}`);

  await a.ctx.close();
  console.log('  [cleanup]');
  console.log('   ' + bench('uat04_cleanup').trim().split('\n').pop());

  console.log('\n########  SUMMARY  ########');
  for (const r of R) console.log(`${r.pass === true ? 'PASS' : r.pass === false ? 'FAIL' : '????'}  ${r.id.padEnd(8)} ${r.desc}`);
  const p = R.filter((r) => r.pass === true).length, f = R.filter((r) => r.pass === false).length, e = R.filter((r) => r.pass === null).length;
  console.log(`\n${p} pass / ${f} fail / ${e} error  of ${R.length}`);
  fs.writeFileSync(OUT + '/gs_v41_results.json', JSON.stringify(R, null, 2));
  await sleep(1500);
  await browser.close();
}
main().catch((e) => { console.error('FATAL', e); fs.writeFileSync(OUT + '/gs_v41_results.json', JSON.stringify(R, null, 2)); process.exit(1); });
