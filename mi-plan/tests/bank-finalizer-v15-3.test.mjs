import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../bank-finalizer-v15-3.js', import.meta.url), 'utf8');

function boot({payload, draft, reads}) {
  const store = new Map([
    ['ff_mi_plan_v2', JSON.stringify(payload)],
    ['ff_onboarding_banks_v151', JSON.stringify(draft)],
    ['ff_doc_reads_v153', JSON.stringify(reads)]
  ]);
  const listeners = {};
  let intervalCallback = null;
  const context = {
    console,
    localStorage: {
      getItem: key => store.get(key) ?? null,
      setItem: (key, value) => store.set(key, value)
    },
    window: {
      addEventListener: (name, fn) => { listeners[name] = fn; },
      dispatchEvent: () => {}
    },
    document: {
      hidden: false,
      addEventListener: (name, fn) => { listeners[name] = fn; }
    },
    CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init?.detail; } },
    setInterval: fn => { intervalCallback = fn; return 1; },
    clearInterval: () => {},
    Date
  };
  vm.runInNewContext(source, context);
  intervalCallback?.();
  return {store, api: context.window.FFBankFinalizer153};
}

test('integra el saldo OCR de Unicaja en el panel final', () => {
  const payload = {onboardingComplete:true,profile:{},items:[{id:'cash-summary',type:'cash',name:'Banco',value:0,owner:'Personal'}]};
  const draft = {
    applied:false,
    monthlyContribution:500,
    cashOutside:300,
    banks:[
      {id:'unicaja',name:'Unicaja',amount:2014.37,ownership:100,file:{id:'shot-1',name:'unicaja.png'}},
      {id:'ing',name:'ING',amount:2000,ownership:50,file:null}
    ]
  };
  const reads = [{context:'bank',id:'unicaja',amount:2014.37,ownership:100}];
  const {store} = boot({payload,draft,reads});
  const saved = JSON.parse(store.get('ff_mi_plan_v2'));
  assert.equal(saved.items.length, 3);
  assert.equal(saved.items[0].name, 'Unicaja');
  assert.equal(saved.items[0].value, 2014.37);
  assert.equal(saved.items[0].sourceLabel, 'Pantallazo leído y confirmado');
  assert.equal(saved.items[1].name, 'ING');
  assert.equal(saved.items[1].ownershipPct, 50);
  assert.equal(saved.items[2].name, 'Efectivo fuera del banco');
  assert.equal(saved.profile.bankOnboarding.version, '15.3');
});

test('no vuelve a sustituir cuentas después de aplicarlas', () => {
  const payload = {onboardingComplete:true,profile:{},items:[{id:'cash',type:'cash',name:'Banco',value:100}]};
  const draft = {applied:true,banks:[{id:'ing',name:'ING',amount:100,ownership:100}],cashOutside:0};
  const {store, api} = boot({payload,draft,reads:[]});
  const before = store.get('ff_mi_plan_v2');
  assert.equal(api.apply(), false);
  assert.equal(store.get('ff_mi_plan_v2'), before);
});
