document.head.insertAdjacentHTML("beforeend",'<link rel="stylesheet" href="ultra.css">');
const ALBUM = {
  id:"liga-demo-v1",
  title:"Liga · Demo MVP",
  clubs:[
    {id:"RMA",name:"Real Madrid",emoji:"⚪",count:12},
    {id:"FCB",name:"FC Barcelona",emoji:"🔵🔴",count:12},
    {id:"ATM",name:"Atlético de Madrid",emoji:"🔴⚪",count:12},
    {id:"BET",name:"Real Betis",emoji:"🟢⚪",count:12},
    {id:"SEV",name:"Sevilla FC",emoji:"⚪🔴",count:12},
    {id:"VIL",name:"Villarreal CF",emoji:"🟡",count:12},
    {id:"ATH",name:"Athletic Club",emoji:"🔴⚪",count:12},
    {id:"RSO",name:"Real Sociedad",emoji:"🔵⚪",count:12},
    {id:"VAL",name:"Valencia CF",emoji:"🦇",count:12},
    {id:"CEL",name:"RC Celta",emoji:"🩵",count:12},
    {id:"GET",name:"Getafe CF",emoji:"🔵",count:12},
    {id:"OSA",name:"CA Osasuna",emoji:"🔴",count:12}
  ]
};
const catalog=[];
for(const club of ALBUM.clubs){
  for(let n=1;n<=club.count;n++){
    catalog.push({id:`${club.id}-${n}`,club:club.id,clubName:club.name,emoji:club.emoji,num:n,title:`${club.name} ${String(n).padStart(2,"0")}`});
  }
}
const MAX=3;
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
let state=loadState();
let deferredInstall=null;
let html5Qr=null;
let incomingSnapshot=null;

