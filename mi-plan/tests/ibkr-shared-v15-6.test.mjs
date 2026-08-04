import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function parseCSV(text){const rows=[];let row=[],field='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'&&text[i+1]==='"'){field+='"';i++;}else if(c==='"')quoted=false;else field+=c;}else if(c==='"')quoted=true;else if(c===','){row.push(field);field='';}else if(c==='\n'){row.push(field.replace(/\r$/,''));rows.push(row);row=[];field='';}else field+=c;}if(field||row.length){row.push(field);rows.push(row);}return rows;}
const machine=v=>{const n=Number(String(v??'').trim().replace(/,/g,''));return Number.isFinite(n)?n:0};
const norm=v=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function parseIBKRSnapshot(text){const rows=parseCSV(text);let nav=null,stockExposure=null,optionValue=null,cash=null,baseCurrency='',period='',generatedAt='';const positions=[],open=[];for(const r of rows){if(r[0]==='Información sobre la cuenta'&&r[1]==='Data'&&r[2]==='Divisa base')baseCurrency=r[3];if(r[0]==='Statement'&&r[1]==='Data'&&r[2]==='Period')period=r[3];if(r[0]==='Statement'&&r[1]==='Data'&&r[2]==='WhenGenerated')generatedAt=r[3];const sec=norm(r[0]),kind=norm(r[2]);if(sec==='valor liquidativo'&&r[1]==='Data'){const value=machine(r[6]??r[5]??r[3]);if(kind==='total')nav=value;if(kind==='accion'||kind==='acciones')stockExposure=value;if(kind==='opciones')optionValue=value;if(kind==='efectivo')cash=value;}if(sec==='posiciones abiertas'&&r[1]==='Data'){const asset=norm(r[3]);const e={currency:r[4],symbol:r[5],quantity:machine(r[6]),value:machine(r[11]),unrealized:machine(r[12])};if(['acciones','accion'].includes(asset))positions.push(e);if(asset.includes('opcion'))open.push(e);}}return{detected:nav!==null||positions.length>0,nav,stockExposure,optionValue,cash,baseCurrency,period,generatedAt,positions,positionsCount:positions.length,openOptionsCount:open.length};}

const storage=new Map();
globalThis.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key)};
globalThis.window=globalThis;
globalThis.CustomEvent=class{constructor(type,init){this.type=type;this.detail=init?.detail}};
globalThis.dispatchEvent=()=>{};
globalThis.FFBrokerImport155={parseCSV,parseIBKRSnapshot};
vm.runInThisContext(fs.readFileSync(new URL('../ibkr-shared-v15-6.js',import.meta.url),'utf8'));

const csv=[
  ['Información sobre la cuenta','Data','Divisa base','EUR'],
  ['Statement','Data','Period','Enero 1, 2026 - Julio 31, 2026'],
  ['Valor liquidativo','Data','Efectivo','','','','5000'],
  ['Valor liquidativo','Data','Acción','','','','55000'],
  ['Valor liquidativo','Data','Opciones','','','','-10000'],
  ['Valor liquidativo','Data','Total','','','','50000'],
  ['Posiciones abiertas','Data','','Acciones','EUR','ETF1','10','','','','','12000','1000'],
  ['Posiciones abiertas','Data','','Opciones sobre acciones e índices','USD','AAA 19SEP26 100 P','-1','100','','','','-500','50'],
  ['Operaciones','Data','','Opciones sobre acciones e índices','USD','AAA 19SEP26 100 P','2026-01-10','-1','2','','200','-1','','2200','',''],
  ['Operaciones','Data','','Opciones sobre acciones e índices','USD','AAA 19SEP26 100 P','2026-02-10','1','1','','-100','-1','','-1000','',''],
  ['Operaciones','Total','','Opciones sobre acciones e índices','EUR','','','','','','3000','-50','','2100','',''],
].map(row=>row.map(cell=>`"${String(cell).replaceAll('"','""')}"`).join(',')).join('\n');

test('usa el total convertido a EUR para el resultado de opciones',()=>{
  const result=globalThis.FFIBKRShared156.analyseText(csv,{name:'ibkr.csv'});
  assert.equal(result.nav,50000);
  assert.equal(result.positionsCount,1);
  assert.equal(result.options.realized,2100);
  assert.equal(result.options.monthlyAverage,300);
});

test('la misma importación contiene cartera y estrategia de opciones',()=>{
  const result=globalThis.FFIBKRShared156.analyseText(csv,{name:'ibkr.csv'});
  assert.equal(result.stockExposure,55000);
  assert.equal(result.options.openCount,1);
  assert.equal(result.options.assignmentExposure,10000);
  assert.equal(result.capitalReference,50000);
});
