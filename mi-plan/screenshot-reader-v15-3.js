/* FinanzasFácil v15.3 · lector local de pantallazos estable */
(() => {
  'use strict';
  if (window.__FF_DOC_READER_153__) return;
  window.__FF_DOC_READER_153__ = true;

  const VERSION = '15.3';
  const DRAFT_KEY = 'ff_onboarding_banks_v151';
  const READS_KEY = 'ff_doc_reads_v153';
  const LEGACY_READS_KEY = 'ff_doc_reads_v152';
  const OCR_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
  const BANKS = ['CaixaBank','Santander','BBVA','Sabadell','ING','Unicaja','Bankinter','Openbank','MyInvestor','Revolut','DeGiro','Interactive Brokers'];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
    catch (_) { return fallback; }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = value => new Intl.NumberFormat('es-ES', {style:'currency',currency:'EUR',minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(value || 0));
  const norm = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  function parseNumber(raw) {
    let text = String(raw || '').replace(/[^0-9.,-]/g, '');
    if (!/\d/.test(text)) return null;
    const negative = text.includes('-');
    text = text.replace(/-/g, '');
    const comma = text.lastIndexOf(',');
    const point = text.lastIndexOf('.');
    let decimal = '';
    if (comma >= 0 && point >= 0) decimal = comma > point ? ',' : '.';
    else if (comma >= 0 && [1, 2].includes(text.length - comma - 1)) decimal = ',';
    else if (point >= 0 && [1, 2].includes(text.length - point - 1)) decimal = '.';
    if (decimal) {
      const index = text.lastIndexOf(decimal);
      text = text.slice(0, index).replace(/[.,]/g, '') + '.' + text.slice(index + 1).replace(/[.,]/g, '').slice(0, 2).padEnd(2, '0');
    } else {
      text = text.replace(/[.,]/g, '');
    }
    const value = Number(text);
    return Number.isFinite(value) ? (negative ? -value : value) : null;
  }

  function candidateScore(context, raw, amount) {
    const text = norm(context);
    let score = /€|\beur\b/i.test(raw) ? 6 : 0;
    const weights = [
      ['saldo disponible', 24], ['saldo total', 22], ['saldo actual', 20], ['saldo', 12],
      ['capital pendiente', 24], ['deuda pendiente', 20], ['net liquidation', 24],
      ['valor total', 18], ['valor de mercado', 18], ['disponible', 10], ['patrimonio', 10],
      ['cuenta corriente', 8], ['total', 5], ['movimiento', -12], ['transferencia', -12],
      ['bizum', -14], ['tarjeta', -10], ['pago', -9], ['compra', -9], ['recibo', -10],
      ['comision', -10], ['cuota', -8], ['rentabilidad', -12], ['iban', -12]
    ];
    for (const [word, points] of weights) if (text.includes(word)) score += points;
    if (/%/.test(context)) score -= 15;
    if (amount >= 100) score += Math.min(6, Math.log10(amount));
    return score;
  }

  function findCandidates(text) {
    const source = String(text || '').replace(/\u00a0/g, ' ');
    const regex = /(?:€\s*)?-?\d{1,3}(?:[.\s]\d{3})*(?:,\d{1,2})?(?:\s*(?:€|EUR))|(?:€\s*)?-?\d+(?:[.,]\d{1,2})?(?:\s*(?:€|EUR))|-?\d{1,3}(?:[.\s]\d{3})+(?:,\d{1,2})?|-?\d+[.,]\d{2}/gi;
    const unique = new Map();
    let match;
    while ((match = regex.exec(source))) {
      const amount = parseNumber(match[0]);
      if (amount === null || amount < 0 || amount > 1e8) continue;
      const start = Math.max(0, match.index - 60);
      const end = Math.min(source.length, match.index + match[0].length + 60);
      const context = source.slice(start, end).replace(/\s+/g, ' ');
      const lineStart = source.lastIndexOf('\n', match.index - 1) + 1;
      const lineEndFound = source.indexOf('\n', match.index + match[0].length);
      const line = source.slice(lineStart, lineEndFound < 0 ? source.length : lineEndFound);
      const score = Math.max(candidateScore(context, match[0], amount), candidateScore(line, match[0], amount) + 4);
      const key = amount.toFixed(2);
      const candidate = {amount, raw:match[0], score};
      if (!unique.has(key) || unique.get(key).score < score) unique.set(key, candidate);
    }
    return [...unique.values()].sort((a, b) => b.score - a.score || b.amount - a.amount).slice(0, 5);
  }

  function extractDate(text) {
    const match = String(text || '').match(/\b([0-3]?\d)[\/-]([01]?\d)[\/-](20\d{2})\b/);
    return match ? `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}` : '';
  }

  function inferKind(text) {
    const value = norm(text);
    if (/hipoteca|prestamo|capital pendiente|deuda pendiente/.test(value)) return {kind:'debt',category:'mortgage',label:'Hipoteca'};
    if (/plan de pensiones|jubilacion/.test(value)) return {kind:'asset',category:'pension',label:'Plan de pensiones'};
    if (/interactive brokers|degiro|broker|net liquidation|valor de mercado/.test(value)) return {kind:'asset',category:'broker',label:'Broker'};
    if (/tasacion|valoracion.*vivienda|inmueble/.test(value)) return {kind:'asset',category:'property',label:'Inmueble'};
    return {kind:'asset',category:'bank',label:'Banco'};
  }

  function analyse(text, preferredInstitution = '') {
    const candidates = findCandidates(text);
    const best = candidates[0];
    const normalized = norm(text);
    const institution = preferredInstitution || BANKS.find(bank => normalized.includes(norm(bank))) || '';
    const confidence = !best ? 'low' : best.score >= 18 ? 'high' : best.score >= 8 ? 'medium' : 'low';
    return {text,candidates,amount:best?.amount ?? null,date:extractDate(text),institution,confidence,...inferKind(text)};
  }

  function ensureUI() {
    if ($('#ffread153')) return;
    const style = document.createElement('style');
    style.dataset.ffReader153 = '1';
    style.textContent = `
      .ffr153-progress{position:fixed;inset:0;z-index:19000;display:grid;place-items:center;background:#04101db8}
      .ffr153-progress>div,.ffr153{background:#0d2745;color:#fff;border:1px solid #31506f;border-radius:20px}
      .ffr153-progress>div{width:min(390px,calc(100% - 30px));padding:20px}.ffr153-progress span{display:block;margin-top:7px;color:#bcd0e4;font-size:12px}
      .ffr153-bar{height:8px;margin-top:14px;background:#26435f;border-radius:99px;overflow:hidden}.ffr153-bar i{display:block;height:100%;width:8%;background:#ff8a16}
      .ffr153{width:min(560px,calc(100% - 26px));padding:0}.ffr153::backdrop{background:#020812c4}.ffr153 form{padding:17px}
      .ffr153-head{display:flex;justify-content:space-between}.ffr153-head h3{margin:3px 0}.ffr153-close{border:0;background:transparent;color:#fff;font-size:24px}
      .ffr153-summary{margin:13px 0;padding:12px;border-radius:14px;background:#102945}.ffr153-summary strong{font-size:22px}.ffr153-summary span{display:block;margin-top:4px;color:#a6bad0;font-size:10px}
      .ffr153-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.ffr153-field{display:block;margin:10px 0;color:#adc0d5;font-size:10px;font-weight:800}
      .ffr153-field input,.ffr153-field select{width:100%;margin-top:5px;padding:10px;border:1px solid #31506f;border-radius:11px;background:#081a2d;color:#fff;font-size:15px}
      .ffr153-candidates{display:flex;gap:6px;flex-wrap:wrap}.ffr153-candidates button,.ffr153-actions button{padding:9px 11px;border:1px solid #31506f;border-radius:11px;background:#102a48;color:#fff;font-weight:800}
      .ffr153-candidates button.active,.ffr153-actions .primary{background:#1674d1}.ffr153-actions{display:flex;justify-content:flex-end;gap:7px;margin-top:14px}
      .ffr153-note{padding:9px;border-radius:10px;background:#081a2d;color:#9cb0c7;font-size:10px}.ffr153-status{margin-top:8px;padding:8px;border-radius:10px;background:#e9f8f1;color:#17634d;font-size:10px;font-weight:800}
      @media(max-width:560px){.ffr153-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
    document.body.insertAdjacentHTML('beforeend', `<dialog id="ffread153" class="ffr153"><form method="dialog"><div class="ffr153-head"><div><small>LECTURA DEL DOCUMENTO</small><h3>Confirma el dato</h3></div><button value="cancel" class="ffr153-close" aria-label="Cerrar">×</button></div><div data-ffr153-body></div></form></dialog>`);
  }

  function showProgress() {
    const node = document.createElement('div');
    node.className = 'ffr153-progress';
    node.innerHTML = '<div><b>Leyendo el pantallazo…</b><span>Preparando la imagen en este dispositivo.</span><div class="ffr153-bar"><i></i></div></div>';
    document.body.appendChild(node);
    return {set(percent,text){$('i',node).style.width=`${Math.max(8,Math.min(100,percent))}%`;if(text)$('span',node).textContent=text;},close(){node.remove();}};
  }

  function profileTargets(kind) {
    const profile = window.FFv15?.state?.()?.profile;
    if (!profile) return '';
    const list = kind === 'debt' ? profile.debts : kind === 'income' ? profile.incomes : profile.assets;
    return list.map(item => `<option value="${esc(item.id)}">${esc(item.name)}</option>`).join('');
  }

  function askConfirmation(analysis, context = {}) {
    ensureUI();
    const dialog = $('#ffread153');
    const body = $('[data-ffr153-body]', dialog);
    const bank = context.type === 'bank';
    body.innerHTML = `<div class="ffr153-summary"><strong>${analysis.amount === null ? 'No encontrado' : money(analysis.amount)}</strong><span>${esc(analysis.institution || context.bankName || analysis.label)} · ${esc(analysis.date || 'fecha no detectada')} · confianza ${analysis.confidence}</span></div>${analysis.candidates.length > 1 ? `<div class="ffr153-candidates">${analysis.candidates.slice(0,4).map((item,index) => `<button type="button" class="${index ? '' : 'active'}" data-ffr153-value="${item.amount}">${money(item.amount)}</button>`).join('')}</div>` : ''}<div class="ffr153-grid"><label class="ffr153-field">Importe (€)<input id="ffr153Amount" type="number" min="0" step="0.01" value="${analysis.amount ?? ''}" required></label><label class="ffr153-field">Fecha<input id="ffr153Date" type="date" value="${analysis.date || new Date().toISOString().slice(0,10)}"></label></div><div class="ffr153-grid"><label class="ffr153-field">Te corresponde (%)<input id="ffr153Ownership" type="number" min="0" max="100" value="${context.ownership ?? 100}"></label><label class="ffr153-field">Nombre<input id="ffr153Name" value="${esc(context.bankName || analysis.institution || analysis.label)}" ${bank ? 'readonly' : ''}></label></div>${bank ? '' : `<div class="ffr153-grid"><label class="ffr153-field">Tipo<select id="ffr153Kind"><option value="asset" ${analysis.kind === 'asset' ? 'selected' : ''}>Activo</option><option value="debt" ${analysis.kind === 'debt' ? 'selected' : ''}>Deuda</option><option value="income">Ingreso</option></select></label><label class="ffr153-field">Actualizar existente<select id="ffr153Target"><option value="">Crear nuevo</option>${profileTargets(analysis.kind)}</select></label></div>`}<div class="ffr153-note">No se suma nada hasta que confirmes. La imagen se procesa en el navegador.</div><div class="ffr153-actions"><button value="cancel">Cancelar</button><button value="default" class="primary">Confirmar</button></div>`;
    $$('[data-ffr153-value]', body).forEach(button => button.addEventListener('click', () => {
      $$('[data-ffr153-value]', body).forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      $('#ffr153Amount', body).value = button.dataset.ffr153Value;
    }));
    return new Promise(resolve => {
      const onClose = () => {
        dialog.removeEventListener('close', onClose);
        if (dialog.returnValue !== 'default') return resolve(null);
        const amount = Number($('#ffr153Amount', body).value);
        if (!Number.isFinite(amount) || amount < 0) return resolve(null);
        const kind = bank ? 'asset' : $('#ffr153Kind', body).value;
        resolve({amount,date:$('#ffr153Date',body).value,ownership:Number($('#ffr153Ownership',body).value || 100),name:$('#ffr153Name',body).value.trim(),kind,targetId:bank ? '' : $('#ffr153Target',body).value,category:kind === analysis.kind ? analysis.category : kind === 'debt' ? 'other-debt' : kind === 'income' ? 'other-income' : 'other-asset'});
      };
      dialog.addEventListener('close', onClose);
      dialog.showModal();
    });
  }

  function storeRead(entry) {
    const reads = read(READS_KEY, []);
    const withoutSame = reads.filter(item => !(item.context === entry.context && item.id === entry.id));
    withoutSame.push(entry);
    write(READS_KEY, withoutSame.slice(-100));
    renderStatuses();
  }

  function updateBankThroughUI(context, result, analysis, file) {
    const escapedId = CSS.escape(context.bankId);
    const root = $('.ffbank151');
    root?.querySelector(`[data-bank-method="manual"][data-bank-id="${escapedId}"]`)?.click();
    setTimeout(() => {
      const amountInput = document.querySelector(`[data-bank-amount="${escapedId}"]`);
      if (amountInput) { amountInput.value = String(result.amount); amountInput.dispatchEvent(new Event('input', {bubbles:true})); }
      const ownershipInput = document.querySelector(`[data-bank-share-custom="${escapedId}"]`);
      if (ownershipInput) { ownershipInput.value = String(result.ownership); ownershipInput.dispatchEvent(new Event('input', {bubbles:true})); }
      document.querySelector(`[data-bank-method="screenshot"][data-bank-id="${escapedId}"]`)?.click();
      storeRead({context:'bank',id:context.bankId,amount:result.amount,ownership:result.ownership,file:file.name,confidence:analysis.confidence,at:new Date().toISOString()});
      window.dispatchEvent(new CustomEvent('ff:bank-read-confirmed', {detail:{id:context.bankId,amount:result.amount,ownership:result.ownership}}));
    }, 80);
  }

  function updateProfile(result, analysis, file) {
    const api = window.FFv15;
    const state = api?.state?.();
    if (!state?.profile) { storeRead({context:'pending',...result,file:file.name,at:new Date().toISOString()}); return; }
    const list = result.kind === 'debt' ? state.profile.debts : result.kind === 'income' ? state.profile.incomes : state.profile.assets;
    const target = result.targetId ? list.find(item => item.id === result.targetId) : null;
    const observation = {value:result.amount,asOf:result.date,source:`Pantallazo ${file.name}`,precision:'documented',note:`Extraído y confirmado; confianza OCR ${analysis.confidence}`};
    if (target) api.addObservation(result.kind, target.id, observation, true);
    else api.upsertItem(result.kind, {id:`${result.kind}-shot-${Date.now()}`,name:result.name,category:result.category,value:result.amount,ownership:result.ownership,scope:result.ownership < 100 ? 'family' : 'personal',status:'active',usable:true,asOf:result.date,source:observation.source,precision:'documented',note:observation.note,observations:[observation]});
    storeRead({context:'profile',...result,file:file.name,confidence:analysis.confidence,at:new Date().toISOString()});
  }

  function renderStatuses() {
    const reads = read(READS_KEY, []);
    $$('[data-bank-card]').forEach(card => {
      const latest = [...reads].reverse().find(item => item.context === 'bank' && item.id === card.dataset.bankCard);
      let status = $('.ffr153-status', card);
      if (!latest) { status?.remove(); return; }
      const text = `✓ Saldo leído y confirmado: ${money(latest.amount)} · ${latest.ownership} %`;
      if (!status) { status = document.createElement('div'); status.className = 'ffr153-status'; card.appendChild(status); }
      if (status.textContent !== text) status.textContent = text;
    });
  }

  function loadOCR() {
    if (window.Tesseract?.recognize) return Promise.resolve(window.Tesseract);
    if (loadOCR.promise) return loadOCR.promise;
    loadOCR.promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = OCR_URL;
      script.onload = () => window.Tesseract?.recognize ? resolve(window.Tesseract) : reject(new Error('OCR no disponible'));
      script.onerror = () => reject(new Error('No se pudo cargar OCR'));
      document.head.appendChild(script);
    });
    return loadOCR.promise;
  }

  async function processFile(file, context) {
    const progress = showProgress();
    let analysis;
    try {
      if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) analysis = {text:'',candidates:[],amount:null,date:'',institution:context.bankName || '',confidence:'low',...inferKind('')};
      else {
        const tesseract = await loadOCR();
        const result = await tesseract.recognize(file, 'spa', {logger(message){if(message.status === 'recognizing text')progress.set(10 + Math.round((message.progress || 0) * 85), 'Buscando saldo, fecha y entidad…');}});
        analysis = analyse(result?.data?.text || '', context.bankName || '');
      }
    } catch (error) {
      console.warn('[v15.3 OCR]', error);
      analysis = {text:'',candidates:[],amount:null,date:'',institution:context.bankName || '',confidence:'low',...inferKind('')};
    } finally { progress.close(); }
    const confirmed = await askConfirmation(analysis, context);
    if (!confirmed) return;
    if (context.type === 'bank') updateBankThroughUI(context, confirmed, analysis, file);
    else updateProfile(confirmed, analysis, file);
  }

  function contextFor(input) {
    if (input.matches('[data-bank-file]')) {
      const id = input.dataset.bankFile;
      const draft = read(DRAFT_KEY, {banks:[]});
      const bank = (draft.banks || []).find(item => item.id === id) || {};
      return {type:'bank',bankId:id,bankName:bank.name || 'Banco',ownership:bank.ownership ?? 100};
    }
    return {type:'profile'};
  }

  function migrateLegacyReads() {
    const current = read(READS_KEY, []);
    if (current.length) return;
    const legacy = read(LEGACY_READS_KEY, []);
    if (!legacy.length) return;
    write(READS_KEY, legacy);
    const draft = read(DRAFT_KEY, null);
    if (!draft?.banks?.length) return;
    let changed = false;
    for (const bank of draft.banks) {
      const readEntry = [...legacy].reverse().find(item => item.context === 'bank' && item.id === bank.id && Number.isFinite(Number(item.amount)));
      if (!readEntry) continue;
      bank.amount = Number(readEntry.amount);
      bank.ownership = Number(readEntry.ownership ?? bank.ownership ?? 100);
      changed = true;
    }
    if (changed) write(DRAFT_KEY, {...draft,updatedAt:new Date().toISOString()});
  }

  document.addEventListener('change', event => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.type !== 'file' || !input.matches('[data-bank-file],#ff15File,[data-ff-capture],[data-screenshot-upload]')) return;
    const files = [...(input.files || [])].filter(file => file.type.startsWith('image/') || file.type === 'application/pdf' || /\.(png|jpe?g|webp|heic|pdf)$/i.test(file.name));
    if (!files.length) return;
    (async () => { for (const file of files) await processFile(file, contextFor(input)); })();
  });

  migrateLegacyReads();
  ensureUI();
  let scheduled = false;
  new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; renderStatuses(); });
  }).observe(document.documentElement, {childList:true,subtree:true});
  setTimeout(renderStatuses, 100);

  window.FFDocumentReader = {version:VERSION,analyse,parseNumber,findCandidates,extractDate,inferKind};
})();
