/* FinanzasFácil · v15 — interfaz Mi fotografía. */
(() => {
'use strict';
if (window.__FF_V15_UI__) return;
window.__FF_V15_UI__ = true;

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = (value, currency = 'EUR', digits = 0) => new Intl.NumberFormat('es-ES', { style:'currency', currency, maximumFractionDigits:digits, minimumFractionDigits:digits }).format(Number(value || 0));
const number = (value, digits = 0) => new Intl.NumberFormat('es-ES', { maximumFractionDigits:digits, minimumFractionDigits:digits }).format(Number(value || 0));
const pct = value => `${number(value, 0)} %`;
const dateText = value => value ? new Intl.DateTimeFormat('es-ES').format(new Date(`${String(value).slice(0,10)}T12:00:00`)) : 'Sin fecha';
let active = false;
let dialogContext = null;

function toast(message) {
  document.querySelector('.ff15-toast')?.remove();
  const el = document.createElement('div');
  el.className = 'ff15-toast';
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4200);
}

function injectStyles() {
  if (document.querySelector('style[data-ff15]')) return;
  const style = document.createElement('style');
  style.dataset.ff15 = '1';
  style.textContent = `
  .ff15{--ff15-bg:#0d1d31;--ff15-card:#10243d;--ff15-line:#29425f;--ff15-muted:#93a8c2;--ff15-good:#55d3ac;--ff15-warn:#ffbd65;--ff15-bad:#ff8893;color:#eef5ff;padding-bottom:110px}
  .ff15 *{box-sizing:border-box}.ff15 button,.ff15 input,.ff15 select{font:inherit}.ff15-hero{display:grid;grid-template-columns:1.5fr .9fr;gap:14px;margin-bottom:14px}.ff15-panel{background:linear-gradient(145deg,#0b1d33,#102b4d);border:1px solid #234161;border-radius:22px;padding:18px}.ff15-panel h2,.ff15-panel h3{margin:0}.ff15-panel p{color:var(--ff15-muted)}
  .ff15-topline{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.ff15-topline small{display:block;color:var(--ff15-muted);font-weight:700;letter-spacing:.08em}.ff15-view-toggle{display:flex;gap:5px;padding:4px;border:1px solid #28425f;border-radius:13px;background:#0a192b}.ff15-view-toggle button{border:0;border-radius:9px;background:transparent;color:#9fb2c9;padding:8px 10px;font-size:11px;font-weight:800}.ff15-view-toggle button.active{background:#1d5ea8;color:white}
  .ff15-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-top:16px}.ff15-metric{padding:12px;border:1px solid #2a4361;border-radius:15px;background:#0b1c30}.ff15-metric small{display:block;color:#91a6bf;font-size:10px}.ff15-metric strong{display:block;font-size:18px;margin:5px 0}.ff15-metric span{font-size:9px;color:#89a0ba}.ff15-progress{height:10px;border-radius:99px;background:#1b3149;overflow:hidden;margin:12px 0 7px}.ff15-progress i{display:block;height:100%;background:linear-gradient(90deg,#2878d4,#55d3ac);border-radius:inherit}
  .ff15-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:14px;margin-bottom:14px}.ff15-card{background:var(--ff15-card);border:1px solid var(--ff15-line);border-radius:19px;padding:16px}.ff15-card h3{margin:0 0 4px;font-size:16px}.ff15-card>p{margin:0 0 13px;color:var(--ff15-muted);font-size:11px;line-height:1.45}.ff15-section-head{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:12px}.ff15-section-head button,.ff15-btn{border:1px solid #315272;background:#153253;color:white;border-radius:12px;padding:9px 11px;font-weight:800;font-size:11px}.ff15-btn.primary{background:#1769c2;border-color:#2d83de}.ff15-btn.soft{background:#102945}.ff15-btn.danger{background:#3c1d29;border-color:#683142;color:#ffabb3}
  .ff15-question{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:start;padding:12px 0;border-top:1px solid #213a56}.ff15-question:first-of-type{border-top:0}.ff15-priority{width:9px;height:9px;border-radius:50%;margin-top:5px;background:#6f849a}.ff15-priority.high{background:var(--ff15-bad)}.ff15-priority.medium{background:var(--ff15-warn)}.ff15-question b{display:block;font-size:12px}.ff15-question span{display:block;color:var(--ff15-muted);font-size:10px;margin-top:3px;line-height:1.35}.ff15-question button{border:0;border-radius:10px;background:#1c4773;color:#eaf5ff;padding:7px 9px;font-size:9px;font-weight:900}
  .ff15-list{display:grid;gap:8px}.ff15-item{display:grid;grid-template-columns:1fr auto auto;gap:9px;align-items:center;padding:11px;border:1px solid #223d5a;border-radius:14px;background:#0c2036}.ff15-item b{display:block;font-size:12px}.ff15-item small{display:block;color:var(--ff15-muted);font-size:9px;margin-top:3px}.ff15-value{text-align:right}.ff15-value strong{display:block;font-size:13px}.ff15-value span{display:block;font-size:9px;color:#92a9c2}.ff15-edit{border:0;background:transparent;color:#9ec9f8;font-size:18px;padding:5px}.ff15-badge{display:inline-flex;padding:5px 8px;border-radius:999px;font-size:8px;font-weight:900;background:#183a5f;color:#a7d1ff}.ff15-badge.good{background:#143f34;color:#73e0bd}.ff15-badge.warn{background:#4a3519;color:#ffd080}.ff15-badge.bad{background:#4a202b;color:#ff9ba5}.ff15-badge.muted{background:#273548;color:#a5b4c6}
  .ff15-upload{border:1px dashed #3b5d80;border-radius:16px;padding:18px;text-align:center;background:#0b1d31}.ff15-upload input{display:none}.ff15-upload label{display:inline-block;border-radius:12px;background:#1769c2;color:#fff;padding:10px 14px;font-weight:900;font-size:11px;cursor:pointer}.ff15-upload p{margin:9px 0 0;font-size:10px;color:#91a5bd}.ff15-files{display:grid;gap:7px;margin-top:10px}.ff15-file{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:9px 10px;border-radius:12px;background:#0b2038;border:1px solid #213d59}.ff15-file b{font-size:10px}.ff15-file span{font-size:8px;color:#8fa4bc}
  .ff15-table-wrap{overflow-x:auto}.ff15-table{width:100%;border-collapse:collapse;min-width:690px}.ff15-table th,.ff15-table td{padding:9px 8px;border-bottom:1px solid #223c58;text-align:right;font-size:10px;white-space:nowrap}.ff15-table th:first-child,.ff15-table td:first-child{text-align:left}.ff15-table th{color:#8fa5bd;font-size:8px;text-transform:uppercase;letter-spacing:.06em}.ff15-table tr:last-child td{border-bottom:0}.ff15-pos{color:#63ddb5}.ff15-neg{color:#ff909a}.ff15-note{padding:11px 12px;border-radius:13px;background:#0b1d32;border:1px solid #284666;color:#a8bdd4;font-size:10px;line-height:1.45;margin-top:10px}.ff15-note strong{color:#fff}
  .ff15-planned{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:13px;border-radius:15px;background:#171f30;border:1px solid #4a4b67}.ff15-planned b{display:block}.ff15-planned span{display:block;color:#a9a9c2;font-size:10px;margin-top:3px}
  .ff15-empty{padding:28px;text-align:center;border:1px solid #294664;border-radius:21px;background:#0d223a}.ff15-empty h2{margin:0 0 8px}.ff15-empty p{color:#9cb0c7;max-width:560px;margin:0 auto 16px;line-height:1.5}.ff15-actions{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
  .ff15-dialog{border:1px solid #31506f;border-radius:22px;background:#0c1f35;color:#eef5ff;padding:0;max-width:560px;width:calc(100% - 28px)}.ff15-dialog::backdrop{background:rgba(2,8,18,.72)}.ff15-dialog form{padding:18px}.ff15-dialog-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:15px}.ff15-dialog-head h3{margin:0}.ff15-dialog-head button{border:0;background:transparent;color:#fff;font-size:24px}.ff15-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.ff15-dialog label{display:block;color:#9fb2c8;font-size:10px;font-weight:800;margin-bottom:10px}.ff15-dialog input,.ff15-dialog select{display:block;width:100%;margin-top:5px;border:1px solid #31506f;border-radius:11px;background:#0a192b;color:#fff;padding:10px}.ff15-quick{display:flex;gap:6px;margin-top:6px}.ff15-quick button{border:1px solid #31506f;background:#102a48;color:#bddcff;border-radius:9px;padding:6px 9px;font-size:9px}.ff15-dialog-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:8px}.ff15-toast{position:fixed;left:50%;bottom:96px;z-index:12000;transform:translateX(-50%);max-width:88vw;padding:13px 17px;border-radius:15px;background:#0f2037;border:1px solid #32609a;color:#f6f9ff;font:800 13px system-ui;box-shadow:0 18px 50px rgba(4,16,34,.5)}
  @media(max-width:900px){.ff15-hero,.ff15-grid{grid-template-columns:1fr}.ff15-metrics{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:560px){.ff15{padding-bottom:90px}.ff15-panel,.ff15-card{padding:13px;border-radius:17px}.ff15-topline{flex-direction:column}.ff15-metrics{grid-template-columns:1fr 1fr}.ff15-metric strong{font-size:15px}.ff15-item{grid-template-columns:1fr auto}.ff15-edit{grid-column:2}.ff15-form-grid{grid-template-columns:1fr}.ff15-question{grid-template-columns:auto 1fr}.ff15-question button{grid-column:2;justify-self:start}.ff15-planned{align-items:flex-start;flex-direction:column}}
  `;
  document.head.appendChild(style);
}

function ensureDialog() {
  if (document.querySelector('#ff15Dialog')) return;
  document.body.insertAdjacentHTML('beforeend', `
  <dialog id="ff15Dialog" class="ff15-dialog">
    <form method="dialog" id="ff15Form">
      <div class="ff15-dialog-head"><div><small>MI FOTOGRAFÍA</small><h3 id="ff15DialogTitle">Actualizar dato</h3></div><button value="cancel" aria-label="Cerrar">×</button></div>
      <div class="ff15-form-grid">
        <label>Tipo<select id="ff15Kind"><option value="asset">Activo</option><option value="debt">Deuda</option><option value="income">Ingreso mensual</option></select></label>
        <label>Categoría<select id="ff15Category"><option value="bank">Banco</option><option value="cash">Efectivo</option><option value="broker">Broker</option><option value="fund">Fondo</option><option value="pension">Plan de pensiones</option><option value="property">Inmueble</option><option value="garage">Garaje</option><option value="mortgage">Hipoteca</option><option value="salary">Nómina</option><option value="rent">Alquiler</option><option value="other-asset">Otro</option></select></label>
      </div>
      <label>Nombre<input id="ff15Name" required maxlength="70"></label>
      <div class="ff15-form-grid">
        <label>Valor total (€)<input id="ff15Value" type="number" step="0.01" required></label>
        <label>Porcentaje que te corresponde<input id="ff15Ownership" type="number" min="0" max="100" step="0.01" required><span class="ff15-quick"><button type="button" data-share="100">100 %</button><button type="button" data-share="50">50 %</button><button type="button" data-share="33.33">33 %</button></span></label>
      </div>
      <div class="ff15-form-grid">
        <label>Fecha del dato<input id="ff15AsOf" type="date"></label>
        <label>Precisión<select id="ff15Precision"><option value="approximate">Aproximado</option><option value="confirmed">Confirmado manualmente</option><option value="documented">Documentado</option><option value="synced">Sincronizado</option><option value="provisional">Provisional</option></select></label>
      </div>
      <label>Fuente<input id="ff15Source" maxlength="90" placeholder="Manual, CSV, BBVA, extracto…"></label>
      <label>Nota<input id="ff15Note" maxlength="160"></label>
      <div class="ff15-form-grid">
        <label>Estado<select id="ff15Status"><option value="active">Activo</option><option value="planned">Previsto</option><option value="committed">Comprometido</option><option value="closed">Cerrado</option></select></label>
        <label>Disponibilidad<select id="ff15Usable"><option value="true">Incluido en patrimonio utilizable</option><option value="false">Excluido del patrimonio utilizable</option></select></label>
      </div>
      <div class="ff15-dialog-actions"><button class="ff15-btn soft" value="cancel">Cancelar</button><button id="ff15Save" class="ff15-btn primary" value="default">Guardar</button></div>
    </form>
  </dialog>`);
  document.querySelectorAll('[data-share]').forEach(btn => btn.addEventListener('click', () => { document.querySelector('#ff15Ownership').value = btn.dataset.share; }));
  document.querySelector('#ff15Form').addEventListener('submit', event => {
    event.preventDefault();
    try {
      const kind = document.querySelector('#ff15Kind').value;
      const existing = dialogContext?.item || {};
      const item = {
        ...existing,
        id: existing.id || `${kind}-${Date.now()}`,
        name: document.querySelector('#ff15Name').value.trim(),
        kind,
        category: document.querySelector('#ff15Category').value,
        value: Number(document.querySelector('#ff15Value').value || 0),
        ownership: Number(document.querySelector('#ff15Ownership').value || 100),
        asOf: document.querySelector('#ff15AsOf').value,
        precision: document.querySelector('#ff15Precision').value,
        source: document.querySelector('#ff15Source').value.trim() || 'Manual',
        note: document.querySelector('#ff15Note').value.trim(),
        status: document.querySelector('#ff15Status').value,
        usable: document.querySelector('#ff15Usable').value === 'true',
        liquidity: ['bank','cash'].includes(document.querySelector('#ff15Category').value),
        metadata: existing.metadata || {}
      };
      window.FFv15.upsertItem(kind, item);
      if (dialogContext?.questionId) window.FFv15.answerQuestion(dialogContext.questionId, { itemId:item.id, value:item.value, ownership:item.ownership });
      document.querySelector('#ff15Dialog').close();
      dialogContext = null;
      render();
      toast('Dato actualizado y guardado en este dispositivo.');
    } catch (error) { console.error(error); toast(error.message || 'No se pudo guardar.'); }
  });
}

function openEditor(kind = 'asset', item = null, questionId = '') {
  ensureDialog();
  dialogContext = { kind, item, questionId };
  const dialog = document.querySelector('#ff15Dialog');
  document.querySelector('#ff15DialogTitle').textContent = item ? `Actualizar ${item.name}` : 'Añadir dato';
  document.querySelector('#ff15Kind').value = item?.kind || kind;
  document.querySelector('#ff15Category').value = item?.category || (kind === 'debt' ? 'mortgage' : kind === 'income' ? 'salary' : 'bank');
  document.querySelector('#ff15Name').value = item?.name || '';
  document.querySelector('#ff15Value').value = item?.value ?? '';
  document.querySelector('#ff15Ownership').value = item?.ownership ?? 100;
  document.querySelector('#ff15AsOf').value = item?.asOf || new Date().toISOString().slice(0,10);
  document.querySelector('#ff15Precision').value = item?.precision || 'approximate';
  document.querySelector('#ff15Source').value = item?.source || 'Manual';
  document.querySelector('#ff15Note').value = item?.note || '';
  document.querySelector('#ff15Status').value = item?.status || 'active';
  document.querySelector('#ff15Usable').value = item?.usable === false ? 'false' : 'true';
  dialog.showModal();
}

function precisionBadge(item) {
  const map = {
    documented:['Documentado','good'], synced:['Sincronizado','good'], confirmed:['Confirmado','good'], approximate:['Aproximado','warn'], provisional:['Provisional','warn']
  };
  const [label, cls] = map[item.precision] || [item.precision || 'Sin clasificar','muted'];
  return `<span class="ff15-badge ${cls}">${esc(label)}</span>`;
}

function itemMarkup(item, view) {
  const factor = view === 'family' ? 1 : Number(item.ownership || 100) / 100;
  const attributed = Number(item.value || 0) * factor;
  const status = item.status === 'committed' ? '<span class="ff15-badge warn">Comprometido</span>' : item.status === 'planned' ? '<span class="ff15-badge muted">Previsto</span>' : precisionBadge(item);
  return `<div class="ff15-item"><div><b>${esc(item.name)}</b><small>${esc(item.category)} · ${pct(item.ownership)} · ${dateText(item.asOf)} · ${esc(item.source || 'Manual')}</small>${status}</div><div class="ff15-value"><strong>${money(attributed)}</strong><span>${view === 'personal' && Number(item.ownership) !== 100 ? `${money(item.value)} total` : esc(item.note || '')}</span></div><button class="ff15-edit" type="button" data-edit-kind="${esc(item.kind)}" data-edit-id="${esc(item.id)}" aria-label="Editar">⋯</button></div>`;
}

function questionsMarkup(profile) {
  const pending = profile.questions.filter(q => q.status !== 'resolved').sort((a,b) => ({high:0,medium:1,low:2}[a.priority] ?? 3) - ({high:0,medium:1,low:2}[b.priority] ?? 3));
  if (!pending.length) return '<div class="ff15-note"><strong>Fotografía al día.</strong> No hay preguntas pendientes.</div>';
  return pending.slice(0,7).map(q => `<div class="ff15-question"><i class="ff15-priority ${esc(q.priority)}"></i><div><b>${esc(q.title)}</b><span>${esc(q.description)}${q.dueDate ? ` · ${dateText(q.dueDate)}` : ''}</span></div><button type="button" data-question="${esc(q.id)}">${q.action === 'import-ibkr' ? 'Importar CSV' : q.action === 'activate-event' ? 'Revisar' : q.action === 'upload' ? 'Subir archivo' : 'Contestar'}</button></div>`).join('');
}

function auditMarkup(audit) {
  if (!audit) return '<div class="ff15-note">La auditoría de Interactive Brokers se incorporará cuando cargues tu configuración privada.</div>';
  const rows = (audit.annual || []).map(row => `<tr><td>${esc(row.year)}</td><td>${money(row.navFinal, 'EUR', 0)}</td><td class="${row.optionsRealized >= 0 ? 'ff15-pos':'ff15-neg'}">${money(row.optionsRealized, 'EUR', 0)}</td><td class="${row.assignedStockResult >= 0 ? 'ff15-pos':'ff15-neg'}">${money(row.assignedStockResult, 'EUR', 0)}</td><td class="${row.adjustedOptions >= 0 ? 'ff15-pos':'ff15-neg'}"><b>${money(row.adjustedOptions, 'EUR', 0)}</b></td><td>${money(row.commissions, 'EUR', 0)}</td><td>${number(row.putAssignments,0)}</td></tr>`).join('');
  return `<div class="ff15-metrics"><div class="ff15-metric"><small>Primas realizadas</small><strong>${money(audit.metrics?.grossOptions, 'EUR', 0)}</strong><span>2021–${esc(audit.asOf || '')}</span></div><div class="ff15-metric"><small>Resultado asignaciones</small><strong class="ff15-neg">${money(audit.metrics?.assignedStockResult, 'EUR', 0)}</strong><span>Acciones ya realizadas</span></div><div class="ff15-metric"><small>Opciones ajustadas</small><strong>${money(audit.metrics?.adjustedOptions, 'EUR', 0)}</strong><span>Criterio homogéneo</span></div><div class="ff15-metric"><small>Comisiones</small><strong class="ff15-neg">${money(audit.metrics?.commissions, 'EUR', 0)}</strong><span>Coste acumulado</span></div></div><div class="ff15-table-wrap"><table class="ff15-table"><thead><tr><th>Año</th><th>NAV final</th><th>Opciones IBKR</th><th>Acciones asignadas</th><th>Ajustado</th><th>Comisiones</th><th>Asignaciones</th></tr></thead><tbody>${rows}</tbody></table></div><div class="ff15-note"><strong>Auditoría provisional:</strong> ${esc(audit.note || 'La reconstrucción conserva las operaciones originales y marca las discrepancias pendientes.')}</div>`;
}

function attachmentsMarkup(state) {
  const files = (state.attachments || []).slice().reverse().slice(0,6);
  return files.length ? `<div class="ff15-files">${files.map(file => `<div class="ff15-file"><div><b>${esc(file.name)}</b><span>${esc(file.category)} · ${esc(file.status)}</span></div><span>${number(file.size/1024,0)} KB</span></div>`).join('')}</div>` : '';
}

function plannedMarkup(profile, view) {
  const planned = [...profile.assets, ...profile.debts].filter(x => x.status === 'planned');
  if (!planned.length) return '';
  const grouped = {};
  planned.forEach(item => { (grouped[item.eventId || item.id] ??= []).push(item); });
  return Object.entries(grouped).map(([eventId, items]) => {
    const asset = items.find(x => x.kind === 'asset');
    const debt = items.find(x => x.kind === 'debt');
    const date = asset?.effectiveDate || debt?.effectiveDate || '';
    const personalAsset = Number(asset?.value || 0) * (view === 'family' ? 1 : Number(asset?.ownership || 100)/100);
    const personalDebt = Number(debt?.value || 0) * (view === 'family' ? 1 : Number(debt?.ownership || 100)/100);
    const due = date && date <= new Date().toISOString().slice(0,10);
    return `<div class="ff15-planned"><div><b>${esc(asset?.name || debt?.name || 'Operación prevista')}</b><span>${dateText(date)} · impacto neto previsto ${money(personalAsset-personalDebt)}</span></div><button class="ff15-btn ${due ? 'primary':'soft'}" type="button" data-activate-event="${esc(eventId)}">${due ? 'Confirmar operación':'Ver previsión'}</button></div>`;
  }).join('');
}

function renderEmpty(root) {
  root.innerHTML = `<div class="ff15"><div class="ff15-empty"><h2>Construye tu fotografía financiera privada</h2><p>La aplicación pública no contiene tus cifras personales. Carga el archivo privado de configuración para precargar patrimonio, deudas, ingresos y la auditoría de Interactive Brokers. Los datos se guardan únicamente en este navegador.</p><div class="ff15-actions"><label class="ff15-btn primary" for="ff15EmptyFile">Cargar configuración privada</label><input id="ff15EmptyFile" type="file" accept="application/json,.json" hidden><button class="ff15-btn soft" type="button" data-add-item="asset">Empezar manualmente</button></div></div></div>`;
  root.querySelector('#ff15EmptyFile')?.addEventListener('change', handleFiles);
}

function render() {
  if (!active) return;
  injectStyles(); ensureDialog();
  const root = document.querySelector('#viewRoot');
  if (!root) return;
  const state = window.FFv15.state();
  if (!state.profile) { renderEmpty(root); return; }
  const profile = state.profile;
  const totals = window.FFv15.calculate(state, state.view);
  const view = state.view;
  const assets = profile.assets.filter(x => x.status !== 'planned');
  const debts = profile.debts.filter(x => x.status !== 'planned');
  root.innerHTML = `<div class="ff15">
    <section class="ff15-hero">
      <div class="ff15-panel"><div class="ff15-topline"><div><small>MI FOTOGRAFÍA FINANCIERA</small><h2>${esc(profile.displayName || 'Tu patrimonio')}</h2><p>${view === 'personal' ? 'Valores ajustados por tu porcentaje de propiedad.' : 'Valores completos de los activos y deudas familiares conocidos.'}</p></div><div class="ff15-view-toggle"><button type="button" data-set-view="personal" class="${view==='personal'?'active':''}">Mi patrimonio</button><button type="button" data-set-view="family" class="${view==='family'?'active':''}">Familiar</button></div></div>
      <div class="ff15-metrics"><div class="ff15-metric"><small>Patrimonio neto</small><strong>${money(totals.netWorth)}</strong><span>Activos menos deudas</span></div><div class="ff15-metric"><small>Patrimonio utilizable</small><strong>${money(totals.usableNetWorth)}</strong><span>Excluye lo comprometido</span></div><div class="ff15-metric"><small>Liquidez conocida</small><strong>${money(totals.liquidity)}</strong><span>No incluye margen de IBKR</span></div><div class="ff15-metric"><small>Ingresos equivalentes</small><strong>${money(totals.monthlyEquivalentIncome)}</strong><span>Promedio mensual anualizado</span></div></div></div>
      <aside class="ff15-panel"><small>CALIDAD DE LOS DATOS</small><h3>${number(totals.completion)} % completado</h3><div class="ff15-progress"><i style="width:${Math.min(100,totals.completion)}%"></i></div><p>${totals.unresolvedQuestions.length} preguntas pendientes. Las cifras aproximadas se conservan hasta que subas una fuente mejor.</p><button class="ff15-btn primary" type="button" data-scroll-questions>Completar siguiente dato</button></aside>
    </section>
    <section class="ff15-grid"><div class="ff15-card" id="ff15Questions"><div class="ff15-section-head"><div><h3>Para completar ahora</h3><p>La app prioriza los datos que más cambian el diagnóstico.</p></div><button type="button" data-add-item="asset">＋ Añadir</button></div>${questionsMarkup(profile)}</div>
    <div class="ff15-card"><h3>Operaciones previstas</h3><p>No entran en el patrimonio hasta que confirmes que se han realizado.</p>${plannedMarkup(profile,view) || '<div class="ff15-note">No hay operaciones futuras registradas.</div>'}</div></section>
    <section class="ff15-grid"><div class="ff15-card"><div class="ff15-section-head"><div><h3>Activos</h3><p>Importes atribuibles en la vista seleccionada.</p></div><span class="ff15-badge good">${money(totals.assets)}</span></div><div class="ff15-list">${assets.map(x => itemMarkup(x,view)).join('')}</div></div>
    <div class="ff15-card"><div class="ff15-section-head"><div><h3>Deudas</h3><p>Las hipotecas se ajustan por porcentaje de responsabilidad.</p></div><span class="ff15-badge bad">${money(totals.debts)}</span></div><div class="ff15-list">${debts.map(x => itemMarkup(x,view)).join('')}</div></div></section>
    <section class="ff15-card" style="margin-bottom:14px"><div class="ff15-section-head"><div><h3>Interactive Brokers · auditoría 2021–2026</h3><p>Primas, acciones asignadas, comisiones y resultado ajustado.</p></div><button class="ff15-btn soft" type="button" data-sync-ibkr>Sincronizar fotografía</button></div>${auditMarkup(profile.ibkrAudit)}</section>
    <section class="ff15-grid"><div class="ff15-card"><h3>Subir archivos o pantallazos</h3><p>Los CSV de IBKR se importan. Para PDF e imágenes guardamos la referencia y te pedimos confirmar el dato; todavía no se suben a ningún servidor.</p><div class="ff15-upload"><label for="ff15File">Seleccionar archivos</label><input id="ff15File" type="file" multiple accept=".json,.csv,.pdf,.xlsx,image/*"><p>CSV · PDF · Excel · PNG · JPG. Puedes seleccionar varios CSV de IBKR.</p></div>${attachmentsMarkup(state)}</div>
    <div class="ff15-card"><h3>Tu plan de opciones</h3><p>Reglas personales utilizadas para evaluar el riesgo, no recomendaciones.</p><div class="ff15-list"><div class="ff15-item"><div><b>Cartera objetivo</b><small>Capital deseado para operar con comodidad</small></div><div class="ff15-value"><strong>${money(profile.goals?.portfolioTarget || 0)}</strong></div></div><div class="ff15-item"><div><b>Objetivo mensual</b><small>Ingresos de la estrategia de opciones</small></div><div class="ff15-value"><strong>${money(profile.goals?.monthlyOptionsTarget || 0)}</strong></div></div><div class="ff15-item"><div><b>Capital máximo desplegado</b><small>Regla personal aproximada</small></div><div class="ff15-value"><strong>${pct(profile.goals?.maxDeploymentPct || 0)}</strong></div></div></div><div class="ff15-note"><strong>Importante:</strong> el resultado ajustado descuenta las pérdidas o ganancias de acciones que proceden de asignaciones. Las posiciones aún abiertas se muestran aparte y no se dan por realizadas.</div></div></section>
    <div class="ff15-actions"><button class="ff15-btn soft" type="button" data-export-profile>Exportar copia privada</button><button class="ff15-btn soft" type="button" data-add-item="asset">Añadir otro dato</button></div>
  </div>`;
  root.querySelector('#ff15File')?.addEventListener('change', handleFiles);
}

function findItem(kind, id) {
  const profile = window.FFv15.state().profile;
  return kind === 'asset' ? profile.assets.find(x => x.id === id) : kind === 'debt' ? profile.debts.find(x => x.id === id) : profile.incomes.find(x => x.id === id);
}

async function handleFiles(event) {
  const files = [...(event.target.files || [])];
  if (!files.length) return;
  for (const file of files) {
    try {
      const lower = file.name.toLowerCase();
      if (lower.endsWith('.json')) {
        window.FFv15.importBundle(JSON.parse(await file.text()), file.name);
        toast('Configuración privada cargada.');
      } else if (lower.endsWith('.csv')) {
        const text = await file.text();
        if (/Interactive Brokers|Activity Statement|Estado de actividad|Statement,Header/i.test(text) || /^U\d+_/i.test(file.name)) {
          const result = window.FFv15.importIBKRCSV(text, file.name);
          toast(`${file.name}: ${result.added || 0} opciones y ${result.stockAdded || 0} movimientos nuevos.`);
        } else {
          window.FFv15.registerAttachment({ name:file.name, type:file.type, size:file.size, category:'csv', status:'pending-review' });
          toast(`${file.name}: pendiente de clasificar.`);
        }
      } else {
        window.FFv15.registerAttachment({ name:file.name, type:file.type, size:file.size, category:lower.endsWith('.pdf')?'pdf':lower.endsWith('.xlsx')?'spreadsheet':'image', status:'pending-review' });
        toast(`${file.name}: adjuntado para revisión manual.`);
      }
    } catch (error) { console.error(error); toast(`${file.name}: ${error.message || 'no se pudo procesar'}`); }
  }
  event.target.value = '';
  render();
}

function openView() {
  active = true;
  document.querySelectorAll('[data-view]').forEach(btn => btn.classList.toggle('active', btn.dataset.view === 'photo'));
  render();
}

function injectNav() {
  document.querySelectorAll('.desktop-nav').forEach(nav => {
    if (!nav.querySelector('[data-view="photo"]')) {
      const button = document.createElement('button'); button.type = 'button'; button.dataset.view = 'photo'; button.textContent = 'Mi fotografía';
      const wealth = nav.querySelector('[data-view="wealth"]'); wealth?.after(button) || nav.appendChild(button);
    }
  });
  document.querySelectorAll('.mobile-nav').forEach(nav => {
    if (!nav.querySelector('[data-view="photo"]')) {
      const button = document.createElement('button'); button.type = 'button'; button.dataset.view = 'photo'; button.innerHTML = '<span>◫</span>Mi foto';
      const wealth = nav.querySelector('[data-view="wealth"]'); wealth?.after(button) || nav.appendChild(button);
    }
  });
}

function exportProfile() {
  const bundle = window.FFv15.exportBundle();
  const blob = new Blob([JSON.stringify(bundle,null,2)], {type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `finanzasfacil-copia-${new Date().toISOString().slice(0,10)}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

document.addEventListener('click', event => {
  const photo = event.target.closest?.('[data-view="photo"]');
  if (photo) { event.preventDefault(); event.stopImmediatePropagation(); openView(); return; }
  const otherView = event.target.closest?.('[data-view]:not([data-view="photo"])');
  if (otherView) active = false;
  if (!active) return;
  const target = event.target.closest?.('button,[data-add-item]'); if (!target) return;
  if (target.dataset.setView) { window.FFv15.setView(target.dataset.setView); render(); }
  else if (target.dataset.editId) { const item = findItem(target.dataset.editKind, target.dataset.editId); if (item) openEditor(target.dataset.editKind,item); }
  else if (target.dataset.addItem) openEditor(target.dataset.addItem);
  else if (target.dataset.scrollQuestions !== undefined) document.querySelector('#ff15Questions')?.scrollIntoView({behavior:'smooth'});
  else if (target.dataset.syncIbkr !== undefined) { try { window.FFv15.syncIBKRFromOptions(); render(); toast('Fotografía de IBKR sincronizada.'); } catch(error) { toast(error.message); } }
  else if (target.dataset.exportProfile !== undefined) exportProfile();
  else if (target.dataset.activateEvent) {
    const state = window.FFv15.state();
    const items = [...state.profile.assets,...state.profile.debts].filter(x => x.eventId === target.dataset.activateEvent);
    const date = items.map(x => x.effectiveDate).filter(Boolean).sort().at(0) || '';
    if (date && date > new Date().toISOString().slice(0,10)) { toast(`Está previsto para ${dateText(date)}. Todavía no se incluirá en el patrimonio.`); }
    else if (confirm('¿Confirmas que la operación se ha completado?')) { window.FFv15.activateEvent(target.dataset.activateEvent); render(); toast('Operación activada.'); }
  }
  else if (target.dataset.question) {
    const state = window.FFv15.state(); const q = state.profile.questions.find(x => x.id === target.dataset.question); if (!q) return;
    if (q.action === 'import-ibkr' || q.action === 'upload') document.querySelector('#ff15File')?.click();
    else if (q.action === 'activate-event') {
      const button = document.querySelector(`[data-activate-event="${CSS.escape(q.linkedId)}"]`); button?.click();
    } else {
      const item = q.kind && q.linkedId ? findItem(q.kind,q.linkedId) : null;
      openEditor(q.kind || 'asset', item, q.id);
    }
  }
}, true);

window.addEventListener('ff:v15-data', () => { if (active) setTimeout(render,0); });
const observer = new MutationObserver(() => { injectNav(); if (active && !document.querySelector('#viewRoot .ff15')) render(); });
observer.observe(document.documentElement, { childList:true, subtree:true });
setInterval(injectNav, 1500);
setTimeout(() => {
  injectStyles(); ensureDialog(); injectNav();
  const params = new URLSearchParams(location.search);
  if (params.get('foto') === '1' || params.get('v15') === '1') openView();
}, 700);
})();
