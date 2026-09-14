const days=[
{n:1,place:'Medellín',title:'Llegada y aterrizaje suave',text:'Llegada desde Madrid. Hotel, piscina si apetece, cena tranquila y descanso.',chips:['✈️ llegada','😴 suave']},
{n:2,place:'Medellín',title:'Ciudad + Metro + Metrocable',text:'Primer contacto con Medellín sin correr. Vistas desde el Metrocable y tarde flexible.',chips:['🚡 Metrocable','👧 familiar']},
{n:3,place:'Medellín',title:'Guatapé y embalse',text:'Excursión de día completo con conductor. Pueblo, embalse y Piedra del Peñol solo si apetece.',chips:['🚗 excursión','🚤 embalse']},
{n:4,place:'Eje Cafetero',title:'Vuelo a Pereira + finca',text:'Cambio total de ambiente. Traslado a una finca/lodge cerca de Salento y tarde tranquila.',chips:['✈️ vuelo corto','🌿 naturaleza']},
{n:5,place:'Eje Cafetero',title:'Valle de Cocora + Salento',text:'Jeep Willys, paseo familiar entre palmas de cera, comida y tarde en Salento.',chips:['🌴 Cocora','🚙 Willys']},
{n:6,place:'Eje Cafetero',title:'Parque del Café',text:'Día pensado para los niños: atracciones, teleférico y cultura cafetera en formato divertido.',chips:['🎢 parque','☕ café']},
{n:7,place:'Cartagena',title:'Vuelo al Caribe',text:'Pereira → Cartagena. Check-in en la Ciudad Amurallada y primer paseo al caer el sol.',chips:['✈️ vuelo','🌅 paseo']},
{n:8,place:'Cartagena',title:'Centro histórico + Getsemaní',text:'Mañana de ciudad, descanso con piscina a mediodía y paseo/cena por la tarde.',chips:['🌈 colonial','🍦 tranquilo']},
{n:9,place:'Barú',title:'Traslado al resort',text:'Salir de Cartagena sin prisas. Llegada, playa, piscina y empezar las vacaciones de verdad.',chips:['🏝️ playa','🏊 piscina']},
{n:10,place:'Barú',title:'Día de resort',text:'Nada obligatorio. El objetivo del día es no mirar el reloj.',chips:['😎 descanso','🍹 fácil']},
{n:11,place:'Barú',title:'Rosario + snorkel',text:'Salida corta y cómoda en barco. Snorkel sencillo, agua turquesa y vuelta al resort.',chips:['🐠 snorkel','🚤 barco']},
{n:12,place:'Barú',title:'Último día sin agenda',text:'Desayuno, playa, piscina, siesta y cena. No añadir una última excursión por llenar el día.',chips:['🏖️ cero agenda','❤️ final']}
];

const hotelGroups=[
{place:'🌺 Medellín · 3 noches',note:'Base cómoda en El Poblado, con piscina y fácil logística.',hotels:[
{name:'Hotel Dann Carlton Medellín',badge:'FAVORITO INICIAL',why:'5★ clásico, piscina renovada, desayuno y ubicación práctica en El Poblado. Buena base familiar sin pagar lujo de resort.',url:'https://www.danncarlton.com/',price:'Objetivo: ~90–150 €/noche'},
{name:'Landmark Hotel Medellín',badge:'ALTERNATIVA',why:'Más moderno y muy bien valorado. Lo compararía si ofrece habitación familiar claramente mejor.',url:'https://www.landmarkmedellin.com/',price:'Objetivo: ~90–150 €/noche'}]},
{place:'🌴 Eje Cafetero · 3 noches',note:'Aquí quiero entorno verde y sensación de finca, no hotel urbano.',hotels:[
{name:'El Rancho de Salento',badge:'A REVISAR',why:'Muy cerca de Salento y con ambiente rural. Candidato por ubicación y buena relación calidad/precio.',url:'https://www.google.com/search?q=El+Rancho+de+Salento',price:'Objetivo: ~80–140 €/noche'},
{name:'Hotel Salento Real',badge:'PLAN B',why:'Más sencillo, pero cómodo para moverse andando por Salento. Lo usaría si preferimos pueblo frente a finca.',url:'https://www.google.com/search?q=Hotel+Salento+Real',price:'Objetivo: ~80–130 €/noche'}]},
{place:'🌈 Cartagena · 2 noches',note:'Aquí prima dormir dentro o pegados a la Ciudad Amurallada y tener buena piscina.',hotels:[
{name:'Sofitel Legend Santa Clara',badge:'FAVORITO PREMIUM',why:'Dentro de la Ciudad Amurallada, piscina grande, piscina infantil y muy buena opción para descansar entre paseos.',url:'https://all.accor.com/hotel/1871/index.es.shtml',price:'Premium: ~300–450 €/noche'},
{name:'Charleston Santa Teresa',badge:'ALTERNATIVA',why:'Ubicación excelente y piscina en azotea. Muy buena alternativa si el Sofitel se dispara.',url:'https://www.hotelcharlestonsantateresa.com/',price:'Premium: ~230–350 €/noche'}]}
];

