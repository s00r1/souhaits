const {test,expect}=require('@playwright/test');
test.beforeEach(async({page})=>{
 await page.route('**/*',route=>{
  const url=new URL(route.request().url());
  if(url.hostname==='127.0.0.1')return route.continue();
  return route.abort();
 });
});
test('carte, simulation et fiche restent utilisables quand les services externes sont coupés',async({page},testInfo)=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/');await expect(page.locator('#mapStatus')).toContainText('101 départements');
 await expect(page.locator('.deptNumberLabel')).toHaveCount(101);
 await page.getByRole('button',{name:'Exemple',exact:true}).click();await expect(page.locator('#top3 button')).toHaveCount(3);
 await page.locator('#deptSearch').fill('44');await page.locator('#btnOpenDept').click();await expect(page.locator('#selectedDeptBadge')).toContainText('Loire-Atlantique');await expect(page.locator('#infoSummary')).toContainText('Loire-Atlantique');
 await page.locator('#btnHeatmap').click();await expect(page.locator('#btnHeatmap')).toContainText('OFF');
 await page.locator('#mapRegion').selectOption('reunion');
 await page.locator('#deptSearch').fill('974');await page.locator('#btnOpenDept').click();await expect(page.locator('#selectedDeptBadge')).toContainText('La Réunion');
 await expect(page.locator('#map .leaflet-overlay-pane path').first()).toBeAttached();
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth);expect(overflow).toBe(false);expect(errors).toEqual([]);
 await page.screenshot({path:testInfo.outputPath('souhaits.png'),fullPage:true});
});
test('coller une clé découvre les vrais identifiants et transmet le modèle sélectionné',async({page})=>{
 let selected;
 await page.route('https://api.groq.com/openai/v1/**',async route=>{
  if(route.request().url().endsWith('/models'))return route.fulfill({json:{data:[{id:'openai/gpt-oss-120b'},{id:'llama-3.1-8b-instant'},{id:'whisper-large-v3'}]}});
  selected=route.request().postDataJSON().model;
  return route.fulfill({json:{choices:[{message:{content:'Analyse test fournie par Groq.'}}]}});
 });
 await page.goto('/');await page.locator('#groqApiKey').fill('fixture-key');
 await expect(page.locator('#groqModel')).toBeEnabled();await expect(page.locator('#groqModel option')).toHaveCount(2);
 await page.locator('#groqModel').selectOption('llama-3.1-8b-instant');
 await page.locator('#deptSearch').fill('44');await page.locator('#btnOpenDept').click();await page.locator('#btnAnalyze').click();
 await expect(page.locator('#aiAnalysis')).toContainText('Analyse test');expect(selected).toBe('llama-3.1-8b-instant');
 await page.locator('#btnSave').click();const saved=await page.evaluate(()=>localStorage.getItem('dgfip_predictor_map_v5'));expect(saved).not.toContain('fixture-key');
});
test('une erreur Groq ne bloque pas les calculs',async({page})=>{
 await page.route('https://api.groq.com/openai/v1/models',route=>route.fulfill({status:401,json:{error:{message:'bad key'}}}));
 await page.goto('/');await page.locator('#groqApiKey').fill('bad-key');await expect(page.locator('#groqStatus')).toContainText('invalide');
 await page.locator('#btnExample').click();await expect(page.locator('#statusBox')).toContainText('24 départements');
});
