const {test} = require('node:test');
const assert = require('node:assert/strict');
const groq = require('../assets/groq.js');
const reply = (data,status=200) => new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
test('catalogue réel : modèles actifs, déduplication, recommandations et exclusions audio/sécurité',()=>{
 const models=groq.selectModels({data:[{id:'whisper-large-v3'},{id:'openai/gpt-oss-120b'},{id:'llama-3.1-8b-instant'},{id:'llama-3.1-8b-instant'},{id:'foo-chat'},{id:'retired',active:false},{id:'openai/gpt-oss-safeguard-20b'},{id:'canopylabs/orpheus-v1-english'}]});
 assert.deepEqual(models.map(m=>m.id),['openai/gpt-oss-120b','llama-3.1-8b-instant','foo-chat']);
 assert.equal(models[0].recommended,true);assert.equal(models[2].recommended,false);
 assert.throws(()=>groq.selectModels({foo:[]}),/invalide/);
});
test('liste et analyse utilisent exactement la clé et le modèle choisis, sans format JSON imposé',async()=>{
 const calls=[];const fetchImpl=async(url,options)=>{calls.push({url,options});return reply(url.endsWith('/models')?{data:[{id:'actual-chat'}]}:{choices:[{message:{content:'Analyse utile'}}]});};
 assert.equal((await groq.listModels(' key ',{fetchImpl}))[0].id,'actual-chat');
 assert.equal(await groq.analyze('key','actual-chat',{code:'44'},{fetchImpl}),'Analyse utile');
 assert.equal(calls[0].options.headers.Authorization,'Bearer key');
 const body=JSON.parse(calls[1].options.body);assert.equal(body.model,'actual-chat');assert.equal(body.response_format,undefined);
});
test('erreurs Groq claires sans recopier une réponse pouvant contenir la clé',async()=>{
 for(const status of [401,403,404,429,500]) await assert.rejects(()=>groq.listModels('secret',{fetchImpl:async()=>reply({error:{message:'secret'}},status)}),error=>!error.message.includes('secret') && error.message.length>15);
 await assert.rejects(()=>groq.analyze('secret','model',{}, {fetchImpl:async()=>reply({choices:[{message:{content:''}}]})}),/vide/);
});
test('timeout et annulation ne laissent pas une requête bloquée',async()=>{
 const fetchImpl=(_url,{signal})=>new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(new DOMException('aborted','AbortError'))));
 await assert.rejects(()=>groq.listModels('key',{fetchImpl,timeout:10}),/trop de temps/);
 const controller=new AbortController();const promise=groq.listModels('key',{fetchImpl,signal:controller.signal});controller.abort();await assert.rejects(()=>promise,/annulée/);
});
