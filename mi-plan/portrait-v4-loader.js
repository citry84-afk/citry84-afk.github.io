(async()=>{try{
  const portraitParts=Array.from({length:9},(_,i)=>`./portrait-v4-${String(i+1).padStart(2,'0')}.part?v=4`);
  const portraitCode=await Promise.all(portraitParts.map(async path=>{const response=await fetch(path);if(!response.ok)throw Error(path);return response.text()}));
  (0,eval)(portraitCode.join(''));
  if(!document.querySelector('link[data-map-v5]')){const link=document.createElement('link');link.rel='stylesheet';link.href='./map-v5.css?v=5';link.dataset.mapV5='true';document.head.appendChild(link)}
  if(!document.querySelector('script[data-map-v5]')){const script=document.createElement('script');script.src='./map-v5.js?v=5';script.dataset.mapV5='true';document.body.appendChild(script)}
  [...document.querySelectorAll('body > div')].forEach(el=>{if((el.textContent||'').includes('No se pudo cargar el módulo de opciones'))el.remove()});
  const loadV7=()=>{if(!document.querySelector('script[data-options-v7]')){const patch=document.createElement('script');patch.src='./options-v7-activity-patch.js?v=8';patch.dataset.optionsV7='true';document.body.appendChild(patch)}};
  window.addEventListener('ff-options-ready',loadV7,{once:true});
  if(!document.querySelector('script[data-options-v6]')){
    const options=document.createElement('script');
    options.src='./options-v6-master.js?v=8';
    options.dataset.optionsV6='true';
    document.body.appendChild(options);
  }
  setTimeout(()=>{if(document.querySelector('[data-options-root],#optionsView,.options-shell'))loadV7()},2500);
}catch(error){console.error(error)}})();
