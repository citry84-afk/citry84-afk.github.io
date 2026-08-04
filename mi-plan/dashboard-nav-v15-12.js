/* FinanzasFácil v15.12 · reparación de la navegación inferior */
(() => {
  'use strict';
  if (globalThis.__FF_DASHBOARD_NAV_1512__) return;
  globalThis.__FF_DASHBOARD_NAV_1512__ = true;
  const $ = (selector, root = document) => root.querySelector(selector);
  const read = key => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { return null; } };

  function injectStyles() {
    if ($('style[data-dashboard-nav-1512]')) return;
    const style=document.createElement('style');style.dataset.dashboardNav1512='1';style.textContent=`
      body.app-active #onboarding,body.app-active #reveal{display:none!important;visibility:hidden!important;pointer-events:none!important}
      body.app-active #app{display:block!important;visibility:visible!important;pointer-events:auto!important}
      body.app-active .mobile-nav{z-index:50000!important;pointer-events:auto!important;touch-action:manipulation!important}
      body.app-active .mobile-nav button{pointer-events:auto!important;touch-action:manipulation!important;-webkit-tap-highlight-color:rgba(22,116,209,.12)!important}
      body.app-active #viewRoot{pointer-events:auto!important}
      @media(max-width:820px){body.app-active{padding-bottom:calc(96px + env(safe-area-inset-bottom))!important}.mobile-nav [data-view="options-v12"]{display:flex!important}}
    `;document.head.appendChild(style);
  }

  function ensureOptionsButton() {
    const nav=$('.mobile-nav');
    if(!nav||nav.querySelector('[data-view="options-v12"]'))return;
    const button=document.createElement('button');button.type='button';button.dataset.view='options-v12';button.innerHTML='<span>◎</span>Opciones';
    const before=nav.querySelector('[data-view="report"]')||nav.querySelector('[data-view="settings"]')||nav.lastElementChild;
    nav.insertBefore(button,before);
  }

  function restoreApp() {
    injectStyles();ensureOptionsButton();
    const data=read('ff_mi_plan_v2');
    if(!data?.onboardingComplete)return;
    const onboarding=$('#onboarding'),reveal=$('#reveal'),app=$('#app');
    document.body.classList.add('app-active');
    onboarding?.classList.add('hidden');reveal?.classList.add('hidden');app?.classList.remove('hidden');
    if(onboarding){onboarding.style.pointerEvents='none';onboarding.setAttribute('aria-hidden','true');}
    if(reveal){reveal.style.pointerEvents='none';reveal.setAttribute('aria-hidden','true');}
    const root=$('#viewRoot');
    if(root&&!root.children.length){setTimeout(()=>$('.mobile-nav [data-view="home"],.desktop-nav [data-view="home"]')?.click(),30);}
  }

  let lastOptionsClick=0;
  document.addEventListener('click',event=>{
    const button=event.target.closest('.mobile-nav [data-view],.desktop-nav [data-view]');
    if(!button)return;
    restoreApp();
    if(button.dataset.view==='options-v12'){
      lastOptionsClick=Date.now();
      setTimeout(()=>{
        if(Date.now()-lastOptionsClick<220)return;
        if($('#viewRoot .oi12'))return;
        const url=new URL(location.href);url.hash='opciones';location.replace(url.toString());
      },260);
    }
  },true);

  document.addEventListener('touchend',event=>{
    const button=event.target.closest('.mobile-nav [data-view]');
    if(!button)return;
    button.style.transform='scale(.98)';setTimeout(()=>button.style.removeProperty('transform'),100);
  },{capture:true,passive:true});

  const observer=new MutationObserver(()=>requestAnimationFrame(restoreApp));
  observer.observe(document.documentElement,{childList:true,subtree:true});
  globalThis.addEventListener('pageshow',restoreApp);globalThis.addEventListener('focus',restoreApp);
  setTimeout(restoreApp,50);setTimeout(restoreApp,700);setInterval(restoreApp,1800);
  globalThis.FFDashboardNav1512={version:'15.12',restore:restoreApp};
})();
