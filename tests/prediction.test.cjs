const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const D=require('../assets/directions.js'),P=require('../assets/prediction.js'),ctx={window:{}};vm.createContext(ctx);for(const f of ['territoires','direction-catalog','history'])vm.runInContext(fs.readFileSync(`assets/${f}.js`,'utf8'),ctx);
const H=JSON.parse(JSON.stringify(ctx.window.SOUHAITS_HISTORY)),C=JSON.parse(JSON.stringify(ctx.window.SOUHAITS_DIRECTION_CATALOG)),T=JSON.parse(JSON.stringify(ctx.window.SOUHAITS_TERRITORIES.departments));
const form={campaign:'2027',totalPostes:'1152',mainSize:'1051',internalSize:'200',rang:'317',rankMode:'external',listeType:'LC'};
const wishes=text=>D.parse(text,T,C).wishes,run=(text,f={},imports=[])=>P.simulate(wishes(text),{...form,...f},H,C,imports,600);
test('unité direction + département, aliases SDNC, noms composés, contradictions et agences multisites',()=>{
 const result=D.parse('44 DDFIP\n44 D44\n44 DISI Centre-Ouest\n33 SDNC\n13 SNDC\n57 DiSI Grand Est\nD44\n33 440\nLot-et-Garonne',T,C);
 assert.deepEqual(result.wishes.map(w=>w.key),['440@44','D44@44','A15@33','A15@13','D67@57','470@47']);assert.equal(result.duplicates.length,1);assert.equal(result.unknown.length,2);
 const custom=wishes('44 nouvelle direction XYZ\n44 DDFIP');assert.equal(custom.length,2);assert.equal(custom[0].kind,'custom');assert.equal(D.parseLine(D.format(custom[0]),T,C).key,custom[0].key);
 for(const w of result.wishes)assert.equal(D.parseLine(D.format(w),T,C).key,w.key);
});
test('base de 127 directions vérifiée : effectifs distincts des postes et sources pour chaque fait',()=>{
 assert.equal(H.staff.length,127);assert.equal(C.filter(d=>d.kind==='territorial').length,101);assert.equal(H.staff.reduce((sum,r)=>sum+r.authorized,0),22529);assert.equal(H.staff.reduce((sum,r)=>sum+r.headcount,0),21590);
 for(const row of [...H.staff,...H.national,...H.departmentObservations])assert.ok(H.sources.some(s=>s.id===row.source));assert.equal(H.national.find(r=>r.year===2026).assigned,1152);
});
test('reproductibilité, conservation de la masse, plages et agrégations par scénario',()=>{
 const text='44 DDFIP\n44 D44\n33 SDNC\n75\n31';const a=run(text),b=run(text);assert.deepEqual(a,b);
 for(let i=0;i<3;i++){const sum=a.rows.reduce((s,r)=>s+r.scenarios[i],0);assert.ok(Math.abs(sum+a.unservedScenarios[i]-100)<1e-8);}
 assert.ok(Math.abs(a.rows.reduce((s,r)=>s+r.proba,0)+a.unserved-100)<1e-8);
 const agg=a.byDepartment.find(r=>r.code==='44'),rows=a.rows.filter(r=>r.code==='44');assert.equal(agg.occurrenceCount,2);assert.equal(agg.proba,rows.reduce((s,r)=>s+r.proba,0));assert.equal(agg.low,Math.min(...agg.scenarios));
 for(const row of a.rows){assert.ok(row.low<=row.proba&&row.proba<=row.high);assert.ok(row.proba<=row.availability);}
});
test('ajouter un vœu tardif ne modifie aucune probabilité précédente ; meilleur rang améliore la disponibilité',()=>{
 const a=run('44\n33'),b=run('44\n33\n31');assert.deepEqual(a.rows.map(r=>r.proba),b.rows.slice(0,2).map(r=>r.proba));assert.ok(b.unserved<=a.unserved);
 const better=run('44\n33\n31',{rang:'10'});for(let i=0;i<3;i++)assert.ok(better.rows[i].availability>=b.rows[i].availability);assert.ok(better.unserved<=b.unserved);
});
test('les années futures ne contaminent pas le calcul et les données importées précises sont prioritaires',()=>{
 const text='44\n44 D44',future={year:2028,key:'440@44',direction:'440',department:'44',lastRank:100000,source:'https://example.org',scope:'C_first_admin_national'};
 assert.deepEqual(run(text),run(text,{},[future]));
 const closed={...future,year:2027,offers:0};const a=run(text,{},[closed]);assert.equal(a.rows[0].proba,0);assert.equal(a.rows[0].high,0);assert.match(a.rows[0].evidence,/Aucun poste/);
 const historic=run(text,{campaign:'2025'});assert.deepEqual(historic.usedYears,[2023,2024]);
});
test('LP avant LC, interclassement et priorité ciblée ; Longuenesse hors calcul général',()=>{
 assert.equal(P.rankAt({...form,listeType:'LP',rang:10},200),20);assert.equal(P.rankAt({...form,listeType:'LP',rankMode:'internal',rang:10},200),19);assert.equal(P.rankAt({...form,rankMode:'combined',rang:10},200),1061);
 const a=run('33\n44'),p=run('33\n44',{prioConjoint:true,priorityDept:'44'});assert.equal(a.rows[0].availability,p.rows[0].availability);assert.ok(p.rows[1].availability>=a.rows[1].availability);
 assert.deepEqual(run('62'),run('62',{modeLonguenesse:true}));assert.deepEqual(run('44'),run('44',{prioHandicap:true}));
});
test('CSV strict, zéro explicite, deux directions dans un même département et périmètre',()=>{
 const csv='year;direction;department;offers;requests;assigned;lastRank;source;scope\n2027;440;44;0;;;;https://example.org/a;C_first_admin_national\n2026;D44;44;4;25;4;540;https://example.org/b;C_first_admin_national';
 const rows=P.parseCSV(csv,C,T);assert.equal(rows.length,2);assert.equal(rows[0].offers,0);assert.equal(rows[0].requests,undefined);assert.equal(rows[1].key,'D44@44');
 for(const bad of [csv.replace('C_first_admin_national','mutation'),csv.replace('2027;440;44','2027;440;33'),csv.replace('4;25;4','4;25;5'),csv.replace('https://example.org/a','javascript:alert(1)')])assert.throws(()=>P.parseCSV(bad,C,T));
});
