(() => {
      const STORAGE_KEY = "dgfip_predictor_map_v5";
      const GEO_API_BASE = "https://geo.api.gouv.fr";
      const WIKI_API_BASE = "https://fr.wikipedia.org/api/rest_v1/page/summary";
      const OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast";

      const elements = {
        fullscreenButtons: Array.from(document.querySelectorAll(".btnFullscreen")),
        listeType: document.getElementById("listeType"),
        rang: document.getElementById("rang"),
        groqModel: document.getElementById("groqModel"),
        groqApiKey: document.getElementById("groqApiKey"),
        rememberKey: document.getElementById("rememberKey"),
        btnScanModels: document.getElementById("btnScanModels"),
        btnTestModel: document.getElementById("btnTestModel"),
        groqStatus: document.getElementById("groqStatus"),
        btnAnalyze: document.getElementById("btnAnalyze"),
        aiAnalysis: document.getElementById("aiAnalysis"),
        infoSources: document.getElementById("infoSources"),
        mapStatus: document.getElementById("mapStatus"),
        deptSearch: document.getElementById("deptSearch"),
        deptOptions: document.getElementById("deptOptions"),
        btnOpenDept: document.getElementById("btnOpenDept"),
        mapRegion: document.getElementById("mapRegion"),
        allResults: document.getElementById("allResults"),
        btnExport: document.getElementById("btnExport"),
        totalPostes: document.getElementById("totalPostes"),
        prioHandicap: document.getElementById("prioHandicap"),
        prioConjoint: document.getElementById("prioConjoint"),
        csEnfant: document.getElementById("csEnfant"),
        csSoutien: document.getElementById("csSoutien"),
        modeLonguenesse: document.getElementById("modeLonguenesse"),
        pondChoix: document.getElementById("pondChoix"),
        pondAttrac: document.getElementById("pondAttrac"),
        pondTension: document.getElementById("pondTension"),
        souhaits: document.getElementById("souhaits"),
        btnCalc: document.getElementById("btnCalc"),
        btnExample: document.getElementById("btnExample"),
        btnReset: document.getElementById("btnReset"),
        btnSave: document.getElementById("btnSave"),
        btnHeatmap: document.getElementById("btnHeatmap"),
        statusBox: document.getElementById("statusBox"),
        mapOverlay: document.getElementById("mapOverlay"),
        selectedDeptBadge: document.getElementById("selectedDeptBadge"),
        globalDeptBadge: document.getElementById("globalDeptBadge"),
        badges: document.getElementById("badges"),
        kpiTop3: document.getElementById("kpiTop3"),
        kpiOffice: document.getElementById("kpiOffice"),
        kpiRank: document.getElementById("kpiRank"),
        kpiDeptScore: document.getElementById("kpiDeptScore"),
        top3: document.getElementById("top3"),
        dgfipDeptInfo: document.getElementById("dgfipDeptInfo"),
        infoCities: document.getElementById("infoCities"),
        infoPopulation: document.getElementById("infoPopulation"),
        infoNature: document.getElementById("infoNature"),
        infoHousing: document.getElementById("infoHousing"),
        infoRentF2: document.getElementById("infoRentF2"),
        infoHousePrice: document.getElementById("infoHousePrice"),
        infoClimate: document.getElementById("infoClimate"),
        cityChips: document.getElementById("cityChips"),
        cityMeta: document.getElementById("cityMeta"),
        cityHighlight: document.getElementById("cityHighlight"),
        infoSortedMetrics: document.getElementById("infoSortedMetrics"),
        infoSummary: document.getElementById("infoSummary"),
        photoGrid: document.getElementById("photoGrid"),
        radarCanvas: document.getElementById("radarCanvas")
      };

      const state = {
        models: [],
        modelKey: null,
        preferredModel: '',
        modelScanController: null,
        modelTestController: null,
        analysisController: null,
        modelGeneration: 0,
        analysisGeneration: 0,
        map: null,
        geojsonLayer: null,
        deptLabelMarkers: [],
        deptLayersByCode: {},
        predictions: [],
        selectedDeptCode: null,
        selectedDeptName: null,
        selectedDeptRequestId: 0,
        cityMarker: null,
        selectedCityName: null,
        heatmapEnabled: true,
        heatmapLegendControl: null,
        heatmapScale: {
          min: 0,
          max: 100,
          median: 50,
          total: 0,
          byCode: {}
        },
        realDataCache: {}
      };

      const SEA_POINTS = [
        { name:"Dunkerque", lat:51.0344, lng:2.3768 },
        { name:"Le Havre", lat:49.4944, lng:0.1079 },
        { name:"Brest", lat:48.3904, lng:-4.4861 },
        { name:"Lorient", lat:47.7483, lng:-3.3702 },
        { name:"La Rochelle", lat:46.1603, lng:-1.1511 },
        { name:"Bordeaux Lacanau", lat:45.0051, lng:-1.2011 },
        { name:"Biarritz", lat:43.4832, lng:-1.5586 },
        { name:"Sète", lat:43.4028, lng:3.6928 },
        { name:"Marseille", lat:43.2965, lng:5.3698 },
        { name:"Nice", lat:43.7102, lng:7.2620 }
      ];

      const MOUNTAIN_POINTS = [
        { name:"Chamonix", lat:45.9237, lng:6.8694 },
        { name:"Grenoble", lat:45.1885, lng:5.7245 },
        { name:"Briançon", lat:44.8992, lng:6.6421 },
        { name:"Luchon", lat:42.7908, lng:0.5947 },
        { name:"Foix", lat:42.9654, lng:1.6072 },
        { name:"Aurillac", lat:44.9267, lng:2.4413 },
        { name:"Le Puy-en-Velay", lat:45.0437, lng:3.8854 },
        { name:"Gap", lat:44.5596, lng:6.0781 },
        { name:"Annecy", lat:45.8992, lng:6.1294 },
        { name:"Saint-Dié-des-Vosges", lat:48.2884, lng:6.9490 }
      ];

      const HEATMAP_COLORS = [
        "#e4d5ad", "#d8d3a1", "#c8ce96", "#b4c58b", "#9dbd84",
        "#83b382", "#67a680", "#4d9579", "#35816b", "#226f5b", "#155b49"
      ];

      const aliases = {
        "charente maritime":"17",
        "charente-maritime":"17",
        "deux sevres":"79",
        "deux-sevres":"79",
        "deux-sèvres":"79",
        "haute garonne":"31",
        "haute-garonne":"31",
        "pyrenees atlantiques":"64",
        "pyrenees-atlantiques":"64",
        "pyrénées-atlantiques":"64",
        "tarn et garonne":"82",
        "tarn-et-garonne":"82",
        "hautes pyrenees":"65",
        "hautes-pyrenees":"65",
        "hautes-pyrénées":"65",
        "cotes d armor":"22",
        "cotes-d-armor":"22",
        "cotes-d'armor":"22",
        "côtes-d'armor":"22",
        "cotes d’armor":"22",
        "loire atlantique":"44",
        "loire-atlantique":"44",
        "pas de calais":"62",
        "pas-de-calais":"62",
        "seine et marne":"77",
        "seine-et-marne":"77",
        "hauts de seine":"92",
        "hauts-de-seine":"92",
        "seine saint denis":"93",
        "seine-saint-denis":"93",
        "val de marne":"94",
        "val-de-marne":"94",
        "val d oise":"95",
        "val-d-oise":"95",
        "val d’oise":"95",
        "pyrenees orientales":"66",
        "pyrenees-orientales":"66",
        "pyrénées-orientales":"66",
        "bouches du rhone":"13",
        "bouches-du-rhone":"13",
        "bouches-du-rhône":"13",
        "indre et loire":"37",
        "indre-et-loire":"37",
        "maine et loire":"49",
        "maine-et-loire":"49",
        "corse du sud":"2A",
        "haute corse":"2B",
        "territoire de belfort":"90",
        "la reunion":"974",
        "réunion":"974",
        "essonne":"91",
        "charente":"16",
        "vendee":"85",
        "vendée":"85",
        "ariege":"09",
        "ariège":"09",
        "morbihan":"56",
        "finistere":"29",
        "finistère":"29",
        "dordogne":"24",
        "gers":"32",
        "landes":"40",
        "tarn":"81",
        "gironde":"33",
        "haut-rhin":"68",
        "haut rhin":"68",
        "bas-rhin":"67",
        "bas rhin":"67",
        "cote d or":"21",
        "côte d or":"21",
        "cote-d-or":"21",
        "côte-d'or":"21",
        "saone et loire":"71",
        "saône et loire":"71",
        "saone-et-loire":"71",
        "saône-et-loire":"71"
      };

      const deptDB = {
        "01": { nom:"Ain", attractivite:0.56, tension:0.62, sea:false, mountain:false, housing:"€€", bigCities:["Bourg-en-Bresse","Oyonnax"], population:"~660k", quality:0.62 },
        "02": { nom:"Aisne", attractivite:0.33, tension:0.78, sea:false, mountain:false, housing:"€", bigCities:["Saint-Quentin","Laon","Soissons"], population:"~530k", quality:0.46 },
        "03": { nom:"Allier", attractivite:0.39, tension:0.74, sea:false, mountain:false, housing:"€", bigCities:["Vichy","Montluçon","Moulins"], population:"~340k", quality:0.54 },
        "04": { nom:"Alpes-de-Haute-Provence", attractivite:0.58, tension:0.52, sea:false, mountain:true, housing:"€€", bigCities:["Digne-les-Bains","Manosque"], population:"~165k", quality:0.75 },
        "05": { nom:"Hautes-Alpes", attractivite:0.72, tension:0.38, sea:false, mountain:true, housing:"€€", bigCities:["Gap","Briançon"], population:"~145k", quality:0.83 },
        "06": { nom:"Alpes-Maritimes", attractivite:0.90, tension:0.32, sea:true, mountain:true, housing:"€€€€", bigCities:["Nice","Cannes","Antibes"], population:"~1.1M", quality:0.89 },
        "07": { nom:"Ardèche", attractivite:0.63, tension:0.49, sea:false, mountain:true, housing:"€€", bigCities:["Privas","Annonay","Aubenas"], population:"~330k", quality:0.74 },
        "08": { nom:"Ardennes", attractivite:0.29, tension:0.82, sea:false, mountain:false, housing:"€", bigCities:["Charleville-Mézières","Sedan"], population:"~270k", quality:0.45 },
        "09": { nom:"Ariège", attractivite:0.67, tension:0.46, sea:false, mountain:true, housing:"€", bigCities:["Foix","Pamiers","Saint-Girons"], population:"~160k", quality:0.79 },
        "10": { nom:"Aube", attractivite:0.38, tension:0.72, sea:false, mountain:false, housing:"€", bigCities:["Troyes"], population:"~310k", quality:0.51 },
        "11": { nom:"Aude", attractivite:0.66, tension:0.52, sea:true, mountain:false, housing:"€€", bigCities:["Narbonne","Carcassonne"], population:"~380k", quality:0.74 },
        "12": { nom:"Aveyron", attractivite:0.54, tension:0.59, sea:false, mountain:true, housing:"€", bigCities:["Rodez","Millau"], population:"~280k", quality:0.72 },
        "13": { nom:"Bouches-du-Rhône", attractivite:0.88, tension:0.44, sea:true, mountain:false, housing:"€€€", bigCities:["Marseille","Aix-en-Provence","Arles"], population:"~2.0M", quality:0.79 },
        "14": { nom:"Calvados", attractivite:0.70, tension:0.52, sea:true, mountain:false, housing:"€€", bigCities:["Caen","Lisieux"], population:"~700k", quality:0.75 },
        "15": { nom:"Cantal", attractivite:0.35, tension:0.79, sea:false, mountain:true, housing:"€", bigCities:["Aurillac","Saint-Flour"], population:"~145k", quality:0.65 },
        "16": { nom:"Charente", attractivite:0.57, tension:0.61, sea:false, mountain:false, housing:"€", bigCities:["Angoulême","Cognac"], population:"~350k", quality:0.68 },
        "17": { nom:"Charente-Maritime", attractivite:0.84, tension:0.40, sea:true, mountain:false, housing:"€€€", bigCities:["La Rochelle","Rochefort","Saintes"], population:"~660k", quality:0.86 },
        "18": { nom:"Cher", attractivite:0.40, tension:0.70, sea:false, mountain:false, housing:"€", bigCities:["Bourges","Vierzon"], population:"~300k", quality:0.51 },
        "19": { nom:"Corrèze", attractivite:0.50, tension:0.64, sea:false, mountain:true, housing:"€", bigCities:["Brive","Tulle"], population:"~240k", quality:0.65 },
        "2A": { nom:"Corse-du-Sud", attractivite:0.82, tension:0.39, sea:true, mountain:true, housing:"€€€", bigCities:["Ajaccio","Porto-Vecchio"], population:"~165k", quality:0.90 },
        "2B": { nom:"Haute-Corse", attractivite:0.78, tension:0.42, sea:true, mountain:true, housing:"€€€", bigCities:["Bastia","Calvi","Corte"], population:"~190k", quality:0.88 },
        "21": { nom:"Côte-d'Or", attractivite:0.57, tension:0.60, sea:false, mountain:false, housing:"€€", bigCities:["Dijon","Beaune"], population:"~540k", quality:0.66 },
        "22": { nom:"Côtes-d'Armor", attractivite:0.72, tension:0.49, sea:true, mountain:false, housing:"€€", bigCities:["Saint-Brieuc","Lannion","Dinan"], population:"~610k", quality:0.79 },
        "23": { nom:"Creuse", attractivite:0.30, tension:0.83, sea:false, mountain:false, housing:"€", bigCities:["Guéret","Aubusson"], population:"~115k", quality:0.52 },
        "24": { nom:"Dordogne", attractivite:0.69, tension:0.51, sea:false, mountain:false, housing:"€€", bigCities:["Périgueux","Bergerac","Sarlat"], population:"~410k", quality:0.79 },
        "25": { nom:"Doubs", attractivite:0.54, tension:0.60, sea:false, mountain:true, housing:"€€", bigCities:["Besançon","Montbéliard"], population:"~550k", quality:0.68 },
        "26": { nom:"Drôme", attractivite:0.68, tension:0.51, sea:false, mountain:true, housing:"€€", bigCities:["Valence","Montélimar"], population:"~520k", quality:0.74 },
        "27": { nom:"Eure", attractivite:0.54, tension:0.64, sea:false, mountain:false, housing:"€€", bigCities:["Évreux","Vernon"], population:"~610k", quality:0.61 },
        "28": { nom:"Eure-et-Loir", attractivite:0.47, tension:0.69, sea:false, mountain:false, housing:"€€", bigCities:["Chartres","Dreux"], population:"~430k", quality:0.58 },
        "29": { nom:"Finistère", attractivite:0.76, tension:0.47, sea:true, mountain:false, housing:"€€", bigCities:["Brest","Quimper","Morlaix"], population:"~920k", quality:0.83 },
        "30": { nom:"Gard", attractivite:0.75, tension:0.50, sea:false, mountain:false, housing:"€€", bigCities:["Nîmes","Alès","Bagnols"], population:"~760k", quality:0.73 },
        "31": { nom:"Haute-Garonne", attractivite:0.89, tension:0.43, sea:false, mountain:false, housing:"€€€", bigCities:["Toulouse","Colomiers","Muret"], population:"~1.4M", quality:0.84 },
        "32": { nom:"Gers", attractivite:0.65, tension:0.54, sea:false, mountain:false, housing:"€", bigCities:["Auch","Condom"], population:"~195k", quality:0.72 },
        "33": { nom:"Gironde", attractivite:0.92, tension:0.42, sea:true, mountain:false, housing:"€€€€", bigCities:["Bordeaux","Mérignac","Arcachon"], population:"~1.7M", quality:0.86 },
        "34": { nom:"Hérault", attractivite:0.90, tension:0.43, sea:true, mountain:false, housing:"€€€", bigCities:["Montpellier","Béziers","Sète"], population:"~1.25M", quality:0.84 },
        "35": { nom:"Ille-et-Vilaine", attractivite:0.83, tension:0.46, sea:true, mountain:false, housing:"€€€", bigCities:["Rennes","Saint-Malo","Fougères"], population:"~1.1M", quality:0.81 },
        "36": { nom:"Indre", attractivite:0.36, tension:0.77, sea:false, mountain:false, housing:"€", bigCities:["Châteauroux","Issoudun"], population:"~220k", quality:0.49 },
        "37": { nom:"Indre-et-Loire", attractivite:0.74, tension:0.52, sea:false, mountain:false, housing:"€€", bigCities:["Tours","Amboise","Chinon"], population:"~620k", quality:0.76 },
        "38": { nom:"Isère", attractivite:0.84, tension:0.46, sea:false, mountain:true, housing:"€€€", bigCities:["Grenoble","Vienne","Bourgoin"], population:"~1.3M", quality:0.84 },
        "39": { nom:"Jura", attractivite:0.55, tension:0.60, sea:false, mountain:true, housing:"€€", bigCities:["Dole","Lons-le-Saunier"], population:"~260k", quality:0.70 },
        "40": { nom:"Landes", attractivite:0.78, tension:0.45, sea:true, mountain:false, housing:"€€", bigCities:["Mont-de-Marsan","Dax","Biscarrosse"], population:"~430k", quality:0.84 },
        "41": { nom:"Loir-et-Cher", attractivite:0.54, tension:0.64, sea:false, mountain:false, housing:"€€", bigCities:["Blois","Vendôme"], population:"~330k", quality:0.61 },
        "42": { nom:"Loire", attractivite:0.55, tension:0.61, sea:false, mountain:true, housing:"€€", bigCities:["Saint-Étienne","Roanne"], population:"~770k", quality:0.63 },
        "43": { nom:"Haute-Loire", attractivite:0.45, tension:0.66, sea:false, mountain:true, housing:"€", bigCities:["Le Puy-en-Velay"], population:"~225k", quality:0.67 },
        "44": { nom:"Loire-Atlantique", attractivite:0.89, tension:0.43, sea:true, mountain:false, housing:"€€€", bigCities:["Nantes","Saint-Nazaire","Pornic"], population:"~1.45M", quality:0.84 },
        "45": { nom:"Loiret", attractivite:0.56, tension:0.64, sea:false, mountain:false, housing:"€€", bigCities:["Orléans","Montargis"], population:"~680k", quality:0.62 },
        "46": { nom:"Lot", attractivite:0.58, tension:0.59, sea:false, mountain:false, housing:"€", bigCities:["Cahors","Figeac"], population:"~175k", quality:0.73 },
        "47": { nom:"Lot-et-Garonne", attractivite:0.61, tension:0.57, sea:false, mountain:false, housing:"€", bigCities:["Agen","Villeneuve-sur-Lot"], population:"~335k", quality:0.69 },
        "48": { nom:"Lozère", attractivite:0.48, tension:0.68, sea:false, mountain:true, housing:"€", bigCities:["Mende"], population:"~78k", quality:0.71 },
        "49": { nom:"Maine-et-Loire", attractivite:0.72, tension:0.52, sea:false, mountain:false, housing:"€€", bigCities:["Angers","Cholet","Saumur"], population:"~830k", quality:0.74 },
        "50": { nom:"Manche", attractivite:0.62, tension:0.58, sea:true, mountain:false, housing:"€€", bigCities:["Cherbourg","Saint-Lô","Granville"], population:"~500k", quality:0.73 },
        "51": { nom:"Marne", attractivite:0.50, tension:0.67, sea:false, mountain:false, housing:"€€", bigCities:["Reims","Châlons-en-Champagne"], population:"~565k", quality:0.58 },
        "52": { nom:"Haute-Marne", attractivite:0.28, tension:0.85, sea:false, mountain:false, housing:"€", bigCities:["Chaumont","Saint-Dizier"], population:"~170k", quality:0.44 },
        "53": { nom:"Mayenne", attractivite:0.47, tension:0.66, sea:false, mountain:false, housing:"€", bigCities:["Laval","Mayenne"], population:"~305k", quality:0.58 },
        "54": { nom:"Meurthe-et-Moselle", attractivite:0.52, tension:0.64, sea:false, mountain:false, housing:"€€", bigCities:["Nancy","Lunéville"], population:"~730k", quality:0.61 },
        "55": { nom:"Meuse", attractivite:0.25, tension:0.86, sea:false, mountain:false, housing:"€", bigCities:["Bar-le-Duc","Verdun"], population:"~185k", quality:0.43 },
        "56": { nom:"Morbihan", attractivite:0.83, tension:0.44, sea:true, mountain:false, housing:"€€€", bigCities:["Vannes","Lorient","Auray"], population:"~770k", quality:0.85 },
        "57": { nom:"Moselle", attractivite:0.53, tension:0.63, sea:false, mountain:false, housing:"€€", bigCities:["Metz","Thionville"], population:"~1.05M", quality:0.60 },
        "58": { nom:"Nièvre", attractivite:0.31, tension:0.80, sea:false, mountain:false, housing:"€", bigCities:["Nevers","Cosne"], population:"~205k", quality:0.46 },
        "59": { nom:"Nord", attractivite:0.63, tension:0.58, sea:true, mountain:false, housing:"€€", bigCities:["Lille","Dunkerque","Valenciennes"], population:"~2.6M", quality:0.67 },
        "60": { nom:"Oise", attractivite:0.56, tension:0.63, sea:false, mountain:false, housing:"€€", bigCities:["Beauvais","Compiègne"], population:"~830k", quality:0.61 },
        "61": { nom:"Orne", attractivite:0.39, tension:0.74, sea:false, mountain:false, housing:"€", bigCities:["Alençon","Argentan"], population:"~280k", quality:0.54 },
        "62": { nom:"Pas-de-Calais", attractivite:0.52, tension:0.66, sea:true, mountain:false, housing:"€", bigCities:["Arras","Calais","Boulogne","Saint-Omer"], population:"~1.5M", quality:0.64, longuenesseBonus:0.45 },
        "63": { nom:"Puy-de-Dôme", attractivite:0.63, tension:0.57, sea:false, mountain:true, housing:"€€", bigCities:["Clermont-Ferrand","Issoire"], population:"~670k", quality:0.76 },
        "64": { nom:"Pyrénées-Atlantiques", attractivite:0.84, tension:0.43, sea:true, mountain:true, housing:"€€€", bigCities:["Pau","Bayonne","Biarritz"], population:"~700k", quality:0.89 },
        "65": { nom:"Hautes-Pyrénées", attractivite:0.71, tension:0.49, sea:false, mountain:true, housing:"€€", bigCities:["Tarbes","Lourdes"], population:"~230k", quality:0.81 },
        "66": { nom:"Pyrénées-Orientales", attractivite:0.79, tension:0.47, sea:true, mountain:true, housing:"€€", bigCities:["Perpignan","Argelès"], population:"~490k", quality:0.82 },
        "67": { nom:"Bas-Rhin", attractivite:0.72, tension:0.51, sea:false, mountain:false, housing:"€€€", bigCities:["Strasbourg","Haguenau"], population:"~1.15M", quality:0.74 },
        "68": { nom:"Haut-Rhin", attractivite:0.64, tension:0.56, sea:false, mountain:true, housing:"€€", bigCities:["Mulhouse","Colmar"], population:"~780k", quality:0.71 },
        "69": { nom:"Rhône", attractivite:0.88, tension:0.45, sea:false, mountain:false, housing:"€€€€", bigCities:["Lyon","Villeurbanne"], population:"~1.9M", quality:0.80 },
        "70": { nom:"Haute-Saône", attractivite:0.36, tension:0.77, sea:false, mountain:false, housing:"€", bigCities:["Vesoul"], population:"~235k", quality:0.50 },
        "71": { nom:"Saône-et-Loire", attractivite:0.52, tension:0.63, sea:false, mountain:false, housing:"€€", bigCities:["Mâcon","Chalon-sur-Saône"], population:"~550k", quality:0.62 },
        "72": { nom:"Sarthe", attractivite:0.51, tension:0.62, sea:false, mountain:false, housing:"€€", bigCities:["Le Mans","La Flèche"], population:"~565k", quality:0.60 },
        "73": { nom:"Savoie", attractivite:0.85, tension:0.40, sea:false, mountain:true, housing:"€€€", bigCities:["Chambéry","Albertville"], population:"~450k", quality:0.87 },
        "74": { nom:"Haute-Savoie", attractivite:0.94, tension:0.31, sea:false, mountain:true, housing:"€€€€", bigCities:["Annecy","Thonon","Annemasse"], population:"~860k", quality:0.91 },
        "75": { nom:"Paris", attractivite:0.79, tension:0.54, sea:false, mountain:false, housing:"€€€€", bigCities:["Paris"], population:"~2.1M", quality:0.73 },
        "76": { nom:"Seine-Maritime", attractivite:0.56, tension:0.61, sea:true, mountain:false, housing:"€€", bigCities:["Rouen","Le Havre","Dieppe"], population:"~1.25M", quality:0.66 },
        "77": { nom:"Seine-et-Marne", attractivite:0.65, tension:0.60, sea:false, mountain:false, housing:"€€", bigCities:["Melun","Meaux","Serris"], population:"~1.45M", quality:0.63 },
        "78": { nom:"Yvelines", attractivite:0.76, tension:0.54, sea:false, mountain:false, housing:"€€€", bigCities:["Versailles","Saint-Germain","Mantes"], population:"~1.45M", quality:0.72 },
        "79": { nom:"Deux-Sèvres", attractivite:0.55, tension:0.62, sea:false, mountain:false, housing:"€", bigCities:["Niort","Bressuire"], population:"~375k", quality:0.65 },
        "80": { nom:"Somme", attractivite:0.42, tension:0.74, sea:true, mountain:false, housing:"€", bigCities:["Amiens","Abbeville"], population:"~570k", quality:0.56 },
        "81": { nom:"Tarn", attractivite:0.63, tension:0.56, sea:false, mountain:false, housing:"€", bigCities:["Albi","Castres"], population:"~395k", quality:0.71 },
        "82": { nom:"Tarn-et-Garonne", attractivite:0.64, tension:0.55, sea:false, mountain:false, housing:"€", bigCities:["Montauban","Moissac"], population:"~265k", quality:0.71 },
        "83": { nom:"Var", attractivite:0.90, tension:0.36, sea:true, mountain:false, housing:"€€€€", bigCities:["Toulon","Hyères","Fréjus"], population:"~1.1M", quality:0.86 },
        "84": { nom:"Vaucluse", attractivite:0.74, tension:0.50, sea:false, mountain:false, housing:"€€", bigCities:["Avignon","Carpentras"], population:"~570k", quality:0.73 },
        "85": { nom:"Vendée", attractivite:0.83, tension:0.44, sea:true, mountain:false, housing:"€€", bigCities:["La Roche-sur-Yon","Les Sables"], population:"~700k", quality:0.84 },
        "86": { nom:"Vienne", attractivite:0.54, tension:0.61, sea:false, mountain:false, housing:"€", bigCities:["Poitiers","Châtellerault"], population:"~440k", quality:0.63 },
        "87": { nom:"Haute-Vienne", attractivite:0.48, tension:0.65, sea:false, mountain:false, housing:"€", bigCities:["Limoges"], population:"~375k", quality:0.59 },
        "88": { nom:"Vosges", attractivite:0.37, tension:0.76, sea:false, mountain:true, housing:"€", bigCities:["Épinal","Saint-Dié"], population:"~360k", quality:0.54 },
        "89": { nom:"Yonne", attractivite:0.45, tension:0.68, sea:false, mountain:false, housing:"€", bigCities:["Auxerre","Sens"], population:"~335k", quality:0.57 },
        "90": { nom:"Territoire de Belfort", attractivite:0.41, tension:0.71, sea:false, mountain:false, housing:"€€", bigCities:["Belfort"], population:"~140k", quality:0.56 },
        "91": { nom:"Essonne", attractivite:0.79, tension:0.56, sea:false, mountain:false, housing:"€€€", bigCities:["Évry-Courcouronnes","Massy","Corbeil"], population:"~1.3M", quality:0.69 },
        "92": { nom:"Hauts-de-Seine", attractivite:0.75, tension:0.58, sea:false, mountain:false, housing:"€€€€", bigCities:["Nanterre","Boulogne","Courbevoie"], population:"~1.6M", quality:0.68 },
        "93": { nom:"Seine-Saint-Denis", attractivite:0.47, tension:0.79, sea:false, mountain:false, housing:"€€", bigCities:["Saint-Denis","Montreuil","Aubervilliers"], population:"~1.7M", quality:0.50 },
        "94": { nom:"Val-de-Marne", attractivite:0.70, tension:0.60, sea:false, mountain:false, housing:"€€€", bigCities:["Créteil","Vincennes","Ivry"], population:"~1.4M", quality:0.64 },
        "95": { nom:"Val-d'Oise", attractivite:0.61, tension:0.66, sea:false, mountain:false, housing:"€€", bigCities:["Cergy","Argenteuil","Sarcelles"], population:"~1.25M", quality:0.60 },
        "971": { nom:"Guadeloupe", attractivite:0.88, tension:0.30, sea:true, mountain:false, housing:"€€", bigCities:["Pointe-à-Pitre","Basse-Terre"], population:"~380k", quality:0.84 },
        "972": { nom:"Martinique", attractivite:0.87, tension:0.30, sea:true, mountain:false, housing:"€€", bigCities:["Fort-de-France"], population:"~350k", quality:0.84 },
        "973": { nom:"Guyane", attractivite:0.50, tension:0.60, sea:true, mountain:false, housing:"€€", bigCities:["Cayenne","Kourou"], population:"~310k", quality:0.61 },
        "974": { nom:"La Réunion", attractivite:0.92, tension:0.26, sea:true, mountain:true, housing:"€€", bigCities:["Saint-Denis","Saint-Pierre"], population:"~880k", quality:0.91 },
        "976": { nom:"Mayotte", attractivite:0.32, tension:0.90, sea:true, mountain:false, housing:"€€", bigCities:["Mamoudzou"], population:"~320k", quality:0.42 }
      };

      const DEPT_FLOW_STATS = {
        "01": { postesMoyens:35, tendancePostes:1, demandesMoyennes:132, tendanceDemandes:1 },
        "02": { postesMoyens:39, tendancePostes:2, demandesMoyennes:103, tendanceDemandes:-2 },
        "03": { postesMoyens:35, tendancePostes:2, demandesMoyennes:103, tendanceDemandes:-1 },
        "04": { postesMoyens:27, tendancePostes:0, demandesMoyennes:123, tendanceDemandes:1 },
        "05": { postesMoyens:23, tendancePostes:-2, demandesMoyennes:136, tendanceDemandes:2 },
        "06": { postesMoyens:31, tendancePostes:-2, demandesMoyennes:201, tendanceDemandes:2 },
        "07": { postesMoyens:28, tendancePostes:-1, demandesMoyennes:134, tendanceDemandes:2 },
        "08": { postesMoyens:37, tendancePostes:2, demandesMoyennes:88, tendanceDemandes:-2 },
        "09": { postesMoyens:25, tendancePostes:-1, demandesMoyennes:131, tendanceDemandes:2 },
        "10": { postesMoyens:35, tendancePostes:2, demandesMoyennes:99, tendanceDemandes:-1 },
        "11": { postesMoyens:29, tendancePostes:-1, demandesMoyennes:141, tendanceDemandes:2 },
        "12": { postesMoyens:30, tendancePostes:0, demandesMoyennes:123, tendanceDemandes:1 },
        "13": { postesMoyens:43, tendancePostes:-2, demandesMoyennes:228, tendanceDemandes:2 },
        "14": { postesMoyens:32, tendancePostes:-1, demandesMoyennes:158, tendanceDemandes:2 },
        "15": { postesMoyens:35, tendancePostes:2, demandesMoyennes:100, tendanceDemandes:-1 },
        "16": { postesMoyens:31, tendancePostes:1, demandesMoyennes:122, tendanceDemandes:1 },
        "17": { postesMoyens:28, tendancePostes:-2, demandesMoyennes:172, tendanceDemandes:2 },
        "18": { postesMoyens:34, tendancePostes:2, demandesMoyennes:101, tendanceDemandes:-1 },
        "19": { postesMoyens:31, tendancePostes:1, demandesMoyennes:116, tendanceDemandes:0 },
        "2A": { postesMoyens:23, tendancePostes:-2, demandesMoyennes:156, tendanceDemandes:2 },
        "2B": { postesMoyens:24, tendancePostes:-2, demandesMoyennes:153, tendanceDemandes:2 },
        "21": { postesMoyens:33, tendancePostes:0, demandesMoyennes:130, tendanceDemandes:1 },
        "22": { postesMoyens:31, tendancePostes:-1, demandesMoyennes:157, tendanceDemandes:2 },
        "23": { postesMoyens:36, tendancePostes:2, demandesMoyennes:85, tendanceDemandes:-2 },
        "24": { postesMoyens:29, tendancePostes:-1, demandesMoyennes:139, tendanceDemandes:2 },
        "25": { postesMoyens:33, tendancePostes:1, demandesMoyennes:133, tendanceDemandes:1 },
        "26": { postesMoyens:30, tendancePostes:-1, demandesMoyennes:146, tendanceDemandes:2 },
        "27": { postesMoyens:35, tendancePostes:1, demandesMoyennes:128, tendanceDemandes:0 },
        "28": { postesMoyens:35, tendancePostes:1, demandesMoyennes:114, tendanceDemandes:0 },
        "29": { postesMoyens:33, tendancePostes:-1, demandesMoyennes:175, tendanceDemandes:2 },
        "30": { postesMoyens:32, tendancePostes:-1, demandesMoyennes:156, tendanceDemandes:2 },
        "31": { postesMoyens:37, tendancePostes:-2, demandesMoyennes:198, tendanceDemandes:2 },
        "32": { postesMoyens:28, tendancePostes:0, demandesMoyennes:124, tendanceDemandes:2 },
        "33": { postesMoyens:39, tendancePostes:-2, demandesMoyennes:222, tendanceDemandes:2 },
        "34": { postesMoyens:35, tendancePostes:-2, demandesMoyennes:200, tendanceDemandes:2 },
        "35": { postesMoyens:34, tendancePostes:-2, demandesMoyennes:187, tendanceDemandes:2 },
        "36": { postesMoyens:35, tendancePostes:2, demandesMoyennes:93, tendanceDemandes:-1 },
        "37": { postesMoyens:31, tendancePostes:-1, demandesMoyennes:150, tendanceDemandes:2 },
        "38": { postesMoyens:37, tendancePostes:-2, demandesMoyennes:195, tendanceDemandes:2 },
        "39": { postesMoyens:30, tendancePostes:0, demandesMoyennes:123, tendanceDemandes:1 },
        "40": { postesMoyens:27, tendancePostes:-2, demandesMoyennes:156, tendanceDemandes:2 },
        "41": { postesMoyens:32, tendancePostes:1, demandesMoyennes:117, tendanceDemandes:0 },
        "42": { postesMoyens:36, tendancePostes:1, demandesMoyennes:142, tendanceDemandes:1 },
        "43": { postesMoyens:32, tendancePostes:1, demandesMoyennes:112, tendanceDemandes:0 },
        "44": { postesMoyens:37, tendancePostes:-2, demandesMoyennes:208, tendanceDemandes:2 },
        "45": { postesMoyens:36, tendancePostes:1, demandesMoyennes:133, tendanceDemandes:1 },
        "46": { postesMoyens:29, tendancePostes:0, demandesMoyennes:118, tendanceDemandes:1 },
        "47": { postesMoyens:30, tendancePostes:0, demandesMoyennes:125, tendanceDemandes:1 },
        "48": { postesMoyens:31, tendancePostes:1, demandesMoyennes:110, tendanceDemandes:0 },
        "49": { postesMoyens:34, tendancePostes:-1, demandesMoyennes:157, tendanceDemandes:2 },
        "50": { postesMoyens:32, tendancePostes:0, demandesMoyennes:142, tendanceDemandes:2 },
        "51": { postesMoyens:36, tendancePostes:1, demandesMoyennes:122, tendanceDemandes:0 },
        "52": { postesMoyens:37, tendancePostes:2, demandesMoyennes:83, tendanceDemandes:-2 },
        "53": { postesMoyens:33, tendancePostes:1, demandesMoyennes:109, tendanceDemandes:0 },
        "54": { postesMoyens:36, tendancePostes:1, demandesMoyennes:132, tendanceDemandes:0 },
        "55": { postesMoyens:37, tendancePostes:2, demandesMoyennes:81, tendanceDemandes:-2 },
        "56": { postesMoyens:31, tendancePostes:-2, demandesMoyennes:175, tendanceDemandes:2 },
        "57": { postesMoyens:40, tendancePostes:1, demandesMoyennes:146, tendanceDemandes:0 },
        "58": { postesMoyens:36, tendancePostes:2, demandesMoyennes:88, tendanceDemandes:-2 },
        "59": { postesMoyens:54, tendancePostes:0, demandesMoyennes:229, tendanceDemandes:2 },
        "60": { postesMoyens:37, tendancePostes:1, demandesMoyennes:139, tendanceDemandes:1 },
        "61": { postesMoyens:35, tendancePostes:2, demandesMoyennes:100, tendanceDemandes:-1 },
        "62": { postesMoyens:45, tendancePostes:1, demandesMoyennes:173, tendanceDemandes:1 },
        "63": { postesMoyens:34, tendancePostes:0, demandesMoyennes:148, tendanceDemandes:1 },
        "64": { postesMoyens:29, tendancePostes:-2, demandesMoyennes:179, tendanceDemandes:2 },
        "65": { postesMoyens:27, tendancePostes:-1, demandesMoyennes:138, tendanceDemandes:2 },
        "66": { postesMoyens:28, tendancePostes:-1, demandesMoyennes:164, tendanceDemandes:2 },
        "67": { postesMoyens:37, tendancePostes:-1, demandesMoyennes:170, tendanceDemandes:2 },
        "68": { postesMoyens:34, tendancePostes:0, demandesMoyennes:152, tendanceDemandes:1 },
        "69": { postesMoyens:42, tendancePostes:-2, demandesMoyennes:217, tendanceDemandes:2 },
        "70": { postesMoyens:35, tendancePostes:2, demandesMoyennes:94, tendanceDemandes:-1 },
        "71": { postesMoyens:34, tendancePostes:1, demandesMoyennes:125, tendanceDemandes:0 },
        "72": { postesMoyens:34, tendancePostes:1, demandesMoyennes:124, tendanceDemandes:0 },
        "73": { postesMoyens:26, tendancePostes:-2, demandesMoyennes:161, tendanceDemandes:2 },
        "74": { postesMoyens:28, tendancePostes:-2, demandesMoyennes:187, tendanceDemandes:2 },
        "75": { postesMoyens:47, tendancePostes:-1, demandesMoyennes:215, tendanceDemandes:2 },
        "76": { postesMoyens:41, tendancePostes:1, demandesMoyennes:166, tendanceDemandes:1 },
        "77": { postesMoyens:42, tendancePostes:0, demandesMoyennes:173, tendanceDemandes:1 },
        "78": { postesMoyens:40, tendancePostes:-1, demandesMoyennes:185, tendanceDemandes:2 },
        "79": { postesMoyens:32, tendancePostes:1, demandesMoyennes:121, tendanceDemandes:1 },
        "80": { postesMoyens:38, tendancePostes:2, demandesMoyennes:123, tendanceDemandes:0 },
        "81": { postesMoyens:30, tendancePostes:0, demandesMoyennes:130, tendanceDemandes:1 },
        "82": { postesMoyens:29, tendancePostes:0, demandesMoyennes:126, tendanceDemandes:1 },
        "83": { postesMoyens:32, tendancePostes:-2, demandesMoyennes:195, tendanceDemandes:2 },
        "84": { postesMoyens:30, tendancePostes:-1, demandesMoyennes:147, tendanceDemandes:2 },
        "85": { postesMoyens:30, tendancePostes:-2, demandesMoyennes:172, tendanceDemandes:2 },
        "86": { postesMoyens:33, tendancePostes:1, demandesMoyennes:122, tendanceDemandes:1 },
        "87": { postesMoyens:33, tendancePostes:1, demandesMoyennes:113, tendanceDemandes:0 },
        "88": { postesMoyens:36, tendancePostes:2, demandesMoyennes:107, tendanceDemandes:-1 },
        "89": { postesMoyens:34, tendancePostes:1, demandesMoyennes:108, tendanceDemandes:-1 },
        "90": { postesMoyens:32, tendancePostes:2, demandesMoyennes:96, tendanceDemandes:-1 },
        "91": { postesMoyens:39, tendancePostes:-1, demandesMoyennes:180, tendanceDemandes:2 },
        "92": { postesMoyens:43, tendancePostes:0, demandesMoyennes:189, tendanceDemandes:2 },
        "93": { postesMoyens:51, tendancePostes:2, demandesMoyennes:164, tendanceDemandes:-1 },
        "94": { postesMoyens:42, tendancePostes:0, demandesMoyennes:175, tendanceDemandes:1 },
        "95": { postesMoyens:42, tendancePostes:1, demandesMoyennes:161, tendanceDemandes:1 },
        "971": { postesMoyens:23, tendancePostes:-2, demandesMoyennes:163, tendanceDemandes:2 },
        "972": { postesMoyens:23, tendancePostes:-2, demandesMoyennes:160, tendanceDemandes:2 },
        "973": { postesMoyens:31, tendancePostes:1, demandesMoyennes:121, tendanceDemandes:1 },
        "974": { postesMoyens:27, tendancePostes:-2, demandesMoyennes:194, tendanceDemandes:2 },
        "976": { postesMoyens:39, tendancePostes:2, demandesMoyennes:100, tendanceDemandes:-2 },
      };
      function setStatus(msg){
        elements.statusBox.textContent = msg;
      }

      function normalizeText(str){
        return (str || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[’']/g," ")
          .replace(/-/g," ")
          .replace(/\s+/g," ")
          .trim();
      }

      function clamp(n,min,max){
        return Math.max(min, Math.min(max, n));
      }

      function pct(n){
        return `${n.toFixed(1)}%`;
      }

      function computeHeatmapScale(predictions){
        const sorted = [...(predictions || [])]
          .filter(p => p && Number.isFinite(Number(p.proba)))
          .sort((a,b) => (Number(a.proba) - Number(b.proba)) || String(a.code).localeCompare(String(b.code)));

        if(!sorted.length){
          return { min:0, max:100, median:50, total:0, byCode:{} };
        }

        const probs = sorted.map(p => clamp(Number(p.proba) || 0, 0, 100));
        const min = probs[0];
        const max = probs[probs.length - 1];
        const median = probs[Math.floor((probs.length - 1) / 2)];
        const byCode = {};

        if(sorted.length === 1){
          byCode[sorted[0].code] = 0.5;
        } else {
          sorted.forEach((pred, idx) => {
            byCode[pred.code] = idx / (sorted.length - 1);
          });
        }

        return { min, max, median, total: sorted.length, byCode };
      }

      function heatmapColorForDept(code, proba){
        const scale = state.heatmapScale || { byCode:{} };
        const rankedRatio = scale.byCode?.[code];
        let normalized = Number.isFinite(rankedRatio) ? rankedRatio : null;

        if(normalized === null){
          const p = clamp(Number(proba) || 0, 0, 100);
          const spread = Math.max((scale.max - scale.min) || 0, 0.001);
          normalized = clamp((p - scale.min) / spread, 0, 1);
        }

        const idx = Math.round(clamp(normalized, 0, 1) * (HEATMAP_COLORS.length - 1));
        return HEATMAP_COLORS[idx];
      }

      function formatLegendPct(value){
        return `${(Number(value) || 0).toFixed(1)}%`;
      }

      function heatmapLegendMarkup(){
        const gradient = `linear-gradient(90deg, ${HEATMAP_COLORS.join(",")})`;
        const scale = state.heatmapScale || { min:0, max:100, median:50, total:0 };

        return `
          <h4>Vos scores, en perspective</h4>
          <div class="scale" style="background:${gradient};"></div>
          <div class="ticks"><span>Plus faible</span><span>Médiane</span><span>Plus élevé</span></div>
          <div class="small muted">Parts simulées : ${formatLegendPct(scale.min)} → ${formatLegendPct(scale.max)} (médiane ${formatLegendPct(scale.median)})</div>
          <div class="small muted">${scale.total || 0} département(s) classé(s) sur la liste</div>
          <div class="missing"><span class="chip"></span>département non présent</div>
        `;
      }

      function refreshHeatmapLegend(){
        if(!state.heatmapLegendControl) return;
        const container = state.heatmapLegendControl.getContainer?.();
        if(container){
          container.innerHTML = heatmapLegendMarkup();
        }
      }

      function createHeatmapLegend(){
        const control = L.control({ position: "bottomright" });
        control.onAdd = () => {
          const div = L.DomUtil.create("div", "heatmapLegend");
          div.innerHTML = heatmapLegendMarkup();
          L.DomEvent.disableClickPropagation(div);
          return div;
        };
        return control;
      }

      function updateHeatmapUi(){
        elements.btnHeatmap.classList.toggle("active", state.heatmapEnabled);
        elements.btnHeatmap.textContent = `Scores simulés : ${state.heatmapEnabled ? "ON" : "OFF"}`;
      }

      function toggleHeatmap(){
        state.heatmapEnabled = !state.heatmapEnabled;

        if(state.map && state.heatmapLegendControl){
          if(state.heatmapEnabled){
            state.heatmapLegendControl.addTo(state.map);
          } else {
            state.map.removeControl(state.heatmapLegendControl);
          }
        }

        updateHeatmapUi();
      updateFullscreenButtons();
        updateMapStyling();
      }


      function updateFullscreenButtons(){
        const activePanel = document.fullscreenElement || document.webkitFullscreenElement || null;
        elements.fullscreenButtons.forEach(btn => {
          const targetClass = btn.dataset.fullscreenTarget;
          const panel = targetClass ? document.querySelector(`.${targetClass}`) : null;
          const isActive = !!panel && panel === activePanel;
          btn.classList.toggle("active", isActive);
          btn.textContent = isActive ? "Réduire ↙" : "Agrandir ↗";
        });
      }

      async function togglePanelFullscreen(targetClass){
        const panel = document.querySelector(`.${targetClass}`);
        if(!panel) return;
        const active = document.fullscreenElement || document.webkitFullscreenElement;

        try{
          if(active === panel){
            if(document.exitFullscreen) await document.exitFullscreen();
            else if(document.webkitExitFullscreen) document.webkitExitFullscreen();
          } else {
            if(active && document.exitFullscreen) await document.exitFullscreen();
            if(panel.requestFullscreen) await panel.requestFullscreen();
            else if(panel.webkitRequestFullscreen) panel.webkitRequestFullscreen();
          }
          if(state.map){
            setTimeout(() => state.map.invalidateSize(), 120);
          }
        }catch(err){
          console.error(err);
          setStatus(`Impossible de basculer en fullscreen: ${err.message}`);
        } finally {
          updateFullscreenButtons();
        }
      }

      function scoreStr(n){
        return n.toFixed(3);
      }

      function parsePopulation(popStr){
        if(!popStr) return 300000;
        const s = String(popStr).toLowerCase().replace("~","").trim();
        if(s.includes("m")){
          const num = parseFloat(s.replace("m","").trim());
          return isNaN(num) ? 300000 : Math.round(num * 1000000);
        }
        if(s.includes("k")){
          const num = parseFloat(s.replace("k","").trim());
          return isNaN(num) ? 300000 : Math.round(num * 1000);
        }
        const num = parseInt(s.replace(/[^\d]/g,""),10);
        return isNaN(num) ? 300000 : num;
      }

      function housingToScore(h){
        if(h === "€") return 0.15;
        if(h === "€€") return 0.35;
        if(h === "€€€") return 0.62;
        if(h === "€€€€") return 0.90;
        return 0.45;
      }

      function cityImportance(pop){
        if(pop >= 450000) return "MÉTROPOLE";
        if(pop >= 180000) return "PÔLE MAJEUR";
        return "VILLE PRINCIPALE";
      }

      function estimateDepartmentMetrics(meta){
        const pop = parsePopulation(meta.population);
        const housingScore = housingToScore(meta.housing || "€€");
        const attr = meta.attractivite || 0.5;
        const tension = meta.tension || 0.5;
        const quality = meta.quality || 0.5;

        const rentF2 = Math.round(380 + (housingScore * 560) + (attr * 180));
        const house3p = Math.round(90000 + (housingScore * 220000) + (attr * 120000) + (quality * 60000));
        const house4p = Math.round(house3p * 1.22);

        const summer = {
          tempMax: Math.round(24 + (attr * 5) + (meta.sea ? -1 : 1)),
          nights: Math.round(14 + (attr * 4) + (meta.sea ? 1 : 0))
        };

        const winter = {
          tempMin: Math.round(1 + (quality * 4) + (meta.mountain ? -4 : 1)),
          rains: Math.round(50 + (tension * 22) + (meta.sea ? 15 : 0) + (meta.mountain ? 10 : 0))
        };

        const seaDistance = meta.sea ? 12 : Math.round(110 + ((1 - attr) * 180));
        const mountainDistance = meta.mountain ? 18 : Math.round(120 + ((1 - quality) * 210));
        const density = Math.max(25, Math.round(pop / (4200 - (attr * 1800))));

        return {
          rentF2,
          house3p,
          house4p,
          summer,
          winter,
          seaDistance,
          mountainDistance,
          density
        };
      }

      function cityProfile(meta){
        const cities = (meta.bigCities || []).slice(0, 6);
        const basePop = parsePopulation(meta.population || "300k");
        const ratios = [0.24, 0.14, 0.10, 0.07, 0.05, 0.04];

        return cities.map((city, i) => {
          const estPop = Math.max(22000, Math.round(basePop * (ratios[i] || 0.03)));
          const citySea = meta.sea ? Math.max(4, 18 + i * 12) : Math.round(70 + i * 38 + ((1 - (meta.attractivite || 0.5)) * 90));
          const cityMountain = meta.mountain ? Math.max(5, 22 + i * 14) : Math.round(95 + i * 32 + ((1 - (meta.quality || 0.5)) * 110));
          return {
            name: city,
            estPop,
            importance: cityImportance(estPop),
            distanceSeaKm: citySea,
            distanceMountainKm: cityMountain
          };
        });
      }

      function formatEUR(v){
        return `${v.toLocaleString("fr-FR")} €`;
      }

      function safeNum(v, fallback){
        if(v === null || v === undefined || v === "") return fallback;
        const n = Number(v);
        return Number.isFinite(n) ? n : fallback;
      }

      function normalizeSearchText(value){
        return String(value || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
      }


      function toKm(distanceMeters){
        if(!Number.isFinite(distanceMeters)) return null;
        return Math.round(distanceMeters / 1000);
      }

      async function fetchJson(url, timeout = 7000){
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);
        try {
          const res = await fetch(url, {signal:controller.signal});
          if(!res.ok) throw new Error(`HTTP ${res.status}`);
          return await res.json();
        } finally { clearTimeout(timer); }
      }

      function formatDeptCodeForApi(code){
        if(/^\d$/.test(code)) return `0${code}`;
        return String(code).toUpperCase();
      }

      async function fetchDepartmentFromApi(code){
        const c = formatDeptCodeForApi(code);
        const base = `${GEO_API_BASE}/departements/${encodeURIComponent(c)}`;
        const [dept, communes] = await Promise.all([
          fetchJson(`${base}?fields=nom,code,codeRegion,region,centre`).catch(()=>null),
          fetchJson(`${base}/communes?fields=nom,population,centre&format=json`).catch(()=>[])
        ]);

        const sortedCommunes = Array.isArray(communes)
          ? communes
              .filter(c => c?.nom && Number.isFinite(Number(c?.population)))
              .sort((a,b) => Number(b.population) - Number(a.population))
          : [];

        return {
          dept: dept || null,
          communes: sortedCommunes
        };
      }

      async function fetchWeatherByCoords(lat, lng){
        const url = `${OPEN_METEO_BASE}?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Europe%2FParis&forecast_days=7`;
        return fetchJson(url);
      }

      async function fetchWikipediaSummary(title){
        const url = `${WIKI_API_BASE}/${encodeURIComponent(title)}`;
        return fetchJson(url);
      }

      function firstValidCoord(...coords){
        for(const c of coords){
          if(c && Number.isFinite(Number(c.lat)) && Number.isFinite(Number(c.lng))){
            return { lat:Number(c.lat), lng:Number(c.lng) };
          }
          if(Array.isArray(c?.coordinates) && c.coordinates.length >= 2){
            const [lng, lat] = c.coordinates;
            if(Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))){
              return { lat:Number(lat), lng:Number(lng) };
            }
          }
        }
        return null;
      }

      function fallbackCenterFromLayer(code){
        const layer = state.deptLayersByCode[code];
        if(!layer) return null;
        const center = layer.getBounds().getCenter();
        return { lat:center.lat, lng:center.lng };
      }

      async function buildRealDepartmentData(code, name){
        if(state.realDataCache[code]) return state.realDataCache[code];
        const [apiData, wikiDept] = await Promise.all([
          fetchDepartmentFromApi(code),
          fetchWikipediaSummary(`${name} (département)`).catch(() => null)
        ]);
        const topCommunes = apiData.communes.slice(0, 6);
        const center = firstValidCoord(topCommunes[0]?.centre, apiData.dept?.centre, fallbackCenterFromLayer(code));
        const real = {
          name:apiData.dept?.nom || name, code, region:apiData.dept?.region?.nom || null,
          center, communes:topCommunes,
          population:apiData.communes.reduce((sum,c) => sum + Number(c.population || 0), 0),
          weather:center ? await fetchWeatherByCoords(center.lat, center.lng).catch(() => null) : null,
          wikiDept
        };
        // Do not cache a complete outage; a later selection can retry.
        if(topCommunes.length || wikiDept || real.weather) state.realDataCache[code] = real;
        return real;
      }

      function metroScore(meta){
        const cities = meta.bigCities || [];
        const pop = parsePopulation(meta.population);
        let base = 0;
        if(pop >= 1500000) base += 0.35;
        else if(pop >= 900000) base += 0.26;
        else if(pop >= 500000) base += 0.18;
        else if(pop >= 250000) base += 0.10;
        base += Math.min(cities.length * 0.06, 0.24);
        return clamp(base, 0, 1);
      }

      function flowTrendToFactor(t){
        const trend = Number(t || 0);
        if(trend >= 2) return 1.22;
        if(trend >= 1) return 1.10;
        if(trend <= -2) return 0.80;
        if(trend <= -1) return 0.90;
        return 1;
      }

      function getDeptFlowStats(code){
        return DEPT_FLOW_STATS[code] || {
          postesMoyens: 24,
          tendancePostes: 0,
          demandesMoyennes: 95,
          tendanceDemandes: 0
        };
      }

      function flowCapacityIndex(code){
        const st = getDeptFlowStats(code);
        const base = clamp(st.postesMoyens / 72, 0.08, 1);
        return clamp(base * flowTrendToFactor(st.tendancePostes), 0.06, 1);
      }

      function flowDemandIndex(code){
        const st = getDeptFlowStats(code);
        const base = clamp(st.demandesMoyennes / 340, 0.08, 1);
        return clamp(base * flowTrendToFactor(st.tendanceDemandes), 0.06, 1.2);
      }

      function flowPressureIndex(code){
        const cap = flowCapacityIndex(code);
        const dem = flowDemandIndex(code);
        const raw = dem / Math.max(cap, 0.08);
        return clamp(raw / 2, 0.22, 1.4);
      }

      function capacityIndex(meta, code){
        const pop = parsePopulation(meta.population);
        let popScore = 0;
        if(pop >= 1800000) popScore = 1.00;
        else if(pop >= 1300000) popScore = 0.88;
        else if(pop >= 900000) popScore = 0.74;
        else if(pop >= 600000) popScore = 0.61;
        else if(pop >= 350000) popScore = 0.48;
        else if(pop >= 180000) popScore = 0.34;
        else popScore = 0.22;

        const cityCountScore = clamp((meta.bigCities?.length || 1) / 4, 0.20, 1);
        const tensionScore = clamp(meta.tension || 0.5, 0, 1);
        const metro = metroScore(meta);
        const flowCap = flowCapacityIndex(code);

        return clamp(
          (popScore * 0.26) +
          (cityCountScore * 0.10) +
          (tensionScore * 0.16) +
          (metro * 0.10) +
          (flowCap * 0.38),
          0.05,
          1
        );
      }

      function demandIndex(meta, code){
        const housingScore = housingToScore(meta.housing);
        const metro = metroScore(meta);
        const seaBonus = meta.sea ? 0.10 : 0;
        const mountainBonus = meta.mountain ? 0.08 : 0;
        const flowDem = flowDemandIndex(code);

        return clamp(
          ((meta.attractivite || 0.5) * 0.20) +
          ((meta.quality || 0.5) * 0.10) +
          (housingScore * 0.08) +
          (metro * 0.08) +
          seaBonus +
          mountainBonus +
          (flowDem * 0.44),
          0.05,
          1.25
        );
      }

      function securityProfile(meta, code, ordre, totalWishes){
        if(totalWishes <= 1) return 0;
        const lateRatio = ordre / totalWishes;
        const lowDemand = 1 - demandIndex(meta, code);
        const goodCapacity = capacityIndex(meta, meta.code || "");

        if(lateRatio < 0.42) return 0;

        return clamp(
          ((lateRatio - 0.42) / 0.58) * 0.28 +
          (lowDemand * 0.15) +
          (goodCapacity * 0.07),
          0,
          0.34
        );
      }

      function wishOrderFactor(ordre, totalWishes, pondChoix){
        const pos = (ordre - 1) / Math.max(totalWishes - 1, 1);
        const earlyBoost = Math.pow(1 - pos, 1.35);
        return clamp(
          1 + ((earlyBoost - 0.5) * pondChoix * 0.34),
          0.56,
          1.42
        );
      }

      function ambitionPenalty(meta, ordre, totalWishes, rankStrength, f){
        const dem = demandIndex(meta, meta.code);
        const cap = capacityIndex(meta, meta.code);
        const posRatio = ordre / Math.max(totalWishes, 1);

        if(posRatio > 0.45) return 0;

        const rankFragility = 1 - rankStrength;
        const overDemand = Math.max(0, dem - cap);
        const glam = Math.max(0, (meta.attractivite || 0.5) - 0.72);
        const earlyPressure = 1 - posRatio;

        let penalty =
          (rankFragility * 0.28) +
          (overDemand * 0.34) +
          (glam * 0.22) +
          (earlyPressure * 0.16);

        if(f.listeType === "LC") penalty *= 1.12;
        if(ordre <= 5 && dem > 0.78) penalty *= 1.18;
        if(ordre <= 10 && dem > 0.84) penalty *= 1.15;

        return clamp(penalty, 0, 0.55);
      }

      function rankStrengthFromInputs(rang, totalPostes, listeType){
        const ratio = clamp(rang / Math.max(totalPostes,1), 0, 4);
        let s = 1 - ratio;

        if(listeType === "LC"){
          s *= 0.50;
          if(rang > totalPostes * 0.25) s *= 0.88;
          if(rang > totalPostes * 0.35) s *= 0.86;
        } else {
          s *= 1.04;
        }

        return clamp(s, 0.015, 0.98);
      }

      function badgeHtml(stateData, wishesCount){
        const arr = [];
        arr.push(`<span class="badge">Liste ${stateData.listeType}</span>`);
        arr.push(`<span class="badge">Rang ${stateData.rang || "?"}</span>`);
        arr.push(`<span class="badge">${wishesCount} vœux</span>`);
        if(stateData.prioHandicap) arr.push(`<span class="badge">Handicap/RQTH</span>`);
        if(stateData.prioConjoint) arr.push(`<span class="badge">Conjoint/PACS</span>`);
        if(stateData.csEnfant) arr.push(`<span class="badge">CS enfants</span>`);
        if(stateData.csSoutien) arr.push(`<span class="badge">CS soutien</span>`);
        if(stateData.modeLonguenesse) arr.push(`<span class="badge">Simulation Longuenesse</span>`);
        return arr.join("");
      }

      function findDeptCode(raw){
        const clean = normalizeText(raw);
        const codeMatch = clean.match(/(?:^|\s)(97[1-6]|2a|2b|0?[1-9]|[1-8][0-9]|9[0-5])(?=\s|$)/i);
        if(codeMatch){
          const code = codeMatch[1].toUpperCase().padStart(2, "0");
          if(deptDB[code]) return code;
        }
        if(aliases[clean]) return aliases[clean];
        const names = Object.entries(deptDB).sort((a,b) => b[1].nom.length - a[1].nom.length);
        const exact = names.find(([,obj]) => normalizeText(obj.nom) === clean);
        if(exact) return exact[0];
        const partial = names.find(([,obj]) => clean.includes(normalizeText(obj.nom)));
        return partial ? partial[0] : null;
      }

      function parseSouhaits(text){
        const lines = text.split(/\n+/).map(s=>s.trim()).filter(Boolean);
        const out = [], seen = new Set(), rejected = [], duplicates = [];
        for(const line of lines){
          const code = findDeptCode(line);
          if(!code){ rejected.push(line); continue; }
          if(seen.has(code)){ duplicates.push(code); continue; }
          seen.add(code); out.push({code,nom:deptDB[code].nom,raw:line});
        }
        state.inputWarnings = [rejected.length ? `Lignes non reconnues : ${rejected.join(", ")}.` : "",
          duplicates.length ? `Départements en double ignorés : ${duplicates.join(", ")}.` : ""].filter(Boolean).join(" ");
        return out;
      }

      function aggregatePredictionsByDept(results){
        const byDept = new Map();

        for(const row of results){
          if(!byDept.has(row.code)){
            byDept.set(row.code, {
              ...row,
              occurrenceCount: 1,
              occurrenceOrders: [row.ordre]
            });
            continue;
          }

          const agg = byDept.get(row.code);
          const countBefore = agg.occurrenceCount;

          agg.proba += row.proba;
          agg.occurrenceCount += 1;
          agg.occurrenceOrders.push(row.ordre);
          agg.conditionalChance = Math.max(agg.conditionalChance, row.conditionalChance);
          agg.remainingAfter = Math.min(agg.remainingAfter, row.remainingAfter);
          agg.security = Math.max(agg.security, row.security);
          agg.ambition = Math.min(agg.ambition, row.ambition);
          agg.score = ((agg.score * countBefore) + row.score) / agg.occurrenceCount;
          agg.ordre = Math.min(agg.ordre, row.ordre);
        }

        return Array.from(byDept.values()).sort((a,b) => a.ordre - b.ordre);
      }

      function getFormData(){
        return {
          listeType: elements.listeType.value,
          rang: elements.rang.value,
          groqModel: elements.groqModel.value,
          totalPostes: elements.totalPostes.value,
          prioHandicap: elements.prioHandicap.checked,
          prioConjoint: elements.prioConjoint.checked,
          csEnfant: elements.csEnfant.checked,
          csSoutien: elements.csSoutien.checked,
          modeLonguenesse: elements.modeLonguenesse.checked,
          pondChoix: elements.pondChoix.value,
          pondAttrac: elements.pondAttrac.value,
          pondTension: elements.pondTension.value,
          souhaits: elements.souhaits.value
        };
      }

      function setFormData(data){
        if(!data) return;
        elements.listeType.value = data.listeType || "LC";
        elements.rang.value = data.rang || "";
        state.preferredModel = data.groqModel || "";
        if(state.models.some(m => m.id === state.preferredModel)) elements.groqModel.value = state.preferredModel;
        if(typeof data.groqApiKey === "string") elements.groqApiKey.value = data.groqApiKey;
        elements.totalPostes.value = data.totalPostes || "790";
        elements.prioHandicap.checked = !!data.prioHandicap;
        elements.prioConjoint.checked = !!data.prioConjoint;
        elements.csEnfant.checked = !!data.csEnfant;
        elements.csSoutien.checked = !!data.csSoutien;
        elements.modeLonguenesse.checked = !!data.modeLonguenesse;
        elements.pondChoix.value = data.pondChoix ?? "1.2";
        elements.pondAttrac.value = data.pondAttrac ?? "2.2";
        elements.pondTension.value = data.pondTension ?? "1.8";
        elements.souhaits.value = data.souhaits || "";
      }

      function saveLocal(){
        try {
          const data = getFormData();
          if(elements.rememberKey.checked){ data.groqApiKey = elements.groqApiKey.value.trim(); data.rememberGroqKey = true; }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          setStatus("Réglages sauvegardés sur cet appareil." + (elements.rememberKey.checked ? " Clé incluse." : " Clé non enregistrée."));
        } catch (_error) { setStatus("Sauvegarde impossible : le navigateur bloque le stockage local."); }
      }

      function loadLocal(){
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if(!raw) return;
          const data = JSON.parse(raw);
          setFormData(data);
          // Migrate old plaintext saved keys into memory only. V7 persistence needs explicit opt-in.
          if(data.groqApiKey && data.rememberGroqKey === true) elements.rememberKey.checked = true;
          else if(data.groqApiKey){ delete data.groqApiKey; localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
          setStatus("Réglages précédents rechargés.");
        } catch (_error) { setStatus("Ancienne sauvegarde illisible ou stockage indisponible. Tu peux continuer."); }
      }

      function computeConditionalChance({f, meta, ordre, totalWishes, rankStrength}){
        const pondAttrac = Number(f.pondAttrac || 2.2);
        const pondTension = Number(f.pondTension || 1.8);
        const pondChoix = Number(f.pondChoix || 1.2);

        const cap = capacityIndex(meta, meta.code);
        const dem = demandIndex(meta, meta.code);
        const flowCap = flowCapacityIndex(meta.code);
        const flowDem = flowDemandIndex(meta.code);
        const flowPressure = flowPressureIndex(meta.code);
        const sec = securityProfile(meta, meta.code || "", ordre, totalWishes);
        const orderFactor = wishOrderFactor(ordre, totalWishes, pondChoix);
        const ambition = ambitionPenalty(meta, ordre, totalWishes, rankStrength, f);

        let priorityBoost = 0;
        if(f.prioHandicap) priorityBoost += 0.12;
        if(f.prioConjoint) priorityBoost += 0.06;
        if(f.csEnfant) priorityBoost += 0.04;
        if(f.csSoutien) priorityBoost += 0.03;

        const weightedDemand = clamp(dem * flowPressure * (0.72 + pondAttrac * 0.17), 0.04, 1.75);
        const weightedTension = clamp((meta.tension || 0.5) * (0.75 + pondTension * 0.16), 0.04, 1.35);
        const weightedFlowCap = clamp(flowCap * 1.18, 0.05, 1.18);
        const weightedFlowDem = clamp(flowDem * 1.24, 0.05, 1.35);

        let chance =
          0.004 +
          (rankStrength * 0.37) +
          (cap * 0.14) +
          (weightedFlowCap * 0.18) +
          (weightedTension * 0.10) -
          (weightedDemand * 0.23) -
          (weightedFlowDem * 0.18) -
          (ambition * 0.34) +
          (sec * 0.18) +
          priorityBoost;

        chance *= orderFactor;

        if(f.listeType === "LC"){
          chance *= 0.90;

          if(ordre <= 5 && dem > 0.75) chance *= 0.80;
          if(ordre <= 10 && dem > 0.82) chance *= 0.84;
          if(ordre <= 15 && dem > 0.88) chance *= 0.86;

          if(ordre > Math.max(18, Math.floor(totalWishes * 0.55)) && dem < 0.55) chance *= 0.94;
          if(ordre > Math.max(24, Math.floor(totalWishes * 0.70)) && cap > 0.48 && dem < 0.50) chance *= 0.90;
        } else {
          chance *= 1.08;
        }

        const depthRatio = (ordre - 1) / Math.max(totalWishes - 1, 1);
        const depthPenalty = 1 - (0.34 * Math.pow(depthRatio, 1.1));
        chance *= clamp(depthPenalty, 0.62, 1);

        if(flowCap > 0.72 && flowDem < 0.55) chance *= 1.10;
        if(flowCap < 0.38 && flowDem > 0.78) chance *= 0.84;
        if(meta.attractivite < 0.38 && cap > 0.42) chance *= 1.14;
        if(meta.attractivite > 0.88 && ordre <= 20) chance *= 0.84;
        if(meta.tension > 0.80) chance *= 1.03;

        if(f.modeLonguenesse && meta.nom === "Pas-de-Calais"){
          chance *= 1.14 + (deptDB["62"]?.longuenesseBonus || 0) * 0.12;
        }

        return clamp(chance, 0.001, 0.42);
      }

      function buildPredictions(){
        cancelAnalysis();
        const f = getFormData();
        const wishes = parseSouhaits(f.souhaits);
        const rang = Number(f.rang || 0);
        const totalPostes = Number(f.totalPostes);
        if(!Number.isInteger(rang) || rang < 1 || !Number.isInteger(totalPostes) || totalPostes < 100 ||
          [f.pondChoix, f.pondAttrac, f.pondTension].some(v => v === "" || !Number.isFinite(Number(v)) || Number(v) < 0 || Number(v) > 5)){
          clearPredictions();
          setStatus("Saisis un rang entier positif, au moins 100 postes et des pondérations entre 0 et 5.");
          return [];
        }

        elements.badges.innerHTML = badgeHtml(f, wishes.length);

        if(!wishes.length){
          state.predictions = [];
          elements.kpiTop3.textContent = "-";
          elements.kpiOffice.textContent = "-";
          elements.kpiRank.textContent = "-";
          elements.kpiDeptScore.textContent = "-";
          elements.top3.innerHTML = `<div class="topCard">Rien à calculer.</div>`;
          clearPredictions();
          setStatus(`Ajoute au moins un département reconnu. ${state.inputWarnings || ""}`);
          return [];
        }

        const rankStrength = rankStrengthFromInputs(rang, totalPostes, f.listeType);
        const wishCodeSet = new Set(wishes.map(w=>w.code));

        let remaining = 1;
        const results = [];

        for(let idx = 0; idx < wishes.length; idx++){
          const w = wishes[idx];
          const meta = { ...(deptDB[w.code] || {
            nom:w.nom, attractivite:0.50, tension:0.50, quality:0.50, sea:false, mountain:false,
            housing:"€€", bigCities:[w.nom], population:"~300k"
          }), code:w.code };

          const ordre = idx + 1;
          const conditionalChance = computeConditionalChance({
            f, meta, ordre, totalWishes:wishes.length, rankStrength
          });

          const assignmentProbability = remaining * conditionalChance;
          remaining *= (1 - conditionalChance);

          const cap = capacityIndex(meta, meta.code);
          const dem = demandIndex(meta, meta.code);
          const sec = securityProfile(meta, w.code, ordre, wishes.length);
          const ambition = ambitionPenalty(meta, ordre, wishes.length, rankStrength, f);

          const score =
            (rankStrength * 0.34) +
            (cap * 0.22) -
            (dem * 0.24) -
            (ambition * 0.20) +
            (sec * 0.12) +
            (conditionalChance * 0.32);

          results.push({
            ordre,
            code: w.code,
            nom: meta.nom,
            score: clamp(score, 0.001, 10),
            proba: assignmentProbability * 100,
            conditionalChance: conditionalChance * 100,
            remainingAfter: remaining * 100,
            attractivite: meta.attractivite,
            tension: meta.tension,
            quality: meta.quality,
            sea: !!meta.sea,
            mountain: !!meta.mountain,
            inWishList: wishCodeSet.has(w.code),
            capacity: cap,
            demand: dem,
            security: sec,
            ambition,
            flowCapacity: flowCapacityIndex(w.code),
            flowDemand: flowDemandIndex(w.code),
            flowPressure: flowPressureIndex(w.code),
            flowStats: getDeptFlowStats(w.code)
          });
        }

        const aggregatedResults = aggregatePredictionsByDept(results);
        const officeRisk = clamp(remaining * 100, 0, 100);
        const sorted = [...aggregatedResults].sort((a,b) => b.proba - a.proba);
        const top3 = sorted.slice(0,3);
        const chanceTop3 = top3.reduce((a,b)=>a+b.proba,0);

        elements.kpiTop3.textContent = pct(chanceTop3);
        elements.kpiOffice.textContent = pct(officeRisk);
        elements.kpiRank.textContent = `${Math.round(clamp(rankStrength,0,1)*100)}/100`;

        elements.top3.innerHTML = top3.map((r, i) => `
          <button type="button" class="topCard" data-dept="${r.code}">
            <span class="rank">PISTE 0${i+1} <span aria-hidden="true">↗</span></span>
            <h3>${r.code} · ${r.nom}</h3>
            <div class="pct">${pct(r.proba)}</div><span class="scoreCaption">Part simulée</span>
            <div class="bar"><span style="width:${clamp(r.proba,0,100)}%"></span></div>
            <div class="small muted">
              Votre vœu n°${r.ordre} dans la liste.
            </div>
          </button>
        `).join("");

        state.predictions = aggregatedResults;
        elements.top3.querySelectorAll("[data-dept]").forEach(button => button.addEventListener("click", () => openDepartment(button.dataset.dept)));
        renderAllResults();
        state.heatmapScale = computeHeatmapScale(aggregatedResults);
        refreshHeatmapLegend();
        updateMapStyling();

        if(state.selectedDeptCode){
          const selected = aggregatedResults.find(x => x.code === state.selectedDeptCode);
          updateDgfipPanelForDept(state.selectedDeptCode, state.selectedDeptName, selected);
          drawRadar(selected);
        } else {
          drawRadar(null);
        }

        setStatus(`Simulation V8 : ${wishes.length} départements analysés. Risque d’office simulé : ${pct(officeRisk)}. ${state.inputWarnings || ""}`);
        return aggregatedResults;
      }

      function getPredictionByCode(code){
        return state.predictions.find(p => p.code === code) || null;
      }

      function updateDgfipPanelForDept(code, name, pred){
        elements.selectedDeptBadge.textContent = code ? `${code} ${name}` : "Aucun département";
        elements.globalDeptBadge.textContent = code ? `${code} ${name}` : "-";

        if(!code){
          elements.kpiDeptScore.textContent = "-";
          elements.dgfipDeptInfo.textContent = "Aucun département sélectionné.";
          return;
        }

        const meta = { ...(deptDB[code] || {}), code };
        elements.kpiDeptScore.textContent = pred ? scoreStr(pred.score) : "hors liste";

        const f = getFormData();
        let txt = `<strong>${code} ${name}</strong><br><br>`;

        if(pred){
          txt += `Ce département est dans ta liste au rang <strong>${pred.ordre}</strong>. `;
          txt += `Probabilité finale simulée <strong>${pct(pred.proba)}</strong>. `;
          txt += `Chance conditionnelle si on arrive jusqu’ici <strong>${pct(pred.conditionalChance)}</strong>. `;
          txt += `Probabilité résiduelle de continuer après ce vœu <strong>${pct(pred.remainingAfter)}</strong>. `;
        } else {
          txt += `Ce département n’est pas dans ta liste actuelle. `;
        }

        txt += `<br><br>`;
        txt += `Demande estimée <strong>${Math.round((pred?.demand ?? demandIndex(meta, code)) * 100)}/100</strong>, `;
        txt += `capacité d’absorption estimée <strong>${Math.round((pred?.capacity ?? capacityIndex(meta, meta.code || "")) * 100)}/100</strong>, `;
        txt += `malus d’ambition <strong>${Math.round((pred?.ambition ?? 0) * 100)}/100</strong>, `;
        const flowStats = pred?.flowStats || getDeptFlowStats(code);
        txt += `tension besoins <strong>${Math.round((meta.tension || 0.5) * 100)}/100</strong>. `;
        txt += `Hypothèses locales de flux (non officielles) : <strong>${flowStats.postesMoyens}</strong> postes moyens (${flowStats.tendancePostes >= 0 ? "+" : ""}${flowStats.tendancePostes}), `;
        txt += `<strong>${flowStats.demandesMoyennes}</strong> demandes moyennes (${flowStats.tendanceDemandes >= 0 ? "+" : ""}${flowStats.tendanceDemandes}). `;

        if(pred && pred.security > 0.08){
          txt += `Ce vœu joue un rôle de sécurisation. `;
        }

        if(f.prioHandicap){
          txt += `Priorité handicap activée. `;
        }
        if(f.prioConjoint){
          txt += `Priorité conjoint/PACS activée. `;
        }
        if(f.csEnfant || f.csSoutien){
          txt += `Critère(s) supplémentaire(s) activé(s). `;
        }

        if(code === "62" && f.modeLonguenesse){
          txt += `Simulation Longuenesse active pour le 62. `;
        }

        txt += `<br><br><span class="muted">Lecture rapide :</span> `;
        if(pred){
          if(pred.proba >= 15) txt += `ça sort bien.`;
          else if(pred.proba >= 8) txt += `c’est crédible.`;
          else if(pred.proba >= 4) txt += `c’est jouable mais chaud.`;
          else if(pred.proba >= 2) txt += `c’est fragile.`;
          else txt += `ça reste faible.`;
        } else {
          txt += `ajoute-le à la liste pour le simuler.`;
        }

        elements.dgfipDeptInfo.innerHTML = txt;
      }

      function drawRadar(pred){
        const canvas = elements.radarCanvas;
        const ctx = canvas.getContext("2d");
        const w = canvas.width = canvas.clientWidth * devicePixelRatio;
        const h = canvas.height = canvas.clientHeight * devicePixelRatio;
        ctx.scale(devicePixelRatio, devicePixelRatio);
        ctx.clearRect(0,0,canvas.clientWidth,canvas.clientHeight);

        const cx = canvas.clientWidth / 2;
        const cy = canvas.clientHeight / 2;
        const radius = Math.min(canvas.clientWidth, canvas.clientHeight) * 0.32;
        const labels = ["Affectation","Capacité","Sécurisation","Cadre vie","Demande"];
        const values = pred ? [
          clamp((pred.proba || 0) / 20, 0, 1),
          clamp(pred.capacity || 0.5, 0, 1),
          clamp((pred.security || 0) / 0.25, 0, 1),
          clamp(pred.quality || 0.5, 0, 1),
          clamp(pred.demand || 0.5, 0, 1)
        ] : [0,0,0,0,0];

        for(let ring=1; ring<=5; ring++){
          ctx.beginPath();
          for(let i=0;i<labels.length;i++){
            const angle = -Math.PI/2 + (Math.PI*2 * i / labels.length);
            const r = radius * ring / 5;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
          }
          ctx.closePath();
          ctx.strokeStyle = "rgba(185,216,183,.16)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        for(let i=0;i<labels.length;i++){
          const angle = -Math.PI/2 + (Math.PI*2 * i / labels.length);
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius;
          ctx.beginPath();
          ctx.moveTo(cx,cy);
          ctx.lineTo(x,y);
          ctx.strokeStyle = "rgba(185,216,183,.16)";
          ctx.stroke();

          const lx = cx + Math.cos(angle) * (radius + 22);
          const ly = cy + Math.sin(angle) * (radius + 18);
          ctx.fillStyle = "#9fbea7";
          ctx.font = "12px Inter, Arial";
          ctx.textAlign = "center";
          ctx.fillText(labels[i], lx, ly);
        }

        ctx.beginPath();
        for(let i=0;i<values.length;i++){
          const angle = -Math.PI/2 + (Math.PI*2 * i / values.length);
          const r = radius * values[i];
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.closePath();
        ctx.fillStyle = "rgba(175,208,145,.20)";
        ctx.strokeStyle = "rgba(191,219,159,.95)";
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
      }

      function styleForFeature(feature){
        const code = String(feature.properties.code).toUpperCase();
        const pred = getPredictionByCode(code);
        const isSelected = state.selectedDeptCode === code;

        let fill = "#d1ddc9";
        let weight = 1;
        let color = "#7e9578";
        let fillOpacity = 0.42;

        if(state.heatmapEnabled){
          if(pred){
            fill = heatmapColorForDept(code, pred.proba);
            color = "#68866b";
            fillOpacity = clamp(0.38 + pred.proba / 180, 0.40, 0.84);
          }
        } else {
          if(pred){
            fill = "#80ab8c";
            fillOpacity = clamp(0.25 + pred.proba / 24, 0.28, 0.78);
            color = "#39775a";
          }

          const sorted = [...state.predictions].sort((a,b)=>b.proba-a.proba).slice(0,3).map(x=>x.code);
          if(sorted.includes(code)){
            fill = "#176b57";
            color = "#124d3b";
            fillOpacity = 0.68;
          }
        }

        if(isSelected){
          color = "#0e503b";
          weight = 2.2;
          fillOpacity = clamp(fillOpacity + 0.1, 0.50, 0.90);
        }

        return {
          color,
          weight,
          fillColor: fill,
          fillOpacity
        };
      }

      function updateMapStyling(){
        if(state.geojsonLayer){
          state.geojsonLayer.eachLayer(layer => {
            layer.setStyle(styleForFeature(layer.feature));
          });
        }

        state.deptLabelMarkers.forEach(m => {
          const code = m.options.deptCode;
          const el = m.getElement();
          if(!el) return;
          el.classList.toggle("selected", state.selectedDeptCode === code);
        });
      }

      function handleDeptClick(code, name){
        cancelAnalysis();
        state.selectedDeptCode = code;
        state.selectedDeptName = name;
        state.selectedDeptRequestId += 1;
        const requestId = state.selectedDeptRequestId;

        const pred = getPredictionByCode(code);
        updateDgfipPanelForDept(code, name, pred);
        drawRadar(pred);
        updateGlobalInfo(code, name, pred, requestId);
        syncAnalyzeButton();
        updateMapStyling();

        elements.mapOverlay.textContent = `${code} · ${name}. Retrouvez sa projection et son cadre de vie ci-dessous.`;
      }

      function buildSortedMetrics(meta, pred, metrics, cityData){
        const list = [
          { label:"Accessibilité logement", value: Math.round((1 - housingToScore(meta.housing || "€€")) * 100), unit:"/100", desc:"plus haut = budget plus facile" },
          { label:"Attractivité globale", value: Math.round((meta.attractivite || 0.5) * 100), unit:"/100", desc:"cadre, emploi, dynamisme" },
          { label:"Capacité d'accueil DGFiP", value: Math.round((pred?.capacity ?? capacityIndex(meta, meta.code || "")) * 100), unit:"/100", desc:"estimation locale" },
          { label:"Distance médiane mer", value: metrics.seaDistance, unit:" km", desc:"ordre de grandeur" },
          { label:"Distance médiane montagne", value: metrics.mountainDistance, unit:" km", desc:"ordre de grandeur" },
          { label:"Densité estimée", value: metrics.density, unit:" hab/km²", desc:"approximation" },
          { label:"Top ville (population)", value: cityData[0]?.estPop || 0, unit:" hab", desc:cityData[0]?.name || "—" }
        ];

        return list.sort((a,b) => b.value - a.value);
      }

      function updateCityMarker(city){
        if(state.cityMarker && state.map){ state.map.removeLayer(state.cityMarker); state.cityMarker = null; }
        if(!state.map || !city?.coordinates || typeof L === "undefined") return;
        state.cityMarker = L.circleMarker([city.coordinates.lat, city.coordinates.lng], {
          radius:8, color:"#6ef0c2", weight:2, fillColor:"#63a4ff", fillOpacity:.9
        }).addTo(state.map);
        const label = document.createElement("span"); label.textContent = city.name;
        state.cityMarker.bindPopup(label).openPopup();
      }

      function renderCityChips(cityData){
        elements.cityChips.innerHTML = cityData.map((city, idx) => `
          <button class="cityChip ${idx === 0 ? "active" : ""}" data-city="${escapeHtml(city.name)}">${escapeHtml(city.name)} · ${city.importance}</button>
        `).join("");

        elements.cityChips.querySelectorAll(".cityChip").forEach(btn => {
          btn.addEventListener("click", () => {
            const target = cityData.find(c => c.name === btn.dataset.city);
            if(!target) return;

            state.selectedCityName = target.name;
            elements.cityChips.querySelectorAll(".cityChip").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            elements.cityMeta.textContent = `${target.name} · ${target.importance} · mer ${target.distanceSeaKm} km · montagne ${target.distanceMountainKm} km`;
            elements.cityHighlight.innerHTML = `
              <h4>Ville mise en évidence : ${escapeHtml(target.name)}</h4>
              <div class="small muted">Population ${target.estPop.toLocaleString("fr-FR")} hab · Distances indicatives du département : mer ~${target.distanceSeaKm} km, montagne ~${target.distanceMountainKm} km.</div>
            `;
            updateCityMarker(target);
          });
        });
      }

      function updateGlobalInfo(code, name, pred, requestId, realData = null, refresh = true){
        const isObsolete = () => requestId !== state.selectedDeptRequestId || state.selectedDeptCode !== code;
        if(isObsolete()) return;
        const meta = { ...(deptDB[code] || {}), code };
        const metrics = estimateDepartmentMetrics(meta);
        const cityData = realData?.communes?.length ? realData.communes.map(c => ({
          name:c.nom, estPop:Number(c.population || 0), importance:cityImportance(Number(c.population || 0)),
          coordinates:firstValidCoord(c.centre), distanceSeaKm:metrics.seaDistance, distanceMountainKm:metrics.mountainDistance
        })) : cityProfile(meta);
        state.selectedCityName = cityData[0]?.name || null;
        elements.infoCities.textContent = cityData.map(c => c.name).join(", ") || "Non renseigné";
        elements.infoPopulation.textContent = realData?.population > 0
          ? `${realData.population.toLocaleString("fr-FR")} habitants (somme des populations communales de l’API géographique)${realData.region ? ` · ${realData.region}` : ""}`
          : `${meta.population || "Non renseigné"} · estimation locale`;
        elements.infoNature.textContent = `Mer : ~${metrics.seaDistance} km · montagne : ~${metrics.mountainDistance} km (ordres de grandeur locaux, sans calcul routier)`;
        elements.infoHousing.textContent = `Niveau logement ${meta.housing || "—"} · tension indicative ${Math.round((meta.tension || .5)*100)}/100`;
        elements.infoRentF2.textContent = `${formatEUR(metrics.rentF2)} / mois · estimation non sourcée`;
        elements.infoHousePrice.textContent = `3p : ${formatEUR(metrics.house3p)} · 4p : ${formatEUR(metrics.house4p)} · estimations non sourcées`;
        const daily = realData?.weather?.daily;
        elements.infoClimate.textContent = daily?.temperature_2m_max?.length
          ? `Prévisions 7 jours à proximité de ${cityData[0]?.name || name} : max ${Math.round(Math.max(...daily.temperature_2m_max))}°C · min ${Math.round(Math.min(...daily.temperature_2m_min))}°C · Open-Meteo`
          : `Climat indicatif local : été ${metrics.summer.tempMax}°C max · hiver ${metrics.winter.tempMin}°C min`;
        renderCityChips(cityData);
        updateCityMarker(cityData[0]);
        elements.cityMeta.textContent = cityData.length ? `${cityData[0].name} · ${realData?.communes?.length ? "population communale API" : "profil local indicatif"}. Distances estimées à l’échelle départementale.` : "Aucune ville renseignée.";
        elements.cityHighlight.replaceChildren();
        const title = document.createElement("h4"); title.textContent = cityData[0]?.name || "Ville non renseignée";
        const detail = document.createElement("div"); detail.className = "small muted";
        detail.textContent = cityData[0]?.coordinates ? "Position réelle fournie par l’API géographique." : "Position non disponible : aucun repère approximatif ajouté sur la carte.";
        elements.cityHighlight.append(title, detail);
        elements.infoSortedMetrics.innerHTML = buildSortedMetrics(meta, pred, metrics, cityData).map(m =>
          `<li><span><strong>${escapeHtml(m.label)}</strong><br><span class="muted">${escapeHtml(m.desc)}</span></span><span>${safeNum(m.value,0).toLocaleString("fr-FR")}${m.unit}</span></li>`).join("");
        elements.infoSummary.textContent = realData?.wikiDept?.extract || `${code} ${name}. ${meta.bigCities?.length ? `Villes de référence : ${meta.bigCities.join(", ")}.` : ""} Les prix et distances du profil local sont des hypothèses à vérifier.`;
        elements.infoSources.textContent = realData
          ? `Sources disponibles : ${[realData.communes?.length ? "API géographique de l’État" : null, realData.weather ? "Open-Meteo (prévisions)" : null, realData.wikiDept ? "Wikipédia (résumé)" : null].filter(Boolean).join(" · ") || "aucune API externe : profil local affiché"}. Prix, distances et simulation : hypothèses locales.`
          : "Profil local affiché immédiatement. Recherche des données publiques en cours…";
        if(realData?.wikiDept){
          const attribution = document.createElement("a");
          attribution.href = `https://fr.wikipedia.org/wiki/${encodeURIComponent(realData.wikiDept.title || name)}`;
          attribution.textContent = " Lire le résumé original sur Wikipédia (CC BY-SA).";
          attribution.target = "_blank"; attribution.rel = "noopener noreferrer";
          attribution.style.color = "var(--accent)";
          elements.infoSources.append(attribution);
        }
        if(refresh){
          // Independent tasks: photos and weather never block the initial profile or Groq.
          loadWikimediaPhotos(name, requestId);
          buildRealDepartmentData(code,name).then(real => {
            if(!isObsolete()) updateGlobalInfo(code,name,getPredictionByCode(code),requestId,real,false);
          }).catch(() => { if(!isObsolete()) elements.infoSources.textContent = "Services externes indisponibles. Profil local indicatif affiché."; });
        }
      }

      async function loadWikimediaPhotos(name, requestId){
        const isObsolete = () => requestId !== state.selectedDeptRequestId;
        elements.photoGrid.textContent = "Recherche de photos…";
        try {
          const query = `${name} France paysage`;
          const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=6&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=600&format=json&origin=*`;
          const json = await fetchJson(url);
          if(isObsolete()) return;
          elements.photoGrid.replaceChildren();
          const pages = Object.values(json?.query?.pages || {});
          for(const page of pages){
            const image = page.imageinfo?.[0];
            const src = safeImageUrl(image?.thumburl || image?.url);
            if(!src || /\.svg(?:$|\?)/i.test(src)) continue;
            const card = document.createElement("div"); card.className = "photo";
            const img = document.createElement("img"); img.src = src; img.alt = String(page.title || name).replace(/^File:/, ""); img.loading = "lazy"; img.referrerPolicy = "no-referrer";
            const cap = document.createElement("div"); cap.className = "cap";
            const link = document.createElement("a"); link.href = `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`; link.target = "_blank"; link.rel = "noopener noreferrer"; link.textContent = img.alt;
            const license = document.createElement("div"); license.textContent = `Auteur et licence : voir la fiche Wikimedia Commons (${stripMarkup(image.extmetadata?.LicenseShortName?.value || "licence sur la source")}).`;
            cap.append(link, license); card.append(img,cap); elements.photoGrid.append(card);
          }
          if(!elements.photoGrid.children.length) elements.photoGrid.textContent = "Aucune photo disponible. Les autres fonctions restent accessibles.";
        } catch (_error) { if(!isObsolete()) elements.photoGrid.textContent = "Photos indisponibles. Les autres fonctions restent accessibles."; }
      }

      function safeImageUrl(value){
        try { const url = new URL(value); return url.protocol === "https:" && url.hostname === "upload.wikimedia.org" ? url.href : null; }
        catch (_error) { return null; }
      }
      function stripMarkup(value){ return new DOMParser().parseFromString(String(value), "text/html").body.textContent || ""; }

      async function initMap(){
        if(typeof L === "undefined") throw new Error("Le composant cartographique local n’a pas été chargé.");
        state.map = L.map("map", {
          zoomControl: true,
          attributionControl: true
        }).setView([46.65, 2.3], 6);

        L.tileLayer(
          "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            maxZoom: 18,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }
        ).addTo(state.map);

        state.heatmapLegendControl = createHeatmapLegend();
        if(state.heatmapEnabled){
          state.heatmapLegendControl.addTo(state.map);
        }
        updateHeatmapUi();
      updateFullscreenButtons();

        const geojson = window.SOUHAITS_GEOJSON;
        if(!geojson?.features?.length) throw new Error("Contours locaux introuvables. Recharge la page.");

        state.geojsonLayer = L.geoJSON(geojson, {
          style: styleForFeature,
          onEachFeature: (feature, layer) => {
            const code = String(feature.properties.code).toUpperCase();
            const name = feature.properties.nom;

            state.deptLayersByCode[code] = layer;
            layer.bindTooltip(`${code} ${name}`, {sticky:true});

            layer.on("click", () => {
              handleDeptClick(code, name);
            });

            layer.on("mouseover", () => {
              if(state.selectedDeptCode !== code){
                layer.setStyle({ weight: 2, color:"#176b57" });
              }
            });

            layer.on("mouseout", () => {
              layer.setStyle(styleForFeature(feature));
            });
          }
        }).addTo(state.map);

        geojson.features.forEach(feature => {
          const code = String(feature.properties.code).toUpperCase();
          const coords = getFeatureCenter(feature);
          if(!coords) return;

          const icon = L.divIcon({
            className: "deptNumberLabel",
            html: code,
            iconSize: [24, 12]
          });

          const marker = L.marker(coords, {
            icon,
            interactive: false,
            keyboard: false,
            deptCode: code
          }).addTo(state.map);

          state.deptLabelMarkers.push(marker);
        });

        const franceMetropolitaineBounds = L.latLngBounds([[41.0, -5.8], [51.7, 9.8]]);
        state.map.fitBounds(franceMetropolitaineBounds, { padding:[20,20] });
        updateMapStyling();
        elements.mapStatus.textContent = `Carte prête : ${geojson.features.length} départements. Contours embarqués, indépendants des services externes.`;
        new ResizeObserver(() => state.map.invalidateSize()).observe(document.getElementById("map"));
        setTimeout(() => state.map.invalidateSize(), 100);
      }

      function getFeatureCenter(feature){
        try{
          const coords = feature.geometry.coordinates;

          let flat = [];
          function dig(arr){
            if(typeof arr[0] === "number"){
              flat.push(arr);
              return;
            }
            arr.forEach(dig);
          }

          dig(coords);
          if(!flat.length) return null;

          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          flat.forEach(([x,y]) => {
            if(x < minX) minX = x;
            if(y < minY) minY = y;
            if(x > maxX) maxX = x;
            if(y > maxY) maxY = y;
          });

          return [(minY + maxY) / 2, (minX + maxX) / 2];
        }catch(e){
          return null;
        }
      }

      function loadExample(){
        setFormData({
          listeType: "LC",
          rang: "317",
          groqModel: elements.groqModel.value,
          totalPostes: "790",
          prioHandicap: false,
          prioConjoint: false,
          csEnfant: false,
          csSoutien: false,
          modeLonguenesse: false,
          pondChoix: "1.2",
          pondAttrac: "2.2",
          pondTension: "1.8",
          souhaits: [
            "91 Essonne",
            "16 Charente",
            "31 Haute-Garonne",
            "17 Charente-Maritime",
            "79 Deux-Sèvres",
            "85 Vendée",
            "49 Maine-et-Loire",
            "44 Loire-Atlantique",
            "37 Indre-et-Loire",
            "82 Tarn-et-Garonne",
            "81 Tarn",
            "65 Hautes-Pyrénées",
            "09 Ariège",
            "47 Lot-et-Garonne",
            "32 Gers",
            "46 Lot",
            "24 Dordogne",
            "33 Gironde",
            "40 Landes",
            "64 Pyrénées-Atlantiques",
            "29 Finistère",
            "22 Côtes-d'Armor",
            "56 Morbihan",
            "35 Ille-et-Vilaine"
          ].join("\n")
        });
        setStatus("Exemple neutre chargé.");
      }

      function resetUI(){
        clearTimeout(modelScanTimer);
        cancelAnalysis(); clearModels(); elements.groqApiKey.value = ""; elements.rememberKey.checked = false;
        try { localStorage.removeItem(STORAGE_KEY); } catch (_error) {}
        state.selectedDeptRequestId += 1;
        elements.allResults.replaceChildren();
        elements.deptSearch.value = "";
        elements.infoSources.textContent = "Profil local indicatif. Sélectionne un département.";
        setFormData({
          listeType:"LC",
          rang:"",
          groqModel:"",
          groqApiKey:"",
          totalPostes:"790",
          prioHandicap:false,
          prioConjoint:false,
          csEnfant:false,
          csSoutien:false,
          modeLonguenesse:false,
          pondChoix:"1.2",
          pondAttrac:"2.2",
          pondTension:"1.8",
          souhaits:""
        });

        state.predictions = [];
        state.heatmapScale = computeHeatmapScale([]);
        refreshHeatmapLegend();
        state.selectedDeptCode = null;
        state.selectedDeptName = null;
        state.selectedCityName = null;
        if(state.cityMarker && state.map){
          state.map.removeLayer(state.cityMarker);
          state.cityMarker = null;
        }

        elements.badges.innerHTML = "";
        elements.selectedDeptBadge.textContent = "Aucun département";
        elements.globalDeptBadge.textContent = "-";
        elements.kpiTop3.textContent = "-";
        elements.kpiOffice.textContent = "-";
        elements.kpiRank.textContent = "-";
        elements.kpiDeptScore.textContent = "-";
        elements.top3.innerHTML = "";
        elements.dgfipDeptInfo.textContent = "Rien de sélectionné.";
        elements.infoCities.textContent = "-";
        elements.infoPopulation.textContent = "-";
        elements.infoNature.textContent = "-";
        elements.infoHousing.textContent = "-";
        elements.infoRentF2.textContent = "-";
        elements.infoHousePrice.textContent = "-";
        elements.infoClimate.textContent = "-";
        elements.cityChips.innerHTML = "";
        elements.cityMeta.textContent = "Clique une ville pour la pointer sur la carte.";
        elements.cityHighlight.innerHTML = '<h4>Ville mise en évidence</h4><div class="small muted">Aucune ville sélectionnée.</div>';
        elements.infoSortedMetrics.innerHTML = "";
        elements.infoSummary.textContent = "Clique un département pour voir le résumé global.";
        elements.photoGrid.innerHTML = "";
        drawRadar(null);
        syncAnalyzeButton();
        updateMapStyling();
        setStatus("Formulaire et sauvegarde locale effacés.");
      }

      function escapeHtml(value){
        return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      }
      function clearPredictions(){
        cancelAnalysis();
        state.predictions = [];
        state.heatmapScale = computeHeatmapScale([]);
        ['kpiTop3','kpiOffice','kpiRank','kpiDeptScore'].forEach(key => elements[key].textContent = '-');
        elements.top3.textContent = 'Aucun résultat. Vérifie le formulaire.';
        elements.allResults.replaceChildren();
        updateMapStyling(); refreshHeatmapLegend(); drawRadar(null);
        if(state.selectedDeptCode) updateDgfipPanelForDept(state.selectedDeptCode,state.selectedDeptName,null);
      }
      function renderAllResults(){
        elements.allResults.innerHTML = `<table><thead><tr><th>Vœu</th><th>Département</th><th>Score simulé</th></tr></thead><tbody>${state.predictions.map(p => `<tr><td>${p.ordre}</td><td><button type="button" data-dept="${p.code}">${escapeHtml(p.code+' '+p.nom)}</button></td><td>${pct(p.proba)}</td></tr>`).join('')}</tbody></table>`;
        elements.allResults.querySelectorAll('[data-dept]').forEach(btn => btn.addEventListener('click', () => openDepartment(btn.dataset.dept)));
      }
      function exportResults(){
        if(!state.predictions.length){ setStatus('Lance une simulation avant l’export.'); return; }
        const cell = value => `"${String(value).replace(/"/g,'""')}"`;
        const rows = [['Ordre','Code','Département','Part simulée (%)','Chance conditionnelle simulée (%)'],
          ...state.predictions.map(p => [p.ordre,p.code,p.nom,p.proba.toFixed(2),p.conditionalChance.toFixed(2)])];
        const blob = new Blob(['\uFEFF'+rows.map(row => row.map(cell).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'});
        const url = URL.createObjectURL(blob), link = document.createElement('a');
        link.href = url; link.download = 'souhaits-simulation.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
        setStatus('Résultats exportés. Les scores sont indicatifs et non officiels.');
      }
      function initDepartmentSearch(){
        for(const [code,dept] of Object.entries(deptDB).sort((a,b) => a[0].localeCompare(b[0]))){
          const option = document.createElement('option'); option.value = `${code} ${dept.nom}`; elements.deptOptions.append(option);
        }
      }
      function openDepartment(raw){
        const code = findDeptCode(raw);
        if(!code){ setStatus('Département non reconnu. Saisis son code ou son nom.'); return; }
        handleDeptClick(code,deptDB[code].nom);
        const layer = state.deptLayersByCode[code];
        if(state.map && layer) state.map.fitBounds(layer.getBounds(),{padding:[25,25],maxZoom:9});
      }
      function syncAnalyzeButton(){
        const ready = !!state.selectedDeptCode && !!elements.groqModel.value && state.modelKey === elements.groqApiKey.value.trim();
        elements.btnAnalyze.disabled = !ready || !!state.analysisController;
        elements.btnTestModel.disabled = !elements.groqModel.value || !!state.modelTestController;
      }
      function cancelAnalysis(){
        state.analysisGeneration += 1;
        state.analysisController?.abort(); state.analysisController = null;
        elements.aiAnalysis.textContent = 'Sélectionne un département et un modèle, puis lance une analyse.';
        elements.btnAnalyze.textContent = 'Analyser ce département avec Groq';
        syncAnalyzeButton();
      }
      function clearModels(){
        state.modelGeneration += 1;
        state.modelScanController?.abort(); state.modelScanController = null;
        state.modelTestController?.abort(); state.modelTestController = null;
        state.models = []; state.modelKey = null;
        elements.groqModel.replaceChildren(new Option('Ajoute une clé pour découvrir les modèles',''));
        elements.groqModel.disabled = true;
        elements.groqStatus.textContent = 'IA facultative. La carte et les calculs fonctionnent sans clé.';
        elements.btnScanModels.disabled = false; elements.btnScanModels.textContent = 'Actualiser les modèles';
        cancelAnalysis();
      }
      async function scanModels(){
        const preferred = elements.groqModel.value || state.preferredModel;
        clearModels();
        const key = elements.groqApiKey.value.trim();
        if(!key){ elements.groqStatus.textContent = 'Ajoute une clé API Groq pour découvrir les modèles.'; return; }
        const generation = state.modelGeneration;
        const controller = new AbortController(); state.modelScanController = controller;
        elements.btnScanModels.disabled = true; elements.btnScanModels.textContent = 'Recherche…';
        elements.groqStatus.textContent = 'Lecture du catalogue des modèles Groq avec ta clé…';
        try {
          const models = await SouhaitsGroq.listModels(key,{signal:controller.signal});
          if(generation !== state.modelGeneration || key !== elements.groqApiKey.value.trim()) return;
          state.models = models; state.modelKey = key;
          elements.groqModel.replaceChildren();
          if(!models.length){
            elements.groqModel.append(new Option('Aucun modèle de texte détecté',''));
            elements.groqStatus.textContent = 'Aucun modèle adapté trouvé dans ce catalogue. Vérifie ton projet Groq.';
            return;
          }
          for(const recommended of [true,false]){
            const groupModels = models.filter(model => model.recommended === recommended);
            if(!groupModels.length) continue;
            const group = document.createElement('optgroup');
            group.label = recommended ? 'Conseillés pour Souhaits' : 'Autres modèles de texte · à tester';
            for(const model of groupModels) group.append(new Option(`${model.id} · ${model.label}`, model.id));
            elements.groqModel.append(group);
          }
          elements.groqModel.disabled = false;
          elements.groqModel.value = models.some(m => m.id === preferred) ? preferred : models[0].id;
          state.preferredModel = elements.groqModel.value;
          elements.groqStatus.textContent = `${models.length} modèles de texte détectés (${models.filter(m => m.recommended).length} conseillés). Catalogue actualisé. « Tester le modèle » vérifie l’accès réel de ta clé par un court appel.`;
        } catch(error) {
          if(generation !== state.modelGeneration) return;
          elements.groqStatus.textContent = error.message;
        } finally {
          if(generation === state.modelGeneration){
            state.modelScanController = null;
            elements.btnScanModels.disabled = false; elements.btnScanModels.textContent = 'Actualiser les modèles';
            syncAnalyzeButton();
          }
        }
      }
      async function testSelectedModel(){
        const key = elements.groqApiKey.value.trim(), model = elements.groqModel.value;
        if(!model || key !== state.modelKey) return;
        state.modelTestController?.abort();
        const controller = new AbortController(); state.modelTestController = controller;
        const generation = state.modelGeneration;
        syncAnalyzeButton(); elements.groqStatus.textContent = `Test d’accès à ${model}…`;
        try {
          await SouhaitsGroq.testModel(key,model,{signal:controller.signal});
          if(state.modelTestController === controller && generation === state.modelGeneration && model === elements.groqModel.value) elements.groqStatus.textContent = `${model} : accès confirmé par une réponse de Groq.`;
        } catch(error) {
          if(state.modelTestController === controller && generation === state.modelGeneration && model === elements.groqModel.value) elements.groqStatus.textContent = error.message;
        } finally {
          if(state.modelTestController === controller){ state.modelTestController = null; syncAnalyzeButton(); }
        }
      }
      async function analyzeSelectedDepartment(){
        const key = elements.groqApiKey.value.trim(), model = elements.groqModel.value, code = state.selectedDeptCode;
        if(!code || !model || key !== state.modelKey) return;
        cancelAnalysis();
        const generation = state.analysisGeneration;
        const controller = new AbortController(); state.analysisController = controller;
        syncAnalyzeButton(); elements.btnAnalyze.textContent = 'Analyse en cours…';
        elements.aiAnalysis.textContent = `Analyse de ${code} ${state.selectedDeptName} avec ${model}…`;
        const meta = {...deptDB[code],code}, metrics = estimateDepartmentMetrics(meta), real = state.realDataCache[code];
        const context = {departement:{code,nom:meta.nom},profil_local_indicatif:meta,
          hypotheses_non_verifiees:metrics,simulation_non_officielle:getPredictionByCode(code),
          donnees_publiques:real ? {communes:real.communes,population:real.population,region:real.region,resume_wikipedia:real.wikiDept?.extract} : null};
        try {
          const text = await SouhaitsGroq.analyze(key,model,context,{signal:controller.signal});
          if(generation !== state.analysisGeneration || code !== state.selectedDeptCode || model !== elements.groqModel.value || key !== elements.groqApiKey.value.trim()) return;
          // Model output is untrusted; render as text and keep sourced facts intact.
          elements.aiAnalysis.textContent = `${text}\n\nModèle : ${model} · Analyse IA indicative, à vérifier.`;
          elements.groqStatus.textContent = `Analyse reçue de ${model}.`;
        } catch(error) {
          if(generation === state.analysisGeneration){ elements.aiAnalysis.textContent = error.message; elements.groqStatus.textContent = error.message; }
        } finally {
          if(generation === state.analysisGeneration){ state.analysisController = null; elements.btnAnalyze.textContent = 'Analyser ce département avec Groq'; syncAnalyzeButton(); }
        }
      }
      function persistKeyPreference(){
        try {
          const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || getFormData();
          delete data.groqApiKey; delete data.rememberGroqKey;
          if(elements.rememberKey.checked){ data.groqApiKey = elements.groqApiKey.value.trim(); data.rememberGroqKey = true; }
          localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
        } catch(_error){ if(elements.rememberKey.checked) setStatus('Le navigateur empêche la mémorisation de la clé.'); }
      }
      let modelScanTimer;
      elements.groqApiKey.addEventListener('input', () => {
        clearTimeout(modelScanTimer);
        state.preferredModel = elements.groqModel.value || state.preferredModel;
        clearModels(); persistKeyPreference();
        if(elements.groqApiKey.value.trim()) modelScanTimer = setTimeout(scanModels,650);
      });
      elements.btnScanModels.addEventListener('click', () => { clearTimeout(modelScanTimer); scanModels(); });
      elements.groqModel.addEventListener('change', () => {
        state.preferredModel = elements.groqModel.value;
        state.modelTestController?.abort(); state.modelTestController = null;
        cancelAnalysis();
        elements.groqStatus.textContent = `${elements.groqModel.value} sélectionné. Tu peux tester son accès ou lancer une analyse.`;
      });
      elements.btnTestModel.addEventListener('click',testSelectedModel);
      elements.btnAnalyze.addEventListener('click',analyzeSelectedDepartment);
      elements.rememberKey.addEventListener('change',persistKeyPreference);
      elements.btnOpenDept.addEventListener('click',() => openDepartment(elements.deptSearch.value));
      elements.deptSearch.addEventListener('keydown',event => { if(event.key === 'Enter') openDepartment(elements.deptSearch.value); });
      elements.btnExport.addEventListener('click',exportResults);
      elements.mapRegion.addEventListener('change', () => {
        const regions = {metro:[[41,-5.8],[51.7,9.8]],antilles:[[14,-62],[17,-59]],guyane:[[2,-55],[6,-51]],reunion:[[-21.5,55.1],[-20.8,56]],mayotte:[[-13.1,44.9],[-12.5,45.5]]};
        if(state.map) state.map.fitBounds(regions[elements.mapRegion.value],{padding:[15,15]});
      });

      elements.btnCalc.addEventListener("click", buildPredictions);
      elements.btnExample.addEventListener("click", () => {
        loadExample();
        buildPredictions();
      });
      elements.btnReset.addEventListener("click", resetUI);
      elements.btnSave.addEventListener("click", saveLocal);
      elements.btnHeatmap.addEventListener("click", toggleHeatmap);
      elements.fullscreenButtons.forEach(btn => {
        btn.addEventListener("click", () => togglePanelFullscreen(btn.dataset.fullscreenTarget));
      });
      document.addEventListener("fullscreenchange", updateFullscreenButtons);

      window.addEventListener("resize", () => {
        drawRadar(getPredictionByCode(state.selectedDeptCode));
      });

      document.getElementById("configureGroq")?.addEventListener("click", () => {
        const details = document.getElementById("groqSettings");
        if(details) details.open = true;
      });
      loadLocal();
      if(elements.groqApiKey.value.trim()) document.getElementById("groqSettings").open = true;
      initDepartmentSearch();
      drawRadar(null);
      if(elements.groqApiKey.value.trim()) scanModels();
      updateHeatmapUi();
      updateFullscreenButtons();
      initMap().catch(err => {
        elements.mapStatus.textContent = `Carte indisponible : ${err.message} Utilise la recherche de département ci-dessus.`;
      });
    })();
