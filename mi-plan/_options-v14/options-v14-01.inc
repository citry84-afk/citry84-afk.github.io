/* FinanzasFácil · Opciones v14 — eficiencia, auditoría y ciclos ajustados sobre options-intuitive-v12.js
   No sustituye a v12: lo envuelve. Si este fichero falla, v12 sigue funcionando.
   Aporta:
     1. Importación acumulativa con deduplicación (deja de machacar el histórico)
     2. ROC anualizado sobre capital comprometido
     3. Calendario de P&L (mes a mes y día a día)
*/
(() => {
'use strict';
if (window.__FF_OPTIONS_V14__) return;
window.__FF_OPTIONS_V14__ = true;

/* ---------- claves de almacenamiento ---------- */
const STORE   = 'ff_options_safe_v9';        // la misma que v12: no se rompe compatibilidad
const V12PREF = 'ff_options_v12_prefs';
const PREFS   = 'ff_options_v14_prefs';
const BACKUP  = 'ff_options_v14_backup';     // copia de seguridad previa a la primera fusión

/* ---------- utilidades ---------- */
const readJSON  = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (_) { return null; } };
const saveJSON  = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} };
const number    = v => {
  let s = String(v ?? '').trim().replace(/\s/g, '');
  if (!s || s === '--') return 0;
  if (/^-?\d{1,3}(,\d{3})+(?:\.\d+)?$/.test(s)) s = s.replace(/,/g, '');
  else if (/^-?\d+,\d+$/.test(s) && !s.includes('.')) s = s.replace(',', '.');
  else s = s.replace(/,/g, '');
  const n = Number(s); return Number.isFinite(n) ? n : 0;
};
const esc       = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
const datePart  = v => String(v || '').slice(0, 10);
const money     = (v, compact = false, currency = 'USD') =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency, maximumFractionDigits: 0, notation: compact ? 'compact' : 'standard' }).format(Number(v) || 0);
const pct       = (v, d = 1) => `${new Intl.NumberFormat('es-ES', { maximumFractionDigits: d }).format(Number(v) || 0)}%`;
const MONTHS    = { JAN:0, FEB:1, MAR:2, APR:3, MAY:4, JUN:5, JUL:6, AUG:7, SEP:8, OCT:9, NOV:10, DEC:11 };
const MONTH_ES  = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
const parseDate   = v => { const d = new Date(datePart(v) + 'T12:00:00'); return Number.isNaN(d.getTime()) ? null : d; };
const parseExpiry = code => { const m = String(code || '').toUpperCase().match(/^(\d{2})([A-Z]{3})(\d{2})$/); return m ? new Date(2000 + Number(m[3]), MONTHS[m[2]], Number(m[1]), 12) : null; };
const daysBetween = (a, b) => Math.round((b - a) / 86400000);
const contractKey = t => [t.underlying, t.expiry, t.strike, t.right].join('|');

let prefs = { tab: 'none', calMonth: '', auditView: 'exit', ...(readJSON(PREFS) || {}) };
const savePrefs = () => saveJSON(PREFS, prefs);

/* ================================================================
   1. LECTURA DE CSV Y FUSIÓN CON DEDUPLICACIÓN
   ================================================================ */
function parseCSV(text) {
  const out = []; let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else {
      if (c === '"') quoted = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field.replace(/\r$/, '')); out.push(row); row = []; field = ''; }
      else field += c;
    }
  }
  if (field || row.length) { row.push(field); out.push(row); }
  return out;
}

function symbolParts(symbol) {
  const m = String(symbol || '').match(/^([A-Z0-9.]+)\s+(\d{2}[A-Z]{3}\d{2})\s+([\d.]+)\s+([PC])$/);
  return m ? { underlying: m[1], expiry: m[2], strike: number(m[3]), right: m[4] }
           : { underlying: String(symbol || ''), expiry: '', strike: 0, right: '' };
}

/* Mismo lector de secciones que v12, añadiendo una señal para saber si el
   extracto contiene una fotografía de posiciones. Así podemos distinguir
   "cero posiciones abiertas" de "este informe no incluye esa sección". */
