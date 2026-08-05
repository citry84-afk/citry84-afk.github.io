(()=>{
  'use strict';
  const A=window.FFLab;
  if(!A||A.__IMPORT_CHARTS_1523__)return;
  A.__IMPORT_CHARTS_1523__=true;
  A.VERSION='15.23-lab';

  const OCR_URL='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
  const PDF_URL='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs';
  const PDF_WORKER='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';
  const BANKS=['ING','Sabadell','Unicaja','MyInvestor','CaixaBank','Santander','BBVA','Bankinter','Openbank','Ibercaja','Abanca','Cajamar','Kutxabank','Renta 4','Interactive Brokers','Degiro'];
  const baseOpenModal=A.openModal;
  const baseReport=A.views.report;
  let tesseractPromise=null;
  let pdfPromise=null;

  const n=v=>A.n(v);
  const esc=v=>A.esc(v);
  const norm=v=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
  const money=v=>A.euro(v,2);

  A.openModal=html=>{
    baseOpenModal.call(A,html);
    if(String(html).includes('ACTUALIZAR FOTOGRAFÍA'))setTimeout(enhancePhotoStep,0);
  };

  function currentCategory(){
    const title=norm(document.querySelector('.photo-wizard-body .photo-step-copy h2')?.textContent||'');
    if(title.includes('bancos'))return'banks';
    if(title.includes('inversiones'))return'investments';
    if(title.includes('pensiones'))return'pensions';
    if(title.includes('inmuebles'))return'properties';
    if(title.includes('hipotecas')||title.includes('deudas'))return'debts';
    if(title.includes('ingresos'))return'income';
    return'';
  }

  function enhancePhotoStep(){
    const body=document.querySelector('.photo-wizard-body');
    if(!body||body.querySelector('.photo-importer'))return;
    const category=currentCategory();
    if(!category)return;
    const importer=document.createElement('section');
    importer.className='photo-importer';
    importer.dataset.category=category;
    importer.innerHTML=`
      <div class="photo-importer-head"><div><p class="eyebrow">MÉTODO DE ACTUALIZACIÓN</p><h3>¿Cómo quieres confirmar estas cifras?</h3></div><span>Procesado privado</span></div>
      <div class="photo-methods">
        <button type="button" class="active" data-photo-method="manual"><b>✎</b><span>Manual</span></button>
        <button type="button" data-photo-method="image"><b>▣</b><span>Pantallazo</span></button>
        <button type="button" data-photo-method="pdf"><b>▤</b><span>PDF</span></button>
        <button type="button" data-photo-method="csv"><b>▦</b><span>CSV</span></button>
      </div>
      <p class="photo-import-hint">Puedes seguir escribiendo a mano o subir un documento. Primero verás la interpretación y nada se aplicará sin tu confirmación.</p>
      <input type="file" data-photo-file hidden>
      <div class="photo-import-result" aria-live="polite"></div>`;
    const copy=body.querySelector('.photo-step-copy');
    if(copy)copy.insertAdjacentElement('afterend',importer);else body.prepend(importer);
  }

  function targetsFromStep(){
    const targets=[];
    document.querySelectorAll('.photo-wizard-body .photo-row').forEach(row=>{
      const input=row.querySelector('input[data-photo-item],input[data-photo-income-source]');
      if(!input)return;
      targets.push({key:input.dataset.photoItem||input.dataset.photoIncomeSource,label:row.querySelector('b')?.textContent?.trim()||'Dato',input});
    });
    const salary=document.querySelector('#photoSalary');
    const passive=document.querySelector('#photoPassive');
    if(salary)targets.push({key:'__salary',label:'Nóminas y salarios',input:salary});
    if(passive)targets.push({key:'__passive',label:'Ingresos pasivos',input:passive});
    return targets;
  }

  function activateMethod(button){
    const box=button.closest('.photo-importer');
    box.querySelectorAll('[data-photo-method]').forEach(node=>node.classList.toggle('active',node===button));
    const mode=button.dataset.photoMethod;
    if(mode==='manual'){
      box.querySelector('.photo-import-result').innerHTML='';
      return;
    }
    const input=box.querySelector('[data-photo-file]');
    input.dataset.mode=mode;
    input.accept=mode==='image'?'image/*':mode==='pdf'?'.pdf,application/pdf':'.csv,text/csv,text/plain';
    input.click();
  }

  function loadScript(src){
    return new Promise((resolve,reject)=>{
      if(globalThis.Tesseract&&src===OCR_URL)return resolve(globalThis.Tesseract);
      const existing=[...document.scripts].find(script=>script.src===src);
      if(existing){existing.addEventListener('load',()=>resolve(globalThis.Tesseract),{once:true});existing.addEventListener('error',reject,{once:true});return}
      const script=document.createElement('script');script.src=src;script.async=true;script.onload=()=>resolve(globalThis.Tesseract);script.onerror=()=>reject(new Error('No se pudo cargar el lector de imágenes'));document.head.appendChild(script);
    });
  }
  async function getTesseract(){
    if(globalThis.Tesseract)return globalThis.Tesseract;
    if(!tesseractPromise)tesseractPromise=loadScript(OCR_URL);
    return tesseractPromise;
  }
  async function getPdf(){
    if(!pdfPromise)pdfPromise=import(PDF_URL).then(module=>{module.GlobalWorkerOptions.workerSrc=PDF_WORKER;return module});
    return pdfPromise;
  }

  function status(box,text,percent=20){
    box.querySelector('.photo-import-result').innerHTML=`<div class="photo-reading"><div><b>${esc(text)}</b><span>El archivo se procesa en este dispositivo.</span></div><div class="photo-reading-bar"><i style="width:${Math.max(5,Math.min(100,percent))}%"></i></div></div>`;
  }

  async function imageText(file,box){
    status(box,'Preparando el lector del pantallazo…',10);
    const tesseract=await getTesseract();
    const result=await tesseract.recognize(file,'spa+eng',{logger:message=>{
      if(message.status==='recognizing text')status(box,'Leyendo el pantallazo…',20+message.progress*72);
    }});
    return result?.data?.text||'';
  }

  async function pdfText(file,box){
    status(box,'Abriendo el PDF…',10);
    const pdfjs=await getPdf(),bytes=new Uint8Array(await file.arrayBuffer()),pdf=await pdfjs.getDocument({data:bytes}).promise;
    let text='';
    const pages=Math.min(pdf.numPages,8);
    for(let pageNo=1;pageNo<=pages;pageNo++){
      status(box,`Leyendo página ${pageNo} de ${pages}…`,12+(pageNo/pages)*58);
      const page=await pdf.getPage(pageNo),content=await page.getTextContent();
      text+='\n'+content.items.map(item=>item.str).join(' ');
    }
    if(norm(text).length>45)return text;
    status(box,'El PDF parece escaneado. Reconociendo la primera página…',72);
    const page=await pdf.getPage(1),viewport=page.getViewport({scale:1.65}),canvas=document.createElement('canvas');
    canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
    await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
    const tesseract=await getTesseract(),result=await tesseract.recognize(canvas,'spa+eng',{logger:message=>{
      if(message.status==='recognizing text')status(box,'Reconociendo el PDF escaneado…',72+message.progress*24);
    }});
    return result?.data?.text||'';
  }

  function parseNumber(raw){
    let text=String(raw??'').trim().replace(/\s/g,'').replace(/[^0-9.,+\-]/g,'');
    if(!text||!/[0-9]/.test(text))return null;
    const negative=text.includes('-');text=text.replace(/[+\-]/g,'');
    const comma=text.lastIndexOf(','),point=text.lastIndexOf('.');let decimal='';
    if(comma>=0&&point>=0)decimal=comma>point?',':'.';
    else if(comma>=0&&[1,2].includes(text.length-comma-1))decimal=',';
    else if(point>=0&&[1,2].includes(text.length-point-1))decimal='.';
    if(decimal){const index=text.lastIndexOf(decimal);text=text.slice(0,index).replace(/[.,]/g,'')+'.'+text.slice(index+1).replace(/[.,]/g,'')}
    else text=text.replace(/[.,]/g,'');
    const value=Number(text);return Number.isFinite(value)?(negative?-value:value):null;
  }

  function parseCSV(text){
    const source=String(text||''),first=source.split(/\r?\n/,1)[0]||'',counts={',':(first.match(/,/g)||[]).length,';':(first.match(/;/g)||[]).length,'\t':(first.match(/\t/g)||[]).length},delimiter=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0]||',';
    const rows=[];let row=[],field='',quoted=false;
    for(let i=0;i<source.length;i++){
      const char=source[i];
      if(quoted){if(char==='"'&&source[i+1]==='"'){field+='"';i++}else if(char==='"')quoted=false;else field+=char}
      else if(char==='"')quoted=true;
      else if(char===delimiter){row.push(field);field=''}
      else if(char==='\n'){row.push(field.replace(/\r$/,''));rows.push(row);row=[];field=''}
      else field+=char;
    }
    if(field||row.length){row.push(field.replace(/\r$/,''));rows.push(row)}return rows;
  }

  function institution(text){const normalized=norm(text);return BANKS.find(name=>normalized.includes(norm(name)))||''}

  function specialCsvCandidates(text,category){
    const rows=parseCSV(text),out=[];
    rows.forEach(row=>{
      const section=norm(row[0]),format=norm(row[1]),kind=norm(row[2]),joined=norm(row.join(' '));
      if(category==='investments'&&(section==='valor liquidativo'||section==='net asset value')&&format==='data'&&kind==='total'){
        const amount=parseNumber(row[6]??row[5]??row[3]);if(amount!==null)out.push({amount:Math.abs(amount),score:100,label:'Interactive Brokers · valor liquidativo',context:row.slice(0,7).join(' · '),institution:'Interactive Brokers'});
      }
      if(category==='banks'&&/(saldo|balance|cash|efectivo)/.test(joined)){
        const amounts=row.map(parseNumber).filter(value=>value!==null&&Math.abs(value)>=10);
        if(amounts.length)out.push({amount:Math.abs(amounts.at(-1)),score:48,label:`${institution(joined)||'Cuenta'} · saldo`,context:row.join(' · '),institution:institution(joined)});
      }
      if(category==='debts'&&/(capital pendiente|saldo pendiente|outstanding balance|principal)/.test(joined)){
        const amounts=row.map(parseNumber).filter(value=>value!==null&&Math.abs(value)>=100);
        if(amounts.length)out.push({amount:Math.abs(amounts.at(-1)),score:70,label:'Deuda pendiente',context:row.join(' · '),institution:institution(joined)});
      }
    });
    return out;
  }

  const WEIGHTS={
    banks:[['saldo disponible',42],['saldo actual',40],['saldo total',38],['balance',32],['efectivo',25],['cuenta',12],['movimiento',-18],['transferencia',-18]],
    investments:[['valor liquidativo',48],['net asset value',48],['valor de cartera',42],['portfolio value',42],['valor total',30],['patrimonio',24],['coste',-15],['precio',-12]],
    pensions:[['derechos consolidados',48],['valor actual',38],['plan de pensiones',30],['saldo',22],['aportacion',-16],['comision',-16]],
    properties:[['valor de tasacion',48],['valoracion',38],['valor del inmueble',38],['precio estimado',32],['referencia catastral',-20]],
    debts:[['capital pendiente',50],['saldo pendiente',46],['principal pendiente',44],['deuda pendiente',42],['outstanding balance',42],['cuota',-22],['interes',-16]],
    income:[['liquido a percibir',50],['neto a cobrar',48],['importe neto',45],['nomina',34],['salario',30],['alquiler',30],['ingreso',22],['base de cotizacion',-25],['retencion',-22],['irpf',-20]]
  };

  function genericCandidates(text,category){
    const source=String(text||'').replace(/\u00a0/g,' '),regex=/(?:€\s*)?-?\d{1,3}(?:[.\s]\d{3})*(?:,\d{1,2})?(?:\s*(?:€|EUR))|(?:€\s*)?-?\d+(?:[.,]\d{1,2})?(?:\s*(?:€|EUR))|-?\d{1,3}(?:[.\s]\d{3})+(?:,\d{1,2})?|-?\d+[.,]\d{2}/gi,weights=WEIGHTS[category]||[],unique=new Map();
    let match;
    while((match=regex.exec(source))){
      const amount=parseNumber(match[0]);if(amount===null||Math.abs(amount)<10||Math.abs(amount)>1e9)continue;
      const start=Math.max(0,match.index-100),end=Math.min(source.length,match.index+match[0].length+100),context=source.slice(start,end).replace(/\s+/g,' ').trim(),normalized=norm(context);
      let score=/€|\beur\b/i.test(match[0])?8:0;
      weights.forEach(([word,points])=>{if(normalized.includes(word))score+=points});
      if(/%/.test(context))score-=20;
      const value=Math.abs(amount);if(value>=100)score+=Math.min(8,Math.log10(value));
      if(score<4)continue;
      const inst=institution(context),label=inst||weights.find(([word])=>normalized.includes(word))?.[0]||'Importe detectado',key=`${value.toFixed(2)}|${label}`;
      const candidate={amount:value,score,label,context,institution:inst};
      if(!unique.has(key)||unique.get(key).score<score)unique.set(key,candidate);
    }
    return[...unique.values()].sort((a,b)=>b.score-a.score||b.amount-a.amount).slice(0,6);
  }

  function candidatesFor(text,category,mode){
    const special=mode==='csv'?specialCsvCandidates(text,category):[],generic=genericCandidates(text,category),all=[...special,...generic],unique=new Map();
    all.forEach(row=>{const key=`${row.amount.toFixed(2)}|${norm(row.label)}`;if(!unique.has(key)||unique.get(key).score<row.score)unique.set(key,row)});
    return[...unique.values()].sort((a,b)=>b.score-a.score).slice(0,6);
  }

  function bestTarget(candidate,targets,used){
    const haystack=norm(`${candidate.label} ${candidate.context} ${candidate.institution}`);
    let best=null,bestScore=-1;
    targets.forEach(target=>{
      let score=0;const label=norm(target.label),tokens=label.split(' ').filter(token=>token.length>2);
      if(label&&haystack.includes(label))score+=20;
      tokens.forEach(token=>{if(haystack.includes(token))score+=3});
      if(candidate.institution&&label.includes(norm(candidate.institution)))score+=25;
      if(!used.has(target.key))score+=2;
      if(score>bestScore){best=target;bestScore=score}
    });
    return best;
  }

  function renderCandidates(box,candidates,fileName){
    const targets=targetsFromStep();
    if(!targets.length){box.querySelector('.photo-import-result').innerHTML='<div class="photo-import-warning"><b>No hay elementos que actualizar</b><span>Añade primero la cuenta o activo desde Patrimonio y vuelve a esta fotografía.</span></div>';return}
    if(!candidates.length){box.querySelector('.photo-import-result').innerHTML='<div class="photo-import-warning"><b>No he encontrado una cifra suficientemente fiable</b><span>Puedes mantener el modo manual o probar con un documento donde se vea claramente saldo, valor total o capital pendiente.</span></div>';return}
    const used=new Set();
    const rows=candidates.map((candidate,index)=>{
      const target=bestTarget(candidate,targets,used);if(target)used.add(target.key);
      return `<div class="photo-detected-row" data-detected-row><label class="photo-detected-check"><input type="checkbox" ${index<targets.length?'checked':''}><span></span></label><div class="photo-detected-copy"><b>${esc(candidate.institution||candidate.label)}</b><small>${esc(candidate.context.slice(0,150))}</small><em>${candidate.score>=45?'Confianza alta':candidate.score>=20?'Confianza media':'Revisar'}</em></div><div class="photo-detected-fields"><select data-import-target>${targets.map(item=>`<option value="${esc(item.key)}" ${target?.key===item.key?'selected':''}>${esc(item.label)}</option>`).join('')}</select><label><input data-import-amount type="number" min="0" step="0.01" value="${candidate.amount.toFixed(2)}"><i>€</i></label></div></div>`;
    }).join('');
    box.querySelector('.photo-import-result').innerHTML=`<div class="photo-detected"><div class="photo-detected-title"><div><b>Hemos interpretado ${esc(fileName)}</b><span>Revisa destino e importe antes de aplicar.</span></div><small>${candidates.length} ${candidates.length===1?'dato':'datos'}</small></div>${rows}<div class="photo-detected-actions"><button type="button" class="soft-btn" data-photo-method="manual">Volver a manual</button><button type="button" class="primary-btn" data-apply-import>Aplicar datos detectados</button></div><p>Nada se guardará definitivamente hasta completar y guardar la fotografía.</p></div>`;
  }

  async function handleFile(input){
    const file=input.files?.[0];input.value='';if(!file)return;
    const box=input.closest('.photo-importer'),category=box.dataset.category,mode=input.dataset.mode||'csv';
    try{
      let text='';
      if(mode==='image')text=await imageText(file,box);
      else if(mode==='pdf')text=await pdfText(file,box);
      else{status(box,'Leyendo el CSV…',25);text=await file.text()}
      status(box,'Interpretando las cifras…',92);
      const candidates=candidatesFor(text,category,mode);
      renderCandidates(box,candidates,file.name);
    }catch(error){
      console.error('[v15.23 import]',error);
      box.querySelector('.photo-import-result').innerHTML=`<div class="photo-import-warning"><b>No se pudo interpretar el archivo</b><span>${esc(error?.message||'Prueba con otro archivo o continúa manualmente.')}</span></div>`;
    }
  }

  function applyDetected(button){
    const box=button.closest('.photo-importer'),targets=new Map(targetsFromStep().map(target=>[target.key,target]));let applied=0;
    box.querySelectorAll('[data-detected-row]').forEach(row=>{
      if(!row.querySelector('.photo-detected-check input')?.checked)return;
      const key=row.querySelector('[data-import-target]')?.value,target=targets.get(key),amount=parseNumber(row.querySelector('[data-import-amount]')?.value);
      if(!target||amount===null)return;
      target.input.value=String(Math.abs(amount));target.input.dispatchEvent(new Event('input',{bubbles:true}));target.input.dispatchEvent(new Event('change',{bubbles:true}));applied++;
    });
    if(applied){box.querySelector('.photo-import-result').innerHTML=`<div class="photo-import-success"><b>${applied} ${applied===1?'cifra aplicada':'cifras aplicadas'}</b><span>Compruébalas en los campos inferiores y continúa cuando estén correctas.</span></div>`;A.toast('Datos aplicados a la fotografía')}
  }

  document.addEventListener('click',event=>{
    const method=event.target.closest('[data-photo-method]');if(method){event.preventDefault();activateMethod(method);return}
    const apply=event.target.closest('[data-apply-import]');if(apply){event.preventDefault();applyDetected(apply)}
  },true);
  document.addEventListener('change',event=>{if(event.target.matches?.('[data-photo-file]'))handleFile(event.target)},true);

  function monthlyClosings(){
    const rows=A.photoHistory?.().rows||[],map=new Map();
    rows.forEach(row=>map.set(row.month,row));
    return[...map.values()].sort((a,b)=>String(a.month).localeCompare(String(b.month))).slice(-24);
  }

  function compactMoney(value){return new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',notation:'compact',maximumFractionDigits:1}).format(n(value))}
  function chartCard(title,subtitle,rows,valueFn,className){
    const values=rows.map(row=>n(valueFn(row))),latest=values.at(-1)||0,previous=values.at(-2),change=previous===undefined?null:latest-previous;
    if(rows.length<2)return`<article class="evolution-card ${className}"><div class="evolution-card-head"><div><span>${esc(title)}</span><strong>${A.display(A.euro(latest))}</strong></div><small>Necesita dos cierres mensuales</small></div><div class="evolution-empty">La gráfica aparecerá al guardar otra fotografía en un mes diferente.</div></article>`;
    const width=340,height=135,padX=18,padTop=15,padBottom=28,min=Math.min(...values),max=Math.max(...values),range=max-min||Math.max(1,Math.abs(max)*.08),lo=min-range*.08,hi=max+range*.08;
    const points=values.map((value,index)=>{const x=padX+(index/(values.length-1))*(width-padX*2),y=padTop+(hi-value)/(hi-lo)*(height-padTop-padBottom);return{x,y,value}}),poly=points.map(point=>`${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' '),area=`${padX},${height-padBottom} ${poly} ${width-padX},${height-padBottom}`;
    const first=rows[0].month.slice(5)+'/'+rows[0].month.slice(2,4),last=rows.at(-1).month.slice(5)+'/'+rows.at(-1).month.slice(2,4);
    return `<article class="evolution-card ${className}"><div class="evolution-card-head"><div><span>${esc(title)}</span><strong>${A.display(A.euro(latest))}</strong></div><small class="${change!==null&&change<0?'down':'up'}">${change===null?'—':`${change>=0?'+ ':'− '}${A.display(A.euro(Math.abs(change)))}`}</small></div><p>${esc(subtitle)}</p><svg class="evolution-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Evolución de ${esc(title)}"><line x1="${padX}" y1="${height-padBottom}" x2="${width-padX}" y2="${height-padBottom}" class="chart-axis"/><polygon points="${area}" class="chart-area"/><polyline points="${poly}" class="chart-line"/>${points.map(point=>`<circle cx="${point.x}" cy="${point.y}" r="3.5" class="chart-dot"><title>${compactMoney(point.value)}</title></circle>`).join('')}<text x="${padX}" y="${height-7}" class="chart-label">${first}</text><text x="${width-padX}" y="${height-7}" text-anchor="end" class="chart-label">${last}</text></svg></article>`;
  }

  A.views.report=()=>{
    const base=baseReport(),rows=monthlyClosings();
    const charts=`<section class="section evolution-section"><div class="section-head"><div><p class="eyebrow">EVOLUCIÓN</p><h2>Cómo cambia tu fotografía financiera</h2><p>Cada punto utiliza la última actualización guardada de cada mes. Las fotografías intermedias quedan en el histórico sin duplicar el cierre mensual.</p></div><span class="file-chip">${rows.length} cierres</span></div><div class="evolution-grid">${chartCard('Patrimonio neto','Activos menos deudas.',rows,row=>row.totals?.net,'net-chart')}${chartCard('Liquidez disponible','Bancos y efectivo utilizable.',rows,row=>row.totals?.cash,'cash-chart')}${chartCard('Deuda pendiente','Hipotecas y préstamos pendientes.',rows,row=>row.totals?.debt,'debt-chart')}${chartCard('Ingresos mensuales','Nóminas, alquileres, opciones y otros.',rows,row=>row.totals?.incomeTotal,'income-chart')}</div></section>`;
    return base+charts;
  };
})();
