(function(){
  const D=window.PORTFOLIO_DATA;
  if(!D||!Array.isArray(D.weekly2026)) return;

  const weeks=()=>D.weekly2026.slice().sort((a,b)=>a.week-b.week);
  const fmtEUR=(v)=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',minimumFractionDigits:2,maximumFractionDigits:2,signDisplay:'always'}).format(v);
  const fmtPct=(v)=>`${Number(v).toLocaleString('es-ES',{minimumFractionDigits:1,maximumFractionDigits:1,signDisplay:'auto'})}%`;
  const fmtDate=(iso)=>{const [y,m,d]=String(iso).split('-');return `${d}/${m}/${y}`;};
  const NS='http://www.w3.org/2000/svg';
  const charts=[
    {id:'portfolioChart',value:w=>w.saldo},
    {id:'optionsYtdChart',value:w=>w.optionsYtd}
  ];

  const style=document.createElement('style');
  style.id='weeklyInteractiveStyles';
  style.textContent=`
    .chart-wrap.weekly-interactive{position:relative;cursor:crosshair}
    .chart-wrap.weekly-interactive svg{touch-action:pan-y}
    .weekly-touch-hint{position:absolute;right:12px;bottom:9px;z-index:3;padding:6px 9px;border-radius:999px;background:rgba(8,18,38,.82);border:1px solid rgba(125,211,252,.22);color:#94a3b8;font:700 10px/1 system-ui,-apple-system,sans-serif;pointer-events:none;backdrop-filter:blur(10px)}
    .weekly-inspector{position:absolute;z-index:8;top:8px;right:8px;width:min(242px,calc(100% - 16px));box-sizing:border-box;padding:10px 11px;border-radius:15px;background:rgba(5,14,30,.94);border:1px solid rgba(103,232,249,.34);box-shadow:0 14px 36px rgba(0,0,0,.34);backdrop-filter:blur(14px);color:#e2e8f0;transform:translateY(-3px);opacity:0;pointer-events:none;transition:opacity .12s ease,transform .12s ease,left .12s ease,right .12s ease,top .12s ease}
    .weekly-inspector.show{opacity:1;transform:translateY(0);pointer-events:auto}
    .weekly-inspector-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:7px}
    .weekly-inspector-title{font:900 15px/1.05 system-ui,-apple-system,sans-serif;color:#f8fafc}
    .weekly-inspector-date{margin-top:3px;font:700 9px/1 system-ui,-apple-system,sans-serif;color:#7dd3fc;letter-spacing:.04em;text-transform:uppercase}
    .weekly-inspector-close{appearance:none;border:0;background:transparent;color:#94a3b8;font-size:18px;line-height:1;padding:0 0 2px 6px;cursor:pointer}
    .weekly-inspector-grid{display:grid;grid-template-columns:1fr;gap:5px}
    .weekly-inspector-row{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 8px;border-radius:10px;background:rgba(15,23,42,.68);border:1px solid rgba(148,163,184,.11)}
    .weekly-inspector-row span{font:700 10px/1.12 system-ui,-apple-system,sans-serif;color:#94a3b8;max-width:58%}
    .weekly-inspector-row strong{font:900 13px/1 system-ui,-apple-system,sans-serif;color:#f8fafc;white-space:nowrap}
    .weekly-inspector-row strong.pos{color:#86efac}.weekly-inspector-row strong.neg{color:#fda4af}
    .weekly-marker-line{stroke:#67e8f9;stroke-width:1.5;stroke-dasharray:4 5;opacity:.72;pointer-events:none}
    .weekly-marker-halo{fill:rgba(103,232,249,.18);stroke:#67e8f9;stroke-width:2;pointer-events:none}
    .weekly-marker-dot{fill:#f8fafc;stroke:#22d3ee;stroke-width:3;pointer-events:none}
    @media(max-width:720px){.weekly-inspector{width:min(220px,calc(100% - 16px));padding:9px 10px;border-radius:14px}.weekly-touch-hint{font-size:9px}.weekly-inspector-row{padding:6px 7px}.weekly-inspector-row span{font-size:9px}.weekly-inspector-row strong{font-size:12px}}
  `;
  if(!document.getElementById(style.id)) document.head.appendChild(style);

  const only2026Selected=()=>{
    const active=[...document.querySelectorAll('.year-btn.active')];
    return active.length===1&&active[0].dataset.y==='2026';
  };

  function ensureUI(svg){
    const wrap=svg.closest('.chart-wrap');
    if(!wrap) return null;
    wrap.classList.add('weekly-interactive');
    if(!wrap.querySelector('.weekly-touch-hint')){
      const hint=document.createElement('div');hint.className='weekly-touch-hint';hint.textContent='Toca una semana para ver el detalle';wrap.appendChild(hint);
    }
    let box=wrap.querySelector('.weekly-inspector');
    if(!box){
      box=document.createElement('div');box.className='weekly-inspector';
      box.innerHTML=`<div class="weekly-inspector-head"><div><div class="weekly-inspector-title"></div><div class="weekly-inspector-date"></div></div><button class="weekly-inspector-close" type="button" aria-label="Cerrar">×</button></div><div class="weekly-inspector-grid"></div>`;
      box.querySelector('.weekly-inspector-close').addEventListener('click',(e)=>{e.stopPropagation();box.classList.remove('show');});
      wrap.appendChild(box);
    }
    return {wrap,box};
  }

  function svgNode(tag,attrs){
    const n=document.createElementNS(NS,tag);
    Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));
    return n;
  }

  function pointFor(svg,idx,valueFn){
    const data=weeks();
    const vb=svg.viewBox.baseVal;
    const w=vb&&vb.width?vb.width:(svg.clientWidth||700),h=vb&&vb.height?vb.height:(svg.clientHeight||320);
    const p={l:56,r:18,t:18,b:40};
    const vals=data.map(valueFn);
    let min=Math.min(...vals)*.98,max=Math.max(...vals)*1.02;
    if(min===max){min-=1;max+=1;}
    const x=p.l+(w-p.l-p.r)*idx/(data.length-1||1);
    const y=(h-p.b)-((vals[idx]-min)/(max-min||1))*((h-p.b)-p.t);
    return {x,y,w,h,p};
  }

  function drawMarker(svg,idx,valueFn){
    svg.querySelectorAll('.weekly-marker').forEach(n=>n.remove());
    const pt=pointFor(svg,idx,valueFn);
    const line=svgNode('line',{x1:pt.x,y1:pt.p.t,x2:pt.x,y2:pt.h-pt.p.b,class:'weekly-marker weekly-marker-line'});
    const halo=svgNode('circle',{cx:pt.x,cy:pt.y,r:10,class:'weekly-marker weekly-marker-halo'});
    const dot=svgNode('circle',{cx:pt.x,cy:pt.y,r:4.5,class:'weekly-marker weekly-marker-dot'});
    svg.append(line,halo,dot);
  }

  function positionInspector(ui,event,idx,sourceSvg){
    const {wrap,box}=ui;
    const wrapRect=wrap.getBoundingClientRect();
    const svgRect=sourceSvg.getBoundingClientRect();
    const pt=pointFor(sourceSvg,idx,charts.find(c=>c.id===sourceSvg.id)?.value||((w)=>w.saldo));
    const eventX=event&&Number.isFinite(event.clientX)?event.clientX-wrapRect.left:(svgRect.left-wrapRect.left)+(pt.x/(sourceSvg.viewBox.baseVal.width||sourceSvg.clientWidth||1))*svgRect.width;
    const eventY=event&&Number.isFinite(event.clientY)?event.clientY-wrapRect.top:(svgRect.top-wrapRect.top)+(pt.y/(sourceSvg.viewBox.baseVal.height||sourceSvg.clientHeight||1))*svgRect.height;

    box.style.left='auto';box.style.right='auto';
    const gap=10;
    if(eventX<wrapRect.width/2){box.style.right=`${gap}px`;}
    else{box.style.left=`${gap}px`;}

    requestAnimationFrame(()=>{
      const bh=box.offsetHeight||130;
      const maxTop=Math.max(8,wrapRect.height-bh-8);
      let top=eventY-bh/2;
      top=Math.max(8,Math.min(maxTop,top));
      box.style.top=`${top}px`;
    });
  }

  function showInspector(sourceSvg,idx,event){
    const data=weeks(),w=data[idx]; if(!w) return;
    const ui=ensureUI(sourceSvg); if(!ui) return;
    const box=ui.box;
    box.querySelector('.weekly-inspector-title').textContent=`Semana ${w.week}`;
    box.querySelector('.weekly-inspector-date').textContent=fmtDate(w.date);
    const rows=[
      ['Rentabilidad YTD',fmtPct(w.ytdPct),w.ytdPct>=0?'pos':'neg'],
      ['Opciones semana',fmtEUR(w.weeklyOptions),w.weeklyOptions>=0?'pos':'neg'],
      ['Acumulado ajustado',fmtEUR(w.optionsYtd),w.optionsYtd>=0?'pos':'neg']
    ];
    box.querySelector('.weekly-inspector-grid').innerHTML=rows.map(r=>`<div class="weekly-inspector-row"><span>${r[0]}</span><strong class="${r[2]}">${r[1]}</strong></div>`).join('');
    box.classList.add('show');
    positionInspector(ui,event,idx,sourceSvg);
  }

  function selectWeek(idx,sourceSvg,event){
    charts.forEach(cfg=>{const svg=document.getElementById(cfg.id);if(svg) drawMarker(svg,idx,cfg.value);});
    showInspector(sourceSvg,idx,event);
  }

  function indexFromEvent(svg,event){
    const data=weeks();
    const rect=svg.getBoundingClientRect();
    const vb=svg.viewBox.baseVal;
    const w=vb&&vb.width?vb.width:(svg.clientWidth||700);
    const px=(event.clientX-rect.left)/rect.width*w;
    const left=56,right=18;
    const ratio=Math.max(0,Math.min(1,(px-left)/(w-left-right)));
    return Math.round(ratio*(data.length-1));
  }

  charts.forEach(cfg=>{
    const svg=document.getElementById(cfg.id);if(!svg) return;
    ensureUI(svg);
    svg.addEventListener('click',(e)=>{
      if(!only2026Selected()){
        const ui=ensureUI(svg);if(!ui) return;
        ui.box.querySelector('.weekly-inspector-title').textContent='Detalle semanal 2026';
        ui.box.querySelector('.weekly-inspector-date').textContent='Selecciona solo 2026';
        ui.box.querySelector('.weekly-inspector-grid').innerHTML='<div class="weekly-inspector-row"><span>Relacionar YTD y opciones</span><strong>2026</strong></div>';
        ui.box.classList.add('show');
        positionInspector(ui,e,0,svg);
        return;
      }
      selectWeek(indexFromEvent(svg,e),svg,e);
    });
    svg.addEventListener('mousemove',(e)=>{if(window.matchMedia('(hover:hover)').matches&&only2026Selected()) selectWeek(indexFromEvent(svg,e),svg,e);});
  });
})();