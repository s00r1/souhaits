(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SouhaitsDirections=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 function normalize(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,' ').replace(/[^a-z0-9]+/g,' ').trim();}
 function department(raw,territories){
  const text=normalize(raw),code=text.match(/(?:^|\s)(97[12346]|2a|2b|0?[1-9]|[1-8][0-9]|9[0-5])(?=\s|$)/i);
  if(code){const id=code[1].toUpperCase().padStart(2,'0');if(territories[id])return id;}
  for(const [id,d] of Object.entries(territories).sort((a,b)=>b[1].nom.length-a[1].nom.length)){const name=normalize(d.nom);if((' '+text+' ').includes(' '+name+' '))return id;}
  return null;
 }
 function parseLine(raw,territories,catalog){
  const text=normalize(raw);if(!text)return null;
  const byId=catalog.find(d=>new RegExp('(?:^| )'+d.id.toLowerCase()+'(?: |$)').test(text));
  let dept=department(raw,territories);
  if(!dept&&byId?.kind==='territorial')dept=byId.departments[0];
  const specialized=catalog.filter(d=>d.kind!=='territorial').sort((a,b)=>Math.max(...b.aliases.map(a=>a.length),b.name.length)-Math.max(...a.aliases.map(a=>a.length),a.name.length));
  let agency=byId||specialized.find(d=>[d.id,d.name,...d.aliases].some(alias=>{const name=normalize(alias);return name&&(' '+text+' ').includes(' '+name+' ');}));
  if(!dept)return null; // A multi-site agency code without a department is intentionally ambiguous.
  if(!agency&&/\b(disi|dircofi|sdnc|sndc|dns|dnef|dvni|dnid|dinr|dsfipe|dge|direction nationale|direction specialisee|service national)\b/.test(text)){
   const name=String(raw).replace(new RegExp('(?:^|\\s)'+dept+'(?=\\s|$)','i'),' ').trim();
   agency={id:'CUSTOM_'+normalize(name).replace(/ /g,'_').toUpperCase(),name,kind:'custom',departments:[]};
  }
  if(!agency)agency=catalog.find(d=>d.kind==='territorial'&&d.departments[0]===dept);
  if(!agency)return null;
  if(agency.kind==='territorial'&&agency.departments[0]!==dept)return null;
  return {key:`${agency.id}@${dept}`,directionCode:agency.id,code:dept,nom:agency.name,departmentName:territories[dept].nom,kind:agency.kind,locationKnown:agency.kind==='territorial'||agency.departments.includes(dept),raw};
 }
 function parse(text,territories,catalog){
  const wishes=[],unknown=[],duplicates=[],seen=new Set();
  for(const raw of String(text).split(/\n+/).map(s=>s.trim()).filter(Boolean)){
   const wish=parseLine(raw,territories,catalog);if(!wish){unknown.push(raw);continue;}
   if(seen.has(wish.key)){duplicates.push(wish.key);continue;}
   seen.add(wish.key);wishes.push(wish);
  }
  return {wishes,unknown,duplicates,departments:new Set(wishes.map(w=>w.code)).size};
 }
 function format(wish){return `${wish.code} ${wish.directionCode} ${wish.nom}`;}
 return {normalize,department,parseLine,parse,format};
});
