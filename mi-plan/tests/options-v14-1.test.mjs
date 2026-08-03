import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function load(initial={}){
  class Storage{
    constructor(){this.map=new Map()}
    getItem(k){return this.map.has(k)?this.map.get(k):null}
    setItem(k,v){this.map.set(k,String(v))}
    removeItem(k){this.map.delete(k)}
  }
  const localStorage=new Storage();
  if(Object.keys(initial).length)localStorage.setItem('ff_options_safe_v9',JSON.stringify(initial));
  const dummy={querySelector(){return null},querySelectorAll(){return[]},appendChild(){},insertBefore(){},addEventListener(){},click(){},classList:{add(){},remove(){},toggle(){}},style:{}};
  const document={head:dummy,body:dummy,querySelector(){return null},querySelectorAll(){return[]},createElement(){return{...dummy,dataset:{},textContent:'',innerHTML:''}}};
  const window={};
  class MutationObserver{observe(){}}
  const context={console,Storage,localStorage,document,window,MutationObserver,Intl,Date,Math,Number,String,Map,Set,Array,Object,RegExp,JSON,setTimeout(){return 1},location:{reload(){}},URL:{createObjectURL(){return''},revokeObjectURL(){}},Blob:class{}};
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(new URL('../options-v14-1.js',import.meta.url),'utf8'),context);
  return {api:context.window.FFv141,localStorage};
}

test('dos extractos acumulados no crean lote fantasma',()=>{
  const data={
    stockTrades:[
      {symbol:'CRWV',date:'2026-06-30',quantity:100},
      {symbol:'CRWV',date:'2026-08-01',quantity:-100}
    ],
    stockOpen:[],imports:[{replacedOpenSnapshot:true}],
    stockOpening:{CRWV:{symbol:'CRWV',quantity:100}}
  };
  const {api}=load(data);
  assert.equal(api.inferStockOpening().CRWV,undefined);
  const row=api.reconciliation().find(x=>x.symbol==='CRWV');
  assert.equal(row.reconstructed,0);assert.equal(row.reported,0);assert.equal(row.status,'ok');
});

test('deduce acciones anteriores con foto final',()=>{
  const data={stockTrades:[{symbol:'AAPL',date:'2026-01-10',quantity:-50}],stockOpen:[{symbol:'AAPL',quantity:50}],imports:[{replacedOpenSnapshot:true}]};
  const {api}=load(data);
  assert.equal(api.inferStockOpening().AAPL.quantity,100);
  assert.equal(api.reconciliation()[0].status,'ok');
});

test('sin foto final usa el déficit acumulado mínimo',()=>{
  const data={stockTrades:[{symbol:'MSFT',date:'2026-01-10',quantity:-30},{symbol:'MSFT',date:'2026-02-10',quantity:10}],stockOpen:[],imports:[{replacedOpenSnapshot:false}]};
  const {api}=load(data);
  assert.equal(api.inferStockOpening().MSFT.quantity,30);
  assert.equal(api.reconciliation()[0].status,'unknown');
});

test('intercepta escrituras futuras y recalcula stockOpening',()=>{
  const {api,localStorage}=load({});
  localStorage.setItem('ff_options_safe_v9',JSON.stringify({stockTrades:[{symbol:'CRWV',quantity:100},{symbol:'CRWV',quantity:-100}],stockOpen:[],imports:[{replacedOpenSnapshot:true}],stockOpening:{CRWV:{quantity:100}}}));
  assert.equal(api.data().stockOpening.CRWV,undefined);
  assert.equal(api.data().stockReconciliation.rows[0].status,'ok');
});