const resorts=[
{name:'Sofitel Barú Calablanca',badge:'🏆 FAVORITO',desc:'El final más “resort de nivel”: playa, varias piscinas, zona infantil, Kids Space y habitaciones con vistas al Caribe.',scores:[['Playa','5/5'],['Familia','4.5/5'],['Lujo','5/5'],['Facilidad','4/5']],url:'https://all.accor.com/hotel/B0P5/index.en.shtml',fit:'Si queremos terminar el viaje a lo grande.'},
{name:'Decameron Barú',badge:'🥇 MÁS FÁCIL',desc:'Todo incluido real, 4 piscinas, parque acuático infantil, actividades y deportes náuticos no motorizados.',scores:[['Playa','4/5'],['Familia','5/5'],['Todo incluido','5/5'],['Valor','4.5/5']],url:'https://www.decameron.com/es/hoteles/baru/decameron-baru/',fit:'Si queremos cero complicaciones y coste muy controlado.'},
{name:'Isla del Encanto',badge:'🌿 MÁS ESPECIAL',desc:'Ecolodge en entorno insular, playa privada, dos piscinas, piscina infantil con chorros y toboganes y opción de pensión completa.',scores:[['Playa','4.5/5'],['Familia','4/5'],['Naturaleza','5/5'],['Logística','3.5/5']],url:'https://www.isladelencanto.com.co/',fit:'Si priorizamos sensación de isla y naturaleza.'}
];

const checklist=[
['Fijar mes y fechas','Desbloquea precios reales'],['Vuelos Madrid ↔ Colombia','Prioridad alta'],['Hotel Medellín','3 noches'],['Finca Eje Cafetero','3 noches'],['Hotel Cartagena','2 noches'],['Resort Barú','4 noches'],['Excursión Guatapé','Conductor privado'],['Parque del Café','Entradas'],['Lancha Islas del Rosario','Privada o semiprivada'],['Seguro de viaje','Cobertura médica amplia']
];

const budgetScenarios={
'equilibrado':{label:'Equilibrado',note:'Objetivo razonable mezclando hoteles buenos y un buen resort final.',rows:[['✈️ Vuelos internacionales',2600],['✈️ Vuelos internos',500],['🏨 Medellín',420],['🌴 Eje Cafetero',420],['🌈 Cartagena',500],['🏝️ Barú',1500],['🚗 Traslados',400],['🎟️ Actividades',500],['🍽️ Comidas',700]]},
'comodidad':{label:'Más cómodo',note:'Hoteles de más nivel en Cartagena y Barú, manteniendo el resto sensato.',rows:[['✈️ Vuelos internacionales',2800],['✈️ Vuelos internos',550],['🏨 Medellín',500],['🌴 Eje Cafetero',500],['🌈 Cartagena',700],['🏝️ Barú',2200],['🚗 Traslados',450],['🎟️ Actividades',550],['🍽️ Comidas',800]]},
'controlado':{label:'Controlado',note:'Priorizando ofertas, cancelación flexible y Decameron/alternativas con buena relación calidad-precio.',rows:[['✈️ Vuelos internacionales',2300],['✈️ Vuelos internos',450],['🏨 Medellín',330],['🌴 Eje Cafetero',330],['🌈 Cartagena',380],['🏝️ Barú',1150],['🚗 Traslados',350],['🎟️ Actividades',450],['🍽️ Comidas',600]]}
};

document.querySelectorAll('[data-tab]').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b===btn));
  document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===btn.dataset.tab));
  window.scrollTo({top:document.querySelector('.hero').offsetHeight-20,behavior:'smooth'});
}));

