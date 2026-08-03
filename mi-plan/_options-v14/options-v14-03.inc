
  const openPuts = cycles.filter(c => c.status === 'open' && c.isShortPut && c.structure !== 'box');
  const closed = cycles.filter(c => c.isShortPut && !['open', 'partial'].includes(c.status) && c.structure !== 'box' && c.capital > 0);
  const bestList = [...closed].sort((a, b) => (b.rocAnn ?? -1e9) - (a.rocAnn ?? -1e9)).slice(0, 4);

  const openRows = openPuts.length ? openPuts
    .sort((a, b) => (b.plannedRoc ?? 0) - (a.plannedRoc ?? 0))
    .map(c => {
      const exp = parseExpiry(c.expiry);
      const dte = exp ? Math.max(0, Math.ceil((exp - new Date()) / 86400000)) : null;
      return `<div class="ffv13-row">
        <span class="ffv13-tick">${esc(c.underlying.slice(0, 5))}</span>
        <div><b>${esc(c.expiry)} · ${esc(String(c.strike))}P</b>
          <small>${money(c.capital, true, c.currency)} comprometidos · ${dte === null ? '—' : dte + ' días'}</small></div>
        <div class="ffv13-rocval"><b class="${(c.plannedRoc ?? 0) >= 0 ? 'good' : 'bad'}">${c.plannedRoc === null ? '—' : pct(c.plannedRoc)}</b><small>ROC anual. previsto</small></div>
      </div>`;
    }).join('')
    : '<div class="ffv13-row muted"><div><b>No hay puts vendidas abiertas</b><small>Sin capital comprometido ahora mismo.</small></div></div>';

  const bestRows = bestList.length ? bestList.map(c => `<div class="ffv13-row">
      <span class="ffv13-tick">${esc(c.underlying.slice(0, 5))}</span>
      <div><b>${esc(c.expiry)} · ${esc(String(c.strike))}${esc(c.right)}</b>
        <small>${c.heldDays} días · ${money(c.pnl, false, c.currency)}</small></div>
      <div class="ffv13-rocval"><b class="${(c.rocAnn ?? 0) >= 0 ? 'good' : 'bad'}">${c.rocAnn === null ? '—' : pct(c.rocAnn)}</b><small>ROC anualizado</small></div>
    </div>`).join('')
    : '<div class="ffv13-row muted"><div><b>Todavía no hay ciclos cerrados</b><small>Aparecerán al cerrar o vencer la primera put.</small></div></div>';

  return `
  <div class="ffv13-cardhead ffv13-panelhead">
    <div><h3>ROC cash-secured sobre capital comprometido</h3>
      <p>Rentabilidad sobre strike × contratos × 100. Es una medida conservadora y no equivale al margen real de IBKR.</p></div>
  </div>
  <div class="ffv13-kpis">
    <div class="ffv13-kpi"><span>ROC cash-secured anualizado</span>
      <b class="${(agg.annualised ?? 0) >= 0 ? 'good' : 'bad'}">${agg.annualised === null ? '—' : pct(agg.annualised)}</b>
      <small>Solo puts vendidas completadas; ponderado por capital y días</small></div>
    <div class="ffv13-kpi"><span>Prima media por ciclo</span>
      <b>${agg.avgPremiumPct === null ? '—' : pct(agg.avgPremiumPct, 2)}</b>
      <small>Crédito neto sobre el strike comprometido</small></div>
    <div class="ffv13-kpi"><span>Capital·año empleado</span>
      <b>${money(agg.capitalYears, true)}</b>
      <small>Equivalente a un año con ese capital bloqueado</small></div>
    <div class="ffv13-kpi"><span>Ciclos medidos</span>
      <b>${agg.count}</b>
      <small>Con strike y capital identificables</small></div>
  </div>
  <div class="ffv13-two">
    <div><div class="ffv13-sub">Capital comprometido ahora</div>${openRows}</div>
    <div><div class="ffv13-sub">Mejores ciclos cerrados</div>${bestRows}</div>
  </div>`;
}


