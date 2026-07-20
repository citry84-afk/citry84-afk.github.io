const D = window.PORTFOLIO_DATA;
const fmtEUR = (v, max = 0) => new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:max}).format(v);
const fmtPct = (v, d=1) => `${Number(v).toLocaleString('es-ES',{maximumFractionDigits:d,minimumFractionDigits:d})}%`;
const pct = (a,b) => b ? a/b*100 : 0;
const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));

let selectedYears = {2020:false,2021:false,2022:false,2023:false,2024:false,2025:false,2026:true};
const portfolioByYear = {
  2020:[100,1100,2000,5000,13140,14216,14834,15000,17111,22621],
  2021:[23600,23000,24813,26928,27689,31510,32412,34455,35384,37841,40129,40853],
  2022:[34792,33098,36306,32648,28994,26140,29470,31963,26570,28127,24499],
  2023:[28842,27832,27278,27938,28019,30558,33848,29676,28562,26005,31412,36621],
  2024:[38706,41538,45090,42690,46358,48959,45304,45514,44630,47985,55391,62789],
  2025:[65465,61506,54554,43250,49800,49877,52930,51460,49976,47666,46428,54198],
  2026:D.weekly2026.map(x=>x.saldo)
};

function init(){
  const status = document.getElementById('statusText');
  status.textContent = D.meta.status;
  const statusBox=document.getElementById('heroStatus');
  statusBox.classList.remove('red','amber');
  if(D.meta.statusLevel) statusBox.classList.add(D.meta.statusLevel);
  document.getElementById('lastUpdate').textContent = `Semana ${D.meta.week} · ${D.meta.updated}`;
  document.getElementById('ytdChip').textContent = fmtPct(D.current.ytdManualPct);
  document.getElementById('avgChip').textContent = fmtEUR(D.current.optionsAvgWeekly);
  document.getElementById('weeklyChip').textContent = fmtEUR(D.current.optionsWeekly);
  const pbtn=document.getElementById('privacyBtn');
  pbtn.onclick=()=>{document.body.classList.toggle('privacy-on');pbtn.textContent=document.body.classList.contains('privacy-on')?'🙈 Mostrar cifras':'👁️ Ocultar cifras';};
  renderKpis(); renderYearControls(); renderRisks(); renderObjectives(); renderQuality(); renderBox(); renderGoal(); renderCharts();
}

function renderKpis(){
  const c=D.current; const liquidityBase=c.liquidityPortfolio||c.portfolio; const fundsPct=pct(c.fundsAvailable,liquidityBase), excessPct=pct(c.excessLiquidity,liquidityBase);
  const kpis=[
    ['Valor cartera',fmtEUR(c.portfolio,0),`${fmtPct(c.ytdManualPct)} TWR YTD · NAV PDF ${fmtEUR(c.pdfNav,0)}`, c.ytdManualPct>=0?'good':'bad'],
    ['Opciones ajustadas YTD',fmtEUR(c.optionsYtd,0),`${fmtEUR(c.optionsWeekly,0)} esta semana · media ${fmtEUR(c.optionsAvgWeekly,0)}/semana`,'good'],
    ['Fondos disponibles',fmtEUR(c.fundsAvailable,0),`${fmtPct(fundsPct)} sobre cartera · pantallazo ${c.liquiditySnapshotDate}`,fundsPct>=20?'good':fundsPct>=10?'warn':'bad'],
    ['Exceso liquidez',fmtEUR(c.excessLiquidity,0),`${fmtPct(excessPct)} sobre cartera · pantallazo ${c.liquiditySnapshotDate}`,excessPct>=25?'good':excessPct>=10?'warn':'bad'],
    ['ORCL pendiente',fmtEUR(c.orclUnrealized,0),`${c.orclShares} acciones · no realizado`,c.orclUnrealized>=0?'good':'bad'],
    ['Ajustadas prudentes',fmtEUR(c.optionsPrudent,0),`Opciones ajustadas si se marca ORCL a mercado`,c.optionsPrudent>=0?'warn':'bad']
  ];
  document.getElementById('kpiGrid').innerHTML = kpis.map(k=>`<article class="card kpi ${k[3]}"><div class="label">${k[0]}</div><div class="value">${k[1]}</div><div class="sub">${k[2]}</div></article>`).join('');
}
function renderYearControls(){
  const box=document.getElementById('yearControls');
  box.innerHTML = Object.keys(selectedYears).map(y=>`<button class="ghost-btn year-btn ${selectedYears[y]?'active':''}" data-y="${y}">${y}</button>`).join('');
  box.querySelectorAll('button').forEach(b=>b.onclick=()=>{selectedYears[b.dataset.y]=!selectedYears[b.dataset.y]; if(!Object.values(selectedYears).some(Boolean)) selectedYears[b.dataset.y]=true; renderYearControls(); renderCharts(); renderHistorySummary();});
  renderHistorySummary();
}
function activeYears(){return Object.keys(selectedYears).filter(y=>selectedYears[y]);}
function activePortfolioSeries(){const arr=[];activeYears().forEach(y=>portfolioByYear[y].forEach((v,i)=>arr.push({label:`${y} ${Number(y)===2026?'S':'M'}${i+1}`,year:y,value:v})));return arr;}
function activeOptionSeries(){const arr=[];activeYears().filter(y=>D.weeklyOptionsAll[y]).forEach(y=>D.weeklyOptionsAll[y].forEach((v,i)=>arr.push({label:`${y} S${i+1}`,year:y,value:v})));return arr;}
function cumulative(a){let s=0;return a.map(x=>{s+=x.value;return {...x,value:s};});}
function renderHistorySummary(){
  const yrs=activeYears(); document.getElementById('selectedYearsChip').textContent=yrs.join(' · ');
  const ps=activePortfolioSeries(); const os=activeOptionSeries(); const optSum=os.reduce((a,b)=>a+b.value,0);
  document.getElementById('historySummary').innerHTML = [
    ['Años activos',yrs.join(' · ')],
    ['Último saldo',ps.length?fmtEUR(ps.at(-1).value,0):'—'],
    ['Opciones ajustadas seleccionadas',os.length?fmtEUR(optSum,0):'sin datos'],
    ['Semanas de opciones',String(os.length)]
  ].map(x=>`<div class="objective"><h3>${x[0]}</h3><div class="big">${x[1]}</div></div>`).join('');
}
function renderRisks(){
  const c=D.current;
  const rows=[
    {name:'Fondos disponibles', rule:'>20%', value:pct(c.fundsAvailable,c.liquidityPortfolio||c.portfolio), label:fmtPct(pct(c.fundsAvailable,c.liquidityPortfolio||c.portfolio)), level:pct(c.fundsAvailable,c.liquidityPortfolio||c.portfolio)>=20?'green':pct(c.fundsAvailable,c.liquidityPortfolio||c.portfolio)>=10?'amber':'red'},
    {name:'Exceso de liquidez', rule:'>25%', value:pct(c.excessLiquidity,c.liquidityPortfolio||c.portfolio), label:fmtPct(pct(c.excessLiquidity,c.liquidityPortfolio||c.portfolio)), level:pct(c.excessLiquidity,c.liquidityPortfolio||c.portfolio)>=25?'green':pct(c.excessLiquidity,c.liquidityPortfolio||c.portfolio)>=10?'amber':'red'},
    {name:'Poder adquisitivo', rule:'positivo', value:pct(c.buyingPower,c.liquidityPortfolio||c.portfolio), label:fmtEUR(c.buyingPower,0), level:c.buyingPower>0?'amber':'red'},
    {name:'Efectivo', rule:'controlar deuda', value:pct(Math.abs(c.cash),c.grossSecurities), label:fmtEUR(c.cash,0), level:'red'},
    {name:'Box GOOG', rule:'financiación, no ingreso', value:pct(c.boxSpread,c.portfolio), label:fmtPct(pct(c.boxSpread,c.portfolio)), level:pct(c.boxSpread,c.portfolio)<15?'amber':'red'},
    {name:'ORCL abierto', rule:'vigilar', value:pct(Math.abs(c.orclUnrealized),c.portfolio), label:fmtEUR(c.orclUnrealized,0), level:'red'}
  ];
  document.getElementById('riskRows').innerHTML = rows.map(row=>`<div class="risk-row"><div class="risk-row-top"><div><strong>${row.name}</strong><br><span>Regla: ${row.rule} · Actual: ${row.label}</span></div><em class="risk-pill ${row.level}">${row.level==='green'?'VERDE':row.level==='amber'?'VIGILAR':'ROJO'}</em></div><div class="progress"><i style="width:${clamp(Math.abs(row.value),4,100)}%"></i></div></div>`).join('');
  document.getElementById('diagnosis').innerHTML = `<strong>Diagnóstico:</strong> el NAV del PDF cae a ${fmtEUR(c.portfolio,0)} y el TWR YTD a ${fmtPct(c.ytdManualPct)}. ORCL es el principal riesgo: ${fmtEUR(c.orclUnrealized,0)} no realizado en ${c.orclShares} acciones. Los datos de fondos disponibles, exceso y poder adquisitivo proceden del último pantallazo (${c.liquiditySnapshotDate}), por lo que deben confirmarse con una captura nueva.`;
}
function renderObjectives(){
  const c=D.current;
  const objs=[['Objetivo 2026',c.target2026,c.portfolio],['Primer hito',c.target100k,c.portfolio],['Objetivo grande',c.target500k,c.portfolio]];
  document.getElementById('objectives').innerHTML = objs.map(([name,target,current])=>{const p=clamp(pct(current,target),0,100), missing=Math.max(0,target-current);return `<div class="objective"><h3>${name}</h3><div class="big">${fmtPct(p)}</div><div class="progress"><i style="width:${p}%"></i></div><div class="small">Actual ${fmtEUR(current,0)} · faltan ${fmtEUR(missing,0)} para ${fmtEUR(target,0)}</div></div>`}).join('');
}
function metric(label,value,detail=''){return `<div class="risk-row"><div class="risk-row-top"><div><strong>${label}</strong><br><span>${detail}</span></div><b>${value}</b></div></div>`}
function renderQuality(){
  const c=D.current;
  document.getElementById('optionsQuality').innerHTML = [
    metric('Opciones brutas realizadas YTD',fmtEUR(c.optionsGrossYtd,2),'Resultado realizado de opciones en el resumen realizado/no realizado del PDF'),
    metric('Ajustes cerrados por asignaciones',fmtEUR(c.closedAssignmentAdjustments,2),'Incluye las pérdidas realizadas de ORCL vendidas tras asignación'),
    metric('Opciones ajustadas realizadas',fmtEUR(c.optionsYtd,2),'Dato oficial para medir la estrategia'),
    metric('ORCL abierto pendiente',fmtEUR(c.orclUnrealized,2),'No se resta oficialmente hasta cerrar/vender las acciones'),
    metric('Marcador prudente',fmtEUR(c.optionsPrudent,2),'Opciones ajustadas si marcas ORCL a mercado')
  ].join('');
}
function renderBox(){
  const c=D.current;
  document.getElementById('boxSummary').innerHTML = [
    metric('GOOG box spread',fmtEUR(c.boxSpread,0),'Crédito recibido aproximado'),
    metric('Importe a devolver',fmtEUR(c.boxDebt,0),'Vencimiento Jun17 2027'),
    metric('Coste financiero aprox.',fmtEUR(c.boxCostApprox,0),'No se cuenta como ingreso por opciones'),
    metric('Peso sobre cartera',fmtPct(pct(c.boxSpread,c.portfolio)),'Financiación / valor cartera')
  ].join('');
}
function renderGoal(){
  const c=D.current, target=10000;
  const progress=pct(c.optionsMonthlyAvg,target), weeklyTarget=target*12/52, weeklyProgress=pct(c.optionsAvgWeekly,weeklyTarget);
  document.getElementById('goalLead').innerHTML=`Ritmo actual de opciones ajustadas: <strong>${fmtEUR(c.optionsMonthlyAvg,0)}/mes</strong>. Objetivo: <strong>${fmtEUR(target,0)}/mes</strong>.`;
  document.getElementById('goalPct').textContent=fmtPct(progress,0);
  const rate=c.optionsMonthlyAvg/c.portfolio; const needed=target/rate;
  const years=[[2026,83000],[2027,108000],[2028,138000],[2029,175000],[2030,222000],[2031,280000],[2032,350000],[2033,430000],[2034,500000],[2035,600000]];
  const y=(years.find(x=>x[1]>=needed)||['2035+'])[0]; document.getElementById('goalYear').textContent=y;
  const cells=100,on=Math.round(clamp(progress,0,100)); document.getElementById('goalTank').innerHTML=Array.from({length:cells},(_,i)=>`<span class="tank-cell ${i<on?'on':''}"></span>`).join('');
  document.getElementById('scenarioGrid').innerHTML=[['Actual',rate],['3,5%',.035],['3,0%',.03],['2,5%',.025],['2,0%',.02]].map(s=>`<div class="objective"><h3>${s[0]}</h3><div class="big">${(years.find(x=>x[1]>=target/s[1])||['2035+'])[0]}</div><div class="small">capital necesario ${fmtEUR(target/s[1],0)}</div></div>`).join('');
  document.getElementById('incomeStages').innerHTML=[['Ayuda al sueldo','0–4.000 €/mes',clamp(pct(c.optionsMonthlyAvg,4000),0,100)],['Salario cubierto','4.000–8.000 €/mes',clamp(pct(c.optionsMonthlyAvg-4000,4000),0,100)],['Coste familiar','8.000–10.000 €/mes',clamp(pct(c.optionsMonthlyAvg-8000,2000),0,100)]].map(s=>`<div class="objective"><h3>${s[0]}</h3><div class="big">${s[1]}</div><div class="progress"><i style="width:${s[2]}%"></i></div><div class="small">${fmtPct(s[2],0)} completado</div></div>`).join('');
}
function renderCharts(){
  const port=activePortfolioSeries();
  lineChart('portfolioChart', port.map(x=>x.value), port.map(x=>x.label), {lineClass:'line'});
  const optCum=cumulative(activeOptionSeries());
  lineChart('optionsYtdChart', optCum.map(x=>x.value), optCum.map(x=>x.label), {lineClass:'line2'});
  barChart('monthlyOptionsChart', D.monthlyOptions.map(x=>x.value), D.monthlyOptions.map(x=>x.month), {mode:'mixed'});
  barChart('annualOptionsChart', D.annualOptions.map(x=>x.value), D.annualOptions.map(x=>x.year), {mode:'mixed'});
  const all=[]; Object.entries(D.weeklyOptionsAll).forEach(([year,arr])=>arr.forEach((v,i)=>all.push({v,label:`${year}-S${i+1}`})));
  barChart('weeklyOptionsChart', all.map(x=>x.v), all.map(x=>x.label), {mode:'mixed', dense:true, ma:8});
}
function baseSvg(id){const el=document.getElementById(id); if(!el) return null; el.innerHTML=''; const w=el.clientWidth||700,h=el.clientHeight||320; el.setAttribute('viewBox',`0 0 ${w} ${h}`); return {el,w,h,p:{l:56,r:18,t:18,b:40}};}
function scale(minPix,maxPix,minVal,maxVal){return v=> maxPix - (v-minVal)/(maxVal-minVal||1)*(maxPix-minPix);}
function addGrid(el,w,h,p,min,max){for(let i=0;i<=4;i++){const y=p.t+(h-p.t-p.b)*i/4;el.appendChild(svg('line',{x1:p.l,y1:y,x2:w-p.r,y2:y,class:'gridline'}));const val=max-(max-min)*i/4;el.appendChild(svg('text',{x:8,y:y+4,class:'chart-label'},fmtEUR(val,0)));}}
function lineChart(id, vals, labels, opts={}){const b=baseSvg(id); if(!b||!vals.length) return; const {el,w,h,p}=b; const min=Math.min(...vals)*.98, max=Math.max(...vals)*1.02; addGrid(el,w,h,p,min,max); const y=scale(p.t,h-p.b,min,max), x=i=>p.l+(w-p.l-p.r)*i/(vals.length-1||1); const d=vals.map((v,i)=>`${i?'L':'M'} ${x(i)} ${y(v)}`).join(' '); el.appendChild(svg('path',{d,class:opts.lineClass||'line'})); vals.forEach((v,i)=>{if(i===0||i===vals.length-1||i%Math.max(1,Math.floor(vals.length/8))===0)el.appendChild(svg('text',{x:x(i)-10,y:h-14,class:'chart-label'},labels[i].split(' ').slice(-1)[0]));});}
function barChart(id, vals, labels, opts={}){const b=baseSvg(id); if(!b||!vals.length) return; const {el,w,h,p}=b; const min=Math.min(0,...vals), max=Math.max(0,...vals); addGrid(el,w,h,p,min,max); const y=scale(p.t,h-p.b,min,max), y0=y(0), gap=opts.dense?1:10, bw=(w-p.l-p.r)/vals.length-gap; vals.forEach((v,i)=>{const x=p.l+i*(w-p.l-p.r)/vals.length+gap/2, yy=v>=0?y(v):y0, hh=Math.max(1,Math.abs(y(v)-y0));el.appendChild(svg('rect',{x,y:yy,width:Math.max(1,bw),height:hh,rx:opts.dense?1:6,class:v>=0?'bar-pos':'bar-neg'})); if(!opts.dense)el.appendChild(svg('text',{x:x+bw/2-14,y:h-14,class:'chart-label'},String(labels[i]).slice(0,4)));}); if(opts.ma){const ma=vals.map((_,i)=>i<opts.ma-1?null:vals.slice(i-opts.ma+1,i+1).reduce((a,b)=>a+b,0)/opts.ma);const valid=ma.map((v,i)=>({v,i})).filter(x=>x.v!==null);const d=valid.map(({v,i},j)=>`${j?'L':'M'} ${p.l+i*(w-p.l-p.r)/(vals.length-1||1)} ${y(v)}`).join(' ');el.appendChild(svg('path',{d,class:'line2'}));}}
function svg(tag, attrs={}, text=''){const n=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));if(text!==undefined)n.textContent=text;return n;}
window.addEventListener('resize',()=>{clearTimeout(window.__r);window.__r=setTimeout(renderCharts,160)});
init();
