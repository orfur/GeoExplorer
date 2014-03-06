Ext.namespace("gxp.plugins");

gxp.plugins.KocaeliGisSorgu = Ext.extend(gxp.plugins.Tool, {
    
      ptype: "gxp_kocaeligissorgu",
      outputTarget: "map",
      popupTitle: "Mahalle/Sokak Sorgusu",
      tooltip: "Mahalle/Sokak Sorgusu",
      menuText: "Mahalle/Sokak Sorgusu",
      featureLayer:null,
      style: null,
      EnumAdres:null,
      enumAdresDeger:null,
      cbx_ilce:null,
      cbx_mahalle:null,
      cbx_sokak:null,
      cbx_kapi:null,
      cbx_koy:null,
      constructor: function(config) {
    	  gxp.plugins.KocaeliGisSorgu.superclass.constructor.apply(this, arguments);
      }, 
      init: function(target) {
    	  gxp.plugins.KocaeliGisSorgu.superclass.init.apply(this, arguments);
 
    	  this.EnumAdres = {
    			  			ILCE : 0,     
    			  			MAHALLE : 1,
    			  			SOKAK : 2,
    			  			KAPI:3,
    			  			KOY:4
    			  		}
    	  this.enumAdresDeger=this.EnumAdres.MAHALLE;
    	  
    	  
    	  
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
              reproject:true,
              styleMap: new OpenLayers.StyleMap({
                  "vertex": OpenLayers.Util.extend({display: ""},
                      OpenLayers.Feature.Vector.style["select"]),
                  "select": this.style["all"]
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
          
          this.target.mapPanel.on({
        	  aftermapmove: function() {
        			try {
        				
           				var li_zoomLevel = this.target.mapPanel.map.getZoom();
        				
	       				 if(  li_zoomLevel < 7 )//&& this.target.mapPanel.map.baseLayer.CLASS_NAME == "OpenLayers.Layer.WMS" )
	       					 this.target.mapPanel.map.zoomTo(7);
        				
        				var lo_Extent = this.target.mapPanel.map.getExtent().clone().transform(new OpenLayers.Projection(this.target.mapPanel.map.projection),new OpenLayers.Projection("EPSG:900915"));
        				if(this.target.mapintializedcomplete)
        					this.target.setCookieValue("extent",this.target.mapPanel.map.getExtent().toString());
        				
        				if(window.parent!=null)
        					window.parent.OverviewExtent(lo_Extent.toString()); 
        	            
        	        } 
        	        catch (err) {
        	        	//console.log("Overview Penceresi yok.");
        	            // TODO: improve destroy
        	        }
              },
              scope: this
          });
          
          
          Ext.Ajax.on(
          		"CallzoomToFeature",
          		function(ao_layerName,as_cqlQuery){
          			console.log("CallzoomToFeature: layerName=" + ao_layerName + " CQL_FILTER=" + as_cqlQuery );
          			var lo_layer = this.getLayer(ao_layerName);
          			if(lo_layer!=null)
          				this.queryLayer(lo_layer, as_cqlQuery,"",true);
          			else
          				alert("Katman bulunamadı.");
                  },
                  this
          );
          Ext.Ajax.on(
        		"QueryObjectID",
        		function(ao_layerName,as_objectIDs){
        			console.log("QueryObjectID: layerName=" + ao_layerName + " ObjectIDs=" + as_objectIDs );
        			var lo_layer = this.getLayer(ao_layerName);
        			if(lo_layer!=null)
        			{
        				var ls_featureIdsQuery = this.getQueryObjectIDs(lo_layer.data.name,as_objectIDs); //featureid filter olusturuluyor. (, ile ayrılmıs objectidler geliyor.)
        				this.queryLayer(lo_layer, ls_featureIdsQuery,"",false);
        			}
        			else
        				alert("Katman bulunamadı.");
                },
                this
            );
          Ext.Ajax.on(
          		"MapExtent",
          		function(extent){
          			//console.log("MapExtent:" + extent);
          			var lo_extent = new OpenLayers.Bounds.fromString(extent,this.target.mapPanel.map.projection);
          			lo_extent.transform(new OpenLayers.Projection("EPSG:900915"),new OpenLayers.Projection(this.target.mapPanel.map.projection));
          			this.target.mapPanel.map.zoomToExtent(lo_extent,true);
                  },
                  this
              );
    	  
    	  
      },
      addActions: function() {
  
        var actions = [new GeoExt.Action({
	            tooltip: "Adres Sorgula",
	            menuText: "Adres Sorgula",
	            iconCls: "gxp-icon-find",
	            enableToggle: false,
	            pressed: false,
	            allowDepress: false,
	            layers:null,
	            handler: function(evt)
	            { 	          	    
	            	this.enumAdresDeger = this.EnumAdres.ILCE;//default value
	            	this.layers = this.getLayers();
	            	this.cbx_ilce  = this.createCbx("İlce",new Ext.data.ArrayStore({id: 0,fields: ['ad','kod'], data: [['İlçe Seçiniz.', '-']]}));
	                this.cbx_mahalle  = this.createCbx("Mahalle",new Ext.data.ArrayStore({id: 0,fields: ['ad','kod'], data: [['Mahalle Seçiniz.', '-']]}));
	                this.cbx_sokak  = this.createCbx("Sokak",new Ext.data.ArrayStore({id: 0,fields: ['ad','kod'], data: [['Sokak Seçiniz.', '-']]}));
	                this.cbx_kapi  = this.createCbx("Kapi",new Ext.data.ArrayStore({id: 0,fields: ['ad','kod'], data: [['Kapı Seçiniz.', '-']]}));
	                
	                var featuresIlce = this.queryWFSLayerComboBox(this.layers.ilce,"propertyName=ILCEADI,ILCEID&CQL_FILTER=1=1");
	                this.getAddress_result(featuresIlce);

	                this.cbx_ilce.on('select', function(box, record, index) {
	                	if(index>0){
	                		this.enumAdresDeger=this.EnumAdres.MAHALLE;
	    	                var featuresMahalleler = this.queryWFSLayerComboBox(this.layers.mahalle,"propertyName=MAH_ID,MAH_ADI"+"&CQL_FILTER=ILCE_ID="+this.cbx_ilce.getValue().attributes["ILCEID"] );//	INTERSECTS(geometryetry," + this.cbx_mahalle.getValue().geometry.components[0]+ ")");
	    	                this.getAddress_result(featuresMahalleler);
							this.queryLayer(this.layers.ilce,"ILCEID=" + this.cbx_ilce.getValue().attributes["ILCEID"],"&propertyName=SHAPE",true);
	                	}},this);
	                
	                this.cbx_mahalle.on('select', function(box, record, index) {
			                	if(index>0){
			                		this.enumAdresDeger=this.EnumAdres.SOKAK;
			    	                var featuresSokaklar = this.queryWFSLayerComboBox(this.layers.mahallesokak,"propertyName=YOL_ISMI,MAKS_KIMLIK_NO"+"&CQL_FILTER=MAH1_ID="+this.cbx_mahalle.getValue().attributes["MAH_ID"] + "%20or%20MAH2_ID="+this.cbx_mahalle.getValue().attributes["MAH_ID"] );
			    	                this.getAddress_result(featuresSokaklar);
									this.queryLayer(this.layers.mahalle,"MAH_ID=" + this.cbx_mahalle.getValue().attributes["MAH_ID"],"&propertyName=SHAPE",true);
			                	}},this);
	                
	                this.cbx_sokak.on('select', function(box, record, index) {
			                	if(index>0){
			                		this.enumAdresDeger=this.EnumAdres.KAPI;
			    	                var featuresSokaklar = this.queryWFSLayerComboBox(this.layers.kapi,"propertyName=MAKS_KIMLIK_NO,KAPINO"+"&CQL_FILTER=MAKS_CSBM_KN=" + this.cbx_sokak.getValue().attributes["MAKS_KIMLIK_NO"]);
			    	                this.getAddress_result(featuresSokaklar);
			                		this.queryLayer(this.layers.sokak , "MAKS_KIMLIK_NO=" + this.cbx_sokak.getValue().attributes["MAKS_KIMLIK_NO"],"&propertyName=SHAPE",true);
			                	}},this);
	                this.cbx_kapi.on('select', function(box, record, index) {
			                	if(index>0){
			                		this.queryLayer(this.layers.kapi , "CQL_FILTER=MAKS_KIMLIK_NO=" + this.cbx_kapi.getValue(),true);
			                	}},this);
	                this.createForm([this.cbx_ilce,this.cbx_mahalle,this.cbx_sokak,this.cbx_kapi]);
	
	            },
	            mapPanel: this.target.mapPanel,scope:this})];
            	
        return actions = gxp.plugins.KocaeliGisSorgu.superclass.addActions.call(this, actions);
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
	                         case "koy":
	                        	   layers.koy  = layer;
	                               break;
	                         case "mahallesokak":
	                        	   layers.mahallesokak  = layer;
	                        	   break;
	                               
	                    }
	              });
	        }); 
	        
	        return layers;
    },
    getLayer: function(layername)
    {
	        var ds = this.target.layerSources.local.store.data.items;
	        
	        for(var i=0;i<ds.length;i++)
	        {
	        	var keywords = ds[i].data.keywords;
	        	for(var j=0;j<keywords.length;j++)
	        	{
	            	  if(keywords[j] == layername)
	            		  return ds[i];
	        		
	        	}
	        	
	        }
	        
	        return null;
    },
    getQueryObjectIDs: function(as_layerName,as_queryObjectIDs)
    {
			var lo_tempArray = as_layerName.split(":");
			var ls_layerNameWOWorkspaceName = "";
			var ls_fidQuery = "featureid=";
			if(lo_tempArray.length>1)
			{
				ls_layerNameWOWorkspaceName = lo_tempArray[1];
				var lo_tempArrayFID = as_queryObjectIDs.split(",");
				for(var i=0;i<lo_tempArrayFID.length;i++)
				{
					ls_fidQuery += ls_layerNameWOWorkspaceName +"."+ lo_tempArrayFID[i];		
					if(i!=lo_tempArrayFID.length-1)
						ls_fidQuery += ",";
				} 
				
			}
			return ls_fidQuery;
    },
    createForm: function(ao_controlItems)
    {
			var selectRegionWin = new Ext.Window({
	            title: "Adres Sorgusu",
	            layout: "fit",
	            height: 170,
	            width: 280,
	            x:350,y:50,
	            items: [
	                    {
			                xtype: "form",
			                bodyStyle: "padding: 5px;",
			                labelWidth: 40,
			                items: ao_controlItems
	            		}],
	            modal: false    							         
	    });
		selectRegionWin.on('close', function() { //form kapatildiginda secili nesnelerin temizlenmesi.
			this.featureLayer.removeAllFeatures();  

		},this);
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
			    displayField: 'ad',
			    sorters: {
                    property: 'ad',
                    direction: 'DESC'
                }
		  });
		  cbxCombobox.setValue("-");
		  cbxCombobox.store.sort('ad', 'DESC');
