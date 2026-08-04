import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const code = await readFile(new URL('../broker-import-v15-5-core.js', import.meta.url), 'utf8');
const context = { console };
context.globalThis = context;
vm.runInNewContext(code, context);
const api = context.FFBrokerImport155;

test('calcula total bruto y atribuible por broker', () => {
  const result = api.calculateTotals({brokers:[
    {amount:1400,ownership:50},
    {amount:2676.25,ownership:50},
    {amount:1000,ownership:100}
  ]});
  assert.equal(result.gross, 5076.25);
  assert.equal(result.attributable, 3038.125);
});

test('lee NAV, exposición y posiciones de IBKR', () => {
  const csv = [
    'Statement,Data,Period,"January 1, 2026 - July 31, 2026"',
    'Información sobre la cuenta,Data,Divisa base,EUR',
    'Valor liquidativo,Data,Acción,0,165864.2656432,0,165864.2656432,0',
    'Valor liquidativo,Data,Opciones,0,12633.99,-21178.80,-8544.8192936,0',
    'Valor liquidativo,Data,Efectivo,0,13369.84,-122158.26,-108788.424113776,0',
    'Valor liquidativo,Data,Total,0,309249.94,-261198.55,48051.398167424,0',
    'Posiciones abiertas,Data,Summary,Acciones,USD,ORCL,1096,1,0,0,129.87,142337.52,-28000',
    'Posiciones abiertas,Data,Summary,Acciones,EUR,SXR8,17,1,0,0,696.24,11836.08,1795'
  ].join('\n');
  const result = api.parseIBKRSnapshot(csv);
  assert.equal(result.nav, 48051.398167424);
  assert.equal(result.stockExposure, 165864.2656432);
  assert.equal(result.positionsCount, 2);
});

test('detecta totales en CSV genérico separado por punto y coma', () => {
  const csv = 'Concepto;Importe\nValor total de la cuenta;12.345,67 €\nDividendos;50';
  const result = api.detectGenericTotal(csv);
  assert.equal(result.amount, 12345.67);
  assert.equal(result.confidence, 'high');
});
