/* Transparent, exploratory first-assignment scenarios. See METHODOLOGY.md. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SouhaitsPrediction=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function hash(value){let h=2166136261;for(const c of String(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
 function uniform(key){let x=hash(key)+0x6D2B79F5;x=Math.imul(x^x>>>15,x|1);x^=x+Math.imul(x^x>>>7,x|61);return ((x^x>>>14)>>>0)/4294967296;}
 function normal(key){return Math.sqrt(-2*Math.log(Math.max(1e-9,uniform(key+'a'))))*Math.cos(2*Math.PI*uniform(key+'b'));}
 function weighted(rows,field,year,fallback){let sum=0,mass=0;for(const r of rows){if(r.year>=year||!Number.isFinite(r[field]))continue;const w=Math.pow(.65,year-1-r.year);sum+=w*r[field];mass+=w;}return mass?sum/mass:fallback;}
 function rankAt(f,internal){const r=Number(f.rang),main=Number(f.mainSize)||1051;
  if(f.rankMode==='combined')return f.listeType==='LC'?main+r:r;
  if(f.listeType==='LC')return main+r; // no guessed interleaving inside the external-only LC
  if(f.rankMode==='internal')return r+Math.min(r-1,Math.max(0,main-internal));
  return r+Math.min(r,internal);
 }
 function validateRows(rows,catalog,territories){
  if(!Array.isArray(rows)||rows.length>5000)throw new Error('5000 observations maximum.');
  const seen=new Set();return rows.map((raw,index)=>{
   const r={};r.year=Number(raw.year);r.direction=String(raw.direction||'').trim().toUpperCase();r.department=String(raw.department||'').trim().toUpperCase().padStart(2,'0');
   if(!Number.isInteger(r.year)||r.year<2000||r.year>2100||!catalog.some(d=>d.id===r.direction)||!territories[r.department])throw new Error(`Ligne ${index+2} : année, direction ou département invalide.`);
   const agency=catalog.find(d=>d.id===r.direction);if(agency.kind==='territorial'&&!agency.departments.includes(r.department))throw new Error(`Ligne ${index+2} : direction et département incompatibles.`);
   if(raw.scope!=='C_first_admin_national')throw new Error(`Ligne ${index+2} : périmètre requis C_first_admin_national.`);
   r.scope=raw.scope;r.source=String(raw.source||'');if(!/^https:\/\//.test(r.source))throw new Error(`Ligne ${index+2} : lien source HTTPS requis.`);
   for(const field of ['offers','requests','assigned','lastRank']){if(raw[field]!==''&&raw[field]!==null&&raw[field]!==undefined){const n=Number(raw[field]);if(!Number.isInteger(n)||n<0||n>1000000)throw new Error(`Ligne ${index+2} : ${field} doit être un entier positif ou nul.`);r[field]=n;}}
   if(!['offers','requests','assigned','lastRank'].some(f=>f in r))throw new Error(`Ligne ${index+2} : aucune mesure.`);
   if(r.offers!==undefined&&r.assigned!==undefined&&r.assigned>r.offers)throw new Error(`Ligne ${index+2} : affectations supérieures aux postes.`);
   r.key=`${r.direction}@${r.department}`;const key=`${r.year}:${r.key}`;if(seen.has(key))throw new Error(`Ligne ${index+2} : observation en double.`);seen.add(key);return r;
  });
 }
 function parseCSV(text,catalog,territories){
  if(String(text).length>2000000)throw new Error('Fichier trop volumineux (2 Mo maximum).');
  const source=String(text).replace(/^\uFEFF/,''),delimiter=source.split(/\r?\n/)[0].includes(';')?';':',';
  const rows=[];let row=[],cell='',quoted=false;
  for(let i=0;i<=source.length;i++){const c=source[i];if(c==='"'){if(quoted&&source[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if((c===delimiter||c==='\n'||c===undefined)&&!quoted){row.push(cell.replace(/\r$/,''));cell='';if(c!==delimiter){if(row.some(c=>c.trim()))rows.push(row);row=[];}}else if(c!==undefined)cell+=c;}
  if(quoted)throw new Error('Guillemets CSV non fermés.');const headers=(rows.shift()||[]).map(h=>h.trim());if(!['year','direction','department','scope','source'].every(h=>headers.includes(h)))throw new Error('Colonnes requises : year,direction,department,scope,source.');
  if(rows.some(r=>r.length!==headers.length))throw new Error('Nombre de colonnes incohérent.');return validateRows(rows.map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]]))),catalog,territories);
 }
 function aggregate(rows){const map=new Map();for(const row of rows){let a=map.get(row.code);if(!a){a={...row,nom:row.departmentName,proba:0,scenarios:[0,0,0],occurrenceCount:0,occurrenceOrders:[]};map.set(row.code,a);}a.proba+=row.proba;a.occurrenceCount++;a.occurrenceOrders.push(row.ordre);row.scenarios.forEach((p,i)=>a.scenarios[i]+=p);}for(const a of map.values()){a.low=Math.min(...a.scenarios);a.high=Math.max(...a.scenarios);a.score=a.proba/100;}return [...map.values()];}
 function simulate(wishes,f,history,catalog,imports=[],iterations=2400){
  const year=Number(f.campaign)||2027,cohort=Number(f.totalPostes),main=Number(f.mainSize)||1051,rank=Number(f.rang);
  if(!Number.isInteger(year)||year<2024||year>2100||!Number.isInteger(cohort)||cohort<1||cohort>100000||!Number.isInteger(rank)||rank<1||rank>100000||!Number.isInteger(main)||main<1||main>100000)throw new Error('Rang, année, effectif LP et volume national : entiers positifs requis.');
  const internalInput=String(f.internalSize??'').trim();if(internalInput!==''&&(!Number.isInteger(Number(internalInput))||Number(internalInput)<0||Number(internalInput)>main))throw new Error('Effectif interne invalide (entre 0 et le total LP).');
  const national=history.national.filter(r=>r.year<year),attrition=weighted(national,'attrition',year,.1),priorityShare=weighted(national,'priorityRequests',year,450)/Math.max(1,weighted(national,'assigned',year,1300));
  const staffing=history.staff.filter(r=>r.year<year),territorial=staffing.filter(r=>catalog.find(d=>d.id===r.directionCode)?.kind==='territorial');
  const totalStaff=territorial.reduce((s,r)=>s+r.authorized,0)||1,totalDemand=territorial.reduce((s,r)=>s+Math.sqrt(r.authorized),0)||1;
  const idf=['75','77','78','91','92','93','94','95'],idfStaff=territorial.filter(r=>idf.includes(catalog.find(d=>d.id===r.directionCode)?.departments[0])).reduce((s,r)=>s+r.authorized,0)/totalStaff;
  const idfShare=weighted(national,'idfShare',year,idfStaff);
  const descriptions=wishes.map(w=>{
   const staff=staffing.find(r=>r.directionCode===w.directionCode),records=imports.filter(r=>r.key===w.key&&r.year<=year),current=records.find(r=>r.year===year),past=records.filter(r=>r.year<year),cutoffs=past.filter(r=>r.lastRank!==undefined);
   const footprint=staff?.authorized||100;
   // Only territorial staff is used as an indirect size proxy. Agency totals never become site vacancies.
   let share=w.kind==='territorial'?footprint/totalStaff:1/101;
   if(w.kind==='territorial')share*=idf.includes(w.code)?idfShare/Math.max(.001,idfStaff):(1-idfShare)/Math.max(.001,1-idfStaff);
   const obs=w.kind==='territorial'?history.departmentObservations.filter(r=>r.department===w.code&&r.year<year):[];
   const localArrival=weighted(obs,'assigned',year,NaN);if(Number.isFinite(localArrival))share=.65*share+.35*localArrival/Math.max(1,weighted(national,'assigned',year,1300));
   const offers=current?.offers??weighted(past,'offers',year,NaN),requests=current?.requests??weighted(past,'requests',year,NaN);
   const demandShare=w.kind==='territorial'?Math.sqrt(footprint)/totalDemand:1/101;
   let cutoff=cohort*share/Math.max(.00001,demandShare)*.75; // explicit uncalibrated depletion assumption
   let evidence='Effectifs 2023 · hypothèse indirecte';let sigma=.85;
   if(w.kind!=='territorial'){cutoff=cohort*.65;sigma=1.25;evidence='Implantation/postes non confirmés · exploration';}
   if(Number.isFinite(localArrival))evidence='Arrivées départementales observées · capacité à estimer';
   if(Number.isFinite(offers)){cutoff=cohort*(offers/Math.max(1,cohort*share))*share/Math.max(.00001,demandShare)*.75;evidence='Postes importés · demande à estimer';sigma=.7;}
   if(Number.isFinite(offers)&&Number.isFinite(requests)&&requests>0){cutoff=cohort*offers/requests;evidence='Postes et demandes importés';sigma=.45;}
   if(cutoffs.length){cutoff=weighted(cutoffs,'lastRank',year,cutoff);sigma=.35;evidence=`${cutoffs.length} seuil(s) de rang interclassé importé(s)`;}
   if(current?.lastRank!==undefined){cutoff=current.lastRank;sigma=.2;evidence='Seuil de campagne importé · rétrospectif';}
   const closed=current?.offers===0;
   if(closed){cutoff=0;evidence='Aucun poste · donnée de campagne importée';}
   return {...w,cutoff,closed,sigma,evidence,observations:records.length,staff};
  });
  const counts=descriptions.map(()=>[0,0,0]),available=descriptions.map(()=>0),unserved=[0,0,0],rankSamples=[];
  const sensitivity=[.6,1,1.55];
  for(let i=0;i<iterations;i++){
   const key=`souhaits10:${year}:${i}`,shared=normal(key+':national');
   const internal=internalInput!==''?Number(internalInput):Math.round(main*(.08+.22*uniform(key+':internal')));
   const effective=rankAt(f,internal)*(1-clamp(attrition+.025*normal(key+':attrition'),0,.35));rankSamples.push(effective);
   for(let scenario=0;scenario<3;scenario++){
    let winner=-1;
    for(let j=0;j<descriptions.length;j++){
     const d=descriptions[j];if(d.closed)continue;
     const regional=normal(key+':region:'+ (idf.includes(d.code)?'idf':d.code[0]));
     const shock=Math.exp(d.sigma*(.35*shared+.3*regional+.7*normal(key+':'+d.key)));
     const cutoff=d.cutoff*shock*sensitivity[scenario];
     let possible=effective<=cutoff;
     const targeted=f.priorityDept===d.code;
     // Approximation of two alternating queues, never an absolute administrative guarantee.
     if(targeted&&(f.prioHandicap||f.prioConjoint||f.csEnfant||f.csSoutien))possible=possible||effective*clamp(priorityShare,.1,.7)<=cutoff*.5;
     if(possible){if(scenario===1)available[j]++;if(winner===-1)winner=j;}
    }
    if(winner<0)unserved[scenario]++;else counts[winner][scenario]++;
   }
  }
  const rows=descriptions.map((d,j)=>{const scenarios=counts[j].map(n=>100*n/iterations);return {...d,ordre:j+1,proba:scenarios[1],scenarios,low:Math.min(...scenarios),high:Math.max(...scenarios),availability:100*available[j]/iterations,score:scenarios[1]/100};});
  rankSamples.sort((a,b)=>a-b);
  return {rows,byDepartment:aggregate(rows),unserved:100*unserved[1]/iterations,unservedScenarios:unserved.map(n=>100*n/iterations),unservedRange:[Math.min(...unserved)*100/iterations,Math.max(...unserved)*100/iterations],rankRange:[rankSamples[Math.floor(iterations*.1)],rankSamples[Math.floor(iterations*.9)]],iterations,year,attrition,usedYears:national.map(r=>r.year),importedWishes:rows.filter(r=>r.observations).length,priorityTargeted:!!f.priorityDept};
 }
 return {simulate,aggregate,parseCSV,validateRows,rankAt,weighted};
});
