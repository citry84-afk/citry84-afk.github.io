(function(){
  const D=window.PORTFOLIO_DATA;
  if(!D) return;

  Object.assign(D.meta,{
    updated:'28/08/2026',
    week:35,
    status:'Fondos disponibles 22,3% · ORCL sigue concentrando el riesgo',
    statusLevel:'amber'
  });

  Object.assign(D.current,{
    liquiditySnapshotDate:'28/08/2026 (PDF cierre 26/08)',
    liquidityPortfolio:73174.45,
    portfolio:73174.45,
    pdfNav:69001.51,
    pdfDate:'26/08/2026',
    contributed:54475.00,
    yearProfit:18699.45,
    ytdManualPct:34.3267,
    ibkrTwrPct:18.24,
    optionsGrossYtd:20839.62,
    assignmentRealizedTotal:-11878.91,
    assignmentDividendsGross:1021.35,
    closedAssignmentAdjustments:-10857.56,
    optionsYtd:9982.06,
    optionsPrudent:3144.42,
    optionsWeekly:872.62,
    optionsAvgWeekly:285.20,
    optionsMonthlyAvg:1235.87,
    optionsAnnualProjection:14830.49,
    fundsAvailable:16286.55,
    excessLiquidity:22015.09,
    excessAfterExpiry:21678.86,
    cash:-107299.40,
    buyingPower:108577.00,
    grossSecurities:220379.30,
    mtdInterest:-409.83,
    unrealizedPnl:4527,
    realizedPnl:0,
    orclShares:1096,
    orclPrice:148.87,
    orclMarketValueEur:140018.69,
    orclUnrealized:-6858.58,
    orclRealized:-3637.46,
    orclMtmTotal:-10496.04,
    nvoShares:3,
    nvoPrice:47.19,
    nvoMarketValueEur:121.49,
    nvoUnrealized:20.94,
    nvoRealized:-2686.36,
    nvoPnlApprox:-2665.42,
    assignmentMarketValueEur:140140.18,
    assignmentUnrealized:-6837.64
  });

  const august=D.monthlyOptions.find(x=>x.month==='Agosto');
  if(august) august.value=1827.98;
  else D.monthlyOptions.push({month:'Agosto',value:1827.98});

  const y2026=D.annualOptions.find(x=>String(x.year).startsWith('2026'));
  if(y2026) y2026.value=9982.06;

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

  if(!D.weeklyOptionsAll['2026']) D.weeklyOptionsAll['2026']=[];
  D.weeklyOptionsAll['2026'][31]=307.11;
  D.weeklyOptionsAll['2026'][32]=470.40;
  D.weeklyOptionsAll['2026'][33]=177.85;
  D.weeklyOptionsAll['2026'][34]=872.62;
})();
