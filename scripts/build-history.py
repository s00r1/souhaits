import re,json,csv,argparse
from pathlib import Path
parser=argparse.ArgumentParser();parser.add_argument('--staff-text',required=True);args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
rows=[]
text=Path(args.staff_text).read_text()
# The D69 name and figures span three physical PDF lines. Rejoin before parsing.
text=re.sub(r'DIR\. INF\. RHÔNE-ALPES-AUVERGNE-\s*\n\s*D69\s+BOURGOGNE\s*\n\s*', 'D69 DIR. INF. RHÔNE-ALPES-AUVERGNE-BOURGOGNE ', text)
for line in text.splitlines():
 m=re.match(r'^\s*([A-Z0-9]{3})\s+(.+?)\s+(\d+)\s+(\d+)\s+(-?\d+)\s+(-?[\d,]+)\s+(-?[\d,]+)\s*$',line)
 if m:
  code,name,authorized,headcount,balance,fte,ftebalance=m.groups();rows.append({'directionCode':code,'name':name,'year':2023,'authorized':int(authorized),'headcount':int(headcount),'balance':int(balance),'fte':float(fte.replace(',','.')),'fteBalance':float(ftebalance.replace(',','.')),'source':'staff2023'})
for r in rows:
 if r['directionCode']=='D69':r['name']='DIR. INF. RHÔNE-ALPES-AUVERGNE-BOURGOGNE'
assert len({r['directionCode'] for r in rows})==len(rows)
assert len(rows)==127
assert sum(r['authorized'] for r in rows)==22529
assert sum(r['headcount'] for r in rows)==21590
with (root/'data/staff-2023.csv').open('w',newline='') as f:
 w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
sources=[
 {'id':'staff2023','title':'DGFiP : effectifs C projetés après première affectation 2023, document diffusé par FO','url':'https://www.fo-dgfip-sd.fr/092/IMG/pdf/2023_04_c_stats_mvt2023_.pdf','scope':'Effectifs C de direction, pas postes offerts aux stagiaires ; inclut des contractuels handicapés.','kind':'administrative_table_republished'},
 {'id':'national2026','title':'CFDT : bilan des premières affectations C 2026','url':'https://finances.cfdt.fr/sinformer/actualites-dgfip/premieres-affectations-des-agents-c-stagiaires-les-chiffres-cles-de-la-campagne-2026','scope':'Premières affectations C ; 1152 = 169 IDF + 983 province, hors autres CNAL.','kind':'primary_union_report','access':'Texte indexé consulté, accès direct 403 au moment de la collecte.'},
 {'id':'national2025','title':'CFDT : bilan des premières affectations C 2025','url':'https://finances.cfdt.fr/sinformer/actualites-ecoles-dgfip/affectation-des-laureats-c-2025-chiffres-cles-et-premieres-tendances','scope':'1910 appelés, 1555 affectés : deux populations différentes.','kind':'primary_union_report','access':'Texte indexé consulté.'},
 {'id':'national2024','title':'CFDT : affectations C, bilan chiffré mentionnant 2024','url':'https://finances.cfdt.fr/sinformer/actualites-ecoles-dgfip/affectations-des-c-stagiaires-un-voyage-seme-dembuches','scope':'Données explicitement 2024 dans le corps ; date de publication affichée incohérente (2019). Counts office/priorités corroborés par bilan2026.','kind':'primary_union_report','access':'Texte indexé consulté.'},
 {'id':'rules2026','title':'CGT : guide première affectation agents C stagiaires 2026','url':'https://www.cgtfinancespubliques.fr/IMG/pdf/guide_aide_1ere_affectation_aais_2026.pdf','scope':'Direction + département ; interclassement interne/externe, LP avant LC, alternance prioritaires/rang.','kind':'primary_union_guide'},
 {'id':'paris2023','title':'CGT Paris : mouvements locaux au 1er septembre 2023','url':'https://cgtdgfip75.org/mouvements-a-b-et-c-au-1er-septembre-2023/','scope':'70 arrivées C stagiaires à Paris ; agrégat territorial, pas seuil de rang.','kind':'primary_local_report'},
 {'id':'meurthe2024','title':'FO 54 : premières affectations et mouvements locaux 2024','url':'https://www.fo-dgfip-sd.fr/054/IMG/pdf/prelmieres_affectations_et_mouvements_locaux_1er_septembre_2024.pdf','scope':'15 arrivées C stagiaires dans le département 54.','kind':'primary_local_report'},
 {'id':'seinemarne2025','title':'Solidaires 77 : compte rendu du mouvement local 2025','url':'https://sections.solidairesfinancespubliques.info/770/files/770/documents/Mutations/CR_R%C3%A9union_informelle_Mutation_2025-07-01.pdf','scope':'28 C stagiaires ; ne pas confondre avec 14 B stagiaires.','kind':'primary_local_report'},
 {'id':'longuenesse2026','title':'CFTC : campagne C 2026 et appel spécifique Longuenesse','url':'https://www.cftc-dgfip.fr/affectations-2026-des-stagiaires-c-cest-maintenant/','scope':'40 postes annoncés en appel spécifique ; pas un bonus de probabilité départementale.','kind':'primary_union_guide'}]
