/* FinanzasFácil v15.5 · alta guiada de brokers por entidad */
(() => {
  'use strict';
  if (globalThis.__FF_BROKER_ONBOARDING_155__) return;
  globalThis.__FF_BROKER_ONBOARDING_155__ = true;

  const VERSION = '15.5';
  const DRAFT_KEY = 'ff_onboarding_brokers_v155';
  const BASE_STORE = 'ff_mi_plan_v2';
  const DB_NAME = 'ff_private_files_v1';
  const DB_STORE = 'files';
  const OCR_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
  const BROKERS = [
    ['ibkr', 'Interactive Brokers', 'IB'],
    ['myinvestor', 'MyInvestor', 'MY'],
    ['degiro', 'DeGiro', 'DG'],
    ['traderepublic', 'Trade Republic', 'TR'],
    ['xtb', 'XTB', 'XTB'],
    ['etoro', 'eToro', 'eT'],
    ['renta4', 'Renta 4', 'R4'],
    ['openbank', 'Openbank', 'OB'],
    ['revolut', 'Revolut', 'R'],
    ['bankinter', 'Bankinter Broker', 'BK']
  ].map(([id, name, mark]) => ({id, name, mark}));

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safe = value => Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : 0;
  const clampShare = value => Math.max(0, Math.min(100, Number.isFinite(Number(value)) ? Number(value) : 100));
  const money = value => new Intl.NumberFormat('es-ES', {style:'currency',currency:'EUR',minimumFractionDigits:0,maximumFractionDigits:2}).format(safe(value));
  const slug = value => String(value || 'broker').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const uid = prefix => `${prefix}-${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`;
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch (_) { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  function emptyDraft() {
    return {version:VERSION,brokers:[],monthlyContribution:0,applied:false,updatedAt:new Date().toISOString()};
  }

  function loadDraft() {
    const raw = read(DRAFT_KEY, null);
    if (!raw?.brokers || !Array.isArray(raw.brokers)) return emptyDraft();
    return {
      ...emptyDraft(),
      ...raw,
      brokers: raw.brokers.map(broker => ({
        id:String(broker.id || slug(broker.name)),
        name:String(broker.name || 'Otro broker'),
        mark:String(broker.mark || String(broker.name || 'BR').slice(0,3).toUpperCase()),
        amount: broker.amount === null || broker.amount === '' ? null : safe(broker.amount),
        ownership:clampShare(broker.ownership),
        method:['manual','csv','screenshot'].includes(broker.method) ? broker.method : 'manual',
        file:broker.file && typeof broker.file === 'object' ? broker.file : null,
        sourceStatus:String(broker.sourceStatus || ''),
        asOf:String(broker.asOf || '').slice(0,10),
        metadata:broker.metadata && typeof broker.metadata === 'object' ? broker.metadata : {}
      }))
    };
  }

  let draft = loadDraft();
  if (!localStorage.getItem(BASE_STORE) && draft.applied) {
    draft = emptyDraft();
    localStorage.removeItem(DRAFT_KEY);
  }

  function saveDraft() {
    draft.version = VERSION;
    draft.updatedAt = new Date().toISOString();
    write(DRAFT_KEY, draft);
  }

  function totals() {
    return globalThis.FFBrokerImport155?.calculateTotals?.(draft) || {rows:[],gross:0,attributable:0};
  }

  function brokerById(id) {
    return draft.brokers.find(broker => broker.id === id);
  }

  function addBroker(template) {
    if (brokerById(template.id)) return;
    draft.brokers.push({id:template.id,name:template.name,mark:template.mark,amount:null,ownership:100,method:template.id === 'ibkr' ? 'csv' : 'manual',file:null,sourceStatus:'',asOf:'',metadata:{}});
    draft.applied = false;
    saveDraft();
  }

  function openDB() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) return reject(new Error('Almacenamiento privado no disponible'));
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE, {keyPath:'id'});
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('No se pudo abrir el almacenamiento privado'));
    });
  }

  async function storeFile(file, broker, category) {
    const id = uid(`broker-${category}`);
    const record = {id,name:file.name,type:file.type,size:file.size,lastModified:file.lastModified,brokerId:broker.id,brokerName:broker.name,category,blob:file,storedAt:new Date().toISOString()};
    try {
      const db = await openDB();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(DB_STORE, 'readwrite');
        tx.objectStore(DB_STORE).put(record);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error || new Error('No se pudo guardar el archivo'));
      });
      db.close();
      return {id,name:file.name,type:file.type,size:file.size,storedLocal:true,category};
    } catch (error) {
      console.warn('[v15.5 brokers] No se pudo guardar el archivo localmente.', error);
      return {id,name:file.name,type:file.type,size:file.size,storedLocal:false,error:true,category};
    }
  }

  function injectStyles() {
    if ($('style[data-ffbroker155]')) return;
    const style = document.createElement('style');
    style.dataset.ffbroker155 = '1';
    style.textContent = `
      .ffbroker155{--br-ink:#0b2240;--br-muted:#63758c;--br-line:#d4dfec;--br-card:#fff;--br-soft:#eef6ff;--br-accent:#ff8a16;--br-blue:#1674d1;color:var(--br-ink)}
      .ffbroker155 *{box-sizing:border-box}.ffbroker155 button,.ffbroker155 input{font:inherit}.ffbroker155 .lead{margin-bottom:16px}
      .ffbr-section{margin-top:15px;padding:15px;border:1px solid var(--br-line);border-radius:21px;background:rgba(255,255,255,.72)}
      .ffbr-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:11px}.ffbr-head b{display:block;font-size:16px}.ffbr-head span{display:block;margin-top:3px;color:var(--br-muted);font-size:11px;line-height:1.35}.ffbr-count{flex:none;padding:6px 9px;border-radius:999px;background:var(--br-soft);color:var(--br-blue);font-size:10px;font-weight:900}
      .ffbr-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.ffbr-choice{min-height:66px;border:1px solid var(--br-line);border-radius:16px;background:var(--br-card);color:var(--br-ink);padding:9px 7px;text-align:left;display:flex;gap:8px;align-items:center;font-weight:850}.ffbr-choice.selected{border-color:#ff9b3d;background:#fff7ee;box-shadow:0 0 0 2px rgba(255,138,22,.12)}.ffbr-mark{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;flex:none;background:#eaf3fd;color:#155994;font-size:10px;font-weight:950}.ffbr-choice.selected .ffbr-mark{background:#ffead5;color:#b65300}.ffbr-choice small{display:block;color:var(--br-muted);font-size:8px;margin-top:2px}
      .ffbr-other{width:100%;margin-top:9px;border:1px dashed #b8c9dc;border-radius:15px;background:transparent;color:#315575;padding:11px;font-weight:900}.ffbr-custom{display:flex;gap:8px;margin-top:9px}.ffbr-custom input{min-width:0;flex:1;border:1px solid var(--br-line);border-radius:13px;background:#fff;padding:11px;color:var(--br-ink)}.ffbr-custom button{border:0;border-radius:13px;background:var(--br-blue);color:#fff;padding:0 14px;font-weight:900}
      .ffbr-selected{display:grid;gap:10px}.ffbr-empty{padding:18px;border:1px dashed var(--br-line);border-radius:17px;text-align:center;color:var(--br-muted);font-size:12px}.ffbr-card{border:1px solid var(--br-line);border-radius:19px;background:var(--br-card);padding:13px}.ffbr-cardhead{display:flex;justify-content:space-between;gap:10px}.ffbr-order{display:block;color:var(--br-blue);font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.07em}.ffbr-cardhead b{display:block;margin-top:3px;font-size:17px}.ffbr-remove{border:0;background:transparent;color:#7b8ca0;font-size:22px}
      .ffbr-methods{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:11px}.ffbr-methods button{border:1px solid var(--br-line);border-radius:13px;background:#f7fafc;color:#415a75;padding:9px 6px;font-size:10px;font-weight:900}.ffbr-methods button.active{border-color:#6aa9e6;background:#edf6ff;color:#095ba7}.ffbr-methods button[data-br-method="csv"].active{border-color:#69b995;background:#eefaf5;color:#17634d}.ffbr-methods button[data-br-method="screenshot"].active{border-color:#ffad61;background:#fff5eb;color:#a44a00}
      .ffbr-detail{margin-top:10px}.ffbr-detail label{display:block;color:var(--br-muted);font-size:11px;font-weight:850}.ffbr-detail input[type="number"]{width:100%;margin-top:5px;border:1px solid var(--br-line);border-radius:14px;background:#fff;padding:12px;color:var(--br-ink);font-size:17px}.ffbr-file{display:none}.ffbr-filelabel{display:flex;justify-content:center;align-items:center;min-height:48px;border:1px dashed #79a7d5;border-radius:14px;background:#f5faff;color:#145b9c;font-weight:900;cursor:pointer}.ffbr-filemeta{display:flex;gap:9px;align-items:center;padding:10px;border-radius:13px;background:#f2f8ff;color:#2f526f}.ffbr-filemeta span{font-size:18px}.ffbr-filemeta b{display:block;font-size:11px}.ffbr-filemeta small{display:block;color:var(--br-muted);font-size:9px;margin-top:2px}.ffbr-filemeta em{margin-left:auto;font-style:normal;color:#167151;font-size:9px;font-weight:900}.ffbr-result{margin-top:8px;padding:9px 10px;border-radius:12px;background:#eef8f3;color:#17634d;font-size:10px;font-weight:850;line-height:1.35}.ffbr-pending{background:#fff6e8;color:#8f5310}
      .ffbr-share{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:11px;padding-top:10px;border-top:1px solid #e7edf4}.ffbr-share>span{margin-right:auto;color:var(--br-muted);font-size:11px;font-weight:800}.ffbr-share button{border:1px solid var(--br-line);border-radius:10px;background:#fff;color:#3f5973;padding:6px 9px;font-size:10px;font-weight:900}.ffbr-share button.active{border-color:#74abe0;background:#edf6ff;color:#075ba7}.ffbr-share input{width:70px;border:1px solid var(--br-line);border-radius:10px;padding:6px 8px;color:var(--br-ink);background:#fff;font-size:11px}
      .ffbr-bottom{display:grid;grid-template-columns:1fr 1fr;gap:10px}.ffbr-quick{display:flex;gap:6px;flex-wrap:wrap}.ffbr-quick button{border:1px solid var(--br-line);border-radius:11px;background:#fff;color:#415a75;padding:7px 10px;font-size:10px;font-weight:900}.ffbr-quick button.active{border-color:#6aa9e6;background:#edf6ff;color:#095ba7}.ffbr-custom-contrib{width:100%;margin-top:8px;border:1px solid var(--br-line);border-radius:12px;padding:10px}
      .ffbr-summary{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-top:13px;padding:13px 14px;border-radius:17px;background:#0d2b4e;color:#fff}.ffbr-summary span{display:block;color:#b9cce0;font-size:10px}.ffbr-summary strong{display:block;margin-top:3px;font-size:20px}.ffbr-summary small{display:block;margin-top:4px;color:#b9cce0;font-size:9px}.ffbr-status{flex:none;padding:7px 9px;border-radius:999px;background:#183d64;color:#cbe4ff;font-size:9px;font-weight:900}.ffbr-status.ready{background:#174b3d;color:#8fe5c7}.ffbr-status.pending{background:#5b3919;color:#ffd39b}.ffbr-note{margin-top:10px;padding:10px;border-radius:13px;background:#fff7ea;color:#76501b;font-size:10px;line-height:1.4}.ffbr-hidden{display:none!important}
      .ffbr-progress{position:fixed;inset:0;z-index:19000;display:grid;place-items:center;background:#04101db8}.ffbr-progress>div,.ffbr-dialog{background:#0d2745;color:#fff;border:1px solid #31506f;border-radius:20px}.ffbr-progress>div{width:min(390px,calc(100% - 30px));padding:20px}.ffbr-progress span{display:block;margin-top:7px;color:#bcd0e4;font-size:12px}.ffbr-bar{height:8px;margin-top:14px;background:#26435f;border-radius:99px;overflow:hidden}.ffbr-bar i{display:block;height:100%;width:8%;background:#ff8a16}
      .ffbr-dialog{width:min(560px,calc(100% - 26px));padding:0}.ffbr-dialog::backdrop{background:#020812c4}.ffbr-dialog form{padding:17px}.ffbr-dialog-head{display:flex;justify-content:space-between}.ffbr-dialog-head h3{margin:3px 0}.ffbr-dialog-close{border:0;background:transparent;color:#fff;font-size:24px}.ffbr-dialog-summary{margin:13px 0;padding:12px;border-radius:14px;background:#102945}.ffbr-dialog-summary strong{font-size:22px}.ffbr-dialog-summary span{display:block;margin-top:4px;color:#a6bad0;font-size:10px;line-height:1.4}.ffbr-dialog-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.ffbr-dialog label{display:block;margin:10px 0;color:#adc0d5;font-size:10px;font-weight:800}.ffbr-dialog input{width:100%;margin-top:5px;padding:10px;border:1px solid #31506f;border-radius:11px;background:#081a2d;color:#fff;font-size:15px}.ffbr-candidates{display:flex;gap:6px;flex-wrap:wrap}.ffbr-candidates button,.ffbr-dialog-actions button{padding:9px 11px;border:1px solid #31506f;border-radius:11px;background:#102a48;color:#fff;font-weight:800}.ffbr-candidates button.active,.ffbr-dialog-actions .primary{background:#1674d1}.ffbr-dialog-actions{display:flex;justify-content:flex-end;gap:7px;margin-top:14px}.ffbr-dialog-note{padding:9px;border-radius:10px;background:#081a2d;color:#9cb0c7;font-size:10px;line-height:1.4}
      @media(max-width:560px){.ffbr-section{padding:13px;border-radius:18px}.ffbr-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.ffbr-methods{grid-template-columns:1fr}.ffbr-bottom,.ffbr-dialog-grid{grid-template-columns:1fr}.ffbr-summary{align-items:flex-start}}
    `;
    document.head.appendChild(style);
  }

  function ensureDialog() {
    if ($('#ffbrDialog155')) return;
    document.body.insertAdjacentHTML('beforeend', `<dialog id="ffbrDialog155" class="ffbr-dialog"><form method="dialog"><div class="ffbr-dialog-head"><div><small>IMPORTACIÓN DE CARTERA</small><h3>Confirma el valor</h3></div><button value="cancel" class="ffbr-dialog-close">×</button></div><div data-ffbr-dialog-body></div></form></dialog>`);
  }

  function showProgress(title = 'Leyendo archivo…') {
    const node = document.createElement('div');
    node.className = 'ffbr-progress';
    node.innerHTML = `<div><b>${esc(title)}</b><span>Procesando en este dispositivo.</span><div class="ffbr-bar"><i></i></div></div>`;
    document.body.appendChild(node);
    return {set(percent,text){$('i',node).style.width=`${Math.max(8,Math.min(100,percent))}%`;if(text)$('span',node).textContent=text;},close(){node.remove();}};
  }

  function confirmAmount({broker,amount=null,date='',source='',details='',candidates=[]}) {
    ensureDialog();
    const dialog = $('#ffbrDialog155');
    const body = $('[data-ffbr-dialog-body]', dialog);
    body.innerHTML = `<div class="ffbr-dialog-summary"><strong>${amount === null ? 'Valor pendiente' : money(amount)}</strong><span>${esc(broker.name)}${details ? ` · ${esc(details)}` : ''}</span></div>${candidates.length > 1 ? `<div class="ffbr-candidates">${candidates.slice(0,5).map((item,index)=>`<button type="button" class="${index ? '' : 'active'}" data-ffbr-candidate="${item.amount}">${money(item.amount)}</button>`).join('')}</div>` : ''}<div class="ffbr-dialog-grid"><label>Valor neto de la cuenta (€)<input id="ffbrAmount155" type="number" min="0" step="0.01" value="${amount ?? ''}" required></label><label>Fecha<input id="ffbrDate155" type="date" value="${date || new Date().toISOString().slice(0,10)}"></label></div><div class="ffbr-dialog-grid"><label>Te corresponde (%)<input id="ffbrOwnership155" type="number" min="0" max="100" value="${broker.ownership ?? 100}"></label><label>Fuente<input value="${esc(source || 'Archivo importado')}" readonly></label></div><div class="ffbr-dialog-note">Usamos el valor neto de la cuenta, no la suma bruta de posiciones. Así no inflamos el patrimonio cuando existen efectivo, margen u opciones dentro del mismo broker.</div><div class="ffbr-dialog-actions"><button value="cancel">Cancelar</button><button value="default" class="primary">Confirmar</button></div>`;
    $$('[data-ffbr-candidate]', body).forEach(button => button.onclick = () => {
      $$('[data-ffbr-candidate]', body).forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      $('#ffbrAmount155', body).value = button.dataset.ffbrCandidate;
    });
    return new Promise(resolve => {
      const close = () => {
        dialog.removeEventListener('close', close);
        if (dialog.returnValue !== 'default') return resolve(null);
        const value = Number($('#ffbrAmount155', body).value);
        if (!Number.isFinite(value) || value < 0) return resolve(null);
        resolve({amount:value,date:$('#ffbrDate155',body).value,ownership:clampShare($('#ffbrOwnership155',body).value)});
      };
      dialog.addEventListener('close', close);
      dialog.showModal();
    });
  }

  function renderBrokerCard(broker, index) {
    const inputId = `ffbr-file-${broker.id}`;
    const manual = broker.method === 'manual';
    const accept = broker.method === 'csv' ? '.csv,text/csv' : 'image/*,application/pdf';
    const amount = broker.amount === null ? '' : broker.amount;
    const fileMarkup = broker.file ? `<div class="ffbr-filemeta"><span>${broker.method === 'csv' ? 'CSV' : '▣'}</span><div><b>${esc(broker.file.name)}</b><small>${broker.file.storedLocal ? 'Guardado de forma privada en este dispositivo' : 'Archivo seleccionado'}</small></div><em>✓ Listo</em></div><input id="${inputId}" class="ffbr-file" type="file" accept="${accept}" data-br-file="${esc(broker.id)}"><label class="ffbr-filelabel" for="${inputId}">Cambiar archivo</label>` : `<input id="${inputId}" class="ffbr-file" type="file" accept="${accept}" data-br-file="${esc(broker.id)}"><label class="ffbr-filelabel" for="${inputId}">${broker.method === 'csv' ? 'Seleccionar CSV' : 'Seleccionar imagen o PDF'}</label>`;
    const result = broker.amount !== null ? `<div class="ffbr-result">✓ Valor confirmado: ${money(broker.amount)} · tu parte ${money(broker.amount * broker.ownership / 100)}${broker.metadata?.positionsCount ? ` · ${broker.metadata.positionsCount} posiciones detectadas` : ''}</div>` : broker.file ? `<div class="ffbr-result ffbr-pending">Archivo guardado; falta confirmar el valor total.</div>` : '';
    return `<article class="ffbr-card" data-br-card="${esc(broker.id)}"><div class="ffbr-cardhead"><div><span class="ffbr-order">Entidad ${index + 1}</span><b>${esc(broker.name)}</b></div><button type="button" class="ffbr-remove" data-br-remove="${esc(broker.id)}">×</button></div><div class="ffbr-methods"><button type="button" class="${broker.method === 'csv' ? 'active' : ''}" data-br-method="csv" data-br-id="${esc(broker.id)}">CSV · recomendado</button><button type="button" class="${broker.method === 'screenshot' ? 'active' : ''}" data-br-method="screenshot" data-br-id="${esc(broker.id)}">Pantallazo</button><button type="button" class="${manual ? 'active' : ''}" data-br-method="manual" data-br-id="${esc(broker.id)}">Valor manual</button></div><div class="ffbr-detail">${manual ? `<label>Valor neto aproximado de la cuenta<input type="number" min="0" step="0.01" inputmode="decimal" data-br-amount="${esc(broker.id)}" value="${esc(amount)}" placeholder="Ej. 48.000"></label>` : fileMarkup}</div>${result}<div class="ffbr-share"><span>¿Qué porcentaje te pertenece?</span>${[100,50].map(value=>`<button type="button" class="${Math.abs(broker.ownership-value)<.01?'active':''}" data-br-share="${value}" data-br-id="${esc(broker.id)}">${value} %</button>`).join('')}<input type="number" min="0" max="100" step="1" data-br-share-custom="${esc(broker.id)}" value="${esc(broker.ownership)}"></div></article>`;
  }

  function renderGrid(root) {
    const grid = $('[data-br-grid]', root);
    if (grid) grid.innerHTML = BROKERS.map(broker => `<button type="button" class="ffbr-choice ${brokerById(broker.id) ? 'selected' : ''}" data-br-choice="${broker.id}"><span class="ffbr-mark">${esc(broker.mark)}</span><span>${esc(broker.name)}<small>${brokerById(broker.id) ? 'Añadido' : 'Toca para añadir'}</small></span></button>`).join('');
    const selected = $('[data-br-selected]', root);
    if (selected) selected.innerHTML = draft.brokers.length ? draft.brokers.map(renderBrokerCard).join('') : '<div class="ffbr-empty">Selecciona al menos un broker, banco o plataforma.</div>';
  }

  function setOriginal(root, selector, value) {
    const input = $(selector, root);
    if (!input) return;
    input.disabled = false;
    input.value = String(value ?? '');
    input.dispatchEvent(new Event('input', {bubbles:true}));
  }

  function syncOriginal(root) {
    const values = totals();
    setOriginal(root, '#pWhere', draft.brokers.map(item => item.name).join(', '));
    setOriginal(root, '#pCount', Math.max(1, draft.brokers.length));
    setOriginal(root, '#pMonthlyContribution', safe(draft.monthlyContribution));
    const unknown = $('[data-unknown]', root);
    const unknownSelected = unknown?.classList.contains('selected');
    const hasPending = draft.brokers.some(item => item.file && item.amount === null);
    if (values.attributable > 0) {
      if (unknownSelected) { unknown.click(); return; }
      setOriginal(root, '#pValue', values.attributable);
    } else if (hasPending && !unknownSelected) {
      unknown?.click();
      return;
    } else if (!hasPending) {
      if (unknownSelected) { unknown.click(); return; }
      setOriginal(root, '#pValue', 0);
    }
  }

  function updateSummary(root) {
    const values = totals();
    $('[data-br-count]', root).textContent = `${draft.brokers.length} ${draft.brokers.length === 1 ? 'entidad' : 'entidades'}`;
    $('[data-br-attributable]', root).textContent = money(values.attributable);
    $('[data-br-gross]', root).textContent = `Valor bruto conjunto: ${money(values.gross)}`;
    const pending = draft.brokers.filter(item => item.file && item.amount === null).length;
    const status = $('[data-br-status]', root);
    if (status) {
      status.className = `ffbr-status ${values.attributable > 0 ? 'ready' : pending ? 'pending' : ''}`;
      status.textContent = values.attributable > 0 ? 'Listo para continuar' : pending ? `${pending} por confirmar` : 'Añade una entidad';
    }
    syncOriginal(root);
  }

  function bind(root) {
    $$('[data-br-choice]', root).forEach(button => button.onclick = () => {
      const template = BROKERS.find(item => item.id === button.dataset.brChoice);
      if (!template) return;
      if (brokerById(template.id)) draft.brokers = draft.brokers.filter(item => item.id !== template.id);
      else addBroker(template);
      draft.applied = false; saveDraft(); renderAndBind(root);
    });
    $('[data-br-other]', root)?.addEventListener('click', () => { $('[data-br-custom]',root).hidden = false; $('[data-br-custom-input]',root).focus(); });
    $('[data-br-custom-add]', root)?.addEventListener('click', () => {
      const input = $('[data-br-custom-input]', root); const name = input.value.trim(); if (!name) return;
      addBroker({id:`other-${slug(name)}-${draft.brokers.length+1}`,name,mark:name.slice(0,3).toUpperCase()}); input.value=''; $('[data-br-custom]',root).hidden=true; renderAndBind(root);
    });
    $$('[data-br-remove]', root).forEach(button => button.onclick = () => { draft.brokers = draft.brokers.filter(item => item.id !== button.dataset.brRemove); draft.applied=false; saveDraft(); renderAndBind(root); });
    $$('[data-br-method]', root).forEach(button => button.onclick = () => {
      const broker = brokerById(button.dataset.brId); if (!broker) return;
      broker.method = button.dataset.brMethod; draft.applied=false; saveDraft(); renderAndBind(root);
      if (broker.method !== 'manual' && !broker.file) setTimeout(() => root.querySelector(`[data-br-file="${CSS.escape(broker.id)}"]`)?.click(), 40);
    });
    $$('[data-br-amount]', root).forEach(input => input.oninput = () => { const broker=brokerById(input.dataset.brAmount); if(!broker)return; broker.amount=input.value===''?null:safe(input.value); broker.sourceStatus='manual-confirmed'; broker.asOf=new Date().toISOString().slice(0,10); draft.applied=false; saveDraft(); updateSummary(root); });
    $$('[data-br-share]', root).forEach(button => button.onclick = () => { const broker=brokerById(button.dataset.brId); if(!broker)return; broker.ownership=clampShare(button.dataset.brShare); draft.applied=false; saveDraft(); renderAndBind(root); });
    $$('[data-br-share-custom]', root).forEach(input => input.oninput = () => { const broker=brokerById(input.dataset.brShareCustom); if(!broker)return; broker.ownership=clampShare(input.value); draft.applied=false; saveDraft(); updateSummary(root); });
    $$('[data-br-file]', root).forEach(input => input.onchange = async () => {
      const broker = brokerById(input.dataset.brFile); const file = input.files?.[0]; if(!broker||!file)return;
      const category = broker.method === 'csv' ? 'csv' : 'screenshot';
      broker.file = {name:file.name,type:file.type,size:file.size,storing:true,category}; draft.applied=false; saveDraft(); renderAndBind(root);
      broker.file = await storeFile(file, broker, category); saveDraft(); renderAndBind(root);
      if (category === 'csv') await processCSV(file, broker, root); else await processScreenshot(file, broker, root);
    });
    $$('[data-br-contribution]', root).forEach(button => button.onclick = () => { const value=button.dataset.brContribution; if(value==='custom'){ $('[data-br-contribution-custom]',root).hidden=false; $('[data-br-contribution-custom]',root).focus(); return;} draft.monthlyContribution=safe(value); saveDraft(); renderAndBind(root); });
    $('[data-br-contribution-custom]', root)?.addEventListener('input', event => { draft.monthlyContribution=safe(event.target.value); saveDraft(); updateSummary(root); });
  }

  function renderAndBind(root) {
    renderGrid(root); bind(root); updateSummary(root);
  }

  async function loadOCR() {
    if (globalThis.Tesseract?.recognize) return globalThis.Tesseract;
    if (loadOCR.promise) return loadOCR.promise;
    loadOCR.promise = new Promise((resolve, reject) => {
      const script = document.createElement('script'); script.src = OCR_URL;
      script.onload = () => globalThis.Tesseract?.recognize ? resolve(globalThis.Tesseract) : reject(new Error('OCR no disponible'));
      script.onerror = () => reject(new Error('No se pudo cargar el OCR'));
      document.head.appendChild(script);
    });
    return loadOCR.promise;
  }

  async function processCSV(file, broker, root) {
    const progress = showProgress('Analizando el CSV…');
    try {
      const text = await file.text();
      const core = globalThis.FFBrokerImport155;
      const ibkr = core.parseIBKRSnapshot(text);
      let proposal;
      if (broker.id === 'ibkr' || ibkr.detected) {
        progress.set(45, 'Importando operaciones y fotografía de Interactive Brokers…');
        try { globalThis.FFv144?.importCSV?.(text, file.name); } catch (error) { console.warn('[v15.5 IBKR]', error); }
        progress.close();
        proposal = await confirmAmount({broker,amount:ibkr.nav,date:'',source:`CSV ${file.name}`,details:`NAV ${money(ibkr.nav)} · ${ibkr.positionsCount} posiciones · exposición en acciones ${money(ibkr.stockExposure)}`});
        if (proposal) {
          broker.amount=proposal.amount; broker.ownership=proposal.ownership; broker.asOf=proposal.date; broker.sourceStatus='csv-confirmed';
          broker.metadata={provider:'Interactive Brokers',nav:ibkr.nav,stockExposure:ibkr.stockExposure,optionValue:ibkr.optionValue,cash:ibkr.cash,positionsCount:ibkr.positionsCount,openOptionsCount:ibkr.openOptionsCount,period:ibkr.period,generatedAt:ibkr.generatedAt,file:file.name};
        }
      } else {
        const generic = core.detectGenericTotal(text);
        progress.close();
        proposal = await confirmAmount({broker,amount:generic.amount,date:'',source:`CSV ${file.name}`,details:generic.amount===null?'No hemos encontrado un total fiable; puedes escribirlo':`Total probable · confianza ${generic.confidence}`,candidates:generic.candidates});
        if (proposal) {
          broker.amount=proposal.amount; broker.ownership=proposal.ownership; broker.asOf=proposal.date; broker.sourceStatus='csv-confirmed'; broker.metadata={provider:broker.name,file:file.name,confidence:generic.confidence};
        }
      }
    } catch (error) {
      console.warn('[v15.5 CSV]', error);
      broker.sourceStatus='csv-pending';
    } finally {
      progress.close(); draft.applied=false; saveDraft(); renderAndBind(root);
    }
  }

  async function processScreenshot(file, broker, root) {
    const progress = showProgress('Leyendo el pantallazo…');
    try {
      if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
        progress.close();
        const proposal = await confirmAmount({broker,amount:null,date:'',source:`PDF ${file.name}`,details:'El PDF queda guardado; confirma manualmente el valor neto'});
        if (proposal) { broker.amount=proposal.amount;broker.ownership=proposal.ownership;broker.asOf=proposal.date;broker.sourceStatus='screenshot-confirmed';broker.metadata={provider:broker.name,file:file.name,type:'pdf'}; }
      } else {
        const OCR = await loadOCR();
        const result = await OCR.recognize(file, 'spa', {logger: message => { if(message.status==='recognizing text')progress.set(10+Math.round((message.progress||0)*85),'Buscando el valor total de la cartera…'); }});
        const analysis = globalThis.FFDocumentReader?.analyse?.(result?.data?.text || '', broker.name) || {amount:null,date:'',confidence:'low',candidates:[]};
        progress.close();
        const proposal = await confirmAmount({broker,amount:analysis.amount,date:analysis.date,source:`Pantallazo ${file.name}`,details:`confianza ${analysis.confidence}`,candidates:analysis.candidates || []});
        if (proposal) { broker.amount=proposal.amount;broker.ownership=proposal.ownership;broker.asOf=proposal.date;broker.sourceStatus='screenshot-confirmed';broker.metadata={provider:broker.name,file:file.name,confidence:analysis.confidence}; }
      }
    } catch (error) {
      console.warn('[v15.5 pantallazo]', error); broker.sourceStatus='screenshot-pending';
    } finally {
      progress.close();draft.applied=false;saveDraft();renderAndBind(root);
    }
  }

  function patchStocksDetail() {
    const root = $('#portraitContent');
    if (!root) return;
    const title = $('h1', root)?.textContent || '';
    if (!/acciones/i.test(title)) {
      if (!root.querySelector('[data-bank-selected]')) { root.classList.remove('ffbank151'); delete root.dataset.ffBankV151; }
      return;
    }
    if (root.dataset.ffBrokerV155 === '1') return;
    const valueInput = $('#pValue', root), whereInput = $('#pWhere', root), countInput = $('#pCount', root);
    if (!valueInput || !whereInput || !countInput) return;
    root.classList.remove('ffbank151'); delete root.dataset.ffBankV151;
    const hidden = document.createElement('div'); hidden.className='ffbr-hidden'; hidden.dataset.brOriginal='1';
    [valueInput,whereInput,countInput,$('#pMonthlyContribution',root),$('[data-unknown]',root)].filter(Boolean).forEach(node=>hidden.appendChild(node));
    root.dataset.ffBrokerV155='1'; root.classList.add('ffbroker155');
    root.innerHTML = `<p class="kicker">Una entidad cada vez, no una acción cada vez</p><h1>Añade tus <em>brokers.</em></h1><p class="lead">Selecciona dónde inviertes y completa el valor total mediante CSV, pantallazo o una cifra manual. Las posiciones individuales solo se importarán cuando el archivo sea compatible.</p><section class="ffbr-section"><div class="ffbr-head"><div><b>1. ¿Dónde tienes tus inversiones?</b><span>Incluye brokers y bancos donde mantienes acciones, ETF u otras inversiones cotizadas.</span></div><span class="ffbr-count" data-br-count>0 entidades</span></div><div class="ffbr-grid" data-br-grid></div><button type="button" class="ffbr-other" data-br-other>＋ Otro broker o banco</button><div class="ffbr-custom" data-br-custom hidden><input data-br-custom-input maxlength="50" placeholder="Nombre de la entidad"><button type="button" data-br-custom-add>Añadir</button></div></section><section class="ffbr-section"><div class="ffbr-head"><div><b>2. Completa cada entidad</b><span>El CSV es la mejor opción cuando tienes muchas posiciones. Para Interactive Brokers también incorpora el histórico de opciones.</span></div></div><div class="ffbr-selected" data-br-selected></div></section><section class="ffbr-section"><div class="ffbr-bottom"><div><div class="ffbr-head"><div><b>¿Cuánto añades cada mes?</b><span>Puedes indicar la aportación total entre todos los brokers.</span></div></div><div class="ffbr-quick"><button type="button" data-br-contribution="0">0 €</button><button type="button" data-br-contribution="250">250 €</button><button type="button" data-br-contribution="500">500 €</button><button type="button" data-br-contribution="1000">1.000 €</button><button type="button" data-br-contribution="custom">Otro</button></div><input class="ffbr-custom-contrib" type="number" min="0" data-br-contribution-custom value="${esc(draft.monthlyContribution || '')}" placeholder="Aportación mensual"></div><div><div class="ffbr-note"><b>Sin doble conteo.</b><br>La cifra principal es el valor neto de cada cuenta. Las acciones, ETF y opciones importadas serán el desglose de esa cuenta, no activos que se vuelvan a sumar.</div></div></div></section><div class="ffbr-summary"><div><span>Tu cartera atribuible ahora</span><strong data-br-attributable>0 €</strong><small>Aplicando el porcentaje de propiedad de cada cuenta</small><small data-br-gross>Valor bruto conjunto: 0 €</small></div><span class="ffbr-status" data-br-status>Añade una entidad</span></div>`;
    root.appendChild(hidden);
    const next = $('#portraitNext'); if(next)next.innerHTML='Añadir brokers al mapa <span>→</span>';
    renderAndBind(root);
  }

  function finalize() {
    const payload = read(BASE_STORE, null);
    const current = read(DRAFT_KEY, null);
    if (!payload?.onboardingComplete || !current?.brokers?.length || current.applied) return false;
    const items = Array.isArray(payload.items) ? payload.items : [];
    const index = items.findIndex(item => item.type === 'stocks');
    if (index < 0) return false;
    const template = items[index];
    const created = current.brokers.map((broker, position) => {
      const gross = safe(broker.amount); const ownership = clampShare(broker.ownership); const attributable = gross * ownership / 100;
      return {...template,id:`broker-${slug(broker.name)}-${position+1}`,name:broker.name,value:attributable,grossValue:gross,attributableValue:attributable,ownershipPct:ownership,ownershipApplied:true,accountContainer:true,institution:broker.name,count:1,monthlyContribution:position===0?safe(current.monthlyContribution):0,source:broker.sourceStatus?.includes('csv')?'imported':broker.sourceStatus?.includes('screenshot')?'uploaded-confirmed':'entered',sourceLabel:broker.sourceStatus?.includes('csv')?'CSV importado':broker.sourceStatus?.includes('screenshot')?'Pantallazo leído y confirmado':'Introducido por ti',fileName:broker.file?.name||'',asOf:broker.asOf||'',metadata:broker.metadata||{},updatedAt:new Date().toISOString()};
    });
    payload.items.splice(index,1,...created);
    payload.profile={...(payload.profile||{}),brokerOnboarding:{version:VERSION,completedAt:new Date().toISOString(),brokers:created.map(item=>item.id),grossTotal:created.reduce((s,x)=>s+safe(x.grossValue),0),attributableTotal:created.reduce((s,x)=>s+safe(x.value),0)}};
    write(BASE_STORE,payload);write(DRAFT_KEY,{...current,applied:true,appliedAt:new Date().toISOString()});
    window.dispatchEvent(new CustomEvent('ff:brokers-finalized',{detail:payload.profile.brokerOnboarding}));
    return true;
  }

  injectStyles(); ensureDialog();
  const host = $('#portraitContent'); if(host)new MutationObserver(()=>requestAnimationFrame(patchStocksDetail)).observe(host,{childList:true,subtree:true});
  new MutationObserver(()=>requestAnimationFrame(patchStocksDetail)).observe(document.body,{childList:true,subtree:true});
  let attempts=0;const timer=setInterval(()=>{attempts+=1;if(finalize()||attempts>160)clearInterval(timer)},250);
  setTimeout(patchStocksDetail,30);
  globalThis.FFBrokerOnboarding155={version:VERSION,totals,finalize,state:()=>JSON.parse(JSON.stringify(draft))};
})();
