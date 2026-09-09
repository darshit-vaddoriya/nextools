import puppeteer from 'puppeteer';
import fs from 'fs';
import { execSync } from 'child_process';

const BASE = 'http://localhost:8012';
const OUT = '/tmp/claude-1000/-home-darshit-smk-apps/c493ba98-31dc-4153-9620-b624ae703172/scratchpad';
const SHOT = OUT + '/shots_golive';
fs.rmSync(SHOT, { recursive: true, force: true });
fs.mkdirSync(SHOT, { recursive: true });
const NEW_EMAIL = 'gs.newjoiner@gstest.local';
const NEW_PWD = 'GoLive@12345';
const SO_SRC = 'SMK/SO/LO/25-26/001';
const PE_ANY = 'ACC-PAY-2026-00002';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slug = (dt) => dt.toLowerCase().replace(/ /g, '-');
const DENY = /not permitted|no permission|do not have (?:enough )?permission|don't have (?:enough )?permission|not allowed to|does not have doctype access|no role seat|no matching iap/i;
const R = [];
const rec = (id, desc, pass, obs) => { R.push({ id, desc, pass, obs }); console.log(`${pass === true ? 'PASS' : pass === false ? 'FAIL' : '????'}  ${id.padEnd(5)} ${desc}\n        => ${obs}`); };
const T = (p, ms, t) => Promise.race([p, new Promise((_, j) => setTimeout(() => j(new Error('timeout:' + t)), ms))]);
const ev = (pg, fn, a, ms = 12000, t = 'ev') => T(pg.evaluate(fn, a), ms, t);
let n = 0;
const shot = async (pg, nm) => { try { await T(pg.screenshot({ path: `${SHOT}/${String(++n).padStart(2, '0')}_${nm}.png` }), 8000, 's'); } catch {} };
const bench = (fn) => execSync(`cd /home/darshit/smk && bench --site smk.local execute governance_security.gs_uat_tmp.${fn} 2>&1`).toString();

async function login(browser, user, pwd) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 1500, height: 900 });
  await T(page.goto(`${BASE}/login`, { waitUntil: 'networkidle2' }), 40000, 'gl');
  await page.waitForSelector('#login_email', { timeout: 40000, visible: true });
  await sleep(500);
  await page.type('#login_email', user, { delay: 20 });
  await page.type('#login_password', pwd, { delay: 20 });
  await page.click('.btn-login');
  const ok = await T(page.waitForFunction(() => location.pathname.startsWith('/app'), { timeout: 45000 }), 47000, 'wa').then(() => true).catch(() => false);
  await sleep(1800);
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
      docstatus: (() => { try { return cur_frm.doc.docstatus; } catch { return null; } })(),
      dirty: (() => { try { return !!cur_frm.is_dirty(); } catch { return null; } })(),
      modal: [...document.querySelectorAll('.modal.show')].map((m) => c(m.innerText)).filter(Boolean),
      body: c(document.body.innerText).slice(0, 320),
    };
  }, null, 10000, 'st');
}
const deny = (s) => { const h = [...(s.modal || []), s.body].join(' || '); const i = h.search(DENY); return i >= 0 ? h.slice(Math.max(0, i - 45), i + 130) : null; };
async function save(page) { const r = await ev(page, () => new Promise((res) => cur_frm.save().then(() => res({ ok: true })).catch((e) => res({ ok: false, e: String(e && (e.message || e)) }))), null, 25000, 'sv').catch((e) => ({ ok: false, e: String(e) })); await sleep(1500); return r; }
async function clickSubmit(page) {
  await ev(page, () => { const b = [...document.querySelectorAll('.page-actions button')].find((x) => x.offsetParent && /^\s*submit\s*$/i.test(x.innerText)); if (b) b.click(); }, null, 5000).catch(() => {});
  await sleep(1300);
  await ev(page, () => { const y = [...document.querySelectorAll('.modal.show .btn-primary,.modal.show .btn-modal-primary')].find((b) => b.offsetParent); if (y) y.click(); }, null, 4000).catch(() => {});
  await sleep(2500);
}

