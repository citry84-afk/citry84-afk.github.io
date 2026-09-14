const days=[
{
 n:1,place:'Medellín',title:'Llegada + aterrizaje suave',tone:'medellin',summary:'Llegar, instalarse y no intentar ganar el viaje el primer día.',chips:['✈️ llegada','🏊 piscina','😴 suave'],
 schedule:[['Llegada','Vuelo Madrid → Medellín y traslado privado al hotel.'],['+60 min','Check-in, ducha y piscina si queda energía.'],['19:30','Cena fácil cerca del hotel.'],['21:00','Dormir pronto: mañana empieza Colombia de verdad.']],
 kid:'🎒 Misión: elegir el primer zumo/fruta colombiana del viaje y puntuarlo del 1 al 10.',wow:'La primera vista del valle de Medellín rodeado de montañas.',planB:'Si el vuelo llega tarde: hotel, cena y cama. No recuperar nada.',
 links:[['📍 Medellín en Google Maps','https://www.google.com/maps/search/?api=1&query=Medell%C3%ADn%2C%20Colombia']]
},
{
 n:2,place:'Medellín',title:'Ciencia + Metro + Metrocable',tone:'medellin',summary:'Un día muy Medellín, pero construido para que los niños disfruten tanto como nosotros.',chips:['🐠 acuario','🦖 dinosaurios','🚡 Metrocable'],
 schedule:[['09:00','Salida hacia Parque Explora.'],['09:30–12:30','Parque Explora: acuario, dinosaurios y salas interactivas.'],['13:00','Comida tranquila en la zona.'],['14:30','Metro hasta Acevedo / San Javier según la ruta elegida.'],['15:00–16:30','Metrocable: paseo panorámico y vuelta sin prisas.'],['17:00','Regreso al hotel y piscina.'],['20:00','Cena por El Poblado.']],
 kid:'🐠 Misión: encontrar el pez más raro del Acuario y hacer un dibujo/foto para el pasaporte.',wow:'Ver Medellín desde el aire en el Metrocable después de una mañana de ciencia interactiva.',planB:'Si están cansados, Explora ya es un día completo excelente. Eliminamos Metrocable y lo hacemos al día siguiente si cuadra.',
 links:[['🎟️ Parque Explora · visita','https://www.parqueexplora.org/visitanos'],['🚡 Planes familiares Metro Medellín','https://www.metrodemedellin.gov.co/usuarios/que-hacer-y-donde-ir-en-medellin/planes-familiares'],['📍 Parque Explora · Maps','https://www.google.com/maps/search/?api=1&query=Parque%20Explora%20Medell%C3%ADn']]
},
{
 n:3,place:'Medellín',title:'Guatapé, zócalos y embalse',tone:'medellin',summary:'Color, barco y pueblo. La Piedra del Peñol queda como opcional, no como obligación.',chips:['🌈 zócalos','🚤 barco','🪨 Peñol opcional'],
 schedule:[['08:00','Salida con conductor privado.'],['10:00','Llegada a Guatapé: paseo por calles y zócalos.'],['11:30','Paseo en barco por el embalse.'],['13:00','Comida en el pueblo.'],['14:30','Helado + paseo por el malecón.'],['15:30','Piedra del Peñol solo si los cuatro tenéis ganas.'],['17:00','Regreso a Medellín.']],
 kid:'🔎 Misión: encontrar 5 zócalos distintos y elegir el más divertido. Bonus si inventan una historia con ellos.',wow:'El embalse desde el agua y las fachadas de Guatapé.',planB:'Sin Peñol. Pueblo + barco ya justifican la excursión y dejan un día mucho más agradable.',
 links:[['🌈 Turismo oficial Guatapé','https://www.turismoguatape.com/'],['📍 Guatapé · Maps','https://www.google.com/maps/search/?api=1&query=Guatap%C3%A9%2C%20Antioquia%2C%20Colombia']]
},
{
 n:4,place:'Eje Cafetero',title:'Vuelo a Pereira + finca cafetera',tone:'coffee',summary:'Cambio completo de escenario y una experiencia de café corta, práctica y apta para niños.',chips:['✈️ vuelo corto','☕ finca','🌱 recolectar café'],
 schedule:[['Mañana','Vuelo Medellín → Pereira.'],['+60 min','Traslado hacia Salento / finca y check-in.'],['13:30','Comida y un rato de descanso.'],['15:00','Coffee Tour Tradicional en Finca El Ocaso (1 h 30 min).'],['17:00','Jardín, finca, piscina o paseo corto.'],['19:30','Cena tranquila.']],
 kid:'☕ Misión: recoger granos de café y explicar al final del tour tres pasos desde la planta hasta la taza.',wow:'Pasar en unas horas de la gran ciudad a dormir rodeados de montaña y cafetales.',planB:'Si el vuelo llega tarde, movemos el coffee tour al día 5 por la tarde y dejamos este día completamente libre.',
 links:[['☕ Finca El Ocaso · Tour Tradicional','https://web.fincaelocasosalento.com/coffee-tour-tradicional/'],['📍 Finca El Ocaso · Maps','https://www.google.com/maps/search/?api=1&query=Finca%20El%20Ocaso%20Salento']]
},
{
 n:5,place:'Eje Cafetero',title:'Valle de Cocora + Jeep Willys + Salento',tone:'coffee',summary:'El gran día de naturaleza: espectacular sin obligarnos a hacer una caminata larga.',chips:['🌴 palmas','🚙 Willys','🐴 caballo opcional'],
 schedule:[['08:00','Desayuno y salida hacia Salento.'],['08:45','Jeep Willys hacia Valle de Cocora.'],['09:15–11:30','Ruta corta entre palmas de cera; fotos y paradas.'],['11:30','Paseo corto a caballo opcional si os apetece.'],['13:00','Regreso a Salento y comida.'],['15:00–17:00','Calle Real, artesanía, helado y miradores.'],['17:30','Vuelta al alojamiento.']],
 kid:'🌴 Misión: localizar la palma de cera que parezca más alta y hacer una foto “tocando” su punta con la mano.',wow:'Las palmas de cera emergiendo de las montañas y llegar en un Willys.',planB:'Si llueve mucho: menos sendero y más Salento. No hace falta completar ninguna ruta circular.',
 links:[['🌴 Cocora · Colombia Travel','https://colombia.travel/en/armenia/visit-cocora-valley'],['📍 Valle de Cocora · Maps','https://www.google.com/maps/search/?api=1&query=Valle%20de%20Cocora%2C%20Salento%2C%20Colombia'],['📍 Salento · Maps','https://www.google.com/maps/search/?api=1&query=Salento%2C%20Quind%C3%ADo%2C%20Colombia']]
},
{
 n:6,place:'Eje Cafetero',title:'Parque del Café',tone:'coffee',summary:'El día completamente dedicado a divertirse. Aquí los niños mandan bastante.',chips:['🎢 atracciones','🚂 tren','💦 rápidos'],
 schedule:[['08:30','Salida hacia Parque del Café.'],['09:30','Entrada al parque.'],['10:00–13:00','Atracciones familiares y las que permitan por estatura.'],['13:00','Comida dentro del parque.'],['14:00','Show / Tren del Café / teleférico.'],['15:00–17:00','Segunda ronda de atracciones.'],['18:00','Regreso al alojamiento y cena sencilla.']],
 kid:'🎢 Misión: cada niño elige una atracción “obligatoria” para toda la familia. Nadie se burla de la elección del otro.',wow:'Un parque temático metido literalmente en el paisaje cafetero.',planB:'Si están saturados antes de tiempo, nos vamos. Este día no tiene premio por cerrar el parque.',
 links:[['🎟️ Parque del Café · oficial','https://parquedelcafe.co/'],['👧 Atracciones infantiles','https://parquedelcafe.co/atracciones-infantiles/'],['📍 Parque del Café · Maps','https://www.google.com/maps/search/?api=1&query=Parque%20del%20Caf%C3%A9%2C%20Quind%C3%ADo']]
},
{
 n:7,place:'Cartagena',title:'Vuelo al Caribe + primera noche mágica',tone:'cartagena',summary:'Llegada, piscina y descubrir Cartagena cuando baja el sol.',chips:['✈️ vuelo','🌅 muralla','🛺 carroza eléctrica'],
 schedule:[['Mañana','Vuelo Pereira → Cartagena.'],['+45 min','Check-in y piscina.'],['17:00','Primer paseo por la Ciudad Amurallada.'],['18:00','Atardecer sobre las murallas.'],['19:00','Cena temprana.'],['20:30','Paseo corto en carroza eléctrica si apetece.']],
 kid:'🌈 Misión: elegir la casa de color más bonita de Cartagena y ponerle un nombre inventado.',wow:'Entrar en la Ciudad Amurallada con la luz del atardecer.',planB:'Si el vuelo se retrasa: solo paseo nocturno y helado. Cartagena queda entera para mañana.',
 links:[['🛺 Carrozas eléctricas · info oficial','https://cartagena.gov.co/carrozas-electricas'],['📍 Ciudad Amurallada · Maps','https://www.google.com/maps/search/?api=1&query=Ciudad%20Amurallada%20Cartagena']]
},
{
 n:8,place:'Cartagena',title:'Castillo, túneles y Getsemaní',tone:'cartagena',summary:'Historia convertida en aventura: fortaleza por la mañana, piscina a mediodía y color por la tarde.',chips:['🏰 castillo','🕳️ túneles','🎨 Getsemaní'],
 schedule:[['08:00','Salida temprano para evitar el calor fuerte.'],['08:20–10:30','Castillo de San Felipe: murallas, vistas y túneles.'],['11:00','Helado / bebida y vuelta al hotel.'],['12:00–16:00','Comida + piscina + descanso.'],['16:30','Getsemaní: arte urbano, plazas y paseo corto.'],['19:30','Cena en el centro.']],
 kid:'🏴‍☠️ Misión: convertirse en exploradores del castillo y encontrar tres túneles o rincones que podrían servir para esconder un tesoro.',wow:'Recorrer los túneles de una fortaleza del siglo XVII y terminar el día entre murales de Getsemaní.',planB:'Si hace demasiado calor, reducimos castillo y adelantamos piscina. Getsemaní puede ser solo una hora al atardecer.',
 links:[['🏰 Castillo San Felipe · oficial','https://fortificacionescartagena.com.co/es/planee-su-visita/castillo-de-san-felipe-de-barajas/'],['🌈 Visit Cartagena · Castillo','https://www.visitcartagena.com.co/sites/castillo-de-san-felipe-de-barajas'],['📍 Getsemaní · Maps','https://www.google.com/maps/search/?api=1&query=Getseman%C3%AD%2C%20Cartagena']]
},
{
 n:9,place:'Barú',title:'Flamencos + traslado al resort',tone:'caribe',summary:'Convertimos un día de traslado en una actividad buenísima para los niños.',chips:['🦩 Aviario','🦜 aves al vuelo','🏝️ resort'],
 schedule:[['08:30','Check-out y salida por carretera hacia Barú.'],['09:30–11:30','Aviario Nacional de Colombia.'],['11:30','Presentación “Aves al Vuelo” si coincide y el tiempo lo permite.'],['12:15','Salida hacia el resort.'],['13:00–14:00','Llegada / comida / check-in según hotel.'],['Tarde','Playa y piscina. Nada más.']],
 kid:'🦩 Misión: encontrar flamencos, tucanes/guacamayas y elegir el ave campeona del viaje.',wow:'Ver aves volando sobre vosotros y unas horas después estar ya bañándoos en el Caribe.',planB:'Esta combinación encaja especialmente bien si elegimos Sofitel o Decameron y llegamos por carretera. Con Isla del Encanto reajustaremos la logística.',
 links:[['🦜 Aviario Nacional · visita','https://aviarionacional.co/info-para-tu-visita/'],['🎟️ Entradas Aviario','https://tickets.aviarionacional.co/'],['📍 Aviario · Maps','https://www.google.com/maps/search/?api=1&query=Aviario%20Nacional%20de%20Colombia%2C%20Bar%C3%BA']]
},
{
 n:10,place:'Barú',title:'Día de resort: hoy no hay reloj',tone:'caribe',summary:'Un día entero para recuperar energía sin sentir que estamos “perdiendo” Colombia.',chips:['🏖️ playa','🏊 piscina','💦 niños'],
 schedule:[['08:30','Desayuno sin alarma.'],['10:00','Playa / kayak / actividad acuática si está disponible.'],['12:30','Comida.'],['14:00','Descanso.'],['16:00','Piscina infantil, kids club o parque acuático según resort.'],['18:30','Atardecer.'],['20:00','Cena y paseo.']],
 kid:'💦 Misión: inventar un reto familiar de piscina/playa que tengan que completar los cuatro.',wow:'No tener que estar en ningún sitio a ninguna hora.',planB:'No existe. Este día es precisamente el plan B de todo el viaje.',
 links:[['🏆 Sofitel Barú','https://all.accor.com/hotel/B0P5/index.en.shtml'],['💦 Decameron Barú','https://www.decameron.com/es/hoteles/baru/decameron-baru/'],['🌿 Isla del Encanto','https://www.isladelencanto.com.co/']]
},
{
 n:11,place:'Barú',title:'Rosario + snorkel familiar',tone:'caribe',summary:'Medio día de mar bonito, sin tours masivos de cinco islas ni horario militar.',chips:['🚤 lancha','🐠 snorkel','🌊 arrecife'],
 schedule:[['08:30','Desayuno.'],['09:30','Salida en lancha privada o semiprivada.'],['10:00–12:30','Islas del Rosario: baño, observación de fauna y snorkel sencillo.'],['13:00','Regreso al resort para comer.'],['Tarde','Piscina, siesta y playa.']],
 kid:'🐠 Misión: contar cinco tipos/colores distintos de peces o criaturas marinas sin tocarlas.',wow:'Nadar sobre aguas transparentes en el Parque Nacional Natural Corales del Rosario.',planB:'Si el mar está movido o hay mal tiempo, cancelamos sin remordimientos y disfrutamos el resort.',
 links:[['🐠 Parque Nacional Corales del Rosario','https://www.parquesnacionales.gov.co/nuestros-parques/pnn-corales-del-rosario-y-de-san-bernardo/'],['📍 Islas del Rosario · Maps','https://www.google.com/maps/search/?api=1&query=Islas%20del%20Rosario%2C%20Colombia']]
},
{
 n:12,place:'Barú',title:'Último día: cero agenda',tone:'caribe',summary:'No cerrar el viaje corriendo. El último recuerdo debe ser Caribe, no una excursión más.',chips:['😎 libre','🏖️ playa','❤️ final'],
 schedule:[['Mañana','Desayuno largo + playa.'],['11:30','Piscina.'],['13:30','Comida.'],['15:00','Siesta / descanso / última actividad de los niños.'],['17:30','Último baño y fotos familiares.'],['20:00','Cena especial de despedida.']],
 kid:'🏆 Misión final: elegir su TOP 3 del viaje y entregar el premio “mejor día de Colombia”.',wow:'Terminar el viaje viendo ponerse el sol sobre el Caribe y sin mirar la hora.',planB:'Imposible estropear este día salvo llenándolo de cosas. Lo dejamos así.',
 links:[['🏝️ Barú · Maps','https://www.google.com/maps/search/?api=1&query=Isla%20Bar%C3%BA%2C%20Colombia']]
}
];

