(async()=>{
  'use strict';
  const removeLegacy=()=>{[...document.querySelectorAll('body > div, body > dialog')].forEach(el=>{const text=(el.textContent||'').trim();if(text.includes('No se pudo cargar el módulo de opciones')){try{el.remove()}catch(_){}}});document.documentElement.style.overflow='';document.body.style.overflow='';};
  const loadScript=src=>new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.async=false;script.onload=resolve;script.onerror=()=>reject(new Error('No se pudo cargar '+src));document.body.appendChild(script)});
  removeLegacy();const cleaner=setInterval(removeLegacy,200);setTimeout(()=>clearInterval(cleaner),6000);
  try{
    const parts=Array.from({length:9},(_,i)=>`./portrait-v4-${String(i+1).padStart(2,'0')}.part?v=15.3`);
    const text=await Promise.all(parts.map(async src=>{const response=await fetch(src,{cache:'no-store'});if(!response.ok)throw new Error(src);return response.text()}));
    (0,eval)(text.join(''));
    if(!document.querySelector('link[data-map-v5]')){const link=document.createElement('link');link.rel='stylesheet';link.href='./map-v5.css?v=15.3';link.dataset.mapV5='1';document.head.appendChild(link)}
    await loadScript('./map-v5.js?v=15.3');
    await loadScript('./visual-v10.js?v=15.3');
    await loadScript('./options-intuitive-v12.js?v=15.3');
    await loadScript('./mobile-nav-v14.js?v=15.3');
    try{
      await loadScript('./options-v14-4-core.js?v=15.3');
      await loadScript('./options-v14-2-core.js?v=15.3');
      await loadScript('./options-v14-3-core.js?v=15.3');
      window.FFv143?.migrate?.();window.FFv144?.migrate?.();
      await loadScript('./options-v14.js?v=15.3');
      await loadScript('./options-v14-3-ui.js?v=15.3');
      await loadScript('./options-v14-4-ui.js?v=15.3');
    }catch(error){console.warn('[v15.3] La capa avanzada de opciones no se cargó.',error)}
    await loadScript('./v15-core.js?v=15.3');
    await loadScript('./v15-ui.js?v=15.3');
    await loadScript('./onboarding-banks-v15-1.js?v=15.3');
    await loadScript('./screenshot-reader-v15-3.js?v=15.3');
    await loadScript('./bank-finalizer-v15-3.js?v=15.3');
    document.querySelector('.oi12-tabs [data-oi12-tab].active, .oi12-tabs [data-ffv14-tab].active')?.click();
  }catch(error){console.error(error);removeLegacy();const notice=document.createElement('div');notice.style.cssText='position:fixed;left:18px;right:18px;bottom:88px;z-index:9999;padding:14px 16px;border-radius:17px;background:#082a5c;color:white;font:700 14px system-ui';notice.textContent='No se pudo cargar una parte visual. Recarga la página.';document.body.appendChild(notice)}
})();
