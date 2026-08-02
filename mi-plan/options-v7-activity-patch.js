(() => {
  'use strict';
  const $ = (s, r=document) => r.querySelector(s);
  const nk = v => String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
  const num = v => { const n=Number(String(v??'').replace(',','.')); return Number.isFinite(n)?n:0; };
  const now = () => new Date().toISOString();
  const months={JAN:1,FEB:2,MAR:3,APR:4,MAY:5,JUN:6,JUL:7,AUG:8,SEP:9,OCT:10,NOV:11,DEC:12};
  const contract = s => {
    const m=String(s||'').trim().toUpperCase().match(/^(.*?)\s+(\d{2})([A-Z]{3})(\d{2})\s+([0-9.]+)\s+([PC])$/);
    if(!m||!months[m[3]]) return null;
    return {symbol:String(s).trim().toUpperCase(),underlying:m[1],expiry:`20${m[4]}-${String(months[m[3]]).padStart(2,'0')}-${m[2]}`,strike:Number(m[5]),putCall:m[6]};
  };
  function split(line, d=',') {
    const out=[]; let cur='', q=false;
    for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(q&&line[i+1]==='"'){cur+='"';i++;}else q=!q;}else if(c===d&&!q){out.push(cur);cur='';}else cur+=c;}out.push(cur);return out;
  }
  function rows(text){
    const lines=text.replace(/^\uFEFF/,'').split(/\r?\n/).filter(Boolean), heads=new Map(), out=[];
    for(const line of lines){const c=split(line), sec=c[0], kind=String(c[1]||'').toLowerCase();
      if(kind==='header'){heads.set(sec,c.slice(2));continue;}
      if((kind==='data'||kind==='total')&&heads.has(sec)){const r={_section:sec,_kind:kind};heads.get(sec).forEach((h,i)=>r[h]=c[i+2]??'');out.push(r);}
    }
    return out;
  }
  function key(t){return [t.accountId,t.underlying,t.expiry,t.putCall,t.strike,t.multiplier].join('|');}
  function markBoxes(positions){
    const g=new Map();positions.forEach(p=>{const k=[p.accountId,p.underlying,p.expiry].join('|');if(!g.has(k))g.set(k,[]);g.get(k).push(p);});
    g.forEach(a=>{const strikes=new Set(a.map(p=>p.strike)),combos=new Set(a.map(p=>`${p.strike}|${p.putCall}`)),sizes=new Set(a.map(p=>Math.abs(p.signedQuantity)));
      if(a.length===4&&strikes.size===2&&combos.size===4&&sizes.size===1)a.forEach(p=>{p.strategyTag='box';p.structureLabel='Box spread';});});
    return positions;
  }
  function cycles(trades, exact={}){
    const grouped=new Map();trades.slice().sort((a,b)=>a.tradeDate.localeCompare(b.tradeDate)||a.id.localeCompare(b.id)).forEach(t=>{if(!grouped.has(t.contractKey))grouped.set(t.contractKey,[]);grouped.get(t.contractKey).push(t);});
    const out=[];
    grouped.forEach((ts,k)=>{const lots=[];
      for(const t of ts){
        if(t.side==='SELL'&&t.openClose==='OPEN'){lots.push({t,rem:t.quantity});continue;}
        if(!(t.side==='BUY'&&t.openClose==='CLOSE'))continue;
        let rem=t.quantity;
        while(rem>1e-9&&lots.length){const l=lots[0],m=Math.min(rem,l.rem),open=l.t.netCashFlowBase*(m/l.t.quantity),close=t.netCashFlowBase*(m/t.quantity),rp=(t.realizedPnlBase||0)*(m/t.quantity)||open+close;
          out.push({id:`cy-${out.length}-${nk(t.symbol)}-${nk(t.tradeDate)}`,contractKey:k,symbol:t.symbol,underlying:t.underlying,putCall:t.putCall,strike:t.strike,expiry:t.expiry,multiplier:t.multiplier,quantity:m,openedAt:l.t.tradeDate,closedAt:t.tradeDate,openTradeId:l.t.id,closeTradeId:t.id,openingPremium:open,closingCost:Math.abs(close),realizedPnl:rp,status:'closed',rollTo:'',eventType:t.eventType||''});
          l.rem-=m;rem-=m;if(l.rem<=1e-9)lots.shift();}
        if(rem>1e-9)out.push({id:`prior-${out.length}-${nk(t.symbol)}-${nk(t.tradeDate)}`,contractKey:k,symbol:t.symbol,underlying:t.underlying,putCall:t.putCall,strike:t.strike,expiry:t.expiry,multiplier:t.multiplier,quantity:rem,openedAt:'',closedAt:t.tradeDate,openTradeId:'',closeTradeId:t.id,openingPremium:0,closingCost:0,realizedPnl:t.realizedPnlBase||0,status:'closed_prior_period',rollTo:'',eventType:t.eventType||''});
      }
      lots.forEach(l=>out.push({id:`open-${out.length}-${nk(l.t.symbol)}`,contractKey:k,symbol:l.t.symbol,underlying:l.t.underlying,putCall:l.t.putCall,strike:l.t.strike,expiry:l.t.expiry,multiplier:l.t.multiplier,quantity:l.rem,openedAt:l.t.tradeDate,closedAt:'',openTradeId:l.t.id,closeTradeId:'',openingPremium:l.t.netCashFlowBase*(l.rem/l.t.quantity),closingCost:0,realizedPnl:0,status:'open',rollTo:''}));
    });
    const by=new Map();out.filter(c=>c.status!=='open').forEach(c=>{if(!by.has(c.symbol))by.set(c.symbol,[]);by.get(c.symbol).push(c);});
    by.forEach((a,s)=>{const e=Number(exact[s]);if(!Number.isFinite(e))return;const cur=a.reduce((z,c)=>z+(c.realizedPnl||0),0);if(Math.abs(cur)>1e-9)a.forEach(c=>c.realizedPnl=c.realizedPnl*e/cur);else if(a.length===1)a[0].realizedPnl=e;});
    return out;
  }
  function parseActivity(text,fileName){
    const rr=rows(text); if(!rr.some(r=>nk(r._section)==='operaciones')||!rr.some(r=>nk(r._section).includes('informacionsobrelacuenta')))return null;
    let accountId='IBKR',base='EUR',nav=0,cash=0;
    for(const r of rr){const sec=nk(r._section),label=String(r['Nombre del campo']||r['Clase de activo']||r['Resumen de divisa']||''),value=String(r['Valor del campo']||'');
      if(sec.includes('informacionsobrelacuenta')){if(nk(label)==='cuenta')accountId=value||accountId;if(nk(label)==='divisabase')base=(value||base).toUpperCase();}
      if(sec==='valorliquidativo'&&nk(label)==='total')nav=num(r['Actual (total)']);
      if(sec==='informedeefectivo'&&nk(label)==='efectivofinal'&&String(r['Divisa']||'').toLowerCase().includes('base'))cash=num(r['Total']);
    }
    const totals={};rr.forEach(r=>{if(nk(r._section).includes('posicionesabiertas')&&r._kind==='total'&&/opciones/i.test(r['Categoría de activo']||''))totals[String(r['Divisa']||'').toUpperCase()]=num(r['Valor']);});
    const fx={[base]:1},bt=totals[base];if(bt)Object.entries(totals).forEach(([c,v])=>{if(c!==base&&v)fx[c]=Math.abs(bt/v);});
    const exact={};rr.forEach(r=>{if(nk(r._section).includes('resumendelrendimientorealizadoynorealizado')&&/opciones/i.test(r['Categoría de activo']||'')&&r['Símbolo'])exact[String(r['Símbolo']).toUpperCase()]=num(r['Realizada Total']);});
    const trades=[],positions=[],events=[];
    rr.forEach((r,i)=>{const sec=nk(r._section);if(r._kind!=='data'||(!sec.includes('operaciones')&&!sec.includes('posicionesabiertas'))||!/opciones/i.test(r['Categoría de activo']||''))return;const c=contract(r['Símbolo']);if(!c)return;
      const q=num(r['Cantidad']),codes=String(r['Código']||'').split(';').filter(Boolean),set=new Set(codes),isPos=sec.includes('posicionesabiertas'),currency=String(r['Divisa']||'USD').toUpperCase(),rate=fx[currency]||0,commission=num(r['Tarifa/com.']),proceeds=num(r['Productos']),realized=num(r['PyG realizadas']);
      const t={...c,id:`stmt-${i}-${nk(c.symbol)}-${nk(r['Fecha/Hora']||'pos')}`,recordType:isPos?'position':'trade',broker:'IBKR',accountId,assetCategory:'OPT',multiplier:Math.abs(num(r['Mult.']))||100,quantity:Math.abs(q),signedQuantity:q,side:isPos?'':q<0?'SELL':q>0?'BUY':'',openClose:set.has('O')?'OPEN':set.has('C')||set.has('A')||set.has('Al')||set.has('Ex')||set.has('Ep')?'CLOSE':'',tradeDate:String(r['Fecha/Hora']||'').replace(', ','T'),price:Math.abs(num(r['Precio trans.'])),markPrice:Math.abs(num(r['Precio de cier.']||r['Precio de cierre'])),openPrice:Math.abs(num(r['Precio de coste'])),proceeds,commission:Math.abs(commission),commissionSigned:commission,netCashFlow:proceeds+commission,fxRateToBase:rate,netCashFlowBase:rate?(proceeds+commission)*rate:(currency===base?proceeds+commission:0),realizedPnl:realized,realizedPnlBase:rate?realized*rate:(currency===base?realized:0),unrealizedPnl:num(r['PyG no realizadas']),positionValue:num(r['Valor']),positionValueBase:rate?num(r['Valor'])*rate:0,currency,codes,eventType:set.has('A')||set.has('Al')?'assignment':set.has('Ex')?'exercise':set.has('Ep')?'expiration':'',source:'imported',importedAt:now()};t.contractKey=key(t);t.hash=t.id;
      if(isPos)positions.push(t);else{trades.push(t);if(t.eventType)events.push({...t,id:`${t.id}-event`,recordType:'event'});}
    });
    const pos=markBoxes(positions),cy=cycles(trades,exact);
    return {positions:pos,trades,events,cycles:cy,accounts:[{id:accountId,broker:'IBKR',netLiquidation:nav,availableFunds:0,cashBalance:cash,currency:base,updatedAt:now(),source:'activity_statement'}],performance:{realizedByContract:exact,statement:{accountId,baseCurrency:base,netLiquidation:nav,cashBalance:cash,importedAt:now()}},import:{id:`statement-${Date.now()}`,name:fileName,type:'CSV',importedAt:now(),positions:pos.length,trades:trades.length,events:events.length,status:'success',format:'IBKR Activity Statement'}};
  }
  function storage(){for(const k of ['ff_mi_plan_v2','ff_mi_plan_v4']){try{const d=JSON.parse(localStorage.getItem(k)||'null');if(d?.onboardingComplete)return [k,d];}catch{}}return null;}
  function save(parsed){const s=storage();if(!s)throw Error('Primero completa el mapa financiero.');const [k,d]=s,o=d.options||{};d.options={version:2,strategy:{primary:'short_put',targetDelta:.05,dteMin:28,dteMax:56,closeProfitPct:30,assignmentPolicy:'selective',capitalMode:'margin',maxUnderlyingExposurePct:25,...(o.strategy||{})},sync:{provider:'ibkr_flex',status:'not_connected',queryId:'',frequency:'daily',lastSync:'',lastError:'',...(o.sync||{})},...o,accounts:parsed.accounts,positions:parsed.positions,trades:parsed.trades,events:parsed.events,cycles:parsed.cycles,performance:parsed.performance,imports:[parsed.import,...(o.imports||[]).filter(x=>x.name!==parsed.import.name)].slice(0,20)};d.lastUpdated=now();localStorage.setItem(k,JSON.stringify(d));for(const other of ['ff_mi_plan_v2','ff_mi_plan_v4'])if(other!==k&&localStorage.getItem(other)){try{const x=JSON.parse(localStorage.getItem(other));x.options=d.options;x.lastUpdated=d.lastUpdated;localStorage.setItem(other,JSON.stringify(x));}catch{}}return d.options;}
  function install(){const old=$('#options6File');if(!old||old.dataset.activityV7)return;const fresh=old.cloneNode(true);fresh.dataset.activityV7='1';old.id='options6FileLegacy';old.replaceWith(fresh);fresh.addEventListener('change',async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;const state=$('#options6ImportState');state.className='options6-import-state loading';state.classList.remove('hidden');state.innerHTML='<span class="options6-spinner"></span><div><b>Analizando el extracto real de IBKR…</b><small>Reconociendo operaciones, asignaciones, vencimientos y estructuras.</small></div>';
      try{const text=await file.text(),parsed=parseActivity(text,file.name);if(!parsed){const dt=new DataTransfer();dt.items.add(file);old.files=dt.files;old.dispatchEvent(new Event('change',{bubbles:true}));return;}const o=save(parsed),puts=o.positions.filter(p=>p.putCall==='P'&&p.signedQuantity<0&&p.strategyTag!=='box'),boxes=new Set(o.positions.filter(p=>p.strategyTag==='box').map(p=>`${p.underlying}|${p.expiry}`)).size;state.className='options6-import-state success';state.innerHTML=`<span>✓</span><div><b>${parsed.positions.length} posiciones y ${parsed.trades.length} operaciones detectadas</b><small>${puts.length} puts vendidas abiertas · ${boxes} box spread · ${parsed.events.length} eventos</small></div>`;navigator.vibrate?.([12,30,18]);setTimeout(()=>location.reload(),1400);}catch(err){state.className='options6-import-state error';state.innerHTML=`<span>!</span><div><b>No hemos podido leer el extracto</b><small>${String(err.message||err)}</small></div>`;}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(install,300));else setTimeout(install,300);
  new MutationObserver(()=>install()).observe(document.documentElement,{childList:true,subtree:true});
})();
