/* FinanzasFácil · Opciones v14.2 — motor de importación y reconciliación honesta.
   Se carga antes de v14 y es el único manejador de CSV de esta versión.
   No parchea Storage.prototype: construye, sanea, guarda y devuelve el mismo objeto. */
(() => {
'use strict';
if (window.__FF_OPTIONS_V142_CORE__) return;
window.__FF_OPTIONS_V142_CORE__ = true;

const STORE='ff_options_safe_v9';
const BACKUP='ff_options_v142_backup';
const SCHEMA='14.2';
const EPS=1e-7;
const readJSON=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch(_){return null}};
const saveJSON=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const number=v=>{let s=String(v??'').trim().replace(/\s/g,'');if(!s||s==='--')return 0;if(/^-?\d{1,3}(,\d{3})+(?:\.\d+)?$/.test(s))s=s.replace(/,/g,'');else if(/^-?\d+,\d+$/.test(s)&&!s.includes('.'))s=s.replace(',','.');else s=s.replace(/,/g,'');const n=Number(s);return Number.isFinite(n)?n:0};
const datePart=v=>String(v||'').slice(0,10);
const groupBy=(list,fn)=>(list||[]).reduce((acc,x)=>{(acc[fn(x)]??=[]).push(x);return acc},{});

function parseCSV(text){
  const out=[];let row=[],field='',quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(quoted){if(c==='"'&&text[i+1]==='"'){field+='"';i++;}else if(c==='"')quoted=false;else field+=c;}
    else if(c==='"')quoted=true;else if(c===','){row.push(field);field='';}else if(c==='\n'){row.push(field.replace(/\r$/,''));out.push(row);row=[];field='';}else field+=c;
  }
  if(field||row.length){row.push(field);out.push(row)}
  return out;
}

function symbolParts(symbol){
  const m=String(symbol||'').match(/^([A-Z0-9.]+)\s+(\d{2}[A-Z]{3}\d{2})\s+([\d.]+)\s+([PC])$/);
  return m?{underlying:m[1],expiry:m[2],strike:number(m[3]),right:m[4]}:{underlying:String(symbol||''),expiry:'',strike:0,right:''};
}

const MONTHS={
  enero:0,febrero:1,marzo:2,abril:3,mayo:4,junio:5,julio:6,agosto:7,septiembre:8,setiembre:8,octubre:9,noviembre:10,diciembre:11,
  january:0,february:1,march:2,april:3,may:4,june:5,july:6,august:7,september:8,october:9,november:10,december:11
};
function parsePeriodDate(value){
  const s=String(value||'').trim();
  const iso=s.match(/^(\d{4})-(\d{2})-(\d{2})$/);if(iso)return`${iso[1]}-${iso[2]}-${iso[3]}`;
  const m=s.match(/^([A-Za-zÁÉÍÓÚáéíóúñÑ]+)\s+(\d{1,2}),\s*(\d{4})$/);if(!m)return'';
  const month=MONTHS[m[1].normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()];
  return month===undefined?'':`${m[3]}-${String(month+1).padStart(2,'0')}-${String(Number(m[2])).padStart(2,'0')}`;
}
function parsePeriod(value){
  const parts=String(value||'').split(/\s+-\s+/);return{label:String(value||''),start:parsePeriodDate(parts[0]),end:parsePeriodDate(parts[1])};
}