//		  cbxCombobox.store.sort({
//            property: 'ad',
//            direction: 'DESC'
//			  });
		  return cbxCombobox;
    },
	getFCollectionMaxExtent: function(ao_featureColl)
	{
		var ld_buttom = 0;
		var ld_left = 0;
		var ld_top = 0;
		var ld_right = 0;
		
    	for(var i=0;i<ao_featureColl.length;i++)
    	{
    		
    		var lo_featureExtent = ao_featureColl[i].geometry.getBounds();
    		
			if(ld_buttom==0 ||lo_featureExtent.bottom<ld_buttom)
				ld_buttom = lo_featureExtent.bottom;
			
			if(ld_left==0 || lo_featureExtent.left<ld_left)
				ld_left = lo_featureExtent.left;
			
			if(ld_top==0 || lo_featureExtent.top>ld_top)
				ld_top = lo_featureExtent.top;
			if(ld_right==0 || lo_featureExtent.right>ld_right)
				ld_right = lo_featureExtent.right;
    	}
		return new OpenLayers.Bounds(ld_left,ld_buttom ,ld_right ,ld_top);
	},
    queryWFSLayer: function(ao_layer,as_cqlFilter)
    {
    	var layerTemp = ao_layer.data.layer;
    	var ls_wfsURL = layerTemp.url.replace(/wms/gi,"wfs") + "&VERSION=" + layerTemp.params.VERSION
    											 + "&REQUEST=" + "GetFeature"
    											 //+ "&SRS=" + this.target.mapPanel.map.projection
    											 +"&srsName=" + this.target.mapPanel.map.projection //coordinates system for transformation
    											 + "&outputFormat=json"
    											 //+ "&propertyName=SHAPE"
    											 + "&TYPENAME=" + layerTemp.params.LAYERS 
    											 + "&" + as_cqlFilter;
    											 //+ "&CQL_FILTER=" + as_cqlFilter;
    	
    	Ext.getBody().mask("Lütfen bekleyiniz.", 'loading');
		var lo_request = OpenLayers.Request.GET({
		    url: ls_wfsURL,
		    timeout:5000,
		    async: false
		});
		Ext.getBody().unmask();
		var jsonFormatter =  new OpenLayers.Format.GeoJSON();
		
		this.target.mapPanel.map.raiseLayer(this.featureLayer, this.target.mapPanel.map.layers.length); // topmostlayer (selectionlayer)
		this.featureLayer.removeAllFeatures();
		this.featureLayer.addFeatures(jsonFormatter.read(lo_request.responseText));
		
		if(this.featureLayer.features.length>0)
			this.target.mapPanel.map.zoomToExtent(this.getFCollectionMaxExtent(this.featureLayer.features),true);//lo_feature.geometry.getBounds(), true);
			
    },
    queryWFSLayerComboBox: function(ao_layer,as_cqlFilter)
    {
    	
      	var layerTemp = ao_layer.data.layer;
    	var ls_wfsURL = layerTemp.url.replace(/wms/gi,"wfs") + "&VERSION=" + layerTemp.params.VERSION
    											 + "&REQUEST=" + "GetFeature"
    											 //+ "&SRS=" + this.target.mapPanel.map.projection
    											 +"&srsName=" + this.target.mapPanel.map.projection //coordinates system for transformation
    											 + "&outputFormat=json"
    											 //+ "&propertyName=SHAPE"
    											 + "&TYPENAME=" + layerTemp.params.LAYERS 
    											 + "&" + as_cqlFilter;
    											
    											 //+ "&CQL_FILTER=" + as_cqlFilter;
    	
    	Ext.getBody().mask("Lütfen bekleyiniz.", 'loading');
		var lo_request = OpenLayers.Request.GET({
		    url: ls_wfsURL,
		    timeout:5000,
		    async: false
		});
		Ext.getBody().unmask();
	
		var jsonFormatter =  new OpenLayers.Format.GeoJSON();
		
		return jsonFormatter.read(lo_request.responseText);
					
    },
    queryLayer: function(ao_layer,as_Filter,propertyName,isCqlFilter)
    {
    	if(isCqlFilter)
    		this.queryWFSLayer(ao_layer,propertyName+"&CQL_FILTER=" + as_Filter);
    	else
    		this.queryWFSLayer(ao_layer,as_Filter);
			
    },
    getAddressDataset: function(serviceUrl) {
    	Ext.getBody().mask("Lütfen bekleyiniz.", 'loading');
		 var requestGetAddress = OpenLayers.Request.GET({
			    url: serviceUrl,
			    async: true,
			    success:this.getAddress_result,
			    failure:this.getAddress_fault,
			    scope:this
			    
		 });
   },
   clearCbx:function(cbx,selectedValue)
   {
	    var tempDataSet = new Ext.data.ArrayStore({
	        id: 0,
	        fields: ['ad','kod']
		 });
	    tempDataSet.add(new Ext.data.Record({"ad":selectedValue,"kod":"-"}));
	    cbx.bindStore(tempDataSet);
	   return tempDataSet;
   },
    getAddress_result:function(resultValue)
    {
    	Ext.getBody().unmask();
	    var addressDataSet = new Ext.data.ArrayStore({
	        id: 0,
	        fields: ['ad','kod']
		 });
	    
		 addressDataSet.add(new Ext.data.Record({"ad":"Mahalle","kod":"-"}));
		 
			 
		 
			 
	   
		switch (this.enumAdresDeger)
		{
			case this.EnumAdres.ILCE:
				
				 Ext.each(resultValue, function(bilgi){
					 addressDataSet.add(new Ext.data.Record({'ad':bilgi.attributes["ILCEADI"],'kod':bilgi}));
				 }); 
				
				if(addressDataSet.data.items.length>0)
					addressDataSet.data.items[0].data.ad = " İlçe Seçiniz";
				
				
				
				this.cbx_ilce.bindStore(addressDataSet);
				this.cbx_ilce.setValue("-");
				this.clearCbx(this.cbx_mahalle, " Mahalle Seçiniz");
				this.clearCbx(this.cbx_sokak, " Sokak Seçiniz");
				this.clearCbx(this.cbx_kapi, " Kapı Seçiniz");
				this.cbx_mahalle.setValue("-");
				this.cbx_sokak.setValue("-");
				this.cbx_kapi.setValue("-");
				
				break;	
			case this.EnumAdres.MAHALLE:
				
				 Ext.each(resultValue, function(bilgi){
					 addressDataSet.add(new Ext.data.Record({'ad':bilgi.attributes["MAH_ADI"],'kod':bilgi}));
				 }); 
				
				if(addressDataSet.data.items.length>0)
					addressDataSet.data.items[0].data.ad = " Mahalle Seçiniz";
				this.cbx_mahalle.bindStore(addressDataSet);
				this.cbx_mahalle.setValue("-");
				
				this.clearCbx(this.cbx_sokak, " Sokak Seçiniz");
				this.clearCbx(this.cbx_kapi, " Kapı Seçiniz");
				this.cbx_sokak.setValue("-");
				this.cbx_kapi.setValue("-");
				break;
			case this.EnumAdres.SOKAK:
				var sokakTekrarKontrol;
				 Ext.each(resultValue, function(bilgi){
					 if(bilgi.attributes["YOL_ISMI"]=="ALPARSLAN")
						 bilgi.attributes["YOL_ISMI"];
					 if(sokakTekrarKontrol!=bilgi.attributes["YOL_ISMI"])
					 {
						addressDataSet.add(new Ext.data.Record({'ad':bilgi.attributes["YOL_ISMI"],'kod':bilgi}));
					 	sokakTekrarKontrol = bilgi.attributes["YOL_ISMI"];
					 	
					 }
				 }); 
				
				if(addressDataSet.data.items.length>0)
					addressDataSet.data.items[0].data.ad = " Mahalle Seçiniz";
				addressDataSet.data.items[0].data.ad = " Sokak Seçiniz";
				this.cbx_sokak.bindStore(addressDataSet);
//				this.cbx_sokak.store.sort('ad', 'ASC');
				this.clearCbx(this.cbx_kapi, " Kapı Seçiniz");
				this.cbx_kapi.setValue("-");
				break;
			case this.EnumAdres.KAPI:
				 Ext.each(resultValue, function(bilgi){
					 addressDataSet.add(new Ext.data.Record({'ad':bilgi.attributes["KAPINO"],'kod':bilgi.attributes["MAKS_KIMLIK_NO"]}));
				 }); 
				if(addressDataSet.data.items.length>0)
					addressDataSet.data.items[0].data.ad = " Mahalle Seçiniz";
				addressDataSet.data.items[0].data.ad = " Kapı Seçiniz";
				this.cbx_kapi.bindStore(addressDataSet);
//				this.cbx_kapi.store.sort('ad', 'ASC');
				break; 
 		}
		addressDataSet.sort('ad', 'ASC');
 			 

    	
    },
    getAddress_fault:function(event)
    {
    	Ext.getBody().unmask();
    	alert("Hata oluştu.");
    }
    
    
		
});

Ext.preg(gxp.plugins.KocaeliGisSorgu.prototype.ptype, gxp.plugins.KocaeliGisSorgu);