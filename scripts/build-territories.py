"""Build the local snapshot from saved official API responses. No runtime API use.
Inputs are described in SOURCES.md; run with --input-dir containing communes/*.json,
departements.json, regions.json. Network retrieval is intentionally separate.
"""
import argparse,json,math
from pathlib import Path
parser=argparse.ArgumentParser();parser.add_argument('--input-dir',required=True);parser.add_argument('--date',required=True);args=parser.parse_args()
root=Path(__file__).resolve().parents[1];source=Path(args.input_dir)
departments=json.loads((source/'departements.json').read_text());regions={r['code']:r['nom'] for r in json.loads((source/'regions.json').read_text())}
raw=(root/'assets/departements.js').read_text();geo=json.loads(raw.split('window.SOUHAITS_GEOJSON = ')[1].rstrip(';\n'))
def ring_area(ring):
 total=0
 for a,b in zip(ring,ring[1:]):total+=math.radians(b[0]-a[0])*(2+math.sin(math.radians(a[1]))+math.sin(math.radians(b[1])))
 return abs(total)*6371.0088**2/2
def polygon_area(rings):return max(0,ring_area(rings[0])-sum(ring_area(r) for r in rings[1:]))
def area(geometry):return sum(polygon_area(p) for p in geometry['coordinates']) if geometry['type']=='MultiPolygon' else polygon_area(geometry['coordinates'])
areas={f['properties']['code']:round(area(f['geometry']),1) for f in geo['features']}
data={}
for d in departments:
 code=d['code'];communes=json.loads((source/'communes'/(code+'.json')).read_text());communes=[c for c in communes if c.get('nom') and isinstance(c.get('population'),(float,int))]
 communes.sort(key=lambda c:c['population'],reverse=True)
 population=sum(c['population'] for c in communes)
 data[code]={'code':code,'nom':d['nom'],'region':regions.get(d.get('codeRegion')),'population':population,'communesCount':len(communes),'areaKm2':areas[code],'density':round(population/areas[code]) if areas[code] else None,'communes':communes[:6]}
assert len(data)==101
for code,d in data.items():
 assert d['communes'] and d['population']>0 and d['areaKm2']>0,code
 for city in d['communes']:assert len(city['centre']['coordinates'])==2,code
payload={'metadata':{'capturedAt':args.date,'source':'API Découpage administratif — geo.api.gouv.fr','license':'Licence Ouverte 2.0','populationMethod':'Somme des populations communales renvoyées à la date de capture ; millésime non exposé dans cette réponse.','areaMethod':'Surface approchée calculée sur les contours simplifiés embarqués.'},'departments':data}
(root/'assets/territoires.js').write_text('/* Données publiques embarquées, Licence Ouverte 2.0. Voir SOURCES.md. */\nwindow.SOUHAITS_TERRITORIES = '+json.dumps(payload,ensure_ascii=False,separators=(',',':'))+';\n')
print(f'{len(data)} fiches locales écrites.')
