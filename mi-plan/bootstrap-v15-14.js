(async()=>{
  'use strict';
  if(globalThis.__FF_BOOTSTRAP_1514__)return;
  globalThis.__FF_BOOTSTRAP_1514__=true;

  const loadScript=src=>new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src=src;
    script.async=false;
    script.onload=resolve;
    script.onerror=()=>reject(new Error('No se pudo cargar '+src));
    document.body.appendChild(script);
  });

  try{
    const base='https://cdn.jsdelivr.net/gh/citry84-afk/finanzas-facil@946a4637b0daeb4fa392efc4d59eb7206f880298/public';
    const parts=Array.from({length:8},(_,i)=>`${base}/mi-plan-functional-${String(i+1).padStart(2,'0')}.part?v=15.14`);
    const texts=await Promise.all(parts.map(async path=>{
      const response=await fetch(path,{cache:'no-store'});
      if(!response.ok)throw new Error(path);
      return response.text();
    }));
    let source=texts.join('');
    const marker='  initializeTheme();';
    if(!source.includes(marker))throw new Error('No se encontró el arranque de la aplicación base');
    source=source.replace(marker,`  globalThis.FFBaseSetView1514=setView;\n  globalThis.FFBaseShowApp1514=showApp;\n  globalThis.FFBaseData1514=()=>data;\n${marker}`);
    (0,eval)(source);
    globalThis.dispatchEvent(new CustomEvent('ff:base-ready-1514'));

    await loadScript('./v03-patch.js?v=3');

    // Desactiva el parche de navegación de v15.13. Conservamos sus módulos de datos,
    // pero la barra inferior la controla exclusivamente v15.14.
    globalThis.__FF_CLEAN_DASHBOARD_NAV_1513__=true;
    await loadScript('./safe-loader-v15-13.js?v=15.13');
    await loadScript('./single-nav-v15-14.js?v=15.14');
  }catch(error){
    console.error('[v15.14]',error);
    const notice=document.createElement('div');
    notice.style.cssText='position:fixed;left:18px;right:18px;bottom:24px;z-index:999999;padding:15px 17px;border-radius:17px;background:#082a5c;color:white;font:700 14px system-ui';
    notice.textContent='No se pudo iniciar correctamente. Cierra esta pestaña y vuelve a abrir la v15.14.';
    document.body.appendChild(notice);
  }
})();
