import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function load(initial=null){
  class Storage{constructor(){this.map=new Map()}getItem(k){return this.map.has(k)?this.map.get(k):null}setItem(k,v){this.map.set(k,String(v))}removeItem(k){this.map.delete(k)}}
  const localStorage=new Storage();if(initial)localStorage.setItem('ff_options_safe_v9',JSON.stringify(initial));
  const document={addEventListener(){},querySelector(){return null},createElement(){return{style:{},remove(){}}},body:{appendChild(){}}};
  const window={addEventListener(){},dispatchEvent(){}};
  const context={console,Storage,localStorage,document,window,Intl,Date,Math,Number,String,Map,Set,Array,Object,RegExp,JSON,setTimeout(){return 1},location:{reload(){}},CustomEvent:class{constructor(type,o){this.type=type;this.detail=o?.detail}}};
  vm.createContext(context);vm.runInContext(fs.readFileSync(new URL('../options-v14-2-core.js',import.meta.url),'utf8'),context);
  return{api:context.window.FFv142,localStorage};
}
const q=v=>`"${String(v).replaceAll('"','""')}"`;
function csv({period='Enero 1, 2026 - Junio 30, 2026',opening={},final={},stockTrades=[],optionTrades=[],withSnapshot=true}){
  const rows=[['Statement','Data','Period',period],['Statement','Data','WhenGenerated','2026-08-03, 10:00:00 EDT'],['Información sobre la cuenta','Data','Divisa base','EUR']];
  for(const [symbol,qty] of Object.entries(opening))rows.push(['Resumen Rendimiento Valoración al mercado','Data','Acciones',symbol,String(qty),String(final[symbol]??qty),'10','11']);
  if(withSnapshot){rows.push(['Posiciones abiertas','Header','Categoría']);for(const [symbol,qty] of Object.entries(final)){if(qty)rows.push(['Posiciones abiertas','Data','Cuenta','Acciones','USD',symbol,String(qty),'1','10',String(qty*10),'11',String(qty*11),'0',''])}}
  for(const t of stockTrades)rows.push(['Operaciones','Data','Cuenta','Acciones','USD',t.symbol,t.date,String(t.quantity),String(t.price??10),String(t.price??10),String(t.proceeds??(-t.quantity*(t.price??10))),String(t.commission??0),'0',String(t.realized??0),'0',t.code??'']);
  for(const t of optionTrades)rows.push(['Operaciones','Data','Cuenta','Opciones sobre acciones e índices','USD',t.symbol,t.date,String(t.quantity),String(t.price??1),'0',String(t.proceeds??100),String(t.commission??-1),'0',String(t.realized??0),'0',t.code??'O']);
  return rows.map(r=>r.map(q).join(',')).join('\n');
}

test('CRWV: dos extractos no crean saldo fantasma',()=>{
  const {api}=load();
  api.importCSV(csv({opening:{CRWV:0},final:{CRWV:100},stockTrades:[{symbol:'CRWV',date:'2026-06-30, 10:00:00',quantity:100,price:80,code:'A'}]}),'ene-jun.csv');
  const r=api.importCSV(csv({period:'Julio 1, 2026 - Diciembre 31, 2026',opening:{CRWV:100},final:{CRWV:0},stockTrades:[{symbol:'CRWV',date:'2026-08-01, 10:00:00',quantity:-100,price:90,proceeds:9000,commission:-1}]}),'jul-dic.csv');
  assert.equal(r.data.stockBaseline.positions.CRWV,0);
  assert.equal(r.data.stockOpening.CRWV,undefined);
  const row=r.data.stockReconciliation.rows.find(x=>x.symbol==='CRWV');
  assert.equal(row.reconstructed,0);assert.equal(row.reported,0);assert.equal(row.status,'verified');
});

test('AAPL: la laguna de 100 acciones produce descuadre real',()=>{
  const {api}=load();
  const r=api.importCSV(csv({opening:{AAPL:0},final:{AAPL:200},stockTrades:[{symbol:'AAPL',date:'2026-03-01, 10:00:00',quantity:100,price:150}]}),'aapl.csv');
  const row=r.data.stockReconciliation.rows.find(x=>x.symbol==='AAPL');
  assert.equal(row.baselineQty,0);assert.equal(row.movements,100);assert.equal(row.reconstructed,100);assert.equal(row.reported,200);assert.equal(row.difference,-100);assert.equal(row.status,'mismatch');
});

test('sin base independiente presenta saldo no explicado, no verificado',()=>{
  const initial={stockTrades:[{symbol:'AAPL',date:'2026-03-01',quantity:100}],stockOpen:[{symbol:'AAPL',quantity:200}],imports:[{name:'viejo.csv',date:'2026-08-01',replacedOpenSnapshot:true}],accountSnapshot:{generatedAt:'2026-08-01'}};
  const {api}=load(initial);const row=api.data().stockReconciliation.rows.find(x=>x.symbol==='AAPL');
  assert.equal(row.unexplained,100);assert.equal(row.status,'prior-history');assert.equal(api.data().stockBaseline,null);
});

test('importCSV devuelve exactamente el objeto almacenado',()=>{
  const {api,localStorage}=load();const r=api.importCSV(csv({opening:{MSFT:0},final:{MSFT:10},stockTrades:[{symbol:'MSFT',date:'2026-04-01',quantity:10}]}),'x.csv');
  assert.deepEqual(r.data,JSON.parse(localStorage.getItem('ff_options_safe_v9')));
  assert.equal(r.data.schemaVersion,'14.2');
});

test('un extracto parcial conserva la última fotografía fiable',()=>{
  const {api}=load();api.importCSV(csv({opening:{MSFT:0},final:{MSFT:10},stockTrades:[{symbol:'MSFT',date:'2026-04-01',quantity:10}]}),'completo.csv');
  api.importCSV(csv({period:'Agosto 1, 2026 - Agosto 2, 2026',withSnapshot:false,optionTrades:[{symbol:'AAPL 18SEP26 200 P',date:'2026-08-02, 10:00:00',quantity:-1}]}),'parcial.csv');
  assert.equal(api.snapshot().file,'completo.csv');assert.equal(api.data().stockReconciliation.snapshotVerified,true);
});

test('la base más antigua no se sobrescribe con un extracto posterior',()=>{
  const {api}=load();api.importCSV(csv({opening:{NVO:50},final:{NVO:40},stockTrades:[{symbol:'NVO',date:'2026-02-01',quantity:-10}]}),'enero.csv');
  api.importCSV(csv({period:'Julio 1, 2026 - Diciembre 31, 2026',opening:{NVO:40},final:{NVO:30},stockTrades:[{symbol:'NVO',date:'2026-08-01',quantity:-10}]}),'julio.csv');
  assert.equal(api.baseline().file,'enero.csv');assert.equal(api.baseline().positions.NVO,50);assert.equal(api.reconciliation().find(x=>x.symbol==='NVO').status,'verified');
});
