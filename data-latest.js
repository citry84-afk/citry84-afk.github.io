(function(){
  const D=window.PORTFOLIO_DATA;
  if(!D) return;

  Object.assign(D.meta,{
    updated:'25/09/2026',
    week:39,
    status:'Fondos disponibles 10,1% · muy por debajo del mínimo 20%; ORCL sigue concentrando el riesgo',
    statusLevel:'red'
  });

  Object.assign(D.current,{
    liquiditySnapshotDate:'25/09/2026 (IBKR directo; PDF cierre 24/09)',
    liquidityPortfolio:66692.75,
    portfolio:66692.75,
    pdfNav:66035.55,
    pdfDate:'24/09/2026',
    contributed:54975.00,
    yearProfit:11717.75,
    ytdManualPct:21.3147,
    ibkrTwrPct:12.37,
    optionsGrossYtd:24578.15,
    assignmentRealizedTotal:-11878.91,
    assignmentDividendsGross:1021.35,
    closedAssignmentAdjustments:-10857.56,
    optionsYtd:13720.59,
    optionsPrudent:-1662.42,
    optionsWeekly:1553.63,
    optionsAvgWeekly:351.81,
    optionsMonthlyAvg:1524.51,
    optionsAnnualProjection:18294.12,
    fundsAvailable:6707.55,
    excessLiquidity:12784.72,
    cash:-112604.58,
    buyingPower:44717.02,
    grossSecurities:225766.53,
    mtdInterest:-256.34,
    unrealizedPnl:-6294.37,
    realizedPnl:0,
    orclShares:1096,
    orclPrice:140.20,
    orclMarketValueEur:135100.35,
    orclUnrealized:-15381.54,
    orclRealized:-3637.46,
    orclMtmTotal:-19019.00,
    nvoShares:3,
    nvoPrice:38.50,
    nvoMarketValueEur:101.55,
    nvoUnrealized:-1.47,
    nvoRealized:-2686.36,
    nvoPnlApprox:-2687.83,
    assignmentMarketValueEur:135201.90,
    assignmentUnrealized:-15383.01
  });

  const august=D.monthlyOptions.find(x=>x.month==='Agosto');
  if(august) august.value=2282.95;
  else D.monthlyOptions.push({month:'Agosto',value:2282.95});

  const september=D.monthlyOptions.find(x=>x.month==='Septiembre');
  if(september) september.value=3283.56;
  else D.monthlyOptions.push({month:'Septiembre',value:3283.56});

  const y2026=D.annualOptions.find(x=>String(x.year).startsWith('2026'));
  if(y2026) y2026.value=13720.59;

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

  const week39={week:39,date:'2026-09-25',ytdPct:21.3147,saldo:66692.75,aportado:54975,euroYear:11717.75,optionsYtd:13720.59,weeklyOptions:1553.63,source:'IBKR directo 25/09 + PDF 24/09'};
  const idx39=D.weekly2026.findIndex(x=>x.week===39);
  if(idx39>=0) D.weekly2026[idx39]=week39;
  else D.weekly2026.push(week39);

  D.weekly2026.sort((a,b)=>a.week-b.week);

  if(!D.weeklyOptionsAll['2026']) D.weeklyOptionsAll['2026']=[];
  D.weeklyOptionsAll['2026'][31]=307.11;
  D.weeklyOptionsAll['2026'][32]=470.40;
  D.weeklyOptionsAll['2026'][33]=177.85;
  D.weeklyOptionsAll['2026'][34]=872.62;
  D.weeklyOptionsAll['2026'][35]=753.44;
  D.weeklyOptionsAll['2026'][36]=610.36;
  D.weeklyOptionsAll['2026'][37]=821.10;
  D.weeklyOptionsAll['2026'][38]=1553.63;

  setTimeout(()=>{
    const footer=document.querySelector('.footer-note');
    if(footer) footer.textContent='PDF IBKR YTD cerrado al 24/09/2026; valor de cartera y fondos disponibles obtenidos directamente de IBKR el 25/09/2026. La rentabilidad principal se calcula frente al capital neto aportado de 54.975 €. La semana 29 conserva el NAV del PDF porque no se dispone del pantallazo.';

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