(()=>{
  'use strict';
  if(window.__FF_MOBILE_NAV_V14__) return;
  window.__FF_MOBILE_NAV_V14__=true;

  const style=document.createElement('style');
  style.dataset.ffMobileNavV14='1';
  style.textContent=`
  @media (max-width:820px){
    .mobile-nav.ff-mobile-nav-v14{
      display:grid!important;
      grid-template-columns:repeat(5,minmax(0,1fr))!important;
      grid-template-rows:1fr!important;
      grid-auto-flow:column!important;
      align-items:stretch!important;
      flex-wrap:nowrap!important;
      column-gap:0!important;
      min-height:82px!important;
      height:calc(82px + env(safe-area-inset-bottom))!important;
      padding:8px 8px calc(8px + env(safe-area-inset-bottom))!important;
      overflow:hidden!important;
    }
    .mobile-nav.ff-mobile-nav-v14 > button:not([data-ff-more-hidden="1"]){
      display:flex!important;
      width:100%!important;
      min-width:0!important;
      height:66px!important;
      margin:0!important;
      padding:7px 2px!important;
      flex-direction:column!important;
      align-items:center!important;
      justify-content:center!important;
      gap:4px!important;
      white-space:nowrap!important;
      overflow:hidden!important;
      text-overflow:ellipsis!important;
      font-size:10px!important;
      line-height:1.05!important;
    }
    .mobile-nav.ff-mobile-nav-v14 > button:not([data-ff-more-hidden="1"]) span{
      flex:0 0 auto!important;
      margin:0!important;
      line-height:1!important;
    }
    .mobile-nav.ff-mobile-nav-v14 > button[data-ff-more-hidden="1"]{
      display:none!important;
    }
    .ff-avatar-more-v14{position:relative!important}
    .ff-avatar-more-v14:after{
      content:'•••';
      position:absolute;
      right:-3px;
      bottom:-4px;
      min-width:22px;
      height:14px;
      padding:0 3px;
      border:2px solid #fff;
      border-radius:999px;
      display:grid;
      place-items:center;
      background:#082a5c;
      color:#fff;
      font:900 8px/1 system-ui;
      letter-spacing:1px;
      box-shadow:0 3px 9px rgba(8,42,92,.22);
      pointer-events:none;
    }
  }`;
  document.head.appendChild(style);

  let moreButton=null;
  let avatarButton=null;

  function findMore(nav){
    return [...nav.querySelectorAll('button')].find(button=>/^\s*(?:…|\.\.\.)?\s*m[aá]s\s*$/i.test((button.textContent||'').trim()))
      || [...nav.querySelectorAll('button')].find(button=>String(button.dataset.view||'').toLowerCase().includes('more'))
      || null;
  }

  function findAvatar(){
    const direct=document.querySelector('.user-avatar button,.profile-avatar button,button.user-avatar,button.profile-avatar,[class*="avatar"] button,button[class*="avatar"]');
    if(direct && !direct.closest('.mobile-nav')) return direct;
    const candidates=[...document.querySelectorAll('button')].filter(button=>{
      if(button.closest('.mobile-nav,.desktop-nav')) return false;
      const text=(button.textContent||'').trim();
      if(!/^[A-ZÁÉÍÓÚÑ]{1,3}$/.test(text)) return false;
      const rect=button.getBoundingClientRect();
      return rect.width>30 && rect.height>30 && rect.top<230 && rect.left>window.innerWidth*.48;
    });
    return candidates.sort((a,b)=>b.getBoundingClientRect().left-a.getBoundingClientRect().left)[0]||null;
  }

  function openMore(event){
    if(event){event.preventDefault();event.stopPropagation();event.stopImmediatePropagation()}
    if(!moreButton || !document.contains(moreButton)) apply();
    if(!moreButton) return;
    const view=moreButton.dataset.view;
    const desktop=view?document.querySelector(`.desktop-nav [data-view="${CSS.escape(view)}"]`):null;
    (desktop||moreButton).click();
  }

  function apply(){
    const nav=document.querySelector('.mobile-nav');
    if(!nav) return;
    nav.classList.add('ff-mobile-nav-v14');
    moreButton=findMore(nav);
    if(moreButton){
      moreButton.dataset.ffMoreHidden='1';
      moreButton.setAttribute('aria-hidden','true');
      moreButton.tabIndex=-1;
    }
    const nextAvatar=findAvatar();
    if(nextAvatar && nextAvatar!==avatarButton){
      if(avatarButton) avatarButton.removeEventListener('click',openMore,true);
      avatarButton=nextAvatar;
      avatarButton.classList.add('ff-avatar-more-v14');
      avatarButton.setAttribute('aria-label','Abrir más opciones');
      avatarButton.setAttribute('title','Más opciones');
      avatarButton.addEventListener('click',openMore,true);
    }
  }

  apply();
  const observer=new MutationObserver(()=>requestAnimationFrame(apply));
  observer.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('resize',apply,{passive:true});
  window.addEventListener('pageshow',apply);
  setTimeout(apply,100);
  setTimeout(apply,700);
})();
