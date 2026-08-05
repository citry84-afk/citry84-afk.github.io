(()=>{
  'use strict';
  const A=window.FFLab;
  if(!A||A.__REALIZED_1521__)return;
  A.__REALIZED_1521__=true;
  A.VERSION='15.21-lab';

  const originalAnalysis=A.adjustedOptionsAnalysis;
  const previousView=A.views.options;
  const n=v=>A.n(v);
  const datePart=v=>String(v||'').slice(0,10);
  const yearOf=v=>{const y=Number(datePart(v).slice(0,4));return y>=2000&&y<=2100?y:0};
  const codeHas=(row,token)=>String(row?.code||'').split(';').includes(token);
  const signedMoney=v=>`${n(v)>0?'+ ':n(v)<0?'− ':''}${A.display(A.euro(Math.abs(n(v)),2))}`;

  function realizedAssignmentLedger(store={}){
    const opening=store.stockOpening||{};
    const prices=new Map((store.stockOpen||[]).map(row=>[
      row.symbol,
      n(row.closePrice)||(n(row.value)&&n(row.quantity)?n(row.value)/n(row.quantity):0)
    ]));
    const lotsByTicker={};
    const assignedLots=[];
    const bySaleYear={};

    Object.values(opening).forEach(row=>{
      const qty=Math.max(0,n(row.quantity));
      if(!qty||!row.symbol)return;
      (lotsByTicker[row.symbol]??=[]).push({symbol:row.symbol,remaining:qty,costPerShare:null,assigned:false,unknown:true});
    });

    [...(store.stockTrades||[])].sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))).forEach(trade=>{
      const qty=n(trade.quantity),symbol=String(trade.symbol||'');
      if(!qty||!symbol)return;
      const lots=(lotsByTicker[symbol]??=[]);

      if(qty>0){
        const assigned=codeHas(trade,'A');
        const cashCost=Math.max(0,-(n(trade.proceeds)+n(trade.commission)));
        const lot={
          id:`${symbol}|${trade.date}|${qty}|${trade.price}`,
          symbol,
          remaining:qty,
          initialQty:qty,
          costPerShare:qty?cashCost/qty:n(trade.price),
          assigned,
          assignmentYear:assigned?yearOf(trade.date):0,
          openedAt:trade.date||''
        };
        lots.push(lot);
        if(assigned)assignedLots.push(lot);
        return;
      }

      let sharesToSell=Math.abs(qty);
      const totalSold=sharesToSell;
      const netProceeds=n(trade.proceeds)+n(trade.commission);
      const saleYear=yearOf(trade.date);

      for(const lot of lots){
        if(sharesToSell<=1e-9)break;
        const take=Math.min(lot.remaining,sharesToSell);
        if(take<=0)continue;
        const allocatedProceeds=netProceeds*(take/totalSold);
        if(lot.assigned&&saleYear){
          const cost=(lot.costPerShare||0)*take;
          const row=bySaleYear[saleYear]??={year:saleYear,realized:0,soldShares:0,sales:0};
          row.realized+=allocatedProceeds-cost;
          row.soldShares+=take;
          row.sales+=1;
        }
        lot.remaining-=take;
        sharesToSell-=take;
      }
    });

    const openByAssignmentYear={};
    assignedLots.forEach(lot=>{
      if(lot.remaining<=1e-9||!lot.assignmentYear)return;
      const price=prices.get(lot.symbol)||0;
      const row=openByAssignmentYear[lot.assignmentYear]??={year:lot.assignmentYear,openShares:0,unrealized:0,lots:0,missingPrices:0};
      row.openShares+=lot.remaining;
      row.lots+=1;
      if(price)row.unrealized+=lot.remaining*price-lot.remaining*(lot.costPerShare||0);
      else row.missingPrices+=1;
    });

    return{bySaleYear,openByAssignmentYear,assignedLots};
  }

  function correctedAnalysis(){
    const base=originalAnalysis?originalAnalysis():{store:{},years:[],selected:null};
    const ledger=realizedAssignmentLedger(base.store||{});
    const rows=new Map((base.years||[]).map(row=>[Number(row.year),{...row}]));

    Object.keys(ledger.bySaleYear).forEach(year=>{
      const y=Number(year);
      if(!rows.has(y))rows.set(y,{year:y,realized:0,trades:0,nav:0,navDate:'',periodStart:'',periodEnd:'',files:[]});
    });
    Object.keys(ledger.openByAssignmentYear).forEach(year=>{
      const y=Number(year);
      if(!rows.has(y))rows.set(y,{year:y,realized:0,trades:0,nav:0,navDate:'',periodStart:'',periodEnd:'',files:[]});
    });

    (base.store?.navSnapshots||[]).forEach(snapshot=>{
      const y=yearOf(snapshot.end);
      if(!y)return;
      const row=rows.get(y)||{year:y,realized:0,trades:0,nav:0,navDate:'',periodStart:'',periodEnd:'',files:[]};
      if(!row.navDate||String(snapshot.end)>=String(row.navDate)){
        row.nav=n(snapshot.nav);
        row.navDate=snapshot.end||'';
      }
      rows.set(y,row);
    });

    rows.forEach((row,year)=>{
      const sold=ledger.bySaleYear[year]||{};
      const open=ledger.openByAssignmentYear[year]||{};
      row.stockRealized=n(sold.realized);
      row.soldShares=n(sold.soldShares);
      row.stockUnrealized=n(open.unrealized);
      row.openShares=n(open.openShares);
      row.assignedLots=n(open.lots);
      row.missingPrices=n(open.missingPrices);
      row.assignmentEffect=row.stockRealized;
      row.adjusted=n(row.realized)+row.stockRealized;
      row.adjustedPct=row.nav?row.adjusted/row.nav*100:null;
      row.economicAdjusted=row.adjusted+row.stockUnrealized;
    });

    const years=[...rows.values()].sort((a,b)=>b.year-a.year);
    const selectedYear=Number(base.selected?.year)||years[0]?.year||0;
    const selected=years.find(row=>row.year===selectedYear)||years[0]||null;
    return{...base,ledger,years,selected};
  }

  A.adjustedOptionsAnalysis=correctedAnalysis;

  function periodLabel(row){
    const current=new Date().getFullYear();
    if(row.year===current)return`${row.year} · YTD${row.periodEnd?` hasta ${new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'short'}).format(new Date(row.periodEnd+'T12:00:00'))}`:''}`;
    if(row.periodStart&&row.periodEnd)return`${row.year} · ${row.periodStart.slice(5)} a ${row.periodEnd.slice(5)}`;
    return String(row.year);
  }

  function lowerApprovedScreen(){
    try{
      const doc=new DOMParser().parseFromString(`<div id="lower1521">${previousView?previousView():''}</div>`,'text/html');
      const root=doc.querySelector('#lower1521');
      return[...root.querySelectorAll('.options-panels,.option-positions-section')].map(node=>node.outerHTML).join('');
    }catch(_){return''}
  }

  function historyRows(rows,selectedYear){
    return rows.map(row=>`<button class="history-row ${row.year===selectedYear?'active':''}" data-action="select-options-year" data-year="${row.year}"><span><b>${row.year}</b><small>${row.year===new Date().getFullYear()?'Año en curso':'Histórico'}${row.navDate?` · cartera a ${row.navDate}`:''}</small></span><span><small>Opciones realizadas</small><b>${A.display(A.euro(row.realized,2))}</b></span><span class="${row.stockRealized<0?'loss':'gain'}"><small>Acciones asignadas vendidas</small><b>${signedMoney(row.stockRealized)}</b></span><span class="adjusted-cell"><small>Ajustadas realizadas</small><b>${A.display(A.euro(row.adjusted,2))}</b></span><span><small>% cartera</small><b>${row.adjustedPct===null?'—':A.pct(row.adjustedPct,1)}</b></span></button>`).join('');
  }

  A.views.options=()=>{
    const analysis=correctedAnalysis(),row=analysis.selected;
    if(!row)return previousView?previousView():'';
    const years=analysis.years;
    const soldTone=row.stockRealized<0?'negative':'positive';
    const openStatus=row.openShares?`${new Intl.NumberFormat('es-ES',{maximumFractionDigits:0}).format(row.openShares)} acciones siguen abiertas`:'No quedan acciones abiertas de esas asignaciones';

    return `<div class="page-head adjusted-page-head"><div><p class="eyebrow">OPCIONES · RESULTADO REALIZADO</p><h1>¿Qué resultado has convertido realmente en dinero?</h1><p>${periodLabel(row)} · primas realizadas más la ganancia o pérdida ya realizada al vender acciones recibidas por asignación.</p></div><div class="page-actions"><button class="soft-btn" data-action="edit-option-rules">Reglas</button><button class="primary-btn" data-action="import-options-history">Añadir CSV</button></div></div>
      <div class="year-strip">${years.map(year=>`<button class="year-chip ${year.year===row.year?'active':''}" data-action="select-options-year" data-year="${year.year}"><b>${year.year}</b><small>${year.year===new Date().getFullYear()?'YTD':'Histórico'}</small></button>`).join('')}</div>
      <section class="adjusted-options-hero"><div><span class="hero-badge"><i></i>${row.year===new Date().getFullYear()?'AÑO EN CURSO':'AÑO COMPLETADO'}</span><p class="hero-label">OPCIONES AJUSTADAS REALIZADAS</p><h2>${A.display(A.euro(row.adjusted,2))}</h2><p>${A.display(A.euro(row.realized,2))} de opciones ${row.stockRealized>=0?'+':'−'} ${A.display(A.euro(Math.abs(row.stockRealized),2))} por la parte vendida de acciones asignadas.</p></div><div class="adjusted-rate"><span>Ajustadas realizadas / cartera</span><strong>${row.adjustedPct===null?'—':A.pct(row.adjustedPct,1)}</strong><small>${row.nav?`${A.display(A.euro(row.nav))} de cartera a ${row.navDate||'fin del periodo'}`:'Falta NAV del periodo'}</small></div></section>
      <div class="honest-kpis"><article><span>Opciones realizadas</span><strong>${A.display(A.euro(row.realized,2))}</strong><small>${row.trades||0} apuntes de opciones</small></article><article class="${soldTone}"><span>Resultado de acciones vendidas</span><strong>${signedMoney(row.stockRealized)}</strong><small>${new Intl.NumberFormat('es-ES',{maximumFractionDigits:0}).format(row.soldShares||0)} acciones asignadas vendidas</small></article><article class="accent"><span>Opciones ajustadas realizadas</span><strong>${A.display(A.euro(row.adjusted,2))}</strong><small>Opciones + resultado realizado de asignaciones</small></article><article><span>Ajustadas realizadas / cartera</span><strong>${row.adjustedPct===null?'—':A.pct(row.adjustedPct,1)}</strong><small>Sobre el NAV final disponible</small></article></div>
      <section class="assignment-audit"><div class="audit-head"><div><p class="eyebrow">ASIGNACIONES</p><h2>Separación entre realizado y pendiente</h2></div><span class="audit-status ${row.missingPrices?'watch':'ok'}">${openStatus}</span></div><div class="audit-grid"><div><span>Parte ya vendida</span><strong>${signedMoney(row.stockRealized)}</strong><small>Sí entra en las ajustadas realizadas</small></div><div><span>Parte todavía abierta</span><strong>${signedMoney(row.stockUnrealized)}</strong><small>No entra: sigue siendo no realizada</small></div><div><span>Escenario económico actual</span><strong>${A.display(A.euro(row.economicAdjusted,2))}</strong><small>Realizado + valoración latente; no es beneficio realizado</small></div></div><p>En ventas parciales, como NVO y ORCL, solo la parte efectivamente vendida suma o resta al resultado oficial. Las acciones que continúan en cartera se muestran aparte y no modifican las opciones ajustadas realizadas.</p></section>
      <section class="section history-section"><div class="section-head"><div><h2>Comparación por años</h2><p>Las ventas de acciones asignadas se imputan al año en que se venden, no al año en que fueron asignadas.</p></div><span class="file-chip">${analysis.store?.files?.length||0} CSV analizados</span></div><div class="history-list">${historyRows(years,row.year)}</div></section>
      ${lowerApprovedScreen()}
      <div class="notice"><b>Criterio realizado:</b> opciones ajustadas realizadas = opciones realizadas + ganancia o pérdida realizada de acciones procedentes de asignaciones y ya vendidas. Las acciones asignadas que siguen abiertas no se incluyen. No es un cálculo fiscal.</div>`;
  };
})();