function readReport(rows) {
  const open = [], trades = [], stockOpen = [], stockTrades = [];
  const stockOpening = {};
  let sawOpenPositionsSection = false;
  let baseCurrency = 'EUR', nav = null, generatedAt = '';
  for (const r of rows) {
    if (r[0] === 'Información sobre la cuenta' && r[1] === 'Data' && r[2] === 'Divisa base') baseCurrency = r[3] || 'EUR';
    if (r[0] === 'Statement' && r[1] === 'Data' && r[2] === 'WhenGenerated') generatedAt = r[3] || '';
    if (r[0] === 'Valor liquidativo' && r[1] === 'Data' && r[2] === 'Total') nav = number(r[6] ?? r[5] ?? r[3]);
    if (r[0] === 'Posiciones abiertas') sawOpenPositionsSection = true;
    if (r[0] === 'Posiciones abiertas' && r[1] === 'Data' && String(r[3]).includes('Opciones')) {
      const p = symbolParts(r[5]);
      open.push({ ...p, symbol: r[5], currency: r[4] || 'USD', quantity: number(r[6]), multiplier: number(r[7]) || 100,
                  costPrice: number(r[8]), costBasis: number(r[9]), closePrice: number(r[10]), value: number(r[11]),
                  unrealized: number(r[12]), structure: '' });
    }
    if (r[0] === 'Posiciones abiertas' && r[1] === 'Data' && r[3] === 'Acciones') {
      stockOpen.push({ symbol: r[5], currency: r[4] || baseCurrency, quantity: number(r[6]), multiplier: number(r[7]) || 1,
                       costPrice: number(r[8]), costBasis: number(r[9]), closePrice: number(r[10]), value: number(r[11]),
                       unrealized: number(r[12]), code: r[13] || '' });
    }
    if (r[0] === 'Resumen Rendimiento Valoración al mercado' && r[1] === 'Data' && r[2] === 'Acciones' && r[3]) {
      stockOpening[r[3]] = { symbol: r[3], quantity: number(r[4]), currentQuantity: number(r[5]), previousPrice: number(r[6]), currentPrice: number(r[7]) };
    }
    if (r[0] === 'Operaciones' && r[1] === 'Data' && String(r[3]).includes('Opciones')) {
      const p = symbolParts(r[5]);
      trades.push({ ...p, symbol: r[5], currency: r[4] || 'USD', date: r[6], quantity: number(r[7]), price: number(r[8]),
                    closePrice: number(r[9]), proceeds: number(r[10]), commission: number(r[11]), basis: number(r[12]),
                    realized: number(r[13]), mtm: number(r[14]), code: r[15] || '' });
    }
    if (r[0] === 'Operaciones' && r[1] === 'Data' && r[3] === 'Acciones' && r[5]) {
      stockTrades.push({ symbol: r[5], currency: r[4] || baseCurrency, date: r[6], quantity: number(r[7]), price: number(r[8]),
                         closePrice: number(r[9]), proceeds: number(r[10]), commission: number(r[11]), basis: number(r[12]),
                         realized: number(r[13]), mtm: number(r[14]), code: r[15] || '' });
    }
  }
  return { open, trades, stockOpen, stockTrades, stockOpening, sawOpenPositionsSection, baseCurrency, nav, generatedAt };
}

/* Huella de una operación. No incluye el fichero de origen a propósito:
   la misma operación en dos extractos solapados debe colapsar en una. */
const tradeFingerprint = t => [
  t.symbol, datePart(t.date), t.quantity, t.price, t.proceeds, t.commission, t.realized, t.code
].join('|');

const groupBy = (list, fn) => list.reduce((acc, x) => { (acc[fn(x)] ??= []).push(x); return acc; }, {});

/* Fusión por multiconjunto: si el CSV nuevo trae 3 ocurrencias de una huella
   y ya había 3, no se duplica; si trae 4, se añade la que faltaba.
   Reimportar el mismo fichero es idempotente. */
function mergeTrades(existing, incoming) {
  const ge = groupBy(existing || [], tradeFingerprint);
  const gi = groupBy(incoming || [], tradeFingerprint);
  const out = [];
  let added = 0, skipped = 0;
  new Set([...Object.keys(ge), ...Object.keys(gi)]).forEach(k => {
    const a = ge[k] || [], b = gi[k] || [];
    if (b.length > a.length) { out.push(...a, ...b.slice(a.length)); added += b.length - a.length; skipped += a.length; }
    else { out.push(...a); skipped += b.length; }
  });
  out.sort((x, y) => String(x.date).localeCompare(String(y.date)));
  return { trades: out, added, skipped };
}

