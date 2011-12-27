Ext.namespace("gxp.plugins");
  
gxp.plugins.Featurekazihatti = Ext.extend(gxp.plugins.Tool, {
    
    ptype: "gxp_featurekazihatti",
    outputTarget: "map",
    popupCache: null,
    wfsURL: null,
    wfsLayers:"UniversalWorkspace:SDE.KOYMAHALLE,UniversalWorkspace:SDE.KARAYOLU,UniversalWorkspace:SDE.KOCAELI_KAPI,UniversalWorkspace:SDE.KOCAELI_YAPI,UniversalWorkspace:SDE.KAZIHATTI",
    kaziActionTip: "Kazi hattı oluştur",
    popupTitle: "Kazi hattı oluştur",
    tooltip: "Kazi hattı oluştur",
	saveStrategy:null,
	snap:null,
	layers: {},
	queue : 0,
	queuedFeatures: [],
	vectorLayer : null,
	printService: null,
	constructor: function(config) {
        gxp.plugins.Featurekazihatti.superclass.constructor.apply(this, arguments);
    },
    
    init: function(target) {
    	gxp.plugins.Featurekazihatti.superclass.init.apply(this, arguments);
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
          			var lo_layer = this.getLayer("kazihatti");
          			if(lo_layer!=null)
          			{
            			var vectorFeature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.MultiLineString(null));
            			vectorFeature.fid = this.createObjectID(lo_layer.data.name,fid);
            			vectorFeature.state = OpenLayers.State.DELETE;
            			this.vectorLayer.addFeatures(vectorFeature);
            			this.saveStrategy.save();
            			Ext.Ajax.fireEvent("refreshFLayer",'kazihatti');
            			try
            			{
            				window.parent.deleteSuccess(true,tableid,buttonid);
            			}
            			catch(err)
            			{alert("deleteSucces cağrılamadı");}
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
			var ls_fidQuery = "";//"featureid=";
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
    	var request;
    	var jsonFormatter =  new OpenLayers.Format.GeoJSON();
    	var mahSokStore = new Ext.data.ArrayStore({
	        id: 0,
	        fields: ['YOL_ID','YOL_ISMI','YOL_KAPLAMA_CINSI','MAH_ID','MAH_ADI','ILCE_ID','ILCE_ADI','MAH_SOK']
		});
    	Proj4js.defs["EPSG:900915"] = "+proj=tmerc +lat_0=0 +lon_0=30 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +datum=ITRF96 +units=m +no_defs";
    	var transGeom  = feature.geometry.clone().transform(new OpenLayers.Projection(mapProjCode),new OpenLayers.Projection("EPSG:900915"));
    	request = OpenLayers.Request.GET({
		    url:    wfsURL,
		    params: {
		    	"service" : "wfs",
		    	"version" : "1.0.0",
		    	"request" : "GetFeature",
		    	"srs" : "EPSG:900915",
		    	"outputFormat" : "json",
		    	"typename" : "UniversalWorkspace:SDE.KARAYOLU",
		    	"propertyName" : "YOL_ID,YOL_ISMI,KAPLAMA_CI,SHAPE",
		    	"cql_filter" : "DWITHIN(SHAPE,"+transGeom.components[0].simplify().toString()+",2,meters)"
		    },
		    async: false
    	});
    	Ext.each(jsonFormatter.read(request.responseText), function(sokak)
		{
			if (mahSokStore.find("YOL_ISMI",sokak.attributes["YOL_ISMI"])==-1)
			{
				mahSokStore.add(new Ext.data.Record({'YOL_ID': sokak.attributes["YOL_ID"], 'YOL_ISMI':sokak.attributes["YOL_ISMI"], 'YOL_KAPLAMA_CINSI': sokak.attributes["KAPLAMA_CI"]}));
				request = OpenLayers.Request.GET({
					    url:    wfsURL,
					    params: {
    				    	"service" : "wfs",
    				    	"version" : "1.0.0",
    				    	"request" : "GetFeature",
    				    	"srs" : "EPSG:900915",
    				    	"outputFormat" : "json",
    				    	"typename" : "UniversalWorkspace:SDE.KOYMAHALLE",
    				    	"propertyName" : "ILCEADI,ILCEID,KOYMAHALLEADI,MAHALLEID",
    				    	"cql_filter" : "INTERSECTS(SHAPE,"+sokak.geometry.components[0].simplify().toString()+")"
    				    },
					    async: false
				});
				Ext.each(jsonFormatter.read(request.responseText),function(mah)
				{
					var item = mahSokStore.getAt(mahSokStore.find("YOL_ID",sokak.attributes["YOL_ID"]));
					item.data["MAH_ID"] = mah.attributes["MAHALLEID"];
					item.data["MAH_ADI"] = mah.attributes["KOYMAHALLEADI"];
					item.data["ILCE_ID"] = mah.attributes["ILCEID"];
					item.data["ILCE_ADI"] = mah.attributes["ILCEADI"];
					item.data["MAH_SOK"] = mah.attributes["KOYMAHALLEADI"]+" : "+item.data["YOL_ISMI"];
				});
			}    							
		},this);
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
		        modal: true,
    			items: [
                {
	                xtype: "form",
	                bodyStyle: "padding: 5px;",
	                labelWidth: 40,
	                items: [cbxRegion]
                }],
        		buttons: [{
                    text: "Tamam",
                    formBind: true,
                    handler: function(){
                    	var item = mahSokStore.getAt(mahSokStore.find("YOL_ID",cbxRegion.getValue()));
                    	for (r in item.data)
                    	{
                    		if (r!='MAH_SOK')
                    			feature.attributes[r] = item.data[r];
                    	}
                    	selectRegionWin.hide();
                    },
                    scope: this
                }]  							         
		    });
    		selectRegionWin.show();
		}else if(mahSokStore.getCount() == 1)
		{
			var item = mahSokStore.getAt(0);
			for (r in item.data)
			{
            	if (r!='MAH_SOK')
            		feature.attributes[r] = item.data[r];
			}
		}
		else
		{
			Ext.Msg.show({
				   title:'Mahalle / Sokak Bilgisi Bulunamadı',
				   msg: 'Son çizilen kazı hattı için mahelle / sokak bilgisi bulunamadı.',
				   buttons: Ext.Msg.OK,
				   icon: Ext.MessageBox.INFO
			});
		}
    	this.queue++;
    	Ext.Ajax.fireEvent("nextFeature");
    },   
    
    addActions: function() {
    	var mapProjCode = this.target.mapPanel.map.projection;
    	var wfsLayers = this.wfsLayers;
    	this.saveStrategy = new OpenLayers.Strategy.Save();
		//this.saveStrategy.events.register('start', null, saveStart);
		this.saveStrategy.events.register('success', null, function(event) {
			 var gisUrl="";
			 var response = event.response; 
			 var insertids = response.insertIds;
			 var fidsString = "";
			 for(var i=0;i<insertids.length;i++)
			 {
				 
			        Ext.each(this.layer.features, function(feature)
			        {
			        
			        	if(feature.fid==insertids[i])
			        	{
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
			        		gisUrl+=feature.attributes["YOL_KAPLAMA_CINSI"];
			        		gisUrl+= "|"; 
			        		gisUrl+= Math.round( feature.geometry.getLength()*100)/100;
			        		
			        		if(i!=insertids.length-1)
			        			gisUrl+= "#";
			        	}
			        		
			        });
			        
			        if(i==insertids.length-1)
			        	fidsString  +=insertids[i];
					else
						fidsString  +=insertids[i] +",";
			        
			 }
			 	
			 if(gisUrl.length>0)
		     {
				    var mapExtent = this.layer.map.getExtent();
				    var ls_printUrl = ""; 
				    ls_printUrl += this.layer.protocol.url.replace(/wfs/gi,"wms") + "?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&SRS=" + mapProjCode+ "&format_options=layout:legendkocaeli";
				    ls_printUrl += "&BBOX=" + mapExtent.toString();
				    ls_printUrl += "&FORMAT=image/png&EXCEPTIONS=application/vnd.ogc.se_inimage&LAYERS=" + wfsLayers;
				    ls_printUrl += "&WIDTH="+this.layer.map.size.w+ "&HEIGHT="+ this.layer.map.size.h +"&TILED=true&TRANSPARENT=TRUE&featureid=" + fidsString;
				    
			        console.log(gisUrl);
			        console.log(ls_printUrl);
					 
			      try
			      {
			    	  window.parent.setGisData("returnAddress",gisUrl,ls_printUrl);	//mis event (datagrid adres doldurulan form)
			      }
			      catch(err)
			      {
			    	  alert("AdresGrid Bulunamadi");
			    	  
			      }
		      }
			 
			 
		});
		//this.saveStrategy.events.register('fail', null, saveFail);
		Proj4js.defs["EPSG:900915"] = "+proj=tmerc +lat_0=0 +lon_0=30 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +datum=ITRF96 +units=m +no_defs";
		this.vectorLayer = new OpenLayers.Layer.Vector(this.id, {
			strategies: [this.saveStrategy],
	        displayInLayerSwitcher: false,
	        visibility: true,
	        projection : new OpenLayers.Projection("EPSG:900913"),
	        protocol : new OpenLayers.Protocol.WFS({
                version : "1.1.0",
                url : this.wfsURL,
                featureType : "SDE.KAZIHATTI",
				featureNS : "UniversalWorkspace",
                geometryName : "SHAPE"
	        })
		});
		this.snap = new OpenLayers.Control.Snapping({layer: this.vectorLayer});
		var drawControl = new OpenLayers.Control.DrawFeature(this.vectorLayer, OpenLayers.Handler.Path,
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
		 var actions = [
		    new GeoExt.Action({
	            tooltip: "Kazı Hattı Oluştur",
	            menuText: "Kazı Hattı Oluştur",
	            iconCls: "gxp-icon-addfeature",
	            enableToggle: true,
	            control: drawControl,
	            map: this.target.mapPanel.map,
	            toggleGroup: this.toggleGroup,
	            scope: this
	        }),
			{
		    	tooltip: "İçeri Aktar",
		    	iconCls: "gxp-icon-addpackage",
		    	scope: this,
		    	handler: function(){
		    		drawControl.deactivate();
		    		var frmUpload = new Ext.form.FormPanel(
		    				{
				                bodyStyle: "padding: 5px;",
				                labelWidth: 40,
				                fileUpload : true,
				                items:
				                [
									{
									    name: "domain",
									    value: document.domain,
									    xtype: 'hidden'
									},
				                 	{
				                 		xtype: "label",
				                 		html:  "DXF/DWF uzantılı dosyanızı veya ESRI Shape File(SHP) dosyanızın içinde bulunduğu klasörü ZIP formatında paketleyerek (Winzip/Winrar kullanabilirsiniz) <b>Gözat</b> butonu ile <b>Dosya</b> alanına ekleyin.<br/>&nbsp;",
				                 		
				                 	},
				                 	{
				                 		xtype: "field",
				                 		inputType: "file",
				                 		fieldLabel: "Dosya",
				                 		name: "file",
				                 		allowBlank: false
				                 	}
				                ],
				                buttons: [{
			                        text: "Aktar",
			                        formBind: true,
			                        handler: function(){
			                        	if (frmUpload.getForm().isValid()) {
			                        		//console.log("form is valid");
			                        		frmUpload.form.submit(
			                                {
			                                	url: "http://localhost:8181/GeoImport/",
			                                	waitMsg: 'Aktarılıyor...',
		                                		failure: function(form, action) {
		                                			var jsonFormatter =  new OpenLayers.Format.GeoJSON();
			                                		var geoCollection = jsonFormatter.read(action.response.responseText)[0].geometry;
			                                		geoCollection.transform(new OpenLayers.Projection("EPSG:900915"),new OpenLayers.Projection(mapProjCode));
			                                		this.target.mapPanel.map.zoomToExtent(geoCollection.getBounds(),true);
			                                		winUpload.hide();
			                                		Ext.each(geoCollection.components,function(geom){
			                                			var vectorFeature = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.MultiLineString([geom]));
			                                			vectorFeature.state = OpenLayers.State.INSERT;
			                                			this.vectorLayer.addFeatures(vectorFeature);
			                                			this.queuedFeatures.push(vectorFeature);
			                                		},this);
			                                		this.queue = 0;
			                                		Ext.Ajax.fireEvent("nextFeature");
		                                		},
		                                		scope: this
			                                });
			                        	}
			                        },
			                        scope: this
			                    }]
		                    }
		    		);
            		var winUpload = new Ext.Window({
            			title: "İçe Aktar",
            			layout: "fit",
            			height: 150,
            			width: 500,
				        modal: true,
				        waitTitle: "Lütfen Bekleyin...",
            			items: [frmUpload],
				    });
            		winUpload.show();
		    	}
			},
			new GeoExt.Action({
	            tooltip: "Kazı hatlarını kaydet",
	            menuText: "Kazı hatlarını kaydet",
	            iconCls: "gxp-icon-featurekazihattisave",
	            handler: function(){ 
	            	try
	            	{
		            	if(window.parent.hasGrid("gisTable")) //mis function (tablo acikmi kontrolu)
		            		this.saveStrategy.save();
		            	else
		            		alert("Gis Adress Tablosu bulunamadı");
	            	}
	            	catch (err) {
	            		alert("Gis Adress Tablosu bulunamadı");
	            	}
	            },
	            scope: this,
	            map: this.target.mapPanel.map
			})
		 ];
		 return actions = gxp.plugins.Featurekazihatti.superclass.addActions.apply(this, [actions]);
    }      
		
});
Ext.preg(gxp.plugins.Featurekazihatti.prototype.ptype, gxp.plugins.Featurekazihatti);
