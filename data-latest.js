(function(){
  const D=window.PORTFOLIO_DATA;
  if(!D) return;

  Object.assign(D.meta,{
    updated:'04/09/2026',
    week:36,
    status:'Fondos disponibles 25,4% · ORCL sigue concentrando el riesgo',
    statusLevel:'amber'
  });

  Object.assign(D.current,{
    liquiditySnapshotDate:'04/09/2026 (PDF cierre 03/09)',
    liquidityPortfolio:75742.37,
    portfolio:75742.37,
    pdfNav:75315.14,
    pdfDate:'03/09/2026',
    contributed:54975.00,
    yearProfit:20767.37,
    ytdManualPct:37.7760,
    ibkrTwrPct:28.16,
    optionsGrossYtd:21593.06,
    assignmentRealizedTotal:-11878.91,
    assignmentDividendsGross:1021.35,
    closedAssignmentAdjustments:-10857.56,
    optionsYtd:10735.50,
    optionsPrudent:8756.66,
    optionsWeekly:753.44,
    optionsAvgWeekly:298.21,
    optionsMonthlyAvg:1292.24,
    optionsAnnualProjection:15506.83,
    fundsAvailable:19231.61,
    excessLiquidity:24218.61,
    cash:-113440.19,
    buyingPower:128210.73,
    grossSecurities:227846.96,
    mtdInterest:-34.41,
    unrealizedPnl:8408,
    realizedPnl:0,
    orclShares:1096,
    orclPrice:154.04,
    orclMarketValueEur:145220.64,
    orclUnrealized:-2000.65,
    orclRealized:-3637.46,
    orclMtmTotal:-5638.10,
    nvoShares:3,
    nvoPrice:47.51,
    nvoMarketValueEur:122.60,
    nvoUnrealized:21.81,
    nvoRealized:-2686.36,
    nvoPnlApprox:-2664.55,
    assignmentMarketValueEur:145343.24,
    assignmentUnrealized:-1978.84
  });

  const august=D.monthlyOptions.find(x=>x.month==='Agosto');
  if(august) august.value=2282.95;
  else D.monthlyOptions.push({month:'Agosto',value:2282.95});

  const september=D.monthlyOptions.find(x=>x.month==='Septiembre');
  if(september) september.value=298.47;
  else D.monthlyOptions.push({month:'Septiembre',value:298.47});

  const y2026=D.annualOptions.find(x=>String(x.year).startsWith('2026'));
  if(y2026) y2026.value=10735.50;

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

  if(!D.weeklyOptionsAll['2026']) D.weeklyOptionsAll['2026']=[];
  D.weeklyOptionsAll['2026'][31]=307.11;
  D.weeklyOptionsAll['2026'][32]=470.40;
  D.weeklyOptionsAll['2026'][33]=177.85;
  D.weeklyOptionsAll['2026'][34]=872.62;
  D.weeklyOptionsAll['2026'][35]=753.44;

  const footer=document.querySelector('.footer-note');
  if(footer) footer.textContent='PDF IBKR YTD cerrado al 03/09/2026; valor de cartera y fondos disponibles del pantallazo tomado el 04/09/2026. La rentabilidad principal se calcula frente al capital neto aportado de 54.975 €. La semana 29 conserva el NAV del PDF porque no se dispone del pantallazo.';
})();
