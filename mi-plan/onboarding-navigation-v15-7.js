/* FinanzasFácil v15.7 · navegación fiable en acciones y opciones */
(() => {
  'use strict';
  if (globalThis.__FF_ONBOARDING_NAV_157__) return;
  globalThis.__FF_ONBOARDING_NAV_157__ = true;

  const VERSION = '15.7';
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
    return {shared, capital, ready: Boolean(shared && capital > 0)};
  }

  function setInput(root, selector, value) {
    const input = $(selector, root);
    if (!input) return;
    input.disabled = false;
    input.value = String(value ?? '');
    input.dispatchEvent(new Event('input', {bubbles: true}));
    input.dispatchEvent(new Event('change', {bubbles: true}));
  }

  function prepareOriginal(root, currentMode) {
    const unknown = $('[data-unknown]', root);
    if (unknown?.classList.contains('selected')) unknown.click();

    if (currentMode === 'actions') {
      const state = actionState();
      setInput(root, '#pValue', state.attributable);
      setInput(root, '#pWhere', state.rows.map(row => row.name).join(', '));
      setInput(root, '#pCount', Math.max(1, state.rows.length));
      setInput(root, '#pMonthlyContribution', finite(state.draft?.monthlyContribution));
      return state.ready;
    }

    const state = optionsState();
    if (!state.ready) return false;
    const shared = state.shared;
    const monthly = finite(shared?.preferences?.monthlyOptionsReference ?? shared?.options?.monthlyAverage);
    setInput(root, '#pValue', state.capital);
    setInput(root, '#pWhere', 'Interactive Brokers');
    setInput(root, '#pCount', 1);
    const monthlyInput = $('[data-inv156-monthly-original]', root);
    if (monthlyInput) {
      monthlyInput.disabled = false;
      monthlyInput.value = String(monthly);
      monthlyInput.dispatchEvent(new Event('input', {bubbles: true}));
      monthlyInput.dispatchEvent(new Event('change', {bubbles: true}));
    }
    return true;
  }

  function advance(root, currentMode) {
    if (!prepareOriginal(root, currentMode)) return;
    const native = $('#portraitNext');
    if (!native) return;
    native.disabled = false;
    native.hidden = false;
    native.removeAttribute('aria-disabled');
    native.classList.add('ready', 'inv157-native-visible');
    native.click();
  }

  function ensureStyles() {
    if ($('style[data-inv-nav-157]')) return;
    const style = document.createElement('style');
    style.dataset.invNav157 = '1';
    style.textContent = `
      #portraitNext.inv157-native-visible{display:inline-flex!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important}
      .inv157-cta{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:14px 0 4px;padding:13px 14px;border:1px solid #c8d9eb;border-radius:17px;background:#fff;color:#0b2240;box-shadow:0 12px 28px rgba(16,54,108,.08)}
      .inv157-cta div{min-width:0}.inv157-cta strong,.inv157-cta small{display:block}.inv157-cta strong{font-size:13px}.inv157-cta small{margin-top:3px;color:#63758c;font-size:9px;line-height:1.35}
      .inv157-cta button{flex:none;border:0;border-radius:13px;padding:12px 15px;background:linear-gradient(135deg,#ff941f,#ff7a0a);color:#fff;font:900 12px system-ui;box-shadow:0 10px 22px rgba(255,126,15,.23)}
      .inv157-cta button:disabled{display:inline-flex!important;opacity:.42;box-shadow:none}
      @media(max-width:560px){.inv157-cta{position:sticky;bottom:calc(78px + env(safe-area-inset-bottom));z-index:45}.inv157-cta button{padding:12px 13px}}
    `;
    document.head.appendChild(style);
  }

  function patch() {
    const root = $('#portraitContent');
    if (!root) return;
    const currentMode = mode(root);
    if (!currentMode) return;

    ensureStyles();
    const state = currentMode === 'actions' ? actionState() : optionsState();
    const ready = state.ready;
    const native = $('#portraitNext');
    if (native) {
      native.disabled = !ready;
      native.hidden = false;
      native.classList.toggle('inv157-native-visible', ready);
      native.innerHTML = currentMode === 'actions'
        ? 'Guardar cartera y continuar <span>→</span>'
        : 'Guardar estrategia y continuar <span>→</span>';
    }

    let cta = $('[data-inv157-cta]', root);
    if (!cta) {
      cta = document.createElement('section');
      cta.className = 'inv157-cta';
      cta.dataset.inv157Cta = '1';
      const note = root.querySelector('.inv156-note');
      if (note) note.insertAdjacentElement('afterend', cta);
      else root.appendChild(cta);
    }

    const amount = currentMode === 'actions' ? state.attributable : state.capital;
    cta.innerHTML = `<div><strong>${currentMode === 'actions' ? 'Cartera preparada' : 'Estrategia preparada'}</strong><small>${ready ? `${money(amount)} confirmados. Puedes avanzar.` : 'Confirma un valor o importa un archivo para continuar.'}</small></div><button type="button" ${ready ? '' : 'disabled'}>Continuar →</button>`;
    $('button', cta)?.addEventListener('click', () => advance(root, currentMode), {once: true});
  }

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

  globalThis.FFOnboardingNavigation157 = {version: VERSION, patch, advance, actionState, optionsState};
})();