function efficiencyPanelMarkup(data, cycles) {
  const rows=efficiencyRows(data,cycles); const updated=data.openAsOf?new Date(data.openAsOf):null;
  const stale=updated&&((Date.now()-updated)/86400000)>2;
  const body=rows.length?rows.map(r=>`<div class="ffv14-eff-row ${r.tone}">
    <div class="ffv14-contract"><span>${esc(r.underlying)}</span><div><b>${esc(r.expiry)} · ${esc(String(r.strike))}P</b><small>${r.contracts} contrato${r.contracts===1?'':'s'} · ${money(r.capital,true,r.currency)} cash-secured</small></div></div>
    <div><small>Capturado</small><b>${r.capturedPct===null?'—':pct(r.capturedPct,0)}</b><em>${r.elapsed} días</em></div>
    <div><small>ROC conseguido</small><b>${pct(r.rocCaptured)}</b><em>${r.preliminary?'preliminar':'anualizado'}</em></div>
    <div><small>Máximo restante</small><b>${pct(r.rocRemaining)}</b><em>${r.dte===null?'DTE desconocido':r.dte+' días'}</em></div>
    <div class="ffv14-verdict"><span>${esc(r.verdict)}</span><small>${r.ratio===null?'sin ratio':Number.isFinite(r.ratio)?r.ratio.toFixed(1)+'× velocidad': 'prima agotada'}</small></div>
  </div>`).join(''):`<div class="ffv13-empty"><b>No hay puts vendidas independientes abiertas</b><small>Los box spreads quedan fuera. Cuando exista una put abierta, compararemos el rendimiento capturado con el máximo que queda.</small></div>`;
  return `<div class="ffv13-cardhead ffv13-panelhead"><div><h3>Asistente de eficiencia del capital</h3><p>Compara la velocidad ya conseguida con el rendimiento máximo restante hasta vencimiento.</p></div><span class="ffv14-fresh ${stale?'warn':'good'}">${updated?(stale?'Datos antiguos':'Foto actualizada'):'Sin fecha de foto'}</span></div>
    ${body}<div class="ffv14-disclaimer"><b>No es una orden de cierre.</b> El máximo restante supone que la opción acaba sin valor y no incorpora probabilidad de asignación, volatilidad, spread ni una alternativa concreta para redesplegar el capital.</div>`;
}

function statTable(rows, valueLabel='ROC anual. mediano') {
  return `<div class="ffv14-stat-table"><div class="ffv14-stat-head"><span>Grupo</span><span>Ciclos</span><span>${valueLabel}</span><span>Duración</span><span>Positivos</span></div>${rows.map(r=>`<div class="ffv14-stat-row"><b>${esc(r.label)}</b><span>${r.count}</span><span class="${(r.median??0)>=0?'good':'bad'}">${r.median===null?'—':pct(r.median)}</span><span>${r.duration===null?'—':r.duration.toFixed(0)+' d'}</span><span>${r.winRate===null?'—':pct(r.winRate,0)}</span></div>`).join('')}</div>`;
}

function assignmentMarkup(assignments) {
  const rows=[...assignments.values()];
  if(!rows.length)return`<div class="ffv13-empty"><b>No hay puts asignadas</b><small>Cuando exista una asignación, enlazaremos la prima con las acciones recibidas y sus ventas FIFO.</small></div>`;
  return `<div class="ffv14-assign-list">${rows.map(r=>`<article class="ffv14-assign ${r.status}"><div><span>${esc(r.cycle.underlying)}</span><b>${esc(String(r.cycle.strike))}P · ${r.assignedQty||r.cycle.contracts*100} acciones</b><small>${r.status==='pending'?'Falta reimportar un CSV que incluya operaciones de acciones':r.remainingQty?`${r.remainingQty} acciones siguen abiertas`:'Ciclo de acciones cerrado'} · confianza ${r.confidence}</small></div><div><small>Prima neta</small><b>${money(r.optionCredit,false,r.cycle.currency)}</b></div><div><small>P&amp;L acciones</small><b class="${(r.stockRealized+r.stockUnrealized)>=0?'good':'bad'}">${money(r.stockRealized+r.stockUnrealized,false,r.cycle.currency)}</b></div><div><small>Resultado ajustado</small><b class="${r.adjustedPnl>=0?'good':'bad'}">${r.matched?money(r.adjustedPnl,false,r.cycle.currency):'Pendiente'}</b></div><div><small>ROC ajustado</small><b>${r.matched&&r.adjustedRocAnn!==null?pct(r.adjustedRocAnn):'—'}</b></div></article>`).join('')}</div><div class="ffv14-disclaimer">Las ventas de acciones se asignan por FIFO. Las covered calls todavía se muestran aparte y no se atribuyen automáticamente al lote asignado.</div>`;
}

