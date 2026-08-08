function renderRepeats(){
 const q=document.querySelector('#repeatSearch').value.trim().toLowerCase(); const box=document.querySelector('#repeatGroups'); box.innerHTML='';
 groupOrder().forEach(g=>{
  const codes=Object.keys(teams).filter(t=>teams[t].group===g);
  const visible=codes.filter(t=>{const text=`${teams[t].name} ${t}`.toLowerCase(); const nums=Object.keys(data.repeats[t]||{}).join(' ');return (!q||text.includes(q)||`${t} ${nums}`.toLowerCase().includes(q)) && Object.keys(data.repeats[t]||{}).length});
  if(!visible.length)return;
  const total=visible.reduce((n,t)=>n+Object.values(data.repeats[t]||{}).reduce((a,b)=>a+(+b),0),0);
  const el=document.createElement('div');el.className='group';el.innerHTML=`<div class="grouphead"><b>${g}</b><span class="countpill">${total} repes</span></div>`;
  visible.forEach(t=>{const row=document.createElement('div');row.className='team';row.innerHTML=`<div class="teamtop"><div><span class="teamname">${teams[t].name}</span> <span class="teamcode">${t}</span></div></div><div class="chips"></div>`;const chips=row.querySelector('.chips');Object.entries(data.repeats[t]||{}).sort((a,b)=>+a[0]-+b[0]).forEach(([n,qty])=>{const b=document.createElement('button');b.className='chip';b.innerHTML=`${codeOf(t,+n)}${qty>1?` <span class="x">×${qty}</span>`:''}`;b.title='Toca cuando lo entregues en un cambio';b.onclick=()=>useRepeat(t,+n);chips.appendChild(b)});el.appendChild(row)});box.appendChild(el);
 });
 if(!box.children.length)box.innerHTML='<div class="exchange-card"><b>No hay repes que coincidan con la búsqueda.</b></div>';
}
function markGot(t,n){if(!confirm(`¿Marcar ${codeOf(t,n)} como conseguido?`))return;data.missing[t]=data.missing[t].filter(x=>x!==n);save();toast(`${codeOf(t,n)} conseguido 🎉`)}
function confirmUncertain(t,n){if(!confirm(`${codeOf(t,n)} está marcado como dudoso.\n\nAceptar = confirmar que SÍ falta.`))return;data.uncertain[t]=data.uncertain[t].filter(x=>x!==n);if(!data.missing[t].includes(n))data.missing[t].push(n);data.missing[t].sort((a,b)=>a-b);save();toast(`${codeOf(t,n)} confirmado como faltante`)}
function useRepeat(t,n){if(!confirm(`¿Has entregado ${codeOf(t,n)} en un cambio?`))return;const q=+(data.repeats[t][n]||0);if(q<=1)delete data.repeats[t][n];else data.repeats[t][n]=q-1;save();toast('Repe actualizado')}
function checkQuick(){const p=normalizeCode(document.querySelector('#quickCode').value),r=document.querySelector('#quickResult');if(!p||!teams[p.team]){r.className='warn';r.textContent='No reconozco ese código. Prueba, por ejemplo, GER 1 o FWC15.';return}const c=codeOf(p.team,p.num),m=missingSet(),u=uncertainSet(),rm=repeatMap();if(m.has(c)){r.className='ok';r.textContent=`✅ ${c}: ¡LO NECESITAS!`;}else if(u.has(c)){r.className='warn';r.textContent=`🟠 ${c}: está marcado como DUDOSO / por confirmar.`;}else if(rm.has(c)){r.className='bad';r.textContent=`🔁 ${c}: ya lo tienes repetido (${rm.get(c)} disponible${rm.get(c)>1?'s':''}).`;}else{r.className='muted';r.textContent=`👌 ${c}: no está en faltantes ni en repes.`;}}
function parseCodes(text){
 const s=(text||'').toUpperCase(); const out=[]; const re=/(FWC\s*\d{1,2}|[A-Z]{3}\s*\d{1,2})/g; let m;while((m=re.exec(s))!==null){const p=normalizeCode(m[1]);if(p&&teams[p.team])out.push(codeOf(p.team,p.num))}return [...new Set(out)];
}
function compare(){const has=parseCodes(document.querySelector('#otherHas').value),needs=parseCodes(document.querySelector('#otherNeeds').value),mine=missingSet(),reps=repeatMap();const they=has.filter(c=>mine.has(c)),i=needs.filter(c=>reps.has(c));renderPills('#theyGive',they);renderPills('#iGive',i);const n=Math.min(they.length,i.length);document.querySelector('#tradeSummary').innerHTML=n?`💡 Hay <b>${n}</b> intercambio${n>1?'s':''} directo${n>1?'s':''} posible${n>1?'s':''} 1×1. ${they.length>i.length?'Ellos tienen más cromos que te sirven.':i.length>they.length?'Tú tienes más cromos que les sirven.':'¡Cuadra perfecto en cantidad!'}`:'No aparece un intercambio directo con los códigos pegados.';}
function renderPills(sel,a){const e=document.querySelector(sel);e.innerHTML=a.length?a.map(c=>`<span class="matchpill">${c}</span>`).join(''):'<span class="muted">Ninguno</span>'}
