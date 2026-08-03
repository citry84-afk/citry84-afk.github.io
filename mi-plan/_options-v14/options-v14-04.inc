10px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
.ffv13-kpi b{display:block;margin:6px 0 3px;font-size:23px;letter-spacing:-.04em}
.ffv13-kpi small{color:var(--muted);font-size:11px;line-height:1.35;display:block}
.ffv13-two{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.ffv13-sub{margin-bottom:8px;color:#7caeff;font-size:10px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}
.ffv13-row{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:10px;margin-bottom:6px;border:1px solid var(--line);border-radius:14px;background:#0b1728}
.ffv13-row.muted{grid-template-columns:1fr;color:var(--muted)}
.ffv13-row b{display:block;font-size:12px}
.ffv13-row small{display:block;color:var(--muted);font-size:11px}
.ffv13-tick{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:#17365f;font:900 11px system-ui}
.ffv13-rocval{text-align:right}.ffv13-rocval b{font-size:15px;letter-spacing:-.02em}
.ffv13-roc{display:inline-block;margin-top:3px;padding:2px 7px;border-radius:999px;background:rgba(61,135,255,.16);color:#8dbaff;font-size:10px;font-weight:900}
.ffv13-empty{padding:34px 18px;border:1px dashed var(--line);border-radius:18px;text-align:center;color:var(--muted)}
.ffv13-empty b{display:block;margin-bottom:5px;color:#f6f9ff;font-size:14px}
.ffv13-toast{position:fixed;left:50%;bottom:96px;z-index:10000;transform:translateX(-50%);max-width:88vw;padding:13px 17px;border-radius:15px;background:#0f2037;border:1px solid #32609a;color:#f6f9ff;font:800 13px system-ui;box-shadow:0 18px 50px rgba(4,16,34,.5)}
.oi12-tabs button[data-ffv13-tab].active{background:#17365f;color:#fff;box-shadow:inset 0 0 0 1px #32609a}
.oi12.ffv13-hide-v12 .oi12-view{display:none!important}
@media(max-width:840px){
  .ffv13-yearbar{grid-template-columns:1fr}
  .ffv13-months{grid-template-columns:repeat(6,minmax(0,1fr))}
  .ffv13-monthgrid,.ffv13-two{grid-template-columns:1fr}
  .ffv13-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media(max-width:560px){
  .ffv13-section{padding:13px;border-radius:17px}
  .ffv13-day{min-height:38px}
  .ffv13-day s{font-size:8px}
  .ffv13-kpi b{font-size:19px}
}

.ffv14-fresh{align-self:flex-start;padding:6px 9px;border-radius:999px;background:#10243d;color:#8dbaff;font-size:9px;font-weight:900}.ffv14-fresh.warn{background:#422c16;color:#ffc56e}.ffv14-fresh.good{background:#12372f;color:#6ee1bd}
.ffv14-eff-row{display:grid;grid-template-columns:minmax(190px,1.25fr) repeat(3,minmax(90px,.65fr)) minmax(120px,.75fr);gap:10px;align-items:center;padding:12px;margin-bottom:7px;border:1px solid var(--line);border-radius:15px;background:#0b1728}.ffv14-eff-row.review{border-color:#6a4c1f}.ffv14-eff-row.risk{border-color:#663040}.ffv14-eff-row.good{border-color:#1d5748}.ffv14-contract{display:flex;gap:10px;align-items:center}.ffv14-contract>span{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:#17365f;font-size:11px;font-weight:950}.ffv14-contract b,.ffv14-eff-row>div>b{display:block;font-size:12px}.ffv14-contract small,.ffv14-eff-row small,.ffv14-eff-row em{display:block;color:var(--muted);font-size:9px;font-style:normal;margin-top:2px}.ffv14-verdict span{display:inline-block;padding:6px 8px;border-radius:10px;background:#17365f;color:#fff;font-size:10px;font-weight:900}.ffv14-eff-row.review .ffv14-verdict span{background:#4a3519;color:#ffc76f}.ffv14-eff-row.risk .ffv14-verdict span{background:#4b202d;color:#ff939d}.ffv14-eff-row.good .ffv14-verdict span{background:#153d33;color:#6ee1bd}.ffv14-disclaimer{margin-top:11px;padding:11px 12px;border:1px solid #1c3554;border-radius:14px;background:#09182a;color:#8fa4bf;font-size:10px;line-height:1.5}.ffv14-disclaimer b{color:#dce9fa}
.ffv14-analysis-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}.ffv14-stat-table{display:grid;gap:4px}.ffv14-stat-head,.ffv14-stat-row{display:grid;grid-template-columns:1.35fr .45fr .75fr .55fr .55fr;gap:7px;align-items:center;padding:7px 8px;border-radius:10px}.ffv14-stat-head{color:var(--muted);font-size:8px;font-weight:900;text-transform:uppercase}.ffv14-stat-row{background:#0f2037;font-size:10px}.ffv14-stat-row b{font-size:10px}.ffv14-stat-row span{text-align:right}.ffv14-assign-list{display:grid;gap:6px}.ffv14-assign{display:grid;grid-template-columns:1.25fr repeat(4,.65fr);gap:8px;align-items:center;padding:10px;border:1px solid var(--line);border-radius:13px;background:#0f2037}.ffv14-assign>div:first-child span{display:block;color:#7caeff;font-size:9px;font-weight:900}.ffv14-assign b{display:block;font-size:10px}.ffv14-assign small{display:block;color:var(--muted);font-size:8px;margin-top:2px}.ffv14-assign.pending{opacity:.75}.ffv14-roadmap{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.ffv14-roadmap article{padding:14px;border:1px solid var(--line);border-radius:16px;background:#0b1728}.ffv14-roadmap span{color:#7caeff;font-size:9px;font-weight:900;text-transform:uppercase}.ffv14-roadmap b{display:block;margin-top:5px;font-size:13px}.ffv14-roadmap p{color:var(--muted);font-size:10px;line-height:1.45}.ffv14-roadmap button{border:1px solid #315b91;border-radius:10px;padding:8px 10px;background:#17365f;color:#fff;font-size:9px;font-weight:900}
@media(max-width:840px){.ffv14-eff-row{grid-template-columns:1fr 1fr}.ffv14-contract{grid-column:1/-1}.ffv14-analysis-grid,.ffv14-roadmap{grid-template-columns:1fr}.ffv14-assign{grid-template-columns:1fr 1fr}.ffv14-assign>div:first-child{grid-column:1/-1}}

@media(prefers-reduced-motion:reduce){.ffv13 *{animation:none!important;transition:none!important}}`;
  document.head.appendChild(s);
}

function toast(msg) {
  document.querySelector('.ffv13-toast')?.remove();
  const el = document.createElement('div');
  el.className = 'ffv13-toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4200);
}

/* ================================================================
   6. INYECCIÓN EN LA INTERFAZ DE v12
   ================================================================ */
let injecting = false;
function currentData() { return readJSON(STORE) || {}; }

function patchV12Copy(root,data,cycles,assignments){
  const box=(data.open||[]).find(p=>p.structure==='box');
  root.querySelectorAll('.oi12-alert').forEach(alert=>{
    const text=alert.textContent||'';
    if(text.includes('Sincronización automática pendiente')){alert.remove();return;}
    if(text.includes('Las cuatro patas de GOOG')&&box){const p=alert.querySelector('p');if(p)p.textContent=`Las cuatro patas de ${box.underlying} se agrupan y quedan fuera del riesgo de puts desnudas.`;}
    if(text.includes('Asignación detectada en')){
      const title=alert.querySelector('b')?.textContent||'';const ticker=title.split(' ').at(-1);const linked=[...assignments.values()].find(a=>a.cycle.underlying===ticker&&a.matched);
      if(linked){const p=alert.querySelector('p');const s=alert.querySelector('small');if(p)p.textContent=linked.remainingQty?`La asignación está enlazada. Quedan ${linked.remainingQty} acciones abiertas.`:`La asignación y la venta posterior están enlazadas por FIFO.`;if(s)s.textContent=`Resultado ajustado estimado: ${money(linked.adjustedPnl,false,linked.cycle.currency)}.`;}
    }
  });
  const callout=root.querySelector('[data-oi12-view="summary"] .oi12-callout');
  if(callout&&[...assignments.values()].some(a=>a.matched))callout.innerHTML='<span>i</span><div><b>Las asignaciones detectadas ya se enlazan con las acciones.</b> El resultado ajustado usa FIFO y valora a mercado las acciones que siguen abiertas.</div>';
}

function inject() {
  const root = document.querySelector('#viewRoot .oi12');
  if (!root || injecting) return;
  injecting = true;
  try {
    injectStyles(); root.classList.add('ffv13');
    const data=currentData(), cycles=buildCycles(data), assignments=buildAssignmentLedger(data,cycles);
    const tabs=root.querySelector('.oi12-tabs');
    if(tabs&&!tabs.querySelector('[data-ffv14-tab="calendar"]')){const b=document.createElement('button');b.type='button';b.dataset.ffv14Tab='calendar';b.textContent='Calendario';tabs.appendChild(b);}
    if(tabs&&!tabs.querySelector('[data-ffv14-tab="analysis"]')){const b=document.createElement('button');b.type='button';b.dataset.ffv14Tab='analysis';b.textContent='Análisis';tabs.appendChild(b);}
    root.querySelectorAll('[data-ffv14-tab]').forEach(b=>b.classList.toggle('active',prefs.tab===b.dataset.ffv14Tab));
    const customActive=['calendar','analysis'].includes(prefs.tab); root.classList.toggle('ffv13-hide-v12',customActive);
    let panel=root.querySelector('[data-ffv14-panel]');
    if(!panel){panel=document.createElement('div');panel.dataset.ffv14Panel='1';panel.className='ffv13-panel';root.appendChild(panel);}
    panel.classList.toggle('active',customActive);
    if(prefs.tab==='calendar')panel.innerHTML=`<section class="ffv13-section" data-ffv13-cal>${calendarMarkup(data)}</section>`;
    else if(prefs.tab==='analysis')panel.innerHTML=analysisMarkup(data,cycles,assignments);

    const summary=root.querySelector('[data-oi12-view="summary"]');
    if(summary&&!summary.querySelector('[data-ffv14-eff]')){const sec=document.createElement('section');sec.dataset.ffv14Eff='1';sec.className='ffv13-section';sec.innerHTML=efficiencyPanelMarkup(data,cycles);const anchor=summary.querySelector('.oi12-summary');summary.insertBefore(sec,anchor||summary.firstChild);}
    if(summary&&!summary.querySelector('[data-ffv13-roc]')){const sec=document.createElement('section');sec.dataset.ffv13Roc='1';sec.className='ffv13-section';sec.innerHTML=rocPanelMarkup(data,cycles);const eff=summary.querySelector('[data-ffv14-eff]');eff?.insertAdjacentElement('afterend',sec);}

    const byKey=groupBy(cycles,c=>c.key);
    root.querySelectorAll('.oi12-cycle[data-cycle-id]').forEach(card=>{
      const list=byKey[card.dataset.cycleId]||[],holder=card.querySelector('.oi12-cycle-name > div');if(!holder)return;
      if(!card.querySelector('.ffv13-roc')){const measurable=list.filter(c=>c.isShortPut&&c.capital>0&&c.rocAnn!==null);if(measurable.length){const tag=document.createElement('small');tag.className='ffv13-roc';if(measurable.length===1){const c=measurable[0];tag.textContent=`ROC cash-secured anual. ${pct(c.rocAnn)} · ${money(c.capital,true,c.currency)}`;}else{const agg=capitalWeightedRoc(measurable);tag.textContent=`${measurable.length} ciclos · ROC ponderado ${agg.annualised===null?'—':pct(agg.annualised)}`;}holder.appendChild(tag);}}
      const assigned=list.find(c=>c.status==='assigned'),a=assigned?assignments.get(assigned.id):null;
      if(a?.matched&&!card.querySelector('.ffv14-adjusted')){const tag=document.createElement('small');tag.className='ffv13-roc ffv14-adjusted';tag.textContent=`Ciclo ajustado ${money(a.adjustedPnl,false,a.cycle.currency)} · ${a.remainingQty?'acciones abiertas':'cerrado FIFO'}`;holder.appendChild(tag);}
    });
    patchV12Copy(root,data,cycles,assignments);
  } catch(err){console.error('[ffv14] fallo al inyectar; v12 sigue operativo:',err);} finally{injecting=false;}
}
function watch(){const host=document.querySelector('#viewRoot');if(!host){setTimeout(watch,400);return;}new MutationObserver(()=>{if(!injecting&&document.querySelector('#viewRoot .oi12'))inject();}).observe(host,{childList:true,subtree:true});if(document.querySelector('#viewRoot .oi12'))inject();}
function rerenderV12(){const btn=document.querySelector('.oi12-tabs [data-oi12-tab].active')||document.querySelector('.oi12-tabs [data-oi12-tab]');btn?.click();}

/* ================================================================
   7. EVENTOS
   ================================================================ */
document.addEventListener('change',async e=>{
  const input=e.target;if(!input||!input.matches?.('[data-oi12-file]'))return;e.stopImmediatePropagation();e.stopPropagation();const file=input.files?.[0];if(!file)return;
  toast('Fusionando opciones, acciones y posiciones…');
  try{const res=importCSV(await file.text(),file.name);input.value='';prefs.calMonth='';savePrefs();rerenderV12();setTimeout(inject,80);const positionsText=res.replacedOpenSnapshot?`${res.openCount} opciones y ${res.stockOpenCount} posiciones de acciones actualizadas`:'foto de posiciones conservada';toast((res.added||res.stockAdded)?`${res.added} opciones y ${res.stockAdded} movimientos de acciones nuevos · ${positionsText}`:`Sin novedades · ${positionsText}`);}catch(err){console.error(err);input.value='';toast('No se pudo leer el CSV de actividad de IBKR.');}
},true);

document.addEventListener('click',e=>{
  const custom=e.target.closest?.('[data-ffv14-tab]');if(custom){prefs.tab=custom.dataset.ffv14Tab;savePrefs();document.querySelectorAll('.oi12-tabs [data-oi12-tab]').forEach(b=>b.classList.remove('active'));inject();return;}
  if(e.target.closest?.('[data-oi12-tab]')){if(prefs.tab!=='none'){prefs.tab='none';savePrefs();}setTimeout(inject,0);return;}
  const month=e.target.closest?.('[data-ffv13-month]');if(month){prefs.calMonth=month.dataset.ffv13Month;savePrefs();inject();return;}
  if(e.target.closest?.('[data-ffv14-export-fiscal]')){const data=currentData(),cycles=buildCycles(data),a=buildAssignmentLedger(data,cycles);exportFiscal(data,cycles,a);toast('Borrador fiscal descargado. No está listo para presentar.');return;}
  if(e.target.closest?.('[data-ffv14-flex]')){alert('Backend Flex preparado para Netlify. Falta desplegar allí, configurar IBKR_FLEX_TOKEN, IBKR_FLEX_QUERY_ID y FF_SYNC_SECRET, y añadir autenticación de usuario antes de activarlo para terceros.');return;}
});

/* ================================================================
   8. CONSOLA Y EXPORTACIÓN
   ================================================================ */
window.FFv14={version:14,data:()=>currentData(),cycles:()=>buildCycles(currentData()),roc:()=>capitalWeightedRoc(buildCycles(currentData())),daily:()=>dailySeries(currentData()),efficiency:()=>efficiencyRows(currentData(),buildCycles(currentData())),assignments:()=>buildAssignmentLedger(currentData(),buildCycles(currentData())),audit:()=>{const d=currentData(),c=buildCycles(d),a=buildAssignmentLedger(d,c);return auditData(c,a)},backup:()=>readJSON(BACKUP),restore(){const b=readJSON(BACKUP);if(!b)return'No hay copia de seguridad.';saveJSON(STORE,b);rerenderV12();return'Restaurado el estado previo a v14.';},export(){const blob=new Blob([JSON.stringify(currentData(),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`opciones-historico-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);return'Descargando histórico.';},exportFiscal(){const d=currentData(),c=buildCycles(d),a=buildAssignmentLedger(d,c);exportFiscal(d,c,a);return'Descargando borrador fiscal.';},_internals:{parseCSV,readReport,mergeTrades,mergeStockTrades,splitContractCycles,buildCycles,capitalWeightedRoc,dailySeries,buildAssignmentLedger,efficiencyRows,auditData,importCSV}};
watch();
})();
