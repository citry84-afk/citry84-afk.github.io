(async()=>{
  'use strict';
  const removeLegacy=()=>{
    [...document.querySelectorAll('body > div, body > dialog')].forEach(el=>{
      const t=(el.textContent||'').trim();
      if(t.includes('No se pudo cargar el módulo de opciones')) {
        try{el.remove()}catch(_){}
      }
    });
    document.documentElement.style.overflow='';
    document.body.style.overflow='';
  };
  removeLegacy();
  const timer=setInterval(removeLegacy,200);
  setTimeout(()=>clearInterval(timer),8000);
  const loadScript=src=>new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src=src;
    s.async=false;
    s.onload=resolve;
    s.onerror=()=>reject(new Error('No se pudo cargar '+src));
    document.body.appendChild(s);
  });
  try{
    const parts=Array.from({length:9},(_,i)=>`./portrait-v4-${String(i+1).padStart(2,'0')}.part?v=9`);
    const texts=await Promise.all(parts.map(async src=>{
      const r=await fetch(src,{cache:'no-store'});
      if(!r.ok) throw new Error(src);
      return r.text();
    }));
    (0,eval)(texts.join(''));
    if(!document.querySelector('link[data-map-v5]')){
      const l=document.createElement('link');
      l.rel='stylesheet'; l.href='./map-v5.css?v=9'; l.dataset.mapV5='1';
      document.head.appendChild(l);
    }
    if(!document.querySelector('script[data-map-v5]')){
      const s=document.createElement('script');
      s.src='./map-v5.js?v=9'; s.dataset.mapV5='1';
      document.body.appendChild(s);
    }
    await loadScript('./options-v9-safe.js?v=9');
  }catch(error){
    console.error(error);
    removeLegacy();
  }
})();