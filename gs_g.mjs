import puppeteer from 'puppeteer';
import fs from 'fs';
const BASE='http://localhost:8012', OUT='/tmp/claude-1000/-home-darshit-smk-apps/c493ba98-31dc-4153-9620-b624ae703172/scratchpad';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const today=new Date().toISOString().slice(0,10), nextyr=new Date(Date.now()+364*864e5).toISOString().slice(0,10);
const b=await puppeteer.launch({headless:false,slowMo:15,executablePath:await puppeteer.executablePath(),args:['--no-sandbox','--window-size=1520,950'],defaultViewport:null,env:{...process.env,DISPLAY:':0'}});
const p=await b.newPage(); await p.setViewport({width:1500,height:900});
await p.goto(`${BASE}/login`,{waitUntil:'domcontentloaded'});
await p.waitForSelector('#login_email'); await p.type('#login_email','gs.qahead@gstest.local'); await p.type('#login_password','GovTest@12345');
await p.click('.btn-login'); await p.waitForFunction(()=>location.pathname.startsWith('/app'),{timeout:30000}).catch(()=>{}); await sleep(2000);
await p.goto(`${BASE}/app/role-seat-assignment/new`,{waitUntil:'domcontentloaded'}); await sleep(3000);
const set=await p.evaluate(async v=>{try{
 await cur_frm.set_value('user',v.u); await cur_frm.set_value('employee','HR-REG-00013');
 await cur_frm.set_value('role_seat','FIN-03'); await cur_frm.set_value('assignment_type','Primary');
 await cur_frm.set_value('status','Draft'); await cur_frm.set_value('effective_from',v.f); await cur_frm.set_value('effective_to',v.t);
 return {ok:true};}catch(e){return{ok:false,e:String(e)}}},{u:'gs.fin02@gstest.local',f:today,t:nextyr});
await sleep(800);
await p.keyboard.down('Control'); await p.keyboard.press('KeyS'); await p.keyboard.up('Control');
await sleep(4000);
const st=await p.evaluate(()=>{
 const clean=s=>(s||'').replace(/\s+/g,' ').trim();
 return {modal:[...document.querySelectorAll('.modal.show')].map(m=>clean(m.innerText)),
  alerts:[...document.querySelectorAll('.desk-alert,#alert-container .alert')].map(a=>clean(a.innerText)),
  dirty:(()=>{try{return !!cur_frm.is_dirty()}catch{return null}})(),
  docname:(()=>{try{return cur_frm.doc.name}catch{return null}})(),
  body:clean(document.body.innerText).slice(0,400)};
});
await p.screenshot({path:OUT+'/shots3/G.png'});
console.log('SET',JSON.stringify(set));
console.log('STATE',JSON.stringify(st,null,2));
fs.writeFileSync(OUT+'/g_result.json',JSON.stringify({set,st},null,2));
await sleep(1500); await b.close();
