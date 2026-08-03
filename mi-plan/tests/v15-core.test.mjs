import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function loadCore(){
  const storage=new Map();
  const localStorage={getItem:k=>storage.has(k)?storage.get(k):null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
  const context={window:{dispatchEvent(){}},localStorage,CustomEvent:class{constructor(type,init){this.type=type;this.detail=init?.detail}},console,Date,Math,JSON,Number,String,Array,Object,Intl,globalThis:null};
  context.globalThis=context;context.window.localStorage=localStorage;context.window.CustomEvent=context.CustomEvent;
  vm.createContext(context);vm.runInContext(fs.readFileSync(new URL('../v15-core.js',import.meta.url),'utf8'),context);return context.window.FFv15;
}

const bundle={profile:{displayName:'Prueba',assets:[{id:'bank',name:'Banco',category:'bank',value:1000,ownership:100,liquidity:true,precision:'documented'},{id:'home',name:'Casa',category:'property',value:300000,ownership:50,precision:'approximate'},{id:'reserved',name:'Activo comprometido',category:'property',value:100000,ownership:50,usable:false,status:'committed'}],debts:[{id:'mortgage',name:'Hipoteca',category:'mortgage',value:120000,ownership:50,precision:'documented'},{id:'future-debt',name:'Hipoteca futura',category:'mortgage',value:200000,ownership:50,status:'planned',eventId:'purchase',effectiveDate:'2026-08-17'}],incomes:[{id:'salary',name:'Nómina',category:'salary',value:3000,ownership:100,precision:'confirmed',metadata:{paymentsPerYear:14}}],questions:[{id:'q1',title:'Confirmar',status:'pending'}],goals:{}}};

test('aplica porcentajes en vista personal y totales en vista familiar',()=>{const api=loadCore();api.importBundle(bundle);const p=api.calculate(api.state(),'personal','2026-08-03');const f=api.calculate(api.state(),'family','2026-08-03');assert.equal(p.netWorth,141000);assert.equal(p.usableNetWorth,91000);assert.equal(f.netWorth,281000)});
test('no activa una operación futura hasta confirmarla',()=>{const api=loadCore();const b=structuredClone(bundle);b.profile.assets.push({id:'future-home',name:'Casa futura',category:'property',value:400000,ownership:50,status:'planned',eventId:'purchase',effectiveDate:'2026-08-17'});api.importBundle(b);assert.equal(api.calculate(api.state(),'personal','2026-08-03').netWorth,141000);api.activateEvent('purchase','2026-08-17');assert.equal(api.calculate(api.state(),'personal','2026-08-17').netWorth,241000)});
test('conserva observaciones y actualiza el valor vigente',()=>{const api=loadCore();api.importBundle(bundle);api.addObservation('asset','bank',{value:1200,asOf:'2026-08-03',source:'Pantallazo',precision:'documented'});const bank=api.state().profile.assets.find(x=>x.id==='bank');assert.equal(bank.value,1200);assert.equal(bank.observations.length,1);assert.equal(api.calculate(api.state(),'personal','2026-08-03').liquidity,1200)});
