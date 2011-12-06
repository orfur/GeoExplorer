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
	  gs_WfsKaziHatUrl : "http://10.0.0.153:8080/geoserver/wfs",
	  gs_WfsKaziHat : "UniversalWorkspace:SDE.KAZIHATTI",
	  gs_WfsGeometry : "SHAPE",
	  gs_MapProjection : "EPSG:900913",
	  saveStrategy:null,
    init: function(target) {
        gxp.plugins.Featurekazihatti.superclass.init.apply(this, arguments);
        this.toolsShowingLayer = {};
        
        this.style = {
            "all": new OpenLayers.Style(null, {
                rules: [new OpenLayers.Rule({
                    symbolizer: this.initialConfig.symbolizer || {
                        "Point": {
                            pointRadius: 4,
                            graphicName: "square",
                            fillColor: "white",
                            fillOpacity: 1,
                            strokeWidth: 1,
                            strokeOpacity: 1,
                            strokeColor: "#333333"
                        },
                        "Line": {
                            strokeWidth: 4,
                            strokeOpacity: 1,
                            strokeColor: "#ff9933"
                        },
                        "Polygon": {
                            strokeWidth: 2,
                            strokeOpacity: 1,
                            strokeColor: "#ff6633",
                            fillColor: "white",
                            fillOpacity: 0.3
                        }
                    }
                })]
            }),
            "selected": new OpenLayers.Style(null, {
                rules: [new OpenLayers.Rule({symbolizer: {display: "none"}})]
            })
        };
        
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
                "select": OpenLayers.Util.extend({display: ""},
                    OpenLayers.Feature.Vector.style["select"]),
                "vertex": this.style["all"]
            }, {extendDefault: false})    
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
        
		function saveStart(event) {
			alert('SaveStrategy: Starting to save.');
		}

		function saveSuccess(event) {
			alert('SaveStrategy: Changes saved.');
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
//	  var gs_WmsMapUrl = "http://10.0.0.53:8080/geoserver/wms";
//	  var gs_WfsKaziHatUrl = "http://10.0.0.53:8080/geoserver/wfs";
//	  var gs_WmsLayes = "UniversalWorkspace:SDE.KOYMAHALLE,UniversalWorkspace:SDE.KARAYOLU,UniversalWorkspace:SDE.KOCAELI_KAPI,UniversalWorkspace:SDE.KOCAELI_YAPI,UniversalWorkspace:SDE.KAZIHATTI";
//	  var gs_WfsKaziHat = "UniversalWorkspace:SDE.KAZIHATTI";
//	  var gs_WfsGeometry = "SHAPE";
//	  var gs_MapProjection = "EPSG:900915";
		
	    
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
                    eventListeners: {
                        featureadded: function(evt) {
                        	alert("featureadded");
                        },
                        activate: function() {
                        	alert("activate");
//                        	for(var k=0;k<map.layers.length;k++)
//                        	{
//                        		if(map.layers[k].name == "UniversalWorkspace:SDE.KAZIHATTI")
//                        		{
//                        			wfs = this.target.mapPanel.map.layers[k];
//                        			return;
//                        		}
//                        	}
                        	
                        },
                        deactivate: function() {
                            alert("deactive");
                        },
                        scope: this
                    }
                }
            );
        
        var actions = [new GeoExt.Action({
	            tooltip: "test",
	            menuText: "test",
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
	            enableToggle: true,
	            pressed: false,
	            allowDepress: false,
	            control: new OpenLayers.Control({
	                activate: function() {
	                    
	                    alert("active");
	                    this.scope.saveStrategy.save();
	                },
	                deactivate: function() {
	                	alert("deactive");
	                },
	                scope: this
	            }),
	            
	            map: this.target.mapPanel.map,
	            toggleGroup: this.toggleGroup}));
        
        	
        	return actions = gxp.plugins.Testtool.superclass.addActions.call(this, actions);//gxp.plugins.Featurekazihatti.superclass.addActions.apply(this, [actions]);
        }      
		
});

Ext.preg(gxp.plugins.Featurekazihatti.prototype.ptype, gxp.plugins.Featurekazihatti);
