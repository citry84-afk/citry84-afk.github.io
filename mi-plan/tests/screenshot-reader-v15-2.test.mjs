import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const code = fs.readFileSync(new URL('../screenshot-reader-v15-2.js', import.meta.url), 'utf8');
const storage = new Map();
const context = {
  window:{},
  localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
  document:{addEventListener(){},querySelector(){return null},querySelectorAll(){return[]},createElement(){return{appendChild(){},querySelector(){return null},style:{}}},head:{appendChild(){}},body:{insertAdjacentHTML(){},appendChild(){}},documentElement:{}},
  MutationObserver:class{observe(){}},Intl,Date,Number,String,Math,JSON,RegExp,console,setTimeout(){},HTMLInputElement:class{},Event:class{},CSS:{escape:x=>x}
};
vm.runInNewContext(code, context);
const api = context.window.FFDocumentReader;

test('interpreta importes españoles y anglosajones',()=>{
  assert.equal(api.num('2.014,37 €'),2014.37);
  assert.equal(api.num('€ 2,014.37'),2014.37);
  assert.equal(api.num('17.386 €'),17386);
});

test('prioriza saldo frente a movimientos',()=>{
  const result=api.analyse('ING\nSaldo disponible 2.014,37 €\nÚltimo movimiento -84,50 €\nTransferencia 900,00 €');
  assert.equal(result.amount,2014.37);
  assert.equal(result.institution,'ING');
  assert.equal(result.confidence,'high');
});

test('detecta capital pendiente hipotecario',()=>{
  const result=api.analyse('Hipoteca vivienda\nCapital pendiente 154.330,12 EUR\nCuota mensual 1.100,00 EUR\n04/08/2026');
  assert.equal(result.amount,154330.12);
  assert.equal(result.kind,'debt');
  assert.equal(result.category,'mortgage');
  assert.equal(result.date,'2026-08-04');
});

test('conserva candidatos para confirmación',()=>{
  const result=api.analyse('Saldo total 12.500,00 €\nSaldo disponible 10.000,00 €');
  assert.ok(result.candidates.some(x=>x.amount===12500));
  assert.ok(result.candidates.some(x=>x.amount===10000));
});