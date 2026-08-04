/* FinanzasFácil v15.5 · núcleo de importación de brokers */
(() => {
  'use strict';
  if (globalThis.__FF_BROKER_IMPORT_155__) return;
  globalThis.__FF_BROKER_IMPORT_155__ = true;

  const VERSION = '15.5';

  function finite(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  function parseNumber(raw) {
    let text = String(raw ?? '').trim().replace(/\s/g, '');
    if (!text || text === '--') return null;
    text = text.replace(/[^0-9.,+\-]/g, '');
    if (!/\d/.test(text)) return null;
    const negative = text.includes('-');
    text = text.replace(/[+\-]/g, '');
    const comma = text.lastIndexOf(',');
    const point = text.lastIndexOf('.');
    let decimal = '';
    if (comma >= 0 && point >= 0) decimal = comma > point ? ',' : '.';
    else if (comma >= 0 && [1, 2].includes(text.length - comma - 1)) decimal = ',';
    else if (point >= 0 && [1, 2].includes(text.length - point - 1)) decimal = '.';
    if (decimal) {
      const index = text.lastIndexOf(decimal);
      text = text.slice(0, index).replace(/[.,]/g, '') + '.' + text.slice(index + 1).replace(/[.,]/g, '');
    } else {
      text = text.replace(/[.,]/g, '');
    }
    const number = Number(text);
    return Number.isFinite(number) ? (negative ? -number : number) : null;
  }

  function parseMachineNumber(raw) {
    const text = String(raw ?? '').trim().replace(/,/g, '');
    if (!text || text === '--') return null;
    const number = Number(text);
    return Number.isFinite(number) ? number : null;
  }

  function parseCSV(text) {
    const rows = [];
    let row = [], field = '', quoted = false;
    const source = String(text || '');
    const firstLine = source.split(/\r?\n/, 1)[0] || '';
    const counts = {',':(firstLine.match(/,/g)||[]).length,';':(firstLine.match(/;/g)||[]).length,'\t':(firstLine.match(/\t/g)||[]).length};
    const delimiter = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0] || ',';
    for (let index = 0; index < source.length; index += 1) {
      const char = source[index];
      if (quoted) {
        if (char === '"' && source[index + 1] === '"') { field += '"'; index += 1; }
        else if (char === '"') quoted = false;
        else field += char;
      } else if (char === '"') quoted = true;
      else if (char === delimiter) { row.push(field); field = ''; }
      else if (char === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
      else field += char;
    }
    if (field || row.length) { row.push(field.replace(/\r$/, '')); rows.push(row); }
    return rows;
  }

  function normalize(value) {
    return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }

  function calculateTotals(input = {}) {
    const brokers = Array.isArray(input.brokers) ? input.brokers : [];
    const rows = brokers.map(broker => {
      const gross = Math.max(0, finite(broker.amount) ?? 0);
      const ownership = Math.max(0, Math.min(100, finite(broker.ownership) ?? 100));
      return {
        id: String(broker.id || ''),
        name: String(broker.name || 'Broker'),
        gross,
        ownership,
        attributable: gross * ownership / 100
      };
    });
    return {
      rows,
      gross: rows.reduce((sum, row) => sum + row.gross, 0),
      attributable: rows.reduce((sum, row) => sum + row.attributable, 0)
    };
  }

  function parseIBKRSnapshot(text) {
    const rows = parseCSV(text);
    let nav = null;
    let stockExposure = null;
    let optionValue = null;
    let cash = null;
    let baseCurrency = '';
    let period = '';
    let generatedAt = '';
    const positions = [];
    const openOptions = [];

    for (const row of rows) {
      if (row[0] === 'Información sobre la cuenta' && row[1] === 'Data' && row[2] === 'Divisa base') baseCurrency = row[3] || '';
      if (row[0] === 'Account Information' && row[1] === 'Data' && row[2] === 'Base Currency') baseCurrency = row[3] || '';
      if (row[0] === 'Statement' && row[1] === 'Data' && row[2] === 'Period') period = row[3] || '';
      if (row[0] === 'Statement' && row[1] === 'Data' && row[2] === 'WhenGenerated') generatedAt = row[3] || '';

      const section = normalize(row[0]);
      const kind = normalize(row[2]);
      if ((section === 'valor liquidativo' || section === 'net asset value') && row[1] === 'Data') {
        const value = parseMachineNumber(row[6] ?? row[5] ?? row[3]);
        if (kind === 'total') nav = value;
        if (['accion', 'acciones', 'stock'].includes(kind)) stockExposure = value;
        if (['opciones', 'options'].includes(kind)) optionValue = value;
        if (['efectivo', 'cash'].includes(kind)) cash = value;
      }

      if ((section === 'posiciones abiertas' || section === 'open positions') && row[1] === 'Data') {
        const assetClass = normalize(row[3]);
        const entry = {
          currency: row[4] || baseCurrency,
          symbol: row[5] || '',
          quantity: parseMachineNumber(row[6]) ?? 0,
          value: parseMachineNumber(row[11]) ?? 0,
          unrealized: parseMachineNumber(row[12]) ?? 0
        };
        if (['acciones', 'stocks', 'stock'].includes(assetClass) && entry.symbol) positions.push(entry);
        if (assetClass.includes('opcion') || assetClass.includes('option')) openOptions.push(entry);
      }
    }

    const detected = nav !== null || positions.length > 0 || /interactive brokers|informacion sobre la cuenta|account information/i.test(String(text || ''));
    return {
      detected,
      nav,
      stockExposure,
      optionValue,
      cash,
      baseCurrency: baseCurrency || 'EUR',
      period,
      generatedAt,
      positions,
      positionsCount: positions.length,
      openOptionsCount: openOptions.length,
      rows: rows.length
    };
  }

  function genericCandidates(text) {
    const rows = parseCSV(text);
    const labels = [
      ['net liquidation', 40], ['net asset value', 38], ['valor liquidativo', 38],
      ['valor total de la cuenta', 36], ['valor total cuenta', 35], ['valor de cartera', 34],
      ['portfolio value', 34], ['account value', 32], ['total equity', 30],
      ['patrimonio', 24], ['valor total', 20], ['total', 8]
    ];
    const candidates = [];
    rows.forEach((row, rowIndex) => {
      const joined = normalize(row.join(' '));
      let labelScore = 0;
      for (const [label, score] of labels) if (joined.includes(label)) labelScore = Math.max(labelScore, score);
      if (!labelScore) return;
      row.forEach((cell, columnIndex) => {
        const amount = parseNumber(cell);
        if (amount === null || amount < 0 || amount > 1e9) return;
        const score = labelScore + Math.min(8, Math.log10(Math.max(1, amount))) + columnIndex * 0.05;
        candidates.push({amount, score, rowIndex, columnIndex, label: row.slice(0, 4).join(' · ')});
      });
    });
    const unique = new Map();
    for (const candidate of candidates) {
      const key = candidate.amount.toFixed(2);
      if (!unique.has(key) || unique.get(key).score < candidate.score) unique.set(key, candidate);
    }
    return [...unique.values()].sort((a, b) => b.score - a.score || b.amount - a.amount).slice(0, 6);
  }

  function detectGenericTotal(text) {
    const candidates = genericCandidates(text);
    const best = candidates[0] || null;
    return {
      amount: best?.amount ?? null,
      confidence: !best ? 'low' : best.score >= 35 ? 'high' : best.score >= 22 ? 'medium' : 'low',
      candidates
    };
  }

  globalThis.FFBrokerImport155 = {
    version: VERSION,
    parseNumber,
    parseMachineNumber,
    parseCSV,
    calculateTotals,
    parseIBKRSnapshot,
    genericCandidates,
    detectGenericTotal
  };
})();
