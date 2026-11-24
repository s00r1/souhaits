(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SouhaitsPhotos=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';const CACHE=new Map();const API='https://commons.wikimedia.org/w/api.php';
 function imageUrl(value){try{const url=new URL(value);return url.protocol==='https:'&&url.hostname==='upload.wikimedia.org'?url.href:null;}catch{return null;}}
 function photosFrom(data){
  return Object.values(data?.query?.pages||{}).flatMap(page=>{
   const info=page.imageinfo?.[0],title=String(page.title||'').replace(/^File:/,'');
   const src=imageUrl(info?.thumburl||info?.url);
   if(!src||/\.(svg|pdf|djvu)(?:$|[.?])/i.test(title)||/blason|coat.of.arms|logo|drapeau|flag|locator|circonscription|densit[eé]|carte|\bmap\b|portrait|diagram/i.test(title))return [];
   return [{src,title,source:`https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,author:info.extmetadata?.Artist?.value||'',license:info.extmetadata?.LicenseShortName?.value||'Licence sur la fiche source'}];
  });
 }
 async function request(params,{signal,fetchImpl=globalThis.fetch,timeout=6500}={}){
  const controller=new AbortController(),abort=()=>controller.abort();if(signal?.aborted)controller.abort();signal?.addEventListener('abort',abort,{once:true});const timer=setTimeout(abort,timeout);
  try{const query=new URLSearchParams({action:'query',format:'json',origin:'*',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'800',...params});const response=await fetchImpl(`${API}?${query}`,{signal:controller.signal});if(!response.ok)throw new Error('Photos temporairement indisponibles');const data=await response.json();return photosFrom(data);}
  finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
 }
 async function loadDepartment({code,name,cities=[]},options={}){
  if(CACHE.has(code))return CACHE.get(code);
  const queries=[`"${name}" filetype:bitmap`,`${cities[0]?.nom||name} paysage monument filetype:bitmap`];
  const first=await Promise.allSettled(queries.map(query=>request({generator:'search',gsrsearch:query,gsrnamespace:'6',gsrlimit:'18'},options)));
  let found=first.flatMap(r=>r.status==='fulfilled'?r.value:[]);
  if(found.length<3&&!options.signal?.aborted){
   const coords=cities[0]?.centre?.coordinates;
   if(coords)try{found.push(...await request({generator:'geosearch',ggscoord:`${coords[1]}|${coords[0]}`,ggsradius:'10000',ggsnamespace:'6',ggslimit:'18'},options));}catch(_error){}
  }
  if(options.signal?.aborted){const error=new Error('Annulé');error.name='AbortError';throw error;}
  const seen=new Set();const result=found.filter(photo=>!seen.has(photo.src)&&seen.add(photo.src)).slice(0,6);
  if(result.length)CACHE.set(code,result);return result;
 }
 return {loadDepartment,photosFrom,imageUrl};
});
