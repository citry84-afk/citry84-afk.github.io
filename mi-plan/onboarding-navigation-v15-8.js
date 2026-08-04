/* FinanzasFácil v15.8 · navegación directa y fiable en acciones y opciones */
(() => {
  'use strict';
  if (globalThis.__FF_ONBOARDING_NAV_158__) return;
  globalThis.__FF_ONBOARDING_NAV_158__ = true;

  const VERSION = '15.8';
  const BROKER_DRAFT = 'ff_onboarding_brokers_v155';
  const SHARED_STORE = 'ff_ibkr_shared_v156';
  const $ = (selector, root = document) => root.querySelector(selector);
  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
    catch (_) { return fallback; }
  };
  const finite = value => Number.isFinite(Number(value)) ? Number(value) : 0;
  const share = value => Math.max(0, Math.min(100, Number.isFinite(Number(value)) ? Number(value) : 100));
  const money = value => new Intl.NumberFormat('es-ES', {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 2
  }).format(finite(value));

  let busy = false;

  function mode(root) {
    const current = String(root?.dataset?.inv156 || '');
    if (current === 'actions' || current === 'options') return current;
    const title = $('h1', root)?.textContent || '';
    if (/broker|acciones/i.test(title)) return 'actions';
    if (/opciones/i.test(title)) return 'options';
    return '';
  }

  function actionState() {
    const draft = read(BROKER_DRAFT, {brokers: []});
    const brokers = Array.isArray(draft?.brokers) ? draft.brokers : [];
    const rows = brokers.map(item => {
      const gross = Math.max(0, finite(item.amount));
      const ownership = share(item.ownership);
      return {name: String(item.name || 'Broker'), gross, ownership, attributable: gross * ownership / 100};
    });
    return {
      draft,
      rows,
      attributable: rows.reduce((sum, row) => sum + row.attributable, 0),
      gross: rows.reduce((sum, row) => sum + row.gross, 0),
      ready: rows.some(row => row.gross > 0)
    };
  }

  function optionsState() {
    const shared = globalThis.FFIBKRShared156?.state?.() || read(SHARED_STORE, null);
    const capital = Math.max(0, finite(shared?.preferences?.capitalReference ?? shared?.capitalReference ?? shared?.nav));
    const monthly = finite(shared?.preferences?.monthlyOptionsReference ?? shared?.options?.monthlyAverage);
    return {shared, capital, monthly, ready: Boolean(shared && capital > 0)};
  }

  function payloadFor(currentMode) {
    if (currentMode === 'actions') {
      const state = actionState();
      return {
        ready: state.ready,
        amount: state.attributable,
        payload: {
          value: state.attributable,
          where: state.rows.map(row => row.name).join(', '),
          count: Math.max(1, state.rows.length),
          monthlyContribution: finite(state.draft?.monthlyContribution)
        }
      };
    }
    const state = optionsState();
    return {
      ready: state.ready,
      amount: state.capital,
      payload: {
        value: state.capital,
        where: 'Interactive Brokers',
        count: 1,
        monthlyIncome: state.monthly
      }
    };
  }

  function fallbackAdvance(root, payload) {
    const setInput = (selector, value) => {
      const input = $(selector, root);
      if (!input) return;
      input.disabled = false;
      input.value = String(value ?? '');
      input.dispatchEvent(new Event('input', {bubbles: true}));
      input.dispatchEvent(new Event('change', {bubbles: true}));
    };
    const unknown = $('[data-unknown]', root);
    if (unknown?.classList.contains('selected')) unknown.click();
    setInput('#pValue', payload.value);
    setInput('#pWhere', payload.where);
    setInput('#pCount', payload.count);
    if (payload.monthlyContribution != null) setInput('#pMonthlyContribution', payload.monthlyContribution);
    const monthlyInput = $('[data-inv156-monthly-original]', root);
    if (monthlyInput && payload.monthlyIncome != null) {
      monthlyInput.disabled = false;
      monthlyInput.value = String(payload.monthlyIncome);
      monthlyInput.dispatchEvent(new Event('input', {bubbles: true}));
      monthlyInput.dispatchEvent(new Event('change', {bubbles: true}));
    }
    const native = $('#portraitNext');
    if (!native) return false;
    native.disabled = false;
    native.hidden = false;
    native.removeAttribute('aria-disabled');
    if (typeof native.onclick === 'function') {
      native.onclick.call(native, new MouseEvent('click', {bubbles: true, cancelable: true}));
      return true;
    }
    native.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}));
    return true;
  }

  function advance(root, currentMode) {
    if (busy) return;
    const prepared = payloadFor(currentMode);
    if (!prepared.ready) return;
    busy = true;
    try {
      const bridge = globalThis.FFPortraitBridge158;
      const result = bridge?.advance?.(prepared.payload);
      if (!result?.ok) fallbackAdvance(root, prepared.payload);
      requestAnimationFrame(() => {
        busy = false;
        patch();
      });
    } catch (error) {
      console.error('[v15.8] No se pudo avanzar.', error);
      busy = false;
      fallbackAdvance(root, prepared.payload);
    }
  }

  function ensureStyles() {
    if ($('style[data-inv-nav-158]')) return;
    const style = document.createElement('style');
    style.dataset.invNav158 = '1';
    style.textContent = `
      #portraitNext.inv158-native-visible{display:inline-flex!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important}
      .inv158-cta{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:14px 0 4px;padding:13px 14px;border:1px solid #c8d9eb;border-radius:17px;background:#fff;color:#0b2240;box-shadow:0 12px 28px rgba(16,54,108,.08)}
      .inv158-cta div{min-width:0}.inv158-cta strong,.inv158-cta small{display:block}.inv158-cta strong{font-size:13px}.inv158-cta small{margin-top:3px;color:#63758c;font-size:9px;line-height:1.35}
      .inv158-cta button{flex:none;border:0;border-radius:13px;padding:12px 15px;background:linear-gradient(135deg,#ff941f,#ff7a0a);color:#fff;font:900 12px system-ui;box-shadow:0 10px 22px rgba(255,126,15,.23);touch-action:manipulation}
      .inv158-cta button:disabled{display:inline-flex!important;opacity:.42;box-shadow:none}
      @media(max-width:560px){.inv158-cta{position:sticky;bottom:calc(78px + env(safe-area-inset-bottom));z-index:45}.inv158-cta button{padding:12px 13px}}
    `;
    document.head.appendChild(style);
  }

  function patch() {
    const root = $('#portraitContent');
    if (!root) return;
    const currentMode = mode(root);
    if (!currentMode) return;

    ensureStyles();
    const prepared = payloadFor(currentMode);
    const native = $('#portraitNext');
    if (native) {
      native.disabled = !prepared.ready;
      native.hidden = false;
      native.classList.toggle('inv158-native-visible', prepared.ready);
      native.dataset.inv158Advance = currentMode;
      native.innerHTML = currentMode === 'actions'
        ? 'Guardar cartera y continuar <span>→</span>'
        : 'Guardar estrategia y continuar <span>→</span>';
    }

    let cta = $('[data-inv158-cta]', root);
    if (!cta) {
      cta = document.createElement('section');
      cta.className = 'inv158-cta';
      cta.dataset.inv158Cta = '1';
      const note = root.querySelector('.inv156-note');
      if (note) note.insertAdjacentElement('afterend', cta);
      else root.appendChild(cta);
    }

    cta.innerHTML = `<div><strong>${currentMode === 'actions' ? 'Cartera preparada' : 'Estrategia preparada'}</strong><small>${prepared.ready ? `${money(prepared.amount)} confirmados. Puedes avanzar.` : 'Confirma un valor o importa un archivo para continuar.'}</small></div><button type="button" data-inv158-advance="${currentMode}" ${prepared.ready ? '' : 'disabled'}>Continuar →</button>`;
  }

  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-inv158-advance], #portraitNext.inv158-native-visible');
    if (!trigger) return;
    const root = $('#portraitContent');
    const currentMode = trigger.dataset.inv158Advance || mode(root);
    if (!root || !currentMode) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    advance(root, currentMode);
  }, true);

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; patch(); });
  };
  new MutationObserver(schedule).observe(document.documentElement, {childList: true, subtree: true});
  document.addEventListener('input', schedule, true);
  document.addEventListener('change', schedule, true);
  globalThis.addEventListener('ff:ibkr-shared-updated', schedule);
  globalThis.addEventListener('focus', schedule);
  setInterval(patch, 700);
  setTimeout(patch, 60);

  globalThis.FFOnboardingNavigation158 = {version: VERSION, patch, advance, actionState, optionsState};
})();
