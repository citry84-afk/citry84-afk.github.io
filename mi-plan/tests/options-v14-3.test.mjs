import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function load(initial={}){
  class Storage{constructor(){this.map=new Map()}getItem(k){return this.map.has(k)?this.map.get(k):null}setItem(k,v){this.map.set(k,String(v))}removeItem(k){this.map.delete(k)}}
  const localStorage=new Storage();localStorage.setItem('ff_options_safe_v9',JSON.stringify(initial));
  const document={addEventListener(){},querySelector(){return null},createElement(){return{style:{},remove(){}}},body:{appendChild(){}}};
  const window={addEventListener(){},dispatchEvent(){}};
  const context={console,Storage,localStorage,document,window,Intl,Date,Math,Number,String,Map,Set,Array,Object,RegExp,JSON,setTimeout(){return 1},location:{reload(){}},CustomEvent:class{constructor(type,o){this.type=type;this.detail=o?.detail}}};
  vm.createContext(context);vm.runInContext(fs.readFileSync(new URL('../options-v14-3-core.js',import.meta.url),'utf8'),context);
  return{api:context.window.FFv143,window:context.window,localStorage};
}

test('movimiento posterior no crea falso descuadre',()=>{
  const data={stockBaseline:{verified:true,period:{start:'2026-01-01'},positions:{AAPL:0}},lastReliableStockSnapshot:{verified:true,period:{end:'2026-06-30'},positions:{AAPL:100}},stockTrades:[{symbol:'AAPL',date:'2026-03-01',quantity:100},{symbol:'AAPL',date:'2026-07-15',quantity:50}]};
  const {api}=load(data);const row=api.reconciliation()[0];
  assert.equal(row.movements,100);assert.equal(row.reconstructed,100);assert.equal(row.reported,100);assert.equal(row.difference,0);assert.equal(row.status,'verified-pending');assert.equal(row.pendingAfterCount,1);assert.equal(row.pendingAfterNet,50);
});

test('descuadre dentro de la ventana sigue siendo real',()=>{
  const data={stockBaseline:{verified:true,period:{start:'2026-01-01'},positions:{AAPL:0}},lastReliableStockSnapshot:{verified:true,period:{end:'2026-06-30'},positions:{AAPL:200}},stockTrades:[{symbol:'AAPL',date:'2026-03-01',quantity:100},{symbol:'AAPL',date:'2026-07-15',quantity:50}]};
  const {api}=load(data);const row=api.reconciliation()[0];
  assert.equal(row.movements,100);assert.equal(row.difference,-100);assert.equal(row.status,'mismatch');assert.equal(row.pendingAfterCount,1);
});

test('varios movimientos posteriores se informan aparte',()=>{
  const data={stockBaseline:{verified:true,period:{start:'2026-01-01'},positions:{CRWV:0}},lastReliableStockSnapshot:{verified:true,period:{end:'2026-06-30'},positions:{CRWV:100}},stockTrades:[{symbol:'CRWV',date:'2026-06-30',quantity:100},{symbol:'CRWV',date:'2026-07-01',quantity:-40},{symbol:'CRWV',date:'2026-07-02',quantity:-60}]};
  const {api}=load(data);const row=api.reconciliation()[0];
  assert.equal(row.status,'verified-pending');assert.equal(row.pendingAfterCount,2);assert.equal(row.pendingAfterNet,-100);assert.equal(row.reconstructed,100);
});

test('importador devuelve el mismo objeto saneado que localStorage',()=>{
  const initial={stockBaseline:{verified:true,period:{start:'2026-01-01'},positions:{MSFT:0}},lastReliableStockSnapshot:{verified:true,period:{end:'2026-06-30'},positions:{MSFT:10}},stockTrades:[{symbol:'MSFT',date:'2026-02-01',quantity:10}]};
  const {api,window,localStorage}=load(initial);
  window.FFv142={importCSV(){return{data:initial,added:0,stockAdded:0,replacedOpenSnapshot:false,openCount:0,stockOpenCount:0}}};
  const result=api.importCSV('x','x.csv');const stored=JSON.parse(localStorage.getItem('ff_options_safe_v9'));
  assert.deepEqual(result.data,stored);assert.equal(result.data.schemaVersion,'14.3');assert.equal(result.data.stockReconciliation.rows[0].status,'verified');
});
