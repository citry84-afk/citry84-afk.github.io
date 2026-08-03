import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function load(initial={}){
  class Storage{constructor(){this.map=new Map()}getItem(k){return this.map.has(k)?this.map.get(k):null}setItem(k,v){this.map.set(k,String(v))}removeItem(k){this.map.delete(k)}}
  const localStorage=new Storage();localStorage.setItem('ff_options_safe_v9',JSON.stringify(initial));
  const document={addEventListener(){},querySelector(){return null},querySelectorAll(){return[]},createElement(){return{style:{},remove(){}}},body:{appendChild(){}}};
  const window={addEventListener(){},dispatchEvent(){}};
  const context={console,Storage,localStorage,document,window,Intl,Date,Math,Number,String,Map,Set,Array,Object,RegExp,JSON,setTimeout(){return 1},setInterval(){return 1},clearInterval(){},location:{reload(){}},CustomEvent:class{constructor(type,o){this.type=type;this.detail=o?.detail}}};
  vm.createContext(context);vm.runInContext(fs.readFileSync(new URL('../options-v14-4-core.js',import.meta.url),'utf8'),context);
  return{api:context.window.FFv144,window:context.window,localStorage};
}
function installPipeline(env,incoming,produced){
  env.window.FFv142={_internals:{parseCSV(){return[['x']]},readReport(){return incoming}}};
  env.window.FFv143={importCSV(){env.localStorage.setItem('ff_options_safe_v9',JSON.stringify(produced));return{data:produced,added:1,stockAdded:1,replacedOpenSnapshot:incoming.sawOpenPositionsSection,openCount:incoming.open?.length||0,stockOpenCount:incoming.stockOpen?.length||0}},_internals:{sanitizeWindow:d=>d}};
}
const current={
  schemaVersion:'14.3',
  lastReliableStockSnapshot:{verified:true,file:'2026.csv',period:{start:'2026-01-01',end:'2026-06-30'},generatedAt:'2026-07-01, 10:00:00 EDT',positions:{AAPL:100}},
  stockBaseline:{verified:true,file:'base.csv',period:{start:'2025-01-01',end:'2025-12-31'},positions:{AAPL:0}},
  open:[{underlying:'AMD',expiry:'21AUG26',right:'P',strike:150,quantity:-2,multiplier:100,unrealized:25}],
  stockOpen:[{symbol:'AAPL',quantity:100}],
  accountSnapshot:{nav:48000,generatedAt:'2026-07-01, 10:00:00 EDT'},
  openAsOf:'2026-07-01T00:00:00.000Z',
  trades:[],stockTrades:[],imports:[{name:'2026.csv',period:{end:'2026-06-30'},replacedOpenSnapshot:true}]
};

test('un extracto antiguo amplía histórico sin retroceder posiciones actuales',()=>{
  const env=load(current);
  const incoming={sawOpenPositionsSection:true,period:{start:'2025-01-01',end:'2025-12-31'},generatedAt:'2026-01-02',open:[],stockOpen:[]};
  const produced={...current,lastReliableStockSnapshot:{verified:true,file:'2025.csv',period:incoming.period,generatedAt:incoming.generatedAt,positions:{}},open:[],stockOpen:[],accountSnapshot:{nav:30000},openAsOf:'2026-01-02',imports:[...current.imports,{name:'2025.csv',period:incoming.period,replacedOpenSnapshot:true}]};
  installPipeline(env,incoming,produced);
  const r=env.api.importCSV('x','2025.csv');
  assert.equal(r.snapshotDecision.reason,'older-period-end');
  assert.equal(r.data.lastReliableStockSnapshot.period.end,'2026-06-30');
  assert.equal(r.data.open.length,1);assert.equal(r.data.open[0].underlying,'AMD');
  assert.equal(r.data.stockOpen[0].quantity,100);assert.equal(r.data.accountSnapshot.nav,48000);assert.equal(r.data.openAsOf,current.openAsOf);
  assert.equal(r.data.summary.assignmentExposure,30000);
});

