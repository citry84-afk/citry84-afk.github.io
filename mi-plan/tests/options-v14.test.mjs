import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function load(){
  const store=new Map();
  const localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
  const dummy={appendChild(){},remove(){},querySelector(){return null},querySelectorAll(){return[]},classList:{add(){},remove(){},toggle(){}},addEventListener(){},setAttribute(){},insertBefore(){},append(){},firstChild:null};
  const document={head:dummy,body:dummy,documentElement:dummy,createElement(tag){return{...dummy,tagName:tag.toUpperCase(),style:{},dataset:{},click(){},textContent:''}},querySelector(sel){return sel==='#viewRoot'?dummy:null},querySelectorAll(){return[]},addEventListener(){}};
  const window={addEventListener(){},dispatchEvent(){}};
  class MutationObserver{observe(){}}
  class Blob{constructor(parts,opts){this.parts=parts;this.opts=opts}}
  const context={console,localStorage,document,window,MutationObserver,Blob,URL:{createObjectURL(){return'blob:x'},revokeObjectURL(){}},navigator:{},Intl,Date,Math,Number,String,Map,Set,Array,Object,RegExp,JSON,setTimeout(){return 1},clearTimeout(){},alert(){},CSS:{escape:s=>s},CustomEvent:function(){}};
  vm.createContext(context);
  const source=[1,2,3,4].map(i=>fs.readFileSync(new URL(`../_options-v14/options-v14-0${i}.inc`,import.meta.url),'utf8')).join('');
  vm.runInContext(source,context);
  return context.window.FFv14;
}

test('merge idempotente y duplicados legítimos',()=>{const api=load(),m=api._internals.mergeTrades;const t={symbol:'AAA 01JAN27 10 P',date:'2026-01-01, 10:00:00',quantity:-1,price:1,proceeds:100,commission:-1,realized:0,code:'O'};let r=m([], [t,t]);assert.equal(r.trades.length,2);r=m(r.trades,[t,t]);assert.equal(r.added,0);assert.equal(r.trades.length,2)});

test('separa una reapertura del mismo contrato',()=>{const api=load(),split=api._internals.splitContractCycles;const rows=[{date:'2026-01-01',quantity:-1},{date:'2026-01-05',quantity:1},{date:'2026-01-10',quantity:-1},{date:'2026-01-12',quantity:1}];assert.equal(split(rows).length,2)});

test('enlaza asignación y venta de acciones',()=>{const api=load();const data={trades:[{underlying:'AAA',expiry:'30JAN26',strike:10,right:'P',symbol:'AAA 30JAN26 10 P',currency:'USD',date:'2026-01-01, 10:00:00',quantity:-1,price:1,proceeds:100,commission:-1,realized:0,code:'O'},{underlying:'AAA',expiry:'30JAN26',strike:10,right:'P',symbol:'AAA 30JAN26 10 P',currency:'USD',date:'2026-01-30, 16:20:00',quantity:1,price:0,proceeds:0,commission:0,realized:0,code:'A;C'}],open:[],stockOpening:{AAA:{symbol:'AAA',quantity:0}},stockTrades:[{symbol:'AAA',currency:'USD',date:'2026-01-30, 16:20:00',quantity:100,price:10,proceeds:-1000,commission:0,realized:0,code:'A;O'},{symbol:'AAA',currency:'USD',date:'2026-02-02, 10:00:00',quantity:-100,price:11,proceeds:1100,commission:-1,realized:99,code:'C'}],stockOpen:[]};const cycles=api._internals.buildCycles(data);const ledger=api._internals.buildAssignmentLedger(data,cycles);const row=[...ledger.values()][0];assert.equal(row.matched,true);assert.equal(row.remainingQty,0);assert.equal(Math.round(row.adjustedPnl),198)});

test('clasifica eficiencia sin emitir una orden',()=>{const api=load();const data={strategy:{targetProfit:30}};const cycles=[{status:'open',isShortPut:true,structure:'',capital:10000,position:{},pnl:40,netCredit:100,heldDays:5,expiry:'30DEC30',underlying:'AAA',strike:100,contracts:1,currency:'USD'}];const row=api._internals.efficiencyRows(data,cycles)[0];assert.ok(['Revisar eficiencia','Prima restante eficiente','Equilibrada','Vence pronto'].includes(row.verdict));assert.notEqual(row.verdict,'Cerrar')});
