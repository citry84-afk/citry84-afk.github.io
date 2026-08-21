(function(){
  const D=window.PORTFOLIO_DATA;
  if(!D) return;

  Object.assign(D.meta,{
    updated:'21/08/2026',
    week:34,
    status:'Fondos disponibles 12,7% · ORCL sigue concentrando el riesgo',
    statusLevel:'amber'
  });

  Object.assign(D.current,{
    liquiditySnapshotDate:'21/08/2026 (PDF cierre 20/08)',
    liquidityPortfolio:62607.81,
    portfolio:62607.81,
    pdfNav:61334.81,
    pdfDate:'20/08/2026',
    contributed:54475.00,
    yearProfit:8132.81,
    ytdManualPct:14.9294,
    ibkrTwrPct:5.10,
    optionsGrossYtd:20056.22,
    assignmentRealizedTotal:-11966.63,
    assignmentDividendsGross:1019.85,
    closedAssignmentAdjustments:-10946.78,
    optionsYtd:9109.44,
    optionsPrudent:-4097.61,
    optionsWeekly:177.85,
    optionsAvgWeekly:267.92,
    optionsMonthlyAvg:1160.99,
    optionsAnnualProjection:13931.84,
    fundsAvailable:7958.61,
    excessLiquidity:12690.95,
    excessAfterExpiry:13930.66,
    cash:-107914.38,
    buyingPower:53057.42,
    grossSecurities:212335.19,
    mtdInterest:-309.35,
    unrealizedPnl:-5099,
    realizedPnl:0,
    orclShares:1096,
    orclPrice:142.07,
    orclMarketValueEur:133330.26,
    orclUnrealized:-13225.24,
    orclRealized:-3637.46,
    orclMtmTotal:-16862.70,
    nvoShares:3,
    nvoPrice:46.14,
    nvoMarketValueEur:118.53,
    nvoUnrealized:18.19,
    nvoRealized:-2686.36,
    nvoPnlApprox:-2668.17,
    assignmentMarketValueEur:133448.79,
    assignmentUnrealized:-13207.05
  });

  const august=D.monthlyOptions.find(x=>x.month==='Agosto');
  if(august) august.value=955.36;
  else D.monthlyOptions.push({month:'Agosto',value:955.36});

  const y2026=D.annualOptions.find(x=>String(x.year).startsWith('2026'));
  if(y2026) y2026.value=9109.44;

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

  if(!D.weeklyOptionsAll['2026']) D.weeklyOptionsAll['2026']=[];
  D.weeklyOptionsAll['2026'][31]=307.11;
  D.weeklyOptionsAll['2026'][32]=470.40;
  D.weeklyOptionsAll['2026'][33]=177.85;
})();