function readReport(rows){
  const open=[],trades=[],stockOpen=[],stockTrades=[];const stockOpening={};
  let sawOpenPositionsSection=false,baseCurrency='EUR',nav=null,generatedAt='',period={label:'',start:'',end:''};
  for(const r of rows){
    if(r[0]==='Información sobre la cuenta'&&r[1]==='Data'&&r[2]==='Divisa base')baseCurrency=r[3]||'EUR';
    if(r[0]==='Statement'&&r[1]==='Data'&&r[2]==='WhenGenerated')generatedAt=r[3]||'';
    if(r[0]==='Statement'&&r[1]==='Data'&&r[2]==='Period')period=parsePeriod(r[3]);
    if(r[0]==='Valor liquidativo'&&r[1]==='Data'&&r[2]==='Total')nav=number(r[6]??r[5]??r[3]);
    if(r[0]==='Posiciones abiertas')sawOpenPositionsSection=true;
    if(r[0]==='Posiciones abiertas'&&r[1]==='Data'&&String(r[3]).includes('Opciones')){
      const p=symbolParts(r[5]);open.push({...p,symbol:r[5],currency:r[4]||'USD',quantity:number(r[6]),multiplier:number(r[7])||100,costPrice:number(r[8]),costBasis:number(r[9]),closePrice:number(r[10]),value:number(r[11]),unrealized:number(r[12]),structure:''});
    }
    if(r[0]==='Posiciones abiertas'&&r[1]==='Data'&&r[3]==='Acciones')stockOpen.push({symbol:r[5],currency:r[4]||baseCurrency,quantity:number(r[6]),multiplier:number(r[7])||1,costPrice:number(r[8]),costBasis:number(r[9]),closePrice:number(r[10]),value:number(r[11]),unrealized:number(r[12]),code:r[13]||''});
    if(r[0]==='Resumen Rendimiento Valoración al mercado'&&r[1]==='Data'&&r[2]==='Acciones'&&r[3])stockOpening[r[3]]={symbol:r[3],quantity:number(r[4]),currentQuantity:number(r[5]),previousPrice:number(r[6]),currentPrice:number(r[7])};
    if(r[0]==='Operaciones'&&r[1]==='Data'&&String(r[3]).includes('Opciones')){
      const p=symbolParts(r[5]);trades.push({...p,symbol:r[5],currency:r[4]||'USD',date:r[6],quantity:number(r[7]),price:number(r[8]),closePrice:number(r[9]),proceeds:number(r[10]),commission:number(r[11]),basis:number(r[12]),realized:number(r[13]),mtm:number(r[14]),code:r[15]||''});
    }
    if(r[0]==='Operaciones'&&r[1]==='Data'&&r[3]==='Acciones'&&r[5])stockTrades.push({symbol:r[5],currency:r[4]||baseCurrency,date:r[6],quantity:number(r[7]),price:number(r[8]),closePrice:number(r[9]),proceeds:number(r[10]),commission:number(r[11]),basis:number(r[12]),realized:number(r[13]),mtm:number(r[14]),code:r[15]||''});
  }
  return{open,trades,stockOpen,stockTrades,stockOpening,sawOpenPositionsSection,baseCurrency,nav,generatedAt,period};
}

const tradeFingerprint=t=>[t.symbol,datePart(t.date),t.quantity,t.price,t.proceeds,t.commission,t.realized,t.code].join('|');
const stockFingerprint=t=>[t.symbol,String(t.date||''),t.quantity,t.price,t.proceeds,t.commission,t.realized,t.code].join('|');
function mergeMultiset(existing,incoming,fingerprint){
  const ge=groupBy(existing,fingerprint),gi=groupBy(incoming,fingerprint),out=[];let added=0,skipped=0;
  new Set([...Object.keys(ge),...Object.keys(gi)]).forEach(k=>{const a=ge[k]||[],b=gi[k]||[];if(b.length>a.length){out.push(...a,...b.slice(a.length));added+=b.length-a.length;skipped+=a.length}else{out.push(...a);skipped+=b.length}});
  out.sort((a,b)=>String(a.date).localeCompare(String(b.date)));return{trades:out,added,skipped};
}
const mergeTrades=(a,b)=>mergeMultiset(a,b,tradeFingerprint);
const mergeStockTrades=(a,b)=>mergeMultiset(a,b,stockFingerprint);

