/* FinanzasFácil v15.4 · totales bancarios bruto y atribuible */
(() => {
  'use strict';
  if (globalThis.__FF_OWNERSHIP_TOTALS_154__) return;
  globalThis.__FF_OWNERSHIP_TOTALS_154__ = true;

  const VERSION = '15.4';
  const DRAFT_KEY = 'ff_onboarding_banks_v151';
  const BASE_STORE = 'ff_mi_plan_v2';
  const finite = value => Number.isFinite(Number(value)) ? Number(value) : 0;
  const clampShare = value => Math.max(0, Math.min(100, finite(value || 100)));
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch (_) { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const money = value => new Intl.NumberFormat('es-ES', {style:'currency',currency:'EUR',minimumFractionDigits:0,maximumFractionDigits:2}).format(finite(value));

  function calculateDraft(draft = {}) {
    const banks = Array.isArray(draft.banks) ? draft.banks : [];
    const rows = banks.map(bank => {
      const gross = Math.max(0, finite(bank.amount));
      const ownership = clampShare(bank.ownership);
      return {id:String(bank.id || ''),name:String(bank.name || 'Banco'),gross,ownership,attributable:gross * ownership / 100};
    });
    const cashOutside = Math.max(0, finite(draft.cashOutside));
    return {
      rows,
      cashOutside,
      gross: rows.reduce((sum, row) => sum + row.gross, 0) + cashOutside,
      attributable: rows.reduce((sum, row) => sum + row.attributable, 0) + cashOutside
    };
  }

  function normalizePayload(payload) {
    if (!payload || typeof payload !== 'object') return payload;
    const next = JSON.parse(JSON.stringify(payload));
    const bankIds = new Set(next.profile?.bankOnboarding?.banks || []);
    let gross = 0, attributable = 0, changed = false;
    (next.items || []).forEach(item => {
      const isBank = item?.type === 'cash' && (bankIds.has(item.id) || /^bank-/.test(String(item.id || '')) || Number.isFinite(Number(item.ownershipPct)));
      if (!isBank || item.id === 'cash-outside-bank') return;
      const raw = Number.isFinite(Number(item.grossValue)) ? Number(item.grossValue) : Math.max(0, finite(item.value));
      const ownership = clampShare(item.ownershipPct);
      const personal = raw * ownership / 100;
      gross += raw;
      attributable += personal;
      if (item.grossValue !== raw || item.attributableValue !== personal || item.value !== personal || item.ownershipApplied !== true) {
        item.grossValue = raw;
        item.attributableValue = personal;
        item.value = personal;
        item.ownershipApplied = true;
        changed = true;
      }
    });
    const cash = (next.items || []).find(item => item.id === 'cash-outside-bank');
    if (cash) {
      const raw = Number.isFinite(Number(cash.grossValue)) ? Number(cash.grossValue) : Math.max(0, finite(cash.value));
      gross += raw;
      attributable += raw;
      if (cash.grossValue !== raw || cash.attributableValue !== raw || cash.value !== raw || cash.ownershipApplied !== true) {
        cash.grossValue = raw;
        cash.attributableValue = raw;
        cash.value = raw;
        cash.ownershipPct = 100;
        cash.ownershipApplied = true;
        changed = true;
      }
    }
    if (next.profile?.bankOnboarding) {
      const previous = next.profile.bankOnboarding;
      if (previous.grossTotal !== gross || previous.attributableTotal !== attributable || previous.ownershipVersion !== VERSION) {
        next.profile.bankOnboarding = {...previous,grossTotal:gross,attributableTotal:attributable,ownershipVersion:VERSION};
        changed = true;
      }
    }
    return {payload:next,changed,gross,attributable};
  }

  function patchSummary() {
    if (typeof document === 'undefined') return;
    const draft = read(DRAFT_KEY, null);
    if (!draft?.banks) return;
    const totals = calculateDraft(draft);
    const root = document.querySelector('.ffbank151');
    if (!root) return;
    const summary = root.querySelector('.ffbank151-summary');
    if (summary) {
      const info = summary.firstElementChild;
      if (info) {
        const label = info.querySelector('span');
        const strong = info.querySelector('strong');
        const small = info.querySelector('small');
        if (label && label.textContent !== 'Tu saldo conocido ahora') label.textContent = 'Tu saldo conocido ahora';
        if (strong && strong.textContent !== money(totals.attributable)) strong.textContent = money(totals.attributable);
        if (small && small.textContent !== 'Suma de cada saldo según el porcentaje que te corresponde') small.textContent = 'Suma de cada saldo según el porcentaje que te corresponde';
        let grossLine = info.querySelector('[data-ffbank154-gross]');
        if (!grossLine) {
          grossLine = document.createElement('small');
          grossLine.dataset.ffbank154Gross = '1';
          grossLine.style.cssText = 'margin-top:6px;font-weight:800';
          info.appendChild(grossLine);
        }
        const grossText = `Saldo bruto conjunto: ${money(totals.gross)}`;
        if (grossLine.textContent !== grossText) grossLine.textContent = grossText;
      }
    }
    totals.rows.forEach(row => {
      const card = root.querySelector(`[data-bank-card="${CSS.escape(row.id)}"]`);
      if (!card) return;
      let line = card.querySelector('[data-ffbank154-attributable]');
      if (!line) {
        line = document.createElement('div');
        line.dataset.ffbank154Attributable = '1';
        line.style.cssText = 'margin-top:9px;padding:9px 10px;border-radius:12px;background:#eef6ff;color:#184f81;font-size:11px;font-weight:850';
        card.appendChild(line);
      }
      const text = `Tu parte: ${money(row.attributable)} · saldo total ${money(row.gross)}`;
      if (line.textContent !== text) line.textContent = text;
    });
    const originalValue = root.querySelector('#pValue');
    if (originalValue && String(originalValue.value) !== String(totals.attributable)) {
      originalValue.disabled = false;
      originalValue.value = String(totals.attributable);
      originalValue.dispatchEvent(new Event('input', {bubbles:true}));
    }
  }

  function normalizeStoredPayload() {
    const payload = read(BASE_STORE, null);
    if (!payload?.onboardingComplete) return false;
    const result = normalizePayload(payload);
    if (!result?.changed) return false;
    write(BASE_STORE, result.payload);
    window.dispatchEvent(new CustomEvent('ff:ownership-totals', {detail:{gross:result.gross,attributable:result.attributable,version:VERSION}}));
    return true;
  }

  function initBrowser() {
    if (typeof document === 'undefined') return;
    let scheduled = false;
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        patchSummary();
        normalizeStoredPayload();
      });
    };
    document.addEventListener('input', schedule, true);
    document.addEventListener('change', schedule, true);
    document.addEventListener('click', schedule, true);
    new MutationObserver(schedule).observe(document.documentElement, {childList:true,subtree:true});
    window.addEventListener('ff:banks-finalized', schedule);
    window.addEventListener('focus', schedule);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) schedule(); });
    setInterval(normalizeStoredPayload, 500);
    setTimeout(schedule, 40);
  }

  globalThis.FFOwnershipTotals154 = {version:VERSION,calculateDraft,normalizePayload};
  initBrowser();
})();
