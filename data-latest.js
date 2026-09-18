(function(){
  const D=window.PORTFOLIO_DATA;
  if(!D) return;

  Object.assign(D.meta,{
    updated:'18/09/2026',
    week:38,
    status:'Fondos disponibles 16,4% · por debajo del mínimo 20%; ORCL sigue concentrando el riesgo',
    statusLevel:'amber'
  });

  Object.assign(D.current,{
    liquiditySnapshotDate:'18/09/2026 (PDF cierre 17/09)',
    liquidityPortfolio:73656.16,
    portfolio:73656.16,
    pdfNav:73819.71,
    pdfDate:'17/09/2026',
    contributed:54975.00,
    yearProfit:18681.16,
    ytdManualPct:33.9812,
    ibkrTwrPct:25.62,
    optionsGrossYtd:23024.52,
    assignmentRealizedTotal:-11878.91,
    assignmentDividendsGross:1021.35,
    closedAssignmentAdjustments:-10857.56,
    optionsYtd:12166.96,
    optionsPrudent:6855.93,
    optionsWeekly:821.10,
    optionsAvgWeekly:320.18,
    optionsMonthlyAvg:1387.46,
    optionsAnnualProjection:16649.52,
    fundsAvailable:12094.15,
    excessLiquidity:17373.92,
    cash:-111373.38,
    buyingPower:80627.69,
    grossSecurities:228501.35,
    mtdInterest:-256.34,
    unrealizedPnl:3106,
    realizedPnl:0,
    orclShares:1096,
    orclPrice:150.59,
    orclMarketValueEur:143824.94,
    orclUnrealized:-5321.83,
    orclRealized:-3637.46,
    orclMtmTotal:-8959.29,
    nvoShares:3,
    nvoPrice:43.19,
    nvoMarketValueEur:112.91,
    nvoUnrealized:10.80,
    nvoRealized:-2686.36,
    nvoPnlApprox:-2675.56,
    assignmentMarketValueEur:143937.85,
    assignmentUnrealized:-5311.03
  });

  const august=D.monthlyOptions.find(x=>x.month==='Agosto');
  if(august) august.value=2282.95;
  else D.monthlyOptions.push({month:'Agosto',value:2282.95});

  const september=D.monthlyOptions.find(x=>x.month==='Septiembre');
  if(september) september.value=1729.93;
  else D.monthlyOptions.push({month:'Septiembre',value:1729.93});

  const y2026=D.annualOptions.find(x=>String(x.year).startsWith('2026'));
  if(y2026) y2026.value=12166.96;

  const week32={week:32,date:'2026-08-07',ytdPct:16.1315,saldo:63262.61,aportado:54475,euroYear:8787.61,optionsYtd:8461.19,weeklyOptions:307.11,source:'Pantallazo 07/08 + PDF 06/08'};
  const idx32=D.weekly2026.findIndex(x=>x.week===32);
  if(idx32>=0) D.weekly2026[idx32]=week32;
  else D.weekly2026.push(week32);

  const week33={week:33,date:'2026-08-14',ytdPct:39.6894,saldo:76095.82,aportado:54475,euroYear:21620.82,optionsYtd:8931.59,weeklyOptions:470.40,source:'Pantallazo 14/08 + PDF 13/08'};
  const idx33=D.weekly2026.findIndex(x=>x.week===33);
  if(idx33>=0) D.weekly2026[idx33]=week33;
  else D.weekly2026.push(week33);

  const week34={week:34,date:'2026-08-21',ytdPct:14.9294,saldo:62607.81,aportado:54475,euroYear:8132.81,optionsYtd:9109.44,weeklyOptions:177.85,source:'Pantallazo 21/08 + PDF 20/08'};
  const idx34=D.weekly2026.findIndex(x=>x.week===34);
  if(idx34>=0) D.weekly2026[idx34]=week34;
  else D.weekly2026.push(week34);

  const week35={week:35,date:'2026-08-28',ytdPct:34.3267,saldo:73174.45,aportado:54475,euroYear:18699.45,optionsYtd:9982.06,weeklyOptions:872.62,source:'Pantallazo 28/08 + PDF 26/08'};
  const idx35=D.weekly2026.findIndex(x=>x.week===35);
  if(idx35>=0) D.weekly2026[idx35]=week35;
  else D.weekly2026.push(week35);

  const week36={week:36,date:'2026-09-04',ytdPct:37.7760,saldo:75742.37,aportado:54975,euroYear:20767.37,optionsYtd:10735.50,weeklyOptions:753.44,source:'Pantallazo 04/09 + PDF 03/09'};
  const idx36=D.weekly2026.findIndex(x=>x.week===36);
  if(idx36>=0) D.weekly2026[idx36]=week36;
  else D.weekly2026.push(week36);

  const week37={week:37,date:'2026-09-11',ytdPct:45.5248,saldo:80002.25,aportado:54975,euroYear:25027.25,optionsYtd:11345.86,weeklyOptions:610.36,source:'Pantallazo 11/09 + PDF 10/09'};
  const idx37=D.weekly2026.findIndex(x=>x.week===37);
  if(idx37>=0) D.weekly2026[idx37]=week37;
  else D.weekly2026.push(week37);

  const week38={week:38,date:'2026-09-18',ytdPct:33.9812,saldo:73656.16,aportado:54975,euroYear:18681.16,optionsYtd:12166.96,weeklyOptions:821.10,source:'Pantallazo 18/09 + PDF 17/09'};
  const idx38=D.weekly2026.findIndex(x=>x.week===38);
  if(idx38>=0) D.weekly2026[idx38]=week38;
  else D.weekly2026.push(week38);

  D.weekly2026.sort((a,b)=>a.week-b.week);

  if(!D.weeklyOptionsAll['2026']) D.weeklyOptionsAll['2026']=[];
  D.weeklyOptionsAll['2026'][31]=307.11;
  D.weeklyOptionsAll['2026'][32]=470.40;
  D.weeklyOptionsAll['2026'][33]=177.85;
  D.weeklyOptionsAll['2026'][34]=872.62;
  D.weeklyOptionsAll['2026'][35]=753.44;
  D.weeklyOptionsAll['2026'][36]=610.36;
  D.weeklyOptionsAll['2026'][37]=821.10;

  setTimeout(()=>{
    const footer=document.querySelector('.footer-note');
    if(footer) footer.textContent='PDF IBKR YTD cerrado al 17/09/2026; valor de cartera y fondos disponibles del pantallazo tomado el 18/09/2026. La rentabilidad principal se calcula frente al capital neto aportado de 54.975 €. La semana 29 conserva el NAV del PDF porque no se dispone del pantallazo.';

    const quality=document.getElementById('optionsQuality');
    if(quality){
      quality.querySelectorAll('span').forEach(el=>{
        if(el.textContent.includes('VTGN, RPD, RGTI, ORCL y NVO') || el.textContent.includes('VTGN, RPD, RGTI, ORCL, NVO y TENX')){
          el.textContent='Ventas realizadas de VTGN, RPD, RGTI, ORCL, NVO y TENX';
        }
      });
    }
  },0);
})();