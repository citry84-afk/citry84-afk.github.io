= capital ? (pnl / capital) * 100 : null;
      const rocAnn = rocPct === null ? null : rocPct * (365 / heldDays);
      const plannedRoc = (capital && dteAtOpen && netCredit) ? (netCredit / capital) * 100 * (365 / dteAtOpen) : null;
      cycles.push({
        id: segments.length === 1 ? key : `${key}#${index + 1}`,
        key, sequence: index + 1, sequenceCount: segments.length,
        underlying: first.underlying, expiry: first.expiry, strike: first.strike, right: first.right,
        currency: first.currency || 'USD', status, contracts, netCredit, realized, unrealized, pnl,
        capital, heldDays, dteAtOpen, rocPct, rocAnn, plannedRoc,
        start: first.date, end: last.date, isPut: first.right === 'P', isShortPut: shortPut,
        structure: position?.structure || '', position: position || null, trades
      });
    });
  });
  return cycles;
}

/* ROC cash-secured agregado, ponderado por capital y tiempo. Se calcula solo
   con ciclos de puts vendidas ya terminados. No representa el margen real de IBKR. */
function capitalWeightedRoc(cycles) {
  let pnl = 0, capitalYears = 0, credits = 0, capitalSum = 0, n = 0;
  cycles.filter(c => c.isShortPut && c.structure !== 'box' && c.capital > 0 && !['open','partial'].includes(c.status)).forEach(c => {
    pnl += c.pnl;
    capitalYears += c.capital * (c.heldDays / 365);
    credits += c.netCredit;
    capitalSum += c.capital;
    n++;
  });
  return { pnl, capitalYears, annualised: capitalYears ? (pnl / capitalYears) * 100 : null,
           credits, capitalSum, count: n,
           avgPremiumPct: capitalSum ? (credits / capitalSum) * 100 : null };
}


/* ================================================================
   3. EFICIENCIA, ASIGNACIONES Y AUDITORÍA
   ================================================================ */
const median = values => { const a = values.filter(Number.isFinite).sort((x,y)=>x-y); if (!a.length) return null; const m=Math.floor(a.length/2); return a.length%2?a[m]:(a[m-1]+a[m])/2; };
const codeHas = (row, token) => String(row?.code || '').split(';').includes(token);
const dayDiffSigned = (a,b) => { const x=parseDate(a), y=parseDate(b); return x&&y?Math.round((y-x)/86400000):null; };

function detectRollLinks(cycles) {
  const shorts = cycles.filter(c => c.isShortPut && c.structure !== 'box').sort((a,b)=>String(a.start).localeCompare(String(b.start)));
  const links = new Map();
  shorts.forEach((c,i)=>{
    if (!['closed','expired'].includes(c.status)) return;
    const next = shorts.slice(i+1).find(n => n.underlying===c.underlying && n.key!==c.key && (()=>{const d=dayDiffSigned(c.end,n.start);return d!==null&&d>=0&&d<=2})());
    if (next && c.status==='closed') links.set(c.id,next.id);
  });
  return links;
}

