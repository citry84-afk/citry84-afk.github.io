/* FinanzasFácil · Opciones v14.1
   Corrección acumulativa de lotes de acciones:
   - deduce el saldo anterior al histórico desde la foto final y las operaciones fusionadas
   - evita que el saldo inicial del último CSV cree lotes fantasma
   - reconcilia por ticker contra la última posición abierta informada por IBKR
   - no anualiza como cifra principal las asignaciones que siguen abiertas
   Esta capa se carga después de v14 y mantiene v12/v14 como respaldo.
*/
(() => {
'use strict';
if (window.__FF_OPTIONS_V141__) return;
window.__FF_OPTIONS_V141__ = true;

const STORE='ff_options_safe_v9';
const BACKUP='ff_options_v141_backup';
const EPS=1e-7;
const rawSet=Storage.prototype.setItem;
const rawGet=Storage.prototype.getItem;
const number=v=>{const n=Number(String(v??'').replace(/,/g,''));return Number.isFinite(n)?n:0};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pct=(v,d=1)=>`${new Intl.NumberFormat('es-ES',{maximumFractionDigits:d}).format(Number(v)||0)}%`;
const money=(v,currency='USD')=>new Intl.NumberFormat('es-ES',{style:'currency',currency,maximumFractionDigits:0}).format(Number(v)||0);
const read=()=>{try{return JSON.parse(rawGet.call(localStorage,STORE)||'null')||{}}catch(_){return{}}};
const write=data=>rawSet.call(localStorage,STORE,JSON.stringify(data));

function latestHasReliableSnapshot(data){
  const last=(data.imports||[]).at(-1);
  return Boolean(last?.replacedOpenSnapshot);
}

function groupNetTrades(stockTrades){
  const map=new Map();
  (stockTrades||[]).forEach(t=>{
    if(!t?.symbol)return;
    map.set(t.symbol,(map.get(t.symbol)||0)+number(t.quantity));
  });
  return map;
}

function minimumOpeningFromDeficit(stockTrades){
  const by=new Map();
  [...(stockTrades||[])].sort((a,b)=>String(a.date).localeCompare(String(b.date))).forEach(t=>{
    if(!t?.symbol)return;
    const state=by.get(t.symbol)||{running:0,min:0};
    state.running+=number(t.quantity);
    state.min=Math.min(state.min,state.running);
    by.set(t.symbol,state);
  });
  return new Map([...by].map(([symbol,s])=>[symbol,Math.max(0,-s.min)]));
}

function inferStockOpening(data){
  const net=groupNetTrades(data.stockTrades);
  const deficit=minimumOpeningFromDeficit(data.stockTrades);
  const reliable=latestHasReliableSnapshot(data);
  const finalMap=new Map((data.stockOpen||[]).map(p=>[p.symbol,number(p.quantity)]));
  const symbols=new Set([
    ...net.keys(),...deficit.keys(),...finalMap.keys(),...Object.keys(data.stockOpening||{})
  ]);
  const inferred={};
  symbols.forEach(symbol=>{
    const netQty=net.get(symbol)||0;
    const minQty=deficit.get(symbol)||0;
    let qty;
    let method;
    if(reliable){
      const finalQty=finalMap.get(symbol)||0;
      qty=finalQty-netQty;
      method='posición final − movimientos netos';
      if(qty<0) qty=minQty;
      qty=Math.max(qty,minQty,0);
    }else{
      qty=minQty;
      method='déficit acumulado mínimo';
    }
    if(qty>EPS){
      inferred[symbol]={symbol,quantity:qty,currentQuantity:reliable?(finalMap.get(symbol)||0):null,
        previousPrice:0,currentPrice:0,inferred:true,method};
    }
  });
  return inferred;
}

function reconcileStocks(data,opening=inferStockOpening(data)){
  const reliable=latestHasReliableSnapshot(data);
  const net=groupNetTrades(data.stockTrades);
  const finalMap=new Map((data.stockOpen||[]).map(p=>[p.symbol,number(p.quantity)]));
  const symbols=new Set([...Object.keys(opening),...net.keys(),...finalMap.keys()]);
  return [...symbols].sort().map(symbol=>{
    const initial=number(opening[symbol]?.quantity);
    const movements=net.get(symbol)||0;
    const reconstructed=initial+movements;
    const reported=reliable?(finalMap.get(symbol)||0):null;
    const difference=reported===null?null:reconstructed-reported;
    return {symbol,initial,movements,reconstructed,reported,difference,
      status:reported===null?'unknown':Math.abs(difference)<=EPS?'ok':'mismatch'};
  });
}

function sanitizeData(data){
  if(!data||typeof data!=='object')return data;
  const next={...data};
  next.stockOpening=inferStockOpening(next);
  next.stockReconciliation={
    version:'14.1',
    calculatedAt:new Date().toISOString(),
    reliableSnapshot:latestHasReliableSnapshot(next),
    rows:reconcileStocks(next,next.stockOpening)
  };
  return next;
}

function migrate(){
  const current=read();
  if(!Object.keys(current).length)return null;
  if(!rawGet.call(localStorage,BACKUP))rawSet.call(localStorage,BACKUP,JSON.stringify(current));
  const next=sanitizeData(current);
  write(next);
  return next;
}

Storage.prototype.setItem=function(key,value){
  if(key!==STORE)return rawSet.call(this,key,value);
  try{
    const parsed=JSON.parse(String(value));
    return rawSet.call(this,key,JSON.stringify(sanitizeData(parsed)));
  }catch(_){return rawSet.call(this,key,value)}
};

function assignmentView(){
  try{return [...(window.FFv14?.assignments?.().values?.()||[])]}catch(_){return[]}
}

function reconciliationMarkup(data){
  const rows=(data.stockReconciliation?.rows||reconcileStocks(data));
  const mismatches=rows.filter(r=>r.status==='mismatch');
  const unknown=rows.filter(r=>r.status==='unknown');
  const meaningful=rows.filter(r=>Math.abs(r.initial)+Math.abs(r.movements)+Math.abs(r.reported||0)>EPS);
  const badge=mismatches.length?`<span class="ffv141-badge bad">${mismatches.length} descuadre${mismatches.length===1?'':'s'}</span>`:
    unknown.length?`<span class="ffv141-badge warn">Foto no concluyente</span>`:`<span class="ffv141-badge good">Todo cuadra</span>`;
  const body=meaningful.length?meaningful.map(r=>`<div class="ffv141-rec-row ${r.status}">
    <b>${esc(r.symbol)}</b><span>${r.initial.toFixed(0)}</span><span>${r.movements>=0?'+':''}${r.movements.toFixed(0)}</span>
    <span>${r.reconstructed.toFixed(0)}</span><span>${r.reported===null?'—':r.reported.toFixed(0)}</span>
    <strong>${r.difference===null?'Sin foto':Math.abs(r.difference)<=EPS?'Cuadra':`${r.difference>0?'+':''}${r.difference.toFixed(0)}`}</strong>
  </div>`).join(''):`<div class="ffv141-empty">No hay movimientos de acciones que reconciliar.</div>`;
  return `<section class="ffv13-section ffv141-reconciliation" data-ffv141-reconciliation>
    <div class="ffv141-head"><div><h3>Cuadre de acciones por ticker</h3><p>Saldo inferido antes del histórico + movimientos fusionados = posición abierta informada por IBKR.</p></div>${badge}</div>
    <div class="ffv141-rec-table"><div class="ffv141-rec-head"><span>Ticker</span><span>Inicial</span><span>Movimientos</span><span>Reconstruido</span><span>IBKR</span><span>Estado</span></div>${body}</div>
    <div class="ffv14-disclaimer"><b>Protección de precisión:</b> cuando un ticker no cuadra, su resultado ajustado debe considerarse provisional hasta revisar el extracto o ampliar el periodo histórico.</div>
  </section>`;
}

function patchAssignmentCards(root){
  const assignments=assignmentView();
  const cards=[...root.querySelectorAll('.ffv14-assign')];
  cards.forEach((card,i)=>{
    const a=assignments[i]; if(!a||!a.matched)return;
    const metrics=[...card.children];
    const rocBox=metrics.at(-1); if(!rocBox)return;
    const label=rocBox.querySelector('small'); const value=rocBox.querySelector('b');
    if(a.remainingQty>EPS){
      const simple=a.cycle?.capital?(a.adjustedPnl/a.cycle.capital)*100:null;
      if(label)label.textContent='Rentabilidad acum.';
      if(value)value.textContent=simple===null?'—':pct(simple);
      let note=card.querySelector('.ffv141-open-note');
      if(!note){note=document.createElement('small');note.className='ffv141-open-note';rocBox.appendChild(note);}
      note.textContent='ciclo aún abierto · sin anualizar';
    }
    const rec=(read().stockReconciliation?.rows||[]).find(r=>r.symbol===a.cycle?.underlying);
    if(rec?.status==='mismatch'){
      card.classList.add('ffv141-unreconciled');
      const valueBox=metrics.find(x=>x.querySelector?.('small')?.textContent==='Resultado ajustado');
      const b=valueBox?.querySelector('b'); if(b)b.textContent='Provisional';
    }
  });
}

function injectStyles(){
  if(document.querySelector('style[data-ffv141]'))return;
  const s=document.createElement('style');s.dataset.ffv141='1';s.textContent=`
.ffv141-reconciliation{margin-top:12px}.ffv141-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:12px}.ffv141-head h3{margin:0 0 4px;font-size:17px}.ffv141-head p{margin:0;color:#91a5bf;font-size:11px}.ffv141-badge{padding:6px 9px;border-radius:999px;font-size:9px;font-weight:900;white-space:nowrap}.ffv141-badge.good{background:#153d33;color:#6ee1bd}.ffv141-badge.warn{background:#4a3519;color:#ffc76f}.ffv141-badge.bad{background:#4b202d;color:#ff939d}.ffv141-rec-table{display:grid;gap:4px}.ffv141-rec-head,.ffv141-rec-row{display:grid;grid-template-columns:1fr repeat(5,.75fr);gap:7px;align-items:center;padding:8px;border-radius:10px}.ffv141-rec-head{color:#91a5bf;font-size:8px;font-weight:900;text-transform:uppercase}.ffv141-rec-row{background:#0f2037;font-size:10px}.ffv141-rec-row span,.ffv141-rec-row strong{text-align:right}.ffv141-rec-row.ok strong{color:#35d0a1}.ffv141-rec-row.mismatch{border:1px solid #663040}.ffv141-rec-row.mismatch strong{color:#ff6574}.ffv141-rec-row.unknown strong{color:#ffc45c}.ffv141-empty{padding:18px;text-align:center;color:#91a5bf}.ffv141-open-note{color:#91a5bf!important;font-size:8px!important}.ffv141-unreconciled{border-color:#663040!important}
@media(max-width:650px){.ffv141-rec-head,.ffv141-rec-row{grid-template-columns:1fr repeat(3,.7fr)}.ffv141-rec-head span:nth-child(2),.ffv141-rec-row span:nth-child(2),.ffv141-rec-head span:nth-child(3),.ffv141-rec-row span:nth-child(3){display:none}.ffv141-head{flex-direction:column}}
`;
  document.head.appendChild(s);
}

let patching=false;
function patchUI(){
  const root=document.querySelector('#viewRoot .oi12'); if(!root||patching)return;
  patching=true;
  try{
    injectStyles();
    const data=read();
    const analysis=root.querySelector('[data-ffv14-panel].active');
    if(analysis&&analysis.textContent.includes('Auditoría de tu sistema')){
      analysis.querySelector('[data-ffv141-reconciliation]')?.remove();
      analysis.insertAdjacentHTML('afterbegin',reconciliationMarkup(data));
      patchAssignmentCards(root);
    }
    const mismatches=(data.stockReconciliation?.rows||[]).filter(r=>r.status==='mismatch');
    const summary=root.querySelector('[data-oi12-view="summary"]');
    if(summary){
      summary.querySelector('[data-ffv141-summary-warning]')?.remove();
      if(mismatches.length){
        const box=document.createElement('section');box.dataset.ffv141SummaryWarning='1';box.className='ffv13-section';
        box.innerHTML=`<div class="ffv141-head"><div><h3>Hay ${mismatches.length} ticker${mismatches.length===1?'':'s'} sin conciliar</h3><p>${esc(mismatches.map(x=>x.symbol).join(', '))}. Los resultados ajustados afectados se muestran como provisionales.</p></div><span class="ffv141-badge bad">Revisar</span></div>`;
        summary.insertBefore(box,summary.firstChild);
      }
    }
  }catch(err){console.error('[ffv14.1] UI:',err)}finally{patching=false}
}

migrate();
try{
  if(window.FFv14){
    const original=window.FFv14._internals?.buildAssignmentLedger;
    window.FFv14.version='14.1';
    window.FFv14.reconciliation=()=>reconcileStocks(read());
    window.FFv14.inferredOpening=()=>inferStockOpening(read());
    window.FFv14._internals={...(window.FFv14._internals||{}),inferStockOpening,reconcileStocks,sanitizeData,originalBuildAssignmentLedger:original};
  }
}catch(_){ }

const host=document.querySelector('#viewRoot');
if(host)new MutationObserver(()=>setTimeout(patchUI,0)).observe(host,{childList:true,subtree:true});
setTimeout(()=>{
  document.querySelector('.oi12-tabs [data-oi12-tab].active')?.click();
  setTimeout(patchUI,80);
},40);

window.FFv141={version:'14.1',data:read,inferStockOpening:()=>inferStockOpening(read()),reconciliation:()=>reconcileStocks(read()),migrate,backup:()=>{try{return JSON.parse(rawGet.call(localStorage,BACKUP)||'null')}catch(_){return null}},restore(){const b=rawGet.call(localStorage,BACKUP);if(!b)return'No hay copia previa a v14.1.';rawSet.call(localStorage,STORE,b);location.reload();return'Restaurando…';},_internals:{inferStockOpening,reconcileStocks,sanitizeData,minimumOpeningFromDeficit,groupNetTrades}};
})();
