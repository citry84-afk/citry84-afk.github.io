(async()=>{
  'use strict';
  const removeLegacy=()=>{[...document.querySelectorAll('body > div, body > dialog')].forEach(el=>{const text=(el.textContent||'').trim();if(text.includes('No se pudo cargar el módulo de opciones')){try{el.remove()}catch(_){}}});document.documentElement.style.overflow='';document.body.style.overflow='';};
  const loadScript=src=>new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.async=false;script.onload=resolve;script.onerror=()=>reject(new Error('No se pudo cargar '+src));document.body.appendChild(script)});
  const installBridge=source=>{
    const anchor="  document.addEventListener('click',e=>{if(e.target.closest('[data-close-help]'))";
    if(!source.includes(anchor)) throw new Error('No se encontró el punto de navegación del onboarding');
    const bridge=`  function ffSetCurrent158(payload={}){\n    const currentStep=current().s;\n    if(!currentStep||currentStep.kind!=='detail'||!currentStep.type)return false;\n    const type=currentStep.type;\n    state.answers[type]='yes';\n    state.values[type]=safe(payload.value);\n    const details=meta(type);\n    details.unknown=false;\n    if(payload.where!=null)details.where=String(payload.where);\n    if(payload.count!=null)details.count=Math.max(1,safe(payload.count));\n    if(payload.monthlyContribution!=null)details.monthlyContribution=safe(payload.monthlyContribution);\n    if(payload.monthlyIncome!=null)details.monthlyIncome=safe(payload.monthlyIncome);\n    renderMap();\n    next.disabled=!current().s.valid();\n    return current().s.valid();\n  }\n  globalThis.FFPortraitBridge158={\n    version:'15.8',\n    state:()=>state,\n    current:()=>current().s,\n    setCurrent:ffSetCurrent158,\n    advance(payload={}){\n      if(!ffSetCurrent158(payload))return{ok:false,reason:'invalid'};\n      const step=current().s;\n      if(!step.valid())return{ok:false,reason:'invalid'};\n      state.step++;\n      render();\n      return{ok:true,step:state.step,current:current().s};\n    }\n  };\n`;
    return source.replace(anchor,bridge+anchor);
  };
  removeLegacy();const cleaner=setInterval(removeLegacy,200);setTimeout(()=>clearInterval(cleaner),6000);
  try{
    const parts=Array.from({length:9},(_,i)=>`./portrait-v4-${String(i+1).padStart(2,'0')}.part?v=15.8`);
    const text=await Promise.all(parts.map(async src=>{const response=await fetch(src,{cache:'no-store'});if(!response.ok)throw new Error(src);return response.text()}));
    (0,eval)(installBridge(text.join('')));
    if(!document.querySelector('link[data-map-v5]')){const link=document.createElement('link');link.rel='stylesheet';link.href='./map-v5.css?v=15.8';link.dataset.mapV5='1';document.head.appendChild(link)}
    await loadScript('./map-v5.js?v=15.8');
    await loadScript('./visual-v10.js?v=15.8');
    await loadScript('./options-intuitive-v12.js?v=15.8');
    await loadScript('./mobile-nav-v14.js?v=15.8');
    try{
      await loadScript('./options-v14-4-core.js?v=15.8');
      await loadScript('./options-v14-2-core.js?v=15.8');
      await loadScript('./options-v14-3-core.js?v=15.8');
      window.FFv143?.migrate?.();window.FFv144?.migrate?.();
      await loadScript('./options-v14.js?v=15.8');
      await loadScript('./options-v14-3-ui.js?v=15.8');
      await loadScript('./options-v14-4-ui.js?v=15.8');
    }catch(error){console.warn('[v15.8] La capa avanzada de opciones no se cargó.',error)}
    await loadScript('./v15-core.js?v=15.8');
    await loadScript('./v15-ui.js?v=15.8');
    await loadScript('./onboarding-banks-v15-1.js?v=15.8');
    await loadScript('./screenshot-reader-v15-3.js?v=15.8');
    await loadScript('./bank-finalizer-v15-3.js?v=15.8');
    await loadScript('./ownership-totals-v15-5.js?v=15.8');
    await loadScript('./broker-import-v15-5-core.js?v=15.8');
    await loadScript('./onboarding-brokers-v15-5.js?v=15.8');
    await loadScript('./ibkr-shared-v15-6.js?v=15.8');
    await loadScript('./investment-onboarding-v15-6.js?v=15.8');
    await loadScript('./onboarding-navigation-v15-8.js?v=15.8');
    document.querySelector('.oi12-tabs [data-oi12-tab].active, .oi12-tabs [data-ffv14-tab].active')?.click();
  }catch(error){
    console.error(error);removeLegacy();const notice=document.createElement('div');notice.style.cssText='position:fixed;left:18px;right:18px;bottom:88px;z-index:9999;padding:14px 16px;border-radius:17px;background:#082a5c;color:white;font:700 14px system-ui';notice.textContent='No se pudo cargar una parte visual. Recarga la página.';document.body.appendChild(notice)
  }
})();
