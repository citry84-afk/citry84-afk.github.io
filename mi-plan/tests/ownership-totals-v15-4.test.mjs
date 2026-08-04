import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const code = fs.readFileSync(new URL('../ownership-totals-v15-4.js', import.meta.url), 'utf8');
const context = { console, Intl, globalThis: null };
context.globalThis = context;
vm.createContext(context);
vm.runInContext(code, context);
const api = context.FFOwnershipTotals154;

test('calcula saldo bruto y atribuible con porcentajes diferentes', () => {
  const result = api.calculateDraft({ banks: [
    { id:'sabadell', amount:1400, ownership:50 },
    { id:'unicaja', amount:2676.25, ownership:50 },
    { id:'ing', amount:1000, ownership:100 }
  ]});
  assert.equal(result.gross, 5076.25);
  assert.equal(result.attributable, 3038.125);
});

test('normaliza el panel sin aplicar dos veces la propiedad', () => {
  const input = { onboardingComplete:true, profile:{bankOnboarding:{banks:['bank-sabadell-1','bank-unicaja-2','bank-ing-3']}}, items:[
    {id:'bank-sabadell-1',type:'cash',value:1400,ownershipPct:50},
    {id:'bank-unicaja-2',type:'cash',value:2676.25,ownershipPct:50},
    {id:'bank-ing-3',type:'cash',value:1000,ownershipPct:100}
  ]};
  const first = api.normalizePayload(input);
  assert.equal(first.payload.items[0].value, 700);
  assert.equal(first.payload.items[1].value, 1338.125);
  assert.equal(first.payload.items[2].value, 1000);
  assert.equal(first.gross, 5076.25);
  assert.equal(first.attributable, 3038.125);
  const second = api.normalizePayload(first.payload);
  assert.equal(second.payload.items[0].value, 700);
  assert.equal(second.payload.items[1].value, 1338.125);
  assert.equal(second.changed, false);
});
