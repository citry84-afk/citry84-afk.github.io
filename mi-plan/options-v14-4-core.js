/* FinanzasFácil · Opciones v14.4 — política simétrica de instantáneas.
   Conserva la base más antigua y la fotografía fechada más reciente.
   Un extracto antiguo o sin fecha puede ampliar el histórico, pero nunca
   sustituye posiciones abiertas, NAV, openAsOf ni exposición actuales. */
(() => {
'use strict';
if (window.__FF_OPTIONS_V144_CORE__) return;
window.__FF_OPTIONS_V144_CORE__ = true;

const STORE='ff_options_safe_v9';
const BACKUP='ff_options_v144_backup';
const SCHEMA='14.4';
const EPS=1e-7;
const readJSON=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch(_){return null}};
const saveJSON=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const number=v=>{const n=Number(String(v??'').replace(/,/g,''));return Number.isFinite(n)?n:0};
const datePart=v=>String(v||'').slice(0,10);

function compareGenerated(a='',b=''){return String(a||'').localeCompare(String(b||''));}
function snapshotDecision(current,incoming){
  if(!incoming?.sawOpenPositionsSection)return{accept:false,reason:'partial-no-snapshot',label:'Informe parcial: fotografía actual conservada'};
  const incomingEnd=incoming.period?.end||'';
  if(!incomingEnd)return{accept:false,reason:'missing-period-end',label:'Fotografía sin fecha: no se usa como estado actual'};
  const currentSnap=current?.lastReliableStockSnapshot?.verified?current.lastReliableStockSnapshot:null;
  const currentEnd=currentSnap?.period?.end||'';
  if(!currentEnd)return{accept:true,reason:'first-dated-snapshot',label:`Primera fotografía fiable: ${incomingEnd}`};
  if(incomingEnd>currentEnd)return{accept:true,reason:'newer-period-end',label:`Fotografía actualizada a ${incomingEnd}`};
  if(incomingEnd<currentEnd)return{accept:false,reason:'older-period-end',label:`Histórico añadido; fotografía ${currentEnd} conservada`};
  const currentGenerated=currentSnap?.generatedAt||'';
  const incomingGenerated=incoming.generatedAt||'';
  if(incomingGenerated&&(!currentGenerated||compareGenerated(incomingGenerated,currentGenerated)>=0))return{accept:true,reason:'same-end-newer-generation',label:`Fotografía de ${incomingEnd} actualizada`};
  return{accept:false,reason:'same-end-older-generation',label:`Fotografía de ${currentEnd} conservada`};
}

function detectBoxes(open){
  const groups={};(open||[]).forEach(p=>{const k=`${p.underlying}|${p.expiry}`;(groups[k]??=[]).push(p)});
  const boxes=[];Object.values(groups).forEach(g=>{const strikes=[...new Set(g.map(x=>number(x.strike)))].sort((a,b)=>a-b);if(strikes.length!==2)return;const legs=[];strikes.forEach(s=>['C','P'].forEach(r=>{const leg=g.find(x=>number(x.strike)===s&&x.right===r&&!legs.includes(x));if(leg)legs.push(leg)}));if(legs.length===4){legs.forEach(x=>x.structure='box');boxes.push(legs)}});return boxes;
}
function recomputeSummary(data,fileName,rowCount){
  const open=data.open||[],trades=data.trades||[];detectBoxes(open);
  const naked=open.filter(x=>x.right==='P'&&number(x.quantity)<0&&x.structure!=='box');
  return{...(data.summary||{}),file:fileName||data.summary?.file||'',rows:rowCount||data.summary?.rows||0,openCount:open.length,tradeCount:trades.length,boxes:open.filter(x=>x.structure==='box').length/4,nakedPuts:naked.length,assignmentExposure:naked.reduce((s,x)=>s+number(x.strike)*Math.abs(number(x.quantity))*(number(x.multiplier)||100),0),realized:trades.reduce((s,x)=>s+number(x.realized),0),unrealized:open.reduce((s,x)=>s+number(x.unrealized),0),updatedAt:new Date().toISOString()};
}
function latestImportedSnapshotEnd(data){
  return (data.imports||[]).filter(x=>x.replacedOpenSnapshot&&x.period?.end).map(x=>x.period.end).sort().at(-1)||'';
}
function applySnapshotPolicy(before,incoming,result,fileName,rowCount){
  const decision=snapshotDecision(before,incoming);
  let data={...result.data};
  if(!decision.accept){
    data.lastReliableStockSnapshot=before.lastReliableStockSnapshot||null;
    data.open=before.open||[];
    data.stockOpen=before.stockOpen||[];
    data.openAsOf=before.openAsOf||null;
    data.accountSnapshot=before.accountSnapshot||data.accountSnapshot||{};
    if(incoming?.sawOpenPositionsSection){
      data.unverifiedSnapshots=[...(before.unverifiedSnapshots||[]),{file:fileName,period:incoming.period||null,generatedAt:incoming.generatedAt||'',capturedAt:new Date().toISOString(),reason:decision.reason,optionOpenCount:incoming.open?.length||0,stockOpenCount:incoming.stockOpen?.length||0}].slice(-12);
    }
  }
  const imports=[...(data.imports||[])];
  if(imports.length){imports[imports.length-1]={...imports[imports.length-1],snapshotAccepted:decision.accept,snapshotDecision:decision.reason,snapshotDecisionLabel:decision.label};data.imports=imports;}
  data.schemaVersion=SCHEMA;
  data.snapshotPolicy={version:SCHEMA,lastDecision:decision,latestReliableEnd:data.lastReliableStockSnapshot?.period?.end||'',updatedAt:new Date().toISOString(),recoveryRequired:false,expectedLatestEnd:''};
  const maxImportedEnd=latestImportedSnapshotEnd(data),currentEnd=data.lastReliableStockSnapshot?.period?.end||'';
  if(maxImportedEnd&&(!currentEnd||currentEnd<maxImportedEnd)){
    data.snapshotPolicy.recoveryRequired=true;data.snapshotPolicy.expectedLatestEnd=maxImportedEnd;
  }
  if(window.FFv143?._internals?.sanitizeWindow)data=window.FFv143._internals.sanitizeWindow(data);
  data.schemaVersion=SCHEMA;
  data.snapshotPolicy={...(data.snapshotPolicy||{}),version:SCHEMA,lastDecision:decision,latestReliableEnd:data.lastReliableStockSnapshot?.period?.end||'',recoveryRequired:data.snapshotPolicy?.recoveryRequired||false,expectedLatestEnd:data.snapshotPolicy?.expectedLatestEnd||'',updatedAt:new Date().toISOString()};
  data.summary=recomputeSummary(data,fileName,rowCount);
  return{data,decision};
}
function migrateExisting(){
  const current=readJSON(STORE)||{};if(!Object.keys(current).length||current.schemaVersion===SCHEMA)return current;
  if(!localStorage.getItem(BACKUP))saveJSON(BACKUP,current);
  let next={...current,schemaVersion:SCHEMA};
  const maxEnd=latestImportedSnapshotEnd(next),currentEnd=next.lastReliableStockSnapshot?.period?.end||'';
  next.snapshotPolicy={version:SCHEMA,lastDecision:null,latestReliableEnd:currentEnd,recoveryRequired:Boolean(maxEnd&&(!currentEnd||currentEnd<maxEnd)),expectedLatestEnd:maxEnd&&(!currentEnd||currentEnd<maxEnd)?maxEnd:'',updatedAt:new Date().toISOString()};
  if(window.FFv143?._internals?.sanitizeWindow)next=window.FFv143._internals.sanitizeWindow(next);
  next.schemaVersion=SCHEMA;next.snapshotPolicy={...(next.snapshotPolicy||{}),version:SCHEMA,latestReliableEnd:next.lastReliableStockSnapshot?.period?.end||currentEnd,recoveryRequired:Boolean(maxEnd&&(!(next.lastReliableStockSnapshot?.period?.end)||next.lastReliableStockSnapshot.period.end<maxEnd)),expectedLatestEnd:maxEnd&&(!(next.lastReliableStockSnapshot?.period?.end)||next.lastReliableStockSnapshot.period.end<maxEnd)?maxEnd:'',updatedAt:new Date().toISOString()};
  next.summary=recomputeSummary(next,next.summary?.file,next.summary?.rows);saveJSON(STORE,next);return next;
}
function importCSV(text,fileName='IBKR.csv'){
  if(!window.FFv143?.importCSV||!window.FFv142?._internals?.parseCSV||!window.FFv142?._internals?.readReport)throw new Error('Los importadores base no están disponibles.');
  const before=readJSON(STORE)||{};
  const rows=window.FFv142._internals.parseCSV(text);
  const incoming=window.FFv142._internals.readReport(rows);
  const result=window.FFv143.importCSV(text,fileName);
  const applied=applySnapshotPolicy(before,incoming,result,fileName,rows.length);
  saveJSON(STORE,applied.data);
  result.data=readJSON(STORE);result.snapshotDecision=applied.decision;
  return result;
}
function toast(msg){document.querySelector('.ffv144-toast')?.remove();const el=document.createElement('div');el.className='ffv144-toast';el.style.cssText='position:fixed;left:50%;bottom:96px;z-index:10000;transform:translateX(-50%);max-width:88vw;padding:13px 17px;border-radius:15px;background:#0f2037;border:1px solid #32609a;color:#f6f9ff;font:800 13px system-ui;box-shadow:0 18px 50px rgba(4,16,34,.5)';el.textContent=msg;document.body.appendChild(el);setTimeout(()=>el.remove(),4600)}
function rerender(){document.querySelector('.oi12-tabs [data-oi12-tab].active, .oi12-tabs [data-ffv14-tab].active')?.click();window.dispatchEvent(new CustomEvent('ff:v144-data',{detail:readJSON(STORE)}));}
document.addEventListener('change',async e=>{
  const input=e.target;if(!input||!input.matches?.('[data-oi12-file]'))return;e.stopImmediatePropagation();e.stopPropagation();const file=input.files?.[0];if(!file)return;toast('Fusionando histórico y protegiendo la fotografía actual…');
  try{const res=importCSV(await file.text(),file.name);input.value='';rerender();const d=res.snapshotDecision;const added=(res.added||0)+(res.stockAdded||0);toast(`${added?`${res.added} opciones y ${res.stockAdded} movimientos nuevos`:'Sin operaciones nuevas'} · ${d.label}`)}catch(err){console.error('[ffv14.4]',err);input.value='';toast('No se pudo leer el CSV de actividad de IBKR.')}
},true);
window.addEventListener('load',()=>setTimeout(migrateExisting,0));
window.FFv144={version:SCHEMA,data:()=>readJSON(STORE)||{},importCSV,snapshotDecision:(incoming)=>snapshotDecision(readJSON(STORE)||{},incoming),migrate:migrateExisting,backup:()=>readJSON(BACKUP),restore(){const b=readJSON(BACKUP);if(!b)return'No hay copia previa a v14.4.';saveJSON(STORE,b);location.reload();return'Restaurando…'},_internals:{snapshotDecision,applySnapshotPolicy,recomputeSummary,latestImportedSnapshotEnd,migrateExisting}};
})();
