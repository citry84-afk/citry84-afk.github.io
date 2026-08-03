/* FinanzasFácil · Opciones v14.3 — reconciliación por ventana temporal.
   Se carga antes de v14.2 core para ser el primer manejador del CSV.
   Reutiliza el importador coherente de v14.2 y recalcula la reconciliación
   solo hasta la fecha de la última fotografía fiable. */
(() => {
'use strict';
if (window.__FF_OPTIONS_V143_CORE__) return;
window.__FF_OPTIONS_V143_CORE__ = true;

const STORE='ff_options_safe_v9';
const BACKUP='ff_options_v143_backup';
const SCHEMA='14.3';
const EPS=1e-7;
const readJSON=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch(_){return null}};
const saveJSON=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const number=v=>{const n=Number(String(v??'').replace(/,/g,''));return Number.isFinite(n)?n:0};
const datePart=v=>String(v||'').slice(0,10);

function inWindow(date,start='',end=''){
  const d=datePart(date);if(!d)return false;
  if(start&&d<start)return false;
  if(end&&d>end)return false;
  return true;
}
function afterWindow(date,end=''){
  const d=datePart(date);return Boolean(d&&end&&d>end);
}
function netByTickerWindow(stockTrades,start='',end=''){
  const map={};
  (stockTrades||[]).forEach(t=>{if(!t?.symbol||!inWindow(t.date,start,end))return;map[t.symbol]=(map[t.symbol]||0)+number(t.quantity)});
  return map;
}
function minimumOpeningFromDeficitWindow(stockTrades,start='',end=''){
  const state={};
  [...(stockTrades||[])].sort((a,b)=>String(a.date).localeCompare(String(b.date))).forEach(t=>{
    if(!t?.symbol||!inWindow(t.date,start,end))return;
    const s=state[t.symbol]||{running:0,min:0};s.running+=number(t.quantity);s.min=Math.min(s.min,s.running);state[t.symbol]=s;
  });
  const out={};Object.entries(state).forEach(([symbol,s])=>out[symbol]=Math.max(0,-s.min));return out;
}
function pendingAfterSnapshot(stockTrades,end=''){
  const map={};
  (stockTrades||[]).forEach(t=>{
    if(!t?.symbol||!afterWindow(t.date,end))return;
    const s=map[t.symbol]||{count:0,net:0,firstDate:'',lastDate:''};const d=datePart(t.date);
    s.count+=1;s.net+=number(t.quantity);if(!s.firstDate||d<s.firstDate)s.firstDate=d;if(!s.lastDate||d>s.lastDate)s.lastDate=d;map[t.symbol]=s;
  });
  return map;
}
function reconcileStocksWindowed(data){
  const baseline=data.stockBaseline?.verified?data.stockBaseline:null;
  const snapshot=data.lastReliableStockSnapshot?.verified?data.lastReliableStockSnapshot:null;
  const start=baseline?.period?.start||'';
  const end=snapshot?.period?.end||'';
  const net=netByTickerWindow(data.stockTrades,start,end);
  const minimum=minimumOpeningFromDeficitWindow(data.stockTrades,start,end);
  const pending=pendingAfterSnapshot(data.stockTrades,end);
  const final=snapshot?.positions||{};
  const base=baseline?.positions||{};
  const symbols=new Set([...Object.keys(net),...Object.keys(minimum),...Object.keys(final),...Object.keys(base),...Object.keys(pending)]);
  return [...symbols].sort().map(symbol=>{
    const movements=number(net[symbol]);
    const minimumRequired=number(minimum[symbol]);
    const later=pending[symbol]||{count:0,net:0,firstDate:'',lastDate:''};
    const common={symbol,movements,minimumRequired,coverageStart:start,coverageEnd:end,pendingAfterCount:later.count,pendingAfterNet:later.net,pendingAfterFirst:later.firstDate,pendingAfterLast:later.lastDate};
    if(baseline&&snapshot){
      const baselineQty=number(base[symbol]),reported=number(final[symbol]),reconstructed=baselineQty+movements,difference=reconstructed-reported;
      const baseStatus=Math.abs(difference)<=EPS?'verified':'mismatch';
      const status=baseStatus==='verified'&&later.count?'verified-pending':baseStatus;
      return{...common,status,baselineQty,reconstructed,reported,difference,unexplained:0};
    }
    if(snapshot){
      const reported=number(final[symbol]),unexplained=reported-movements;
      const baseStatus=Math.abs(unexplained)<=EPS?'no-baseline':'prior-history';
      return{...common,status:baseStatus,baselineQty:null,reconstructed:null,reported,difference:null,unexplained};
    }
    return{...common,status:'no-snapshot',baselineQty:null,reconstructed:null,reported:null,difference:null,unexplained:null};
  });
}
function sanitizeWindow(data){
  if(!data||typeof data!=='object')return data;
  const next={...data,schemaVersion:SCHEMA};
  const rows=reconcileStocksWindowed(next);
  next.stockReconciliation={version:SCHEMA,calculatedAt:new Date().toISOString(),baselineVerified:Boolean(next.stockBaseline?.verified),snapshotVerified:Boolean(next.lastReliableStockSnapshot?.verified),coverageStart:next.stockBaseline?.period?.start||'',coverageEnd:next.lastReliableStockSnapshot?.period?.end||'',pendingAfterSnapshot:rows.reduce((s,r)=>s+r.pendingAfterCount,0),rows};
  return next;
}
function migrateExisting(){
  const current=readJSON(STORE)||{};if(!Object.keys(current).length||current.schemaVersion===SCHEMA)return current;
  if(!localStorage.getItem(BACKUP))saveJSON(BACKUP,current);
  const migrated=sanitizeWindow(current);saveJSON(STORE,migrated);return migrated;
}
function importCSVWindowed(text,fileName='IBKR.csv'){
  if(!window.FFv142?.importCSV)throw new Error('El importador base v14.2 no está disponible.');
  const result=window.FFv142.importCSV(text,fileName);
  const data=sanitizeWindow(result.data);
  saveJSON(STORE,data);
  result.data=readJSON(STORE);
  return result;
}
function toast(msg){
  document.querySelector('.ffv143-toast')?.remove();const el=document.createElement('div');el.className='ffv143-toast';el.style.cssText='position:fixed;left:50%;bottom:96px;z-index:10000;transform:translateX(-50%);max-width:88vw;padding:13px 17px;border-radius:15px;background:#0f2037;border:1px solid #32609a;color:#f6f9ff;font:800 13px system-ui;box-shadow:0 18px 50px rgba(4,16,34,.5)';el.textContent=msg;document.body.appendChild(el);setTimeout(()=>el.remove(),4200);
}
function rerender(){document.querySelector('.oi12-tabs [data-oi12-tab].active, .oi12-tabs [data-ffv14-tab].active')?.click();window.dispatchEvent(new CustomEvent('ff:v143-data',{detail:readJSON(STORE)}));}

document.addEventListener('change',async e=>{
  const input=e.target;if(!input||!input.matches?.('[data-oi12-file]'))return;
  e.stopImmediatePropagation();e.stopPropagation();const file=input.files?.[0];if(!file)return;
  toast('Fusionando y comprobando la ventana temporal…');
  try{
    const res=importCSVWindowed(await file.text(),file.name);input.value='';rerender();
    const rec=res.data.stockReconciliation||{};const pending=number(rec.pendingAfterSnapshot);
    const snapshot=res.replacedOpenSnapshot?`${res.openCount} opciones y ${res.stockOpenCount} posiciones actualizadas`:'última fotografía fiable conservada';
    const tail=pending?` · ${pending} movimiento${pending===1?'':'s'} posterior${pending===1?'':'es'} aún sin contrastar`:'';
    toast((res.added||res.stockAdded)?`${res.added} opciones y ${res.stockAdded} movimientos nuevos · ${snapshot}${tail}`:`Sin novedades · ${snapshot}${tail}`);
  }catch(err){console.error('[ffv14.3]',err);input.value='';toast('No se pudo leer el CSV de actividad de IBKR.');}
},true);

window.addEventListener('load',()=>setTimeout(migrateExisting,0));
window.FFv143={version:SCHEMA,data:()=>readJSON(STORE)||{},importCSV:importCSVWindowed,reconciliation:()=>reconcileStocksWindowed(readJSON(STORE)||{}),migrate:migrateExisting,backup:()=>readJSON(BACKUP),restore(){const b=readJSON(BACKUP);if(!b)return'No hay copia previa a v14.3.';saveJSON(STORE,b);location.reload();return'Restaurando…'},_internals:{inWindow,afterWindow,netByTickerWindow,minimumOpeningFromDeficitWindow,pendingAfterSnapshot,reconcileStocksWindowed,sanitizeWindow}};
})();