const hotelGroups=[
{place:'🌺 Medellín · 3 noches',note:'Base cómoda en El Poblado, piscina y logística sencilla.',hotels:[
{name:'Hotel Dann Carlton Medellín',badge:'FAVORITO INICIAL',why:'5★ clásico, piscina, desayuno y ubicación práctica. Buena base familiar para recuperar energía al final del día.',kids:'🏊 Piscina + habitaciones amplias',url:'https://www.danncarlton.com/',maps:'https://www.google.com/maps/search/?api=1&query=Hotel%20Dann%20Carlton%20Medell%C3%ADn',price:'Objetivo: ~90–150 €/noche'},
{name:'Landmark Hotel Medellín',badge:'ALTERNATIVA',why:'Más moderno y muy bien valorado. Lo compararía si ofrece una habitación familiar claramente mejor.',kids:'🏊 Piscina / estilo moderno',url:'https://www.landmarkmedellin.com/',maps:'https://www.google.com/maps/search/?api=1&query=Landmark%20Hotel%20Medell%C3%ADn',price:'Objetivo: ~90–150 €/noche'}]},
{place:'🌴 Eje Cafetero · 3 noches',note:'Aquí buscamos finca, verde y experiencia. No quiero dormir en Pereira.',hotels:[
{name:'Finca El Ocaso',badge:'EXPERIENCIA FAVORITA',why:'Podríamos dormir literalmente en una finca de café y hacer allí el tour tradicional. Está a pocos kilómetros de Salento.',kids:'🌱 Jardines, cafetales, senderos y tour infantilizable',url:'https://www.ocasocoffee.com/web/ocaso-farm/',maps:'https://www.google.com/maps/search/?api=1&query=Finca%20El%20Ocaso%20Salento',price:'A comprobar con fechas'},
{name:'El Rancho de Salento',badge:'ALTERNATIVA',why:'Entorno rural y ubicación cómoda para Salento/Cocora. Lo mantenemos en shortlist por relación calidad/precio.',kids:'🌿 Espacio exterior + ambiente de finca',url:'https://www.google.com/search?q=El+Rancho+de+Salento',maps:'https://www.google.com/maps/search/?api=1&query=El%20Rancho%20de%20Salento',price:'Objetivo: ~80–140 €/noche'}]},
{place:'🌈 Cartagena · 2 noches',note:'Ubicación dentro de la Ciudad Amurallada y piscina para cortar el calor al mediodía.',hotels:[
{name:'Sofitel Legend Santa Clara',badge:'FAVORITO PREMIUM',why:'Ubicación excelente, gran piscina y muy buen refugio para descansar entre visitas.',kids:'🏊 Piscina + volver andando al hotel',url:'https://all.accor.com/hotel/1871/index.es.shtml',maps:'https://www.google.com/maps/search/?api=1&query=Sofitel%20Legend%20Santa%20Clara%20Cartagena',price:'Premium: ~300–450 €/noche'},
{name:'Charleston Santa Teresa',badge:'ALTERNATIVA',why:'Ubicación excelente y piscina en azotea. Muy buena alternativa si el Sofitel se dispara.',kids:'🌇 Piscina con vistas',url:'https://www.hotelcharlestonsantateresa.com/',maps:'https://www.google.com/maps/search/?api=1&query=Charleston%20Santa%20Teresa%20Cartagena',price:'Premium: ~230–350 €/noche'}]}
];

