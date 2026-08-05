(()=>{
  'use strict';
  const A=window.FFLab;
  if(!A||A.__ADJUSTED_1520__)return;
  A.__ADJUSTED_1520__=true;
  A.VERSION='15.20-lab';

  const STORE_KEY='ff_options_adjusted_v1520';
  const PREF_KEY='ff_options_adjusted_prefs_v1520';
  const DB_NAME='ff_private_files_v1';
  const DB_STORE='files';
  const oldOptionsView=A.views.options;
  const num=v=>A.n(v);
  const datePart=v=>String(v||'').slice(0,10);
  const normal=v=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
  const codeHas=(row,token)=>String(row?.code||'').split(';').includes(token);
  const yearOf=v=>{const y=Number(datePart(v).slice(0,4));return y>=2000&&y<=2100?y:0};
  const signedMoney=v=>`${num(v)>0?'+ ':num(v)<0?'− ':''}${A.display(A.euro(Math.abs(num(v)),2))}`;

  function emptyStore(){return{version:'15.20',optionTrades:[],stockTrades:[],stockOpen:[],openOptions:[],stockOpening:{},openingStart:'',snapshotEnd:'',navSnapshots:[],files:[],scannedIds:[],updatedAt:''}}
  function loadStore(){return{...emptyStore(),...(A.read(STORE_KEY,null)||{})}}
  function saveStore(store){store.updatedAt=A.now();A.write(STORE_KEY,store);return store}
  function prefs(){return{selectedYear:0,...(A.read(PREF_KEY,null)||{})}}
  function setPrefs(patch){A.write(PREF_KEY,{...prefs(),...(patch||{})})}

  function machine(v){const s=String(v??'').trim().replace(/,/g,'');if(!s||s==='--')return 0;const x=Number(s);return Number.isFinite(x)?x:0}
  function parseCSV(text){
    const source=String(text||''),first=source.split(/\r?\n/,1)[0]||'',counts={',':(first.match(/,/g)||[]).length,';':(first.match(/;/g)||[]).length,'\t':(first.match(/\t/g)||[]).length},delimiter=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0]||',';
    const rows=[];let row=[],field='',quoted=false;
    for(let i=0;i<source.length;i++){const c=source[i];if(quoted){if(c==='"'&&source[i+1]==='"'){field+='"';i++}else if(c==='"')quoted=false;else field+=c}else if(c==='"')quoted=true;else if(c===delimiter){row.push(field);field=''}else if(c==='\n'){row.push(field.replace(/\r$/,''));rows.push(row);row=[];field=''}else field+=c}
    if(field||row.length){row.push(field.replace(/\r$/,''));rows.push(row)}return rows;
  }
  const MONTHS={enero:0,febrero:1,marzo:2,abril:3,mayo:4,junio:5,julio:6,agosto:7,septiembre:8,setiembre:8,octubre:9,noviembre:10,diciembre:11,january:0,february:1,march:2,april:3,may:4,june:5,july:6,august:7,september:8,october:9,november:10,december:11};
  function parsePeriodDate(value){const s=String(value||'').trim(),iso=s.match(/^(\d{4})-(\d{2})-(\d{2})$/);if(iso)return`${iso[1]}-${iso[2]}-${iso[3]}`;const m=s.match(/^([A-Za-zÁÉÍÓÚáéíóúñÑ]+)\s+(\d{1,2}),\s*(\d{4})$/);if(!m)return'';const month=MONTHS[normal(m[1])];return month===undefined?'':`${m[3]}-${String(month+1).padStart(2,'0')}-${String(Number(m[2])).padStart(2,'0')}`}
  function parsePeriod(value){const p=String(value||'').split(/\s+-\s+/);return{label:String(value||''),start:parsePeriodDate(p[0]),end:parsePeriodDate(p[1])}}
  function symbolParts(symbol){const m=String(symbol||'').match(/^([A-Z0-9.]+)\s+(\d{2}[A-Z]{3}\d{2})\s+([\d.]+)\s+([PC])$/);return m?{underlying:m[1],expiry:m[2],strike:machine(m[3]),right:m[4]}:{underlying:String(symbol||'').split(' ')[0]||'',expiry:'',strike:0,right:''}}
  function isOptions(asset){const s=normal(asset);return s.includes('opcion')||s.includes('option')}
  function isStocks(asset){const s=normal(asset);return s==='acciones'||s==='accion'||s==='stocks'||s==='stock'}

  function parseReport(text,file={}){
    const rows=parseCSV(text),optionTrades=[],stockTrades=[],stockOpen=[],openOptions=[],stockOpening={};
    let period={label:'',start:'',end:''},nav=0,baseCurrency='EUR',generatedAt='';
    for(const r of rows){
      const section=normal(r[0]),format=normal(r[1]);
      if(section==='statement'&&format==='data'&&r[2]==='Period')period=parsePeriod(r[3]);
      if(section==='statement'&&format==='data'&&r[2]==='WhenGenerated')generatedAt=r[3]||'';
      if((section==='informacion sobre la cuenta'||section==='account information')&&format==='data'&&normal(r[2]).includes('divisa base'))baseCurrency=r[3]||baseCurrency;
      if((section==='informacion sobre la cuenta'||section==='account information')&&format==='data'&&normal(r[2]).includes('base currency'))baseCurrency=r[3]||baseCurrency;
      if((section==='valor liquidativo'||section==='net asset value')&&format==='data'&&normal(r[2])==='total')nav=machine(r[6]??r[5]??r[3]);
      if((section==='operaciones'||section==='trades')&&format==='data'&&isOptions(r[3])){const p=symbolParts(r[5]);optionTrades.push({...p,symbol:r[5]||'',currency:r[4]||baseCurrency,date:r[6]||'',quantity:machine(r[7]),price:machine(r[8]),closePrice:machine(r[9]),proceeds:machine(r[10]),commission:machine(r[11]),basis:machine(r[12]),realized:machine(r[13]),mtm:machine(r[14]),code:r[15]||''})}
      if((section==='operaciones'||section==='trades')&&format==='data'&&isStocks(r[3])&&r[5])stockTrades.push({symbol:r[5],currency:r[4]||baseCurrency,date:r[6]||'',quantity:machine(r[7]),price:machine(r[8]),closePrice:machine(r[9]),proceeds:machine(r[10]),commission:machine(r[11]),basis:machine(r[12]),realized:machine(r[13]),mtm:machine(r[14]),code:r[15]||''});
      if((section==='posiciones abiertas'||section==='open positions')&&format==='data'&&isStocks(r[3])&&r[5])stockOpen.push({symbol:r[5],currency:r[4]||baseCurrency,quantity:machine(r[6]),multiplier:machine(r[7])||1,costPrice:machine(r[8]),costBasis:machine(r[9]),closePrice:machine(r[10]),value:machine(r[11]),unrealized:machine(r[12]),code:r[13]||''});
      if((section==='posiciones abiertas'||section==='open positions')&&format==='data'&&isOptions(r[3])&&r[5]){const p=symbolParts(r[5]);openOptions.push({...p,symbol:r[5],currency:r[4]||baseCurrency,quantity:machine(r[6]),multiplier:machine(r[7])||100,costPrice:machine(r[8]),costBasis:machine(r[9]),closePrice:machine(r[10]),value:machine(r[11]),unrealized:machine(r[12]),code:r[13]||''})}
      if((section.includes('resumen rendimiento valoracion al mercado')||section.includes('mark-to-market performance summary'))&&format==='data'&&isStocks(r[2])&&r[3])stockOpening[r[3]]={symbol:r[3],quantity:machine(r[4]),currentQuantity:machine(r[5]),previousPrice:machine(r[6]),currentPrice:machine(r[7])};
    }
    if(!optionTrades.length&&!stockTrades.length&&!openOptions.length&&!nav)throw new Error('El CSV no parece un Activity Statement completo de Interactive Brokers');
    return{file:{id:file.id||'',name:file.name||'IBKR.csv',size:file.size||0,lastModified:file.lastModified||0},rows:rows.length,period,nav,baseCurrency,generatedAt,optionTrades,stockTrades,stockOpen,openOptions,stockOpening};
  }

  const optionKey=t=>[t.symbol,datePart(t.date),t.quantity,t.price,t.proceeds,t.commission,t.realized,t.code].join('|');
  const stockKey=t=>[t.symbol,String(t.date||''),t.quantity,t.price,t.proceeds,t.commission,t.realized,t.code].join('|');
  function mergeUnique(current,incoming,keyFn){const map=new Map();[...(current||[]),...(incoming||[])].forEach(x=>{const k=keyFn(x);if(!map.has(k))map.set(k,x)});return[...map.values()].sort((a,b)=>String(a.date||'').localeCompare(String(b.date||'')))}
  function mergeReport(store,report){
    store.optionTrades=mergeUnique(store.optionTrades,report.optionTrades,optionKey);
    store.stockTrades=mergeUnique(store.stockTrades,report.stockTrades,stockKey);
    const start=report.period?.start||'';if(Object.keys(report.stockOpening||{}).length&&(!store.openingStart||start&&start<store.openingStart)){store.stockOpening=report.stockOpening;store.openingStart=start}
    const end=report.period?.end||'';if((report.stockOpen.length||report.openOptions.length)&&(!store.snapshotEnd||end&&end>=store.snapshotEnd)){store.stockOpen=report.stockOpen;store.openOptions=report.openOptions;store.snapshotEnd=end}
    if(report.nav>0&&end){const key=end;store.navSnapshots=(store.navSnapshots||[]).filter(x=>x.end!==key);store.navSnapshots.push({end,start:report.period?.start||'',label:report.period?.label||'',nav:report.nav,file:report.file.name,generatedAt:report.generatedAt||''});store.navSnapshots.sort((a,b)=>a.end.localeCompare(b.end))}
    const fileKey=report.file.id||`${report.file.name}|${report.file.size}|${report.file.lastModified}`;if(!store.files.some(x=>x.key===fileKey))store.files.push({key:fileKey,name:report.file.name,period:report.period,nav:report.nav,rows:report.rows,addedAt:A.now()});
    return store;
  }

  function seedFromExisting(){
    const store=loadStore(),safe=A.read('ff_options_safe_v9',null),shared=A.read('ff_ibkr_shared_v156',null);
    if(safe){store.optionTrades=mergeUnique(store.optionTrades,safe.trades||[],optionKey);store.stockTrades=mergeUnique(store.stockTrades,safe.stockTrades||[],stockKey);if(Object.keys(safe.stockOpening||{}).length&&!Object.keys(store.stockOpening||{}).length)store.stockOpening=safe.stockOpening;if((safe.stockOpen||[]).length&&(!store.snapshotEnd||String(safe.lastReliableStockSnapshot?.period?.end||'')>=store.snapshotEnd)){store.stockOpen=safe.stockOpen;store.snapshotEnd=safe.lastReliableStockSnapshot?.period?.end||store.snapshotEnd}if((safe.open||[]).length&&!store.openOptions.length)store.openOptions=safe.open;const end=safe.lastReliableStockSnapshot?.period?.end||safe.imports?.map(x=>x.period?.end).filter(Boolean).sort().at(-1)||'';const nav=num(safe.accountSnapshot?.nav);if(nav>0&&end&&!store.navSnapshots.some(x=>x.end===end))store.navSnapshots.push({end,start:safe.stockBaseline?.period?.start||'',label:'Histórico fusionado',nav,file:safe.summary?.file||'IBKR',generatedAt:safe.accountSnapshot?.generatedAt||''})}
    if(shared?.nav>0){const end=shared.period?.end||shared.asOf||'';if(end){store.navSnapshots=store.navSnapshots.filter(x=>x.end!==end);store.navSnapshots.push({end,start:shared.period?.start||'',label:shared.period?.label||'',nav:num(shared.nav),file:shared.file?.name||'IBKR',generatedAt:shared.generatedAt||''})}}
    store.navSnapshots.sort((a,b)=>a.end.localeCompare(b.end));return saveStore(store);
  }

  function assignmentLedger(store){
    const opening=store.stockOpening||{},prices=new Map((store.stockOpen||[]).map(p=>[p.symbol,{price:num(p.closePrice)||(num(p.value)&&num(p.quantity)?num(p.value)/num(p.quantity):0)}])),lotsByTicker={},assigned=[];
    Object.values(opening).forEach(p=>{const q=Math.max(0,num(p.quantity));if(q)(lotsByTicker[p.symbol]??=[]).push({remaining:q,costPerShare:null,assigned:false,year:0,unknown:true})});
    [...(store.stockTrades||[])].sort((a,b)=>String(a.date).localeCompare(String(b.date))).forEach(t=>{
      const qty=num(t.quantity),symbol=t.symbol;if(!qty||!symbol)return;const lots=(lotsByTicker[symbol]??=[]);
      if(qty>0){const isAssigned=codeHas(t,'A'),cashCost=Math.max(0,-(num(t.proceeds)+num(t.commission))),lot={id:`${symbol}|${t.date}|${qty}|${t.price}`,symbol,remaining:qty,initialQty:qty,costPerShare:qty?cashCost/qty:num(t.price),assigned:isAssigned,year:isAssigned?yearOf(t.date):0,date:t.date,realized:0,unrealized:0,closedAt:'',confidence:isAssigned?'high':'normal'};lots.push(lot);if(isAssigned)assigned.push(lot);return}
      let left=Math.abs(qty),total=left;const netProceeds=num(t.proceeds)+num(t.commission);
      for(const lot of lots){if(left<=1e-9)break;const take=Math.min(lot.remaining,left);if(take<=0)continue;const allocated=netProceeds*(take/total);if(lot.assigned){const cost=(lot.costPerShare||0)*take;lot.realized+=allocated-cost;if(Math.abs(lot.remaining-take)<1e-9)lot.closedAt=t.date}lot.remaining-=take;left-=take}
    });
    assigned.forEach(lot=>{if(lot.remaining>1e-9){const px=prices.get(lot.symbol)?.price||0;lot.unrealized=px?lot.remaining*px-lot.remaining*(lot.costPerShare||0):0;if(!px)lot.confidence='medium'}});
    const byYear={};assigned.forEach(lot=>{if(!lot.year)return;const y=byYear[lot.year]??={year:lot.year,assignedLots:0,assignedShares:0,openShares:0,stockRealized:0,stockUnrealized:0,missingPrices:0};y.assignedLots+=1;y.assignedShares+=lot.initialQty;y.openShares+=lot.remaining;y.stockRealized+=lot.realized;y.stockUnrealized+=lot.unrealized;if(lot.remaining>0&&lot.confidence==='medium')y.missingPrices+=1});return{lots:assigned,byYear};
  }

  function yearsData(){
    const store=seedFromExisting(),ledger=assignmentLedger(store),shared=A.read('ff_ibkr_shared_v156',null),safe=A.read('ff_options_safe_v9',null),byYear={};
    const touch=year=>byYear[year]??={year,realized:0,trades:0,stockRealized:0,stockUnrealized:0,assignedLots:0,assignedShares:0,openShares:0,missingPrices:0,nav:0,navDate:'',periodStart:'',periodEnd:'',files:[]};
    (store.optionTrades||[]).forEach(t=>{const y=yearOf(t.date);if(!y)return;const r=touch(y);r.realized+=num(t.realized);r.trades+=1;const d=datePart(t.date);if(!r.periodStart||d<r.periodStart)r.periodStart=d;if(!r.periodEnd||d>r.periodEnd)r.periodEnd=d});
    Object.values(ledger.byYear).forEach(x=>{const r=touch(Number(x.year));Object.assign(r,{stockRealized:x.stockRealized,stockUnrealized:x.stockUnrealized,assignedLots:x.assignedLots,assignedShares:x.assignedShares,openShares:x.openShares,missingPrices:x.missingPrices})});
    (store.navSnapshots||[]).forEach(s=>{const y=yearOf(s.end);if(!y)return;const r=touch(y);if(!r.navDate||s.end>=r.navDate){r.nav=num(s.nav);r.navDate=s.end;r.files=[s.file].filter(Boolean);if(s.start)r.periodStart=!r.periodStart||s.start<r.periodStart?s.start:r.periodStart;if(s.end)r.periodEnd=!r.periodEnd||s.end>r.periodEnd?s.end:r.periodEnd}});
    const fallbackYear=yearOf(shared?.period?.end||shared?.asOf||'');if(fallbackYear){const r=touch(fallbackYear);if(!store.optionTrades.length)r.realized=num(shared?.options?.realized);if(!r.trades)r.trades=num(shared?.options?.tradesCount);if(!r.nav)r.nav=num(shared?.nav)}
    if(!Object.keys(byYear).length&&safe?.summary?.realized){const y=new Date().getFullYear(),r=touch(y);r.realized=num(safe.summary.realized);r.trades=num(safe.summary.tradeCount);r.nav=num(shared?.nav)}
    Object.values(byYear).forEach(r=>{r.assignmentEffect=r.stockRealized+r.stockUnrealized;r.adjusted=r.realized+r.assignmentEffect;r.adjustedPct=r.nav?r.adjusted/r.nav*100:null});
    return{store,ledger,years:Object.values(byYear).sort((a,b)=>b.year-a.year)};
  }

  function periodLabel(row){const nowYear=new Date().getFullYear();if(row.year===nowYear)return`${row.year} · YTD${row.periodEnd?` hasta ${new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'short'}).format(new Date(row.periodEnd+'T12:00:00'))}`:''}`;if(row.periodStart&&row.periodEnd)return`${row.year} · ${row.periodStart.slice(5)} a ${row.periodEnd.slice(5)}`;return String(row.year)}
  function selectedAnalysis(){const all=yearsData(),wanted=Number(prefs().selectedYear),selected=all.years.find(x=>x.year===wanted)||all.years[0]||null;if(selected&&selected.year!==wanted)setPrefs({selectedYear:selected.year});return{...all,selected}}
  A.adjustedOptionsAnalysis=selectedAnalysis;

  function lowerApprovedScreen(){
    try{const doc=new DOMParser().parseFromString(`<div id="root">${oldOptionsView?oldOptionsView():''}</div>`,'text/html'),root=doc.querySelector('#root');return[...root.querySelectorAll('.options-panels,.option-positions-section,.notice')].map(x=>x.outerHTML).join('')}catch(_){return''}
  }
  function historyRows(rows,selectedYear){return rows.map(r=>`<button class="history-row ${r.year===selectedYear?'active':''}" data-action="select-options-year" data-year="${r.year}"><span><b>${r.year}</b><small>${r.year===new Date().getFullYear()?'Año en curso':'Histórico'}${r.navDate?` · cartera a ${r.navDate}`:''}</small></span><span><small>Realizadas</small><b>${A.display(A.euro(r.realized,2))}</b></span><span class="${r.assignmentEffect<0?'loss':'gain'}"><small>Efecto asignaciones</small><b>${signedMoney(r.assignmentEffect)}</b></span><span class="adjusted-cell"><small>Ajustadas</small><b>${A.display(A.euro(r.adjusted,2))}</b></span><span><small>% cartera</small><b>${r.adjustedPct===null?'—':A.pct(r.adjustedPct,1)}</b></span></button>`).join('')}

  A.views.options=()=>{
    const analysis=selectedAnalysis(),r=analysis.selected;
    if(!r)return`<div class="page-head"><div><p class="eyebrow">OPCIONES</p><h1>Resultado real de tu operativa.</h1><p>Sube un Activity Statement para calcular primas, asignaciones y rentabilidad ajustada.</p></div><button class="primary-btn" data-action="import-options-history">Subir CSV</button></div><section class="section"><div class="empty">No hay operaciones históricas suficientes.</div></section>`;
    const years=analysis.years,assignmentTone=r.assignmentEffect<0?'negative':'positive',confidence=r.assignedLots===0?'Sin asignaciones detectadas':r.missingPrices?'Cálculo parcial: faltan precios actuales':'Calculado automáticamente por FIFO';
    return `<div class="page-head adjusted-page-head"><div><p class="eyebrow">OPCIONES · RESULTADO HONESTO</p><h1>¿Qué habría pasado viviendo solo de las opciones?</h1><p>${periodLabel(r)} · primas realizadas más la ganancia o pérdida de las acciones recibidas por asignación.</p></div><div class="page-actions"><button class="soft-btn" data-action="edit-option-rules">Reglas</button><button class="primary-btn" data-action="import-options-history">Añadir CSV</button></div></div>
      <div class="year-strip">${years.map(y=>`<button class="year-chip ${y.year===r.year?'active':''}" data-action="select-options-year" data-year="${y.year}"><b>${y.year}</b><small>${y.year===new Date().getFullYear()?'YTD':'Histórico'}</small></button>`).join('')}</div>
      <section class="adjusted-options-hero"><div><span class="hero-badge"><i></i>${r.year===new Date().getFullYear()?'AÑO EN CURSO':'AÑO COMPLETADO'}</span><p class="hero-label">OPCIONES REALIZADAS AJUSTADAS</p><h2>${A.display(A.euro(r.adjusted,2))}</h2><p>${A.display(A.euro(r.realized,2))} realizadas ${r.assignmentEffect>=0?'+':'−'} ${A.display(A.euro(Math.abs(r.assignmentEffect),2))} por acciones asignadas.</p></div><div class="adjusted-rate"><span>Sobre la cartera IBKR</span><strong>${r.adjustedPct===null?'—':A.pct(r.adjustedPct,1)}</strong><small>${r.nav?`${A.display(A.euro(r.nav))} de cartera a ${r.navDate||'fin del periodo'}`:'Falta NAV del periodo'}</small></div></section>
      <div class="honest-kpis"><article><span>Opciones realizadas</span><strong>${A.display(A.euro(r.realized,2))}</strong><small>${r.trades} apuntes de opciones</small></article><article class="${assignmentTone}"><span>Ganancia/pérdida por asignaciones</span><strong>${signedMoney(r.assignmentEffect)}</strong><small>${r.assignedLots} lotes · ${new Intl.NumberFormat('es-ES',{maximumFractionDigits:0}).format(r.openShares)} acciones aún abiertas</small></article><article class="accent"><span>Realizadas ajustadas</span><strong>${A.display(A.euro(r.adjusted,2))}</strong><small>Prima + resultado de acciones asignadas</small></article><article><span>Ajustadas / cartera</span><strong>${r.adjustedPct===null?'—':A.pct(r.adjustedPct,1)}</strong><small>Sobre el NAV final del periodo</small></article></div>
      <section class="assignment-audit"><div class="audit-head"><div><p class="eyebrow">AJUSTE AUTOMÁTICO</p><h2>Impacto de las asignaciones</h2></div><span class="audit-status ${r.missingPrices?'watch':'ok'}">${confidence}</span></div><div class="audit-grid"><div><span>Acciones ya vendidas</span><strong>${signedMoney(r.stockRealized)}</strong><small>Resultado realizado por FIFO</small></div><div><span>Acciones todavía abiertas</span><strong>${signedMoney(r.stockUnrealized)}</strong><small>Valoradas al último precio del CSV</small></div><div><span>Total del ajuste</span><strong>${signedMoney(r.assignmentEffect)}</strong><small>Se suma o resta a las primas</small></div></div><p>Solo se atribuyen compras de acciones marcadas por IBKR como asignación. Las ventas posteriores se emparejan por FIFO, respetando las acciones que ya existían antes.</p></section>
      <section class="section history-section"><div class="section-head"><div><h2>Comparación por años</h2><p>Cada CSV amplía el histórico. El porcentaje usa el valor de la cuenta al final de cada periodo disponible.</p></div><span class="file-chip">${analysis.store.files.length} CSV analizados</span></div><div class="history-list">${historyRows(years,r.year)}</div></section>
      ${lowerApprovedScreen()}`;
  };

  function openDB(){return new Promise((resolve,reject)=>{if(!('indexedDB'in window))return reject(new Error('IndexedDB no disponible'));const req=indexedDB.open(DB_NAME,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(DB_STORE))req.result.createObjectStore(DB_STORE,{keyPath:'id'})};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
  async function allStoredFiles(){const db=await openDB();const rows=await new Promise((resolve,reject)=>{const tx=db.transaction(DB_STORE,'readonly'),store=tx.objectStore(DB_STORE);if(store.getAll){const q=store.getAll();q.onsuccess=()=>resolve(q.result||[]);q.onerror=()=>reject(q.error)}else{const out=[],q=store.openCursor();q.onsuccess=e=>{const c=e.target.result;if(c){out.push(c.value);c.continue()}else resolve(out)};q.onerror=()=>reject(q.error)}});db.close();return rows}
  async function persistFile(file){try{const db=await openDB(),id=`ibkr-lab-${globalThis.crypto?.randomUUID?.()||Math.random().toString(36).slice(2)}`,record={id,name:file.name,type:file.type,size:file.size,lastModified:file.lastModified,brokerId:'ibkr',brokerName:'Interactive Brokers',category:'csv',blob:file,storedAt:A.now()};await new Promise((resolve,reject)=>{const tx=db.transaction(DB_STORE,'readwrite');tx.objectStore(DB_STORE).put(record);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});db.close();return id}catch(_){return''}}
  async function importFiles(files,{silent=false}={}){let store=seedFromExisting(),added=0,failed=0;for(const file of files){try{const id=file.id||await persistFile(file),text=await (file.blob||file).text(),report=parseReport(text,{id,name:file.name,size:file.size,lastModified:file.lastModified});mergeReport(store,report);if(id&&!store.scannedIds.includes(id))store.scannedIds.push(id);added++}catch(error){console.warn('[v15.20 CSV]',file.name,error);failed++}}saveStore(store);if(A.route==='options')A.render();if(!silent)A.toast(added?`${added} CSV analizado${added===1?'':'s'}${failed?` · ${failed} no leído${failed===1?'':'s'}`:''}`:'No se pudo leer el CSV')}
  async function scanStored(){try{let store=seedFromExisting();const rows=(await allStoredFiles()).filter(x=>x?.blob&&(x.brokerId==='ibkr'||/interactive brokers/i.test(x.brokerName||'')||String(x.id||'').startsWith('ibkr-'))),pending=rows.filter(x=>!store.scannedIds.includes(x.id));if(pending.length)await importFiles(pending,{silent:true})}catch(error){console.warn('[v15.20 histórico]',error)}}
  function ensureInput(){let input=document.querySelector('#optionsHistoryInput1520');if(input)return input;input=document.createElement('input');input.id='optionsHistoryInput1520';input.type='file';input.accept='.csv,text/csv';input.multiple=true;input.hidden=true;document.body.appendChild(input);input.addEventListener('change',()=>{const files=[...(input.files||[])];input.value='';if(files.length)importFiles(files)});return input}

  document.addEventListener('click',event=>{const b=event.target.closest('[data-action]');if(!b)return;if(b.dataset.action==='import-options-history'){event.preventDefault();ensureInput().click()}if(b.dataset.action==='select-options-year'){event.preventDefault();setPrefs({selectedYear:Number(b.dataset.year)});A.render()}},true);
  seedFromExisting();ensureInput();setTimeout(scanStored,250);
})();
