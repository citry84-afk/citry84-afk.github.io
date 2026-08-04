/* FinanzasFácil v15.3 · integración final de bancos del onboarding */
(() => {
  'use strict';
  if (window.__FF_BANK_FINALIZER_153__) return;
  window.__FF_BANK_FINALIZER_153__ = true;

  const BASE_STORE = 'ff_mi_plan_v2';
  const DRAFT_KEY = 'ff_onboarding_banks_v151';
  const READS_KEY = 'ff_doc_reads_v153';
  const safe = value => Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : 0;
  const slug = value => String(value || 'banco').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch (_) { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  function apply() {
    const payload = read(BASE_STORE, null);
    const draft = read(DRAFT_KEY, null);
    if (!payload?.onboardingComplete || !draft?.banks?.length || draft.applied) return false;
    const items = Array.isArray(payload.items) ? payload.items : [];
    const cashIndex = items.findIndex(item => item.type === 'cash');
    if (cashIndex < 0) return false;
    const reads = read(READS_KEY, []);
    const template = items[cashIndex];
    const created = draft.banks.map((bank, index) => {
      const confirmed = [...reads].reverse().find(item => item.context === 'bank' && item.id === bank.id);
      const hasConfirmedScreenshot = Boolean(confirmed && Number.isFinite(Number(confirmed.amount)));
      return {
        ...template,
        id:`bank-${slug(bank.name)}-${index + 1}`,
        name:bank.name,
        value:safe(bank.amount),
        monthlyContribution:index === 0 ? safe(draft.monthlyContribution) : 0,
        institution:bank.name,
        count:1,
        source:hasConfirmedScreenshot ? 'uploaded-confirmed' : bank.file ? 'uploaded' : 'entered',
        sourceLabel:hasConfirmedScreenshot ? 'Pantallazo leído y confirmado' : bank.file ? 'Pantallazo pendiente de revisar' : 'Introducido por ti',
        ownershipPct:safe(bank.ownership || 100),
        screenshotId:bank.file?.id || '',
        screenshotName:bank.file?.name || '',
        pendingValue:Boolean(bank.file && !hasConfirmedScreenshot && !safe(bank.amount)),
        updatedAt:new Date().toISOString()
      };
    });
    if (safe(draft.cashOutside) > 0) {
      created.push({
        ...template,
        id:'cash-outside-bank',
        name:'Efectivo fuera del banco',
        value:safe(draft.cashOutside),
        monthlyContribution:0,
        institution:'Efectivo',
        count:1,
        source:'entered',
        sourceLabel:'Introducido por ti',
        ownershipPct:100,
        pendingValue:false,
        updatedAt:new Date().toISOString()
      });
    }
    payload.items.splice(cashIndex, 1, ...created);
    payload.profile = {
      ...(payload.profile || {}),
      bankOnboarding:{version:'15.3',completedAt:new Date().toISOString(),banks:created.map(item => item.id)}
    };
    write(BASE_STORE, payload);
    write(DRAFT_KEY, {...draft,applied:true,appliedAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
    window.dispatchEvent(new CustomEvent('ff:banks-finalized', {detail:{count:created.length,total:created.reduce((sum,item)=>sum+safe(item.value),0)}}));
    return true;
  }

  let attempts = 0;
  const timer = setInterval(() => {
    attempts += 1;
    if (apply() || attempts > 120) clearInterval(timer);
  }, 250);
  window.addEventListener('focus', apply);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) apply(); });
  window.FFBankFinalizer153 = {apply};
})();
