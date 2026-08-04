(async()=>{
  'use strict';
  if(globalThis.__FF_PROPERTY_LOADER_1511__)return;
  globalThis.__FF_PROPERTY_LOADER_1511__=true;
  try{
    const parts=Array.from({length:7},(_,i)=>`./property-onboarding-v15-11-${String(i+1).padStart(2,'0')}.part?v=15.11`);
    const source=await Promise.all(parts.map(async path=>{const response=await fetch(path,{cache:'no-store'});if(!response.ok)throw new Error(path);return response.text();}));
    (0,eval)(source.join(''));
  }catch(error){
    console.error('[v15.11] No se pudo cargar el alta de inmuebles.',error);
    const notice=document.createElement('div');
    notice.style.cssText='position:fixed;left:18px;right:18px;bottom:88px;z-index:9999;padding:14px 16px;border-radius:17px;background:#082a5c;color:white;font:700 14px system-ui';
    notice.textContent='No se pudo cargar el módulo de inmuebles. Recarga la página.';
    document.body.appendChild(notice);
  }
})();
