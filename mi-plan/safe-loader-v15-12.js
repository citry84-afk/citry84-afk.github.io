(async()=>{
  'use strict';
  const removeLegacy=()=>{[...document.querySelectorAll('body > div, body > dialog')].forEach(el=>{const text=(el.textContent||'').trim();if(text.includes('No se pudo cargar el módulo de opciones')){try{el.remove()}catch(_){}}});document.documentElement.style.overflow='';document.body.style.overflow='';};
  const loadScript=src=>new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.async=false;script.onload=resolve;script.onerror=()=>reject(new Error('No se pudo cargar '+src));document.body.appendChild(script)});
  const installBridge=source=>{
    const anchor="  document.addEventListener('click',e=>{if(e.target.closest('[data-close-help]'))";
    if(!source.includes(anchor)) throw new Error('No se encontró el punto de navegación del onboarding');
    const bridge=`  function ffSetProduct159(type,enabled,value,detailsPatch={}){\n    if(!TYPES[type])return false;\n    state.answers[type]=enabled?'yes':'no';\n    state.pending.delete(type);\n    state.values[type]=enabled?safe(value):0;\n    const details=meta(type);\n    details.unknown=false;\n    if(detailsPatch.where!=null)details.where=String(detailsPatch.where);\n    if(detailsPatch.count!=null)details.count=Math.max(1,safe(detailsPatch.count));\n    if(detailsPatch.monthlyContribution!=null)details.monthlyContribution=safe(detailsPatch.monthlyContribution);\n    if(detailsPatch.monthlyIncome!=null)details.monthlyIncome=safe(detailsPatch.monthlyIncome);\n    if(detailsPatch.monthlyPayment!=null)details.monthlyPayment=safe(detailsPatch.monthlyPayment);\n    return true;\n  }\n  function ffConfirmInvestments159(config={}){\n    const nav=Math.max(0,safe(config.nav));\n    const selected={funds:Boolean(config.funds),stocks:Boolean(config.stocks),options:Boolean(config.options)};\n    const primary=selected.stocks?'stocks':selected.funds?'funds':selected.options?'options':'';\n    ffSetProduct159('funds',selected.funds,primary==='funds'?nav:0,{where:'Interactive Brokers',count:Math.max(1,safe(config.etfCount)||1)});\n    ffSetProduct159('stocks',selected.stocks,primary==='stocks'?nav:0,{where:'Interactive Brokers',count:Math.max(1,safe(config.positionsCount)||1),monthlyContribution:safe(config.monthlyContribution)});\n    ffSetProduct159('options',selected.options,primary==='options'?nav:0,{where:'Interactive Brokers',count:Math.max(1,safe(config.openOptionsCount)||1),monthlyIncome:safe(config.monthlyOptions)});\n    try{localStorage.setItem('ff_ibkr_products_v159',JSON.stringify({version:'15.9',confirmed:true,selected,primary,nav,positionsCount:safe(config.positionsCount),etfCount:safe(config.etfCount),optionsTrades:safe(config.optionsTrades),openOptionsCount:safe(config.openOptionsCount),confirmedAt:new Date().toISOString()}))}catch(_){}\n    delete content.dataset.inv156;delete content.dataset.inv159;delete content.dataset.ffBrokerV155;\n    const steps=flow();\n    const target=steps.findIndex(item=>item.kind==='ask'&&item.type==='pension');\n    state.step=target>=0?target:Math.min(state.step+1,steps.length-1);\n    next.classList.remove('inv159-native-hidden');\n    next.style.removeProperty('display');\n    render();\n    return{ok:true,selected,primary,step:state.step,current:current().s};\n  }\n  function ffConfirmPension1510(config={}){\n    const value=Math.max(0,safe(config.value));\n    if(value<=0)return{ok:false,reason:'invalid'};\n    ffSetProduct159('pension',true,value,{where:config.where||'',count:Math.max(1,safe(config.count)||1)});\n    const details=meta('pension');\n    details.grossValue=Math.max(0,safe(config.gross));\n    details.ownership=Math.max(0,Math.min(100,safe(config.ownership)||100));\n    details.documentDate=String(config.date||'');\n    details.file=config.file||null;\n    next.classList.remove('pi1510-native-hidden');\n    state.step=Math.min(state.step+1,flow().length-1);\n    render();\n    return{ok:true,step:state.step,current:current().s};\n  }\n  function ffConfirmIncome1510(config={}){\n    const monthlyIncome=Math.max(0,safe(config.monthlyIncome));\n    if(monthlyIncome<=0)return{ok:false,reason:'invalid'};\n    state.monthlyIncome=monthlyIncome;\n    state.contribution=Math.max(0,safe(config.contribution));\n    state.incomeStability=['stable','variable','mixed'].includes(config.stability)?config.stability:'stable';\n    state.incomeSources=Array.isArray(config.sources)?config.sources:[];\n    next.classList.remove('pi1510-native-hidden');\n    state.step=Math.min(state.step+1,flow().length-1);\n    render();\n    return{ok:true,step:state.step,current:current().s};\n  }\n  function ffAdvance1512(){\n    const step=current().s;\n    if(!step||!step.valid())return{ok:false,reason:'invalid'};\n    if(step.kind==='summary'){finish();return{ok:true,finished:true};}\n    state.step=Math.min(state.step+1,flow().length-1);\n    render();\n    return{ok:true,step:state.step,current:current().s};\n  }\n  function ffGoTo1512(type,kind='ask'){\n    const steps=flow();\n    const target=steps.findIndex(item=>item.type===type&&item.kind===kind);\n    if(target<0)return{ok:false,reason:'not-found'};\n    state.step=target;render();return{ok:true,step:state.step,current:current().s};\n  }\n  globalThis.FFPortraitBridge159={version:'15.9',state:()=>state,current:()=>current().s,setProduct:ffSetProduct159,confirmInvestments:ffConfirmInvestments159};\n  globalThis.FFPortraitBridge1510={version:'15.10',state:()=>state,current:()=>current().s,setProduct:ffSetProduct159,confirmPension:ffConfirmPension1510,confirmIncome:ffConfirmIncome1510};\n  globalThis.FFPortraitBridge1512={version:'15.12',state:()=>state,current:()=>current().s,setProduct:ffSetProduct159,advance:ffAdvance1512,goTo:ffGoTo1512,render};\n`;
    return source.replace(anchor,bridge+anchor);
  };
  removeLegacy();const cleaner=setInterval(removeLegacy,200);setTimeout(()=>clearInterval(cleaner),6000);
  try{
    const parts=Array.from({length:9},(_,i)=>`./portrait-v4-${String(i+1).padStart(2,'0')}.part?v=15.12`);
    const text=await Promise.all(parts.map(async src=>{const response=await fetch(src,{cache:'no-store'});if(!response.ok)throw new Error(src);return response.text()}));
    (0,eval)(installBridge(text.join('')));
    if(!document.querySelector('link[data-map-v5]')){const link=document.createElement('link');link.rel='stylesheet';link.href='./map-v5.css?v=15.12';link.dataset.mapV5='1';document.head.appendChild(link)}
    await loadScript('./map-v5.js?v=15.12');
    await loadScript('./visual-v10.js?v=15.12');
    await loadScript('./options-intuitive-v12.js?v=15.12');
    await loadScript('./mobile-nav-v14.js?v=15.12');
    try{
      await loadScript('./options-v14-4-core.js?v=15.12');
      await loadScript('./options-v14-2-core.js?v=15.12');
      await loadScript('./options-v14-3-core.js?v=15.12');
      window.FFv143?.migrate?.();window.FFv144?.migrate?.();
      await loadScript('./options-v14.js?v=15.12');
      await loadScript('./options-v14-3-ui.js?v=15.12');
      await loadScript('./options-v14-4-ui.js?v=15.12');
    }catch(error){console.warn('[v15.12] La capa avanzada de opciones no se cargó.',error)}
    await loadScript('./v15-core.js?v=15.12');
    await loadScript('./v15-ui.js?v=15.12');
    await loadScript('./onboarding-banks-v15-1.js?v=15.12');
    await loadScript('./screenshot-reader-v15-3.js?v=15.12');
    await loadScript('./bank-finalizer-v15-3.js?v=15.12');
    await loadScript('./ownership-totals-v15-5.js?v=15.12');
    await loadScript('./broker-import-v15-5-core.js?v=15.12');
    await loadScript('./onboarding-brokers-v15-5.js?v=15.12');
    await loadScript('./ibkr-shared-v15-6.js?v=15.12');
    await loadScript('./investment-onboarding-v15-6.js?v=15.12');
    await loadScript('./investment-consolidation-v15-9.js?v=15.12');
    await loadScript('./pension-income-import-v15-10.js?v=15.12');
    await loadScript('./property-onboarding-v15-12.js?v=15.12');
    await loadScript('./dashboard-nav-v15-12.js?v=15.12');
    document.querySelector('.oi12-tabs [data-oi12-tab].active, .oi12-tabs [data-ffv14-tab].active')?.click();
  }catch(error){
    console.error(error);removeLegacy();const notice=document.createElement('div');notice.style.cssText='position:fixed;left:18px;right:18px;bottom:88px;z-index:9999;padding:14px 16px;border-radius:17px;background:#082a5c;color:white;font:700 14px system-ui';notice.textContent='No se pudo cargar una parte visual. Recarga la página.';document.body.appendChild(notice)
  }
})();