const stockFingerprint = t => [t.symbol, String(t.date || ''), t.quantity, t.price, t.proceeds, t.commission, t.realized, t.code].join('|');
function mergeStockTrades(existing, incoming) {
  const ge = groupBy(existing || [], stockFingerprint), gi = groupBy(incoming || [], stockFingerprint);
  const out = []; let added = 0, skipped = 0;
  new Set([...Object.keys(ge), ...Object.keys(gi)]).forEach(k => {
    const a = ge[k] || [], b = gi[k] || [];
    if (b.length > a.length) { out.push(...a, ...b.slice(a.length)); added += b.length - a.length; skipped += a.length; }
    else { out.push(...a); skipped += b.length; }
  });
  out.sort((x, y) => String(x.date).localeCompare(String(y.date)));
  return { trades: out, added, skipped };
}

function detectBoxes(open) {
  const groups = groupBy(open, p => p.underlying + '|' + p.expiry);
  const boxes = [];
  Object.values(groups).forEach(g => {
    const strikes = [...new Set(g.map(x => x.strike))].sort((a, b) => a - b);
    if (strikes.length !== 2) return;
    const legs = [];
    strikes.forEach(s => ['C', 'P'].forEach(r => {
      const leg = g.find(x => x.strike === s && x.right === r && !legs.includes(x));
      if (leg) legs.push(leg);
    }));
    if (legs.length === 4) {
      legs.forEach(x => x.structure = 'box');
      boxes.push({ id: 'box|' + g[0].underlying + '|' + g[0].expiry, underlying: g[0].underlying, expiry: g[0].expiry, strikes, legs });
    }
  });
  return boxes;
}

function recomputeSummary(data, fileName, rowCount) {
  const open = data.open || [], trades = data.trades || [];
  const boxes = detectBoxes(open);
  const naked = open.filter(x => x.right === 'P' && x.quantity < 0 && x.structure !== 'box');
  return {
    file: fileName, rows: rowCount, openCount: open.length, tradeCount: trades.length,
    boxes: boxes.length, nakedPuts: naked.length,
    assignmentExposure: naked.reduce((s, x) => s + x.strike * Math.abs(x.quantity) * (x.multiplier || 100), 0),
    realized: trades.reduce((s, x) => s + x.realized, 0),
    unrealized: open.reduce((s, x) => s + x.unrealized, 0),
    updatedAt: new Date().toISOString()
  };
}

function importCSV(text, fileName) {
  const rows = parseCSV(text);
  const incoming = readReport(rows);
  if (!incoming.trades.length && !incoming.open.length && !incoming.stockTrades.length) throw new Error('El fichero no contiene operaciones reconocibles.');

  const current = readJSON(STORE) || {};
  if (!localStorage.getItem(BACKUP) && localStorage.getItem(STORE)) saveJSON(BACKUP, current);

  const merged = mergeTrades(current.trades || [], incoming.trades);
  const mergedStocks = mergeStockTrades(current.stockTrades || [], incoming.stockTrades);
  const replaceOpenSnapshot = incoming.sawOpenPositionsSection;
  const open = replaceOpenSnapshot ? incoming.open : (current.open || []);
  const stockOpen = replaceOpenSnapshot ? incoming.stockOpen : (current.stockOpen || []);

  const next = {
    ...current,
    trades: merged.trades,
    stockTrades: mergedStocks.trades,
    stockOpening: Object.keys(incoming.stockOpening || {}).length ? incoming.stockOpening : (current.stockOpening || {}),
    open,
    stockOpen,
    accountSnapshot: {
      ...(current.accountSnapshot || {}),
      baseCurrency: incoming.baseCurrency || current.accountSnapshot?.baseCurrency || 'EUR',
      nav: incoming.nav ?? current.accountSnapshot?.nav ?? null,
      generatedAt: incoming.generatedAt || current.accountSnapshot?.generatedAt || '',
      importedAt: new Date().toISOString()
    },
    openAsOf: replaceOpenSnapshot ? new Date().toISOString() : (current.openAsOf || null),
    events: merged.trades.filter(t => /(?:^|;)(?:A|Ep|Ex)(?:;|$)/.test(String(t.code || ''))),
    imports: [...(current.imports || []), {
      name: fileName, date: new Date().toISOString(), rows: rows.length,
      tradesInFile: incoming.trades.length, added: merged.added, skipped: merged.skipped,
      stockTradesInFile: incoming.stockTrades.length, stockAdded: mergedStocks.added, stockSkipped: mergedStocks.skipped,
      openCount: incoming.open.length, stockOpenCount: incoming.stockOpen.length, replacedOpenSnapshot: replaceOpenSnapshot
    }].slice(-36)
  };
  next.summary = recomputeSummary(next, fileName, rows.length);
  saveJSON(STORE, next);
  return { data: next, added: merged.added, skipped: merged.skipped, stockAdded: mergedStocks.added, stockSkipped: mergedStocks.skipped,
           rows: rows.length, tradesInFile: incoming.trades.length, stockTradesInFile: incoming.stockTrades.length,
           openCount: incoming.open.length, stockOpenCount: incoming.stockOpen.length, replacedOpenSnapshot: replaceOpenSnapshot };
}

