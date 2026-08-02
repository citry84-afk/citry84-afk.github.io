(()=>{
'use strict';
if(window.__FF_OPTIONS_V9__) return;
window.__FF_OPTIONS_V9__=true;

const STORE='ff_options_safe_v9';
const euro=(n,currency='EUR')=>new Intl.NumberFormat('es-ES',{style:'currency',currency,maximumFractionDigits:0}).format(Number(n)||0);
const num=v=>{const n=Number(String(v??'').replace(',','.'));return Number.isFinite(n)?n:0};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let data={strategy:{delta:.05,minDte:28,maxDte:56,targetProfit:30},imports:[],open:[],trades:[],summary:null};
try{data={...data,...JSON.parse(localStorage.getItem(STORE)||'{}')}}catch(_){}

const style=document.createElement('style');
style.textContent=`
.ffo-wrap{display:grid;gap:18px;padding-bottom:110px}.ffo-hero{padding:24px;border-radius:26px;color:#fff;background:radial-gradient(circle at 85% 20%,rgba(47,126,240,.5),transparent 32%),linear-gradient(135deg,#082f68,#061631);box-shadow:0 24px 60px rgba(8,42,92,.22)}.ffo-hero h2{margin:6px 0 8px;font-size:clamp(28px,6vw,42px)}.ffo-hero p{margin:0;color:#c7d7eb;line-height:1.5}.ffo-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.ffo-card,.ffo-panel{background:rgba(255,255,255,.94);border:1px solid rgba(8,42,92,.1);border-radius:22px;box-shadow:0 12px 34px rgba(17,54,104,.07)}.ffo-card{padding:18px}.ffo-card span{display:block;color:#71839b;font-size:13px}.ffo-card strong{display:block;margin-top:7px;color:#082a5c;font-size:24px}.ffo-panel{padding:20px}.ffo-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.ffo-head h3{margin:0;color:#082a5c}.ffo-head p{margin:6px 0 0;color:#708198;line-height:1.45}.ffo-upload{display:block;margin-top:16px;border:2px dashed rgba(36,111,229,.28);border-radius:20px;padding:22px;text-align:center;background:#f7faff}.ffo-upload input{display:none}.ffo-btn{display:inline-block;border:0;border-radius:15px;padding:12px 17px;font-weight:800;font-size:14px;cursor:pointer}.ffo-primary{color:#fff;background:linear-gradient(135deg,#ff8a1d,#ff6f0f);box-shadow:0 10px 24px rgba(255,112,15,.22)}.ffo-fields{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:16px}.ffo-field label{display:block;color:#63748d;font-size:12px;font-weight:800;margin-bottom:6px}.ffo-field input{width:100%;box-sizing:border-box;border:1px solid #dbe5f2;border-radius:14px;padding:12px;background:#fff;color:#082a5c;font:700 15px system-ui}.ffo-list{display:grid;gap:10px;margin-top:15px}.ffo-row{display:grid;grid-template-columns:1.5fr .7fr .7fr .7fr;gap:10px;align-items:center;padding:13px;border-radius:16px;background:#f7faff;border:1px solid #e6eef9}.ffo-row b{color:#082a5c}.ffo-row small{color:#71839b}.ffo-pill{display:inline-flex;width:max-content;padding:5px 9px;border-radius:999px;font-size:11px;font-weight:850;background:#eaf2ff;color:#165bb8}.ffo-pill.orange{background:#fff0e3;color:#b34b00}.ffo-empty{text-align:center;padding:26px;color:#71839b}.ffo-note{margin-top:12px;padding:12px 14px;border-radius:14px;background:#fff8ef;color:#8a4b0d;font-size:13px;line-height:1.45}.ffo-toast{position:fixed;left:50%;bottom:92px;z-index:9999;transform:translate(-50%,18px);opacity:0;background:#082a5c;color:#fff;border-radius:999px;padding:11px 16px;font-weight:800;transition:.25s}.ffo-toast.show{opacity:1;transform:translate(-50%,0)}@media(max-width:760px){.ffo-grid,.ffo-fields{grid-template-columns:repeat(2,minmax(0,1fr))}.ffo-row{grid-template-columns:1fr 1fr}.ffo-row>*:first-child{grid-column:1/-1}}`;
document.head.appendChild(style);

function cleanLegacy(){
  [...document.querySelectorAll('body > div, body > dialog')].forEach(el=>{
    if((el.textContent||'').includes('No se pudo cargar el módulo de opciones')) el.remove();
  });
  document.body.style.overflow='';
}
cleanLegacy();
setTimeout(cleanLegacy,500);

function save(){localStorage.setItem(STORE,JSON.stringify(data))}
function toast(msg){
  let el=document.querySelector('.ffo-toast');
  if(!el){el=document.createElement('div');el.className='ffo-toast';document.body.appendChild(el)}
  el.textContent=msg;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),1800);
  if(navigator.vibrate) navigator.vibrate([8,20,10]);
}
function parseCSV(text){
  const out=[];let row=[],field='',q=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(q){
      if(c==='"'&&text[i+1]==='"'){field+='"';i++}
      else if(c==='"')q=false;
      else field+=c;
    }else{
      if(c==='"')q=true;
      else if(c===','){row.push(field);field=''}
      else if(c==='\n'){row.push(field.replace(/\r$/,''));out.push(row);row=[];field=''}
      else field+=c;
    }
  }
  if(field||row.length){row.push(field);out.push(row)}
  return out;
}
function symbolParts(symbol){
  const m=String(symbol).match(/^([A-Z0-9.]+)\s+(\d{2}[A-Z]{3}\d{2})\s+([\d.]+)\s+([PC])$/);
  return m?{underlying:m[1],expiry:m[2],strike:num(m[3]),right:m[4]}:{underlying:symbol,expiry:'',strike:0,right:''};
}
function detectBoxes(open){
  const groups={};
  open.forEach(p=>{const k=p.underlying+'|'+p.expiry;(groups[k]??=[]).push(p)});
  const boxes=[];
  Object.values(groups).forEach(g=>{
    const strikes=[...new Set(g.map(x=>x.strike))].sort((a,b)=>a-b);
    if(g.length===4&&strikes.length===2&&strikes.every(s=>g.some(x=>x.strike===s&&x.right==='C')&&g.some(x=>x.strike===s&&x.right==='P'))){
      boxes.push({underlying:g[0].underlying,expiry:g[0].expiry,strikes,legs:g});
      g.forEach(x=>x.structure='box');
    }
  });
  return boxes;
}
function analyse(rows,name){
  const open=[],trades=[];
  for(const r of rows){
    if(r[0]==='Posiciones abiertas'&&r[1]==='Data'&&String(r[3]).includes('Opciones')){
      const p=symbolParts(r[5]);
      open.push({...p,symbol:r[5],currency:r[4]||'USD',quantity:num(r[6]),multiplier:num(r[7])||100,costPrice:num(r[8]),costBasis:num(r[9]),closePrice:num(r[10]),value:num(r[11]),unrealized:num(r[12]),structure:''});
    }
    if(r[0]==='Operaciones'&&r[1]==='Data'&&String(r[3]).includes('Opciones')){
      const p=symbolParts(r[5]);
      trades.push({...p,symbol:r[5],currency:r[4]||'USD',date:r[6],quantity:num(r[7]),price:num(r[8]),proceeds:num(r[10]),commission:num(r[11]),realized:num(r[13]),code:r[15]||''});
    }
  }
  const boxes=detectBoxes(open);
  const nakedShortPuts=open.filter(x=>x.right==='P'&&x.quantity<0&&x.structure!=='box');
  const assignmentExposure=nakedShortPuts.reduce((s,x)=>s+x.strike*Math.abs(x.quantity)*x.multiplier,0);
  const realized=trades.reduce((s,x)=>s+x.realized,0);
  return {open,trades,summary:{file:name,rows:rows.length,openCount:open.length,tradeCount:trades.length,boxes:boxes.length,nakedPuts:nakedShortPuts.length,assignmentExposure,realized,unrealized:open.reduce((s,x)=>s+x.unrealized,0),updatedAt:new Date().toISOString()}};
}
function addNav(){
  const desktop=document.querySelector('.desktop-nav'),mobile=document.querySelector('.mobile-nav');
  if(desktop&&!desktop.querySelector('[data-view="options-safe"]')){
    const b=document.createElement('button');b.dataset.view='options-safe';b.textContent='Opciones';
    const before=desktop.querySelector('[data-view="report"]')||desktop.lastElementChild;desktop.insertBefore(b,before);
  }
  if(mobile&&!mobile.querySelector('[data-view="options-safe"]')){
    const b=document.createElement('button');b.dataset.view='options-safe';b.innerHTML='<span>◎</span>Opciones';
    const before=mobile.querySelector('[data-view="report"]')||mobile.lastElementChild;mobile.insertBefore(b,before);
  }
}
function metrics(){
  const s=data.summary||{};
  return `<div class="ffo-grid"><div class="ffo-card"><span>Operaciones detectadas</span><strong>${s.tradeCount||0}</strong></div><div class="ffo-card"><span>Posiciones abiertas</span><strong>${s.openCount||0}</strong></div><div class="ffo-card"><span>Puts desnudas abiertas</span><strong>${s.nakedPuts||0}</strong></div><div class="ffo-card"><span>Box spreads</span><strong>${s.boxes||0}</strong></div></div>`;
}
function render(){
  cleanLegacy();addNav();
  document.querySelectorAll('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view==='options-safe'));
  const root=document.querySelector('#viewRoot');if(!root)return;
  const s=data.summary;
  root.innerHTML=`<div class="ffo-wrap">
    <section class="ffo-hero"><span class="ffo-pill orange">CENTRO DE OPCIONES · SAFARI</span><h2>Tu operativa, sin preguntas imposibles.</h2><p>Importa el informe de actividad de Interactive Brokers. El análisis se realiza en este dispositivo y no envía el archivo a ningún servidor.</p></section>
    ${metrics()}
    <section class="ffo-panel"><div class="ffo-head"><div><h3>Tu estrategia</h3><p>Estas reglas sirven para interpretar las posiciones y avisarte, no para ejecutar órdenes.</p></div></div><div class="ffo-fields"><div class="ffo-field"><label>Delta habitual</label><input id="ffoDelta" type="number" min="0" max="1" step=".01" value="${data.strategy.delta}"></div><div class="ffo-field"><label>Vencimiento mínimo (días)</label><input id="ffoMin" type="number" min="1" value="${data.strategy.minDte}"></div><div class="ffo-field"><label>Vencimiento máximo (días)</label><input id="ffoMax" type="number" min="1" value="${data.strategy.maxDte}"></div><div class="ffo-field"><label>Objetivo de beneficio (%)</label><input id="ffoTarget" type="number" min="1" max="100" value="${data.strategy.targetProfit}"></div></div></section>
    <section class="ffo-panel"><div class="ffo-head"><div><h3>Importar informe de Interactive Brokers</h3><p>Compatible con el CSV de “Informe de actividad” en español.</p></div>${s?`<span class="ffo-pill">Último: ${esc(s.file)}</span>`:''}</div><label class="ffo-upload"><input id="ffoFile" type="file" accept=".csv,text/csv"><div style="font-size:34px">⇧</div><b>Seleccionar CSV de IBKR</b><p style="margin:7px 0 14px;color:#71839b">Se procesa localmente en Safari.</p><span class="ffo-btn ffo-primary">Elegir archivo</span></label><div class="ffo-note">No subas contraseñas ni tokens. El número de cuenta puede aparecer en el CSV, pero esta versión no lo transmite fuera del dispositivo.</div></section>
    <section class="ffo-panel"><div class="ffo-head"><div><h3>Posiciones abiertas</h3><p>${s?`${s.openCount} patas detectadas · ${s.boxes} estructura(s) box`:'Importa un archivo para construir esta vista.'}</p></div></div><div class="ffo-list">${data.open.length?data.open.map(p=>`<div class="ffo-row"><div><b>${esc(p.symbol)}</b><br><small>${p.structure==='box'?'Pata de box spread':p.quantity<0?'Posición vendida':'Posición comprada'}</small></div><span>${p.quantity} contratos</span><span>${euro(p.value,p.currency)}</span><span class="${p.unrealized>=0?'ffo-pill':'ffo-pill orange'}">${euro(p.unrealized,p.currency)}</span></div>`).join(''):'<div class="ffo-empty">Todavía no hay posiciones importadas.</div>'}</div></section>
    <section class="ffo-panel"><div class="ffo-head"><div><h3>Resumen de riesgo</h3><p>La exposición excluye las puts que forman parte de un box spread detectado.</p></div></div><div class="ffo-list">${s?`<div class="ffo-row"><div><b>Exposición potencial por asignación</b><br><small>Puts vendidas independientes</small></div><span>${s.nakedPuts} puts</span><span>${euro(s.assignmentExposure,'USD')}</span><span class="ffo-pill">${s.nakedPuts?'Revisar':'Sin exposición'}</span></div><div class="ffo-row"><div><b>Resultado realizado informado</b><br><small>Suma de filas de operaciones; pendiente de ajuste por asignaciones</small></div><span>${s.tradeCount} operaciones</span><span>${euro(s.realized,'USD')}</span><span class="ffo-pill">IBKR</span></div>`:'<div class="ffo-empty">El resumen aparecerá después de importar.</div>'}</div></section>
  </div>`;
  document.querySelector('#ffoFile')?.addEventListener('change',async e=>{
    const file=e.target.files?.[0];if(!file)return;
    try{toast('Analizando el CSV…');const text=await file.text();const result=analyse(parseCSV(text),file.name);data={...data,...result,imports:[...(data.imports||[]),{name:file.name,date:new Date().toISOString(),...result.summary}].slice(-10)};save();render();toast(`✓ ${result.summary.tradeCount} operaciones detectadas`)}catch(error){console.error(error);toast('No se pudo interpretar el archivo')}
  });
  const bind=(id,key)=>document.querySelector(id)?.addEventListener('change',e=>{data.strategy[key]=num(e.target.value);save();toast('✓ Regla guardada')});
  bind('#ffoDelta','delta');bind('#ffoMin','minDte');bind('#ffoMax','maxDte');bind('#ffoTarget','targetProfit');
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-view="options-safe"]');if(!b)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();render()},true);
addNav();
new MutationObserver(addNav).observe(document.body,{childList:true,subtree:true});
const requested=new URL(location.href).searchParams.get('opciones')==='1'||location.hash==='#opciones';
if(requested)setTimeout(render,700);
})();