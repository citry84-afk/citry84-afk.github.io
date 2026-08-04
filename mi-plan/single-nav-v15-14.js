/* FinanzasFácil v15.14 · barra inferior independiente y sin interferencias */
(() => {
  'use strict';
  if(globalThis.__FF_SINGLE_NAV_1514__)return;
  globalThis.__FF_SINGLE_NAV_1514__=true;

  const ROUTES=[
    ['home','⌂','Inicio'],
    ['wealth','▦','Patrimonio'],
    ['goals','◎','Objetivos'],
    ['options-v12','◉','Opciones'],
    ['report','✦','Informe']
  ];
  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
  let active='home';
  let locked=false;
  let lastPointer=0;

  function readPlan(){try{return JSON.parse(localStorage.getItem('ff_mi_plan_v2')||'null')}catch(_){return null}}

  function injectStyles(){
    if($('style[data-single-nav-1514]'))return;
    const style=document.createElement('style');
    style.dataset.singleNav1514='1';
    style.textContent=`
      .mobile-nav{display:none!important;pointer-events:none!important}
      #ffNav1514{position:fixed;left:14px;right:14px;bottom:calc(10px + env(safe-area-inset-bottom));z-index:2147483000;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));height:78px;padding:7px;border:1px solid rgba(167,187,210,.55);border-radius:25px;background:rgba(250,252,255,.96);box-shadow:0 18px 45px rgba(8,42,92,.2);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);pointer-events:auto!important;touch-action:manipulation!important}
      #ffNav1514 button{appearance:none;-webkit-appearance:none;display:flex!important;min-width:0!important;height:64px!important;margin:0!important;padding:7px 1px!important;border:0!important;border-radius:17px!important;background:transparent!important;color:#64748b!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:4px!important;font:800 10px/1 system-ui!important;white-space:nowrap!important;pointer-events:auto!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important;user-select:none!important;-webkit-user-select:none!important}
      #ffNav1514 button span{display:block;font-size:20px;line-height:1}
      #ffNav1514 button.active{background:#fff7ed!important;color:#f47f18!important;box-shadow:inset 0 0 0 1px rgba(244,127,24,.15)}
      #ffNav1514 button.pressed{transform:scale(.96)}
      #ffOptionsTrigger1514{position:fixed!important;width:1px!important;height:1px!important;left:-9999px!important;top:-9999px!important;opacity:0!important;pointer-events:none!important}
      body.app-active{padding-bottom:calc(108px + env(safe-area-inset-bottom))!important}
      body.app-active #onboarding,body.app-active #reveal{display:none!important;visibility:hidden!important;pointer-events:none!important}
      body.app-active #app{display:block!important;visibility:visible!important;pointer-events:auto!important}
      @media(min-width:821px){#ffNav1514{display:none!important}.mobile-nav{display:none!important}}
    `;
    document.head.appendChild(style);
  }

  function ensureShell(){
    injectStyles();
    const plan=readPlan();
    if(plan?.onboardingComplete){
      document.body.classList.add('app-active');
      $('#onboarding')?.classList.add('hidden');
      $('#reveal')?.classList.add('hidden');
      $('#app')?.classList.remove('hidden');
      if($('#onboarding'))$('#onboarding').style.pointerEvents='none';
      if($('#reveal'))$('#reveal').style.pointerEvents='none';
    }
    let trigger=$('#ffOptionsTrigger1514');
    if(!trigger){
      trigger=document.createElement('button');
      trigger.type='button';
      trigger.id='ffOptionsTrigger1514';
      trigger.dataset.view='options-v12';
      trigger.tabIndex=-1;
      trigger.setAttribute('aria-hidden','true');
      document.body.appendChild(trigger);
    }
    let nav=$('#ffNav1514');
    if(!nav){
      nav=document.createElement('nav');
      nav.id='ffNav1514';
      nav.setAttribute('aria-label','Navegación principal');
      nav.innerHTML=ROUTES.map(([route,icon,label])=>`<button type="button" data-ff-route="${route}" aria-label="${label}"><span>${icon}</span>${label}</button>`).join('');
      document.body.appendChild(nav);
      bind(nav);
    }
    mark(active);
  }

  function mark(route){
    active=route;
    $$('#ffNav1514 [data-ff-route]').forEach(button=>{
      const on=button.dataset.ffRoute===route;
      button.classList.toggle('active',on);
      button.setAttribute('aria-current',on?'page':'false');
    });
  }

  function routeTo(route){
    if(locked)return;
    locked=true;
    ensureShell();
    mark(route);
    try{
      if(route==='options-v12'){
        const trigger=$('#ffOptionsTrigger1514');
        trigger?.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));
      }else if(typeof globalThis.FFBaseSetView1514==='function'){
        globalThis.FFBaseSetView1514(route);
      }else{
        setTimeout(()=>routeTo(route),120);
      }
    }catch(error){
      console.error('[v15.14 navegación]',error);
    }finally{
      setTimeout(()=>{locked=false;ensureShell();mark(route)},100);
    }
  }

  function activate(button,event){
    if(event){event.preventDefault();event.stopPropagation();event.stopImmediatePropagation()}
    const now=Date.now();
    if(now-lastPointer<350&&event?.type==='click')return;
    if(event?.type==='pointerup'||event?.type==='touchend')lastPointer=now;
    button.classList.add('pressed');
    setTimeout(()=>button.classList.remove('pressed'),120);
    routeTo(button.dataset.ffRoute);
  }

  function bind(nav){
    $$('[data-ff-route]',nav).forEach(button=>{
      button.addEventListener('pointerup',event=>activate(button,event),{capture:true});
      button.addEventListener('touchend',event=>activate(button,event),{capture:true,passive:false});
      button.addEventListener('click',event=>activate(button,event),{capture:true});
    });
  }

  document.addEventListener('click',event=>{
    const avatar=event.target.closest('#avatarButton');
    if(!avatar)return;
    event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
    if(typeof globalThis.FFBaseSetView1514==='function')globalThis.FFBaseSetView1514('settings');
  },true);

  const observer=new MutationObserver(()=>requestAnimationFrame(ensureShell));
  observer.observe(document.documentElement,{childList:true,subtree:true});
  globalThis.addEventListener('pageshow',ensureShell);
  globalThis.addEventListener('focus',ensureShell);
  setTimeout(ensureShell,20);
  setTimeout(ensureShell,350);
  setInterval(ensureShell,1500);

  globalThis.FFSingleNav1514={version:'15.14',open:routeTo,restore:ensureShell};
})();
