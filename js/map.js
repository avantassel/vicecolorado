dojo.require("esri.layers.KMLLayer");
dojo.require("esri.map");
dojo.require("esri.dijit.InfoWindowLite");
dojo.require("esri.layers.FeatureLayer");
  dojo.require("esri.tasks.locator");

var map;
var layer_breweries
	, layer_chocolate
	, layer_dispensaries
	, layer_distilleries
	, layer_wine_bars
	, layer_crimes
	, layer_bcycle
	, layer_parks
	, layer_cityKml;
	
/* mongolab.com API key */	
var mongoLabAPIKey = '';

require(["esri/map","esri/dijit/PopupTemplate", "esri/geometry/Point", "esri/graphic", "esri/request", "js/utils.js", "dojo/on", "dojo/dom", "dojo/domReady!"], 
      
      

    function(Map, PopupTemplate, Point, Graphic, Request, utils, on, dom) {
        "use strict"

        var reorder=1;
        var symbol;
        
        // Create map
        map = new Map("mapDiv", { 
          basemap: "gray",
          center: [-104.98619, 39.73925],
          zoom: 10
        });
        utils.autoRecenter(map);
        
        /* START CRIME */
        var crimeTemplate = new esri.InfoTemplate();
        crimeTemplate.setTitle("<b>${type_name}</b>");
        crimeTemplate.setContent("This ${category_name} occured at ${address} during ${occurrence_date}.");
        
        layer_crimes = new esri.layers.GraphicsLayer();
        layer_crimes.setInfoTemplate(crimeTemplate);
          
        map.addLayer(layer_crimes);
        map.reorderLayer(layer_crimes,reorder);
        getCrime();

        dojo.connect(map, "onLoad", maploaded);
		
        function getCrime() {
            $.getJSON('https://api.mongolab.com/api/1/databases/vice/collections/crimes?apiKey='+mongoLabAPIKey,
                function(data) {
                    if (data) {
                        $.each(data, function() {
                            addOffence(this);
                        });
                    };
                }, 'jsonp')
        }

        function addOffence(offence) {
            var symbol = new esri.symbol.PictureMarkerSymbol( {
                    "url":'images/pins/crime.png',
                    "height":20,
                    "width":20,
                    "type":"esriPMS"
                });

            symbol.setColor(new dojo.Color([0,0,0]));
            layer_crimes.add(new esri.Graphic(new esri.geometry.Point(offence.coordinates), symbol, offence));
        }
        /* END CRIME */

        /* START VICES */
        var vices = [{'name':'breweries', 'color':[184,134,11], 'icon':'images/pins/beer.png'},
            {'name':'chocolate', 'color':[139,69,19], 'icon':'images/pins/sweets.png'},
            {'name':'dispensaries', 'color':[34,139,34], 'icon':'images/pins/weed.png'},
            {'name':'distilleries', 'color':[255,255,0], 'icon':'images/pins/distillery.png'},
            {'name':'wine_bars', 'color':[255,0,255], 'icon':'images/pins/wine_bars.png'}];
        var viceTemplate = new esri.InfoTemplate();
        viceTemplate.setTitle("<b>${name}</b>");
        viceTemplate.setContent("${address}.");
        
        $.each(vices,function() {

            var viceLayer =new esri.layers.GraphicsLayer();
            viceLayer.setInfoTemplate(viceTemplate);
            map.addLayer(viceLayer);
            map.reorderLayer(viceLayer, reorder++);

            switch(this.name) {
                case 'wine_bars':
                    layer_wine_bars=viceLayer;
                    getVice(layer_wine_bars,this.name, this.color, this.icon);
                    break;
                case 'breweries':
                    layer_breweries=viceLayer;
                    getVice(layer_breweries,this.name, this.color, this.icon);
                    break;
                case 'chocolate':
                    layer_chocolate=viceLayer;
                    getVice(layer_chocolate,this.name, this.color, this.icon);
                    break;
                case 'dispensaries':
                    layer_dispensaries=viceLayer;
                    getVice(layer_dispensaries,this.name, this.color, this.icon);
                    break;
                case 'distilleries':
                    layer_distilleries=viceLayer;
                    getVice(layer_distilleries,this.name, this.color, this.icon);
                    break;
                case 'parks':
                    layer_parks=viceLayer;
                    getVice(layer_parks,this.name, this.color, this.icon);
                    break;
                case 'bcycle':
                    layer_bcycle=viceLayer;
                    getVice(layer_bcycle,this.name, this.color, this.icon);
                    break;
                }
        });

        function getVice(viceLayer,name,color,icon) {
            $.getJSON('https://api.mongolab.com/api/1/databases/vice/collections/'+name+'?apiKey='+mongoLabAPIKey,
                function(data) {
                    if (data) {
                        $.each(data, function() {
                            addVice(viceLayer,this, color, icon);
                        });
                    };
                }, 'jsonp')
        }
		
        function addVice(viceLayer,vice,color,icon) {
            var symbol;
            if (icon !== '') {
                symbol = new esri.symbol.PictureMarkerSymbol( {
                    "url":icon,
                    "height":20,
                    "width":20,
                    "type":"esriPMS"
                });
            } else {
                symbol = new esri.symbol.SimpleMarkerSymbol( {"color":new dojo.Color(color)} );
            }
            viceLayer.add(new esri.Graphic(new esri.geometry.Point(vice.loc), symbol, vice));
        }
        /* END VICES */

        function clearGraphics() {
            map.graphics.clear();
            map.infoWindow.hide();
        }

        function loadCounties() {
            var cityKmlURL = 'http://vicecolorado.com/data/dry_counties.kml';
            layer_cityKml = new esri.layers.KMLLayer(cityKmlURL);
            map.addLayer(layer_cityKml);
            map.reorderLayer(layer_cityKml, reorder++);
        }

        function loadParks() {
            var cityParks = 'http://vicecolorado.com/data/parks.kml';
            layer_parks = new esri.layers.KMLLayer(cityParks);
            map.addLayer(layer_parks);
            map.reorderLayer(layer_parks, reorder++);
        }

        function loadBcycle() {
            var cityBcycle = 'http://vicecolorado.com/data/b_cycle_stations.kml';
            layer_bcycle = new esri.layers.KMLLayer(cityBcycle);
            map.addLayer(layer_bcycle);
            map.reorderLayer(layer_bcycle, reorder++);
        }

        loadCounties();
        loadParks();
        loadBcycle();

        // Adds heatmap
        var heatmapLayer = new esri.layers.FeatureLayer("http://services1.arcgis.com/M8KJPUwAXP8jhtnM/arcgis/rest/services/Hot%20Spots%20DenverCrime2012%20-%20crime/FeatureServer/0",
          {mode: esri.layers.FeatureLayer.MODE_SELECTION,
          //infoTemplate: new esri.InfoTemplate("Block: ${BLOCK}", "${*}"),
          outFields: ["*"]}
        );

        map.addLayer(heatmapLayer);
        map.reorderLayer(heatmapLayer,reorder++);

        
        
 
    }
);

