(function(){
  const start=()=>{
    const D=window.PORTFOLIO_DATA;
    const oldBtn=document.getElementById('weeklyShareBtn');
    if(!D||!oldBtn||oldBtn.dataset.investorQuotes==='1') return;

    const btn=oldBtn.cloneNode(true);
    btn.dataset.investorQuotes='1';
    oldBtn.replaceWith(btn);

    const c=D.current,m=D.meta;
    const money=v=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:2,minimumFractionDigits:2,signDisplay:'always'}).format(v);
    const signedPct=v=>`${Number(v).toLocaleString('es-ES',{minimumFractionDigits:1,maximumFractionDigits:1,signDisplay:'auto'})}%`;
    const plainPct=v=>`${Number(v).toLocaleString('es-ES',{minimumFractionDigits:1,maximumFractionDigits:1})}%`;
    const fundsPct=c.portfolio?c.fundsAvailable/c.portfolio*100:0;
    const optionsPct=c.portfolio?c.optionsYtd/c.portfolio*100:0;

    const quotes=[
      {text:'La regla número 1 es nunca pierdas dinero. La regla número 2 es nunca olvides la regla número 1.',author:'Warren Buffett'},
      {text:'El precio es lo que pagas. El valor es lo que recibes.',author:'Warren Buffett'},
      {text:'En el corto plazo, el mercado es una máquina de votar; en el largo plazo, una balanza.',author:'Benjamin Graham'},
      {text:'El gran dinero no está en comprar y vender, sino en esperar.',author:'Charlie Munger'},
      {text:'Conoce lo que posees y por qué lo posees.',author:'Peter Lynch'},
      {text:'No busques la aguja en el pajar. Compra el pajar.',author:'John C. Bogle'},
      {text:'El momento de máximo pesimismo es el mejor momento para comprar.',author:'John Templeton'},
      {text:'No importa cuántas veces aciertes, sino cuánto ganas cuando aciertas y cuánto pierdes cuando fallas.',author:'George Soros'},
      {text:'Dolor más reflexión es igual a progreso.',author:'Ray Dalio'},
      {text:'Nunca fue mi pensamiento lo que me dio grandes beneficios, sino mi capacidad de esperar.',author:'Jesse Livermore'}
    ];

    const nextQuote=()=>{
      let cursor=Number(localStorage.getItem('investorQuoteCursor')||0);
      if(!Number.isFinite(cursor)||cursor<0) cursor=0;
      const quote=quotes[cursor%quotes.length];
      localStorage.setItem('investorQuoteCursor',String((cursor+1)%quotes.length));
      return quote;
    };

    const roundedRect=(ctx,x,y,w,h,r)=>{
      const rr=Math.min(r,w/2,h/2);
      ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath();
    };

    const wrapText=(ctx,text,x,y,maxWidth,lineHeight,maxLines=3)=>{
      const words=text.split(/\s+/);const lines=[];let line='';
      words.forEach(word=>{
        const candidate=line?`${line} ${word}`:word;
        if(ctx.measureText(candidate).width>maxWidth&&line){lines.push(line);line=word;}else line=candidate;
      });
      if(line) lines.push(line);
      const visible=lines.slice(0,maxLines);
      visible.forEach((item,i)=>ctx.fillText(item,x,y+i*lineHeight));
      return visible.length;
    };

    const drawCard=quote=>{
      const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;
      const ctx=canvas.getContext('2d');
      const bg=ctx.createLinearGradient(0,0,1080,1350);bg.addColorStop(0,'#07111f');bg.addColorStop(.52,'#0b1730');bg.addColorStop(1,'#07111f');ctx.fillStyle=bg;ctx.fillRect(0,0,1080,1350);
      const glow1=ctx.createRadialGradient(120,130,0,120,130,520);glow1.addColorStop(0,'rgba(34,211,238,.22)');glow1.addColorStop(1,'rgba(34,211,238,0)');ctx.fillStyle=glow1;ctx.fillRect(0,0,700,700);
      const glow2=ctx.createRadialGradient(990,1190,0,990,1190,560);glow2.addColorStop(0,'rgba(52,211,153,.18)');glow2.addColorStop(1,'rgba(52,211,153,0)');ctx.fillStyle=glow2;ctx.fillRect(380,650,700,700);
      ctx.globalAlpha=.1;ctx.strokeStyle='#7dd3fc';ctx.lineWidth=1;for(let x=-300;x<1400;x+=80){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x-500,1350);ctx.stroke();}ctx.globalAlpha=1;
      roundedRect(ctx,48,48,984,1254,46);ctx.fillStyle='rgba(11,23,48,.78)';ctx.fill();ctx.strokeStyle='rgba(125,211,252,.28)';ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle='#7dd3fc';ctx.font='800 28px system-ui, -apple-system, sans-serif';ctx.fillText('LUIS PORTFOLIO CONTROL',86,112);
      ctx.fillStyle='#f8fafc';ctx.font='900 68px system-ui, -apple-system, sans-serif';ctx.fillText('MI SEMANA',86,202);ctx.fillText('EN MERCADOS',86,276);
      roundedRect(ctx,82,310,430,62,31);ctx.fillStyle='rgba(30,41,59,.82)';ctx.fill();ctx.strokeStyle='rgba(148,163,184,.32)';ctx.stroke();ctx.fillStyle='#cbd5e1';ctx.font='700 25px system-ui, -apple-system, sans-serif';ctx.fillText(`SEMANA ${m.week}  ·  ${m.updated}`,112,350);

      const cards=[
        {x:82,y:418,label:'RENTABILIDAD YTD',value:signedPct(c.ytdManualPct),accent:c.ytdManualPct>=0?'#86efac':'#fda4af'},
        {x:554,y:418,label:'OPCIONES VS SEMANA ANTERIOR',value:money(c.optionsWeekly),accent:c.optionsWeekly>=0?'#86efac':'#fda4af'},
        {x:82,y:730,label:'FONDOS DISPONIBLES',value:plainPct(fundsPct),accent:fundsPct>=20?'#86efac':fundsPct>=10?'#fde68a':'#fda4af'},
        {x:554,y:730,label:'OPCIONES AJUSTADAS / CARTERA',value:plainPct(optionsPct),accent:'#67e8f9'}
      ];
      cards.forEach(card=>{
        roundedRect(ctx,card.x,card.y,444,264,30);ctx.fillStyle='rgba(8,18,38,.88)';ctx.fill();ctx.strokeStyle='rgba(148,163,184,.24)';ctx.lineWidth=2;ctx.stroke();
        roundedRect(ctx,card.x+24,card.y+24,10,62,5);ctx.fillStyle=card.accent;ctx.fill();
        ctx.fillStyle='#94a3b8';ctx.font='800 21px system-ui, -apple-system, sans-serif';
        const words=card.label.split(' ');let line='';let lineY=card.y+58;
        words.forEach((word,i)=>{const test=line+word+' ';if(ctx.measureText(test).width>350&&line){ctx.fillText(line.trim(),card.x+52,lineY);line=word+' ';lineY+=29;}else line=test;if(i===words.length-1)ctx.fillText(line.trim(),card.x+52,lineY);});
        ctx.fillStyle=card.accent;ctx.font=card.value.length>10?'900 52px system-ui, -apple-system, sans-serif':'900 70px system-ui, -apple-system, sans-serif';ctx.fillText(card.value,card.x+30,card.y+205);
      });

      ctx.fillStyle='#67e8f9';ctx.font='800 18px system-ui, -apple-system, sans-serif';ctx.fillText('FRASE DE LA SEMANA',86,1063);
      const quoteFont=quote.text.length>105?23:quote.text.length>80?25:28;
      ctx.fillStyle='#f8fafc';ctx.font=`800 ${quoteFont}px system-ui, -apple-system, sans-serif`;
      const lineCount=wrapText(ctx,`“${quote.text}”`,86,1105,900,36,3);
      const authorY=1105+(lineCount*36)+10;
      ctx.fillStyle='#94a3b8';ctx.font='700 21px system-ui, -apple-system, sans-serif';ctx.fillText(`— ${quote.author}`,86,authorY);

      const lineGrad=ctx.createLinearGradient(86,0,994,0);lineGrad.addColorStop(0,'#34d399');lineGrad.addColorStop(.5,'#22d3ee');lineGrad.addColorStop(1,'#60a5fa');roundedRect(ctx,86,1215,908,8,4);ctx.fillStyle=lineGrad;ctx.fill();
      ctx.fillStyle='#64748b';ctx.font='700 18px system-ui, -apple-system, sans-serif';ctx.fillText('SEGUIMIENTO PERSONAL · NO ES ASESORAMIENTO FINANCIERO',86,1265);
      return canvas;
    };

    const dataUrlToFile=(dataUrl,name)=>{
      const parts=dataUrl.split(',');
      const mime=(parts[0].match(/data:([^;]+)/)||[])[1]||'image/png';
      const bin=atob(parts[1]);
      const bytes=new Uint8Array(bin.length);
      for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
      return new File([bytes],name,{type:mime});
    };

    const fallbackDownload=(file)=>{
      const url=URL.createObjectURL(file);
      const a=document.createElement('a');a.href=url;a.download=file.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2500);
    };

    btn.addEventListener('click',()=>{
      const original=btn.textContent;
      const quote=nextQuote();
      btn.textContent='Preparando ficha…';
      try{
        // Importante para iOS/Safari: todo se genera de forma síncrona para conservar
        // la activación del usuario hasta navigator.share().
        const canvas=drawCard(quote);
        const fileName=`seguimiento-semanal-${m.updated.replaceAll('/','-')}.png`;
        const file=dataUrlToFile(canvas.toDataURL('image/png',1),fileName);

        if(navigator.share){
          const payload={title:'Mi semana en mercados',text:`${quote.text} — ${quote.author}`};
          if(!navigator.canShare||navigator.canShare({files:[file]})) payload.files=[file];
          const sharePromise=navigator.share(payload);
          btn.textContent='Compartiendo…';
          Promise.resolve(sharePromise).catch(error=>{
            if(error&&error.name!=='AbortError'){
              console.error(error);
              fallbackDownload(file);
              btn.textContent='Ficha guardada';
            }
          }).finally(()=>setTimeout(()=>{btn.textContent=original;btn.disabled=false;},1000));
        }else{
          fallbackDownload(file);
          btn.textContent='Ficha guardada';
          setTimeout(()=>{btn.textContent=original;btn.disabled=false;},1600);
        }
      }catch(error){
        console.error(error);
        btn.textContent='No se pudo compartir';
        setTimeout(()=>{btn.textContent=original;btn.disabled=false;},1800);
      }
    });
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(start,0));else setTimeout(start,0);
})();