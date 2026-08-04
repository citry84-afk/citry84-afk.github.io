/* FinanzasFácil v15.5 · porcentajes bancarios sin contaminar otras pantallas */
(() => {
  'use strict';
  if (globalThis.__FF_OWNERSHIP_TOTALS_155__) return;
  globalThis.__FF_OWNERSHIP_TOTALS_155__ = true;

  const VERSION = '15.5';
  const DRAFT_KEY = 'ff_onboarding_banks_v151';
  const BASE_STORE = 'ff_mi_plan_v2';
  const finite = value => Number.isFinite(Number(value)) ? Number(value) : 0;
  const share = value => Math.max(0, Math.min(100, Number.isFinite(Number(value)) ? Number(value) : 100));
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch (_) { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const money = value => new Intl.NumberFormat('es-ES', {style:'currency',currency:'EUR',minimumFractionDigits:0,maximumFractionDigits:2}).format(finite(value));

  function calculateDraft(draft = {}) {
    const rows = (Array.isArray(draft.banks) ? draft.banks : []).map(bank => {
      const gross = Math.max(0, finite(bank.amount));
      const ownership = share(bank.ownership);
      return {id:String(bank.id || ''),gross,ownership,attributable:gross * ownership / 100};
    });
    const cash = Math.max(0, finite(draft.cashOutside));
    return {rows,gross:rows.reduce((s,x)=>s+x.gross,0)+cash,attributable:rows.reduce((s,x)=>s+x.attributable,0)+cash};
  }

  function patchBankScreen() {
    const root = document.querySelector('#portraitContent');
    if (!root) return;
    const isBankScreen = Boolean(root.querySelector('[data-bank-selected]') && root.querySelector('[data-bank-grid]'));
    if (!isBankScreen) {
      root.classList.remove('ffbank151');
      delete root.dataset.ffBankV151;
      return;
    }
    const draft = read(DRAFT_KEY, null);
    if (!draft?.banks) return;
    const totals = calculateDraft(draft);
    const summary = root.querySelector('.ffbank151-summary');
    if (summary) {
      const info = summary.firstElementChild;
      const label = info?.querySelector('span');
      const strong = info?.querySelector('strong');
      const small = info?.querySelector('small');
      if (label) label.textContent = 'Tu saldo conocido ahora';
      if (strong) strong.textContent = money(totals.attributable);
      if (small) small.textContent = 'Suma de cada saldo según el porcentaje que te corresponde';
      let gross = info?.querySelector('[data-ffbank155-gross]');
      if (info && !gross) { gross=document.createElement('small');gross.dataset.ffbank155Gross='1';gross.style.cssText='margin-top:6px;font-weight:800';info.appendChild(gross); }
      if (gross) gross.textContent = `Saldo bruto conjunto: ${money(totals.gross)}`;
    }
    totals.rows.forEach(row => {
      const card = root.querySelector(`[data-bank-card="${CSS.escape(row.id)}"]`);
      if (!card) return;
      let line = card.querySelector('[data-ffbank155-attributable]');
      if (!line) { line=document.createElement('div');line.dataset.ffbank155Attributable='1';line.style.cssText='margin-top:9px;padding:9px 10px;border-radius:12px;background:#eef6ff;color:#184f81;font-size:11px;font-weight:850';card.appendChild(line); }
      line.textContent = `Tu parte: ${money(row.attributable)} · saldo total ${money(row.gross)}`;
    });
    const original = root.querySelector('#pValue');
    if (original && String(original.value) !== String(totals.attributable)) {
      original.disabled = false;
      original.value = String(totals.attributable);
      original.dispatchEvent(new Event('input', {bubbles:true}));
    }
  }

  function normalizeStored() {
    const payload = read(BASE_STORE, null);
    if (!payload?.onboardingComplete) return false;
    const bankIds = new Set(payload.profile?.bankOnboarding?.banks || []);
    let grossTotal=0,attributableTotal=0,changed=false;
    for (const item of payload.items || []) {
      const isBank = item?.type === 'cash' && (bankIds.has(item.id) || /^bank-/.test(String(item.id || '')) || Number.isFinite(Number(item.ownershipPct)));
      if (!isBank) continue;
      const gross = Number.isFinite(Number(item.grossValue)) ? Number(item.grossValue) : Math.max(0,finite(item.value));
      const ownership = item.id === 'cash-outside-bank' ? 100 : share(item.ownershipPct);
      const attributable = gross * ownership / 100;
      grossTotal += gross; attributableTotal += attributable;
      if (item.grossValue!==gross || item.attributableValue!==attributable || item.value!==attributable || item.ownershipApplied!==true) {
        item.grossValue=gross;item.attributableValue=attributable;item.value=attributable;item.ownershipPct=ownership;item.ownershipApplied=true;changed=true;
      }
    }
    if (payload.profile?.bankOnboarding) {
      const current=payload.profile.bankOnboarding;
      if(current.grossTotal!==grossTotal || current.attributableTotal!==attributableTotal || current.ownershipVersion!==VERSION){payload.profile.bankOnboarding={...current,grossTotal,attributableTotal,ownershipVersion:VERSION};changed=true;}
    }
    if(changed){write(BASE_STORE,payload);window.dispatchEvent(new CustomEvent('ff:ownership-totals',{detail:{gross:grossTotal,attributable:attributableTotal,version:VERSION}}));}
    return changed;
  }

  let scheduled=false;
  const schedule=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;patchBankScreen();normalizeStored();});};
  document.addEventListener('input',schedule,true);document.addEventListener('change',schedule,true);document.addEventListener('click',schedule,true);
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('ff:banks-finalized',schedule);window.addEventListener('focus',schedule);
  setTimeout(schedule,40);setInterval(normalizeStored,1200);
  globalThis.FFOwnershipTotals155={version:VERSION,calculateDraft,normalizeStored};
})();