const resorts=[
{name:'Sofitel Barú Calablanca',badge:'🏆 FAVORITO',desc:'El cierre más “wow”: playa, varias piscinas y un concepto de resort de nivel alto.',kid:'Kids space / piscina familiar · comprobar programación exacta al reservar.',scores:[['Playa','5/5'],['Familia','4.5/5'],['Lujo','5/5'],['Facilidad','4/5']],url:'https://all.accor.com/hotel/B0P5/index.en.shtml',fit:'Si queremos terminar el viaje a lo grande.'},
{name:'Decameron Barú',badge:'🥇 MÁS FÁCIL',desc:'Todo incluido real con cuatro piscinas y parque acuático infantil.',kid:'💦 Piscinas poco profundas, toboganes y zona de juegos acuáticos.',scores:[['Playa','4/5'],['Familia','5/5'],['Todo incluido','5/5'],['Valor','4.5/5']],url:'https://www.decameron.com/es/hoteles/baru/decameron-baru/',fit:'Si queremos cero complicaciones y máximo entretenimiento infantil.'},
{name:'Isla del Encanto',badge:'🌿 MÁS ISLA',desc:'Más sensación de isla, naturaleza, playa privada y piscinas.',kid:'💦 Piscina infantil de agua salada con chorros y toboganes.',scores:[['Playa','4.5/5'],['Familia','4.5/5'],['Naturaleza','5/5'],['Logística','3.5/5']],url:'https://www.isladelencanto.com.co/servicios',fit:'Si priorizamos sensación de isla y naturaleza.'}
];

