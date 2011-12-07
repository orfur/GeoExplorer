Ext.namespace("gxp.plugins");
  
gxp.plugins.Featurekazihatti = Ext.extend(gxp.plugins.Tool, {
    
    ptype: "gxp_featurekazihatti",
    outputTarget: "map",
    popupCache: null,
    kaziActionTip: "Kazi hattı oluştur",
    popupTitle: "Kazi hattı oluştur",
    featureLayer: null,
    tooltip: "Kazi hattı oluştur",
	  gs_WmsMapUrl: "http://10.0.0.153:8080/geoserver/wms",
	  //-> /geoserver/wfs geoserver local olacagindan dolayi - bu sekilde yazabiliriz.
	  gs_WfsKaziHatUrl : "http://10.0.0.153:8080/geoserver/wfs",
	  gs_WfsKaziHat : "UniversalWorkspace:SDE.KAZIHATTI",
	  gs_WfsGeometry : "SHAPE",
	  gs_MapProjection : "EPSG:900913",
	  saveStrategy:null,
	  snap:null,
      init: function(target) {
        gxp.plugins.Featurekazihatti.superclass.init.apply(this, arguments);
        this.toolsShowingLayer = {};
        
        
	    this.saveStrategy = new OpenLayers.Strategy.Save();
		this.saveStrategy.events.register('start', null, saveStart);
		this.saveStrategy.events.register('success', null, saveSuccess);
		this.saveStrategy.events.register('fail', null, saveFail);
        
        this.featureLayer = new OpenLayers.Layer.Vector(this.id, {
        	strategies: [this.saveStrategy],
            displayInLayerSwitcher: false,
            visibility: true,
            projection:new OpenLayers.Projection("EPSG:900913"),
            protocol: new OpenLayers.Protocol.WFS({
                version: "1.1.0",
                url: this.gs_WfsKaziHatUrl,
                featureType: "SDE.KAZIHATTI",
				featureNS:"UniversalWorkspace",
                geometryName: this.gs_WfsGeometry
            }),
            styleMap: new OpenLayers.StyleMap({
                "default": new OpenLayers.Style(null, {
                    rules: [
                        new OpenLayers.Rule({
                            symbolizer: {
                                "Line": {
                                    strokeWidth: 3,
                                    strokeOpacity: 1,
                                    strokeColor: "#00ccff"
                                }
                            }
                        })
                    ]
                })
            })    
        });
        
        

        
        this.target.on({
            ready: function() {
                this.target.mapPanel.map.addLayer(this.featureLayer);
            },
            //TODO add featureedit listener; update the store
            scope: this
        });
        this.on({
            //TODO add a beforedestroy event to the tool
            beforedestroy: function() {
                this.target.mapPanel.map.removeLayer(this.featureLayer);
            },
            scope: this
        });
        
        this.snap = new OpenLayers.Control.Snapping({layer: this.featureLayer});
        this.target.mapPanel.map.addControl(this.snap);
        this.snap.activate();
        
		function saveStart(event) {
			//alert('SaveStrategy: Starting to save.');
		}

		function saveSuccess(event) {
			//alert('SaveStrategy: Changes saved.');
			 var response = event.response; 
			 //var features = response.features;
			 var insertids = response.insertIds;
			for(var i=0;i<insertids.length;i++)
				alert(insertids[i]);

		}

		function saveFail(event) {
			alert('SaveStrategy: Error, changes not saved.');
		}
    },
    
    
    addActions: function() {

    	  
  	  var map,info,controls,wfs;
      var actions = [new GeoExt.Action({
            tooltip: this.tooltip,
            menuText: this.menuText,
            iconCls: "gxp-icon-pan",
            enableToggle: true,
            pressed: true,
            allowDepress: false,
            control: new OpenLayers.Control.Navigation(this.controlOptions),
            map: this.target.mapPanel.map,
            toggleGroup: this.toggleGroup})];
        
      var drawControl = new OpenLayers.Control.DrawFeature(
        		this.featureLayer,
                OpenLayers.Handler.Path, 
                {
        			multi: true,
                    eventListeners: {
                        featureadded: function(evt) {
                        	
                        	
      						 var typename = 'UniversalWorkspace:SDE.KARAYOLU';
    						 var typenameMah = 'UniversalWorkspace:SDE.KOYMAHALLE';
    						 var attribute = 'YOL_ID,YOL_ISMI,KAPLAMA_CI,SHAPE';
    						 var gs_WfsKaziHatUrl = "http://10.0.0.153:8080/geoserver/wfs";
    						 var gs_MapProjection = "EPSG:900915";
    						 var wfsurl;

                    			
                    		Proj4js.defs["EPSG:900915"] = "+proj=tmerc +lat_0=0 +lon_0=30 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +datum=ITRF96 +units=m +no_defs";
                    		var proj = new OpenLayers.Projection("EPSG:900915");
                    		
                    		var geometryLineString = "";
                    		var feature = evt.feature;
    						var nodes = feature.geometry.getVertices(); 
    						
    						for (var i=0; i<nodes.length; i++) 
    						{ 
    						  var lon = nodes[i].x; 
    						  var lat = nodes[i].y; 
    						  var lonlat = new OpenLayers.LonLat(lon, lat);
    						  lonlat.transform(this.featureLayer.projection,proj);
    						  if(i==nodes.length-1)
    							geometryLineString += lonlat.lon + "%20" + lonlat.lat;
    						  else
    							geometryLineString += lonlat.lon + "%20" + lonlat.lat + ",";
    						}
    						 
    						 wfsurl = gs_WfsKaziHatUrl +  '?SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&SRS=' + gs_MapProjection + '&outputFormat=json' + '&typename=' + typename+ '&propertyName=' + attribute +'&cql_filter=DWITHIN(SHAPE,LINESTRING(' + geometryLineString + '),2,meters)';			 
    						 
    						 var request = OpenLayers.Request.GET({
    							    url: wfsurl,
    							    async: false
    							});

    						  var featureAttributes  =	feature.attributes;
    						  var g =  new OpenLayers.Format.JSON(); 
    						  var features_sCollection = g.read(request.responseText); 
    						  var features_sokak = features_sCollection.features;
    						  for(var i=0;i<features_sokak.length;i++) 
    						  { 
    							    geometryLineString = "";
    								var attributes = features_sokak[i].properties;
    								
    								for (var coordinateIndex=0; coordinateIndex<features_sokak[i].geometry.coordinates[0].length; coordinateIndex++) 
    								{ 
    									geometryLineString+= features_sokak[i].geometry.coordinates[0][coordinateIndex][0] + "%20";
    									geometryLineString+= features_sokak[i].geometry.coordinates[0][coordinateIndex][1];
    									
    									if(coordinateIndex!=features_sokak[i].geometry.coordinates[0].length-1)
    										geometryLineString+=",";
    								}
    								
    								var wfsurl2 = gs_WfsKaziHatUrl +  '?SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&SRS=' + 
    											  gs_MapProjection + '&outputFormat=json' +'&typename=' + typenameMah+ 
    											  '&propertyName=ILCEADI,ILCEID,KOYMAHALLEADI,MAHALLEID,SHAPE&cql_filter=INTERSECTS(SHAPE,LINESTRING(' + 
    											  geometryLineString + '))';
    								
    	   						    var request_Mah = OpenLayers.Request.GET({
    									    url: wfsurl2,
    									    async: false
    								});
    								
    								var gMah =  new OpenLayers.Format.JSON(); 
    								var featuresMCollection = gMah.read(request_Mah.responseText); 
    								var featuresMahalle = featuresMCollection.features;
    								for(var j=0;j<featuresMahalle.length;j++) 
    								{	 
    									var attributesMah = featuresMahalle[j].properties;
    									featureAttributes["YOL_ID"] 	= attributes["YOL_ID"];
    									featureAttributes["YOL_ISMI"] 	= attributes["YOL_ISMI"];
    									featureAttributes["YOL_KAPLAMA_CINSI"] 	= attributes["KAPLAMA_CI"];
    									featureAttributes["MAH_ID"] 	= attributesMah["MAHALLEID"];
    									featureAttributes["MAH_ADI"] 	= attributesMah["KOYMAHALLEADI"];
    									featureAttributes["ILCE_ID"] 	= attributesMah["ILCEID"];
    									featureAttributes["ILCE_ADI"] 	= attributesMah["ILCEADI"];
    								}
    								alert(request_Mah.responseText);
    							
    						  }
    						  

    						 alert(request.responseText);
                        	
                        	
                        	
                        },
                        activate: function() {
                        	//alert("activate");
                        },
                        deactivate: function() {
                            //alert("deactive");
                        },
                        scope: this
                    }
                }
            );
        
        var actions = [new GeoExt.Action({
	            tooltip: "Kazı Hattı Oluştur",
	            menuText: "Kazı Hattı Oluştur",
	            iconCls: "gxp-icon-addfeature",
	            enableToggle: true,
	            pressed: false,
	            allowDepress: false,
	            control: drawControl,
	            map: this.target.mapPanel.map,
	            toggleGroup: this.toggleGroup})];
        
        
        actions.push(new GeoExt.Action({
	            tooltip: "Kazı hatlarını kaydet",
	            menuText: "Kazı hatlarını kaydet",
	            iconCls: "gxp-icon-featurekazihattisave",
	            enableToggle: false,
	            pressed: false,
	            allowDepress: false,
	            saveStrategy:this.saveStrategy,
	            handler: function(evt){ evt.saveStrategy.save()}, //console.log(evt.saveStrategy)},
	            map: this.target.mapPanel.map}));
        
        	
        	return actions = gxp.plugins.Testtool.superclass.addActions.call(this, actions);//gxp.plugins.Featurekazihatti.superclass.addActions.apply(this, [actions]);
        }      
		
});

Ext.preg(gxp.plugins.Featurekazihatti.prototype.ptype, gxp.plugins.Featurekazihatti);