national=[
 {'year':2023,'assigned':None,'office':63,'priorityRequests':669,'idfShare':.29,'source':'national2026'},
 {'year':2024,'assigned':1605,'office':68,'priorityRequests':506,'prioritySatisfied':433,'idfAssigned':373,'idfShare':373/1605,'attrition':.158,'source':'national2024','attritionSource':'national2026'},
 {'year':2025,'called':1910,'mainCalled':1048,'complementaryCalled':862,'assigned':1555,'office':47,'priorityRequests':565,'prioritySatisfied':478,'idfAssigned':306,'idfShare':306/1555,'attrition':.116,'source':'national2025','attritionSource':'national2026'},
 {'year':2026,'called':1540,'mainCalled':1051,'complementaryCalled':489,'assigned':1152,'assignedNote':'169 IDF + 983 province ; périmètre national, autres CNAL exclus','office':27,'priorityRequests':412,'prioritySatisfied':359,'idfAssigned':169,'idfShare':169/1152,'attrition':.075,'source':'national2026'}]
observations=[{'year':2023,'department':'75','assigned':70,'source':'paris2023','scope':'department'},{'year':2024,'department':'54','assigned':15,'source':'meurthe2024','scope':'department'},{'year':2025,'department':'59','assigned':34,'source':'national2025','scope':'department'},{'year':2025,'department':'62','assigned':23,'source':'national2025','scope':'department'},{'year':2025,'department':'77','assigned':28,'source':'seinemarne2025','scope':'department'}]
office={2024:{'44':23,'92':17},2025:{'44':11,'92':17,'22':3,'35':8,'37':3,'72':4,'78':1},2026:{'18':6,'22':2,'24':2,'25':2,'29':1,'35':7,'50':1,'58':1,'62':3,'70':2}}
data={'metadata':{'version':'2026-11-24','scope':'Première affectation C administratif DGFiP, France nationale ; simulations conditionnelles à l’appel à l’activité.','validation':'Aucune validation individuelle par rang : les vœux des autres candidats et les postes exacts par couple direction-département ne sont pas publics dans cette base.','staffRows':len(rows),'warnings':['Les effectifs 2023 ne sont pas des postes ouverts.','Les totaux nationaux et arrivées départementales ne sont pas des seuils de classement.','Rupture de périmètre CNAL en 2026 : comparabilité limitée.']},'sources':sources,'national':national,'staff':rows,'departmentObservations':observations,'officeByDepartment':office,'specialApplications':[{'year':2026,'name':'Longuenesse','announced':40,'observedAssigned':27,'sources':['longuenesse2026','national2026'],'scope':'appel spécifique séparé du mouvement général'}]}
(root/'assets/history.js').write_text('/* Historical facts with provenance; no individual prediction is validated. */\nwindow.SOUHAITS_HISTORY = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')
(root/'data/history-reviewed.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
# Territorial IDs are administrative direction codes. Specialized agencies require an explicit department in each wish.
territories=json.loads((root/'assets/territoires.js').read_text().split('window.SOUHAITS_TERRITORIES = ')[1].rstrip(';\n'))['departments']
catalog=[]
for r in rows:
 code=r['directionCode'];dept=code if code in ['971','972','973','974','976'] else code[:2] if re.match(r'^(\d{2}|2A|2B)0$',code) else None
 if dept in territories:catalog.append({'id':code,'name':'DR/DDFiP — '+territories[dept]['nom'],'kind':'territorial','departments':[dept],'aliases':[]})
 else:
  name=r['name'].replace('DIR. INF.','DiSI');aliases=[name]
  aliases+={'A15':['SDNC','SNDC'],'TGE':['DSFIPE'],'D44':['DiSI Centre-Ouest'],'D78':['DiSI Île-de-France'],'D67':['DiSI Grand Est'],'R35':['DIRCOFI Centre-Ouest','DIRCOFI Ouest']}.get(code,[])
  locations={'D44':['44'],'D67':['57'],'R35':['37','45'],'D78':['45'],'A40':['45'],'A15':['13','33'],'TGE':['44']}.get(code,[])
  catalog.append({'id':code,'name':name,'kind':'specialized','departments':locations,'aliases':aliases,'locationNote':'Exemples d’implantations documentées ou indiquées dans le projet ; ouverture de postes non présumée.'})
(root/'assets/direction-catalog.js').write_text('window.SOUHAITS_DIRECTION_CATALOG = '+json.dumps(catalog,ensure_ascii=False,separators=(',',':'))+';\n')
print('staff',len(rows),'directions',len(catalog),'territorial',len([r for r in catalog if r['kind']=='territorial']))