/* ================================================================
   2. CICLOS Y ROC ANUALIZADO
   ================================================================ */
function splitContractCycles(trades) {
  const sorted = [...trades].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const segments = [];
  let current = [], running = 0;
  for (const trade of sorted) {
    if (!current.length) running = 0;
    current.push(trade);
    running += number(trade.quantity);
    if (Math.abs(running) < 1e-9) {
      segments.push(current);
      current = [];
      running = 0;
    }
  }
  if (current.length) segments.push(current);
  return segments;
}

function buildCycles(data) {
  const by = groupBy((data.trades || []).filter(t => t.right), contractKey);
  const openMap = new Map((data.open || []).map(p => [contractKey(p), p]));
  const cycles = [];

  Object.entries(by).forEach(([key, allTrades]) => {
    const segments = splitContractCycles(allTrades);
    segments.forEach((segment, index) => {
      const trades = [...segment].sort((a, b) => String(a.date).localeCompare(String(b.date)));
      const first = trades[0], last = trades.at(-1);
      const isLast = index === segments.length - 1;
      const position = isLast ? openMap.get(key) : null;
      const assigned  = trades.some(t => String(t.code).split(';').includes('A'));
      const expired   = trades.some(t => String(t.code).split(';').includes('Ep'));
      const exercised = trades.some(t => String(t.code).split(';').includes('Ex'));
      const opens = trades.filter(t => String(t.code).split(';').includes('O'));
      const closes = trades.filter(t => String(t.code).split(';').includes('C'));
      const status = position ? 'open' : assigned ? 'assigned' : expired ? 'expired' : exercised ? 'exercised'
                   : (opens.length && closes.length) ? 'closed' : 'partial';

      let running = 0, maxExposure = 0;
      trades.forEach(t => { running += number(t.quantity); maxExposure = Math.max(maxExposure, Math.abs(running)); });
      const contracts = Math.max(1, maxExposure || Math.max(...trades.map(t => Math.abs(number(t.quantity))), 1));
      const shortPut = first.right === 'P' && (
        opens.some(t => number(t.quantity) < 0) ||
        (position && number(position.quantity) < 0) ||
        closes.some(t => number(t.quantity) > 0)
      );
      const netCredit = opens.filter(t => number(t.quantity) < 0)
        .reduce((sum, t) => sum + number(t.proceeds) + number(t.commission), 0);
      const realized = trades.reduce((sum, t) => sum + number(t.realized), 0);
      const start = parseDate(first.date), end = parseDate(last.date), exp = parseExpiry(first.expiry);
      const today = new Date();
      const heldDays = start ? Math.max(1, daysBetween(start, status === 'open' ? today : (end || today))) : 1;
      const dteAtOpen = start && exp ? Math.max(1, daysBetween(start, exp)) : null;
      const multiplier = position?.multiplier || 100;
      const capital = shortPut ? Math.abs(number(first.strike)) * contracts * multiplier : 0;
      const unrealized = position ? number(position.unrealized) : 0;
      const pnl = status === 'open' ? realized + unrealized : realized;
      const rocPct  