function positionsMap(list){const out={};(list||[]).forEach(p=>{if(p?.symbol)out[p.symbol]=number(p.quantity)});return out}
function openingMap(obj){const out={};Object.entries(obj||{}).forEach(([k,p])=>out[k]=number(p?.quantity));return out}
function netByTicker(stockTrades,start=''){
  const map={};(stockTrades||[]).forEach(t=>{if(!t?.symbol||start&&datePart(t.date)<start)return;map[t.symbol]=(map[t.symbol]||0)+number(t.quantity)});return map;
}
function minimumOpeningFromDeficit(stockTrades,start=''){
  const state={};[...(stockTrades||[])].sort((a,b)=>String(a.date).localeCompare(String(b.date))).forEach(t=>{if(!t?.symbol||start&&datePart(t.date)<start)return;const s=state[t.symbol]||{running:0,min:0};s.running+=number(t.quantity);s.min=Math.min(s.min,s.running);state[t.symbol]=s});
  const out={};Object.entries(state).forEach(([k,s])=>out[k]=Math.max(0,-s.min));return out;
}
function latestReliableImport(data){return[...(data.imports||[])].reverse().find(x=>x.replacedOpenSnapshot)||null}
function buildMigratedSnapshot(data){
  const imp=latestReliableImport(data);if(!imp)return data.lastReliableStockSnapshot||null;
  return data.lastReliableStockSnapshot||{source:'migrated-snapshot',verified:true,file:imp.name||'',period:imp.period||null,generatedAt:data.accountSnapshot?.generatedAt||'',capturedAt:imp.date||data.openAsOf||'',positions:positionsMap(data.stockOpen)};
}
function chooseBaseline(current,incoming,fileName){
  const existing=current.stockBaseline?.verified?current.stockBaseline:null;
  const candidateOk=incoming.period?.start&&Object.keys(incoming.stockOpening||{}).length>0;
  if(!candidateOk)return existing;
  const candidate={source:'activity-statement-opening',verified:true,file:fileName,period:incoming.period,generatedAt:incoming.generatedAt||'',capturedAt:new Date().toISOString(),positions:openingMap(incoming.stockOpening)};
  if(!existing||!existing.period?.start||candidate.period.start<existing.period.start)return candidate;
  return existing;
}
function chooseSnapshot(current,incoming,fileName){
  if(incoming.sawOpenPositionsSection)return{source:'open-positions-section',verified:true,file:fileName,period:incoming.period,generatedAt:incoming.generatedAt||'',capturedAt:new Date().toISOString(),positions:positionsMap(incoming.stockOpen)};
  return current.lastReliableStockSnapshot||buildMigratedSnapshot(current);
}
function attributionOpening(data){
  const baseline=data.stockBaseline?.verified?data.stockBaseline:null;
  if(baseline?.period?.start){
    const earliest=(data.stockTrades||[]).map(t=>datePart(t.date)).filter(Boolean).sort()[0]||'';
    if(!earliest||baseline.period.start<=earliest){
      const out={};Object.entries(baseline.positions||{}).forEach(([symbol,qty])=>{if(Math.abs(qty)>EPS)out[symbol]={symbol,quantity:qty,currentQuantity:null,previousPrice:0,currentPrice:0,verified:true,method:'saldo de apertura del extracto base'}});return out;
    }
  }
  const minimum=minimumOpeningFromDeficit(data.stockTrades);const out={};Object.entries(minimum).forEach(([symbol,qty])=>{if(qty>EPS)out[symbol]={symbol,quantity:qty,currentQuantity:null,previousPrice:0,currentPrice:0,inferred:true,method:'déficit acumulado mínimo'}});return out;
}
function reconcileStocks(data){
  const baseline=data.stockBaseline?.verified?data.stockBaseline:null;
  const snapshot=data.lastReliableStockSnapshot?.verified?data.lastReliableStockSnapshot:null;
  const start=baseline?.period?.start||'';
  const net=netByTicker(data.stockTrades,start);const minimum=minimumOpeningFromDeficit(data.stockTrades,start);const final=snapshot?.positions||{};const base=baseline?.positions||{};
  const symbols=new Set([...Object.keys(net),...Object.keys(minimum),...Object.keys(final),...Object.keys(base)]);
  return[...symbols].sort().map(symbol=>{
    const movements=number(net[symbol]),minimumRequired=number(minimum[symbol]);
    if(baseline&&snapshot){const baselineQty=number(base[symbol]),reported=number(final[symbol]),reconstructed=baselineQty+movements,difference=reconstructed-reported;return{symbol,status:Math.abs(difference)<=EPS?'verified':'mismatch',baselineQty,movements,reconstructed,reported,difference,unexplained:0,minimumRequired,coverageStart:start,coverageEnd:snapshot.period?.end||''}}
    if(snapshot){const reported=number(final[symbol]),unexplained=reported-movements;return{symbol,status:Math.abs(unexplained)<=EPS?'no-baseline':'prior-history',baselineQty:null,movements,reconstructed:null,reported,difference:null,unexplained,minimumRequired,coverageStart:'',coverageEnd:snapshot.period?.end||''}}
    return{symbol,status:'no-snapshot',baselineQty:null,movements,reconstructed:null,reported:null,difference:null,unexplained:null,minimumRequired,coverageStart:start,coverageEnd:''};
  });
}
function detectBoxes(open){const groups=groupBy(open,p=>p.underlying+'|'+p.expiry),boxes=[];Object.values(groups).forEach(g=>{const strikes=[...new Set(g.map(x=>x.strike))].sort((a,b)=>a-b);if(strikes.length!==2)return;const legs=[];strikes.forEach(s=>['C','P'].forEach(r=>{const leg=g.find(x=>x.strike===s&&x.right===r&&!legs.includes(x));if(leg)legs.push(leg)}));if(legs.length===4){legs.forEach(x=>x.structure='box');boxes.push({id:'box|'+g[0].underlying+'|'+g[0].expiry,underlying:g[0].underlying,expiry:g[0].expiry,strikes,legs})}});return boxes}
function recomputeSummary(data,fileName,rowCount){const open=data.open||[],trades=data.trades||[],boxes=detectBoxes(open),naked=open.filter(x=>x.right==='P'&&x.quantity<0&&x.structure!=='box');return{file:fileName,rows:rowCount,openCount:open.length,tradeCount:trades.length,boxes:boxes.length,nakedPuts:naked.length,assignmentExposure:naked.reduce((s,x)=>s+x.strike*Math.abs(x.quantity)*(x.multiplier||100),0),realized:trades.reduce((s,x)=>s+number(x.realized),0),unrealized:open.reduce((s,x)=>s+number(x.unrealized),0),updatedAt:new Date().toISOString()}}