test('una fotografía posterior sí sustituye posiciones, NAV y exposición',()=>{
  const env=load(current);
  const incoming={sawOpenPositionsSection:true,period:{start:'2026-01-01',end:'2026-07-31'},generatedAt:'2026-08-01',open:[{underlying:'NVDA',expiry:'18SEP26',right:'P',strike:100,quantity:-1,multiplier:100}],stockOpen:[{symbol:'AAPL',quantity:50}]};
  const produced={...current,lastReliableStockSnapshot:{verified:true,file:'julio.csv',period:incoming.period,generatedAt:incoming.generatedAt,positions:{AAPL:50}},open:incoming.open,stockOpen:incoming.stockOpen,accountSnapshot:{nav:51000},openAsOf:'2026-08-01',imports:[...current.imports,{name:'julio.csv',period:incoming.period,replacedOpenSnapshot:true}]};
  installPipeline(env,incoming,produced);const r=env.api.importCSV('x','julio.csv');
  assert.equal(r.snapshotDecision.accept,true);assert.equal(r.data.lastReliableStockSnapshot.period.end,'2026-07-31');assert.equal(r.data.open[0].underlying,'NVDA');assert.equal(r.data.accountSnapshot.nav,51000);assert.equal(r.data.summary.assignmentExposure,10000);
});

test('una fotografía sin fecha no se acepta como estado actual',()=>{
  const env=load(current);
  const incoming={sawOpenPositionsSection:true,period:{start:'',end:''},generatedAt:'2026-08-02',open:[],stockOpen:[]};
  const produced={...current,lastReliableStockSnapshot:{verified:true,file:'sin-fecha.csv',period:incoming.period,positions:{}},open:[],stockOpen:[],accountSnapshot:{nav:1},imports:[...current.imports,{name:'sin-fecha.csv',period:incoming.period,replacedOpenSnapshot:true}]};
  installPipeline(env,incoming,produced);const r=env.api.importCSV('x','sin-fecha.csv');
  assert.equal(r.snapshotDecision.reason,'missing-period-end');assert.equal(r.data.lastReliableStockSnapshot.period.end,'2026-06-30');assert.equal(r.data.open.length,1);assert.equal(r.data.unverifiedSnapshots.at(-1).reason,'missing-period-end');
});

test('un informe parcial conserva la fotografía fiable',()=>{
  const env=load(current);
  const incoming={sawOpenPositionsSection:false,period:{start:'2026-07-01',end:'2026-07-15'},generatedAt:'2026-07-16',open:[],stockOpen:[]};
  const produced={...current,imports:[...current.imports,{name:'parcial.csv',period:incoming.period,replacedOpenSnapshot:false}]};
  installPipeline(env,incoming,produced);const r=env.api.importCSV('x','parcial.csv');
  assert.equal(r.snapshotDecision.reason,'partial-no-snapshot');assert.equal(r.data.lastReliableStockSnapshot.period.end,'2026-06-30');assert.equal(r.data.open[0].underlying,'AMD');
});

test('la migración detecta que una fotografía más reciente ya se perdió',()=>{
  const regressed={...current,lastReliableStockSnapshot:{verified:true,file:'2025.csv',period:{end:'2025-12-31'},positions:{}},open:[],stockOpen:[],imports:[{name:'2026.csv',period:{end:'2026-06-30'},replacedOpenSnapshot:true},{name:'2025.csv',period:{end:'2025-12-31'},replacedOpenSnapshot:true}]};
  const env=load(regressed);const data=env.api.migrate();
  assert.equal(data.snapshotPolicy.recoveryRequired,true);assert.equal(data.snapshotPolicy.expectedLatestEnd,'2026-06-30');
});

test('el objeto devuelto es byte a byte el almacenado',()=>{
  const env=load(current);
  const incoming={sawOpenPositionsSection:false,period:{start:'2026-07-01',end:'2026-07-15'},generatedAt:'2026-07-16',open:[],stockOpen:[]};
  const produced={...current,imports:[...current.imports,{name:'parcial.csv',period:incoming.period,replacedOpenSnapshot:false}]};
  installPipeline(env,incoming,produced);const r=env.api.importCSV('x','parcial.csv');
  assert.equal(JSON.stringify(r.data),env.localStorage.getItem('ff_options_safe_v9'));
});
