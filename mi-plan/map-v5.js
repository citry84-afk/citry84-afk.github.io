(() => {
  'use strict';

  const STORAGE_KEYS = ['ff_mi_plan_v2', 'ff_mi_plan_v4'];
  const activeStorageKey = () => STORAGE_KEYS.find(key => { try { return Boolean(localStorage.getItem(key)); } catch (_) { return false; } }) || STORAGE_KEYS[0];
  const TYPE_META = {
    cash: { label: 'Bancos y efectivo', icon: '€' },
    funds: { label: 'Fondos / ETF', icon: '◫' },
    stocks: { label: 'Acciones', icon: '↗' },
    options: { label: 'Opciones', icon: '◎' },
    pension: { label: 'Pensiones', icon: '◌' },
    crypto: { label: 'Criptomonedas', icon: '◇' },
    realestate: { label: 'Inmuebles', icon: '⌂' },
    debt: { label: 'Hipotecas y deudas', icon: '−' },
    other: { label: 'Otros activos', icon: '＋' },
  };
  const TYPE_ORDER = Object.keys(TYPE_META);
  const POSITIONS = [[50, 4], [79, 13], [95, 38], [88, 70], [64, 91], [35, 91], [10, 70], [5, 38], [21, 13]];
  const SOURCE_META = {
    estimated: { label: 'Estimado', className: 'estimated', weight: 5, explanation: 'Una cifra aproximada que diste durante el onboarding.' },
    entered: { label: 'Introducido', className: 'entered', weight: 14, explanation: 'Una cifra escrita o revisada directamente por ti.' },
    imported: { label: 'Importado', className: 'imported', weight: 18, explanation: 'Un dato obtenido desde un archivo compatible.' },
    synced: { label: 'Sincronizado', className: 'synced', weight: 20, explanation: 'Un dato actualizado automáticamente mediante una conexión.' },
    pending: { label: 'Pendiente', className: 'pending', weight: 0, explanation: 'Marcaste esta categoría para completarla más adelante.' },
  };

  const euro = (value, compact = false) => new Intl.NumberFormat('es-ES', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
    notation: compact ? 'compact' : 'standard',
  }).format(Number(value) || 0);
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const readData = () => {
    try { return JSON.parse(localStorage.getItem(activeStorageKey()) || 'null'); }
    catch (_) { return null; }
  };
  const sourceOf = item => {
    const raw = String(item?.source || '').toLowerCase();
    if (raw === 'synced' || raw === 'imported' || raw === 'estimated') return raw;
    return 'entered';
  };
  const typeItems = (data, type) => (data?.items || []).filter(item => item.type === type);
  const pendingTypes = data => new Set(Array.isArray(data?.profile?.pendingProducts) ? data.profile.pendingProducts : []);
  const uniqueTypes = data => {
    const present = new Set((data?.items || []).map(item => item.type).filter(type => TYPE_META[type]));
    pendingTypes(data).forEach(type => TYPE_META[type] && present.add(type));
    return TYPE_ORDER.filter(type => present.has(type));
  };
  const typeTotal = (data, type) => typeItems(data, type).reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  const typeSource = (data, type) => {
    if (pendingTypes(data).has(type) && !typeItems(data, type).length) return 'pending';
    const items = typeItems(data, type);
    if (!items.length) return 'pending';
    const sources = items.map(sourceOf);
    if (sources.includes('estimated')) return 'estimated';
    if (sources.includes('entered')) return 'entered';
    if (sources.includes('imported')) return 'imported';
    return 'synced';
  };
  const netWorth = data => (data?.items || []).reduce((sum, item) => sum + (item.type === 'debt' ? -(Number(item.value) || 0) : (Number(item.value) || 0)), 0);
  const categoryPrecision = (data, type) => {
    const items = typeItems(data, type);
    if (!items.length) return pendingTypes(data).has(type) ? 4 : 0;
    let score = 30;
    if (items.every(item => Number(item.value) > 0)) score += 30;
    const identified = items.filter(item => {
      const name = String(item.name || '').trim().toLowerCase();
      const generic = [TYPE_META[type]?.label.toLowerCase(), 'inmueble', 'banco y efectivo', 'bancos y efectivo'].includes(name);
      return (name && !generic) || String(item.institution || '').trim();
    }).length / items.length;
    score += identified * 20;
    const averageSource = items.reduce((sum, item) => sum + SOURCE_META[sourceOf(item)].weight, 0) / items.length;
    score += averageSource;
    return Math.max(0, Math.min(100, Math.round(score)));
  };
  const overallPrecision = data => {
    const types = uniqueTypes(data);
    if (!types.length) return 12;
    return Math.round(types.reduce((sum, type) => sum + categoryPrecision(data, type), 0) / types.length);
  };
  const initials = data => String(data?.profile?.name || 'Tú').split(/\s+/).filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'TÚ';
  const sourceBadge = source => {
    const meta = SOURCE_META[source] || SOURCE_META.entered;
    return `<span class="map5-source ${meta.className}" title="${escapeHtml(meta.explanation)}"><i></i>${meta.label}</span>`;
  };

  function nextAction(data) {
    if (!uniqueTypes(data).length) return { icon: '＋', title: 'Añade la primera pieza de tu mapa', text: 'Empieza por el dinero que tienes disponible en bancos o efectivo.', action: 'add', type: 'cash' };
    const pending = TYPE_ORDER.find(type => pendingTypes(data).has(type) && !typeItems(data, type).length);
    if (pending) return { icon: '?', title: `Aclara si tienes ${TYPE_META[pending].label.toLowerCase()}`, text: 'Lo dejaste pendiente. Puedes añadirlo ahora o descartarlo más adelante.', action: 'add', type: pending };
    const zero = (data.items || []).find(item => TYPE_META[item.type] && !(Number(item.value) > 0));
    if (zero) return { icon: '€', title: `Añade el valor de ${zero.name || TYPE_META[zero.type].label}`, text: 'Con una cifra aproximada ya podremos incluirlo en el patrimonio neto.', action: 'edit', id: zero.id };
    const estimated = (data.items || []).find(item => sourceOf(item) === 'estimated');
    if (estimated) return { icon: '≈', title: `Revisa ${estimated.name || TYPE_META[estimated.type].label}`, text: 'Al confirmar o ajustar la cifra, pasará de estimada a introducida por ti.', action: 'edit', id: estimated.id };
    const unnamed = (data.items || []).find(item => !String(item.name || '').trim());
    if (unnamed) return { icon: '✎', title: 'Pon nombre a uno de tus elementos', text: 'Así reconocerás fácilmente dónde está cada parte de tu patrimonio.', action: 'edit', id: unnamed.id };
    const currentMonth = new Date().toISOString().slice(0, 7);
    const hasCurrentMovement = (data.movements || []).some(movement => String(movement.date || '').slice(0, 7) === currentMonth);
    if (!hasCurrentMovement) return { icon: '＋', title: 'Registra el primer movimiento del mes', text: 'Una aportación, un ingreso pasivo o un cambio de mercado hará que el informe cobre vida.', action: 'movement' };
    return { icon: '✓', title: 'Tu fotografía está muy bien definida', text: 'El siguiente salto de precisión llegará al importar archivos o conectar entidades.', action: 'none' };
  }

  function mapMarkup(data, compact = false) {
    const types = uniqueTypes(data);
    const lines = types.map(type => {
      const index = TYPE_ORDER.indexOf(type);
      const [x, y] = POSITIONS[index];
      return `<line x1="50" y1="50" x2="${x}" y2="${y}"></line>`;
    }).join('');
    const nodes = types.map(type => {
      const index = TYPE_ORDER.indexOf(type);
      const [x, y] = POSITIONS[index];
      const source = typeSource(data, type);
      const total = typeTotal(data, type);
      return `<button class="map5-node ${source === 'pending' ? 'pending' : ''} ${type === 'debt' ? 'debt' : ''}" style="--x:${x}%;--y:${y}%" type="button" data-map5-category="${type}" aria-label="Abrir ${escapeHtml(TYPE_META[type].label)}"><span>${TYPE_META[type].icon}</span><b>${escapeHtml(TYPE_META[type].label)}</b><small>${source === 'pending' ? 'Pendiente' : euro(total, true)}</small></button>`;
    }).join('');
    const household = data?.profile?.household === 'couple' ? 'Mapa de pareja' : data?.profile?.household === 'family' ? 'Mapa familiar' : 'Mapa personal';
    return `<div class="map5-map ${compact ? 'compact' : ''}"><svg viewBox="0 0 100 100" aria-hidden="true">${lines}</svg>${nodes}<div class="map5-center"><span>${initials(data)}</span><b>${escapeHtml(data?.profile?.name || 'Tu mapa')}</b><small>${household}</small></div></div>`;
  }

  function homeSection(data) {
    const precision = overallPrecision(data);
    const action = nextAction(data);
    const categories = uniqueTypes(data);
    return `<section class="map5-dashboard" data-map5-enhancement="home">
      <div class="map5-heading"><div><p class="eyebrow">TU FOTOGRAFÍA FINANCIERA</p><h2>Tu dinero, dibujado alrededor de ti</h2><p>Entra en cualquier pieza para revisarla. El mapa se vuelve más preciso cada vez que completas un dato.</p></div><div class="map5-precision-ring" style="--precision:${precision}%"><div><strong>${precision}%</strong><span>completada</span></div></div></div>
      <div class="map5-home-grid">
        <article class="map5-map-card">${mapMarkup(data)}<div class="map5-net"><span>Patrimonio neto</span><strong>${euro(netWorth(data))}</strong><small>${categories.length} categorías activas</small></div></article>
        <div class="map5-side">
          <article class="map5-next"><span class="map5-next-icon">${action.icon}</span><p class="eyebrow">SIGUIENTE PASO</p><h3>${escapeHtml(action.title)}</h3><p>${escapeHtml(action.text)}</p>${action.action !== 'none' ? `<button class="primary" type="button" data-map5-next="${action.action}" ${action.type ? `data-type="${action.type}"` : ''} ${action.id ? `data-id="${action.id}"` : ''}>Completar ahora <span>→</span></button>` : '<span class="map5-complete-chip">✓ Fotografía al día</span>'}</article>
          <article class="map5-legend"><p class="eyebrow">CALIDAD DEL DATO</p>${['estimated','entered','imported','synced'].map(source => `<div>${sourceBadge(source)}<span>${SOURCE_META[source].explanation}</span></div>`).join('')}</article>
        </div>
      </div>
      <div class="map5-category-grid">${categories.map(type => categoryCard(data, type)).join('')}</div>
    </section>`;
  }

  function categoryCard(data, type) {
    const items = typeItems(data, type);
    const source = typeSource(data, type);
    const precision = categoryPrecision(data, type);
    return `<button type="button" class="map5-category-card" data-map5-category="${type}"><span class="map5-category-icon">${TYPE_META[type].icon}</span><div><strong>${escapeHtml(TYPE_META[type].label)}</strong><small>${source === 'pending' ? 'Pendiente de completar' : `${items.length} ${items.length === 1 ? 'elemento' : 'elementos'} · ${precision}% preciso`}</small></div><div class="map5-category-value"><strong>${source === 'pending' ? '—' : euro(typeTotal(data, type))}</strong>${sourceBadge(source)}</div><span class="map5-chevron">›</span></button>`;
  }

  function wealthSection(data) {
    const precision = overallPrecision(data);
    return `<section class="map5-wealth-strip" data-map5-enhancement="wealth"><div><p class="eyebrow">PRECISIÓN DE TU FOTOGRAFÍA</p><h3>${precision}% completada</h3><p>Las cifras estimadas son suficientes para empezar. Revísalas una a una para convertirlas en datos introducidos.</p></div><div class="map5-mini-progress"><i style="width:${precision}%"></i></div><button class="soft" type="button" data-map5-open-map>Ver mapa</button></section>`;
  }

  function ensureDialog() {
    if (document.getElementById('map5CategoryDialog')) return;
    document.body.insertAdjacentHTML('beforeend', `<dialog id="map5CategoryDialog" class="map5-dialog"><div class="map5-dialog-sheet"><div class="map5-dialog-head"><div><p class="eyebrow">TU FOTOGRAFÍA</p><h2 id="map5DialogTitle">Categoría</h2><p id="map5DialogSubtitle"></p></div><button class="close" type="button" data-map5-close aria-label="Cerrar">×</button></div><div id="map5DialogBody"></div><div class="map5-dialog-actions"><button class="ghost" type="button" data-map5-close>Cerrar</button><button class="primary" type="button" id="map5AddCategory">＋ Añadir otro</button></div></div></dialog><div id="map5PrecisionJoy" class="map5-joy" role="status" aria-live="polite"><div class="map5-joy-ring"><span>＋</span><strong id="map5JoyPoints">5</strong></div><div><b id="map5JoyTitle">¡Fotografía mejorada!</b><small id="map5JoyText">Ahora el mapa es más preciso.</small></div></div>`);
    const dialog = document.getElementById('map5CategoryDialog');
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  }

  function openCategory(type) {
    const data = readData();
    if (!data || !TYPE_META[type]) return;
    ensureDialog();
    const dialog = document.getElementById('map5CategoryDialog');
    const items = typeItems(data, type);
    const source = typeSource(data, type);
    document.getElementById('map5DialogTitle').textContent = TYPE_META[type].label;
    document.getElementById('map5DialogSubtitle').textContent = source === 'pending' ? 'Lo dejaste pendiente durante el onboarding.' : `${items.length} ${items.length === 1 ? 'elemento registrado' : 'elementos registrados'} · ${categoryPrecision(data, type)}% de precisión`;
    document.getElementById('map5DialogBody').innerHTML = items.length ? `<div class="map5-dialog-summary"><div><span>Total de la categoría</span><strong>${euro(typeTotal(data, type))}</strong></div>${sourceBadge(source)}</div><div class="map5-item-list">${items.map(item => `<button type="button" class="map5-item" data-map5-edit="${escapeHtml(item.id)}"><span>${TYPE_META[type].icon}</span><div><strong>${escapeHtml(item.name || TYPE_META[type].label)}</strong><small>${item.owner ? `${escapeHtml(item.owner)} · ` : ''}${SOURCE_META[sourceOf(item)].label}</small></div><div><strong>${euro(item.value)}</strong>${item.monthlyIncome ? `<small>+${euro(item.monthlyIncome)}/mes</small>` : ''}</div><i>›</i></button>`).join('')}</div>` : `<div class="map5-empty"><span>${TYPE_META[type].icon}</span><h3>Completa esta pieza del mapa</h3><p>Añade una cifra aproximada. Después podrás hacerla más exacta mediante archivos o conexiones.</p></div>`;
    const add = document.getElementById('map5AddCategory');
    add.dataset.type = type;
    add.textContent = items.length ? '＋ Añadir otro' : '＋ Completar categoría';
    dialog.showModal();
  }

  function triggerBaseAction(action, attributes = {}) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.action = action;
    Object.entries(attributes).forEach(([key, value]) => { button.dataset[key] = value; });
    button.hidden = true;
    document.body.appendChild(button);
    button.click();
    button.remove();
  }

  function openAddForType(type) {
    triggerBaseAction('add-item');
    setTimeout(() => {
      const select = document.getElementById('itemType');
      if (!select) return;
      select.value = type;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      const dialogTitle = document.getElementById('itemDialogTitle');
      if (dialogTitle) dialogTitle.textContent = `Añadir ${TYPE_META[type]?.label.toLowerCase() || 'elemento'}`;
    }, 20);
  }

  function showPrecisionJoy(before, after) {
    if (!(after > before)) return;
    ensureDialog();
    const joy = document.getElementById('map5PrecisionJoy');
    document.getElementById('map5JoyPoints').textContent = `+${after - before}`;
    document.getElementById('map5JoyTitle').textContent = after >= 90 ? '¡Fotografía casi perfecta!' : '¡Fotografía mejorada!';
    document.getElementById('map5JoyText').textContent = `Has aumentado la precisión hasta el ${after}%.`;
    joy.classList.remove('show');
    void joy.offsetWidth;
    joy.classList.add('show');
    if (navigator.vibrate) navigator.vibrate([10, 30, 18]);
    clearTimeout(showPrecisionJoy.timer);
    showPrecisionJoy.timer = setTimeout(() => joy.classList.remove('show'), 2400);
  }

  let rendering = false;
  function enhance() {
    if (rendering) return;
    const data = readData();
    const root = document.getElementById('viewRoot');
    if (!data?.onboardingComplete || !root || document.getElementById('app')?.classList.contains('hidden')) return;
    rendering = true;
    try {
      const statusHero = root.querySelector('.status-hero');
      if (statusHero && !root.querySelector('[data-map5-enhancement="home"]')) statusHero.insertAdjacentHTML('afterend', homeSection(data));
      const toolbar = root.querySelector('.section-toolbar');
      const eyebrow = toolbar?.querySelector('.eyebrow')?.textContent?.trim();
      if (eyebrow === 'PATRIMONIO' && !root.querySelector('[data-map5-enhancement="wealth"]')) toolbar.insertAdjacentHTML('afterend', wealthSection(data));
    } finally { rendering = false; }
  }

  ensureDialog();
  const observer = new MutationObserver(() => queueMicrotask(enhance));
  const root = document.getElementById('viewRoot');
  if (root) observer.observe(root, { childList: true, subtree: false });
  const app = document.getElementById('app');
  if (app) observer.observe(app, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('pageshow', enhance);
  setTimeout(enhance, 80);
  setTimeout(enhance, 600);

  document.addEventListener('click', event => {
    const close = event.target.closest('[data-map5-close]');
    if (close) { document.getElementById('map5CategoryDialog')?.close(); return; }
    const category = event.target.closest('[data-map5-category]');
    if (category) { openCategory(category.dataset.map5Category); return; }
    const edit = event.target.closest('[data-map5-edit]');
    if (edit) {
      document.getElementById('map5CategoryDialog')?.close();
      triggerBaseAction('edit-item', { id: edit.dataset.map5Edit });
      return;
    }
    const add = event.target.closest('#map5AddCategory');
    if (add) { document.getElementById('map5CategoryDialog')?.close(); openAddForType(add.dataset.type); return; }
    const next = event.target.closest('[data-map5-next]');
    if (next) {
      if (next.dataset.map5Next === 'add') openAddForType(next.dataset.type);
      if (next.dataset.map5Next === 'edit') triggerBaseAction('edit-item', { id: next.dataset.id });
      if (next.dataset.map5Next === 'movement') triggerBaseAction('add-movement');
      return;
    }
    if (event.target.closest('[data-map5-open-map]')) {
      const button = document.createElement('button');
      button.type = 'button'; button.dataset.view = 'home'; button.hidden = true;
      document.body.appendChild(button); button.click(); button.remove();
      setTimeout(() => document.querySelector('[data-map5-enhancement="home"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    }
  }, true);

  let precisionBeforeSave = null;
  document.addEventListener('submit', event => {
    if (!event.target.matches('#itemForm')) return;
    precisionBeforeSave = overallPrecision(readData());
    setTimeout(() => {
      const after = overallPrecision(readData());
      showPrecisionJoy(precisionBeforeSave ?? after, after);
      setTimeout(enhance, 20);
    }, 160);
  }, true);
})();