document.getElementById('days').innerHTML=days.map(d=>`<article class="day"><div class="day-num">DÍA<strong>${d.n}</strong></div><div class="day-body"><div class="kicker">${d.place.toUpperCase()}</div><h3>${d.title}</h3><p>${d.text}</p><div class="chips">${d.chips.map(c=>`<span class="chip">${c}</span>`).join('')}</div></div></article>`).join('');

document.getElementById('hotelCandidates').innerHTML=hotelGroups.map(g=>`<section class="hotel-group"><div class="group-head"><h3>${g.place}</h3><p>${g.note}</p></div><div class="stack">${g.hotels.map(h=>`<article class="card candidate"><div class="candidate-top"><span class="status shortlist">${h.badge}</span><span class="candidate-price">${h.price}</span></div><h3>${h.name}</h3><p>${h.why}</p><a class="link-btn" href="${h.url}" target="_blank" rel="noopener">Ver hotel ↗</a></article>`).join('')}</div></section>`).join('');

document.getElementById('resortCompare').innerHTML=resorts.map(r=>`<article class="resort-card"><span class="status shortlist">${r.badge}</span><h3>${r.name}</h3><p>${r.desc}</p><div class="score-list">${r.scores.map(([a,b])=>`<div><span>${a}</span><b>${b}</b></div>`).join('')}</div><div class="fit">${r.fit}</div><a class="link-btn" href="${r.url}" target="_blank" rel="noopener">Web oficial ↗</a></article>`).join('');

const savedChecks=JSON.parse(localStorage.getItem('colombiaChecklist')||'{}');
function renderChecklist(){
  document.getElementById('checklist').innerHTML=checklist.map(([a,b],i)=>`<button class="check ${savedChecks[i]?'checked':''}" data-check="${i}" type="button"><i>${savedChecks[i]?'✓':'○'}</i><div><b>${a}</b><small>${b}</small></div><span class="status ${savedChecks[i]?'done-status':'proposed'}">${savedChecks[i]?'CERRADO':'PENDIENTE'}</span></button>`).join('');
  document.querySelectorAll('[data-check]').forEach(el=>el.addEventListener('click',()=>{const i=el.dataset.check;savedChecks[i]=!savedChecks[i];localStorage.setItem('colombiaChecklist',JSON.stringify(savedChecks));renderChecklist();}));
  const done=Object.values(savedChecks).filter(Boolean).length;
  const pct=Math.round(done/checklist.length*100);
  document.getElementById('progressPill').textContent=`${pct}% cerrado`;
}
renderChecklist();

let activeScenario='equilibrado';
function renderBudget(){
  const sc=budgetScenarios[activeScenario];
  document.getElementById('scenarioTabs').innerHTML=Object.entries(budgetScenarios).map(([key,val])=>`<button class="scenario-btn ${key===activeScenario?'active':''}" data-scenario="${key}" type="button">${val.label}</button>`).join('');
  document.querySelectorAll('[data-scenario]').forEach(b=>b.addEventListener('click',()=>{activeScenario=b.dataset.scenario;renderBudget();}));
  document.getElementById('budget').innerHTML=sc.rows.map(([a,v])=>`<div class="budget-row"><span>${a}</span><strong>${v.toLocaleString('es-ES')} €</strong></div>`).join('');
  document.getElementById('totalBudget').textContent=sc.rows.reduce((s,[,v])=>s+v,0).toLocaleString('es-ES')+' €';
  document.getElementById('budgetNote').textContent='* '+sc.note+' Son estimaciones hasta fijar fechas y comprobar tarifas reales para 4 viajeros.';
}
renderBudget();

document.getElementById('closeTip').addEventListener('click',()=>{document.getElementById('installTip').remove();localStorage.setItem('colombiaInstallTip','1')});
if(localStorage.getItem('colombiaInstallTip')) document.getElementById('installTip')?.remove();

document.getElementById('shareGuide').addEventListener('click',async()=>{
  const data={title:'Colombia 2027 · Guía Familiar',text:'Nuestra propuesta de viaje familiar a Colombia',url:location.href};
  if(navigator.share){try{await navigator.share(data)}catch(e){}}
  else{try{await navigator.clipboard.writeText(location.href);document.getElementById('shareGuide').textContent='✓ Enlace copiado';setTimeout(()=>document.getElementById('shareGuide').textContent='↗ Compartir',1800)}catch(e){}}
});

if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});