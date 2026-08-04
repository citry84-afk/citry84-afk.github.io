/* FinanzasFácil v15.6 · acciones y opciones desde una única importación */
(() => {
  'use strict';
  if (globalThis.__FF_INVESTMENT_ONBOARDING_156__) return;
  globalThis.__FF_INVESTMENT_ONBOARDING_156__ = true;

  const VERSION = '15.6';
  const BROKER_DRAFT = 'ff_onboarding_brokers_v155';
  const BASE_STORE = 'ff_mi_plan_v2';
  const BROKERS = [
    ['ibkr','Interactive Brokers','IB'],['myinvestor','MyInvestor','MY'],['degiro','DeGiro','DG'],
    ['traderepublic','Trade Republic','TR'],['xtb','XTB','XTB'],['renta4','Renta 4','R4'],['other','Otro broker o banco','+']
  ].map(([id,name,mark])=>({id,name,mark}));

  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
  const read = (key,fallback) => { try{return JSON.parse(localStorage.getItem(key)||'null')??fallback;}catch(_){return fallback;} };
  const write = (key,value) => localStorage.setItem(key,JSON.stringify(value));
  const safe = value => Number.isFinite(Number(value)) && Number(value)>=0 ? Number(value) : 0;
  const share = value => Math.max(0,Math.min(100,Number.isFinite(Number(value))?Number(value):100));
  const money = value => new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',minimumFractionDigits:0,maximumFractionDigits:2}).format(Number(value)||0);
  const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const slug = value => String(value||'broker').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

  function defaultDraft(){return{version:VERSION,brokers:[],monthlyContribution:0,applied:false,updatedAt:new Date().toISOString()};}
  function loadDraft(){const value=read(BROKER_DRAFT,null);return value?.brokers?value:defaultDraft();}
  function saveDraft(draft){draft.version=VERSION;draft.updatedAt=new Date().toISOString();draft.applied=false;write(BROKER_DRAFT,draft);}
  function brokerTotal(draft){
    const rows=(draft.brokers||[]).map(item=>({gross:safe(item.amount),ownership:share(item.ownership),attributable:safe(item.amount)*share(item.ownership)/100}));
    return{gross:rows.reduce((s,x)=>s+x.gross,0),attributable:rows.reduce((s,x)=>s+x.attributable,0)};
  }

  function injectStyles(){
    if ($('style[data-invest156]')) return;
    const style=document.createElement('style');style.dataset.invest156='1';style.textContent=`
      .inv156{--ink:#0b2240;--muted:#63758c;--line:#d4dfec;--card:#fff;--blue:#1674d1;--orange:#ff8a16;color:var(--ink)}.inv156 *{box-sizing:border-box}.inv156 button,.inv156 input{font:inherit}
      .inv156-section{margin-top:15px;padding:15px;border:1px solid var(--line);border-radius:21px;background:rgba(255,255,255,.74)}.inv156-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:11px}.inv156-head b{font-size:16px}.inv156-head span{display:block;color:var(--muted);font-size:11px;line-height:1.4;margin-top:3px}
      .inv156-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.inv156-choice{min-height:64px;border:1px solid var(--line);border-radius:16px;background:#fff;color:var(--ink);padding:9px 7px;display:flex;gap:8px;align-items:center;text-align:left;font-weight:850}.inv156-choice.selected{border-color:#ff9b3d;background:#fff7ee}.inv156-mark{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:#eaf3fd;color:#155994;font-size:10px;font-weight:950;flex:none}.inv156-choice small{display:block;color:var(--muted);font-size:8px;margin-top:2px}
      .inv156-list{display:grid;gap:10px}.inv156-card{border:1px solid var(--line);border-radius:19px;background:#fff;padding:13px}.inv156-cardhead{display:flex;justify-content:space-between}.inv156-cardhead small{display:block;color:var(--blue);font-weight:900}.inv156-cardhead b{display:block;font-size:17px;margin-top:3px}.inv156-remove{border:0;background:transparent;color:#72849a;font-size:21px}.inv156-methods{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:11px}.inv156-methods button{border:1px solid var(--line);border-radius:12px;background:#f7fafc;color:#415a75;padding:9px 5px;font-size:10px;font-weight:900}.inv156-methods button.active{border-color:#66a6df;background:#edf6ff;color:#095ba7}.inv156-methods button[data-method="csv"].active{border-color:#69b995;background:#eefaf5;color:#17634d}
      .inv156-detail{margin-top:10px}.inv156-detail input[type="number"],.inv156-options input[type="number"]{width:100%;border:1px solid var(--line);border-radius:14px;background:#fff;padding:12px;color:var(--ink);font-size:16px}.inv156-file{display:none}.inv156-filelabel{display:flex;justify-content:center;align-items:center;min-height:48px;border:1px dashed #79a7d5;border-radius:14px;background:#f5faff;color:#145b9c;font-weight:900}.inv156-result{margin-top:9px;padding:10px;border-radius:13px;background:#eef8f3;color:#17634d;font-size:10px;font-weight:850;line-height:1.45}.inv156-result.warn{background:#fff6e8;color:#8f5310}.inv156-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:9px}.inv156-metric{padding:9px;border-radius:12px;background:#f4f8fc}.inv156-metric span{display:block;color:var(--muted);font-size:8px}.inv156-metric strong{display:block;margin-top:4px;font-size:12px}
      .inv156-share{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:11px;padding-top:10px;border-top:1px solid #e7edf4}.inv156-share>span{margin-right:auto;color:var(--muted);font-size:11px;font-weight:800}.inv156-share button{border:1px solid var(--line);border-radius:10px;background:#fff;padding:6px 9px;font-size:10px;font-weight:900}.inv156-share button.active{border-color:#74abe0;background:#edf6ff;color:#075ba7}.inv156-share input{width:70px;border:1px solid var(--line);border-radius:10px;padding:6px 8px}
      .inv156-summary{margin-top:13px;padding:14px;border-radius:17px;background:#0d2b4e;color:#fff}.inv156-summary span{display:block;color:#b9cce0;font-size:10px}.inv156-summary strong{display:block;font-size:21px;margin-top:4px}.inv156-summary small{display:block;color:#b9cce0;font-size:9px;margin-top:4px}.inv156-note{margin-top:10px;padding:10px;border-radius:13px;background:#fff7ea;color:#76501b;font-size:10px;line-height:1.45}.inv156-empty{padding:18px;border:1px dashed var(--line);border-radius:16px;text-align:center;color:var(--muted);font-size:12px}.inv156-hidden{display:none!important}
      .inv156-options-hero{padding:15px;border-radius:18px;background:linear-gradient(145deg,#0c2b50,#155d9c);color:#fff}.inv156-options-hero small{color:#bcd3ea}.inv156-options-hero h3{margin:5px 0 0}.inv156-options-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:12px}.inv156-options-card{padding:11px;border-radius:13px;background:#ffffff14;border:1px solid #ffffff24}.inv156-options-card span{display:block;color:#c8dbed;font-size:9px}.inv156-options-card strong{display:block;margin-top:4px;font-size:15px}.inv156-options label{display:block;color:var(--muted);font-size:11px;font-weight:850;margin-top:11px}.inv156-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.inv156-actions label,.inv156-actions button{border:0;border-radius:12px;background:#1674d1;color:#fff;padding:10px 12px;font-weight:900;font-size:11px}.inv156-actions .soft{background:#edf5fd;color:#155994;border:1px solid #a9c9e7}
      .inv156-progress{position:fixed;inset:0;z-index:20000;display:grid;place-items:center;background:#04101dc7}.inv156-progress>div{width:min(390px,calc(100% - 30px));padding:20px;border-radius:20px;background:#0d2745;color:#fff}.inv156-progress span{display:block;margin-top:7px;color:#bcd0e4;font-size:12px}
      @media(max-width:560px){.inv156-grid{grid-template-columns:repeat(2,1fr)}.inv156-methods{grid-template-columns:1fr}.inv156-metrics{grid-template-columns:1fr 1fr}}
    `;document.head.appendChild(style);
  }

  function findInputByLabel(root,regex){
    for(const label of $$('label',root)){if(regex.test(label.textContent||'')){const input=$('input',label)||label.parentElement?.querySelector('input');if(input)return input;}}
    for(const input of $$('input',root)){const text=input.parentElement?.textContent||'';if(regex.test(text))return input;}
    return null;
  }

  function preserveOriginal(root){
    const hidden=document.createElement('div');hidden.className='inv156-hidden';hidden.dataset.invOriginal='1';
    const monthly=findInputByLabel(root,/ingresas.*mes|media.*mes/i);if(monthly)monthly.dataset.inv156MonthlyOriginal='1';
    const candidates=[$('#pValue',root),$('#pWhere',root),$('#pCount',root),$('#pMonthlyContribution',root),$('[data-unknown]',root),monthly];
    [...new Set(candidates.filter(Boolean))].forEach(node=>hidden.appendChild(node));
    return hidden;
  }
  function setInput(root,selector,value){const input=$(selector,root);if(!input)return;input.disabled=false;input.value=String(value??'');input.dispatchEvent(new Event('input',{bubbles:true}));}
  function turnOffUnknown(root){const unknown=$('[data-unknown]',root);if(unknown?.classList.contains('selected'))unknown.click();}

  function actionsMarkup(draft){
    const totals=brokerTotal(draft);
    const shared=globalThis.FFIBKRShared156?.state?.();
    const cards=(draft.brokers||[]).map((broker,index)=>{
      const result=broker.amount!==null&&broker.amount!==''?`<div class="inv156-result">✓ Valor neto confirmado: ${money(broker.amount)} · tu parte ${money(safe(broker.amount)*share(broker.ownership)/100)}</div>`:broker.file?'<div class="inv156-result warn">Archivo seleccionado; falta confirmar su interpretación.</div>':'';
      const sharedMetrics=(broker.id==='ibkr'&&shared)?`<div class="inv156-metrics"><div class="inv156-metric"><span>NAV de la cuenta</span><strong>${money(shared.nav)}</strong></div><div class="inv156-metric"><span>Posiciones</span><strong>${shared.positionsCount}</strong></div><div class="inv156-metric"><span>Opciones realizadas</span><strong>${money(shared.options?.realized)}</strong></div></div>`:'';
      const detail=broker.method==='manual'?`<input type="number" min="0" step="0.01" inputmode="decimal" data-inv156-amount="${esc(broker.id)}" value="${broker.amount??''}" placeholder="Valor neto de la cuenta">`:`<input id="inv156-file-${esc(broker.id)}" class="inv156-file" type="file" accept="${broker.method==='csv'?'.csv,text/csv':'image/*,application/pdf'}" data-inv156-file="${esc(broker.id)}"><label class="inv156-filelabel" for="inv156-file-${esc(broker.id)}">${broker.file?`Cambiar ${broker.method==='csv'?'CSV':'pantallazo'}`:`Seleccionar ${broker.method==='csv'?'CSV':'pantallazo o PDF'}`}</label>`;
      return `<article class="inv156-card" data-inv156-card="${esc(broker.id)}"><div class="inv156-cardhead"><div><small>ENTIDAD ${index+1}</small><b>${esc(broker.name)}</b></div><button class="inv156-remove" data-inv156-remove="${esc(broker.id)}">×</button></div><div class="inv156-methods"><button data-inv156-method="csv" data-id="${esc(broker.id)}" class="${broker.method==='csv'?'active':''}">CSV · recomendado</button><button data-inv156-method="screenshot" data-id="${esc(broker.id)}" class="${broker.method==='screenshot'?'active':''}">Pantallazo</button><button data-inv156-method="manual" data-id="${esc(broker.id)}" class="${broker.method==='manual'?'active':''}">Valor manual</button></div><div class="inv156-detail">${detail}</div>${result}${sharedMetrics}<div class="inv156-share"><span>¿Qué porcentaje te pertenece?</span><button data-inv156-share="100" data-id="${esc(broker.id)}" class="${share(broker.ownership)===100?'active':''}">100 %</button><button data-inv156-share="50" data-id="${esc(broker.id)}" class="${share(broker.ownership)===50?'active':''}">50 %</button><input type="number" min="0" max="100" data-inv156-share-custom="${esc(broker.id)}" value="${share(broker.ownership)}"></div></article>`;
    }).join('');
    return `<p class="kicker">Una entidad cada vez, no una acción cada vez</p><h1>Añade tus <em>brokers.</em></h1><p class="lead">Sube un archivo una sola vez. La app interpretará la cuenta y reutilizará el mismo análisis en acciones y opciones.</p><section class="inv156-section"><div class="inv156-head"><div><b>1. ¿Dónde tienes tus inversiones?</b><span>Selecciona brokers y bancos. No tendrás que introducir acción por acción.</span></div></div><div class="inv156-grid">${BROKERS.map(item=>`<button class="inv156-choice ${(draft.brokers||[]).some(x=>x.id===item.id)?'selected':''}" data-inv156-choice="${item.id}"><span class="inv156-mark">${item.mark}</span><span>${item.name}<small>${(draft.brokers||[]).some(x=>x.id===item.id)?'Añadido':'Toca para añadir'}</small></span></button>`).join('')}</div></section><section class="inv156-section"><div class="inv156-head"><div><b>2. Completa cada entidad</b><span>Para Interactive Brokers, el CSV muestra NAV, posiciones y opciones. El patrimonio usa el NAV, no la exposición bruta.</span></div></div><div class="inv156-list">${cards||'<div class="inv156-empty">Selecciona al menos una entidad.</div>'}</div></section><div class="inv156-summary"><span>Tu cartera atribuible ahora</span><strong>${money(totals.attributable)}</strong><small>Valor bruto conjunto: ${money(totals.gross)}</small></div><div class="inv156-note"><b>Sin doble conteo:</b> las acciones y opciones importadas son el desglose de la cuenta del broker. No se suman otra vez al patrimonio.</div>`;
  }

  function syncActions(root,draft){
    const totals=brokerTotal(draft);turnOffUnknown(root);setInput(root,'#pValue',totals.attributable);setInput(root,'#pWhere',(draft.brokers||[]).map(x=>x.name).join(', '));setInput(root,'#pCount',Math.max(1,(draft.brokers||[]).length));setInput(root,'#pMonthlyContribution',safe(draft.monthlyContribution));
  }

  function renderActions(root){
    const hidden=root.querySelector('[data-inv-original]')||preserveOriginal(root);
    let draft=loadDraft();const shared=globalThis.FFIBKRShared156?.state?.();
    if(shared&&!draft.brokers.some(x=>x.id==='ibkr'))draft.brokers.push({id:'ibkr',name:'Interactive Brokers',mark:'IB',amount:shared.nav,ownership:shared.ownership||100,method:'csv',file:shared.file,sourceStatus:'csv-confirmed',asOf:shared.asOf,metadata:{positionsCount:shared.positionsCount}});
    root.dataset.ffBrokerV155='1';root.dataset.inv156='actions';root.classList.add('inv156');root.innerHTML=actionsMarkup(draft);root.appendChild(hidden);saveDraft(draft);syncActions(root,draft);
    const rerender=()=>renderActions(root);
    $$('[data-inv156-choice]',root).forEach(button=>button.onclick=()=>{const id=button.dataset.inv156Choice;draft=loadDraft();const index=draft.brokers.findIndex(x=>x.id===id);if(index>=0)draft.brokers.splice(index,1);else{const template=BROKERS.find(x=>x.id===id);const name=id==='other'?prompt('Nombre del broker o banco')?.trim():template?.name;if(!name)return;draft.brokers.push({id:id==='other'?`other-${slug(name)}-${Date.now()}`:id,name,mark:template?.mark||name.slice(0,3).toUpperCase(),amount:null,ownership:100,method:id==='ibkr'?'csv':'manual',file:null,sourceStatus:'',asOf:'',metadata:{}});}saveDraft(draft);rerender();});
    $$('[data-inv156-remove]',root).forEach(button=>button.onclick=()=>{draft=loadDraft();draft.brokers=draft.brokers.filter(x=>x.id!==button.dataset.inv156Remove);saveDraft(draft);rerender();});
    $$('[data-inv156-method]',root).forEach(button=>button.onclick=()=>{draft=loadDraft();const broker=draft.brokers.find(x=>x.id===button.dataset.id);if(!broker)return;broker.method=button.dataset.inv156Method;saveDraft(draft);rerender();if(broker.method!=='manual')setTimeout(()=>root.querySelector(`[data-inv156-file="${CSS.escape(broker.id)}"]`)?.click(),40);});
    $$('[data-inv156-amount]',root).forEach(input=>input.oninput=()=>{draft=loadDraft();const broker=draft.brokers.find(x=>x.id===input.dataset.inv156Amount);if(!broker)return;broker.amount=input.value===''?null:safe(input.value);broker.sourceStatus='manual-confirmed';broker.asOf=new Date().toISOString().slice(0,10);saveDraft(draft);syncActions(root,draft);$('.inv156-summary strong',root).textContent=money(brokerTotal(draft).attributable);$('.inv156-summary small',root).textContent=`Valor bruto conjunto: ${money(brokerTotal(draft).gross)}`;});
    $$('[data-inv156-share]',root).forEach(button=>button.onclick=()=>{draft=loadDraft();const broker=draft.brokers.find(x=>x.id===button.dataset.id);if(!broker)return;broker.ownership=share(button.dataset.inv156Share);saveDraft(draft);rerender();});
    $$('[data-inv156-share-custom]',root).forEach(input=>input.oninput=()=>{draft=loadDraft();const broker=draft.brokers.find(x=>x.id===input.dataset.inv156ShareCustom);if(!broker)return;broker.ownership=share(input.value);saveDraft(draft);syncActions(root,draft);});
    $$('[data-inv156-file]',root).forEach(input=>input.onchange=async()=>{const file=input.files?.[0];if(!file)return;draft=loadDraft();const broker=draft.brokers.find(x=>x.id===input.dataset.inv156File);if(!broker)return;const progress=showProgress('Interpretando el archivo…');try{if(broker.id==='ibkr'||/interactive brokers/i.test(broker.name)){const result=await globalThis.FFIBKRShared156.importFile(file);broker.amount=result.nav;broker.file=result.file;broker.method='csv';broker.sourceStatus='csv-confirmed';broker.asOf=result.asOf;broker.metadata={positionsCount:result.positionsCount,optionsRealized:result.options.realized,openOptionsCount:result.options.openCount};}else if(broker.method==='csv'){const text=await file.text();const result=globalThis.FFBrokerImport155.detectGenericTotal(text);broker.amount=result.amount;broker.file={name:file.name,type:file.type,size:file.size};broker.sourceStatus=result.amount===null?'csv-pending':'csv-confirmed';}else{broker.file={name:file.name,type:file.type,size:file.size};broker.sourceStatus='screenshot-pending';alert('Pantallazo guardado. En esta pantalla puedes confirmar el valor manualmente.');broker.method='manual';}saveDraft(draft);}catch(error){console.warn('[v15.6 inversiones]',error);alert(error.message||'No se pudo interpretar el archivo');}finally{progress.remove();rerender();}});
  }

  function optionsMarkup(shared){
    if(!shared)return `<p class="kicker">Importa una vez y reutiliza el dato</p><h1>Completa tus <em>opciones.</em></h1><p class="lead">Sube el Activity Statement de Interactive Brokers. La app lo utilizará también para la cartera de acciones.</p><section class="inv156-section inv156-options"><div class="inv156-empty">Todavía no hay un CSV de IBKR interpretado.</div><div class="inv156-actions"><label for="inv156OptionsFile">Seleccionar CSV de IBKR</label><input id="inv156OptionsFile" class="inv156-file" type="file" accept=".csv,text/csv"></div></section>`;
    const capital=safe(shared.preferences?.capitalReference??shared.capitalReference??shared.nav),avg=safe(shared.preferences?.monthlyOptionsReference??shared.options?.monthlyAverage);
    return `<p class="kicker">El mismo archivo, dos análisis</p><h1>Tu estrategia de <em>opciones.</em></h1><p class="lead">Hemos reutilizado el CSV de Interactive Brokers que ya cargaste en acciones.</p><section class="inv156-options-hero"><small>${esc(shared.file?.name||'Activity Statement')} · ${esc(shared.period?.label||shared.asOf||'')}</small><h3>Interpretación del CSV</h3><div class="inv156-options-grid"><div class="inv156-options-card"><span>NAV de la cuenta</span><strong>${money(shared.nav)}</strong></div><div class="inv156-options-card"><span>Opciones realizadas</span><strong>${money(shared.options?.realized)}</strong></div><div class="inv156-options-card"><span>Media mensual bruta</span><strong>${money(shared.options?.monthlyAverage)}</strong></div><div class="inv156-options-card"><span>Posiciones abiertas</span><strong>${shared.options?.openCount||0}</strong></div><div class="inv156-options-card"><span>Exposición por puts abiertas</span><strong>${money(shared.options?.assignmentExposure)}</strong></div><div class="inv156-options-card"><span>Operaciones detectadas</span><strong>${shared.options?.tradesCount||0}</strong></div></div></section><section class="inv156-section inv156-options"><div class="inv156-head"><div><b>Confirma las referencias del onboarding</b><span>El CSV no incluye “fondos disponibles” ni “buying power”. El NAV no equivale al efectivo libre.</span></div></div><label>Capital de referencia para opciones<input id="inv156OptionCapital" type="number" min="0" step="0.01" value="${capital}"></label><label>Resultado bruto medio mensual del periodo<input id="inv156OptionMonthly" type="number" step="0.01" value="${avg}"></label><div class="inv156-note"><b>Resultado bruto:</b> esta media procede solo de las opciones realizadas del CSV. El resultado ajustado por pérdidas de acciones asignadas se calculará en el módulo avanzado y no se sustituye silenciosamente.</div><div class="inv156-actions"><label for="inv156OptionsFile">Cambiar CSV</label><input id="inv156OptionsFile" class="inv156-file" type="file" accept=".csv,text/csv"><button class="soft" id="inv156UseOptions">Usar este análisis</button></div></section>`;
  }

  function syncOptions(root,shared){if(!shared)return;const capital=safe($('#inv156OptionCapital',root)?.value||shared.preferences?.capitalReference||shared.nav);const monthly=Number($('#inv156OptionMonthly',root)?.value||shared.options?.monthlyAverage||0);turnOffUnknown(root);setInput(root,'#pValue',capital);setInput(root,'#pWhere','Interactive Brokers');setInput(root,'#pCount',1);const monthlyInput=$('[data-inv156-monthly-original]',root)||findInputByLabel(root,/ingresas.*mes|media.*mes/i);if(monthlyInput){monthlyInput.disabled=false;monthlyInput.value=String(monthly);monthlyInput.dispatchEvent(new Event('input',{bubbles:true}));}}

  function renderOptions(root){
    const hidden=root.querySelector('[data-inv-original]')||preserveOriginal(root);const shared=globalThis.FFIBKRShared156?.state?.();root.dataset.inv156='options';root.classList.add('inv156');root.innerHTML=optionsMarkup(shared);root.appendChild(hidden);if(shared)syncOptions(root,shared);
    const file=$('#inv156OptionsFile',root);if(file)file.onchange=async()=>{const selected=file.files?.[0];if(!selected)return;const progress=showProgress('Interpretando acciones y opciones…');try{await globalThis.FFIBKRShared156.importFile(selected);}catch(error){alert(error.message||'No se pudo interpretar el CSV');}finally{progress.remove();renderOptions(root);}};
    $('#inv156OptionCapital',root)?.addEventListener('input',()=>{const current=globalThis.FFIBKRShared156.state();globalThis.FFIBKRShared156.updatePreferences({preferences:{capitalReference:safe($('#inv156OptionCapital',root).value)}});syncOptions(root,current);});
    $('#inv156OptionMonthly',root)?.addEventListener('input',()=>{globalThis.FFIBKRShared156.updatePreferences({preferences:{monthlyOptionsReference:Number($('#inv156OptionMonthly',root).value||0)}});syncOptions(root,globalThis.FFIBKRShared156.state());});
    $('#inv156UseOptions',root)?.addEventListener('click',event=>{event.preventDefault();syncOptions(root,globalThis.FFIBKRShared156.state());const next=$('#portraitNext');next?.classList.add('ready');});
  }

  function showProgress(text){const node=document.createElement('div');node.className='inv156-progress';node.innerHTML=`<div><b>${esc(text)}</b><span>Procesando el archivo en este dispositivo.</span></div>`;document.body.appendChild(node);return node;}

  function patch(){
    const root=$('#portraitContent');if(!root)return;const title=$('h1',root)?.textContent||'';
    if(/acciones/i.test(title)&&root.dataset.inv156!=='actions'){renderActions(root);const next=$('#portraitNext');if(next)next.innerHTML='Añadir brokers al mapa <span>→</span>';}
    else if(/opciones/i.test(title)&&root.dataset.inv156!=='options'){renderOptions(root);const next=$('#portraitNext');if(next)next.innerHTML='Añadir estrategia al mapa <span>→</span>';}
  }

  function linkOptionsWithoutDoubleCount(){
    const payload=read(BASE_STORE,null),shared=globalThis.FFIBKRShared156?.state?.();if(!payload?.onboardingComplete||!shared)return false;
    const broker=(payload.items||[]).find(item=>item.type==='stocks'&&/interactive brokers/i.test(`${item.name||''} ${item.institution||''}`));
    if(!broker)return false;let changed=false;
    for(const item of payload.items||[]){if(item.type!=='options')continue;const capital=safe(item.strategyCapital||item.value||shared.preferences?.capitalReference||shared.nav);if(item.linkedAccountId!==broker.id||item.value!==0||item.strategyCapital!==capital){item.strategyCapital=capital;item.monthlyGrossOptions=shared.preferences?.monthlyOptionsReference??shared.options?.monthlyAverage??0;item.linkedAccountId=broker.id;item.linkedAccountName=broker.name;item.excludeFromNetWorth=true;item.value=0;item.source='imported';item.sourceLabel='Incluido dentro de Interactive Brokers';item.metadata={...(item.metadata||{}),ibkrFile:shared.file?.name,optionsRealized:shared.options?.realized,assignmentExposure:shared.options?.assignmentExposure,openOptionsCount:shared.options?.openCount};changed=true;}}
    if(changed)write(BASE_STORE,payload);return changed;
  }

  function patchOptionDisplays(){const payload=read(BASE_STORE,null);const option=(payload?.items||[]).find(item=>item.type==='options'&&item.strategyCapital);if(!option)return;$$('[data-map5-category="options"]').forEach(node=>{const small=$('small',node);if(small)small.textContent=`${money(option.strategyCapital)} vinculados a IBKR`;const strong=$('.map5-category-value strong',node);if(strong)strong.textContent=money(option.strategyCapital);});}

  injectStyles();
  globalThis.addEventListener('ff:ibkr-shared-updated',()=>{const root=$('#portraitContent');if(root){delete root.dataset.inv156;patch();}});
  new MutationObserver(()=>requestAnimationFrame(()=>{patch();patchOptionDisplays();})).observe(document.documentElement,{childList:true,subtree:true});
  setInterval(()=>{patch();linkOptionsWithoutDoubleCount();patchOptionDisplays();},300);
  setTimeout(patch,40);
  globalThis.FFInvestmentOnboarding156={version:VERSION,patch,linkOptionsWithoutDoubleCount};
})();