const checklist=[
['Fijar mes y fechas','Desbloquea precios reales'],['Vuelos Madrid ↔ Colombia','Prioridad alta'],['Hotel Medellín','3 noches'],['Alojamiento Eje Cafetero','3 noches'],['Hotel Cartagena','2 noches'],['Resort Barú','4 noches'],['Parque Explora','Entradas / horario'],['Excursión Guatapé','Conductor privado'],['Coffee Tour El Ocaso','Tour tradicional'],['Parque del Café','Entradas'],['Aviario Nacional','Entradas'],['Lancha Islas del Rosario','Privada o semiprivada'],['Seguro de viaje','Cobertura médica amplia']
];

const budgetScenarios={
'equilibrado':{label:'Equilibrado',note:'Hoteles buenos, actividades familiares y un buen resort final.',rows:[['✈️ Vuelos internacionales',2600],['✈️ Vuelos internos',500],['🏨 Medellín',420],['🌴 Eje Cafetero',450],['🌈 Cartagena',520],['🏝️ Barú',1550],['🚗 Traslados',450],['🎟️ Actividades',650],['🍽️ Comidas',700]]},
'comodidad':{label:'Más cómodo',note:'Hoteles de nivel alto en Cartagena y Barú, transfers privados y más margen en actividades.',rows:[['✈️ Vuelos internacionales',2800],['✈️ Vuelos internos',550],['🏨 Medellín',520],['🌴 Eje Cafetero',550],['🌈 Cartagena',750],['🏝️ Barú',2300],['🚗 Traslados',550],['🎟️ Actividades',750],['🍽️ Comidas',850]]},
'controlado':{label:'Controlado',note:'Ofertas, cancelación flexible y alojamientos con gran relación calidad/precio.',rows:[['✈️ Vuelos internacionales',2300],['✈️ Vuelos internos',450],['🏨 Medellín',330],['🌴 Eje Cafetero',350],['🌈 Cartagena',400],['🏝️ Barú',1200],['🚗 Traslados',380],['🎟️ Actividades',550],['🍽️ Comidas',600]]}
};

