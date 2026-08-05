(()=>{
  'use strict';
  const A=window.FFLab;
  const dateLabel=()=>new Intl.DateTimeFormat('es-ES',{weekday:'long',day:'numeric',month:'long'}).format(new Date()).toUpperCase();
  const greeting=()=>new Date().getHours()<13?'Buenos días':new Date().getHours()<20?'Buenas tardes':'Buenas noches';
  const ageLabel=days=>days>=9999?'sin fecha':days===0?'hoy':days===1?'ayer':`hace ${days} días`;

  function nextAction(t){
    const fresh=A.freshness();
    if(!A.plan.items.length)return{icon:'＋',eyebrow:'EMPIEZA POR AQUÍ',title:'Añade tu primera cuenta o activo',text:'Con una sola cifra ya podremos calcular una primera fotografía de tu patrimonio.',button:'Añadir elemento',attrs:'data-action="add-item"'};
    if(t.cash<=0)return{icon:'€',eyebrow:'FALTA LIQUIDEZ',title:'Añade tus cuentas bancarias',text:'Necesitamos el dinero disponible para calcular la liquidez real y compararla con tu regla personal.',button:'Añadir banco',attrs:'data-action="add-category" data-category="banks"'};
    if(fresh.stale.length){const row=fresh.oldest;return{icon:'↻',eyebrow:'DATO ANTIGUO',title:`Actualiza ${row.item.name||'un elemento'}`,text:`Su última cifra es de ${ageLabel(row.age)}. Corregirla mejorará todo el panel.`,button:'Actualizar ahora',attrs:`data-action="edit-item" data-id="${A.esc(row.item.id)}"`};}
    if(t.liquidity<A.n(A.plan.rules.minLiquidityPct))return{icon:'!',eyebrow:'REGLA PERSONAL',title:'Tu liquidez está por debajo de tu objetivo',text:`Tienes ${A.pct(t.liquidity,1)} frente al ${A.pct(A.plan.rules.minLiquidityPct)} que marcaste como mínimo.`,button:'Revisar patrimonio',attrs:'data-route="wealth"'};
    if(t.concentration>A.n(A.plan.rules.maxConcentrationPct))return{icon:'◎',eyebrow:'CONCENTRACIÓN',title:'Una inversión pesa más de lo previsto',text:`La mayor posición supone el ${A.pct(t.concentration,1)} de tus activos financieros.`,button:'Ver inversiones',attrs:'data-route="wealth"'};
    if(!t.monthMovements)return{icon:'＋',eyebrow:'ACTUALIZACIÓN MENSUAL',title:'Registra qué ha cambiado este mes',text:'Añade una aportación, retirada, ingreso o variación de mercado para explicar la evolución mensual.',button:'Actualizar fotografía',attrs:'data-action="add-movement"'};
    if(A.optionsData().available)return{icon:'◉',eyebrow:'TODO AL DÍA',title:'Revisa tu operativa de opciones',text:'El patrimonio está bien definido y el análisis de Interactive Brokers está disponible.',button:'Abrir Opciones',attrs:'data-route="options"'};
    return{icon:'✓',eyebrow:'FOTOGRAFÍA AL DÍA',title:'Tu situación está bien definida',text:'El siguiente paso será registrar cambios mensuales para construir un histórico útil.',button:'Registrar movimiento',attrs:'data-action="add-movement"'};
  }

  function distribution(){
    const totals=A.categoryTotals();
    const rows=[
      ['banks','Bancos y efectivo','€'],
      ['investments','Inversiones','↗'],
      ['pensions','Pensiones','◌'],
      ['properties','Inmuebles','⌂'],
      ['others','Otros activos','＋']
    ].filter(([id])=>A.n(totals[id])>0);
    const sum=rows.reduce((s,[id])=>s+A.n(totals[id]),0);
    if(!rows.length)return '<div class="empty-inline">Añade activos para ver cómo se distribuye tu patrimonio.</div>';
    return rows.map(([id,label,icon])=>{const value=A.n(totals[id]),share=sum?value/sum*100:0;return `<div class="dist-row"><div class="dist-label"><span>${icon}</span><b>${A.esc(label)}</b><small>${A.pct(share,1)}</small></div><div class="dist-track"><i style="width:${Math.max(2,share)}%"></i></div><strong>${A.display(A.euro(value))}</strong></div>`}).join('');
  }

  A.views.home=()=>{
    const t=A.totals(),s=A.score(t),name=A.plan.profile.name||'Luis',action=nextAction(t),g=A.plan.goal||{};
    const goalCurrent=g.linkedToNetWorth?t.net:A.n(g.current),goalPct=g.target?Math.max(0,Math.min(100,goalCurrent/A.n(g.target)*100)):0;
    const income=A.incomeSummary(),fresh=A.freshness();
    return `
      <div class="page-head home-head"><div><p class="date">${A.esc(dateLabel())}</p><h1>${greeting()}, ${A.esc(name)}.</h1><p>Las cinco cifras esenciales para entender tu situación de un vistazo.</p></div><button class="primary-btn" data-action="add-movement">Actualizar fotografía</button></div>
      <section class="hero home-hero"><div class="hero-grid"><div><span class="hero-badge"><i></i>${s>=80?'BUEN CONTROL':s>=60?'EN CONSTRUCCIÓN':'FALTA INFORMACIÓN'}</span><p class="hero-label">PATRIMONIO NETO ESTIMADO</p><h2>${A.display(A.euro(t.net))}</h2><p>Activos ${A.display(A.euro(t.gross))} menos deudas ${A.display(A.euro(t.debt))}. Última actualización ${ageLabel(Math.max(0,Math.floor((Date.now()-new Date(A.plan.lastUpdated||Date.now()).getTime())/86400000)))}.</p></div><div class="goal-ring" style="--p:${goalPct}"><div><span>Objetivo</span><strong>${A.pct(goalPct,0)}</strong><small>${A.display(A.euro(goalCurrent))} de ${A.display(A.euro(g.target))}</small></div></div></div></section>
      <div class="dashboard-kpis">
        <article class="dash-kpi primary-kpi"><span>Patrimonio neto</span><strong>${A.display(A.euro(t.net))}</strong><small>Activos menos deudas</small></article>
        <article class="dash-kpi"><span>Liquidez disponible</span><strong>${A.display(A.euro(t.cash))}</strong><small>${A.pct(t.liquidity,1)} de activos financieros</small></article>
        <article class="dash-kpi"><span>Ingresos mensuales</span><strong>${A.display(A.euro(t.incomeTotal))}</strong><small>${income.documented?`${income.count} fuentes registradas`:'Estimación desde tus activos'}</small></article>
        <article class="dash-kpi debt-kpi"><span>Deuda pendiente</span><strong>${A.display(A.euro(t.debt))}</strong><small>${A.plan.items.filter(x=>x.type==='debt').length} deudas o hipotecas</small></article>
        <article class="dash-kpi ${t.monthChange<0?'negative-kpi':''}"><span>Variación del mes</span><strong>${t.monthChange>0?'+ ':t.monthChange<0?'− ':''}${A.display(A.euro(Math.abs(t.monthChange)))}</strong><small>${t.monthMovements} movimientos registrados</small></article>
      </div>
      <div class="home-panels">
        <section class="section action-panel"><div class="action-icon">${action.icon}</div><p class="eyebrow">${action.eyebrow}</p><h2>${A.esc(action.title)}</h2><p>${A.esc(action.text)}</p><button class="primary-btn" ${action.attrs}>${A.esc(action.button)} <span>→</span></button></section>
        <section class="section"><div class="section-head"><div><h2>Cómo se reparte tu patrimonio</h2><p>Distribución sobre el valor bruto de tus activos.</p></div><button class="soft-btn" data-route="wealth">Ver detalle</button></div><div class="distribution">${distribution()}</div></section>
      </div>
      <section class="section data-health"><div><p class="eyebrow">CALIDAD DE LA FOTOGRAFÍA</p><h2>${fresh.stale.length?`${fresh.stale.length} datos necesitan revisión`:'Todos los datos están recientes'}</h2><p>${fresh.total?`${fresh.fresh} de ${fresh.total} elementos se han actualizado en los últimos 90 días.`:'Todavía no hay elementos patrimoniales.'}</p></div><div class="health-score"><strong>${s}</strong><span>/ 100</span></div></section>`;
  };

  const sourceOf=i=>['estimated','entered','imported','synced'].includes(i.source)?i.source:'entered';
  const sourceLabel=s=>({estimated:'Estimado',entered:'Introducido',imported:'Importado',synced:'Sincronizado'}[s]||'Introducido');
  const lastDate=i=>{const d=new Date(i.updatedAt||A.plan.lastUpdated||Date.now());return Number.isNaN(d.getTime())?'Sin fecha':new Intl.DateTimeFormat('es-ES',{day:'2-digit',month:'short',year:'2-digit'}).format(d)};
  const block=(id,m)=>{
    const items=A.plan.items.filter(x=>m.types.includes(x.type)),total=items.reduce((s,x)=>s+A.n(x.value),0),income=items.reduce((s,x)=>s+A.n(x.monthlyIncome),0);
    const rows=items.map(i=>{const src=sourceOf(i);return `<div class="item"><span class="item-icon">${A.TYPE_META[i.type]?.[1]||'•'}</span><span><b>${A.esc(i.name||A.TYPE_META[i.type]?.[0])}</b><small>${A.esc(A.TYPE_META[i.type]?.[0]||i.type)}${i.owner?` · ${A.esc(i.owner)}`:''}${A.n(i.monthlyIncome)?` · ${A.euro(i.monthlyIncome)}/mes`:''}<br>Actualizado ${lastDate(i)}</small><span class="source ${src}"><i></i>${sourceLabel(src)}</span></span><span class="item-value"><strong>${i.type==='debt'?'− ':''}${A.display(A.euro(i.value))}</strong><button data-action="edit-item" data-id="${A.esc(i.id)}">Actualizar</button></span></div>`}).join('');
    return `<details class="category" ${items.length?'open':''}><summary><span class="cat-icon">${m.icon}</span><span class="cat-title"><b>${A.esc(m.label)}</b><small>${items.length} ${items.length===1?'elemento':'elementos'} · ${A.esc(m.text)}</small></span><span class="cat-total"><strong>${id==='debts'?'− ':''}${A.display(A.euro(total))}</strong><small>${income?`${A.display(A.euro(income))}/mes`:items.length?'Datos disponibles':'Sin datos'}</small></span><span class="chev">›</span></summary><div class="category-body"><div class="cat-actions"><button class="soft-btn" data-action="add-category" data-category="${id}">＋ Añadir en ${A.esc(m.label)}</button></div><div class="item-list">${rows||'<div class="empty-inline">Todavía no has añadido nada en esta categoría.</div>'}</div></div></details>`;
  };
  A.views.wealth=()=>{const t=A.totals();return `<div class="page-head"><div><p class="eyebrow">PATRIMONIO · NUEVO</p><h1>Tu patrimonio, bien ordenado.</h1><p>Abre cada categoría para revisar, actualizar o añadir elementos.</p></div><button class="primary-btn" data-action="add-item">＋ Añadir</button></div><div class="metrics"><div class="metric"><span>Activos</span><strong>${A.display(A.euro(t.gross))}</strong></div><div class="metric"><span>Deudas</span><strong>${A.display(A.euro(t.debt))}</strong></div><div class="metric"><span>Patrimonio neto</span><strong>${A.display(A.euro(t.net))}</strong></div><div class="metric"><span>Elementos</span><strong>${A.plan.items.length}</strong></div></div><div class="category-stack">${Object.entries(A.CATEGORIES).map(([id,m])=>block(id,m)).join('')}</div>`};
})();