function buildAssignmentLedger(data, cycles) {
  const assignments = cycles.filter(c => c.isShortPut && c.status === 'assigned' && c.structure !== 'box');
  const assignmentByMatch = new Map();
  assignments.forEach(c => {
    const qty = Math.round(c.contracts * 100);
    assignmentByMatch.set([c.underlying,datePart(c.end),qty,Number(c.strike).toFixed(6)].join('|'), c);
  });
  const opening = data.stockOpening || {};
  const prices = new Map((data.stockOpen || []).map(p=>[p.symbol,{price:number(p.closePrice),currency:p.currency||'USD'}]));
  const lotsByTicker = {};
  const result = new Map(assignments.map(c=>[c.id,{cycle:c,matched:false,assignedQty:0,soldQty:0,remainingQty:0,stockRealized:0,stockUnrealized:0,stockCost:0,stockValue:0,closedAt:'',confidence:'pending',notes:[]} ]));
  Object.values(opening).forEach(p=>{
    const qty=Math.max(0,number(p.quantity)); if(!qty)return;
    (lotsByTicker[p.symbol]??=[]).push({remaining:qty,costPerShare:null,sourceCycleId:null,openedAt:'opening',unknown:true});
  });
  const trades=[...(data.stockTrades||[])].sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  trades.forEach(t=>{
    const qty=number(t.quantity), symbol=t.symbol; if(!qty||!symbol)return;
    const lots=(lotsByTicker[symbol]??=[]);
    if(qty>0){
      const key=[symbol,datePart(t.date),Math.round(qty),Number(t.price).toFixed(6)].join('|');
      const cycle=codeHas(t,'A')?assignmentByMatch.get(key):null;
      const cashCost=Math.max(0,-(number(t.proceeds)+number(t.commission)));
      const lot={remaining:qty,costPerShare:qty?cashCost/qty:number(t.price),sourceCycleId:cycle?.id||null,openedAt:t.date,unknown:false};
      lots.push(lot);
      if(cycle){const r=result.get(cycle.id);r.matched=true;r.assignedQty+=qty;r.stockCost+=cashCost;r.confidence='high';}
      return;
    }
    let toSell=Math.abs(qty); const totalSell=toSell; const netProceeds=number(t.proceeds)+number(t.commission);
    for(const lot of lots){
      if(toSell<=1e-9)break;
      const take=Math.min(lot.remaining,toSell); if(take<=0)continue;
      const allocated=netProceeds*(take/totalSell);
      if(lot.sourceCycleId){
        const r=result.get(lot.sourceCycleId); const cost=lot.costPerShare===null?0:lot.costPerShare*take;
        r.soldQty+=take; r.stockRealized+=allocated-cost;
        if(Math.abs(lot.remaining-take)<1e-9) r.closedAt=t.date;
      }
      lot.remaining-=take; toSell-=take;
    }
  });
  result.forEach(r=>{
    const lots=lotsByTicker[r.cycle.underlying]||[];
    const own=lots.filter(l=>l.sourceCycleId===r.cycle.id&&l.remaining>1e-9);
    r.remainingQty=own.reduce((s,l)=>s+l.remaining,0);
    const px=prices.get(r.cycle.underlying);
    r.stockValue=px?r.remainingQty*px.price:0;
    const remainingCost=own.reduce((s,l)=>s+(l.costPerShare||0)*l.remaining,0);
    r.stockUnrealized=px?r.stockValue-remainingCost:0;
    r.optionCredit=number(r.cycle.netCredit);
    r.adjustedPnl=r.optionCredit+r.stockRealized+r.stockUnrealized;
    const endDate=r.remainingQty>0?new Date():(parseDate(r.closedAt)||parseDate(r.cycle.end)||new Date());
    const start=parseDate(r.cycle.start); r.totalDays=start?Math.max(1,Math.round((endDate-start)/86400000)):r.cycle.heldDays;
    r.adjustedRocAnn=r.cycle.capital?(r.adjustedPnl/r.cycle.capital)*100*(365/r.totalDays):null;
    r.status=!r.matched?'pending':r.remainingQty>0?'shares-open':'complete';
    const hadOpening=number(opening[r.cycle.underlying]?.quantity)>0;
    if(r.matched&&hadOpening){r.confidence='medium';r.notes.push('Había acciones previas: las ventas se asignan por FIFO.');}
    if(r.matched&&!px&&r.remainingQty>0){r.confidence='medium';r.notes.push('Falta precio actual para valorar las acciones restantes.');}
  });
  return result;
}

function efficiencyRows(data, cycles) {
  const target=number(data.strategy?.targetProfit)||30;
  return cycles.filter(c=>c.status==='open'&&c.isShortPut&&c.structure!=='box'&&c.capital>0&&c.position).map(c=>{
    const captured=number(c.pnl), credit=Math.max(0,number(c.netCredit));
    const remaining=Math.max(0,credit-captured), elapsed=Math.max(1,c.heldDays);
    const exp=parseExpiry(c.expiry), dte=exp?Math.max(0,Math.ceil((exp-new Date())/86400000)):null;
    const capturedPct=credit?captured/credit*100:null;
    const rocCaptured=(captured/c.capital)*100*(365/elapsed);
    const rocRemaining=dte&&remaining?(remaining/c.capital)*100*(365/dte):0;
    const ratio=rocRemaining>0?rocCaptured/rocRemaining:rocCaptured>0?Infinity:null;
    let verdict='Equilibrada',tone='neutral';
    if(dte!==null&&dte<=7){verdict='Vence pronto';tone='risk';}
    else if((capturedPct!==null&&capturedPct>=target)||(ratio!==null&&ratio>=2)){verdict='Revisar eficiencia';tone='review';}
    else if(ratio!==null&&ratio<.75){verdict='Prima restante eficiente';tone='good';}
    return {...c,captured,remaining,elapsed,dte,capturedPct,rocCaptured,rocRemaining,ratio,verdict,tone,preliminary:elapsed<7};
  }).sort((a,b)=>({risk:3,review:2,neutral:1,good:0}[b.tone]-({risk:3,review:2,neutral:1,good:0}[a.tone])));
}

