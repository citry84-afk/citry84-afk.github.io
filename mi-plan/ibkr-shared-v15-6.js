/* FinanzasFácil v15.6 · importación compartida de Interactive Brokers */
(() => {
  'use strict';
  if (globalThis.__FF_IBKR_SHARED_156__) return;
  globalThis.__FF_IBKR_SHARED_156__ = true;

  const VERSION = '15.6';
  const STORE = 'ff_ibkr_shared_v156';
  const BROKER_DRAFT = 'ff_onboarding_brokers_v155';
  const DB_NAME = 'ff_private_files_v1';
  const DB_STORE = 'files';
  const MONTHS = {
    enero:0,febrero:1,marzo:2,abril:3,mayo:4,junio:5,julio:6,agosto:7,septiembre:8,setiembre:8,octubre:9,noviembre:10,diciembre:11,
    january:0,february:1,march:2,april:3,may:4,june:5,july:6,august:7,september:8,october:9,november:10,december:11
  };

  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch (_) { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const norm = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const finite = value => Number.isFinite(Number(value)) ? Number(value) : 0;
  const machine = value => {
    const text = String(value ?? '').trim().replace(/,/g, '');
    if (!text || text === '--') return 0;
    const number = Number(text);
    return Number.isFinite(number) ? number : 0;
  };

  function parseDate(value) {
    const text = String(value || '').trim();
    let match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) return `${match[1]}-${match[2]}-${match[3]}`;
    match = text.match(/^([A-Za-zÁÉÍÓÚáéíóúñÑ]+)\s+(\d{1,2}),\s*(\d{4})$/);
    if (!match) return '';
    const month = MONTHS[norm(match[1])];
    return month === undefined ? '' : `${match[3]}-${String(month + 1).padStart(2,'0')}-${String(Number(match[2])).padStart(2,'0')}`;
  }

  function parsePeriod(label) {
    const parts = String(label || '').split(/\s+-\s+/);
    return {label:String(label || ''),start:parseDate(parts[0]),end:parseDate(parts[1])};
  }

  function monthsInclusive(start, end) {
    if (!start || !end) return 1;
    const a = new Date(`${start}T12:00:00Z`), b = new Date(`${end}T12:00:00Z`);
    if (!Number.isFinite(a.getTime()) || !Number.isFinite(b.getTime()) || b < a) return 1;
    return Math.max(1, (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + b.getUTCMonth() - a.getUTCMonth() + 1);
  }

  function symbolParts(symbol) {
    const match = String(symbol || '').match(/^([A-Z0-9.]+)\s+(\d{2}[A-Z]{3}\d{2})\s+([\d.]+)\s+([PC])$/);
    return match ? {underlying:match[1],expiry:match[2],strike:Number(match[3]),right:match[4]} : {underlying:String(symbol || ''),expiry:'',strike:0,right:''};
  }

  function detectBoxes(openOptions) {
    const groups = new Map();
    for (const option of openOptions) {
      const key = `${option.underlying}|${option.expiry}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(option);
    }
    const boxed = new Set();
    for (const group of groups.values()) {
      const strikes = [...new Set(group.map(item => item.strike).filter(Boolean))];
      if (strikes.length !== 2) continue;
      const complete = strikes.every(strike => ['P','C'].every(right => group.some(item => item.strike === strike && item.right === right)));
      if (complete && group.length >= 4) group.forEach(item => boxed.add(item.key));
    }
    return boxed;
  }

  function analyseOptions(text, snapshot) {
    const core = globalThis.FFBrokerImport155;
    const rows = core?.parseCSV?.(text) || [];
    const openOptions = [];
    let realized = 0, commissions = 0, tradesCount = 0, assignmentEvents = 0, expirations = 0;
    let realizedBase = null, commissionsBase = null;
    let periodLabel = snapshot?.period || '';
    for (const row of rows) {
      const section = norm(row[0]);
      const format = norm(row[1]);
      const assetClass = norm(row[3]);
      if (section === 'statement' && format === 'data' && row[2] === 'Period') periodLabel = row[3] || periodLabel;
      if ((section === 'operaciones' || section === 'trades') && format === 'data' && (assetClass.includes('opcion') || assetClass.includes('option'))) {
        tradesCount += 1;
        realized += machine(row[13]);
        commissions += machine(row[11]);
      }
      if ((section === 'operaciones' || section === 'trades') && format === 'total' && (assetClass.includes('opcion') || assetClass.includes('option'))) {
        const currency = String(row[4] || '').toUpperCase();
        if (!snapshot?.baseCurrency || !currency || currency === String(snapshot.baseCurrency).toUpperCase()) {
          realizedBase = machine(row[13]);
          commissionsBase = machine(row[11]);
        }
      }
      if ((section === 'posiciones abiertas' || section === 'open positions') && format === 'data' && (assetClass.includes('opcion') || assetClass.includes('option'))) {
        const parts = symbolParts(row[5]);
        openOptions.push({
          key:`${row[5]}|${row[6]}|${row[11]}`,
          symbol:row[5] || '',
          ...parts,
          currency:row[4] || snapshot?.baseCurrency || 'USD',
          quantity:machine(row[6]),
          multiplier:machine(row[7]) || 100,
          value:machine(row[11]),
          unrealized:machine(row[12])
        });
      }
      if (/ejercicios|asignaciones|exercise|assignment/.test(section) && format === 'data') {
        const joined = norm(row.join(' '));
        if (/asign|assignment/.test(joined)) assignmentEvents += 1;
        if (/venc|expir/.test(joined)) expirations += 1;
      }
    }
    if (realizedBase !== null) realized = realizedBase;
    if (commissionsBase !== null) commissions = commissionsBase;
    const boxes = detectBoxes(openOptions);
    const shortPuts = openOptions.filter(item => item.right === 'P' && item.quantity < 0 && !boxes.has(item.key));
    const assignmentExposure = shortPuts.reduce((sum, item) => sum + item.strike * Math.abs(item.quantity) * (item.multiplier || 100), 0);
    const period = parsePeriod(periodLabel);
    const months = monthsInclusive(period.start, period.end);
    return {
      period,
      realized,
      commissions,
      tradesCount,
      openCount:openOptions.length,
      openValue:openOptions.reduce((sum,item)=>sum+finite(item.value),0),
      unrealized:openOptions.reduce((sum,item)=>sum+finite(item.unrealized),0),
      shortPutCount:shortPuts.length,
      assignmentExposure,
      assignmentEvents,
      expirations,
      monthlyAverage:realized / months,
      months,
      openOptions
    };
  }

  function analyseText(text, file = {}) {
    const core = globalThis.FFBrokerImport155;
    if (!core?.parseIBKRSnapshot) throw new Error('El lector de brokers todavía no está disponible');
    const snapshot = core.parseIBKRSnapshot(text);
    if (!snapshot.detected) throw new Error('El archivo no parece un Activity Statement de Interactive Brokers');
    const options = analyseOptions(text, snapshot);
    const period = options.period?.label ? options.period : parsePeriod(snapshot.period);
    return {
      version:VERSION,
      provider:'Interactive Brokers',
      file:{id:file.id || '',name:file.name || 'Activity Statement.csv',type:file.type || 'text/csv',size:file.size || 0},
      importedAt:new Date().toISOString(),
      period,
      asOf:period.end || '',
      generatedAt:snapshot.generatedAt || '',
      baseCurrency:snapshot.baseCurrency || 'EUR',
      nav:finite(snapshot.nav),
      cash:finite(snapshot.cash),
      stockExposure:finite(snapshot.stockExposure),
      optionValue:finite(snapshot.optionValue),
      positionsCount:snapshot.positionsCount || 0,
      positions:snapshot.positions || [],
      options,
      capitalReference:finite(snapshot.nav),
      ownership:100,
      source:'ibkr-activity-statement'
    };
  }

  function updateBrokerDraft(result) {
    const draft = read(BROKER_DRAFT, {version:'15.5',brokers:[],monthlyContribution:0,applied:false});
    if (!Array.isArray(draft.brokers)) draft.brokers = [];
    let broker = draft.brokers.find(item => item.id === 'ibkr' || /interactive brokers/i.test(item.name || ''));
    if (!broker) {
      broker = {id:'ibkr',name:'Interactive Brokers',mark:'IB',amount:null,ownership:100,method:'csv',file:null,sourceStatus:'',asOf:'',metadata:{}};
      draft.brokers.push(broker);
    }
    broker.amount = result.nav;
    broker.ownership = finite(result.ownership) || 100;
    broker.method = 'csv';
    broker.file = {...result.file,storedLocal:Boolean(result.file.id),category:'csv'};
    broker.sourceStatus = 'csv-confirmed';
    broker.asOf = result.asOf;
    broker.metadata = {
      provider:'Interactive Brokers',nav:result.nav,cash:result.cash,stockExposure:result.stockExposure,optionValue:result.optionValue,
      positionsCount:result.positionsCount,openOptionsCount:result.options.openCount,optionsRealized:result.options.realized,
      assignmentExposure:result.options.assignmentExposure,period:result.period?.label || '',generatedAt:result.generatedAt,file:result.file.name
    };
    draft.applied = false;
    draft.updatedAt = new Date().toISOString();
    write(BROKER_DRAFT, draft);
  }

  function saveResult(result) {
    write(STORE, result);
    updateBrokerDraft(result);
    window.dispatchEvent(new CustomEvent('ff:ibkr-shared-updated', {detail:result}));
    return result;
  }

  async function importText(text, file = {}) {
    const result = analyseText(text, file);
    try {
      const importer = globalThis.FFv144?.importCSV || globalThis.FFv143?.importCSV || globalThis.FFv142?.importCSV;
      if (importer) await Promise.resolve(importer(text, file.name || 'Activity Statement.csv'));
    } catch (error) {
      console.warn('[v15.6 IBKR] El histórico avanzado no pudo actualizarse, pero la fotografía sí.', error);
      result.advancedImportWarning = String(error?.message || error);
    }
    return saveResult(result);
  }

  function openDB() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) return reject(new Error('IndexedDB no disponible'));
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE, {keyPath:'id'});
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('No se pudo abrir el almacenamiento privado'));
    });
  }

  async function storeFile(file, brokerId = 'ibkr') {
    const id = `ibkr-csv-${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`;
    const record = {id,name:file.name,type:file.type,size:file.size,lastModified:file.lastModified,brokerId,brokerName:'Interactive Brokers',category:'csv',blob:file,storedAt:new Date().toISOString()};
    try {
      const db = await openDB();
      await new Promise((resolve,reject) => {
        const tx = db.transaction(DB_STORE,'readwrite');
        tx.objectStore(DB_STORE).put(record);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error || new Error('No se pudo guardar el CSV'));
      });
      db.close();
      return {id,name:file.name,type:file.type,size:file.size,storedLocal:true};
    } catch (error) {
      console.warn('[v15.6 IBKR] No se pudo conservar el archivo, pero sí procesarlo.', error);
      return {id:'',name:file.name,type:file.type,size:file.size,storedLocal:false};
    }
  }

  async function importFile(file) {
    const meta = await storeFile(file);
    const text = await file.text();
    return importText(text, meta);
  }

  async function fileFromDB(id) {
    if (!id) return null;
    const db = await openDB();
    const record = await new Promise((resolve,reject) => {
      const tx = db.transaction(DB_STORE,'readonly');
      const request = tx.objectStore(DB_STORE).get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error || new Error('No se pudo recuperar el archivo'));
    });
    db.close();
    return record?.blob || null;
  }

  let recoveryPromise = null;
  async function recoverExisting() {
    const existing = read(STORE, null);
    if (existing?.nav || existing?.file?.name) return existing;
    if (recoveryPromise) return recoveryPromise;
    recoveryPromise = (async () => {
      const draft = read(BROKER_DRAFT, null);
      const broker = draft?.brokers?.find(item => item.id === 'ibkr' || /interactive brokers/i.test(item.name || ''));
      const id = broker?.file?.id;
      if (!id) return null;
      try {
        const blob = await fileFromDB(id);
        if (!blob) return null;
        const file = new File([blob], broker.file.name || 'Interactive Brokers.csv', {type:broker.file.type || 'text/csv'});
        return await importText(await file.text(), {...broker.file,id});
      } catch (error) {
        console.warn('[v15.6 IBKR] No se pudo recuperar automáticamente el CSV anterior.', error);
        return null;
      }
    })();
    return recoveryPromise;
  }

  function state() { return read(STORE, null); }
  function updatePreferences(patch = {}) {
    const current = state();
    if (!current) return null;
    const next = {...current,...patch,preferences:{...(current.preferences || {}),...(patch.preferences || {})},updatedAt:new Date().toISOString()};
    write(STORE,next);
    window.dispatchEvent(new CustomEvent('ff:ibkr-shared-updated',{detail:next}));
    return next;
  }

  globalThis.FFIBKRShared156 = {version:VERSION,state,analyseText,importText,importFile,recoverExisting,updatePreferences,parsePeriod,monthsInclusive};
  setTimeout(recoverExisting, 120);
})();
