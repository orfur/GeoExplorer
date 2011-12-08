Ext.namespace("gxp.plugins");
  
gxp.plugins.KocaeliGisSorgu = Ext.extend(gxp.plugins.Tool, {
    
    ptype: "gxp_kocaeligissorgu",
    outputTarget: "map",
    popupTitle: "Kocaeli Mahalle/Sokak Sorgusu",
    tooltip: "Kocaeli Mahalle/Sokak Sorgusu",
    menuText: "Kocaeli Mahalle/Sokak Sorgusu",
	  //-> /geoserver/wfs geoserver local olacagindan dolayi - bu sekilde yazabiliriz.
	  gs_WfsUrl : "http://10.0.0.153:8080/geoserver/wfs",
      init: function(target) {
      gxp.plugins.KocaeliGisSorgu.superclass.init.apply(this, arguments);
    },
    
    addActions: function() {
  
        var actions = [new GeoExt.Action({
	            tooltip: this.tooltip,
	            menuText: this.menuText,
	            iconCls: "gxp-icon-addfeature",
	            enableToggle: false,
	            pressed: false,
	            allowDepress: false,
	            handler: function(evt)
	            { 
	            	console.log(evt)
	            	var layers = {};
	            	var layersDataItems = evt.mapPanel.layers.data.items;
	            	for(var i=0;i<layersDataItems.length;i++)
	            	{
	            		var layerKeywords = layersDataItems[i].data.keywords;
	            		if(layerKeywords!=null)
	            		{	
		            		for(var j=0;j<layerKeywords.length;j++)
		            		{
		            			if(layerKeywords[j] == "Bina")
		            				layers.Bina = evt.mapPanel.map.layers[i];
		            			else if(layerKeywords[j] == "Mahalle")
		            				layers.Mahalle = evt.mapPanel.map.layers[i];
		            			else if(layerKeywords[j] == "Sokak")
		            				layers.Sokak = evt.mapPanel.map.layers[i];
		            			else if(layerKeywords[j] == "Kapi")
		            				layers.Kapi = evt.mapPanel.map.layers[i];
		            			else if(layerKeywords[j] == "İlçe")
		            				layers.Ilce = evt.mapPanel.map.layers[i];
		            			
		            		}
	            		}
	            	}
	            	
	            	
	            	
	            	
	            	
	            	
	            },
	            mapPanel: this.target.mapPanel})];
        	
        return actions = gxp.plugins.Testtool.superclass.addActions.call(this, actions);//gxp.plugins.Featurekazihatti.superclass.addActions.apply(this, [actions]);
    }      
		
});

Ext.preg(gxp.plugins.KocaeliGisSorgu.prototype.ptype, gxp.plugins.KocaeliGisSorgu);
