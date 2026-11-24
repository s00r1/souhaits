/* Deterministic helpers and test-list generator. No model, API or network access. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SouhaitsLocal=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const SCOPES=['metro','all','overseas'];
  const PROFILES=['balanced','random','coast','mountain','budget'];
  function shuffle(values,rng){const out=[...values];for(let i=out.length-1;i>0;i--){const j=Math.min(i,Math.max(0,Math.floor(rng()*(i+1))));[out[i],out[j]]=[out[j],out[i]];}return out;}
  function generateWishes(records,{count=12,profile='balanced',scope='metro'}={},rng=Math.random){
    if(!Number.isInteger(Number(count))||Number(count)<1||Number(count)>101)throw new Error('Choisissez entre 1 et 101 départements.');
    if(!SCOPES.includes(scope)||!PROFILES.includes(profile))throw new Error('Profil ou zone de génération invalide.');
    let pool=Object.entries(records).map(([code,meta])=>({...meta,code})).filter(d=>scope==='all'||(scope==='overseas'?d.code.startsWith('97'):!d.code.startsWith('97')));
    if(profile==='coast')pool=pool.filter(d=>d.sea);
    if(profile==='mountain')pool=pool.filter(d=>d.mountain);
    if(profile==='budget')pool=pool.filter(d=>['€','€€'].includes(d.housing));
    pool=shuffle(pool,rng);
    const total=pool.length,target=Math.min(Number(count),total);
    if(profile==='balanced'){
      const groups=[pool.filter(d=>d.sea),pool.filter(d=>d.mountain),pool.filter(d=>['€','€€'].includes(d.housing)),pool];
      const chosen=[],seen=new Set();
      while(chosen.length<target){
        let changed=false;
        for(const group of groups){while(group.length&&seen.has(group[0].code))group.shift();if(group.length&&chosen.length<target){const d=group.shift();seen.add(d.code);chosen.push(d);changed=true;}}
        if(!changed)break;
      }
      pool=chosen;
    }
    return {wishes:pool.slice(0,target),available:total,requested:Number(count),limited:target<Number(count)};
  }
  function advice(meta,pred,geography){
    const housing=meta.housing||'Non renseigné';
    const facts=[];const strengths=[];const cautions=[];
    if(geography?.region)facts.push(`Région : ${geography.region}.`);
    if(geography?.communes?.[0])facts.push(`Ville la plus peuplée de la base : ${geography.communes[0].nom}.`);
    if(geography?.population)facts.push(`${Number(geography.population).toLocaleString('fr-FR')} habitants dans la photographie communale embarquée.`);
    if(['€','€€'].includes(housing))strengths.push('Le logement est relativement accessible dans les hypothèses locales.');
    else cautions.push('Le budget logement mérite une vérification avec des annonces récentes.');
    if(meta.sea)strengths.push('Le profil du simulateur identifie un département littoral.');
    if(meta.mountain)strengths.push('Le profil du simulateur identifie des zones de montagne.');
    if((meta.quality||0)>=.7)strengths.push('Le cadre de vie obtient un indice élevé dans le modèle local.');
    if(pred){
      facts.push(`Vœu n°${pred.ordre} : ${pred.proba.toFixed(1)} % des affectations de ce scénario simulé.`);
      if(pred.demand>=.7)cautions.push('La demande simulée est élevée : comparez aussi des départements moins tendus.');
      if(pred.proba<2)cautions.push('La part de ce vœu est faible dans ce scénario, sans valeur prédictive officielle.');
    }else cautions.push('Ajoutez ce département à vos vœux pour le comparer dans votre scénario.');
    if(!strengths.length)strengths.push('Comparez les villes, les trajets et les coûts avec vos besoins personnels.');
    cautions.push('Confirmez les postes ouverts et les règles de priorité auprès de la DGFiP.');
    return {facts,strengths,cautions};
  }
  return {generateWishes,advice,shuffle};
});