const passportMissions=days.map(d=>({n:d.n,place:d.place,text:d.kid.replace(/^.*?Misi[oó]n(?: final)?:\s*/i,'').replace(/^[^:]+:\s*/,''),emoji:d.kid.slice(0,2).trim()}));

function switchTab(btn){
 document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b===btn));
 document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===btn.dataset.tab));
 window.scrollTo({top:document.querySelector('.hero').offsetHeight-12,behavior:'smooth'});
}
document.querySelectorAll('[data-tab]').forEach(btn=>btn.addEventListener('click',()=>switchTab(btn)));

function dayLinks(links){return links.map(([label,url])=>`<a href="${url}" target="_blank" rel="noopener">${label} ↗</a>`).join('')}
function renderDays(){
 document.getElementById('days').innerHTML=days.map((d,i)=>`<article class="day ${d.tone}" data-day-card="${d.n}">
  <button class="day-summary" type="button" aria-expanded="${i===1?'true':'false'}">
    <div class="day-num">DÍA<strong>${d.n}</strong></div>
    <div class="day-head"><div class="kicker">${d.place.toUpperCase()}</div><h3>${d.title}</h3><p>${d.summary}</p><div class="chips">${d.chips.map(c=>`<span class="chip">${c}</span>`).join('')}</div></div>
    <span class="day-toggle">⌄</span>
  </button>
  <div class="day-detail">
    <div class="schedule">${d.schedule.map(([time,text])=>`<div class="schedule-row"><time>${time}</time><span>${text}</span></div>`).join('')}</div>
    <div class="day-callouts"><div class="kid-callout"><small>PARA LOS NIÑOS</small><b>${d.kid}</b></div><div class="wow-callout"><small>MOMENTO WOW</small><b>✦ ${d.wow}</b></div></div>
    <div class="plan-b"><b>☁️ Plan B / ritmo:</b> ${d.planB}</div>
    <div class="day-links">${dayLinks(d.links)}</div>
  </div>
 </article>`).join('');
 document.querySelectorAll('[data-day-card]').forEach((card,i)=>{
   if(i===1) card.classList.add('open');
   const button=card.querySelector('.day-summary');
   button.addEventListener('click',()=>{card.classList.toggle('open');button.setAttribute('aria-expanded',card.classList.contains('open'));});
 });
}
renderDays();

