Ext.namespace("gxp.plugins");
  
gxp.plugins.FeatureDynamicProject = Ext.extend(gxp.plugins.Tool, {
    
    ptype: "gxp_featuredynamicproject",
    outputTarget: "map",
    popupCache: null,
    wfsURL: null,
    wfsLayers:"UniversalWorkspace:SDE.KOYMAHALLE,UniversalWorkspace:SDE.KARAYOLU,UniversalWorkspace:SDE.KOCAELI_KAPI,UniversalWorkspace:SDE.KOCAELI_YAPI,UniversalWorkspace:SURECPROJELER",
    kaziActionTip: "Süreç Projeler",
    popupTitle: "Süreç Projeler",
    tooltip: "Süreç Projeler",
	saveStrategy:null,
	snap:null,
	layers: {},
	queue : 0,
	queuedFeatures: [],
	vectorLayer : null,
	printService: null,
	aykomeGridId:-1,
	aykomeGridButtonid:-1,
	constructor: function(config) {
        gxp.plugins.FeatureDynamicProject.superclass.constructor.apply(this, arguments);
    },
    
    init: function(target) {
    	gxp.plugins.FeatureDynamicProject.superclass.init.apply(this, arguments);
        this.toolsShowingLayer = {};
        this.target.on({
            ready: function() {
            	this.target.mapPanel.map.addControl(this.snap);
                this.snap.activate();
                this.target.mapPanel.map.addLayer(this.vectorLayer);
            },
            scope: this
        });
        Ext.Ajax.on(
        		"nextFeature",
        		function(){
                	if (this.queue < this.queuedFeatures.length)
                	{
                		this.selectRegion(this.queuedFeatures[this.queue]);
                	}
                	{
                		this.queuedFeatures = [];
                    	this.queue = 0;
                	}
                },
                this
        );
        Ext.Ajax.on(
          		"deleteFeature",//kazihatti katmanindan belirtilen nesneleri siler.
          		function(fid,tableid,buttonid){
          			//console.log("deleteFeature: fid=" + fid);
          			var lo_layer = this.getLayer("surecProjeler");
          			if(lo_layer!=null)
          			{
          				this.aykomeGridId = tableid;
          				this.aykomeGridButtonid = buttonid;
            			var vectorFeature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.MultiLineString(null));
            			vectorFeature.fid = this.createObjectID(lo_layer.data.name,fid);
            			vectorFeature.state = OpenLayers.State.DELETE;
            			this.vectorLayer.addFeatures(vectorFeature);
            			this.saveStrategy.save();
          			}
          			else
          				alert("Katman bulunamadı.");
                  },
                  this
          );
        
        Ext.Ajax.on(
          		"refreshFLayer",
          		function(layername){
        			var lo_layer = this.getLayer(layername);
        			if(lo_layer!=null)
        			{
        				var layers = this.target.mapPanel.map.layers;
        				for(var i=0;i<layers.length;i++)
        				{
        				  var ls_tempLayerName = layers[i].name; 
        				  if(lo_layer.data.layer.name == ls_tempLayerName)
        					  layers[i].redraw(true);
        				
        				}
        				
        			}
        		},
                this
          );
        
	    Ext.Ajax.on('beforerequest',function(){Ext.getBody().mask("Lütfen bekleyiniz.", 'loading') }, Ext.getBody());
	    Ext.Ajax.on('requestcomplete',Ext.getBody().unmask ,Ext.getBody());
	    Ext.Ajax.on('requestexception', Ext.getBody().unmask , Ext.getBody());

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
    createObjectID: function(as_layerName,as_queryObjectIDs)
    {
			var lo_tempArray = as_layerName.split(":");
			var ls_layerNameWOWorkspaceName = "";
			var ls_fidQuery = "";
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
    selectRegion: function(feature)
    {
    	var mapProjCode = this.target.mapPanel.map.projection;
    	var wfsURL = this.wfsURL;
     	  var adresStore = new Ext.data.ArrayStore({
    		  id: 0,
    		  fields: ['NVI_CSBMKOD','BINA_KODU','BINA_ADI','KAPI_NO','YOL_ID','YOL_ISMI','MAH_ID','MAH_ADI','ILCE_ID','ILCE_ADI']
    	  });
    	  
    	  var lonlatWGS84  = feature.geometry.clone().transform(new OpenLayers.Projection(mapProjCode),new OpenLayers.Projection("EPSG:4326")).components[0];
    	  
          var lonlat = feature.geometry.clone().components[0];
      	  var transGeom  = feature.geometry.clone().transform(new OpenLayers.Projection(mapProjCode),new OpenLayers.Projection("EPSG:900915")).components[0];
      	  //alert(transGeom.lon + " " + transGeom.lat);
      	  
		var intersectGeometry = new OpenLayers.Bounds();
      	intersectGeometry.extend(new OpenLayers.LonLat(lonlat.x-2,lonlat.y-2));
      	intersectGeometry.extend(new OpenLayers.LonLat(lonlat.x+2,lonlat.y+2));
		
		adresStore.data["NVI_CSBMKOD"]="0";
		adresStore.data["KAPI_NO"]="0";
		adresStore.data["YOL_ID"] = "0";
		adresStore.data["YOL_ISMI"] = "-";
		adresStore.data["MAH_ID"] = "0";
		adresStore.data["MAH_ADI"] = "-";
		adresStore.data["ILCE_ID"] = "0";
		adresStore.data["ILCE_ADI"] = "-";
		adresStore.data["BINA_ADI"] = "-";
		adresStore.data["BINA_KODU"] ="0";
      	try{
      	var response = this.queryOnLayer(this.getLayers().kapi,"KAPINO,NVICSBMKOD,NVIBINAKOD,PARSEL_KN,KBB_BINAID","INTERSECTS(SHAPE,"+ intersectGeometry.toGeometry().toString() +")");
      	  if(response.length>0)
      	  {
              	  Ext.each(response, function(kapi)
              	  {
              		  	adresStore.data["NVI_CSBMKOD"] =  kapi.attributes["NVICSBMKOD"];
              		  	adresStore.data["KAPI_NO"] 	   =  kapi.attributes["KAPINO"];
						adresStore.data["BINA_KODU"]   =  "";
						response = this.queryOnLayer(this.getLayers().bina,"ADI,KBB_BINAID","KBB_BINAID="+ kapi.attributes["KBB_BINAID"]);
						Ext.each(response, function(bina)
                      	{
							adresStore.data["BINA_ADI"] = 	 bina.attributes["ADI"];
							
						});
						
              		  	  //sokak bilgisi
              		  	  response = this.queryOnLayer(this.getLayers().sokak,"YOL_ID,YOL_ISMI,CSBMK1,SHAPE","CSBMK1="+ kapi.attributes["NVICSBMKOD"] + " or " + "CSBMK2="+ kapi.attributes["NVICSBMKOD"]);
                      	  Ext.each(response, function(sokak)
                      	  {
                      		  	adresStore.data["YOL_ID"] 	=  sokak.attributes["CSBMK1"];
                      		  	adresStore.data["YOL_ISMI"] =  sokak.attributes["YOL_ISMI"];
                      		 
                      		  	
                    		  	  //mahalle-ilce bilgisi
                    		  	response = this.queryOnLayer(this.getLayers().mahalle,"ILCE_ADI,ILCE_ID,MAH_ADI,MAH_ID","INTERSECTS(SHAPE,POINT("+lonlat.x+ " " + lonlat.y +"))");  
                      		  	Ext.each(response, function(mah)
                            	  {                            		  	
                            		  	adresStore.data["MAH_ID"] = mah.attributes["MAH_ID"];
                            		  	adresStore.data["MAH_ADI"] = mah.attributes["MAH_ADI"];
                            		  	adresStore.data["ILCE_ID"] = mah.attributes["ILCE_ID"];
                            		  	adresStore.data["ILCE_ADI"] = mah.attributes["ILCE_ADI"];
                            		  	
                            	  });
                      		  	
                      	  },this);
              		  	
              	  },this);
      	  }
      	  else
      	  {
      		  
  		  	  //sokak bilgisi
  		  	  response = this.queryOnLayer(this.getLayers().sokak,"YOL_ID,YOL_ISMI,CSBMK1,SHAPE","DWITHIN(SHAPE,POINT("+lonlat.x+ " " + lonlat.y +"),2,meters)");
  		  	  if(response.length>0)
  		  	  {
                  	  Ext.each(response, function(sokak)
                  	  {
                  		  	adresStore.data["YOL_ID"] 	=  sokak.attributes["CSBMK1"];
                  		  	adresStore.data["YOL_ISMI"] =  sokak.attributes["YOL_ISMI"];
                  		  	
                		  	  //mahalle-ilce bilgisi
                  		  	  response = this.queryOnLayer(this.getLayers().mahalle,"ILCE_ADI,ILCE_ID,MAH_ADI,MAH_ID","INTERSECTS(SHAPE,"+sokak.geometry.simplify().toString()+")");//sokak.geometry.components[0].simplify().toString()+")");
                        	  Ext.each(response, function(mah)
                        	  {                            		  	
                        		  	adresStore.data["MAH_ID"] = mah.attributes["MAH_ID"];
                        		  	adresStore.data["MAH_ADI"] = mah.attributes["MAH_ADI"];
                        		  	adresStore.data["ILCE_ID"] = mah.attributes["ILCE_ID"];
                        		  	adresStore.data["ILCE_ADI"] = mah.attributes["ILCE_ADI"];
                        		   	
                        	  }); 
                  		  	
                  	  },this);
  		  	  }
  		  	  else
  		  	  {
  		  		  
    		  	  //mahalle-ilce bilgisi
      		  	  response = this.queryOnLayer(this.getLayers().mahalle,"ILCE_ADI,ILCE_ID,MAH_ADI,MAH_ID","INTERSECTS(SHAPE,POINT("+lonlat.x+ " " + lonlat.y +"))");
            	  Ext.each(response, function(mah)
            	  {                            		  	
          		  	adresStore.data["MAH_ID"] = mah.attributes["MAH_ID"];
        		  	adresStore.data["MAH_ADI"] = mah.attributes["MAH_ADI"];
        		  	adresStore.data["ILCE_ID"] = mah.attributes["ILCE_ID"];
        		  	adresStore.data["ILCE_ADI"] = mah.attributes["ILCE_ADI"];
            		  	
            	  });
  		  		  
  		  	  }
      		  
      	  }
      	  
			for (r in adresStore.data)
			{
				
				if(r == "NVI_CSBMKOD")
					feature.attributes["CSBMKOD"] = adresStore.data[r];
				if(r == "KAPI_NO")
					feature.attributes["KAPI"] = adresStore.data[r];
				if(r == "YOL_ID")
					feature.attributes["YOL_ID"] = adresStore.data[r];
				if(r == "YOL_ISMI")
					feature.attributes["YOL_ISMI"] = adresStore.data[r];	
				if(r == "MAH_ID")
					feature.attributes["MAH_ID"] = adresStore.data[r];
				if(r == "MAH_ADI")
					feature.attributes["MAH_ADI"] = adresStore.data[r];
				
				if(r == "ILCE_ID")
					feature.attributes["ILCE_ID"] = adresStore.data[r];
				if(r == "ILCE_ADI")
					feature.attributes["ILCE_ADI"] = adresStore.data[r];
			
				
			}
			
			var applicationDataArray = window.parent.getApplicationData("").split(",");
    		if(applicationDataArray.length>0)
    		{
    			
    			feature.attributes["TARIH"] = new Date().toISOString();
    			feature.attributes["KURUM"] = applicationDataArray[0];//window.parent.getUserFromLiferay();
    			feature.attributes["TURU"] =  applicationDataArray[1];//window.parent.hasGrid("gisTable");
    			feature.attributes["DURUMU"] = applicationDataArray[2];//window.parent.getApplicationData(""); 
    		}
    		else//eger applicationData boş olursa sistem kullanıcısı bilgileri setleniyor.
    		{
    			feature.attributes["KURUM"] = window.parent.getUserFromLiferay();
    			feature.attributes["TURU"] =  window.parent.hasGrid("gisTable"); //BAZ - AYKOME
    			feature.attributes["DURUMU"] = window.parent.getApplicationData("");    // ILK / SON - Normal sartlarda boş gelecek. 			
    		}
			
			
   	  
      	  
      	}
      	catch(errM)//sorgulamalar icin try catch blok
      	{
      		
      		alert("Mekansal sorgulama yapılırken hata oluştu." + errM.message);
      	}
    	this.queue++;
    	Ext.Ajax.fireEvent("nextFeature");
    },
    queryOnLayer: function(ao_layer,as_properties,as_cqlFilter)//return request.responseText 
    {
    	var layerTemp = ao_layer.data.layer;
    	var ls_wfsURL = layerTemp.url.replace(/wms/gi,"wfs");
    	var jsonFormatter =  new OpenLayers.Format.GeoJSON(); 
    	
    	Ext.getBody().mask("Lütfen bekleyiniz.", 'loading');
        //this.busyMask.show();
    	//this.uniWaiting(3000);

		var lo_request = OpenLayers.Request.GET({
		    url: ls_wfsURL,
		    params: {	
		    	"version" : "1.0.0",//layerTemp.params.VERSION,
		    	"request" : "GetFeature",
		    	"srs" : "EPSG:900915",
		    	"outputFormat" : "json",
		    	"maxfeatures" : "1",
		    	"typename" : layerTemp.params.LAYERS,
		    	"propertyName" : as_properties,
		    	"cql_filter" : as_cqlFilter
		    	},
		    timeout:5000,
		    async: false
		});
		Ext.getBody().unmask();
		//this.busyMask.hide();
		return jsonFormatter.read(lo_request.responseText);
    				
    },
    queryLayer: function(ao_layer,as_Filter,isCqlFilter)
    {
    	if(isCqlFilter)
    		this.queryWFSLayer(ao_layer,"&CQL_FILTER=" + as_Filter);
    	else
    		this.queryWFSLayer(ao_layer,as_Filter);
			
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
	                         case "bina":
	                        	   layers.bina = layer;
	                               break;
	                               
	                    }
	              });
	        }); 
	        
	        return layers;
    },
    processResult : function (btn) {	 
        if(btn === 'ok' && this.vectorLayer.features.length>0)
        	this.vectorLayer.removeFeatures([this.vectorLayer.features[this.vectorLayer.features.length-1]])
    },
    addActions: function() {
    	var mapProjCode = this.target.mapPanel.map.projection;
    	var wfsLayers = this.wfsLayers;
    	this.saveStrategy = new OpenLayers.Strategy.Save();
		this.saveStrategy.events.register('success',this , function(event) {
					
			 var gisUrl="";
			 var response = event.response; 
			 var insertids = response.insertIds;
			 var fidsString = "";
			 for(var i=0;i<insertids.length;i++)
			 {
				 
			        Ext.each(this.saveStrategy.layer.features, function(feature)
			        {
			        
			        	if(feature.fid==insertids[i])
			        	{
			        	   	var lonlatWGS84  = feature.geometry.clone().transform(new OpenLayers.Projection(mapProjCode),new OpenLayers.Projection("EPSG:4326")).components[0];
			        		var li_dotIndex = feature.fid.lastIndexOf(".");
			        		
			        		gisUrl+=feature.fid.substr(li_dotIndex+1) + "|";
			        		
			        		gisUrl+=feature.attributes["ILCE_ID"]!=null?feature.attributes["ILCE_ID"]:0;
			        		gisUrl+= "|"; 
			        		gisUrl+=feature.attributes["ILCE_ADI"]!=null?feature.attributes["ILCE_ADI"]:"";
			        		gisUrl+= "|"; 
			        		gisUrl+=feature.attributes["MAH_ID"]!=null?feature.attributes["MAH_ID"]:0;
			        		gisUrl+= "|"; 
			        		gisUrl+=feature.attributes["MAH_ADI"]!=null?feature.attributes["MAH_ADI"]:"";
			        		gisUrl+= "|"; 
			        		gisUrl+=feature.attributes["YOL_ID"]!=null?feature.attributes["YOL_ID"]:0;
			        		gisUrl+= "|"; 
			        		gisUrl+=feature.attributes["YOL_ISMI"]!=null?feature.attributes["YOL_ISMI"]:"";
			        		gisUrl+= "|"; 
			        		gisUrl+=feature.attributes["KAPI"]!=null?feature.attributes["KAPI"]:"";
			        		gisUrl+= "|";
			        		gisUrl+=feature.attributes["CSBMKOD"]!=null?feature.attributes["CSBMKOD"]:"";
			        		gisUrl+= "|"; 
			        		gisUrl+=feature.attributes["DURUMU"];
			        		gisUrl+= "|"; 
			        		gisUrl+=feature.attributes["TURU"];
			        		gisUrl+= "|"
			        		gisUrl+=lonlatWGS84.x;
			        		gisUrl+= "|";
			        		gisUrl+=lonlatWGS84.y;
			        		gisUrl+= "|";
			        		var transGeom  = feature.geometry.clone().transform(new OpenLayers.Projection(mapProjCode),new OpenLayers.Projection("EPSG:900915"));
			        		gisUrl+= Math.round( transGeom.getLength()*100)/100;
			        		
			        		if(i!=insertids.length-1)
			        			gisUrl+= "#";
			        	}
			        		
			        },this);
			        
			        if(i==insertids.length-1)
			        	fidsString  +=insertids[i];
					else
						fidsString  +=insertids[i] +",";
			        
			 }
			 	
			 if(gisUrl.length>0)
		     {
				   this.vectorLayer.removeAllFeatures();
				   Ext.Ajax.fireEvent("refreshFLayer",'surecProjeler');
				   Ext.Ajax.fireEvent("refreshFLayer",'TUM_BAZ_ISTASYONLAR');
				   Ext.Ajax.fireEvent("refreshFLayer",'VODAFONE_BAZ_ISTASYON');
				   Ext.Ajax.fireEvent("refreshFLayer",'TURKCELL_BAZ_ISTASYON');
				   Ext.Ajax.fireEvent("refreshFLayer",'AVEA_BAZ_ISTASYON');
				   //window.parent.getUserFromLiferay()
					   
					
				    var mapExtent = this.saveStrategy.layer.map.getExtent();
				    var ls_printUrl = ""; 
				    ls_printUrl += this.saveStrategy.layer.protocol.url.replace(/wfs/gi,"wms") + "?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&SRS=" + mapProjCode+ "&format_options=layout:legendkocaeli";
				    ls_printUrl += "&BBOX=" + mapExtent.toString();
				    ls_printUrl += "&FORMAT=image/png&EXCEPTIONS=application/vnd.ogc.se_inimage&LAYERS=" + wfsLayers;
				    ls_printUrl += "&WIDTH="+this.saveStrategy.layer.map.size.w+ "&HEIGHT="+ this.saveStrategy.layer.map.size.h +"&TILED=true&TRANSPARENT=TRUE&featureid=" + fidsString;

			        console.log(gisUrl);
			        console.log(ls_printUrl);
					 
			      try
			      {
			    	  window.parent.setGisData("returnDynamicProject",gisUrl,ls_printUrl);	//mis event (datagrid adres doldurulan form)

			      }
			      catch(err)
			      {
			    	  alert("AdresGrid Bulunamadi");
			    	  
			      }
		      }
			 else if(this.aykomeGridId!=-1 && this.aykomeGridButtonid !=-1 )//delete işlemi aykome grid ve buttonidleri
		     {
				 
				    	this.vectorLayer.removeAllFeatures();
						Ext.Ajax.fireEvent("refreshFLayer",'surecProjeler');
						Ext.Ajax.fireEvent("refreshFLayer",'TUM_BAZ_ISTASYONLAR');
						Ext.Ajax.fireEvent("refreshFLayer",'VODAFONE_BAZ_ISTASYON');
						Ext.Ajax.fireEvent("refreshFLayer",'TURKCELL_BAZ_ISTASYON');
						Ext.Ajax.fireEvent("refreshFLayer",'AVEA_BAZ_ISTASYON');
						try
						{
							window.parent.deleteSuccess(true,this.aykomeGridId,this.aykomeGridButtonid);
						}
						catch(err)
						{
							alert("deleteSucces cağrılamadı");
						}
						
						this.aykomeGridId = -1;
						this.aykomeGridButtonid = -1;
		     }
		});
		
		
		//this.saveStrategy.events.register('fail', null, saveFail);
		Proj4js.defs["EPSG:900915"] = "+proj=tmerc +lat_0=0 +lon_0=30 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +datum=ITRF96 +units=m +no_defs";
		this.vectorLayer = new OpenLayers.Layer.Vector(this.id, {
			strategies: [this.saveStrategy],
	        displayInLayerSwitcher: false,
	        visibility: true,
	        projection : new OpenLayers.Projection(mapProjCode),
	        protocol : new OpenLayers.Protocol.WFS({
                version : "1.1.0",
                url : this.wfsURL,
                featureType : "SURECPROJELER",
				featureNS : "UniversalWorkspace",
                geometryName : "SHAPE"
	        })
		});
		this.snap = new OpenLayers.Control.Snapping({layer: this.vectorLayer});
		var drawControl = new OpenLayers.Control.DrawFeature(this.vectorLayer, OpenLayers.Handler.Point,
	    {
			 multi: true,
			 scope: this,
			 eventListeners: {
                   featureadded: function(evt) {
	                   	evt.object.scope.queuedFeatures.push(evt.feature);
	                   	evt.object.scope.queue = 0;
	                   	Ext.Ajax.fireEvent("nextFeature");
                   }
			 }
	     });
		
		
		//measure tool start
		OpenLayers.Event.observe(document, "keydown", function(evt) {
		    var handled = false;
		    switch (evt.keyCode) {
		        case 90: // z
		            if (evt.metaKey || evt.ctrlKey) {
		            	drawControl.undo();
		                handled = true;
		            }
		            break;
		        case 89: // y
		            if (evt.metaKey || evt.ctrlKey) {
		            	drawControl.redo();
		                handled = true;
		            }
		            break;
		        case 27: // esc
		        	drawControl.cancel();
		            handled = true;
		            break;
		    }
		    if (handled) {
		        OpenLayers.Event.stop(evt);
		    }
		});
		//measure tool end
		
		 var actions = [
		    new GeoExt.Action({
	            tooltip: "Nesne Oluştur",
	            menuText: "Nesne Oluştur",
	            iconCls: "gxp-icon-addfeature",
	            enableToggle: true,
	            control: drawControl,
	            map: this.target.mapPanel.map,
	            toggleGroup: this.toggleGroup,
	            scope: this
	        }),
	        new GeoExt.Action({
	            tooltip: "Çizilen nesneyi geri al",
	            menuText: "Çizilen nesneyi geri al",
	            iconCls: "gxp-icon-featuregerial",
	            handler: function(){ 
	            	if(this.vectorLayer.features.length>0)
	            		this.vectorLayer.removeFeatures([this.vectorLayer.features[this.vectorLayer.features.length-1]])
	            },
	            scope: this,
	            map: this.target.mapPanel.map
			}),
			{
		    	tooltip: "X/Y Konuma Git - Nokta At",
		    	iconCls: "gxp-icon-noktaAt",
		    	scope: this,
		    	handler: function(){
		    		drawControl.deactivate();
		    		var frmXYCreate = new Ext.form.FormPanel(
		    				{
				                bodyStyle: "padding: 5px;",
				                labelWidth: 40,
				                fileUpload : false,
				                defaultType: 'numberfield',
				                items:
				                [
				                 	{
				                 		fieldLabel:'X', 
				                 		name:'fieldX', 
				                 		emptyText:'X değeri...', 
				                 		id:"fieldX",
				                 		allowBlank: false,
				                        forcePrecision: true, 
				                        decimalPrecision: 16
				                 		
				                 	},
				                 	{
				                 		fieldLabel:'Y', 
				                 		name:'fieldY', 
				                 		emptyText:'Y değeri...', 
				                 		id:"fieldY",
				                        allowBlank:false,
				                        forcePrecision: true, 
				                        decimalPrecision: 16
				                 		
				                 	}
				                ],
				                buttons: [{
			                        text: "Konuma Git",
			                        formBind: true,
			                        handler: function(){
			                        	if (frmXYCreate.getForm().isValid()) {
			                        		if(this.vectorLayer.features.length>0)
			                        			this.vectorLayer.removeFeatures([this.vectorLayer.features[this.vectorLayer.features.length-1]])
											var point = new OpenLayers.Geometry.Point(frmXYCreate.getForm().findField('fieldX').getValue(),frmXYCreate.getForm().findField('fieldY').getValue());
											point = point.transform(new OpenLayers.Projection("EPSG:4326"), this.target.mapPanel.map.projection);
											
											var points = []; 
											points.push(point); 
											var pointsGeometry = new OpenLayers.Geometry.MultiPoint(points); 
											
											
											var pointFeature = new OpenLayers.Feature.Vector(pointsGeometry);										
											this.vectorLayer.addFeatures([ pointFeature ]);
											var proj4326 = new OpenLayers.Projection('EPSG:4326');											
											window.app.mapPanel.map.setCenter(
													new OpenLayers.LonLat(frmXYCreate.getForm().findField('fieldX').getValue(), frmXYCreate.getForm().findField('fieldY').getValue()).transform(
															proj4326, window.app.mapPanel.map
																	.getProjectionObject()),
													8);
											//this.queuedFeatures.push(vectorFeature);
											
											

			                        	}
			                        },
			                        scope: this
			                    },
			                    {
			                        text: "Oluştur",
			                        formBind: true,
			                        handler: function(){
			                        	if (frmXYCreate.getForm().isValid()) {
			                        		if(this.vectorLayer.features.length>0)
			                        			this.vectorLayer.removeFeatures([this.vectorLayer.features[this.vectorLayer.features.length-1]])
											var point = new OpenLayers.Geometry.Point(frmXYCreate.getForm().findField('fieldX').getValue(),frmXYCreate.getForm().findField('fieldY').getValue());
											point.transform(new OpenLayers.Projection("EPSG:4326"), this.target.mapPanel.map.projection);
											
											var proj4326 = new OpenLayers.Projection('EPSG:4326');											
											window.app.mapPanel.map.setCenter(new OpenLayers.LonLat(frmXYCreate.getForm().findField('fieldX').getValue(), frmXYCreate.getForm().findField('fieldY').getValue()).transform(proj4326, window.app.mapPanel.map.getProjectionObject()),8);
											
											
											var points = []; 
											points.push(point); 
											var pointsGeometry = new OpenLayers.Geometry.MultiPoint(points); 
											var pointFeature = new OpenLayers.Feature.Vector(pointsGeometry);
                                			pointFeature.state = OpenLayers.State.INSERT;
											
											
											this.vectorLayer.addFeatures([ pointFeature ]);
											this.queuedFeatures.push(pointFeature);
											
											Ext.Ajax.fireEvent("nextFeature");
			                        		
			                        	}
			                        },
			                        scope: this
			                    }]
		                    }
		    		);
            		var winUpload = new Ext.Window({
            			title: "X/Y Konuma Git - Nokta At",
            			layout: "fit",
            			height: 150,
            			width: 250,
				        modal: false,
				        waitTitle: "Lütfen Bekleyin...",
            			items: [frmXYCreate],
				    });
            		winUpload.show();
		    	}
			},
			new GeoExt.Action({
	            tooltip: "Nesneleri kaydet",
	            menuText: "Nesneleri kaydet",
	            iconCls: "gxp-icon-featurekazihattisave",
	            handler: function(){ 
	            	try
	            	{
		            	if(window.parent.hasGrid("gisTable")=="BAZ") //mis function (tablo acikmi kontrolu)
		            	{
		        			var applicationDataArray = window.parent.getApplicationData("").split(",");
		            		if(applicationDataArray.length>2)
		            		{
		            			if(applicationDataArray[2]!="PARAMETER_READONLY")
		            				this.saveStrategy.save();
		            			else
		            				alert("Saltokunur, işlem yapılamaz.");
		            		}
		            		else
		            			this.saveStrategy.save();
		            	}else
		            		alert("Gis Baz Tablosu bulunamadı");
	            	}
	            	catch (err) {
	            		alert("Gis Baz Tablosu bulunamadı"); 
	            	}
		            		
	            },
	            scope: this,
	            map: this.target.mapPanel.map
			})
		 ];
		 return actions = gxp.plugins.FeatureDynamicProject.superclass.addActions.apply(this, [actions]);
    }      
		
});
Ext.preg(gxp.plugins.FeatureDynamicProject.prototype.ptype, gxp.plugins.FeatureDynamicProject);
