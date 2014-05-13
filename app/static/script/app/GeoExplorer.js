/**
 * Copyright (c) 2009-2011 The Open Planning Project
 */

Ext.USE_NATIVE_JSON = true;
(function() {
	Ext.preg("gx_wmssource", gxp.plugins.WMSSource);
	Ext.preg("gx_olsource", gxp.plugins.OLSource);
	Ext.preg("gx_googlesource", gxp.plugins.GoogleSource);
	Ext.preg("gx_bingsource", gxp.plugins.BingSource);
	Ext.preg("gx_osmsource", gxp.plugins.OSMSource);
})();
var GeoExplorer = Ext
		.extend(
				gxp.Viewer,
				{
					zoomSliderText : "<div>Zoom Level: {zoom}</div><div>Scale: 1:{scale}</div>",
					loadConfigErrorText : "Trouble reading saved configuration: <br />",
					loadConfigErrorDefaultText : "Server Error.",
					xhrTroubleText : "Communication Trouble: Status ",
					layersText : "Katmanlar",
					titleText : "Title",
					saveErrorText : "Trouble saving: ",
					bookmarkText : "Bookmark URL",
					permakinkText : 'Permalink',
					appInfoText : "GeoExplorer",
					aboutText : "About GeoExplorer",
					mapInfoText : "Map Info",
					descriptionText : "Description",
					contactText : "Contact",
					aboutThisMapText : "About this Map",
					mapintializedcomplete : false,
					mapPanel : null,
					toggleGroup : "toolGroup",
					kurumID : "",
					uniMarkerVectorLayer : null,
					constructor : function(config) {
						this.mapItems = [ {
							xtype : "gxp_scaleoverlay"
						}, {
							xtype : "gx_zoomslider",
							vertical : true,
							height : 100,
							plugins : new GeoExt.ZoomSliderTip({
								template : this.zoomSliderText
							})
						} ];
						config.viewerTools = [
								{
									leaf : true,
									text : gxp.plugins.Print.prototype.tooltip,
									ptype : "gxp_print",
									iconCls : "gxp-icon-print",
									customParams : {
										outputFilename : 'GeoExplorer-print'
									},
									printService : config.printService,
									checked : true
								},
								{
									leaf : true,
									text : gxp.plugins.Navigation.prototype.tooltip,
									checked : true,
									iconCls : "gxp-icon-pan",
									ptype : "gxp_navigation",
									toggleGroup : this.toggleGroup
								},
								{
									leaf : true,
									text : gxp.plugins.WMSGetFeatureInfo.prototype.infoActionTip,
									checked : true,
									iconCls : "gxp-icon-getfeatureinfo",
									ptype : "gxp_wmsgetfeatureinfo",
									toggleGroup : this.toggleGroup
								},
								{
									leaf : true,
									text : gxp.plugins.Measure.prototype.measureTooltip,
									checked : true,
									iconCls : "gxp-icon-measure-length",
									ptype : "gxp_measure",
									controlOptions : {
										immediate : true
									},
									toggleGroup : this.toggleGroup
								},
								{
									leaf : true,
									text : gxp.plugins.Zoom.prototype.zoomInTooltip,
									checked : true,
									iconCls : "gxp-icon-zoom-in",
									numberOfButtons : 1,
									ptype : "gxp_zoom"
								},
								{
									leaf : true,
									text : gxp.plugins.NavigationHistory.prototype.previousTooltip
											+ " / "
											+ gxp.plugins.NavigationHistory.prototype.nextTooltip,
									checked : true,
									iconCls : "gxp-icon-zoom-previous",
									numberOfButtons : 2,
									ptype : "gxp_navigationhistory"
								},
								{
									leaf : true,
									text : gxp.plugins.ZoomToExtent.prototype.tooltip,
									checked : true,
									iconCls : gxp.plugins.ZoomToExtent.prototype.iconCls,
									ptype : "gxp_zoomtoextent"
								},
								{
									leaf : true,
									text : gxp.plugins.Legend.prototype.tooltip,
									checked : true,
									iconCls : "gxp-icon-legend",
									ptype : "gxp_legend"
								},
								{
									leaf : true,
									text : gxp.plugins.Featurekazihatti.prototype.tooltip,
									checked : true,
									iconCls : "gxp-icon-addfeature",
									numberOfButtons : 2,
									ptype : "gxp_featurekazihatti"
								},
								{
									leaf : true,
									text : gxp.plugins.GoogleEarth.prototype.tooltip,
									checked : true,
									iconCls : "gxp-icon-googleearth",
									ptype : "gxp_googleearth"
								} ];
						GeoExplorer.superclass.constructor.apply(this,
								arguments);
					},
					loadConfig : function(config) {
						var mapUrl = window.location.hash.substr(1);
						var match = mapUrl.match(/^maps\/(\d+)$/);
						if (match) {
							this.id = Number(match[1]);
							OpenLayers.Request.GET({
								url : mapUrl,
								success : function(request) {
									var addConfig = Ext.util.JSON.decode(request.responseText);
									this.applyConfig(Ext.applyIf(addConfig,config));
								},
								failure : function(request) {
									var obj;
									try {
										obj = Ext.util.JSON.decode(request.responseText);
									} catch (err) {
									}
									var msg = this.loadConfigErrorText;
									if (obj && obj.error) {
										msg += obj.error;
									} else {
										msg += this.loadConfigErrorDefaultText;
									}
									this.on({
										ready : function() {
											this.displayXHRTrouble(msg,request.status);
										},
										scope : this
									});
									delete this.id;
									window.location.hash = "";
									this.applyConfig(config);
								},
								scope : this
							});
						} else {
							var kurumID = this.getKurumID();
							this.kurumID = kurumID;
							if (kurumID != null) {
								this.id = kurumID;
								OpenLayers.Request.GET({
											url : "maps/" + kurumID,
											success : function(request) {
												var addConfig = Ext.util.JSON.decode(request.responseText);
												
						        				var layers = addConfig.map.layers;
						        				for(var i=0;i<layers.length;i++)
						        				{
						        				  var ls_layerType = layers[i].type; 
						        				  if("OpenLayers.Layer.TMS" == ls_layerType)
						        				  {
														addConfig.map.layers[i].args[2] =                            {
									                        	   'type': 'png',
									                        	   'getURL': gxp.plugins.KocaeliGisSorgu.prototype.getUyduTileLayerServiceUrl,
									                        	   'isBaseLayer': true,
									                        	   'tileOrigin': new OpenLayers.LonLat(-5123200, 10002100),
									                        	   'serverResolutions': [105.833545000423, 52.9167725002117, 26.4583862501058, 13.2291931250529, 6.61459656252646, 3.96875793751588, 1.32291931250529, 0.661459656252646, 0.264583862501058, 0.132291931250529]
																};
						        					}
						        				
						        				}

						        			

												this.applyConfig(Ext.applyIf(addConfig, config));
											},
											failure : function(request) {
												var obj;
												try {
													obj = Ext.util.JSON.decode(request.responseText);
												} catch (err) {
												}
												if (request.status == 404) {
													this.on({ready : function() {
																this.save(function() {
																	Ext.Msg.alert('Kurum Kaydedildi','#'+ this.id+ ' Kurum Kaydedildi!')
																},this,"POST");
																}
													});
												}
												this.applyConfig(config);
											},
											scope : this
										});
							} else {
								var query = Ext.urlDecode(document.location.search.substr(1));
								if (query && query.q) {
									var queryConfig = Ext.util.JSON.decode(query.q);
									Ext.apply(config, queryConfig);
								}
								this.applyConfig(config);
							}
						}
					},
					displayXHRTrouble : function(msg, status) {
						Ext.Msg.show({
							title : this.xhrTroubleText + status,
							msg : msg,
							icon : Ext.MessageBox.WARNING
						});
					},
					isInt : function(x) {
						var y = parseInt(x);
						if (isNaN(y))
							return false;
						return x == y && x.toString() == y.toString();
					},
					getKurumID : function() {
						var defaultMap = 1000;
						try {
							var userJobTitle = window.parent.getUserFromLiferay();
							if (userJobTitle.length > 0) {
								defaultMap = userJobTitle;
							}
						} catch (err) {
						}
						return defaultMap;
					},
					getLocationMarkers : function() {
						var markerLocations = window.parent.getMarkerLocations();
						var serverMapExtent = window.parent.getMapExtent();
						uniMarkerVectorLayer = new OpenLayers.Layer.Vector(
								"Yerlerim",
								{
									displayInLayerSwitcher : false,
									visibility : true,
									styleMap : new OpenLayers.StyleMap(
											{
												'default' : {
													pointRadius : 32,
													pointerEvents : "visiblePainted",
													externalGraphic : "http://geoserver.kocaeli.bel.tr:8090/geoserver/data/styles/marker_place.png",
													label : "${order}",
													fontColor : "#000000",
													fontSize : "16px",
													fontFamily : "Courier New, monospace",
													fontWeight : "bold",
													labelAlign : "cm",
													labelXOffset : "0",
													labelYOffset : "0"
												}
											})
								});
						if (markerLocations != null) {
							var lo_tempMarkerArray = markerLocations.split("||");
							for ( var i = 0; i < lo_tempMarkerArray.length; i++) {
								var lo_tempMarker = lo_tempMarkerArray[i];
								var lo_tempCoordinateArray = lo_tempMarker.split(":");
								var point = new OpenLayers.Geometry.Point(lo_tempCoordinateArray[0],lo_tempCoordinateArray[1]);
								point.transform(new OpenLayers.Projection("EPSG:4326"), this.map.projection);
								var pointFeature = new OpenLayers.Feature.Vector(point);
								pointFeature.attributes.order = "";
								if (lo_tempCoordinateArray.length > 2 && lo_tempCoordinateArray[3] != undefined)
									pointFeature.attributes.order = lo_tempCoordinateArray[3];
								uniMarkerVectorLayer.addFeatures([ pointFeature ]);
							}
							this.mapPanel.map.addLayer(uniMarkerVectorLayer);
						}
						if (serverMapExtent != null & serverMapExtent != "") {
							var lo_extent = new OpenLayers.Bounds.fromString(serverMapExtent,this.mapPanel.map.projection);
							this.mapPanel.map.zoomToExtent(lo_extent, true);
						}
					},
					initPortal : function() {
						var westPanel = new Ext.Panel({
							border : false,
							layout : "border",
							region : "west",
							width : 250,
							split : true,
							collapsible : true,
							collapseMode : "mini",
							header : false,
							items : [ {
								region : 'center',
								autoScroll : true,
								tbar : [],
								border : false,
								id : 'tree',
								title : this.layersText
							}, {
								region : 'south',
								xtype : "container",
								layout : "fit",
								border : false,
								height : 200,
								id : 'legend'
							} ]
						});
						this.toolbar = new Ext.Toolbar({
							disabled : true,
							id : 'paneltbar',
							items : this.createTools()
						});
						this.on(		"ready",
										function() {
											var disabled = this.toolbar.items.filterBy(function(item) {
														return item.initialConfig && item.initialConfig.disabled;
													});
											this.toolbar.enable();
											disabled.each(function(item) {
												item.disable();
											});
											westPanel.collapse();
											var mapExtent = this.getCookieValue("extent");
											if (mapExtent != null & mapExtent != "") {
												var lo_extent = new OpenLayers.Bounds.fromString(mapExtent,this.mapPanel.map.projection);
												this.mapPanel.map.zoomToExtent(lo_extent, true);
											}
											this.mapintializedcomplete = true;
										});
						var googleEarthPanel = new gxp.GoogleEarthPanel(
								{
									mapPanel : this.mapPanel,
									listeners : {
										beforeadd : function(record) {
											return record.get("group") !== "background";
										}
									}
								});
						var preGoogleDisabled = [];
						googleEarthPanel.on("show", function() {
							preGoogleDisabled.length = 0;
							this.toolbar.items.each(function(item) {
								if (item.disabled) {
									preGoogleDisabled.push(item);
								}
							});
							this.toolbar.disable();
							for ( var key in this.tools) {
								var tool = this.tools[key];
								if (tool.outputTarget === "map") {
									tool.removeOutput();
								}
							}
							var layersContainer = Ext.getCmp("tree");
							var layersToolbar = layersContainer
									&& layersContainer.getTopToolbar();
							if (layersToolbar) {
								layersToolbar.items.each(function(item) {
									if (item.disabled) {
										preGoogleDisabled.push(item);
									}
								});
								layersToolbar.disable();
							}
						}, this);
						googleEarthPanel.on(
										"hide",
										function() {
											this.toolbar.enable();
											var layersContainer = Ext.getCmp("tree");
											var layersToolbar = layersContainer && layersContainer.getTopToolbar();
											if (layersToolbar) {
												layersToolbar.enable();
											}
											for ( var i = 0, ii = preGoogleDisabled.length; i < ii; ++i) {
												preGoogleDisabled[i].disable();
											}
										}, this);
						this.mapPanelContainer = new Ext.Panel({
							layout : "card",
							region : "center",
							defaults : {
								border : false
							},
							items : [ this.mapPanel, googleEarthPanel ],
							activeItem : 0
						});
						this.portalItems = [ {
							region : "center",
							layout : "border",
							tbar : this.toolbar,
							items : [ this.mapPanelContainer, westPanel ]
						} ];
						GeoExplorer.superclass.initPortal.apply(this, arguments);
					},
					createTools : function() {
						var tools = [ "-" ];
						return tools;
					},
					save : function(callback, scope, method) {
						var configStr = Ext.util.JSON.encode(this.getState());
						//configStr = configStr.replace("\"http://tileservices.kocaeli.bel.tr/uydu/2012/\",{\"type\":\"png\",","\"http://tileservices.kocaeli.bel.tr/uydu/2012/\",{\"type\":\"png\",\"getURL\": gxp.plugins.KocaeliGisSorgu.prototype.getUyduTileLayerServiceUrl,");
						var url;
						url = "maps/" + this.id;
						OpenLayers.Request.issue({
							method : method,
							url : url,
							data : configStr,
							callback : function(request) {
								this.handleSave(request);
								if (callback) {
									callback.call(scope || this);
								}
							},
							scope : this
						});
					},
					handleSave : function(request) {
						if (request.status == 200) {
							var config = Ext.util.JSON.decode(request.responseText);
							var mapId = config.id;
							if (mapId) {
								this.id = mapId;
							}
						} else {
							throw this.saveErrorText + request.responseText;
						}
					},
					showUrl : function() {
						Ext.Msg.alert('Kaydedildi',
								'Harita basariyla kaydedildi!');
					},
					getBookmark : function() {
						var params = Ext.apply(OpenLayers.Util.getParameters(),
								{
									q : Ext.util.JSON.encode(this.getState())
								});
						var url = document.location.href.split("?").shift()
								+ "?" + Ext.urlEncode(params);
						return url;
					},
					displayAppInfo : function() {
						var appInfo = new Ext.Panel(
								{
									title : this.appInfoText,
									html : "<iframe style='border: none; height: 100%; width: 100%' src='about.html' frameborder='0' border='0'><a target='_blank' href='about.html'>"
											+ this.aboutText + "</a> </iframe>"
								});
						var about = Ext.applyIf(this.about, {
							title : '',
							"abstract" : '',
							contact : ''
						});
						var mapInfo = new Ext.Panel(
								{
									title : this.mapInfoText,
									html : '<div class="gx-info-panel">'
											+ '<h2>' + this.titleText
											+ '</h2><p>' + about.title
											+ '</p><h2>' + this.descriptionText
											+ '</h2><p>' + about['abstract']
											+ '</p> <h2>' + this.contactText
											+ '</h2><p>' + about.contact
											+ '</p></div>',
									height : 'auto',
									width : 'auto'
								});
						var tabs = new Ext.TabPanel({
							activeTab : 0,
							items : [ mapInfo, appInfo ]
						});
						var win = new Ext.Window({
							title : this.aboutThisMapText,
							modal : true,
							layout : "fit",
							width : 300,
							height : 300,
							items : [ tabs ]
						});
						win.show();
					}
				});