document.getElementById('hotelCandidates').innerHTML=hotelGroups.map(g=>`<section class="hotel-group"><div class="group-head"><h3>${g.place}</h3><p>${g.note}</p></div><div class="stack">${g.hotels.map(h=>`<article class="card candidate"><div class="candidate-top"><span class="status shortlist">${h.badge}</span><span class="candidate-price">${h.price}</span></div><h3>${h.name}</h3><p>${h.why}</p><div class="kids-line">${h.kids}</div><div class="card-actions"><a class="link-btn" href="${h.url}" target="_blank" rel="noopener">Web / info ↗</a><a class="link-btn ghost" href="${h.maps}" target="_blank" rel="noopener">Mapa ↗</a></div></article>`).join('')}</div></section>`).join('');

document.getElementById('resortCompare').innerHTML=resorts.map(r=>`<article class="resort-card"><span class="status shortlist">${r.badge}</span><h3>${r.name}</h3><p>${r.desc}</p><div class="kids-line">${r.kid}</div><div class="score-list">${r.scores.map(([a,b])=>`<div><span>${a}</span><b>${b}</b></div>`).join('')}</div><div class="fit">${r.fit}</div><a class="link-btn" href="${r.url}" target="_blank" rel="noopener">Web oficial ↗</a></article>`).join('');

