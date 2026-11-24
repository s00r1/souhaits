const {test,expect}=require('@playwright/test');
test.beforeEach(async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.route('**/*',route=>new URL(route.request().url()).hostname==='127.0.0.1'?route.continue():route.abort());
});
test('simulation, fiches et synthèse locales sans IA ni requête externe, rendus clair et sombre',async({page},testInfo)=>{
 const errors=[],external=[];page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(new URL(request.url()).hostname!=='127.0.0.1')external.push(request.url());});
 await page.goto('/');await expect(page.locator('#mapStatus')).toContainText('101 départements');await expect(page.locator('.deptNumberLabel')).toHaveCount(101);
 await page.locator('#btnGenerate').click();await expect(page.locator('#top3 button')).toHaveCount(3);await expect(page.locator('#allResults tbody tr')).toHaveCount(12);
 await page.locator('#deptSearch').fill('44');await page.locator('#btnOpenDept').click();await expect(page.locator('#infoCities')).toContainText('Nantes');await expect(page.locator('#localAdvice .adviceCard')).toHaveCount(3);await expect(page.locator('#cityHighlight')).toContainText('coordonnées');
 await expect(page.locator('input[type=password]')).toHaveCount(0);await expect(page.locator('#scenarioSummary')).toContainText('12 vœux');
 await page.locator('#btnHeatmap').click();await expect(page.locator('#btnHeatmap')).toContainText('OFF');
 for(const theme of ['light','dark']){await page.locator('#themeSelect').selectOption(theme);await expect(page.locator('html')).toHaveAttribute('data-theme',theme);await page.screenshot({path:testInfo.outputPath(`souhaits-${theme}.png`),fullPage:true});}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);expect(external).toEqual([]);expect(errors).toEqual([]);
});
test('thèmes sauvegardés, mode système et sélection automatique sans dépendre du réseau',async({page})=>{
 await page.goto('/');await page.locator('#themeSelect').selectOption('dark');await page.reload();await expect(page.locator('html')).toHaveAttribute('data-theme','dark');await expect(page.locator('#themeSelect')).toHaveValue('dark');
 await page.locator('#themeSelect').selectOption('light');await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.emulateMedia({colorScheme:'dark',reducedMotion:'reduce'});await page.locator('#themeSelect').selectOption('system');await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.emulateMedia({colorScheme:'light',reducedMotion:'reduce'});await expect(page.locator('html')).toHaveAttribute('data-theme','light');
});
test('générateur filtré, ajout/retrait depuis la carte, réorganisation et téléchargement CSV',async({page})=>{
 await page.goto('/');await page.locator('#testScope').selectOption('overseas');await page.locator('#testCount').fill('20');await page.locator('#btnGenerate').click();await expect(page.locator('#allResults tbody tr')).toHaveCount(5);await expect(page.locator('#generatorStatus')).toContainText('limitée');
 await page.locator('#souhaits').fill('44 Loire-Atlantique\n33 Gironde\n31 Haute-Garonne');await page.locator('#btnCalc').click();await expect(page.locator('#allResults tbody tr')).toHaveCount(3);
 await page.locator('#deptSearch').fill('31');await page.locator('#btnOpenDept').click();await page.locator('#btnToggleWish').click();await expect(page.locator('#allResults tbody tr')).toHaveCount(2);await page.locator('#btnToggleWish').click();await expect(page.locator('#allResults tbody tr')).toHaveCount(3);
 await page.locator('.resultsDetails > summary').click();await page.locator('[data-code="31"][data-move="-1"]').click();await expect(page.locator('#souhaits')).toHaveValue('44 Loire-Atlantique\n31 Haute-Garonne\n33 Gironde');
 const download=page.waitForEvent('download');await page.locator('#btnExport').click();expect((await download).suggestedFilename()).toBe('souhaits-simulation.csv');
});
test('réouverture vraiment hors connexion après mise en cache : carte, données, générateur et thème',async({page,context})=>{
 await page.goto('/');await expect(page.locator('#offlineStatus')).toContainText('prête hors connexion',{timeout:20000});
 await page.evaluate(async()=>{await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));});
 await page.locator('#themeSelect').selectOption('dark');await context.setOffline(true);
 try{
  await page.reload({waitUntil:'domcontentloaded'});await expect(page.locator('#mapStatus')).toContainText('101 départements');await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await page.locator('#testCount').fill('8');await page.locator('#testProfile').selectOption('coast');await page.locator('#btnGenerate').click();await expect(page.locator('#allResults tbody tr')).toHaveCount(8);
  await page.locator('#deptSearch').fill('974');await page.locator('#btnOpenDept').click();await expect(page.locator('#infoCities')).toContainText('Saint-Denis');await expect(page.locator('#infoClimate')).toContainText('tropical');await expect(page.locator('#localAdvice .adviceCard')).toHaveCount(3);
 }finally{await context.setOffline(false);}
});
