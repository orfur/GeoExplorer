Ext.namespace("gxp.plugins");
  
gxp.plugins.KocaeliGisSorgu = Ext.extend(gxp.plugins.Tool, {
    
      ptype: "gxp_kocaeligissorgu",
      outputTarget: "map",
      popupTitle: "Kocaeli Mahalle/Sokak Sorgusu",
      tooltip: "Kocaeli Mahalle/Sokak Sorgusu",
      menuText: "Kocaeli Mahalle/Sokak Sorgusu",
      printService: null,
      featureLayer:null,
      style: null,
      constructor: function(config) {
    	  gxp.plugins.KocaeliGisSorgu.superclass.constructor.apply(this, arguments);
      }, 
      init: function(target) {
    	  gxp.plugins.KocaeliGisSorgu.superclass.init.apply(this, arguments);
    	 
    	  
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
    	  
    	  
          this.featureLayer = new OpenLayers.Layer.Vector(this.id, {
              displayInLayerSwitcher: false,
              visibility: true,
              projection: new OpenLayers.Projection("EPSG:900915"),
              displayProjection: new OpenLayers.Projection("EPSG:900913"), 
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
              scope: this
          });
          this.on({
              beforedestroy: function() {
                  this.target.mapPanel.map.removeLayer(this.featureLayer);
              },
              scope: this
          });
    	  
    	  
      },
    addActions: function() {
  
        var actions = [new GeoExt.Action({
	            tooltip: "Adres Sorgula",
	            menuText: "Adres Sorgula",
	            iconCls: "gxp-icon-featurekazihattisave",
	            enableToggle: false,
	            pressed: false,
	            allowDepress: false,
	            layers:null,
	            handler: function(evt)
	            { 
	            	//Service Conf
	                var SERVICE_URL = "http://cbs.kocaeli.bel.tr/ImarNviAdresWS/service1.asmx";
	          	    var ILCE = SERVICE_URL + "/getIlce?";
	          	    var MAHALLELER = SERVICE_URL + "/getMahalle?";
	          	    var SOKAKLAR = SERVICE_URL + "/getCadde?";
	          	    var KAPILAR = SERVICE_URL + "/GetKapiNoByCaddeSokak?";
	          	    //
	          	    
	                
	                this.layers = this.getLayers();
	                
	                var cbx_ilce  = this.createCbx("İlçe",this.getAddressDataset(ILCE,"İlçe Seçiniz"));
	                var cbx_mahalle  = this.createCbx("Mahalle",new Ext.data.ArrayStore({id: 0,fields: ['ad','kod'], data: [['Mahalle Seçiniz.', '-']]}));
	                var cbx_sokak  = this.createCbx("Sokak",new Ext.data.ArrayStore({id: 0,fields: ['ad','kod'], data: [['Sokak Seçiniz.', '-']]}));
	                var cbx_kapi  = this.createCbx("Kapi",new Ext.data.ArrayStore({id: 0,fields: ['ad','kod'], data: [['Kapı Seçiniz.', '-']]}));
	                
	                cbx_ilce.on('select', function(box, record, index) {
			                	if(index>0){
			                		cbx_mahalle.bindStore(this.getAddressDataset(MAHALLELER + "ilce_kodu="+ cbx_ilce.getValue(),"Mahalle Seçiniz"));
			                		this.queryWFSLayer(this.layers.ilce , "ILCEID=" + cbx_ilce.getValue());
			                	}},this);
	                
	                cbx_mahalle.on('select', function(box, record, index) {
			                	if(index>0){
			                		cbx_sokak.bindStore(this.getAddressDataset(SOKAKLAR + "ilce_kodu="+ cbx_ilce.getValue() + "&mahalle_kodu=" + cbx_mahalle.getValue() ,"Sokak Seçiniz"));
			                		this.queryWFSLayer(this.layers.mahalle , "MAHALLEID=" + cbx_mahalle.getValue());
			                	
			                	}},this);
	                
	                cbx_sokak.on('select', function(box, record, index) {
			                	if(index>0){
			                		cbx_kapi.bindStore(this.getAddressDataset(KAPILAR + "CaddeSokakID=" + cbx_sokak.getValue(),"Kapı Seçiniz"));
			                		this.queryWFSLayer(this.layers.sokak , "CSBMKOD=" + cbx_sokak.getValue());
			                	}},this);
	                
	                this.createForm([cbx_ilce, cbx_mahalle,cbx_sokak,cbx_kapi]);
	
	            },
	            mapPanel: this.target.mapPanel,scope:this})];
            	
        return actions = gxp.plugins.KocaeliGisSorgu.superclass.addActions.call(this, actions);
    },
    getAddressDataset: function(serviceUrl,as_selectText) {
    	
	    var addressDataSet = new Ext.data.ArrayStore({
	        id: 0,
	        fields: ['ad','kod']
		 });
	     addressDataSet.add(new Ext.data.Record({"ad":as_selectText,"kod":"-"}));
		 var requestGetAddress = OpenLayers.Request.GET({
			    url: serviceUrl,
			    async: false
		 });
		 
		 var xmlFormatter =  new OpenLayers.Format.XML();
		 var getIlce = xmlFormatter.read(requestGetAddress.responseText);
		 var childrens = getIlce.getElementsByTagName("Bilgi");
		 Ext.each(childrens, function(bilgi){
			 addressDataSet.add(new Ext.data.Record({'ad':bilgi.lastElementChild.textContent,'kod':bilgi.firstElementChild.textContent}));
		 });
		 
        return addressDataSet;
    },
    getLayers: function()
    {
    		var layers = {};
	        var ds = this.target.layerSources.local.store.data.items;
	        Ext.each(ds, function(layer){
	        	
	              var keywords = layer.data.keywords;
	              Ext.each(keywords, function(keyword){
	                    switch(keyword)
	                    {
	                         case "ilce":
	                               layers.ilce = layer;
	                               break;
	                         case "mahalle":
	                               layers.mahalle = layer;
	                               break;
	                         case "sokak":
	                               layers.sokak = layer;
	                               break;
	                         case "kapi":
	                               layers.kapi = layer;
	                               break;
	                               
	                    }
	              });
	        }); 
	        
	        return layers;
    },
    createForm: function(ao_controlItems)
    {
			var selectRegionWin = new Ext.Window({
	            title: "Adres Sorgusu",
	            layout: "fit",
	            height: 160,
	            width: 280,
	            items: [
	                    {
			                xtype: "form",
			                bodyStyle: "padding: 5px;",
			                labelWidth: 40,
			                items: ao_controlItems
	            		}],
	            modal: false    							         
	    });
		selectRegionWin.show();
    	
    },
    createCbx: function(as_labelField,ao_store)
    {
    	
		  var cbxCombobox = new Ext.form.ComboBox({
			    typeAhead: true,
			    triggerAction: 'all',
			    lazyRender:true,
			    editable: false,
	            allowBlank: false,
	            forceSelection: true,
	            width: 200,
			    mode: 'local',
			    fieldLabel: as_labelField,
			    store: ao_store,
			    valueField: 'kod',
			    displayField: 'ad'
		  });
		  cbxCombobox.setValue("-");
		  return cbxCombobox;
    },
    queryWFSLayer: function(ao_layer,as_cqlFilter)
    {
		Proj4js.defs["EPSG:900915"] = "+proj=tmerc +lat_0=0 +lon_0=30 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +datum=ITRF96 +units=m +no_defs";
		var proj = new OpenLayers.Projection("EPSG:900915");
		
    	var layerTemp = ao_layer.data.layer;
    	var ls_wfsURL = layerTemp.url.replace(/wms/gi,"wfs") + "?SERVICE=" + "WFS"
    											 + "&VERSION=" + layerTemp.params.VERSION
    											 + "&REQUEST=" + "GetFeature"
    											 + "&SRS=" + this.target.mapPanel.map.projection
    											 + "&outputFormat=json"
    											 //+ "&propertyName=SHAPE"
    											 + "&TYPENAME=" + layerTemp.params.LAYERS 
    											 + "&CQL_FILTER=" + as_cqlFilter;
    	
		var lo_request = OpenLayers.Request.GET({
		    url: ls_wfsURL,
		    async: false
		});
		var jsonFormatter =  new OpenLayers.Format.JSON(); 
		var lo_features = jsonFormatter.read(lo_request.responseText).features;
		
		Ext.each(lo_features, function(ao_feature){
			var bound = ao_feature.properties.bbox;
			var point1 = new OpenLayers.Geometry.Point(bound[0], bound[1]);
			point1.transform(proj,this.target.mapPanel.map.getProjectionObject());
			var point2 = new OpenLayers.Geometry.Point(bound[2], bound[3]);
			point2.transform(proj,this.target.mapPanel.map.getProjectionObject());
//			var tempFeature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.MultiPolygon(ao_feature.geometry));//OpenLayers.Bounds.fromString(point1.x+","+point1.y + "," + point2.x + "," + point2.y))); //new OpenLayers.Feature.Vector(new OpenLayers.Geometry.MultiPolygon(bound));
//			tempFeature.geometry.setBounds(new OpenLayers.Bounds(bound));
//			
			
//			var linear_ring = new OpenLayers.Geometry.LinearRing([point1,point2]);
//			var polygonFeature = new OpenLayers.Feature.Vector(
//			            new OpenLayers.Geometry.Polygon([linear_ring]), null);
//
//			
//			
//			//tempFeature.geometry.transform(proj,this.target.mapPanel.map.getProjectionObject());
//			this.featureLayer.removeAllFeatures();
//			this.featureLayer.addFeatures( [tempFeature]);
			
			
			this.target.mapPanel.map.zoomToExtent(new OpenLayers.Bounds(point1.x,point1.y,point2.x,point2.y), true);
		},this)
			
    }
		
});

Ext.preg(gxp.plugins.KocaeliGisSorgu.prototype.ptype, gxp.plugins.KocaeliGisSorgu);