function sanitizeData(data){
  const next={...data,schemaVersion:SCHEMA};
  next.lastReliableStockSnapshot=next.lastReliableStockSnapshot||buildMigratedSnapshot(next);
  next.stockOpening=attributionOpening(next);
  next.stockReconciliation={version:SCHEMA,calculatedAt:new Date().toISOString(),baselineVerified:Boolean(next.stockBaseline?.verified),snapshotVerified:Boolean(next.lastReliableStockSnapshot?.verified),rows:reconcileStocks(next)};
  return next;
}
function migrateExisting(){
  const current=readJSON(STORE)||{};if(!Object.keys(current).length||current.schemaVersion===SCHEMA)return current;
  if(!localStorage.getItem(BACKUP))saveJSON(BACKUP,current);
  const migrated=sanitizeData({...current,stockBaseline:current.stockBaseline?.verified?current.stockBaseline:null});saveJSON(STORE,migrated);return migrated;
}

function buildNext(current,incoming,fileName,rowCount){
  const merged=mergeTrades(current.trades||[],incoming.trades||[]),mergedStocks=mergeStockTrades(current.stockTrades||[],incoming.stockTrades||[]),replace=incoming.sawOpenPositionsSection;
  const imports=[...(current.imports||[]),{name:fileName,date:new Date().toISOString(),rows:rowCount,period:incoming.period,tradesInFile:incoming.trades.length,added:merged.added,skipped:merged.skipped,stockTradesInFile:incoming.stockTrades.length,stockAdded:mergedStocks.added,stockSkipped:mergedStocks.skipped,openCount:incoming.open.length,stockOpenCount:incoming.stockOpen.length,replacedOpenSnapshot:replace}].slice(-60);
  let next={...current,schemaVersion:SCHEMA,trades:merged.trades,stockTrades:mergedStocks.trades,open:replace?incoming.open:(current.open||[]),stockOpen:replace?incoming.stockOpen:(current.stockOpen||[]),stockBaseline:chooseBaseline(current,incoming,fileName),lastReliableStockSnapshot:chooseSnapshot(current,incoming,fileName),accountSnapshot:{...(current.accountSnapshot||{}),baseCurrency:incoming.baseCurrency||current.accountSnapshot?.baseCurrency||'EUR',nav:incoming.nav??current.accountSnapshot?.nav??null,generatedAt:incoming.generatedAt||current.accountSnapshot?.generatedAt||'',period:incoming.period?.label||current.accountSnapshot?.period||'',importedAt:new Date().toISOString()},openAsOf:replace?new Date().toISOString():(current.openAsOf||null),events:merged.trades.filter(t=>/(?:^|;)(?:A|Ep|Ex)(?:;|$)/.test(String(t.code||''))),imports};
  next=sanitizeData(next);next.summary=recomputeSummary(next,fileName,rowCount);
  return{data:next,added:merged.added,skipped:merged.skipped,stockAdded:mergedStocks.added,stockSkipped:mergedStocks.skipped,replacedOpenSnapshot:replace,openCount:incoming.open.length,stockOpenCount:incoming.stockOpen.length};
}
function importCSV(text,fileName='IBKR.csv'){
  const rows=parseCSV(text),incoming=readReport(rows);
  if(!incoming.trades.length&&!incoming.open.length&&!incoming.stockTrades.length&&!incoming.stockOpen.length)throw new Error('El fichero no contiene operaciones reconocibles.');
  const current=migrateExisting()||{};if(!localStorage.getItem(BACKUP)&&localStorage.getItem(STORE))saveJSON(BACKUP,current);
  const result=buildNext(current,incoming,fileName,rows.length);saveJSON(STORE,result.data);
  const stored=readJSON(STORE);result.data=stored;return result;
}
function toast(msg){document.querySelector('.ffv142-toast')?.remove();const el=document.createElement('div');el.className='ffv142-toast';el.style.cssText='position:fixed;left:50%;bottom:96px;z-index:10000;transform:translateX(-50%);max-width:88vw;padding:13px 17px;border-radius:15px;background:#0f2037;border:1px solid #32609a;color:#f6f9ff;font:800 13px system-ui;box-shadow:0 18px 50px rgba(4,16,34,.5)';el.textContent=msg;document.body.appendChild(el);setTimeout(()=>el.remove(),4200)}
function rerender(){document.querySelector('.oi12-tabs [data-oi12-tab].active, .oi12-tabs [data-ffv14-tab].active')?.click();window.dispatchEvent(new CustomEvent('ff:v142-data',{detail:readJSON(STORE)}));}

