(async()=>{
  'use strict';
  const removeLegacy=()=>{
    [...document.querySelectorAll('body > div, body > dialog')].forEach(el=>{
      const text=(el.textContent||'').trim();
      if(text.includes('No se pudo cargar el módulo de opciones')){try{el.remove()}catch(_){}}
    });
    document.documentElement.style.overflow='';
    document.body.style.overflow='';
  };
  const loadScript=src=>new Promise((resolve,reject)=>{
    const script=document.createElement('script');script.src=src;script.async=false;script.onload=resolve;script.onerror=()=>reject(new Error('No se pudo cargar '+src));document.body.appendChild(script);
  });
  removeLegacy();const cleaner=setInterval(removeLegacy,200);setTimeout(()=>clearInterval(cleaner),6000);
  try{
    const parts=Array.from({length:9},(_,i)=>`./portrait-v4-${String(i+1).padStart(2,'0')}.part?v=11`);
    const texts=await Promise.all(parts.map(async src=>{const response=await fetch(src,{cache:'no-store'});if(!response.ok)throw new Error(src);return response.text()}));
    (0,eval)(texts.join(''));
    if(!document.querySelector('link[data-map-v5]')){const link=document.createElement('link');link.rel='stylesheet';link.href='./map-v5.css?v=11';link.dataset.mapV5='1';document.head.appendChild(link)}
    if(!window.__FF_MAP_V5_LOADED__){await loadScript('./map-v5.js?v=11');window.__FF_MAP_V5_LOADED__=true}
    await loadScript('./options-v9-safe.js?v=11');
    await loadScript('./visual-v10.js?v=11');
    const optionParts=Array.from({length:5},(_,i)=>`./options-tortuga-v11-${String(i+1).padStart(2,'0')}.part?v=11`);
    const optionText=await Promise.all(optionParts.map(async src=>{const response=await fetch(src,{cache:'no-store'});if(!response.ok)throw new Error(src);return response.text()}));
    (0,eval)(optionText.join(''));
  }catch(error){
    console.error(error);removeLegacy();
    const notice=document.createElement('div');notice.style.cssText='position:fixed;left:18px;right:18px;bottom:88px;z-index:9999;padding:14px 16px;border-radius:17px;background:#082a5c;color:white;font:700 14px system-ui;box-shadow:0 15px 45px #082a5c44';notice.innerHTML='<button type="button" aria-label="Cerrar" style="float:right;border:0;background:transparent;color:white;font-size:22px">×</button>No se pudo cargar una parte visual. Puedes cerrar este aviso y seguir usando Mi Plan.';notice.querySelector('button').onclick=()=>notice.remove();document.body.appendChild(notice);
  }
})();
