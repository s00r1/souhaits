(() => {
      const STORAGE_KEY = "dgfip_predictor_map_v5";
      const GEO_API_BASE = "https://geo.api.gouv.fr";
      const WIKI_API_BASE = "https://fr.wikipedia.org/api/rest_v1/page/summary";
      const OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast";

      const elements = {
        fullscreenButtons: Array.from(document.querySelectorAll(".btnFullscreen")),
        listeType: document.getElementById("listeType"),
        rang: document.getElementById("rang"),
        themeSelect: document.getElementById("themeSelect"),
        testCount: document.getElementById("testCount"), testScope: document.getElementById("testScope"), testProfile: document.getElementById("testProfile"),
        btnGenerate: document.getElementById("btnGenerate"), generatorStatus: document.getElementById("generatorStatus"),
        wishCount: document.getElementById("wishCount"), localAdvice: document.getElementById("localAdvice"),
        scenarioSummary: document.getElementById("scenarioSummary"), btnToggleWish: document.getElementById("btnToggleWish"),
        onlineData: document.getElementById("onlineData"), onlineBasemap: document.getElementById("onlineBasemap"),
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
        campaign:document.getElementById('campaign'),rankMode:document.getElementById('rankMode'),mainSize:document.getElementById('mainSize'),internalSize:document.getElementById('internalSize'),priorityDept:document.getElementById('priorityDept'),
        directionChoice:document.getElementById('directionChoice'),directionOptions:document.getElementById('directionOptions'),testSpecialized:document.getElementById('testSpecialized'),
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
        photoGrid: document.getElementById("photoGrid"), autoPhotos:document.getElementById("autoPhotos"), photoStatus:document.getElementById("photoStatus"), btnReloadPhotos:document.getElementById("btnReloadPhotos"),
        radarCanvas: document.getElementById("radarCanvas")
      };

      const state = {
        photoController:null,
        basemap: null,
        map: null,
        geojsonLayer: null,
        deptLabelMarkers: [],
        deptLayersByCode: {},
        predictions: [], departmentPredictions:[], simulation:null, importedHistory:[],
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
          btn.textContent = isActive ? "Réduire" : "Agrandir";
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

        return {rentF2,house3p,house4p};
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
        const local = window.SOUHAITS_TERRITORIES?.departments?.[code];
        const center = firstValidCoord(local?.communes?.[0]?.centre, fallbackCenterFromLayer(code));
        const [weather,wikiDept] = await Promise.all([
          center ? fetchWeatherByCoords(center.lat,center.lng).catch(() => null) : null,
          fetchWikipediaSummary(local?.nom || name).catch(() => null)
        ]);
        const real={weather,wikiDept};
        if(weather || wikiDept) state.realDataCache[code]=real;
        return real;
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
        const parsed=SouhaitsDirections.parse(text,deptDB,window.SOUHAITS_DIRECTION_CATALOG);
        state.inputWarnings=[parsed.unknown.length?`Lignes non reconnues (direction et département requis) : ${parsed.unknown.join(', ')}.`:'',parsed.duplicates.length?`Vœux exactement en double ignorés : ${parsed.duplicates.join(', ')}.`:''].filter(Boolean).join(' ');
        return parsed.wishes;
      }

      function getFormData(){
        return {
          listeType: elements.listeType.value,
          rang: elements.rang.value,
          totalPostes: elements.totalPostes.value,
          prioHandicap: elements.prioHandicap.checked,
          prioConjoint: elements.prioConjoint.checked,
          csEnfant: elements.csEnfant.checked,
          csSoutien: elements.csSoutien.checked,
          modeLonguenesse: elements.modeLonguenesse.checked,
          campaign:elements.campaign.value,rankMode:elements.rankMode.value,mainSize:elements.mainSize.value,internalSize:elements.internalSize.value,priorityDept:findDeptCode(elements.priorityDept.value)||'',
          souhaits: elements.souhaits.value
        };
      }

      function setFormData(data){
        if(!data) return;
        elements.listeType.value = data.listeType || "LC";
        elements.rang.value = data.rang || "";
        elements.totalPostes.value = data.campaign ? data.totalPostes || "1152" : "1152";
        elements.prioHandicap.checked = !!data.prioHandicap;
        elements.prioConjoint.checked = !!data.prioConjoint;
        elements.csEnfant.checked = !!data.csEnfant;
        elements.csSoutien.checked = !!data.csSoutien;
        elements.modeLonguenesse.checked = !!data.modeLonguenesse;
        elements.campaign.value=data.campaign||'2027';elements.rankMode.value=data.rankMode||'external';elements.mainSize.value=data.mainSize||'1051';elements.internalSize.value=data.internalSize??'';elements.priorityDept.value=data.priorityDept||'';
        elements.souhaits.value = typeof data.souhaits === "string" ? data.souhaits : "";
        updateWishCount();
      }

      function saveLocal(){
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(getFormData())); setStatus("Projet sauvegardé sur cet appareil, sans aucune clé."); }
        catch (_error) { setStatus("Sauvegarde impossible : le navigateur bloque le stockage local."); }
      }
      function loadLocal(){
        try {
          const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return;
          const data=JSON.parse(raw);if(!data || typeof data!=="object" || Array.isArray(data))throw new Error("invalid");
          setFormData(data);
          // Migrate the project fields only and erase any credentials saved by older versions.
          localStorage.setItem(STORAGE_KEY,JSON.stringify(getFormData()));
          setStatus("Projet rechargé. Les anciennes données de connexion ont été supprimées.");
        } catch (_error) { setStatus("Ancienne sauvegarde illisible ou stockage indisponible. Vous pouvez continuer."); }
      }

      function buildPredictions(){
        const f=getFormData(),wishes=parseSouhaits(f.souhaits);
        let sim;try{sim=SouhaitsPrediction.simulate(wishes,f,window.SOUHAITS_HISTORY,window.SOUHAITS_DIRECTION_CATALOG,state.importedHistory);}catch(error){clearPredictions();setStatus(error.message);return [];}
        if(!wishes.length){clearPredictions();setStatus(`Ajoute au moins une direction reconnue. ${state.inputWarnings}`);return [];}
        state.simulation=sim;state.predictions=sim.rows;state.departmentPredictions=sim.byDepartment;
        elements.badges.innerHTML=badgeHtml(f,wishes.length);
        const top=[...sim.rows].sort((a,b)=>b.proba-a.proba).slice(0,3);
        elements.kpiTop3.textContent=pct(top.reduce((sum,r)=>sum+r.proba,0));elements.kpiOffice.textContent=pct(sim.unserved);
        elements.kpiRank.textContent=`${Math.round(sim.rankRange[0])}–${Math.round(sim.rankRange[1])}`;
        elements.top3.innerHTML=top.map((r,i)=>`<button type="button" class="topCard" data-dept="${r.code}"><span class="rank">PISTE 0${i+1} · VŒU ${r.ordre}</span><h3>${escapeHtml(r.nom)}</h3><span class="directionDept">${escapeHtml(r.code+' · '+r.departmentName)}</span><div class="pct">${pct(r.proba)}</div><span class="scoreCaption">Scénario central · ${pct(r.low)} à ${pct(r.high)}</span><div class="bar"><span style="width:${r.proba}%"></span></div><div class="small muted">${escapeHtml(r.evidence)}</div></button>`).join('');
        elements.top3.querySelectorAll('[data-dept]').forEach(button=>button.addEventListener('click',()=>openDepartment(button.dataset.dept)));
        renderAllResults();state.heatmapScale=computeHeatmapScale(sim.byDepartment);refreshHeatmapLegend();updateMapStyling();
        if(state.selectedDeptCode){const p=getPredictionByCode(state.selectedDeptCode);updateDgfipPanelForDept(state.selectedDeptCode,state.selectedDeptName,p);drawRadar(p);updateGlobalInfo(state.selectedDeptCode,state.selectedDeptName,p,state.selectedDeptRequestId,state.realDataCache[state.selectedDeptCode],false);}else drawRadar(null);
        updateWishCount();updateScenarioSummary();refreshSelectedWishButton();
        const missingPriority=(f.prioHandicap||f.prioConjoint||f.csEnfant||f.csSoutien)&&!f.priorityDept?' Priorité non appliquée : indiquez son département.':'';
        setStatus(`Simulation V10 : ${wishes.length} vœux de direction, ${sim.byDepartment.length} départements. Modèle exploratoire, ${sim.iterations*3} scénarios. ${sim.importedWishes}/${wishes.length} vœux avec données importées.${missingPriority} ${state.inputWarnings}`);
        animateResults();return sim.rows;
      }
      function getPredictionByCode(code){return state.departmentPredictions.find(p=>p.code===code)||null;}


      function updateDgfipPanelForDept(code,name,pred){
        elements.selectedDeptBadge.textContent=code?`${code} ${name}`:'Aucun département';elements.globalDeptBadge.textContent=code?`${code} ${name}`:'—';
        elements.kpiDeptScore.textContent=pred?pct(pred.proba):'—';
        if(!code){elements.dgfipDeptInfo.textContent='Choisissez un département.';return;}
        const rows=state.predictions.filter(r=>r.code===code),catalog=window.SOUHAITS_DIRECTION_CATALOG;
        const staff=window.SOUHAITS_HISTORY.staff.find(r=>catalog.find(d=>d.id===r.directionCode)?.kind==='territorial'&&catalog.find(d=>d.id===r.directionCode)?.departments[0]===code);
        let html=`<strong>${escapeHtml(code+' '+name)}</strong><br>`;
        html+=pred?`${rows.length} direction(s) dans votre liste. Part cumulée du département : <strong>${pct(pred.proba)}</strong>, plage ${pct(pred.low)}–${pct(pred.high)}. Les directions sont des issues distinctes ; leurs parts s’additionnent.`:'La fiche du territoire est disponible immédiatement, sans liste ni calcul. Ajoutez sa direction territoriale ou une direction spécialisée pour comparer vos vœux.';
        if(rows.length)html+='<ul>'+rows.map(r=>`<li>Vœu ${r.ordre} · <strong>${escapeHtml(r.nom)}</strong> : ${pct(r.proba)} (${pct(r.low)}–${pct(r.high)})<br><span class="muted">${escapeHtml(r.evidence)}</span></li>`).join('')+'</ul>';
        if(staff)html+=`<br>Repère historique <strong>2023</strong> : ${staff.authorized} emplois C autorisés, ${staff.headcount} agents après mouvement (${staff.balance>=0?'+':''}${staff.balance}). <strong>Ce sont des effectifs, pas des postes ouverts aux stagiaires.</strong>`;
        html+='<br><br>Les plages comparent trois hypothèses de disponibilité. Elles ne constituent pas un intervalle de confiance ni une probabilité individuelle validée. Une direction spécialisée peut avoir plusieurs implantations : chaque département doit être précisé.';
        if(elements.modeLonguenesse.checked)html+='<br><br><strong>Longuenesse :</strong> appel spécifique séparé. En 2026, 40 postes annoncés et 27 affectations recensées. Aucun bonus artificiel ajouté au 62.';
        elements.dgfipDeptInfo.innerHTML=html;
      }

      function drawRadar(pred){
        const canvas=elements.radarCanvas,ctx=canvas.getContext('2d');if(!ctx)return;
        const width=canvas.clientWidth,height=canvas.clientHeight;canvas.width=width*devicePixelRatio;canvas.height=height*devicePixelRatio;ctx.scale(devicePixelRatio,devicePixelRatio);ctx.clearRect(0,0,width,height);
        const dark=document.documentElement.dataset.theme==='dark';ctx.font='12px Arial';ctx.textAlign='left';
        ['Prudent','Central','Favorable'].forEach((label,i)=>{const y=35+i*55,value=pred?.scenarios?.[i]||0;ctx.fillStyle='#cee3d7';ctx.fillText(`${label} : ${pct(value)}`,12,y);ctx.fillStyle='rgba(206,227,215,.15)';ctx.fillRect(12,y+8,width-24,14);ctx.fillStyle=['#dc9c49','#258775','#6b73d6'][i];ctx.fillRect(12,y+8,(width-24)*value/100,14);});
      }

      function styleForFeature(feature){
        const code = String(feature.properties.code).toUpperCase();
        const pred = getPredictionByCode(code);
        const isSelected = state.selectedDeptCode === code;

        const dark=document.documentElement.dataset.theme==="dark";
        let fill = dark ? "#29473b" : "#cbdcc5";
        let weight = 1;
        let color = dark ? "#6b9277" : "#78946f";
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
          color = dark ? "#d4efb6" : "#075539";
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
        state.photoController?.abort();
        if(state.selectedDeptCode!==code)elements.directionChoice.value="";
        state.selectedDeptCode = code;
        state.selectedDeptName = name;
        state.selectedDeptRequestId += 1;
        const requestId = state.selectedDeptRequestId;

        const pred = getPredictionByCode(code);
        updateDgfipPanelForDept(code, name, pred);
        drawRadar(pred);
        updateGlobalInfo(code, name, pred, requestId);
        refreshSelectedWishButton();
        updateMapStyling();

        elements.mapOverlay.textContent = `${code} · ${name}. Retrouvez sa projection et son cadre de vie ci-dessous.`;
      }

      function buildSortedMetrics(meta, pred, metrics, cityData){
        const geography=window.SOUHAITS_TERRITORIES?.departments?.[meta.code];
        return [
          {label:"Population communale agrégée",value:geography?.population||0,unit:" hab",desc:"Photographie locale de l’API géographique"},
          {label:"Densité calculée",value:geography?.density||0,unit:" hab/km²",desc:"Surface approchée issue des contours simplifiés"},
          {label:"Communes dans la base",value:geography?.communesCount||0,unit:"",desc:"API Découpage administratif"},
          {label:"Accessibilité logement",value:Math.round((1-housingToScore(meta.housing||"€€"))*100),unit:"/100",desc:"Hypothèse non officielle du simulateur"},

          {label:"Ville la plus peuplée",value:cityData[0]?.estPop||0,unit:" hab",desc:cityData[0]?.name||"Non renseigné"}
        ];
      }

      function updateCityMarker(city){
        if(state.cityMarker && state.map){ state.map.removeLayer(state.cityMarker); state.cityMarker = null; }
        if(!state.map || !city?.coordinates || typeof L === "undefined") return;
        state.cityMarker = L.circleMarker([city.coordinates.lat, city.coordinates.lng], {
          radius:7, color:"#e5f1cc", weight:2, fillColor:"#177c62", fillOpacity:.95
        }).addTo(state.map);
        const label = document.createElement("span"); label.textContent = city.name;
        state.cityMarker.bindPopup(label).openPopup();
      }

      function renderCityChips(cityData){
        elements.cityChips.replaceChildren();
        cityData.forEach((city,idx)=>{
          const button=document.createElement("button");button.type="button";button.className=`cityChip ${idx===0?"active":""}`;
          button.textContent=city.name;button.addEventListener("click",()=>{
            elements.cityChips.querySelectorAll("button").forEach(b=>b.classList.remove("active"));button.classList.add("active");
            state.selectedCityName=city.name;updateCityHighlight(city);updateCityMarker(city);
          });elements.cityChips.append(button);
        });
      }
      function updateCityHighlight(city){
        elements.cityMeta.textContent=city?`${city.name} · ${city.estPop.toLocaleString("fr-FR")} habitants · coordonnées réelles embarquées.`:"Aucune ville renseignée.";
        elements.cityHighlight.replaceChildren();
        const title=document.createElement("h4");title.textContent=city?.name||"Votre point de repère";
        const detail=document.createElement("div");detail.className="small muted";detail.textContent=city?`${city.estPop.toLocaleString("fr-FR")} habitants dans la base communale. Le repère utilise les coordonnées de l’API géographique.`:"Choisissez un département sur la carte.";
        elements.cityHighlight.append(title,detail);
      }
      function localClimate(code,meta){
        if(["971","972","976"].includes(code))return "Climat tropical : variations saisonnières des pluies. Consultez les normales et prévisions locales pour préparer votre installation.";
        if(code==="973")return "Climat équatorial humide : vérifiez la saisonnalité des pluies et les conditions locales.";
        if(code==="974")return "Climat tropical, fortement contrasté selon l’altitude et l’exposition. Comparez les conditions de la commune choisie.";
        if(meta.mountain)return "En zone de relief, l’altitude et l’exposition changent fortement les conditions. Vérifiez la commune et les trajets hivernaux.";
        if(meta.sea)return "Le littoral et l’intérieur peuvent avoir des conditions différentes. Comparez les normales climatiques des communes envisagées.";
        return "Comparez les normales climatiques de la commune envisagée. Aucun chiffre de température n’est inventé par le simulateur.";
      }
      function updateGlobalInfo(code,name,pred,requestId,realData=null,refresh=true){
        const isObsolete=()=>requestId!==state.selectedDeptRequestId||state.selectedDeptCode!==code||!elements.onlineData.checked;
        if(requestId!==state.selectedDeptRequestId||state.selectedDeptCode!==code)return;
        const meta={...(deptDB[code]||{}),code};const metrics=estimateDepartmentMetrics(meta);
        const local=window.SOUHAITS_TERRITORIES?.departments?.[code];
        const cityData=(local?.communes||[]).map(c=>({name:c.nom,estPop:Number(c.population||0),importance:cityImportance(Number(c.population||0)),coordinates:firstValidCoord(c.centre)}));
        elements.infoCities.textContent=cityData.map(c=>c.name).join(", ")||"Données locales indisponibles";
        elements.infoPopulation.textContent=local?`${local.population.toLocaleString("fr-FR")} habitants · ${local.region} · ${local.communesCount} communes dans la base`:`${meta.population||"Non renseigné"} · estimation historique`;
        const features=[meta.sea?"Littoral identifié dans le profil local":null,meta.mountain?"Zones de relief identifiées dans le profil local":null].filter(Boolean);
        elements.infoNature.textContent=features.join(" · ")||"Comparez les communes et les distances à partir de la carte. Aucun trajet routier n’est calculé.";
        elements.infoHousing.textContent=`Niveau logement ${meta.housing||"—"} · tension indicative ${Math.round((meta.tension||.5)*100)}/100 · hypothèses locales`;
        elements.infoRentF2.textContent=`${formatEUR(metrics.rentF2)} / mois · estimation du modèle, à vérifier`;
        elements.infoHousePrice.textContent=`3p : ${formatEUR(metrics.house3p)} · 4p : ${formatEUR(metrics.house4p)} · estimations du modèle`;
        const daily=elements.onlineData.checked?realData?.weather?.daily:null;
        elements.infoClimate.textContent=daily?.temperature_2m_max?.length?`Prévisions 7 jours à proximité de ${cityData[0]?.name||name} : max ${Math.round(Math.max(...daily.temperature_2m_max))}°C · min ${Math.round(Math.min(...daily.temperature_2m_min))}°C · Open-Meteo`:localClimate(code,meta);
        renderCityChips(cityData);updateCityHighlight(cityData[0]);updateCityMarker(cityData[0]);
        const reference=cityData.slice(0,3).map(c=>c.name).join(", ");
        elements.infoSummary.textContent=`${code} ${name}${local?.region?` · ${local.region}`:""}. ${reference?`Les principales villes de la base sont ${reference}. `:""}${local?`Densité calculée : environ ${local.density.toLocaleString("fr-FR")} habitants/km² sur le contour simplifié. `:""}Les données géographiques sont embarquées ; les prix et scores restent des hypothèses à vérifier.`;
        elements.infoSources.textContent=`Base locale : API géographique de l’État, photographie du ${window.SOUHAITS_TERRITORIES?.metadata?.capturedAt||"jour de collecte"}. Population : somme des communes, pas un millésime de recensement revendiqué. Aucun appel externe nécessaire.`;
        if(elements.onlineData.checked&&realData?.wikiDept?.extract){
          elements.infoSummary.textContent=realData.wikiDept.extract;
          const link=document.createElement("a");link.href=`https://fr.wikipedia.org/wiki/${encodeURIComponent(realData.wikiDept.title||name)}`;link.textContent=" Résumé Wikipédia (CC BY-SA).";link.target="_blank";link.rel="noopener noreferrer";elements.infoSources.append(link);
        }
        renderLocalAdvice(meta,pred,local);
        elements.infoSortedMetrics.innerHTML=buildSortedMetrics(meta,pred,metrics,cityData).map(m=>`<li><span><strong>${escapeHtml(m.label)}</strong><br><span class="muted">${escapeHtml(m.desc)}</span></span><span>${safeNum(m.value,0).toLocaleString("fr-FR")}${m.unit}</span></li>`).join("");
        if(refresh&&elements.onlineData.checked){
          buildRealDepartmentData(code,name).then(real=>{if(!isObsolete())updateGlobalInfo(code,name,getPredictionByCode(code),requestId,real,false);}).catch(()=>{});
        }
        elements.btnReloadPhotos.disabled=false;
        if(refresh){if(elements.autoPhotos.checked)loadDepartmentPhotos(code,name,requestId);else{elements.photoGrid.replaceChildren();elements.photoStatus.textContent='Photos automatiques désactivées. La fiche reste disponible.';}}
      }

      function stripMarkup(value){return new DOMParser().parseFromString(String(value),"text/html").body.textContent||"";}
      async function loadDepartmentPhotos(code,name,requestId){
        state.photoController?.abort();const controller=new AbortController();state.photoController=controller;
        const current=()=>!controller.signal.aborted&&requestId===state.selectedDeptRequestId&&code===state.selectedDeptCode;
        elements.photoGrid.replaceChildren();elements.photoStatus.textContent=`Recherche de paysages et monuments : ${name}…`;
        elements.btnReloadPhotos.disabled=true;
        try{
          const photos=await SouhaitsPhotos.loadDepartment({code,name,cities:window.SOUHAITS_TERRITORIES?.departments?.[code]?.communes||[]},{signal:controller.signal});
          if(!current())return;
          for(const photo of photos){
            const card=document.createElement('figure');card.className='photo';const image=document.createElement('img');image.src=photo.src;image.alt=photo.title;image.loading='lazy';image.referrerPolicy='no-referrer';
            image.addEventListener('error',()=>{card.remove();if(!elements.photoGrid.children.length)elements.photoStatus.textContent='Images momentanément indisponibles. Réessayez avec le bouton ci-dessous.';});
            const caption=document.createElement('figcaption');caption.className='cap';const link=document.createElement('a');link.href=photo.source;link.textContent=photo.title;link.target='_blank';link.rel='noopener noreferrer';
            const credit=document.createElement('div');credit.textContent=`${stripMarkup(photo.author)||'Auteur sur la source'} · ${stripMarkup(photo.license)}`;caption.append(link,credit);const imageLink=document.createElement('a');imageLink.href=photo.source;imageLink.target='_blank';imageLink.rel='noopener noreferrer';imageLink.append(image);card.append(imageLink,caption);elements.photoGrid.append(card);
          }
          elements.photoStatus.textContent=photos.length?`${photos.length} illustrations Wikimedia Commons : cliquez sur une image ou sa légende pour la source et la licence.`:'Aucune photo disponible pour le moment. Les infos locales restent accessibles ; vous pouvez relancer la recherche.';
        }catch(error){if(current())elements.photoStatus.textContent='Photos indisponibles sans connexion ou service temporairement indisponible. Les informations du département restent accessibles.';}
        finally{if(current())elements.btnReloadPhotos.disabled=false;}
      }

      async function initMap(){
        if(typeof L === "undefined") throw new Error("Le composant cartographique local n’a pas été chargé.");
        state.map = L.map("map", {
          zoomControl: true,
          attributionControl: true
        }).setView([46.65, 2.3], 6);

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
        elements.mapStatus.textContent = `Carte prête : ${geojson.features.length} départements. Carte locale autonome ; fond en ligne facultatif.`;
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
          totalPostes: "1152",
          prioHandicap: false,
          prioConjoint: false,
          csEnfant: false,
          csSoutien: false,
          modeLonguenesse: false,



          souhaits: [
            "91 Essonne",
            "16 Charente",
            "31 Haute-Garonne",
            "17 Charente-Maritime",
            "79 Deux-Sèvres",
            "85 Vendée",
            "49 Maine-et-Loire",
            "44 Loire-Atlantique",
            "44 DiSI Centre-Ouest",
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
        setStatus("Exemple de directions chargé ; les implantations et postes doivent être vérifiés pour la campagne.");
      }

      function resetUI(){
        try { localStorage.removeItem(STORAGE_KEY); } catch (_error) {}
        state.photoController?.abort();
        state.selectedDeptRequestId += 1;
        elements.btnReloadPhotos.disabled=true;
        elements.photoStatus.textContent='Choisissez un département pour découvrir ses photos.';
        elements.allResults.replaceChildren();
        elements.deptSearch.value = "";
        elements.infoSources.textContent = "Profil local indicatif. Sélectionne un département.";
        setFormData({
          listeType:"LC",
          rang:"",
          totalPostes:"1152",
          prioHandicap:false,
          prioConjoint:false,
          csEnfant:false,
          csSoutien:false,
          modeLonguenesse:false,



          souhaits:""
        });

        state.predictions = []; state.departmentPredictions=[];state.simulation=null;
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
        updateMapStyling();
        updateWishCount();updateScenarioSummary();refreshSelectedWishButton();
        elements.localAdvice.textContent="Sélectionnez un département pour voir sa synthèse locale.";
        elements.generatorStatus.textContent="";
        elements.onlineData.checked=false;elements.onlineBasemap.checked=false;toggleBasemap();
        setStatus("Formulaire et sauvegarde locale effacés. Votre préférence de thème est conservée.");
      }

      function escapeHtml(value){
        return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      }
      function clearPredictions(){
        state.predictions = []; state.departmentPredictions=[];state.simulation=null;
        state.heatmapScale = computeHeatmapScale([]);
        ['kpiTop3','kpiOffice','kpiRank','kpiDeptScore'].forEach(key => elements[key].textContent = '-');
        elements.top3.textContent = 'Aucun résultat. Vérifie le formulaire.';
        elements.allResults.replaceChildren();
        updateMapStyling(); refreshHeatmapLegend(); drawRadar(null);
        if(state.selectedDeptCode){updateDgfipPanelForDept(state.selectedDeptCode,state.selectedDeptName,null);updateGlobalInfo(state.selectedDeptCode,state.selectedDeptName,null,state.selectedDeptRequestId,null,false);}
        updateScenarioSummary();
      }
      function renderAllResults(){
        elements.allResults.innerHTML=`<table><thead><tr><th>Vœu</th><th>Direction / département</th><th>Part simulée</th><th>Ordre</th></tr></thead><tbody>${state.predictions.map((p,index)=>`<tr><td>${p.ordre}</td><td><button type="button" data-dept="${p.code}">${escapeHtml(p.nom)}</button><small class="resultEvidence">${escapeHtml(p.code+' '+p.departmentName)}<br>${escapeHtml(p.evidence)}</small></td><td><strong>${pct(p.proba)}</strong><small class="resultEvidence">${pct(p.low)}–${pct(p.high)}</small></td><td class="reorderActions"><button type="button" data-move="-1" data-code="${p.code}" data-key="${escapeHtml(p.key)}" aria-label="Monter ${escapeHtml(p.nom)}" ${index===0?'disabled':''}>↑</button><button type="button" data-move="1" data-code="${p.code}" data-key="${escapeHtml(p.key)}" aria-label="Descendre ${escapeHtml(p.nom)}" ${index===state.predictions.length-1?'disabled':''}>↓</button></td></tr>`).join('')}</tbody></table>`;
        elements.allResults.querySelectorAll('[data-dept]').forEach(btn=>btn.addEventListener('click',()=>openDepartment(btn.dataset.dept)));
        elements.allResults.querySelectorAll('[data-move]').forEach(btn=>btn.addEventListener('click',()=>moveWish(btn.dataset.key,Number(btn.dataset.move))));
      }

      function exportResults(){
        if(!state.predictions.length){ setStatus('Lance une simulation avant l’export.'); return; }
        const cell = value => `"${String(value).replace(/"/g,'""')}"`;
        const rows = [['Ordre','Direction','Code département','Département','Part centrale (%)','Plage basse (%)','Plage haute (%)','Base de calcul'],...state.predictions.map(p=>[p.ordre,p.directionCode,p.code,p.departmentName,p.proba.toFixed(2),p.low.toFixed(2),p.high.toFixed(2),p.evidence])];
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
        elements.mapRegion.value=code==='971'||code==='972'?'antilles':code==='973'?'guyane':code==='974'?'reunion':code==='976'?'mayotte':'metro';
        const layer = state.deptLayersByCode[code];
        if(state.map && layer){state.map.stop();state.map.fitBounds(layer.getBounds(),{padding:[25,25],maxZoom:9,animate:false});}
      }
      function updateWishCount(){
        const parsed=SouhaitsDirections.parse(elements.souhaits.value,deptDB,window.SOUHAITS_DIRECTION_CATALOG);
        elements.wishCount.textContent=`${parsed.wishes.length} vœu${parsed.wishes.length>1?'x':''} · ${parsed.departments} département${parsed.departments>1?'s':''}`;
      }
      function renderLocalAdvice(meta,pred,local){
        const advice=SouhaitsLocal.advice(meta,pred,local);
        elements.localAdvice.replaceChildren();
        for(const [key,title] of [['facts','Repères concrets'],['strengths','À mettre en balance'],['cautions','Points de vigilance']]){
          const card=document.createElement('article');card.className=`adviceCard ${key}`;
          const heading=document.createElement('h4');heading.textContent=title;
          const list=document.createElement('ul');
          for(const text of advice[key]){const item=document.createElement('li');item.textContent=text;list.append(item);}
          card.append(heading,list);elements.localAdvice.append(card);
        }
      }
      function updateScenarioSummary(){
        elements.scenarioSummary.replaceChildren();
        if(!state.predictions.length){delete elements.kpiOffice.closest('.kpi').dataset.level;elements.scenarioSummary.textContent='Votre synthèse locale apparaîtra après le calcul. Aucune IA ni connexion requise.';elements.scenarioSummary.dataset.level='empty';return;}
        const sorted=[...state.predictions].sort((a,b)=>b.proba-a.proba),top=sorted.slice(0,3);
        const remaining=clamp(100-state.predictions.reduce((sum,p)=>sum+p.proba,0),0,100);
        const title=document.createElement('strong');title.textContent=`${state.predictions.length} vœux, une vue d’ensemble.`;
        const detail=document.createElement('p');detail.textContent=`${top.map(p=>p.nom).join(', ')} arrivent en tête de ce scénario. Le top 3 rassemble ${pct(top.reduce((sum,p)=>sum+p.proba,0))} des affectations simulées.`;
        const risk=document.createElement('span');risk.className='riskPill';risk.textContent=`Hors de cette liste : ${pct(remaining)} (plage ${pct(state.simulation.unservedRange[0])}–${pct(state.simulation.unservedRange[1])}). Ce n’est pas le taux historique d’affectation d’office.`;
        elements.scenarioSummary.dataset.level=remaining>=60?'high':remaining>=30?'watch':'low';
        elements.kpiOffice.closest('.kpi').dataset.level=elements.scenarioSummary.dataset.level;
        const limits=document.createElement('p');limits.className='modelLimits';limits.textContent=`Modèle exploratoire, non calibré individuellement. Campagnes ${state.simulation.usedYears.join(', ')} ; ${state.simulation.importedWishes}/${state.predictions.length} vœux enrichis par vos données. Les postes et les vœux des autres candidats restent inconnus pour les autres directions.`;elements.scenarioSummary.append(title,detail,risk,limits);
      }
      function animateResults(){
        const panel=document.getElementById('resultats');panel.classList.remove('resultUpdated');
        clearTimeout(state.animationTimer);requestAnimationFrame(()=>panel.classList.add('resultUpdated'));state.animationTimer=setTimeout(()=>panel.classList.remove('resultUpdated'),650);
      }
      function generateTestWishes(){
        try {
          const result=SouhaitsLocal.generateWishes(deptDB,{count:Number(elements.testCount.value),scope:elements.testScope.value,profile:elements.testProfile.value});
          if(!result.wishes.length){elements.generatorStatus.textContent='Aucun département ne correspond à ces critères. Essayez un autre profil.';return;}
          let lines=result.wishes.map(d=>`${d.code} ${d.nom}`);
          if(elements.testSpecialized.checked&&lines.length>=2){const eligible=SouhaitsLocal.generateWishes(deptDB,{count:101,scope:elements.testScope.value,profile:elements.testProfile.value}).wishes;const special=window.SOUHAITS_DIRECTION_CATALOG.filter(d=>d.kind==='specialized').flatMap(d=>d.departments.map(code=>({d,code}))).find(({code})=>eligible.some(w=>w.code===code));if(special){lines=lines.filter(line=>findDeptCode(line)!==special.code);lines.unshift(`${special.code} ${deptDB[special.code].nom}`,`${special.code} ${special.d.id} ${special.d.name}`);lines=lines.slice(0,result.wishes.length);}}
          elements.souhaits.value=lines.join('\n');
          if(!elements.rang.value)elements.rang.value='317';
          updateWishCount();buildPredictions();
          const first=result.wishes[0];openDepartment(first.code);
          elements.generatorStatus.textContent=`${result.wishes.length} vœux de test générés, sans doublon.${elements.testSpecialized.checked?' Directions spécialisées ajoutées si une implantation d’exemple correspond aux critères.':''}${result.limited?` ${result.available} départements correspondent à ces critères : la liste a été limitée.`:''} Cliquez à nouveau pour varier la liste.`;
        }catch(error){elements.generatorStatus.textContent=error.message;}
      }
      function selectedDirection(){
        const code=state.selectedDeptCode;if(!code)return null;
        return SouhaitsDirections.parseLine(`${code} ${elements.directionChoice.value||deptDB[code].nom}`,deptDB,window.SOUHAITS_DIRECTION_CATALOG);
      }
      function refreshSelectedWishButton(){
        const selected=selectedDirection();elements.btnToggleWish.disabled=!selected;
        if(!selected){elements.btnToggleWish.textContent='Choisissez un département et une direction';return;}
        const included=parseSouhaits(elements.souhaits.value).some(w=>w.key===selected.key);
        elements.btnToggleWish.dataset.included=String(included);elements.btnToggleWish.textContent=`${included?'Retirer':'Ajouter'} ${selected.nom} (${selected.code}) ${included?'de':'à'} mes vœux`;
      }
      function toggleSelectedWish(){
        const selected=selectedDirection();if(!selected)return;
        const lines=elements.souhaits.value.split(/\n/).filter(line=>line.trim()),parse=raw=>SouhaitsDirections.parseLine(raw,deptDB,window.SOUHAITS_DIRECTION_CATALOG);
        if(lines.some(line=>parse(line)?.key===selected.key))elements.souhaits.value=lines.filter(line=>parse(line)?.key!==selected.key).join('\n');
        else elements.souhaits.value=[...lines,elements.directionChoice.value?SouhaitsDirections.format(selected):`${selected.code} ${deptDB[selected.code].nom}`].join('\n');
        updateWishCount();refreshSelectedWishButton();buildPredictions();
      }
      function moveWish(key,direction){
        const lines=elements.souhaits.value.split('\n'),seen=new Set(),recognized=[];
        lines.forEach((raw,index)=>{const w=SouhaitsDirections.parseLine(raw,deptDB,window.SOUHAITS_DIRECTION_CATALOG);if(w&&!seen.has(w.key)){seen.add(w.key);recognized.push({key:w.key,index});}});
        const current=recognized.findIndex(row=>row.key===key),target=current+direction;if(current<0||target<0||target>=recognized.length)return;
        const i=recognized[current].index,j=recognized[target].index;[lines[i],lines[j]]=[lines[j],lines[i]];elements.souhaits.value=lines.join('\n');updateWishCount();buildPredictions();
      }

      function toggleBasemap(){
        if(!state.map||typeof L==='undefined')return;
        if(state.basemap){state.map.removeLayer(state.basemap);state.basemap=null;}
        if(elements.onlineBasemap.checked)state.basemap=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(state.map);
      }
      function initHistory(){
        const key='souhaits_history_v10',status=document.getElementById('historyImportStatus');
        try{const saved=localStorage.getItem(key);if(saved)state.importedHistory=SouhaitsPrediction.validateRows(JSON.parse(saved),window.SOUHAITS_DIRECTION_CATALOG,deptDB);}catch(_error){state.importedHistory=[];status.textContent='Import ancien illisible : données embarquées conservées.';}
        const data=window.SOUHAITS_HISTORY;
        document.getElementById('historySummary').innerHTML=`<p><strong>${data.national.length} campagnes, ${data.staff.length} directions, ${data.departmentObservations.length} observations locales d’arrivées.</strong> Effectifs et premières affectations sont séparés. Les destinations exactes des autres candidats ne sont pas connues.</p><div class="historyTable"><table><thead><tr><th>Année</th><th>Affectés nationaux</th><th>Office</th><th>Priorités demandées</th></tr></thead><tbody>${data.national.map(r=>`<tr><td>${r.year}</td><td>${r.assigned??'Non documenté'}</td><td>${r.office}</td><td>${r.priorityRequests}</td></tr>`).join('')}</tbody></table></div><p class="fieldHint">2026 : 1152 = 169 Île-de-France + 983 province ; autres CNAL exclus. Les périmètres évoluent. Un effectif de direction n’est pas une offre pour un département. Seules les années antérieures à la campagne alimentent les références historiques.</p><details><summary>Consulter les sources</summary><ul class="historySources">${data.sources.map(source=>`<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.title)}</a><small>${escapeHtml(source.scope)}</small></li>`).join('')}</ul><a href="./METHODOLOGY.md" target="_blank" rel="noopener noreferrer">Méthode, hypothèses et limites</a></details>`;
        const update=()=>{status.textContent=`${state.importedHistory.length} observation(s) importée(s). Aucun envoi vers un serveur.`;};if(state.importedHistory.length)update();
        document.getElementById('historyCSV').addEventListener('change',async event=>{
          const file=event.target.files?.[0];if(!file)return;
          try{if(file.size>2000000)throw new Error('Fichier trop volumineux (2 Mo maximum).');const parsed=SouhaitsPrediction.parseCSV(await file.text(),window.SOUHAITS_DIRECTION_CATALOG,deptDB);state.importedHistory=parsed;clearPredictions();try{localStorage.setItem(key,JSON.stringify(parsed));update();}catch(_error){status.textContent=`${parsed.length} observations chargées pour cette session ; stockage bloqué.`;}}catch(error){status.textContent='Import refusé : '+error.message;}event.target.value='';
        });
        document.getElementById('btnHistoryClear').addEventListener('click',()=>{state.importedHistory=[];try{localStorage.removeItem(key);}catch(_error){}clearPredictions();update();});
        document.getElementById('btnHistoryTemplate').addEventListener('click',()=>{
          const text='year,direction,department,offers,requests,assigned,lastRank,source,scope\n';
          const url=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='souhaits-donnees-modele.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
          status.textContent='Modèle vide téléchargé. Exemples de codes : 440 (DR/DDFiP 44), D44 (DiSI Centre-Ouest), A15 (SDNC). Ajoutez uniquement des mesures sourcées de première affectation C administratif.';
        });
      }

      function initLocalFeatures(){
        initHistory();
        elements.directionChoice.addEventListener('input',refreshSelectedWishButton);
        for(const d of window.SOUHAITS_DIRECTION_CATALOG.filter(d=>d.kind!=='territorial')){const o=document.createElement('option');o.value=d.id+' '+d.name;elements.directionOptions.append(o);}
        elements.onlineData.checked=false;elements.onlineBasemap.checked=false;
        elements.btnGenerate.addEventListener('click',generateTestWishes);
        elements.btnToggleWish.addEventListener('click',toggleSelectedWish);
        elements.souhaits.addEventListener('input',()=>{updateWishCount();refreshSelectedWishButton();clearPredictions();});
        [elements.rang,elements.totalPostes,elements.campaign,elements.mainSize,elements.internalSize,elements.priorityDept].forEach(input=>input.addEventListener('input',clearPredictions));
        [elements.rankMode,elements.listeType,elements.prioHandicap,elements.prioConjoint,elements.csEnfant,elements.csSoutien,elements.modeLonguenesse].forEach(input=>input.addEventListener('change',clearPredictions));
        elements.onlineBasemap.addEventListener('change',toggleBasemap);
        elements.autoPhotos.addEventListener('change',()=>{state.photoController?.abort();if(state.selectedDeptCode){if(elements.autoPhotos.checked)loadDepartmentPhotos(state.selectedDeptCode,state.selectedDeptName,state.selectedDeptRequestId);else{elements.photoGrid.replaceChildren();elements.photoStatus.textContent='Photos automatiques désactivées.';elements.btnReloadPhotos.disabled=false;}}});
        elements.btnReloadPhotos.addEventListener('click',()=>{if(state.selectedDeptCode)loadDepartmentPhotos(state.selectedDeptCode,state.selectedDeptName,state.selectedDeptRequestId);});
        elements.onlineData.addEventListener('change',()=>{
          state.selectedDeptRequestId+=1;state.photoController?.abort();
          if(state.selectedDeptCode)updateGlobalInfo(state.selectedDeptCode,state.selectedDeptName,getPredictionByCode(state.selectedDeptCode),state.selectedDeptRequestId,state.realDataCache[state.selectedDeptCode]);
        });
        window.addEventListener('souhaits:themechange',()=>{updateMapStyling();drawRadar(getPredictionByCode(state.selectedDeptCode));});
        updateWishCount();refreshSelectedWishButton();updateScenarioSummary();
        // Register only in secure web contexts. file:// still supports the local app itself.
        if('serviceWorker' in navigator&&window.isSecureContext)navigator.serviceWorker.register('./sw.js').then(()=>navigator.serviceWorker.ready).then(()=>{const label=document.getElementById('offlineStatus');if(label)label.textContent='Application prête hors connexion';}).catch(()=>{});
      }

      elements.btnOpenDept.addEventListener('click',() => openDepartment(elements.deptSearch.value));
      elements.deptSearch.addEventListener('keydown',event => { if(event.key === 'Enter') openDepartment(elements.deptSearch.value); });
      elements.btnExport.addEventListener('click',exportResults);
      elements.mapRegion.addEventListener('change', () => {
        const regions = {metro:[[41,-5.8],[51.7,9.8]],antilles:[[14,-62],[17,-59]],guyane:[[2,-55],[6,-51]],reunion:[[-21.5,55.1],[-20.8,56]],mayotte:[[-13.1,44.9],[-12.5,45.5]]};
        if(state.map){state.map.stop();state.map.fitBounds(regions[elements.mapRegion.value],{padding:[15,15],animate:false});}
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

      loadLocal();
      initDepartmentSearch();
      drawRadar(null);
      updateHeatmapUi();
      updateFullscreenButtons();
      initLocalFeatures();
      initMap().catch(err => {
        elements.mapStatus.textContent = `Carte indisponible : ${err.message} Utilise la recherche de département ci-dessus.`;
      });
    })();
