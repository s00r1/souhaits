const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.join(__dirname,'..');
const storageKey='dgfip_predictor_map_v5';
const reply=(json,status=200)=>new Response(JSON.stringify(json),{status});
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(check){for(let i=0;i<100;i++){if(check())return;await delay(10);}throw new Error('Condition non satisfaite');}
function boot({saved,fetchImpl,noLeaflet=false,blockedStorage=false}={}){
 const errors=[];const virtualConsole=new VirtualConsole();virtualConsole.on('jsdomError',e=>errors.push(e));
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://s00r1.github.io/souhaits/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole});
 const w=dom.window;
 w.ResizeObserver=class{observe(){}disconnect(){}};
 w.SVGSVGElement.prototype.createSVGRect=()=>({});
 w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({measureText:text=>({width:String(text).length*6})},{get:(object,key)=>key in object?object[key]:(()=>{})});
 Object.defineProperties(w.HTMLElement.prototype,{clientWidth:{get(){return 900;}},clientHeight:{get(){return 600;}},offsetWidth:{get(){return 900;}},offsetHeight:{get(){return 600;}}});
 w.fetch=fetchImpl || (async()=>{throw new TypeError('offline');});
 if(saved)w.localStorage.setItem(storageKey,JSON.stringify(saved));
 if(blockedStorage)Object.defineProperty(w,'localStorage',{get(){throw new Error('blocked');}});
 for(const file of ['assets/vendor/leaflet/leaflet.js','assets/departements.js','assets/groq.js','assets/app.js']){
  if(noLeaflet&&file.includes('leaflet.js'))continue;
  w.eval(fs.readFileSync(path.join(root,file),'utf8'));
 }
 const el=id=>w.document.getElementById(id);const click=id=>el(id).click();
 return {w,el,click,errors,close:()=>w.close()};
}
test('carte intégrée, exemple, simulation, tous les vœux et heatmap fonctionnent sans API',async()=>{
 const app=boot();try{
  assert.match(app.el('mapStatus').textContent,/101 départements/);
  assert.equal(app.w.document.querySelectorAll('.deptNumberLabel').length,101);
  app.click('btnExample');assert.match(app.el('statusBox').textContent,/24 départements analysés/);
  assert.equal(app.el('allResults').querySelectorAll('tbody tr').length,24);
  assert.equal(app.el('top3').children.length,3);assert.doesNotMatch(app.el('kpiOffice').textContent,/NaN|^-/);
  const before=app.el('btnHeatmap').textContent;app.click('btnHeatmap');assert.notEqual(app.el('btnHeatmap').textContent,before);
  app.el('deptSearch').value='44';app.click('btnOpenDept');assert.match(app.el('infoSummary').textContent,/Loire-Atlantique/);
  app.el('mapRegion').value='reunion';app.el('mapRegion').dispatchEvent(new app.w.Event('change'));
  await delay(10);assert.equal(app.errors.length,0,app.errors.map(e=>e.message).join('\n'));
 }finally{app.close();}
});
test('vœux invalides, codes courts, noms proches, doublons et conservation de la masse de probabilité',()=>{
 const app=boot();try{
  app.el('rang').value='317';app.el('souhaits').value='Lot-et-Garonne\nLoire-Atlantique\n44\n1\n2A\n976\nInconnu';app.click('btnCalc');
  const rows=[...app.el('allResults').querySelectorAll('tbody tr')];assert.equal(rows.length,5);
  assert.match(rows[0].textContent,/47/);assert.match(rows[2].textContent,/01/);assert.match(app.el('statusBox').textContent,/Inconnu/);assert.match(app.el('statusBox').textContent,/double/);
  const probabilities=rows.map(row=>parseFloat(row.cells[2].textContent));
  const total=probabilities.reduce((sum,n)=>sum+n,0)+parseFloat(app.el('kpiOffice').textContent);
  assert.ok(Math.abs(total-100)<.5);
  app.el('rang').value='-2';app.click('btnCalc');assert.equal(app.el('allResults').children.length,0);assert.match(app.el('statusBox').textContent,/positif/);
 }finally{app.close();}
});
test('sauvegarde ancienne migrée, poids zéro préservé, clé exclue sans consentement et suppression immédiate',async()=>{
 const app=boot({saved:{rang:'12',pondChoix:'0',souhaits:'44',groqApiKey:'legacy-secret'}});try{
  assert.equal(app.el('pondChoix').value,'0');assert.equal(app.el('groqApiKey').value,'legacy-secret');
  assert.equal(JSON.parse(app.w.localStorage.getItem(storageKey)).groqApiKey,undefined);
  app.click('btnSave');assert.equal(JSON.parse(app.w.localStorage.getItem(storageKey)).groqApiKey,undefined);
  app.el('rememberKey').checked=true;app.el('rememberKey').dispatchEvent(new app.w.Event('change'));
  assert.equal(JSON.parse(app.w.localStorage.getItem(storageKey)).groqApiKey,'legacy-secret');
  app.el('rememberKey').checked=false;app.el('rememberKey').dispatchEvent(new app.w.Event('change'));
  assert.equal(JSON.parse(app.w.localStorage.getItem(storageKey)).groqApiKey,undefined);
  app.click('btnReset');assert.equal(app.w.localStorage.getItem(storageKey),null);assert.equal(app.el('groqApiKey').value,'');
 }finally{app.close();}
});
test('catalogue réel, sélection et analyse : appels sur le modèle choisi, sortie IA traitée comme texte',async()=>{
 const calls=[];const app=boot({fetchImpl:async(url,options)=>{
  if(url.includes('api.groq.com')){
   calls.push({url,options});return reply(url.endsWith('/models')?{data:[{id:'whisper-large-v3'},{id:'openai/gpt-oss-120b'},{id:'llama-3.1-8b-instant'}]}:{choices:[{message:{content:'<img src=x onerror=alert(1)> Analyse française'}}]});
  }throw new TypeError('offline');
 }});try{
  app.el('groqApiKey').value='test-key';app.click('btnScanModels');await until(()=>!app.el('groqModel').disabled);
  assert.equal(app.el('groqModel').options.length,2);assert.equal(app.el('groqModel').value,'openai/gpt-oss-120b');
  app.el('groqModel').value='llama-3.1-8b-instant';app.el('groqModel').dispatchEvent(new app.w.Event('change'));
  app.click('btnTestModel');await until(()=>app.el('groqStatus').textContent.includes('confirmé'));
  app.el('deptSearch').value='44';app.click('btnOpenDept');assert.equal(app.el('btnAnalyze').disabled,false);
  app.click('btnAnalyze');await until(()=>app.el('aiAnalysis').textContent.includes('Analyse française'));
  assert.equal(app.el('aiAnalysis').querySelector('img'),null);assert.match(app.el('aiAnalysis').textContent,/llama-3.1-8b-instant/);
  assert.equal(JSON.parse(calls.at(-1).options.body).model,'llama-3.1-8b-instant');
  app.click('btnExample');assert.equal(app.el('groqApiKey').value,'test-key');
 }finally{app.close();}
});
test('changement de clé et de département ignorent les anciennes réponses en retard',async()=>{
 const pending=[];const app=boot({fetchImpl:(url,options)=>{
  if(url.includes('api.groq.com'))return new Promise(resolve=>pending.push({url,options,resolve}));
  return Promise.reject(new TypeError('offline'));
 }});try{
  app.el('groqApiKey').value='old';app.click('btnScanModels');
  app.el('groqApiKey').value='new';app.el('groqApiKey').dispatchEvent(new app.w.Event('input'));app.click('btnScanModels');
  pending[1].resolve(reply({data:[{id:'new-model'}]}));await until(()=>app.el('groqModel').value==='new-model');
  pending[0].resolve(reply({data:[{id:'old-model'}]}));await delay(20);assert.equal(app.el('groqModel').value,'new-model');
  app.el('deptSearch').value='44';app.click('btnOpenDept');app.click('btnAnalyze');
  app.el('deptSearch').value='33';app.click('btnOpenDept');
  pending[2].resolve(reply({choices:[{message:{content:'OLD DEPARTMENT RESPONSE'}}]}));await delay(20);
  assert.doesNotMatch(app.el('aiAnalysis').textContent,/OLD DEPARTMENT/);assert.match(app.el('infoSummary').textContent,/Gironde/);
 }finally{app.close();}
});
test('stockage bloqué et bibliothèque carte absente ne cassent pas le calcul ni la recherche',async()=>{
 const app=boot({noLeaflet:true,blockedStorage:true});try{
  await delay(5);assert.match(app.el('mapStatus').textContent,/indisponible/);app.click('btnExample');assert.match(app.el('statusBox').textContent,/24 départements/);
  app.el('deptSearch').value='976';app.click('btnOpenDept');assert.match(app.el('infoSummary').textContent,/Mayotte/);
  app.click('btnSave');assert.match(app.el('statusBox').textContent,/bloque/);
 }finally{app.close();}
});