async function main() {
  const exe = await puppeteer.executablePath();
  const browser = await puppeteer.launch({ headless: false, slowMo: 26, executablePath: exe, args: ['--no-sandbox', '--window-size=1520,950', '--window-position=0,0'], defaultViewport: null, env: { ...process.env, DISPLAY: ':0' } });

  console.log('\n########  GO-LIVE ONBOARDING FLOW — new joiner "Priya", AR-maker (ACC-02) seat  ########');
  console.log('  (STAGE A done via back-office script: Employee HR-REG-00017 + User gs.newjoiner, Role Profile "Accounts" + native "Sales User")');

  // ===== STAGE B : day 0 — account + native roles, NO Role Seat =====
  console.log('\n=== STAGE B: new joiner logs in on day 0 (no Role Seat / no Access Request yet) ===');
  const b = await login(browser, NEW_EMAIL, NEW_PWD);
  rec('B0', 'the freshly provisioned account can log into the ERPNext desk', b.ok, `login ok=${b.ok}`);
  await openForm(b.page, 'Sales Order', SO_SRC);
  let s = await st(b.page); await shot(b.page, 'B1_day0_blocked');
  const d0 = deny(s);
  rec('B1', 'day 0: BLOCKED from Sales Order even though the account holds the native "Sales User" role — a Role Seat + IAP is still required', (!!d0 || !s.docname), `doc=${s.docname || '-'} ${d0 ? 'DENY="' + d0 + '"' : 'body="' + s.body.slice(0, 100) + '"'}`);
  await b.ctx.close();

  // ===== grant access via the Access Request workflow =====
  console.log('\n=== STAGE C: Access Request raised -> SoD check -> Send for Approval -> Approve -> Apply ===');
  const out = bench('golive_phase2_grant');
  console.log(out.split('\n').filter(Boolean).map((l) => '   ' + l).join('\n'));
  const applied = /final_status.*Applied|'Apply' -> Applied/.test(out) || /valid Role Seats now: \['ACC-02'\]/.test(out);
  rec('C1', 'Access Request approved and Applied -> a submitted Role Seat Assignment now exists for the new joiner', applied, out.includes('resulting Role Seat Assignment:') ? out.split('resulting Role Seat Assignment:')[1].split('\n')[0].trim() : 'see log');

  // ===== STAGE D : new joiner works — within seat scope only =====
  console.log('\n=== STAGE D: new joiner logs back in — now has ACC-02 access, and only that ===');
  const d = await login(browser, NEW_EMAIL, NEW_PWD);
  await openForm(d.page, 'Sales Order', SO_SRC);
  s = await st(d.page); await shot(d.page, 'D1_can_read_SO');
  rec('D1', 'new joiner can now OPEN a Sales Order (seat ACC-02 grants read/create/edit)', !!s.docname && !deny(s), `doc=${s.docname || '-'} ${deny(s) ? 'DENY' : 'ok'}`);

  await ev(d.page, () => cur_frm.copy_doc(), null, 8000).catch(() => {});
  await sleep(2500);
  await ev(d.page, () => { try { cur_frm.set_value('title', 'NEWJOINER go-live create test'); } catch {} }, null, 6000).catch(() => {});
  await sleep(500);
  const dSave = await save(d.page);
  s = await st(d.page); await shot(d.page, 'D2_create_SO');
  const created = dSave.ok && !!s.docname && !/new-/.test(s.docname) && !deny(s);
  rec('D2', 'new joiner can CREATE a Sales Order (ACC-02 = maker)', created, `saved=${JSON.stringify(dSave)} doc=${s.docname || '-'}`);

  if (created) {
    const before = s.docstatus;
    await clickSubmit(d.page);
    s = await st(d.page); await shot(d.page, 'D3_submit_blocked');
    const d3 = deny(s);
    rec('D3', 'new joiner CANNOT submit it — maker/checker split, submit needs the ACC-01 seat', !!d3 && s.docstatus !== 1, `docstatus ${before}->${s.docstatus} ${d3 ? 'DENY="' + d3 + '"' : 'no-deny'}`);
  } else {
    rec('D3', 'submit-blocked check (skipped: create did not land)', null, `doc=${s.docname}`);
  }

  await openForm(d.page, 'Payment Entry', PE_ANY);
  s = await st(d.page); await shot(d.page, 'D4_payment_blocked');
  const d4 = deny(s);
  rec('D4', 'new joiner CANNOT open a Payment Entry — outside the ACC-02 seat scope', (!!d4 || !s.docname), `doc=${s.docname || '-'} ${d4 ? 'DENY="' + d4 + '"' : 'body="' + s.body.slice(0, 100) + '"'}`);
  await d.ctx.close();

  console.log('\n########  SUMMARY  ########');
  for (const r of R) console.log(`${r.pass === true ? 'PASS' : r.pass === false ? 'FAIL' : '????'}  ${r.id.padEnd(5)} ${r.desc}`);
  const p = R.filter((r) => r.pass === true).length, f = R.filter((r) => r.pass === false).length, e = R.filter((r) => r.pass === null).length;
  console.log(`\n${p} pass / ${f} fail / ${e} error  of ${R.length}`);
  fs.writeFileSync(OUT + '/gs_golive_results.json', JSON.stringify(R, null, 2));
  console.log('\n[teardown]');
  console.log('   ' + bench('golive_teardown_v2').trim().split('\n').pop());
  await sleep(1500);
  await browser.close();
}
main().catch((e) => { console.error('FATAL', e); fs.writeFileSync(OUT + '/gs_golive_results.json', JSON.stringify(R, null, 2)); try { execSync(`cd /home/darshit/smk && bench --site smk.local execute governance_security.gs_uat_tmp.golive_teardown_v2 2>&1`); } catch {} process.exit(1); });
