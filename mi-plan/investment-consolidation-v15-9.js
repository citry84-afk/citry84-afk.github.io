/* FinanzasFácil v15.9 · una cuenta, un CSV y confirmación conjunta de productos */
(() => {
  'use strict';
  if (globalThis.__FF_INVESTMENT_CONSOLIDATION_159__) return;
  globalThis.__FF_INVESTMENT_CONSOLIDATION_159__ = true;

  const VERSION = '15.9';
  const STORE = 'ff_ibkr_products_v159';
  const BASE_STORE = 'ff_mi_plan_v2';
  const $ = (selector, root = document) => root.querySelector(selector);
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch (_) { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} };
  const finite = value => Number.isFinite(Number(value)) ? Number(value) : 0;
  const money = value => new Intl.NumberFormat('es-ES', {style:'currency',currency:'EUR',minimumFractionDigits:0,maximumFractionDigits:2}).format(finite(value));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

  const ETF_SYMBOLS = new Set([
    'SPY','QQQ','VOO','VTI','IVV','VT','VXUS','IWM','DIA','SCHD','VIG','VEA','VWO','EFA','EEM','ARKK','BND','AGG','TLT','HYG','LQD','GLD','SLV',
    'XLK','XLF','XLE','XLI','XLY','XLP','XLU','XLV','XLB','XLRE','SMH','SOXX','XBI','KWEB','IBIT','FBTC',
    'CSPX','SXR8','VUAA','VUSA','VWCE','VWRL','IWDA','SWDA','EUNL','IUSN','EMIM','CNDX','IQQQ','IQQH','ZPRV','ZPRX','XDEM','XDEQ','XDEV','XDUK',
    'MEUD','MSE','CSNDX','EQQQ','QDVE','EXXT','LYPS','LQQ','UST','WTEQ','WTAI','WCLD','INRG','IUIT','EQQB','SPYL','WEBN','FWRA','VHYL'
  ]);

  function sharedState() {
    return globalThis.FFIBKRShared156?.state?.() || read('ff_ibkr_shared_v156', null);
  }

  function currentInvestmentType() {
    const current = globalThis.FFPortraitBridge159?.current?.();
    if (['funds','stocks','options'].includes(current?.type)) return current.type;
    const root = $('#portraitContent');
    const title = $('h1', root)?.textContent || '';
    if (/fondos|ETF/i.test(title)) return 'funds';
    if (/acciones|broker/i.test(title)) return 'stocks';
    if (/opciones/i.test(title)) return 'options';
    return '';
  }

  function detection(shared) {
    const positions = Array.isArray(shared?.positions) ? shared.positions : [];
    const symbols = positions.map(item => String(item.symbol || '').toUpperCase().trim()).filter(Boolean);
    const etfSymbols = symbols.filter(symbol => ETF_SYMBOLS.has(symbol));
    const optionsTrades = finite(shared?.options?.tradesCount);
    const openOptionsCount = finite(shared?.options?.openCount);
    const state = globalThis.FFPortraitBridge159?.state?.() || {};
    const previous = read(STORE, null);
    const existingAnswers = state.answers || {};
    const detectedOptions = optionsTrades > 0 || openOptionsCount > 0;
    const nonEtfPositions = Math.max(0, positions.length - etfSymbols.length);

    let stocks = previous?.selected?.stocks;
    if (typeof stocks !== 'boolean') stocks = existingAnswers.stocks === 'yes' || nonEtfPositions > 0 || (positions.length > 0 && etfSymbols.length === 0);
    let funds = previous?.selected?.funds;
    if (typeof funds !== 'boolean') funds = existingAnswers.funds === 'yes' || etfSymbols.length > 0;
    let options = previous?.selected?.options;
    if (typeof options !== 'boolean') options = existingAnswers.options === 'yes' || detectedOptions;

    return {
      positions,
      symbols,
      etfSymbols,
      etfCount: etfSymbols.length,
      nonEtfPositions,
      optionsTrades,
      openOptionsCount,
      detectedOptions,
      selected: {stocks, funds, options}
    };
  }

  function injectStyles() {
    if ($('style[data-invest159]')) return;
    const style = document.createElement('style');
    style.dataset.invest159 = '1';
    style.textContent = `
      .inv159{--ink:#0b2240;--muted:#63758c;--line:#d3dfec;--blue:#1674d1;--orange:#ff8613;color:var(--ink)}
      .inv159 *{box-sizing:border-box}.inv159-shell{display:grid;gap:14px}.inv159-hero{padding:19px;border-radius:23px;background:linear-gradient(145deg,#0b2b52,#1261a8);color:#fff;box-shadow:0 20px 45px rgba(8,42,92,.18)}
      .inv159-hero small{color:#bad3eb;font-size:10px}.inv159-hero h2{margin:7px 0 8px;font-size:27px;letter-spacing:-.04em}.inv159-hero p{margin:0;color:#d5e3f1;font-size:12px;line-height:1.5}
      .inv159-metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.inv159-metric{padding:12px;border:1px solid #ffffff20;border-radius:15px;background:#ffffff12}.inv159-metric span{display:block;color:#bed4e9;font-size:8px;text-transform:uppercase}.inv159-metric strong{display:block;margin-top:5px;font-size:17px}
      .inv159-card{padding:16px;border:1px solid var(--line);border-radius:21px;background:#fff;box-shadow:0 12px 30px rgba(16,54,108,.06)}.inv159-card h3{margin:0 0 5px;font-size:18px}.inv159-card>p{margin:0 0 13px;color:var(--muted);font-size:11px;line-height:1.5}
      .inv159-products{display:grid;gap:9px}.inv159-product{position:relative;display:grid;grid-template-columns:42px 1fr auto;gap:11px;align-items:center;padding:12px;border:1px solid var(--line);border-radius:16px;background:#f8fbfe;cursor:pointer}.inv159-product:has(input:checked){border-color:#6aa8df;background:#eef7ff;box-shadow:0 0 0 3px rgba(22,116,209,.08)}
      .inv159-product input{position:absolute;opacity:0;pointer-events:none}.inv159-icon{display:grid;place-items:center;width:40px;height:40px;border-radius:13px;background:#e7f1fb;color:#125b99;font-weight:950}.inv159-product b{display:block;font-size:13px}.inv159-product small{display:block;margin-top:3px;color:var(--muted);font-size:9px;line-height:1.35}.inv159-check{display:grid;place-items:center;width:25px;height:25px;border:1px solid #afc2d5;border-radius:50%;color:transparent;background:#fff;font-weight:950}.inv159-product:has(input:checked) .inv159-check{border-color:var(--blue);background:var(--blue);color:#fff}
      .inv159-note{padding:12px 13px;border-radius:15px;background:#fff7e9;color:#74501d;font-size:10px;line-height:1.5}.inv159-note b{color:#55370f}
      .inv159-actions{display:flex;gap:9px}.inv159-confirm{flex:1;min-height:53px;border:0;border-radius:16px;background:linear-gradient(135deg,#ff941f,#ff790b);color:#fff;font:900 14px system-ui;box-shadow:0 13px 28px rgba(255,126,15,.25);touch-action:manipulation}.inv159-confirm:disabled{opacity:.4;box-shadow:none}
      #portraitNext.inv159-native-hidden{display:none!important}
      @media(max-width:560px){.inv159-metrics{grid-template-columns:1fr 1fr}.inv159-metric:first-child{grid-column:1/-1}.inv159-confirm{font-size:13px}}
    `;
    document.head.appendChild(style);
  }

  function renderConfirmation(root, shared, found) {
    const period = shared?.period?.label || shared?.asOf || 'Periodo no indicado';
    const etfText = found.etfCount
      ? `${found.etfCount} reconocido${found.etfCount === 1 ? '' : 's'}: ${found.etfSymbols.slice(0,4).join(', ')}${found.etfCount > 4 ? '…' : ''}`
      : 'No siempre se distinguen solo por el símbolo; confírmalo tú.';
    root.dataset.inv159 = 'confirmation';
    root.classList.add('inv159');
    root.innerHTML = `<div class="inv159-shell">
      <p class="kicker">Una cuenta, un único análisis</p>
      <h1>Confirma lo que hay en <em>Interactive Brokers.</em></h1>
      <p class="lead">El CSV ya se ha leído. No volveremos a preguntarte por acciones, ETF y opciones como si fueran cuentas distintas.</p>
      <section class="inv159-hero">
        <small>${esc(shared?.file?.name || 'Activity Statement.csv')} · ${esc(period)}</small>
        <h2>Hemos encontrado estos productos</h2>
        <p>El valor neto de la cuenta se incorporará una sola vez. Los productos quedarán como desglose de la misma cuenta.</p>
        <div class="inv159-metrics">
          <div class="inv159-metric"><span>NAV de la cuenta</span><strong>${money(shared?.nav)}</strong></div>
          <div class="inv159-metric"><span>Posiciones cotizadas</span><strong>${found.positions.length}</strong></div>
          <div class="inv159-metric"><span>Operaciones de opciones</span><strong>${found.optionsTrades}</strong></div>
        </div>
      </section>
      <section class="inv159-card">
        <h3>¿Qué contiene esta cuenta?</h3>
        <p>Revisa la detección. Puedes activar o desactivar cualquier categoría antes de continuar.</p>
        <div class="inv159-products">
          <label class="inv159-product"><input type="checkbox" data-inv159-product="stocks" ${found.selected.stocks ? 'checked' : ''}><span class="inv159-icon">↗</span><span><b>Acciones individuales</b><small>${found.nonEtfPositions > 0 ? `${found.nonEtfPositions} posiciones no reconocidas como ETF.` : 'Actívalo si tienes empresas concretas en esta cuenta.'}</small></span><span class="inv159-check">✓</span></label>
          <label class="inv159-product"><input type="checkbox" data-inv159-product="funds" ${found.selected.funds ? 'checked' : ''}><span class="inv159-icon">◫</span><span><b>ETF o fondos cotizados</b><small>${esc(etfText)}</small></span><span class="inv159-check">✓</span></label>
          <label class="inv159-product"><input type="checkbox" data-inv159-product="options" ${found.selected.options ? 'checked' : ''}><span class="inv159-icon">◎</span><span><b>Opciones financieras</b><small>${found.detectedOptions ? `${found.optionsTrades} operaciones y ${found.openOptionsCount} posiciones abiertas detectadas.` : 'No se han detectado operaciones en el periodo.'}</small></span><span class="inv159-check">✓</span></label>
        </div>
      </section>
      <div class="inv159-note"><b>Sin doble conteo:</b> ${money(shared?.nav)} será el valor de Interactive Brokers. Acciones, ETF y opciones aparecerán dentro de esa cuenta, no sumados otra vez al patrimonio.</div>
      <div class="inv159-actions"><button type="button" class="inv159-confirm" data-inv159-confirm>Confirmar productos y continuar →</button></div>
    </div>`;

    const native = $('#portraitNext');
    if (native) native.classList.add('inv159-native-hidden');
    updateButton(root);
  }

  function selectedFrom(root) {
    return {
      stocks: Boolean($('[data-inv159-product="stocks"]', root)?.checked),
      funds: Boolean($('[data-inv159-product="funds"]', root)?.checked),
      options: Boolean($('[data-inv159-product="options"]', root)?.checked)
    };
  }

  function updateButton(root) {
    const button = $('[data-inv159-confirm]', root);
    if (!button) return;
    button.disabled = !Object.values(selectedFrom(root)).some(Boolean);
  }

  function confirm(root) {
    const shared = sharedState();
    if (!shared) return;
    const found = detection(shared);
    const selected = selectedFrom(root);
    if (!Object.values(selected).some(Boolean)) return;
    write(STORE, {version:VERSION,confirmed:true,selected,detected:{etfSymbols:found.etfSymbols,positionsCount:found.positions.length,optionsTrades:found.optionsTrades,openOptionsCount:found.openOptionsCount},confirmedAt:new Date().toISOString()});
    const native = $('#portraitNext');
    if (native) native.classList.remove('inv159-native-hidden');
    globalThis.FFPortraitBridge159?.confirmInvestments?.({
      ...selected,
      nav:finite(shared.nav),
      positionsCount:found.positions.length,
      etfCount:found.etfCount,
      optionsTrades:found.optionsTrades,
      openOptionsCount:found.openOptionsCount,
      monthlyOptions:finite(shared?.preferences?.monthlyOptionsReference ?? shared?.options?.monthlyAverage),
      monthlyContribution:finite(read('ff_onboarding_brokers_v155', {})?.monthlyContribution)
    });
  }

  function postprocessCompleted() {
    const payload = read(BASE_STORE, null);
    const shared = sharedState();
    const confirmation = read(STORE, null);
    if (!payload?.onboardingComplete || !shared || !confirmation?.confirmed || payload?.metadata?.investmentConsolidationVersion === VERSION) return;
    const selected = confirmation.selected || {};
    const items = Array.isArray(payload.items) ? payload.items : [];
    const candidates = items.filter(item => ['funds','stocks','options'].includes(item.type) && /interactive brokers/i.test(`${item.name || ''} ${item.institution || ''}`));
    if (!candidates.length) return;
    const primaryType = selected.stocks ? 'stocks' : selected.funds ? 'funds' : selected.options ? 'options' : '';
    const primary = candidates.find(item => item.type === primaryType) || candidates[0];
    const found = detection(shared);
    primary.name = 'Interactive Brokers';
    primary.value = finite(shared.nav);
    primary.source = 'imported';
    primary.sourceLabel = 'CSV de Interactive Brokers';
    primary.excludeFromNetWorth = false;
    primary.metadata = {
      ...(primary.metadata || {}),
      provider:'Interactive Brokers',
      accountNav:finite(shared.nav),
      cash:finite(shared.cash),
      stockExposure:finite(shared.stockExposure),
      optionValue:finite(shared.optionValue),
      positionsCount:found.positions.length,
      etfSymbols:found.etfSymbols,
      optionsTrades:found.optionsTrades,
      openOptionsCount:found.openOptionsCount,
      file:shared?.file?.name || '',
      period:shared?.period?.label || '',
      products:selected
    };
    for (const item of candidates) {
      if (item.id === primary.id) continue;
      item.value = 0;
      item.excludeFromNetWorth = true;
      item.linkedAccountId = primary.id;
      item.linkedAccountName = primary.name;
      item.source = 'imported';
      item.sourceLabel = 'Incluido dentro de Interactive Brokers';
      item.metadata = {...(item.metadata || {}),provider:'Interactive Brokers',file:shared?.file?.name || '',period:shared?.period?.label || ''};
      if (item.type === 'options') {
        item.strategyCapital = finite(shared?.preferences?.capitalReference ?? shared.nav);
        item.monthlyGrossOptions = finite(shared?.preferences?.monthlyOptionsReference ?? shared?.options?.monthlyAverage);
        item.metadata.optionsRealized = finite(shared?.options?.realized);
        item.metadata.assignmentExposure = finite(shared?.options?.assignmentExposure);
        item.metadata.openOptionsCount = found.openOptionsCount;
      }
      if (item.type === 'funds') item.metadata.etfSymbols = found.etfSymbols;
    }
    payload.metadata = {...(payload.metadata || {}),investmentConsolidationVersion:VERSION,ibkrProducts:selected};
    payload.lastUpdated = new Date().toISOString();
    write(BASE_STORE, payload);
  }

  function patch() {
    injectStyles();
    postprocessCompleted();
    const root = $('#portraitContent');
    const shared = sharedState();
    const type = currentInvestmentType();
    if (!root || !shared || !['funds','stocks','options'].includes(type)) {
      $('#portraitNext')?.classList.remove('inv159-native-hidden');
      return;
    }
    if (root.dataset.inv159 === 'confirmation') return;
    renderConfirmation(root, shared, detection(shared));
  }

  document.addEventListener('change', event => {
    if (!event.target.matches('[data-inv159-product]')) return;
    const root = $('#portraitContent');
    if (!root) return;
    updateButton(root);
  }, true);

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-inv159-confirm]');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    const root = $('#portraitContent');
    if (root) confirm(root);
  }, true);

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; patch(); });
  };
  new MutationObserver(schedule).observe(document.documentElement, {childList:true,subtree:true});
  globalThis.addEventListener('ff:ibkr-shared-updated', schedule);
  globalThis.addEventListener('focus', schedule);
  setInterval(patch, 600);
  setTimeout(patch, 80);

  globalThis.FFInvestmentConsolidation159 = {version:VERSION,patch,detection,confirm,postprocessCompleted};
})();