function groupStats(items, valueFn=c=>c.rocAnn) {
  const vals=items.map(valueFn).filter(Number.isFinite), wins=items.filter(c=>(valueFn(c)??0)>0).length;
  return {count:items.length,median:median(vals),mean:vals.length?vals.reduce((s,v)=>s+v,0)/vals.length:null,
          duration:items.length?items.reduce((s,c)=>s+number(c.heldDays||c.totalDays),0)/items.length:null,
          winRate:items.length?wins/items.length*100:null};
}

function auditData(cycles, assignments) {
  const rolls=detectRollLinks(cycles);
  const completed=cycles.filter(c=>c.isShortPut&&c.structure!=='box'&&!['open','partial'].includes(c.status));
  const exitGroups=[
    ['Recompra anticipada',completed.filter(c=>c.status==='closed'&&!rolls.has(c.id)),c=>c.rocAnn],
    ['Roll detectado',completed.filter(c=>rolls.has(c.id)),c=>c.rocAnn],
    ['Vencimiento',completed.filter(c=>c.status==='expired'),c=>c.rocAnn],
    ['Asignación ajustada',completed.filter(c=>c.status==='assigned'&&assignments.get(c.id)?.matched),c=>assignments.get(c.id)?.adjustedRocAnn]
  ].map(([label,items,fn])=>({label,items,...groupStats(items,fn)}));
  const dteBuckets=[['≤21 días',0,21],['22–35 días',22,35],['36–49 días',36,49],['≥50 días',50,9999]].map(([label,min,max])=>{
    const items=completed.filter(c=>c.dteAtOpen!==null&&c.dteAtOpen>=min&&c.dteAtOpen<=max&&c.status!=='assigned');
    return {label,items,...groupStats(items)};
  });
  const bands=[['<20%',-999,19.999],['20–30%',20,30],['30–50%',30.0001,50],['>50%',50.0001,9999]].map(([label,min,max])=>{
    const items=completed.filter(c=>c.status==='closed'&&c.netCredit>0&&((c.pnl/c.netCredit)*100)>=min&&((c.pnl/c.netCredit)*100)<=max);
    return {label,items,...groupStats(items)};
  });
  return {exitGroups,dteBuckets,bands,rolls,completed};
}

/* ================================================================
   3. CALENDARIO DE P&L
   ================================================================ */
function dailySeries(data) {
  const map = {};
  (data.trades || []).forEach(t => {
    const d = datePart(t.date);
    if (!d || d.length !== 10) return;
    (map[d] ??= { pnl: 0, trades: 0, tickers: {} });
    map[d].pnl += number(t.realized);
    map[d].trades += 1;
    map[d].tickers[t.underlying] = (map[d].tickers[t.underlying] || 0) + number(t.realized);
  });
  return map;
}

function monthTotals(daily, year) {
  const out = Array.from({ length: 12 }, () => ({ pnl: 0, trades: 0 }));
  Object.entries(daily).forEach(([d, v]) => {
    if (Number(d.slice(0, 4)) !== year) return;
    const m = Number(d.slice(5, 7)) - 1;
    out[m].pnl += v.pnl; out[m].trades += v.trades;
  });
  return out;
}

function heatClass(v, scale) {
  if (!v) return 'zero';
  const r = Math.min(1, Math.abs(v) / (scale || 1));
  const step = r > .66 ? 3 : r > .33 ? 2 : 1;
  return (v > 0 ? 'up' : 'down') + step;
}

