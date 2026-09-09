import puppeteer from 'puppeteer';
import fs from 'fs';

const BASE = 'http://localhost:8012';
const OUT = '/tmp/claude-1000/-home-darshit-smk-apps/c493ba98-31dc-4153-9620-b624ae703172/scratchpad';
const SHOT = OUT + '/shots_appr';
fs.rmSync(SHOT, { recursive: true, force: true });
fs.mkdirSync(SHOT, { recursive: true });
const ADMIN_PWD = 'Sanskar';
const REASON = 'GS-APPROVAL-UAT';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slug = (dt) => dt.toLowerCase().replace(/ /g, '-');
const today = new Date().toISOString().slice(0, 10);
const nextyr = new Date(Date.now() + 364 * 864e5).toISOString().slice(0, 10);
const log = [];
function L(s) { console.log(s); log.push(s); }
function T(p, ms, t) { return Promise.race([p, new Promise((_, j) => setTimeout(() => j(new Error('timeout:' + t)), ms))]); }
const ev = (pg, fn, a, ms = 12000, t = 'ev') => T(pg.evaluate(fn, a), ms, t);
let shotN = 0;
async function shot(pg, name) { try { await T(pg.screenshot({ path: `${SHOT}/${String(++shotN).padStart(2, '0')}_${name}.png` }), 8000, 's'); } catch {} }

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
  await sleep(1600);
  await ev(page, () => document.querySelectorAll('.modal.show [data-dismiss="modal"],.modal.show .btn-modal-close').forEach((b) => b.click()), null, 4000).catch(() => {});
  L(`  · logged in as ${user}`);
  return { ctx, page };
}

async function openForm(page, dt, name) {
  await T(page.goto(`${BASE}/app/${slug(dt)}/${encodeURIComponent(name)}`, { waitUntil: 'domcontentloaded' }), 30000, 'g');
  await T(page.waitForFunction(() => document.querySelector('.title-area .title-text') || document.querySelector('.page-card') || document.querySelector('.modal.show'), { timeout: 15000 }), 16000, 'w').catch(() => {});
  await sleep(1800);
}

async function readForm(page) {
  return await ev(page, () => {
    const c = (s) => (s || '').replace(/\s+/g, ' ').trim();
    return {
      docname: (() => { try { return cur_frm.doc.name; } catch { return ''; } })(),
      doc: (() => { try { return JSON.parse(JSON.stringify(cur_frm.doc)); } catch { return {}; } })(),
      modal: [...document.querySelectorAll('.modal.show')].map((m) => c(m.innerText)).filter(Boolean),
      alerts: [...document.querySelectorAll('#alert-container .alert,.desk-alert')].map((a) => c(a.innerText)).filter(Boolean),
      body: c(document.body.innerText).slice(0, 240),
      wfActions: (() => { try { return (frappe.workflow.get_transitions ? [] : []); } catch { return []; } })(),
    };
  }, null, 10000, 'rf');
}

async function wfAction(page, action) {
  const res = await ev(page, (act) => new Promise((resolve) => {
    frappe.xcall('frappe.model.workflow.apply_workflow', { doc: cur_frm.doc, action: act })
      .then((d) => resolve({ ok: true, new_state: d && (d.final_status || d.workflow_state) }))
      .catch((e) => resolve({ ok: false, err: (e && (e.message || String(e))) || 'rejected', msgs: (frappe.last_response && frappe.last_response._server_messages) || null }));
  }), action, 20000, 'wf').catch((e) => ({ ok: false, err: String(e) }));
  await sleep(1500);
  return res;
}

async function setFields(page, obj) {
  return await ev(page, (o) => new Promise(async (resolve) => {
    try { for (const [k, v] of Object.entries(o)) await cur_frm.set_value(k, v); resolve({ ok: true }); }
    catch (e) { resolve({ ok: false, err: String(e) }); }
  }), obj, 15000, 'sf').catch((e) => ({ ok: false, err: String(e) }));
}
async function save(page) {
  const r = await ev(page, () => new Promise((res) => { cur_frm.save().then(() => res({ ok: true })).catch((e) => res({ ok: false, err: (e && (e.message || String(e))) || 'rejected' })); }), null, 20000, 'sv').catch((e) => ({ ok: false, err: String(e) }));
  await sleep(1200);
  return r;
}

const RESULTS = [];
function rec(id, desc, pass, observed) { RESULTS.push({ id, desc, pass, observed }); L(`${pass === true ? 'PASS' : pass === false ? 'FAIL' : '????'}  ${id.padEnd(6)} ${desc}\n        => ${observed}`); }

