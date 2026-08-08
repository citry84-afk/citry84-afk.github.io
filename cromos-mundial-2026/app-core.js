const clone=o=>JSON.parse(JSON.stringify(o));
let data;
try{data=JSON.parse(localStorage.getItem('album2026_data'))||clone(initial)}catch(e){data=clone(initial)}
function save(){localStorage.setItem('album2026_data',JSON.stringify(data));renderAll()}
function codeOf(t,n){return t==='FWC'?`FWC${n}`:`${t} ${n}`}
function normalizeCode(v){
 let s=(v||'').toUpperCase().trim().replace(/[._-]/g,' ').replace(/\s+/g,' ');
 let m=s.match(/^FWC\s*(\d{1,2})$/); if(m)return {team:'FWC',num:+m[1]};
 m=s.match(/^([A-Z]{3})\s*(\d{1,2})$/); return m?{team:m[1],num:+m[2]}:null;
}
function missingSet(){let s=new Set();Object.entries(data.missing).forEach(([t,a])=>a.forEach(n=>s.add(codeOf(t,n))));return s}
function uncertainSet(){let s=new Set();Object.entries(data.uncertain||{}).forEach(([t,a])=>a.forEach(n=>s.add(codeOf(t,n))));return s}
function repeatMap(){let m=new Map();Object.entries(data.repeats).forEach(([t,o])=>Object.entries(o).forEach(([n,q])=>m.set(codeOf(t,+n),+q)));return m}
function teamHeader(t){const flag=teams[t]?.flag?`<span class="teamflag" aria-hidden="true">${teams[t].flag}</span>`:'';return `${flag}<span class="teamname">${teams[t].name}</span> <span class="teamcode">${t}</span>`}
function counts(){
 const miss=[...missingSet()].length, unc=[...uncertainSet()].length; let reps=0;repeatMap().forEach(q=>reps+=q);
 document.querySelector('#statMissing').textContent=miss;document.querySelector('#statUncertain').textContent=unc;document.querySelector('#statRepeats').textContent=reps;
}
function groupOrder(){return ['Especiales',...Array.from({length:12},(_,i)=>`Grupo ${String.fromCharCode(65+i)}`)]}
function initGroupFilters(){['missingGroup','repeatGroup'].forEach(id=>{const s=document.querySelector('#'+id);if(!s)return;groupOrder().forEach(g=>{const o=document.createElement('option');o.value=g;o.textContent=g;s.appendChild(o)})})}
function renderMissing(){
 const q=document.querySelector('#missingSearch').value.trim().toLowerCase(); const gf=document.querySelector('#missingGroup')?.value||''; const box=document.querySelector('#missingGroups'); box.innerHTML='';
 groupOrder().forEach(g=>{if(gf&&g!==gf)return;
  const codes=Object.keys(teams).filter(t=>teams[t].group===g);
  const visible=codes.filter(t=>{const text=`${teams[t].name} ${t}`.toLowerCase();const nums=[...(data.missing[t]||[]),...((data.uncertain||{})[t]||[])].join(' ');return !q||text.includes(q)||`${t} ${nums}`.toLowerCase().includes(q)});
  if(!visible.length)return;
  const total=visible.reduce((n,t)=>n+(data.missing[t]?.length||0)+((data.uncertain||{})[t]?.length||0),0);
  const el=document.createElement('div');el.className='group';el.innerHTML=`<div class="grouphead"><b>${g}</b><span class="countpill">${total} pendientes</span></div>`;
  visible.forEach(t=>{
   const a=data.missing[t]||[], u=((data.uncertain||{})[t]||[]); const row=document.createElement('div');row.className='team';
   row.innerHTML=`<div class="teamtop"><div>${teamHeader(t)}</div></div><div class="chips"></div>${(!a.length&&!u.length)?'<div class="empty">✓ Completa</div>':''}`;
   const chips=row.querySelector('.chips');
   a.forEach(n=>{const b=document.createElement('button');b.className='chip missing';b.textContent=codeOf(t,n);b.title='Toca para marcar como conseguido';b.onclick=()=>markGot(t,n,false);chips.appendChild(b)});
   u.forEach(n=>{const b=document.createElement('button');b.className='chip uncertain';b.innerHTML=`${codeOf(t,n)} <span class="x">?</span>`;b.title='Dudoso: toca para confirmar que falta';b.onclick=()=>confirmUncertain(t,n);chips.appendChild(b)});
   el.appendChild(row);
  });box.appendChild(el);
 });
}