function calendarMarkup(data) {
  const daily = dailySeries(data);
  const days = Object.keys(daily).sort();
  if (!days.length) {
    return `<div class="ffv13-empty"><b>Aún no hay operaciones cargadas</b>
      <small>Importa un CSV de Interactive Brokers y el calendario se construye solo.</small></div>`;
  }
  const current = /^\d{4}-\d{2}$/.test(prefs.calMonth || '') ? prefs.calMonth : days.at(-1).slice(0, 7);
  const [y, m] = current.split('-').map(Number);
  const year = y, monthIdx = m - 1;

  const totals = monthTotals(daily, year);
  const yearPnl = totals.reduce((s, t) => s + t.pnl, 0);
  const yearTrades = totals.reduce((s, t) => s + t.trades, 0);
  const maxMonth = Math.max(1, ...totals.map(t => Math.abs(t.pnl)));

  const monthCells = totals.map((t, i) => `
    <button type="button" class="ffv13-month ${heatClass(t.pnl, maxMonth)} ${i === monthIdx ? 'sel' : ''}" data-ffv13-month="${year}-${String(i + 1).padStart(2, '0')}">
      <span>${MONTH_ES[i]}</span><b>${t.trades ? money(t.pnl, true) : '—'}</b><small>${t.trades ? t.trades + 't' : ''}</small>
    </button>`).join('');

  // rejilla del mes seleccionado, semana empezando en lunes
  const firstDay = new Date(year, monthIdx, 1);
  const lead = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const monthDays = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    monthDays.push({ d, key, ...(daily[key] || { pnl: 0, trades: 0 }) });
  }
  const maxDay = Math.max(1, ...monthDays.map(x => Math.abs(x.pnl)));
  const cells = [
    ...Array.from({ length: lead }, () => '<i class="ffv13-day pad"></i>'),
    ...monthDays.map(x => `<i class="ffv13-day ${heatClass(x.pnl, maxDay)}" title="${x.key}: ${money(x.pnl)} · ${x.trades} operaciones">
        <b>${x.d}</b>${x.trades ? `<s>${money(x.pnl, true)}</s>` : ''}</i>`)
  ].join('');

  const monthPnl = monthDays.reduce((s, x) => s + x.pnl, 0);
  const monthTradeCount = monthDays.reduce((s, x) => s + x.trades, 0);
  const best = monthDays.filter(x => x.trades).sort((a, b) => b.pnl - a.pnl)[0];
  const worst = monthDays.filter(x => x.trades).sort((a, b) => a.pnl - b.pnl)[0];
  const greenDays = monthDays.filter(x => x.trades && x.pnl > 0).length;
  const activeDays = monthDays.filter(x => x.trades).length;

  const tickers = {};
  monthDays.forEach(x => Object.entries(daily[x.key]?.tickers || {}).forEach(([k, v]) => tickers[k] = (tickers[k] || 0) + v));
  const tickerRows = Object.entries(tickers).sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([k, v]) => `<div class="ffv13-ticker"><span>${esc(k)}</span><b class="${v >= 0 ? 'good' : 'bad'}">${money(v)}</b></div>`).join('')
    || '<div class="ffv13-ticker muted"><span>Sin movimientos este mes</span></div>';

  const years = [...new Set(days.map(d => d.slice(0, 4)))].sort();

  return `
  <div class="ffv13-calhead">
    <div>
      <h3>Calendario de resultados</h3>
      <p>P&amp;L realizado por día, tal y como lo informa el extracto.</p>
    </div>
    <div class="ffv13-years">
      ${years.map(yy => `<button type="button" class="ffv13-year ${Number(yy) === year ? 'sel' : ''}" data-ffv13-month="${yy}-${String(monthIdx + 1).padStart(2, '0')}">${yy}</button>`).join('')}
    </div>
  </div>

  <div class="ffv13-yearbar">
    <div class="ffv13-yeartotal">
      <span>Total ${year}</span>
      <b class="${yearPnl >= 0 ? 'good' : 'bad'}">${money(yearPnl)}</b>
      <small>${yearTrades} operaciones</small>
    </div>
    <div class="ffv13-months">${monthCells}</div>
  </div>

  <div class="ffv13-monthgrid">
    <div class="ffv13-card">
      <div class="ffv13-cardhead">
        <b>${MONTH_ES[monthIdx]} ${year}</b>
        <span class="${monthPnl >= 0 ? 'good' : 'bad'}">${money(monthPnl)}</span>
      </div>
      <div class="ffv13-dows">${['L','M','X','J','V','S','D'].map(d => `<span>${d}</span>`).join('')}</div>
      <div class="ffv13-days">${cells}</div>
      <div class="ffv13-legend">
        <span>Pérdida</span><i class="ffv13-day down3"></i><i class="ffv13-day down1"></i><i class="ffv13-day zero"></i><i class="ffv13-day up1"></i><i class="ffv13-day up3"></i><span>Ganancia</span>
      </div>
    </div>
    <div class="ffv13-card">
      <div class="ffv13-cardhead"><b>Resumen del mes</b></div>
      <div class="ffv13-stats">
        <div><span>Días con actividad</span><b>${activeDays}</b></div>
        <div><span>Días en verde</span><b>${activeDays ? `${greenDays} (${pct(greenDays / activeDays * 100, 0)})` : '—'}</b></div>
        <div><span>Mejor día</span><b class="good">${best ? money(best.pnl) : '—'}</b></div>
        <div><span>Peor día</span><b class="bad">${worst ? money(worst.pnl) : '—'}</b></div>
        <div><span>Operaciones</span><b>${monthTradeCount}</b></div>
      </div>
      <div class="ffv13-cardhead" style="margin-top:14px"><b>Por subyacente</b></div>
      <div class="ffv13-tickers">${tickerRows}</div>
    </div>
  </div>`;
}

/* ================================================================
   4. PANEL DE ROC (se inserta en la pestaña Resumen)
   ================================================================ */
function rocPanelMarkup(data, cycles) {
