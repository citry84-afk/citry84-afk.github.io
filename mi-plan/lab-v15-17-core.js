(()=>{
  'use strict';
  const A=window.FFLab={};
  A.VERSION='15.18-lab';
  A.STABLE_KEY='ff_mi_plan_v2';
  A.LAB_KEY='ff_mi_plan_lab_v1517';
  A.TYPE_META={cash:['Cuentas y efectivo','€'],funds:['Fondos / ETF','◫'],stocks:['Acciones','↗'],options:['Opciones','◎'],crypto:['Criptomonedas','◇'],pension:['Planes de pensiones','◌'],realestate:['Inmuebles','⌂'],other:['Otros activos','＋'],debt:['Hipotecas / deuda','−']};
  A.CATEGORIES={
    banks:{label:'Bancos y efectivo',icon:'€',types:['cash'],text:'Cuentas corrientes, ahorro y efectivo disponible.'},
    investments:{label:'Inversiones',icon:'↗',types:['funds','stocks','options','crypto'],text:'Fondos, ETF, acciones, opciones y criptomonedas.'},
    pensions:{label:'Pensiones',icon:'◌',types:['pension'],text:'Planes de pensiones y ahorro para jubilación.'},
    properties:{label:'Inmuebles',icon:'⌂',types:['realestate'],text:'Vivienda habitual, alquiladas y segundas residencias.'},
    debts:{label:'Hipotecas y deudas',icon:'−',types:['debt'],text:'Capital pendiente de hipotecas y préstamos.'},
    others:{label:'Otros activos',icon:'＋',types:['other'],text:'Cualquier activo que no encaje en otra categoría.'}
  };
  A.FINANCIAL=new Set(['cash','funds','stocks','options','crypto','pension']);
  A.LIQUID=new Set(['cash']);
  A.$=(s,r=document)=>r.querySelector(s);
  A.$$=(s,r=document)=>[...r.querySelectorAll(s)];
  A.read=(k,f=null)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??f}catch(_){return f}};
  A.write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(_){return false}};
  A.n=v=>Number.isFinite(Number(v))?Number(v):0;
  A.euro=(v,d=0)=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',minimumFractionDigits:d,maximumFractionDigits:d}).format(A.n(v));
  A.pct=(v,d=0)=>`${new Intl.NumberFormat('es-ES',{maximumFractionDigits:d}).format(A.n(v))} %`;
  A.esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  A.uid=()=>`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
  A.now=()=>new Date().toISOString();
  A.defaultPlan=()=>({version:2,onboardingComplete:true,profile:{name:'Luis'},goal:{name:'Construir mi patrimonio',target:500000,current:0,linkedToNetWorth:true,monthlyContribution:0},items:[],movements:[],rules:{minLiquidityPct:30,maxConcentrationPct:25},preferences:{hideSensitive:false},lastUpdated:A.now()});
  A.normalize=raw=>{const b=A.defaultPlan();return{...b,...(raw||{}),profile:{...b.profile,...(raw?.profile||{})},goal:{...b.goal,...(raw?.goal||{})},rules:{...b.rules,...(raw?.rules||{})},preferences:{...b.preferences,...(raw?.preferences||{})},items:Array.isArray(raw?.items)?raw.items:[],movements:Array.isArray(raw?.movements)?raw.movements:[]}};
  A.loadPlan=()=>{let lab=A.read(A.LAB_KEY,null);if(!lab){lab=A.normalize(A.read(A.STABLE_KEY,null));A.write(A.LAB_KEY,lab)}return A.normalize(lab)};
  A.plan=A.loadPlan();
  A.route='home';
  A.editingId=null;
  A.save=msg=>{A.plan.lastUpdated=A.now();A.write(A.LAB_KEY,A.plan);if(msg)A.toast(msg)};

  A.incomeSummary=()=>{
    const draft=A.read('ff_income_sources_v1510',{sources:[]});
    const sources=Array.isArray(draft?.sources)?draft.sources.filter(x=>A.n(x.monthly)>0):[];
    const assetFallback=A.plan.items.filter(x=>x.type!=='debt').reduce((s,x)=>s+A.n(x.monthlyIncome),0);
    if(!sources.length)return{total:assetFallback,salary:0,passive:assetFallback,count:assetFallback?1:0,sources:[],documented:false};
    const salary=sources.filter(x=>x.kind==='salary').reduce((s,x)=>s+A.n(x.monthly),0);
    const passive=sources.filter(x=>x.kind!=='salary').reduce((s,x)=>s+A.n(x.monthly),0);
    return{total:salary+passive,salary,passive,count:sources.length,sources,documented:true};
  };

  A.totals=()=>{
    const p=A.plan;
    const assets=p.items.filter(x=>x.type!=='debt');
    const debts=p.items.filter(x=>x.type==='debt');
    const gross=assets.reduce((s,x)=>s+A.n(x.value),0);
    const debt=debts.reduce((s,x)=>s+A.n(x.value),0);
    const financial=assets.filter(x=>A.FINANCIAL.has(x.type));
    const financialAssets=financial.reduce((s,x)=>s+A.n(x.value),0);
    const cash=assets.filter(x=>A.LIQUID.has(x.type)).reduce((s,x)=>s+A.n(x.value),0);
    const largest=financial.reduce((m,x)=>Math.max(m,A.n(x.value)),0);
    const key=new Date().toISOString().slice(0,7);
    const month=p.movements.filter(x=>String(x.date||'').slice(0,7)===key);
    const monthChange=month.reduce((s,x)=>s+(x.kind==='withdrawal'?-A.n(x.amount):A.n(x.amount)),0);
    const income=A.incomeSummary();
    return{gross,debt,net:gross-debt,financialAssets,cash,liquidity:financialAssets?cash/financialAssets*100:0,concentration:financialAssets?largest/financialAssets*100:0,passive:income.passive,incomeTotal:income.total,salaryIncome:income.salary,monthChange,monthMovements:month.length};
  };

  A.categoryTotals=()=>Object.fromEntries(Object.entries(A.CATEGORIES).map(([id,m])=>[id,A.plan.items.filter(x=>m.types.includes(x.type)).reduce((s,x)=>s+A.n(x.value),0)]));
  A.freshness=()=>{
    const now=Date.now();
    const rows=A.plan.items.map(item=>{const d=new Date(item.updatedAt||A.plan.lastUpdated||0);const age=Number.isNaN(d.getTime())?9999:Math.max(0,Math.floor((now-d.getTime())/86400000));return{item,age}});
    const stale=rows.filter(x=>x.age>90);
    const oldest=rows.sort((a,b)=>b.age-a.age)[0]||null;
    return{stale,oldest,total:rows.length,fresh:rows.filter(x=>x.age<=90).length};
  };

  A.optionsData=()=>{
    const s=A.read('ff_ibkr_shared_v156',null),safe=A.read('ff_options_safe_v9',null),o=s?.options||{},sum=safe?.summary||{},tr=Array.isArray(safe?.trades)?safe.trades:[],op=Array.isArray(safe?.open)?safe.open:[];
    const real=A.n(o.realized||sum.realized||tr.reduce((x,y)=>x+A.n(y.realized),0)),months=A.n(o.months)||1;
    return{available:Boolean(s||safe),provider:s?.provider||'Interactive Brokers',file:s?.file?.name||sum.file||'',nav:A.n(s?.nav),realized:real,monthly:A.n(o.monthlyAverage)||real/months,trades:A.n(o.tradesCount||sum.tradeCount||tr.length),open:A.n(o.openCount||sum.openCount||op.length),exposure:A.n(o.assignmentExposure||sum.assignmentExposure),unrealized:A.n(o.unrealized||sum.unrealized)};
  };
  A.display=v=>A.plan.preferences.hideSensitive?'••••':v;
  A.score=t=>Math.min(100,40+(A.plan.items.length?15:0)+(t.cash>0?10:0)+(t.liquidity>=A.n(A.plan.rules.minLiquidityPct)?10:0)+(t.concentration<=A.n(A.plan.rules.maxConcentrationPct)||!t.financialAssets?10:0)+(A.plan.movements.length?8:0)+(A.optionsData().available?7:0));
  A.views={};
  A.render=()=>{A.plan=A.loadPlan();A.$('#view').innerHTML=(A.views[A.route]||A.views.home)();A.$$('[data-route]').forEach(b=>b.classList.toggle('active',b.dataset.route===A.route));window.scrollTo({top:0,behavior:'instant'})};
  A.toast=text=>{const e=A.$('#toast');e.textContent=text;e.classList.add('show');clearTimeout(A.toast.t);A.toast.t=setTimeout(()=>e.classList.remove('show'),1800)};
  A.openModal=html=>A.$('#modalRoot').innerHTML=`<div class="overlay" data-action="close-overlay"><section class="sheet">${html}</section></div>`;
  A.closeModal=()=>{A.$('#modalRoot').innerHTML='';A.editingId=null};
})();