(() => {
  const HELP = {
    name: ['¿Cómo quieres que te llamemos?', 'Escribe el nombre que quieres ver en la aplicación. No hace falta poner apellidos.', 'Luis'],
    goalTarget: ['¿Cuánto quieres conseguir?', 'Es la cantidad final que te gustaría alcanzar, no lo que tienes hoy.', 'Para llegar a 500.000 €, escribe 500000.'],
    goalCurrent: ['¿Cuánto llevas ya?', 'Es la parte de tu objetivo que ya has conseguido. Si empiezas desde cero, escribe 0.', 'Tienes 35.000 € para una entrada de 90.000 €: escribe 35000.'],
    contribution: ['¿Cuánto puedes añadir cada mes?', 'Pon una cantidad que puedas mantener en un mes normal.', 'Si normalmente puedes ahorrar 800 €, escribe 800.'],
    horizon: ['¿Cuántos años tienes por delante?', 'Es el tiempo aproximado que te das para conseguir el objetivo.', 'Te gustaría conseguirlo en 15 años: escribe 15.'],
    frequency: ['¿Cada cuánto quieres revisar?', 'Elige cuándo te gustaría sentarte a mirar cómo van tus finanzas.', 'Semanal si inviertes activamente; mensual si lo haces a largo plazo.'],
    detail: ['¿Cuánta información quieres ver?', 'Esencial muestra solo lo importante. Completo añade explicaciones. Avanzado muestra más métricas.', 'Elige Esencial si los gráficos financieros te abruman.'],
    products: ['¿Qué cosas debo incluir?', 'Marca todo lo que forme parte de tu dinero, aunque el valor sea aproximado.', 'Cuenta bancaria, fondos, vivienda e hipoteca.'],
    productValue: ['¿Qué valor aproximado pongo?', 'Escribe cuánto vale hoy ese grupo. No hace falta acertar hasta el último euro.', 'Todos tus fondos suman unos 42.000 €: escribe 42000.'],
    rent: ['¿Qué alquiler mensual pongo?', 'Escribe lo que cobras normalmente cada mes por tus inmuebles.', 'Dos alquileres de 550 € y 860 €: escribe 1410.'],
    liquidity: ['¿Qué significa dinero disponible?', 'Es el dinero que puedes usar sin vender inversiones: cuentas, efectivo o productos muy líquidos.', 'Si quieres conservar 30 € disponibles por cada 100 €, escribe 30.'],
    concentration: ['¿Qué significa concentración?', 'Es cuánto permites que una sola inversión pese dentro de todo tu patrimonio financiero.', 'Con un límite del 25 %, ninguna posición debería superar 25 € de cada 100 €.'],
    itemName: ['¿Qué nombre le pongo?', 'Usa un nombre que te permita reconocerlo enseguida.', 'Interactive Brokers, Piso de Postas o Hipoteca Moreras.'],
    itemType: ['¿Qué tipo elijo?', 'Elige la categoría que mejor describe lo que vas a añadir.', 'Para una vivienda, Inmueble. Para lo que debes al banco, Hipoteca o deuda.'],
    itemValue: ['¿Qué valor tengo que escribir?', 'Pon lo que vale hoy. Si es una deuda, escribe lo que todavía debes como número positivo.', 'Vivienda: 180000. Hipoteca pendiente: 95000.'],
    itemIncome: ['¿Qué ingreso mensual pongo?', 'Solo escribe algo si este activo te paga dinero cada mes. Si no, deja 0.', 'Un piso alquilado por 860 €: escribe 860.'],
    itemOwner: ['¿Qué significa titular?', 'Indica a quién pertenece: a ti, a tu pareja o a ambos.', 'Luis, Inés o Familiar.'],
    movementKind: ['¿Qué cambio ha ocurrido?', 'Elige si añadiste dinero, si cambió el valor, si retiraste dinero o si cobraste un ingreso.', 'Compraste fondos con 500 € nuevos: He añadido dinero.'],
    movementAmount: ['¿Qué cantidad escribo?', 'Pon solo el importe del cambio, no el valor total de la cuenta.', 'Aportaste 800 € este mes: escribe 800.'],
    movementDate: ['¿Qué fecha elijo?', 'Pon el día en que ocurrió para que aparezca en el mes correcto.', 'La transferencia llegó el 1 de agosto: selecciona ese día.'],
    movementNote: ['¿Para qué sirve la nota?', 'Es una frase corta para recordar de dónde salió el movimiento. Es opcional.', 'Aportación mensual a MyInvestor.'],
    goalName: ['¿Cómo llamo a mi objetivo?', 'Escribe una frase corta que te motive y deje claro qué quieres conseguir.', 'Alcanzar 500.000 € de patrimonio.'],
    goalDeadline: ['¿Qué fecha objetivo pongo?', 'Es el momento en que te gustaría llegar. Puede ser aproximado.', '31 de diciembre de 2040.'],
    goalLinked: ['¿Qué significa calcularlo automáticamente?', 'Si lo activas, la app utilizará tu patrimonio neto como progreso.', 'Para un objetivo de patrimonio total, déjalo activado.']
  };
  const ITEM_COPY = {
    cash: ['Nombre de la cuenta', 'Ej. Cuenta Sabadell', 'Saldo que hay ahora (€)', 'Intereses mensuales aproximados (€)', 'Escribe el saldo actual de la cuenta.'],
    funds: ['Nombre del fondo o cartera', 'Ej. MyInvestor indexados', 'Valor actual de la inversión (€)', 'Ingresos mensuales (€)', 'Escribe cuánto vale hoy, no solo lo que aportaste.'],
    stocks: ['Nombre de la acción o cartera', 'Ej. Cartera de acciones', 'Valor actual de las acciones (€)', 'Dividendos mensuales medios (€)', 'Puedes añadir toda la cartera junta o cada posición por separado.'],
    options: ['Nombre de la cuenta de opciones', 'Ej. IBKR opciones', 'Valor neto actual de la cuenta (€)', 'Prima mensual media (€)', 'Introduce el valor neto de la cuenta. Más adelante separaremos primas, margen y asignaciones.'],
    crypto: ['Nombre de la cartera cripto', 'Ej. Coinbase', 'Valor actual de las criptomonedas (€)', 'Ingresos mensuales (€)', 'Escribe el valor actual aproximado.'],
    pension: ['Nombre del plan de pensiones', 'Ej. Plan de pensiones', 'Valor actual del plan (€)', 'Ingreso mensual actual (€)', 'Escribe el valor que aparece hoy en la entidad.'],
    realestate: ['Nombre del inmueble', 'Ej. Piso de Postas', 'Valor aproximado del inmueble (€)', 'Alquiler mensual cobrado (€)', 'Escribe el valor estimado. La hipoteca se añade aparte como deuda.'],
    debt: ['Nombre de la deuda o hipoteca', 'Ej. Hipoteca Moreras', 'Cantidad que todavía debes (€)', 'Ingreso mensual (€)', 'Escribe lo que queda por pagar como número positivo. La app lo restará.'],
    other: ['Nombre del activo', 'Ej. Participación en empresa', 'Valor aproximado actual (€)', 'Ingreso mensual que produce (€)', 'Usa una estimación prudente del valor actual.']
  };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  let celebrationTimer;
  const css = `
body.modal-open{overflow:hidden;touch-action:none}.field-title{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:24px;color:var(--muted);font-size:12px;font-weight:800}.info-button{flex:0 0 auto;display:inline-grid;place-items:center;width:24px;height:24px;padding:0;border:1px solid rgba(40,120,240,.24);border-radius:50%;color:var(--blue);background:rgba(40,120,240,.08);font-size:12px;font-weight:900;line-height:1}.info-button:active{transform:scale(.9);background:var(--blue);color:#fff}.inline-help{display:inline-flex;align-items:center;margin-left:4px;padding:3px 7px;border:0;border-radius:999px;color:var(--blue);background:rgba(40,120,240,.09);font-size:12px;font-weight:800;text-decoration:underline}.product-value-row{grid-template-columns:minmax(0,1fr) 26px minmax(105px,.65fr)!important;align-items:center}.success-pulse{animation:successTrack .65s ease}@keyframes successTrack{50%{box-shadow:0 0 0 9px rgba(255,134,19,.13);transform:scaleY(1.8)}}
.modal{max-height:calc(100dvh - 18px);overflow:hidden;margin:auto}.modal form{display:flex;flex-direction:column;max-height:calc(100dvh - 18px);overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:0 25px}.modal-head{position:sticky;top:0;z-index:3;margin:0 -25px 18px;padding:23px 25px 15px;background:var(--panel);border-bottom:1px solid var(--line)}.modal-actions{position:sticky;bottom:0;z-index:3;margin:8px -25px 0;padding:14px 25px calc(14px + env(safe-area-inset-bottom));background:var(--panel);border-top:1px solid var(--line)}
.help-modal{width:min(480px,calc(100% - 20px));padding:0;border:0;border-radius:28px;background:transparent;color:var(--ink);overflow:visible}.help-modal::backdrop{background:rgba(2,12,29,.64);backdrop-filter:blur(10px)}.help-sheet{position:relative;padding:29px;border:1px solid var(--line);border-radius:28px;background:var(--panel);box-shadow:0 35px 120px rgba(8,42,92,.34);animation:helpIn .32s cubic-bezier(.2,.85,.2,1)}@keyframes helpIn{from{opacity:0;transform:translateY(18px) scale(.96)}}.help-sheet .close{position:absolute;top:14px;right:14px}.help-icon{display:grid;place-items:center;width:46px;height:46px;margin-bottom:18px;border-radius:50%;color:#fff;background:linear-gradient(145deg,var(--blue),var(--navy));font-size:24px;font-weight:900}.help-sheet h2{margin:4px 0 12px;font-size:28px;line-height:1.05}.help-sheet>p:not(.eyebrow){margin:0;color:var(--muted);font-size:16px;line-height:1.55}.help-example{margin:20px 0;padding:16px;border:1px solid rgba(255,134,19,.18);border-radius:17px;background:rgba(255,134,19,.07)}.help-example strong{display:block;margin-bottom:5px;color:var(--orange);font-size:11px;letter-spacing:.11em}.help-example span{font-size:14px;line-height:1.45}.help-understood{width:100%}
.celebration{position:fixed;inset:0;z-index:200;display:grid;place-items:center;padding:22px;pointer-events:none;opacity:0;visibility:hidden;transition:.2s}.celebration.show{opacity:1;visibility:visible}.celebration-card{position:relative;min-width:min(360px,calc(100vw - 40px));max-width:440px;padding:26px 28px;border:1px solid rgba(255,255,255,.48);border-radius:25px;color:#fff;background:linear-gradient(145deg,#082a5c,#0d4e9e 64%,#ff8613 160%);box-shadow:0 28px 90px rgba(3,20,49,.44);text-align:center;transform:translateY(18px) scale(.92);opacity:0}.celebration.show .celebration-card{animation:celebrateIn .7s cubic-bezier(.15,.9,.2,1) forwards}@keyframes celebrateIn{0%{opacity:0;transform:translateY(25px) scale(.85)}55%{opacity:1;transform:translateY(-4px) scale(1.035)}100%{opacity:1;transform:none}}.celebration-icon{display:grid;place-items:center;width:68px;height:68px;margin:-3px auto 14px;border-radius:50%;color:#fff;background:linear-gradient(145deg,#ffad35,#ff7410);font-size:34px;box-shadow:0 12px 30px rgba(255,117,16,.34),0 0 0 10px rgba(255,255,255,.08)}.celebration-card strong{display:block;font-size:26px}.celebration-card p{margin:8px auto 0;max-width:330px;color:rgba(255,255,255,.78);font-size:14px;line-height:1.45}.celebration-confetti{position:absolute;inset:0;overflow:hidden}.celebration-confetti i{position:absolute;left:var(--x);top:42%;width:8px;height:14px;border-radius:3px;background:var(--orange);opacity:0}.celebration-confetti i:nth-child(3n){background:var(--blue2)}.celebration-confetti i:nth-child(3n+1){background:#ffd23f}.celebration-confetti i:nth-child(3n+2){background:#19c998}.celebration.show .celebration-confetti i{animation:confettiFly .8s var(--d) ease-out forwards}@keyframes confettiFly{0%{opacity:1;transform:translateY(0) rotate(0)}100%{opacity:0;transform:translateY(-170px) translateX(calc((var(--x) - 50%) * 2)) rotate(var(--r))}}
@media(max-width:620px){.modal{width:calc(100% - 12px);max-height:calc(100dvh - 10px)}.modal form{max-height:calc(100dvh - 10px);padding:0 18px}.modal-head{margin:0 -18px 16px;padding:20px 18px 14px}.modal-actions{margin-left:-18px;margin-right:-18px;padding-left:18px;padding-right:18px}.modal-actions .primary{flex:1}.help-modal{align-self:end;margin:0 auto 6px;width:calc(100% - 12px)}.help-sheet{padding:27px 22px calc(22px + env(safe-area-inset-bottom))}.product-value-row{grid-template-columns:minmax(0,1fr) 24px 110px!important}}
`;
  function injectUi() {
    if (!$('#v03Styles')) { const s = document.createElement('style'); s.id = 'v03Styles'; s.textContent = css; document.head.appendChild(s); }
    if (!$('#helpDialog')) document.body.insertAdjacentHTML('beforeend', `<dialog id="helpDialog" class="help-modal"><div class="help-sheet"><button class="close" type="button" data-close-dialog="helpDialog">×</button><span class="help-icon">i</span><p class="eyebrow">EXPLICADO FÁCIL</p><h2 id="helpTitle"></h2><p id="helpText"></p><div class="help-example"><strong>EJEMPLO</strong><span id="helpExample"></span></div><button class="primary help-understood" type="button" data-close-dialog="helpDialog">Entendido</button></div></dialog>`);
    if (!$('#celebration')) document.body.insertAdjacentHTML('beforeend', `<div id="celebration" class="celebration" aria-hidden="true"><div class="celebration-confetti"></div><div class="celebration-card"><span id="celebrationIcon" class="celebration-icon">✓</span><strong id="celebrationTitle">¡Perfecto!</strong><p id="celebrationText"></p></div></div>`);
  }
  function decorateLabel(input, text, key) {
    if (!input || input.dataset.v03Decorated) return;
    const parent = input.closest('label,.field'); if (!parent) return;
    input.dataset.v03Decorated = '1';
    [...parent.childNodes].filter(n => n !== input).forEach(n => n.remove());
    parent.insertAdjacentHTML('afterbegin', `<span class="field-title"><span>${text}</span><button class="info-button" type="button" data-help="${key}">i</button></span>`);
    parent.appendChild(input);
  }
  function decorateStaticForms() {
    decorateLabel($('#itemName'), 'Nombre de la cuenta o activo', 'itemName');
    decorateLabel($('#itemType'), '¿Qué es?', 'itemType');
    decorateLabel($('#itemValue'), 'Valor actual aproximado (€)', 'itemValue');
    decorateLabel($('#itemIncome'), 'Ingreso mensual que produce (€)', 'itemIncome');
    decorateLabel($('#itemOwner'), '¿De quién es?', 'itemOwner');
    decorateLabel($('#movementKind'), '¿Qué ha ocurrido?', 'movementKind');
    decorateLabel($('#movementAmount'), '¿Cuánto dinero?', 'movementAmount');
    decorateLabel($('#movementDate'), '¿Qué día ocurrió?', 'movementDate');
    decorateLabel($('#movementNote'), 'Una nota para recordarlo', 'movementNote');
    decorateLabel($('#goalName'), '¿Cómo llamamos a tu objetivo?', 'goalName');
    decorateLabel($('#goalTarget'), '¿Cuánto quieres alcanzar?', 'goalTarget');
    decorateLabel($('#goalContribution'), '¿Cuánto añadirás cada mes?', 'contribution');
    decorateLabel($('#goalDeadline'), '¿Para cuándo te gustaría?', 'goalDeadline');
    decorateLabel($('#goalCurrent'), '¿Cuánto llevas ya?', 'goalCurrent');
    decorateLabel($('#ruleLiquidity'), 'Dinero disponible mínimo (%)', 'liquidity');
    decorateLabel($('#ruleConcentration'), 'Máximo en una sola inversión (%)', 'concentration');
    $$('dialog.modal').forEach(d => {
      const close = $('.modal-head .close', d); if (close) { close.type = 'button'; close.removeAttribute('value'); close.dataset.closeDialog = d.id; }
      const cancel = $$('.modal-actions .ghost', d).find(b => /cancelar/i.test(b.textContent)); if (cancel) { cancel.type = 'button'; cancel.removeAttribute('value'); cancel.dataset.closeDialog = d.id; }
    });
    const storyClose = $('.story-close'); if (storyClose) { storyClose.dataset.closeDialog = 'storyDialog'; storyClose.removeAttribute('data-action'); }
    if ($('#saveItemButton')) $('#saveItemButton').textContent = 'Guardar y cerrar';
    updateItemCopy();
  }
  function decorateOnboarding() {
    decorateLabel($('#draftName'), '¿Cómo quieres que te llamemos?', 'name');
    decorateLabel($('#draftTarget'), '¿Cuánto quieres alcanzar?', 'goalTarget');
    decorateLabel($('#draftCurrent'), '¿Cuánto llevas ya?', 'goalCurrent');
    decorateLabel($('#draftContribution'), '¿Cuánto puedes añadir cada mes?', 'contribution');
    decorateLabel($('#draftHorizon'), '¿En cuántos años te gustaría conseguirlo?', 'horizon');
    decorateLabel($('#draftFrequency'), '¿Cada cuánto quieres revisarlo?', 'frequency');
    decorateLabel($('#draftDetail'), '¿Cuánta información quieres ver?', 'detail');
    decorateLabel($('#draftPassiveIncome'), '¿Cuánto alquiler cobras cada mes?', 'rent');
    decorateLabel($('#draftLiquidity'), 'Dinero disponible mínimo (%)', 'liquidity');
    decorateLabel($('#draftConcentration'), 'Máximo en una sola inversión (%)', 'concentration');
    const lead = $('#onboardingContent .lead');
    if (lead && $('#draftPassiveIncome') === null && $('.product-grid') && !$('.inline-help', lead)) lead.insertAdjacentHTML('beforeend', ' <button class="inline-help" type="button" data-help="products">¿Qué debo incluir?</button>');
    $$('.product-value-row').forEach(row => { if (!$('.info-button', row)) { const input = $('input', row); input?.insertAdjacentHTML('beforebegin','<button class="info-button" type="button" data-help="productValue">i</button>'); } });
  }
  function openHelp(key) { const h = HELP[key]; if (!h) return; $('#helpTitle').textContent=h[0]; $('#helpText').textContent=h[1]; $('#helpExample').textContent=h[2]; openDialog($('#helpDialog')); navigator.vibrate?.(5); }
  function openDialog(d) { if (!d) return; try { if (!d.open) d.showModal(); } catch { d.setAttribute('open',''); } document.body.classList.add('modal-open'); }
  function closeDialog(d) { if (!d) return; try { d.open && d.close ? d.close() : d.removeAttribute('open'); } catch { d.removeAttribute('open'); } if (!$$('dialog[open]').length) document.body.classList.remove('modal-open'); }
  function updateItemCopy() { const type=$('#itemType')?.value||'cash', c=ITEM_COPY[type]||ITEM_COPY.other; if (!c) return; const fields=[['#itemName',c[0]],['#itemValue',c[2]],['#itemIncome',c[3]]]; fields.forEach(([sel,text])=>{const input=$(sel), title=input?.closest('label')?.querySelector('.field-title>span'); if(title) title.textContent=text;}); if($('#itemName')) $('#itemName').placeholder=c[1]; const help=$('#itemDialog .form-help'); if(help) help.textContent=c[4]; }
  function celebrate(title,text,icon='✓',duration=1050){const l=$('#celebration');if(!l)return;$('#celebrationTitle').textContent=title;$('#celebrationText').textContent=text;$('#celebrationIcon').textContent=icon;l.classList.remove('show');void l.offsetWidth;l.classList.add('show');l.setAttribute('aria-hidden','false');$('.celebration-confetti').innerHTML=Array.from({length:20},(_,i)=>`<i style="--x:${i*37%100}%;--d:${i%7*32}ms;--r:${i*53%280-140}deg"></i>`).join('');navigator.vibrate?.([12,35,18]);clearTimeout(celebrationTimer);celebrationTimer=setTimeout(()=>{l.classList.remove('show');l.setAttribute('aria-hidden','true')},duration)}
  function setup() {
    injectUi(); decorateStaticForms(); decorateOnboarding();
    new MutationObserver(decorateOnboarding).observe($('#onboardingContent'), {childList:true,subtree:true});
    $('#itemType')?.addEventListener('change', updateItemCopy);
    $$('dialog').forEach(d=>{d.addEventListener('click',e=>{if(e.target===d)closeDialog(d)});d.addEventListener('cancel',e=>{e.preventDefault();closeDialog(d)})});
    document.addEventListener('click', e=>{const h=e.target.closest('[data-help]');if(h){e.preventDefault();e.stopPropagation();openHelp(h.dataset.help);return}const c=e.target.closest('[data-close-dialog]');if(c){e.preventDefault();e.stopPropagation();closeDialog(document.getElementById(c.dataset.closeDialog)||c.closest('dialog'));}}, true);
    let beforeStep='';
    $('#nextButton')?.addEventListener('click',()=>{beforeStep=$('#stepCount')?.textContent||'';setTimeout(()=>{const after=$('#stepCount')?.textContent||'';if(after!==beforeStep||$('#onboarding')?.classList.contains('hidden')){const n=parseInt(beforeStep)||1,m=[['¡Objetivo claro!','Ya sabemos hacia dónde quieres ir.','🎯'],['¡Ritmo definido!','Tu plan empieza a tener forma.','🚀'],['¡Foto financiera lista!','Ya sabemos qué debe controlar tu panel.','🧩'],['¡Sistema preparado!','Tus reglas personales quedan guardadas.','✨']][n-1];m&&celebrate(...m,850);$('.progress-track')?.classList.add('success-pulse');setTimeout(()=>$('.progress-track')?.classList.remove('success-pulse'),700)}},100)},true);
    const successForm=(id,title,text,icon)=>$(id)?.addEventListener('submit',()=>setTimeout(()=>{if(!$(id).closest('dialog')?.open)celebrate(title,text,icon,1150)},120),true);
    successForm('#itemForm','¡Patrimonio actualizado!','El dato ya forma parte de tu fotografía financiera.','✨');
    successForm('#movementForm','¡Mes actualizado!','El cambio ya aparece en tu resumen financiero.','↗');
    successForm('#goalForm','¡Objetivo guardado!','Tu panel y las proyecciones se han actualizado.','🎯');
    successForm('#rulesForm','¡Reglas guardadas!','Vigilaremos esos límites por ti.','🛡️');
  }
  const timer=setInterval(()=>{if($('#onboardingContent')?.children.length){clearInterval(timer);setup()}},50);
  setTimeout(()=>{clearInterval(timer);if(!$('#v03Styles'))setup()},5000);
})();
