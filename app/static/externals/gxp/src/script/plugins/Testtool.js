Ext.namespace("gxp.plugins");
  
gxp.plugins.Testtool = Ext.extend(gxp.plugins.ClickableFeatures, {
    
    ptype: "gxp_testtool",
    iconClsAdd: "gxp-icon-addfeature",
    supportAbstractGeometry: false,
    supportNoGeometry: false,
    iconClsEdit: "gxp-icon-editfeature",
    /** i18n **/
    exceptionTitle: "Save Failed",
    exceptionText: "Trouble saving features",
    pointText: "Point",
    lineText: "Line",
    polygonText: "Polygon",
    noGeometryText: "Event",
    
    createFeatureActionTip: "Yeni KazıHattı Oluştur",
    editFeatureActionTip: "Edit existing feature",
    outputTarget: "map",
    snappingAgent: null,
    readOnly: false,
    modifyOnly: false,
    autoLoadFeatures: false,
    showSelectedOnly: true,
    drawControl: null,
    popup: null,
    autoLoadedFeature: null,
    schema: null,
    constructor: function(config) {
        this.addEvents(
            "layereditable",
            "featureeditable"
        );
        gxp.plugins.Testtool.superclass.constructor.apply(this, arguments);        
    },
    init: function(target) 
    {
        gxp.plugins.Testtool.superclass.init.apply(this, arguments);
        this.target.on("loginchanged", this.enableOrDisable, this);
    },
    destroy: function() 
    {
        this.target.un("loginchanged", this.enableOrDisable, this);
        gxp.plugins.Testtool.superclass.destroy.apply(this, arguments);
    },
    addActions: function() 
    {
        var popup;
        var featureManager = this.getFeatureManager();
        var featureLayer = featureManager.featureLayer;        
        var intercepting = false;
        
        function intercept(mgr, fn) 
        {
            var fnArgs = Array.prototype.slice.call(arguments);
            fnArgs.splice(0, 2);
            if (!intercepting && popup && !popup.isDestroyed) 
            {
                if (popup.editing) 
                {
                    function doIt() 
                    {
                        intercepting = true;
                        unregisterDoIt.call(this);
                        if (fn === "setLayer") 
                             this.target.selectLayer(fnArgs[0]);
                        else if (fn === "clearFeatures") 
                            window.setTimeout(function() {mgr[fn].call(mgr);});
                        else
                            mgr[fn].apply(mgr, fnArgs);
                    }
                    function unregisterDoIt() 
                    {
                        featureManager.featureStore.un("write", doIt, this);
                        popup.un("canceledit", doIt, this);
                        popup.un("cancelclose", unregisterDoIt, this);
                    }
                    featureManager.featureStore.on("write", doIt, this);
                    popup.on({
                        canceledit: doIt,
                        cancelclose: unregisterDoIt,
                        scope: this
                    });
                    popup.close();
                }
                return !popup.editing;
            }
            intercepting = false;
        }
        featureManager.on({
            // TODO: determine where these events should be unregistered
            "beforequery": intercept.createDelegate(this, "loadFeatures", 1),
            "beforelayerchange": intercept.createDelegate(this, "setLayer", 1),
            "beforesetpage": intercept.createDelegate(this, "setPage", 1),
            "beforeclearfeatures": intercept.createDelegate(this, "clearFeatures", 1),
            scope: this
        });
        
        this.drawControl = new OpenLayers.Control.DrawFeature(
            featureLayer,
            OpenLayers.Handler.Point, 
            {
                eventListeners: {
                    featureadded: function(evt) {
                    	alert("nesneolustu");
                        if (this.autoLoadFeatures === true) {
                            this.autoLoadedFeature = evt.feature;
                            
                        }
                    },
                    activate: function() {
                        featureManager.showLayer(
                            this.id, this.showSelectedOnly && "selected"
                        );
                    },
                    deactivate: function() {
                        featureManager.hideLayer(this.id);
                    },
                    scope: this
                }
            }
        );
        
        this.selectControl = new OpenLayers.Control.SelectFeature(featureLayer, {
            clickout: false,
            multipleKey: "fakeKey",
            unselect: function() {
                if (!featureManager.featureStore.getModifiedRecords().length) 
                {
                    OpenLayers.Control.SelectFeature.prototype.unselect.apply(this, arguments);
                }
            },
            eventListeners: {
                "activate": function() {
                    if (this.autoLoadFeatures === true || featureManager.paging) 
                    {
                        this.target.mapPanel.map.events.register(
                            "click", this, this.noFeatureClick
                        );
                    }
                    featureManager.showLayer(
                        this.id, this.showSelectedOnly && "selected"
                    );
                    this.selectControl.unselectAll(
                        popup && popup.editing && {except: popup.feature}
                    );
                },
                "deactivate": function() {
                    if (this.autoLoadFeatures === true || featureManager.paging) 
                    {
                        this.target.mapPanel.map.events.unregister(
                            "click", this, this.noFeatureClick
                        );
                    }
                    if (popup) 
                    {
                        if (popup.editing) 
                        {
                            popup.on("cancelclose", function() {
                                this.selectControl.activate();
                            }, this, {single: true});
                        }
                        popup.on("close", function() {
                            featureManager.hideLayer(this.id);
                        }, this, {single: true});
                        popup.close();
                    } 
                    else
                        featureManager.hideLayer(this.id);
                },
                scope: this
            }
        });
        
        featureLayer.events.on({
            "beforefeatureremoved": function(evt) {
                if (this.popup && evt.feature === this.popup.feature) 
                    this.selectControl.unselect(evt.feature);
            },
            "featureunselected": function(evt) {
                var feature = evt.feature;
                if (feature)
                    this.fireEvent("featureeditable", this, feature, false);
                if (popup && !popup.hidden)
                    popup.close();
            },
            "beforefeatureselected": function(evt) {
            	alert("beforefeatureselected");
                if(popup)
                    return !popup.editing;
            },
            "featureselected": function(evt) {
            	alert("featureselected");
                var feature = evt.feature;
                if (feature)
                    this.fireEvent("featureeditable", this, feature, true);
               
                var featureStore = featureManager.featureStore;
                if(this._forcePopupForNoGeometry === true || (this.selectControl.active && feature.geometry !== null)) 
                {

                    if (this.readOnly === false) 
                    {
                        //this.selectControl.deactivate();
                        featureManager.showLayer(this.id, this.showSelectedOnly && "selected");
                    }
                    popup = this.addOutput({
                        xtype: "gxp_featureeditpopup",
                        collapsible: true,
                        feature: featureStore.getByFeature(feature),
                        vertexRenderIntent: "vertex",
                        readOnly: this.readOnly,
                        fields: this.fields,
                        excludeFields: this.excludeFields,
                        editing: feature.state === OpenLayers.State.INSERT,
                        schema: this.schema,
                        allowDelete: true,
                        width: 200,
                        height: 250,
                        listeners: {
                            "close": function() {
                                if (this.readOnly === false) {
                                    this.selectControl.activate();
                                }
                                if(feature.layer && feature.layer.selectedFeatures.indexOf(feature) !== -1) {
                                    this.selectControl.unselect(feature);
                                }
                                if (feature === this.autoLoadedFeature) {
                                    if (feature.layer) {
                                        feature.layer.removeFeatures([evt.feature]);
                                    }
                                    this.autoLoadedFeature = null;
                                }
                            },
                            "featuremodified": function(popup, feature) {
                                popup.disable();
                                featureStore.on({
                                    write: {
                                        fn: function() {
                                            if (popup && popup.isVisible()) {
                                                popup.enable();
                                            }
                                            var layer = featureManager.layerRecord;
                                            this.target.fireEvent("featureedit", featureManager, {
                                                name: layer.get("name"),
                                                source: layer.get("source")
                                            });
                                        },
                                        single: true
                                    },
                                    exception: {
                                        fn: function(proxy, type, action, options, response, records) {
                                            var msg = this.exceptionText;
                                            if (type === "remote") 
                                            {
                                                // response is service exception
                                                if (response.exceptionReport) {
                                                    msg = gxp.util.getOGCExceptionText(response.exceptionReport);
                                                }
                                            } 
                                            else
                                                msg = "Status: " + response.status;
                                            
                                            // fire an event on the feature manager
                                            featureManager.fireEvent("exception", featureManager, 
                                            response.exceptionReport || {}, msg, records);
                                            // only show dialog if there is no listener registered
                                            if (featureManager.hasListener("exception") === false && 
                                                featureStore.hasListener("exception") === false) {
                                                    Ext.Msg.show({
                                                        title: this.exceptionTitle,
                                                        msg: msg,
                                                        icon: Ext.MessageBox.ERROR,
                                                        buttons: {ok: true}
                                                    });
                                            }
                                            if (popup && popup.isVisible()) 
                                            {
                                                popup.enable();
                                                popup.startEditing();
                                            }
                                        },
                                        single: true
                                    },
                                    scope: this
                                });                                
                                if(feature.state === OpenLayers.State.DELETE) 
                                {                                    
                                    featureStore._removing = true; // TODO: remove after http://trac.geoext.org/ticket/141
                                    featureStore.remove(featureStore.getRecordFromFeature(feature));
                                    delete featureStore._removing; // TODO: remove after http://trac.geoext.org/ticket/141
                                }
                                featureStore.save();
                            },
                            "canceledit": function(popup, feature) {
                                featureStore.commitChanges();
                            },
                            scope: this
                        }
                    });
                    this.popup = popup;
                }
            },
            "sketchcomplete": function(evt) {
            			alert("sketchcomplete");
                		featureManager.featureLayer.events.register("featuresadded", this, function(evt) {
                    
   						 var typename = 'UniversalWorkspace:SDE.KARAYOLU';
						 var typenameMah = 'UniversalWorkspace:SDE.KOYMAHALLE';
						 var attribute = 'YOL_ID,YOL_ISMI,KAPLAMA_CI,SHAPE';
						 var gs_WfsKaziHatUrl = "http://10.0.0.153:8080/geoserver/wfs";
						 var gs_MapProjection = "EPSG:900915";
						 var wfsurl;

                			
                		Proj4js.defs["EPSG:900915"] = "+proj=tmerc +lat_0=0 +lon_0=30 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +datum=ITRF96 +units=m +no_defs";
                		var proj = new OpenLayers.Projection("EPSG:900915");
                		
                		var geometryLineString = "";
                		var feature = evt.features[0];
						var nodes = feature.geometry.getVertices(); 
						
						for (var i=0; i<nodes.length; i++) 
						{ 
						  var lon = nodes[i].x; 
						  var lat = nodes[i].y; 
						  var lonlat = new OpenLayers.LonLat(lon, lat);
						  lonlat.transform(featureManager.featureLayer.projection,proj);
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
                		
                		
                    featureManager.featureLayer.events.unregister("featuresadded", this, arguments.callee);
                    this.drawControl.deactivate();
                    //this.selectControl.activate();
                    //this.selectControl.select(evt.features[0]);
                });
            },
            scope: this
        });

        var toggleGroup = this.toggleGroup || Ext.id();

        var actions = [];
        var commonOptions = {
            tooltip: this.createFeatureActionTip,
            menuText: this.createFeatureActionText,
            text: this.createFeatureActionText,
            iconCls: this.iconClsAdd,
            disabled: true,
            hidden: this.modifyOnly || this.readOnly,
            toggleGroup: toggleGroup,
            enableToggle: true,
            allowDepress: true,
            control: this.drawControl,
            deactivateOnDisable: true,
            map: this.target.mapPanel.map
        };
        if (this.supportAbstractGeometry === true) 
        {
            var menuItems = [];
            if (this.supportNoGeometry === true) {
                menuItems.push(
                    new Ext.menu.CheckItem({
                        text: this.noGeometryText,
                        iconCls: "gxp-icon-event",
                        groupClass: null,
                        group: toggleGroup,
                        listeners: {
                            checkchange: function(item, checked) {
                                if (checked === true) {
                                    var feature = new OpenLayers.Feature.Vector(null);
                                    feature.state = OpenLayers.State.INSERT;
                                    featureLayer.addFeatures([feature]);
                                    this._forcePopupForNoGeometry = true;
                                    featureLayer.events.triggerEvent("featureselected", {feature: feature});
                                    delete this._forcePopupForNoGeometry;
                                }
                                this.actions[0].items[0].setChecked(false);
                            },
                            scope: this
                        }
                    })
                );
            }
            var checkChange = function(item, checked, Handler) {
                if (checked === true) {
                    this.setHandler(Handler, false);
                }
                this.actions[0].items[0].setChecked(checked);
            };
            menuItems.push(
                new Ext.menu.CheckItem({
                    groupClass: null,
                    text: this.pointText,
                    group: toggleGroup,
                    iconCls: 'gxp-icon-point',
                    listeners: {
                        checkchange: checkChange.createDelegate(this, [OpenLayers.Handler.Point], 2)
                    }
                }),
                new Ext.menu.CheckItem({
                    groupClass: null,
                    text: this.lineText,
                    group: toggleGroup,
                    iconCls: 'gxp-icon-line',
                    listeners: {
                        checkchange: checkChange.createDelegate(this, [OpenLayers.Handler.Path], 2)
                    }
                }),
                new Ext.menu.CheckItem({
                    groupClass: null,
                    text: this.polygonText,
                    group: toggleGroup,
                    iconCls: 'gxp-icon-polygon',
                    listeners: {
                        checkchange: checkChange.createDelegate(this, [OpenLayers.Handler.Polygon], 2)
                    }
                })
            );

            actions.push(
                new GeoExt.Action(Ext.apply(commonOptions, {
                    menu: new Ext.menu.Menu({items: menuItems})
                }))
            );
        } 
        else
            actions.push(new GeoExt.Action(commonOptions));
        
//        actions.push(new GeoExt.Action({
//            tooltip: this.editFeatureActionTip,
//            text: this.editFeatureActionText,
//            menuText: this.editFeatureActionText,
//            iconCls: this.iconClsEdit,
//            disabled: true,
//            toggleGroup: toggleGroup,
//            enableToggle: true,
//            allowDepress: true,
//            control: this.selectControl,
//            deactivateOnDisable: true,
//            map: this.target.mapPanel.map
//        }));

       actions = gxp.plugins.Testtool.superclass.addActions.call(this, actions);

        featureManager.on("layerchange", this.onLayerChange, this);

        var snappingAgent = this.getSnappingAgent();
        if (snappingAgent) 
            snappingAgent.registerEditor(this);

        return actions;
    },

    /** private: method[getFeatureManager]
     *  :returns: :class:`gxp.plugins.FeatureManager`
     */
    getFeatureManager: function() {
        var manager = this.target.tools[this.featureManager];
        if (!manager)
            throw new Error("Unable to access feature manager by id: " + this.featureManager);
        return manager;
    },

    /** private: getSnappingAgent
     *  :returns: :class:`gxp.plugins.SnappingAgent`
     */
    getSnappingAgent: function() {
        var agent;
        var snapId = this.snappingAgent;
        if (snapId) {
            agent = this.target.tools[snapId];
            if (!agent) {
                throw new Error("Unable to locate snapping agent with id: " + snapId);
            }
        }
        return agent;
    },

    setHandler: function(Handler, multi) {
        var control = this.drawControl;
        var active = control.active;
        if(active) {
            control.deactivate();
        }
        control.handler.destroy(); 
        control.handler = new Handler(
            control, control.callbacks,
            Ext.apply(control.handlerOptions, {multi: multi})
        );
        if(active) {
            control.activate();
        } 
    },

    /**
     * private: method[enableOrDisable]
     */
    enableOrDisable: function() {
        var disable = !this.schema || !this.target.isAuthorized();
        this.actions[0].setDisabled(disable);
        //this.actions[1].setDisabled(disable);
        return disable;
    },
    
    /** private: method[onLayerChange]
     *  :arg mgr: :class:`gxp.plugins.FeatureManager`
     *  :arg layer: ``GeoExt.data.LayerRecord``
     *  :arg schema: ``GeoExt.data.AttributeStore``
     */
    onLayerChange: function(mgr, layer, schema) {
        this.schema = schema;
        var disable = this.enableOrDisable();
        if(layer!=null && layer.data.layer.name != "SDE.KAZIHATTI")
        {	
        	disable = true;
        	this.actions[0].setDisabled(disable);
        }
        if (disable) {
            // not a wfs capable layer or not authorized
            this.fireEvent("layereditable", this, layer, false);
            return;
        }

        var control = this.drawControl;
        var button = this.actions[0];
        var handlers = {
            "Point": OpenLayers.Handler.Point,
            "Line": OpenLayers.Handler.Path,
            "Curve": OpenLayers.Handler.Path,
            "Polygon": OpenLayers.Handler.Polygon,
            "Surface": OpenLayers.Handler.Polygon
        };
        var simpleType = mgr.geometryType.replace("Multi", "");
        var Handler = handlers[simpleType];
        if (Handler) {
            var multi = (simpleType != mgr.geometryType);
            this.setHandler(Handler, multi);
            button.enable();
        } else if (this.supportAbstractGeometry === true && mgr.geometryType === 'Geometry') {
            button.enable();
        } else {
            button.disable();
        }
        this.fireEvent("layereditable", this, layer, true);
    },
    
    /** private: method[select]
     *  :arg feature: ``OpenLayers.Feature.Vector``
     */
    select: function(feature) {
        this.selectControl.unselectAll(
            this.popup && this.popup.editing && {except: this.popup.feature});
        this.selectControl.select(feature);
    }
});

Ext.preg(gxp.plugins.Testtool.prototype.ptype, gxp.plugins.Testtool);
