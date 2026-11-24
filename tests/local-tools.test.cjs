const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const core=require('../assets/local-tools.js');
const records={'44':{nom:'Loire-Atlantique',sea:true,housing:'€€€'},'73':{nom:'Savoie',mountain:true,housing:'€€€'},'03':{nom:'Allier',housing:'€'},'974':{nom:'La Réunion',sea:true,mountain:true,housing:'€€'}};
test('générateur : unicité et critères littoral, montagne, budget et périmètre',()=>{
 const rng=()=>.42;
 const all=core.generateWishes(records,{count:101,scope:'all'},rng);assert.equal(all.wishes.length,4);assert.equal(new Set(all.wishes.map(d=>d.code)).size,4);assert.equal(all.limited,true);
 for(const profile of ['coast','mountain','budget']){const result=core.generateWishes(records,{count:12,profile,scope:'all'},rng);assert.ok(result.wishes.every(d=>profile==='budget'?['€','€€'].includes(d.housing):d[profile==='coast'?'sea':'mountain']));}
 assert.deepEqual(core.generateWishes(records,{count:10,scope:'overseas'},rng).wishes.map(d=>d.code),['974']);assert.ok(core.generateWishes(records,{count:10,scope:'metro'},rng).wishes.every(d=>d.code!=='974'));
});
test('validation et absence de mutation de la base',()=>{
 const before=JSON.stringify(records);for(const count of [0,102,1.5,NaN])assert.throws(()=>core.generateWishes(records,{count}));assert.throws(()=>core.generateWishes(records,{profile:'bad'}));core.generateWishes(records,{count:2});assert.equal(JSON.stringify(records),before);
});
test('synthèse locale déterministe, fondée sur les données présentes',()=>{
 const meta={code:'44',sea:true,housing:'€€€'},geo={region:'Pays de la Loire',population:100,communes:[{nom:'Nantes'}]},pred={ordre:2,proba:1,demand:.8};
 const a=core.advice(meta,pred,geo);assert.deepEqual(a,core.advice(meta,pred,geo));assert.match(a.facts.join(' '),/Nantes/);assert.match(a.cautions.join(' '),/demande simulée/);assert.doesNotMatch(a.facts.join(' '),/température|loyer/);
});
test('snapshot complet : 101 départements, villes géolocalisées et démographie présente sans API',()=>{
 const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../assets/territoires.js'),'utf8'),sandbox);
 const data=sandbox.window.SOUHAITS_TERRITORIES;assert.equal(Object.keys(data.departments).length,101);
 for(const [code,d] of Object.entries(data.departments)){assert.ok(d.population>0&&d.areaKm2>0,code);assert.ok(d.communes.length>0,code);assert.equal(new Set(d.communes.map(c=>c.code)).size,d.communes.length);for(const c of d.communes){assert.equal(c.centre.coordinates.length,2);assert.ok(c.population>=0);}}
 assert.equal(data.departments['44'].communes[0].nom,'Nantes');assert.equal(data.departments['75'].communes.length,1);
});