function seedCounts(){
  const counts={};
  catalog.forEach(s=>{
    const r=Math.floor(Math.random()*12);
    counts[s.id]=r<2?0:r<10?1:r===10?2:3;
  });
  return counts;
}
function loadState(){
  try{
    const raw=JSON.parse(localStorage.getItem("cromomatch_state_v1"));
    if(raw&&raw.albumId===ALBUM.id) return raw;
  }catch(e){}
  return {albumId:ALBUM.id,owner:"Coleccionista",counts:seedCounts()};
}
function saveState(){
  localStorage.setItem("cromomatch_state_v1",JSON.stringify(state));
  renderAll();
}
function totalRepeats(counts=state.counts){return catalog.reduce((a,s)=>a+Math.max(0,(counts[s.id]||0)-1),0)}
function totalOwned(counts=state.counts){return catalog.reduce((a,s)=>a+((counts[s.id]||0)>0?1:0),0)}
function missingIds(counts=state.counts){return catalog.filter(s=>(counts[s.id]||0)===0).map(s=>s.id)}
function repeatIds(counts=state.counts){return catalog.filter(s=>(counts[s.id]||0)>1).map(s=>s.id)}
function stickerById(id){return catalog.find(s=>s.id===id)}
function toast(msg){
  const t=$("#toast");t.textContent=msg;t.classList.add("show");
  clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove("show"),1800);
}
function haptic(pattern=12){try{navigator.vibrate&&navigator.vibrate(pattern)}catch(e){}}
function celebrate(){
  const fx=$("#matchFx"); if(!fx)return; fx.innerHTML="";
  const palette=["#8b5cf6","#ec4899","#38bdf8","#34d399","#f59e0b"];
  for(let i=0;i<34;i++){
    const p=document.createElement("i");p.className="fx-piece";
    p.style.left=(8+Math.random()*84)+"%";p.style.background=palette[i%palette.length];
    p.style.setProperty("--dur",(1.2+Math.random()*.9)+"s");p.style.setProperty("--drift",(-90+Math.random()*180)+"px");p.style.setProperty("--rot",Math.round(Math.random()*180)+"deg");
    p.style.animationDelay=(Math.random()*.15)+"s";fx.appendChild(p);
  }
  for(let i=0;i<14;i++){
    const s=document.createElement("i");s.className="fx-spark";s.style.left="50%";s.style.top="42%";s.style.background=palette[i%palette.length];s.style.color=palette[i%palette.length];
    const angle=Math.PI*2*i/14,dist=65+Math.random()*100;s.style.setProperty("--x",Math.cos(angle)*dist+"px");s.style.setProperty("--y",Math.sin(angle)*dist+"px");s.style.animationDelay=(Math.random()*.08)+"s";fx.appendChild(s);
  }
  setTimeout(()=>fx.innerHTML="",2300);haptic([18,35,18]);
}
function go(view){
  $$(".view").forEach(v=>v.classList.toggle("active",v.id===view));
  $$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.go===view));
  window.scrollTo({top:0,behavior:"smooth"});
  if(view==="swapView") refreshQr();
}
function renderStats(){
  const owned=totalOwned(),miss=catalog.length-owned,reps=totalRepeats();
  [["#ownedCount",owned],["#missingCount",miss],["#repeatCount",reps]].forEach(([sel,val])=>{const el=$(sel);if(el.textContent!==String(val)){el.textContent=val;el.classList.remove("stat-pulse");void el.offsetWidth;el.classList.add("stat-pulse");}});
  const pct=Math.round(owned/catalog.length*100);
  $("#completionPct").textContent=pct+"%";
  $("#progressRing").style.setProperty("--pct",pct+"%");
  $("#activeAlbumTitle").textContent=ALBUM.title;
}
function populateFilters(){
  const sel=$("#clubFilter");
  if(sel.options.length>1)return;
  sel.innerHTML='<option value="all">Todos los equipos</option>'+ALBUM.clubs.map(c=>`<option value="${c.id}">${c.name}</option>`).join("");
}
function statusOf(q){return q===0?"missing":q>1?"repeat":"owned"}
function renderAlbum(){
  populateFilters();
  const q=$("#searchSticker").value.trim().toLowerCase();
  const club=$("#clubFilter").value||"all";
  const status=$("#statusFilter").value||"all";
  const box=$("#stickerGroups");box.innerHTML="";
  ALBUM.clubs.forEach(c=>{
    if(club!=="all"&&club!==c.id)return;
    const stickers=catalog.filter(s=>s.club===c.id).filter(s=>{
      const qty=state.counts[s.id]||0,st=statusOf(qty);
      const match=!q||s.title.toLowerCase().includes(q)||s.id.toLowerCase().includes(q)||c.name.toLowerCase().includes(q);
      return match&&(status==="all"||st===status);
    });
    if(!stickers.length)return;
    const owned=stickers.filter(s=>(state.counts[s.id]||0)>0).length;
    const g=document.createElement("div");g.className="club-group";
    g.innerHTML=`<div class="club-head"><h3>${c.emoji} ${c.name}</h3><small>${owned}/${stickers.length}</small></div><div class="sticker-list"></div>`;
    const list=g.querySelector(".sticker-list");
    stickers.forEach(s=>{
      const qty=state.counts[s.id]||0;
      const row=document.createElement("div");row.className=`sticker-row ${statusOf(qty)}`;
      row.innerHTML=`<div class="sticker-status"></div><div class="sticker-main"><b>${s.id}</b><small>${qty===0?"Me falta":qty===1?"Lo tengo":`Tengo ${qty} · ${qty-1} repe${qty-1>1?"s":""}`}</small></div><div class="counter"><button data-d="-1">−</button><b>${qty}</b><button data-d="1">+</button></div>`;
      row.querySelectorAll("button").forEach(b=>b.onclick=()=>{
        const d=+b.dataset.d;state.counts[s.id]=Math.max(0,Math.min(MAX,(state.counts[s.id]||0)+d));haptic(8);saveState();
      });
      list.appendChild(row);
    });
    box.appendChild(g);
  });
  if(!box.children.length)box.innerHTML='<div class="info-card"><b>No hay cromos con esos filtros.</b></div>';
}
function bytesToB64url(bytes){
  let bin="";bytes.forEach(b=>bin+=String.fromCharCode(b));
  return btoa(bin).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
}
function b64urlToBytes(s){
  s=s.replace(/-/g,"+").replace(/_/g,"/");
  while(s.length%4)s+="=";
  const bin=atob(s);return Uint8Array.from(bin,c=>c.charCodeAt(0));
}
function packCounts(counts){
  const bytes=new Uint8Array(Math.ceil(catalog.length/4));
  catalog.forEach((s,i)=>{
    const q=Math.max(0,Math.min(3,counts[s.id]||0));
    const bi=Math.floor(i/4),shift=(i%4)*2;
    bytes[bi]|=(q&3)<<shift;
  });
  return bytesToB64url(bytes);
}
function unpackCounts(encoded){
  const bytes=b64urlToBytes(encoded),counts={};
  catalog.forEach((s,i)=>{
    const bi=Math.floor(i/4),shift=(i%4)*2;
    counts[s.id]=(bytes[bi]>>shift)&3;
  });
  return counts;
}
function makePayload(){
  return {v:1,a:ALBUM.id,n:state.owner||"Coleccionista",s:packCounts(state.counts)};
}
function encodePayload(p){
  const text=JSON.stringify(p);
  return bytesToB64url(new TextEncoder().encode(text));
}
function decodePayload(encoded){
  const bytes=b64urlToBytes(encoded);
  const text=new TextDecoder().decode(bytes);
  const p=JSON.parse(text);
  if(p.v!==1||p.a!==ALBUM.id||!p.s)throw new Error("QR de otro álbum o versión");
  return {owner:p.n||"Coleccionista",counts:unpackCounts(p.s)};
}
function publicBase(){
  return location.origin+location.pathname.replace(/index\.html$/g,"");
}
function makeSwapUrl(){
  return `${publicBase()}?swap=${encodeURIComponent(encodePayload(makePayload()))}`;
}
function refreshQr(){
  $("#qrOwnerTitle").textContent=state.owner||"Coleccionista";
  const box=$("#qrBox");box.innerHTML="";
  const url=makeSwapUrl();
  if(window.QRCode){
    new QRCode(box,{text:url,width:230,height:230,colorDark:"#111827",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.M});
  }else{
    box.innerHTML='<div class="info-card"><b>No se pudo cargar el generador QR.</b><p>Puedes usar “Compartir enlace”.</p></div>';
  }
}
function compareWith(snapshot){
  incomingSnapshot=snapshot;
  const theirRepeats=repeatIds(snapshot.counts);
  const myMissing=new Set(missingIds());
  const myRepeats=repeatIds();
  const theirMissing=new Set(missingIds(snapshot.counts));
  const receive=theirRepeats.filter(id=>myMissing.has(id));
  const give=myRepeats.filter(id=>theirMissing.has(id));
  showMatch(snapshot.owner,receive,give);
}
function pretty(id){
  const s=stickerById(id);return s?`${s.emoji} ${id}`:id;
}
function chips(ids){
  return ids.length?ids.map(id=>`<span class="match-chip">${pretty(id)}</span>`).join(""):'<span class="match-chip">Ninguno</span>';
}
function showMatch(owner,receive,give){
  go("swapView");
  $("#matchResult").hidden=false;
  $("#matchTitle").textContent=`Match con ${owner}`;
  $("#matchSubtitle").textContent=`${receive.length} te sirven · ${give.length} tuyos le sirven`;
  $("#receiveList").innerHTML=chips(receive);
  $("#giveList").innerHTML=chips(give);
  $("#proposalBox").hidden=true;
  if(receive.length||give.length)celebrate();
  $("#matchResult").scrollIntoView({behavior:"smooth",block:"start"});
  $("#bestTradeBtn").onclick=()=>{
    haptic(12);
    const n=Math.min(receive.length,give.length);
    const r=receive.slice(0,n),g=give.slice(0,n),box=$("#proposalBox");
    box.hidden=false;
    if(!n){box.innerHTML='<h3>No hay intercambio 1×1 directo</h3><p>Uno de los dos lados no tiene cromos útiles para el otro.</p>';return;}
    box.innerHTML=`<h3>⚡ Propuesta: ${n} × ${n}</h3><div class="proposal-grid"><div class="proposal-box"><small>Tú recibes</small><div class="match-chips">${chips(r)}</div></div><div class="proposal-box"><small>Tú entregas</small><div class="match-chips">${chips(g)}</div></div></div><p style="font-size:11px;color:#6b7280;margin-bottom:0">En la siguiente versión, al confirmar, ambos móviles actualizarán el álbum sincronizado.</p>`;
    box.scrollIntoView({behavior:"smooth",block:"center"});
  };
}
function processSwapText(text){
  try{
    const raw=text.trim();
    let code=raw;
    if(raw.includes("?swap=")){
      code=new URL(raw).searchParams.get("swap")||"";
    }else if(raw.startsWith("http")){
      code=new URL(raw).searchParams.get("swap")||"";
    }
    compareWith(decodePayload(decodeURIComponent(code)));
  }catch(e){toast("No reconozco ese QR/enlace");}
}
async function startScanner(){
  if(!window.Html5Qrcode){toast("Escáner no disponible. Usa la cámara normal.");return;}
  try{
    if(html5Qr){await html5Qr.stop().catch(()=>{});html5Qr.clear();}
    html5Qr=new Html5Qrcode("reader");
    await html5Qr.start({facingMode:"environment"},{fps:10,qrbox:{width:240,height:240}},async decoded=>{
      await html5Qr.stop().catch(()=>{});
      processSwapText(decoded);
    },()=>{});
    $("#startScannerBtn").textContent="Escaneando…";
  }catch(e){toast("No pude abrir la cámara");}
}
function setSwapTab(which){
  $$(".swap-tab").forEach(b=>b.classList.toggle("active",b.dataset.swap===which));
  $("#showQrPanel").classList.toggle("active",which==="show");
  $("#scanQrPanel").classList.toggle("active",which==="scan");
  if(which==="show")refreshQr();
}
function showNameModal(){
  $("#modalTitle").textContent="Tu nombre para intercambios";
  $("#modalBody").innerHTML=`<input id="modalNameInput" maxlength="28" value="${(state.owner||"").replace(/"/g,"&quot;")}" placeholder="Ej. Luis">`;
  $("#modal").hidden=false;
  setTimeout(()=>$("#modalNameInput").focus(),80);
  $("#modalOk").onclick=()=>{state.owner=$("#modalNameInput").value.trim()||"Coleccionista";saveState();$("#modal").hidden=true;refreshQr();};
}
function exportState(){
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="cromomatch-backup.json";a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function importState(file){
  const r=new FileReader();r.onload=()=>{
    try{const o=JSON.parse(r.result);if(o.albumId!==ALBUM.id||!o.counts)throw 0;state=o;saveState();toast("Colección importada ✅");}
    catch(e){toast("Archivo no válido");}
  };r.readAsText(file);
}
function renderAll(){
  renderStats();renderAlbum();
  $("#ownerNameInput").value=state.owner||"";
  $("#qrOwnerTitle").textContent=state.owner||"Coleccionista";
}
function init(){
  $$("[data-go]").forEach(b=>b.addEventListener("click",()=>{haptic(6);go(b.dataset.go)}));
  $("#quickQrBtn").onclick=()=>{go("swapView");setSwapTab("show");};
  $$(".swap-tab").forEach(b=>b.onclick=()=>setSwapTab(b.dataset.swap));
  $("#searchSticker").oninput=renderAlbum;$("#clubFilter").onchange=renderAlbum;$("#statusFilter").onchange=renderAlbum;
  $("#editNameBtn").onclick=showNameModal;$("#modalCancel").onclick=()=>$("#modal").hidden=true;
  $("#shareQrLinkBtn").onclick=async()=>{
    const url=makeSwapUrl();
    if(navigator.share){try{await navigator.share({title:"CromoMatch",text:"Compara tu colección con la mía",url});return}catch(e){}}
    await navigator.clipboard.writeText(url);toast("Enlace copiado");
  };
  $("#copyQrLinkBtn").onclick=async()=>{await navigator.clipboard.writeText(makeSwapUrl());toast("Enlace copiado");};
  $("#startScannerBtn").onclick=startScanner;
  $("#processPasteBtn").onclick=()=>processSwapText($("#swapPaste").value);
  $("#saveOwnerNameBtn").onclick=()=>{state.owner=$("#ownerNameInput").value.trim()||"Coleccionista";saveState();toast("Nombre guardado");};
  $("#resetDemoBtn").onclick=()=>{if(confirm("¿Reiniciar la colección de demostración?")){state.counts=seedCounts();saveState();toast("Demo reiniciada");}};
  $("#exportBtn").onclick=exportState;$("#importBtn").onclick=()=>$("#importFile").click();$("#importFile").onchange=e=>e.target.files[0]&&importState(e.target.files[0]);
  window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;$("#installBtn").hidden=false;});
  $("#installBtn").onclick=async()=>{if(deferredInstall){deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;$("#installBtn").hidden=true;}};
  if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
  renderAll();refreshQr();

  const incoming=new URLSearchParams(location.search).get("swap");
  if(incoming){
    try{compareWith(decodePayload(decodeURIComponent(incoming)));setSwapTab("show");}
    catch(e){toast("El enlace de intercambio no es válido");}
  }
}
document.addEventListener("DOMContentLoaded",init);