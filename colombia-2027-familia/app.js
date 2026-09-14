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
const checklist=[
['Fijar mes y fechas','Desbloquea precios reales'],['Vuelos Madrid ↔ Colombia','Prioridad alta'],['Hotel Medellín','3 noches'],['Finca Eje Cafetero','3 noches'],['Hotel Cartagena','2 noches'],['Resort Barú','4 noches'],['Excursión Guatapé','Conductor privado'],['Parque del Café','Entradas'],['Lancha Islas del Rosario','Privada o semiprivada'],['Seguro de viaje','Cobertura médica amplia']
];
const budget=[
['✈️ Vuelos internacionales',2600],['✈️ Vuelos internos',500],['🏨 Medellín',480],['🌴 Eje Cafetero',570],['🌈 Cartagena',450],['🏝️ Barú',1350],['🚗 Traslados',350],['🎟️ Actividades',450],['🍽️ Comidas',650]
];

document.querySelectorAll('[data-tab]').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b===btn));
  document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===btn.dataset.tab));
  window.scrollTo({top:document.querySelector('.hero').offsetHeight-20,behavior:'smooth'});
}));

document.getElementById('days').innerHTML=days.map(d=>`<article class="day"><div class="day-num">DÍA<strong>${d.n}</strong></div><div class="day-body"><div class="kicker">${d.place.toUpperCase()}</div><h3>${d.title}</h3><p>${d.text}</p><div class="chips">${d.chips.map(c=>`<span class="chip">${c}</span>`).join('')}</div></div></article>`).join('');

document.getElementById('checklist').innerHTML=checklist.map(([a,b])=>`<article class="check"><i>○</i><div><b>${a}</b><small>${b}</small></div><span class="status proposed">PENDIENTE</span></article>`).join('');

document.getElementById('budget').innerHTML=budget.map(([a,v])=>`<div class="budget-row"><span>${a}</span><strong>${v.toLocaleString('es-ES')} €</strong></div>`).join('');
document.getElementById('totalBudget').textContent=budget.reduce((s,[,v])=>s+v,0).toLocaleString('es-ES')+' €';

document.getElementById('closeTip').addEventListener('click',()=>{document.getElementById('installTip').remove();localStorage.setItem('colombiaInstallTip','1')});
if(localStorage.getItem('colombiaInstallTip')) document.getElementById('installTip')?.remove();

if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});