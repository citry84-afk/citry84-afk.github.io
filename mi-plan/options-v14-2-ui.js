/* FinanzasFácil · Opciones v14.2 — presentación de cobertura y reconciliación. */
(() => {
'use strict';
if(window.__FF_OPTIONS_V142_UI__)return;window.__FF_OPTIONS_V142_UI__=true;
const EPS=1e-7;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pct=(v,d=1)=>`${new Intl.NumberFormat('es-ES',{maximumFractionDigits:d}).format(Number(v)||0)}%`;

function statusLabel(row){
  if(row.status==='verified')return['Verificado','good'];
  if(row.status==='mismatch')return['Descuadre','bad'];
  if(row.status==='prior-history')return['Anterior al histórico','warn'];
  if(row.status==='no-baseline')return['Sin base independiente','warn'];
  return['Sin fotografía final','muted'];
}
function formatQty(v){return v===null||v===undefined?'—':new Intl.NumberFormat('es-ES',{maximumFractionDigits:4}).format(v)}
function reconciliationMarkup(data){
  const rows=data.stockReconciliation?.rows||window.FFv142?.reconciliation?.()||[];
  const baseline=data.stockBaseline?.verified?data.stockBaseline:null,snapshot=data.lastReliableStockSnapshot?.verified?data.lastReliableStockSnapshot:null;
  const verified=rows.filter(r=>r.status==='verified').length,mismatch=rows.filter(r=>r.status==='mismatch').length,prior=rows.filter(r=>['prior-history','no-baseline'].includes(r.status)).length;
  const headline=mismatch?`<span class="ffv142-badge bad">${mismatch} descuadre${mismatch===1?'':'s'}</span>`:prior?`<span class="ffv142-badge warn">${prior} saldo${prior===1?'':'s'} sin explicar</span>`:snapshot&&baseline?`<span class="ffv142-badge good">${verified} verificados</span>`:`<span class="ffv142-badge muted">Cobertura incompleta</span>`;
  const intro=baseline?`Base independiente: <b>${esc(baseline.file||'extracto')}</b>${baseline.period?.start?` desde ${esc(baseline.period.start)}`:''}.`:'No existe todavía un saldo de apertura independiente. Las cantidades “no explicadas” no se presentan como verificadas.';
  const snap=snapshot?`Última fotografía fiable: <b>${esc(snapshot.file||'extracto')}</b>${snapshot.period?.end?` a ${esc(snapshot.period.end)}`:''}.`:'No hay una fotografía final fiable de posiciones.';
  const meaningful=rows.filter(r=>Math.abs(r.movements||0)+Math.abs(r.reported||0)+Math.abs(r.baselineQty||0)+Math.abs(r.unexplained||0)>EPS);
  const body=meaningful.length?meaningful.map(r=>{
    const [label,tone]=statusLabel(r);
    const source=baseline?formatQty(r.baselineQty):formatQty(r.unexplained);
    const computed=baseline?formatQty(r.reconstructed):formatQty(r.minimumRequired);
    const delta=baseline?formatQty(r.difference):formatQty(r.minimumRequired);
    return`<div class="ffv142-rec-row ${tone}"><b>${esc(r.symbol)}</b><span>${source}</span><span>${r.movements>0?'+':''}${formatQty(r.movements)}</span><span>${computed}</span><span>${formatQty(r.reported)}</span><span>${delta}</span><strong>${label}</strong></div>`;
  }).join(''):`<div class="ffv142-empty">No hay movimientos de acciones que analizar.</div>`;
  return`<section class="ffv13-section ffv142-reconciliation" data-ffv142-reconciliation>
    <div class="ffv142-head"><div><h3>Reconciliación independiente de acciones</h3><p>${intro} ${snap}</p></div>${headline}</div>
    <div class="ffv142-legend">${baseline?'La comprobación usa un saldo de apertura externo al resultado final.':'“No explicado” = posición final − operaciones conocidas. No demuestra que el histórico esté completo.'}</div>
    <div class="ffv142-rec-table"><div class="ffv142-rec-head"><span>Ticker</span><span>${baseline?'Base verificada':'No explicado'}</span><span>Movimientos</span><span>${baseline?'Reconstruido':'Mínimo necesario'}</span><span>IBKR</span><span>${baseline?'Diferencia':'Déficit mínimo'}</span><span>Estado</span></div>${body}</div>
    <div class="ffv14-disclaimer"><b>Lectura correcta:</b> “Verificado” solo aparece cuando existe una base independiente y coincide con la última fotografía. “Anterior al histórico” indica acciones cuya adquisición no está incluida en las operaciones disponibles; puede ser legítimo, pero impide auditar completamente el FIFO.</div>
  </section>`;
}
function injectStyles(){
  if(document.querySelector('style[data-ffv142]'))return;
  const s=document.createElement('style');s.dataset.ffv142='1';s.textContent=`
.ffv142-reconciliation{margin-bottom:12px}.ffv142-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:10px}.ffv142-head h3{margin:0 0 4px;font-size:17px}.ffv142-head p{margin:0;color:#91a5bf;font-size:10px;line-height:1.45}.ffv142-head p b{color:#dce9fa}.ffv142-badge{padding:6px 9px;border-radius:999px;font-size:9px;font-weight:900;white-space:nowrap}.ffv142-badge.good{background:#153d33;color:#6ee1bd}.ffv142-badge.warn{background:#4a3519;color:#ffc76f}.ffv142-badge.bad{background:#4b202d;color:#ff939d}.ffv142-badge.muted{background:#19293d;color:#9eb0c6}.ffv142-legend{padding:9px 11px;margin-bottom:8px;border-radius:11px;background:#09182a;color:#9aadc5;font-size:9px}.ffv142-rec-table{display:grid;gap:4px}.ffv142-rec-head,.ffv142-rec-row{display:grid;grid-template-columns:1fr repeat(5,.72fr) 1.05fr;gap:7px;align-items:center;padding:8px;border-radius:10px}.ffv142-rec-head{color:#91a5bf;font-size:8px;font-weight:900;text-transform:uppercase}.ffv142-rec-row{background:#0f2037;font-size:10px}.ffv142-rec-row span,.ffv142-rec-row strong{text-align:right}.ffv142-rec-row.good strong{color:#35d0a1}.ffv142-rec-row.warn{border:1px solid #6a4c1f}.ffv142-rec-row.warn strong{color:#ffc76f}.ffv142-rec-row.bad{border:1px solid #663040}.ffv142-rec-row.bad strong{color:#ff6574}.ffv142-rec-row.muted strong{color:#9eb0c6}.ffv142-empty{padding:18px;text-align:center;color:#91a5bf}.ffv142-summary-alert{margin-bottom:12px}.ffv142-provisional{border-color:#6a4c1f!important}.ffv142-open-note{display:block;color:#91a5bf!important;font-size:8px!important;margin-top:2px}
@media(max-width:760px){.ffv142-head{flex-direction:column}.ffv142-rec-head,.ffv142-rec-row{grid-template-columns:1fr repeat(3,.8fr)}.ffv142-rec-head span:nth-child(2),.ffv142-rec-row span:nth-child(2),.ffv142-rec-head span:nth-child(4),.ffv142-rec-row span:nth-child(4),.ffv142-rec-head span:nth-child(6),.ffv142-rec-row span:nth-child(6){display:none}}
`;document.head.appendChild(s);
}
function patchAssignments(root,data){
  const rec=new Map((data.stockReconciliation?.rows||[]).map(r=>[r.symbol,r]));
  root.querySelectorAll('.ffv14-assign').forEach(card=>{
    const ticker=card.querySelector('div:first-child > span')?.textContent?.trim();if(!ticker)return;
    const row=rec.get(ticker);const metrics=[...card.children],rocBox=metrics.at(-1);
    const firstText=card.querySelector('div:first-child small')?.textContent||'';
    const open=/siguen abiertas/.test(firstText);
    if(open&&rocBox){const label=rocBox.querySelector('small'),value=rocBox.querySelector('b');if(label)label.textContent='Rentabilidad acumulada';
      const a=[...(window.FFv14?.assignments?.().values?.()||[])].find(x=>x.cycle?.underlying===ticker&&x.remainingQty>EPS);const simple=a?.cycle?.capital?(a.adjustedPnl/a.cycle.capital)*100:null;if(value)value.textContent=simple===null?'—':pct(simple);if(!rocBox.querySelector('.ffv142-open-note'))rocBox.insertAdjacentHTML('beforeend','<small class="ffv142-open-note">ciclo abierto · sin anualizar</small>');}
    if(row&&!['verified'].includes(row.status)){card.classList.add('ffv142-provisional');const adjusted=metrics.find(x=>x.querySelector?.('small')?.textContent==='Resultado ajustado');const b=adjusted?.querySelector('b');if(b&&b.textContent!=='Pendiente')b.textContent='Provisional';}
  });
}
let busy=false;
function patchUI(){
  const root=document.querySelector('#viewRoot .oi12');if(!root||busy)return;busy=true;
  try{injectStyles();const data=window.FFv142?.data?.()||{};const panel=root.querySelector('[data-ffv14-panel].active');
    if(panel&&panel.textContent.includes('Auditoría de tu sistema')){panel.querySelector('[data-ffv142-reconciliation]')?.remove();panel.insertAdjacentHTML('afterbegin',reconciliationMarkup(data));patchAssignments(root,data)}
    const summary=root.querySelector('[data-oi12-view="summary"]');if(summary){summary.querySelector('[data-ffv142-summary-alert]')?.remove();const rows=data.stockReconciliation?.rows||[],bad=rows.filter(r=>r.status==='mismatch'),prior=rows.filter(r=>['prior-history','no-baseline'].includes(r.status));if(bad.length||prior.length){const box=document.createElement('section');box.dataset.ffv142SummaryAlert='1';box.className='ffv13-section ffv142-summary-alert';box.innerHTML=`<div class="ffv142-head"><div><h3>${bad.length?'Hay posiciones que no cuadran':'El histórico de acciones no empieza desde cero'}</h3><p>${bad.length?`${esc(bad.map(x=>x.symbol).join(', '))}: la base independiente y la fotografía final no coinciden.`:`${esc(prior.map(x=>x.symbol).join(', '))}: parte de la posición procede de antes del periodo disponible. Los ciclos afectados son provisionales.`}</p></div><span class="ffv142-badge ${bad.length?'bad':'warn'}">${bad.length?'Revisar':'Cobertura parcial'}</span></div>`;summary.insertBefore(box,summary.firstChild)}}
  }catch(err){console.error('[ffv14.2-ui]',err)}finally{busy=false}
}
try{if(window.FFv14){window.FFv14.version='14.2';window.FFv14.reconciliation=window.FFv142.reconciliation;window.FFv14.baseline=window.FFv142.baseline;window.FFv14._internals={...(window.FFv14._internals||{}),importCSV:window.FFv142.importCSV,reconcileStocks:window.FFv142._internals.reconcileStocks,sanitizeData:window.FFv142._internals.sanitizeData}}}catch(_){ }
const host=document.querySelector('#viewRoot');if(host)new MutationObserver(()=>setTimeout(patchUI,0)).observe(host,{childList:true,subtree:true});window.addEventListener('ff:v142-data',()=>setTimeout(patchUI,40));setTimeout(()=>{document.querySelector('.oi12-tabs [data-oi12-tab].active, .oi12-tabs [data-ffv14-tab].active')?.click();setTimeout(patchUI,80)},40);
})();
