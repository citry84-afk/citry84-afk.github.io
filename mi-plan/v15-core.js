/* FinanzasFácil · v15 — fotografía financiera privada y progresiva. */
(() => {
'use strict';
if (window.__FF_V15_CORE__) return;
window.__FF_V15_CORE__ = true;

const STORE = 'ff_profile_v15';
const BACKUP = 'ff_profile_v15_backup';
const SCHEMA = '15.0';
const clone = value => JSON.parse(JSON.stringify(value));
const nowIso = () => new Date().toISOString();
const readJSON = key => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { return null; } };
const saveJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const finite = value => Number.isFinite(Number(value)) ? Number(value) : null;
const firstFinite = (...values) => { for (const value of values) { const n = finite(value); if (n !== null) return n; } return null; };

function emptyState() {
  return {
    schemaVersion: SCHEMA,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    view: 'personal',
    profile: null,
    attachments: [],
    events: []
  };
}

function normalizeObservation(obs = {}) {
  return {
    id: obs.id || `obs-${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`,
    value: finite(obs.value) ?? 0,
    asOf: String(obs.asOf || '').slice(0, 10),
    source: String(obs.source || 'Manual'),
    precision: String(obs.precision || 'approximate'),
    note: String(obs.note || ''),
    createdAt: obs.createdAt || nowIso()
  };
}

function currentValue(item = {}) {
  const observations = Array.isArray(item.observations) ? item.observations : [];
  if (item.currentObservationId) {
    const selected = observations.find(x => x.id === item.currentObservationId);
    if (selected) return finite(selected.value) ?? 0;
  }
  if (finite(item.value) !== null) return finite(item.value);
  if (!observations.length) return 0;
  return finite([...observations].sort((a, b) => String(a.asOf || '').localeCompare(String(b.asOf || ''))).at(-1)?.value) ?? 0;
}

function normalizeItem(item = {}, kind = 'asset') {
  const observations = (item.observations || []).map(normalizeObservation);
  return {
    id: item.id || `${kind}-${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`,
    name: String(item.name || 'Sin nombre'),
    kind,
    category: String(item.category || (kind === 'debt' ? 'other-debt' : kind === 'income' ? 'other-income' : 'other-asset')),
    currency: String(item.currency || 'EUR'),
    value: finite(item.value) ?? (observations[0]?.value ?? 0),
    ownership: Math.max(0, Math.min(100, finite(item.ownership) ?? 100)),
    scope: String(item.scope || 'personal'),
    status: String(item.status || 'active'),
    usable: item.usable !== false,
    liquidity: item.liquidity === true,
    effectiveDate: String(item.effectiveDate || '').slice(0, 10),
    eventId: String(item.eventId || ''),
    linkedAssetId: String(item.linkedAssetId || ''),
    source: String(item.source || 'Manual'),
    precision: String(item.precision || 'approximate'),
    asOf: String(item.asOf || '').slice(0, 10),
    note: String(item.note || ''),
    observations,
    currentObservationId: String(item.currentObservationId || ''),
    metadata: item.metadata && typeof item.metadata === 'object' ? clone(item.metadata) : {}
  };
}

function normalizeProfile(profile = {}) {
  const out = {
    id: String(profile.id || 'profile'),
    displayName: String(profile.displayName || ''),
    currency: String(profile.currency || 'EUR'),
    asOf: String(profile.asOf || '').slice(0, 10),
    assets: (profile.assets || []).map(x => normalizeItem(x, 'asset')),
    debts: (profile.debts || []).map(x => normalizeItem(x, 'debt')),
    incomes: (profile.incomes || []).map(x => normalizeItem(x, 'income')),
    questions: (profile.questions || []).map(q => ({
      id: String(q.id || `q-${Math.random().toString(36).slice(2)}`),
      title: String(q.title || 'Completar dato'),
      description: String(q.description || ''),
      priority: String(q.priority || 'medium'),
      status: String(q.status || 'pending'),
      action: String(q.action || 'edit'),
      kind: String(q.kind || ''),
      linkedId: String(q.linkedId || ''),
      dueDate: String(q.dueDate || '').slice(0, 10),
      answer: q.answer ?? null
    })),
    goals: profile.goals && typeof profile.goals === 'object' ? clone(profile.goals) : {},
    ibkrAudit: profile.ibkrAudit && typeof profile.ibkrAudit === 'object' ? clone(profile.ibkrAudit) : null,
    aliases: profile.aliases && typeof profile.aliases === 'object' ? clone(profile.aliases) : {},
    notes: Array.isArray(profile.notes) ? clone(profile.notes) : []
  };
  return out;
}

function validateBundle(bundle) {
  if (!bundle || typeof bundle !== 'object') throw new Error('El archivo no contiene una configuración válida.');
  const profile = bundle.profile || bundle;
  if (!Array.isArray(profile.assets) || !Array.isArray(profile.debts)) throw new Error('Faltan las listas de activos o deudas.');
  return normalizeProfile(profile);
}

function state() {
  const current = readJSON(STORE);
  if (!current) return emptyState();
  return { ...emptyState(), ...current, schemaVersion: SCHEMA, profile: current.profile ? normalizeProfile(current.profile) : null };
}

function persist(next) {
  const clean = { ...emptyState(), ...clone(next), schemaVersion: SCHEMA, updatedAt: nowIso() };
  saveJSON(STORE, clean);
  window.dispatchEvent(new CustomEvent('ff:v15-data', { detail: clean }));
  return clone(clean);
}

function importBundle(bundle, source = 'JSON privado') {
  const before = state();
  if (!localStorage.getItem(BACKUP)) saveJSON(BACKUP, before);
  const profile = validateBundle(bundle);
  const next = {
    ...before,
    profile,
    importedAt: nowIso(),
    importSource: source,
    events: [...(before.events || []), { type: 'profile-import', source, at: nowIso() }].slice(-100)
  };
  return persist(next);
}

function findCollection(profile, kind) {
  if (kind === 'asset') return profile.assets;
  if (kind === 'debt') return profile.debts;
  if (kind === 'income') return profile.incomes;
  throw new Error('Tipo de elemento no válido.');
}

function upsertItem(kind, item) {
  const s = state();
  if (!s.profile) throw new Error('Primero importa o crea una fotografía financiera.');
  const list = findCollection(s.profile, kind);
  const normalized = normalizeItem(item, kind);
  const index = list.findIndex(x => x.id === normalized.id);
  if (index >= 0) list[index] = normalized; else list.push(normalized);
  s.events.push({ type: 'item-upsert', kind, id: normalized.id, at: nowIso() });
  return persist(s);
}

function addObservation(kind, id, observation, select = true) {
  const s = state();
  if (!s.profile) throw new Error('No hay perfil cargado.');
  const item = findCollection(s.profile, kind).find(x => x.id === id);
  if (!item) throw new Error('No se encontró el elemento.');
  const obs = normalizeObservation(observation);
  item.observations = [...(item.observations || []), obs];
  if (select) {
    item.currentObservationId = obs.id;
    item.value = obs.value;
    item.asOf = obs.asOf;
    item.source = obs.source;
    item.precision = obs.precision;
  }
  s.events.push({ type: 'observation-add', kind, id, observationId: obs.id, at: nowIso() });
  return persist(s);
}

function answerQuestion(id, answer = true) {
  const s = state();
  if (!s.profile) return s;
  const q = s.profile.questions.find(x => x.id === id);
  if (!q) return s;
  q.status = 'resolved';
  q.answer = answer;
  q.resolvedAt = nowIso();
  s.events.push({ type: 'question-resolved', id, at: nowIso() });
  return persist(s);
}

function activateEvent(eventId, asOf = new Date().toISOString().slice(0, 10)) {
  const s = state();
  if (!s.profile) throw new Error('No hay perfil cargado.');
  let changed = 0;
  [...s.profile.assets, ...s.profile.debts, ...s.profile.incomes].forEach(item => {
    if (item.eventId === eventId && item.status === 'planned') {
      item.status = 'active';
      item.asOf = asOf;
      changed += 1;
    }
  });
  s.profile.questions.filter(q => q.linkedId === eventId).forEach(q => { q.status = 'resolved'; q.answer = { activatedAt: asOf }; });
  s.events.push({ type: 'event-activated', eventId, asOf, changed, at: nowIso() });
  return persist(s);
}

function registerAttachment(meta = {}) {
  const s = state();
  const attachment = {
    id: meta.id || `file-${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`,
    name: String(meta.name || 'archivo'),
    type: String(meta.type || ''),
    size: finite(meta.size) ?? 0,
    category: String(meta.category || 'unclassified'),
    status: String(meta.status || 'pending-review'),
    linkedId: String(meta.linkedId || ''),
    note: String(meta.note || ''),
    importedAt: nowIso()
  };
  s.attachments = [...(s.attachments || []), attachment].slice(-100);
  s.events.push({ type: 'attachment', id: attachment.id, at: nowIso() });
  return persist(s);
}

function isActive(item, date = new Date().toISOString().slice(0, 10)) {
  if (item.status === 'archived' || item.status === 'closed') return false;
  if (item.status === 'planned') return false;
  if (item.effectiveDate && item.effectiveDate > date) return false;
  return true;
}

function shareFactor(item, view) {
  return view === 'family' ? 1 : (finite(item.ownership) ?? 100) / 100;
}

function calculate(input = state(), view = input.view || 'personal', date) {
  const profile = input.profile;
  if (!profile) return { empty: true, view, assets: 0, debts: 0, netWorth: 0, usableNetWorth: 0, liquidity: 0, completion: 0 };
  const activeAssets = profile.assets.filter(x => isActive(x, date));
  const activeDebts = profile.debts.filter(x => isActive(x, date));
  const amount = item => currentValue(item) * shareFactor(item, view);
  const assets = activeAssets.reduce((sum, item) => sum + amount(item), 0);
  const debts = activeDebts.reduce((sum, item) => sum + amount(item), 0);
  const usableAssets = activeAssets.filter(x => x.usable !== false).reduce((sum, item) => sum + amount(item), 0);
  const usableDebts = activeDebts.filter(x => x.usable !== false).reduce((sum, item) => sum + amount(item), 0);
  const liquidity = activeAssets.filter(x => x.liquidity === true).reduce((sum, item) => sum + amount(item), 0);
  const financialAssets = activeAssets.filter(x => ['bank','cash','broker','fund','pension'].includes(x.category)).reduce((sum, item) => sum + amount(item), 0);
  const propertyAssets = activeAssets.filter(x => ['property','garage'].includes(x.category)).reduce((sum, item) => sum + amount(item), 0);
  const propertyDebts = activeDebts.filter(x => ['mortgage','property-debt'].includes(x.category)).reduce((sum, item) => sum + amount(item), 0);
  const unresolved = profile.questions.filter(q => q.status !== 'resolved');
  const itemCount = profile.assets.length + profile.debts.length + profile.incomes.length;
  const documented = [...profile.assets, ...profile.debts, ...profile.incomes].filter(x => ['documented','synced','confirmed'].includes(x.precision)).length;
  const completion = Math.round(100 * ((documented + (profile.questions.length - unresolved.length)) / Math.max(1, itemCount + profile.questions.length)));
  const annualIncome = profile.incomes.filter(x => isActive(x, date)).reduce((sum, item) => {
    const base = currentValue(item) * shareFactor(item, view);
    const payments = finite(item.metadata?.paymentsPerYear) ?? 12;
    return sum + base * payments;
  }, 0);
  return {
    empty: false,
    view,
    assets,
    debts,
    netWorth: assets - debts,
    usableAssets,
    usableDebts,
    usableNetWorth: usableAssets - usableDebts,
    liquidity,
    financialAssets,
    propertyAssets,
    propertyDebts,
    propertyEquity: propertyAssets - propertyDebts,
    annualIncome,
    monthlyEquivalentIncome: annualIncome / 12,
    unresolvedQuestions: unresolved,
    completion,
    activeAssets,
    activeDebts
  };
}

function setView(view) {
  const s = state();
  s.view = view === 'family' ? 'family' : 'personal';
  return persist(s);
}

function syncIBKRFromOptions() {
  const s = state();
  if (!s.profile) throw new Error('No hay perfil cargado.');
  const options = readJSON('ff_options_safe_v9') || {};
  const nav = firstFinite(options.accountSnapshot?.nav, options.accountSnapshot?.netLiquidation, options.summary?.nav, options.nav);
  const asOf = String(options.openAsOf || options.lastReliableStockSnapshot?.period?.end || options.accountSnapshot?.asOf || '').slice(0, 10);
  if (nav === null) throw new Error('El extracto no contiene un NAV utilizable.');
  const asset = s.profile.assets.find(x => x.id === 'broker-ibkr' || /interactive brokers/i.test(x.name));
  if (!asset) throw new Error('No existe una cuenta de Interactive Brokers en el perfil.');
  const obs = normalizeObservation({ value: nav, asOf, source: 'CSV de Interactive Brokers', precision: 'documented', note: options.summary?.file || '' });
  asset.observations = [...(asset.observations || []), obs];
  asset.currentObservationId = obs.id;
  asset.value = obs.value;
  asset.asOf = obs.asOf;
  asset.source = obs.source;
  asset.precision = obs.precision;
  const q = s.profile.questions.find(x => x.action === 'import-ibkr');
  if (q) { q.status = 'resolved'; q.answer = { nav, asOf, file: options.summary?.file || '' }; }
  s.events.push({ type: 'ibkr-sync', nav, asOf, at: nowIso() });
  return persist(s);
}

function importIBKRCSV(text, fileName) {
  if (!window.FFv144?.importCSV) throw new Error('El importador de Interactive Brokers no está disponible.');
  const result = window.FFv144.importCSV(text, fileName);
  const synced = syncIBKRFromOptions();
  registerAttachment({ name: fileName, type: 'text/csv', category: 'ibkr', status: 'imported', note: `${result.added || 0} opciones · ${result.stockAdded || 0} movimientos` });
  return { ...result, profile: synced.profile };
}

function exportBundle() {
  const s = state();
  return { schemaVersion: SCHEMA, exportedAt: nowIso(), profile: clone(s.profile), attachments: clone(s.attachments || []) };
}

function restore() {
  const backup = readJSON(BACKUP);
  if (!backup) throw new Error('No hay copia anterior.');
  return persist(backup);
}

window.FFv15 = {
  version: SCHEMA,
  state,
  importBundle,
  exportBundle,
  upsertItem,
  addObservation,
  answerQuestion,
  activateEvent,
  registerAttachment,
  calculate,
  setView,
  syncIBKRFromOptions,
  importIBKRCSV,
  restore,
  _internals: { normalizeProfile, normalizeItem, currentValue, isActive, shareFactor, validateBundle, emptyState }
};
})();
