const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.join(__dirname,'..');const storageKey='dgfip_predictor_map_v5';
const reply=json=>new Response(JSON.stringify(json),{status:200});
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function boot({saved,fetchImpl,noLeaflet=false,blockedStorage=false,theme,systemDark=false}={}){
 const errors=[],calls=[],mediaListeners=[];const virtualConsole=new VirtualConsole();virtualConsole.on('jsdomError',e=>errors.push(e));
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://s00r1.github.io/souhaits/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole});const w=dom.window;
 w.ResizeObserver=class{observe(){}disconnect(){}};w.SVGSVGElement.prototype.createSVGRect=()=>({});
 w.matchMedia=()=>({matches:systemDark,addEventListener:(_type,fn)=>mediaListeners.push(fn)});
 w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({measureText:text=>({width:String(text).length*6})},{get:(object,key)=>key in object?object[key]:(()=>{})});
 Object.defineProperties(w.HTMLElement.prototype,{clientWidth:{get(){return 900;}},clientHeight:{get(){return 600;}},offsetWidth:{get(){return 900;}},offsetHeight:{get(){return 600;}}});
 w.fetch=(...args)=>{calls.push(args);return fetchImpl?fetchImpl(...args):Promise.reject(new TypeError('offline'));};
 if(saved)w.localStorage.setItem(storageKey,JSON.stringify(saved));if(theme)w.localStorage.setItem('souhaits_theme_v1',theme);
 if(blockedStorage)Object.defineProperty(w,'localStorage',{get(){throw new Error('blocked');}});
 for(const file of ['assets/theme.js','assets/vendor/leaflet/leaflet.js','assets/departements.js','assets/territoires.js','assets/local-tools.js','assets/app.js']){
  if(noLeaflet&&file.includes('leaflet.js'))continue;w.eval(fs.readFileSync(path.join(root,file),'utf8'));
 }
 w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
 const el=id=>w.document.getElementById(id),click=id=>el(id).click(),change=id=>el(id).dispatchEvent(new w.Event('change'));
 return {w,el,click,change,calls,errors,mediaListeners,close:()=>w.close()};
}
test('les 101 fiches et marqueurs réels, la carte et les calculs sont utilisables sans aucun appel API',()=>{
 const app=boot();try{
  assert.match(app.el('mapStatus').textContent,/101 départements/);assert.equal(app.w.document.querySelectorAll('.deptNumberLabel').length,101);
  app.click('btnExample');assert.match(app.el('statusBox').textContent,/24 départements analysés/);assert.equal(app.el('allResults').querySelectorAll('tbody tr').length,24);
  for(const code of Object.keys(app.w.SOUHAITS_TERRITORIES.departments)){
   app.el('deptSearch').value=code;app.click('btnOpenDept');assert.ok(app.el('cityChips').children.length>0,code);assert.equal(app.el('localAdvice').children.length,3,code);assert.match(app.el('infoSources').textContent,/2026-11-24/);assert.doesNotMatch(app.el('infoPopulation').textContent,/indisponible/);
  }
  assert.equal(app.calls.length,0);assert.equal(app.w.document.querySelectorAll('input[type=password]').length,0);assert.equal(app.errors.length,0);
 }finally{app.close();}
});
test('validation, doublons, somme des parts et invalidation des résultats quand le profil change',()=>{
 const app=boot();try{
  app.el('rang').value='317';app.el('souhaits').value='Lot-et-Garonne\nLoire-Atlantique\n44\n1\n2A\n976\nInconnu';app.click('btnCalc');
  const rows=[...app.el('allResults').querySelectorAll('tbody tr')];assert.equal(rows.length,5);assert.match(rows[0].textContent,/47/);assert.match(app.el('statusBox').textContent,/Inconnu/);assert.match(app.el('statusBox').textContent,/double/);
  const total=rows.reduce((sum,row)=>sum+parseFloat(row.cells[2].textContent),0)+parseFloat(app.el('kpiOffice').textContent);assert.ok(Math.abs(total-100)<.5);
  app.el('rang').value='400';app.el('rang').dispatchEvent(new app.w.Event('input'));assert.equal(app.el('allResults').children.length,0);assert.match(app.el('scenarioSummary').textContent,/après le calcul/);
  app.el('rang').value='-1';app.click('btnCalc');assert.match(app.el('statusBox').textContent,/positif/);
 }finally{app.close();}
});
test('migration des anciens projets : conservation des vœux et suppression de toutes les clés sauvegardées',()=>{
 const app=boot({saved:{rang:'12',pondChoix:'0',souhaits:'44',groqApiKey:'legacy-secret',groqModel:'legacy-model',rememberGroqKey:true},theme:'dark'});try{
  assert.equal(app.el('pondChoix').value,'0');assert.equal(app.el('souhaits').value,'44');
  const saved=JSON.parse(app.w.localStorage.getItem(storageKey));assert.equal(saved.groqApiKey,undefined);assert.equal(saved.groqModel,undefined);assert.equal(saved.rememberGroqKey,undefined);
  app.click('btnSave');assert.doesNotMatch(app.w.localStorage.getItem(storageKey),/legacy-secret/);
  app.click('btnReset');assert.equal(app.w.localStorage.getItem(storageKey),null);assert.equal(app.w.localStorage.getItem('souhaits_theme_v1'),'dark');assert.equal(app.el('wishCount').textContent,'0 département');assert.equal(app.el('btnToggleWish').disabled,true);
 }finally{app.close();}
});
test('génération réglable : 101 départements uniques, filtres, limite outre-mer et conservation du profil',()=>{
 const app=boot();try{
  app.el('rang').value='123';app.el('prioHandicap').checked=true;app.el('testCount').value='101';app.el('testScope').value='all';app.click('btnGenerate');
  const lines=app.el('souhaits').value.split('\n');assert.equal(lines.length,101);assert.equal(new Set(lines).size,101);assert.equal(app.el('rang').value,'123');assert.equal(app.el('prioHandicap').checked,true);assert.equal(app.el('allResults').querySelectorAll('tbody tr').length,101);
  app.el('testScope').value='overseas';app.click('btnGenerate');assert.equal(app.el('souhaits').value.split('\n').length,5);assert.match(app.el('generatorStatus').textContent,/limitée/);assert.ok(app.el('souhaits').value.split('\n').every(line=>line.startsWith('97')));
  const before=app.el('souhaits').value;app.el('testCount').value='0';app.click('btnGenerate');assert.equal(app.el('souhaits').value,before);assert.match(app.el('generatorStatus').textContent,/entre 1 et 101/);
 }finally{app.close();}
});
test('actions carte et réorganisation modifient les vrais vœux et recalculent la projection',()=>{
 const app=boot();try{
  app.el('rang').value='317';app.el('souhaits').value='44 Loire-Atlantique\n33 Gironde';app.click('btnCalc');
  app.el('deptSearch').value='31';app.click('btnOpenDept');app.click('btnToggleWish');assert.match(app.el('souhaits').value,/31 Haute-Garonne/);assert.equal(app.el('allResults').querySelectorAll('tbody tr').length,3);
  app.el('allResults').querySelector('[data-code="31"][data-move="-1"]').click();assert.equal(app.el('souhaits').value.split('\n')[1],'31 Haute-Garonne');
  app.click('btnToggleWish');assert.doesNotMatch(app.el('souhaits').value,/31 Haute-Garonne/);assert.equal(app.el('allResults').querySelectorAll('tbody tr').length,2);
 }finally{app.close();}
});
test('clair/sombre/auto se sauvegardent et restent fonctionnels même si le stockage est bloqué',()=>{
 const app=boot({systemDark:true});try{
  assert.equal(app.w.document.documentElement.dataset.theme,'dark');assert.equal(app.el('themeSelect').value,'system');
  app.el('themeSelect').value='light';app.change('themeSelect');assert.equal(app.w.document.documentElement.dataset.theme,'light');assert.equal(app.w.localStorage.getItem('souhaits_theme_v1'),'light');
  app.el('themeSelect').value='dark';app.change('themeSelect');assert.equal(app.w.document.documentElement.dataset.theme,'dark');assert.equal(app.errors.length,0);
 }finally{app.close();}
 const blocked=boot({blockedStorage:true,noLeaflet:true});try{blocked.el('themeSelect').value='dark';blocked.change('themeSelect');assert.equal(blocked.w.document.documentElement.dataset.theme,'dark');blocked.click('btnGenerate');assert.equal(blocked.el('souhaits').value.split('\n').length,12);blocked.click('btnSave');assert.match(blocked.el('statusBox').textContent,/bloque/);}finally{blocked.close();}
});
test('les compléments externes sont opt-in et une réponse tardive ne remplace pas une fiche après désactivation',async()=>{
 const pending=[];const app=boot({fetchImpl:(url)=>new Promise(resolve=>pending.push({url,resolve}))});try{
  app.el('deptSearch').value='44';app.click('btnOpenDept');assert.equal(pending.length,0);
  app.el('onlineData').checked=true;app.change('onlineData');assert.equal(pending.length,3);
  app.el('onlineData').checked=false;app.change('onlineData');
  for(const request of pending)request.resolve(reply(request.url.includes('wikipedia')?{title:'Bad',extract:'STALE TEXT'}:{}));
  await delay(20);assert.doesNotMatch(app.el('infoSummary').textContent,/STALE TEXT/);assert.match(app.el('infoCities').textContent,/Nantes/);assert.equal(app.el('photoGrid').children.length,0);
 }finally{app.close();}
});
