(()=>{
  'use strict';
  const A=window.FFLab;
  if(!A||A.__PHOTO_1522__)return;
  A.__PHOTO_1522__=true;
  A.VERSION='15.22-lab';

  const SNAP_KEY='ff_snapshots_v1522';
  const INCOME_KEY='ff_income_sources_v1510';
  const INCOME_OVERRIDE_KEY='ff_income_override_v1522';
  const originalIncomeSummary=A.incomeSummary;
  const originalTotals=A.totals;
  const originalHome=A.views.home;
  const originalReport=A.views.report;
  const steps=['banks','investments','pensions','properties','debts','income','review'];
  let session=null;

  const n=v=>A.n(v);
  const clone=v=>JSON.parse(JSON.stringify(v));
  const localDate=()=>{
    const d=new Date(),parts=new Intl.DateTimeFormat('en-CA',{year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d),map=Object.fromEntries(parts.map(p=>[p.type,p.value]));
    return `${map.year}-${map.month}-${map.day}`;
  };
  const monthName=key=>new Intl.DateTimeFormat('es-ES',{month:'long',year:'numeric'}).format(new Date(`${key}-01T12:00:00`));
  const signed=v=>`${n(v)>0?'+ ':n(v)<0?'− ':''}${A.display(A.euro(Math.abs(n(v))))}`;
  const readSnapshots=()=>{
    const rows=A.read(SNAP_KEY,[]);
    return (Array.isArray(rows)?rows:[]).sort((a,b)=>`${a.date||''}|${a.createdAt||''}`.localeCompare(`${b.date||''}|${b.createdAt||''}`));
  };
  const saveSnapshots=rows=>A.write(SNAP_KEY,rows.slice(-120));

  A.incomeSummary=()=>{
    const override=A.read(INCOME_OVERRIDE_KEY,null);
    if(override?.active){
      const salary=n(override.salary),passive=n(override.passive);
      return{total:salary+passive,salary,passive,count:(salary>0?1:0)+(passive>0?1:0),sources:[],documented:true,override:true};
    }
    return originalIncomeSummary();
  };

  function photoHistory(){
    const rows=readSnapshots(),key=localDate().slice(0,7),current=rows.filter(x=>x.month===key),latest=current.at(-1)||null,prior=rows.filter(x=>x.month<key).at(-1)||null;
    let monthChange=null;
    if(latest){
      if(prior)monthChange=n(latest.totals?.net)-n(prior.totals?.net);
      else monthChange=current.reduce((s,x)=>s+n(x.changes?.net),0);
    }
    return{rows,current,latest,prior,monthChange,count:current.length};
  }
  A.photoHistory=photoHistory;

  A.totals=()=>{
    const t=originalTotals(),history=photoHistory();
    if(history.latest){t.monthChange=n(history.monthChange);t.monthMovements=history.count}
    return t;
  };

  const itemTypes=id=>A.CATEGORIES[id]?.types||[];
  const categoryItems=id=>A.plan.items.filter(item=>itemTypes(id).includes(item.type));
  const sourceStore=()=>A.read(INCOME_KEY,{sources:[]});

  function beginSession(){
    const sourceDraft=sourceStore(),sources=Array.isArray(sourceDraft?.sources)?clone(sourceDraft.sources):[],income=A.incomeSummary();
    session={
      step:0,
      date:localDate(),
      note:'',
      beforePlan:clone(A.plan),
      beforeTotals:originalTotals(),
      beforeIncome:clone(income),
      values:Object.fromEntries(A.plan.items.map(item=>[item.id,n(item.value)])),
      sourceDraft,
      sources,
      sourceValues:Object.fromEntries(sources.map(source=>[source.id,n(source.monthly)])),
      salary:n(income.salary),
      passive:n(income.passive)
    };
    renderWizard();
  }

  function collect(){
    document.querySelectorAll('[data-photo-item]').forEach(input=>{session.values[input.dataset.photoItem]=n(input.value)});
    document.querySelectorAll('[data-photo-income-source]').forEach(input=>{session.sourceValues[input.dataset.photoIncomeSource]=n(input.value)});
    const salary=document.querySelector('#photoSalary');if(salary)session.salary=n(salary.value);
    const passive=document.querySelector('#photoPassive');if(passive)session.passive=n(passive.value);
    const date=document.querySelector('#photoDate');if(date?.value)session.date=date.value;
    const note=document.querySelector('#photoNote');if(note)session.note=note.value.trim();
  }

  function projected(){
    const items=A.plan.items.map(item=>({...item,value:n(session.values[item.id])}));
    const assets=items.filter(item=>item.type!=='debt'),debts=items.filter(item=>item.type==='debt');
    const gross=assets.reduce((s,item)=>s+n(item.value),0),debt=debts.reduce((s,item)=>s+n(item.value),0),financial=assets.filter(item=>A.FINANCIAL.has(item.type)),financialAssets=financial.reduce((s,item)=>s+n(item.value),0),cash=assets.filter(item=>A.LIQUID.has(item.type)).reduce((s,item)=>s+n(item.value),0);
    const income=session.sources.length?session.sources.reduce((s,source)=>s+n(session.sourceValues[source.id]),0):n(session.salary)+n(session.passive);
    return{items,gross,debt,net:gross-debt,cash,financialAssets,liquidity:financialAssets?cash/financialAssets*100:0,income};
  }

  function progress(){return Math.round((session.step/(steps.length-1))*100)}
  function stepMeta(id){return{
    banks:['Bancos y efectivo','Confirma saldos. Puedes dejar cualquier cifra sin cambios.'],
    investments:['Inversiones','Revisa brokers, fondos, acciones, ETF, opciones y cripto.'],
    pensions:['Pensiones','Actualiza únicamente cuando tengas una valoración nueva.'],
    properties:['Inmuebles','Confirma la valoración que quieras utilizar en tu fotografía.'],
    debts:['Hipotecas y deudas','Introduce el capital pendiente, no la cuota mensual.'],
    income:['Ingresos mensuales','Confirma nóminas, alquileres, opciones y otros ingresos.'],
    review:['Revisión final','Comprueba el cambio antes de guardar la fotografía.']
  }[id]}

  function itemStep(id){
    const items=categoryItems(id),meta=stepMeta(id);
    const rows=items.map(item=>`<label class="photo-row"><span><b>${A.esc(item.name||A.TYPE_META[item.type]?.[0]||'Elemento')}</b><small>${A.esc(A.TYPE_META[item.type]?.[0]||item.type)}${item.owner?` · ${A.esc(item.owner)}`:''}</small></span><span class="photo-money"><input data-photo-item="${A.esc(item.id)}" type="number" min="0" step="0.01" value="${n(session.values[item.id])}"><i>€</i></span></label>`).join('');
    return `<div class="photo-step-copy"><p class="eyebrow">${A.esc(meta[0])}</p><h2>${A.esc(meta[0])}</h2><p>${A.esc(meta[1])}</p></div>${rows?`<div class="photo-list">${rows}</div>`:`<div class="photo-empty"><b>No hay elementos en esta categoría</b><span>Puedes continuar y añadirlos después desde Patrimonio.</span></div>`}`;
  }

  function incomeStep(){
    const meta=stepMeta('income');
    if(session.sources.length){
      const rows=session.sources.map(source=>`<label class="photo-row"><span><b>${A.esc(source.name||'Ingreso')}</b><small>${A.esc(source.frequencyLabel||'Mensual')} · ${A.esc(source.kind||'otro')}</small></span><span class="photo-money"><input data-photo-income-source="${A.esc(source.id)}" type="number" min="0" step="0.01" value="${n(session.sourceValues[source.id])}"><i>€/mes</i></span></label>`).join('');
      return `<div class="photo-step-copy"><p class="eyebrow">INGRESOS</p><h2>${A.esc(meta[0])}</h2><p>${A.esc(meta[1])}</p></div><div class="photo-list">${rows}</div>`;
    }
    return `<div class="photo-step-copy"><p class="eyebrow">INGRESOS</p><h2>${A.esc(meta[0])}</h2><p>No hay fuentes detalladas, así que puedes confirmar dos cifras agregadas.</p></div><div class="photo-income-grid"><label class="field">Nóminas y salarios al mes<input id="photoSalary" type="number" min="0" step="0.01" value="${n(session.salary)}"></label><label class="field">Ingresos pasivos al mes<input id="photoPassive" type="number" min="0" step="0.01" value="${n(session.passive)}"></label></div>`;
  }

  function reviewStep(){
    const p=projected(),before=session.beforeTotals,delta={gross:p.gross-n(before.gross),debt:p.debt-n(before.debt),net:p.net-n(before.net),cash:p.cash-n(before.cash),income:p.income-n(session.beforeIncome.total)};
    return `<div class="photo-step-copy"><p class="eyebrow">REVISIÓN FINAL</p><h2>Guarda tu fotografía.</h2><p>La última fotografía de cada mes se utilizará como cierre mensual. Puedes guardar tantas adicionales como necesites.</p></div><div class="photo-review-grid"><article><span>Patrimonio neto</span><strong>${A.display(A.euro(p.net))}</strong><small>${signed(delta.net)} frente a la situación anterior</small></article><article><span>Liquidez</span><strong>${A.display(A.euro(p.cash))}</strong><small>${A.pct(p.liquidity,1)} de activos financieros</small></article><article><span>Deuda</span><strong>${A.display(A.euro(p.debt))}</strong><small>${signed(delta.debt)} de variación</small></article><article><span>Ingresos mensuales</span><strong>${A.display(A.euro(p.income))}</strong><small>${signed(delta.income)} de variación</small></article></div><div class="form-grid"><label class="field">Fecha de la fotografía<input id="photoDate" type="date" value="${A.esc(session.date)}"></label><label class="field">Nota opcional<input id="photoNote" maxlength="120" value="${A.esc(session.note)}" placeholder="Ej. Actualización antes de la reforma"></label></div><div class="photo-rule"><b>Funcionamiento flexible</b><span>Puedes actualizar hoy, repetir dentro de una semana y volver a hacerlo al final del mes. El histórico conservará todas las fotografías.</span></div>`;
  }

  function renderWizard(){
    const id=steps[session.step],body=id==='income'?incomeStep():id==='review'?reviewStep():itemStep(id);
    A.openModal(`<div class="sheet-head photo-sheet-head"><div><p class="eyebrow">ACTUALIZAR FOTOGRAFÍA</p><h2>${session.step+1} de ${steps.length}</h2></div><button class="close" data-action="close-modal">×</button></div><div class="photo-progress"><i style="width:${progress()}%"></i></div><div class="photo-wizard-body">${body}</div><div class="sheet-actions photo-actions">${session.step?'<button type="button" class="soft-btn" data-photo-action="prev">Atrás</button>':'<span></span>'}<button type="button" class="primary-btn" data-photo-action="${id==='review'?'save':'next'}">${id==='review'?'Guardar fotografía':'Continuar'}</button></div>`);
  }

  function categoryTotals(items){
    return Object.fromEntries(Object.entries(A.CATEGORIES).map(([id,meta])=>[id,items.filter(item=>meta.types.includes(item.type)).reduce((s,item)=>s+n(item.value),0)]));
  }

  function persistIncome(){
    if(session.sources.length){
      const draft=clone(session.sourceDraft||{sources:[]});
      draft.sources=session.sources.map(source=>({...source,monthly:n(session.sourceValues[source.id])}));
      draft.confirmed=true;draft.updatedAt=A.now();A.write(INCOME_KEY,draft);localStorage.removeItem(INCOME_OVERRIDE_KEY);
    }else{
      A.write(INCOME_OVERRIDE_KEY,{active:true,salary:n(session.salary),passive:n(session.passive),updatedAt:A.now()});
    }
  }

  function savePhoto(){
    collect();
    const now=A.now(),project=projected();
    A.plan.items=A.plan.items.map(item=>({...item,value:n(session.values[item.id]),updatedAt:now}));
    persistIncome();
    A.save();
    const current=originalTotals(),income=A.incomeSummary(),rows=readSnapshots(),previous=rows.at(-1),before=previous?.totals||session.beforeTotals,month=session.date.slice(0,7),sameMonth=rows.filter(row=>row.month===month).length;
    const snapshot={
      id:A.uid(),version:'15.22',date:session.date,month,createdAt:now,type:sameMonth?'extra':'monthly',label:sameMonth?`Actualización ${sameMonth+1} · ${monthName(month)}`:`Fotografía · ${monthName(month)}`,note:session.note,
      totals:{gross:n(current.gross),debt:n(current.debt),net:n(current.net),cash:n(current.cash),financialAssets:n(current.financialAssets),liquidity:n(current.liquidity),incomeTotal:n(income.total),salary:n(income.salary),passive:n(income.passive)},
      changes:{gross:n(current.gross)-n(before.gross),debt:n(current.debt)-n(before.debt),net:n(current.net)-n(before.net),cash:n(current.cash)-n(before.cash),income:n(income.total)-n(previous?.totals?.incomeTotal??session.beforeIncome.total)},
      categories:categoryTotals(A.plan.items),items:A.plan.items.map(item=>({id:item.id,name:item.name,type:item.type,value:n(item.value)}))
    };
    saveSnapshots([...rows,snapshot]);
    session=null;A.closeModal();A.render();A.toast(sameMonth?'Actualización adicional guardada':'Fotografía mensual guardada');
  }

  function photoDetail(id){
    const row=readSnapshots().find(x=>x.id===id);if(!row)return;
    const categoryLabels={banks:'Bancos',investments:'Inversiones',pensions:'Pensiones',properties:'Inmuebles',debts:'Deudas',others:'Otros'};
    A.openModal(`<div class="sheet-head"><div><p class="eyebrow">HISTÓRICO</p><h2>${A.esc(row.label)}</h2><p>${A.esc(row.date)}${row.note?` · ${A.esc(row.note)}`:''}</p></div><button class="close" data-action="close-modal">×</button></div><div class="photo-detail-hero"><span>Patrimonio neto</span><strong>${A.display(A.euro(row.totals?.net))}</strong><small>${signed(row.changes?.net)} desde la fotografía anterior</small></div><div class="photo-detail-list">${Object.entries(row.categories||{}).map(([key,value])=>`<div><span>${A.esc(categoryLabels[key]||key)}</span><strong>${key==='debts'?'− ':''}${A.display(A.euro(value))}</strong></div>`).join('')}</div><div class="sheet-actions"><button type="button" class="primary-btn" data-action="close-modal">Cerrar</button></div>`);
  }

  function latestByMonth(){
    const map=new Map();readSnapshots().forEach(row=>map.set(row.month,row));return[...map.values()].sort((a,b)=>String(b.month).localeCompare(String(a.month)));
  }

  A.views.home=()=>{
    let html=originalHome();
    const history=photoHistory(),latest=history.rows.at(-1);
    html=html.replace('movimientos registrados','actualizaciones guardadas');
    if(latest)html+=`<section class="section photo-home-card"><div><p class="eyebrow">ÚLTIMA FOTOGRAFÍA</p><h2>${A.esc(latest.label)}</h2><p>${latest.note?A.esc(latest.note):'La última fotografía de cada mes actúa como cierre mensual.'}</p></div><div><strong>${A.display(A.euro(latest.totals?.net))}</strong><small>${signed(latest.changes?.net)} desde la anterior</small><button class="soft-btn" data-photo-detail="${A.esc(latest.id)}">Ver detalle</button></div></section>`;
    return html;
  };

  A.views.report=()=>{
    const base=originalReport(),months=latestByMonth().slice(0,12);
    const history=months.length?`<section class="section photo-history-section"><div class="section-head"><div><h2>Histórico de fotografías</h2><p>Se conserva cada actualización; aquí se muestra la última de cada mes.</p></div><button class="primary-btn" data-action="add-movement">Actualizar ahora</button></div><div class="photo-history-list">${months.map((row,index)=>{const next=months[index+1],change=next?n(row.totals?.net)-n(next.totals?.net):n(row.changes?.net);return`<button data-photo-detail="${A.esc(row.id)}"><span><b>${A.esc(monthName(row.month))}</b><small>${A.esc(row.date)}${row.note?` · ${A.esc(row.note)}`:''}</small></span><span><small>Patrimonio neto</small><b>${A.display(A.euro(row.totals?.net))}</b></span><span class="${change<0?'down':'up'}"><small>Variación</small><b>${signed(change)}</b></span></button>`}).join('')}</div></section>`:'<section class="section"><div class="empty"><b>Aún no hay fotografías guardadas</b><br>La primera actualización creará el inicio del histórico.</div></section>';
    return base+history;
  };

  document.addEventListener('click',event=>{
    const detail=event.target.closest('[data-photo-detail]');
    if(detail){event.preventDefault();event.stopImmediatePropagation();photoDetail(detail.dataset.photoDetail);return}
    const action=event.target.closest('[data-photo-action]');
    if(action){event.preventDefault();event.stopImmediatePropagation();collect();if(action.dataset.photoAction==='prev'){session.step=Math.max(0,session.step-1);renderWizard()}if(action.dataset.photoAction==='next'){session.step=Math.min(steps.length-1,session.step+1);renderWizard()}if(action.dataset.photoAction==='save')savePhoto();return}
    const button=event.target.closest('[data-action]');
    if(button?.dataset.action==='add-movement'){
      event.preventDefault();event.stopImmediatePropagation();beginSession();
    }
  },true);
})();