function analysisMarkup(data, cycles, assignments) {
  const audit=auditData(cycles,assignments);
  const base=data.accountSnapshot?.baseCurrency||'EUR';
  return `<section class="ffv13-section"><div class="ffv13-calhead"><div><h3>Auditoría de tu sistema</h3><p>Qué ocurrió en tu histórico observado. Es descriptivo: no demuestra qué habría pasado con una regla diferente.</p></div></div>
    <div class="ffv14-analysis-grid"><div class="ffv13-card"><div class="ffv13-cardhead"><b>Por forma de salida</b></div>${statTable(audit.exitGroups)}</div><div class="ffv13-card"><div class="ffv13-cardhead"><b>Por DTE de apertura</b></div>${statTable(audit.dteBuckets)}</div></div>
    <div class="ffv14-analysis-grid"><div class="ffv13-card"><div class="ffv13-cardhead"><b>Captura al cerrar anticipadamente</b></div>${statTable(audit.bands)}</div><div class="ffv13-card"><div class="ffv13-cardhead"><b>Asignaciones: ciclo económico completo</b></div>${assignmentMarkup(assignments)}</div></div>
    <div class="ffv14-disclaimer"><b>Sesgo de selección:</b> normalmente cierras antes las operaciones que evolucionan bien. Para saber qué habría ocurrido aguantando cada una necesitamos precios históricos de la opción y del subyacente.</div>
  </section><section class="ffv13-section"><div class="ffv13-cardhead ffv13-panelhead"><div><h3>Automatización y fiscalidad</h3><p>Infraestructura preparada, pero sin presentar como definitivos datos que todavía no existen.</p></div></div><div class="ffv14-roadmap"><article><span>Flex</span><b>Backend seguro preparado</b><p>El token y Query ID deben vivir en variables de entorno de Netlify. La web pública no recibe la credencial.</p><button type="button" data-ffv14-flex>Ver requisitos</button></article><article><span>Riesgo real</span><b>Pendiente de Flex</b><p>NLV disponible en el extracto; excess liquidity, cushion y buying power necesitan una consulta Flex configurada.</p></article><article><span>Fiscalidad</span><b>Borrador exportable</b><p>Exporta ciclos y asignaciones en ${esc(base)} / USD. Faltan cambio oficial por fecha, validación FIFO y criterio fiscal antes de usarlo en una declaración.</p><button type="button" data-ffv14-export-fiscal>Exportar borrador</button></article></div></section>`;
}