async function main() {
  const exe = await puppeteer.executablePath();
  const browser = await puppeteer.launch({ headless: false, slowMo: 30, executablePath: exe, args: ['--no-sandbox', '--window-size=1520,950', '--window-position=0,0'], defaultViewport: null, env: { ...process.env, DISPLAY: ':0' } });

  // ================= TEST 1 : Access Request happy path — grants a seat for the first time =================
  L('\n########  TEST 1 — Access Request: request → SoD pass → approve → apply (grants QA-HEAD to gs.acc02)  ########');
  const q = await login(browser, 'Administrator', ADMIN_PWD);
  await T(q.page.goto(`${BASE}/app/access-request/new`, { waitUntil: 'domcontentloaded' }), 30000, 'g');
  await sleep(2500);
  const s1 = await setFields(q.page, { request_type: 'New', user: 'gs.acc02@gstest.local', employee: 'HR-REG-00011', role_seat: 'QA-HEAD', business_reason: REASON + ' grant QA-HEAD to acc02', effective_from: today, effective_to: nextyr });
  await sleep(500);
  const sv1 = await save(q.page);
  await shot(q.page, 'AR_draft_saved');
  let f = await readForm(q.page);
  L(`  saved=${JSON.stringify(sv1)} name=${f.docname} sod_check_result=${f.doc.sod_check_result} final_status=${f.doc.final_status}`);
  rec('T1.1', 'Access Request saved, SoD auto-check = Pass (non-conflicting seat)', f.doc.sod_check_result === 'Pass', `sod_check_result=${f.doc.sod_check_result}`);

  const a1 = await wfAction(q.page, 'Send for Approval');
  await q.page.reload({ waitUntil: 'domcontentloaded' }); await sleep(2500);
  f = await readForm(q.page);
  await shot(q.page, 'AR_pending_approval');
  rec('T1.2', 'workflow "Send for Approval" → Pending Approval', f.doc.final_status === 'Pending Approval', `action=${JSON.stringify(a1)} final_status=${f.doc.final_status}`);

  const a2 = await wfAction(q.page, 'Approve');
  await q.page.reload({ waitUntil: 'domcontentloaded' }); await sleep(2500);
  f = await readForm(q.page);
  await shot(q.page, 'AR_approved');
  rec('T1.3', 'workflow "Approve" → Approved (approved_by stamped)', f.doc.final_status === 'Approved' && !!f.doc.approved_by, `final_status=${f.doc.final_status} approved_by=${f.doc.approved_by}`);

  const a3 = await wfAction(q.page, 'Apply');
  await q.page.reload({ waitUntil: 'domcontentloaded' }); await sleep(2500);
  f = await readForm(q.page);
  await shot(q.page, 'AR_applied');
  const rsaName = f.doc.resulting_role_seat_assignment;
  rec('T1.4', 'workflow "Apply" → Applied, Role Seat Assignment created + submitted', f.doc.final_status === 'Applied' && !!rsaName, `final_status=${f.doc.final_status} rsa=${rsaName}`);

  if (rsaName) {
    await openForm(q.page, 'Role Seat Assignment', rsaName);
    const rf = await readForm(q.page);
    await shot(q.page, 'RSA_created');
    rec('T1.5', 'the resulting Role Seat Assignment is live (docstatus 1, status Active)', rf.doc.docstatus === 1 && rf.doc.status === 'Active', `user=${rf.doc.user} seat=${rf.doc.role_seat} docstatus=${rf.doc.docstatus} status=${rf.doc.status} training_gate_passed=${rf.doc.training_gate_passed}`);
    // training gate: a brand-new grant needs training completion before the seat counts.
    const tg = await ev(q.page, (n) => new Promise((res) => {
      frappe.xcall('frappe.client.set_value', { doctype: 'Role Seat Assignment', name: n, fieldname: 'training_gate_passed', value: 1 })
        .then(() => res({ ok: true })).catch((e) => res({ ok: false, err: String(e) }));
    }), rsaName, 12000, 'tg').catch((e) => ({ ok: false, err: String(e) }));
    L(`  training gate marked complete on ${rsaName}: ${JSON.stringify(tg)}`);
  }
  await q.ctx.close();

  // gs.acc02 now actually has the QA-HEAD access it did NOT have before (E1 was blocked)
  const acc = await login(browser, 'gs.acc02@gstest.local', 'GovTest@12345');
  await openForm(acc.page, 'Personal Data Register', 'PDR-2026-0001');
  const af = await readForm(acc.page);
  await shot(acc.page, 'acc02_now_reads_PDR');
  const opened = !!af.docname && !/not permitted|no permission/i.test(af.body);
  rec('T1.6', 'gs.acc02 can now open Personal Data Register — the granted seat took effect (was blocked in scenario E1)', opened, `doc=${af.docname || '-'} body="${af.body.slice(0, 90)}"`);
  await acc.ctx.close();

  // ================= TEST 2 : Access Request — SoD failure blocks the approval =================
  L('\n########  TEST 2 — Access Request: conflicting seat → SoD FAIL → approval blocked  ########');
  const q2 = await login(browser, 'Administrator', ADMIN_PWD);
  await T(q2.page.goto(`${BASE}/app/access-request/new`, { waitUntil: 'domcontentloaded' }), 30000, 'g');
  await sleep(2500);
  await setFields(q2.page, { request_type: 'New', user: 'gs.fin02@gstest.local', employee: 'HR-REG-00013', role_seat: 'FIN-03', business_reason: REASON + ' conflicting FIN-03 for fin02', effective_from: today, effective_to: nextyr });
  await sleep(500);
  await save(q2.page);
  let g = await readForm(q2.page);
  await shot(q2.page, 'AR2_sod_fail');
  rec('T2.1', 'Access Request for a conflicting seat saves with SoD auto-check = Fail', g.doc.sod_check_result === 'Fail', `sod_check_result=${g.doc.sod_check_result}`);

  const b1 = await wfAction(q2.page, 'Send for Approval');
  await sleep(1500);
  g = await readForm(q2.page);
  await shot(q2.page, 'AR2_send_blocked');
  const blocked = !b1.ok || g.doc.final_status !== 'Pending Approval';
  rec('T2.2', '"Send for Approval" is refused while SoD = Fail (workflow condition + controller guard)', blocked, `action=${JSON.stringify(b1)} final_status=${g.doc.final_status} modal=${JSON.stringify(g.modal).slice(0, 200)}`);
  await q2.ctx.close();

  // ================= TEST 3 : Information Access Policy Lifecycle drives enforcement =================
  L('\n########  TEST 3 — Policy lifecycle workflow: Suspend a policy → access lost → Reactivate → access back  ########');
  const q3 = await login(browser, 'Administrator', ADMIN_PWD);
  await openForm(q3.page, 'Information Access Policy', 'IAP-2026-00006');
  let p = await readForm(q3.page);
  L(`  IAP-2026-00006 policy_status = ${p.doc.policy_status}`);
  const c1 = await wfAction(q3.page, 'Suspend');
  await q3.page.reload({ waitUntil: 'domcontentloaded' }); await sleep(2500);
  p = await readForm(q3.page);
  await shot(q3.page, 'policy_suspended');
  rec('T3.1', 'workflow "Suspend" → policy_status Suspended', p.doc.policy_status === 'Suspended', `action=${JSON.stringify(c1)} policy_status=${p.doc.policy_status}`);
  await q3.ctx.close();

  const ia = await login(browser, 'gs.ia01@gstest.local', 'GovTest@12345');
  await openForm(ia.page, 'Sales Order', 'SMK/SO/LO/25-26/001');
  let iaf = await readForm(ia.page);
  await shot(ia.page, 'ia01_blocked_while_suspended');
  const nowBlocked = !iaf.docname || /not permitted|no permission/i.test(iaf.body);
  rec('T3.2', 'gs.ia01 can NO LONGER open the Sales Order while its policy is Suspended', nowBlocked, `doc=${iaf.docname || '-'} body="${iaf.body.slice(0, 90)}"`);
  await ia.ctx.close();

  const q4 = await login(browser, 'Administrator', ADMIN_PWD);
  await openForm(q4.page, 'Information Access Policy', 'IAP-2026-00006');
  const c2 = await wfAction(q4.page, 'Reactivate');
  await q4.page.reload({ waitUntil: 'domcontentloaded' }); await sleep(2500);
  p = await readForm(q4.page);
  await shot(q4.page, 'policy_reactivated');
  rec('T3.3', 'workflow "Reactivate" → policy_status Active', p.doc.policy_status === 'Active', `policy_status=${p.doc.policy_status}`);
  await q4.ctx.close();

  const ia2 = await login(browser, 'gs.ia01@gstest.local', 'GovTest@12345');
  await openForm(ia2.page, 'Sales Order', 'SMK/SO/LO/25-26/001');
  iaf = await readForm(ia2.page);
  await shot(ia2.page, 'ia01_restored');
  const restored = !!iaf.docname && !/not permitted|no permission/i.test(iaf.body);
  rec('T3.4', 'gs.ia01 can open the Sales Order again once the policy is Reactivated', restored, `doc=${iaf.docname || '-'}`);
  await ia2.ctx.close();

  L('\n########  SUMMARY  ########');
  for (const r of RESULTS) L(`${r.pass === true ? 'PASS' : r.pass === false ? 'FAIL' : '????'}  ${r.id.padEnd(6)} ${r.desc}`);
  const pass = RESULTS.filter((r) => r.pass === true).length, fail = RESULTS.filter((r) => r.pass === false).length, err = RESULTS.filter((r) => r.pass === null).length;
  L(`\n${pass} pass / ${fail} fail / ${err} error  of ${RESULTS.length}`);
  fs.writeFileSync(OUT + '/gs_approvals_results.json', JSON.stringify(RESULTS, null, 2));
  await sleep(1500);
  await browser.close();
}
main().catch((e) => { console.error('FATAL', e); fs.writeFileSync(OUT + '/gs_approvals_results.json', JSON.stringify(RESULTS, null, 2)); process.exit(1); });