const savedChecks=JSON.parse(localStorage.getItem('colombiaChecklist')||'{}');
function renderChecklist(){
 document.getElementById('checklist').innerHTML=checklist.map(([a,b],i)=>`<button class="check ${savedChecks[i]?'checked':''}" data-check="${i}" type="button"><i>${savedChecks[i]?'✓':'○'}</i><div><b>${a}</b><small>${b}</small></div><span class="status ${savedChecks[i]?'done-status':'proposed'}">${savedChecks[i]?'CERRADO':'PENDIENTE'}</span></button>`).join('');
 document.querySelectorAll('[data-check]').forEach(el=>el.addEventListener('click',()=>{const i=el.dataset.check;savedChecks[i]=!savedChecks[i];localStorage.setItem('colombiaChecklist',JSON.stringify(savedChecks));renderChecklist();}));
 const done=Object.values(savedChecks).filter(Boolean).length;
 document.getElementById('progressPill').textContent=`${Math.round(done/checklist.length*100)}% cerrado`;
}
renderChecklist();

const savedMissions=JSON.parse(localStorage.getItem('colombiaKidsPassport')||'{}');
function renderPassport(){
 const done=Object.values(savedMissions).filter(Boolean).length;
 document.getElementById('kidsProgress').textContent=`${done}/12 completadas`;
 document.getElementById('kidsPassport').innerHTML=passportMissions.map((m,i)=>`<button class="mission ${savedMissions[i]?'completed':''}" data-mission="${i}" type="button"><span class="mission-number">${savedMissions[i]?'★':m.n}</span><div><small>${m.place}</small><b>${m.text}</b></div><i>${savedMissions[i]?'COMPLETADA':'PENDIENTE'}</i></button>`).join('');
 document.querySelectorAll('[data-mission]').forEach(el=>el.addEventListener('click',()=>{const i=el.dataset.mission;savedMissions[i]=!savedMissions[i];localStorage.setItem('colombiaKidsPassport',JSON.stringify(savedMissions));renderPassport();}));
}
renderPassport();

let activeScenario='equilibrado';
function renderBudget(){
 const sc=budgetScenarios[activeScenario];
 document.getElementById('scenarioTabs').innerHTML=Object.entries(budgetScenarios).map(([key,val])=>`<button class="scenario-btn ${key===activeScenario?'active':''}" data-scenario="${key}" type="button">${val.label}</button>`).join('');
 document.querySelectorAll('[data-scenario]').forEach(b=>b.addEventListener('click',()=>{activeScenario=b.dataset.scenario;renderBudget();}));
 document.getElementById('budget').innerHTML=sc.rows.map(([a,v])=>`<div class="budget-row"><span>${a}</span><strong>${v.toLocaleString('es-ES')} €</strong></div>`).join('');
 document.getElementById('totalBudget').textContent=sc.rows.reduce((s,[,v])=>s+v,0).toLocaleString('es-ES')+' €';
 document.getElementById('budgetNote').textContent='* '+sc.note+' Estimación para cuatro viajeros hasta fijar fechas y comprobar tarifas reales.';
}
renderBudget();

document.getElementById('closeTip')?.addEventListener('click',()=>{document.getElementById('installTip').remove();localStorage.setItem('colombiaInstallTip','1')});
if(localStorage.getItem('colombiaInstallTip')) document.getElementById('installTip')?.remove();

document.getElementById('shareGuide').addEventListener('click',async()=>{
 const data={title:'Colombia 2027 · Guía Familiar',text:'Nuestra guía familiar de Colombia 2027',url:location.href};
 if(navigator.share){try{await navigator.share(data)}catch(e){}}
 else{try{await navigator.clipboard.writeText(location.href);document.getElementById('shareGuide').textContent='✓ Copiado';setTimeout(()=>document.getElementById('shareGuide').textContent='↗ Compartir',1800)}catch(e){}}
});

if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});