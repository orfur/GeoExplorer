Ext.namespace("gxp.plugins");
  
gxp.plugins.FlexCityAdresAl = Ext.extend(gxp.plugins.Tool, {
    
      ptype: "gxp_flexcityadresal",
      popupTitle: "Adres Al",
      tooltip: "Adres Al",
      menuText: "Adres Al",
      dataLayers:null,
      busyMask:null,
      constructor: function(config) {
    	  gxp.plugins.FlexCityAdresAl.superclass.constructor.apply(this, arguments);
      }, 
      init: function(target) {
          this.busyMask = new Ext.LoadMask(
                  target.mapPanel.map.div, {
                      msg: "Lütfen bekleyiniz."
                  }
              );
    	  gxp.plugins.FlexCityAdresAl.superclass.init.apply(this, arguments);   	  
      },
      addActions: function() {
  
    	  OpenLayers.Control.Click  = OpenLayers.Class(OpenLayers.Control, {                
              defaultHandlerOptions: {
                  'single': true,
                  'double': false,
                  'pixelTolerance': 0,
                  'stopSingle': false,
                  'stopDouble': false
              },

              initialize: function(options) {
                  this.handlerOptions = OpenLayers.Util.extend(
                      {}, this.defaultHandlerOptions
                  );
                  OpenLayers.Control.prototype.initialize.apply(
                      this, arguments
                  ); 
                  this.handler = new OpenLayers.Handler.Click(
                      this, {
                          'click': this.trigger
                      }, this.handlerOptions
                  );
              }, 

              trigger: function(e) {
            	  var adresStore = new Ext.data.ArrayStore({
            		  id: 0,
            		  fields: ['NVI_CSBMKOD','BINA_KODU','BINA_ADI','KAPI_NO','YOL_ID','YOL_ISMI','MAH_ID','MAH_ADI','ILCE_ID','ILCE_ADI']
            	  });
              	
                  var lonlat = this.map.getLonLatFromViewPortPx(e.xy);
              	  var transGeom  = lonlat.transform(new OpenLayers.Projection(this.map.projection),new OpenLayers.Projection("EPSG:40000"));
              	  //alert(transGeom.lon + " " + transGeom.lat);
              	  
              	  //kapi bilgisi
              	  //var response = this.scope.queryOnLayer(this.scope.dataLayers.kapi,"KAPI_NO,NVI_CSBMKOD,NVI_BINAKOD,PARSEL_ID","DWITHIN(SHAPE,POINT("+lonlat.lon+ " " + lonlat.lat +"),1,meters)");
				var intersectGeometry = new OpenLayers.Bounds();
              	intersectGeometry.extend(new OpenLayers.LonLat(lonlat.lon-2,lonlat.lat-2));
              	intersectGeometry.extend(new OpenLayers.LonLat(lonlat.lon+2,lonlat.lat+2));
				
				adresStore.data["NVI_CSBMKOD"]="0";
				adresStore.data["KAPI_NO"]="0";
				adresStore.data["YOL_ID"] = "0";
				adresStore.data["YOL_ISMI"] = "-";
				adresStore.data["MAH_ID"] = "0";
				adresStore.data["MAH_ADI"] = "-";
				adresStore.data["ILCE_ID"] = "0";
				adresStore.data["ILCE_ADI"] = "SULTANBEYLİ";
				adresStore.data["BINA_ADI"] = "-";
				adresStore.data["BINA_KODU"] ="0";
              	try{
              	var response = this.scope.queryOnLayer(this.scope.dataLayers.kapi,"kapi_no,uavt_adres_id,yol_adi,mahalle_adi","INTERSECTS(geometry,"+ intersectGeometry.toGeometry().toString() +")");
              	  if(response.length>0)
              	  {
		              	  Ext.each(response, function(kapi)
		              	  {
		              		  	//adresStore.data["NVI_CSBMKOD"] =  kapi.attributes["NVI_CSBMKOD"];
		              		  	adresStore.data["KAPI_NO"] 	   =  kapi.attributes["kapi_no"];
								adresStore.data["BINA_KODU"]   =  kapi.attributes["uavt_adres_id"];
								adresStore.data["MAH_ADI"]   =  kapi.attributes["mahalle_adi"];
								adresStore.data["YOL_ISMI"]   =  kapi.attributes["yol_adi"];
								
								response = this.scope.queryOnLayer(this.scope.dataLayers.bina,"yapi_adi,yapi_uavt_id","yapi_uavt_id="+ kapi.attributes["uavt_adres_id"]);
								Ext.each(response, function(bina)
		                      	{
									adresStore.data["BINA_ADI"] = 	 bina.attributes["yapi_adi"];
									
								});
							
		              		  	
		              	  },this);
              	  }
              	  else
              	  {
              		  
          		  	  //sokak bilgisi
          		  	  response = this.scope.queryOnLayer(this.scope.dataLayers.sokak,"yol_id,yol_adi,yol_uavt_id,geometryetry","DWITHIN(geometryetry,POINT("+lonlat.lon+ " " + lonlat.lat +"),2,meters)");
          		  	  if(response.length>0)
          		  	  {
		                  	  Ext.each(response, function(sokak)
		                  	  {
		                  		  	adresStore.data["YOL_ID"] 	=  sokak.attributes["yol_id"];
		                  		  	adresStore.data["YOL_ISMI"] =  sokak.attributes["yol_adi"];
		                  		  	//alert("YOL_ISMI:" + sokak.attributes["YOL_ISMI"]);
		                  		  	
		                		  	  //mahalle-ilce bilgisi
		                  		  	  response = this.scope.queryOnLayer(this.scope.dataLayers.mahalle,"mahalle_adi,mahalle_id","INTERSECTS(geometry,"+sokak.geometry.components[0].simplify().toString()+")");
		                        	  Ext.each(response, function(mah)
		                        	  {                            		  	
		                        		  	adresStore.data["MAH_ID"] = mah.attributes["mahalle_id"];
		                        		  	adresStore.data["MAH_ADI"] = mah.attributes["mahalle_adi"];
		                        		  	//adresStore.data["ILCE_ID"] = mah.attributes["ilce_id"];
		                        		  	//adresStore.data["ILCE_ADI"] = mah.attributes["ILCEADI"];
		                        		  	//alert( mah.attributes["KOYMAHALLEADI"] + " " +  mah.attributes["ILCEADI"]);
		                        		   	
		                        	  }); 
		                  		  	
		                  	  },this);
          		  	  }
          		  	  else
          		  	  {
          		  		  
            		  	  //mahalle-ilce bilgisi
              		  	  response = this.scope.queryOnLayer(this.scope.dataLayers.mahalle,"mahalle_adi,mahalle_id","INTERSECTS(geometry,POINT("+lonlat.lon+ " " + lonlat.lat +"))");
                    	  Ext.each(response, function(mah)
                    	  {                            		  	
                    		  	adresStore.data["MAH_ID"] = mah.attributes["mahalle_id"];
                    		  	adresStore.data["MAH_ADI"] = mah.attributes["mahalle_adi"];
                    		  	//adresStore.data["ILCE_ID"] = mah.attributes["ILCEID"];
                    		  	//adresStore.data["ILCE_ADI"] = mah.attributes["ILCEADI"];
                    		  	//alert( mah.attributes["KOYMAHALLEADI"] + " " +  mah.attributes["ILCEADI"]);
                    		  	
                    	  });
          		  		  
          		  	  }
              		  
              	  }
              	  
              	  
		              	try //vaadin service erisim icin kullanilan fonksiyon 
						{
								//Ext.MessageBox.minWidth = 300; 
		              		Ext.MessageBox.buttonText = {
		              	            ok     : "Tamam",
		              	            cancel : "İptal",
		              	            yes    : "Evet",
		              	            no     : "Hayır"
		              	        };
		              		
		              		Ext.MessageBox.confirm('Uyarı', "Şeçmek istediğiniz adres?\n" +
								adresStore.data["ILCE_ADI"] + " İlçesi\n" +
								adresStore.data["MAH_ADI"]  + " Mahallesi\n" + 
								adresStore.data["YOL_ISMI"] + " Cad./Sok. " + 
								' Kapıno ' + adresStore.data["KAPI_NO"], function(btn) {     
		
									window.parent.setAddressScript3('address:' + 
																adresStore.data["NVI_CSBMKOD"]+':'+
																adresStore.data["KAPI_NO"]  +':'+
																adresStore.data["YOL_ID"]   +':'+
																adresStore.data["YOL_ISMI"] +':'+ 
																adresStore.data["MAH_ID"]	+':'+
																adresStore.data["MAH_ADI"]	+':'+
																adresStore.data["ILCE_ID"]	+':'+
																adresStore.data["ILCE_ADI"] +':'+
																adresStore.data["BINA_ADI"]	+':'+
																adresStore.data["BINA_KODU"]);
								});
						}						    			
						catch(err)
						{
							
							alert("window.parent.setAddress3 fonksiyonu bulunamadı.\n" +err.message );
						}
              	  
              	  
              	}
              	catch(errM)//sorgulamalar icin try catch blok
              	{
              		
              		alert("Mekansal sorgulama yapılırken hata oluştu." + errM.message);
              	}
              	
              	

              	//window.parent.deleteSuccess(true,tableid,buttonid);
              	  //	var element = document.getElementById('returnaddress');
	              //	element.value = ls_returnValue;
	              //	element.onclick(null);
              	  
              },
              scope:this

          });

    	  
        var actions = [new GeoExt.Action({
            tooltip: "Adresi Seç",
            menuText: "Adresi Seç",
            iconCls: "gxp-icon-flexcityadresal",
            enableToggle: true,
            control: new OpenLayers.Control.Click(),
            map: this.target.mapPanel.map,
            toggleGroup: this.toggleGroup,
            scope: this,
            handler: function(evt)
            {
            	this.dataLayers =  this.getLayers();
            }
        })];
            	
        return actions = gxp.plugins.FlexCityAdresAl.superclass.addActions.call(this, actions);
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
	                         case "mahallesokak":
	                        	   layers.mahallesokak  = layer;
	                        	   break;
	                               
	                    }
	              });
	        }); 
	        
	        return layers;
    },
    uniWaiting: function(msecs)
    {
    	var start = new Date().getTime();
    	var cur = start
    	while(cur - start < msecs)
    	{
    	cur = new Date().getTime();
    	} 
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
		    	"srs" : "EPSG:40000",
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
			
    }
		
});

Ext.preg(gxp.plugins.FlexCityAdresAl.prototype.ptype, gxp.plugins.FlexCityAdresAl);
