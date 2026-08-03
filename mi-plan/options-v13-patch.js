(()=>{
  'use strict';
  if(window.__FF_OPTIONS_V13_LOADER__) return;
  window.__FF_OPTIONS_V13_LOADER__=true;
  (async()=>{
    try{
      const parts=Array.from({length:10},(_,i)=>`./options-v13-reviewed-${String(i+1).padStart(2,'0')}.part?v=13`);
      const source=(await Promise.all(parts.map(async src=>{
        const response=await fetch(src,{cache:'no-store'});
        if(!response.ok) throw new Error(`No se pudo cargar ${src}`);
        return response.text();
      }))).join('');
      (0,eval)(source);
      window.dispatchEvent(new CustomEvent('ff-options-v13-ready'));
    }catch(error){
      console.warn('[ffv13] La capa beta no pudo cargarse; v12 continúa disponible.',error);
      window.dispatchEvent(new CustomEvent('ff-options-v13-error',{detail:String(error?.message||error)}));
    }
  })();
})();
