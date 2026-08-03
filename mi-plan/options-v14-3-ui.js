/* FinanzasFácil · Opciones v14.3 — ventana de reconciliación y movimientos pendientes. */
(() => {
'use strict';
if(window.__FF_OPTIONS_V143_UI__)return;window.__FF_OPTIONS_V143_UI__=true;
const EPS=1e-7;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pct=(v,d=1)=>`${new Intl.NumberFormat('es-ES',{maximumFractionDigits:d}).format(Number(v)||0)}%`;
const qty=v=>v===null||v===undefined?'—':new Intl.NumberFormat('es-ES',{maximumFractionDigits:4}).format(v);
const date=v=>{if(!v)return'—';const [y,m,d]=String(v).split('-');return d&&m&&y?`${d}/${m}/${y}`:String(v)};
function status(row){
  if(row.status==='verified')return['Verificado','good'];
  if(row.status==='verified-pending')return[`Verificado hasta ${date(row.coverageEnd)}`,'pending'];
  if(row.status==='mismatch')return['Descuadre real','bad'];
  if(row.status==='prior-history')return['Anterior al histórico','warn'];
  if(row.status==='no-baseline')return['Sin base independiente','warn'];
  return['Sin fotografía final','muted'];
}
function pendingText(row){
  if(!row.pendingAfterCount)return'—';
  const net=row.pendingAfterNet>0?`+${qty(row.pendingAfterNet)}`:qty(row.pendingAfterNet);
  return`${row.pendingAfterCount} · ${net}`;
}
function markup(data){
  const rows=data.stockReconciliation?.rows||window.FFv143?.reconciliation?.()||[];
  const base=data.stockBaseline?.verified?data.stockBaseline:null;
  const snap=data.lastReliableStockSnapshot?.verified?data.lastReliableStockSnapshot:null;
  const bad=rows.filter(r=>r.status==='mismatch').length;
  const partial=rows.filter(r=>['prior-history','no-baseline'].includes(r.status)).length;
  const pending=rows.reduce((s,r)=>s+(r.pendingAfterCount||0),0);
  const verified=rows.filter(r=>['verified','verified-pending'].includes(r.status)).length;
  const badge=bad?`<span class="ffv143-badge bad">${bad} descuadre${bad===1?'':'s'}</span>`:
    partial?`<span class="ffv143-badge warn">${partial} cobertura${partial===1?'':'s'} parcial${partial===1?'':'es'}</span>`:
    pending?`<span class="ffv143-badge pending">Verificado + ${pending} posterior${pending===1?'':'es'}</span>`:
    base&&snap?`<span class="ffv143-badge good">${verified} verificados</span>`:`<span class="ffv143-badge muted">Cobertura incompleta</span>`;
  const intro=base?`Base: <b>${esc(base.file||'extracto')}</b>${base.period?.start?` desde ${date(base.period.start)}`:''}.`:'Sin saldo de apertura independiente.';
  const photo=snap?`Fotografía contrastada hasta <b>${date(snap.period?.end)}</b> (${esc(snap.file||'extracto')}).`:'Sin fotografía final fiable.';
  const useful=rows.filter(r=>Math.abs(r.movements||0)+Math.abs(r.reported||0)+Math.abs(r.baselineQty||0)+Math.abs(r.unexplained||0)+(r.pendingAfterCount||0)>EPS);
  const body=useful.length?useful.map(r=>{
    const [label,tone]=status(r);const source=base?qty(r.baselineQty):qty(r.unexplained);const rebuilt=base?qty(r.reconstructed):qty(r.minimumRequired);const delta=base?qty(r.difference):qty(r.minimumRequired);
    return`<div class="ffv143-row ${tone}"><b>${esc(r.symbol)}</b><span>${source}</span><span>${r.movements>0?'+':''}${qty(r.movements)}</span><span>${rebuilt}</span><span>${qty(r.reported)}</span><span>${delta}</span><span>${pendingText(r)}</span><strong>${label}</strong></div>`;
  }).join(''):`<div class="ffv143-empty">No hay movimientos de acciones que analizar.</div>`;
  return`<section class="ffv13-section ffv143-panel" data-ffv143-reconciliation>
    <div class="ffv143-head"><div><h3>Reconciliación por ventana temporal</h3><p>${intro} ${photo}</p></div>${badge}</div>
    <div class="ffv143-note">Solo se contrastan operaciones comprendidas entre la fecha inicial de la base y la fecha final de la fotografía. Los movimientos posteriores se muestran aparte y no provocan un falso descuadre.</div>
    <div class="ffv143-table"><div class="ffv143-tablehead"><span>Ticker</span><span>${base?'Base':'No explicado'}</span><span>Mov. ventana</span><span>${base?'Reconstruido':'Mínimo'}</span><span>IBKR</span><span>${base?'Diferencia':'Déficit'}</span><span>Posteriores</span><span>Estado</span></div>${body}</div>
    <div class="ffv14-disclaimer"><b>Semáforo fiable:</b> “Verificado hasta” significa que la posición cuadra en la fecha de la última fotografía, aunque existan operaciones posteriores todavía sin una nueva fotografía con la que contrastarlas.</div>
  </section>`;
}
function styles(){
  if(document.querySelector('style[data-ffv143]'))return;const s=document.createElement('style');s.dataset.ffv143='1';s.textContent=`
.ffv143-panel{margin-bottom:12px}.ffv143-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:10px}.ffv143-head h3{margin:0 0 4px;font-size:17px}.ffv143-head p{margin:0;color:#91a5bf;font-size:10px;line-height:1.45}.ffv143-head p b{color:#dce9fa}.ffv143-badge{padding:6px 9px;border-radius:999px;font-size:9px;font-weight:900;white-space:nowrap}.ffv143-badge.good{background:#153d33;color:#6ee1bd}.ffv143-badge.pending{background:#17365f;color:#8dbaff}.ffv143-badge.warn{background:#4a3519;color:#ffc76f}.ffv143-badge.bad{background:#4b202d;color:#ff939d}.ffv143-badge.muted{background:#19293d;color:#9eb0c6}.ffv143-note{padding:9px 11px;margin-bottom:8px;border-radius:11px;background:#09182a;color:#9aadc5;font-size:9px}.ffv143-table{display:grid;gap:4px}.ffv143-tablehead,.ffv143-row{display:grid;grid-template-columns:.85fr repeat(6,.72fr) 1.2fr;gap:7px;align-items:center;padding:8px;border-radius:10px}.ffv143-tablehead{color:#91a5bf;font-size:8px;font-weight:900;text-transform:uppercase}.ffv143-row{background:#0f2037;font-size:10px}.ffv143-row span,.ffv143-row strong{text-align:right}.ffv143-row.good strong{color:#35d0a1}.ffv143-row.pending{border:1px solid #315b91}.ffv143-row.pending strong{color:#8dbaff}.ffv143-row.warn{border:1px solid #6a4c1f}.ffv143-row.warn strong{color:#ffc76f}.ffv143-row.bad{border:1px solid #663040}.ffv143-row.bad strong{color:#ff6574}.ffv143-row.muted strong{color:#9eb0c6}.ffv143-empty{padding:18px;text-align:center;color:#91a5bf}.ffv143-summary{margin-bottom:12px}.ffv143-later-note{display:block;color:#8dbaff!important;font-size:8px!important;margin-top:2px}
@media(max-width:820px){.ffv143-head{flex-direction:column}.ffv143-tablehead,.ffv143-row{grid-template-columns:1fr repeat(3,.8fr)}.ffv143-tablehead span:nth-child(2),.ffv143-row span:nth-child(2),.ffv143-tablehead span:nth-child(4),.ffv143-row span:nth-child(4),.ffv143-tablehead span:nth-child(6),.ffv143-row span:nth-child(6),.ffv143-tablehead span:nth-child(7),.ffv143-row span:nth-child(7){display:none}}
`;document.head.appendChild(s);
}
function patchAssignments(root,data){
  const rec=new Map((data.stockReconciliation?.rows||[]).map(r=>[r.symbol,r]));
  root.querySelectorAll('.ffv14-assign').forEach(card=>{
    const ticker=card.querySelector('div:first-child > span')?.textContent?.trim();if(!ticker)return;const row=rec.get(ticker);if(!row)return;
    card.classList.remove('ffv142-provisional');
    const first=card.querySelector('div:first-child');first?.querySelector('.ffv143-later-note')?.remove();
    if(row.pendingAfterCount){first?.insertAdjacentHTML('beforeend',`<small class="ffv143-later-note">${row.pendingAfterCount} movimiento${row.pendingAfterCount===1?'':'s'} posterior${row.pendingAfterCount===1?'':'es'} a la fotografía, aún sin contrastar</small>`);}
    if(['mismatch','prior-history','no-baseline','no-snapshot'].includes(row.status)){
      card.style.borderColor=row.status==='mismatch'?'#663040':'#6a4c1f';
      const metrics=[...card.children],adjusted=metrics.find(x=>x.querySelector?.('small')?.textContent==='Resultado ajustado');const b=adjusted?.querySelector('b');if(b&&b.textContent!=='Pendiente')b.textContent='Provisional';
    }
  });
}
let busy=false;
function patch(){
  const root=document.querySelector('#viewRoot .oi12');if(!root||busy)return;busy=true;
  try{styles();const data=window.FFv143?.data?.()||{};const panel=root.querySelector('[data-ffv14-panel].active');if(panel&&panel.textContent.includes('Auditoría de tu sistema')){panel.querySelector('[data-ffv143-reconciliation]')?.remove();panel.insertAdjacentHTML('afterbegin',markup(data));patchAssignments(root,data)}
    const summary=root.querySelector('[data-oi12-view="summary"]');if(summary){summary.querySelector('[data-ffv143-summary]')?.remove();const rows=data.stockReconciliation?.rows||[],bad=rows.filter(r=>r.status==='mismatch'),partial=rows.filter(r=>['prior-history','no-baseline'].includes(r.status)),pending=rows.reduce((s,r)=>s+(r.pendingAfterCount||0),0);if(bad.length||partial.length||pending){const box=document.createElement('section');box.dataset.ffv143Summary='1';box.className='ffv13-section ffv143-summary';const title=bad.length?'Hay posiciones que no cuadran':partial.length?'El histórico de acciones tiene cobertura parcial':'Hay movimientos posteriores a la última fotografía';const text=bad.length?`${esc(bad.map(x=>x.symbol).join(', '))}: la base y la fotografía no coinciden dentro de la misma ventana.`:partial.length?`${esc(partial.map(x=>x.symbol).join(', '))}: parte de la posición procede de antes del histórico disponible.`:`${pending} movimiento${pending===1?'':'s'} queda${pending===1?'':'n'} pendiente${pending===1?'':'s'} de contrastar con la próxima fotografía completa; no se considera descuadre.`;const tone=bad.length?'bad':partial.length?'warn':'pending';box.innerHTML=`<div class="ffv143-head"><div><h3>${title}</h3><p>${text}</p></div><span class="ffv143-badge ${tone}">${bad.length?'Revisar':partial.length?'Cobertura parcial':'Pendiente de foto'}</span></div>`;summary.insertBefore(box,summary.firstChild)}}
  }catch(err){console.error('[ffv14.3-ui]',err)}finally{busy=false}
}
try{if(window.FFv14){window.FFv14.version='14.3';window.FFv14.reconciliation=window.FFv143.reconciliation;window.FFv14._internals={...(window.FFv14._internals||{}),importCSV:window.FFv143.importCSV,reconcileStocksWindowed:window.FFv143._internals.reconcileStocksWindowed}}}catch(_){ }
const host=document.querySelector('#viewRoot');if(host)new MutationObserver(()=>setTimeout(patch,0)).observe(host,{childList:true,subtree:true});window.addEventListener('ff:v143-data',()=>setTimeout(patch,40));setTimeout(()=>{document.querySelector('.oi12-tabs [data-oi12-tab].active, .oi12-tabs [data-ffv14-tab].active')?.click();setTimeout(patch,80)},40);
})();
