(function(){
  const D=window.PORTFOLIO_DATA;
  if(!D) return;

  Object.assign(D.meta,{
    updated:'14/08/2026',
    week:33,
    status:'Fondos disponibles 28,7% · ORCL sigue concentrando el riesgo',
    statusLevel:'amber'
  });

  Object.assign(D.current,{
    liquiditySnapshotDate:'14/08/2026 (PDF cierre 13/08)',
    liquidityPortfolio:76095.82,
    portfolio:76095.82,
    pdfNav:76055.24,
    pdfDate:'13/08/2026',
    contributed:54475.00,
    yearProfit:21620.82,
    ytdManualPct:39.6894,
    ibkrTwrPct:30.33,
    optionsGrossYtd:19878.37,
    assignmentRealizedTotal:-11966.63,
    assignmentDividendsGross:1019.85,
    closedAssignmentAdjustments:-10946.78,
    optionsYtd:8931.59,
    optionsPrudent:9006.53,
    optionsWeekly:470.40,
    optionsAvgWeekly:270.65,
    optionsMonthlyAvg:1172.84,
    optionsAnnualProjection:14074.02,
    fundsAvailable:21840.46,
    excessLiquidity:26298.19,
    cash:-109706.29,
    buyingPower:145603.07,
    grossSecurities:228274.48,
    mtdInterest:-197.95,
    unrealizedPnl:7829,
    realizedPnl:0,
    orclShares:1096,
    orclPrice:156.22,
    orclMarketValueEur:148503.46,
    orclUnrealized:55.00,
    orclRealized:-3637.46,
    orclMtmTotal:-3582.46,
    nvoShares:3,
    nvoPrice:46.72,
    nvoMarketValueEur:121.57,
    nvoUnrealized:19.94,
    nvoRealized:-2686.36,
    nvoPnlApprox:-2666.42,
    assignmentMarketValueEur:148625.03,
    assignmentUnrealized:74.94
  });

  const august=D.monthlyOptions.find(x=>x.month==='Agosto');
  if(august) august.value=777.51;
  else D.monthlyOptions.push({month:'Agosto',value:777.51});

  const y2026=D.annualOptions.find(x=>String(x.year).startsWith('2026'));
  if(y2026) y2026.value=8931.59;

  const week32={week:32,date:'2026-08-07',ytdPct:16.1315,saldo:63262.61,aportado:54475,euroYear:8787.61,optionsYtd:8461.19,weeklyOptions:307.11,source:'Pantallazo 07/08 + PDF 06/08'};
  const idx32=D.weekly2026.findIndex(x=>x.week===32);
  if(idx32>=0) D.weekly2026[idx32]=week32;
  else D.weekly2026.push(week32);

  const week33={week:33,date:'2026-08-14',ytdPct:39.6894,saldo:76095.82,aportado:54475,euroYear:21620.82,optionsYtd:8931.59,weeklyOptions:470.40,source:'Pantallazo 14/08 + PDF 13/08'};
  const idx33=D.weekly2026.findIndex(x=>x.week===33);
  if(idx33>=0) D.weekly2026[idx33]=week33;
  else D.weekly2026.push(week33);

  if(!D.weeklyOptionsAll['2026']) D.weeklyOptionsAll['2026']=[];
  D.weeklyOptionsAll['2026'][31]=307.11;
  D.weeklyOptionsAll['2026'][32]=470.40;
})();