GeoExplorer.Composer = Ext.extend(GeoExplorer, {
	cookieParamName : 'geoexplorer-user',
	saveMapText : "Haritayı Kaydet",
	exportMapText : "Harita Yayinla",
	toolsTitle : "Haritada goruntulenecek araclari secin:",
	previewText : "Onizleme",
	backText : "Geri",
	nextText : "Ileri",
	loginText : "Giris",
	logoutText : "Çikis, {user}",
	loginErrorText : "Hatali Kullanici adi/sifre.",
	userFieldText : "Kullanici",
	passwordFieldText : "Sifre",
	constructor : function(config) {
		if (config.authStatus === 401) {
			this.authorizedRoles = [];
		} else {
			this.authorizedRoles = [ "ROLE_ADMINISTRATOR" ];
		}
		delete config.authStatus;
		config.tools = [ {
			ptype : "gxp_layertree",
			outputConfig : {
				id : "layertree"
			},
			outputTarget : "tree"
		}, {
			ptype : "gxp_legend",
			outputTarget : 'legend',
			outputConfig : {
				autoScroll : true
			}
		}, {
			ptype : "gxp_addlayers",
			actionTarget : "tree.tbar",
			upload : true
		}, {
			ptype : "gxp_removelayer",
			actionTarget : [ "tree.tbar", "layertree.contextMenu" ]
		}, {
			ptype : "gxp_layerproperties",
			actionTarget : [ "tree.tbar", "layertree.contextMenu" ]
		}, {
			ptype : "gxp_styler",
			actionTarget : [ "tree.tbar", "layertree.contextMenu" ]
		}, {
			ptype : "gxp_zoomtolayerextent",
			actionTarget : {
				target : "layertree.contextMenu",
				index : 0
			}
		}, {
			ptype : "gxp_print",
			customParams : {
				outputFilename : 'GeoExplorer-print'
			},
			printService : config.printService,
			actionTarget : {
				target : "paneltbar",
				index : 2
			}
		}, {
			ptype : "gxp_navigation",
			toggleGroup : this.toggleGroup,
			actionTarget : {
				target : "paneltbar",
				index : 4
			}
		}, {
			ptype : "gxp_zoom",
			toggleGroup : this.toggleGroup,
			actionTarget : {
				target : "paneltbar",
				index : 5
			}
		}, {
			ptype : "gxp_navigationhistory",
			actionTarget : {
				target : "paneltbar",
				index : 6
			}
		}, {
			ptype : "gxp_zoomtoextent",
			actionTarget : {
				target : "paneltbar",
				index : 9
			}
		}, {
			ptype : "gxp_measure",
			toggleGroup : this.toggleGroup,
			controlOptions : {
				immediate : true
			},
			actionTarget : {
				target : "paneltbar",
				index : 10
			}
		}, {
			ptype : "gxp_wmsgetfeatureinfo",
			toggleGroup : this.toggleGroup,
			actionTarget : {
				target : "paneltbar",
				index : 12
			}
		}, {
			ptype : "gxp_featurekazihatti",
			wfsURL : config.wfsURL,
			toggleGroup : this.toggleGroup,
			actionTarget : {
				target : "paneltbar",
				index : 13
			}
		}, {
			ptype : "gxp_kocaeligissorgu",
			toggleGroup : this.toggleGroup,
			actionTarget : {
				target : "paneltbar",
				index : 17
			}
		}, {
			ptype : "gxp_flexcityadresal",
			toggleGroup : this.toggleGroup,
			actionTarget : {
				target : "paneltbar",
				index : 18
			}
		}, {
			ptype : "gxp_flexcitycurrentlocation",
			toggleGroup : this.toggleGroup,
			actionTarget : {
				target : "paneltbar",
				index : 19
			}
		}, {
			ptype : "gxp_flexcitylegendtool",
			toggleGroup : this.toggleGroup,
			actionTarget : {
				target : "paneltbar",
				index : 20
			}
		}, {
			ptype : "gxp_playback",
			controlOptions : {
				units : OpenLayers.TimeUnit.DAYS,
				step : 10
			},
			outputConfig : {
				dynamicRange : false
			}
		} ];
		GeoExplorer.Composer.superclass.constructor.apply(this, arguments);
	},
	destroy : function() {
		this.loginButton = null;
		GeoExplorer.Composer.superclass.destroy.apply(this, arguments);
	},
	setCookieValue : function(param, value) {
		document.cookie = param + '=' + escape(value);
	},
	clearCookieValue : function(param) {
		document.cookie = param + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
	},
	getCookieValue : function(param) {
		var i, x, y, cookies = document.cookie.split(";");
		for (i = 0; i < cookies.length; i++) {
			x = cookies[i].substr(0, cookies[i].indexOf("="));
			y = cookies[i].substr(cookies[i].indexOf("=") + 1);
			x = x.replace(/^\s+|\s+$/g, "");
			if (x == param) {
				return unescape(y);
			}
		}
		return null;
	},
	logout : function() {
		this.clearCookieValue("JSESSIONID");
		this.clearCookieValue(this.cookieParamName);
		this.authorizedRoles = [];
		this.fireEvent("loginchanged");
		this.showLogin();
	},
	showLoginDialog : function() {
		var panel = new Ext.FormPanel({
			url : "login",
			frame : true,
			labelWidth : 60,
			defaultType : "textfield",
			errorReader : {
				read : function(response) {
					var success = false;
					var records = [];
					if (response.status === 200) {
						success = true;
					} else {
						records = [ {
							data : {
								id : "username",
								msg : this.loginErrorText
							}
						}, {
							data : {
								id : "password",
								msg : this.loginErrorText
							}
						} ];
					}
					return {
						success : success,
						records : records
					};
				}
			},
			items : [ {
				fieldLabel : this.userFieldText,
				name : "username",
				allowBlank : false
			}, {
				fieldLabel : this.passwordFieldText,
				name : "password",
				inputType : "password",
				allowBlank : false
			} ],
			buttons : [ {
				text : this.loginText,
				formBind : true,
				handler : submitLogin,
				scope : this
			} ],
			keys : [ {
				key : [ Ext.EventObject.ENTER ],
				handler : submitLogin,
				scope : this
			} ]
		});
		function submitLogin() {
			panel.buttons[0].disable();
			panel.getForm().submit({
				success : function(form, action) {
					this.authorizedRoles = [ "ROLE_ADMINISTRATOR" ];
					this.fireEvent("loginchanged");
					Ext.getCmp('paneltbar').items.each(function(tool) {
						if (tool.needsAuthorization === true) {
							tool.enable();
						}
					});
					var user = form.findField('username').getValue();
					this.setCookieValue(this.cookieParamName, user);
					this.showLogout(user);
					win.close();
				},
				failure : function(form, action) {
					this.authorizedRoles = [];
					panel.buttons[0].enable();
					form.markInvalid({
						"username" : this.loginErrorText,
						"password" : this.loginErrorText
					});
				},
				scope : this
			});
		}
		var win = new Ext.Window({
			title : this.loginText,
			layout : "fit",
			width : 235,
			height : 130,
			plain : true,
			border : false,
			modal : true,
			items : [ panel ]
		});
		win.show();
	},
	createTools : function() {
		var tools = GeoExplorer.Composer.superclass.createTools.apply(this,
				arguments);
		tools.unshift("-");
		tools.unshift(new Ext.Button({
			tooltip : this.saveMapText,
			needsAuthorization : true,
			disabled : !this.isAuthorized(),
			handler : function() {
				this.save(function() {
					Ext.Msg.alert('Kurum Kaydedildi', '#' + this.id
							+ ' Kurum Kaydedildi!')
				}, this, "PUT");
			},
			scope : this,
			iconCls : "icon-save"
		}));
		tools.push("-");
		tools.push("-");
		return tools;
	},
	openPreview : function(embedMap) {
		var preview = new Ext.Window({
			title : this.previewText,
			layout : "fit",
			items : [ {
				border : false,
				html : embedMap.getIframeHTML()
			} ]
		});
		preview.show();
		var body = preview.items.get(0).body;
		var iframe = body.dom.firstChild;
		var loading = new Ext.LoadMask(body);
		loading.show();
		Ext.get(iframe).on('load', function() {
			loading.hide();
		});
	},
	showEmbedWindow : function() {
		var toolsArea = new Ext.tree.TreePanel({
			title : this.toolsTitle,
			autoScroll : true,
			root : {
				nodeType : 'async',
				expanded : true,
				children : this.viewerTools
			},
			rootVisible : false,
			id : 'geobuilder-0'
		});
		var previousNext = function(incr) {
			var l = Ext.getCmp('geobuilder-wizard-panel').getLayout();
			var i = l.activeItem.id.split('geobuilder-')[1];
			var next = parseInt(i, 10) + incr;
			l.setActiveItem(next);
			Ext.getCmp('wizard-prev').setDisabled(next == 0);
			Ext.getCmp('wizard-next').setDisabled(next == 1);
			if (incr == 1) {
				this.save();
			}
		};
		var embedMap = new gxp.EmbedMapDialog({
			id : 'geobuilder-1',
			url : "viewer" + "#maps/" + this.id
		});
		var wizard = {
			id : 'geobuilder-wizard-panel',
			border : false,
			layout : 'card',
			activeItem : 0,
			defaults : {
				border : false,
				hideMode : 'offsets'
			},
			bbar : [
					{
						id : 'preview',
						text : this.previewText,
						handler : function() {
							this.save(this.openPreview.createDelegate(this,
									[ embedMap ]));
						},
						scope : this
					}, '->', {
						id : 'wizard-prev',
						text : this.backText,
						handler : previousNext.createDelegate(this, [ -1 ]),
						scope : this,
						disabled : true
					}, {
						id : 'wizard-next',
						text : this.nextText,
						handler : previousNext.createDelegate(this, [ 1 ]),
						scope : this
					} ],
			items : [ toolsArea, embedMap ]
		};
		new Ext.Window({
			layout : 'fit',
			width : 500,
			height : 300,
			title : this.exportMapText,
			items : [ wizard ]
		}).show();
	}
});