document.addEventListener('change',async e=>{
  const input=e.target;if(!input||!input.matches?.('[data-oi12-file]'))return;
  e.stopImmediatePropagation();e.stopPropagation();const file=input.files?.[0];if(!file)return;toast('Fusionando y verificando el histórico…');
  try{const res=importCSV(await file.text(),file.name);input.value='';rerender();const snapshot=res.replacedOpenSnapshot?`${res.openCount} opciones y ${res.stockOpenCount} posiciones actualizadas`:'última fotografía fiable conservada';toast((res.added||res.stockAdded)?`${res.added} opciones y ${res.stockAdded} movimientos nuevos · ${snapshot}`:`Sin novedades · ${snapshot}`)}catch(err){console.error('[ffv14.2]',err);input.value='';toast('No se pudo leer el CSV de actividad de IBKR.')}
},true);

migrateExisting();
window.FFv142={version:SCHEMA,data:()=>readJSON(STORE)||{},importCSV,reconciliation:()=>reconcileStocks(readJSON(STORE)||{}),baseline:()=>readJSON(STORE)?.stockBaseline||null,snapshot:()=>readJSON(STORE)?.lastReliableStockSnapshot||null,backup:()=>readJSON(BACKUP),restore(){const b=readJSON(BACKUP);if(!b)return'No hay copia previa a v14.2.';saveJSON(STORE,b);location.reload();return'Restaurando…'},_internals:{parseCSV,readReport,parsePeriod,mergeTrades,mergeStockTrades,minimumOpeningFromDeficit,netByTicker,chooseBaseline,chooseSnapshot,attributionOpening,reconcileStocks,sanitizeData,buildNext,migrateExisting}};
})();
