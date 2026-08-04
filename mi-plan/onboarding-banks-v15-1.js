/* FinanzasFácil · v15.1 — alta guiada de bancos y pantallazos locales. */
(() => {
  'use strict';
  if (window.__FF_BANK_ONBOARDING_V151__) return;
  window.__FF_BANK_ONBOARDING_V151__ = true;

  const DRAFT_KEY = 'ff_onboarding_banks_v151';
  const BASE_STORE = 'ff_mi_plan_v2';
  const DB_NAME = 'ff_private_files_v1';
  const DB_STORE = 'files';
  const COMMON_BANKS = [
    ['caixabank', 'CaixaBank', 'CX'],
    ['santander', 'Santander', 'SAN'],
    ['bbva', 'BBVA', 'BBVA'],
    ['sabadell', 'Sabadell', 'SAB'],
    ['ing', 'ING', 'ING'],
    ['unicaja', 'Unicaja', 'UNI'],
    ['bankinter', 'Bankinter', 'BKT'],
    ['openbank', 'Openbank', 'OPEN'],
    ['myinvestor', 'MyInvestor', 'MY'],
    ['revolut', 'Revolut', 'R']
  ].map(([id, name, mark]) => ({ id, name, mark }));

  const safeNumber = value => {
    const n = Number(String(value ?? '').replace(',', '.'));
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };
  const euro = value => new Intl.NumberFormat('es-ES', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0
  }).format(safeNumber(value));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
  const slug = value => String(value || 'banco').toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const uid = prefix => `${prefix}-${globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)}`;

  function emptyDraft() {
    return {
      version: '15.1',
      banks: [],
      cashOutside: 0,
      monthlyContribution: 0,
      contributionCustom: false,
      applied: false,
      updatedAt: new Date().toISOString()
    };
  }

  function loadDraft() {
    try {
      const raw = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
      if (!raw || !Array.isArray(raw.banks)) return emptyDraft();
      return { ...emptyDraft(), ...raw, banks: raw.banks.map(bank => ({
        id: String(bank.id || slug(bank.name)),
        name: String(bank.name || 'Otro banco'),
        mark: String(bank.mark || String(bank.name || 'B').slice(0, 3).toUpperCase()),
        amount: bank.amount === null || bank.amount === '' ? null : safeNumber(bank.amount),
        ownership: Math.max(0, Math.min(100, safeNumber(bank.ownership || 100))),
        method: ['manual', 'screenshot'].includes(bank.method) ? bank.method : 'manual',
        file: bank.file && typeof bank.file === 'object' ? bank.file : null
      })) };
    } catch (_) {
      return emptyDraft();
    }
  }

  let draft = loadDraft();
  try {
    if (!localStorage.getItem(BASE_STORE) && draft.applied) {
      draft = emptyDraft();
      localStorage.removeItem(DRAFT_KEY);
    }
  } catch (_) {}

  function saveDraft() {
    draft.updatedAt = new Date().toISOString();
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }

  function openFilesDB() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) return reject(new Error('IndexedDB no disponible'));
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE, { keyPath: 'id' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('No se pudo abrir el almacenamiento local'));
    });
  }

  async function storeFileLocally(file, bank) {
    const id = uid('bank-shot');
    const record = {
      id,
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      bankId: bank.id,
      bankName: bank.name,
      blob: file,
      storedAt: new Date().toISOString()
    };
    const db = await openFilesDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).put(record);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error('No se pudo guardar el pantallazo'));
      tx.onabort = () => reject(tx.error || new Error('No se pudo guardar el pantallazo'));
    });
    db.close();
    const meta = { id, name: file.name, type: file.type, size: file.size, storedLocal: true };
    try {
      window.FFv15?.registerAttachment?.({
        id,
        name: file.name,
        type: file.type,
        size: file.size,
        category: 'bank-screenshot',
        status: 'stored-local',
        linkedId: `onboarding-bank-${bank.id}`,
        note: `Pantallazo de ${bank.name}; pendiente de extraer o confirmar el saldo.`
      });
    } catch (error) {
      console.warn('[v15.1 bancos] No se pudo registrar el metadato del archivo.', error);
    }
    return meta;
  }

  function injectStyles() {
    if (document.querySelector('style[data-ff-bank-v151]')) return;
    const style = document.createElement('style');
    style.dataset.ffBankV151 = '1';
    style.textContent = `
      .ffbank151{--fb-ink:#0b2240;--fb-muted:#63758c;--fb-line:#d4dfec;--fb-card:#fff;--fb-soft:#eef6ff;--fb-accent:#ff8a16;--fb-blue:#1674d1;color:var(--fb-ink)}
      .ffbank151 *{box-sizing:border-box}.ffbank151 button,.ffbank151 input{font:inherit}.ffbank151 .lead{margin-bottom:18px}
      .ffbank151-section{margin-top:16px;padding:16px;border:1px solid var(--fb-line);border-radius:22px;background:rgba(255,255,255,.72)}
      .ffbank151-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:12px}.ffbank151-head b{display:block;font-size:16px}.ffbank151-head span{display:block;margin-top:3px;color:var(--fb-muted);font-size:12px}.ffbank151-count{flex:none;padding:6px 9px;border-radius:999px;background:var(--fb-soft);color:var(--fb-blue);font-size:11px;font-weight:900}
      .ffbank151-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.ffbank151-bank{min-height:68px;border:1px solid var(--fb-line);border-radius:16px;background:var(--fb-card);color:var(--fb-ink);padding:10px 8px;text-align:left;display:flex;gap:8px;align-items:center;font-weight:800}.ffbank151-bank.selected{border-color:#ff9b3d;background:#fff7ee;box-shadow:0 0 0 2px rgba(255,138,22,.12)}.ffbank151-mark{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;flex:none;background:#eaf3fd;color:#155994;font-size:10px;font-weight:950}.ffbank151-bank.selected .ffbank151-mark{background:#ffead5;color:#b65300}.ffbank151-bank small{display:block;color:var(--fb-muted);font-size:9px;font-weight:700;margin-top:2px}
      .ffbank151-other{width:100%;margin-top:9px;border:1px dashed #b8c9dc;border-radius:15px;background:transparent;color:#315575;padding:11px;font-weight:900}.ffbank151-custom{display:flex;gap:8px;margin-top:9px}.ffbank151-custom input{min-width:0;flex:1;border:1px solid var(--fb-line);border-radius:13px;background:var(--fb-card);padding:11px;color:var(--fb-ink)}.ffbank151-custom button{border:0;border-radius:13px;background:var(--fb-blue);color:#fff;padding:0 14px;font-weight:900}
      .ffbank151-selected{display:grid;gap:10px;margin-top:14px}.ffbank151-empty{padding:18px;border:1px dashed var(--fb-line);border-radius:17px;text-align:center;color:var(--fb-muted);font-size:13px}.ffbank151-card{border:1px solid var(--fb-line);border-radius:19px;background:var(--fb-card);padding:13px}.ffbank151-cardhead{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.ffbank151-order{display:block;color:var(--fb-blue);font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.06em}.ffbank151-cardhead b{display:block;margin-top:3px;font-size:17px}.ffbank151-remove{border:0;background:transparent;color:#7b8ca0;font-size:22px;line-height:1;padding:2px 5px}
      .ffbank151-methods{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:11px}.ffbank151-methods button{border:1px solid var(--fb-line);border-radius:13px;background:#f7fafc;color:#415a75;padding:10px 8px;font-weight:850}.ffbank151-methods button.active{border-color:#6aa9e6;background:#edf6ff;color:#095ba7}.ffbank151-methods button[data-method="screenshot"].active{border-color:#ffad61;background:#fff5eb;color:#a44a00}
      .ffbank151-detail{margin-top:10px}.ffbank151-detail label{display:block;color:var(--fb-muted);font-size:11px;font-weight:850}.ffbank151-detail input[type="number"]{width:100%;margin-top:5px;border:1px solid var(--fb-line);border-radius:14px;background:#fff;padding:12px;color:var(--fb-ink);font-size:17px}.ffbank151-file{display:none}.ffbank151-filelabel{display:flex;justify-content:center;align-items:center;min-height:48px;border:1px dashed #ffad61;border-radius:14px;background:#fff8f0;color:#a44a00;font-weight:900;cursor:pointer}.ffbank151-filemeta{display:flex;gap:9px;align-items:center;padding:10px;border-radius:13px;background:#f2f8ff;color:#2f526f}.ffbank151-filemeta span{font-size:20px}.ffbank151-filemeta b{display:block;font-size:11px}.ffbank151-filemeta small{display:block;color:var(--fb-muted);font-size:9px;margin-top:2px}.ffbank151-filemeta em{margin-left:auto;font-style:normal;color:#167151;font-size:10px;font-weight:900}
      .ffbank151-share{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:11px;padding-top:10px;border-top:1px solid #e7edf4}.ffbank151-share>span{margin-right:auto;color:var(--fb-muted);font-size:11px;font-weight:800}.ffbank151-share button{border:1px solid var(--fb-line);border-radius:10px;background:#fff;color:#3f5973;padding:6px 9px;font-size:10px;font-weight:900}.ffbank151-share button.active{border-color:#74abe0;background:#edf6ff;color:#075ba7}.ffbank151-share input{width:70px;border:1px solid var(--fb-line);border-radius:10px;padding:6px 8px;color:var(--fb-ink);background:#fff;font-size:11px}
      .ffbank151-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}.ffbank151-quick{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.ffbank151-quick button{border:1px solid var(--fb-line);border-radius:11px;background:#fff;color:#415a75;padding:7px 10px;font-size:10px;font-weight:900}.ffbank151-quick button.active{border-color:#6aa9e6;background:#edf6ff;color:#095ba7}.ffbank151-optional{color:var(--fb-muted);font-size:10px}
      .ffbank151-summary{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-top:14px;padding:13px 14px;border-radius:17px;background:#0d2b4e;color:#fff}.ffbank151-summary span{display:block;color:#b9cce0;font-size:10px}.ffbank151-summary strong{display:block;margin-top:3px;font-size:20px}.ffbank151-summary small{display:block;margin-top:3px;color:#b9cce0;font-size:9px}.ffbank151-status{flex:none;padding:7px 9px;border-radius:999px;background:#183d64;color:#cbe4ff;font-size:9px;font-weight:900}.ffbank151-status.ready{background:#174b3d;color:#8fe5c7}.ffbank151-status.pending{background:#5b3919;color:#ffd39b}
      .ffbank151-privacy{display:flex;gap:9px;align-items:flex-start;margin-top:10px;color:var(--fb-muted);font-size:10px;line-height:1.35}.ffbank151-privacy span{font-size:16px}.ffbank151-hidden{display:none!important}
      @media(max-width:560px){.ffbank151-section{padding:13px;border-radius:18px}.ffbank151-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.ffbank151-row{grid-template-columns:1fr}.ffbank151-bank{min-height:64px}.ffbank151-methods{grid-template-columns:1fr}.ffbank151-summary{align-items:flex-start}.ffbank151-status{margin-top:2px}}
      html[data-theme="dark"] .ffbank151,body.dark .ffbank151,.dark .ffbank151{--fb-ink:#edf5ff;--fb-muted:#9db0c7;--fb-line:#29445f;--fb-card:#10253d;--fb-soft:#173754}.dark .ffbank151-section,html[data-theme="dark"] .ffbank151-section,body.dark .ffbank151-section{background:rgba(10,29,49,.8)}.dark .ffbank151-detail input,.dark .ffbank151-share button,.dark .ffbank151-share input,.dark .ffbank151-quick button,html[data-theme="dark"] .ffbank151-detail input,html[data-theme="dark"] .ffbank151-share button,html[data-theme="dark"] .ffbank151-share input,html[data-theme="dark"] .ffbank151-quick button{background:#0b1d31;color:#edf5ff}
    `;
    document.head.appendChild(style);
  }

  function bankById(id) {
    return draft.banks.find(bank => bank.id === id);
  }

  function addBank(template) {
    if (bankById(template.id)) return;
    draft.banks.push({
      id: template.id,
      name: template.name,
      mark: template.mark,
      amount: null,
      ownership: 100,
      method: 'manual',
      file: null
    });
    saveDraft();
  }

  function currentTotal() {
    return draft.banks.reduce((sum, bank) => sum + safeNumber(bank.amount), 0) + safeNumber(draft.cashOutside);
  }

  function pendingScreenshots() {
    return draft.banks.filter(bank => bank.method === 'screenshot' && bank.file && !safeNumber(bank.amount)).length;
  }

  function setOriginalInput(root, selector, value) {
    const input = root.querySelector(selector);
    if (!input) return;
    input.disabled = false;
    input.value = String(value ?? '');
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function syncOriginal(root) {
    const names = draft.banks.map(bank => bank.name).join(', ');
    const total = currentTotal();
    const hasScreenshot = draft.banks.some(bank => bank.file);
    const unknown = root.querySelector('[data-unknown]');
    const unknownSelected = unknown?.classList.contains('selected');

    setOriginalInput(root, '#pWhere', names);
    setOriginalInput(root, '#pCount', Math.max(1, draft.banks.length));
    setOriginalInput(root, '#pMonthlyContribution', safeNumber(draft.monthlyContribution));

    if (total > 0) {
      if (unknownSelected) {
        unknown.click();
        return false;
      }
      setOriginalInput(root, '#pValue', total);
    } else if (hasScreenshot) {
      if (!unknownSelected) {
        unknown?.click();
        return false;
      }
    } else {
      if (unknownSelected) {
        unknown.click();
        return false;
      }
      setOriginalInput(root, '#pValue', 0);
    }
    return true;
  }

  function bankGridMarkup() {
    return COMMON_BANKS.map(bank => {
      const selected = Boolean(bankById(bank.id));
      return `<button type="button" class="ffbank151-bank ${selected ? 'selected' : ''}" data-bank-pick="${esc(bank.id)}"><span class="ffbank151-mark">${esc(bank.mark)}</span><span>${esc(bank.name)}<small>${selected ? 'Añadido' : 'Toca para añadir'}</small></span></button>`;
    }).join('');
  }

  function bankCardMarkup(bank, index) {
    const fileInputId = `ffbank-file-${esc(bank.id)}`;
    const manual = bank.method === 'manual';
    const amount = bank.amount === null ? '' : bank.amount;
    return `<article class="ffbank151-card" data-bank-card="${esc(bank.id)}">
      <div class="ffbank151-cardhead"><div><span class="ffbank151-order">Banco ${index + 1}</span><b>${esc(bank.name)}</b></div><button type="button" class="ffbank151-remove" data-bank-remove="${esc(bank.id)}" aria-label="Quitar ${esc(bank.name)}">×</button></div>
      <div class="ffbank151-methods"><button type="button" class="${manual ? 'active' : ''}" data-bank-method="manual" data-bank-id="${esc(bank.id)}">⌨️ Escribir saldo</button><button type="button" class="${!manual ? 'active' : ''}" data-bank-method="screenshot" data-bank-id="${esc(bank.id)}">▣ Adjuntar pantallazo</button></div>
      <div class="ffbank151-detail">
        ${manual ? `<label>Saldo aproximado<input type="number" min="0" step="0.01" inputmode="decimal" data-bank-amount="${esc(bank.id)}" value="${esc(amount)}" placeholder="Ej. 2.000"></label>` : bank.file ? `<div class="ffbank151-filemeta"><span>▣</span><div><b>${esc(bank.file.name)}</b><small>Guardado de forma privada en este dispositivo</small></div><em>✓ Listo</em></div><input id="${fileInputId}" class="ffbank151-file" type="file" accept="image/*,application/pdf" data-bank-file="${esc(bank.id)}"><label class="ffbank151-filelabel" for="${fileInputId}">Cambiar pantallazo</label>` : `<input id="${fileInputId}" class="ffbank151-file" type="file" accept="image/*,application/pdf" data-bank-file="${esc(bank.id)}"><label class="ffbank151-filelabel" for="${fileInputId}">Seleccionar imagen o PDF</label>`}
      </div>
      <div class="ffbank151-share"><span>¿Qué porcentaje te pertenece?</span>${[100, 50].map(value => `<button type="button" class="${Math.abs(bank.ownership - value) < .01 ? 'active' : ''}" data-bank-share="${value}" data-bank-id="${esc(bank.id)}">${value} %</button>`).join('')}<input type="number" min="0" max="100" step="1" inputmode="decimal" aria-label="Otro porcentaje" data-bank-share-custom="${esc(bank.id)}" value="${esc(bank.ownership)}"></div>
    </article>`;
  }

  function selectedMarkup() {
    if (!draft.banks.length) return '<div class="ffbank151-empty">Toca arriba el primer banco que quieras añadir.</div>';
    return draft.banks.map(bankCardMarkup).join('');
  }

  function updateView(root) {
    const grid = root.querySelector('[data-bank-grid]');
    const selected = root.querySelector('[data-bank-selected]');
    if (grid) grid.innerHTML = bankGridMarkup();
    if (selected) selected.innerHTML = selectedMarkup();
    const count = root.querySelector('[data-bank-count]');
    if (count) count.textContent = `${draft.banks.length} ${draft.banks.length === 1 ? 'banco' : 'bancos'}`;
    const total = currentTotal();
    const pending = pendingScreenshots();
    const totalEl = root.querySelector('[data-bank-total]');
    const detailEl = root.querySelector('[data-bank-total-detail]');
    const statusEl = root.querySelector('[data-bank-status]');
    if (totalEl) totalEl.textContent = euro(total);
    if (detailEl) detailEl.textContent = pending ? `${pending} pantallazo${pending > 1 ? 's' : ''} pendiente${pending > 1 ? 's' : ''} de leer` : draft.banks.length ? 'Saldo conocido entre los bancos añadidos' : 'Todavía no has añadido bancos';
    if (statusEl) {
      statusEl.className = `ffbank151-status ${total > 0 ? 'ready' : pending ? 'pending' : ''}`;
      statusEl.textContent = total > 0 ? 'Listo para continuar' : pending ? 'Lo completaremos después' : 'Añade un saldo o pantallazo';
    }
    const cashInput = root.querySelector('[data-cash-outside]');
    if (cashInput && document.activeElement !== cashInput) cashInput.value = draft.cashOutside || '';
    root.querySelectorAll('[data-contribution]').forEach(button => {
      button.classList.toggle('active', Number(button.dataset.contribution) === safeNumber(draft.monthlyContribution) && !draft.contributionCustom);
    });
    const customContribution = root.querySelector('[data-contribution-custom]');
    if (customContribution) {
      customContribution.hidden = !draft.contributionCustom;
      if (document.activeElement !== customContribution) customContribution.value = draft.contributionCustom ? draft.monthlyContribution || '' : '';
    }
    bindDynamic(root);
    syncOriginal(root);
  }

  function bindDynamic(root) {
    root.querySelectorAll('[data-bank-pick]').forEach(button => {
      button.onclick = () => {
        const template = COMMON_BANKS.find(bank => bank.id === button.dataset.bankPick);
        if (!template) return;
        if (bankById(template.id)) draft.banks = draft.banks.filter(bank => bank.id !== template.id);
        else addBank(template);
        saveDraft();
        updateView(root);
      };
    });
    root.querySelectorAll('[data-bank-remove]').forEach(button => {
      button.onclick = () => {
        draft.banks = draft.banks.filter(bank => bank.id !== button.dataset.bankRemove);
        saveDraft();
        updateView(root);
      };
    });
    root.querySelectorAll('[data-bank-method]').forEach(button => {
      button.onclick = () => {
        const bank = bankById(button.dataset.bankId);
        if (!bank) return;
        bank.method = button.dataset.bankMethod;
        saveDraft();
        updateView(root);
        if (bank.method === 'screenshot' && !bank.file) setTimeout(() => root.querySelector(`[data-bank-file="${CSS.escape(bank.id)}"]`)?.click(), 40);
      };
    });
    root.querySelectorAll('[data-bank-amount]').forEach(input => {
      input.oninput = () => {
        const bank = bankById(input.dataset.bankAmount);
        if (!bank) return;
        bank.amount = input.value === '' ? null : safeNumber(input.value);
        saveDraft();
        syncOriginal(root);
        const totalEl = root.querySelector('[data-bank-total]');
        if (totalEl) totalEl.textContent = euro(currentTotal());
        const statusEl = root.querySelector('[data-bank-status]');
        if (statusEl) {
          const total = currentTotal();
          statusEl.className = `ffbank151-status ${total > 0 ? 'ready' : ''}`;
          statusEl.textContent = total > 0 ? 'Listo para continuar' : 'Añade un saldo o pantallazo';
        }
      };
    });
    root.querySelectorAll('[data-bank-share]').forEach(button => {
      button.onclick = () => {
        const bank = bankById(button.dataset.bankId);
        if (!bank) return;
        bank.ownership = safeNumber(button.dataset.bankShare);
        saveDraft();
        updateView(root);
      };
    });
    root.querySelectorAll('[data-bank-share-custom]').forEach(input => {
      input.oninput = () => {
        const bank = bankById(input.dataset.bankShareCustom);
        if (!bank) return;
        bank.ownership = Math.max(0, Math.min(100, safeNumber(input.value)));
        saveDraft();
        root.querySelectorAll(`[data-bank-share][data-bank-id="${CSS.escape(bank.id)}"]`).forEach(button => button.classList.toggle('active', Number(button.dataset.bankShare) === bank.ownership));
      };
    });
    root.querySelectorAll('[data-bank-file]').forEach(input => {
      input.onchange = async () => {
        const bank = bankById(input.dataset.bankFile);
        const file = input.files?.[0];
        if (!bank || !file) return;
        bank.method = 'screenshot';
        bank.file = { name: file.name, type: file.type, size: file.size, storing: true };
        saveDraft();
        updateView(root);
        try {
          bank.file = await storeFileLocally(file, bank);
        } catch (error) {
          console.warn('[v15.1 bancos] El archivo no pudo guardarse en IndexedDB.', error);
          bank.file = { name: file.name, type: file.type, size: file.size, storedLocal: false, error: true };
        }
        saveDraft();
        updateView(root);
      };
    });
  }

  function bindStatic(root) {
    root.querySelector('[data-add-other]')?.addEventListener('click', () => {
      const box = root.querySelector('[data-custom-bank]');
      box.hidden = !box.hidden;
      if (!box.hidden) setTimeout(() => box.querySelector('input')?.focus(), 20);
    });
    const addCustom = () => {
      const input = root.querySelector('[data-custom-bank-input]');
      const name = input?.value.trim();
      if (!name) return;
      const id = `other-${slug(name)}`;
      addBank({ id, name, mark: name.slice(0, 3).toUpperCase() });
      input.value = '';
      root.querySelector('[data-custom-bank]').hidden = true;
      updateView(root);
    };
    root.querySelector('[data-custom-bank-add]')?.addEventListener('click', addCustom);
    root.querySelector('[data-custom-bank-input]')?.addEventListener('keydown', event => {
      if (event.key === 'Enter') { event.preventDefault(); addCustom(); }
    });
    root.querySelector('[data-cash-outside]')?.addEventListener('input', event => {
      draft.cashOutside = safeNumber(event.target.value);
      saveDraft();
      syncOriginal(root);
      const totalEl = root.querySelector('[data-bank-total]');
      if (totalEl) totalEl.textContent = euro(currentTotal());
    });
    root.querySelectorAll('[data-contribution]').forEach(button => {
      button.addEventListener('click', () => {
        if (button.dataset.contribution === 'custom') {
          draft.contributionCustom = true;
        } else {
          draft.contributionCustom = false;
          draft.monthlyContribution = safeNumber(button.dataset.contribution);
        }
        saveDraft();
        updateView(root);
      });
    });
    root.querySelector('[data-contribution-custom]')?.addEventListener('input', event => {
      draft.contributionCustom = true;
      draft.monthlyContribution = safeNumber(event.target.value);
      saveDraft();
      syncOriginal(root);
    });
  }

  function patchCashDetail() {
    const root = document.querySelector('#portraitContent');
    if (!root || root.dataset.ffBankV151 === '1') return;
    const title = root.querySelector('h1')?.textContent || '';
    const valueInput = root.querySelector('#pValue');
    const whereInput = root.querySelector('#pWhere');
    const countInput = root.querySelector('#pCount');
    if (!valueInput || !whereInput || !countInput || !/banco/i.test(title)) return;

    const hidden = document.createElement('div');
    hidden.className = 'ffbank151-hidden';
    hidden.dataset.bankOriginal = '1';
    [valueInput, whereInput, countInput, root.querySelector('#pMonthlyContribution'), root.querySelector('[data-unknown]')].filter(Boolean).forEach(node => hidden.appendChild(node));

    root.dataset.ffBankV151 = '1';
    root.classList.add('ffbank151');
    root.innerHTML = `<p class="kicker">Sin escribir listas ni contar cuentas</p><h1>Añade tus <em>bancos.</em></h1><p class="lead">Toca cada entidad y elige cómo quieres completar el saldo. Podrás escribirlo o guardar un pantallazo privado antes de habilitar la sincronización.</p>
      <section class="ffbank151-section"><div class="ffbank151-head"><div><b>1. Toca los bancos que utilizas</b><span>Los habituales aparecen primero. Solo tendrás que escribir si eliges «Otro banco».</span></div><span class="ffbank151-count" data-bank-count>0 bancos</span></div><div class="ffbank151-grid" data-bank-grid></div><button type="button" class="ffbank151-other" data-add-other>＋ Otro banco</button><div class="ffbank151-custom" data-custom-bank hidden><input data-custom-bank-input maxlength="50" placeholder="Nombre del banco"><button type="button" data-custom-bank-add>Añadir</button></div></section>
      <section class="ffbank151-section"><div class="ffbank151-head"><div><b>2. Completa cada banco</b><span>Cada entidad conserva su saldo, fuente y porcentaje de propiedad por separado.</span></div></div><div class="ffbank151-selected" data-bank-selected></div></section>
      <section class="ffbank151-section"><div class="ffbank151-row"><div><div class="ffbank151-head"><div><b>Efectivo fuera del banco</b><span class="ffbank151-optional">Opcional</span></div></div><div class="ffbank151-detail"><label>Dinero en metálico<input type="number" min="0" step="0.01" inputmode="decimal" data-cash-outside value="${esc(draft.cashOutside || '')}" placeholder="0 €"></label></div></div><div><div class="ffbank151-head"><div><b>¿Cuánto añades cada mes?</b><span class="ffbank151-optional">Puedes dejarlo en 0</span></div></div><div class="ffbank151-quick"><button type="button" data-contribution="0">0 €</button><button type="button" data-contribution="250">250 €</button><button type="button" data-contribution="500">500 €</button><button type="button" data-contribution="1000">1.000 €</button><button type="button" data-contribution="custom">Otro</button></div><div class="ffbank151-detail"><input type="number" min="0" step="1" inputmode="decimal" data-contribution-custom hidden placeholder="Escribe la cantidad mensual"></div></div></div></section>
      <div class="ffbank151-summary"><div><span>Total conocido ahora</span><strong data-bank-total>0 €</strong><small data-bank-total-detail>Todavía no has añadido bancos</small></div><span class="ffbank151-status" data-bank-status>Añade un saldo o pantallazo</span></div><div class="ffbank151-privacy"><span>🔒</span><div>Los pantallazos se guardan únicamente en el almacenamiento privado de este dispositivo. No se publican ni se envían a GitHub.</div></div>`;
    root.appendChild(hidden);
    const next = document.querySelector('#portraitNext');
    if (next) next.innerHTML = 'Añadir bancos al mapa <span>→</span>';
    bindStatic(root);
    updateView(root);
  }

  function applyDraftToCompletedOnboarding() {
    let payload;
    try { payload = JSON.parse(localStorage.getItem(BASE_STORE) || 'null'); } catch (_) { return; }
    if (!payload?.onboardingComplete || draft.applied || !draft.banks.length) return;
    const items = Array.isArray(payload.items) ? payload.items : [];
    const cashIndex = items.findIndex(item => item.type === 'cash');
    if (cashIndex < 0) return;
    const template = items[cashIndex];
    const created = draft.banks.map((bank, index) => ({
      ...template,
      id: `bank-${slug(bank.name)}-${index + 1}`,
      name: bank.name,
      value: safeNumber(bank.amount),
      monthlyContribution: index === 0 ? safeNumber(draft.monthlyContribution) : 0,
      institution: bank.name,
      count: 1,
      source: bank.file ? 'uploaded' : 'entered',
      sourceLabel: bank.file ? 'Pantallazo pendiente de revisar' : 'Introducido por ti',
      ownershipPct: bank.ownership,
      screenshotId: bank.file?.id || '',
      screenshotName: bank.file?.name || '',
      pendingValue: Boolean(bank.file && !safeNumber(bank.amount)),
      updatedAt: new Date().toISOString()
    }));
    if (safeNumber(draft.cashOutside) > 0) {
      created.push({
        ...template,
        id: 'cash-outside-bank',
        name: 'Efectivo fuera del banco',
        value: safeNumber(draft.cashOutside),
        institution: 'Efectivo',
        count: 1,
        source: 'entered',
        sourceLabel: 'Introducido por ti',
        ownershipPct: 100,
        updatedAt: new Date().toISOString()
      });
    }
    payload.items.splice(cashIndex, 1, ...created);
    payload.profile = { ...(payload.profile || {}), bankOnboarding: { version: '15.1', completedAt: new Date().toISOString(), banks: created.map(item => item.id) } };
    localStorage.setItem(BASE_STORE, JSON.stringify(payload));
    draft.applied = true;
    saveDraft();
  }

  injectStyles();
  applyDraftToCompletedOnboarding();
  const host = document.querySelector('#portraitContent');
  if (host) new MutationObserver(() => setTimeout(patchCashDetail, 0)).observe(host, { childList: true, subtree: true });
  new MutationObserver(() => setTimeout(patchCashDetail, 0)).observe(document.body, { childList: true, subtree: true });
  setTimeout(patchCashDetail, 20);
})();
