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
    						 
    						 //console.log(request.responseText);
    						 var featureAttributes  =	feature.attributes;
    						 var jsonFormatter =  new OpenLayers.Format.JSON(); 
    						 var featuresSokak = jsonFormatter.read(request.responseText).features;
    						 var mahSokStore = new Ext.data.ArrayStore({
						        id: 0,
						        fields: ['YOL_ID','YOL_ISMI','YOL_KAPLAMA_CINSI','MAH_ID','MAH_ADI','ILCE_ID','ILCE_ADI','MAH_SOK']
							 });
    						 for(var i=0;i<featuresSokak.length;i++) 
    						 { 
    							geometryLineString = "";
    							var attrSok = featuresSokak[i].properties;
    							if (mahSokStore.find("YOL_ISMI",attrSok["YOL_ISMI"])==-1)
    							{
    								mahSokStore.add(new Ext.data.Record({'YOL_ID': attrSok["YOL_ID"], 'YOL_ISMI':attrSok["YOL_ISMI"], 'YOL_KAPLAMA_CINSI': attrSok["KAPLAMA_CI"]}));
	    							for (var coordinateIndex=0; coordinateIndex<featuresSokak[i].geometry.coordinates[0].length; coordinateIndex++) 
	    							{ 
	    								geometryLineString+= featuresSokak[i].geometry.coordinates[0][coordinateIndex][0] + "%20";
	    								geometryLineString+= featuresSokak[i].geometry.coordinates[0][coordinateIndex][1];
	    								if(coordinateIndex!=featuresSokak[i].geometry.coordinates[0].length-1)
	    									geometryLineString+=",";
	    							}
									wfsurl = gs_WfsKaziHatUrl +  '?SERVICE=WFS&VERSION=1.0.0&REQUEST=GetFeature&SRS=' + 
												  gs_MapProjection + '&outputFormat=json' +'&typename=' + typenameMah+ 
												  '&propertyName=ILCEADI,ILCEID,KOYMAHALLEADI,MAHALLEID&cql_filter=INTERSECTS(SHAPE,LINESTRING(' + 
												  geometryLineString + '))';
									 
									request = OpenLayers.Request.GET({
										    url: wfsurl,
										    async: false
									});
	    								
									//console.log(request.responseText);
									var featuresMahalle = jsonFormatter.read(request.responseText).features;
									for(var j=0;j<featuresMahalle.length;j++) 
									{	 
										var attrMah = featuresMahalle[j].properties;
										var item = mahSokStore.getAt(mahSokStore.find("YOL_ID",attrSok["YOL_ID"]));
										item.data["MAH_ID"] = attrMah["MAHALLEID"];
										item.data["MAH_ADI"] = attrMah["KOYMAHALLEADI"];
										item.data["ILCE_ID"] = attrMah["ILCEID"];
										item.data["ILCE_ADI"] = attrMah["ILCEADI"];
										item.data["MAH_SOK"] = attrMah["KOYMAHALLEADI"]+" : "+item.data["YOL_ISMI"];
									}
    							}
    						  }
    						  console.log("s:"+featuresSokak.length+" m:"+featuresMahalle.length+" ms:"+mahSokStore.getCount());
    						  if (mahSokStore.getCount() > 1)
    						  {
    							  var cbxRegion = new Ext.form.ComboBox({
    								    typeAhead: true,
    								    triggerAction: 'all',
    								    lazyRender:true,
    								    editable: false,
    						            allowBlank: false,
    						            forceSelection: true,
    						            width: 200,
    								    mode: 'local',
    								    fieldLabel: "Sokak",
    								    store: mahSokStore,
    								    valueField: 'YOL_ID',
    								    displayField: 'MAH_SOK'
    							  });
    							  var selectRegionWin = new Ext.Window({
							            title: "Mahalle / Sokak Seçin",
							            layout: "fit",
							            height: 100,
							            width: 280,
							            items: [
							                    {
									                xtype: "form",
									                bodyStyle: "padding: 5px;",
									                labelWidth: 40,
									                items: [
										                cbxRegion
									                ]
							            		}],
					            		buttons: [{
					                        text: "Tamam",
					                        formBind: true,
					                        handler: function(){
					                        	console.log(cbxRegion.getValue());
					                        	var item = mahSokStore.getAt(mahSokStore.find("YOL_ID",cbxRegion.getValue()));
					                        	for (r in item.data)
					                        	{
					                        		if (r!='MAH_SOK')
					                        			featureAttributes[r] = item.data[r];
					                        	}
					                        	console.log(featureAttributes);
					                        	selectRegionWin.hide();
					                        },
					                        scope: this
					                    }],
							            modal: true    							         
							        });
									selectRegionWin.show();
    						  }
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
        
        	
        	return actions = gxp.plugins.Featurekazihatti.superclass.addActions.apply(this, [actions]);//gxp.plugins.Featurekazihatti.superclass.addActions.apply(this, [actions]);
        }      
		
});

Ext.preg(gxp.plugins.Featurekazihatti.prototype.ptype, gxp.plugins.Featurekazihatti);
