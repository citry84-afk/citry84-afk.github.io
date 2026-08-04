/* FinanzasFácil v15.10 · documentos para pensiones e ingresos */
(() => {
  'use strict';
  if (globalThis.__FF_PENSION_INCOME_1510__) return;
  globalThis.__FF_PENSION_INCOME_1510__ = true;

  const VERSION = '15.10';
  const PENSION_STORE = 'ff_pension_import_v1510';
  const INCOME_STORE = 'ff_income_sources_v1510';
  const BASE_STORE = 'ff_mi_plan_v2';
  const OCR_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
  const PDF_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs';
  const PDF_WORKER_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';
  const INSTITUTIONS = ['MyInvestor','CaixaBank','Santander','BBVA','Sabadell','ING','Unicaja','Bankinter','Openbank','Mapfre','Mutua Madrileña','AXA','Allianz','Zurich','Renta 4','Ibercaja','Abanca','Kutxabank','Cajamar','VidaCaixa'];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch (_) { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} };
  const finite = value => Number.isFinite(Number(value)) ? Number(value) : 0;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, finite(value)));
  const norm = value => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const money = value => new Intl.NumberFormat('es-ES', {style:'currency',currency:'EUR',minimumFractionDigits:0,maximumFractionDigits:2}).format(finite(value));
  const uid = prefix => `${prefix}-${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`;

  let tesseractPromise = null;
  let pdfPromise = null;
  let patching = false;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = [...document.scripts].find(script => script.src === src);
      if (existing && globalThis.Tesseract) return resolve();
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error('No se pudo cargar el lector de imágenes'));
      document.head.appendChild(script);
    });
  }

  async function getTesseract() {
    if (globalThis.Tesseract) return globalThis.Tesseract;
    if (!tesseractPromise) tesseractPromise = loadScript(OCR_URL).then(() => globalThis.Tesseract);
    return tesseractPromise;
  }

  async function getPdfJs() {
    if (!pdfPromise) {
      pdfPromise = import(PDF_URL).then(module => {
        module.GlobalWorkerOptions.workerSrc = PDF_WORKER_URL;
        return module;
      });
    }
    return pdfPromise;
  }

  function showProgress(title = 'Leyendo el documento…') {
    const node = document.createElement('div');
    node.className = 'pi1510-progress';
    node.innerHTML = `<div><b>${esc(title)}</b><span>El archivo se procesa en este dispositivo.</span><div><i></i></div></div>`;
    document.body.appendChild(node);
    return {
      set(percent, text) {
        const bar = $('i', node); if (bar) bar.style.width = `${clamp(percent, 5, 100)}%`;
        const label = $('span', node); if (label && text) label.textContent = text;
      },
      close() { node.remove(); }
    };
  }

  function parseNumber(raw) {
    let text = String(raw ?? '').trim().replace(/\s/g, '').replace(/[^0-9.,+\-]/g, '');
    if (!text || !/\d/.test(text)) return null;
    const negative = text.includes('-');
    text = text.replace(/[+\-]/g, '');
    const comma = text.lastIndexOf(',');
    const point = text.lastIndexOf('.');
    let decimal = '';
    if (comma >= 0 && point >= 0) decimal = comma > point ? ',' : '.';
    else if (comma >= 0 && [1,2].includes(text.length - comma - 1)) decimal = ',';
    else if (point >= 0 && [1,2].includes(text.length - point - 1)) decimal = '.';
    if (decimal) {
      const index = text.lastIndexOf(decimal);
      text = text.slice(0,index).replace(/[.,]/g,'') + '.' + text.slice(index+1).replace(/[.,]/g,'');
    } else text = text.replace(/[.,]/g,'');
    const value = Number(text);
    return Number.isFinite(value) ? (negative ? -value : value) : null;
  }

  function extractDate(text) {
    const source = String(text || '');
    let match = source.match(/\b([0-3]?\d)[\/-]([01]?\d)[\/-](20\d{2})\b/);
    if (match) return `${match[3]}-${String(match[2]).padStart(2,'0')}-${String(match[1]).padStart(2,'0')}`;
    match = source.match(/\b(20\d{2})[\/-]([01]?\d)[\/-]([0-3]?\d)\b/);
    return match ? `${match[1]}-${String(match[2]).padStart(2,'0')}-${String(match[3]).padStart(2,'0')}` : '';
  }

  function numberCandidates(text, mode = 'generic') {
    const source = String(text || '').replace(/\u00a0/g,' ');
    const regex = /(?:€\s*)?-?\d{1,3}(?:[.\s]\d{3})*(?:,\d{1,2})?(?:\s*(?:€|EUR))|(?:€\s*)?-?\d+(?:[.,]\d{1,2})?(?:\s*(?:€|EUR))|-?\d{1,3}(?:[.\s]\d{3})+(?:,\d{1,2})?|-?\d+[.,]\d{2}/gi;
    const weights = mode === 'pension'
      ? [['derechos consolidados',35],['valor actual',32],['valor total',29],['saldo actual',27],['saldo total',25],['plan de pensiones',18],['jubilacion',14],['patrimonio',11],['aportacion',-12],['rentabilidad',-14],['comision',-14]]
      : [['liquido a percibir',38],['liquido total',36],['neto a cobrar',35],['importe neto',34],['nomina',22],['alquiler',22],['renta',16],['dividendo',22],['ingreso',17],['abono',14],['total devengado',10],['base de cotizacion',-18],['retencion',-18],['irpf',-18],['descuento',-15],['saldo',-10]];
    const unique = new Map();
    let match;
    while ((match = regex.exec(source))) {
      const amount = parseNumber(match[0]);
      if (amount === null || amount < 0 || amount > 1e9) continue;
      const start = Math.max(0, match.index - 90);
      const end = Math.min(source.length, match.index + match[0].length + 90);
      const context = norm(source.slice(start,end));
      let score = /€|\beur\b/i.test(match[0]) ? 8 : 0;
      for (const [word, points] of weights) if (context.includes(word)) score += points;
      if (amount >= 100) score += Math.min(8, Math.log10(Math.max(amount,1)));
      if (/%/.test(source.slice(start,end))) score -= 12;
      const key = amount.toFixed(2);
      const candidate = {amount, score, raw:match[0], context:source.slice(start,end).replace(/\s+/g,' ').trim()};
      if (!unique.has(key) || unique.get(key).score < score) unique.set(key, candidate);
    }
    return [...unique.values()].sort((a,b) => b.score - a.score || b.amount - a.amount).slice(0,6);
  }

  function detectInstitution(text) {
    const normalized = norm(text);
    return INSTITUTIONS.find(name => normalized.includes(norm(name))) || '';
  }

  function detectIncomeKind(text, fileName = '') {
    const value = norm(`${fileName} ${text}`);
    if (/nomina|salario|payroll|sueldo/.test(value)) return 'salary';
    if (/alquiler|arrendamiento|inquilino|renta mensual/.test(value)) return 'rent';
    if (/dividendo|dividend/.test(value)) return 'dividend';
    if (/opcion|option|prima/.test(value)) return 'options';
    if (/pension|jubilacion/.test(value)) return 'pension-income';
    if (/interes|interest|cupon/.test(value)) return 'interest';
    return 'other';
  }

  function detectFrequency(text, kind) {
    const value = norm(text);
    if (/anual|annual|ejercicio|ano completo/.test(value)) return 'annual';
    if (/trimestral|quarter/.test(value)) return 'quarterly';
    if (/semanal|weekly/.test(value)) return 'weekly';
    if (/14 pagas|catorce pagas/.test(value)) return '14-payments';
    if (kind === 'dividend') return 'annual';
    return 'monthly';
  }

  function monthlyEquivalent(amount, frequency) {
    const value = Math.max(0, finite(amount));
    if (frequency === 'annual') return value / 12;
    if (frequency === 'quarterly') return value / 3;
    if (frequency === 'weekly') return value * 52 / 12;
    if (frequency === '14-payments') return value * 14 / 12;
    if (frequency === 'one-off') return 0;
    return value;
  }

  async function extractPdf(file, progress) {
    const pdfjs = await getPdfJs();
    const bytes = new Uint8Array(await file.arrayBuffer());
    const pdf = await pdfjs.getDocument({data:bytes}).promise;
    let text = '';
    const pages = Math.min(pdf.numPages, 8);
    for (let index = 1; index <= pages; index += 1) {
      progress?.set(15 + index / pages * 55, `Leyendo página ${index} de ${pages}…`);
      const page = await pdf.getPage(index);
      const content = await page.getTextContent();
      text += '\n' + content.items.map(item => item.str).join(' ');
    }
    if (norm(text).length > 35) return text;
    progress?.set(72, 'El PDF parece escaneado. Leyendo la primera página…');
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({scale:1.7});
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width; canvas.height = viewport.height;
    await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
    const tesseract = await getTesseract();
    const result = await tesseract.recognize(canvas, 'spa+eng', {logger: message => {
      if (message.status === 'recognizing text') progress?.set(72 + message.progress * 24, 'Reconociendo el PDF escaneado…');
    }});
    return result?.data?.text || '';
  }

  async function extractFile(file, progress) {
    const type = String(file.type || '').toLowerCase();
    const name = String(file.name || '').toLowerCase();
    if (type.startsWith('image/')) {
      const tesseract = await getTesseract();
      const result = await tesseract.recognize(file, 'spa+eng', {logger: message => {
        if (message.status === 'recognizing text') progress?.set(12 + message.progress * 78, 'Leyendo el pantallazo…');
      }});
      return result?.data?.text || '';
    }
    if (type.includes('pdf') || name.endsWith('.pdf')) return extractPdf(file, progress);
    progress?.set(45, 'Leyendo el archivo…');
    return file.text();
  }

  function analysePension(text, file = {}) {
    const candidates = numberCandidates(text, 'pension');
    const amount = candidates[0]?.amount ?? null;
    const normalized = norm(text);
    const occurrences = normalized.match(/plan(?:es)? de pensiones|plan jubilacion|plan de prevision/g) || [];
    return {
      amount,
      candidates,
      institution:detectInstitution(text),
      count:Math.max(1, Math.min(10, occurrences.length || 1)),
      date:extractDate(text),
      file:{name:file.name || '',type:file.type || '',size:file.size || 0},
      confidence:!candidates.length?'low':candidates[0].score>=28?'high':candidates[0].score>=12?'medium':'low'
    };
  }

  function analyseIncome(text, file = {}) {
    const kind = detectIncomeKind(text, file.name);
    const candidates = numberCandidates(text, 'income');
    return {
      amount:candidates[0]?.amount ?? null,
      candidates,
      kind,
      frequency:detectFrequency(text, kind),
      institution:detectInstitution(text),
      date:extractDate(text),
      file:{name:file.name || '',type:file.type || '',size:file.size || 0},
      confidence:!candidates.length?'low':candidates[0].score>=28?'high':candidates[0].score>=12?'medium':'low'
    };
  }

  function pensionDraft() {
    return read(PENSION_STORE, {version:VERSION,method:'manual',amount:0,institution:'',count:1,ownership:100,date:'',file:null,candidates:[],confirmed:false});
  }

  function incomeDraft() {
    const state = globalThis.FFPortraitBridge1510?.state?.() || globalThis.FFPortraitBridge159?.state?.() || {};
    const fallback = {version:VERSION,sources:[],contribution:finite(state.contribution)||500,stability:state.incomeStability||'stable',confirmed:false};
    const draft = read(INCOME_STORE, fallback);
    if (!Array.isArray(draft.sources)) draft.sources = [];
    if (!draft.sources.length && !draft.seeded) {
      const sources = [];
      const rent = finite(state.meta?.realestate?.monthlyIncome);
      if (rent > 0) sources.push({id:uid('income'),kind:'rent',name:'Alquileres ya indicados',amount:rent,frequency:'monthly',frequencyLabel:'Mensual',basis:'net',ownership:100,monthly:rent,source:'known',createdAt:new Date().toISOString()});
      const shared = globalThis.FFIBKRShared156?.state?.() || read('ff_ibkr_shared_v156', null);
      const optionsMonthly = finite(shared?.preferences?.monthlyOptionsReference ?? shared?.options?.monthlyAverage);
      if (optionsMonthly > 0 && state.answers?.options === 'yes') sources.push({id:uid('income'),kind:'options',name:'Opciones · Interactive Brokers',amount:optionsMonthly,frequency:'monthly',frequencyLabel:'Mensual',basis:'gross',ownership:100,monthly:optionsMonthly,source:'imported',file:shared?.file||null,createdAt:new Date().toISOString()});
      draft.sources = sources;
      draft.seeded = true;
      write(INCOME_STORE, draft);
    }
    return draft;
  }

  function injectStyles() {
    if ($('style[data-pi1510]')) return;
    const style = document.createElement('style');
    style.dataset.pi1510 = '1';
    style.textContent = `
      .pi1510{--ink:#0b2240;--muted:#63758c;--line:#d3dfec;--blue:#1674d1;--orange:#ff8613;color:var(--ink)}.pi1510 *{box-sizing:border-box}.pi1510 button,.pi1510 input,.pi1510 select{font:inherit}
      .pi1510-shell{display:grid;gap:14px}.pi1510-section{padding:16px;border:1px solid var(--line);border-radius:21px;background:rgba(255,255,255,.82);box-shadow:0 12px 30px rgba(16,54,108,.05)}.pi1510-section h3{margin:0;font-size:18px}.pi1510-section>p{margin:6px 0 13px;color:var(--muted);font-size:11px;line-height:1.5}
      .pi1510-methods{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.pi1510-method{min-height:55px;padding:9px;border:1px solid var(--line);border-radius:14px;background:#f8fbfe;color:#36536f;font-weight:850}.pi1510-method.active{border-color:#6aa8df;background:#eef7ff;color:#075ca7}.pi1510-file{display:none}.pi1510-filelabel{display:flex;justify-content:center;align-items:center;min-height:52px;margin-top:10px;border:1px dashed #72a5d4;border-radius:14px;background:#f4f9ff;color:#145b9c;font-weight:900;cursor:pointer}
      .pi1510-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.pi1510-field{display:block;color:var(--muted);font-size:10px;font-weight:850}.pi1510-field input,.pi1510-field select{width:100%;min-height:47px;margin-top:6px;padding:0 12px;border:1px solid var(--line);border-radius:13px;background:#fff;color:var(--ink);font-size:14px}.pi1510-field.wide{grid-column:1/-1}
      .pi1510-candidates{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}.pi1510-candidates button{padding:7px 9px;border:1px solid var(--line);border-radius:10px;background:#fff;color:#36536f;font-size:10px;font-weight:850}.pi1510-candidates button.active{border-color:#67a7df;background:#edf6ff;color:#075ba7}
      .pi1510-result{padding:12px;border-radius:15px;background:#eef8f3;color:#17634d;font-size:10px;line-height:1.5}.pi1510-result.warn{background:#fff6e8;color:#8f5310}.pi1510-summary{padding:16px;border-radius:19px;background:linear-gradient(145deg,#0b2b52,#1261a8);color:#fff}.pi1510-summary span{display:block;color:#bcd4ea;font-size:10px}.pi1510-summary strong{display:block;margin-top:5px;font-size:26px}.pi1510-summary small{display:block;margin-top:5px;color:#bdd2e6}
      .pi1510-confirm{width:100%;min-height:54px;border:0;border-radius:16px;background:linear-gradient(135deg,#ff941f,#ff790b);color:#fff;font-weight:950;box-shadow:0 13px 28px rgba(255,126,15,.24);touch-action:manipulation}.pi1510-confirm:disabled{opacity:.42;box-shadow:none}.pi1510-note{padding:11px 12px;border-radius:14px;background:#fff7e9;color:#74501d;font-size:10px;line-height:1.45}
      .pi1510-source-list{display:grid;gap:9px}.pi1510-source{display:grid;grid-template-columns:40px 1fr auto;gap:10px;align-items:center;padding:12px;border:1px solid var(--line);border-radius:15px;background:#fff}.pi1510-source-icon{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:#eaf3fc;color:#145c9a;font-weight:950}.pi1510-source b{display:block;font-size:12px}.pi1510-source small{display:block;margin-top:3px;color:var(--muted);font-size:9px}.pi1510-source-value{text-align:right}.pi1510-source-value strong{display:block;font-size:13px}.pi1510-source-value button{margin-top:4px;border:0;background:transparent;color:#a14f24;font-size:9px;font-weight:850}
      .pi1510-add{width:100%;min-height:48px;border:1px dashed #75a7d4;border-radius:14px;background:#f5faff;color:#145b9c;font-weight:900}.pi1510-inline{display:flex;gap:8px;flex-wrap:wrap}.pi1510-chip{padding:8px 10px;border:1px solid var(--line);border-radius:11px;background:#fff;color:#405a73;font-size:10px;font-weight:850}.pi1510-chip.active{border-color:#67a6dd;background:#edf6ff;color:#075ba7}
      .pi1510-dialog{width:min(590px,calc(100% - 22px));padding:0;border:0;border-radius:23px;background:#fff;color:var(--ink)}.pi1510-dialog::backdrop{background:#03101fc7;backdrop-filter:blur(6px)}.pi1510-dialog form{padding:19px}.pi1510-dialog-head{display:flex;justify-content:space-between;align-items:flex-start}.pi1510-dialog-head h3{margin:3px 0 0}.pi1510-close{border:0;background:transparent;color:#63758c;font-size:25px}.pi1510-dialog-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:14px}.pi1510-dialog-actions button{min-height:43px;padding:0 14px;border:1px solid var(--line);border-radius:12px;background:#f7fafc;color:#38536f;font-weight:850}.pi1510-dialog-actions .primary{border:0;background:#1674d1;color:#fff}
      .pi1510-progress{position:fixed;inset:0;z-index:30000;display:grid;place-items:center;background:#04101dc7}.pi1510-progress>div{width:min(390px,calc(100% - 30px));padding:20px;border-radius:20px;background:#0d2745;color:#fff}.pi1510-progress span{display:block;margin-top:7px;color:#bcd0e4;font-size:12px}.pi1510-progress>div>div{height:8px;margin-top:14px;border-radius:99px;background:#26435f;overflow:hidden}.pi1510-progress i{display:block;height:100%;width:8%;background:#ff8a16;transition:.2s}
      #portraitNext.pi1510-native-hidden{display:none!important}
      @media(max-width:560px){.pi1510-methods,.pi1510-grid{grid-template-columns:1fr}.pi1510-field.wide{grid-column:auto}.pi1510-dialog form{padding:16px}}
    `;
    document.head.appendChild(style);
  }

  function ensureDialog() {
    if ($('#pi1510Dialog')) return $('#pi1510Dialog');
    document.body.insertAdjacentHTML('beforeend', `<dialog id="pi1510Dialog" class="pi1510-dialog"><form method="dialog"><div class="pi1510-dialog-head"><div><small>ENTRADA DE DINERO</small><h3>Añadir una fuente</h3></div><button value="cancel" class="pi1510-close" aria-label="Cerrar">×</button></div><div data-pi1510-dialog-body></div></form></dialog>`);
    return $('#pi1510Dialog');
  }

  function pensionMarkup(draft) {
    const attributable = finite(draft.amount) * clamp(draft.ownership || 100,0,100) / 100;
    return `<div class="pi1510-shell">
      <p class="kicker">Importa o escribe el dato</p><h1>Tu ahorro para la <em>jubilación.</em></h1><p class="lead">Sube un pantallazo, PDF, CSV o extracto. Lo interpretamos aquí y tú confirmas antes de guardarlo.</p>
      <section class="pi1510-section"><h3>¿Cómo quieres añadirlo?</h3><p>El archivo se procesa de forma local en este dispositivo.</p><div class="pi1510-methods">
        <button type="button" class="pi1510-method ${draft.method==='manual'?'active':''}" data-pi1510-pension-method="manual">Valor manual</button>
        <button type="button" class="pi1510-method ${draft.method==='image'?'active':''}" data-pi1510-pension-method="image">Pantallazo</button>
        <button type="button" class="pi1510-method ${draft.method==='file'?'active':''}" data-pi1510-pension-method="file">PDF o CSV</button>
      </div><input id="pi1510PensionFile" class="pi1510-file" type="file" accept="image/*,.pdf,.csv,text/csv,text/plain"><label class="pi1510-filelabel" for="pi1510PensionFile">${draft.file?.name?`Cambiar ${esc(draft.file.name)}`:'Seleccionar pantallazo o archivo'}</label></section>
      ${draft.candidates?.length>1?`<div class="pi1510-candidates">${draft.candidates.slice(0,5).map((item,index)=>`<button type="button" class="${finite(draft.amount)===finite(item.amount)?'active':''}" data-pi1510-pension-candidate="${item.amount}">${money(item.amount)}</button>`).join('')}</div>`:''}
      <section class="pi1510-section"><div class="pi1510-grid">
        <label class="pi1510-field">Valor actual (€)<input id="pi1510PensionAmount" type="number" min="0" step="0.01" inputmode="decimal" value="${finite(draft.amount)||''}" placeholder="Ej. 18.500"></label>
        <label class="pi1510-field">Entidad<input id="pi1510PensionInstitution" value="${esc(draft.institution||'')}" placeholder="Ej. MyInvestor"></label>
        <label class="pi1510-field">Número de productos<input id="pi1510PensionCount" type="number" min="1" max="20" value="${Math.max(1,finite(draft.count)||1)}"></label>
        <label class="pi1510-field">Te pertenece (%)<input id="pi1510PensionOwnership" type="number" min="0" max="100" value="${clamp(draft.ownership||100,0,100)}"></label>
        <label class="pi1510-field wide">Fecha del dato<input id="pi1510PensionDate" type="date" value="${esc(draft.date||'')}"></label>
      </div></section>
      ${draft.file?`<div class="pi1510-result ${draft.confidence==='low'?'warn':''}"><b>${draft.confidence==='low'?'Revisa la lectura':'Documento interpretado'}:</b> ${esc(draft.file.name)} · ${draft.date?esc(draft.date):'sin fecha detectada'}. Puedes corregir cualquier campo.</div>`:''}
      <div class="pi1510-summary"><span>Valor atribuible a tu patrimonio</span><strong data-pi1510-pension-total>${money(attributable)}</strong><small data-pi1510-pension-sub>Valor conjunto: ${money(draft.amount)} · propiedad ${clamp(draft.ownership||100,0,100)} %</small></div>
      <div class="pi1510-note"><b>Confirmación obligatoria:</b> ningún importe se incorpora hasta que pulses el botón.</div>
      <button type="button" class="pi1510-confirm" data-pi1510-confirm-pension ${attributable>0?'':'disabled'}>Confirmar pensiones y continuar →</button>
    </div>`;
  }

  function sourceIcon(kind) {
    return ({salary:'N',rent:'⌂',dividend:'D',options:'◎','pension-income':'P',interest:'%',other:'+'})[kind] || '+';
  }

  function sourceLabel(kind) {
    return ({salary:'Nómina',rent:'Alquiler',dividend:'Dividendos',options:'Opciones','pension-income':'Pensión',interest:'Intereses',other:'Otro ingreso'})[kind] || 'Otro ingreso';
  }

  function incomeMarkup(draft) {
    const total = (draft.sources||[]).reduce((sum,item)=>sum+finite(item.monthly),0);
    return `<div class="pi1510-shell">
      <p class="kicker">Una entrada cada vez</p><h1>¿Qué dinero entra en <em>tu hogar?</em></h1><p class="lead">Añade nóminas, alquileres, dividendos, opciones u otros ingresos. Puedes escribirlos o subir un pantallazo, PDF o CSV.</p>
      <section class="pi1510-section"><h3>Fuentes de ingreso</h3><p>Cada fuente se convierte a una equivalencia mensual para evitar mezclar importes mensuales y anuales.</p><div class="pi1510-source-list">
        ${(draft.sources||[]).map(item=>`<article class="pi1510-source"><span class="pi1510-source-icon">${sourceIcon(item.kind)}</span><div><b>${esc(item.name||sourceLabel(item.kind))}</b><small>${sourceLabel(item.kind)} · ${item.basis==='gross'?'bruto':'neto'} · ${esc(item.frequencyLabel||item.frequency)}</small></div><div class="pi1510-source-value"><strong>${money(item.monthly)}/mes</strong><button type="button" data-pi1510-remove-income="${esc(item.id)}">Eliminar</button></div></article>`).join('')||'<div class="pi1510-result warn">Aún no has añadido ninguna entrada de dinero.</div>'}
      </div><button type="button" class="pi1510-add" data-pi1510-add-income>＋ Añadir nómina, alquiler u otro ingreso</button></section>
      <section class="pi1510-section"><div class="pi1510-grid"><label class="pi1510-field">¿Cuánto puedes ahorrar o invertir al mes?<input id="pi1510Contribution" type="number" min="0" step="1" value="${finite(draft.contribution)}"></label><label class="pi1510-field">Estabilidad de los ingresos<select id="pi1510Stability"><option value="stable" ${draft.stability==='stable'?'selected':''}>Bastante estables</option><option value="variable" ${draft.stability==='variable'?'selected':''}>Cambian bastante</option><option value="mixed" ${draft.stability==='mixed'?'selected':''}>Parte fija y parte variable</option></select></label></div></section>
      <div class="pi1510-summary"><span>Entradas mensuales equivalentes</span><strong>${money(total)}/mes</strong><small>${draft.sources?.length||0} fuentes · capacidad de ahorro ${total>0?Math.round(finite(draft.contribution)/total*100):0} %</small></div>
      <div class="pi1510-note"><b>Bruto y neto no se mezclan silenciosamente:</b> cada fuente conserva cómo la has introducido. El total es orientativo para construir el plan.</div>
      <button type="button" class="pi1510-confirm" data-pi1510-confirm-income ${total>0?'':'disabled'}>Confirmar ingresos y continuar →</button>
    </div>`;
  }

  function currentStep() {
    return globalThis.FFPortraitBridge1510?.current?.() || globalThis.FFPortraitBridge159?.current?.() || null;
  }

  function renderPension(root) {
    injectStyles();
    root.dataset.pi1510 = 'pension'; root.classList.add('pi1510');
    root.innerHTML = pensionMarkup(pensionDraft());
    const next = $('#portraitNext'); if (next) next.classList.add('pi1510-native-hidden');
    bindPension(root);
  }

  function savePensionForm(root, rerender = false) {
    const draft = pensionDraft();
    draft.amount = finite($('#pi1510PensionAmount',root)?.value);
    draft.institution = $('#pi1510PensionInstitution',root)?.value?.trim() || '';
    draft.count = Math.max(1,finite($('#pi1510PensionCount',root)?.value)||1);
    draft.ownership = clamp($('#pi1510PensionOwnership',root)?.value||100,0,100);
    draft.date = $('#pi1510PensionDate',root)?.value || '';
    draft.updatedAt = new Date().toISOString();
    write(PENSION_STORE,draft);
    if (rerender) renderPension(root);
  }

  function bindPension(root) {
    $$('[data-pi1510-pension-method]',root).forEach(button=>button.addEventListener('click',()=>{
      const draft=pensionDraft(); draft.method=button.dataset.pi1510PensionMethod; write(PENSION_STORE,draft); renderPension(root);
    }));
    $$('[data-pi1510-pension-candidate]',root).forEach(button=>button.addEventListener('click',()=>{
      const input=$('#pi1510PensionAmount',root); if(input)input.value=button.dataset.pi1510PensionCandidate; savePensionForm(root,true);
    }));
    const refreshPension=()=>{
      savePensionForm(root,false);
      const draft=pensionDraft();
      const attributable=finite(draft.amount)*clamp(draft.ownership||100,0,100)/100;
      const total=$('[data-pi1510-pension-total]',root);if(total)total.textContent=money(attributable);
      const sub=$('[data-pi1510-pension-sub]',root);if(sub)sub.textContent=`Valor conjunto: ${money(draft.amount)} · propiedad ${clamp(draft.ownership||100,0,100)} %`;
      const confirm=$('[data-pi1510-confirm-pension]',root);if(confirm)confirm.disabled=!(attributable>0);
    };
    ['#pi1510PensionAmount','#pi1510PensionInstitution','#pi1510PensionCount','#pi1510PensionOwnership','#pi1510PensionDate'].forEach(selector=>$(selector,root)?.addEventListener('input',refreshPension));
    $('#pi1510PensionFile',root)?.addEventListener('change',async event=>{
      const file=event.target.files?.[0]; if(!file)return;
      const progress=showProgress('Interpretando tu plan de pensiones…');
      try{
        const text=await extractFile(file,progress); progress.set(94,'Preparando la confirmación…');
        const analysis=analysePension(text,file); const draft=pensionDraft();
        Object.assign(draft,analysis,{method:file.type?.startsWith('image/')?'image':'file',confirmed:false,updatedAt:new Date().toISOString()});
        write(PENSION_STORE,draft); renderPension(root);
      }catch(error){console.error(error);alert(error.message||'No se pudo leer el archivo. Puedes introducir la cifra manualmente.');}
      finally{progress.close();}
    });
    $('[data-pi1510-confirm-pension]',root)?.addEventListener('click',()=>{
      savePensionForm(root,false); const draft=pensionDraft(); const attributable=finite(draft.amount)*clamp(draft.ownership,0,100)/100;
      if(attributable<=0)return;
      draft.confirmed=true; draft.confirmedAt=new Date().toISOString(); write(PENSION_STORE,draft);
      const next=$('#portraitNext'); if(next)next.classList.remove('pi1510-native-hidden');
      globalThis.FFPortraitBridge1510?.confirmPension?.({value:attributable,gross:finite(draft.amount),where:draft.institution,count:draft.count,ownership:draft.ownership,date:draft.date,file:draft.file});
    });
  }

  function renderIncome(root) {
    injectStyles();
    root.dataset.pi1510='income'; root.classList.add('pi1510'); root.innerHTML=incomeMarkup(incomeDraft());
    const next=$('#portraitNext'); if(next)next.classList.add('pi1510-native-hidden');
    bindIncome(root);
  }

  function bindIncome(root) {
    $('[data-pi1510-add-income]',root)?.addEventListener('click',()=>openIncomeDialog(root));
    $$('[data-pi1510-remove-income]',root).forEach(button=>button.addEventListener('click',()=>{
      const draft=incomeDraft(); draft.sources=(draft.sources||[]).filter(item=>item.id!==button.dataset.pi1510RemoveIncome); draft.confirmed=false; write(INCOME_STORE,draft); renderIncome(root);
    }));
    $('#pi1510Contribution',root)?.addEventListener('change',()=>{const draft=incomeDraft();draft.contribution=finite($('#pi1510Contribution',root).value);write(INCOME_STORE,draft);renderIncome(root);});
    $('#pi1510Stability',root)?.addEventListener('change',()=>{const draft=incomeDraft();draft.stability=$('#pi1510Stability',root).value;write(INCOME_STORE,draft);renderIncome(root);});
    $('[data-pi1510-confirm-income]',root)?.addEventListener('click',()=>{
      const draft=incomeDraft(); const monthly=(draft.sources||[]).reduce((sum,item)=>sum+finite(item.monthly),0); if(monthly<=0)return;
      draft.confirmed=true; draft.confirmedAt=new Date().toISOString(); write(INCOME_STORE,draft);
      const next=$('#portraitNext'); if(next)next.classList.remove('pi1510-native-hidden');
      globalThis.FFPortraitBridge1510?.confirmIncome?.({monthlyIncome:monthly,contribution:finite(draft.contribution),stability:draft.stability,sources:draft.sources});
    });
  }

  function incomeDialogMarkup(draft={}) {
    const analysis=draft.analysis||{};
    return `<div class="pi1510-methods" style="margin-top:15px"><button type="button" class="pi1510-method ${draft.method==='manual'?'active':''}" data-pi1510-income-method="manual">Manual</button><button type="button" class="pi1510-method ${draft.method==='image'?'active':''}" data-pi1510-income-method="image">Pantallazo</button><button type="button" class="pi1510-method ${draft.method==='file'?'active':''}" data-pi1510-income-method="file">PDF o CSV</button></div>
      <input id="pi1510IncomeFile" class="pi1510-file" type="file" accept="image/*,.pdf,.csv,text/csv,text/plain"><label class="pi1510-filelabel" for="pi1510IncomeFile">${analysis.file?.name?`Cambiar ${esc(analysis.file.name)}`:'Seleccionar pantallazo o archivo'}</label>
      ${analysis.candidates?.length>1?`<div class="pi1510-candidates">${analysis.candidates.slice(0,5).map(item=>`<button type="button" data-pi1510-income-candidate="${item.amount}">${money(item.amount)}</button>`).join('')}</div>`:''}
      <div class="pi1510-grid" style="margin-top:12px">
        <label class="pi1510-field">Tipo<select id="pi1510IncomeKind">${[['salary','Nómina'],['rent','Alquiler'],['dividend','Dividendos'],['options','Opciones'],['interest','Intereses'],['pension-income','Pensión'],['other','Otro']].map(([value,label])=>`<option value="${value}" ${(draft.kind||analysis.kind||'salary')===value?'selected':''}>${label}</option>`).join('')}</select></label>
        <label class="pi1510-field">Nombre u origen<input id="pi1510IncomeName" value="${esc(draft.name||analysis.institution||'')}" placeholder="Ej. Nómina Luis"></label>
        <label class="pi1510-field">Importe<input id="pi1510IncomeAmount" type="number" min="0" step="0.01" value="${finite(draft.amount||analysis.amount)||''}"></label>
        <label class="pi1510-field">Frecuencia<select id="pi1510IncomeFrequency">${[['monthly','Mensual'],['14-payments','Importe por paga · 14 pagas'],['quarterly','Trimestral'],['annual','Anual'],['weekly','Semanal'],['one-off','Puntual · no sumar al mes']].map(([value,label])=>`<option value="${value}" ${(draft.frequency||analysis.frequency||'monthly')===value?'selected':''}>${label}</option>`).join('')}</select></label>
        <label class="pi1510-field">Importe<select id="pi1510IncomeBasis"><option value="net" ${(draft.basis||'net')==='net'?'selected':''}>Neto</option><option value="gross" ${draft.basis==='gross'?'selected':''}>Bruto</option></select></label>
        <label class="pi1510-field">Titularidad (%)<input id="pi1510IncomeOwnership" type="number" min="0" max="100" value="${clamp(draft.ownership||100,0,100)}"></label>
      </div>${analysis.file?`<div class="pi1510-result ${analysis.confidence==='low'?'warn':''}" style="margin-top:10px">${esc(analysis.file.name)} interpretado. Revisa el importe, frecuencia y si es bruto o neto.</div>`:''}
      <div class="pi1510-dialog-actions"><button value="cancel">Cancelar</button><button type="button" class="primary" data-pi1510-save-income>Guardar fuente</button></div>`;
  }

  function openIncomeDialog(root, seed={method:'manual',ownership:100,basis:'net'}) {
    const dialog=ensureDialog(); const body=$('[data-pi1510-dialog-body]',dialog); let draft={...seed};
    const draw=()=>{body.innerHTML=incomeDialogMarkup(draft);bindDialog();};
    const bindDialog=()=>{
      $$('[data-pi1510-income-method]',body).forEach(button=>button.addEventListener('click',()=>{draft.method=button.dataset.pi1510IncomeMethod;draw();}));
      $$('[data-pi1510-income-candidate]',body).forEach(button=>button.addEventListener('click',()=>{const input=$('#pi1510IncomeAmount',body);if(input)input.value=button.dataset.pi1510IncomeCandidate;}));
      $('#pi1510IncomeFile',body)?.addEventListener('change',async event=>{
        const file=event.target.files?.[0];if(!file)return;const progress=showProgress('Interpretando la entrada de dinero…');
        try{const text=await extractFile(file,progress);const analysis=analyseIncome(text,file);draft={...draft,method:file.type?.startsWith('image/')?'image':'file',analysis,kind:analysis.kind,amount:analysis.amount,frequency:analysis.frequency,name:analysis.institution||draft.name||''};draw();}
        catch(error){console.error(error);alert(error.message||'No se pudo leer el archivo. Puedes introducir el importe manualmente.');}
        finally{progress.close();}
      });
      $('[data-pi1510-save-income]',body)?.addEventListener('click',()=>{
        const amount=finite($('#pi1510IncomeAmount',body)?.value);const frequency=$('#pi1510IncomeFrequency',body)?.value||'monthly';const ownership=clamp($('#pi1510IncomeOwnership',body)?.value||100,0,100);if(amount<=0)return;
        const kind=$('#pi1510IncomeKind',body)?.value||'other';const basis=$('#pi1510IncomeBasis',body)?.value||'net';const monthly=monthlyEquivalent(amount,frequency)*ownership/100;
        const labels={monthly:'Mensual','14-payments':'14 pagas',quarterly:'Trimestral',annual:'Anual',weekly:'Semanal','one-off':'Puntual'};
        const source={id:uid('income'),kind,name:$('#pi1510IncomeName',body)?.value?.trim()||sourceLabel(kind),amount,frequency,frequencyLabel:labels[frequency]||frequency,basis,ownership,monthly,date:draft.analysis?.date||'',file:draft.analysis?.file||null,source:draft.analysis?.file?'imported':'manual',createdAt:new Date().toISOString()};
        const saved=incomeDraft();saved.sources=[...(saved.sources||[]),source];saved.confirmed=false;write(INCOME_STORE,saved);dialog.close();renderIncome(root);
      });
    };
    draw();dialog.showModal();
  }

  function patchCompleted() {
    const payload=read(BASE_STORE,null);if(!payload?.onboardingComplete)return;
    const pension=read(PENSION_STORE,null);const income=read(INCOME_STORE,null);let changed=false;
    payload.profile=payload.profile||{};payload.metadata=payload.metadata||{};
    if(pension?.confirmed&&payload.metadata.pensionImportVersion!==VERSION){
      const item=(payload.items||[]).find(entry=>entry.type==='pension');
      if(item){item.source=pension.file?'imported':'entered';item.sourceLabel=pension.file?'Documento de pensiones':'Introducido manualmente';item.metadata={...(item.metadata||{}),grossValue:pension.amount,ownership:pension.ownership,documentDate:pension.date,file:pension.file?.name||'',version:VERSION};}
      payload.metadata.pensionImportVersion=VERSION;changed=true;
    }
    if(income?.confirmed&&payload.metadata.incomeImportVersion!==VERSION){payload.profile.incomeSources=income.sources||[];payload.profile.monthlyIncome=(income.sources||[]).reduce((sum,item)=>sum+finite(item.monthly),0);payload.metadata.incomeImportVersion=VERSION;changed=true;}
    if(changed)write(BASE_STORE,payload);
  }

  function patch() {
    if(patching)return;patching=true;
    try{
      const root=$('#portraitContent');const step=currentStep();if(!root||!step)return;
      if(step.kind==='detail'&&step.type==='pension'&&root.dataset.pi1510!=='pension')renderPension(root);
      else if(step.kind==='income'&&root.dataset.pi1510!=='income')renderIncome(root);
      else if(!((step.kind==='detail'&&step.type==='pension')||step.kind==='income')){
        const next=$('#portraitNext');if(next)next.classList.remove('pi1510-native-hidden');
        root.classList.remove('pi1510');delete root.dataset.pi1510;
      }
      patchCompleted();
    } finally {patching=false;}
  }

  injectStyles();
  new MutationObserver(()=>requestAnimationFrame(patch)).observe(document.documentElement,{childList:true,subtree:true});
  globalThis.addEventListener('focus',patch);
  setInterval(patch,500);
  setTimeout(patch,80);

  globalThis.FFPensionIncome1510={version:VERSION,analysePension,analyseIncome,extractFile,monthlyEquivalent,patch};
})();
