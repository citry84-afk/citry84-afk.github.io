(function(){
  const D=window.PORTFOLIO_DATA;
  if(!D) return;

  Object.assign(D.meta,{
    updated:'07/08/2026',
    week:32,
    status:'Fondos disponibles 16,7% · ORCL sigue concentrando el riesgo',
    statusLevel:'amber'
  });

  Object.assign(D.current,{
    liquiditySnapshotDate:'07/08/2026 (cierre 06/08)',
    liquidityPortfolio:63262.61,
    portfolio:63262.61,
    pdfNav:63318.70,
    pdfDate:'06/08/2026',
    contributed:54475.00,
    yearProfit:8787.61,
    ytdManualPct:16.1315,
    ibkrTwrPct:8.50,
    optionsGrossYtd:19407.97,
    assignmentRealizedTotal:-11966.63,
    assignmentDividendsGross:1019.85,
    closedAssignmentAdjustments:-10946.78,
    optionsYtd:8461.19,
    optionsPrudent:-3591.88,
    optionsWeekly:307.11,
    optionsAvgWeekly:264.41,
    optionsMonthlyAvg:1145.79,
    optionsAnnualProjection:13749.44,
    fundsAvailable:10576.80,
    excessLiquidity:14672.00,
    cash:-111652.99,
    buyingPower:70511.97,
    grossSecurities:219671.89,
    mtdInterest:-81.81,
    unrealizedPnl:-4623,
    realizedPnl:0,
    orclShares:1096,
    orclPrice:143.47,
    orclMarketValueEur:136449.29,
    orclUnrealized:-12071.06,
    orclRealized:-3637.46,
    orclMtmTotal:-15708.51,
    nvoShares:3,
    nvoPrice:45.97,
    nvoMarketValueEur:119.67,
    nvoUnrealized:17.99,
    nvoRealized:-2686.36,
    nvoPnlApprox:-2668.36,
    assignmentMarketValueEur:136568.96,
    assignmentUnrealized:-12053.07
  });

  const august=D.monthlyOptions.find(x=>x.month==='Agosto');
  if(august) august.value=307.11;
  else D.monthlyOptions.push({month:'Agosto',value:307.11});

  const y2026=D.annualOptions.find(x=>String(x.year).startsWith('2026'));
  if(y2026) y2026.value=8461.19;

  const week32={week:32,date:'2026-08-07',ytdPct:16.1315,saldo:63262.61,aportado:54475,euroYear:8787.61,optionsYtd:8461.19,weeklyOptions:307.11,source:'Pantallazo 07/08 + PDF 06/08'};
  const idx=D.weekly2026.findIndex(x=>x.week===32);
  if(idx>=0) D.weekly2026[idx]=week32;
  else D.weekly2026.push(week32);

  if(!D.weeklyOptionsAll['2026']) D.weeklyOptionsAll['2026']=[];
  D.weeklyOptionsAll['2026'][31]=307.11;
})();
