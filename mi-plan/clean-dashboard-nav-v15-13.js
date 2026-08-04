/* FinanzasFácil v15.13 · barra inferior única y enrutado directo */
(() => {
  'use strict';
  if (globalThis.__FF_CLEAN_DASHBOARD_NAV_1513__) return;
  globalThis.__FF_CLEAN_DASHBOARD_NAV_1513__ = true;

  const MOBILE_VIEWS = [
    ['home', '⌂', 'Inicio'],
    ['wealth', '▦', 'Patrimonio'],
    ['goals', '◎', 'Objetivos'],
    ['options-v12', '◉', 'Opciones'],
    ['report', '✦', 'Informe']
  ];
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  let currentView = 'home';
  let routing = false;

  function injectStyles() {
    if ($('style[data-clean-nav-1513]')) return;
    const style = document.createElement('style');
    style.dataset.cleanNav1513 = '1';
    style.textContent = `
      body.app-active #onboarding,body.app-active #reveal{display:none!important;visibility:hidden!important;pointer-events:none!important}
      body.app-active #app{display:block!important;visibility:visible!important;pointer-events:auto!important}
      body.app-active .mobile-nav.ff-clean-nav-1513{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;grid-template-rows:1fr!important;gap:0!important;overflow:hidden!important;z-index:50000!important;pointer-events:auto!important;touch-action:manipulation!important;min-height:82px!important;height:calc(82px + env(safe-area-inset-bottom))!important;padding:8px 8px calc(8px + env(safe-area-inset-bottom))!important}
      body.app-active .mobile-nav.ff-clean-nav-1513>button{display:flex!important;width:100%!important;min-width:0!important;height:66px!important;margin:0!important;padding:7px 1px!important;border:0!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:4px!important;overflow:hidden!important;white-space:nowrap!important;text-overflow:ellipsis!important;pointer-events:auto!important;touch-action:manipulation!important;font-size:10px!important;line-height:1.05!important}
      body.app-active .mobile-nav.ff-clean-nav-1513>button span{display:block!important;margin:0!important;font-size:20px!important;line-height:1!important}
      body.app-active .mobile-nav.ff-clean-nav-1513>button.active{color:#f47f18!important}
      body.app-active #viewRoot{pointer-events:auto!important}
      @media(max-width:820px){body.app-active{padding-bottom:calc(98px + env(safe-area-inset-bottom))!important}}
    `;
    document.head.appendChild(style);
  }

  function mobileMarkup() {
    return MOBILE_VIEWS.map(([view, icon, label]) => `<button type="button" data-view="${view}" class="${view === currentView ? 'active' : ''}"><span>${icon}</span>${label}</button>`).join('');
  }

  function normalizeMobileNav() {
    const nav = $('.mobile-nav');
    if (!nav) return;
    const actual = $$(':scope > button[data-view]', nav).map(button => button.dataset.view);
    const expected = MOBILE_VIEWS.map(item => item[0]);
    if (actual.join('|') !== expected.join('|')) nav.innerHTML = mobileMarkup();
    nav.classList.add('ff-clean-nav-1513');
    $$(':scope > button[data-view]', nav).forEach(button => button.classList.toggle('active', button.dataset.view === currentView));
  }

  function normalizeDesktopNav() {
    const nav = $('.desktop-nav');
    if (!nav) return;
    const options = $$('[data-view="options-v12"]', nav);
    options.slice(1).forEach(button => button.remove());
    if (!options.length) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.view = 'options-v12';
      button.textContent = 'Opciones';
      nav.insertBefore(button, $('[data-view="report"]', nav) || nav.lastElementChild);
    }
    $$('[data-view]', nav).forEach(button => button.classList.toggle('active', button.dataset.view === currentView));
  }

  function restoreAppShell() {
    injectStyles();
    let data = null;
    try { data = JSON.parse(localStorage.getItem('ff_mi_plan_v2') || 'null'); } catch (_) {}
    if (data?.onboardingComplete) {
      document.body.classList.add('app-active');
      $('#onboarding')?.classList.add('hidden');
      $('#reveal')?.classList.add('hidden');
      $('#app')?.classList.remove('hidden');
      if ($('#onboarding')) $('#onboarding').style.pointerEvents = 'none';
      if ($('#reveal')) $('#reveal').style.pointerEvents = 'none';
    }
    normalizeMobileNav();
    normalizeDesktopNav();
  }

  function markActive(view) {
    currentView = view;
    $$('.mobile-nav [data-view],.desktop-nav [data-view]').forEach(button => button.classList.toggle('active', button.dataset.view === view));
  }

  function openView(view) {
    if (routing) return;
    routing = true;
    restoreAppShell();
    markActive(view);
    try {
      if (view === 'options-v12') {
        if (typeof globalThis.FFOptionsRender1513 === 'function') globalThis.FFOptionsRender1513();
        else {
          const url = new URL(location.href);
          url.hash = 'opciones';
          location.replace(url.toString());
        }
      } else if (typeof globalThis.FFBaseSetView1513 === 'function') {
        globalThis.FFBaseSetView1513(view);
      } else {
        const desktop = $(`.desktop-nav [data-view="${CSS.escape(view)}"]`);
        desktop?.dispatchEvent(new MouseEvent('click', {bubbles:true,cancelable:true,view:window}));
      }
    } finally {
      setTimeout(() => {
        routing = false;
        restoreAppShell();
        markActive(view);
      }, 80);
    }
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('.mobile-nav [data-view]');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    openView(button.dataset.view);
  }, true);

  document.addEventListener('click', event => {
    const avatar = event.target.closest('#avatarButton');
    if (!avatar) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    openView('settings');
  }, true);

  const observer = new MutationObserver(() => requestAnimationFrame(restoreAppShell));
  observer.observe(document.documentElement, {childList:true,subtree:true});
  globalThis.addEventListener('pageshow', restoreAppShell);
  globalThis.addEventListener('focus', restoreAppShell);
  setTimeout(restoreAppShell, 30);
  setTimeout(restoreAppShell, 500);
  setInterval(restoreAppShell, 1800);

  globalThis.FFCleanDashboardNav1513 = {version:'15.13', openView, restore:restoreAppShell};
})();
