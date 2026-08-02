(async()=>{
  const removeOldErrors=()=>{
    [...document.querySelectorAll('body > div')].forEach(el=>{
      if((el.textContent||'').includes('No se pudo cargar el módulo de opciones')) el.remove();
    });
  };
  const showError=(error)=>{
    removeOldErrors();
    const overlay=document.createElement('div');
    overlay.dataset.optionsLoadError='true';
    overlay.style.cssText='position:fixed;inset:0;z-index:99999;padding:20px;background:rgba(7,26,61,.42);backdrop-filter:blur(10px);display:grid;place-items:center';
    overlay.innerHTML=`<div style="position:relative;width:min(520px,100%);max-height:min(680px,88vh);overflow:auto;padding:28px;border-radius:28px;background:#fff;color:#082a5c;font-family:system-ui,-apple-system,sans-serif;box-shadow:0 30px 100px rgba(7,26,61,.35)"><button type="button" data-options-close style="position:absolute;top:14px;right:14px;width:44px;height:44px;border:0;border-radius:50%;background:#eef4ff;color:#082a5c;font-size:28px;line-height:1">×</button><div style="font-size:36px;margin-bottom:12px">⚙️</div><h2 style="margin:0 48px 10px 0;font-size:25px;line-height:1.15">No se ha podido iniciar Opciones</h2><p style="margin:0 0 20px;color:#60728d;font-size:16px;line-height:1.5">Puedes cerrar este aviso y seguir usando el resto de Mi Plan. Hemos preparado una carga compatible con Safari; prueba a recargar una vez.</p><div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" data-options-retry style="border:0;border-radius:16px;padding:13px 18px;background:linear-gradient(135deg,#ff8a1d,#ff6f0f);color:white;font-weight:800;font-size:15px">Recargar módulo</button><button type="button" data-options-close style="border:1px solid #dce6f5;border-radius:16px;padding:13px 18px;background:white;color:#082a5c;font-weight:750;font-size:15px">Seguir sin opciones</button></div><details style="margin-top:18px;color:#7a8ba2;font-size:12px"><summary>Detalle técnico</summary><pre style="white-space:pre-wrap;word-break:break-word">${String(error&&error.message||error||'Error desconocido').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}</pre></details></div>`;
    overlay.addEventListener('click',e=>{
      if(e.target===overlay||e.target.closest('[data-options-close]')) overlay.remove();
      if(e.target.closest('[data-options-retry]')) location.reload();
    });
    document.body.appendChild(overlay);
  };
  const loadScript=src=>new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src=src;
    s.async=true;
    s.onload=resolve;
    s.onerror=()=>reject(new Error('No se pudo cargar la compatibilidad para Safari.'));
    document.head.appendChild(s);
  });
  const installSafariGzip=async()=>{
    if('DecompressionStream' in window) return;
    if(!window.TransformStream) throw new Error('Esta versión de Safari no admite el flujo necesario. Actualiza iOS o usa una versión reciente de Safari.');
    if(!window.pako) await loadScript('https://cdn.jsdelivr.net/npm/pako@2.1.0/dist/pako.min.js');
    window.DecompressionStream=class DecompressionStreamPolyfill{
      constructor(format){
        if(format!=='gzip') throw new Error('Formato de compresión no compatible.');
        const chunks=[];
        return new TransformStream({
          transform(chunk){
            if(chunk instanceof Uint8Array) chunks.push(chunk);
            else if(chunk instanceof ArrayBuffer) chunks.push(new Uint8Array(chunk));
            else chunks.push(new Uint8Array(chunk.buffer,chunk.byteOffset||0,chunk.byteLength));
          },
          flush(controller){
            const size=chunks.reduce((sum,c)=>sum+c.byteLength,0);
            const input=new Uint8Array(size);
            let offset=0;
            chunks.forEach(c=>{input.set(c,offset);offset+=c.byteLength});
            controller.enqueue(window.pako.ungzip(input));
          }
        });
      }
    };
  };
  try{
    removeOldErrors();
    await installSafariGzip();
    const paths=Array.from({length:9},(_,i)=>`./options-v6-${String(i+1).padStart(2,'0')}.part?v=8`);
    const parts=await Promise.all(paths.map(async path=>{
      const response=await fetch(path,{cache:'no-store'});
      if(!response.ok) throw new Error(`No se pudo descargar ${path}`);
      return response.text();
    }));
    (0,eval)(parts.join(''));
  }catch(error){
    console.error('Options module error',error);
    showError(error);
  }
})();