function fiscalRows(data,cycles,assignments){
  return cycles.filter(c=>c.isShortPut&&c.structure!=='box'&&!['open','partial'].includes(c.status)).map(c=>{const a=assignments.get(c.id);return{fechaApertura:datePart(c.start),fechaCierre:datePart(c.end),ticker:c.underlying,contrato:`${c.expiry} ${c.strike}P`,estado:c.status,divisa:c.currency,primaNeta:c.netCredit,resultadoOpcion:c.pnl,resultadoAcciones:a?.matched?(a.stockRealized+a.stockUnrealized):'',resultadoAjustado:a?.matched?a.adjustedPnl:c.pnl,fxEUR:'',resultadoEUR:'',nota:a?.matched?(a.remainingQty?'acciones abiertas valoradas a mercado':'asignación enlazada por FIFO'):(c.status==='assigned'?'asignación pendiente de enlazar':'')};});
}
function exportFiscal(data,cycles,assignments){const rows=fiscalRows(data,cycles,assignments),headers=Object.keys(rows[0]||{fechaApertura:'',fechaCierre:'',ticker:'',contrato:'',estado:'',divisa:'',primaNeta:'',resultadoOpcion:'',resultadoAcciones:'',resultadoAjustado:'',fxEUR:'',resultadoEUR:'',nota:''});const q=v=>`"${String(v??'').replace(/"/g,'""')}"`;const csv=[headers.map(q).join(','),...rows.map(r=>headers.map(h=>q(r[h])).join(','))].join('\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`borrador-fiscal-opciones-${new Date().toISOString().slice(0,10)}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}

/* ================================================================
   5. ESTILOS
   ================================================================ */
function injectStyles() {
  if (document.querySelector('style[data-ffv13]')) return;
  const s = document.createElement('style');
  s.dataset.ffv13 = '1';
  s.textContent = `
.ffv13{--line:#203651;--muted:#91a5bf;--good:#35d0a1;--bad:#ff6574}
.ffv13 .good{color:var(--good)}.ffv13 .bad{color:var(--bad)}
.ffv13-panel{display:none;gap:14px}
.ffv13-panel.active{display:grid}
.ffv13-section{padding:18px;border:1px solid var(--line);border-radius:20px;background:linear-gradient(145deg,rgba(15,32,55,.98),rgba(8,21,37,.98));color:#f6f9ff}
.ffv13-section *{box-sizing:border-box}
.ffv13-cardhead{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:12px}
.ffv13-cardhead b{font-size:14px}
.ffv13-panelhead h3{margin:0 0 4px;font-size:17px;letter-spacing:-.02em}
.ffv13-panelhead p{margin:0;color:var(--muted);font-size:12px;line-height:1.45}
.ffv13-calhead{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:14px}
.ffv13-calhead h3{margin:0 0 4px;font-size:17px;letter-spacing:-.02em}
.ffv13-calhead p{margin:0;color:var(--muted);font-size:12px}
.ffv13-years{display:flex;gap:5px}
.ffv13-year{border:1px solid var(--line);border-radius:11px;padding:7px 11px;background:#0d1d31;color:var(--muted);font:900 11px system-ui;cursor:pointer}
.ffv13-year.sel{background:#17365f;color:#fff;border-color:#32609a}
.ffv13-yearbar{display:grid;grid-template-columns:150px 1fr;gap:12px;align-items:center;margin-bottom:14px}
.ffv13-yeartotal{padding:12px;border:1px solid var(--line);border-radius:16px;background:#0b1728}
.ffv13-yeartotal span{display:block;color:var(--muted);font-size:10px;font-weight:900;letter-spacing:.1em;text-transform:uppercase}
.ffv13-yeartotal b{display:block;margin:4px 0 2px;font-size:22px;letter-spacing:-.03em}
.ffv13-yeartotal small{color:var(--muted);font-size:11px}
.ffv13-months{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:4px}
.ffv13-month{display:grid;gap:1px;padding:8px 4px;border:1px solid var(--line);border-radius:11px;background:#0b1728;color:#f6f9ff;cursor:pointer;text-align:center}
.ffv13-month span{color:var(--muted);font-size:9px;font-weight:900;letter-spacing:.06em}
.ffv13-month b{font-size:11px;letter-spacing:-.02em}
.ffv13-month small{color:var(--muted);font-size:9px}
.ffv13-month.sel{outline:2px solid #3d87ff;outline-offset:1px}
.ffv13-monthgrid{display:grid;grid-template-columns:1.25fr .75fr;gap:12px}
.ffv13-card{padding:14px;border:1px solid var(--line);border-radius:18px;background:#0b1728}
.ffv13-dows{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;margin-bottom:5px}
.ffv13-dows span{color:var(--muted);font-size:10px;font-weight:900;text-align:center}
.ffv13-days{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}
.ffv13-day{display:grid;align-content:center;justify-items:center;gap:1px;min-height:44px;border:1px solid var(--line);border-radius:10px;background:#0f2037;font-style:normal}
.ffv13-day b{font-size:10px;font-weight:800;color:#c3d3e8}
.ffv13-day s{font-size:9px;font-weight:900;text-decoration:none;color:#fff}
.ffv13-day.pad{border-color:transparent;background:transparent}
.ffv13-day.zero{background:#0f2037}
.ffv13-day.up1{background:rgba(53,208,161,.18);border-color:rgba(53,208,161,.3)}
.ffv13-day.up2{background:rgba(53,208,161,.36);border-color:rgba(53,208,161,.45)}
.ffv13-day.up3{background:rgba(53,208,161,.62);border-color:rgba(53,208,161,.7)}
.ffv13-day.down1{background:rgba(255,101,116,.18);border-color:rgba(255,101,116,.3)}
.ffv13-day.down2{background:rgba(255,101,116,.36);border-color:rgba(255,101,116,.45)}
.ffv13-day.down3{background:rgba(255,101,116,.62);border-color:rgba(255,101,116,.7)}
.ffv13-month.up1{background:rgba(53,208,161,.16)}.ffv13-month.up2{background:rgba(53,208,161,.3)}.ffv13-month.up3{background:rgba(53,208,161,.5)}
.ffv13-month.down1{background:rgba(255,101,116,.16)}.ffv13-month.down2{background:rgba(255,101,116,.3)}.ffv13-month.down3{background:rgba(255,101,116,.5)}
.ffv13-legend{display:flex;align-items:center;gap:5px;margin-top:10px;color:var(--muted);font-size:10px}
.ffv13-legend .ffv13-day{min-height:14px;width:14px}
.ffv13-stats div{display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px dashed rgba(32,54,81,.8);font-size:12px}
.ffv13-stats div:last-child{border-bottom:0}
.ffv13-stats span{color:var(--muted)}
.ffv13-tickers{display:grid;gap:4px}
.ffv13-ticker{display:flex;justify-content:space-between;gap:10px;padding:7px 9px;border-radius:10px;background:#0f2037;font-size:12px;font-weight:800}
.ffv13-ticker.muted{color:var(--muted);font-weight:600}
.ffv13-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:14px}
.ffv13-kpi{padding:13px;border:1px solid var(--line);border-radius:16px;background:#0b1728}
.ffv13-kpi span{display:block;color:var(--muted);font-size: