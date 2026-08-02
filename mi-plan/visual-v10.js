(()=>{
'use strict';
if(window.__FF_VISUAL_V10__) return;
window.__FF_VISUAL_V10__=true;

const BASE_KEYS=['ff_mi_plan_v2','ff_mi_plan_v4'];
const OPTIONS_KEY='ff_options_safe_v9';
const TYPE_META={
  cash:{label:'Bancos',color:'#2475e8'},funds:{label:'Fondos / ETF',color:'#4aa6ff'},stocks:{label:'Acciones',color:'#14a7a0'},
  options:{label:'Opciones',color:'#ff7a16'},pension:{label:'Pensiones',color:'#7d67d8'},crypto:{label:'Cripto',color:'#f4b13b'},
  realestate:{label:'Inmuebles',color:'#0b3e7c'},other:{label:'Otros',color:'#91a4bd'},debt:{label:'Deudas',color:'#e35b62'}
};
let selectedRange='6m';
const money=(value,compact=false,currency='EUR')=>new Intl.NumberFormat('es-ES',{style:'currency',currency,maximumFractionDigits:0,notation:compact?'compact':'standard'}).format(Number(value)||0);
const number=value=>{const n=Number(value);return Number.isFinite(n)?n:0};
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const readJSON=key=>{try{return JSON.parse(localStorage.getItem(key)||'null')}catch(_){return null}};
const baseKey=()=>BASE_KEYS.find(key=>localStorage.getItem(key))||BASE_KEYS[0];
const baseData=()=>readJSON(baseKey());
const optionData=()=>readJSON(OPTIONS_KEY)||{strategy:{targetProfit:30},open:[],trades:[],summary:null};
const netWorth=data=>(data?.items||[]).reduce((sum,item)=>sum+(item.type==='debt'?-number(item.value):number(item.value)),0);
const monthKey=value=>String(value||'').match(/\d{4}-\d{2}/)?.[0]||'';
const monthName=key=>{if(!key)return'';const [y,m]=key.split('-').map(Number);return new Intl.DateTimeFormat('es-ES',{month:'short'}).format(new Date(y,m-1,1)).replace('.','')};
const fullMonthName=key=>{if(!key)return'';const [y,m]=key.split('-').map(Number);return new Intl.DateTimeFormat('es-ES',{month:'long',year:'numeric'}).format(new Date(y,m-1,1))};
const addMonths=(date,delta)=>new Date(date.getFullYear(),date.getMonth()+delta,1);
const isoMonth=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`;

const style=document.createElement('style');
style.dataset.visualV10='true';
style.textContent=`
.v10-section{display:grid;gap:16px;margin:18px 0 24px}.v10-section-head{display:flex;justify-content:space-between;align-items:flex-end;gap:14px}.v10-section-head h2{margin:4px 0 0;color:#082a5c;font-size:clamp(23px,5vw,32px)}.v10-section-head p{margin:7px 0 0;color:#6c7f98;line-height:1.5}.v10-live{display:inline-flex;align-items:center;gap:7px;padding:7px 10px;border-radius:999px;background:#eaf3ff;color:#165bb8;font-size:11px;font-weight:850;white-space:nowrap}.v10-live i{width:7px;height:7px;border-radius:50%;background:#ff7a16;box-shadow:0 0 0 5px rgba(255,122,22,.12)}
.v10-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}.v10-card{position:relative;overflow:hidden;background:rgba(255,255,255,.96);border:1px solid rgba(8,42,92,.1);border-radius:24px;padding:20px;box-shadow:0 14px 38px rgba(17,54,104,.08)}.v10-card.full{grid-column:1/-1}.v10-card-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:14px}.v10-card-head h3{margin:0;color:#082a5c;font-size:18px}.v10-card-head p{margin:5px 0 0;color:#71839b;font-size:13px;line-height:1.45}.v10-value{font-size:26px;font-weight:900;letter-spacing:-.04em;color:#082a5c;white-space:nowrap}.v10-value small{display:block;margin-top:3px;color:#71839b;font-size:11px;font-weight:750;letter-spacing:0;text-align:right}.v10-range{display:flex;gap:5px;padding:4px;border-radius:12px;background:#f0f5fc}.v10-range button{border:0;background:transparent;color:#6b7c93;border-radius:9px;padding:7px 10px;font:800 11px system-ui;cursor:pointer}.v10-range button.active{background:#fff;color:#145ebc;box-shadow:0 3px 10px rgba(8,42,92,.1)}
.v10-line{width:100%;height:auto;display:block;overflow:visible}.v10-gridline{stroke:#dce7f5;stroke-width:1}.v10-line-path{fill:none;stroke:#2475e8;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}.v10-area{fill:url(#v10AreaGradient)}.v10-dot{fill:#fff;stroke:#ff7a16;stroke-width:4}.v10-axis{fill:#8090a5;font:700 11px system-ui}.v10-callout{display:flex;align-items:flex-start;gap:10px;margin-top:12px;padding:12px 14px;border-radius:15px;background:#f6f9fe;color:#53677f;font-size:13px;line-height:1.45}.v10-callout span{display:grid;place-items:center;flex:0 0 28px;height:28px;border-radius:50%;background:#e7f1ff;color:#1763c5;font-weight:900}.v10-callout strong{color:#082a5c}
.v10-donut-wrap{display:grid;grid-template-columns:minmax(150px,.9fr) minmax(180px,1.1fr);align-items:center;gap:16px}.v10-donut{width:100%;max-width:230px;margin:auto}.v10-donut circle{fill:none;stroke-width:16}.v10-donut-bg{stroke:#edf2f8}.v10-donut-center{fill:#082a5c;font:900 14px system-ui;text-anchor:middle}.v10-donut-sub{fill:#7b8ca2;font:700 7px system-ui;text-anchor:middle}.v10-legend{display:grid;gap:9px}.v10-legend-row{display:grid;grid-template-columns:10px 1fr auto;align-items:center;gap:9px;border:0;background:transparent;padding:5px 0;text-align:left;cursor:pointer}.v10-legend-row i{width:10px;height:10px;border-radius:50%}.v10-legend-row span{color:#53677f;font-size:13px}.v10-legend-row b{color:#082a5c;font-size:13px}.v10-debt-note{display:flex;justify-content:space-between;gap:10px;margin-top:12px;padding-top:12px;border-top:1px solid #e8eef6;color:#71839b;font-size:12px}.v10-debt-note b{color:#c34c55}
.v10-goal-top{display:flex;align-items:center;gap:17px}.v10-goal-ring{position:relative;flex:0 0 112px;height:112px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#ff7a16 var(--goal),#eaf0f7 0)}.v10-goal-ring:before{content:'';position:absolute;inset:12px;border-radius:50%;background:#fff}.v10-goal-ring div{position:relative;text-align:center}.v10-goal-ring strong{display:block;color:#082a5c;font-size:25px}.v10-goal-ring span{color:#75879d;font-size:10px;font-weight:800}.v10-goal-copy strong{display:block;color:#082a5c;font-size:22px}.v10-goal-copy span{display:block;margin-top:4px;color:#71839b;font-size:13px;line-height:1.4}.v10-progress{position:relative;height:13px;margin:20px 0 10px;border-radius:999px;background:#eaf0f7;overflow:visible}.v10-progress i{position:absolute;inset:0 auto 0 0;width:var(--goal);border-radius:inherit;background:linear-gradient(90deg,#2475e8,#ff7a16);box-shadow:0 5px 15px rgba(255,122,22,.25)}.v10-progress b{position:absolute;top:50%;left:var(--goal);width:20px;height:20px;transform:translate(-50%,-50%);border:4px solid #fff;border-radius:50%;background:#ff7a16;box-shadow:0 4px 14px rgba(8,42,92,.2)}.v10-goal-labels{display:flex;justify-content:space-between;color:#78899e;font-size:11px;font-weight:750}.v10-projection{display:flex;gap:10px;align-items:center;margin-top:16px;padding:13px 14px;border-radius:16px;background:linear-gradient(135deg,#eef5ff,#fff7ef)}.v10-projection span{font-size:22px}.v10-projection b{display:block;color:#082a5c;font-size:13px}.v10-projection small{display:block;margin-top:3px;color:#6e8097;font-size:12px;line-height:1.4}
.v10-option-bars{width:100%;height:auto;display:block}.v10-bar-gross{fill:#84baff}.v10-bar-net.positive{fill:#ff7a16}.v10-bar-net.negative{fill:#e35b62}.v10-zero{stroke:#9fb0c5;stroke-width:1.5}.v10-option-legend{display:flex;gap:16px;flex-wrap:wrap;margin:4px 0 12px;color:#64768d;font-size:12px}.v10-option-legend span{display:flex;align-items:center;gap:7px}.v10-option-legend i{width:10px;height:10px;border-radius:3px}.v10-option-legend .gross{background:#84baff}.v10-option-legend .net{background:#ff7a16}.v10-chart-empty{display:grid;place-items:center;min-height:190px;padding:20px;text-align:center;border-radius:18px;background:#f7faff;color:#71839b}.v10-chart-empty span{font-size:38px}.v10-chart-empty b{display:block;margin-top:8px;color:#082a5c}.v10-chart-empty small{display:block;margin-top:5px;max-width:330px;line-height:1.45}
.v10-risk-list{display:grid;gap:12px}.v10-risk-row{display:grid;grid-template-columns:70px 1fr auto;align-items:center;gap:10px}.v10-risk-row>span{color:#082a5c;font-size:13px;font-weight:850;overflow:hidden;text-overflow:ellipsis}.v10-risk-track{height:13px;border-radius:999px;background:#eaf0f7;overflow:hidden}.v10-risk-track i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#2475e8,#ff7a16);transform-origin:left;animation:v10Grow .65s ease both}.v10-risk-row b{color:#082a5c;font-size:12px}.v10-risk-total{display:flex;justify-content:space-between;gap:10px;margin-top:16px;padding:13px 14px;border-radius:15px;background:#fff6ec;color:#99500f;font-size:13px}.v10-risk-total b{color:#7c3e05}
.v10-expiry{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}.v10-expiry-card{position:relative;min-height:118px;padding:14px;border-radius:18px;background:#f5f9ff;border:1px solid #e4edf8;overflow:hidden}.v10-expiry-card:after{content:'';position:absolute;left:0;right:0;bottom:0;height:var(--level);max-height:55%;background:linear-gradient(180deg,rgba(36,117,232,.04),rgba(36,117,232,.16));pointer-events:none}.v10-expiry-card span,.v10-expiry-card b,.v10-expiry-card small{position:relative;z-index:1;display:block}.v10-expiry-card span{color:#6c7f97;font-size:11px;font-weight:850}.v10-expiry-card b{margin-top:10px;color:#082a5c;font-size:23px}.v10-expiry-card small{margin-top:5px;color:#75879d;font-size:10px;line-height:1.35}.v10-expiry-card.hot{background:#fff6ec;border-color:#ffd7b3}.v10-expiry-card.hot b{color:#b34b00}.v10-footnote{margin:12px 0 0;color:#7a8ba1;font-size:11px;line-height:1.45}
@keyframes v10Grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@media(max-width:760px){.v10-section-head{align-items:flex-start}.v10-live{display:none}.v10-grid{grid-template-columns:1fr}.v10-card.full{grid-column:auto}.v10-card{padding:17px;border-radius:21px}.v10-card-head{align-items:flex-start}.v10-value{font-size:22px}.v10-range button{padding:6px 8px}.v10-donut-wrap{grid-template-columns:1fr}.v10-donut{max-width:200px}.v10-goal-top{align-items:flex-start}.v10-goal-ring{flex-basis:98px;height:98px}.v10-expiry{grid-template-columns:repeat(2,minmax(0,1fr))}.v10-risk-row{grid-template-columns:60px 1fr}.v10-risk-row b{grid-column:2;text-align:right;margin-top:-6px}}
html[data-theme="dark"] .v10-card,body.dark .v10-card{background:#0d2344;border-color:#244268}.dark .v10-card-head h3,.dark .v10-value,.dark .v10-legend-row b,.dark .v10-goal-copy strong,.dark .v10-risk-row span,.dark .v10-risk-row b{color:#f3f7ff}
`;
document.head.appendChild(style);

function categoryTotals(data){
  const totals={};
  for(const item of data?.items||[]){
    if(item.type==='debt') continue;
    totals[item.type]=(totals[item.type]||0)+Math.max(0,number(item.value));
  }
  return Object.entries(totals).filter(([,value])=>value>0).sort((a,b)=>b[1]-a[1]);
}
function debtTotal(data){return (data?.items||[]).filter(item=>item.type==='debt').reduce((s,item)=>s+Math.max(0,number(item.value)),0)}
function movementEffect(movement){
  const amount=number(movement?.amount);
  const kind=String(movement?.kind||'').toLowerCase();
  if(kind==='withdrawal'||kind==='expense'||kind==='gasto') return -Math.abs(amount);
  return amount;
}
function wealthHistory(data){
  const movements=data?.movements||[];
  const current=netWorth(data);
  if(!movements.length) return [{month:isoMonth(new Date()),value:current,delta:0}];
  const byMonth={};
  movements.forEach(m=>{const key=monthKey(m.date);if(key)byMonth[key]=(byMonth[key]||0)+movementEffect(m)});
  const keys=Object.keys(byMonth).sort();
  const now=new Date();
  const count=selectedRange==='6m'?6:selectedRange==='1y'?12:Math.min(36,Math.max(6,keys.length+1));
  const months=Array.from({length:count},(_,i)=>isoMonth(addMonths(now,i-count+1)));
  let value=current;
  const backwards=[];
  for(let i=months.length-1;i>=0;i--){
    const key=months[i];
    backwards.push({month:key,value,delta:byMonth[key]||0});
    value-=byMonth[key]||0;
  }
  return backwards.reverse();
}
function lineChart(points){
  const width=680,height=235,left=35,right=16,top=15,bottom=34;
  const values=points.map(p=>p.value);let min=Math.min(...values),max=Math.max(...values);
  if(min===max){min-=Math.max(1,Math.abs(min)*.05);max+=Math.max(1,Math.abs(max)*.05)}
  const pad=(max-min)*.12;min-=pad;max+=pad;
  const x=i=>points.length===1?width/2:left+i*(width-left-right)/(points.length-1);
  const y=v=>top+(max-v)*(height-top-bottom)/(max-min);
  const coords=points.map((p,i)=>[x(i),y(p.value)]);
  const path=coords.map((p,i)=>`${i?'L':'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area=`${path} L${coords.at(-1)[0]},${height-bottom} L${coords[0][0]},${height-bottom} Z`;
  const labels=points.map((p,i)=>`<text class="v10-axis" x="${x(i)}" y="${height-9}" text-anchor="middle">${monthName(p.month)}</text>`).join('');
  const dots=points.map((p,i)=>`<circle class="v10-dot" cx="${x(i)}" cy="${y(p.value)}" r="4"><title>${fullMonthName(p.month)}: ${money(p.value)}</title></circle>`).join('');
  const grids=[0,.5,1].map(t=>{const yy=top+t*(height-top-bottom);const value=max-t*(max-min);return `<line class="v10-gridline" x1="${left}" x2="${width-right}" y1="${yy}" y2="${yy}"/><text class="v10-axis" x="${left-5}" y="${yy+4}" text-anchor="end">${money(value,true)}</text>`}).join('');
  return `<svg class="v10-line" viewBox="0 0 ${width} ${height}" role="img" aria-label="Evolución del patrimonio neto"><defs><linearGradient id="v10AreaGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2475e8" stop-opacity=".28"/><stop offset="1" stop-color="#2475e8" stop-opacity=".02"/></linearGradient></defs>${grids}<path class="v10-area" d="${area}"/><path class="v10-line-path" d="${path}"/>${dots}${labels}</svg>`;
}
function historyInsight(points){
  if(points.length<2)return`<strong>El historial empieza ahora.</strong> Registra una actualización mensual para ver la evolución real.`;
  const delta=points.at(-1).value-points[0].value;
  return delta>=0?`<strong>Has avanzado ${money(delta)}.</strong> La gráfica combina las actualizaciones que has registrado.`:`<strong>El patrimonio registrado ha bajado ${money(Math.abs(delta))}.</strong> Revisa qué parte procede de retiradas y qué parte del mercado.`;
}
function donutChart(data){
  const totals=categoryTotals(data),total=totals.reduce((s,[,v])=>s+v,0);
  if(!total)return`<div class="v10-chart-empty"><div><span>◌</span><b>Aún no hay activos con valor</b><small>Añade una cifra aproximada y la distribución se dibujará automáticamente.</small></div></div>`;
  let offset=0;
  const circles=totals.map(([type,value])=>{const pct=value/total*100;const color=TYPE_META[type]?.color||'#91a4bd';const el=`<circle cx="60" cy="60" r="47" stroke="${color}" pathLength="100" stroke-dasharray="${pct} ${100-pct}" stroke-dashoffset="${-offset}" transform="rotate(-90 60 60)"><title>${TYPE_META[type]?.label||type}: ${money(value)} (${pct.toFixed(1)} %)</title></circle>`;offset+=pct;return el}).join('');
  const legend=totals.slice(0,7).map(([type,value])=>`<button class="v10-legend-row" type="button" data-v10-category="${type}"><i style="background:${TYPE_META[type]?.color||'#91a4bd'}"></i><span>${esc(TYPE_META[type]?.label||type)}</span><b>${Math.round(value/total*100)}%</b></button>`).join('');
  return `<div class="v10-donut-wrap"><svg class="v10-donut" viewBox="0 0 120 120" role="img" aria-label="Distribución de activos"><circle class="v10-donut-bg" cx="60" cy="60" r="47"/>${circles}<text class="v10-donut-center" x="60" y="58">${money(total,true)}</text><text class="v10-donut-sub" x="60" y="70">ACTIVOS</text></svg><div class="v10-legend">${legend}</div></div><div class="v10-debt-note"><span>Deuda registrada</span><b>−${money(debtTotal(data))}</b></div>`;
}
function goalMarkup(data){
  const goal=data?.goal||{};const target=Math.max(0,number(goal.target));
  const current=Math.max(0,goal.linkedToNetWorth?netWorth(data):number(goal.current));
  const pct=target?Math.max(0,Math.min(100,current/target*100)):0;
  const monthly=Math.max(0,number(goal.monthlyContribution));
  const remaining=Math.max(0,target-current);
  let projection='Añade una aportación mensual para calcular una fecha aproximada.';
  if(remaining===0&&target)projection='Objetivo alcanzado. Puedes definir el siguiente hito.';
  else if(monthly>0){const months=Math.ceil(remaining/monthly);const date=addMonths(new Date(),months);projection=`Sin asumir rentabilidad, alcanzarías la meta en ${new Intl.DateTimeFormat('es-ES',{month:'long',year:'numeric'}).format(date)}.`}
  return `<div class="v10-goal-top"><div class="v10-goal-ring" style="--goal:${pct.toFixed(1)}%"><div><strong>${pct.toFixed(0)}%</strong><span>COMPLETADO</span></div></div><div class="v10-goal-copy"><strong>${money(current)}</strong><span>de ${money(target)}<br>${esc(goal.name||'Tu objetivo principal')}</span></div></div><div class="v10-progress" style="--goal:${pct.toFixed(1)}%"><i></i><b></b></div><div class="v10-goal-labels"><span>Inicio</span><span>Faltan ${money(remaining)}</span><span>Meta</span></div><div class="v10-projection"><span>◎</span><div><b>Proyección prudente</b><small>${esc(projection)}</small></div></div>`;
}
function generalSection(data,mode='home'){
  const points=wealthHistory(data);const current=netWorth(data);const first=points[0]?.value??current;const delta=current-first;
  return `<section class="v10-section" data-visual-v10="${mode}"><div class="v10-section-head"><div><p class="eyebrow">LECTURA VISUAL</p><h2>${mode==='wealth'?'Evolución y composición':'Tu situación de un vistazo'}</h2><p>Gráficas simples para entender qué está ocurriendo sin revisar todas las cifras.</p></div><span class="v10-live"><i></i>DATOS DE ESTE DISPOSITIVO</span></div><div class="v10-grid"><article class="v10-card full"><div class="v10-card-head"><div><h3>Patrimonio neto</h3><p>Activos menos deudas y evolución registrada.</p></div><div><div class="v10-value">${money(current)}<small>${points.length>1?(delta>=0?'+':'')+money(delta)+' en el periodo':'valor actual'}</small></div><div class="v10-range"><button data-v10-range="6m" class="${selectedRange==='6m'?'active':''}">6M</button><button data-v10-range="1y" class="${selectedRange==='1y'?'active':''}">1A</button><button data-v10-range="all" class="${selectedRange==='all'?'active':''}">Todo</button></div></div></div>${lineChart(points)}<div class="v10-callout"><span>i</span><div>${historyInsight(points)}</div></div></article><article class="v10-card"><div class="v10-card-head"><div><h3>Distribución del patrimonio</h3><p>Dónde están concentrados tus activos.</p></div></div>${donutChart(data)}</article><article class="v10-card"><div class="v10-card-head"><div><h3>Progreso hacia el objetivo</h3><p>Avance y fecha aproximada sin suponer rentabilidad.</p></div></div>${goalMarkup(data)}</article></div></section>`;
}
function monthlyOptions(opts){
  const grouped={};
  for(const trade of opts?.trades||[]){
    const key=monthKey(trade.date);if(!key)continue;
    grouped[key]??={month:key,gross:0,net:0,fees:0,count:0};
    if(number(trade.quantity)<0&&number(trade.proceeds)>0)grouped[key].gross+=number(trade.proceeds);
    grouped[key].net+=number(trade.realized);
    grouped[key].fees+=number(trade.commission);
    grouped[key].count++;
  }
  return Object.values(grouped).sort((a,b)=>a.month.localeCompare(b.month)).slice(-12);
}
function optionBars(series){
  if(!series.length)return`<div class="v10-chart-empty"><div><span>▥</span><b>Importa un CSV para ver la evolución</b><small>La gráfica separará créditos brutos y resultado realizado informado por IBKR.</small></div></div>`;
  const width=700,height=270,left=40,right=15,top=18,bottom=38;
  const values=series.flatMap(x=>[x.gross,x.net]);let min=Math.min(0,...values),max=Math.max(0,...values);if(max===min)max=min+1;
  const y=v=>top+(max-v)*(height-top-bottom)/(max-min);const zero=y(0);const step=(width-left-right)/series.length;const bw=Math.min(18,step*.27);
  const grids=[0,.5,1].map(t=>{const yy=top+t*(height-top-bottom);const v=max-t*(max-min);return`<line class="v10-gridline" x1="${left}" x2="${width-right}" y1="${yy}" y2="${yy}"/><text class="v10-axis" x="${left-5}" y="${yy+4}" text-anchor="end">${money(v,true,'USD')}</text>`}).join('');
  const bars=series.map((d,i)=>{const cx=left+step*i+step/2;const grossY=y(d.gross),netY=y(d.net);const grossH=Math.abs(zero-grossY),netH=Math.abs(zero-netY);return`<rect class="v10-bar-gross" x="${cx-bw-2}" y="${Math.min(zero,grossY)}" width="${bw}" height="${Math.max(1,grossH)}" rx="4"><title>${fullMonthName(d.month)} · créditos brutos: ${money(d.gross,false,'USD')}</title></rect><rect class="v10-bar-net ${d.net>=0?'positive':'negative'}" x="${cx+2}" y="${Math.min(zero,netY)}" width="${bw}" height="${Math.max(1,netH)}" rx="4"><title>${fullMonthName(d.month)} · resultado realizado: ${money(d.net,false,'USD')}</title></rect><text class="v10-axis" x="${cx}" y="${height-12}" text-anchor="middle">${monthName(d.month)}</text>`}).join('');
  return `<div class="v10-option-legend"><span><i class="gross"></i>Créditos brutos de aperturas vendidas</span><span><i class="net"></i>Resultado realizado IBKR</span></div><svg class="v10-option-bars" viewBox="0 0 ${width} ${height}" role="img" aria-label="Resultado mensual de opciones">${grids}<line class="v10-zero" x1="${left}" x2="${width-right}" y1="${zero}" y2="${zero}"/>${bars}</svg>`;
}
function exposureRows(opts){
  const groups={};
  for(const p of opts?.open||[]){
    if(p.right!=='P'||number(p.quantity)>=0||p.structure==='box')continue;
    groups[p.underlying]=(groups[p.underlying]||0)+number(p.strike)*Math.abs(number(p.quantity))*(number(p.multiplier)||100);
  }
  return Object.entries(groups).sort((a,b)=>b[1]-a[1]);
}
function exposureMarkup(opts){
  const rows=exposureRows(opts);if(!rows.length)return`<div class="v10-chart-empty"><div><span>◎</span><b>No hay puts independientes abiertas</b><small>Las patas de box spread quedan excluidas para no inflar falsamente el riesgo de asignación.</small></div></div>`;
  const total=rows.reduce((s,[,v])=>s+v,0),max=rows[0][1];
  return`<div class="v10-risk-list">${rows.slice(0,7).map(([symbol,value])=>`<div class="v10-risk-row"><span>${esc(symbol)}</span><div class="v10-risk-track"><i style="width:${value/max*100}%"></i></div><b>${money(value,true,'USD')}</b></div>`).join('')}</div><div class="v10-risk-total"><span>Asignación simultánea potencial</span><b>${money(total,false,'USD')}</b></div>`;
}
const MONTHS={JAN:0,FEB:1,MAR:2,APR:3,MAY:4,JUN:5,JUL:6,AUG:7,SEP:8,OCT:9,NOV:10,DEC:11};
function expiryDate(code){const m=String(code||'').toUpperCase().match(/^(\d{2})([A-Z]{3})(\d{2})$/);if(!m)return null;return new Date(2000+Number(m[3]),MONTHS[m[2]],Number(m[1]),12)}
function expiryBuckets(opts){
  const buckets=[{label:'0–7 días',max:7,puts:0,boxes:new Set(),exposure:0,symbols:new Set()},{label:'8–30 días',max:30,puts:0,boxes:new Set(),exposure:0,symbols:new Set()},{label:'31–60 días',max:60,puts:0,boxes:new Set(),exposure:0,symbols:new Set()},{label:'+60 días',max:Infinity,puts:0,boxes:new Set(),exposure:0,symbols:new Set()}];
  const now=new Date();
  for(const p of opts?.open||[]){const expiry=expiryDate(p.expiry);if(!expiry)continue;const days=Math.max(0,Math.ceil((expiry-now)/86400000));const bucket=buckets.find(b=>days<=b.max);if(!bucket)continue;bucket.symbols.add(p.underlying);if(p.structure==='box'){bucket.boxes.add(`${p.underlying}|${p.expiry}`)}else if(p.right==='P'&&number(p.quantity)<0){bucket.puts+=Math.abs(number(p.quantity));bucket.exposure+=number(p.strike)*Math.abs(number(p.quantity))*(number(p.multiplier)||100)}}
  return buckets;
}
function expiryMarkup(opts){
  const buckets=expiryBuckets(opts);const max=Math.max(1,...buckets.map(b=>b.puts+b.boxes.size));
  const any=buckets.some(b=>b.puts||b.boxes.size);if(!any)return`<div class="v10-chart-empty"><div><span>⌛</span><b>No hay vencimientos abiertos</b><small>Cuando importes posiciones activas, se repartirán por horizonte temporal.</small></div></div>`;
  return`<div class="v10-expiry">${buckets.map((b,i)=>{const count=b.puts+b.boxes.size;return`<div class="v10-expiry-card ${i===0&&count?'hot':''}" style="--level:${Math.max(7,count/max*55)}%"><span>${b.label}</span><b>${count}</b><small>${b.puts?`${b.puts} contrato${b.puts===1?'':'s'} put`:''}${b.puts&&b.boxes.size?' · ':''}${b.boxes.size?`${b.boxes.size} box`:''}${b.exposure?`<br>${money(b.exposure,true,'USD')} exposición`:''}</small></div>`}).join('')}</div><p class="v10-footnote">Los box spreads se muestran como estructuras, pero no se suman a la exposición de puts desnudas.</p>`;
}
function optionsSection(opts){
  const monthly=monthlyOptions(opts);const latest=monthly.at(-1);const totalRealized=monthly.reduce((s,x)=>s+x.net,0);
  return`<section class="v10-section" data-visual-v10="options"><div class="v10-section-head"><div><p class="eyebrow">LECTURA VISUAL DE OPCIONES</p><h2>Primas, exposición y vencimientos</h2><p>El box spread se separa de la venta de puts para que el riesgo sea legible.</p></div><span class="v10-live"><i></i>IBKR IMPORTADO</span></div><div class="v10-grid"><article class="v10-card full"><div class="v10-card-head"><div><h3>Actividad mensual de opciones</h3><p>Créditos de aperturas vendidas frente al resultado realizado informado.</p></div><div class="v10-value">${money(latest?.net||0,false,'USD')}<small>${latest?monthName(latest.month):'sin datos'} · acumulado ${money(totalRealized,true,'USD')}</small></div></div>${optionBars(monthly)}<div class="v10-callout"><span>i</span><div><strong>Resultado todavía no ajustado.</strong> El siguiente cálculo enlazará puts, asignaciones y venta posterior de acciones.</div></div></article><article class="v10-card"><div class="v10-card-head"><div><h3>Exposición por subyacente</h3><p>Capital necesario si se asignaran las puts independientes.</p></div></div>${exposureMarkup(opts)}</article><article class="v10-card"><div class="v10-card-head"><div><h3>Vencimientos próximos</h3><p>Contratos y estructuras agrupados por horizonte.</p></div></div>${expiryMarkup(opts)}</article></div></section>`;
}
function removeGeneral(){document.querySelectorAll('[data-visual-v10="home"],[data-visual-v10="wealth"]').forEach(el=>el.remove())}
let working=false;
function enhance(){
  if(working)return;const root=document.querySelector('#viewRoot');if(!root)return;working=true;
  try{
    const base=baseData();
    if(base?.onboardingComplete){
      const hero=root.querySelector('.status-hero');
      if(hero&&!root.querySelector('[data-visual-v10="home"]'))hero.insertAdjacentHTML('afterend',generalSection(base,'home'));
      const toolbar=root.querySelector('.section-toolbar');const eyebrow=toolbar?.querySelector('.eyebrow')?.textContent?.trim();
      if(eyebrow==='PATRIMONIO'&&!root.querySelector('[data-visual-v10="wealth"]'))toolbar.insertAdjacentHTML('afterend',generalSection(base,'wealth'));
    }
    const wrap=root.querySelector('.ffo-wrap');
    if(wrap&&!root.querySelector('[data-visual-v10="options"]')){
      const metrics=wrap.querySelector('.ffo-grid');
      (metrics||wrap.firstElementChild)?.insertAdjacentHTML('afterend',optionsSection(optionData()));
    }
  }finally{working=false}
}
const root=document.querySelector('#viewRoot');if(root)new MutationObserver(()=>queueMicrotask(enhance)).observe(root,{childList:true,subtree:false});
window.addEventListener('pageshow',enhance);setTimeout(enhance,100);setTimeout(enhance,800);
document.addEventListener('click',event=>{
  const range=event.target.closest('[data-v10-range]');if(range){selectedRange=range.dataset.v10Range;removeGeneral();enhance();return}
  const cat=event.target.closest('[data-v10-category]');if(cat){const proxy=document.querySelector(`[data-map5-category="${CSS.escape(cat.dataset.v10Category)}"]`);if(proxy)proxy.click()}
},true);
window.addEventListener('storage',()=>{document.querySelectorAll('[data-visual-v10]').forEach(el=>el.remove());enhance()});
})();
