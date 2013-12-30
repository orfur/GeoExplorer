Ext.namespace("gxp");
gxp.util = {
	_uniqueNames : {},
	getOGCExceptionText : function(report) {
		var msg;
		if (report && report.exceptions) {
			msg = [];
			Ext.each(report.exceptions, function(obj) {
				Ext.each(obj.texts, function(text) {
					msg.push(text);
				});
			});
			msg = msg.join("\n");
		} else {
			msg = "Unknown error (no exception report).";
		}
		return msg;
	},
	dispatch : function(functions, complete, scope) {
		complete = complete || Ext.emptyFn;
		scope = scope || this;
		var requests = functions.length;
		var responses = 0;
		var storage = {};
		function respond() {
			++responses;
			if (responses === requests) {
				complete.call(scope, storage);
			}
		}
		function trigger(index) {
			window.setTimeout(function() {
				functions[index].apply(scope, [ respond, storage ]);
			});
		}
		for ( var i = 0; i < requests; ++i) {
			trigger(i);
		}
	},
	uniqueName : function(name, delimiter) {
		delimiter = delimiter || " ";
		var regEx = new RegExp(delimiter + "[0-9]*$");
		var key = name.replace(regEx, "");
		var regExResult = regEx.exec(name);
		var count = this._uniqueNames[key] !== undefined ? this._uniqueNames[key]
				: (regExResult instanceof Array ? Number(regExResult[0])
						: undefined);
		var newName = key;
		if (count !== undefined) {
			count++;
			newName += delimiter + count;
		}
		this._uniqueNames[key] = count || 0;
		return newName;
	},
	getAbsoluteUrl : function(url) {
		var a;
		if (Ext.isIE6 || Ext.isIE7 || Ext.isIE8) {
			a = document.createElement("<a href='" + url + "'/>");
			a.style.display = "none";
			document.body.appendChild(a);
			a.href = a.href;
			document.body.removeChild(a);
		} else {
			a = document.createElement("a");
			a.href = url;
		}
		return a.href;
	},
	md5 : (function() {
		var MD5_T = [ 0x00000000, 0xd76aa478, 0xe8c7b756, 0x242070db,
				0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
				0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122,
				0xfd987193, 0xa679438e, 0x49b40821, 0xf61e2562, 0xc040b340,
				0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681,
				0xe7d3fbc8, 0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
				0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a, 0xfffa3942,
				0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9,
				0xf6bb4b60, 0xbebfbc70, 0x289b7ec6, 0xeaa127fa, 0xd4ef3085,
				0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
				0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3,
				0x8f0ccc92, 0xffeff47d, 0x85845dd1, 0x6fa87e4f, 0xfe2ce6e0,
				0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb,
				0xeb86d391 ];
		var MD5_round1 = [ [ 0, 7, 1 ], [ 1, 12, 2 ], [ 2, 17, 3 ],
				[ 3, 22, 4 ], [ 4, 7, 5 ], [ 5, 12, 6 ], [ 6, 17, 7 ],
				[ 7, 22, 8 ], [ 8, 7, 9 ], [ 9, 12, 10 ], [ 10, 17, 11 ],
				[ 11, 22, 12 ], [ 12, 7, 13 ], [ 13, 12, 14 ], [ 14, 17, 15 ],
				[ 15, 22, 16 ] ];
		var MD5_round2 = [ [ 1, 5, 17 ], [ 6, 9, 18 ], [ 11, 14, 19 ],
				[ 0, 20, 20 ], [ 5, 5, 21 ], [ 10, 9, 22 ], [ 15, 14, 23 ],
				[ 4, 20, 24 ], [ 9, 5, 25 ], [ 14, 9, 26 ], [ 3, 14, 27 ],
				[ 8, 20, 28 ], [ 13, 5, 29 ], [ 2, 9, 30 ], [ 7, 14, 31 ],
				[ 12, 20, 32 ] ];
		var MD5_round3 = [ [ 5, 4, 33 ], [ 8, 11, 34 ], [ 11, 16, 35 ],
				[ 14, 23, 36 ], [ 1, 4, 37 ], [ 4, 11, 38 ], [ 7, 16, 39 ],
				[ 10, 23, 40 ], [ 13, 4, 41 ], [ 0, 11, 42 ], [ 3, 16, 43 ],
				[ 6, 23, 44 ], [ 9, 4, 45 ], [ 12, 11, 46 ], [ 15, 16, 47 ],
				[ 2, 23, 48 ] ];
		var MD5_round4 = [ [ 0, 6, 49 ], [ 7, 10, 50 ], [ 14, 15, 51 ],
				[ 5, 21, 52 ], [ 12, 6, 53 ], [ 3, 10, 54 ], [ 10, 15, 55 ],
				[ 1, 21, 56 ], [ 8, 6, 57 ], [ 15, 10, 58 ], [ 6, 15, 59 ],
				[ 13, 21, 60 ], [ 4, 6, 61 ], [ 11, 10, 62 ], [ 2, 15, 63 ],
				[ 9, 21, 64 ] ];
		function MD5_F(x, y, z) {
			return (x & y) | (~x & z);
		}
		function MD5_G(x, y, z) {
			return (x & z) | (y & ~z);
		}
		function MD5_H(x, y, z) {
			return x ^ y ^ z;
		}
		function MD5_I(x, y, z) {
			return y ^ (x | ~z);
		}
		var MD5_round = [ [ MD5_F, MD5_round1 ], [ MD5_G, MD5_round2 ],
				[ MD5_H, MD5_round3 ], [ MD5_I, MD5_round4 ] ];
		function MD5_pack(n32) {
			return String.fromCharCode(n32 & 0xff)
					+ String.fromCharCode((n32 >>> 8) & 0xff)
					+ String.fromCharCode((n32 >>> 16) & 0xff)
					+ String.fromCharCode((n32 >>> 24) & 0xff);
		}
		function MD5_unpack(s4) {
			return s4.charCodeAt(0) | (s4.charCodeAt(1) << 8)
					| (s4.charCodeAt(2) << 16) | (s4.charCodeAt(3) << 24);
		}
		function MD5_number(n) {
			while (n < 0) {
				n += 4294967296;
			}
			while (n > 4294967295) {
				n -= 4294967296;
			}
			return n;
		}
		function MD5_apply_round(x, s, f, abcd, r) {
			var a, b, c, d;
			var kk, ss, ii;
			var t, u;
			a = abcd[0];
			b = abcd[1];
			c = abcd[2];
			d = abcd[3];
			kk = r[0];
			ss = r[1];
			ii = r[2];
			u = f(s[b], s[c], s[d]);
			t = s[a] + u + x[kk] + MD5_T[ii];
			t = MD5_number(t);
			t = ((t << ss) | (t >>> (32 - ss)));
			t += s[b];
			s[a] = MD5_number(t);
		}
		function MD5_hash(data) {
			var abcd, x, state, s;
			var len, index, padLen, f, r;
			var i, j, k;
			var tmp;
			state = [ 0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476 ];
			len = data.length;
			index = len & 0x3f;
			padLen = (index < 56) ? (56 - index) : (120 - index);
			if (padLen > 0) {
				data += "\x80";
				for (i = 0; i < padLen - 1; i++) {
					data += "\x00";
				}
			}
			data += MD5_pack(len * 8);
			data += MD5_pack(0);
			len += padLen + 8;
			abcd = [ 0, 1, 2, 3 ];
			x = [ 16 ];
			s = [ 4 ];
			for (k = 0; k < len; k += 64) {
				for (i = 0, j = k; i < 16; i++, j += 4) {
					x[i] = data.charCodeAt(j) | (data.charCodeAt(j + 1) << 8)
							| (data.charCodeAt(j + 2) << 16)
							| (data.charCodeAt(j + 3) << 24);
				}
				for (i = 0; i < 4; i++) {
					s[i] = state[i];
				}
				for (i = 0; i < 4; i++) {
					f = MD5_round[i][0];
					r = MD5_round[i][1];
					for (j = 0; j < 16; j++) {
						MD5_apply_round(x, s, f, abcd, r[j]);
						tmp = abcd[0];
						abcd[0] = abcd[3];
						abcd[3] = abcd[2];
						abcd[2] = abcd[1];
						abcd[1] = tmp;
					}
				}
				for (i = 0; i < 4; i++) {
					state[i] += s[i];
					state[i] = MD5_number(state[i]);
				}
			}
			return MD5_pack(state[0]) + MD5_pack(state[1]) + MD5_pack(state[2])
					+ MD5_pack(state[3]);
		}
		function MD5_hexhash(data) {
			var i, out, c;
			var bit128;
			bit128 = MD5_hash(data);
			out = "";
			for (i = 0; i < 16; i++) {
				c = bit128.charCodeAt(i);
				out += "0123456789abcdef".charAt((c >> 4) & 0xf);
				out += "0123456789abcdef".charAt(c & 0xf);
			}
			return out;
		}
		return function(data) {
			return MD5_hexhash(data);
		};
	})()
};
Ext.namespace("gxp.menu");
gxp.menu.LayerMenu = Ext.extend(Ext.menu.Menu, {
	layerText : "Layer",
	layers : null,
	initComponent : function() {
		gxp.menu.LayerMenu.superclass.initComponent.apply(this, arguments);
		this.layers.on("add", this.onLayerAdd, this);
		this.onLayerAdd();
	},
	onRender : function(ct, position) {
		gxp.menu.LayerMenu.superclass.onRender.apply(this, arguments);
	},
	beforeDestroy : function() {
		if (this.layers && this.layers.on) {
			this.layers.un("add", this.onLayerAdd, this);
		}
		delete this.layers;
		gxp.menu.LayerMenu.superclass.beforeDestroy.apply(this, arguments);
	},
	onLayerAdd : function() {
		this.removeAll();
		this.add({
			iconCls : "gxp-layer-visibility",
			text : this.layerText,
			canActivate : false
		}, "-");
		this.layers.each(function(record) {
			var layer = record.getLayer();
			if (layer.displayInLayerSwitcher) {
				var item = new Ext.menu.CheckItem({
					text : record.get("title"),
					checked : record.getLayer().getVisibility(),
					group : record.get("group"),
					listeners : {
						checkchange : function(item, checked) {
							record.getLayer().setVisibility(checked);
						}
					}
				});
				if (this.items.getCount() > 2) {
					this.insert(2, item);
				} else {
					this.add(item);
				}
			}
		}, this);
	}
});
Ext.reg('gxp_layermenu', gxp.menu.LayerMenu);
Ext.namespace("gxp");
gxp.LayerUploadPanel = Ext
		.extend(
				Ext.FormPanel,
				{
					titleLabel : "Title",
					titleEmptyText : "Layer title",
					abstractLabel : "Description",
					abstractEmptyText : "Layer description",
					fileLabel : "Data",
					fieldEmptyText : "Browse for data archive...",
					uploadText : "Upload",
					waitMsgText : "Uploading your data...",
					invalidFileExtensionText : "File extension must be one of: ",
					optionsText : "Options",
					workspaceLabel : "Workspace",
					workspaceEmptyText : "Default workspace",
					dataStoreLabel : "Store",
					dataStoreEmptyText : "Default datastore",
					crsLabel : "CRS",
					crsEmptyText : "Coordinate Reference System ID",
					invalidCrsText : "CRS identifier should be an EPSG code (e.g. EPSG:4326)",
					fileUpload : true,
					validFileExtensions : [ ".zip", ".tif", ".gz", ".tar.bz2",
							".tar", ".tgz", ".tbz2" ],
					constructor : function(config) {
						config.errorReader = {
							read : config.handleUploadResponse
									|| this.handleUploadResponse
											.createDelegate(this)
						};
						gxp.LayerUploadPanel.superclass.constructor.call(this,
								config);
					},
					selectedWorkspace : null,
					initComponent : function() {
						this.items = [
								{
									xtype : "textfield",
									name : "title",
									fieldLabel : this.titleLabel,
									emptyText : this.titleEmptyText,
									allowBlank : true
								},
								{
									xtype : "textarea",
									name : "abstract",
									fieldLabel : this.abstractLabel,
									emptyText : this.abstractEmptyText,
									allowBlank : true
								},
								{
									xtype : "fileuploadfield",
									id : "file",
									emptyText : this.fieldEmptyText,
									fieldLabel : this.fileLabel,
									name : "file",
									buttonText : "",
									buttonCfg : {
										iconCls : "gxp-icon-filebrowse"
									},
									validator : this.fileNameValidator
											.createDelegate(this)
								},
								{
									xtype : "fieldset",
									title : this.optionsText,
									checkboxToggle : true,
									collapsed : true,
									hidden : this.workspace != undefined
											&& this.store != undefined
											&& this.crs != undefined,
									hideMode : "offsets",
									defaults : {
										anchor : "97%"
									},
									items : [ this.createWorkspacesCombo(),
											this.createDataStoresCombo(), {
												xtype : "textfield",
												name : "crs",
												fieldLabel : this.crsLabel,
												emptyText : this.crsEmptyText,
												allowBlank : true,
												regex : /^epsg:\d+$/i,
												regexText : this.invalidCrsText
											} ],
									listeners : {
										collapse : function(fieldset) {
											fieldset.items.each(function(item) {
												item.reset();
											});
										}
									}
								} ];
						this.buttons = [ {
							text : this.uploadText,
							handler : function() {
								var form = this.getForm();
								if (form.isValid()) {
									form.submit({
										url : this.getUploadUrl(),
										submitEmptyText : false,
										waitMsg : this.waitMsgText,
										waitMsgTarget : true,
										reset : true,
										success : this.handleUploadSuccess,
										scope : this
									});
								}
							},
							scope : this
						} ];
						this.addEvents("workspaceselected",
								"datastoreselected", "uploadcomplete");
						gxp.LayerUploadPanel.superclass.initComponent
								.call(this);
					},
					fileNameValidator : function(name) {
						var valid = false;
						var ext, len = name.length;
						for ( var i = 0, ii = this.validFileExtensions.length; i < ii; ++i) {
							ext = this.validFileExtensions[i];
							if (name.slice(-ext.length).toLowerCase() === ext) {
								valid = true;
								break;
							}
						}
						return valid || this.invalidFileExtensionText
								+ this.validFileExtensions.join(", ");
					},
					createWorkspacesCombo : function() {
						return {
							xtype : "combo",
							name : "workspace",
							fieldLabel : this.workspaceLabel,
							emptyText : this.workspaceEmptyText,
							store : new Ext.data.JsonStore({
								url : this.getWorkspacesUrl(),
								autoLoad : true,
								root : "workspaces.workspace",
								fields : [ "name", "href" ]
							}),
							displayField : "name",
							valueField : "name",
							mode : "local",
							allowBlank : true,
							triggerAction : "all",
							editable : false,
							listeners : {
								select : function(combo, record, index) {
									this.fireEvent("workspaceselected", this,
											record);
								},
								scope : this
							}
						};
					},
					createDataStoresCombo : function() {
						var store = new Ext.data.JsonStore({
							autoLoad : false,
							root : "dataStores.dataStore",
							fields : [ "name", "href" ]
						});
						this.on({
							workspaceselected : function(panel, record) {
								combo.reset();
								var workspaceUrl = record.get("href");
								store.removeAll();
								store.proxy = new Ext.data.HttpProxy({
									url : workspaceUrl.split(".json").shift()
											+ "/datastores.json"
								});
								store.load();
							},
							scope : this
						});
						var combo = new Ext.form.ComboBox({
							name : "store",
							fieldLabel : this.dataStoreLabel,
							emptyText : this.dataStoreEmptyText,
							store : store,
							displayField : "name",
							valueField : "name",
							mode : "local",
							allowBlank : true,
							triggerAction : "all",
							editable : false,
							listeners : {
								select : function(combo, record, index) {
									this.fireEvent("datastoreselected", this,
											record);
								},
								scope : this
							}
						});
						return combo;
					},
					getUploadUrl : function() {
						return this.url + "/upload";
					},
					getWorkspacesUrl : function() {
						return this.url + "/workspaces.json";
					},
					handleUploadResponse : function(response) {
						var obj = this.parseResponseText(response.responseText);
						var success = obj && obj.success;
						var records = [];
						if (!success) {
							records = [ {
								data : {
									id : "file",
									msg : obj.message
								}
							} ];
						}
						return {
							success : success,
							records : records
						};
					},
					parseResponseText : function(text) {
						var obj;
						try {
							obj = Ext.decode(text);
						} catch (err) {
							var match = text.match(/^\s*<pre>(.*)<\/pre>\s*/);
							if (match) {
								try {
									obj = Ext.decode(match[1]);
								} catch (err) {
								}
							}
						}
						return obj;
					},
					handleUploadSuccess : function(form, action) {
						var details = this
								.parseResponseText(action.response.responseText);
						this.fireEvent("uploadcomplete", this, details);
					}
				});
Ext.reg("gxp_layeruploadpanel", gxp.LayerUploadPanel);
Ext.namespace("gxp");
gxp.WMSLayerPanel = Ext
		.extend(
				Ext.TabPanel,
				{
					layerRecord : null,
					source : null,
					styling : true,
					sameOriginStyling : true,
					rasterStyling : false,
					transparent : null,
					editableStyles : false,
					activeTab : 0,
					border : false,
					imageFormats : /png|gif|jpe?g/i,
					aboutText : "Hakkında",
					titleText : "Başlık",
					nameText : "İsim",
					descriptionText : "Açıklama",
					displayText : "Görünüm",
					opacityText : "Görünürlük",
					formatText : "Format",
					infoFormatText : "Bilgi Formatı",
					infoFormatEmptyText : "Bir Format Seçin",
					transparentText : "Saydamlık",
					cacheText : "Ön Bellek",
					cacheFieldText : "Ön Bellekteki Versiyonu Kullan",
					stylesText : "Semboller",
					initComponent : function() {
						this.addEvents("change");
						this.items = [ this.createAboutPanel(),
								this.createDisplayPanel() ];
						if (this.layerRecord.get("layer").params.TILED != null) {
							this.items.push(this.createCachePanel());
						}
						if (this.styling && gxp.WMSStylesDialog
								&& this.layerRecord.get("styles")) {
							var url = this.layerRecord.get("restUrl");
							if (!url) {
								url = (this.source || this.layerRecord
										.get("layer")).url.split("?").shift()
										.replace(/\/(wms|ows)\/?$/, "/rest");
							}
							if (this.sameOriginStyling) {
								this.editableStyles = url.charAt(0) === "/";
							} else {
								this.editableStyles = true;
							}
							this.items.push(this.createStylesPanel(url));
						}
						gxp.WMSLayerPanel.superclass.initComponent.call(this);
					},
					createCachePanel : function() {
						return {
							title : this.cacheText,
							layout : "form",
							style : "padding: 10px",
							items : [ {
								xtype : "checkbox",
								fieldLabel : this.cacheFieldText,
								checked : (this.layerRecord.get("layer").params.TILED === true),
								listeners : {
									check : function(checkbox, checked) {
										var layer = this.layerRecord
												.get("layer");
										layer.mergeNewParams({
											TILED : checked
										});
										this.fireEvent("change");
									},
									scope : this
								}
							} ]
						};
					},
					createStylesPanel : function(url) {
						var config = gxp.WMSStylesDialog
								.createGeoServerStylerConfig(this.layerRecord,
										url);
						if (this.rasterStyling === true) {
							config.plugins.push({
								ptype : "gxp_wmsrasterstylesdialog"
							});
						}
						return Ext
								.apply(
										config,
										{
											title : this.stylesText,
											style : "padding: 10px",
											editable : false,
											listeners : Ext
													.apply(
															config.listeners,
															{
																"beforerender" : {
																	fn : function(
																			cmp) {
																		var render = !this.editableStyles;
																		if (!render) {
																			if (typeof this.authorized == 'boolean') {
																				cmp.editable = this.authorized;
																				cmp.ownerCt
																						.doLayout();
																			} else {
																				Ext.Ajax
																						.request({
																							method : "PUT",
																							url : url
																									+ "/styles",
																							callback : function(
																									options,
																									success,
																									response) {
																								cmp.editable = (response.status == 405);
																								cmp.ownerCt
																										.doLayout();
																							}
																						});
																			}
																		}
																		return render;
																	},
																	scope : this,
																	single : true
																}
															})
										});
					},
					createAboutPanel : function() {
						return {
							title : this.aboutText,
							style : {
								"padding" : "10px"
							},
							defaults : {
								border : false
							},
							items : [
									{
										layout : "form",
										labelWidth : 70,
										items : [
												{
													xtype : "textfield",
													fieldLabel : this.titleText,
													anchor : "99%",
													value : this.layerRecord
															.get("title"),
													listeners : {
														change : function(field) {
															this.layerRecord
																	.set(
																			"title",
																			field
																					.getValue());
															this.layerRecord
																	.commit();
															this
																	.fireEvent("change");
														},
														scope : this
													}
												},
												{
													xtype : "textfield",
													fieldLabel : this.nameText,
													anchor : "99%",
													value : this.layerRecord
															.get("name"),
													readOnly : true
												} ]
									},
									{
										layout : "form",
										labelAlign : "top",
										items : [ {
											xtype : "textarea",
											fieldLabel : this.descriptionText,
											grow : true,
											growMax : 150,
											anchor : "99%",
											value : this.layerRecord
													.get("abstract"),
											readOnly : true
										} ]
									} ]
						};
					},
					createDisplayPanel : function() {
						var record = this.layerRecord;
						var layer = record.getLayer();
						var opacity = layer.opacity;
						if (opacity == null) {
							opacity = 1;
						}
						var formats = [];
						var currentFormat = layer.params["FORMAT"]
								.toLowerCase();
						Ext.each(record.get("formats"), function(format) {
							if (this.imageFormats.test(format)) {
								formats.push(format.toLowerCase());
							}
						}, this);
						if (formats.indexOf(currentFormat) === -1) {
							formats.push(currentFormat);
						}
						var transparent = layer.params["TRANSPARENT"];
						transparent = (transparent === "true" || transparent === true);
						return {
							title : this.displayText,
							style : {
								"padding" : "10px"
							},
							layout : "form",
							labelWidth : 70,
							items : [
									{
										xtype : "slider",
										name : "opacity",
										fieldLabel : this.opacityText,
										value : opacity * 100,
										values : [ opacity * 100 ],
										anchor : "99%",
										isFormField : true,
										listeners : {
											change : function(slider, value) {
												layer.setOpacity(value / 100);
												this.fireEvent("change");
											},
											scope : this
										}
									},
									{
										xtype : "combo",
										fieldLabel : this.formatText,
										store : formats,
										value : currentFormat,
										mode : "local",
										triggerAction : "all",
										editable : false,
										anchor : "99%",
										listeners : {
											select : function(combo) {
												var format = combo.getValue();
												layer.mergeNewParams({
													format : format
												});
												if (format == "image/jpeg") {
													this.transparent = Ext
															.getCmp(
																	'transparent')
															.getValue();
													Ext.getCmp('transparent')
															.setValue(false);
												} else if (this.transparent !== null) {
													Ext
															.getCmp(
																	'transparent')
															.setValue(
																	this.transparent);
													this.transparent = null;
												}
												Ext
														.getCmp('transparent')
														.setDisabled(
																format == "image/jpeg");
												this.fireEvent("change");
											},
											scope : this
										}
									},
									{
										xtype : "combo",
										fieldLabel : this.infoFormatText,
										emptyText : this.infoFormatEmptyText,
										store : record.get("infoFormats"),
										value : record.get("infoFormat"),
										hidden : (record.get("infoFormats") === undefined),
										mode : 'local',
										triggerAction : "all",
										editable : false,
										anchor : "99%",
										listeners : {
											select : function(combo) {
												var infoFormat = combo
														.getValue();
												record.set("infoFormat",
														infoFormat);
												this.fireEvent("change");
											}
										},
										scope : this
									},
									{
										xtype : "checkbox",
										id : 'transparent',
										fieldLabel : this.transparentText,
										checked : transparent,
										listeners : {
											check : function(checkbox, checked) {
												layer
														.mergeNewParams({
															transparent : checked ? "true"
																	: "false"
														});
												this.fireEvent("change");
											},
											scope : this
										}
									} ]
						};
					}
				});
Ext.reg('gxp_wmslayerpanel', gxp.WMSLayerPanel);
Ext.namespace("gxp");
gxp.GoogleEarthPanel = Ext.extend(Ext.Panel, {
	HORIZONTAL_FIELD_OF_VIEW : (30 * Math.PI) / 180,
	map : null,
	mapPanel : null,
	layers : null,
	earth : null,
	projection : null,
	layerCache : null,
	initComponent : function() {
		this.addEvents("beforeadd", "pluginfailure");
		gxp.GoogleEarthPanel.superclass.initComponent.call(this);
		var mapPanel = this.mapPanel;
		if (mapPanel && !(mapPanel instanceof GeoExt.MapPanel)) {
			mapPanel = Ext.getCmp(mapPanel);
		}
		if (!mapPanel) {
			throw new Error("Could not get map panel from config: "
					+ this.mapPanel);
		}
		this.map = mapPanel.map;
		this.layers = mapPanel.layers;
		this.projection = new OpenLayers.Projection("EPSG:4326");
		function render() {
			if (this.rendered) {
				this.layerCache = {};
				google.earth.createInstance(this.body.dom, this.onEarthReady
						.createDelegate(this), (function(code) {
					this.fireEvent("pluginfailure", this, code);
				}).createDelegate(this));
			}
		}
		;
		this.on("show", render, this);
		this.on("hide", function() {
			if (this.earth != null) {
				this.updateMap();
			}
			this.body.dom.innerHTML = "";
			this.earth = null;
		}, this);
	},
	onEarthReady : function(object) {
		this.earth = object;
		this.earth.getOptions().setFlyToSpeed(this.earth.SPEED_TELEPORT);
		this.resetCamera();
		this.setExtent(this.map.getExtent());
		this.earth.getNavigationControl().setVisibility(
				this.earth.VISIBILITY_SHOW);
		var screenXY = this.earth.getNavigationControl().getScreenXY();
		screenXY.setXUnits(this.earth.UNITS_PIXELS);
		screenXY.setYUnits(this.earth.UNITS_INSET_PIXELS);
		this.earth.getWindow().setVisibility(true);
		this.layers.each(function(record) {
			this.addLayer(record);
		}, this);
		this.layers.on("remove", this.updateLayers, this);
		this.layers.on("update", this.updateLayers, this);
		this.layers.on("add", this.updateLayers, this);
	},
	updateLayers : function() {
		if (!this.earth)
			return;
		var features = this.earth.getFeatures();
		var f = features.getFirstChild();
		while (f != null) {
			features.removeChild(f);
			f = features.getFirstChild();
		}
		this.layers.each(function(record) {
			this.addLayer(record);
		}, this);
	},
	addLayer : function(layer, order) {
		var lyr = layer.getLayer();
		var ows = (lyr && lyr.url);
		if (this.earth && lyr instanceof OpenLayers.Layer.WMS
				&& typeof ows == "string") {
			var add = this.fireEvent("beforeadd", layer);
			if (add !== false) {
				var name = lyr.id;
				var networkLink;
				if (this.layerCache[name]) {
					networkLink = this.layerCache[name];
				} else {
					var link = this.earth.createLink('kl_' + name);
					ows = ows.replace(/\?.*/, '');
					var params = lyr.params;
					var kmlPath = '/kml?mode=refresh&layers=' + params.LAYERS
							+ "&styles=" + params.STYLES;
					link.setHref(ows + kmlPath);
					networkLink = this.earth.createNetworkLink('nl_' + name);
					networkLink.setName(name);
					networkLink.set(link, false, false);
					this.layerCache[name] = networkLink;
				}
				networkLink.setVisibility(lyr.getVisibility());
				if (order !== undefined
						&& order < this.earth.getFeatures().getChildNodes()
								.getLength()) {
					this.earth.getFeatures().insertBefore(
							this.earth.getFeatures().getChildNodes()
									.item(order));
				} else {
					this.earth.getFeatures().appendChild(networkLink);
				}
			}
		}
	},
	setExtent : function(extent) {
		extent = extent.transform(this.map.getProjectionObject(),
				this.projection);
		var center = extent.getCenterLonLat();
		var width = this.getExtentWidth(extent);
		var height = width / (2 * Math.tan(this.HORIZONTAL_FIELD_OF_VIEW));
		var lookAt = this.earth.getView().copyAsLookAt(
				this.earth.ALTITUDE_RELATIVE_TO_GROUND);
		lookAt.setLatitude(center.lat);
		lookAt.setLongitude(center.lon);
		lookAt.setRange(height);
		this.earth.getView().setAbstractView(lookAt);
	},
	resetCamera : function() {
		var camera = this.earth.getView().copyAsCamera(
				this.earth.ALTITUDE_RELATIVE_TO_GROUND);
		camera.setRoll(0);
		camera.setHeading(0);
		camera.setTilt(0);
		this.earth.getView().setAbstractView(camera);
	},
	getExtent : function() {
		var geBounds = this.earth.getView().getViewportGlobeBounds();
		var olBounds = new OpenLayers.Bounds(geBounds.getWest(), geBounds
				.getSouth(), geBounds.getEast(), geBounds.getNorth());
		return olBounds;
	},
	updateMap : function() {
		var lookAt = this.earth.getView().copyAsLookAt(
				this.earth.ALTITUDE_RELATIVE_TO_GROUND);
		var center = this.reprojectToMap(new OpenLayers.LonLat(lookAt
				.getLongitude(), lookAt.getLatitude()));
		var geExtent = this.reprojectToMap(this.getExtent());
		this.map.zoomToExtent(geExtent, true);
		this.map.setCenter(center);
		var height = lookAt.getRange();
		var width = 2 * height * Math.tan(this.HORIZONTAL_FIELD_OF_VIEW);
		var nextResolution = this.map
				.getResolutionForZoom(this.map.getZoom() + 1);
		var currentExtent = this.map.getExtent();
		var nextExtent = new OpenLayers.Bounds(center.lon
				- (this.map.getSize().w / 2 * nextResolution), center.lat
				+ (this.map.getSize().h / 2 * nextResolution), center.lon
				+ (this.map.getSize().w / 2 * nextResolution), center.lat
				- (this.map.getSize().h / 2 * nextResolution));
		var currentWidthDiff = Math.abs(this.getExtentWidth(currentExtent)
				- width);
		var nextWidthDiff = Math.abs(this.getExtentWidth(nextExtent) - width);
		if (nextWidthDiff < currentWidthDiff) {
			this.map.zoomTo(this.map.getZoom() + 1);
		}
	},
	getExtentWidth : function(extent) {
		var center = extent.getCenterLonLat();
		var middleLeft = new OpenLayers.LonLat(extent.left, center.lat);
		var middleRight = new OpenLayers.LonLat(extent.right, center.lat);
		return OpenLayers.Util.distVincenty(middleLeft, middleRight) * 1000;
	},
	reprojectToGE : function(data) {
		return data.clone().transform(this.map.getProjectionObject(),
				this.projection);
	},
	reprojectToMap : function(data) {
		return data.clone().transform(this.projection,
				this.map.getProjectionObject());
	}
});
Ext.reg("gxp_googleearthpanel", gxp.GoogleEarthPanel);
Ext.namespace("gxp");
gxp.Viewer = Ext
		.extend(
				Ext.util.Observable,
				{
					defaultToolType : "gxp_tool",
					tools : null,
					selectedLayer : null,
					constructor : function(config) {
						this.addEvents("ready", "portalready",
								"beforelayerselectionchange",
								"layerselectionchange", "featureedit",
								"loginchanged");
						Ext.apply(this, {
							layerSources : {},
							portalItems : []
						});
						this.createLayerRecordQueue = [];
						(config.loadConfig || this.loadConfig).call(this,
								config, this.applyConfig);
						gxp.Viewer.superclass.constructor
								.apply(this, arguments);
					},
					selectLayer : function(record) {
						record = record || null;
						var changed = false;
						var allow = this.fireEvent(
								"beforelayerselectionchange", record);
						if (allow !== false) {
							changed = true;
							if (this.selectedLayer) {
								this.selectedLayer.set("selected", false);
							}
							this.selectedLayer = record;
							if (this.selectedLayer) {
								this.selectedLayer.set("selected", true);
							}
							this.fireEvent("layerselectionchange", record);
						}
						return changed;
					},
					loadConfig : function(config) {
						this.applyConfig(config);
					},
					applyConfig : function(config) {
						this.initialConfig = Ext.apply({}, config);
						Ext.apply(this, this.initialConfig);
						this.load();
					},
					load : function() {
						if (this.proxy) {
							OpenLayers.ProxyHost = this.proxy;
						}
						this.initMapPanel();
						this.initTools();
						var config, queue = [];
						for ( var key in this.sources) {
							queue.push(this.createSourceLoader(key));
						}
						queue.push(function(done) {
							Ext.onReady(function() {
								this.initPortal();
								done();
							}, this);
						});
						gxp.util.dispatch(queue, this.activate, this);
					},
					createSourceLoader : function(key) {
						return function(done) {
							var config = this.sources[key];
							config.projection = this.initialConfig.map.projection;
							this.addLayerSource({
								id : key,
								config : config,
								callback : done,
								fallback : function(source, msg, details) {
									done();
								},
								scope : this
							});
						};
					},
					addLayerSource : function(options) {
						var id = options.id || Ext.id(null, "gxp-source-");
						var source;
						var config = options.config;
						config.id = id;
						try {
							source = Ext.ComponentMgr.createPlugin(config,
									this.defaultSourceType);
						} catch (err) {
							throw new Error(
									"Could not create new source plugin with ptype: "
											+ options.config.ptype);
						}
						source.on({
							ready : {
								fn : function() {
									var callback = options.callback
											|| Ext.emptyFn;
									callback.call(options.scope || this, id);
								},
								scope : this,
								single : true
							},
							failure : {
								fn : function() {
									var fallback = options.fallback
											|| Ext.emptyFn;
									delete this.layerSources[id];
									fallback.apply(options.scope || this,
											arguments);
								},
								scope : this,
								single : true
							}
						});
						this.layerSources[id] = source;
						source.init(this);
						return source;
					},
					initMapPanel : function() {
						var config = Ext.apply({}, this.initialConfig.map);
						var mapConfig = {};
						if (this.initialConfig.map) {
							var props = "theme,controls,resolutions,projection,units,maxExtent,restrictedExtent,maxResolution,numZoomLevels,panMethod"
									.split(",");
							var prop;
							for ( var i = props.length - 1; i >= 0; --i) {
								prop = props[i];
								if (prop in config) {
									mapConfig[prop] = config[prop];
									delete config[prop];
								}
							}
						}
						this.mapPanel = Ext.ComponentMgr
								.create(Ext
										.applyIf(
												{
													xtype : config.xtype
															|| "gx_mappanel",
													map : Ext
															.applyIf(
																	{
																		theme : mapConfig.theme
																				|| null,
																		controls : mapConfig.controls
																				|| [
																						new OpenLayers.Control.Navigation(
																								{
																									zoomWheelOptions : {
																										interval : 250
																									}
																								}),
																						new OpenLayers.Control.PanPanel(),
																						new OpenLayers.Control.ZoomPanel(),
																						new OpenLayers.Control.Attribution() ],
																		maxExtent : mapConfig.maxExtent
																				&& OpenLayers.Bounds
																						.fromArray(mapConfig.maxExtent),
																		restrictedExtent : mapConfig.restrictedExtent
																				&& OpenLayers.Bounds
																						.fromArray(mapConfig.restrictedExtent),
																		numZoomLevels : mapConfig.numZoomLevels || 20
																	},
																	mapConfig),
													center : config.center
															&& new OpenLayers.LonLat(
																	config.center[0],
																	config.center[1]),
													resolutions : config.resolutions,
													forceInitialExtent : true,
													layers : null,
													items : this.mapItems,
													plugins : this.mapPlugins,
													tbar : config.tbar || {
														hidden : true
													}
												}, config));
						this.mapPanel.layers.on({
							"add" : function(store, records) {
								var record;
								for ( var i = records.length - 1; i >= 0; i--) {
									record = records[i];
									if (record.get("selected") === true) {
										this.selectLayer(record);
									}
								}
							},
							"remove" : function(store, record) {
								if (record.get("selected") === true) {
									this.selectLayer();
								}
							},
							scope : this
						});
					},
					initTools : function() {
						this.tools = {};
						if (this.initialConfig.tools
								&& this.initialConfig.tools.length > 0) {
							var tool;
							for ( var i = 0, len = this.initialConfig.tools.length; i < len; i++) {
								try {
									tool = Ext.ComponentMgr.createPlugin(
											this.initialConfig.tools[i],
											this.defaultToolType);
								} catch (err) {
									throw new Error(
											"Could not create tool plugin with ptype: "
													+ this.initialConfig.tools[i].ptype);
								}
								tool.init(this);
							}
						}
					},
					initPortal : function() {
						var config = this.portalConfig || {};
						if (this.portalItems.length === 0) {
							this.mapPanel.region = "center";
							this.portalItems.push(this.mapPanel);
						}
						this.portal = Ext.ComponentMgr.create(Ext.applyIf(
								config, {
									layout : "fit",
									hideBorders : true,
									items : {
										layout : "border",
										deferredRender : false,
										items : this.portalItems
									}
								}), config.renderTo ? "panel" : "viewport");
						this.fireEvent("portalready");
					},
					activate : function() {
						Ext.QuickTips.init();
						this.addLayers();
						this.checkLayerRecordQueue();
						this.fireEvent("ready");
					},
					addLayers : function() {
						var mapConfig = this.initialConfig.map;
						if (mapConfig && mapConfig.layers) {
							var conf, source, record, baseRecords = [], overlayRecords = [];
							for ( var i = 0; i < mapConfig.layers.length; ++i) {
								conf = mapConfig.layers[i];
								source = this.layerSources[conf.source];
								if (source) {
									record = source.createLayerRecord(conf);
									if (record) {
										if (record.get("group") === "background") {
											baseRecords.push(record);
										} else {
											overlayRecords.push(record);
										}
									}
								}
							}
							baseRecords
									.sort(function(a, b) {
										return a.getLayer().visibility < b
												.getLayer().visibility;
									});
							var panel = this.mapPanel;
							var map = panel.map;
							var records = baseRecords.concat(overlayRecords);
							if (records.length) {
								panel.layers.add(records);
							}
						}
					},
					getLayerRecordFromMap : function(config) {
						var record = null;
						if (this.mapPanel) {
							this.mapPanel.layers.each(function(rec) {
								if (rec.get("source") == config.source
										&& rec.get("name") == config.name) {
									record = rec;
									return false;
								}
							});
						}
						return record;
					},
					createLayerRecord : function(config, callback, scope) {
						this.createLayerRecordQueue.push({
							config : config,
							callback : callback,
							scope : scope
						});
						this.checkLayerRecordQueue();
					},
					checkLayerRecordQueue : function() {
						var request, source, record, called;
						var remaining = [];
						for ( var i = 0, ii = this.createLayerRecordQueue.length; i < ii; ++i) {
							called = false;
							request = this.createLayerRecordQueue[i];
							source = request.config.source;
							if (source in this.layerSources) {
								record = this.layerSources[source]
										.createLayerRecord(request.config);
								if (record) {
									(function(req, rec) {
										window.setTimeout(function() {
											req.callback.call(req.scope, rec);
										}, 0);
									})(request, record);
									called = true;
								}
							}
							if (!called) {
								remaining.push(request);
							}
						}
						this.createLayerRecordQueue = remaining;
					},
					getSource : function(layerRec) {
						return layerRec
								&& this.layerSources[layerRec.get("source")];
					},
					getState : function() {
						var state = Ext.apply({}, this.initialConfig);
						var center = this.mapPanel.map.getCenter();
						Ext.apply(state.map, {
							center : [ center.lon, center.lat ],
							zoom : this.mapPanel.map.zoom,
							layers : []
						});
						this.mapPanel.layers
								.each(
										function(record) {
											var layer = record.getLayer();
											if (layer.displayInLayerSwitcher) {
												var id = record.get("source");
												var source = this.layerSources[id];
												if (!source) {
													throw new Error(
															"Could not find source for layer '"
																	+ record
																			.get("name")
																	+ "'");
												}
												state.map.layers
														.push(source
																.getConfigForRecord(record));
												if (!state.sources[id]) {
													state.sources[id] = Ext
															.apply(
																	{},
																	source.initialConfig);
												}
											}
										}, this);
						if (state.portalItems) {
							if (state.portalConfig && state.portalConfig.items
									&& state.portalConfig.items.length) {
								for ( var items = state.portalItems, i = 0, len = items.length; i < len; i++) {
									var item = items[i];
									if (state.portalConfig.items.indexOf(item) == -1) {
										state.portalConfig.items.push(item);
									}
								}
							} else if (state.portalItems
									&& state.portalItems.length) {
								!state.portalConfig
										&& (state.portalConfig = {});
								state.portalConfig.items = state.portalItems;
							}
						}
						state.tools = [];
						Ext.iterate(this.tools, function(key, val, obj) {
							state.tools.push(val.getState());
						});
						return state;
					},
					isAuthorized : function(role) {
						return !this.authorizedRoles
								|| (this.authorizedRoles.indexOf(role
										|| "ROLE_ADMINISTRATOR") !== -1);
					},
					isAuthenticated : function(role) {
						return !this.authorizedRoles
								|| this.authorizedRoles.length > 0;
					},
					destroy : function() {
						this.mapPanel.destroy();
						this.portal && this.portal.destroy();
					}
				});
(function() {
	OpenLayers.DOTS_PER_INCH = 25.4 / 0.28;
})();
Ext.namespace("gxp");
gxp.EmbedMapDialog = Ext
		.extend(
				Ext.Container,
				{
					url : null,
					url : null,
					publishMessage : "Your map is ready to be published to the web! Simply copy the following HTML to embed the map in your website:",
					heightLabel : 'Height',
					widthLabel : 'Width',
					mapSizeLabel : 'Map Size',
					miniSizeLabel : 'Mini',
					smallSizeLabel : 'Small',
					premiumSizeLabel : 'Premium',
					largeSizeLabel : 'Large',
					snippetArea : null,
					heightField : null,
					widthField : null,
					initComponent : function() {
						Ext.apply(this, this.getConfig());
						gxp.EmbedMapDialog.superclass.initComponent.call(this);
					},
					getIframeHTML : function() {
						return this.snippetArea.getValue();
					},
					updateSnippet : function() {
						this.snippetArea
								.setValue('<iframe style="border: none;" height="'
										+ this.heightField.getValue()
										+ '" width="'
										+ this.widthField.getValue()
										+ '" src="'
										+ gxp.util.getAbsoluteUrl(this.url)
										+ '"></iframe>');
						if (this.snippetArea.isVisible() === true) {
							this.snippetArea.focus(true, 100);
						}
					},
					getConfig : function() {
						this.snippetArea = new Ext.form.TextArea({
							height : 70,
							selectOnFocus : true,
							readOnly : true
						});
						var numFieldListeners = {
							"change" : this.updateSnippet,
							"specialkey" : function(f, e) {
								e.getKey() == e.ENTER && this.updateSnippet();
							},
							scope : this
						};
						this.heightField = new Ext.form.NumberField({
							width : 50,
							value : 400,
							listeners : numFieldListeners
						});
						this.widthField = new Ext.form.NumberField({
							width : 50,
							value : 600,
							listeners : numFieldListeners
						});
						var adjustments = new Ext.Container(
								{
									layout : "column",
									defaults : {
										border : false,
										xtype : "box"
									},
									items : [
											{
												autoEl : {
													cls : "gxp-field-label",
													html : this.mapSizeLabel
												}
											},
											new Ext.form.ComboBox(
													{
														editable : false,
														width : 75,
														store : new Ext.data.SimpleStore(
																{
																	fields : [
																			"name",
																			"height",
																			"width" ],
																	data : [
																			[
																					this.miniSizeLabel,
																					100,
																					100 ],
																			[
																					this.smallSizeLabel,
																					200,
																					300 ],
																			[
																					this.largeSizeLabel,
																					400,
																					600 ],
																			[
																					this.premiumSizeLabel,
																					600,
																					800 ] ]
																}),
														triggerAction : 'all',
														displayField : 'name',
														value : this.largeSizeLabel,
														mode : 'local',
														listeners : {
															"select" : function(
																	combo,
																	record,
																	index) {
																this.widthField
																		.setValue(record
																				.get("width"));
																this.heightField
																		.setValue(record
																				.get("height"));
																this
																		.updateSnippet();
															},
															scope : this
														}
													}), {
												autoEl : {
													cls : "gxp-field-label",
													html : this.heightLabel
												}
											}, this.heightField, {
												autoEl : {
													cls : "gxp-field-label",
													html : this.widthLabel
												}
											}, this.widthField ]
								});
						return {
							border : false,
							defaults : {
								border : false,
								cls : "gxp-export-section",
								xtype : "container",
								layout : "fit"
							},
							items : [ {
								items : [ adjustments ]
							}, {
								xtype : "box",
								autoEl : {
									tag : "p",
									html : this.publishMessage
								}
							}, {
								items : [ this.snippetArea ]
							} ],
							listeners : {
								"afterrender" : this.updateSnippet,
								scope : this
							}
						};
					}
				});
Ext.reg('gxp_embedmapdialog', gxp.EmbedMapDialog);
Ext.namespace("gxp");
gxp.WMSStylesDialog = Ext
		.extend(
				Ext.Container,
				{
					addStyleText : "Ekle",
					addStyleTip : "Yeni Sembol Ekle",
					chooseStyleText : "Sembol Seç",
					deleteStyleText : "Kaldır",
					deleteStyleTip : "Seçili sembolü sil",
					editStyleText : "Düzenle",
					editStyleTip : "Seçili sembolü düzenle",
					duplicateStyleText : "Kopyala",
					duplicateStyleTip : "Seçili sembolü düzenle",
					addRuleText : "Ekle",
					addRuleTip : "Yeni Kural Ekle",
					newRuleText : "Yeni Kural",
					deleteRuleText : "Kaldır",
					deleteRuleTip : "Seçili kuralı sil",
					editRuleText : "Düzenle",
					editRuleTip : "Seçili kuralı düzenle",
					duplicateRuleText : "Kopyala",
					duplicateRuleTip : "Seçili kuralı düzenle",
					cancelText : "İptal",
					saveText : "Kaydet",
					styleWindowTitle : "Kullanıcı Sembol'ü: {0}",
					ruleWindowTitle : "Sembol Kuralı: {0}",
					stylesFieldsetTitle : "Semboller",
					rulesFieldsetTitle : "Kurallar",
					layerRecord : null,
					layerDescription : null,
					symbolType : null,
					stylesStore : null,
					selectedStyle : null,
					selectedRule : null,
					editable : true,
					modified : false,
					initComponent : function() {
						this.addEvents("ready", "modified", "styleselected",
								"beforesaved", "saved");
						var defConfig = {
							layout : "form",
							disabled : true,
							items : [
									{
										xtype : "fieldset",
										title : this.stylesFieldsetTitle,
										labelWidth : 85,
										style : "margin-bottom: 0;"
									},
									{
										xtype : "toolbar",
										style : "border-width: 0 1px 1px 1px; margin-bottom: 10px;",
										items : [
												{
													xtype : "button",
													iconCls : "add",
													text : this.addStyleText,
													tooltip : this.addStyleTip,
													handler : this.addStyle,
													scope : this
												},
												{
													xtype : "button",
													iconCls : "delete",
													text : this.deleteStyleText,
													tooltip : this.deleteStyleTip,
													handler : function() {
														this.stylesStore
																.remove(this.selectedStyle);
													},
													scope : this
												},
												{
													xtype : "button",
													iconCls : "edit",
													text : this.editStyleText,
													tooltip : this.editStyleTip,
													handler : function() {
														this.editStyle();
													},
													scope : this
												},
												{
													xtype : "button",
													iconCls : "duplicate",
													text : this.duplicateStyleText,
													tooltip : this.duplicateStyleTip,
													handler : function() {
														var prevStyle = this.selectedStyle;
														var newStyle = prevStyle
																.get(
																		"userStyle")
																.clone();
														newStyle.isDefault = false;
														newStyle.name = this
																.newStyleName();
														var store = this.stylesStore;
														store
																.add(new store.recordType(
																		{
																			"name" : newStyle.name,
																			"title" : newStyle.title,
																			"abstract" : newStyle.description,
																			"userStyle" : newStyle
																		}));
														this
																.editStyle(prevStyle);
													},
													scope : this
												} ]
									} ]
						};
						Ext.applyIf(this, defConfig);
						this.createStylesStore();
						this
								.on({
									"beforesaved" : function() {
										this._saving = true;
									},
									"saved" : function() {
										delete this._saving;
									},
									"render" : function() {
										gxp.util.dispatch([ this.getStyles ],
												function() {
													this.enable();
												}, this);
									},
									"ready" : function() {
										var combo = this.items.get(0).items
												.get(0);
										combo
												.fireEvent(
														"select",
														combo,
														this.stylesStore
																.getAt(this.stylesStore
																		.findExact(
																				"name",
																				this.selectedStyle
																						.get("name"))),
														this.stylesStore
																.findExact(
																		"name",
																		this.selectedStyle
																				.get("name")));
										combo.setValue(this.selectedStyle
												.get("name"));
									},
									scope : this
								});
						gxp.WMSStylesDialog.superclass.initComponent.apply(
								this, arguments);
					},
					addStyle : function() {
						if (!this._ready) {
							this.on("ready", this.addStyle, this);
							return;
						}
						var prevStyle = this.selectedStyle;
						var store = this.stylesStore;
						var newStyle = new OpenLayers.Style(null, {
							name : this.newStyleName(),
							rules : [ this.createRule() ]
						});
						store.add(new store.recordType({
							"name" : newStyle.name,
							"userStyle" : newStyle
						}));
						this.editStyle(prevStyle);
					},
					editStyle : function(prevStyle) {
						var userStyle = this.selectedStyle.get("userStyle");
						var buttonCfg = {
							bbar : [
									"->",
									{
										text : this.cancelText,
										iconCls : "cancel",
										handler : function() {
											styleProperties.propertiesDialog.userStyle = userStyle;
											styleProperties.close();
											if (prevStyle) {
												this._cancelling = true;
												this.stylesStore
														.remove(this.selectedStyle);
												this.changeStyle(prevStyle, {
													updateCombo : true,
													markModified : true
												});
												delete this._cancelling;
											}
										},
										scope : this
									}, {
										text : this.saveText,
										iconCls : "save",
										handler : function() {
											styleProperties.close();
										}
									} ]
						};
						var styleProperties = new Ext.Window(
								Ext
										.apply(
												buttonCfg,
												{
													title : String
															.format(
																	this.styleWindowTitle,
																	userStyle.title
																			|| userStyle.name),
													bodyBorder : false,
													autoHeight : true,
													width : 300,
													modal : true,
													items : {
														border : false,
														items : {
															xtype : "gxp_stylepropertiesdialog",
															ref : "../propertiesDialog",
															userStyle : userStyle
																	.clone(),
															nameEditable : false,
															style : "padding: 10px;"
														}
													},
													listeners : {
														"close" : function() {
															this.selectedStyle
																	.set(
																			"userStyle",
																			styleProperties.propertiesDialog.userStyle);
														},
														scope : this
													}
												}));
						styleProperties.show();
					},
					createSLD : function(options) {
						options = options || {};
						var sld = {
							version : "1.0.0",
							namedLayers : {}
						};
						var layerName = this.layerRecord.get("name");
						sld.namedLayers[layerName] = {
							name : layerName,
							userStyles : []
						};
						this.stylesStore.each(function(r) {
							if (!options.userStyles
									|| options.userStyles
											.indexOf(r.get("name")) !== -1) {
								sld.namedLayers[layerName].userStyles.push(r
										.get("userStyle"));
							}
						});
						return new OpenLayers.Format.SLD({
							multipleSymbolizers : true
						}).write(sld);
					},
					saveStyles : function(options) {
						this.modified === true
								&& this.fireEvent("beforesaved", this, options);
					},
					updateStyleRemoveButton : function() {
						var userStyle = this.selectedStyle
								&& this.selectedStyle.get("userStyle");
						this.items.get(1).items.get(1).setDisabled(
								!userStyle || this.stylesStore.getCount() <= 1
										|| userStyle.isDefault === true);
					},
					updateRuleRemoveButton : function() {
						this.items.get(3).items.get(1).setDisabled(
								!this.selectedRule);
					},
					createRule : function() {
						return new OpenLayers.Rule(
								{
									symbolizers : [ new OpenLayers.Symbolizer[this.symbolType] ]
								});
					},
					addRulesFieldSet : function() {
						var rulesFieldSet = new Ext.form.FieldSet({
							itemId : "rulesfieldset",
							title : this.rulesFieldsetTitle,
							autoScroll : true,
							style : "margin-bottom: 0;",
							hideMode : "offsets",
							hidden : true
						});
						var rulesToolbar = new Ext.Toolbar(
								{
									style : "border-width: 0 1px 1px 1px;",
									hidden : true,
									items : [
											{
												xtype : "button",
												iconCls : "add",
												text : this.addRuleText,
												tooltip : this.addRuleTip,
												handler : this.addRule,
												scope : this
											},
											{
												xtype : "button",
												iconCls : "delete",
												text : this.deleteRuleText,
												tooltip : this.deleteRuleTip,
												handler : this.removeRule,
												scope : this,
												disabled : true
											},
											{
												xtype : "button",
												iconCls : "edit",
												text : this.editRuleText,
												toolitp : this.editRuleTip,
												handler : function() {
													this.layerDescription ? this
															.editRule()
															: this
																	.describeLayer(this.editRule);
												},
												scope : this,
												disabled : true
											}, {
												xtype : "button",
												iconCls : "duplicate",
												text : this.duplicateRuleText,
												tip : this.duplicateRuleTip,
												handler : this.duplicateRule,
												scope : this,
												disabled : true
											} ]
								});
						this.add(rulesFieldSet, rulesToolbar);
						this.doLayout();
						return rulesFieldSet;
					},
					addRule : function() {
						if (!this.selectedStyle.get("userStyle").isDefault) {
							var legend = this.items.get(2).items.get(0);
							this.selectedStyle.get("userStyle").rules.push(this
									.createRule());
							legend.update();
							this.selectedStyle.store
									.afterEdit(this.selectedStyle);
							this.updateRuleRemoveButton();
						} else
							alert("Varsayılan sembol düzenlenemez.");
					},
					removeRule : function() {
						if (!this.selectedStyle.get("userStyle").isDefault) {
							this.selectedStyle.get("userStyle").rules
									.remove(this.selectedRule);
							this.afterRuleChange();
						} else {
							alert("Varsayılan sembol düzenlenemez.");
						}
					},
					duplicateRule : function() {
						if (!this.selectedStyle.get("userStyle").isDefault) {
							var legend = this.items.get(2).items.get(0);
							var newRule = this.selectedRule.clone();
							this.selectedStyle.get("userStyle").rules
									.push(newRule);
							legend.update();
							this.selectedStyle.store
									.afterEdit(this.selectedStyle);
							this.updateRuleRemoveButton();
						} else
							alert("Varsayılan sembol düzenlenemez.");
					},
					editRule : function() {
						if (!this.selectedStyle.get("userStyle").isDefault) {
							var rule = this.selectedRule;
							var origRule = rule.clone();
							var ruleDlg = new Ext.Window(
									{
										title : String.format(
												this.ruleWindowTitle,
												rule.title || rule.name
														|| this.newRuleText),
										width : 340,
										autoHeight : true,
										modal : true,
										items : [ {
											xtype : "gxp_rulepanel",
											ref : "rulePanel",
											symbolType : this.symbolType,
											rule : rule,
											attributes : new GeoExt.data.AttributeStore(
													{
														url : this.layerDescription.owsURL,
														baseParams : {
															"SERVICE" : this.layerDescription.owsType,
															"REQUEST" : "DescribeFeatureType",
															"TYPENAME" : this.layerDescription.typeName
														},
														method : "GET",
														disableCaching : false
													}),
											border : false,
											defaults : {
												autoHeight : true,
												hideMode : "offsets"
											},
											listeners : {
												"change" : this.saveRule,
												"tabchange" : function() {
													ruleDlg.syncShadow();
												},
												scope : this
											}
										} ],
										bbar : [
												"->",
												{
													text : this.cancelText,
													iconCls : "cancel",
													handler : function() {
														this
																.saveRule(
																		ruleDlg.rulePanel,
																		origRule);
														ruleDlg.close();
													},
													scope : this
												}, {
													text : this.saveText,
													iconCls : "save",
													handler : function() {
														ruleDlg.close();
													}
												} ]
									});
							ruleDlg.show();
						} else
							alert("Varsayılan sembol düzenlenemez.");
					},
					saveRule : function(cmp, rule) {
						var style = this.selectedStyle;
						var legend = this.items.get(2).items.get(0);
						var userStyle = style.get("userStyle");
						var i = userStyle.rules.indexOf(this.selectedRule);
						userStyle.rules[i] = rule;
						this.afterRuleChange(rule);
					},
					afterRuleChange : function(rule) {
						var legend = this.items.get(2).items.get(0);
						this.selectedRule = rule;
						this.selectedStyle.store.afterEdit(this.selectedStyle);
					},
					setRulesFieldSetVisible : function(visible) {
						this.items.get(3).setVisible(visible && this.editable);
						this.items.get(2).setVisible(visible);
						this.doLayout();
					},
					parseSLD : function(response, options) {
						var data = response.responseXML;
						if (!data || !data.documentElement) {
							data = new OpenLayers.Format.XML()
									.read(response.responseText);
						}
						var layerParams = this.layerRecord.getLayer().params;
						var initialStyle = this.initialConfig.styleName
								|| layerParams.STYLES;
						if (initialStyle) {
							this.selectedStyle = this.stylesStore
									.getAt(this.stylesStore.findExact("name",
											initialStyle));
						}
						var format = new OpenLayers.Format.SLD({
							multipleSymbolizers : true
						});
						try {
							var sld = format.read(data);
							var userStyles = sld.namedLayers[layerParams.LAYERS].userStyles;
							var inlineStyles;
							if (layerParams.SLD_BODY) {
								var sldBody = format.read(layerParams.SLD_BODY);
								inlineStyles = sldBody.namedLayers[layerParams.LAYERS].userStyles;
								Array.prototype.push.apply(userStyles,
										inlineStyles);
							}
							this.stylesStore.removeAll();
							this.selectedStyle = null;
							var userStyle, record, index;
							for ( var i = 0, len = userStyles.length; i < len; ++i) {
								userStyle = userStyles[i];
								index = this.stylesStore.findExact("name",
										userStyle.name);
								index !== -1
										&& this.stylesStore.removeAt(index);
								record = new this.stylesStore.recordType({
									"name" : userStyle.name,
									"title" : userStyle.title,
									"abstract" : userStyle.description,
									"userStyle" : userStyle
								});
								record.phantom = false;
								this.stylesStore.add(record);
								if (!this.selectedStyle
										&& (initialStyle === userStyle.name || (!initialStyle && userStyle.isDefault === true))) {
									this.selectedStyle = record;
								}
							}
							this.addRulesFieldSet();
							this.createLegend(this.selectedStyle
									.get("userStyle").rules);
							this.stylesStoreReady();
							layerParams.SLD_BODY && this.markModified();
						} catch (e) {
							this.setupNonEditable();
						}
					},
					createLegend : function(rules) {
						var R = OpenLayers.Symbolizer.Raster;
						if (R && rules[0]
								&& rules[0].symbolizers[0] instanceof R) {
							throw ("Raster symbolizers are not supported.");
						} else {
							this.addVectorLegend(rules);
						}
					},
					setupNonEditable : function() {
						this.editable = false;
						this.items.get(1).hide();
						var rulesFieldSet = this.getComponent("rulesfieldset")
								|| this.addRulesFieldSet();
						rulesFieldSet.add(this.createLegendImage());
						this.doLayout();
						this.items.get(3).hide();
						this.stylesStoreReady();
					},
					stylesStoreReady : function() {
						this.stylesStore.commitChanges();
						this.stylesStore
								.on({
									"load" : function() {
										this.addStylesCombo();
										this.updateStyleRemoveButton();
									},
									"add" : function(store, records, index) {
										this.updateStyleRemoveButton();
										var combo = this.items.get(0).items
												.get(0);
										this.markModified();
										combo.fireEvent("select", combo, store
												.getAt(index), index);
										combo.setValue(this.selectedStyle
												.get("name"));
									},
									"remove" : function(store, record, index) {
										if (!this._cancelling) {
											this._removing = true;
											var newIndex = Math.min(index,
													store.getCount() - 1);
											this.updateStyleRemoveButton();
											var combo = this.items.get(0).items
													.get(0);
											this.markModified();
											combo.fireEvent("select", combo,
													store.getAt(newIndex),
													newIndex);
											combo.setValue(this.selectedStyle
													.get("name"));
											delete this._removing;
										}
									},
									"update" : function(store, record) {
										var userStyle = record.get("userStyle");
										var data = {
											"name" : userStyle.name,
											"title" : userStyle.title
													|| userStyle.name,
											"abstract" : userStyle.description
										};
										Ext.apply(record.data, data);
										this.changeStyle(record, {
											updateCombo : true,
											markModified : true
										});
									},
									scope : this
								});
						this.stylesStore.fireEvent("load", this.stylesStore,
								this.stylesStore.getRange());
						this._ready = true;
						this.fireEvent("ready");
					},
					markModified : function() {
						if (this.modified === false) {
							this.modified = true;
						}
						if (!this._saving) {
							this.fireEvent("modified", this, this.selectedStyle
									.get("name"));
						}
					},
					createStylesStore : function(callback) {
						var styles = this.layerRecord.get("styles");
						this.stylesStore = new Ext.data.JsonStore(
								{
									data : {
										styles : styles
									},
									idProperty : "name",
									root : "styles",
									fields : [ "name", "title", "abstract",
											"legend", "userStyle" ],
									listeners : {
										"add" : function(store, records) {
											for ( var rec, i = records.length - 1; i >= 0; --i) {
												rec = records[i];
												store.suspendEvents();
												rec.get("title")
														|| rec.set("title", rec
																.get("name"));
												store.resumeEvents();
											}
										}
									}
								});
					},
					getStyles : function(callback) {
						var layer = this.layerRecord.getLayer();
						if (this.editable === true) {
							var version = layer.params["VERSION"];
							if (parseFloat(version) > 1.1) {
								version = "1.1.1";
							}
							Ext.Ajax.request({
								url : layer.url,
								params : {
									"SERVICE" : "WMS",
									"VERSION" : version,
									"REQUEST" : "GetStyles",
									"LAYERS" : [ layer.params["LAYERS"] ]
											.join(",")
								},
								method : "GET",
								disableCaching : false,
								success : this.parseSLD,
								failure : this.setupNonEditable,
								callback : callback,
								scope : this
							});
						} else {
							this.setupNonEditable();
						}
					},
					describeLayer : function(callback) {
						if (this.layerDescription) {
							window.setTimeout(function() {
								callback.call(this);
							}, 0);
						} else {
							var layer = this.layerRecord.getLayer();
							var version = layer.params["VERSION"];
							if (parseFloat(version) > 1.1) {
								version = "1.1.1";
							}
							Ext.Ajax
									.request({
										url : layer.url,
										params : {
											"SERVICE" : "WMS",
											"VERSION" : version,
											"REQUEST" : "DescribeLayer",
											"LAYERS" : [ layer.params["LAYERS"] ]
													.join(",")
										},
										method : "GET",
										disableCaching : false,
										success : function(response) {
											var result = new OpenLayers.Format.WMSDescribeLayer()
													.read(response.responseXML
															&& response.responseXML.documentElement ? response.responseXML
															: response.responseText);
											this.layerDescription = result[0];
										},
										callback : callback,
										scope : this
									});
						}
					},
					addStylesCombo : function() {
						var store = this.stylesStore;
						var combo = new Ext.form.ComboBox(Ext.apply({
							fieldLabel : this.chooseStyleText,
							store : store,
							editable : false,
							displayField : "title",
							valueField : "name",
							value : this.selectedStyle ? this.selectedStyle
									.get("title")
									: this.layerRecord.getLayer().params.STYLES
											|| "default",
							disabled : !store.getCount(),
							mode : "local",
							typeAhead : true,
							triggerAction : "all",
							forceSelection : true,
							anchor : "100%",
							listeners : {
								"select" : function(combo, record) {
									this.changeStyle(record);
									if (!record.phantom && !this._removing) {
										this.fireEvent("styleselected", this,
												record.get("name"));
									}
								},
								scope : this
							}
						}, this.initialConfig.stylesComboOptions));
						this.items.get(0).add(combo);
						this.doLayout();
					},
					createLegendImage : function() {
						var legend = new GeoExt.WMSLegend(
								{
									showTitle : false,
									layerRecord : this.layerRecord,
									autoScroll : true,
									defaults : {
										listeners : {
											"render" : function(cmp) {
												cmp
														.getEl()
														.on(
																{
																	load : function(
																			evt,
																			img) {
																		if (img
																				.getAttribute("src") != cmp.defaultImgSrc) {
																			this
																					.setRulesFieldSetVisible(true);
																			if (cmp
																					.getEl()
																					.getHeight() > 250) {
																				legend
																						.setHeight(250);
																			}
																		}
																	},
																	"error" : function() {
																		this
																				.setRulesFieldSetVisible(false);
																	},
																	scope : this
																});
											},
											scope : this
										}
									}
								});
						return legend;
					},
					changeStyle : function(record, options) {
						options = options || {};
						var legend = this.items.get(2).items.get(0);
						this.selectedStyle = record;
						this.updateStyleRemoveButton();
						var styleName = record.get("name");
						if (this.editable === true) {
							var userStyle = record.get("userStyle");
							if (userStyle.isDefault === true) {
								styleName = "";
							}
							var ruleIdx = legend.rules
									.indexOf(this.selectedRule);
							legend.ownerCt.remove(legend);
							this.createLegend(userStyle.rules, {
								selectedRuleIndex : ruleIdx
							});
						}
						if (options.updateCombo === true) {
							this.items.get(0).items.get(0).setValue(
									userStyle.name);
							options.markModified === true
									&& this.markModified();
						}
					},
					addVectorLegend : function(rules, options) {
						options = Ext.applyIf(options || {}, {
							enableDD : true
						});
						this.symbolType = options.symbolType;
						if (!this.symbolType) {
							var typeHierarchy = [ "Point", "Line", "Polygon" ];
							highest = 0;
							var symbolizers = rules[0].symbolizers, symbolType;
							for ( var i = symbolizers.length - 1; i >= 0; i--) {
								symbolType = symbolizers[i].CLASS_NAME.split(
										".").pop();
								highest = Math.max(highest, typeHierarchy
										.indexOf(symbolType));
							}
							this.symbolType = typeHierarchy[highest];
						}
						var legend = this.items
								.get(2)
								.add(
										{
											xtype : "gx_vectorlegend",
											showTitle : false,
											height : rules.length > 10 ? 250
													: undefined,
											autoScroll : rules.length > 10,
											rules : rules,
											symbolType : this.symbolType,
											selectOnClick : true,
											enableDD : options.enableDD,
											listeners : {
												"ruleselected" : function(cmp,
														rule) {
													this.selectedRule = rule;
													var tbItems = this.items
															.get(3).items;
													this
															.updateRuleRemoveButton();
													tbItems.get(2).enable();
													tbItems.get(3).enable();
												},
												"ruleunselected" : function(
														cmp, rule) {
													this.selectedRule = null;
													var tbItems = this.items
															.get(3).items;
													tbItems.get(1).disable();
													tbItems.get(2).disable();
													tbItems.get(3).disable();
												},
												"rulemoved" : function() {
													this.markModified();
												},
												"afterlayout" : function() {
													if (this.selectedRule !== null
															&& legend.selectedRule === null
															&& legend.rules
																	.indexOf(this.selectedRule) !== -1) {
														legend
																.selectRuleEntry(this.selectedRule);
													}
												},
												scope : this
											}
										});
						this.setRulesFieldSetVisible(true);
						return legend;
					},
					newStyleName : function() {
						var layerName = this.layerRecord.get("name");
						return layerName.split(":").pop()
								+ "_"
								+ gxp.util.md5(
										layerName + new Date() + Math.random())
										.substr(0, 8);
					}
				});
gxp.WMSStylesDialog.createGeoServerStylerConfig = function(layerRecord, url) {
	var layer = layerRecord.getLayer();
	if (!url) {
		url = layerRecord.get("restUrl");
	}
	if (!url) {
		url = layer.url.split("?").shift().replace(/\/(wms|ows)\/?$/, "/rest");
	}
	return {
		xtype : "gxp_wmsstylesdialog",
		layerRecord : layerRecord,
		plugins : [ {
			ptype : "gxp_geoserverstylewriter",
			baseUrl : url
		} ],
		listeners : {
			"styleselected" : function(cmp, style) {
				layer.mergeNewParams({
					styles : style
				});
			},
			"modified" : function(cmp, style) {
				cmp.saveStyles();
			},
			"saved" : function(cmp, style) {
				layer.mergeNewParams({
					_olSalt : Math.random(),
					styles : style
				});
			},
			scope : this
		}
	};
};
OpenLayers.Renderer.defaultSymbolizer = {
	fillColor : "#808080",
	fillOpacity : 1,
	strokeColor : "#000000",
	strokeOpacity : 1,
	strokeWidth : 1,
	strokeDashstyle : "solid",
	pointRadius : 3,
	graphicName : "square",
	fontColor : "#000000",
	fontSize : 10,
	haloColor : "#FFFFFF",
	haloOpacity : 1,
	haloRadius : 1
};
Ext.reg('gxp_wmsstylesdialog', gxp.WMSStylesDialog);
OpenLayers.Format
		&& OpenLayers.Format.SLD
		&& OpenLayers.Format.SLD.v1
		&& (function() {
			OpenLayers.Format.SLD.v1.prototype.readers.sld["VendorOption"] = function(
					node, obj) {
				if (!obj.vendorOptions) {
					obj.vendorOptions = [];
				}
				obj.vendorOptions.push({
					name : node.getAttribute("name"),
					value : this.getChildValue(node)
				});
			};
			OpenLayers.Format.SLD.v1.prototype.writers.sld["VendorOption"] = function(
					option) {
				return this.createElementNSPlus("sld:VendorOption", {
					attributes : {
						name : option.name
					},
					value : option.value
				});
			};
			OpenLayers.Format.SLD.v1.prototype.readers.sld["Priority"] = function(
					node, obj) {
				obj.priority = this.readOgcExpression(node);
			};
			OpenLayers.Format.SLD.v1.prototype.writers.sld["Priority"] = function(
					priority) {
				var node = this.createElementNSPlus("sld:Priority");
				this.writeNode("ogc:Literal", priority, node);
				return node;
			};
			var writers = OpenLayers.Format.SLD.v1.prototype.writers.sld;
			var original;
			original = writers.TextSymbolizer;
			writers.TextSymbolizer = (function(original) {
				return function(symbolizer) {
					var node = original.apply(this, arguments);
					if (symbolizer.externalGraphic || symbolizer.graphicName) {
						this.writeNode("Graphic", symbolizer, node);
					}
					if ("priority" in symbolizer) {
						this.writeNode("Priority", symbolizer.priority, node);
					}
					return node;
				};
			})(original);
			var modify = [ "PointSymbolizer", "LineSymbolizer",
					"PolygonSymbolizer", "TextSymbolizer" ];
			var name;
			for ( var i = 0, ii = modify.length; i < ii; ++i) {
				name = modify[i];
				original = writers[name];
				writers[name] = (function(original) {
					return function(symbolizer) {
						var node = original.apply(this, arguments);
						var options = symbolizer.vendorOptions;
						if (options) {
							for ( var i = 0, ii = options.length; i < ii; ++i) {
								this
										.writeNode("VendorOption", options[i],
												node);
							}
						}
						return node;
					};
				})(original);
			}
		})();
Ext.namespace("gxp");
gxp.RulePanel = Ext
		.extend(
				Ext.TabPanel,
				{
					fonts : undefined,
					symbolType : "Point",
					rule : null,
					attributes : null,
					nestedFilters : true,
					minScaleDenominatorLimit : Math.pow(0.5, 19) * 40075016.68
							* 39.3701 * OpenLayers.DOTS_PER_INCH / 256,
					maxScaleDenominatorLimit : 40075016.68 * 39.3701 * OpenLayers.DOTS_PER_INCH / 256,
					scaleLevels : 20,
					scaleSliderTemplate : "{scaleType} Scale 1:{scale}",
					modifyScaleTipContext : Ext.emptyFn,
					labelFeaturesText : "Label Features",
					labelsText : "Labels",
					basicText : "Basic",
					advancedText : "Advanced",
					limitByScaleText : "Limit by scale",
					limitByConditionText : "Limit by condition",
					symbolText : "Symbol",
					nameText : "Name",
					initComponent : function() {
						var defConfig = {
							plain : true,
							border : false
						};
						Ext.applyIf(this, defConfig);
						if (!this.rule) {
							this.rule = new OpenLayers.Rule({
								name : this.uniqueRuleName()
							});
						} else {
							if (!this.initialConfig.symbolType) {
								this.symbolType = this
										.getSymbolTypeFromRule(this.rule)
										|| this.symbolType;
							}
						}
						this.activeTab = 0;
						this.textSymbolizer = new gxp.TextSymbolizer({
							symbolizer : this.getTextSymbolizer(),
							attributes : this.attributes,
							fonts : this.fonts,
							listeners : {
								change : function(symbolizer) {
									this.fireEvent("change", this, this.rule);
								},
								scope : this
							}
						});
						this.scaleLimitPanel = new gxp.ScaleLimitPanel(
								{
									maxScaleDenominator : this.rule.maxScaleDenominator
											|| undefined,
									limitMaxScaleDenominator : !!this.rule.maxScaleDenominator,
									maxScaleDenominatorLimit : this.maxScaleDenominatorLimit,
									minScaleDenominator : this.rule.minScaleDenominator
											|| undefined,
									limitMinScaleDenominator : !!this.rule.minScaleDenominator,
									minScaleDenominatorLimit : this.minScaleDenominatorLimit,
									scaleLevels : this.scaleLevels,
									scaleSliderTemplate : this.scaleSliderTemplate,
									modifyScaleTipContext : this.modifyScaleTipContext,
									listeners : {
										change : function(comp, min, max) {
											this.rule.minScaleDenominator = min;
											this.rule.maxScaleDenominator = max;
											this.fireEvent("change", this,
													this.rule);
										},
										scope : this
									}
								});
						this.filterBuilder = new gxp.FilterBuilder({
							allowGroups : this.nestedFilters,
							filter : this.rule && this.rule.filter
									&& this.rule.filter.clone(),
							attributes : this.attributes,
							listeners : {
								change : function(builder) {
									var filter = builder.getFilter();
									this.rule.filter = filter;
									this.fireEvent("change", this, this.rule);
								},
								scope : this
							}
						});
						this.items = [ {
							title : this.labelsText,
							autoScroll : true,
							bodyStyle : {
								"padding" : "10px"
							},
							items : [ {
								xtype : "fieldset",
								title : this.labelFeaturesText,
								autoHeight : true,
								checkboxToggle : true,
								collapsed : !this.hasTextSymbolizer(),
								items : [ this.textSymbolizer ],
								listeners : {
									collapse : function() {
										OpenLayers.Util.removeItem(
												this.rule.symbolizers, this
														.getTextSymbolizer());
										this.fireEvent("change", this,
												this.rule);
									},
									expand : function() {
										this
												.setTextSymbolizer(this.textSymbolizer.symbolizer);
										this.fireEvent("change", this,
												this.rule);
									},
									scope : this
								}
							} ]
						} ];
						if (this.getSymbolTypeFromRule(this.rule)
								|| this.symbolType) {
							this.items = [
									{
										title : this.basicText,
										autoScroll : true,
										items : [ this.createHeaderPanel(),
												this.createSymbolizerPanel() ]
									},
									this.items[0],
									{
										title : this.advancedText,
										defaults : {
											style : {
												margin : "7px"
											}
										},
										autoScroll : true,
										items : [
												{
													xtype : "fieldset",
													title : this.limitByScaleText,
													checkboxToggle : true,
													collapsed : !(this.rule && (this.rule.minScaleDenominator || this.rule.maxScaleDenominator)),
													autoHeight : true,
													items : [ this.scaleLimitPanel ],
													listeners : {
														collapse : function() {
															delete this.rule.minScaleDenominator;
															delete this.rule.maxScaleDenominator;
															this.fireEvent(
																	"change",
																	this,
																	this.rule);
														},
														expand : function() {
															var tab = this
																	.getActiveTab();
															this.activeTab = null;
															this
																	.setActiveTab(tab);
															var changed = false;
															if (this.scaleLimitPanel.limitMinScaleDenominator) {
																this.rule.minScaleDenominator = this.scaleLimitPanel.minScaleDenominator;
																changed = true;
															}
															if (this.scaleLimitPanel.limitMaxScaleDenominator) {
																this.rule.maxScaleDenominator = this.scaleLimitPanel.maxScaleDenominator;
																changed = true;
															}
															if (changed) {
																this
																		.fireEvent(
																				"change",
																				this,
																				this.rule);
															}
														},
														scope : this
													}
												},
												{
													xtype : "fieldset",
													title : this.limitByConditionText,
													checkboxToggle : true,
													collapsed : !(this.rule && this.rule.filter),
													autoHeight : true,
													items : [ this.filterBuilder ],
													listeners : {
														collapse : function() {
															delete this.rule.filter;
															this.fireEvent(
																	"change",
																	this,
																	this.rule);
														},
														expand : function() {
															var changed = false;
															this.rule.filter = this.filterBuilder
																	.getFilter();
															this.fireEvent(
																	"change",
																	this,
																	this.rule);
														},
														scope : this
													}
												} ]
									} ];
						}
						;
						this.items[0].autoHeight = true;
						this.addEvents("change");
						this.on({
							tabchange : function(panel, tab) {
								tab.doLayout();
							},
							scope : this
						});
						gxp.RulePanel.superclass.initComponent.call(this);
					},
					hasTextSymbolizer : function() {
						var candidate, symbolizer;
						for ( var i = 0, ii = this.rule.symbolizers.length; i < ii; ++i) {
							candidate = this.rule.symbolizers[i];
							if (candidate instanceof OpenLayers.Symbolizer.Text) {
								symbolizer = candidate;
								break;
							}
						}
						return symbolizer;
					},
					getTextSymbolizer : function() {
						var symbolizer = this.hasTextSymbolizer();
						if (!symbolizer) {
							symbolizer = new OpenLayers.Symbolizer.Text();
						}
						return symbolizer;
					},
					setTextSymbolizer : function(symbolizer) {
						var found;
						for ( var i = 0, ii = this.rule.symbolizers.length; i < ii; ++i) {
							candidate = this.rule.symbolizers[i];
							if (this.rule.symbolizers[i] instanceof OpenLayers.Symbolizer.Text) {
								this.rule.symbolizers[i] = symbolizer;
								found = true;
								break;
							}
						}
						if (!found) {
							this.rule.symbolizers.push(symbolizer);
						}
					},
					uniqueRuleName : function() {
						return OpenLayers.Util.createUniqueID("rule_");
					},
					createHeaderPanel : function() {
						this.symbolizerSwatch = new GeoExt.FeatureRenderer({
							symbolType : this.symbolType,
							isFormField : true,
							fieldLabel : this.symbolText
						});
						return {
							xtype : "form",
							border : false,
							labelAlign : "top",
							defaults : {
								border : false
							},
							style : {
								"padding" : "0.3em 0 0 1em"
							},
							items : [ {
								layout : "column",
								defaults : {
									border : false,
									style : {
										"padding-right" : "1em"
									}
								},
								items : [
										{
											layout : "form",
											width : 150,
											items : [ {
												xtype : "textfield",
												fieldLabel : this.nameText,
												anchor : "95%",
												value : this.rule
														&& (this.rule.title
																|| this.rule.name || ""),
												listeners : {
													change : function(el, value) {
														this.rule.title = value;
														this.fireEvent(
																"change", this,
																this.rule);
													},
													scope : this
												}
											} ]
										}, {
											layout : "form",
											width : 70,
											items : [ this.symbolizerSwatch ]
										} ]
							} ]
						};
					},
					createSymbolizerPanel : function() {
						var candidate, symbolizer;
						var Type = OpenLayers.Symbolizer[this.symbolType];
						var existing = false;
						if (Type) {
							for ( var i = 0, ii = this.rule.symbolizers.length; i < ii; ++i) {
								candidate = this.rule.symbolizers[i];
								if (candidate instanceof Type) {
									existing = true;
									symbolizer = candidate;
									break;
								}
							}
							if (!symbolizer) {
								symbolizer = new Type({
									fill : false,
									stroke : false
								});
							}
						} else {
							throw new Error(
									"Appropriate symbolizer type not included in build: "
											+ this.symbolType);
						}
						this.symbolizerSwatch.setSymbolizers([ symbolizer ], {
							draw : this.symbolizerSwatch.rendered
						});
						var cfg = {
							xtype : "gxp_" + this.symbolType.toLowerCase()
									+ "symbolizer",
							symbolizer : symbolizer,
							bodyStyle : {
								padding : "10px"
							},
							border : false,
							labelWidth : 70,
							defaults : {
								labelWidth : 70
							},
							listeners : {
								change : function(symbolizer) {
									this.symbolizerSwatch
											.setSymbolizers(
													[ symbolizer ],
													{
														draw : this.symbolizerSwatch.rendered
													});
									if (!existing) {
										this.rule.symbolizers.push(symbolizer);
										existing = true;
									}
									this.fireEvent("change", this, this.rule);
								},
								scope : this
							}
						};
						if (this.symbolType === "Point" && this.pointGraphics) {
							cfg.pointGraphics = this.pointGraphics;
						}
						return cfg;
					},
					getSymbolTypeFromRule : function(rule) {
						var candidate, type;
						for ( var i = 0, ii = rule.symbolizers.length; i < ii; ++i) {
							candidate = rule.symbolizers[i];
							if (!(candidate instanceof OpenLayers.Symbolizer.Text)) {
								type = candidate.CLASS_NAME.split(".").pop();
								break;
							}
						}
						return type;
					}
				});
Ext.reg('gxp_rulepanel', gxp.RulePanel);
Ext.namespace("gxp");
gxp.ScaleLimitPanel = Ext
		.extend(
				Ext.Panel,
				{
					maxScaleDenominatorLimit : 40075016.68 * 39.3701 * OpenLayers.DOTS_PER_INCH / 256,
					limitMaxScaleDenominator : true,
					maxScaleDenominator : undefined,
					minScaleDenominatorLimit : Math.pow(0.5, 19) * 40075016.68
							* 39.3701 * OpenLayers.DOTS_PER_INCH / 256,
					limitMinScaleDenominator : true,
					minScaleDenominator : undefined,
					scaleLevels : 20,
					scaleSliderTemplate : "{scaleType} Scale 1:{scale}",
					modifyScaleTipContext : Ext.emptyFn,
					scaleFactor : null,
					changing : false,
					border : false,
					maxScaleLimitText : "Max scale limit",
					minScaleLimitText : "Min scale limit",
					initComponent : function() {
						this.layout = "column";
						this.defaults = {
							border : false,
							bodyStyle : "margin: 0 5px;"
						};
						this.bodyStyle = {
							padding : "5px"
						};
						this.scaleSliderTemplate = new Ext.Template(
								this.scaleSliderTemplate);
						Ext
								.applyIf(
										this,
										{
											minScaleDenominator : this.minScaleDenominatorLimit,
											maxScaleDenominator : this.maxScaleDenominatorLimit
										});
						this.scaleFactor = Math.pow(
								this.maxScaleDenominatorLimit
										/ this.minScaleDenominatorLimit,
								1 / (this.scaleLevels - 1));
						this.scaleSlider = new Ext.Slider(
								{
									vertical : true,
									height : 100,
									values : [ 0, 100 ],
									listeners : {
										changecomplete : function(slider, value) {
											this.updateScaleValues(slider);
										},
										render : function(slider) {
											slider.thumbs[0].el
													.setVisible(this.limitMaxScaleDenominator);
											slider.thumbs[1].el
													.setVisible(this.limitMinScaleDenominator);
											slider
													.setDisabled(!this.limitMinScaleDenominator
															&& !this.limitMaxScaleDenominator);
										},
										scope : this
									},
									plugins : [ new gxp.slider.Tip(
											{
												getText : (function(thumb) {
													var index = thumb.slider.thumbs
															.indexOf(thumb);
													var value = thumb.value;
													var scales = this
															.sliderValuesToScale([ thumb.value ]);
													var data = {
														scale : String(scales[0]),
														zoom : (thumb.value * (this.scaleLevels / 100))
																.toFixed(1),
														type : (index === 0) ? "Max"
																: "Min",
														scaleType : (index === 0) ? "Min"
																: "Max"
													};
													this.modifyScaleTipContext(
															this, data);
													return this.scaleSliderTemplate
															.apply(data);
												}).createDelegate(this)
											}) ]
								});
						this.maxScaleDenominatorInput = new Ext.form.NumberField(
								{
									allowNegative : false,
									width : 100,
									fieldLabel : "1",
									value : Math
											.round(this.maxScaleDenominator),
									disabled : !this.limitMaxScaleDenominator,
									validator : (function(value) {
										return !this.limitMinScaleDenominator
												|| (value > this.minScaleDenominator);
									}).createDelegate(this),
									listeners : {
										valid : function(field) {
											var value = Number(field.getValue());
											var limit = Math
													.round(this.maxScaleDenominatorLimit);
											if (value < limit
													&& value > this.minScaleDenominator) {
												this.maxScaleDenominator = value;
												this.updateSliderValues();
											}
										},
										change : function(field) {
											var value = Number(field.getValue());
											var limit = Math
													.round(this.maxScaleDenominatorLimit);
											if (value > limit) {
												field.setValue(limit);
											} else if (value < this.minScaleDenominator) {
												field
														.setValue(this.minScaleDenominator);
											} else {
												this.maxScaleDenominator = value;
												this.updateSliderValues();
											}
										},
										scope : this
									}
								});
						this.minScaleDenominatorInput = new Ext.form.NumberField(
								{
									allowNegative : false,
									width : 100,
									fieldLabel : "1",
									value : Math
											.round(this.minScaleDenominator),
									disabled : !this.limitMinScaleDenominator,
									validator : (function(value) {
										return !this.limitMaxScaleDenominator
												|| (value < this.maxScaleDenominator);
									}).createDelegate(this),
									listeners : {
										valid : function(field) {
											var value = Number(field.getValue());
											var limit = Math
													.round(this.minScaleDenominatorLimit);
											if (value > limit
													&& value < this.maxScaleDenominator) {
												this.minScaleDenominator = value;
												this.updateSliderValues();
											}
										},
										change : function(field) {
											var value = Number(field.getValue());
											var limit = Math
													.round(this.minScaleDenominatorLimit);
											if (value < limit) {
												field.setValue(limit);
											} else if (value > this.maxScaleDenominator) {
												field
														.setValue(this.maxScaleDenominator);
											} else {
												this.minScaleDenominator = value;
												this.updateSliderValues();
											}
										},
										scope : this
									}
								});
						this.items = [
								this.scaleSlider,
								{
									xtype : "panel",
									layout : "form",
									defaults : {
										border : false
									},
									items : [
											{
												labelWidth : 90,
												layout : "form",
												width : 150,
												items : [ {
													xtype : "checkbox",
													checked : !!this.limitMinScaleDenominator,
													fieldLabel : this.maxScaleLimitText,
													listeners : {
														check : function(box,
																checked) {
															this.limitMinScaleDenominator = checked;
															var slider = this.scaleSlider;
															slider.setValue(1,
																	100);
															slider.thumbs[1].el
																	.setVisible(checked);
															this.minScaleDenominatorInput
																	.setDisabled(!checked);
															this
																	.updateScaleValues(slider);
															slider
																	.setDisabled(!this.limitMinScaleDenominator
																			&& !this.limitMaxScaleDenominator);
														},
														scope : this
													}
												} ]
											},
											{
												labelWidth : 10,
												layout : "form",
												items : [ this.minScaleDenominatorInput ]
											},
											{
												labelWidth : 90,
												layout : "form",
												items : [ {
													xtype : "checkbox",
													checked : !!this.limitMaxScaleDenominator,
													fieldLabel : this.minScaleLimitText,
													listeners : {
														check : function(box,
																checked) {
															this.limitMaxScaleDenominator = checked;
															var slider = this.scaleSlider;
															slider.setValue(0,
																	0);
															slider.thumbs[0].el
																	.setVisible(checked);
															this.maxScaleDenominatorInput
																	.setDisabled(!checked);
															this
																	.updateScaleValues(slider);
															slider
																	.setDisabled(!this.limitMinScaleDenominator
																			&& !this.limitMaxScaleDenominator);
														},
														scope : this
													}
												} ]
											},
											{
												labelWidth : 10,
												layout : "form",
												items : [ this.maxScaleDenominatorInput ]
											} ]
								} ];
						this.addEvents("change");
						gxp.ScaleLimitPanel.superclass.initComponent.call(this);
					},
					updateScaleValues : function(slider) {
						if (!this.changing) {
							var values = slider.getValues();
							var resetSlider = false;
							if (!this.limitMaxScaleDenominator) {
								if (values[0] > 0) {
									values[0] = 0;
									resetSlider = true;
								}
							}
							if (!this.limitMinScaleDenominator) {
								if (values[1] < 100) {
									values[1] = 100;
									resetSlider = true;
								}
							}
							if (resetSlider) {
								slider.setValue(0, values[0]);
								slider.setValue(1, values[1]);
							} else {
								var scales = this.sliderValuesToScale(values);
								var max = scales[0];
								var min = scales[1];
								this.changing = true;
								this.minScaleDenominatorInput.setValue(min);
								this.maxScaleDenominatorInput.setValue(max);
								this.changing = false;
								this.fireEvent("change", this,
										(this.limitMinScaleDenominator) ? min
												: undefined,
										(this.limitMaxScaleDenominator) ? max
												: undefined);
							}
						}
					},
					updateSliderValues : function() {
						if (!this.changing) {
							var min = this.minScaleDenominator;
							var max = this.maxScaleDenominator;
							var values = this.scaleToSliderValues([ max, min ]);
							this.changing = true;
							this.scaleSlider.setValue(0, values[0]);
							this.scaleSlider.setValue(1, values[1]);
							this.changing = false;
							this.fireEvent("change", this,
									(this.limitMinScaleDenominator) ? min
											: undefined,
									(this.limitMaxScaleDenominator) ? max
											: undefined);
						}
					},
					sliderValuesToScale : function(values) {
						var interval = 100 / (this.scaleLevels - 1);
						return [
								Math.round(Math.pow(this.scaleFactor,
										(100 - values[0]) / interval)
										* this.minScaleDenominatorLimit),
								Math.round(Math.pow(this.scaleFactor,
										(100 - values[1]) / interval)
										* this.minScaleDenominatorLimit) ];
					},
					scaleToSliderValues : function(scales) {
						var interval = 100 / (this.scaleLevels - 1);
						return [
								100 - (interval
										* Math
												.log(scales[0]
														/ this.minScaleDenominatorLimit) / Math
										.log(this.scaleFactor)),
								100 - (interval
										* Math
												.log(scales[1]
														/ this.minScaleDenominatorLimit) / Math
										.log(this.scaleFactor)) ];
					}
				});
Ext.reg('gxp_scalelimitpanel', gxp.ScaleLimitPanel);
Ext.namespace("gxp.slider");
gxp.slider.Tip = Ext.extend(Ext.slider.Tip, {
	hover : true,
	dragging : false,
	init : function(slider) {
		if (this.hover) {
			slider.on("render", this.registerThumbListeners, this);
		}
		this.slider = slider;
		gxp.slider.Tip.superclass.init.apply(this, arguments);
	},
	registerThumbListeners : function() {
		for ( var i = 0, len = this.slider.thumbs.length; i < len; ++i) {
			this.slider.thumbs[i].el.on({
				"mouseover" : this.createHoverListener(i),
				"mouseout" : function() {
					if (!this.dragging) {
						this.hide.apply(this, arguments);
					}
				},
				scope : this
			});
		}
	},
	createHoverListener : function(index) {
		return (function() {
			this.onSlide(this.slider, {}, this.slider.thumbs[index]);
			this.dragging = false;
		}).createDelegate(this);
	},
	onSlide : function(slider, e, thumb) {
		this.dragging = true;
		gxp.slider.Tip.superclass.onSlide.apply(this, arguments);
	}
});
Ext.namespace("gxp");
gxp.TextSymbolizer = Ext
		.extend(
				Ext.Panel,
				{
					fonts : undefined,
					symbolizer : null,
					defaultSymbolizer : null,
					attributes : null,
					colorManager : null,
					haloCache : null,
					border : false,
					layout : "form",
					labelValuesText : "Label values",
					haloText : "Halo",
					sizeText : "Size",
					initComponent : function() {
						if (!this.symbolizer) {
							this.symbolizer = {};
						}
						Ext.applyIf(this.symbolizer, this.defaultSymbolizer);
						this.haloCache = {};
						var defAttributesComboConfig = {
							xtype : "combo",
							fieldLabel : this.labelValuesText,
							store : this.attributes,
							editable : false,
							triggerAction : "all",
							allowBlank : false,
							displayField : "name",
							valueField : "name",
							value : this.symbolizer.label
									&& this.symbolizer.label.replace(
											/^\${(.*)}$/, "$1"),
							listeners : {
								select : function(combo, record) {
									this.symbolizer.label = "${"
											+ record.get("name") + "}";
									this.fireEvent("change", this.symbolizer);
								},
								scope : this
							},
							width : 120
						};
						this.attributesComboConfig = this.attributesComboConfig
								|| {};
						Ext.applyIf(this.attributesComboConfig,
								defAttributesComboConfig);
						this.labelWidth = 80;
						this.items = [
								this.attributesComboConfig,
								{
									cls : "x-html-editor-tb",
									style : "background: transparent; border: none; padding: 0 0em 0.5em;",
									xtype : "toolbar",
									items : [
											{
												xtype : "gxp_fontcombo",
												fonts : this.fonts || undefined,
												width : 110,
												value : this.symbolizer.fontFamily,
												listeners : {
													select : function(combo,
															record) {
														this.symbolizer.fontFamily = record
																.get("field1");
														this
																.fireEvent(
																		"change",
																		this.symbolizer);
													},
													scope : this
												}
											},
											{
												xtype : "tbtext",
												text : this.sizeText + ": "
											},
											{
												xtype : "numberfield",
												allowNegative : false,
												emptyText : OpenLayers.Renderer.defaultSymbolizer.fontSize,
												value : this.symbolizer.fontSize,
												width : 30,
												listeners : {
													change : function(field,
															value) {
														value = parseFloat(value);
														if (isNaN(value)) {
															delete this.symbolizer.fontSize;
														} else {
															this.symbolizer.fontSize = value;
														}
														this
																.fireEvent(
																		"change",
																		this.symbolizer);
													},
													scope : this
												}
											},
											{
												enableToggle : true,
												cls : "x-btn-icon",
												iconCls : "x-edit-bold",
												pressed : this.symbolizer.fontWeight === "bold",
												listeners : {
													toggle : function(button,
															pressed) {
														this.symbolizer.fontWeight = pressed ? "bold"
																: "normal";
														this
																.fireEvent(
																		"change",
																		this.symbolizer);
													},
													scope : this
												}
											},
											{
												enableToggle : true,
												cls : "x-btn-icon",
												iconCls : "x-edit-italic",
												pressed : this.symbolizer.fontStyle === "italic",
												listeners : {
													toggle : function(button,
															pressed) {
														this.symbolizer.fontStyle = pressed ? "italic"
																: "normal";
														this
																.fireEvent(
																		"change",
																		this.symbolizer);
													},
													scope : this
												}
											} ]
								},
								{
									xtype : "gxp_fillsymbolizer",
									symbolizer : this.symbolizer,
									defaultColor : OpenLayers.Renderer.defaultSymbolizer.fontColor,
									checkboxToggle : false,
									autoHeight : true,
									width : 213,
									labelWidth : 70,
									plugins : this.colorManager
											&& [ new this.colorManager() ],
									listeners : {
										change : function(symbolizer) {
											this.fireEvent("change",
													this.symbolizer);
										},
										scope : this
									}
								},
								{
									xtype : "fieldset",
									title : this.haloText,
									checkboxToggle : true,
									collapsed : !(this.symbolizer.haloRadius
											|| this.symbolizer.haloColor || this.symbolizer.haloOpacity),
									autoHeight : true,
									labelWidth : 50,
									items : [
											{
												xtype : "numberfield",
												fieldLabel : this.sizeText,
												anchor : "89%",
												allowNegative : false,
												emptyText : OpenLayers.Renderer.defaultSymbolizer.haloRadius,
												value : this.symbolizer.haloRadius,
												listeners : {
													change : function(field,
															value) {
														value = parseFloat(value);
														if (isNaN(value)) {
															delete this.symbolizer.haloRadius;
														} else {
															this.symbolizer.haloRadius = value;
														}
														this
																.fireEvent(
																		"change",
																		this.symbolizer);
													},
													scope : this
												}
											},
											{
												xtype : "gxp_fillsymbolizer",
												symbolizer : {
													fillColor : ("haloColor" in this.symbolizer) ? this.symbolizer.haloColor
															: OpenLayers.Renderer.defaultSymbolizer.haloColor,
													fillOpacity : ("haloOpacity" in this.symbolizer) ? this.symbolizer.haloOpacity
															: OpenLayers.Renderer.defaultSymbolizer.haloOpacity
												},
												defaultColor : OpenLayers.Renderer.defaultSymbolizer.haloColor,
												checkboxToggle : false,
												width : 190,
												labelWidth : 60,
												plugins : this.colorManager
														&& [ new this.colorManager() ],
												listeners : {
													change : function(
															symbolizer) {
														this.symbolizer.haloColor = symbolizer.fillColor;
														this.symbolizer.haloOpacity = symbolizer.fillOpacity;
														this
																.fireEvent(
																		"change",
																		this.symbolizer);
													},
													scope : this
												}
											} ],
									listeners : {
										collapse : function() {
											this.haloCache = {
												haloRadius : this.symbolizer.haloRadius,
												haloColor : this.symbolizer.haloColor,
												haloOpacity : this.symbolizer.haloOpacity
											};
											delete this.symbolizer.haloRadius;
											delete this.symbolizer.haloColor;
											delete this.symbolizer.haloOpacity;
											this.fireEvent("change",
													this.symbolizer)
										},
										expand : function() {
											Ext.apply(this.symbolizer,
													this.haloCache);
											this.doLayout();
											this.fireEvent("change",
													this.symbolizer);
										},
										scope : this
									}
								} ];
						this.addEvents("change");
						gxp.TextSymbolizer.superclass.initComponent.call(this);
					}
				});
Ext.reg('gxp_textsymbolizer', gxp.TextSymbolizer);
Ext.namespace("gxp");
gxp.FillSymbolizer = Ext
		.extend(
				Ext.FormPanel,
				{
					symbolizer : null,
					colorManager : null,
					checkboxToggle : true,
					defaultColor : null,
					border : false,
					fillText : "Fill",
					colorText : "Color",
					opacityText : "Opacity",
					initComponent : function() {
						if (!this.symbolizer) {
							this.symbolizer = {};
						}
						var colorFieldPlugins;
						if (this.colorManager) {
							colorFieldPlugins = [ new this.colorManager() ];
						}
						this.items = [ {
							xtype : "fieldset",
							title : this.fillText,
							autoHeight : true,
							checkboxToggle : this.checkboxToggle,
							collapsed : this.checkboxToggle === true
									&& this.symbolizer.fill === false,
							hideMode : "offsets",
							defaults : {
								width : 100
							},
							items : [
									{
										xtype : "gxp_colorfield",
										fieldLabel : this.colorText,
										name : "color",
										emptyText : OpenLayers.Renderer.defaultSymbolizer.fillColor,
										value : this.symbolizer.fillColor,
										defaultBackground : this.defaultColor
												|| OpenLayers.Renderer.defaultSymbolizer.fillColor,
										plugins : colorFieldPlugins,
										listeners : {
											valid : function(field) {
												var newValue = field.getValue();
												var modified = this.symbolizer.fillColor != newValue;
												this.symbolizer.fillColor = newValue;
												modified
														&& this
																.fireEvent(
																		"change",
																		this.symbolizer);
											},
											scope : this
										}
									},
									{
										xtype : "slider",
										fieldLabel : this.opacityText,
										name : "opacity",
										values : [ (("fillOpacity" in this.symbolizer) ? this.symbolizer.fillOpacity
												: OpenLayers.Renderer.defaultSymbolizer.fillOpacity) * 100 ],
										isFormField : true,
										listeners : {
											changecomplete : function(slider,
													value) {
												this.symbolizer.fillOpacity = value / 100;
												this.fireEvent("change",
														this.symbolizer);
											},
											scope : this
										},
										plugins : [ new GeoExt.SliderTip({
											getText : function(thumb) {
												return thumb.value + "%";
											}
										}) ]
									} ],
							listeners : {
								"collapse" : function() {
									if (this.symbolizer.fill !== false) {
										this.symbolizer.fill = false;
										this.fireEvent("change",
												this.symbolizer);
									}
								},
								"expand" : function() {
									this.symbolizer.fill = true;
									this.fireEvent("change", this.symbolizer);
								},
								scope : this
							}
						} ];
						this.addEvents("change");
						gxp.FillSymbolizer.superclass.initComponent.call(this);
					}
				});
Ext.reg('gxp_fillsymbolizer', gxp.FillSymbolizer);
Ext.namespace("gxp.form");
gxp.form.ColorField = Ext.extend(Ext.form.TextField, {
	cssColors : {
		aqua : "#00FFFF",
		black : "#000000",
		blue : "#0000FF",
		fuchsia : "#FF00FF",
		gray : "#808080",
		green : "#008000",
		lime : "#00FF00",
		maroon : "#800000",
		navy : "#000080",
		olive : "#808000",
		purple : "#800080",
		red : "#FF0000",
		silver : "#C0C0C0",
		teal : "#008080",
		white : "#FFFFFF",
		yellow : "#FFFF00"
	},
	defaultBackground : "#ffffff",
	initComponent : function() {
		if (this.value) {
			this.value = this.hexToColor(this.value);
		}
		gxp.form.ColorField.superclass.initComponent.call(this);
		this.on({
			render : this.colorField,
			valid : this.colorField,
			scope : this
		});
	},
	isDark : function(hex) {
		var dark = false;
		if (hex) {
			var r = parseInt(hex.substring(1, 3), 16) / 255;
			var g = parseInt(hex.substring(3, 5), 16) / 255;
			var b = parseInt(hex.substring(5, 7), 16) / 255;
			var brightness = (r * 0.299) + (g * 0.587) + (b * 0.144);
			dark = brightness < 0.5;
		}
		return dark;
	},
	colorField : function() {
		var color = this.colorToHex(this.getValue()) || this.defaultBackground;
		this.getEl().setStyle({
			"background" : color,
			"color" : this.isDark(color) ? "#ffffff" : "#000000"
		});
	},
	getHexValue : function() {
		return this.colorToHex(gxp.form.ColorField.superclass.getValue.apply(
				this, arguments));
	},
	getValue : function() {
		var v = this.getHexValue();
		var o = this.initialConfig.value;
		if (v === this.hexToColor(o)) {
			v = o;
		}
		return v;
	},
	setValue : function(value) {
		gxp.form.ColorField.superclass.setValue.apply(this, [ this
				.hexToColor(value) ]);
	},
	colorToHex : function(color) {
		if (!color) {
			return color;
		}
		var hex;
		if (color.match(/^#[0-9a-f]{6}$/i)) {
			hex = color;
		} else {
			hex = this.cssColors[color.toLowerCase()] || null;
		}
		return hex;
	},
	hexToColor : function(hex) {
		if (!hex) {
			return hex;
		}
		var color = hex;
		for ( var c in this.cssColors) {
			if (this.cssColors[c] == color.toUpperCase()) {
				color = c;
				break;
			}
		}
		return color;
	}
});
Ext.reg("gxp_colorfield", gxp.form.ColorField);
Ext.namespace("gxp.form");
gxp.form.FontComboBox = Ext.extend(Ext.form.ComboBox, {
	fonts : [ "Serif", "SansSerif", "Arial", "Courier New", "Tahoma",
			"Times New Roman", "Verdana" ],
	defaultFont : "Serif",
	allowBlank : false,
	mode : "local",
	triggerAction : "all",
	editable : false,
	initComponent : function() {
		var fonts = this.fonts || gxp.form.FontComboBox.prototype.fonts;
		var defaultFont = this.defaultFont;
		if (fonts.indexOf(this.defaultFont) === -1) {
			defaultFont = fonts[0];
		}
		var defConfig = {
			displayField : "field1",
			valueField : "field1",
			store : fonts,
			value : defaultFont,
			tpl : new Ext.XTemplate('<tpl for=".">'
					+ '<div class="x-combo-list-item">'
					+ '<span style="font-family: {field1};">{field1}</span>'
					+ '</div></tpl>')
		};
		Ext.applyIf(this, defConfig);
		gxp.form.FontComboBox.superclass.initComponent.call(this);
	}
});
Ext.reg("gxp_fontcombo", gxp.form.FontComboBox);
Ext.namespace("gxp");
gxp.PolygonSymbolizer = Ext.extend(Ext.Panel, {
	symbolizer : null,
	initComponent : function() {
		this.items = [ {
			xtype : "gxp_fillsymbolizer",
			symbolizer : this.symbolizer,
			listeners : {
				change : function(symbolizer) {
					this.fireEvent("change", this.symbolizer);
				},
				scope : this
			}
		}, {
			xtype : "gxp_strokesymbolizer",
			symbolizer : this.symbolizer,
			listeners : {
				change : function(symbolizer) {
					this.fireEvent("change", this.symbolizer);
				},
				scope : this
			}
		} ];
		this.addEvents("change");
		gxp.PolygonSymbolizer.superclass.initComponent.call(this);
	}
});
Ext.reg('gxp_polygonsymbolizer', gxp.PolygonSymbolizer);
Ext.namespace("gxp");
gxp.StrokeSymbolizer = Ext
		.extend(
				Ext.FormPanel,
				{
					solidStrokeName : "solid",
					dashStrokeName : "dash",
					dotStrokeName : "dot",
					titleText : "Stroke",
					styleText : "Style",
					colorText : "Color",
					widthText : "Width",
					opacityText : "Opacity",
					symbolizer : null,
					colorManager : null,
					checkboxToggle : true,
					defaultColor : null,
					dashStyles : null,
					border : false,
					initComponent : function() {
						this.dashStyles = this.dashStyles
								|| [ [ "solid", this.solidStrokeName ],
										[ "4 4", this.dashStrokeName ],
										[ "2 4", this.dotStrokeName ] ];
						if (!this.symbolizer) {
							this.symbolizer = {};
						}
						var colorFieldPlugins;
						if (this.colorManager) {
							colorFieldPlugins = [ new this.colorManager ];
						}
						this.items = [ {
							xtype : "fieldset",
							title : this.titleText,
							autoHeight : true,
							checkboxToggle : this.checkboxToggle,
							collapsed : this.checkboxToggle === true
									&& this.symbolizer.stroke === false,
							hideMode : "offsets",
							defaults : {
								width : 100
							},
							items : [
									{
										xtype : "combo",
										name : "style",
										fieldLabel : this.styleText,
										store : new Ext.data.SimpleStore({
											data : this.dashStyles,
											fields : [ "value", "display" ]
										}),
										displayField : "display",
										valueField : "value",
										value : this
												.getDashArray(this.symbolizer.strokeDashstyle)
												|| OpenLayers.Renderer.defaultSymbolizer.strokeDashstyle,
										mode : "local",
										allowBlank : true,
										triggerAction : "all",
										editable : false,
										listeners : {
											select : function(combo, record) {
												this.symbolizer.strokeDashstyle = record
														.get("value");
												this.fireEvent("change",
														this.symbolizer);
											},
											scope : this
										}
									},
									{
										xtype : "gxp_colorfield",
										name : "color",
										fieldLabel : this.colorText,
										emptyText : OpenLayers.Renderer.defaultSymbolizer.strokeColor,
										value : this.symbolizer.strokeColor,
										defaultBackground : this.defaultColor
												|| OpenLayers.Renderer.defaultSymbolizer.strokeColor,
										plugins : colorFieldPlugins,
										listeners : {
											valid : function(field) {
												var newValue = field.getValue();
												var modified = this.symbolizer.strokeColor != newValue;
												this.symbolizer.strokeColor = newValue;
												modified
														&& this
																.fireEvent(
																		"change",
																		this.symbolizer);
											},
											scope : this
										}
									},
									{
										xtype : "numberfield",
										name : "width",
										fieldLabel : this.widthText,
										allowNegative : false,
										emptyText : OpenLayers.Renderer.defaultSymbolizer.strokeWidth,
										value : this.symbolizer.strokeWidth,
										listeners : {
											change : function(field, value) {
												value = parseFloat(value);
												if (isNaN(value)) {
													delete this.symbolizer.strokeWidth;
												} else {
													this.symbolizer.strokeWidth = value;
												}
												this.fireEvent("change",
														this.symbolizer);
											},
											scope : this
										}
									},
									{
										xtype : "slider",
										name : "opacity",
										fieldLabel : this.opacityText,
										values : [ (("strokeOpacity" in this.symbolizer) ? this.symbolizer.strokeOpacity
												: OpenLayers.Renderer.defaultSymbolizer.strokeOpacity) * 100 ],
										isFormField : true,
										listeners : {
											changecomplete : function(slider,
													value) {
												this.symbolizer.strokeOpacity = value / 100;
												this.fireEvent("change",
														this.symbolizer);
											},
											scope : this
										},
										plugins : [ new GeoExt.SliderTip({
											getText : function(thumb) {
												return thumb.value + "%";
											}
										}) ]
									} ],
							listeners : {
								"collapse" : function() {
									if (this.symbolizer.stroke !== false) {
										this.symbolizer.stroke = false;
										this.fireEvent("change",
												this.symbolizer);
									}
								},
								"expand" : function() {
									this.symbolizer.stroke = true;
									this.fireEvent("change", this.symbolizer);
								},
								scope : this
							}
						} ];
						this.addEvents("change");
						gxp.StrokeSymbolizer.superclass.initComponent
								.call(this);
					},
					getDashArray : function(style) {
						var array;
						if (style) {
							var parts = style.split(/\s+/);
							var ratio = parts[0] / parts[1];
							var array;
							if (!isNaN(ratio)) {
								array = ratio >= 1 ? "4 4" : "2 4";
							}
						}
						return array;
					}
				});
Ext.reg('gxp_strokesymbolizer', gxp.StrokeSymbolizer);
Ext.namespace("gxp");
gxp.LineSymbolizer = Ext.extend(Ext.Panel, {
	symbolizer : null,
	initComponent : function() {
		this.items = [ {
			xtype : "gxp_strokesymbolizer",
			symbolizer : this.symbolizer,
			listeners : {
				change : function(symbolizer) {
					this.fireEvent("change", this.symbolizer);
				},
				scope : this
			}
		} ];
		this.addEvents("change");
		gxp.LineSymbolizer.superclass.initComponent.call(this);
	}
});
Ext.reg('gxp_linesymbolizer', gxp.LineSymbolizer);
Ext.namespace("gxp");
gxp.PointSymbolizer = Ext
		.extend(
				Ext.Panel,
				{
					symbolizer : null,
					graphicCircleText : "circle",
					graphicSquareText : "square",
					graphicTriangleText : "triangle",
					graphicStarText : "star",
					graphicCrossText : "cross",
					graphicXText : "x",
					graphicExternalText : "external",
					urlText : "URL",
					opacityText : "opacity",
					symbolText : "Symbol",
					sizeText : "Size",
					rotationText : "Rotation",
					pointGraphics : null,
					colorManager : null,
					external : null,
					layout : "form",
					initComponent : function() {
						if (!this.symbolizer) {
							this.symbolizer = {};
						}
						if (!this.pointGraphics) {
							this.pointGraphics = [ {
								display : this.graphicCircleText,
								value : "circle",
								mark : true
							}, {
								display : this.graphicSquareText,
								value : "square",
								mark : true
							}, {
								display : this.graphicTriangleText,
								value : "triangle",
								mark : true
							}, {
								display : this.graphicStarText,
								value : "star",
								mark : true
							}, {
								display : this.graphicCrossText,
								value : "cross",
								mark : true
							}, {
								display : this.graphicXText,
								value : "x",
								mark : true
							}, {
								display : this.graphicExternalText
							} ];
						}
						this.external = !!this.symbolizer["externalGraphic"];
						this.markPanel = new Ext.Panel({
							border : false,
							collapsed : this.external,
							layout : "form",
							items : [
									{
										xtype : "gxp_fillsymbolizer",
										symbolizer : this.symbolizer,
										labelWidth : this.labelWidth,
										labelAlign : this.labelAlign,
										colorManager : this.colorManager,
										listeners : {
											change : function(symbolizer) {
												this.fireEvent("change",
														this.symbolizer);
											},
											scope : this
										}
									},
									{
										xtype : "gxp_strokesymbolizer",
										symbolizer : this.symbolizer,
										labelWidth : this.labelWidth,
										labelAlign : this.labelAlign,
										colorManager : this.colorManager,
										listeners : {
											change : function(symbolizer) {
												this.fireEvent("change",
														this.symbolizer);
											},
											scope : this
										}
									} ]
						});
						this.urlField = new Ext.form.TextField({
							name : "url",
							fieldLabel : this.urlText,
							value : this.symbolizer["externalGraphic"],
							hidden : true,
							listeners : {
								change : function(field, value) {
									this.symbolizer["externalGraphic"] = value;
									this.fireEvent("change", this.symbolizer);
								},
								scope : this
							},
							width : 100
						});
						this.graphicPanel = new Ext.Panel(
								{
									border : false,
									collapsed : !this.external,
									layout : "form",
									items : [
											this.urlField,
											{
												xtype : "slider",
												name : "opacity",
												fieldLabel : this.opacityText,
												value : [ (this.symbolizer["graphicOpacity"] == null) ? 100
														: this.symbolizer["graphicOpacity"] * 100 ],
												isFormField : true,
												listeners : {
													changecomplete : function(
															slider, value) {
														this.symbolizer["graphicOpacity"] = value / 100;
														this
																.fireEvent(
																		"change",
																		this.symbolizer);
													},
													scope : this
												},
												plugins : [ new GeoExt.SliderTip(
														{
															getText : function(
																	thumb) {
																return thumb.value
																		+ "%";
															}
														}) ],
												width : 100
											} ]
								});
						this.items = [
								{
									xtype : "combo",
									name : "mark",
									fieldLabel : this.symbolText,
									store : new Ext.data.JsonStore({
										data : {
											root : this.pointGraphics
										},
										root : "root",
										fields : [ "value", "display",
												"preview", {
													name : "mark",
													type : "boolean"
												} ]
									}),
									value : this.external ? 0
											: this.symbolizer["graphicName"],
									displayField : "display",
									valueField : "value",
									tpl : new Ext.XTemplate(
											'<tpl for=".">'
													+ '<div class="x-combo-list-item gx-pointsymbolizer-mark-item">'
													+ '<tpl if="preview">'
													+ '<img src="{preview}" alt="{display}"/>'
													+ '</tpl>'
													+ '<span>{display}</span>'
													+ '</div></tpl>'),
									mode : "local",
									allowBlank : false,
									triggerAction : "all",
									editable : false,
									listeners : {
										select : function(combo, record) {
											var mark = record.get("mark");
											var value = record.get("value");
											if (!mark) {
												if (value) {
													this.urlField.hide();
													this.urlField
															.getEl()
															.up('.x-form-item')
															.setDisplayed(false);
													this.symbolizer["externalGraphic"] = value;
												} else {
													this.urlField.show();
													this.urlField.getEl().up(
															'.x-form-item')
															.setDisplayed(true);
												}
												if (!this.external) {
													this.external = true;
													this.updateGraphicDisplay();
												}
											} else {
												if (this.external) {
													this.external = false;
													delete this.symbolizer["externalGraphic"];
													this.updateGraphicDisplay();
												}
												this.symbolizer["graphicName"] = value;
											}
											this.fireEvent("change",
													this.symbolizer);
										},
										scope : this
									},
									width : 100
								},
								{
									xtype : "textfield",
									name : "size",
									fieldLabel : this.sizeText,
									value : this.symbolizer["pointRadius"]
											&& this.symbolizer["pointRadius"]
											* 2,
									listeners : {
										change : function(field, value) {
											this.symbolizer["pointRadius"] = value / 2;
											this.fireEvent("change",
													this.symbolizer);
										},
										scope : this
									},
									width : 100
								},
								{
									xtype : "textfield",
									name : "rotation",
									fieldLabel : this.rotationText,
									value : this.symbolizer["rotation"],
									listeners : {
										change : function(field, value) {
											this.symbolizer["rotation"] = value;
											this.fireEvent("change",
													this.symbolizer);
										},
										scope : this
									},
									width : 100
								}, this.markPanel, this.graphicPanel ];
						this.addEvents("change");
						gxp.PointSymbolizer.superclass.initComponent.call(this);
					},
					updateGraphicDisplay : function() {
						if (this.external) {
							this.markPanel.collapse();
							this.graphicPanel.expand();
						} else {
							this.graphicPanel.collapse();
							this.markPanel.expand();
						}
					}
				});
Ext.reg('gxp_pointsymbolizer', gxp.PointSymbolizer);
Ext.namespace("gxp");
gxp.FilterBuilder = Ext
		.extend(
				Ext.Container,
				{
					builderTypeNames : [ "any", "all", "none", "not all" ],
					allowedBuilderTypes : null,
					allowBlank : false,
					preComboText : "Match",
					postComboText : "of the following:",
					cls : "gxp-filterbuilder",
					builderType : null,
					childFilterContainer : null,
					customizeFilterOnInit : true,
					addConditionText : "add condition",
					addGroupText : "add group",
					removeConditionText : "remove condition",
					allowGroups : true,
					initComponent : function() {
						var defConfig = {
							defaultBuilderType : gxp.FilterBuilder.ANY_OF
						};
						Ext.applyIf(this, defConfig);
						if (this.customizeFilterOnInit) {
							this.filter = this.customizeFilter(this.filter);
						}
						this.builderType = this.getBuilderType();
						this.items = [ {
							xtype : "container",
							layout : "form",
							defaults : {
								anchor : "100%"
							},
							hideLabels : true,
							items : [ {
								xtype : "compositefield",
								style : "padding-left: 2px",
								items : [ {
									xtype : "label",
									style : "padding-top: 0.3em",
									text : this.preComboText
								}, this.createBuilderTypeCombo(), {
									xtype : "label",
									style : "padding-top: 0.3em",
									text : this.postComboText
								} ]
							}, this.createChildFiltersPanel(), {
								xtype : "toolbar",
								items : this.createToolBar()
							} ]
						} ];
						this.addEvents("change");
						gxp.FilterBuilder.superclass.initComponent.call(this);
					},
					createToolBar : function() {
						var bar = [ {
							text : this.addConditionText,
							iconCls : "add",
							handler : function() {
								this.addCondition();
							},
							scope : this
						} ];
						if (this.allowGroups) {
							bar.push({
								text : this.addGroupText,
								iconCls : "add",
								handler : function() {
									this.addCondition(true);
								},
								scope : this
							});
						}
						return bar;
					},
					getFilter : function() {
						var filter;
						if (this.filter) {
							filter = this.filter.clone();
							if (filter instanceof OpenLayers.Filter.Logical) {
								filter = this.cleanFilter(filter);
							}
						}
						return filter;
					},
					cleanFilter : function(filter) {
						if (filter instanceof OpenLayers.Filter.Logical) {
							if (filter.type !== OpenLayers.Filter.Logical.NOT
									&& filter.filters.length === 1) {
								filter = this.cleanFilter(filter.filters[0]);
							} else {
								var child;
								for ( var i = 0, len = filter.filters.length; i < len; ++i) {
									child = filter.filters[i];
									if (child instanceof OpenLayers.Filter.Logical) {
										child = this.cleanFilter(child);
										if (child) {
											filter.filters[i] = child;
										} else {
											filter = child;
											break;
										}
									} else if (!child
											|| child.type === null
											|| child.property === null
											|| child[filter.type === OpenLayers.Filter.Comparison.BETWEEN ? "lowerBoundary"
													: "value"] === null) {
										filter = false;
										break;
									}
								}
							}
						} else {
							if (!filter
									|| filter.type === null
									|| filter.property === null
									|| filter[filter.type === OpenLayers.Filter.Comparison.BETWEEN ? "lowerBoundary"
											: "value"] === null) {
								filter = false;
							}
						}
						return filter;
					},
					customizeFilter : function(filter) {
						if (!filter) {
							filter = this
									.wrapFilter(this.createDefaultFilter());
						} else {
							filter = this.cleanFilter(filter);
							var child, i, len;
							switch (filter.type) {
							case OpenLayers.Filter.Logical.AND:
							case OpenLayers.Filter.Logical.OR:
								if (!filter.filters
										|| filter.filters.length === 0) {
									filter.filters = [ this
											.createDefaultFilter() ];
								} else {
									for (i = 0, len = filter.filters.length; i < len; ++i) {
										child = filter.filters[i];
										if (child instanceof OpenLayers.Filter.Logical) {
											filter.filters[i] = this
													.customizeFilter(child);
										}
									}
								}
								filter = new OpenLayers.Filter.Logical({
									type : OpenLayers.Filter.Logical.OR,
									filters : [ filter ]
								});
								break;
							case OpenLayers.Filter.Logical.NOT:
								if (!filter.filters
										|| filter.filters.length === 0) {
									filter.filters = [ new OpenLayers.Filter.Logical(
											{
												type : OpenLayers.Filter.Logical.OR,
												filters : [ this
														.createDefaultFilter() ]
											}) ];
								} else {
									child = filter.filters[0];
									if (child instanceof OpenLayers.Filter.Logical) {
										if (child.type !== OpenLayers.Filter.Logical.NOT) {
											var grandchild;
											for (i = 0,
													len = child.filters.length; i < len; ++i) {
												grandchild = child.filters[i];
												if (grandchild instanceof OpenLayers.Filter.Logical) {
													child.filters[i] = this
															.customizeFilter(grandchild);
												}
											}
										} else {
											if (child.filters
													&& child.filters.length > 0) {
												filter = this
														.customizeFilter(child.filters[0]);
											} else {
												filter = this.wrapFilter(this
														.createDefaultFilter());
											}
										}
									} else {
										var type;
										if (this.defaultBuilderType === gxp.FilterBuilder.NOT_ALL_OF) {
											type = OpenLayers.Filter.Logical.AND;
										} else {
											type = OpenLayers.Filter.Logical.OR;
										}
										filter.filters = [ new OpenLayers.Filter.Logical(
												{
													type : type,
													filters : [ child ]
												}) ];
									}
								}
								break;
							default:
								filter = this.wrapFilter(filter);
								break;
							}
						}
						return filter;
					},
					createDefaultFilter : function() {
						return new OpenLayers.Filter.Comparison();
					},
					wrapFilter : function(filter) {
						var type;
						if (this.defaultBuilderType === gxp.FilterBuilder.ALL_OF) {
							type = OpenLayers.Filter.Logical.AND;
						} else {
							type = OpenLayers.Filter.Logical.OR;
						}
						return new OpenLayers.Filter.Logical({
							type : OpenLayers.Filter.Logical.OR,
							filters : [ new OpenLayers.Filter.Logical({
								type : type,
								filters : [ filter ]
							}) ]
						});
					},
					addCondition : function(group) {
						var filter, type;
						if (group) {
							type = "gxp_filterbuilder";
							filter = this
									.wrapFilter(this.createDefaultFilter());
						} else {
							type = "gxp_filterfield";
							filter = this.createDefaultFilter();
						}
						var newChild = this.newRow({
							xtype : type,
							filter : filter,
							columnWidth : 1,
							attributes : this.attributes,
							allowBlank : group ? undefined : this.allowBlank,
							customizeFilterOnInit : group && false,
							listeners : {
								change : function() {
									this.fireEvent("change", this);
								},
								scope : this
							}
						});
						this.childFilterContainer.add(newChild);
						this.filter.filters[0].filters.push(filter);
						this.childFilterContainer.doLayout();
					},
					removeCondition : function(item, filter) {
						var parent = this.filter.filters[0].filters;
						if (parent.length > 1) {
							parent.remove(filter);
							this.childFilterContainer.remove(item, true);
						}
						this.fireEvent("change", this);
					},
					createBuilderTypeCombo : function() {
						var types = this.allowedBuilderTypes
								|| [ gxp.FilterBuilder.ANY_OF,
										gxp.FilterBuilder.ALL_OF,
										gxp.FilterBuilder.NONE_OF ];
						var numTypes = types.length;
						var data = new Array(numTypes);
						var type;
						for ( var i = 0; i < numTypes; ++i) {
							type = types[i];
							data[i] = [ type, this.builderTypeNames[type] ];
						}
						return {
							xtype : "combo",
							store : new Ext.data.SimpleStore({
								data : data,
								fields : [ "value", "name" ]
							}),
							value : this.builderType,
							displayField : "name",
							valueField : "value",
							triggerAction : "all",
							mode : "local",
							listeners : {
								select : function(combo, record) {
									this.changeBuilderType(record.get("value"));
									this.fireEvent("change", this);
								},
								scope : this
							},
							width : 60
						};
					},
					changeBuilderType : function(type) {
						if (type !== this.builderType) {
							this.builderType = type;
							var child = this.filter.filters[0];
							switch (type) {
							case gxp.FilterBuilder.ANY_OF:
								this.filter.type = OpenLayers.Filter.Logical.OR;
								child.type = OpenLayers.Filter.Logical.OR;
								break;
							case gxp.FilterBuilder.ALL_OF:
								this.filter.type = OpenLayers.Filter.Logical.OR;
								child.type = OpenLayers.Filter.Logical.AND;
								break;
							case gxp.FilterBuilder.NONE_OF:
								this.filter.type = OpenLayers.Filter.Logical.NOT;
								child.type = OpenLayers.Filter.Logical.OR;
								break;
							case gxp.FilterBuilder.NOT_ALL_OF:
								this.filter.type = OpenLayers.Filter.Logical.NOT;
								child.type = OpenLayers.Filter.Logical.AND;
								break;
							}
						}
					},
					createChildFiltersPanel : function() {
						this.childFilterContainer = new Ext.Container();
						var grandchildren = this.filter.filters[0].filters;
						var grandchild;
						for ( var i = 0, len = grandchildren.length; i < len; ++i) {
							grandchild = grandchildren[i];
							var fieldCfg = {
								xtype : "gxp_filterfield",
								allowBlank : this.allowBlank,
								columnWidth : 1,
								filter : grandchild,
								attributes : this.attributes,
								listeners : {
									change : function() {
										this.fireEvent("change", this);
									},
									scope : this
								}
							};
							var containerCfg = Ext
									.applyIf(
											grandchild instanceof OpenLayers.Filter.Logical ? {
												xtype : "gxp_filterbuilder"
											}
													: {
														xtype : "container",
														layout : "form",
														hideLabels : true,
														items : fieldCfg
													}, fieldCfg);
							this.childFilterContainer.add(this
									.newRow(containerCfg));
						}
						return this.childFilterContainer;
					},
					newRow : function(filterContainer) {
						var ct = new Ext.Container(
								{
									layout : "column",
									items : [
											{
												xtype : "container",
												width : 28,
												height : 26,
												style : "padding-left: 2px",
												items : {
													xtype : "button",
													tooltip : this.removeConditionText,
													iconCls : "delete",
													handler : function(btn) {
														this
																.removeCondition(
																		ct,
																		filterContainer.filter);
													},
													scope : this
												}
											}, filterContainer ]
								});
						return ct;
					},
					getBuilderType : function() {
						var type = this.defaultBuilderType;
						if (this.filter) {
							var child = this.filter.filters[0];
							if (this.filter.type === OpenLayers.Filter.Logical.NOT) {
								switch (child.type) {
								case OpenLayers.Filter.Logical.OR:
									type = gxp.FilterBuilder.NONE_OF;
									break;
								case OpenLayers.Filter.Logical.AND:
									type = gxp.FilterBuilder.NOT_ALL_OF;
									break;
								}
							} else {
								switch (child.type) {
								case OpenLayers.Filter.Logical.OR:
									type = gxp.FilterBuilder.ANY_OF;
									break;
								case OpenLayers.Filter.Logical.AND:
									type = gxp.FilterBuilder.ALL_OF;
									break;
								}
							}
						}
						return type;
					}
				});
gxp.FilterBuilder.ANY_OF = 0;
gxp.FilterBuilder.ALL_OF = 1;
gxp.FilterBuilder.NONE_OF = 2;
gxp.FilterBuilder.NOT_ALL_OF = 3;
Ext.reg('gxp_filterbuilder', gxp.FilterBuilder);
Ext.namespace("gxp");
gxp.StylePropertiesDialog = Ext
		.extend(
				Ext.Container,
				{
					titleText : "General",
					nameFieldText : "Name",
					titleFieldText : "Title",
					abstractFieldText : "Abstract",
					userStyle : null,
					initComponent : function() {
						var listeners = {
							"change" : function(field, value) {
								this.userStyle[field.name] = value;
								this.fireEvent("change", this, this.userStyle);
							},
							scope : this
						};
						var defConfig = {
							layout : "form",
							items : [ {
								xtype : "fieldset",
								title : this.titleText,
								labelWidth : 75,
								defaults : {
									xtype : "textfield",
									anchor : "100%",
									listeners : listeners
								},
								items : [
										{
											xtype : this.initialConfig.nameEditable ? "textfield"
													: "displayfield",
											fieldLabel : this.nameFieldText,
											name : "name",
											value : this.userStyle.name,
											maskRe : /[A-Za-z0-9_]/
										},
										{
											fieldLabel : this.titleFieldText,
											name : "title",
											value : this.userStyle.title
										},
										{
											xtype : "textarea",
											fieldLabel : this.abstractFieldText,
											name : "description",
											value : this.userStyle.description
										} ]
							} ]
						};
						Ext.applyIf(this, defConfig);
						this.addEvents("change");
						gxp.StylePropertiesDialog.superclass.initComponent
								.apply(this, arguments);
					}
				});
Ext.reg('gxp_stylepropertiesdialog', gxp.StylePropertiesDialog);
Ext.namespace("gxp");
gxp.ScaleOverlay = Ext
		.extend(
				Ext.Panel,
				{
					map : null,
					zoomLevelText : "Zoom level",
					initComponent : function() {
						gxp.ScaleOverlay.superclass.initComponent.call(this);
						this.cls = 'map-overlay';
						if (this.map) {
							if (this.map instanceof GeoExt.MapPanel) {
								this.map = this.map.map;
							}
							this.bind(this.map);
						}
						this.on("beforedestroy", this.unbind, this);
					},
					addToMapPanel : function(panel) {
						this.on({
							afterrender : function() {
								this.bind(panel.map);
							},
							scope : this
						});
					},
					stopMouseEvents : function(e) {
						e.stopEvent();
					},
					removeFromMapPanel : function(panel) {
						var el = this.getEl();
						el.un("mousedown", this.stopMouseEvents, this);
						el.un("click", this.stopMouseEvents, this);
						this.unbind();
					},
					addScaleLine : function() {
						var scaleLinePanel = new Ext.BoxComponent(
								{
									autoEl : {
										tag : "div",
										cls : "olControlScaleLine overlay-element overlay-scaleline"
									}
								});
						this
								.on(
										"afterlayout",
										function() {
											scaleLinePanel.getEl().dom.style.position = 'relative';
											scaleLinePanel.getEl().dom.style.display = 'inline';
											this.getEl().on("click",
													this.stopMouseEvents, this);
											this.getEl().on("mousedown",
													this.stopMouseEvents, this);
										}, this);
						scaleLinePanel.on('render', function() {
							var scaleLine = new OpenLayers.Control.ScaleLine({
								geodesic : true,
								div : scaleLinePanel.getEl().dom
							});
							this.map.addControl(scaleLine);
							scaleLine.activate();
						}, this);
						this.add(scaleLinePanel);
					},
					handleZoomEnd : function() {
						var scale = this.zoomStore.queryBy(function(record) {
							return this.map.getZoom() == record.data.level;
						}, this);
						if (scale.length > 0) {
							scale = scale.items[0];
							this.zoomSelector.setValue("1 : "
									+ parseInt(scale.data.scale, 10));
						} else {
							if (!this.zoomSelector.rendered) {
								return;
							}
							this.zoomSelector.clearValue();
						}
					},
					addScaleCombo : function() {
						this.zoomStore = new GeoExt.data.ScaleStore({
							map : this.map
						});
						this.zoomSelector = new Ext.form.ComboBox(
								{
									emptyText : this.zoomLevelText,
									tpl : '<tpl for="."><div class="x-combo-list-item">1 : {[parseInt(values.scale)]}</div></tpl>',
									editable : false,
									triggerAction : 'all',
									mode : 'local',
									store : this.zoomStore,
									width : 110
								});
						this.zoomSelector.on({
							click : this.stopMouseEvents,
							mousedown : this.stopMouseEvents,
							select : function(combo, record, index) {
								this.map.zoomTo(record.data.level);
							},
							scope : this
						});
						this.map.events.register('zoomend', this,
								this.handleZoomEnd);
						var zoomSelectorWrapper = new Ext.Panel({
							items : [ this.zoomSelector ],
							cls : 'overlay-element overlay-scalechooser',
							border : false
						});
						this.add(zoomSelectorWrapper);
					},
					bind : function(map) {
						this.map = map;
						this.addScaleLine();
						this.addScaleCombo();
						this.doLayout();
					},
					unbind : function() {
						if (this.map && this.map.events) {
							this.map.events.unregister('zoomend', this,
									this.handleZoomEnd);
						}
						this.zoomStore = null;
						this.zoomSelector = null;
					}
				});
Ext.reg('gxp_scaleoverlay', gxp.ScaleOverlay);
Ext.namespace("gxp.plugins");
gxp.plugins.Tool = Ext
		.extend(
				Ext.util.Observable,
				{
					ptype : "gxp_tool",
					autoActivate : true,
					actionTarget : "map.tbar",
					output : null,
					constructor : function(config) {
						this.initialConfig = config || {};
						this.active = false;
						Ext.apply(this, config);
						if (!this.id) {
							this.id = Ext.id();
						}
						this.output = [];
						this.addEvents("activate", "deactivate");
						gxp.plugins.Tool.superclass.constructor.apply(this,
								arguments);
					},
					init : function(target) {
						target.tools[this.id] = this;
						this.target = target;
						this.autoActivate && this.activate();
						this.target.on("portalready", this.addActions, this);
					},
					activate : function() {
						if (this.active === false) {
							this.active = true;
							this.fireEvent("activate", this);
							return true;
						}
					},
					deactivate : function() {
						if (this.active === true) {
							this.active = false;
							this.fireEvent("deactivate", this);
							return true;
						}
					},
					addActions : function(actions) {
						actions = actions || this.actions;
						if (!actions || this.actionTarget === null) {
							this.addOutput();
							return;
						}
						var actionTargets = this.actionTarget instanceof Array ? this.actionTarget
								: [ this.actionTarget ];
						var a = actions instanceof Array ? actions
								: [ actions ];
						var action, actionTarget, i, j, jj, parts, ref, item, ct, meth, index = null;
						for (i = actionTargets.length - 1; i >= 0; --i) {
							actionTarget = actionTargets[i];
							if (actionTarget) {
								if (actionTarget instanceof Object) {
									index = actionTarget.index;
									actionTarget = actionTarget.target;
								}
								parts = actionTarget.split(".");
								ref = parts[0];
								item = parts.length > 1 && parts[1];
								ct = ref ? ref == "map" ? this.target.mapPanel
										: (Ext.getCmp(ref) || this.target.portal[ref])
										: this.target.portal;
								if (item) {
									meth = {
										"tbar" : "getTopToolbar",
										"bbar" : "getBottomToolbar",
										"fbar" : "getFooterToolbar"
									}[item];
									if (meth) {
										ct = ct[meth]();
									} else {
										ct = ct[item];
									}
								}
							}
							for (j = 0, jj = a.length; j < jj; ++j) {
								if (!(a[j] instanceof Ext.Action || a[j] instanceof Ext.Component)) {
									if (typeof a[j] != "string") {
										if (j == this.defaultAction) {
											a[j].pressed = true;
										}
										a[j] = new Ext.Action(a[j]);
									}
								}
								action = a[j];
								if (j == this.defaultAction
										&& action instanceof GeoExt.Action) {
									action.isDisabled() ? action.activateOnEnable = true
											: action.control.activate();
								}
								if (ct) {
									if (ct instanceof Ext.menu.Menu) {
										action = Ext
												.apply(
														new Ext.menu.CheckItem(
																action),
														{
															text : action.initialConfig.menuText,
															group : action.initialConfig.toggleGroup,
															groupClass : null
														});
									} else if (!(ct instanceof Ext.Toolbar)) {
										action = new Ext.Button(action);
									}
									var addedAction = (index === null) ? ct
											.add(action) : ct.insert(index,
											action);
									action = action instanceof Ext.Button ? action
											: addedAction;
									if (index !== null) {
										index += 1;
									}
									if (this.outputAction != null
											&& j == this.outputAction) {
										var cmp;
										action.on("click", function() {
											if (cmp) {
												this.outputTarget ? cmp.show()
														: cmp.ownerCt.ownerCt
																.show();
											} else {
												cmp = this.addOutput();
											}
										}, this);
									}
								}
							}
							if (ct) {
								ct.isVisible() ? ct.doLayout()
										: ct instanceof Ext.menu.Menu
												|| ct.show();
							}
						}
						this.actions = a;
						return this.actions;
					},
					addOutput : function(config) {
						if (!config && !this.outputConfig) {
							return;
						}
						config = config || {};
						var ref = this.outputTarget;
						var container;
						if (ref) {
							if (ref === "map") {
								container = this.target.mapPanel;
							} else {
								container = Ext.getCmp(ref)
										|| this.target.portal[ref];
							}
							Ext.apply(config, this.outputConfig);
						} else {
							var outputConfig = this.outputConfig || {};
							container = new Ext.Window(
									Ext
											.apply(
													{
														hideBorders : true,
														shadow : false,
														closeAction : "hide",
														autoHeight : !outputConfig.height,
														layout : outputConfig.height ? "fit"
																: undefined,
														items : [ {
															defaults : Ext
																	.applyIf(
																			{
																				autoHeight : !outputConfig.height
																						&& !(outputConfig.defaults && outputConfig.defaults.height)
																			},
																			outputConfig.defaults)
														} ]
													}, outputConfig)).show().items
									.get(0);
						}
						var component = container.add(config);
						if (component instanceof Ext.Window) {
							component.show();
						} else {
							container.doLayout();
						}
						this.output.push(component);
						return component;
					},
					removeOutput : function() {
						var cmp;
						for ( var i = this.output.length - 1; i >= 0; --i) {
							cmp = this.output[i];
							if (!this.outputTarget) {
								cmp.findParentBy(function(p) {
									return p instanceof Ext.Window;
								}).close();
							} else {
								if (cmp.ownerCt) {
									cmp.ownerCt.remove(cmp);
									if (cmp.ownerCt instanceof Ext.Window) {
										cmp.ownerCt[cmp.ownerCt.closeAction]();
									}
								} else {
									cmp.remove();
								}
							}
						}
						this.output = [];
					},
					getState : function() {
						return this.initialConfig;
					}
				});
Ext.preg(gxp.plugins.Tool.prototype.ptype, gxp.plugins.Tool);
Ext.namespace("gxp.data");
gxp.data.WFSProtocolProxy = Ext
		.extend(
				GeoExt.data.ProtocolProxy,
				{
					setFilter : function(filter) {
						this.protocol.filter = filter;
						this.protocol.options.filter = filter;
					},
					constructor : function(config) {
						Ext.applyIf(config, {
							version : "1.1.0"
						});
						if (!(this.protocol && this.protocol instanceof OpenLayers.Protocol)) {
							config.protocol = new OpenLayers.Protocol.WFS(Ext
									.apply({
										version : config.version,
										srsName : config.srsName,
										url : config.url,
										featureType : config.featureType,
										featureNS : config.featureNS,
										geometryName : config.geometryName,
										schema : config.schema,
										filter : config.filter,
										maxFeatures : config.maxFeatures,
										multi : config.multi
									}, config.protocol));
						}
						gxp.data.WFSProtocolProxy.superclass.constructor.apply(
								this, arguments);
					},
					doRequest : function(action, records, params, reader,
							callback, scope, arg) {
						delete params.xaction;
						if (action === Ext.data.Api.actions.read) {
							this.load(params, reader, callback, scope, arg);
						} else {
							if (!(records instanceof Array)) {
								records = [ records ];
							}
							var features = new Array(records.length), feature;
							Ext
									.each(
											records,
											function(r, i) {
												features[i] = r.getFeature();
												feature = features[i];
												feature.modified = Ext
														.apply(
																feature.modified
																		|| {},
																{
																	attributes : Ext
																			.apply(
																					(feature.modified && feature.modified.attributes)
																							|| {},
																					r.modified)
																});
											}, this);
							var o = {
								action : action,
								records : records,
								callback : callback,
								scope : scope
							};
							var options = {
								callback : function(response) {
									this.onProtocolCommit(response, o);
								},
								scope : this
							};
							Ext.applyIf(options, params);
							this.protocol.commit(features, options);
						}
					},
					onProtocolCommit : function(response, o) {
						if (response.success()) {
							var features = response.reqFeatures;
							var state, feature;
							var destroys = [];
							var insertIds = response.insertIds || [];
							var i, len, j = 0;
							for (i = 0, len = features.length; i < len; ++i) {
								feature = features[i];
								state = feature.state;
								if (state) {
									if (state == OpenLayers.State.DELETE) {
										destroys.push(feature);
									} else if (state == OpenLayers.State.INSERT) {
										feature.fid = insertIds[j];
										++j;
									} else if (feature.modified) {
										feature.modified = {};
									}
									feature.state = null;
								}
							}
							for (i = 0, len = destroys.length; i < len; ++i) {
								feature = destroys[i];
								feature.layer
										&& feature.layer
												.destroyFeatures([ feature ]);
							}
							len = features.length;
							var data = new Array(len);
							var f;
							for (i = 0; i < len; ++i) {
								f = features[i];
								data[i] = {
									id : f.id,
									feature : f,
									state : null
								};
								var fields = o.records[i].fields;
								for ( var a in f.attributes) {
									if (fields.containsKey(a)) {
										data[i][a] = f.attributes[a];
									}
								}
							}
							o.callback.call(o.scope, data, response.priv, true);
						} else {
							var request = response.priv;
							if (request.status >= 200 && request.status < 300) {
								this.fireEvent("exception", this, "remote",
										o.action, o, response.error, o.records);
							} else {
								this.fireEvent("exception", this, "response",
										o.action, o, request);
							}
							o.callback.call(o.scope, [], request, false);
						}
					}
				});
Ext.namespace("gxp.data");
gxp.data.WFSFeatureStore = Ext
		.extend(
				GeoExt.data.FeatureStore,
				{
					setOgcFilter : function(ogcFilter) {
						this.proxy.setFilter(ogcFilter);
					},
					constructor : function(config) {
						if (!(config.proxy && config.proxy instanceof GeoExt.data.ProtocolProxy)) {
							config.proxy = new gxp.data.WFSProtocolProxy(Ext
									.apply({
										srsName : config.srsName,
										url : config.url,
										featureType : config.featureType,
										featureNS : config.featureNS,
										geometryName : config.geometryName,
										schema : config.schema,
										filter : config.ogcFilter,
										maxFeatures : config.maxFeatures,
										multi : config.multi
									}, config.proxy));
						}
						if (!config.writer) {
							config.writer = new Ext.data.DataWriter({
								write : Ext.emptyFn
							});
						}
						gxp.data.WFSFeatureStore.superclass.constructor.apply(
								this, arguments);
						this.reader.extractValues = (function(data, items,
								length) {
							var obj = this.readRecords([ data.feature ]);
							return obj.records[0].data;
						}).createDelegate(this.reader);
						this.reader.meta.idProperty = "id";
						this.reader.getId = function(data) {
							return data.id;
						};
					}
				});
Ext.namespace("gxp.plugins");
gxp.plugins.FeatureManager = Ext
		.extend(
				gxp.plugins.Tool,
				{
					ptype : "gxp_featuremanager",
					maxFeatures : 100,
					paging : true,
					pagingType : null,
					autoZoomPage : false,
					autoSetLayer : true,
					autoLoadFeatures : false,
					layerRecord : null,
					featureStore : null,
					hitCountProtocol : null,
					featureLayer : null,
					schema : null,
					geometryType : null,
					toolsShowingLayer : null,
					style : null,
					pages : null,
					page : null,
					numberOfFeatures : null,
					numPages : null,
					pageIndex : null,
					constructor : function(config) {
						this.addEvents("beforequery", "query",
								"beforelayerchange", "layerchange",
								"beforesetpage", "setpage",
								"beforeclearfeatures", "clearfeatures",
								"beforesave", "exception");
						if (config && !config.pagingType) {
							this.pagingType = gxp.plugins.FeatureManager.QUADTREE_PAGING;
						}
						if (config && config.layer) {
							this.autoSetLayer = false;
						}
						gxp.plugins.FeatureManager.superclass.constructor
								.apply(this, arguments);
					},
					init : function(target) {
						gxp.plugins.FeatureManager.superclass.init.apply(this,
								arguments);
						this.toolsShowingLayer = {};
						this.style = {
							"all" : new OpenLayers.Style(null, {
								rules : [ new OpenLayers.Rule({
									symbolizer : this.initialConfig.symbolizer
											|| {
												"Point" : {
													pointRadius : 4,
													graphicName : "square",
													fillColor : "white",
													fillOpacity : 1,
													strokeWidth : 1,
													strokeOpacity : 1,
													strokeColor : "#333333"
												},
												"Line" : {
													strokeWidth : 4,
													strokeOpacity : 1,
													strokeColor : "#ff9933"
												},
												"Polygon" : {
													strokeWidth : 2,
													strokeOpacity : 1,
													strokeColor : "#ff6633",
													fillColor : "white",
													fillOpacity : 0.3
												}
											}
								}) ]
							}),
							"selected" : new OpenLayers.Style(null, {
								rules : [ new OpenLayers.Rule({
									symbolizer : {
										display : "none"
									}
								}) ]
							})
						};
						this.featureLayer = new OpenLayers.Layer.Vector(
								this.id,
								{
									displayInLayerSwitcher : false,
									visibility : false,
									styleMap : new OpenLayers.StyleMap(
											{
												"select" : OpenLayers.Util
														.extend(
																{
																	display : ""
																},
																OpenLayers.Feature.Vector.style["select"]),
												"vertex" : this.style["all"]
											}, {
												extendDefault : false
											})
								});
						this.target.on({
							ready : function() {
								this.target.mapPanel.map
										.addLayer(this.featureLayer);
							},
							scope : this
						});
						this.on({
							beforedestroy : function() {
								this.target.mapPanel.map
										.removeLayer(this.featureLayer);
							},
							scope : this
						});
					},
					activate : function() {
						if (gxp.plugins.FeatureManager.superclass.activate
								.apply(this, arguments)) {
							if (this.autoSetLayer) {
								this.target.on("beforelayerselectionchange",
										this.setLayer, this);
							}
							if (this.layer) {
								var config = Ext.apply({}, this.layer);
								this.target.createLayerRecord(config,
										this.setLayer, this);
							}
							this.on("layerchange", this.setSchema, this);
							return true;
						}
					},
					deactivate : function() {
						if (gxp.plugins.FeatureManager.superclass.deactivate
								.apply(this, arguments)) {
							if (this.autoSetLayer) {
								this.target.un("beforelayerselectionchange",
										this.setLayer, this);
							}
							this.un("layerchange", this.setSchema, this);
							this.setLayer();
							return true;
						}
					},
					getPageExtent : function() {
						if (this.pagingType === gxp.plugins.FeatureManager.QUADTREE_PAGING) {
							return this.page.extent;
						} else {
							return this.featureStore.layer.getDataExtent();
						}
					},
					setLayer : function(layerRecord) {
						var change = this.fireEvent("beforelayerchange", this,
								layerRecord);
						if (change !== false) {
							if (layerRecord) {
								this.featureLayer.projection = layerRecord
										.getLayer().projection;
							}
							if (layerRecord !== this.layerRecord) {
								this.clearFeatureStore();
								this.layerRecord = layerRecord;
								if (layerRecord) {
									this.autoLoadFeatures === true ? this
											.loadFeatures() : this
											.setFeatureStore();
								} else {
									this.fireEvent("layerchange", this, null);
								}
							}
						}
						return change;
					},
					setSchema : function(mgr, layer, schema) {
						this.schema = schema;
					},
					showLayer : function(id, display) {
						this.toolsShowingLayer[id] = display || "all";
						this.setLayerDisplay();
					},
					hideLayer : function(id) {
						delete this.toolsShowingLayer[id];
						this.setLayerDisplay();
					},
					setLayerDisplay : function() {
						var show = this.visible();
						var map = this.target.mapPanel.map;
						if (show) {
							var style = this.style[show];
							if (style !== this.featureLayer.styleMap.styles["default"]) {
								this.featureLayer.styleMap.styles["default"] = style;
								this.featureLayer.redraw();
							}
							this.featureLayer.setVisibility(true);
							map.events.on({
								addlayer : this.raiseLayer,
								scope : this
							});
						} else if (this.featureLayer.map) {
							this.featureLayer.setVisibility(false);
							map.events.un({
								addlayer : this.raiseLayer,
								scope : this
							});
						}
					},
					visible : function() {
						var show = false;
						for ( var i in this.toolsShowingLayer) {
							if (show != "all") {
								show = this.toolsShowingLayer[i];
							}
						}
						return show;
					},
					raiseLayer : function() {
						var map = this.featureLayer && this.featureLayer.map;
						if (map) {
							map.setLayerIndex(this.featureLayer,
									map.layers.length);
						}
					},
					loadFeatures : function(filter, callback, scope) {
						if (this.fireEvent("beforequery", this, filter,
								callback, scope) !== false) {
							this.filter = filter;
							this.pages = null;
							if (callback) {
								var me = this;
								me._activeQuery
										&& me.un("query", me._activeQuery);
								this
										.on(
												"query",
												me._activeQuery = function(
														tool, store) {
													delete me._activeQuery;
													this.un("query",
															arguments.callee,
															this);
													var len = store.getCount();
													if (store.getCount() == 0) {
														callback
																.call(scope, []);
													} else {
														this.featureLayer.events
																.register(
																		"featuresadded",
																		this,
																		function(
																				evt) {
																			this.featureLayer.events
																					.unregister(
																							"featuresadded",
																							this,
																							arguments.callee);
																			callback
																					.call(
																							scope,
																							evt.features);
																		});
													}
												}, this, {
													single : true
												});
							}
							if (!this.featureStore) {
								this.paging
										&& this
												.on(
														"layerchange",
														function(tool, rec,
																schema) {
															if (schema) {
																this
																		.un(
																				"layerchange",
																				arguments.callee,
																				this);
																this.setPage();
															}
														}, this);
								this.setFeatureStore(filter, !this.paging);
							} else {
								this.featureStore.setOgcFilter(filter);
								if (this.paging) {
									this.setPage();
								} else {
									this.featureStore.load();
								}
							}
						}
					},
					clearFeatures : function() {
						var store = this.featureStore;
						if (store) {
							if (this.fireEvent("beforeclearfeatures", this) !== false) {
								store.removeAll();
								this.fireEvent("clearfeatures", this);
								var proxy = store.proxy;
								proxy.abortRequest();
								if (proxy.protocol.response) {
									proxy.protocol.response.abort();
								}
							}
						}
					},
					getProjection : function(record) {
						var projection = this.target.mapPanel.map
								.getProjectionObject();
						var layerProj = record.getLayer().projection;
						if (layerProj && layerProj.equals(projection)) {
							projection = layerProj;
						}
						return projection;
					},
					setFeatureStore : function(filter, autoLoad) {
						var record = this.layerRecord;
						var source = this.target.getSource(record);
						if (source && source instanceof gxp.plugins.WMSSource) {
							source
									.getSchema(
											record,
											function(schema) {
												if (schema === false) {
													this.clearFeatureStore();
												} else {
													var fields = [], geometryName;
													var geomRegex = /gml:((Multi)?(Point|Line|Polygon|Curve|Surface|Geometry)).*/;
													var types = {
														"xsd:boolean" : "boolean",
														"xsd:int" : "int",
														"xsd:integer" : "int",
														"xsd:short" : "int",
														"xsd:long" : "int",
														"xsd:date" : "date",
														"xsd:string" : "string",
														"xsd:float" : "float",
														"xsd:double" : "float"
													};
													schema
															.each(
																	function(r) {
																		var match = geomRegex
																				.exec(r
																						.get("type"));
																		if (match) {
																			geometryName = r
																					.get("name");
																			this.geometryType = match[1];
																		} else {
																			var type = types[r
																					.get("type")];
																			var field = {
																				name : r
																						.get("name"),
																				type : types[type]
																			};
																			if (type == "date") {
																				field.dateFormat = "Y-m-d\\Z";
																			}
																			fields
																					.push(field);
																		}
																	}, this);
													var protocolOptions = {
														srsName : this
																.getProjection(
																		record)
																.getCode(),
														url : schema.url,
														featureType : schema.reader.raw.featureTypes[0].typeName,
														featureNS : schema.reader.raw.targetNamespace,
														geometryName : geometryName
													};
													this.hitCountProtocol = new OpenLayers.Protocol.WFS(
															Ext
																	.apply(
																			{
																				version : "1.1.0",
																				readOptions : {
																					output : "object"
																				},
																				resultType : "hits",
																				filter : filter
																			},
																			protocolOptions));
													this.featureStore = new gxp.data.WFSFeatureStore(
															Ext
																	.apply(
																			{
																				fields : fields,
																				proxy : {
																					protocol : {
																						outputFormat : this.format,
																						multi : this.multi
																					}
																				},
																				maxFeatures : this.maxFeatures,
																				layer : this.featureLayer,
																				ogcFilter : filter,
																				autoLoad : autoLoad,
																				autoSave : false,
																				listeners : {
																					"beforewrite" : function(
																							store,
																							action,
																							rs,
																							options) {
																						this
																								.fireEvent(
																										"beforesave",
																										this,
																										store,
																										options.params);
																					},
																					"write" : function(
																							store,
																							action,
																							result,
																							res,
																							rs) {
																						this
																								.redrawMatchingLayers(record);
																					},
																					"load" : function(
																							store,
																							rs,
																							options) {
																						this
																								.fireEvent(
																										"query",
																										this,
																										store,
																										this.filter);
																					},
																					scope : this
																				}
																			},
																			protocolOptions));
												}
												this.fireEvent("layerchange",
														this, record, schema);
											}, this);
						} else {
							this.clearFeatureStore();
							this.fireEvent("layerchange", this, record, false);
						}
					},
					redrawMatchingLayers : function(record) {
						var name = record.get("name");
						var source = record.get("source");
						this.target.mapPanel.layers.each(function(candidate) {
							if (candidate.get("source") === source
									&& candidate.get("name") === name) {
								candidate.getLayer().redraw(true);
							}
						});
					},
					clearFeatureStore : function() {
						if (this.featureStore) {
							this.featureStore.removeAll();
							this.featureStore.unbind();
							this.featureStore.destroy();
							this.featureStore = null;
							this.geometryType = null;
						}
					},
					processPage : function(page, condition, callback, scope) {
						condition = condition || {};
						var index = condition.lonLat ? null : condition.index;
						var next = condition.next;
						var pages = this.pages;
						var i = this.pages.indexOf(page);
						this.setPageFilter(page);
						var nextOk = next ? i == (pages.indexOf(next) || pages.length) - 1
								: true;
						var lonLatOk = condition.lonLat ? page.extent
								.containsLonLat(condition.lonLat) : true;
						if (lonLatOk && page.numFeatures
								&& page.numFeatures <= this.maxFeatures) {
							callback.call(this, page);
						} else if (lonLatOk && (i == index || nextOk)) {
							this.hitCountProtocol
									.read({
										callback : function(response) {
											var i = index, lonLat = condition.lonLat;
											if (next) {
												i = (pages.indexOf(next) || pages.length) - 1;
											}
											if (!i
													&& lonLat
													&& page.extent
															.containsLonLat(lonLat)) {
												i = pages.indexOf(page);
											}
											page.numFeatures = response.numberOfFeatures;
											if (this.page) {
												return;
											}
											if (page.numFeatures > this.maxFeatures) {
												this.createLeaf(page, Ext
														.applyIf({
															index : i,
															next : next
														}, condition),
														callback, scope);
											} else if (page.numFeatures == 0
													&& pages.length > 1) {
												pages.remove(page);
												condition.allowEmpty === false
														&& this
																.setPage({
																	index : index
																			% this.pages.length,
																	allowEmpty : false
																});
											} else if (this.pages.indexOf(page) == i) {
												callback.call(this, page);
											}
										},
										scope : this
									});
						}
					},
					createLeaf : function(page, condition, callback, scope) {
						condition = condition || {};
						var layer = this.layerRecord.getLayer();
						var pageIndex = this.pages.indexOf(page);
						this.pages.remove(page);
						var extent = page.extent;
						var center = extent.getCenterLonLat();
						var l = [ extent.left, center.lon, extent.left,
								center.lon ];
						var b = [ center.lat, center.lat, extent.bottom,
								extent.bottom ];
						var r = [ center.lon, extent.right, center.lon,
								extent.right ];
						var t = [ extent.top, extent.top, center.lat,
								center.lat ];
						var i, leaf;
						for (i = 3; i >= 0; --i) {
							leaf = {
								extent : new OpenLayers.Bounds(l[i], b[i],
										r[i], t[i])
							};
							this.pages.splice(pageIndex, 0, leaf);
							this.processPage(leaf, condition, callback, scope);
						}
					},
					getPagingExtent : function(meth) {
						var layer = this.layerRecord.getLayer();
						var filter = this.getSpatialFilter();
						var extent = filter ? filter.value
								: this.target.mapPanel.map[meth]();
						if (extent && layer.maxExtent) {
							if (extent.containsBounds(layer.maxExtent)) {
								extent = layer.maxExtent;
							}
						}
						return extent;
					},
					getSpatialFilter : function() {
						var filter;
						if (this.filter instanceof OpenLayers.Filter.Spatial
								&& this.filter.type === OpenLayers.Filter.Spatial.BBOX) {
							filter = this.filter;
						} else if (this.filter instanceof OpenLayers.Filter.Logical
								&& this.filter.type === OpenLayers.Filter.Logical.AND) {
							for ( var f, i = this.filter.filters.length - 1; i >= 0; --i) {
								f = this.filter.filters[i];
								if (f instanceof OpenLayers.Filter.Spatial
										&& f.type === OpenLayers.Filter.Spatial.BBOX) {
									filter = f;
									break;
								}
							}
						}
						return filter;
					},
					setPageFilter : function(page) {
						var filter;
						if (page.extent) {
							var bboxFilter = new OpenLayers.Filter.Spatial({
								type : OpenLayers.Filter.Spatial.BBOX,
								property : this.featureStore.geometryName,
								value : page.extent
							});
							filter = this.filter ? new OpenLayers.Filter.Logical(
									{
										type : OpenLayers.Filter.Logical.AND,
										filters : [ this.filter, bboxFilter ]
									})
									: bboxFilter;
						} else {
							filter = this.filter;
						}
						this.featureStore.setOgcFilter(filter);
						this.hitCountProtocol.filter = filter;
						this.hitCountProtocol.options.filter = filter;
						return filter;
					},
					nextPage : function(callback, scope) {
						var index;
						if (this.pagingType === gxp.plugins.FeatureManager.QUADTREE_PAGING) {
							var page = this.page;
							this.page = null;
							index = (this.pages.indexOf(page) + 1)
									% this.pages.length;
						} else {
							index = this.pageIndex + 1 % this.numPages;
						}
						this.setPage({
							index : index,
							allowEmpty : false
						}, callback, scope);
					},
					previousPage : function(callback, scope) {
						var index;
						if (this.pagingType === gxp.plugins.FeatureManager.QUADTREE_PAGING) {
							index = this.pages.indexOf(this.page) - 1;
							if (index < 0) {
								index = this.pages.length - 1;
							}
						} else {
							index = this.pageIndex - 1;
							if (index < 0) {
								index = this.numPages - 1;
							}
						}
						this.setPage({
							index : index,
							allowEmpty : false,
							next : this.page
						}, callback);
					},
					setPage : function(condition, callback, scope) {
						if (this.pagingType === gxp.plugins.FeatureManager.QUADTREE_PAGING) {
							if (this.filter instanceof OpenLayers.Filter.FeatureId) {
								this.featureStore.load({
									callback : function() {
										callback && callback.call(scope);
									}
								});
								return;
							}
							if (this.fireEvent("beforesetpage", this,
									condition, callback, scope) !== false) {
								if (!condition) {
									var extent = this
											.getPagingExtent("getExtent");
									var lonLat = new OpenLayers.LonLat(
											extent.left, extent.top);
									var maxExtent = this.target.mapPanel.map
											.getMaxExtent();
									if (!maxExtent.containsLonLat(lonLat, true)) {
										lonLat = new OpenLayers.LonLat(
												maxExtent.left, maxExtent.top);
									}
									condition = {
										lonLat : lonLat,
										allowEmpty : false
									};
								}
								condition.index = condition.index || 0;
								if (condition.index == "last") {
									condition.index = this.pages.length - 1;
									condition.next = this.pages[0];
								}
								this.page = null;
								if (!this.pages) {
									var layer = this.layerRecord.getLayer();
									var queryExtent = this
											.getPagingExtent("getMaxExtent");
									this.pages = [ {
										extent : queryExtent
									} ];
									condition.index = 0;
								} else if (condition.lonLat) {
									for ( var i = this.pages.length - 1; i >= 0; --i) {
										if (this.pages[i].extent
												.containsLonLat(condition.lonLat)) {
											condition.index = i;
											break;
										}
									}
								}
								this
										.processPage(
												this.pages[condition.index],
												condition,
												function(page) {
													var map = this.target.mapPanel.map;
													this.page = page;
													this.setPageFilter(page);
													if (this.autoZoomPage
															&& !map
																	.getExtent()
																	.containsLonLat(
																			page.extent
																					.getCenterLonLat())) {
														map
																.zoomToExtent(page.extent);
													}
													var pageIndex = this.pages
															.indexOf(this.page);
													this.fireEvent("setpage",
															this, condition,
															callback, scope,
															pageIndex,
															this.pages.length);
													this.featureStore
															.load({
																callback : function() {
																	callback
																			&& callback
																					.call(
																							scope,
																							page);
																}
															});
												}, this);
							}
						} else {
							if (this.fireEvent("beforesetpage", this,
									condition, callback, scope) !== false) {
								if (!condition) {
									this.hitCountProtocol
											.read({
												filter : this.filter,
												callback : function(response) {
													this.numberOfFeatures = response.numberOfFeatures;
													this.numPages = Math
															.ceil(this.numberOfFeatures
																	/ this.maxFeatures);
													this.pageIndex = 0;
													this.fireEvent("setpage",
															this, condition,
															callback, scope,
															this.pageIndex,
															this.numPages);
													this.featureStore
															.load({
																output : "object",
																callback : function() {
																	callback
																			&& callback
																					.call(scope);
																}
															});
												},
												scope : this
											});
								} else {
									if (condition.index != null) {
										if (condition.index === "last") {
											this.pageIndex = this.numPages - 1;
										} else if (condition.index === "first") {
											this.pageIndex = 0;
										} else {
											this.pageIndex = condition.index;
										}
										var startIndex = this.pageIndex
												* this.maxFeatures;
										this.fireEvent("setpage", this,
												condition, callback, scope,
												this.pageIndex, this.numPages);
										this.featureStore
												.load({
													startIndex : startIndex,
													callback : function() {
														callback
																&& callback
																		.call(scope);
													}
												});
									}
								}
							}
						}
					}
				});
gxp.plugins.FeatureManager.QUADTREE_PAGING = 0;
gxp.plugins.FeatureManager.WFS_PAGING = 1;
Ext
		.preg(gxp.plugins.FeatureManager.prototype.ptype,
				gxp.plugins.FeatureManager);
Ext.namespace("gxp.plugins");
gxp.plugins.ClickableFeatures = Ext
		.extend(
				gxp.plugins.Tool,
				{
					featureManager : null,
					toleranceParameters : [ "BUFFER", "RADIUS" ],
					noFeatureClick : function(evt) {
						if (!this.selectControl) {
							this.selectControl = new OpenLayers.Control.SelectFeature(
									this.target.tools[this.featureManager].featureLayer,
									this.initialConfig.controlOptions);
						}
						var evtLL = this.target.mapPanel.map
								.getLonLatFromPixel(evt.xy);
						var featureManager = this.target.tools[this.featureManager];
						var page = featureManager.page;
						if (featureManager.visible() == "all"
								&& featureManager.paging && page
								&& page.extent.containsLonLat(evtLL)) {
							return;
						}
						var layer = featureManager.layerRecord
								&& featureManager.layerRecord.getLayer();
						if (!layer) {
							return;
						}
						var map = this.target.mapPanel.map;
						var size = map.getSize();
						var params = Ext.applyIf({
							REQUEST : "GetFeatureInfo",
							BBOX : map.getExtent().toBBOX(),
							WIDTH : size.w,
							HEIGHT : size.h,
							X : parseInt(evt.xy.x),
							Y : parseInt(evt.xy.y),
							QUERY_LAYERS : layer.params.LAYERS,
							INFO_FORMAT : "application/vnd.ogc.gml",
							EXCEPTIONS : "application/vnd.ogc.se_xml",
							FEATURE_COUNT : 1
						}, layer.params);
						if (typeof this.tolerance === "number") {
							for ( var i = 0, ii = this.toleranceParameters.length; i < ii; ++i) {
								params[this.toleranceParameters[i]] = this.tolerance;
							}
						}
						var projection = map.getProjectionObject();
						var layerProj = layer.projection;
						if (layerProj && layerProj.equals(projection)) {
							projection = layerProj;
						}
						if (parseFloat(layer.params.VERSION) >= 1.3) {
							params.CRS = projection.getCode();
						} else {
							params.SRS = projection.getCode();
						}
						var store = new GeoExt.data.FeatureStore(
								{
									fields : {},
									proxy : new GeoExt.data.ProtocolProxy(
											{
												protocol : new OpenLayers.Protocol.HTTP(
														{
															url : (typeof layer.url === "string") ? layer.url
																	: layer.url[0],
															params : params,
															format : new OpenLayers.Format.WMSGetFeatureInfo()
														})
											}),
									autoLoad : true,
									listeners : {
										"load" : function(store, records) {
											if (records.length > 0) {
												var fid = records[0].get("fid");
												var filter = new OpenLayers.Filter.FeatureId(
														{
															fids : [ fid ]
														});
												var autoLoad = function() {
													featureManager
															.loadFeatures(
																	filter,
																	function(
																			features) {
																		if (features.length) {
																			this.autoLoadedFeature = features[0];
																			this
																					.select(features[0]);
																		}
																	}, this);
												}.createDelegate(this);
												var feature = featureManager.featureLayer
														.getFeatureByFid(fid);
												if (feature) {
													this.select(feature);
												} else if (featureManager.paging
														&& featureManager.pagingType === gxp.plugins.FeatureManager.QUADTREE_PAGING) {
													var lonLat = this.target.mapPanel.map
															.getLonLatFromPixel(evt.xy);
													featureManager
															.setPage(
																	{
																		lonLat : lonLat
																	},
																	function() {
																		var feature = featureManager.featureLayer
																				.getFeatureByFid(fid);
																		if (feature) {
																			this
																					.select(feature);
																		} else if (this.autoLoadFeatures === true) {
																			autoLoad();
																		}
																	}, this);
												} else {
													autoLoad();
												}
											}
										},
										scope : this
									}
								});
					},
					select : function(feature) {
						this.selectControl.unselectAll();
						this.selectControl.select(feature);
					}
				});
Ext.namespace("gxp");
gxp.FeatureEditPopup = Ext
		.extend(
				GeoExt.Popup,
				{
					closeMsgTitle : 'Save Changes?',
					closeMsg : 'This feature has unsaved changes. Would you like to save your changes?',
					deleteMsgTitle : 'Delete Feature?',
					deleteMsg : 'Are you sure you want to delete this feature?',
					editButtonText : 'Edit',
					editButtonTooltip : 'Make this feature editable',
					deleteButtonText : 'Delete',
					deleteButtonTooltip : 'Delete this feature',
					cancelButtonText : 'Cancel',
					cancelButtonTooltip : 'Stop editing, discard changes',
					saveButtonText : 'Save',
					saveButtonTooltip : 'Save changes',
					layout : "fit",
					feature : null,
					schema : null,
					readOnly : false,
					allowDelete : false,
					editing : false,
					grid : null,
					modifyControl : null,
					geometry : null,
					attributes : null,
					cancelButton : null,
					saveButton : null,
					editButton : null,
					deleteButton : null,
					initComponent : function() {
						this.addEvents("featuremodified", "canceledit",
								"cancelclose");
						if (!this.dateFormat) {
							this.dateFormat = Ext.form.DateField.prototype.format;
						}
						if (!this.timeFormat) {
							this.timeFormat = Ext.form.TimeField.prototype.format;
						}
						var feature = this.feature;
						if (feature instanceof GeoExt.data.FeatureRecord) {
							feature = this.feature = feature.getFeature();
						}
						if (!this.location) {
							this.location = feature;
						}
						this.anchored = !this.editing;
						var customEditors = {};
						var customRenderers = {};
						if (this.schema) {
							var attributes = {};
							if (this.fields) {
								if (!this.excludeFields) {
									this.excludeFields = [];
								}
								for ( var i = 0, ii = this.fields.length; i < ii; ++i) {
									attributes[this.fields[i]] = null;
								}
							}
							var ucFields = this.fields ? this.fields.join(",")
									.toUpperCase().split(",") : [];
							this.schema
									.each(
											function(r) {
												var type = r.get("type");
												if (type
														.match(/^[^:]*:?((Multi)?(Point|Line|Polygon|Curve|Surface|Geometry))/)) {
													return;
												}
												var name = r.get("name");
												if (this.fields) {
													if (ucFields.indexOf(name
															.toUpperCase()) == -1) {
														this.excludeFields
																.push(name);
													}
												}
												var value = feature.attributes[name];
												var fieldCfg = GeoExt.form
														.recordToField(r);
												var listeners;
												if (typeof value == "string") {
													var format;
													switch (type.split(":")
															.pop()) {
													case "date":
														format = this.dateFormat;
														fieldCfg.editable = false;
														break;
													case "dateTime":
														if (!format) {
															format = this.dateFormat
																	+ " "
																	+ this.timeFormat;
															fieldCfg.editable = true;
														}
														fieldCfg.format = format;
														listeners = {
															"startedit" : function(
																	el, value) {
																if (!(value instanceof Date)) {
																	var date = Date
																			.parseDate(
																					value
																							.replace(
																									/Z$/,
																									""),
																					"c");
																	if (date) {
																		this
																				.setValue(date);
																	}
																}
															}
														};
														customRenderers[name] = (function() {
															return function(
																	value) {
																var date = value;
																if (typeof value == "string") {
																	date = Date
																			.parseDate(
																					value
																							.replace(
																									/Z$/,
																									""),
																					"c");
																}
																return date ? date
																		.format(format)
																		: value;
															};
														})();
														break;
													case "boolean":
														listeners = {
															"startedit" : function(
																	el, value) {
																this
																		.setValue(Boolean(value));
															}
														};
														break;
													}
												}
												customEditors[name] = new Ext.grid.GridEditor(
														{
															field : Ext
																	.create(fieldCfg),
															listeners : listeners
														});
												attributes[name] = value;
											}, this);
							feature.attributes = attributes;
						}
						if (!this.title && feature.fid) {
							this.title = feature.fid;
						}
						this.editButton = new Ext.Button({
							text : this.editButtonText,
							tooltip : this.editButtonTooltip,
							iconCls : "edit",
							handler : this.startEditing,
							scope : this
						});
						this.deleteButton = new Ext.Button({
							text : this.deleteButtonText,
							tooltip : this.deleteButtonTooltip,
							iconCls : "delete",
							hidden : !this.allowDelete,
							handler : this.deleteFeature,
							scope : this
						});
						this.cancelButton = new Ext.Button({
							text : this.cancelButtonText,
							tooltip : this.cancelButtonTooltip,
							iconCls : "cancel",
							hidden : true,
							handler : function() {
								this.stopEditing(false);
							},
							scope : this
						});
						this.saveButton = new Ext.Button({
							text : this.saveButtonText,
							tooltip : this.saveButtonTooltip,
							iconCls : "save",
							hidden : true,
							handler : function() {
								this.stopEditing(true);
							},
							scope : this
						});
						var ucExcludeFields = this.excludeFields ? this.excludeFields
								.join(",").toUpperCase().split(",")
								: [];
						this.grid = new Ext.grid.PropertyGrid({
							border : false,
							source : feature.attributes,
							customEditors : customEditors,
							customRenderers : customRenderers,
							propertyNames : this.propertyNames,
							viewConfig : {
								forceFit : true,
								getRowClass : function(record) {
									if (ucExcludeFields.indexOf(record.get(
											"name").toUpperCase()) !== -1) {
										return "x-hide-nosize";
									}
								}
							},
							listeners : {
								"beforeedit" : function() {
									return this.editing;
								},
								"propertychange" : function() {
									this.setFeatureState(this.getDirtyState());
								},
								scope : this
							},
							initComponent : function() {
								var origSort = Ext.data.Store.prototype.sort;
								Ext.data.Store.prototype.sort = function() {
								};
								Ext.grid.PropertyGrid.prototype.initComponent
										.apply(this, arguments);
								Ext.data.Store.prototype.sort = origSort;
							}
						});
						this.grid.propStore.isEditableValue = function() {
							return true;
						};
						this.items = [ this.grid ];
						this.bbar = new Ext.Toolbar({
							hidden : this.readOnly,
							items : [ this.editButton, this.deleteButton,
									this.saveButton, this.cancelButton ]
						});
						gxp.FeatureEditPopup.superclass.initComponent
								.call(this);
						this
								.on({
									"show" : function() {
										if (this.editing) {
											this.editing = null;
											this.startEditing();
										}
									},
									"beforeclose" : function() {
										if (!this.editing) {
											return;
										}
										if (this.feature.state === this
												.getDirtyState()) {
											Ext.Msg
													.show({
														title : this.closeMsgTitle,
														msg : this.closeMsg,
														buttons : Ext.Msg.YESNOCANCEL,
														fn : function(button) {
															if (button
																	&& button !== "cancel") {
																this
																		.stopEditing(button === "yes");
																this.close();
															} else {
																this
																		.fireEvent(
																				"cancelclose",
																				this);
															}
														},
														scope : this,
														icon : Ext.MessageBox.QUESTION,
														animEl : this.getEl()
													});
											return false;
										} else {
											this.stopEditing(false);
										}
									},
									scope : this
								});
					},
					getDirtyState : function() {
						return this.feature.state === OpenLayers.State.INSERT ? this.feature.state
								: OpenLayers.State.UPDATE;
					},
					startEditing : function() {
						if (!this.editing) {
							this.editing = true;
							this.anc && this.unanchorPopup();
							this.editButton.hide();
							this.deleteButton.hide();
							this.saveButton.show();
							this.cancelButton.show();
							this.geometry = this.feature.geometry
									&& this.feature.geometry.clone();
							this.attributes = Ext.apply({},
									this.feature.attributes);
							this.modifyControl = new OpenLayers.Control.ModifyFeature(
									this.feature.layer,
									{
										standalone : true,
										vertexRenderIntent : this.vertexRenderIntent
									});
							this.feature.layer.map
									.addControl(this.modifyControl);
							this.modifyControl.activate();
							if (this.feature.geometry) {
								this.modifyControl.selectFeature(this.feature);
							}
						}
					},
					stopEditing : function(save) {
						if (this.editing) {
							this.modifyControl.deactivate();
							this.modifyControl.destroy();
							var feature = this.feature;
							if (feature.state === this.getDirtyState()) {
								if (save === true) {
									if (this.schema) {
										var attribute, rec;
										for ( var i in feature.attributes) {
											rec = this.schema.getAt(this.schema
													.findExact("name", i));
											attribute = feature.attributes[i];
											if (attribute instanceof Date) {
												var type = rec.get("type")
														.split(":").pop();
												feature.attributes[i] = attribute
														.format(type == "date" ? "Y-m-d"
																: "c");
											}
										}
									}
									this.fireEvent("featuremodified", this,
											feature);
								} else if (feature.state === OpenLayers.State.INSERT) {
									this.editing = false;
									feature.layer.destroyFeatures([ feature ]);
									this.fireEvent("canceledit", this, null);
									this.close();
								} else {
									var layer = feature.layer;
									layer.drawFeature(feature, {
										display : "none"
									});
									feature.geometry = this.geometry;
									feature.attributes = this.attributes;
									this.setFeatureState(null);
									this.grid.setSource(feature.attributes);
									layer.drawFeature(feature);
									this.fireEvent("canceledit", this, feature);
								}
							}
							if (!this.isDestroyed) {
								this.cancelButton.hide();
								this.saveButton.hide();
								this.editButton.show();
								this.allowDelete && this.deleteButton.show();
							}
							this.editing = false;
						}
					},
					deleteFeature : function() {
						Ext.Msg
								.show({
									title : this.deleteMsgTitle,
									msg : this.deleteMsg,
									buttons : Ext.Msg.YESNO,
									fn : function(button) {
										if (button === "yes") {
											this
													.setFeatureState(OpenLayers.State.DELETE);
											this.fireEvent("featuremodified",
													this, this.feature);
											this.close();
										}
									},
									scope : this,
									icon : Ext.MessageBox.QUESTION,
									animEl : this.getEl()
								});
					},
					setFeatureState : function(state) {
						this.feature.state = state;
						var layer = this.feature.layer;
						layer && layer.events.triggerEvent("featuremodified", {
							feature : this.feature
						});
					}
				});
Ext.reg('gxp_featureeditpopup', gxp.FeatureEditPopup);
Ext.namespace("gxp.plugins");
gxp.plugins.FeatureEditor = Ext
		.extend(
				gxp.plugins.ClickableFeatures,
				{
					ptype : "gxp_featureeditor",
					iconClsAdd : "gxp-icon-addfeature",
					supportAbstractGeometry : false,
					supportNoGeometry : false,
					iconClsEdit : "gxp-icon-editfeature",
					exceptionTitle : "Save Failed",
					exceptionText : "Trouble saving features",
					pointText : "Point",
					lineText : "Line",
					polygonText : "Polygon",
					noGeometryText : "Event",
					createFeatureActionTip : "Create a new feature",
					editFeatureActionTip : "Edit existing feature",
					outputTarget : "map",
					snappingAgent : null,
					readOnly : false,
					modifyOnly : false,
					autoLoadFeatures : false,
					showSelectedOnly : true,
					drawControl : null,
					popup : null,
					autoLoadedFeature : null,
					schema : null,
					constructor : function(config) {
						this.addEvents("layereditable", "featureeditable");
						gxp.plugins.FeatureEditor.superclass.constructor.apply(
								this, arguments);
					},
					init : function(target) {
						gxp.plugins.FeatureEditor.superclass.init.apply(this,
								arguments);
						this.target.on("loginchanged", this.enableOrDisable,
								this);
					},
					destroy : function() {
						this.target.un("loginchanged", this.enableOrDisable,
								this);
						gxp.plugins.FeatureEditor.superclass.destroy.apply(
								this, arguments);
					},
					addActions : function() {
						var popup;
						var featureManager = this.getFeatureManager();
						var featureLayer = featureManager.featureLayer;
						var intercepting = false;
						function intercept(mgr, fn) {
							var fnArgs = Array.prototype.slice.call(arguments);
							fnArgs.splice(0, 2);
							if (!intercepting && popup && !popup.isDestroyed) {
								if (popup.editing) {
									function doIt() {
										intercepting = true;
										unregisterDoIt.call(this);
										if (fn === "setLayer") {
											this.target.selectLayer(fnArgs[0]);
										} else if (fn === "clearFeatures") {
											window.setTimeout(function() {
												mgr[fn].call(mgr);
											});
										} else {
											mgr[fn].apply(mgr, fnArgs);
										}
									}
									function unregisterDoIt() {
										featureManager.featureStore.un("write",
												doIt, this);
										popup.un("canceledit", doIt, this);
										popup.un("cancelclose", unregisterDoIt,
												this);
									}
									featureManager.featureStore.on("write",
											doIt, this);
									popup.on({
										canceledit : doIt,
										cancelclose : unregisterDoIt,
										scope : this
									});
									popup.close();
								}
								return !popup.editing;
							}
							intercepting = false;
						}
						featureManager.on({
							"beforequery" : intercept.createDelegate(this,
									"loadFeatures", 1),
							"beforelayerchange" : intercept.createDelegate(
									this, "setLayer", 1),
							"beforesetpage" : intercept.createDelegate(this,
									"setPage", 1),
							"beforeclearfeatures" : intercept.createDelegate(
									this, "clearFeatures", 1),
							scope : this
						});
						this.drawControl = new OpenLayers.Control.DrawFeature(
								featureLayer,
								OpenLayers.Handler.Point,
								{
									eventListeners : {
										featureadded : function(evt) {
											if (this.autoLoadFeatures === true) {
												this.autoLoadedFeature = evt.feature;
											}
										},
										activate : function() {
											featureManager.showLayer(this.id,
													this.showSelectedOnly
															&& "selected");
										},
										deactivate : function() {
											featureManager.hideLayer(this.id);
										},
										scope : this
									}
								});
						this.selectControl = new OpenLayers.Control.SelectFeature(
								featureLayer,
								{
									clickout : false,
									multipleKey : "fakeKey",
									unselect : function() {
										if (!featureManager.featureStore
												.getModifiedRecords().length) {
											OpenLayers.Control.SelectFeature.prototype.unselect
													.apply(this, arguments);
										}
									},
									eventListeners : {
										"activate" : function() {
											if (this.autoLoadFeatures === true
													|| featureManager.paging) {
												this.target.mapPanel.map.events
														.register(
																"click",
																this,
																this.noFeatureClick);
											}
											featureManager.showLayer(this.id,
													this.showSelectedOnly
															&& "selected");
											this.selectControl
													.unselectAll(popup
															&& popup.editing
															&& {
																except : popup.feature
															});
										},
										"deactivate" : function() {
											if (this.autoLoadFeatures === true
													|| featureManager.paging) {
												this.target.mapPanel.map.events
														.unregister(
																"click",
																this,
																this.noFeatureClick);
											}
											if (popup) {
												if (popup.editing) {
													popup
															.on(
																	"cancelclose",
																	function() {
																		this.selectControl
																				.activate();
																	},
																	this,
																	{
																		single : true
																	});
												}
												popup
														.on(
																"close",
																function() {
																	featureManager
																			.hideLayer(this.id);
																},
																this,
																{
																	single : true
																});
												popup.close();
											} else {
												featureManager
														.hideLayer(this.id);
											}
										},
										scope : this
									}
								});
						featureLayer.events
								.on({
									"beforefeatureremoved" : function(evt) {
										if (this.popup
												&& evt.feature === this.popup.feature) {
											this.selectControl
													.unselect(evt.feature);
										}
									},
									"featureunselected" : function(evt) {
										var feature = evt.feature;
										if (feature) {
											this.fireEvent("featureeditable",
													this, feature, false);
										}
										if (popup && !popup.hidden) {
											popup.close();
										}
									},
									"beforefeatureselected" : function(evt) {
										if (popup) {
											return !popup.editing;
										}
									},
									"featureselected" : function(evt) {
										var feature = evt.feature;
										if (feature) {
											this.fireEvent("featureeditable",
													this, feature, true);
										}
										var featureStore = featureManager.featureStore;
										if (this._forcePopupForNoGeometry === true
												|| (this.selectControl.active && feature.geometry !== null)) {
											if (this.readOnly === false) {
												this.selectControl.deactivate();
												featureManager.showLayer(
														this.id,
														this.showSelectedOnly
																&& "selected");
											}
											popup = this
													.addOutput({
														xtype : "gxp_featureeditpopup",
														collapsible : true,
														feature : featureStore
																.getByFeature(feature),
														vertexRenderIntent : "vertex",
														readOnly : this.readOnly,
														fields : this.fields,
														excludeFields : this.excludeFields,
														editing : feature.state === OpenLayers.State.INSERT,
														schema : this.schema,
														allowDelete : true,
														width : 200,
														height : 250,
														listeners : {
															"close" : function() {
																if (this.readOnly === false) {
																	this.selectControl
																			.activate();
																}
																if (feature.layer
																		&& feature.layer.selectedFeatures
																				.indexOf(feature) !== -1) {
																	this.selectControl
																			.unselect(feature);
																}
																if (feature === this.autoLoadedFeature) {
																	if (feature.layer) {
																		feature.layer
																				.removeFeatures([ evt.feature ]);
																	}
																	this.autoLoadedFeature = null;
																}
															},
															"featuremodified" : function(
																	popup,
																	feature) {
																popup.disable();
																featureStore
																		.on({
																			write : {
																				fn : function() {
																					if (popup
																							&& popup
																									.isVisible()) {
																						popup
																								.enable();
																					}
																					var layer = featureManager.layerRecord;
																					this.target
																							.fireEvent(
																									"featureedit",
																									featureManager,
																									{
																										name : layer
																												.get("name"),
																										source : layer
																												.get("source")
																									});
																				},
																				single : true
																			},
																			exception : {
																				fn : function(
																						proxy,
																						type,
																						action,
																						options,
																						response,
																						records) {
																					var msg = this.exceptionText;
																					if (type === "remote") {
																						if (response.exceptionReport) {
																							msg = gxp.util
																									.getOGCExceptionText(response.exceptionReport);
																						}
																					} else {
																						msg = "Status: "
																								+ response.status;
																					}
																					featureManager
																							.fireEvent(
																									"exception",
																									featureManager,
																									response.exceptionReport
																											|| {},
																									msg,
																									records);
																					if (featureManager
																							.hasListener("exception") === false
																							&& featureStore
																									.hasListener("exception") === false) {
																						Ext.Msg
																								.show({
																									title : this.exceptionTitle,
																									msg : msg,
																									icon : Ext.MessageBox.ERROR,
																									buttons : {
																										ok : true
																									}
																								});
																					}
																					if (popup
																							&& popup
																									.isVisible()) {
																						popup
																								.enable();
																						popup
																								.startEditing();
																					}
																				},
																				single : true
																			},
																			scope : this
																		});
																if (feature.state === OpenLayers.State.DELETE) {
																	featureStore._removing = true;
																	featureStore
																			.remove(featureStore
																					.getRecordFromFeature(feature));
																	delete featureStore._removing;
																}
																featureStore
																		.save();
															},
															"canceledit" : function(
																	popup,
																	feature) {
																featureStore
																		.commitChanges();
															},
															scope : this
														}
													});
											this.popup = popup;
										}
									},
									"sketchcomplete" : function(evt) {
										featureManager.featureLayer.events
												.register(
														"featuresadded",
														this,
														function(evt) {
															featureManager.featureLayer.events
																	.unregister(
																			"featuresadded",
																			this,
																			arguments.callee);
															this.drawControl
																	.deactivate();
															this.selectControl
																	.activate();
															this.selectControl
																	.select(evt.features[0]);
														});
									},
									scope : this
								});
						var toggleGroup = this.toggleGroup || Ext.id();
						var actions = [];
						var commonOptions = {
							tooltip : this.createFeatureActionTip,
							menuText : this.createFeatureActionText,
							text : this.createFeatureActionText,
							iconCls : this.iconClsAdd,
							disabled : true,
							hidden : this.modifyOnly || this.readOnly,
							toggleGroup : toggleGroup,
							enableToggle : true,
							allowDepress : true,
							control : this.drawControl,
							deactivateOnDisable : true,
							map : this.target.mapPanel.map
						};
						if (this.supportAbstractGeometry === true) {
							var menuItems = [];
							if (this.supportNoGeometry === true) {
								menuItems
										.push(new Ext.menu.CheckItem(
												{
													text : this.noGeometryText,
													iconCls : "gxp-icon-event",
													groupClass : null,
													group : toggleGroup,
													listeners : {
														checkchange : function(
																item, checked) {
															if (checked === true) {
																var feature = new OpenLayers.Feature.Vector(
																		null);
																feature.state = OpenLayers.State.INSERT;
																featureLayer
																		.addFeatures([ feature ]);
																this._forcePopupForNoGeometry = true;
																featureLayer.events
																		.triggerEvent(
																				"featureselected",
																				{
																					feature : feature
																				});
																delete this._forcePopupForNoGeometry;
															}
															this.actions[0].items[0]
																	.setChecked(false);
														},
														scope : this
													}
												}));
							}
							var checkChange = function(item, checked, Handler) {
								if (checked === true) {
									this.setHandler(Handler, false);
								}
								this.actions[0].items[0].setChecked(checked);
							};
							menuItems.push(new Ext.menu.CheckItem({
								groupClass : null,
								text : this.pointText,
								group : toggleGroup,
								iconCls : 'gxp-icon-point',
								listeners : {
									checkchange : checkChange.createDelegate(
											this, [ OpenLayers.Handler.Point ],
											2)
								}
							}), new Ext.menu.CheckItem({
								groupClass : null,
								text : this.lineText,
								group : toggleGroup,
								iconCls : 'gxp-icon-line',
								listeners : {
									checkchange : checkChange.createDelegate(
											this, [ OpenLayers.Handler.Path ],
											2)
								}
							}), new Ext.menu.CheckItem({
								groupClass : null,
								text : this.polygonText,
								group : toggleGroup,
								iconCls : 'gxp-icon-polygon',
								listeners : {
									checkchange : checkChange.createDelegate(
											this,
											[ OpenLayers.Handler.Polygon ], 2)
								}
							}));
							actions.push(new GeoExt.Action(Ext.apply(
									commonOptions, {
										menu : new Ext.menu.Menu({
											items : menuItems
										})
									})));
						} else {
							actions.push(new GeoExt.Action(commonOptions));
						}
						actions.push(new GeoExt.Action({
							tooltip : this.editFeatureActionTip,
							text : this.editFeatureActionText,
							menuText : this.editFeatureActionText,
							iconCls : this.iconClsEdit,
							disabled : true,
							toggleGroup : toggleGroup,
							enableToggle : true,
							allowDepress : true,
							control : this.selectControl,
							deactivateOnDisable : true,
							map : this.target.mapPanel.map
						}));
						actions = gxp.plugins.FeatureEditor.superclass.addActions
								.call(this, actions);
						featureManager.on("layerchange", this.onLayerChange,
								this);
						var snappingAgent = this.getSnappingAgent();
						if (snappingAgent) {
							snappingAgent.registerEditor(this);
						}
						return actions;
					},
					getFeatureManager : function() {
						var manager = this.target.tools[this.featureManager];
						if (!manager) {
							throw new Error(
									"Unable to access feature manager by id: "
											+ this.featureManager);
						}
						return manager;
					},
					getSnappingAgent : function() {
						var agent;
						var snapId = this.snappingAgent;
						if (snapId) {
							agent = this.target.tools[snapId];
							if (!agent) {
								throw new Error(
										"Unable to locate snapping agent with id: "
												+ snapId);
							}
						}
						return agent;
					},
					setHandler : function(Handler, multi) {
						var control = this.drawControl;
						var active = control.active;
						if (active) {
							control.deactivate();
						}
						control.handler.destroy();
						control.handler = new Handler(control,
								control.callbacks, Ext.apply(
										control.handlerOptions, {
											multi : multi
										}));
						if (active) {
							control.activate();
						}
					},
					enableOrDisable : function() {
						var disable = !this.schema
								|| !this.target.isAuthorized();
						this.actions[0].setDisabled(disable);
						this.actions[1].setDisabled(disable);
						return disable;
					},
					onLayerChange : function(mgr, layer, schema) {
						this.schema = schema;
						var disable = this.enableOrDisable();
						if (disable) {
							this.fireEvent("layereditable", this, layer, false);
							return;
						}
						var control = this.drawControl;
						var button = this.actions[0];
						var handlers = {
							"Point" : OpenLayers.Handler.Point,
							"Line" : OpenLayers.Handler.Path,
							"Curve" : OpenLayers.Handler.Path,
							"Polygon" : OpenLayers.Handler.Polygon,
							"Surface" : OpenLayers.Handler.Polygon
						};
						var simpleType = mgr.geometryType.replace("Multi", "");
						var Handler = handlers[simpleType];
						if (Handler) {
							var multi = (simpleType != mgr.geometryType);
							this.setHandler(Handler, multi);
							button.enable();
						} else if (this.supportAbstractGeometry === true
								&& mgr.geometryType === 'Geometry') {
							button.enable();
						} else {
							button.disable();
						}
						this.fireEvent("layereditable", this, layer, true);
					},
					select : function(feature) {
						this.selectControl.unselectAll(this.popup
								&& this.popup.editing && {
									except : this.popup.feature
								});
						this.selectControl.select(feature);
					}
				});
Ext.preg(gxp.plugins.FeatureEditor.prototype.ptype, gxp.plugins.FeatureEditor);
Ext.namespace("gxp.plugins");
gxp.plugins.StyleWriter = Ext.extend(Ext.util.Observable, {
	deletedStyles : null,
	constructor : function(config) {
		this.initialConfig = config;
		Ext.apply(this, config);
		this.deletedStyles = [];
		gxp.plugins.StyleWriter.superclass.constructor.apply(this, arguments);
	},
	init : function(target) {
		this.target = target;
		target.stylesStore.on({
			"remove" : function(store, record, index) {
				var styleName = record.get("name");
				record.get("name") === styleName
						&& this.deletedStyles.push(styleName);
			},
			scope : this
		});
		target.on({
			"beforesaved" : this.write,
			scope : this
		});
	},
	write : function(target, options) {
		target.stylesStore.commitChanges();
		target.fireEvent("saved", target, target.selectedStyle.get("name"));
	}
});
Ext.namespace("gxp.plugins");
gxp.plugins.GeoServerStyleWriter = Ext
		.extend(
				gxp.plugins.StyleWriter,
				{
					baseUrl : "/geoserver/rest",
					constructor : function(config) {
						this.initialConfig = config;
						Ext.apply(this, config);
						gxp.plugins.GeoServerStyleWriter.superclass.constructor
								.apply(this, arguments);
					},
					write : function(options) {
						options = options || {};
						var dispatchQueue = [];
						var store = this.target.stylesStore;
						store.each(function(rec) {
							(rec.phantom || store.modified.indexOf(rec) !== -1)
									&& this.writeStyle(rec, dispatchQueue);
						}, this);
						var success = function() {
							this.deleteStyles();
							var modified = this.target.stylesStore
									.getModifiedRecords();
							for ( var i = modified.length - 1; i >= 0; --i) {
								modified[i].phantom = false;
							}
							var target = this.target;
							target.stylesStore.commitChanges();
							options.success
									&& options.success.call(options.scope);
							target.fireEvent("saved", target,
									target.selectedStyle.get("name"));
						};
						if (dispatchQueue.length > 0) {
							gxp.util.dispatch(dispatchQueue, function() {
								this
										.assignStyles(options.defaultStyle,
												success);
							}, this);
						} else {
							this.assignStyles(options.defaultStyle, success);
						}
					},
					writeStyle : function(styleRec, dispatchQueue) {
						var styleName = styleRec.get("userStyle").name;
						dispatchQueue
								.push(function(callback, storage) {
									Ext.Ajax
											.request({
												method : styleRec.phantom === true ? "POST"
														: "PUT",
												url : this.baseUrl
														+ "/styles"
														+ (styleRec.phantom === true ? ""
																: "/"
																		+ styleName
																		+ ".xml"),
												headers : {
													"Content-Type" : "application/vnd.ogc.sld+xml; charset=UTF-8"
												},
												xmlData : this.target
														.createSLD({
															userStyles : [ styleName ]
														}),
												success : styleRec.phantom === true ? function() {
													Ext.Ajax
															.request({
																method : "POST",
																url : this.baseUrl
																		+ "/layers/"
																		+ this.target.layerRecord
																				.get("name")
																		+ "/styles.json",
																jsonData : {
																	"style" : {
																		"name" : styleName
																	}
																},
																success : callback,
																scope : this
															});
												}
														: callback,
												scope : this
											});
								});
					},
					assignStyles : function(defaultStyle, callback) {
						var styles = [];
						this.target.stylesStore
								.each(
										function(rec) {
											if (!defaultStyle
													&& rec.get("userStyle").isDefault === true) {
												defaultStyle = rec.get("name");
											}
											if (rec.get("name") !== defaultStyle
													&& this.deletedStyles
															.indexOf(rec.id) === -1) {
												styles.push({
													"name" : rec.get("name")
												});
											}
										}, this);
						Ext.Ajax.request({
							method : "PUT",
							url : this.baseUrl + "/layers/"
									+ this.target.layerRecord.get("name")
									+ ".json",
							jsonData : {
								"layer" : {
									"defaultStyle" : {
										"name" : defaultStyle
									},
									"styles" : styles.length > 0 ? {
										"style" : styles
									} : {},
									"enabled" : true
								}
							},
							success : callback,
							scope : this
						});
					},
					deleteStyles : function() {
						for ( var i = 0, len = this.deletedStyles.length; i < len; ++i) {
							Ext.Ajax.request({
								method : "DELETE",
								url : this.baseUrl + "/styles/"
										+ this.deletedStyles[i] + "?purge=true"
							});
						}
						this.deletedStyles = [];
					}
				});
Ext.preg("gxp_geoserverstylewriter", gxp.plugins.GeoServerStyleWriter);
Ext.namespace("gxp.plugins");
gxp.plugins.LayerSource = Ext
		.extend(
				Ext.util.Observable,
				{
					store : null,
					title : "",
					constructor : function(config) {
						this.initialConfig = config;
						Ext.apply(this, config);
						this.addEvents("ready", "failure");
						gxp.plugins.LayerSource.superclass.constructor.apply(
								this, arguments);
					},
					init : function(target) {
						this.target = target;
						this.createStore();
					},
					getMapProjection : function() {
						var projConfig = this.target.mapPanel.map.projection;
						return this.target.mapPanel.map.getProjectionObject()
								|| (projConfig && new OpenLayers.Projection(
										projConfig))
								|| new OpenLayers.Projection("EPSG:4326");
					},
					getProjection : function(layerRecord) {
						var layer = layerRecord.getLayer();
						var mapProj = this.getMapProjection();
						var proj = layer.projection ? layer.projection instanceof OpenLayers.Projection ? layer.projection
								: new OpenLayers.Projection(layer.projection)
								: mapProj;
						return proj.equals(mapProj) ? mapProj : null;
					},
					createStore : function() {
						this.fireEvent("ready", this);
					},
					createLayerRecord : function(config) {
					},
					getConfigForRecord : function(record) {
						var layer = record.getLayer();
						return {
							source : record.get("source"),
							name : record.get("name"),
							title : record.get("title"),
							visibility : layer.getVisibility(),
							opacity : layer.opacity || undefined,
							group : record.get("group"),
							fixed : record.get("fixed"),
							selected : record.get("selected")
						};
					}
				});
Ext.namespace("gxp.plugins");
gxp.plugins.BingSource = Ext
		.extend(
				gxp.plugins.LayerSource,
				{
					ptype : "gxp_bingsource",
					title : "Bing Layers",
					roadTitle : "Bing Roads",
					aerialTitle : "Bing Aerial",
					labeledAerialTitle : "Bing Aerial With Labels",
					apiKey : "AqTGBsziZHIJYYxgivLBf0hVdrAk9mWO5cQcb8Yux8sW5M8c8opEC2lZqKR1ZZXf",
					createStore : function() {
						var layers = [ new OpenLayers.Layer.Bing({
							key : this.apiKey,
							name : this.roadTitle,
							type : "Road",
							buffer : 1
						}), new OpenLayers.Layer.Bing({
							key : this.apiKey,
							name : this.aerialTitle,
							type : "Aerial",
							buffer : 1
						}), new OpenLayers.Layer.Bing({
							key : this.apiKey,
							name : this.labeledAerialTitle,
							type : "AerialWithLabels",
							buffer : 1
						}) ];
						this.store = new GeoExt.data.LayerStore({
							layers : layers,
							fields : [ {
								name : "source",
								type : "string"
							}, {
								name : "name",
								type : "string",
								mapping : "type"
							}, {
								name : "abstract",
								type : "string",
								mapping : "attribution"
							}, {
								name : "group",
								type : "string",
								defaultValue : "background"
							}, {
								name : "fixed",
								type : "boolean",
								defaultValue : true
							}, {
								name : "selected",
								type : "boolean"
							} ]
						});
						this.store.each(function(l) {
							l.set("group", "background");
						});
						this.fireEvent("ready", this);
					},
					createLayerRecord : function(config) {
						var record;
						var index = this.store.findExact("name", config.name);
						if (index > -1) {
							record = this.store.getAt(index).copy(
									Ext.data.Record.id({}));
							var layer = record.getLayer().clone();
							if (config.title) {
								layer.setName(config.title);
								record.set("title", config.title);
							}
							if ("visibility" in config) {
								layer.visibility = config.visibility;
							}
							record.set("selected", config.selected || false);
							record.set("source", config.source);
							record.set("name", config.name);
							if ("group" in config) {
								record.set("group", config.group);
							}
							record.data.layer = layer;
							record.commit();
						}
						;
						return record;
					}
				});
Ext.preg(gxp.plugins.BingSource.prototype.ptype, gxp.plugins.BingSource);
Ext.namespace("gxp.plugins");
gxp.plugins.GoogleSource = Ext.extend(gxp.plugins.LayerSource, {
	ptype : "gxp_googlesource",
	timeout : 7000,
	title : "Google Layers",
	roadmapAbstract : "Show street map",
	satelliteAbstract : "Show satellite imagery",
	hybridAbstract : "Show imagery with street names",
	terrainAbstract : "Show street map with terrain",
	constructor : function(config) {
		this.config = config;
		gxp.plugins.GoogleSource.superclass.constructor.apply(this, arguments);
	},
	createStore : function() {
		gxp.plugins.GoogleSource.loader.onLoad({
			timeout : this.timeout,
			callback : this.syncCreateStore,
			errback : function() {
				delete this.store;
				this.fireEvent("failure", this,
						"The Google Maps script failed to load within the provided timeout ("
								+ (this.timeout / 1000) + " s).");
			},
			scope : this
		});
	},
	syncCreateStore : function() {
		var mapTypes = {
			"ROADMAP" : {
				"abstract" : this.roadmapAbstract,
				MAX_ZOOM_LEVEL : 20
			},
			"SATELLITE" : {
				"abstract" : this.satelliteAbstract
			},
			"HYBRID" : {
				"abstract" : this.hybridAbstract
			},
			"TERRAIN" : {
				"abstract" : this.terrainAbstract,
				MAX_ZOOM_LEVEL : 15
			}
		};
		var layers = [];
		var name, mapType;
		for (name in mapTypes) {
			mapType = google.maps.MapTypeId[name];
			layers.push(new OpenLayers.Layer.Google("Google "
					+ mapType.replace(/\w/, function(c) {
						return c.toUpperCase();
					}), {
				type : mapType,
				typeName : name,
				MAX_ZOOM_LEVEL : mapTypes[name].MAX_ZOOM_LEVEL,
				maxExtent : new OpenLayers.Bounds(-20037508.34, -20037508.34,
						20037508.34, 20037508.34),
				restrictedExtent : new OpenLayers.Bounds(-20037508.34,
						-20037508.34, 20037508.34, 20037508.34),
				projection : this.projection
			}));
		}
		this.store = new GeoExt.data.LayerStore({
			layers : layers,
			fields : [ {
				name : "source",
				type : "string"
			}, {
				name : "name",
				type : "string",
				mapping : "typeName"
			}, {
				name : "abstract",
				type : "string"
			}, {
				name : "group",
				type : "string",
				defaultValue : "background"
			}, {
				name : "fixed",
				type : "boolean",
				defaultValue : true
			}, {
				name : "selected",
				type : "boolean"
			} ]
		});
		this.store.each(function(l) {
			l.set("abstract", mapTypes[l.get("name")]["abstract"]);
		});
		this.fireEvent("ready", this);
	},
	createLayerRecord : function(config) {
		var record;
		var cmp = function(l) {
			return l.get("name") === config.name;
		};
		if (this.target.mapPanel.layers.findBy(cmp) == -1) {
			record = this.store.getAt(this.store.findBy(cmp)).clone();
			var layer = record.getLayer();
			if (config.title) {
				layer.setName(config.title);
				record.set("title", config.title);
			}
			if ("visibility" in config) {
				layer.visibility = config.visibility;
			}
			record.set("selected", config.selected || false);
			record.set("source", config.source);
			record.set("name", config.name);
			if ("group" in config) {
				record.set("group", config.group);
			}
			record.commit();
		}
		return record;
	}
});
gxp.plugins.GoogleSource.loader = new (Ext
		.extend(
				Ext.util.Observable,
				{
					ready : !!(window.google && google.maps),
					loading : false,
					constructor : function() {
						this.addEvents("ready", "failure");
						return Ext.util.Observable.prototype.constructor.apply(
								this, arguments);
					},
					onScriptLoad : function() {
						var monitor = gxp.plugins.GoogleSource.loader;
						if (!monitor.ready) {
							monitor.ready = true;
							monitor.loading = false;
							monitor.fireEvent("ready");
						}
					},
					onLoad : function(options) {
						if (this.ready) {
							window.setTimeout(function() {
								options.callback.call(options.scope);
							}, 0);
						} else if (!this.loading) {
							this.loadScript(options);
						} else {
							this.on({
								ready : options.callback,
								failure : options.errback || Ext.emptyFn,
								scope : options.scope
							});
						}
					},
					loadScript : function(options) {
						var params = {
							autoload : Ext
									.encode({
										modules : [ {
											name : "maps",
											version : 3.3,
											nocss : "true",
											callback : "gxp.plugins.GoogleSource.loader.onScriptLoad",
											other_params : "sensor=false"
										} ]
									})
						};
						var script = document.createElement("script");
						script.src = "http://www.google.com/jsapi?"
								+ Ext.urlEncode(params);
						var errback = options.errback || Ext.emptyFn;
						var timeout = options.timeout
								|| gxp.plugins.GoogleSource.prototype.timeout;
						window.setTimeout((function() {
							if (!gxp.plugins.GoogleSource.loader.ready) {
								this.loading = false;
								this.ready = false;
								document.getElementsByTagName("head")[0]
										.removeChild(script);
								errback.call(options.scope);
								this.fireEvent("failure");
								this.purgeListeners();
							}
						}).createDelegate(this), timeout);
						this.on({
							ready : options.callback,
							scope : options.scope
						});
						this.loading = true;
						document.getElementsByTagName("head")[0]
								.appendChild(script);
					}
				}))();
Ext.preg(gxp.plugins.GoogleSource.prototype.ptype, gxp.plugins.GoogleSource);
Ext.namespace("gxp.plugins");
gxp.plugins.OLSource = Ext.extend(gxp.plugins.LayerSource, {
	ptype : "gxp_olsource",
	createLayerRecord : function(config) {
		var record;
		var Class = window;
		var parts = config.type.split(".");
		for ( var i = 0, ii = parts.length; i < ii; ++i) {
			Class = Class[parts[i]];
			if (!Class) {
				break;
			}
		}
		if (Class && Class.prototype && Class.prototype.initialize) {
			var Constructor = function() {
				Class.prototype.initialize.apply(this, config.args);
			};
			Constructor.prototype = Class.prototype;
			var layer = new Constructor();
			if ("visibility" in config) {
				layer.visibility = config.visibility;
			}
			var Record = GeoExt.data.LayerRecord.create([ {
				name : "name",
				type : "string"
			}, {
				name : "source",
				type : "string"
			}, {
				name : "group",
				type : "string"
			}, {
				name : "fixed",
				type : "boolean"
			}, {
				name : "selected",
				type : "boolean"
			}, {
				name : "type",
				type : "string"
			}, {
				name : "args"
			} ]);
			var data = {
				layer : layer,
				title : layer.name,
				name : config.name || layer.name,
				source : config.source,
				group : config.group,
				fixed : ("fixed" in config) ? config.fixed : false,
				selected : ("selected" in config) ? config.selected : false,
				type : config.type,
				args : config.args,
				properties : ("properties" in config) ? config.properties
						: undefined
			};
			record = new Record(data, layer.id);
		} else {
			throw new Error(
					"Cannot construct OpenLayers layer from given type: "
							+ config.type);
		}
		return record;
	},
	getConfigForRecord : function(record) {
		var config = gxp.plugins.OLSource.superclass.getConfigForRecord.apply(
				this, arguments);
		var layer = record.getLayer();
		return Ext.apply(config, {
			type : record.get("type"),
			args : record.get("args")
		});
	}
});
Ext.preg(gxp.plugins.OLSource.prototype.ptype, gxp.plugins.OLSource);
Ext.namespace("gxp.plugins");
gxp.plugins.OSMSource = Ext
		.extend(
				gxp.plugins.LayerSource,
				{
					ptype : "gxp_osmsource",
					title : "OpenStreetMap Layers",
					mapnikAttribution : "Data CC-By-SA by <a href='http://openstreetmap.org/' target='_blank'>OpenStreetMap</a>",
					osmarenderAttribution : "Data CC-By-SA by <a href='http://openstreetmap.org/' target='_blank'>OpenStreetMap</a>",
					createStore : function() {
						var options = {
							projection : "EPSG:900913",
							maxExtent : new OpenLayers.Bounds(
									-128 * 156543.0339, -128 * 156543.0339,
									128 * 156543.0339, 128 * 156543.0339),
							maxResolution : 156543.03390625,
							numZoomLevels : 19,
							units : "m",
							buffer : 1
						};
						var layers = [
								new OpenLayers.Layer.OSM(
										"OpenStreetMap",
										[
												"http://a.tile.openstreetmap.org/${z}/${x}/${y}.png",
												"http://b.tile.openstreetmap.org/${z}/${x}/${y}.png",
												"http://c.tile.openstreetmap.org/${z}/${x}/${y}.png" ],
										OpenLayers.Util
												.applyDefaults(
														{
															attribution : this.mapnikAttribution,
															type : "mapnik"
														}, options)),
								new OpenLayers.Layer.OSM(
										"Tiles@home",
										[
												"http://a.tah.openstreetmap.org/Tiles/tile/${z}/${x}/${y}.png",
												"http://b.tah.openstreetmap.org/Tiles/tile/${z}/${x}/${y}.png",
												"http://c.tah.openstreetmap.org/Tiles/tile/${z}/${x}/${y}.png" ],
										OpenLayers.Util
												.applyDefaults(
														{
															attribution : this.osmarenderAttribution,
															type : "osmarender"
														}, options)) ];
						this.store = new GeoExt.data.LayerStore({
							layers : layers,
							fields : [ {
								name : "source",
								type : "string"
							}, {
								name : "name",
								type : "string",
								mapping : "type"
							}, {
								name : "abstract",
								type : "string",
								mapping : "attribution"
							}, {
								name : "group",
								type : "string",
								defaultValue : "background"
							}, {
								name : "fixed",
								type : "boolean",
								defaultValue : true
							}, {
								name : "selected",
								type : "boolean"
							} ]
						});
						this.store.each(function(l) {
							l.set("group", "background");
						});
						this.fireEvent("ready", this);
					},
					createLayerRecord : function(config) {
						var record;
						var index = this.store.findExact("name", config.name);
						if (index > -1) {
							record = this.store.getAt(index).copy(
									Ext.data.Record.id({}));
							var layer = record.getLayer().clone();
							if (config.title) {
								layer.setName(config.title);
								record.set("title", config.title);
							}
							if ("visibility" in config) {
								layer.visibility = config.visibility;
							}
							record.set("selected", config.selected || false);
							record.set("source", config.source);
							record.set("name", config.name);
							if ("group" in config) {
								record.set("group", config.group);
							}
							record.data.layer = layer;
							record.commit();
						}
						return record;
					}
				});
Ext.preg(gxp.plugins.OSMSource.prototype.ptype, gxp.plugins.OSMSource);
Ext.namespace("gxp.plugins");
gxp.plugins.MapBoxSource = Ext
		.extend(
				gxp.plugins.LayerSource,
				{
					ptype : "gxp_mapboxsource",
					title : "MapBox Layers",
					blueMarbleTopoBathyJanTitle : "Blue Marble Topography & Bathymetry (January)",
					blueMarbleTopoBathyJulTitle : "Blue Marble Topography & Bathymetry (July)",
					blueMarbleTopoJanTitle : "Blue Marble Topography (January)",
					blueMarbleTopoJulTitle : "Blue Marble Topography (July)",
					controlRoomTitle : "Control Room",
					geographyClassTitle : "Geography Class",
					naturalEarthHypsoTitle : "Natural Earth Hypsometric",
					naturalEarthHypsoBathyTitle : "Natural Earth Hypsometric & Bathymetry",
					naturalEarth1Title : "Natural Earth I",
					naturalEarth2Title : "Natural Earth II",
					worldDarkTitle : "World Dark",
					worldLightTitle : "World Light",
					worldGlassTitle : "World Glass",
					worldPrintTitle : "World Print",
					createStore : function() {
						var options = {
							projection : "EPSG:900913",
							maxExtent : new OpenLayers.Bounds(
									-128 * 156543.0339, -128 * 156543.0339,
									128 * 156543.0339, 128 * 156543.0339),
							maxResolution : 156543.03390625,
							numZoomLevels : 19,
							units : "m",
							buffer : 1
						};
						var configs = [ {
							name : "blue-marble-topo-bathy-jan",
							numZoomLevels : 9
						}, {
							name : "blue-marble-topo-bathy-jul",
							numZoomLevels : 9
						}, {
							name : "blue-marble-topo-jan",
							numZoomLevels : 9
						}, {
							name : "blue-marble-topo-jul",
							numZoomLevels : 9
						}, {
							name : "control-room",
							numZoomLevels : 9
						}, {
							name : "geography-class",
							numZoomLevels : 9
						}, {
							name : "natural-earth-hypso",
							numZoomLevels : 7
						}, {
							name : "natural-earth-hypso-bathy",
							numZoomLevels : 7
						}, {
							name : "natural-earth-1",
							numZoomLevels : 7
						}, {
							name : "natural-earth-2",
							numZoomLevels : 7
						}, {
							name : "world-dark",
							numZoomLevels : 12
						}, {
							name : "world-light",
							numZoomLevels : 12
						}, {
							name : "world-glass",
							numZoomLevels : 11
						}, {
							name : "world-print",
							numZoomLevels : 10
						} ];
						var len = configs.length;
						var layers = new Array(len);
						var config;
						for ( var i = 0; i < len; ++i) {
							config = configs[i];
							layers[i] = new OpenLayers.Layer.TMS(
									this[OpenLayers.String
											.camelize(config.name)
											+ "Title"],
									[
											"http://a.tiles.mapbox.com/mapbox/",
											"http://b.tiles.mapbox.com/mapbox/",
											"http://c.tiles.mapbox.com/mapbox/",
											"http://d.tiles.mapbox.com/mapbox/" ],
									OpenLayers.Util
											.applyDefaults(
													{
														attribution : "<a href='http://mapbox.com'>MapBox</a> | <a href='http://mapbox.com/tos'>Terms of Service</a>",
														type : "png",
														tileOrigin : new OpenLayers.LonLat(
																-128 * 156543.0339,
																-128 * 156543.0339),
														layername : config.name,
														numZoomLevels : config.numZoomLevels
													}, options));
						}
						this.store = new GeoExt.data.LayerStore({
							layers : layers,
							fields : [ {
								name : "source",
								type : "string"
							}, {
								name : "name",
								type : "string",
								mapping : "layername"
							}, {
								name : "abstract",
								type : "string",
								mapping : "attribution"
							}, {
								name : "group",
								type : "string"
							}, {
								name : "fixed",
								type : "boolean"
							}, {
								name : "selected",
								type : "boolean"
							} ]
						});
						this.fireEvent("ready", this);
					},
					createLayerRecord : function(config) {
						var record;
						var index = this.store.findExact("name", config.name);
						if (index > -1) {
							record = this.store.getAt(index).copy(
									Ext.data.Record.id({}));
							var layer = record.getLayer().clone();
							if (config.title) {
								layer.setName(config.title);
								record.set("title", config.title);
							}
							if ("visibility" in config) {
								layer.visibility = config.visibility;
							}
							record.set("selected", config.selected || false);
							record.set("source", config.source);
							record.set("name", config.name);
							if ("group" in config) {
								record.set("group", config.group);
							}
							record.data.layer = layer;
							record.commit();
						}
						return record;
					}
				});
Ext.preg(gxp.plugins.MapBoxSource.prototype.ptype, gxp.plugins.MapBoxSource);
Ext.namespace("gxp.plugins");
gxp.plugins.MapQuestSource = Ext
		.extend(
				gxp.plugins.LayerSource,
				{
					ptype : "gxp_mapquestsource",
					title : "MapQuest Layers",
					osmAttribution : "Tiles Courtesy of <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
					osmTitle : "MapQuest OpenStreetMap",
					naipAttribution : "Tiles Courtesy of <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
					naipTitle : "MapQuest Imagery",
					createStore : function() {
						var options = {
							projection : "EPSG:900913",
							maxExtent : new OpenLayers.Bounds(
									-128 * 156543.0339, -128 * 156543.0339,
									128 * 156543.0339, 128 * 156543.0339),
							maxResolution : 156543.03390625,
							numZoomLevels : 19,
							units : "m",
							buffer : 1
						};
						var layers = [
								new OpenLayers.Layer.OSM(
										this.osmTitle,
										[
												"http://otile1.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png",
												"http://otile2.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png",
												"http://otile3.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png",
												"http://otile4.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png" ],
										OpenLayers.Util.applyDefaults({
											attribution : this.osmAttribution,
											type : "osm"
										}, options)),
								new OpenLayers.Layer.OSM(
										this.naipTitle,
										[
												"http://oatile1.mqcdn.com/naip/${z}/${x}/${y}.png",
												"http://oatile2.mqcdn.com/naip/${z}/${x}/${y}.png",
												"http://oatile3.mqcdn.com/naip/${z}/${x}/${y}.png",
												"http://oatile4.mqcdn.com/naip/${z}/${x}/${y}.png" ],
										OpenLayers.Util.applyDefaults({
											attribution : this.naipAttribution,
											type : "naip"
										}, options)) ];
						this.store = new GeoExt.data.LayerStore({
							layers : layers,
							fields : [ {
								name : "source",
								type : "string"
							}, {
								name : "name",
								type : "string",
								mapping : "type"
							}, {
								name : "abstract",
								type : "string",
								mapping : "attribution"
							}, {
								name : "group",
								type : "string",
								defaultValue : "background"
							}, {
								name : "fixed",
								type : "boolean",
								defaultValue : true
							}, {
								name : "selected",
								type : "boolean"
							} ]
						});
						this.store.each(function(l) {
							l.set("group", "background");
						});
						this.fireEvent("ready", this);
					},
					createLayerRecord : function(config) {
						var record;
						var index = this.store.findExact("name", config.name);
						if (index > -1) {
							record = this.store.getAt(index).copy(
									Ext.data.Record.id({}));
							var layer = record.getLayer().clone();
							if (config.title) {
								layer.setName(config.title);
								record.set("title", config.title);
							}
							if ("visibility" in config) {
								layer.visibility = config.visibility;
							}
							record.set("selected", config.selected || false);
							record.set("source", config.source);
							record.set("name", config.name);
							if ("group" in config) {
								record.set("group", config.group);
							}
							record.data.layer = layer;
							record.commit();
						}
						return record;
					}
				});
Ext
		.preg(gxp.plugins.MapQuestSource.prototype.ptype,
				gxp.plugins.MapQuestSource);
(function() {
	function keepRaw(data) {
		var format = this.meta.format;
		if (typeof data === "string" || data.nodeType) {
			data = format.read(data);
			var origRead = format.read;
			format.read = function() {
				format.read = origRead;
				return data;
			};
		}
		this.raw = data;
	}
	Ext.intercept(GeoExt.data.WMSCapabilitiesReader.prototype, "readRecords",
			keepRaw);
	GeoExt.data.AttributeReader
			&& Ext.intercept(GeoExt.data.AttributeReader.prototype,
					"readRecords", keepRaw);
})();
Ext.namespace("gxp.plugins");
gxp.plugins.WMSSource = Ext
		.extend(
				gxp.plugins.LayerSource,
				{
					ptype : "gxp_wmssource",
					baseParams : null,
					format : null,
					describeLayerStore : null,
					describedLayers : null,
					schemaCache : null,
					ready : false,
					constructor : function(config) {
						gxp.plugins.WMSSource.superclass.constructor.apply(
								this, arguments);
						if (!this.format) {
							this.format = new OpenLayers.Format.WMSCapabilities(
									{
										keepData : true
									});
						}
					},
					init : function(target) {
						gxp.plugins.WMSSource.superclass.init.apply(this,
								arguments);
						this.target.on("loginchanged", this.onLoginChanged,
								this);
					},
					onLoginChanged : function() {
						if (this.store) {
							this.store.reload();
						}
					},
					destroy : function() {
						this.target.un("loginchanged", this.onLoginChanged,
								this);
						gxp.plugins.WMSSource.superclass.destroy.apply(this,
								arguments);
					},
					isLazy : function() {
						var lazy = false;
						var mapConfig = this.target.initialConfig.map;
						if (mapConfig && mapConfig.layers) {
							var layerConfig;
							for ( var i = 0, ii = mapConfig.layers.length; i < ii; ++i) {
								layerConfig = mapConfig.layers[i];
								if (layerConfig.source === this.id) {
									lazy = this
											.layerConfigComplete(layerConfig);
									if (lazy === false) {
										break;
									}
								}
							}
						}
						return lazy;
					},
					layerConfigComplete : function(config) {
						return config.forceLazy === true
								|| this.forceLazy === true;
					},
					createStore : function() {
						var baseParams = this.baseParams || {
							SERVICE : "WMS",
							REQUEST : "GetCapabilities"
						};
						if (this.version) {
							baseParams.VERSION = this.version;
						}
						var lazy = this.isLazy();
						this.store = new GeoExt.data.WMSCapabilitiesStore(
								{
									url : this.trimUrl(this.url, baseParams),
									baseParams : baseParams,
									format : this.format,
									autoLoad : !lazy,
									layerParams : {
										exceptions : null
									},
									listeners : {
										load : function() {
											if (!this.store.reader.raw
													|| !this.store.reader.raw.service) {
												this
														.fireEvent("failure",
																this,
																"Invalid capabilities document.");
											} else {
												if (!this.title) {
													this.title = this.store.reader.raw.service.title;
												}
												if (!this.ready) {
													this.ready = true;
													this.fireEvent("ready",
															this);
												}
											}
											delete this.format.data;
										},
										exception : function(proxy, type,
												action, options, response,
												error) {
											delete this.store;
											var msg, details = "";
											if (type === "response") {
												if (typeof error == "string") {
													msg = error;
												} else {
													msg = "Invalid response from server.";
													var data = this.format
															&& this.format.data;
													if (data && data.parseError) {
														msg += "  "
																+ data.parseError.reason
																+ " - line: "
																+ data.parseError.line;
													}
													var status = response.status;
													if (status >= 200
															&& status < 300) {
														var report = error
																&& error.arg
																&& error.arg.exceptionReport;
														details = gxp.util
																.getOGCExceptionText(report);
													} else {
														details = "Status: "
																+ status;
													}
												}
											} else {
												msg = "Trouble creating layer store from response.";
												details = "Unable to handle response.";
											}
											this.fireEvent("failure", this,
													msg, details);
											delete this.format.data;
										},
										scope : this
									}
								});
						if (lazy) {
							window.setTimeout((function() {
								this.fireEvent("ready", this);
							}).createDelegate(this), 0);
						}
					},
					trimUrl : function(url, params, respectCase) {
						var urlParams = OpenLayers.Util.getParameters(url);
						params = OpenLayers.Util.upperCaseObject(params);
						var keys = 0;
						for ( var key in urlParams) {
							++keys;
							if (key.toUpperCase() in params) {
								--keys;
								delete urlParams[key];
							}
						}
						return url.split("?").shift()
								+ (keys ? "?"
										+ OpenLayers.Util
												.getParameterString(urlParams)
										: "");
					},
					createLazyLayerRecord : function(config) {
						var record = new this.store.recordType(config);
						record.setLayer(new OpenLayers.Layer.WMS(config.title
								|| config.name, this.url, {
							layers : config.name
						}));
						if (!config.srs) {
							record.set("srs", this.target.map.projection);
						}
						if (!config.bbox) {
							var bbox = {};
							bbox[record.get("srs")] = {
								bbox : this.target.map.maxExtent
							};
							record.set("bbox", bbox);
						}
						return record;
					},
					createLayerRecord : function(config) {
						var record, original;
						var index = this.store.findExact("name", config.name);
						if (index > -1) {
							original = this.store.getAt(index);
						} else if (this.layerConfigComplete(config)) {
							original = this.createLazyLayerRecord(config);
						}
						if (original) {
							var layer = original.getLayer();
							var projection = this.getMapProjection();
							var layerProjection = this.getProjection(original);
							var projCode = projection.getCode();
							var nativeExtent = original.get("bbox")[projCode];
							var swapAxis = layer.params.VERSION >= "1.3"
									&& !!layer.yx[projCode];
							var maxExtent = (nativeExtent && OpenLayers.Bounds
									.fromArray(nativeExtent.bbox, swapAxis))
									|| OpenLayers.Bounds.fromArray(
											original.get("llbbox")).transform(
											new OpenLayers.Projection(
													"EPSG:4326"), projection);
							if (!(1 / maxExtent.getHeight() > 0)
									|| !(1 / maxExtent.getWidth() > 0)) {
								maxExtent = undefined;
							}
							var params = Ext.applyIf({
								STYLES : config.styles,
								FORMAT : config.format,
								TRANSPARENT : config.transparent
							}, layer.params);
							var singleTile = false;
							if ("tiled" in config) {
								singleTile = !config.tiled;
							} else {
								if (original.data.dimensions
										&& original.data.dimensions.time) {
									singleTile = true;
								}
							}
							layer = new OpenLayers.Layer.WMS(
									config.title || layer.name,
									layer.url,
									params,
									{
										attribution : layer.attribution,
										maxExtent : maxExtent,
										restrictedExtent : maxExtent,
										singleTile : singleTile,
										ratio : config.ratio || 1,
										visibility : ("visibility" in config) ? config.visibility
												: true,
										opacity : ("opacity" in config) ? config.opacity
												: 1,
										buffer : ("buffer" in config) ? config.buffer
												: 1,
										projection : layerProjection,
										dimensions : original.data.dimensions
									});
							var data = Ext
									.applyIf(
											{
												title : layer.name,
												group : config.group,
												infoFormat : config.infoFormat,
												source : config.source,
												properties : "gxp_wmslayerpanel",
												fixed : config.fixed,
												selected : "selected" in config ? config.selected
														: false,
												restUrl : this.restUrl,
												layer : layer
											}, original.data);
							var fields = [ {
								name : "source",
								type : "string"
							}, {
								name : "group",
								type : "string"
							}, {
								name : "properties",
								type : "string"
							}, {
								name : "fixed",
								type : "boolean"
							}, {
								name : "selected",
								type : "boolean"
							}, {
								name : "restUrl",
								type : "string"
							}, {
								name : "infoFormat",
								type : "string"
							} ];
							original.fields.each(function(field) {
								fields.push(field);
							});
							var Record = GeoExt.data.LayerRecord.create(fields);
							record = new Record(data, layer.id);
						}
						return record;
					},
					getProjection : function(layerRecord) {
						var projection = this.getMapProjection();
						var compatibleProjection = projection;
						var availableSRS = layerRecord.get("srs");
						if (!availableSRS[projection.getCode()]) {
							compatibleProjection = null;
							var p, srs;
							for (srs in availableSRS) {
								if ((p = new OpenLayers.Projection(srs))
										.equals(projection)) {
									compatibleProjection = p;
									break;
								}
							}
						}
						return compatibleProjection;
					},
					initDescribeLayerStore : function() {
						var req = this.store.reader.raw.capability.request.describelayer;
						if (req) {
							var version = this.store.reader.raw.version;
							if (parseFloat(version) > 1.1) {
								version = "1.1.1";
							}
							this.describeLayerStore = new GeoExt.data.WMSDescribeLayerStore(
									{
										url : req.href,
										baseParams : {
											VERSION : version,
											REQUEST : "DescribeLayer"
										}
									});
						}
					},
					describeLayer : function(rec, callback, scope) {
						if (!this.describeLayerStore) {
							this.initDescribeLayerStore();
						}
						function delayedCallback(arg) {
							window.setTimeout(function() {
								callback.call(scope, arg);
							}, 0);
						}
						if (!this.describeLayerStore) {
							delayedCallback(false);
							return;
						}
						if (!this.describedLayers) {
							this.describedLayers = {};
						}
						var layerName = rec.getLayer().params.LAYERS;
						var cb = function() {
							var recs = Ext.isArray(arguments[1]) ? arguments[1]
									: arguments[0];
							var rec, name;
							for ( var i = recs.length - 1; i >= 0; i--) {
								rec = recs[i];
								name = rec.get("layerName");
								if (name == layerName) {
									this.describeLayerStore.un("load",
											arguments.callee, this);
									this.describedLayers[name] = true;
									callback.call(scope, rec);
									return;
								} else if (typeof this.describedLayers[name] == "function") {
									var fn = this.describedLayers[name];
									this.describeLayerStore
											.un("load", fn, this);
									fn.apply(this, arguments);
								}
							}
							delete describedLayers[layerName];
							callback.call(scope, false);
						};
						var describedLayers = this.describedLayers;
						var index;
						if (!describedLayers[layerName]) {
							describedLayers[layerName] = cb;
							this.describeLayerStore.load({
								params : {
									LAYERS : layerName
								},
								add : true,
								callback : cb,
								scope : this
							});
						} else if ((index = this.describeLayerStore.findExact(
								"layerName", layerName)) == -1) {
							this.describeLayerStore.on("load", cb, this);
						} else {
							delayedCallback(this.describeLayerStore
									.getAt(index));
						}
					},
					fetchSchema : function(url, typeName, callback, scope) {
						var schema = this.schemaCache[typeName];
						if (schema) {
							if (schema.getCount() == 0) {
								schema.on("load", function() {
									callback.call(scope, schema);
								}, this, {
									single : true
								});
							} else {
								callback.call(scope, schema);
							}
						} else {
							schema = new GeoExt.data.AttributeStore({
								url : url,
								baseParams : {
									SERVICE : "WFS",
									VERSION : "1.1.0",
									REQUEST : "DescribeFeatureType",
									TYPENAME : typeName
								},
								autoLoad : true,
								listeners : {
									"load" : function() {
										callback.call(scope, schema);
									},
									scope : this
								}
							});
							this.schemaCache[typeName] = schema;
						}
					},
					getSchema : function(rec, callback, scope) {
						if (!this.schemaCache) {
							this.schemaCache = {};
						}
						if (rec.get('forceLazy') === true) {
							this.fetchSchema(this.url, rec.get('name'),
									callback, scope);
						} else {
							this.describeLayer(rec, function(r) {
								if (r && r.get("owsType") == "WFS") {
									var typeName = r.get("typeName");
									var url = r.get("owsURL");
									this.fetchSchema(url, typeName, callback,
											scope);
								} else {
									callback.call(scope, false);
								}
							}, this);
						}
					},
					getWFSProtocol : function(record, callback, scope) {
						this
								.getSchema(
										record,
										function(schema) {
											var protocol = false;
											if (schema) {
												var geometryName;
												var geomRegex = /gml:((Multi)?(Point|Line|Polygon|Curve|Surface|Geometry)).*/;
												schema
														.each(
																function(r) {
																	var match = geomRegex
																			.exec(r
																					.get("type"));
																	if (match) {
																		geometryName = r
																				.get("name");
																	}
																}, this);
												protocol = new OpenLayers.Protocol.WFS(
														{
															version : "1.1.0",
															srsName : record
																	.getLayer().projection
																	.getCode(),
															url : schema.url,
															featureType : schema.reader.raw.featureTypes[0].typeName,
															featureNS : schema.reader.raw.targetNamespace,
															geometryName : geometryName
														});
											}
											callback.call(scope, protocol,
													schema, record);
										}, this);
					},
					getConfigForRecord : function(record) {
						var config = gxp.plugins.WMSSource.superclass.getConfigForRecord
								.apply(this, arguments);
						var layer = record.getLayer();
						var params = layer.params;
						return Ext.apply(config, {
							format : params.FORMAT,
							styles : params.STYLES,
							transparent : params.TRANSPARENT
						});
					}
				});
Ext.preg(gxp.plugins.WMSSource.prototype.ptype, gxp.plugins.WMSSource);
Ext.namespace("gxp.plugins");
gxp.plugins.WMSCSource = Ext
		.extend(
				gxp.plugins.WMSSource,
				{
					ptype : "gxp_wmscsource",
					version : "1.1.1",
					constructor : function(config) {
						config.baseParams = {
							SERVICE : "WMS",
							REQUEST : "GetCapabilities",
							TILED : true
						};
						if (!config.format) {
							this.format = new OpenLayers.Format.WMSCapabilities(
									{
										keepData : true,
										profile : "WMSC"
									});
						}
						gxp.plugins.WMSCSource.superclass.constructor.apply(
								this, arguments);
					},
					createLayerRecord : function(config) {
						var record = gxp.plugins.WMSCSource.superclass.createLayerRecord
								.apply(this, arguments);
						if (!record) {
							return;
						}
						var caps;
						if (this.store.reader.raw) {
							caps = this.store.reader.raw.capability;
						}
						var tileSets = (caps && caps.vendorSpecific && caps.vendorSpecific) ? caps.vendorSpecific.tileSets
								: null;
						var layer = record.get("layer");
						if (tileSets !== null) {
							var mapProjection = this.getMapProjection();
							for ( var i = 0, len = tileSets.length; i < len; i++) {
								var tileSet = tileSets[i];
								if (tileSet.layers === layer.params.LAYERS) {
									var tileProjection;
									for ( var srs in tileSet.srs) {
										tileProjection = new OpenLayers.Projection(
												srs);
										break;
									}
									if (mapProjection.equals(tileProjection)) {
										var bbox = tileSet.bbox[srs].bbox;
										layer.projection = tileProjection;
										layer.addOptions({
											resolutions : tileSet.resolutions,
											tileSize : new OpenLayers.Size(
													tileSet.width,
													tileSet.height),
											tileOrigin : new OpenLayers.LonLat(
													bbox[0], bbox[1])
										});
										layer.params.TILED = (config.cached !== false) && true;
										break;
									}
								}
							}
						} else if (this.forceLazy === true
								&& config.cached === true) {
							layer.params.TILED = true;
						}
						return record;
					},
					getConfigForRecord : function(record) {
						var config = gxp.plugins.WMSCSource.superclass.getConfigForRecord
								.apply(this, arguments);
						return Ext.apply(config, {
							cached : !!record.getLayer().params.TILED
						});
					}
				});
Ext.preg(gxp.plugins.WMSCSource.prototype.ptype, gxp.plugins.WMSCSource);
Ext.namespace("gxp.plugins");
gxp.plugins.ZoomToExtent = Ext.extend(gxp.plugins.Tool, {
	ptype : "gxp_zoomtoextent",
	menuText : "Zoom To Max Extent",
	tooltip : "Zoom To Max Extent",
	extent : null,
	closest : true,
	iconCls : "gxp-icon-zoomtoextent",
	closest : true,
	constructor : function(config) {
		gxp.plugins.ZoomToExtent.superclass.constructor.apply(this, arguments);
		if (this.extent instanceof Array) {
			this.extent = OpenLayers.Bounds.fromArray(this.extent);
		}
	},
	addActions : function() {
		return gxp.plugins.ZoomToExtent.superclass.addActions.apply(this, [ {
			text : this.buttonText,
			menuText : this.menuText,
			iconCls : this.iconCls,
			tooltip : this.tooltip,
			handler : function() {
				var map = this.target.mapPanel.map;
				var extent = typeof this.extent == "function" ? this.extent()
						: this.extent;
				if (!extent) {
					var layer, extended;
					for ( var i = 0, len = map.layers.length; i < len; ++i) {
						layer = map.layers[i];
						if (layer.getVisibility()) {
							extended = layer.restrictedExtent
									|| layer.maxExtent;
							if (extent) {
								extent.extend(extended);
							} else if (extended) {
								extent = extended.clone();
							}
						}
					}
				}
				if (extent) {
					var restricted = map.restrictedExtent || map.maxExtent;
					if (restricted) {
						extent = new OpenLayers.Bounds(Math.max(extent.left,
								restricted.left), Math.max(extent.bottom,
								restricted.bottom), Math.min(extent.right,
								restricted.right), Math.min(extent.top,
								restricted.top));
					}
					map.zoomToExtent(extent, this.closest);
				}
			},
			scope : this
		} ]);
	}
});
Ext.preg(gxp.plugins.ZoomToExtent.prototype.ptype, gxp.plugins.ZoomToExtent);
Ext.namespace("gxp.plugins");
gxp.plugins.NavigationHistory = Ext.extend(gxp.plugins.Tool, {
	ptype : "gxp_navigationhistory",
	previousMenuText : "Zoom To Previous Extent",
	nextMenuText : "Zoom To Next Extent",
	previousTooltip : "Zoom To Previous Extent",
	nextTooltip : "Zoom To Next Extent",
	constructor : function(config) {
		gxp.plugins.NavigationHistory.superclass.constructor.apply(this,
				arguments);
	},
	addActions : function() {
		var historyControl = new OpenLayers.Control.NavigationHistory();
		this.target.mapPanel.map.addControl(historyControl);
		var actions = [ new GeoExt.Action({
			menuText : this.previousMenuText,
			iconCls : "gxp-icon-zoom-previous",
			tooltip : this.previousTooltip,
			disabled : true,
			control : historyControl.previous
		}), new GeoExt.Action({
			menuText : this.nextMenuText,
			iconCls : "gxp-icon-zoom-next",
			tooltip : this.nextTooltip,
			disabled : true,
			control : historyControl.next
		}) ];
		return gxp.plugins.NavigationHistory.superclass.addActions.apply(this,
				[ actions ]);
	}
});
Ext.preg(gxp.plugins.NavigationHistory.prototype.ptype,
		gxp.plugins.NavigationHistory);
Ext.namespace("gxp.plugins");
gxp.plugins.Zoom = Ext.extend(gxp.plugins.Tool, {
	ptype : "gxp_zoom",
	zoomInMenuText : "Yakınlaştır",
	zoomOutMenuText : "Uzaklaştır",
	zoomInTooltip : "Yakınlaştır",
	zoomOutTooltip : "Uzaklaştır",
	constructor : function(config) {
		gxp.plugins.Zoom.superclass.constructor.apply(this, arguments);
	},
	addActions : function() {
		var actions = [ new GeoExt.Action({
			tooltip : this.zoomInMenuText,
			iconCls : "gxp-icon-zoom-in",
			map : this.target.mapPanel.map,
			control : new OpenLayers.Control.ZoomBox({
				alwaysZoom : true
			}),
			toggleGroup : this.toggleGroup,
			group : this.toggleGroup,
			scope : this
		}) ];
		return gxp.plugins.Zoom.superclass.addActions.apply(this, [ actions ]);
	}
});
Ext.preg(gxp.plugins.Zoom.prototype.ptype, gxp.plugins.Zoom);
Ext.namespace("gxp.plugins");
gxp.plugins.Measure = Ext
		.extend(
				gxp.plugins.Tool,
				{
					ptype : "gxp_measure",
					outputTarget : "map",
					lengthMenuText : "Length",
					areaMenuText : "Area",
					lengthTooltip : "Measure length",
					areaTooltip : "Measure area",
					measureTooltip : "Measure",
					constructor : function(config) {
						gxp.plugins.Measure.superclass.constructor.apply(this,
								arguments);
					},
					destroy : function() {
						this.button = null;
						gxp.plugins.Measure.superclass.destroy.apply(this,
								arguments);
					},
					createMeasureControl : function(handlerType, title) {
						var styleMap = new OpenLayers.StyleMap({
							"default" : new OpenLayers.Style(null, {
								rules : [ new OpenLayers.Rule({
									symbolizer : {
										"Point" : {
											pointRadius : 4,
											graphicName : "square",
											fillColor : "white",
											fillOpacity : 1,
											strokeWidth : 1,
											strokeOpacity : 1,
											strokeColor : "#333333"
										},
										"Line" : {
											strokeWidth : 3,
											strokeOpacity : 1,
											strokeColor : "#666666",
											strokeDashstyle : "dash"
										},
										"Polygon" : {
											strokeWidth : 2,
											strokeOpacity : 1,
											strokeColor : "#666666",
											fillColor : "white",
											fillOpacity : 0.3
										}
									}
								}) ]
							})
						});
						var cleanup = function() {
							if (measureToolTip) {
								measureToolTip.destroy();
							}
						};
						var makeString = function(metricData) {
							var metric = metricData.measure;
							var metricUnit = metricData.units;
							measureControl.displaySystem = "english";
							var englishData = metricData.geometry.CLASS_NAME
									.indexOf("LineString") > -1 ? measureControl
									.getBestLength(metricData.geometry)
									: measureControl
											.getBestArea(metricData.geometry);
							var english = englishData[0];
							var englishUnit = englishData[1];
							measureControl.displaySystem = "metric";
							var dim = metricData.order == 2 ? '<sup>2</sup>'
									: '';
							return metric.toFixed(2) + " " + metricUnit + dim
									+ "<br>" + english.toFixed(2) + " "
									+ englishUnit + dim;
						};
						var measureToolTip;
						var controlOptions = Ext.apply({},
								this.initialConfig.controlOptions);
						Ext.applyIf(controlOptions, {
							geodesic : true,
							persist : true,
							handlerOptions : {
								layerOptions : {
									styleMap : styleMap
								}
							},
							eventListeners : {
								measurepartial : function(event) {
									cleanup();
									measureToolTip = this.addOutput({
										xtype : 'tooltip',
										html : makeString(event),
										title : title,
										autoHide : false,
										closable : true,
										draggable : false,
										mouseOffset : [ 0, 0 ],
										showDelay : 1,
										listeners : {
											hide : cleanup
										}
									});
									if (event.measure > 0) {
										var px = measureControl.handler.lastUp;
										var p0 = this.target.mapPanel
												.getPosition();
										measureToolTip.targetXY = [
												p0[0] + px.x, p0[1] + px.y ];
										measureToolTip.show();
									}
								},
								measure : function(event) {
									cleanup();
									measureToolTip = this.addOutput({
										xtype : 'tooltip',
										target : Ext.getBody(),
										html : makeString(event),
										title : title,
										autoHide : false,
										closable : true,
										draggable : false,
										mouseOffset : [ 0, 0 ],
										showDelay : 1,
										listeners : {
											hide : function() {
												measureControl.cancel();
												cleanup();
											}
										}
									});
								},
								deactivate : cleanup,
								scope : this
							}
						});
						var measureControl = new OpenLayers.Control.Measure(
								handlerType, controlOptions);
						return measureControl;
					},
					addActions : function() {
						this.activeIndex = 0;
						this.button = new Ext.SplitButton(
								{
									iconCls : "gxp-icon-measure-length",
									tooltip : this.measureTooltip,
									enableToggle : true,
									toggleGroup : this.toggleGroup,
									allowDepress : true,
									handler : function(button, event) {
										if (button.pressed) {
											button.menu.items.itemAt(
													this.activeIndex)
													.setChecked(true);
										}
									},
									scope : this,
									listeners : {
										toggle : function(button, pressed) {
											if (!pressed) {
												button.menu.items
														.each(function(i) {
															i.setChecked(false);
														});
											}
										},
										render : function(button) {
											Ext.ButtonToggleMgr
													.register(button);
										}
									},
									menu : new Ext.menu.Menu(
											{
												items : [
														new Ext.menu.CheckItem(
																new GeoExt.Action(
																		{
																			text : this.lengthMenuText,
																			iconCls : "gxp-icon-measure-length",
																			toggleGroup : this.toggleGroup,
																			group : this.toggleGroup,
																			listeners : {
																				checkchange : function(
																						item,
																						checked) {
																					this.activeIndex = 0;
																					this.button
																							.toggle(checked);
																					if (checked) {
																						this.button
																								.setIconClass(item.iconCls);
																					}
																				},
																				scope : this
																			},
																			map : this.target.mapPanel.map,
																			control : this
																					.createMeasureControl(
																							OpenLayers.Handler.Path,
																							this.lengthTooltip)
																		})),
														new Ext.menu.CheckItem(
																new GeoExt.Action(
																		{
																			text : this.areaMenuText,
																			iconCls : "gxp-icon-measure-area",
																			toggleGroup : this.toggleGroup,
																			group : this.toggleGroup,
																			allowDepress : false,
																			listeners : {
																				checkchange : function(
																						item,
																						checked) {
																					this.activeIndex = 1;
																					this.button
																							.toggle(checked);
																					if (checked) {
																						this.button
																								.setIconClass(item.iconCls);
																					}
																				},
																				scope : this
																			},
																			map : this.target.mapPanel.map,
																			control : this
																					.createMeasureControl(
																							OpenLayers.Handler.Polygon,
																							this.areaTooltip)
																		})) ]
											})
								});
						return gxp.plugins.Measure.superclass.addActions.apply(
								this, [ this.button ]);
					}
				});
Ext.preg(gxp.plugins.Measure.prototype.ptype, gxp.plugins.Measure);
Ext.namespace("gxp.plugins");
gxp.plugins.WMSGetFeatureInfo = Ext
		.extend(
				gxp.plugins.Tool,
				{
					ptype : "gxp_wmsgetfeatureinfo",
					outputTarget : "map",
					popupCache : null,
					infoActionTip : "Get Feature Info",
					popupTitle : "Feature Info",
					format : "html",
					addActions : function() {
						this.popupCache = {};
						var actions = gxp.plugins.WMSGetFeatureInfo.superclass.addActions
								.call(
										this,
										[ {
											tooltip : this.infoActionTip,
											iconCls : "gxp-icon-getfeatureinfo",
											toggleGroup : this.toggleGroup,
											enableToggle : true,
											allowDepress : true,
											toggleHandler : function(button,
													pressed) {
												for ( var i = 0, len = info.controls.length; i < len; i++) {
													if (pressed) {
														info.controls[i]
																.activate();
													} else {
														info.controls[i]
																.deactivate();
													}
												}
											}
										} ]);
						var infoButton = this.actions[0].items[0];
						var info = {
							controls : []
						};
						var updateInfo = function() {
							var queryableLayers = this.target.mapPanel.layers
									.queryBy(function(x) {
										return x.get("queryable");
									});
							var map = this.target.mapPanel.map;
							var control;
							for ( var i = 0, len = info.controls.length; i < len; i++) {
								control = info.controls[i];
								control.deactivate();
								control.destroy();
							}
							info.controls = [];
							queryableLayers
									.each(
											function(x) {
												var layer = x.getLayer();
												var vendorParams = Ext.apply(
														{}, this.vendorParams), param;
												if (this.layerParams) {
													for ( var i = this.layerParams.length - 1; i >= 0; --i) {
														param = this.layerParams[i]
																.toUpperCase();
														vendorParams[param] = layer.params[param];
													}
												}
												var infoFormat = x
														.get("infoFormat");
												if (infoFormat === undefined) {
													infoFormat = this.format == "html" ? "text/html"
															: "application/vnd.ogc.gml";
												}
												var control = new OpenLayers.Control.WMSGetFeatureInfo(
														Ext
																.applyIf(
																		{
																			url : layer.url,
																			queryVisible : true,
																			layers : [ layer ],
																			infoFormat : infoFormat,
																			vendorParams : vendorParams,
																			eventListeners : {
																				getfeatureinfo : function(
																						evt) {
																					var title = x
																							.get("title")
																							|| x
																									.get("name");
																					if (infoFormat == "text/html") {
																						var match = evt.text
																								.match(/<body[^>]*>([\s\S]*)<\/body>/);
																						if (match
																								&& !match[1]
																										.match(/^\s*$/)) {
																							this
																									.displayPopup(
																											evt,
																											title,
																											match[1]);
																						}
																					} else if (infoFormat == "text/plain") {
																						this
																								.displayPopup(
																										evt,
																										title,
																										'<pre>'
																												+ evt.text
																												+ '</pre>');
																					} else {
																						this
																								.displayPopup(
																										evt,
																										title);
																					}
																				},
																				scope : this
																			}
																		},
																		this.controlOptions));
												map.addControl(control);
												info.controls.push(control);
												if (infoButton.pressed) {
													control.activate();
												}
											}, this);
						};
						this.target.mapPanel.layers.on("update", updateInfo,
								this);
						this.target.mapPanel.layers.on("add", updateInfo, this);
						this.target.mapPanel.layers.on("remove", updateInfo,
								this);
						return actions;
					},
					displayPopup : function(evt, title, text) {
						var popup;
						var popupKey = evt.xy.x + "." + evt.xy.y;
						if (!(popupKey in this.popupCache)) {
							popup = this.addOutput({
								xtype : "gx_popup",
								title : this.popupTitle,
								layout : "accordion",
								location : evt.xy,
								map : this.target.mapPanel,
								width : 250,
								height : 300,
								defaults : {
									title : title,
									layout : "fit",
									autoScroll : true,
									autoWidth : true,
									collapsible : true
								},
								listeners : {
									close : (function(key) {
										return function(panel) {
											delete this.popupCache[key];
										};
									})(popupKey),
									scope : this
								}
							});
							this.popupCache[popupKey] = popup;
						} else {
							popup = this.popupCache[popupKey];
						}
						var features = evt.features, config = [];
						if (!text && features) {
							var feature;
							for ( var i = 0, ii = features.length; i < ii; ++i) {
								feature = features[i];
								config.push(Ext.apply({
									xtype : "propertygrid",
									title : feature.fid ? feature.fid : title,
									source : feature.attributes
								}, this.itemConfig));
							}
						} else if (text) {
							config.push(Ext.apply({
								title : title,
								html : text
							}, this.itemConfig));
						}
						popup.add(config);
						popup.doLayout();
					}
				});
Ext.preg(gxp.plugins.WMSGetFeatureInfo.prototype.ptype,
		gxp.plugins.WMSGetFeatureInfo);
Ext.namespace("gxp.plugins");
gxp.plugins.Navigation = Ext.extend(gxp.plugins.Tool, {
	ptype : "gxp_navigation",
	menuText : "Pan Map",
	tooltip : "Pan Map",
	constructor : function(config) {
		gxp.plugins.Navigation.superclass.constructor.apply(this, arguments);
	},
	addActions : function() {
		this.controlOptions = this.controlOptions || {};
		Ext.applyIf(this.controlOptions, {
			zoomWheelEnabled : false
		});
		var actions = [ new GeoExt.Action({
			tooltip : this.tooltip,
			menuText : this.menuText,
			iconCls : "gxp-icon-pan",
			enableToggle : true,
			pressed : true,
			allowDepress : false,
			control : new OpenLayers.Control.Navigation(this.controlOptions),
			map : this.target.mapPanel.map,
			toggleGroup : this.toggleGroup
		}) ];
		return gxp.plugins.Navigation.superclass.addActions.apply(this,
				[ actions ]);
	}
});
Ext.preg(gxp.plugins.Navigation.prototype.ptype, gxp.plugins.Navigation);
Ext.namespace("gxp.plugins");
gxp.plugins.LayerTree = Ext
		.extend(
				gxp.plugins.Tool,
				{
					ptype : "gxp_layertree",
					rootNodeText : "Layers",
					overlayNodeText : "Overlays",
					baseNodeText : "Base Layers",
					groups : null,
					defaultGroup : "default",
					constructor : function(config) {
						gxp.plugins.LayerTree.superclass.constructor.apply(
								this, arguments);
						if (!this.groups) {
							this.groups = {
								"default" : this.overlayNodeText,
								"background" : {
									title : this.baseNodeText,
									exclusive : true
								}
							};
						}
					},
					addOutput : function(config) {
						var target = this.target, me = this;
						var addListeners = function(node, record) {
							if (record) {
								target.on("layerselectionchange",
										function(rec) {
											if (!me.selectionChanging
													&& rec === record) {
												node.select();
											}
										});
								if (record === target.selectedLayer) {
									node.on("rendernode", function() {
										node.select();
									});
								}
							}
						};
						var LayerNodeUI = Ext.extend(GeoExt.tree.LayerNodeUI,
								new GeoExt.tree.TreeNodeUIEventMixin());
						var treeRoot = new Ext.tree.TreeNode({
							text : this.rootNodeText,
							expanded : true,
							isTarget : false,
							allowDrop : false
						});
						var groupConfig, defaultGroup = this.defaultGroup;
						for ( var group in this.groups) {
							groupConfig = typeof this.groups[group] == "string" ? {
								title : this.groups[group]
							}
									: this.groups[group];
							treeRoot
									.appendChild(new GeoExt.tree.LayerContainer(
											Ext
													.apply(
															{
																text : groupConfig.title,
																iconCls : "gxp-folder",
																expanded : true,
																group : group == defaultGroup ? undefined
																		: group,
																loader : new GeoExt.tree.LayerLoader(
																		{
																			baseAttrs : groupConfig.exclusive ? {
																				checkedGroup : group
																			}
																					: undefined,
																			store : this.target.mapPanel.layers,
																			filter : (function(
																					group) {
																				return function(
																						record) {
																					return (record
																							.get("group") || defaultGroup) == group
																							&& record
																									.getLayer().displayInLayerSwitcher == true;
																				};
																			})
																					(group),
																			createNode : function(
																					attr) {
																				attr.uiProvider = LayerNodeUI;
																				var layer = attr.layer;
																				var store = attr.layerStore;
																				if (layer
																						&& store) {
																					var record = store
																							.getAt(store
																									.findBy(function(
																											r) {
																										return r
																												.getLayer() === layer;
																									}));
																					if (record) {
																						if (!record
																								.get("queryable")) {
																							attr.iconCls = "gxp-tree-rasterlayer-icon";
																						}
																						if (record
																								.get("fixed")) {
																							attr.allowDrag = false;
																						}
																					}
																				}
																				var node = GeoExt.tree.LayerLoader.prototype.createNode
																						.apply(
																								this,
																								arguments);
																				addListeners(
																						node,
																						record);
																				return node;
																			}
																		}),
																singleClickExpand : true,
																allowDrag : false,
																listeners : {
																	append : function(
																			tree,
																			node) {
																		node
																				.expand();
																	}
																}
															}, groupConfig)));
						}
						config = Ext
								.apply(
										{
											xtype : "treepanel",
											root : treeRoot,
											rootVisible : false,
											border : false,
											enableDD : true,
											selModel : new Ext.tree.DefaultSelectionModel(
													{
														listeners : {
															beforeselect : function(
																	selModel,
																	node) {
																var changed = true;
																var layer = node
																		&& node.layer;
																var record;
																if (layer) {
																	var store = node.layerStore;
																	record = store
																			.getAt(store
																					.findBy(function(
																							r) {
																						return r
																								.getLayer() === layer;
																					}));
																}
																this.selectionChanging = true;
																changed = this.target
																		.selectLayer(record);
																this.selectionChanging = false;
																return changed;
															},
															scope : this
														}
													}),
											listeners : {
												contextmenu : function(node, e) {
													if (node && node.layer) {
														node.select();
														var tree = node
																.getOwnerTree();
														if (tree
																.getSelectionModel()
																.getSelectedNode() === node) {
															var c = tree.contextMenu;
															c.contextNode = node;
															c.items.getCount() > 0
																	&& c
																			.showAt(e
																					.getXY());
														}
													}
												},
												beforemovenode : function(tree,
														node, oldParent,
														newParent, i) {
													if (oldParent !== newParent) {
														var store = newParent.loader.store;
														var index = store
																.findBy(function(
																		r) {
																	return r
																			.getLayer() === node.layer;
																});
														var record = store
																.getAt(index);
														record
																.set(
																		"group",
																		newParent.attributes.group);
													}
												},
												scope : this
											},
											contextMenu : new Ext.menu.Menu({
												items : []
											})
										}, config || {});
						var layerTree = gxp.plugins.LayerTree.superclass.addOutput
								.call(this, config);
						return layerTree;
					}
				});
Ext.preg(gxp.plugins.LayerTree.prototype.ptype, gxp.plugins.LayerTree);
Ext.namespace("gxp");
gxp.NewSourceWindow = Ext
		.extend(
				Ext.Window,
				{
					title : "Add New Server...",
					cancelText : "Cancel",
					addServerText : "Add Server",
					invalidURLText : "Enter a valid URL to a WMS endpoint (e.g. http://example.com/geoserver/wms)",
					contactingServerText : "Contacting Server...",
					bodyStyle : "padding: 0px",
					width : 300,
					closeAction : 'hide',
					error : null,
					initComponent : function() {
						this.addEvents("server-added");
						this.urlTextField = new Ext.form.TextField({
							fieldLabel : "URL",
							allowBlank : false,
							width : 240,
							msgTarget : "under",
							validator : this.urlValidator.createDelegate(this)
						});
						this.form = new Ext.form.FormPanel({
							items : [ this.urlTextField ],
							border : false,
							labelWidth : 30,
							bodyStyle : "padding: 5px",
							autoWidth : true,
							autoHeight : true
						});
						this.bbar = [
								new Ext.Button({
									text : this.cancelText,
									handler : function() {
										this.hide();
									},
									scope : this
								}),
								new Ext.Toolbar.Fill(),
								new Ext.Button({
									text : this.addServerText,
									iconCls : "add",
									handler : function() {
										this.error = null;
										if (this.urlTextField.validate()) {
											this.fireEvent("server-added",
													this.urlTextField
															.getValue());
										}
									},
									scope : this
								}) ];
						this.items = this.form;
						gxp.NewSourceWindow.superclass.initComponent.call(this);
						this.form.on("render", function() {
							this.loadMask = new Ext.LoadMask(this.form.getEl(),
									{
										msg : this.contactingServerText
									});
						}, this);
						this.on("hide", function() {
							this.error = null;
							this.urlTextField.validate();
							this.urlTextField.setValue("");
							this.loadMask.hide();
						}, this);
						this.on("server-added", function(url) {
							this.setLoading();
							var success = function(record) {
								this.hide();
							};
							var failure = function() {
								this.setError(this.sourceLoadFailureMessage);
							};
							this.addSource(url, success, failure, this);
						}, this);
					},
					urlRegExp : /^(http(s)?:)?\/\/([\w%]+:[\w%]+@)?([^@\/:]+)(:\d+)?\//i,
					urlValidator : function(url) {
						var valid;
						if (!this.urlRegExp.test(url)) {
							valid = this.invalidURLText;
						} else {
							valid = !this.error || this.error;
						}
						this.error = null;
						return valid;
					},
					setLoading : function() {
						this.loadMask.show();
					},
					setError : function(error) {
						this.loadMask.hide();
						this.error = error;
						this.urlTextField.validate();
					},
					addSource : function(url, success, failure, scope) {
					}
				});
Ext.namespace("gxp.plugins");
gxp.plugins.AddLayers = Ext
		.extend(
				gxp.plugins.Tool,
				{
					ptype : "gxp_addlayers",
					addActionMenuText : "Katman Ekle",
					addActionTip : "Katman Ekle",
					addServerText : "Yeni Server Ekle",
					addButtonText : "Katmanlari Ekle",
					untitledText : "Untitled",
					addLayerSourceErrorText : "Hata olustu : WMS yetenekleri getirilirken ({msg}).\nLutfen url'yi kontrol ederek tekrar deneyiniz.",
					availableLayersText : "Erisilebilir Katmanlar",
					expanderTemplateText : "<p><b>Amac :</b> {abstract}</p>",
					panelTitleText : "Baslik",
					layerSelectionText : "Erisilebilir verileri goster:",
					doneText : "Tamam",
					uploadText : "Veri Yukle",
					relativeUploadOnly : true,
					startSourceId : null,
					selectedSource : null,
					constructor : function(config) {
						this.addEvents("sourceselected");
						gxp.plugins.AddLayers.superclass.constructor.apply(
								this, arguments);
					},
					addActions : function() {
						var selectedLayer;
						var actions = gxp.plugins.AddLayers.superclass.addActions
								.apply(this, [ {
									tooltip : this.addActionTip,
									text : this.addActionText,
									menuText : this.addActionMenuText,
									disabled : true,
									iconCls : "gxp-icon-addlayers",
									handler : this.showCapabilitiesGrid,
									scope : this
								} ]);
						this.target.on("ready", function() {
							actions[0].enable();
						});
						return actions;
					},
					showCapabilitiesGrid : function() {
						if (!this.capGrid) {
							this.initCapGrid();
						}
						this.capGrid.show();
					},
					isAccessDenied : function(ao_layerRecord) {
						var isAccessable = true;
						var keywords = ao_layerRecord.data.keywords;
						if (keywords != null) {
							for ( var j = 0; j < keywords.length; j++) {
								var keyword = keywords[j];
								if (keyword.indexOf("yetkisizkurumlar") != -1) {
									var lo_kurumlar = keyword.split(":");
									if (lo_kurumlar.length > 1) {
										var lo_tempKurumlar = lo_kurumlar[1]
												.split(",");
										for ( var i = 0; i < lo_tempKurumlar.length; i++) {
											if (this.target.kurumID == lo_tempKurumlar[i])
												isAccessable = false;
										}
									}
								}
							}
						}
						return isAccessable;
					},
					initCapGrid : function() {
						var source, data = [];
						for ( var id in this.target.layerSources) {
							source = this.target.layerSources[id];
							if (source.store) {
								data.push([ id, source.title || id ]);
							}
						}
						var sources = new Ext.data.ArrayStore({
							fields : [ "id", "title" ],
							data : data
						});
						var expander = this.createExpander();
						var addLayers = function() {
							var key = sourceComboBox.getValue();
							var layerStore = this.target.mapPanel.layers;
							var source = this.target.layerSources[key];
							var records = capGridPanel.getSelectionModel()
									.getSelections();
							var record;
							for ( var i = 0, ii = records.length; i < ii; ++i) {
								record = source.createLayerRecord({
									name : records[i].get("name"),
									source : key
								});
								if (record && this.isAccessDenied(record)) {
									if (record.get("group") === "background") {
										layerStore.insert(0, [ record ]);
									} else {
										layerStore.add([ record ]);
									}
								} else
									alert("Bu katmanı ekleme yetkiniz yok.")
							}
						};
						var idx = 0;
						if (this.startSourceId !== null) {
							sources.each(function(record) {
								if (record.get("id") === this.startSourceId) {
									idx = sources.indexOf(record);
								}
							}, this);
						}
						var store = this.target.layerSources[data[idx][0]].store;
						if (store.getCount() === 0) {
							store.load();
						}
						var capGridPanel = new Ext.grid.GridPanel({
							store : store,
							autoScroll : true,
							flex : 1,
							autoExpandColumn : "title",
							plugins : [ expander ],
							loadMask : true,
							colModel : new Ext.grid.ColumnModel([ expander, {
								id : "title",
								header : this.panelTitleText,
								dataIndex : "title",
								sortable : true
							}, {
								header : "Id",
								dataIndex : "name",
								width : 150,
								sortable : true
							} ]),
							listeners : {
								rowdblclick : addLayers,
								scope : this
							}
						});
						var sourceComboBox = new Ext.form.ComboBox(
								{
									store : sources,
									valueField : "id",
									displayField : "title",
									triggerAction : "all",
									editable : false,
									allowBlank : false,
									forceSelection : true,
									mode : "local",
									value : data[idx][0],
									listeners : {
										select : function(combo, record, index) {
											var source = this.target.layerSources[record
													.get("id")];
											capGridPanel.reconfigure(
													source.store, capGridPanel
															.getColumnModel());
											capGridPanel.getView().focusRow(0);
											if (source.store.getCount() === 0) {
												source.store.load();
											}
											this.setSelectedSource(source);
										},
										scope : this
									}
								});
						var capGridToolbar = null;
						if (this.target.proxy || data.length > 1) {
							capGridToolbar = [ new Ext.Toolbar.TextItem({
								text : this.layerSelectionText
							}), sourceComboBox ];
						}
						if (this.target.proxy) {
							capGridToolbar.push("-", new Ext.Button({
								text : this.addServerText,
								iconCls : "gxp-icon-addserver",
								handler : function() {
									newSourceWindow.show();
								}
							}));
						}
						var newSourceWindow = new gxp.NewSourceWindow(
								{
									modal : true,
									listeners : {
										"server-added" : function(url) {
											newSourceWindow.setLoading();
											this.target
													.addLayerSource({
														config : {
															url : url
														},
														callback : function(id) {
															var record = new sources.recordType(
																	{
																		id : id,
																		title : this.target.layerSources[id].title
																				|| this.untitledText
																	});
															sources.insert(0,
																	[ record ]);
															sourceComboBox
																	.onSelect(
																			record,
																			0);
															newSourceWindow
																	.hide();
														},
														fallback : function(
																source, msg) {
															newSourceWindow
																	.setError(new Ext.Template(
																			this.addLayerSourceErrorText)
																			.apply({
																				msg : msg
																			}));
														},
														scope : this
													});
										},
										scope : this
									}
								});
						var items = {
							xtype : "container",
							region : "center",
							layout : "vbox",
							items : [ capGridPanel ]
						};
						if (this.instructionsText) {
							items.items
									.push({
										xtype : "box",
										autoHeight : true,
										autoEl : {
											tag : "p",
											cls : "x-form-item",
											style : "padding-left: 5px; padding-right: 5px"
										},
										html : this.instructionsText
									});
						}
						var bbarItems = [ "->", new Ext.Button({
							text : this.addButtonText,
							iconCls : "gxp-icon-addlayers",
							handler : addLayers,
							scope : this
						}), new Ext.Button({
							text : this.doneText,
							handler : function() {
								this.capGrid.hide();
							},
							scope : this
						}) ];
						var uploadButton = this.createUploadButton();
						if (uploadButton) {
							bbarItems.unshift(uploadButton);
						}
						this.capGrid = new Ext.Window(
								Ext
										.apply(
												{
													title : this.availableLayersText,
													closeAction : "hide",
													layout : "border",
													height : 300,
													width : 450,
													modal : true,
													items : items,
													tbar : capGridToolbar,
													bbar : bbarItems,
													listeners : {
														hide : function(win) {
															capGridPanel
																	.getSelectionModel()
																	.clearSelections();
														},
														show : function(win) {
															this
																	.setSelectedSource(this.target.layerSources[data[idx][0]]);
														},
														scope : this
													}
												},
												this.initialConfig.outputConfig));
					},
					setSelectedSource : function(source) {
						this.selectedSource = source;
						this.fireEvent("sourceselected", this, source);
					},
					createUploadButton : function() {
						var button;
						var uploadConfig = this.initialConfig.upload;
						var url;
						if (uploadConfig) {
							if (typeof uploadConfig === "boolean") {
								uploadConfig = {};
							}
							button = new Ext.Button(
									{
										xtype : "button",
										text : this.uploadText,
										iconCls : "gxp-icon-filebrowse",
										hidden : true,
										handler : function() {
											var panel = new gxp.LayerUploadPanel(
													Ext
															.apply(
																	{
																		url : url,
																		width : 350,
																		border : false,
																		bodyStyle : "padding: 10px 10px 0 10px;",
																		frame : true,
																		labelWidth : 65,
																		defaults : {
																			anchor : "95%",
																			allowBlank : false,
																			msgTarget : "side"
																		},
																		listeners : {
																			uploadcomplete : function(
																					panel,
																					detail) {
																				var layers = detail.layers;
																				var names = {};
																				for ( var i = 0, len = layers.length; i < len; ++i) {
																					names[layers[i].name] = true;
																				}
																				this.selectedSource.store
																						.load({
																							callback : function(
																									records,
																									options,
																									success) {
																								var gridPanel = this.capGrid.items
																										.get(0);
																								var sel = gridPanel
																										.getSelectionModel();
																								sel
																										.clearSelections();
																								var newRecords = [];
																								var last = 0;
																								this.selectedSource.store
																										.each(function(
																												record,
																												index) {
																											if (record
																													.get("name") in names) {
																												last = index;
																												newRecords
																														.push(record);
																											}
																										});
																								sel
																										.selectRecords(newRecords);
																								window
																										.setTimeout(
																												function() {
																													gridPanel
																															.getView()
																															.focusRow(
																																	last);
																												},
																												100);
																							},
																							scope : this
																						});
																				win
																						.close();
																			},
																			scope : this
																		}
																	},
																	uploadConfig));
											var win = new Ext.Window({
												title : this.uploadText,
												modal : true,
												resizable : false,
												items : [ panel ]
											});
											win.show();
										},
										scope : this
									});
							var urlCache = {};
							function getStatus(url, callback, scope) {
								if (url in urlCache) {
									window.setTimeout(function() {
										callback.call(scope, urlCache[url]);
									}, 0);
								} else {
									Ext.Ajax.request({
										url : url,
										disableCaching : false,
										callback : function(options, success,
												response) {
											var status = response.status;
											urlCache[url] = status;
											callback.call(scope, status);
										}
									});
								}
							}
							this
									.on({
										sourceselected : function(tool, source) {
											button.hide();
											var show = false;
											if (this
													.isEligibleForUpload(source)) {
												var parts = source.url
														.split("/");
												parts.pop();
												parts.push("rest");
												url = parts.join("/");
												if (this.target.isAuthorized()) {
													getStatus(
															url + "/upload",
															function(status) {
																button
																		.setVisible(status === 405);
															}, this);
												}
											}
										},
										scope : this
									});
						}
						return button;
					},
					isEligibleForUpload : function(source) {
						return (source.url
								&& (this.relativeUploadOnly ? (source.url
										.charAt(0) === "/") : true) && (this.nonUploadSources || [])
								.indexOf(source.id) === -1);
					},
					createExpander : function() {
						return new Ext.grid.RowExpander({
							tpl : new Ext.Template(this.expanderTemplateText)
						});
					}
				});
Ext.preg(gxp.plugins.AddLayers.prototype.ptype, gxp.plugins.AddLayers);
Ext.namespace("gxp.plugins");
gxp.plugins.RemoveLayer = Ext.extend(gxp.plugins.Tool, {
	ptype : "gxp_removelayer",
	removeMenuText : "Remove layer",
	removeActionTip : "Remove layer",
	addActions : function() {
		var selectedLayer;
		var actions = gxp.plugins.RemoveLayer.superclass.addActions.apply(this,
				[ {
					menuText : this.removeMenuText,
					iconCls : "gxp-icon-removelayers",
					disabled : true,
					tooltip : this.removeActionTip,
					handler : function() {
						var record = selectedLayer;
						if (record) {
							this.target.mapPanel.layers.remove(record);
						}
					},
					scope : this
				} ]);
		var removeLayerAction = actions[0];
		this.target.on("layerselectionchange", function(record) {
			selectedLayer = record;
			removeLayerAction.setDisabled(this.target.mapPanel.layers
					.getCount() <= 1
					|| !record);
		}, this);
		var enforceOne = function(store) {
			removeLayerAction.setDisabled(!selectedLayer
					|| store.getCount() <= 1);
		}
		this.target.mapPanel.layers.on({
			"add" : enforceOne,
			"remove" : enforceOne
		});
		return actions;
	}
});
Ext.preg(gxp.plugins.RemoveLayer.prototype.ptype, gxp.plugins.RemoveLayer);
Ext.namespace("gxp.plugins");
gxp.plugins.LayerProperties = Ext.extend(gxp.plugins.Tool, {
	ptype : "gxp_layerproperties",
	menuText : "Katman Özellikleri",
	toolTip : "Katman Özellikleri",
	constructor : function(config) {
		gxp.plugins.LayerProperties.superclass.constructor.apply(this,
				arguments);
		if (!this.outputConfig) {
			this.outputConfig = {
				width : 265,
				autoHeight : true
			};
		}
	},
	addActions : function() {
		var actions = gxp.plugins.LayerProperties.superclass.addActions.apply(
				this, [ {
					menuText : this.menuText,
					iconCls : "gxp-icon-layerproperties",
					disabled : true,
					tooltip : this.toolTip,
					handler : function() {
						this.removeOutput();
						this.addOutput();
					},
					scope : this
				} ]);
		var layerPropertiesAction = actions[0];
		this.target.on("layerselectionchange", function(record) {
			layerPropertiesAction.setDisabled(!record
					|| !record.get("properties"));
		}, this);
		return actions;
	},
	addOutput : function(config) {
		config = config || {};
		var record = this.target.selectedLayer;
		var origCfg = this.initialConfig.outputConfig || {};
		this.outputConfig.title = origCfg.title || this.menuText + ": "
				+ record.get("title");
		var xtype = record.get("properties") || "gxp_layerpanel";
		var panelConfig = this.layerPanelConfig;
		if (panelConfig && panelConfig[xtype]) {
			Ext.apply(config, panelConfig[xtype]);
		}
		return gxp.plugins.LayerProperties.superclass.addOutput.call(this, Ext
				.apply({
					xtype : xtype,
					authorized : this.target.isAuthorized(),
					layerRecord : record,
					source : this.target.getSource(record),
					defaults : {
						style : "padding: 10px",
						autoHeight : this.outputConfig.autoHeight
					},
					listeners : {
						added : function(cmp) {
							if (!this.outputTarget) {
								cmp.on("afterrender", function() {
									cmp.ownerCt.ownerCt.center();
								}, this, {
									single : true
								});
							}
						},
						scope : this
					}
				}, config));
	}
});
Ext.preg(gxp.plugins.LayerProperties.prototype.ptype,
		gxp.plugins.LayerProperties);
Ext.namespace("gxp.plugins");
gxp.plugins.ZoomToLayerExtent = Ext
		.extend(
				gxp.plugins.ZoomToExtent,
				{
					ptype : "gxp_zoomtolayerextent",
					menuText : "Zoom to layer extent",
					tooltip : "Zoom to layer extent",
					iconCls : "gxp-icon-zoom-to",
					destroy : function() {
						this.selectedRecord = null;
						gxp.plugins.ZoomToLayerExtent.superclass.destroy.apply(
								this, arguments);
					},
					extent : function() {
						var layer = this.selectedRecord.getLayer();
						var dataExtent = layer instanceof OpenLayers.Layer.Vector
								&& layer.getDataExtent();
						return layer.restrictedExtent || dataExtent
								|| layer.maxExtent || map.maxExtent;
					},
					addActions : function() {
						var actions = gxp.plugins.ZoomToLayerExtent.superclass.addActions
								.apply(this, arguments);
						actions[0].disable();
						this.target.on("layerselectionchange",
								function(record) {
									this.selectedRecord = record;
									actions[0].setDisabled(!record
											|| !record.get('layer'));
								}, this);
						return actions;
					}
				});
Ext.preg(gxp.plugins.ZoomToLayerExtent.prototype.ptype,
		gxp.plugins.ZoomToLayerExtent);
Ext.namespace("gxp.plugins");
gxp.plugins.Legend = Ext.extend(gxp.plugins.Tool, {
	ptype : "gxp_legend",
	menuText : "Legend",
	tooltip : "Show Legend",
	actionTarget : null,
	constructor : function(config) {
		gxp.plugins.Legend.superclass.constructor.apply(this, arguments);
		if (!this.outputConfig) {
			this.outputConfig = {
				width : 300,
				height : 400
			};
		}
		Ext.applyIf(this.outputConfig, {
			title : this.menuText
		});
	},
	addActions : function() {
		var actions = [ {
			menuText : this.menuText,
			iconCls : "gxp-icon-legend",
			tooltip : this.tooltip,
			handler : function() {
				this.addOutput();
			},
			scope : this
		} ];
		return gxp.plugins.Legend.superclass.addActions
				.apply(this, [ actions ]);
	},
	getLegendPanel : function() {
		return this.output[0];
	},
	addOutput : function(config) {
		return gxp.plugins.Legend.superclass.addOutput.call(this, Ext.apply({
			xtype : 'gx_legendpanel',
			ascending : false,
			border : false,
			hideMode : "offsets",
			layerStore : this.target.mapPanel.layers,
			defaults : {
				cls : 'gxp-legend-item'
			}
		}, config));
	}
});
Ext.preg(gxp.plugins.Legend.prototype.ptype, gxp.plugins.Legend);
Ext.namespace("gxp.plugins");
gxp.plugins.Print = Ext
		.extend(
				gxp.plugins.Tool,
				{
					ptype : "gxp_print",
					printService : null,
					printCapabilities : null,
					customParams : null,
					includeLegend : false,
					menuText : "Print Map",
					tooltip : "Print Map",
					notAllNotPrintableText : "Not All Layers Can Be Printed",
					nonePrintableText : "None of your current map layers can be printed",
					previewText : "Print Preview",
					constructor : function(config) {
						gxp.plugins.Print.superclass.constructor.apply(this,
								arguments);
					},
					addActions : function() {
						if (this.printService !== null
								|| this.printCapabilities !== null) {
							var printProvider = new GeoExt.data.PrintProvider(
									{
										capabilities : this.printCapabilities,
										url : this.printService,
										customParams : this.customParams,
										autoLoad : false,
										listeners : {
											beforeprint : function() {
												printWindow.items.get(0).printMapPanel.layers
														.each(function(l) {
															var params = l
																	.get("layer").params;
															for ( var p in params) {
																if (params[p] instanceof Array) {
																	params[p] = params[p]
																			.join(",");
																}
															}
														});
											},
											loadcapabilities : function() {
												if (printButton) {
													printButton.initialConfig.disabled = false;
													printButton.enable();
												}
											},
											print : function() {
												try {
													printWindow.close();
												} catch (err) {
												}
											},
											printException : function(cmp,
													response) {
												this.target.displayXHRTrouble
														&& this.target
																.displayXHRTrouble(response);
											},
											scope : this
										}
									});
							var actions = gxp.plugins.Print.superclass.addActions
									.call(
											this,
											[ {
												menuText : this.menuText,
												tooltip : this.tooltip,
												iconCls : "gxp-icon-print",
												disabled : this.printCapabilities !== null ? false
														: true,
												handler : function() {
													var supported = getSupportedLayers();
													if (supported.length > 0) {
														createPrintWindow
																.call(this);
														showPrintWindow
																.call(this);
													} else {
														Ext.Msg
																.alert(
																		this.notAllNotPrintableText,
																		this.nonePrintableText);
													}
												},
												scope : this,
												listeners : {
													render : function() {
														printProvider
																.loadCapabilities();
													}
												}
											} ]);
							var printButton = this.actions[0].items[0];
							var printWindow;
							function destroyPrintComponents() {
								if (printWindow) {
									try {
										var panel = printWindow.items.first();
										panel.printMapPanel.printPage.destroy();
									} catch (err) {
									}
									printWindow = null;
								}
							}
							var mapPanel = this.target.mapPanel;
							function getSupportedLayers() {
								var supported = [];
								mapPanel.layers.each(function(record) {
									var layer = record.getLayer();
									if (isSupported(layer)) {
										supported.push(layer);
									}
								});
								return supported;
							}
							function isSupported(layer) {
								return (layer instanceof OpenLayers.Layer.WMS || layer instanceof OpenLayers.Layer.OSM);
							}
							function createPrintWindow() {
								var legend = null;
								if (this.includeLegend === true) {
									for ( var key in this.target.tools) {
										var tool = this.target.tools[key];
										if (tool.ptype === "gxp_legend") {
											legend = tool.getLegendPanel();
										}
									}
								}
								printWindow = new Ext.Window(
										{
											title : this.previewText,
											modal : true,
											border : false,
											autoHeight : true,
											resizable : false,
											width : 360,
											items : [ new GeoExt.ux.PrintPreview(
													{
														autoHeight : true,
														mapTitle : this.target.about
																&& this.target.about["title"],
														comment : this.target.about
																&& this.target.about["abstract"],
														minWidth : 336,
														printMapPanel : {
															height : Math
																	.min(
																			450,
																			Ext
																					.get(
																							document.body)
																					.getHeight() - 150),
															autoWidth : true,
															limitScales : true,
															map : Ext
																	.applyIf(
																			{
																				controls : [
																						new OpenLayers.Control.Navigation(
																								{
																									zoomWheelEnabled : false,
																									zoomBoxEnabled : false
																								}),
																						new OpenLayers.Control.PanPanel(),
																						new OpenLayers.Control.ZoomPanel(),
																						new OpenLayers.Control.Attribution() ],
																				eventListeners : {
																					preaddlayer : function(
																							evt) {
																						return isSupported(evt.layer);
																					}
																				}
																			},
																			mapPanel.initialConfig.map),
															items : [ {
																xtype : "gx_zoomslider",
																vertical : true,
																height : 100,
																aggressive : true
															} ]
														},
														printProvider : printProvider,
														includeLegend : this.includeLegend,
														legend : legend,
														sourceMap : mapPanel
													}) ],
											listeners : {
												beforedestroy : destroyPrintComponents
											}
										});
							}
							function showPrintWindow() {
								printWindow.show();
								printWindow.setWidth(0);
								var tb = printWindow.items.get(0).items.get(0);
								var w = 0;
								tb.items.each(function(item) {
									if (item.getEl()) {
										w += item.getWidth();
									}
								});
								printWindow.setWidth(Math.max(printWindow.items
										.get(0).printMapPanel.getWidth(),
										w + 20));
								printWindow.center();
							}
							return actions;
						}
					}
				});
Ext.preg(gxp.plugins.Print.prototype.ptype, gxp.plugins.Print);
Ext.namespace("gxp.plugins");
gxp.plugins.Styler = Ext
		.extend(gxp.plugins.Tool,
				{
					ptype : "gxp_styler",
					menuText : "Sembol Düzenle",
					tooltip : "Sembol Düzenle",
					sameOriginStyling : false,
					rasterStyling : false,
					requireDescribeLayer : true,
					constructor : function(config) {
						gxp.plugins.Styler.superclass.constructor.apply(this,
								arguments);
						if (!this.outputConfig) {
							this.outputConfig = {
								autoHeight : true,
								width : 265
							};
						}
						Ext.applyIf(this.outputConfig, {
							closeAction : "close"
						});
					},
					init : function(target) {
						gxp.plugins.Styler.superclass.init.apply(this,
								arguments);
						this.target.on("loginchanged", this.enableOrDisable,
								this);
					},
					destroy : function() {
						this.target.un("loginchanged", this.enableOrDisable,
								this);
						gxp.plugins.Styler.superclass.destroy.apply(this,
								arguments);
					},
					enableOrDisable : function() {
						if (this.target && this.target.selectedLayer !== null) {
							this.handleLayerChange(this.target.selectedLayer);
						}
					},
					addActions : function() {
						var layerProperties;
						var actions = gxp.plugins.Styler.superclass.addActions
								.apply(this, [ {
									menuText : this.menuText,
									iconCls : "gxp-icon-palette",
									disabled : true,
									tooltip : this.tooltip,
									handler : function() {
										this.addOutput();
									},
									scope : this
								} ]);
						this.launchAction = actions[0];
						this.target.on({
							layerselectionchange : this.handleLayerChange,
							scope : this
						});
						return actions;
					},
					handleLayerChange : function(record) {
						this.launchAction.disable();
						if (record && record.get("styles")) {
							var source = this.target.getSource(record);
							if (source instanceof gxp.plugins.WMSSource) {
								source.describeLayer(record, function(
										describeRec) {
									this.checkIfStyleable(record, describeRec);
								}, this);
							}
						}
					},
					checkIfStyleable : function(layerRec, describeRec) {
						if (describeRec) {
							var owsTypes = [ "WFS" ];
							if (this.rasterStyling === true) {
								owsTypes.push("WCS");
							}
						}
						if (describeRec ? owsTypes.indexOf(describeRec
								.get("owsType")) !== -1
								: !this.requireDescribeLayer) {
							var editableStyles = false;
							var source = this.target.layerSources[layerRec
									.get("source")];
							var url;
							var restUrl = layerRec.get("restUrl");
							if (restUrl) {
								url = restUrl + "/styles";
							} else {
								url = source.url.split("?").shift().replace(
										/\/(wms|ows)\/?$/, "/rest/styles");
							}
							editableStyles = true;
							if (editableStyles) {
								if (this.target.isAuthorized()) {
									this.enableActionIfAvailable(url);
								}
							}
						}
					},
					enableActionIfAvailable : function(url) {
						Ext.Ajax.request({
							method : "PUT",
							url : url,
							callback : function(options, success, response) {
								this.launchAction
										.setDisabled(response.status !== 405);
							},
							scope : this
						});
					},
					addOutput : function(config) {
						config = config || {};
						var record = this.target.selectedLayer;
						var origCfg = this.initialConfig.outputConfig || {};
						this.outputConfig.title = origCfg.title
								|| this.menuText + ": " + record.get("title");
						Ext.apply(config, gxp.WMSStylesDialog
								.createGeoServerStylerConfig(record));
						if (this.rasterStyling === true) {
							config.plugins.push({
								ptype : "gxp_wmsrasterstylesdialog"
							});
						}
						Ext.applyIf(config, {
							style : "padding: 10px"
						});
						var output = gxp.plugins.Styler.superclass.addOutput
								.call(this, config);
						output.stylesStore.on("load", function() {
							this.outputTarget
									|| output.ownerCt.ownerCt.center();
						});
					}
				});
Ext.preg(gxp.plugins.Styler.prototype.ptype, gxp.plugins.Styler);
Ext.namespace("gxp.plugins");
gxp.plugins.GoogleEarth = Ext
		.extend(
				gxp.plugins.Tool,
				{
					ptype : "gxp_googleearth",
					timeout : 7000,
					apiKeyPrompt : "Please enter the Google API key for ",
					menuText : "3D Viewer",
					tooltip : "Switch to 3D Viewer",
					constructor : function(config) {
						gxp.plugins.GoogleEarth.superclass.constructor.apply(
								this, arguments);
					},
					addActions : function() {
						var actions = [ {
							menuText : this.menuText,
							enableToggle : true,
							iconCls : "gxp-icon-googleearth",
							tooltip : this.tooltip,
							toggleHandler : function(button, state) {
								button.toggle(false, true);
								this.togglePanelDisplay(state);
							},
							scope : this
						} ];
						var ownerCt = this.target.mapPanel.ownerCt;
						var layout = ownerCt && ownerCt.getLayout();
						if (layout && layout instanceof Ext.layout.CardLayout) {
							var panel = ownerCt.get(1);
							panel.on({
								pluginfailure : function(cmp, code) {
									delete this.initialConfig.apiKey;
									gxp.plugins.GoogleEarth.loader.unload();
								},
								scope : this
							});
						}
						return gxp.plugins.GoogleEarth.superclass.addActions
								.apply(this, [ actions ]);
					},
					togglePanelDisplay : function(displayed) {
						var ownerCt = this.target.mapPanel.ownerCt;
						var layout = ownerCt && ownerCt.getLayout();
						if (layout && layout instanceof Ext.layout.CardLayout) {
							if (displayed === true) {
								this.getAPIKey(function(key) {
									this.initialConfig.apiKey = key;
									gxp.plugins.GoogleEarth.loader.onLoad({
										apiKey : this.initialConfig.apiKey,
										callback : function() {
											layout.setActiveItem(1);
											this.actions[0].enable();
											this.actions[0].each(function(cmp) {
												if (cmp.toggle) {
													cmp.toggle(true, true);
												}
											});
										},
										scope : this
									});
								});
							} else {
								layout.setActiveItem(0);
							}
						}
					},
					getAPIKey : function(callback) {
						var key = this.initialConfig.apiKey;
						var keys = this.initialConfig.apiKeys;
						if (!key && keys) {
							var host = this.getHost();
							var hasPort = /:\d+$/;
							var completeCandidate;
							for ( var candidate in keys) {
								if (!hasPort.test(candidate)) {
									completeCandidate = candidate + ":80";
								} else {
									completeCandidate = candidate;
								}
								if ((new RegExp("^(.*\\.)?" + completeCandidate
										+ "$", "i")).test(host)) {
									key = keys[candidate];
									break;
								}
							}
						}
						if (key) {
							window.setTimeout((function() {
								callback.call(this, key);
							}).createDelegate(this), 0);
						} else {
							Ext.Msg
									.prompt(
											"Google API Key",
											this.apiKeyPrompt
													+ window.location.hostname
													+ " <sup><a target='_blank' href='http://code.google.com/apis/earth/'>?</a></sup>",
											function(btn, key) {
												if (btn === "ok") {
													callback.call(this, key);
												}
											}, this);
						}
					},
					getHost : function() {
						var name = window.location.host.split(":").shift();
						var port = window.location.port || "80";
						return name + ":" + port;
					}
				});
gxp.plugins.GoogleEarth.loader = new (Ext
		.extend(
				Ext.util.Observable,
				{
					ready : !!(window.google && window.google.earth),
					loading : false,
					constructor : function() {
						this.addEvents("ready", "failure");
						return Ext.util.Observable.prototype.constructor.apply(
								this, arguments);
					},
					onScriptLoad : function() {
						var monitor = gxp.plugins.GoogleEarth.loader;
						if (!monitor.ready) {
							monitor.ready = true;
							monitor.loading = false;
							monitor.fireEvent("ready");
						}
					},
					onLoad : function(options) {
						if (this.ready) {
							window.setTimeout(function() {
								options.callback.call(options.scope);
							}, 0);
						} else if (!this.loading) {
							this.loadScript(options);
						} else {
							this.on({
								ready : options.callback,
								failure : options.errback || Ext.emptyFn,
								scope : options.scope
							});
						}
					},
					loadScript : function(options) {
						if (window.google) {
							delete google.loader;
						}
						var params = {
							key : options.apiKey,
							autoload : Ext
									.encode({
										modules : [ {
											name : "earth",
											version : "1",
											callback : "gxp.plugins.GoogleEarth.loader.onScriptLoad"
										} ]
									})
						};
						var script = document.createElement("script");
						script.src = "http://www.google.com/jsapi?"
								+ Ext.urlEncode(params);
						var errback = options.errback || Ext.emptyFn;
						var timeout = options.timeout
								|| gxp.plugins.GoogleSource.prototype.timeout;
						window.setTimeout((function() {
							if (!gxp.plugins.GoogleEarth.loader.ready) {
								this.fireEvent("failure");
								this.unload();
							}
						}).createDelegate(this), timeout);
						this.on({
							ready : options.callback,
							failure : options.errback || Ext.emptyFn,
							scope : options.scope
						});
						this.loading = true;
						document.getElementsByTagName("head")[0]
								.appendChild(script);
						this.script = script;
					},
					unload : function() {
						this.purgeListeners();
						if (this.script) {
							document.getElementsByTagName("head")[0]
									.removeChild(this.script);
							delete this.script;
						}
						this.loading = false;
						this.ready = false;
						delete google.loader;
						delete google.earth;
					}
				}))();
Ext.preg(gxp.plugins.GoogleEarth.prototype.ptype, gxp.plugins.GoogleEarth);
Ext.namespace("gxp.plugins");
gxp.plugins.Featurekazihatti = Ext
		.extend(
				gxp.plugins.Tool,
				{
					ptype : "gxp_featurekazihatti",
					outputTarget : "map",
					popupCache : null,
					wfsURL : null,
					wfsLayers : "UniversalWorkspace:SDE.KOYMAHALLE,UniversalWorkspace:SDE.KARAYOLU,UniversalWorkspace:SDE.KOCAELI_KAPI,UniversalWorkspace:SDE.KOCAELI_YAPI,UniversalWorkspace:SDE.KAZIHATTI",
					kaziActionTip : "Kazi hattı oluştur",
					popupTitle : "Kazi hattı oluştur",
					tooltip : "Kazi hattı oluştur",
					saveStrategy : null,
					snap : null,
					layers : {},
					queue : 0,
					queuedFeatures : [],
					vectorLayer : null,
					printService : null,
					aykomeGridId : -1,
					aykomeGridButtonid : -1,
					constructor : function(config) {
						gxp.plugins.Featurekazihatti.superclass.constructor
								.apply(this, arguments);
					},
					init : function(target) {
						gxp.plugins.Featurekazihatti.superclass.init.apply(
								this, arguments);
						this.toolsShowingLayer = {};
						this.target.on({
							ready : function() {
								this.target.mapPanel.map.addControl(this.snap);
								this.snap.activate();
								this.target.mapPanel.map
										.addLayer(this.vectorLayer);
							},
							scope : this
						});
						Ext.Ajax
								.on(
										"nextFeature",
										function() {
											if (this.queue < this.queuedFeatures.length) {
												this
														.selectRegion(this.queuedFeatures[this.queue]);
											}
											{
												this.queuedFeatures = [];
												this.queue = 0;
											}
										}, this);
						Ext.Ajax
								.on(
										"deleteFeature",
										function(fid, tableid, buttonid) {
											var lo_layer = this
													.getLayer("kazihatti");
											if (lo_layer != null) {
												this.aykomeGridId = tableid;
												this.aykomeGridButtonid = buttonid;
												var vectorFeature = new OpenLayers.Feature.Vector(
														new OpenLayers.Geometry.MultiLineString(
																null));
												vectorFeature.fid = this
														.createObjectID(
																lo_layer.data.name,
																fid);
												vectorFeature.state = OpenLayers.State.DELETE;
												this.vectorLayer
														.addFeatures(vectorFeature);
												this.saveStrategy.save();
											} else
												alert("Katman bulunamadı.");
										}, this);
						Ext.Ajax
								.on(
										"refreshFLayer",
										function(layername) {
											var lo_layer = this
													.getLayer(layername);
											if (lo_layer != null) {
												var layers = this.target.mapPanel.map.layers;
												for ( var i = 0; i < layers.length; i++) {
													var ls_tempLayerName = layers[i].name;
													if (lo_layer.data.layer.name == ls_tempLayerName)
														layers[i].redraw(true);
												}
											}
										}, this);
						Ext.Ajax.on('beforerequest', function() {
							Ext.getBody().mask("Lütfen bekleyiniz.", 'loading')
						}, Ext.getBody());
						Ext.Ajax.on('requestcomplete', Ext.getBody().unmask,
								Ext.getBody());
						Ext.Ajax.on('requestexception', Ext.getBody().unmask,
								Ext.getBody());
					},
					getLayer : function(layername) {
						var ds = this.target.layerSources.local.store.data.items;
						for ( var i = 0; i < ds.length; i++) {
							var keywords = ds[i].data.keywords;
							for ( var j = 0; j < keywords.length; j++) {
								if (keywords[j] == layername)
									return ds[i];
							}
						}
						return null;
					},
					createObjectID : function(as_layerName, as_queryObjectIDs) {
						var lo_tempArray = as_layerName.split(":");
						var ls_layerNameWOWorkspaceName = "";
						var ls_fidQuery = "";
						if (lo_tempArray.length > 1) {
							ls_layerNameWOWorkspaceName = lo_tempArray[1];
							var lo_tempArrayFID = as_queryObjectIDs.split(",");
							for ( var i = 0; i < lo_tempArrayFID.length; i++) {
								ls_fidQuery += ls_layerNameWOWorkspaceName
										+ "." + lo_tempArrayFID[i];
								if (i != lo_tempArrayFID.length - 1)
									ls_fidQuery += ",";
							}
						}
						return ls_fidQuery;
					},
					selectRegion : function(feature) {
						var mapProjCode = this.target.mapPanel.map.projection;
						var wfsURL = this.wfsURL;
						var request;
						var jsonFormatter = new OpenLayers.Format.GeoJSON();
						var mahSokStore = new Ext.data.ArrayStore({
							id : 0,
							fields : [ 'YOL_ID', 'YOL_ISMI',
									'YOL_KAPLAMA_CINSI', 'MAH_ID', 'MAH_ADI',
									'ILCE_ID', 'ILCE_ADI', 'MAH_SOK' ]
						});
						Proj4js.defs["EPSG:40000"] = "+proj=tmerc +lat_0=0 +lon_0=30 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +datum=ITRF96 +units=m +no_defs";
						var transGeom = feature.geometry.clone().transform(
								new OpenLayers.Projection(mapProjCode),
								new OpenLayers.Projection("EPSG:40000"));
						request = OpenLayers.Request
								.GET({
									url : wfsURL,
									params : {
										"service" : "wfs",
										"version" : "1.0.0",
										"request" : "GetFeature",
										"srs" : "EPSG:40000",
										"outputFormat" : "json",
										"typename" : "UniversalWorkspace:SDE.KARAYOLU",
										"propertyName" : "CSBMKOD,YOL_ISMI,KAPLAMA_CI,SHAPE",
										"cql_filter" : "DWITHIN(SHAPE,"
												+ transGeom.components[0]
														.toString()
												+ ",2,meters)"
									},
									async : false
								});
						Ext
								.each(
										jsonFormatter
												.read(request.responseText),
										function(sokak) {
											if (mahSokStore
													.find(
															"YOL_ISMI",
															sokak.attributes["YOL_ISMI"]) == -1) {
												mahSokStore
														.add(new Ext.data.Record(
																{
																	'YOL_ID' : sokak.attributes["CSBMKOD"],
																	'YOL_ISMI' : sokak.attributes["YOL_ISMI"],
																	'YOL_KAPLAMA_CINSI' : sokak.attributes["KAPLAMA_CI"]
																}));
												request = OpenLayers.Request
														.GET({
															url : wfsURL,
															params : {
																"service" : "wfs",
																"version" : "1.0.0",
																"request" : "GetFeature",
																"srs" : "EPSG:40000",
																"outputFormat" : "json",
																"typename" : "UniversalWorkspace:SDE.KOYMAHALLE",
																"propertyName" : "ILCEADI,ILCEID,KOYMAHALLEADI,MAHALLEID",
																"cql_filter" : "INTERSECTS(SHAPE,"
																		+ sokak.geometry.components[0]
																				.simplify()
																				.toString()
																		+ ")"
															},
															async : false
														});
												var counter = 0;
												Ext
														.each(
																jsonFormatter
																		.read(request.responseText),
																function(mah) {
																	if (counter > 0) {
																		mahSokStore
																				.add(new Ext.data.Record(
																						{
																							'YOL_ID' : sokak.attributes["CSBMKOD"],
																							'YOL_ISMI' : sokak.attributes["YOL_ISMI"],
																							'YOL_KAPLAMA_CINSI' : sokak.attributes["KAPLAMA_CI"],
																							'MAH_ID' : mah.attributes["MAHALLEID"],
																							'MAH_ADI' : mah.attributes["KOYMAHALLEADI"],
																							'ILCE_ID' : mah.attributes["ILCEID"],
																							'ILCE_ADI' : mah.attributes["ILCEADI"],
																							'MAH_SOK' : mah.attributes["KOYMAHALLEADI"]
																									+ " : "
																									+ sokak.attributes["YOL_ISMI"]
																						}));
																	} else {
																		var item = mahSokStore
																				.getAt(mahSokStore
																						.find(
																								"YOL_ID",
																								sokak.attributes["CSBMKOD"]));
																		if (item == null)
																			item = mahSokStore.data.items[0];
																		item.data["MAH_ID"] = mah.attributes["MAHALLEID"];
																		item.data["MAH_ADI"] = mah.attributes["KOYMAHALLEADI"];
																		item.data["ILCE_ID"] = mah.attributes["ILCEID"];
																		item.data["ILCE_ADI"] = mah.attributes["ILCEADI"];
																		item.data["MAH_SOK"] = mah.attributes["KOYMAHALLEADI"]
																				+ " : "
																				+ item.data["YOL_ISMI"];
																	}
																	counter++;
																});
											}
										}, this);
						if (mahSokStore.getCount() > 1) {
							var cbxRegion = new Ext.form.ComboBox({
								typeAhead : true,
								triggerAction : 'all',
								lazyRender : true,
								editable : false,
								allowBlank : false,
								forceSelection : true,
								width : 200,
								mode : 'local',
								fieldLabel : "Sokak",
								store : mahSokStore,
								valueField : 'YOL_ID',
								displayField : 'MAH_SOK'
							});
							var selectRegionWin = new Ext.Window(
									{
										title : "Mahalle / Sokak Seçin",
										layout : "fit",
										height : 100,
										width : 280,
										modal : true,
										items : [ {
											xtype : "form",
											bodyStyle : "padding: 5px;",
											labelWidth : 40,
											items : [ cbxRegion ]
										} ],
										buttons : [ {
											text : "Tamam",
											formBind : true,
											handler : function() {
												var item = mahSokStore
														.getAt(mahSokStore
																.find(
																		"YOL_ID",
																		cbxRegion
																				.getValue()));
												for (r in item.data) {
													if (r != 'MAH_SOK') {
														feature.attributes[r] = item.data[r];
														if (r == 'YOL_ISMI'
																&& item.data[r] == null)
															this
																	.getSokakNewValueForm(feature);
													}
												}
												selectRegionWin.hide();
											},
											scope : this
										} ]
									});
							selectRegionWin.show();
						} else if (mahSokStore.getCount() == 1) {
							var item = mahSokStore.getAt(0);
							for (r in item.data) {
								if (r != 'MAH_SOK') {
									feature.attributes[r] = item.data[r];
									if (r == 'YOL_ISMI' && item.data[r] == null)
										this.getSokakNewValueForm(feature);
								}
							}
						} else {
							Ext.Msg
									.show({
										title : 'Mahalle / Sokak Bilgisi Bulunamadı',
										msg : 'Son çizilen kazı hattı için mahalle / sokak bilgisi bulunamadı.\nÇizilen nesne geri alınsınmı?',
										buttons : {
											ok : "Evet",
											cancel : "Hayır"
										},
										scope : this,
										fn : this.processResult,
										icon : Ext.MessageBox.INFO
									});
						}
						this.queue++;
						Ext.Ajax.fireEvent("nextFeature");
					},
					getSokakNewValueForm : function(sokakfeature) {
						var sokakTextField = new Ext.form.TextField({
							fieldLabel : 'Sokak Adı',
							name : ''
						});
						var getSokakNewValueWin = new Ext.Window({
							title : "Yeni Sokak Adi",
							layout : "fit",
							height : 100,
							width : 280,
							modal : true,
							items : [ {
								xtype : "form",
								bodyStyle : "padding: 5px;",
								labelWidth : 80,
								items : [ sokakTextField ]
							} ],
							buttons : [ {
								text : "Tamam",
								handler : function() {
									sokakfeature.attributes[r] = sokakTextField
											.getValue();
									getSokakNewValueWin.hide();
								},
								scope : this
							} ]
						});
						getSokakNewValueWin.show();
					},
					processResult : function(btn) {
						if (btn === 'ok'
								&& this.vectorLayer.features.length > 0)
							this.vectorLayer
									.removeFeatures([ this.vectorLayer.features[this.vectorLayer.features.length - 1] ])
					},
					addActions : function() {
						var mapProjCode = this.target.mapPanel.map.projection;
						var wfsLayers = this.wfsLayers;
						this.saveStrategy = new OpenLayers.Strategy.Save();
						this.saveStrategy.events
								.register(
										'success',
										this,
										function(event) {
											var gisUrl = "";
											var response = event.response;
											var insertids = response.insertIds;
											var fidsString = "";
											for ( var i = 0; i < insertids.length; i++) {
												Ext
														.each(
																this.saveStrategy.layer.features,
																function(
																		feature) {
																	if (feature.fid == insertids[i]) {
																		var li_dotIndex = feature.fid
																				.lastIndexOf(".");
																		gisUrl += feature.fid
																				.substr(li_dotIndex + 1)
																				+ "|";
																		gisUrl += feature.attributes["ILCE_ID"] != null ? feature.attributes["ILCE_ID"]
																				: 0;
																		gisUrl += "|";
																		gisUrl += feature.attributes["ILCE_ADI"] != null ? feature.attributes["ILCE_ADI"]
																				: "";
																		gisUrl += "|";
																		gisUrl += feature.attributes["MAH_ID"] != null ? feature.attributes["MAH_ID"]
																				: 0;
																		gisUrl += "|";
																		gisUrl += feature.attributes["MAH_ADI"] != null ? feature.attributes["MAH_ADI"]
																				: "";
																		gisUrl += "|";
																		gisUrl += feature.attributes["YOL_ID"] != null ? feature.attributes["YOL_ID"]
																				: 0;
																		gisUrl += "|";
																		gisUrl += feature.attributes["YOL_ISMI"] != null ? feature.attributes["YOL_ISMI"]
																				: "";
																		gisUrl += "|";
																		gisUrl += feature.attributes["YOL_KAPLAMA_CINSI"];
																		gisUrl += "|";
																		var transGeom = feature.geometry
																				.clone()
																				.transform(
																						new OpenLayers.Projection(
																								mapProjCode),
																						new OpenLayers.Projection(
																								"EPSG:40000"));
																		gisUrl += Math
																				.round(transGeom
																						.getLength() * 100) / 100;
																		if (i != insertids.length - 1)
																			gisUrl += "#";
																	}
																}, this);
												if (i == insertids.length - 1)
													fidsString += insertids[i];
												else
													fidsString += insertids[i]
															+ ",";
											}
											if (gisUrl.length > 0) {
												this.vectorLayer
														.removeAllFeatures();
												Ext.Ajax.fireEvent(
														"refreshFLayer",
														'kazihatti');
												var mapExtent = this.saveStrategy.layer.map
														.getExtent();
												var ls_printUrl = "";
												ls_printUrl += this.saveStrategy.layer.protocol.url
														.replace(/wfs/gi, "wms")
														+ "?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&SRS="
														+ mapProjCode
														+ "&format_options=layout:legendkocaeli";
												ls_printUrl += "&BBOX="
														+ mapExtent.toString();
												ls_printUrl += "&FORMAT=image/png&EXCEPTIONS=application/vnd.ogc.se_inimage&LAYERS="
														+ wfsLayers;
												ls_printUrl += "&WIDTH="
														+ this.saveStrategy.layer.map.size.w
														+ "&HEIGHT="
														+ this.saveStrategy.layer.map.size.h
														+ "&TILED=true&TRANSPARENT=TRUE&featureid="
														+ fidsString;
												console.log(gisUrl);
												console.log(ls_printUrl);
												try {
													window.parent
															.setGisData(
																	"returnAddress",
																	gisUrl,
																	ls_printUrl);
												} catch (err) {
													alert("AdresGrid Bulunamadi");
												}
											} else if (this.aykomeGridId != -1
													&& this.aykomeGridButtonid != -1) {
												this.vectorLayer
														.removeAllFeatures();
												Ext.Ajax.fireEvent(
														"refreshFLayer",
														'kazihatti');
												try {
													window.parent
															.deleteSuccess(
																	true,
																	this.aykomeGridId,
																	this.aykomeGridButtonid);
												} catch (err) {
													alert("deleteSucces cağrılamadı");
												}
												this.aykomeGridId = -1;
												this.aykomeGridButtonid = -1;
											}
										});
						Proj4js.defs["EPSG:40000"] = "+proj=tmerc +lat_0=0 +lon_0=30 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +datum=ITRF96 +units=m +no_defs";
						this.vectorLayer = new OpenLayers.Layer.Vector(this.id,
								{
									strategies : [ this.saveStrategy ],
									displayInLayerSwitcher : false,
									visibility : true,
									projection : new OpenLayers.Projection(
											"EPSG:102113"),
									protocol : new OpenLayers.Protocol.WFS({
										version : "1.1.0",
										url : this.wfsURL,
										featureType : "SDE.KAZIHATTI",
										featureNS : "UniversalWorkspace",
										geometryName : "SHAPE"
									})
								});
						this.snap = new OpenLayers.Control.Snapping({
							layer : this.vectorLayer
						});
						var drawControl = new OpenLayers.Control.DrawFeature(
								this.vectorLayer, OpenLayers.Handler.Path, {
									multi : true,
									scope : this,
									eventListeners : {
										featureadded : function(evt) {
											evt.object.scope.queuedFeatures
													.push(evt.feature);
											evt.object.scope.queue = 0;
											Ext.Ajax.fireEvent("nextFeature");
										}
									}
								});
						OpenLayers.Event.observe(document, "keydown", function(
								evt) {
							var handled = false;
							switch (evt.keyCode) {
							case 90:
								if (evt.metaKey || evt.ctrlKey) {
									drawControl.undo();
									handled = true;
								}
								break;
							case 89:
								if (evt.metaKey || evt.ctrlKey) {
									drawControl.redo();
									handled = true;
								}
								break;
							case 27:
								drawControl.cancel();
								handled = true;
								break;
							}
							if (handled) {
								OpenLayers.Event.stop(evt);
							}
						});
						var actions = [
								new GeoExt.Action({
									tooltip : "Kazı Hattı Oluştur",
									menuText : "Kazı Hattı Oluştur",
									iconCls : "gxp-icon-addfeature",
									enableToggle : true,
									control : drawControl,
									map : this.target.mapPanel.map,
									toggleGroup : this.toggleGroup,
									scope : this
								}),
								new GeoExt.Action(
										{
											tooltip : "Çizilen kazı hattını geri al",
											menuText : "Çizilen kazı hattını geri al",
											iconCls : "gxp-icon-featuregerial",
											handler : function() {
												if (this.vectorLayer.features.length > 0)
													this.vectorLayer
															.removeFeatures([ this.vectorLayer.features[this.vectorLayer.features.length - 1] ])
											},
											scope : this,
											map : this.target.mapPanel.map
										}),
								{
									tooltip : "İçeri Aktar",
									iconCls : "gxp-icon-addpackage",
									scope : this,
									handler : function() {
										drawControl.deactivate();
										var frmUpload = new Ext.form.FormPanel(
												{
													bodyStyle : "padding: 5px;",
													labelWidth : 40,
													fileUpload : true,
													items : [
															{
																name : "domain",
																value : document.domain,
																xtype : 'hidden'
															},
															{
																xtype : "label",
																html : "DXF/DWF uzantılı dosyanızı veya ESRI Shape File(SHP) dosyanızın içinde bulunduğu klasörü ZIP formatında paketleyerek (Winzip/Winrar kullanabilirsiniz) <b>Gözat</b> butonu ile <b>Dosya</b> alanına ekleyin.<br/>&nbsp;",
															},
															{
																xtype : "field",
																inputType : "file",
																fieldLabel : "Dosya",
																name : "file",
																allowBlank : false
															} ],
													buttons : [ {
														text : "Aktar",
														formBind : true,
														handler : function() {
															if (frmUpload
																	.getForm()
																	.isValid()) {
																frmUpload.form
																		.submit({
																			url : "../GeoImport/",
																			waitMsg : 'Aktarılıyor...',
																			failure : function(
																					form,
																					action) {
																				var jsonFormatter = new OpenLayers.Format.GeoJSON();
																				var geoCollection = jsonFormatter
																						.read(action.response.responseText)[0].geometry;
																				geoCollection
																						.transform(
																								new OpenLayers.Projection(
																										"EPSG:40000"),
																								new OpenLayers.Projection(
																										mapProjCode));
																				this.target.mapPanel.map
																						.zoomToExtent(
																								geoCollection
																										.getBounds(),
																								true);
																				winUpload
																						.hide();
																				Ext
																						.each(
																								geoCollection.components,
																								function(
																										geom) {
																									var vectorFeature = new OpenLayers.Feature.Vector(
																											new OpenLayers.Geometry.MultiLineString(
																													[ geom ]));
																									vectorFeature.state = OpenLayers.State.INSERT;
																									this.vectorLayer
																											.addFeatures(vectorFeature);
																									this.queuedFeatures
																											.push(vectorFeature);
																								},
																								this);
																				this.queue = 0;
																				Ext.Ajax
																						.fireEvent("nextFeature");
																			},
																			scope : this
																		});
															}
														},
														scope : this
													} ]
												});
										var winUpload = new Ext.Window({
											title : "İçe Aktar",
											layout : "fit",
											height : 150,
											width : 500,
											modal : true,
											waitTitle : "Lütfen Bekleyin...",
											items : [ frmUpload ],
										});
										winUpload.show();
									}
								},
								new GeoExt.Action(
										{
											tooltip : "Kazı hatlarını kaydet",
											menuText : "Kazı hatlarını kaydet",
											iconCls : "gxp-icon-featurekazihattisave",
											handler : function() {
												try {
													if (window.parent
															.hasGrid("gisTable"))
														this.saveStrategy
																.save();
													else
														alert("Gis Adress Tablosu bulunamadı");
												} catch (err) {
													alert("Gis Adress Tablosu bulunamadı");
												}
											},
											scope : this,
											map : this.target.mapPanel.map
										}) ];
						return actions = gxp.plugins.Featurekazihatti.superclass.addActions
								.apply(this, [ actions ]);
					}
				});
Ext.preg(gxp.plugins.Featurekazihatti.prototype.ptype,
		gxp.plugins.Featurekazihatti);
Ext.namespace("gxp.plugins");
gxp.plugins.KocaeliGisSorgu = Ext
		.extend(
				gxp.plugins.Tool,
				{
					ptype : "gxp_kocaeligissorgu",
					outputTarget : "map",
					popupTitle : "Kocaeli Mahalle/Sokak Sorgusu",
					tooltip : "Kocaeli Mahalle/Sokak Sorgusu",
					menuText : "Kocaeli Mahalle/Sokak Sorgusu",
					SERVICE_URL : "http://gis.kocaeli.bel.tr/nvi/service1.asmx",
					ILCE : "/getIlce?",
					MAHALLELER : "/getKoyMahalle?",
					SOKAKLAR : "/getCadde?",
					KAPILAR : "/GetKapiNoByCaddeSokak?",
					KOYLER : "/getkoyler?",
					featureLayer : null,
					style : null,
					EnumAdres : null,
					enumAdresDeger : null,
					cbx_ilce : null,
					cbx_mahalle : null,
					cbx_sokak : null,
					cbx_kapi : null,
					cbx_koy : null,
					constructor : function(config) {
						gxp.plugins.KocaeliGisSorgu.superclass.constructor
								.apply(this, arguments);
					},
					init : function(target) {
						gxp.plugins.KocaeliGisSorgu.superclass.init.apply(this,
								arguments);
						this.EnumAdres = {
							ILCE : 0,
							MAHALLE : 1,
							SOKAK : 2,
							KAPI : 3,
							KOY : 4
						}
						this.enumAdresDeger = this.EnumAdres.ILCE;
						this.style = {
							"all" : new OpenLayers.Style(null, {
								rules : [ new OpenLayers.Rule({
									symbolizer : this.initialConfig.symbolizer
											|| {
												"Point" : {
													pointRadius : 4,
													graphicName : "square",
													fillColor : "white",
													fillOpacity : 1,
													strokeWidth : 1,
													strokeOpacity : 1,
													strokeColor : "#333333"
												},
												"Line" : {
													strokeWidth : 4,
													strokeOpacity : 1,
													strokeColor : "#ff9933"
												},
												"Polygon" : {
													strokeWidth : 2,
													strokeOpacity : 1,
													strokeColor : "#ff6633",
													fillColor : "white",
													fillOpacity : 0.3
												}
											}
								}) ]
							}),
							"selected" : new OpenLayers.Style(null, {
								rules : [ new OpenLayers.Rule({
									symbolizer : {
										display : "none"
									}
								}) ]
							})
						};
						this.featureLayer = new OpenLayers.Layer.Vector(
								this.id,
								{
									displayInLayerSwitcher : false,
									visibility : true,
									projection : new OpenLayers.Projection(
											"EPSG:40000"),
									displayProjection : new OpenLayers.Projection(
											"EPSG:900913"),
									reproject : true,
									styleMap : new OpenLayers.StyleMap(
											{
												"vertex" : OpenLayers.Util
														.extend(
																{
																	display : ""
																},
																OpenLayers.Feature.Vector.style["select"]),
												"select" : this.style["all"]
											}, {
												extendDefault : false
											})
								});
						this.target.on({
							ready : function() {
								this.target.mapPanel.map
										.addLayer(this.featureLayer);
							},
							scope : this
						});
						this.on({
							beforedestroy : function() {
								this.target.mapPanel.map
										.removeLayer(this.featureLayer);
							},
							scope : this
						});
						this.target.mapPanel
								.on({
									aftermapmove : function() {
										try {
											var li_zoomLevel = this.target.mapPanel.map
													.getZoom();
											if (li_zoomLevel < 7)
												this.target.mapPanel.map
														.zoomTo(7);
											var lo_Extent = this.target.mapPanel.map
													.getExtent()
													.clone()
													.transform(
															new OpenLayers.Projection(
																	this.target.mapPanel.map.projection),
															new OpenLayers.Projection(
																	"EPSG:40000"));
											if (this.target.mapintializedcomplete)
												this.target
														.setCookieValue(
																"extent",
																this.target.mapPanel.map
																		.getExtent()
																		.toString());
											if (window.parent != null)
												window.parent
														.OverviewExtent(lo_Extent
																.toString());
										} catch (err) {
										}
									},
									scope : this
								});
						Ext.Ajax.on("CallzoomToFeature", function(ao_layerName,
								as_cqlQuery) {
							console.log("CallzoomToFeature: layerName="
									+ ao_layerName + " CQL_FILTER="
									+ as_cqlQuery);
							var lo_layer = this.getLayer(ao_layerName);
							if (lo_layer != null)
								this.queryLayer(lo_layer, as_cqlQuery, true);
							else
								alert("Katman bulunamadı.");
						}, this);
						Ext.Ajax.on("QueryObjectID", function(ao_layerName,
								as_objectIDs) {
							console.log("QueryObjectID: layerName="
									+ ao_layerName + " ObjectIDs="
									+ as_objectIDs);
							var lo_layer = this.getLayer(ao_layerName);
							if (lo_layer != null) {
								var ls_featureIdsQuery = this
										.getQueryObjectIDs(lo_layer.data.name,
												as_objectIDs);
								this.queryLayer(lo_layer, ls_featureIdsQuery,
										false);
							} else
								alert("Katman bulunamadı.");
						}, this);
						Ext.Ajax
								.on(
										"MapExtent",
										function(extent) {
											var lo_extent = new OpenLayers.Bounds.fromString(
													extent,
													this.target.mapPanel.map.projection);
											lo_extent
													.transform(
															new OpenLayers.Projection(
																	"EPSG:40000"),
															new OpenLayers.Projection(
																	this.target.mapPanel.map.projection));
											this.target.mapPanel.map
													.zoomToExtent(lo_extent,
															true);
										}, this);
					},
					addActions : function() {
						var actions = [ new GeoExt.Action(
								{
									tooltip : "Adres Sorgula",
									menuText : "Adres Sorgula",
									iconCls : "gxp-icon-find",
									enableToggle : false,
									pressed : false,
									allowDepress : false,
									layers : null,
									handler : function(evt) {
										this.enumAdresDeger = this.EnumAdres.ILCE;
										this.layers = this.getLayers();
										this.cbx_ilce = this.createCbx("İlçe",
												new Ext.data.ArrayStore({
													id : 0,
													fields : [ 'ad', 'kod' ],
													data : [ [ 'İlçe Seçiniz.',
															'-' ] ]
												}));
										this.cbx_mahalle = this.createCbx(
												"Mahalle",
												new Ext.data.ArrayStore({
													id : 0,
													fields : [ 'ad', 'kod' ],
													data : [ [
															'Mahalle Seçiniz.',
															'-' ] ]
												}));
										this.cbx_sokak = this.createCbx(
												"Sokak",
												new Ext.data.ArrayStore({
													id : 0,
													fields : [ 'ad', 'kod' ],
													data : [ [
															'Sokak Seçiniz.',
															'-' ] ]
												}));
										this.cbx_kapi = this.createCbx("Kapi",
												new Ext.data.ArrayStore({
													id : 0,
													fields : [ 'ad', 'kod' ],
													data : [ [ 'Kapı Seçiniz.',
															'-' ] ]
												}));
										this.cbx_koy = this.createCbx("Köy",
												new Ext.data.ArrayStore({
													id : 0,
													fields : [ 'ad', 'kod' ],
													data : [ [ 'Köy Seçiniz.',
															'-' ] ]
												}));
										this.getAddressDataset(this.SERVICE_URL
												+ this.ILCE, "İlçe Seçiniz")
										this.cbx_ilce
												.on(
														'select',
														function(box, record,
																index) {
															if (index > 0) {
																this.enumAdresDeger = this.EnumAdres.KOY;
																this
																		.getAddressDataset(this.SERVICE_URL
																				+ this.KOYLER
																				+ "ilce_kodu="
																				+ this.cbx_ilce
																						.getValue());
																this
																		.queryLayer(
																				this.layers.ilce,
																				"ILCEID="
																						+ this.cbx_ilce
																								.getValue(),
																				true);
															}
														}, this);
										this.cbx_koy
												.on(
														'select',
														function(box, record,
																index) {
															if (index > 0) {
																this.enumAdresDeger = this.EnumAdres.MAHALLE;
																this
																		.getAddressDataset(this.SERVICE_URL
																				+ this.MAHALLELER
																				+ "koy_kodu="
																				+ this.cbx_koy
																						.getValue());
																this
																		.queryLayer(
																				this.layers.koy,
																				"KOY_ID="
																						+ this.cbx_koy
																								.getValue(),
																				true);
															}
														}, this);
										this.cbx_mahalle
												.on(
														'select',
														function(box, record,
																index) {
															if (index > 0) {
																this.enumAdresDeger = this.EnumAdres.SOKAK;
																this
																		.getAddressDataset(this.SERVICE_URL
																				+ this.SOKAKLAR
																				+ "ilce_kodu="
																				+ this.cbx_ilce
																						.getValue()
																				+ "&mahalle_kodu="
																				+ this.cbx_mahalle
																						.getValue());
																this
																		.queryLayer(
																				this.layers.koy,
																				"MAH_ID="
																						+ this.cbx_mahalle
																								.getValue(),
																				true);
															}
														}, this);
										this.cbx_sokak
												.on(
														'select',
														function(box, record,
																index) {
															if (index > 0) {
																this.enumAdresDeger = this.EnumAdres.KAPI;
																this
																		.getAddressDataset(this.SERVICE_URL
																				+ this.KAPILAR
																				+ "CaddeSokakID="
																				+ this.cbx_sokak
																						.getValue());
																this
																		.queryLayer(
																				this.layers.sokak,
																				"CSBMKOD="
																						+ this.cbx_sokak
																								.getValue(),
																				true);
															}
														}, this);
										this.cbx_kapi
												.on(
														'select',
														function(box, record,
																index) {
															if (index > 0) {
																this
																		.queryLayer(
																				this.layers.kapi,
																				"NVI_BINAKOD="
																						+ this.cbx_kapi
																								.getValue(),
																				true);
															}
														}, this);
										this
												.createForm([ this.cbx_ilce,
														this.cbx_koy,
														this.cbx_mahalle,
														this.cbx_sokak,
														this.cbx_kapi ]);
									},
									mapPanel : this.target.mapPanel,
									scope : this
								}) ];
						return actions = gxp.plugins.KocaeliGisSorgu.superclass.addActions
								.call(this, actions);
					},
					getLayers : function() {
						var layers = {};
						var ds = this.target.layerSources.local.store.data.items;
						Ext.each(ds, function(layer) {
							var keywords = layer.data.keywords;
							Ext.each(keywords, function(keyword) {
								switch (keyword) {
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
									layers.koy = layer;
								}
							});
						});
						return layers;
					},
					getLayer : function(layername) {
						var ds = this.target.layerSources.local.store.data.items;
						for ( var i = 0; i < ds.length; i++) {
							var keywords = ds[i].data.keywords;
							for ( var j = 0; j < keywords.length; j++) {
								if (keywords[j] == layername)
									return ds[i];
							}
						}
						return null;
					},
					getQueryObjectIDs : function(as_layerName,
							as_queryObjectIDs) {
						var lo_tempArray = as_layerName.split(":");
						var ls_layerNameWOWorkspaceName = "";
						var ls_fidQuery = "featureid=";
						if (lo_tempArray.length > 1) {
							ls_layerNameWOWorkspaceName = lo_tempArray[1];
							var lo_tempArrayFID = as_queryObjectIDs.split(",");
							for ( var i = 0; i < lo_tempArrayFID.length; i++) {
								ls_fidQuery += ls_layerNameWOWorkspaceName
										+ "." + lo_tempArrayFID[i];
								if (i != lo_tempArrayFID.length - 1)
									ls_fidQuery += ",";
							}
						}
						return ls_fidQuery;
					},
					createForm : function(ao_controlItems) {
						var selectRegionWin = new Ext.Window({
							title : "Adres Sorgusu",
							layout : "fit",
							height : 170,
							width : 280,
							x : 350,
							y : 50,
							items : [ {
								xtype : "form",
								bodyStyle : "padding: 5px;",
								labelWidth : 40,
								items : ao_controlItems
							} ],
							modal : false
						});
						selectRegionWin.on('close', function() {
							this.featureLayer.removeAllFeatures();
						}, this);
						selectRegionWin.show();
					},
					createCbx : function(as_labelField, ao_store) {
						var cbxCombobox = new Ext.form.ComboBox({
							typeAhead : true,
							triggerAction : 'all',
							lazyRender : true,
							editable : false,
							allowBlank : false,
							forceSelection : true,
							width : 200,
							mode : 'local',
							fieldLabel : as_labelField,
							store : ao_store,
							valueField : 'kod',
							displayField : 'ad'
						});
						cbxCombobox.setValue("-");
						return cbxCombobox;
					},
					getFCollectionMaxExtent : function(ao_featureColl) {
						var ld_buttom = 0;
						var ld_left = 0;
						var ld_top = 0;
						var ld_right = 0;
						for ( var i = 0; i < ao_featureColl.length; i++) {
							var lo_featureExtent = ao_featureColl[i].geometry
									.getBounds();
							if (ld_buttom == 0
									|| lo_featureExtent.bottom < ld_buttom)
								ld_buttom = lo_featureExtent.bottom;
							if (ld_left == 0 || lo_featureExtent.left < ld_left)
								ld_left = lo_featureExtent.left;
							if (ld_top == 0 || lo_featureExtent.top > ld_top)
								ld_top = lo_featureExtent.top;
							if (ld_right == 0
									|| lo_featureExtent.right > ld_right)
								ld_right = lo_featureExtent.right;
						}
						return new OpenLayers.Bounds(ld_left, ld_buttom,
								ld_right, ld_top);
					},
					queryWFSLayer : function(ao_layer, as_cqlFilter) {
						var layerTemp = ao_layer.data.layer;
						var ls_wfsURL = layerTemp.url.replace(/wms/gi, "wfs")
								+ "&VERSION=" + layerTemp.params.VERSION
								+ "&REQUEST=" + "GetFeature" + "&srsName="
								+ this.target.mapPanel.map.projection
								+ "&outputFormat=json" + "&propertyName=SHAPE"
								+ "&TYPENAME=" + layerTemp.params.LAYERS + "&"
								+ as_cqlFilter;
						Ext.getBody().mask("Lütfen bekleyiniz.", 'loading');
						var lo_request = OpenLayers.Request.GET({
							url : ls_wfsURL,
							timeout : 5000,
							async : false
						});
						Ext.getBody().unmask();
						var jsonFormatter = new OpenLayers.Format.GeoJSON();
						this.target.mapPanel.map.raiseLayer(this.featureLayer,
								this.target.mapPanel.map.layers.length);
						this.featureLayer.removeAllFeatures();
						this.featureLayer.addFeatures(jsonFormatter
								.read(lo_request.responseText));
						if (this.featureLayer.features.length > 0)
							this.target.mapPanel.map
									.zoomToExtent(
											this
													.getFCollectionMaxExtent(this.featureLayer.features),
											true);
					},
					queryLayer : function(ao_layer, as_Filter, isCqlFilter) {
						if (isCqlFilter)
							this.queryWFSLayer(ao_layer, "&CQL_FILTER="
									+ as_Filter);
						else
							this.queryWFSLayer(ao_layer, as_Filter);
					},
					getAddressDataset : function(serviceUrl) {
						Ext.getBody().mask("Lütfen bekleyiniz.", 'loading');
						var requestGetAddress = OpenLayers.Request.GET({
							url : serviceUrl,
							async : true,
							success : this.getAddress_result,
							failure : this.getAddress_fault,
							scope : this
						});
					},
					clearCbx : function(cbx, selectedValue) {
						var tempDataSet = new Ext.data.ArrayStore({
							id : 0,
							fields : [ 'ad', 'kod' ]
						});
						tempDataSet.add(new Ext.data.Record({
							"ad" : selectedValue,
							"kod" : "-"
						}));
						cbx.bindStore(tempDataSet);
						return tempDataSet;
					},
					getAddress_result : function(event) {
						Ext.getBody().unmask();
						var addressDataSet = new Ext.data.ArrayStore({
							id : 0,
							fields : [ 'ad', 'kod' ]
						});
						var xmlFormatter = new OpenLayers.Format.XML();
						var getIlce = xmlFormatter.read(event.responseText);
						var childrens = getIlce.getElementsByTagName("Bilgi");
						addressDataSet.add(new Ext.data.Record({
							"ad" : "İlçe",
							"kod" : "-"
						}));
						if (this.enumAdresDeger == this.EnumAdres.KOY) {
							Ext.each(childrens, function(bilgi) {
								addressDataSet.add(new Ext.data.Record({
									'kod' : bilgi.lastElementChild.textContent,
									'ad' : bilgi.firstElementChild.textContent
								}));
							});
						} else {
							Ext.each(childrens, function(bilgi) {
								addressDataSet.add(new Ext.data.Record({
									'ad' : bilgi.lastElementChild.textContent,
									'kod' : bilgi.firstElementChild.textContent
								}));
							});
						}
						switch (this.enumAdresDeger) {
						case this.EnumAdres.ILCE:
							addressDataSet.data.items[0].data.ad = "İlçe Seçiniz";
							this.cbx_ilce.bindStore(addressDataSet);
							break;
						case this.EnumAdres.MAHALLE:
							if (addressDataSet.data.items.length > 0)
								addressDataSet.data.items[0].data.ad = "Mahalle Seçiniz";
							this.cbx_mahalle.bindStore(addressDataSet);
							this.cbx_mahalle.setValue("-");
							this.clearCbx(this.cbx_sokak, "Sokak Seçiniz");
							this.clearCbx(this.cbx_kapi, "Kapı Seçiniz");
							this.cbx_sokak.setValue("-");
							this.cbx_kapi.setValue("-");
							break;
						case this.EnumAdres.SOKAK:
							if (addressDataSet.data.items.length > 0)
								addressDataSet.data.items[0].data.ad = "Mahalle Seçiniz";
							addressDataSet.data.items[0].data.ad = "Sokak Seçiniz";
							this.cbx_sokak.bindStore(addressDataSet);
							this.clearCbx(this.cbx_kapi, "Kapı Seçiniz");
							this.cbx_kapi.setValue("-");
							break;
						case this.EnumAdres.KAPI:
							if (addressDataSet.data.items.length > 0)
								addressDataSet.data.items[0].data.ad = "Mahalle Seçiniz";
							addressDataSet.data.items[0].data.ad = "Kapı Seçiniz";
							this.cbx_kapi.bindStore(addressDataSet);
							break;
						case this.EnumAdres.KOY:
							if (addressDataSet.data.items.length > 0)
								addressDataSet.data.items[0].data.ad = "Mahalle Seçiniz";
							addressDataSet.data.items[0].data.ad = "Koy Seçiniz";
							this.cbx_koy.bindStore(addressDataSet);
							this.cbx_koy.setValue("-");
							this.cbx_mahalle.setValue("-");
							this.clearCbx(this.cbx_sokak, "Sokak Seçiniz");
							this.clearCbx(this.cbx_kapi, "Kapı Seçiniz");
							this.cbx_sokak.setValue("-");
							this.cbx_kapi.setValue("-");
							break;
						}
					},
					getAddress_fault : function(event) {
						Ext.getBody().unmask();
						alert("Hata oluştu.");
					}
				});
Ext.preg(gxp.plugins.KocaeliGisSorgu.prototype.ptype,
		gxp.plugins.KocaeliGisSorgu);
Ext.namespace("gxp.plugins");
gxp.plugins.FlexCityAdresAl = Ext
		.extend(
				gxp.plugins.Tool,
				{
					ptype : "gxp_flexcityadresal",
					popupTitle : "Adres Al",
					tooltip : "Adres Al",
					menuText : "Adres Al",
					dataLayers : null,
					busyMask : null,
					constructor : function(config) {
						gxp.plugins.FlexCityAdresAl.superclass.constructor
								.apply(this, arguments);
					},
					init : function(target) {
						this.busyMask = new Ext.LoadMask(
								target.mapPanel.map.div, {
									msg : "Lütfen bekleyiniz."
								});
						gxp.plugins.FlexCityAdresAl.superclass.init.apply(this,
								arguments);
					},
					addActions : function() {
						OpenLayers.Control.Click = OpenLayers
								.Class(
										OpenLayers.Control,
										{
											defaultHandlerOptions : {
												'single' : true,
												'double' : false,
												'pixelTolerance' : 0,
												'stopSingle' : false,
												'stopDouble' : false
											},
											initialize : function(options) {
												this.handlerOptions = OpenLayers.Util
														.extend(
																{},
																this.defaultHandlerOptions);
												OpenLayers.Control.prototype.initialize
														.apply(this, arguments);
												this.handler = new OpenLayers.Handler.Click(
														this,
														{
															'click' : this.trigger
														}, this.handlerOptions);
											},
											trigger : function(e) {
												var adresStore = new Ext.data.ArrayStore(
														{
															id : 0,
															fields : [
																	'NVI_CSBMKOD',
																	'BINA_KODU',
																	'BINA_ADI',
																	'KAPI_NO',
																	'YOL_ID',
																	'YOL_ISMI',
																	'MAH_ID',
																	'MAH_ADI',
																	'ILCE_ID',
																	'ILCE_ADI' ]
														});
												var lonlatWGS84 = this.map
														.getLonLatFromViewPortPx(e.xy);
												lonlatWGS84 = lonlatWGS84
														.transform(
																new OpenLayers.Projection(
																		this.map.projection),
																new OpenLayers.Projection(
																		"EPSG:4326"));
												var lonlat = this.map
														.getLonLatFromViewPortPx(e.xy);
												var transGeom = lonlat
														.transform(
																new OpenLayers.Projection(
																		this.map.projection),
																new OpenLayers.Projection(
																		"EPSG:40000"));
												var intersectGeometry = new OpenLayers.Bounds();
												intersectGeometry
														.extend(new OpenLayers.LonLat(
																lonlat.lon - 2,
																lonlat.lat - 2));
												intersectGeometry
														.extend(new OpenLayers.LonLat(
																lonlat.lon + 2,
																lonlat.lat + 2));
												adresStore.data["NVI_CSBMKOD"] = "0";
												adresStore.data["KAPI_NO"] = "0";
												adresStore.data["YOL_ID"] = "0";
												adresStore.data["YOL_ISMI"] = "-";
												adresStore.data["MAH_ID"] = "0";
												adresStore.data["MAH_ADI"] = "-";
												adresStore.data["ILCE_ID"] = "0";
												adresStore.data["ILCE_ADI"] = "-";
												adresStore.data["BINA_ADI"] = "-";
												adresStore.data["BINA_KODU"] = "0";
												try {
													var response = this.scope
															.queryOnLayer(
																	this.scope.dataLayers.kapi,
																	"KAPI_NO,NVI_CSBMKOD,NVI_BINAKOD,PARSEL_ID",
																	"INTERSECTS(SHAPE,"
																			+ intersectGeometry
																					.toGeometry()
																					.toString()
																			+ ")");
													if (response.length > 0) {
														Ext
																.each(
																		response,
																		function(
																				kapi) {
																			adresStore.data["NVI_CSBMKOD"] = kapi.attributes["NVI_CSBMKOD"];
																			adresStore.data["KAPI_NO"] = kapi.attributes["KAPI_NO"];
																			adresStore.data["BINA_KODU"] = kapi.attributes["NVI_BINAKOD"];
																			response = this.scope
																					.queryOnLayer(
																							this.scope.dataLayers.bina,
																							"YAPIADI,NVIBINAKOD",
																							"NVIBINAKOD="
																									+ kapi.attributes["NVI_BINAKOD"]);
																			Ext
																					.each(
																							response,
																							function(
																									bina) {
																								adresStore.data["BINA_ADI"] = bina.attributes["YAPIADI"];
																							});
																			response = this.scope
																					.queryOnLayer(
																							this.scope.dataLayers.sokak,
																							"YOL_ID,YOL_ISMI,CSBMKOD,SHAPE",
																							"CSBMKOD="
																									+ kapi.attributes["NVI_CSBMKOD"]);
																			Ext
																					.each(
																							response,
																							function(
																									sokak) {
																								adresStore.data["YOL_ID"] = sokak.attributes["YOL_ID"];
																								adresStore.data["YOL_ISMI"] = sokak.attributes["YOL_ISMI"];
																								adresStore.data["NVI_CSBMKOD"] = sokak.attributes["CSBMKOD"];
																								response = this.scope
																										.queryOnLayer(
																												this.scope.dataLayers.mahalle,
																												"ILCEADI,ILCEID,KOYMAHALLEADI,MAHALLEID",
																												"INTERSECTS(SHAPE,POINT("
																														+ lonlat.lon
																														+ " "
																														+ lonlat.lat
																														+ "))");
																								Ext
																										.each(
																												response,
																												function(
																														mah) {
																													adresStore.data["MAH_ID"] = mah.attributes["MAHALLEID"];
																													adresStore.data["MAH_ADI"] = mah.attributes["KOYMAHALLEADI"];
																													adresStore.data["ILCE_ID"] = mah.attributes["ILCEID"];
																													adresStore.data["ILCE_ADI"] = mah.attributes["ILCEADI"];
																												});
																							},
																							this);
																		}, this);
													} else {
														response = this.scope
																.queryOnLayer(
																		this.scope.dataLayers.sokak,
																		"YOL_ID,YOL_ISMI,CSBMKOD,SHAPE",
																		"DWITHIN(SHAPE,POINT("
																				+ lonlat.lon
																				+ " "
																				+ lonlat.lat
																				+ "),2,meters)");
														if (response.length > 0) {
															Ext
																	.each(
																			response,
																			function(
																					sokak) {
																				adresStore.data["YOL_ID"] = sokak.attributes["YOL_ID"];
																				adresStore.data["YOL_ISMI"] = sokak.attributes["YOL_ISMI"];
																				response = this.scope
																						.queryOnLayer(
																								this.scope.dataLayers.mahalle,
																								"ILCEADI,ILCEID,KOYMAHALLEADI,MAHALLEID",
																								"INTERSECTS(SHAPE,"
																										+ sokak.geometry.components[0]
																												.simplify()
																												.toString()
																										+ ")");
																				Ext
																						.each(
																								response,
																								function(
																										mah) {
																									adresStore.data["MAH_ID"] = mah.attributes["MAHALLEID"];
																									adresStore.data["MAH_ADI"] = mah.attributes["KOYMAHALLEADI"];
																									adresStore.data["ILCE_ID"] = mah.attributes["ILCEID"];
																									adresStore.data["ILCE_ADI"] = mah.attributes["ILCEADI"];
																								});
																			},
																			this);
														} else {
															response = this.scope
																	.queryOnLayer(
																			this.scope.dataLayers.mahalle,
																			"ILCEADI,ILCEID,KOYMAHALLEADI,MAHALLEID",
																			"INTERSECTS(SHAPE,POINT("
																					+ lonlat.lon
																					+ " "
																					+ lonlat.lat
																					+ "))");
															Ext
																	.each(
																			response,
																			function(
																					mah) {
																				adresStore.data["MAH_ID"] = mah.attributes["MAHALLEID"];
																				adresStore.data["MAH_ADI"] = mah.attributes["KOYMAHALLEADI"];
																				adresStore.data["ILCE_ID"] = mah.attributes["ILCEID"];
																				adresStore.data["ILCE_ADI"] = mah.attributes["ILCEADI"];
																			});
														}
													}
													try {
														var mapExtent = this.map
																.getExtent();
														var mapImageUrl = "";
														mapImageUrl += this.scope.dataLayers.mahalle.store.url
																.replace(
																		/ows/gi,
																		"wms")
																+ "?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&SRS="
																+ this.map.projection;
														mapImageUrl += "&BBOX="
																+ mapExtent
																		.toString();
														mapImageUrl += "&FORMAT=image/png&EXCEPTIONS=application/vnd.ogc.se_inimage&LAYERS=UniversalWorkspace:SDE.KOYMAHALLE,UniversalWorkspace:SDE.KARAYOLU,UniversalWorkspace:SDE.KOCAELI_KAPI,UniversalWorkspace:SDE.KOCAELI_YAPI";
														mapImageUrl += "&WIDTH="
																+ this.map.size.w
																+ "&HEIGHT="
																+ this.map.size.h
																+ "&TILED=true&TRANSPARENT=TRUE";
														mapImageUrl = mapImageUrl
																.replace(/:/gi,
																		"<>");
														Ext.MessageBox.buttonText = {
															ok : "Tamam",
															cancel : "İptal",
															yes : "Evet",
															no : "Hayır"
														};
														Ext.MessageBox
																.confirm(
																		'Uyarı',
																		"Şeçmek istediğiniz adres?\n"
																				+ adresStore.data["ILCE_ADI"]
																				+ " İlçesi\n"
																				+ adresStore.data["MAH_ADI"]
																				+ " Mahallesi\n"
																				+ adresStore.data["YOL_ISMI"]
																				+ " Cad./Sok. "
																				+ ' Kapıno '
																				+ adresStore.data["KAPI_NO"],
																		function(
																				btn) {
																			window.parent
																					.setAddressScript3('address:'
																							+ adresStore.data["NVI_CSBMKOD"]
																							+ ':'
																							+ adresStore.data["KAPI_NO"]
																							+ ':'
																							+ adresStore.data["YOL_ID"]
																							+ ':'
																							+ adresStore.data["YOL_ISMI"]
																							+ ':'
																							+ adresStore.data["MAH_ID"]
																							+ ':'
																							+ adresStore.data["MAH_ADI"]
																							+ ':'
																							+ adresStore.data["ILCE_ID"]
																							+ ':'
																							+ adresStore.data["ILCE_ADI"]
																							+ ':'
																							+ adresStore.data["BINA_ADI"]
																							+ ':'
																							+ adresStore.data["BINA_KODU"]
																							+ ':'
																							+ lonlatWGS84.lon
																							+ ':'
																							+ lonlatWGS84.lat
																							+ ':'
																							+ mapExtent
																							+ ':'
																							+ mapImageUrl);
																		});
													} catch (err) {
														alert("window.parent.setAddress3 fonksiyonu bulunamadı.\n"
																+ err.message);
													}
												} catch (errM) {
													alert("Mekansal sorgulama yapılırken hata oluştu."
															+ errM.message);
												}
											},
											scope : this
										});
						var actions = [ new GeoExt.Action({
							tooltip : "Adresi Seç",
							menuText : "Adresi Seç",
							iconCls : "gxp-icon-flexcityadresal",
							enableToggle : true,
							pressed : false,
							allowDepress : false,
							control : new OpenLayers.Control.Click(),
							map : this.target.mapPanel.map,
							toggleGroup : this.toggleGroup,
							scope : this,
							handler : function(evt) {
								this.dataLayers = this.getLayers();
							}
						}) ];
						return actions = gxp.plugins.FlexCityAdresAl.superclass.addActions
								.call(this, actions);
					},
					getLayers : function() {
						var layers = {};
						var ds = this.target.layerSources.local.store.data.items;
						Ext.each(ds, function(layer) {
							var keywords = layer.data.keywords;
							Ext.each(keywords, function(keyword) {
								switch (keyword) {
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
					uniWaiting : function(msecs) {
						var start = new Date().getTime();
						var cur = start
						while (cur - start < msecs) {
							cur = new Date().getTime();
						}
					},
					queryOnLayer : function(ao_layer, as_properties,
							as_cqlFilter) {
						var layerTemp = ao_layer.data.layer;
						var ls_wfsURL = layerTemp.url.replace(/wms/gi, "wfs");
						var jsonFormatter = new OpenLayers.Format.GeoJSON();
						Ext.getBody().mask("Lütfen bekleyiniz.", 'loading');
						var lo_request = OpenLayers.Request.GET({
							url : ls_wfsURL,
							params : {
								"version" : "1.0.0",
								"request" : "GetFeature",
								"srs" : "EPSG:40000",
								"outputFormat" : "json",
								"maxfeatures" : "1",
								"typename" : layerTemp.params.LAYERS,
								"propertyName" : as_properties,
								"cql_filter" : as_cqlFilter
							},
							timeout : 5000,
							async : false
						});
						Ext.getBody().unmask();
						return jsonFormatter.read(lo_request.responseText);
					},
					queryLayer : function(ao_layer, as_Filter, isCqlFilter) {
						if (isCqlFilter)
							this.queryWFSLayer(ao_layer, "&CQL_FILTER="
									+ as_Filter);
						else
							this.queryWFSLayer(ao_layer, as_Filter);
					}
				});
Ext.preg(gxp.plugins.FlexCityAdresAl.prototype.ptype,
		gxp.plugins.FlexCityAdresAl);
Ext.namespace("gxp.plugins");
gxp.plugins.FlexCityCurrentLocation = Ext
		.extend(
				gxp.plugins.Tool,
				{
					ptype : "gxp_flexcitycurrentlocation",
					popupTitle : "Adres Al",
					tooltip : "Adres Al",
					menuText : "Adres Al",
					dataLayers : null,
					busyMask : null,
					constructor : function(config) {
						gxp.plugins.FlexCityCurrentLocation.superclass.constructor
								.apply(this, arguments);
					},
					init : function(target) {
						this.busyMask = new Ext.LoadMask(
								target.mapPanel.map.div, {
									msg : "Lütfen bekleyiniz."
								});
						gxp.plugins.FlexCityCurrentLocation.superclass.init
								.apply(this, arguments);
					},
					addActions : function() {
						OpenLayers.Control.Click = OpenLayers
								.Class(
										OpenLayers.Control,
										{
											defaultHandlerOptions : {
												'single' : true,
												'double' : false,
												'pixelTolerance' : 0,
												'stopSingle' : false,
												'stopDouble' : false
											},
											initialize : function(options) {
												this.handlerOptions = OpenLayers.Util
														.extend(
																{},
																this.defaultHandlerOptions);
												OpenLayers.Control.prototype.initialize
														.apply(this, arguments);
												this.handler = new OpenLayers.Handler.Click(
														this,
														{
															'click' : this.trigger
														}, this.handlerOptions);
											},
											trigger : function(e) {
											},
											scope : this
										});
						var actions = [ new GeoExt.Action(
								{
									tooltip : "Konumum",
									menuText : "Konumum",
									iconCls : "gxp-icon-flexcitycurrentlocation",
									enableToggle : false,
									pressed : false,
									allowDepress : false,
									scope : this,
									handler : function(evt) {
										navigator.geolocation
												.getCurrentPosition(this.zoomCurrentPosition);
									}
								}) ];
						return actions = gxp.plugins.FlexCityCurrentLocation.superclass.addActions
								.call(this, actions);
					},
					uniWaiting : function(msecs) {
						var start = new Date().getTime();
						var cur = start
						while (cur - start < msecs) {
							cur = new Date().getTime();
						}
					},
					zoomCurrentPosition : function(position) {
						var proj4326 = new OpenLayers.Projection('EPSG:4326');
						var zoomLevel = 18;
						var lat = position.coords.latitude;
						var lon = position.coords.longitude;
						window.app.mapPanel.map.setCenter(
								new OpenLayers.LonLat(lon, lat).transform(
										proj4326, window.app.mapPanel.map
												.getProjectionObject()),
								zoomLevel);
					}
				});
Ext.preg(gxp.plugins.FlexCityCurrentLocation.prototype.ptype,
		gxp.plugins.FlexCityCurrentLocation);
Ext.namespace("gxp.plugins");
gxp.plugins.FlexCityLegendTool = Ext.extend(gxp.plugins.Tool, {
	ptype : "gxp_flexcitylegendtool",
	popupTitle : "Legend Aç/Kapat",
	tooltip : "Legend Aç/Kapat",
	menuText : "Legend Aç/Kapat",
	busyMask : null,
	constructor : function(config) {
		gxp.plugins.FlexCityLegendTool.superclass.constructor.apply(this,
				arguments);
	},
	init : function(target) {
		this.busyMask = new Ext.LoadMask(target.mapPanel.map.div, {
			msg : "Lütfen bekleyiniz."
		});
		gxp.plugins.FlexCityLegendTool.superclass.init.apply(this, arguments);
	},
	addActions : function() {
		var actions = [ new GeoExt.Action({
			tooltip : "Legend Aç/Kapat",
			menuText : "Legend Aç/Kapat",
			iconCls : "gxp-icon-flexcitylegendtool",
			enableToggle : false,
			pressed : false,
			allowDepress : false,
			scope : this,
			handler : function(evt) {
				if (this.target.portalItems[0].items[1].isVisible())
					this.target.portalItems[0].items[1].collapse();
				else
					this.target.portalItems[0].items[1].expand();
			}
		}) ];
		return actions = gxp.plugins.FlexCityLegendTool.superclass.addActions
				.call(this, actions);
	}
});
Ext.preg(gxp.plugins.FlexCityLegendTool.prototype.ptype,
		gxp.plugins.FlexCityLegendTool);
Ext.namespace("gxp");
gxp.PlaybackToolbar = Ext
		.extend(
				Ext.Toolbar,
				{
					control : null,
					viewer : null,
					initialTime : null,
					timeFormat : "l, F d, Y g:i:s A",
					toolbarCls : 'x-toolbar gx-overlay-playback',
					slider : true,
					dynamicRange : false,
					playbackMode : "track",
					showIntervals : false,
					labelButtons : false,
					settingsButton : true,
					rateAdjuster : false,
					optionsWindow : null,
					playLabel : 'Oynat',
					playTooltip : 'Oynat',
					stopLabel : 'Durdur',
					stopTooltip : 'Durdur',
					fastforwardLabel : 'HızlıİleriSar',
					fastforwardTooltip : '2 kat hızlı Oynat',
					nextLabel : 'İleri',
					nextTooltip : 'Bir kare ilerlet',
					resetLabel : 'Reset',
					resetTooltip : 'Başa Al',
					loopLabel : 'Döngü halinde oynat',
					loopTooltip : 'Sürekli döngü halinde oynatır',
					normalTooltip : 'Normal oynatmaya dön',
					pauseLabel : 'Duraksat',
					pauseTooltip : 'Duraksat',
					initComponent : function() {
						if (!this.playbackActions) {
							this.playbackActions = [ "settings", "slider",
									"reset", "play", "fastforward", "next",
									"loop" ];
						}
						if (!this.control) {
							this.control = this.buildTimeManager();
						}
						Ext.applyIf(this, {
							defaults : {
								xtype : 'button',
								flex : 1,
								scale : 'small'
							},
							items : this.buildPlaybackItems(),
							border : false,
							frame : false,
							unstyled : true,
							shadow : false,
							timeDisplayConfig : {
								'xtype' : 'tip',
								format : this.timeFormat,
								height : 'auto',
								closeable : false,
								title : false,
								width : 210
							}
						});
						this.addEvents("timechange", "rangemodified");
						gxp.PlaybackToolbar.superclass.initComponent.call(this);
						this.on({
							'afterlayout' : function(tb, layout) {
							}
						});
					},
					destroy : function() {
						if (this.control && !this.initialConfig.control) {
							this.control.map
									&& this.control.map
											.removeControl(this.control);
							this.control.destroy();
							this.control = null;
						}
						gxp.PlaybackToolbar.superclass.destroy.call(this);
					},
					setTime : function(time) {
						var timeVal = time.getTime();
						if (timeVal < this.slider.minValue
								|| timeVal > this.slider.maxValue) {
							return false;
						} else {
							this.control.setTime(time);
							return true;
						}
					},
					setTimeFormat : function(format) {
						this.timeFormat = this.slider.format = format;
					},
					setPlaybackMode : function(mode) {
						this.playbackMode = mode;
						this.reconfigureSlider(this.buildSliderValues());
						if (this.playbackMode == 'ranged'
								|| this.playbackMode == 'decay') {
							this.control.incrementTime(
									this.control.rangeInterval,
									this.control.units);
						}
						this.setThumbStyles(this.slider);
					},
					buildPlaybackItems : function() {
						if (this.control.timeAgents) {
							if (!this.control.units) {
								this.control.guessPlaybackRate();
							}
							if (this.playbackMode == 'ranged'
									|| this.playbackMode == 'decay') {
								if (this.control.units) {
									this.control.incrementTime(
											this.control.rangeInterval,
											this.control.units);
								}
							}
						}
						var sliderInfo = ((this.control.units || this.control.snapToIntervals) && this
								.buildSliderValues())
								|| {};
						if (!sliderInfo.interval && this.control.intervals
								&& this.control.intervals.length > 2) {
							var interval = Math
									.round((sliderInfo.maxValue - sliderInfo.minValue)
											/ this.control.intervals.length);
						}
						this.setTimeFormat(this
								.guessTimeFormat(sliderInfo.interval
										|| interval));
						var actionDefaults = {
							'slider' : {
								xtype : 'multislider',
								ref : 'slider',
								maxValue : sliderInfo.maxValue,
								minValue : sliderInfo.minValue,
								increment : sliderInfo.interval,
								keyIncrement : sliderInfo.interval,
								indexMap : sliderInfo.map,
								values : sliderInfo.values,
								width : 200,
								animate : false,
								format : this.timeFormat,
								plugins : [ new Ext.slider.Tip(
										{
											getText : function(thumb) {
												if (thumb.slider.indexMap[thumb.index] != 'tail') {
													return (new Date(
															thumb.value)
															.format(thumb.slider.format));
												} else {
													var formatInfo = gxp.PlaybackToolbar.prototype.smartIntervalFormat
															.call(
																	thumb,
																	thumb.slider.thumbs[0].value
																			- thumb.value);
													return formatInfo.value
															+ ' '
															+ formatInfo.units;
												}
											}
										}) ],
								listeners : {
									'changecomplete' : this.onSliderChangeComplete,
									'dragstart' : function() {
										if (this.control.timer) {
											this.control.stop();
											this.restartPlayback = true;
										}
									},
									'beforechange' : function(slider) {
										return !!(this.control.units || this.control.snapToIntervals);
									},
									'afterrender' : function(slider) {
										var panel = this;
										this.sliderTip = slider.plugins[0];
										this.control.events
												.register(
														'tick',
														this.control,
														function(evt) {
															var tailIndex = slider.indexMap ? slider.indexMap
																	.indexOf('tail')
																	: -1;
															var offset = (tailIndex > -1) ? evt.currentTime
																	.getTime()
																	- slider.thumbs[0].value
																	: 0;
															slider
																	.setValue(
																			0,
																			evt.currentTime
																					.getTime()
																					+ offset);
															if (tailIndex > -1) {
																slider
																		.setValue(
																				tailIndex,
																				slider.thumbs[tailIndex].value
																						+ offset);
															}
															panel
																	.updateTimeDisplay();
															panel
																	.fireEvent(
																			'timechange',
																			panel,
																			this.currentTime);
														});
										if (this.control.units
												&& this.slider.thumbs.length > 1) {
											this.setThumbStyles(this.slider);
										}
									},
									scope : this
								}
							},
							'reset' : {
								iconCls : 'gxp-icon-reset',
								ref : 'btnReset',
								handler : this.control.reset,
								scope : this.control,
								tooltip : this.resetTooltip,
								menuText : this.resetLabel,
								text : (this.labelButtons) ? this.resetLabel
										: false
							},
							'pause' : {
								iconCls : 'gxp-icon-pause',
								ref : 'btnPause',
								handler : this.control.stop,
								scope : this.control,
								tooltip : this.stopTooltip,
								menuText : this.stopLabel,
								text : (this.labelButtons) ? this.stopLabel
										: false,
								toggleGroup : 'timecontrol',
								enableToggle : true,
								allowDepress : false
							},
							'play' : {
								iconCls : 'gxp-icon-play',
								ref : 'btnPlay',
								toggleHandler : this.toggleAnimation,
								scope : this,
								toggleGroup : 'timecontrol',
								enableToggle : true,
								allowDepress : true,
								tooltip : this.playTooltip,
								menuText : this.playLabel,
								text : (this.labelButtons) ? this.playLabel
										: false
							},
							'next' : {
								iconCls : 'gxp-icon-last',
								ref : 'btnNext',
								handler : this.control.tick,
								scope : this.control,
								tooltip : this.nextTooltip,
								menuText : this.nextLabel,
								text : (this.labelButtons) ? this.nextLabel
										: false
							},
							'end' : {
								iconCls : 'gxp-icon-last',
								ref : 'btnEnd',
								handler : this.forwardToEnd,
								scope : this,
								tooltip : this.endTooltip,
								menuText : this.endLabel,
								text : (this.labelButtons) ? this.endLabel
										: false
							},
							'loop' : {
								iconCls : 'gxp-icon-loop',
								ref : 'btnLoop',
								tooltip : this.loopTooltip,
								enableToggle : true,
								allowDepress : true,
								toggleHandler : this.toggleLoopMode,
								scope : this,
								tooltip : this.loopTooltip,
								menuText : this.loopLabel,
								text : (this.labelButtons) ? this.loopLabel
										: false
							},
							'fastforward' : {
								iconCls : 'gxp-icon-ffwd',
								ref : 'btnFastforward',
								tooltip : this.fastforwardTooltip,
								enableToggle : true,
								allowDepress : true,
								toggleHandler : this.toggleDoubleSpeed,
								scope : this,
								disabled : true,
								tooltip : this.fastforwardTooltip,
								menuText : this.fastforwardLabel,
								text : (this.labelButtons) ? this.fastforwardLabel
										: false
							},
							'settings' : {
								iconCls : 'gxp-icon-settings',
								ref : 'btnSettings',
								toggleHandler : this.toggleOptionsWindow,
								scope : this,
								enableToggle : true,
								allowDepress : true,
								tooltip : this.settingsTooltip,
								menuText : this.settingsLabel,
								text : (this.labelButtons) ? this.settingsLabel
										: false
							}
						};
						var actConfigs = this.playbackActions;
						var actions = [];
						for ( var i = 0, len = actConfigs.length; i < len; i++) {
							var cfg = actConfigs[i];
							if (typeof cfg == 'string')
								cfg = actionDefaults[cfg];
							else if (!(Ext.isObject(cfg)
									|| cfg instanceof Ext.Component || cfg instanceof Ext.Action)) {
								console
										.error("playbackActions configurations must be a string, valid action, component, or config");
								cfg = null;
							}
							cfg && actions.push(cfg);
						}
						this.addReconfigListener();
						return actions;
					},
					showTimeDisplay : function(config) {
						if (!config) {
							config = this.timeDisplayConfig;
						}
						Ext.applyIf(config, {
							html : this.control.currentTime
									.format(this.timeFormat)
						});
						this.timeDisplay = this.add(config);
						this.timeDisplay.show();
						this.timeDisplay.el.alignTo(this.slider.getEl(),
								this.timeDisplay.defaultAlign, [ 0, 5 ]);
					},
					buildTimeManager : function() {
						this.controlConfig || (this.controlConfig = {});
						if (this.controlConfig.range
								&& this.controlConfig.range.length) {
							for ( var i = 0; i < this.controlConfig.range.length; i++) {
								var dateString = this.controlConfig.range[i];
								if (dateString.indexOf('T') > -1
										&& dateString.indexOf('Z') == -1) {
									dateString = dateString.substring(0,
											dateString.indexOf('T'));
								}
								this.controlConfig.range[i] = dateString;
							}
						}
						if (this.playbackMode == 'ranged'
								|| this.playbackMode == 'decay') {
							Ext.apply(this.controlConfig, {
								agentOptions : {
									'WMS' : {
										rangeMode : 'range',
										rangeInterval : this.rangedPlayInterval
									},
									'Vector' : {
										rangeMode : 'range',
										rangeInterval : this.rangedPlayInterval
									}
								}
							});
						} else if (this.playbackMode == 'cumulative') {
							Ext.apply(this.controlConfig, {
								agentOptions : {
									'WMS' : {
										rangeMode : 'cumulative'
									},
									'Vector' : {
										rangeMode : 'cumulative'
									}
								}
							});
						}
						var ctl = this.control = new OpenLayers.Control.TimeManager(
								this.controlConfig);
						this.mapPanel.map.addControl(ctl);
						if (ctl.layers) {
							this.fireEvent('rangemodified', this, ctl.range);
						}
						return ctl;
					},
					addReconfigListener : function() {
						this.control.guessPlaybackRate();
						this.control.events
								.register(
										"rangemodified",
										this,
										function() {
											var ctl = this.control;
											if (!ctl.timeAgents
													|| !ctl.timeAgents.length) {
												ctl.map.removeControl(this.ctl);
												ctl.destroy();
												ctl = null;
											} else {
												var oldvals = {
													start : ctl.range[0]
															.getTime(),
													end : ctl.range[1]
															.getTime(),
													resolution : {
														units : ctl.units,
														step : ctl.step
													}
												};
												ctl.guessPlaybackRate();
												if (ctl.range[0].getTime() != oldvals.start
														|| ctl.range[1]
																.getTime() != oldvals.end
														|| ctl.units != oldvals.units
														|| ctl.step != oldvals.step) {
													this
															.reconfigureSlider(this
																	.buildSliderValues());
													if (this.playbackMode == 'ranged'
															|| this.playbackMode == 'decay') {
														this.control
																.incrementTime(
																		this.control.rangeInterval,
																		this.control.units);
													}
													this
															.setThumbStyles(this.slider);
													this.fireEvent(
															'rangemodified',
															this, ctl.range);
												}
											}
										});
					},
					buildSliderValues : function() {
						var indexMap = [ 'primary' ], values = [ this.control.currentTime
								.getTime() ], min = this.control.range[0]
								.getTime(), max = this.control.range[1]
								.getTime(), then = new Date(min), interval;
						if (this.control.units) {
							interval = then['setUTC' + this.control.units]
									(then['getUTC' + this.control.units]()
											+ this.control.step)
									- min;
						} else {
							interval = false;
						}
						if (this.dynamicRange) {
							var rangeAdj = (min - max) * .1;
							values.push(min = min - rangeAdj, max = max
									+ rangeAdj);
							indexMap[1] = 'minTime';
							indexMap[2] = 'maxTime';
						}
						if (this.playbackMode == 'ranged'
								|| this.playbackMode == 'decay') {
							values.push(min);
							indexMap[indexMap.length] = 'tail';
						}
						return {
							'values' : values,
							'map' : indexMap,
							'maxValue' : max,
							'minValue' : min,
							'interval' : interval
						};
					},
					reconfigureSlider : function(sliderInfo) {
						var slider = this.slider;
						slider.setMaxValue(sliderInfo.maxValue);
						slider.setMinValue(sliderInfo.minValue);
						Ext.apply(slider, {
							increment : sliderInfo.interval,
							keyIncrement : sliderInfo.interval,
							indexMap : sliderInfo.map
						});
						for ( var i = 0; i < sliderInfo.values.length; i++) {
							slider.setValue(i, sliderInfo.values[i]);
						}
						if (!sliderInfo.interval && this.control.intervals
								&& this.control.intervals.length > 2) {
							sliderInfo.interval = Math
									.round((sliderInfo.maxValue - sliderInfo.minValue)
											/ this.control.intervals.length);
						}
						this.setTimeFormat(this
								.guessTimeFormat(sliderInfo.interval));
					},
					setThumbStyles : function(slider) {
						tailIndex = slider.indexMap.indexOf('tail');
						if (slider.indexMap[1] == 'min') {
							slider.thumbs[1].el.addClass('x-slider-min-thumb');
							slider.thumbs[2].el.addClass('x-slider-max-thumb');
						}
						if (tailIndex > -1) {
							slider.thumbs[tailIndex].el
									.addClass('x-slider-tail-thumb');
							slider.thumbs[tailIndex].constrain = false;
							slider.thumbs[0].constrain = false;
						}
					},
					forwardToEnd : function(btn) {
						var ctl = this.control;
						ctl.setTime(new Date(ctl.range[(ctl.step < 0) ? 0 : 1]
								.getTime()));
					},
					toggleAnimation : function(btn, pressed) {
						this.control[pressed ? 'play' : 'stop']();
						btn.btnEl.toggleClass('gxp-icon-play').toggleClass(
								'gxp-icon-pause');
						btn.el.removeClass('x-btn-pressed');
						btn.setTooltip(pressed ? this.pauseTooltip
								: this.playTooltip);
						btn.refOwner.btnFastforward[pressed ? 'enable'
								: 'disable']();
						if (this.labelButtons && btn.text)
							btn.setText(pressed ? this.pauseLabel
									: this.playLabel);
					},
					toggleLoopMode : function(btn, pressed) {
						this.control.loop = pressed;
						btn.setTooltip(pressed ? this.normalTooltip
								: this.loopTooltip);
						if (this.labelButtons && btn.text)
							btn.setText(pressed ? this.normalLabel
									: this.loopLabel);
					},
					toggleDoubleSpeed : function(btn, pressed) {
						this.control.frameRate = this.control.frameRate
								* (pressed) ? 2 : 0.5;
						this.control.stop();
						this.control.play();
						btn.setTooltip(pressed ? this.normalTooltip
								: this.fastforwardTooltip);
					},
					toggleOptionsWindow : function(btn, pressed) {
						if (pressed && this.optionsWindow.hidden) {
							if (!this.optionsWindow.optionsPanel.timeManager) {
								this.optionsWindow.optionsPanel.timeManager = this.control;
								this.optionsWindow.optionsPanel.playbackToolbar = this;
							}
							this.optionsWindow.show()
						} else if (!pressed && !this.optionsWindow.hidden) {
							this.optionsWindow.hide()
						}
					},
					updateTimeDisplay : function() {
						this.sliderTip.onSlide(this.slider, null,
								this.slider.thumbs[0]);
						this.sliderTip.el.alignTo(this.slider.el, 'b-t?',
								this.offsets);
					},
					onSliderChangeComplete : function(slider, value, thumb) {
						var slideTime = new Date(value);
						switch (slider.indexMap[thumb.index]) {
						case 'primary':
							if (!this.control.snapToIntervals
									&& this.control.units) {
								this.control.setTime(slideTime);
							} else if (this.control.snapToIntervals
									&& this.control.intervals.length) {
								var targetIndex = Math
										.floor((slideTime - this.control.range[0])
												/ (this.control.range[1] - this.control.range[0])
												* (this.control.intervals.length - 1));
								this.control
										.setTime(this.control.intervals[targetIndex]);
							}
							break;
						case 'min':
							if (value >= this.control.intialRange[0].getTime()) {
								this.control.setStart(new Date(value));
							}
							break;
						case 'max':
							if (value <= this.control.intialRange[1].getTime()) {
								this.control.setEnd(new Date(value));
							}
							break;
						case 'tail':
							var adj = 1;
							switch (this.control.units) {
							case OpenLayers.TimeUnit.YEARS:
								adj *= 12;
							case OpenLayers.TimeUnit.MONTHS:
								adj *= (365 / 12);
							case OpenLayers.TimeUnit.DAYS:
								adj *= 24;
							case OpenLayers.TimeUnit.HOURS:
								adj *= 60;
							case OpenLayers.TimeUnit.MINUTES:
								adj *= 60;
							case OpenLayers.TimeUnit.SECONDS:
								adj *= 1000;
								break;
							}
							this.control.rangeInterval = (slider.thumbs[0].value - value)
									/ adj;
						}
						if (this.restartPlayback) {
							this.restartPlayback = false;
							this.control.play();
						}
					},
					guessTimeFormat : function(increment) {
						if (increment) {
							var resolution = this
									.smartIntervalFormat(increment).units;
							var format = this.timeFormat;
							switch (resolution) {
							case 'Minutes':
								format = 'l, F d, Y g:i A';
								break;
							case 'Hours':
								format = 'l, F d, Y g A';
								break;
							case 'Days':
								format = 'l, F d, Y';
								break;
							case 'Months':
								format = 'F, Y';
								break;
							case 'Years':
								format = 'Y';
								break;
							}
							return format;
						}
					},
					smartIntervalFormat : function(diff) {
						var unitText, diffValue, absDiff = Math.abs(diff);
						if (absDiff < 5e3) {
							unitText = 'Seconds';
							diffValue = (Math.round(diff / 1e2)) / 10;
						} else if (absDiff < 35e5) {
							unitText = 'Minutes';
							diffValue = (Math.round(diff / 6e2)) / 10;
						} else if (absDiff < 828e5) {
							unitText = 'Hours';
							diffValue = (Math.round(diff / 36e4)) / 10;
						} else if (absDiff < 250e7) {
							unitText = 'Days';
							diffValue = (Math.round(diff / 864e4)) / 10;
						} else if (absDiff < 311e8) {
							unitText = 'Months';
							diffValue = (Math.round(diff / 2628e5)) / 10;
						} else {
							unitText = 'Years';
							diffValue = (Math.round(diff / 31536e5)) / 10;
						}
						return {
							units : unitText,
							value : diffValue
						};
					}
				});
Ext.reg('gxp_playbacktoolbar', gxp.PlaybackToolbar);
Ext.namespace("gxp");
gxp.PlaybackOptionsPanel = Ext
		.extend(
				Ext.Panel,
				{
					layout : "fit",
					titleText : "Tarih Ayarları",
					rangeFieldsetText : "Zaman Aralığı",
					animationFieldsetText : "Animasyon Ayarları",
					startText : 'Baslangiç',
					endText : 'Bitiş',
					listOnlyText : 'Sadece tam liste değerleri kullan',
					stepText : 'Animasyon Adımı',
					unitsText : 'Animasyon Birimi',
					noUnitsText : 'Zaman Listesine Yapış',
					loopText : 'Animasyonu tekrar oynat',
					reverseText : 'Animasyonu Ters ilerlet',
					rangeChoiceText : 'Zaman kontrolü için aralık seç',
					rangedPlayChoiceText : 'Çalışma Modu',
					initComponent : function() {
						var config = Ext
								.applyIf(
										this.initialConfig,
										{
											minHeight : 400,
											minWidth : 250,
											ref : 'optionsPanel',
											items : [ {
												xtype : 'form',
												layout : 'form',
												ref : 'form',
												labelWidth : 10,
												defaultType : 'textfield',
												items : [
														{
															xtype : 'fieldset',
															title : this.rangeFieldsetText,
															defaultType : 'datefield',
															labelWidth : 60,
															items : [
																	{
																		xtype : 'displayfield',
																		text : this.rangeChoiceText
																	},
																	{
																		fieldLabel : this.startText,
																		listeners : {
																			'select' : this.setStartTime,
																			scope : this
																		},
																		ref : '../../rangeStartField'
																	},
																	{
																		fieldLabel : this.endText,
																		listeners : {
																			'select' : this.setEndTime,
																			scope : this
																		},
																		ref : '../../rangeEndField'
																	} ]
														},
														{
															xtype : 'fieldset',
															title : this.animationFieldsetText,
															labelWidth : 100,
															items : [
																	{
																		boxLabel : this.listOnlyText,
																		hideLabel : true,
																		xtype : 'checkbox',
																		handler : this.toggleListMode,
																		scope : this,
																		ref : '../../listOnlyCheck'
																	},
																	{
																		fieldLabel : this.stepText,
																		xtype : 'numberfield',
																		listeners : {
																			'select' : this.setStep,
																			scope : this
																		},
																		ref : '../../stepValueField'
																	},
																	{
																		fieldLabel : this.unitsText,
																		xtype : 'combo',
																		anchor : '-5',
																		store : [
																				[
																						OpenLayers.TimeUnit.SECONDS,
																						'Saniye' ],
																				[
																						OpenLayers.TimeUnit.MINUTES,
																						'Dakika' ],
																				[
																						OpenLayers.TimeUnit.HOURS,
																						'Saat' ],
																				[
																						OpenLayers.TimeUnit.DAYS,
																						'Gün' ],
																				[
																						OpenLayers.TimeUnit.MONTHS,
																						"Ay" ],
																				[
																						OpenLayers.TimeUnit.YEARS,
																						'Yıl' ] ],
																		valueNotFoundText : this.noUnitsText,
																		mode : 'local',
																		forceSelection : true,
																		autoSelect : false,
																		editable : false,
																		triggerAction : 'all',
																		listeners : {
																			'select' : this.setUnits,
																			scope : this
																		},
																		ref : '../../stepUnitsField'
																	},
																	{
																		fieldLabel : this.rangedPlayChoiceText,
																		xtype : 'combo',
																		anchor : '-5',
																		mode : 'local',
																		editable : false,
																		forceSelection : true,
																		autoSelect : false,
																		triggerAction : 'all',
																		store : [
																				[
																						false,
																						'Normal' ],
																				[
																						'cumulative',
																						'Kumulatif' ],
																				[
																						'range',
																						'Aralıklı' ] ],
																		listeners : {
																			'select' : this.setPlaybackMode,
																			scope : this
																		},
																		ref : '../../playbackModeField'
																	} ]
														},
														{
															xtype : 'checkbox',
															boxLabel : this.loopText,
															handler : this.setLoopMode,
															scope : this,
															ref : '../loopModeCheck'
														},
														{
															xtype : 'checkbox',
															boxLabel : this.reverseText,
															handler : this.setReverseMode,
															scope : this,
															ref : '../reverseModeCheck'
														} ]
											} ],
											listeners : {
												'show' : this.populateForm,
												scope : this
											},
											bbar : [ {
												text : 'Kaydet',
												handler : this.saveValues,
												scope : this
											}, {
												text : 'İptal',
												handler : this.cancelChanges,
												scope : this
											} ]
										})
						Ext.apply(this, config);
						gxp.PlaybackOptionsPanel.superclass.initComponent
								.call(this);
					},
					destroy : function() {
						this.timeManager = null;
						this.playbackToolbar = null;
						this.un('show', this, this.populateForm);
						gxp.PlaybackOptionsPanel.superclass.destroy.call(this);
					},
					setStartTime : function(cmp, date) {
						this.timeManager.setStart(date);
						if (this.timeManager.currentTime < date) {
							this.timeManager.currentTime = date;
						}
						this.timeManager.fixedRange = true;
					},
					setEndTime : function(cmp, date) {
						this.timeManager.setEnd(date);
						this.timeManager.fixedRange = true;
					},
					toggleListMode : function(cmp, checked) {
						this.stepValueField.setDisabled(checked);
						this.stepUnitsField.setDisabled(checked);
						this.timeManager.snapToIntervals = checked;
					},
					setUnits : function(cmp, record, index) {
						this.timeManager.units = record.get('field1');
					},
					setStep : function(cmp, newVal, oldVal) {
						this.timeManager.step = newVal;
					},
					setPlaybackMode : function(cmp, record, index) {
						var mode = record.get('field1');
						OpenLayers.TimeAgent.prototype.rangeMode = mode;
						switch (mode) {
						case 'cumulative':
							this.playbackToolbar.setPlaybackMode('cumulative');
							break;
						case 'range':
							this.playbackToolbar.setPlaybackMode('ranged');
							if (!this.timeManager.rangeInterval) {
								this.timeManager.rangeInterval = 1;
							}
							break;
						default:
							this.playbackToolbar.setPlaybackMode('track');
							break;
						}
					},
					setLoopMode : function(cmp, checked) {
						this.timeManager.loop = checked;
					},
					setReverseMode : function(cmp, checked) {
						this.timeManager.step *= -1;
					},
					populateForm : function(cmp) {
						if (this.timeManager) {
							this.rangeStartField
									.setValue(this.timeManager.range[0]);
							this.rangeStartField.originalValue = this.timeManager.range[0];
							this.rangeEndField
									.setValue(this.timeManager.range[1]);
							this.rangeEndField.originalValue = this.timeManager.range[1];
							this.stepValueField.setValue(this.timeManager.step);
							this.stepValueField.originalValue = this.timeManager.step;
							this.stepUnitsField
									.setValue(this.timeManager.units);
							this.stepUnitsField.originalValue = this.timeManager.units;
							this.listOnlyCheck
									.setValue(this.timeManager.snapToIntervals);
							this.listOnlyCheck.originalValue = this.timeManager.snapToIntervals;
							this.playbackModeField
									.setValue(OpenLayers.TimeAgent.prototype.rangeMode);
							this.playbackModeField.originalValue = OpenLayers.TimeAgent.prototype.rangeMode;
							this.loopModeCheck.setValue(this.timeManager.loop);
							this.loopModeCheck.originalValue = this.timeManager.loop;
							this.reverseModeCheck
									.setValue(this.timeManager.step < 0);
							this.reverseModeCheck.originalValue = this.reverseModeCheck
									.getValue();
						}
					},
					saveValues : function(btn) {
						if (this.ownerCt && this.ownerCt.close) {
							this.ownerCt[this.ownerCt.closeAction]();
						}
					},
					cancelChanges : function(btn) {
						this.form.getForm().items.each(function(field) {
							field.setValue(field.originalValue);
						})
						this.saveValues();
					}
				})
Ext.reg('gxp_playbackoptions', gxp.PlaybackOptionsPanel);
Ext.namespace("gxp.plugins");
gxp.plugins.Playback = Ext.extend(gxp.plugins.Tool, {
	ptype : "gxp_playback",
	menuText : "Zaman Oynatıcı",
	tooltip : "Zaman Oynatıcı",
	actionTarget : null,
	outputTarget : 'map',
	constructor : function(config) {
		gxp.plugins.Playback.superclass.constructor.apply(this, arguments);
	},
	addOutput : function(config) {
		delete this._ready;
		config = Ext.applyIf(config || this.outputConfig || {}, {
			xtype : 'gxp_playbacktoolbar',
			mapPanel : this.target.mapPanel,
			playbackMode : this.playbackMode,
			optionsWindow : new Ext.Window(
					{
						title : gxp.PlaybackOptionsPanel.prototype.titleText,
						width : 300,
						height : 425,
						layout : 'fit',
						items : [ {
							xtype : 'gxp_playbackoptions'
						} ],
						closeable : true,
						closeAction : 'hide',
						renderTo : Ext.getBody(),
						listeners : {
							'show' : function(cmp) {
								var optsPanel = cmp
										.findByType('gxp_playbackoptions')[0];
								optsPanel.fireEvent('show', optsPanel);
							},
							'hide' : function(cmp) {
								var optsPanel = cmp
										.findByType('gxp_playbackoptions')[0];
								optsPanel.fireEvent('hide', optsPanel);
							}
						}
					})
		});
		var toolbar = gxp.plugins.Playback.superclass.addOutput.call(this,
				config);
		this.relayEvents(toolbar, [ 'timechange', 'rangemodified' ])
		this.playbackToolbar = toolbar;
		if (toolbar.control.layers) {
			this.fireEvent('rangemodified', this, toolbar.control.range);
		}
		return toolbar;
	},
	addActions : function(actions) {
		this._ready = 0;
		this.target.mapPanel.map.events.register('addlayer', this, function(e) {
			var layer = e.layer;
			if (layer instanceof OpenLayers.Layer.WMS && layer.dimensions
					&& layer.dimensions.time) {
				this._ready += 1;
				if (this._ready > 1) {
					this.addOutput();
				}
				if (this.playbackToolbar != null)
					this.playbackToolbar.show();
			}
		});
		this.target.mapPanel.map.events.register('removelayer', this, function(
				e) {
			var layer = e.layer;
			if (this.playbackToolbar != null)
				this.playbackToolbar.hide();
		});
		this.target.on('ready', function() {
			this._ready += 1;
			if (this._ready > 1) {
				this.addOutput();
			}
		}, this);
	},
	setTime : function(time) {
		return this.playbackToolbar.setTime(time);
	},
	getState : function() {
		var config = gxp.plugins.Playback.superclass.getState.call(this);
		var toolbar = this.playbackToolbar;
		if (toolbar) {
			var control = toolbar.control;
			config.outputConfig = Ext.apply(toolbar.initialConfig, {
				dynamicRange : toolbar.dyanamicRange,
				playbackMode : toolbar.playbackMode
			});
			if (control) {
				config.outputConfig.controlConfig = {
					range : (control.fixedRange) ? control.range : undefined,
					step : control.step,
					units : (control.units) ? control.units : undefined,
					loop : control.loop,
					snapToIntervals : control.snapToIntervals
				};
			}
			delete config.outputConfig.mapPanel;
			delete config.outputConfig.optionsWindow;
		}
		return config;
	}
});
Ext.preg(gxp.plugins.Playback.prototype.ptype, gxp.plugins.Playback);
Ext.namespace("gxp");
window.Timeline && window.SimileAjax && (function() {
	Timeline.DefaultEventSource.prototype.remove = function(id) {
		this._events.remove(id);
	};
	SimileAjax.EventIndex.prototype.remove = function(id) {
		var evt = this._idToEvent[id];
		this._events.remove(evt);
		delete this._idToEvent[id];
	};
})();
gxp.TimelinePanel = Ext
		.extend(
				Ext.Panel,
				{
					loadingMessage : "Loading Timeline data...",
					instructionText : "There are too many events to show in the timeline, please zoom in or move the vertical slider down",
					layerCount : 0,
					busyMask : null,
					schemaCache : {},
					maxFeatures : 500,
					bufferFraction : 0.5,
					layout : "border",
					initComponent : function() {
						Timeline.OriginalEventPainter.prototype._showBubble = this.handleEventClick
								.createDelegate(this);
						this.timelineContainer = new Ext.Container({
							region : "center"
						});
						this.eventSource = new Timeline.DefaultEventSource(0);
						this.items = [ {
							region : "west",
							xtype : "container",
							layout : "fit",
							margins : "10 5",
							width : 20,
							items : [ {
								xtype : "slider",
								ref : "../rangeSlider",
								vertical : true,
								value : 25,
								listeners : {
									"changecomplete" : this.onChangeComplete,
									scope : this
								}
							} ]
						}, this.timelineContainer ];
						this.addEvents("change");
						if (this.initialConfig.viewer) {
							delete this.viewer;
							this.bindViewer(this.initialConfig.viewer);
						}
						if (this.initialConfig.featureManager) {
							delete this.featureManager;
							this
									.bindFeatureManager(this.initialConfig.featureManager);
						}
						if (this.initialConfig.playbackTool) {
							delete this.playbackTool;
							this
									.bindPlaybackTool(this.initialConfig.playbackTool);
						}
						gxp.TimelinePanel.superclass.initComponent.call(this);
					},
					onChangeComplete : function(slider, value) {
						if (this.playbackTool) {
							var range = this.playbackTool.playbackToolbar.control.range;
							range = this.calculateNewRange(range, value);
							for ( var key in this.layerLookup) {
								var layer = this.layerLookup[key].layer;
								layer
										&& this.setFilter(key,
												this.createTimeFilter(range,
														key, 0));
							}
							this.updateTimelineEvents({
								force : true
							});
						}
					},
					setLayerVisibility : function(item, checked, record) {
						var keyToMatch = this.getKey(record);
						Ext.apply(this.layerLookup[keyToMatch], {
							visible : checked
						});
						var filterMatcher = function(evt) {
							var key = evt.getProperty('key');
							if (key === keyToMatch) {
								return checked;
							}
						};
						this.timeline.getBand(0).getEventPainter()
								.setFilterMatcher(filterMatcher);
						this.timeline.getBand(1).getEventPainter()
								.setFilterMatcher(filterMatcher);
						this.timeline.paint();
					},
					applyFilter : function(record, filter, checked) {
						var key = this.getKey(record);
						var layer = this.layerLookup[key].layer;
						var filterMatcher = function(evt) {
							var fid = evt.getProperty("fid");
							if (evt.getProperty("key") === key) {
								var feature = layer.getFeatureByFid(fid);
								if (checked === false) {
									return true;
								} else {
									return filter.evaluate(feature);
								}
							} else {
								return true;
							}
						};
						this.timeline.getBand(0).getEventPainter()
								.setFilterMatcher(filterMatcher);
						this.timeline.getBand(1).getEventPainter()
								.setFilterMatcher(filterMatcher);
						this.timeline.paint();
					},
					setTitleAttribute : function(record, titleAttr) {
						var key = this.getKey(record);
						this.layerLookup[key].titleAttr = titleAttr;
						this.clearEventsForKey(key);
						this.onFeaturesAdded({
							features : this.layerLookup[key].layer.features
						}, key);
					},
					handleEventClick : function(x, y, evt) {
						var fid = evt.getProperty("fid");
						var key = evt.getProperty("key");
						var layer = this.layerLookup[key].layer;
						var feature = layer && layer.getFeatureByFid(fid);
						if (feature) {
							var centroid = feature.geometry.getCentroid();
							var map = this.viewer.mapPanel.map;
							this._silentMapMove = true;
							map.setCenter(new OpenLayers.LonLat(centroid.x,
									centroid.y));
							delete this._silentMapMove;
							if (this.popup) {
								this.popup.destroy();
								this.popup = null;
							}
							this.popup = new gxp.FeatureEditPopup({
								feature : feature,
								propertyGridNameText : "Attributes",
								title : evt.getProperty("title"),
								panIn : false,
								width : 200,
								height : 250,
								collapsible : true,
								readOnly : true,
								hideMode : 'offsets'
							});
							this.popup.show();
						}
					},
					bindFeatureManager : function(featureManager) {
						this.featureManager = featureManager;
						this.featureManager.on("layerchange",
								this.onLayerChange, this);
					},
					onLayerChange : function(tool, record, schema) {
						var key = this.getKey(record);
						this.layerLookup[key] = {
							layer : null,
							titleAttr : 'title',
							timeAttr : 'timestamp',
							visible : true
						};
						if (this.featureManager.featureStore) {
							this.featureManager.featureStore.on("write",
									this.onSave
											.createDelegate(this, [ key ], 3),
									this);
						}
					},
					onSave : function(store, action, data, key) {
						if (!this.rendered) {
							return;
						}
						var features = [];
						for ( var i = 0, ii = data.length; i < ii; i++) {
							var feature = data[i].feature;
							features.push(feature);
						}
						this.addFeatures(key, features);
					},
					bindPlaybackTool : function(playbackTool) {
						this.playbackTool = playbackTool;
						this.playbackTool.on("timechange", this.onTimeChange,
								this);
						this.playbackTool.on("rangemodified",
								this.onRangeModify, this);
					},
					onTimeChange : function(toolbar, currentTime) {
						this._silent = true;
						this.setCenterDate(currentTime);
						delete this._silent;
					},
					onRangeModify : function(toolbar, range) {
						this._silent = true;
						this.setRange(range);
						delete this._silent;
					},
					createTimeline : function(range) {
						if (!this.rendered) {
							return;
						}
						var theme = Timeline.ClassicTheme.create();
						var span = range[1] - range[0];
						var years = ((((span / 1000) / 60) / 60) / 24) / 365;
						var intervalUnits = [];
						if (years >= 50) {
							intervalUnits.push(Timeline.DateTime.DECADE);
							intervalUnits.push(Timeline.DateTime.CENTURY);
						} else {
							intervalUnits.push(Timeline.DateTime.YEAR);
							intervalUnits.push(Timeline.DateTime.DECADE);
						}
						var d = new Date(range[0].getTime() + span / 2);
						var bandInfos = [ Timeline.createBandInfo({
							width : "80%",
							intervalUnit : intervalUnits[0],
							intervalPixels : 200,
							eventSource : this.eventSource,
							date : d,
							theme : theme,
							layout : "original"
						}), Timeline.createBandInfo({
							width : "20%",
							intervalUnit : intervalUnits[1],
							intervalPixels : 200,
							eventSource : this.eventSource,
							date : d,
							theme : theme,
							layout : "overview"
						}) ];
						bandInfos[1].syncWith = 0;
						bandInfos[1].highlight = true;
						this.timeline = Timeline.create(
								this.timelineContainer.el.dom, bandInfos,
								Timeline.HORIZONTAL);
						this._silent = true;
						this.timeline.getBand(0).addOnScrollListener(
								this.setPlaybackCenter.createDelegate(this));
					},
					setPlaybackCenter : function(band) {
						var time = band.getCenterVisibleDate();
						this._silent !== true && this.playbackTool
								&& this.playbackTool.setTime(time);
					},
					bindViewer : function(viewer) {
						if (this.viewer) {
							this.unbindViewer();
						}
						this.viewer = viewer;
						this.layerLookup = {};
						var layerStore = viewer.mapPanel.layers;
						if (layerStore.getCount() > 0) {
							this.onLayerStoreAdd(layerStore, layerStore
									.getRange());
						}
						layerStore.on({
							add : this.onLayerStoreAdd,
							scope : this
						});
						viewer.mapPanel.map.events.on({
							moveend : this.onMapMoveEnd,
							scope : this
						});
					},
					unbindViewer : function() {
						var mapPanel = this.viewer.mapPanel;
						if (mapPanel) {
							mapPanel.layers.unregister("add",
									this.onLayerStoreAdd, this);
							mapPanel.map.un({
								moveend : this.onMapMoveEnd,
								scope : this
							});
						}
						delete this.viewer;
						delete this.layerLookup;
						delete this.schemaCache;
					},
					getKey : function(record) {
						return record.get("source") + "/" + record.get("name");
					},
					getTimeAttribute : function(record, protocol, schema) {
						var key = this.getKey(record);
						Ext.Ajax.request({
							method : "GET",
							url : "/maps/time_info.json?",
							params : {
								layer : record.get('name')
							},
							success : function(response) {
								var result = Ext.decode(response.responseText);
								if (result && result.attribute) {
									this.layerLookup[key] = {
										timeAttr : result.attribute,
										visible : true
									};
									this.addVectorLayer(record, protocol,
											schema);
								}
							},
							scope : this
						});
					},
					onLayerStoreAdd : function(store, records) {
						var record;
						for ( var i = 0, ii = records.length; i < ii; ++i) {
							record = records[i];
							var layer = record.getLayer();
							if (layer.dimensions && layer.dimensions.time) {
								var source = this.viewer.getSource(record);
								if (gxp.plugins.WMSSource
										&& (source instanceof gxp.plugins.WMSSource)) {
									source
											.getWFSProtocol(
													record,
													function(protocol, schema,
															record) {
														if (!protocol) {
															throw new Error(
																	"Failed to get protocol for record: "
																			+ record
																					.get("name"));
														}
														this.schemaCache[this
																.getKey(record)] = schema;
														this.getTimeAttribute(
																record,
																protocol,
																schema);
													}, this);
								}
							}
						}
					},
					onLayout : function() {
						gxp.TimelinePanel.superclass.onLayout.call(this,
								arguments);
						if (!this.timeline) {
							if (this.playbackTool
									&& this.playbackTool.playbackToolbar) {
								this
										.setRange(this.playbackTool.playbackToolbar.control.range);
								this
										.setCenterDate(this.playbackTool.playbackToolbar.control.currentTime);
								delete this._silent;
							}
						}
					},
					setRange : function(range) {
						if (!this.timeline) {
							this.createTimeline(range);
						}
						if (this.timeline) {
							var firstBand = this.timeline.getBand(0);
							firstBand.setMinVisibleDate(range[0]);
							firstBand.setMaxVisibleDate(range[1]);
							var secondBand = this.timeline.getBand(1);
							secondBand.getEtherPainter().setHighlight(range[0],
									range[1]);
						}
					},
					setCenterDate : function(time) {
						if (this.timeline) {
							this.timeline.getBand(0).setCenterVisibleDate(time);
							if (this.rangeInfo && this.rangeInfo.current) {
								var currentRange = this.rangeInfo.current;
								var originalRange = this.rangeInfo.original;
								var originalSpan = originalRange[1]
										- originalRange[0];
								var originalCenter = new Date(originalRange[0]
										.getTime()
										+ originalSpan / 2);
								var fractionRange = this.bufferFraction
										* originalSpan;
								var lowerBound = new Date(originalCenter
										.getTime()
										- fractionRange);
								var upperBound = new Date(originalCenter
										.getTime()
										+ fractionRange);
								if (time < lowerBound || time > upperBound) {
									var span = currentRange[1]
											- currentRange[0];
									var start = new Date(time.getTime() - span
											/ 2);
									var end = new Date(time.getTime() + span
											/ 2);
									for ( var key in this.layerLookup) {
										var layer = this.layerLookup[key].layer;
										layer
												&& this.setFilter(key, this
														.createTimeFilter([
																start, end ],
																key, 0));
									}
									this.updateTimelineEvents({
										force : true
									});
								}
							}
						}
					},
					calculateNewRange : function(range, percentage) {
						if (percentage === undefined) {
							percentage = this.rangeSlider.getValue();
						}
						var end = new Date(range[0].getTime()
								+ ((percentage / 100) * (range[1] - range[0])));
						return [ range[0], end ];
					},
					createTimeFilter : function(range, key, fraction) {
						var start = new Date(range[0].getTime() - fraction
								* (range[1] - range[0]));
						var end = new Date(range[1].getTime() + fraction
								* (range[1] - range[0]));
						this.rangeInfo = {
							original : range,
							current : [ start, end ]
						};
						return new OpenLayers.Filter({
							type : OpenLayers.Filter.Comparison.BETWEEN,
							property : this.layerLookup[key].timeAttr,
							lowerBoundary : OpenLayers.Date.toISOString(start),
							upperBoundary : OpenLayers.Date.toISOString(end)
						});
					},
					onLoadStart : function() {
						this.layerCount++;
						if (!this.busyMask) {
							this.busyMask = new Ext.LoadMask(this.bwrap, {
								msg : this.loadingMessage
							});
						}
						this.busyMask.show();
					},
					onLoadEnd : function() {
						this.layerCount--;
						if (this.layerCount === 0) {
							this.busyMask.hide();
						}
					},
					createHitCountProtocol : function(protocolOptions) {
						return new OpenLayers.Protocol.WFS(Ext.apply({
							version : "1.1.0",
							readOptions : {
								output : "object"
							},
							resultType : "hits"
						}, protocolOptions));
					},
					setFilter : function(key, filter) {
						var layer = this.layerLookup[key].layer;
						layer.filter = filter;
					},
					addVectorLayer : function(record, protocol, schema) {
						var key = this.getKey(record);
						var filter = null;
						if (this.playbackTool) {
							var range = this.playbackTool.playbackToolbar.control.range;
							range = this.calculateNewRange(range);
							this
									.setCenterDate(this.playbackTool.playbackToolbar.control.currentTime);
							filter = this.createTimeFilter(range, key,
									this.bufferFraction);
						}
						var layer = new OpenLayers.Layer.Vector(key, {
							strategies : [ new OpenLayers.Strategy.BBOX({
								ratio : 1.5,
								autoActivate : false
							}) ],
							filter : filter,
							protocol : protocol,
							displayInLayerSwitcher : false,
							visibility : false
						});
						layer.events.on({
							loadstart : this.onLoadStart,
							loadend : this.onLoadEnd,
							featuresadded : this.onFeaturesAdded
									.createDelegate(this, [ key ], 1),
							featuresremoved : this.onFeaturesRemoved,
							scope : this
						});
						var titleAttr = null;
						schema.each(function(record) {
							if (record.get("type") === "xsd:string") {
								titleAttr = record.get("name");
								return false;
							}
						});
						Ext.apply(this.layerLookup[key], {
							layer : layer,
							titleAttr : titleAttr,
							hitCount : this
									.createHitCountProtocol(protocol.options)
						});
						this.viewer.mapPanel.map.addLayer(layer);
					},
					onMapMoveEnd : function() {
						this._silentMapMove !== true
								&& this.updateTimelineEvents();
					},
					updateTimelineEvents : function(options) {
						if (!this.rendered) {
							return;
						}
						var dispatchQueue = [];
						var layer, key;
						for (key in this.layerLookup) {
							layer = this.layerLookup[key].layer;
							if (layer && layer.strategies !== null) {
								var protocol = this.layerLookup[key].hitCount;
								var bounds = layer.strategies[0].bounds;
								layer.strategies[0].calculateBounds();
								var filter = new OpenLayers.Filter.Spatial({
									type : OpenLayers.Filter.Spatial.BBOX,
									value : layer.strategies[0].bounds,
									projection : layer.projection
								});
								layer.strategies[0].bounds = bounds;
								if (layer.filter) {
									filter = new OpenLayers.Filter.Logical({
										type : OpenLayers.Filter.Logical.AND,
										filters : [ layer.filter, filter ]
									});
								}
								protocol.filter = protocol.options.filter = filter;
								var func = function(done, storage) {
									this
											.read({
												callback : function(response) {
													if (storage.numberOfFeatures === undefined) {
														storage.numberOfFeatures = 0;
													}
													storage.numberOfFeatures += response.numberOfFeatures;
													done();
												}
											});
								};
								dispatchQueue.push(func
										.createDelegate(protocol));
							}
						}
						gxp.util.dispatch(dispatchQueue, function(storage) {
							if (storage.numberOfFeatures <= this.maxFeatures) {
								this.timelineContainer.el.unmask(true);
								for (key in this.layerLookup) {
									layer = this.layerLookup[key].layer;
									if (layer && layer.strategies !== null) {
										this.clearEventsForKey(key);
										layer.strategies[0].activate();
										layer.strategies[0].update(options);
									}
								}
							} else {
								for (key in this.layerLookup) {
									layer = this.layerLookup[key].layer;
									if (layer && layer.strategies !== null) {
										layer.strategies[0].deactivate();
									}
								}
								this.timelineContainer.el.mask(
										this.instructionText, '');
								this.eventSource.clear();
							}
						}, this);
					},
					clearEventsForKey : function(key) {
						var iterator = this.eventSource.getAllEventIterator();
						var eventIds = [];
						while (iterator.hasNext()) {
							var evt = iterator.next();
							if (evt.getProperty('key') === key) {
								eventIds.push(evt.getID());
							}
						}
						for ( var i = 0, len = eventIds.length; i < len; ++i) {
							this.eventSource.remove(eventIds[i]);
						}
					},
					onFeaturesRemoved : function(event) {
						for ( var i = 0, len = event.features.length; i < len; i++) {
							event.features[i].destroy();
						}
					},
					addFeatures : function(key, features) {
						var titleAttr = this.layerLookup[key].titleAttr;
						var timeAttr = this.layerLookup[key].timeAttr;
						var num = features.length;
						var events = new Array(num);
						var attributes, str;
						for ( var i = 0; i < num; ++i) {
							attributes = features[i].attributes;
							events[i] = {
								start : OpenLayers.Date
										.parse(attributes[timeAttr]),
								title : attributes[titleAttr],
								durationEvent : false,
								key : key,
								fid : features[i].fid
							};
						}
						var feed = {
							dateTimeFormat : "javascriptnative",
							events : events
						};
						this.eventSource.loadJSON(feed, "http://mapstory.org/");
					},
					onFeaturesAdded : function(event, key) {
						var features = event.features;
						this.addFeatures(key, features);
					},
					onResize : function() {
						gxp.TimelinePanel.superclass.onResize.apply(this,
								arguments);
						this.timeline && this.timeline.layout();
					},
					beforeDestroy : function() {
						gxp.TimelinePanel.superclass.beforeDestroy.call(this);
						for ( var key in this.layerLookup) {
							var layer = this.layerLookup[key].layer;
							layer.events.un({
								loadstart : this.onLoadStart,
								loadend : this.onLoadEnd,
								featuresremoved : this.onFeaturesRemoved,
								scope : this
							});
							layer.destroy();
						}
						this.unbindViewer();
						if (this.rendered) {
							Ext.destroy(this.busyMask);
						}
						if (this.timeline) {
							this.timeline.dispose();
							this.timeline = null;
						}
						this.busyMask = null;
					}
				});
Ext.reg("gxp_timelinepanel", gxp.TimelinePanel);
Ext.namespace("gxp.plugins");
gxp.plugins.Timeline = Ext.extend(gxp.plugins.Tool, {
	ptype : "gxp_timeline",
	playbackTool : null,
	featureManager : null,
	menuText : "Timeline",
	tooltip : "Show Timeline",
	actionTarget : null,
	constructor : function(config) {
		gxp.plugins.Timeline.superclass.constructor.apply(this, arguments);
		if (!this.outputConfig) {
			this.outputConfig = {};
		}
		Ext.applyIf(this.outputConfig, {
			title : this.menuText
		});
	},
	addActions : function() {
		var actions = [ {
			menuText : this.menuText,
			tooltip : this.tooltip,
			handler : function() {
				this.addOutput();
			},
			scope : this
		} ];
		return gxp.plugins.Timeline.superclass.addActions.apply(this,
				[ actions ]);
	},
	addOutput : function(config) {
		return gxp.plugins.Timeline.superclass.addOutput.call(this, Ext.apply({
			xtype : "gxp_timelinepanel",
			viewer : this.target,
			featureManager : this.target.tools[this.featureManager],
			playbackTool : this.target.tools[this.playbackTool]
		}, config));
	},
	getTimelinePanel : function() {
		return this.output[0];
	}
});
Ext.preg(gxp.plugins.Timeline.prototype.ptype, gxp.plugins.Timeline);
Ext.namespace("gxp.form");
gxp.form.FilterField = Ext
		.extend(
				Ext.form.CompositeField,
				{
					lowerBoundaryTip : "lower boundary",
					upperBoundaryTip : "upper boundary",
					filter : null,
					attributes : null,
					attributesComboConfig : null,
					initComponent : function() {
						if (!this.filter) {
							this.filter = this.createDefaultFilter();
						}
						var mode = "remote", attributes = new GeoExt.data.AttributeStore();
						if (this.attributes) {
							if (this.attributes.getCount() != 0) {
								mode = "local";
								this.attributes
										.each(function(r) {
											var match = /gml:((Multi)?(Point|Line|Polygon|Curve|Surface|Geometry)).*/
													.exec(r.get("type"));
											match || attributes.add([ r ]);
										});
							} else {
								attributes = this.attributes;
							}
						}
						var defAttributesComboConfig = {
							xtype : "combo",
							store : attributes,
							editable : mode == "local",
							typeAhead : true,
							forceSelection : true,
							mode : mode,
							triggerAction : "all",
							allowBlank : this.allowBlank,
							displayField : "name",
							valueField : "name",
							value : this.filter.property,
							listeners : {
								select : function(combo, record) {
									this.items.get(1).enable();
									this.filter.property = record.get("name");
									this.fireEvent("change", this.filter, this);
								},
								"blur" : function(combo) {
									var index = combo.store.findExact("name",
											combo.getValue());
									if (index != -1) {
										combo.fireEvent("select", combo,
												combo.store.getAt(index));
									} else if (combo.startValue != null) {
										combo.setValue(combo.startValue);
									}
								},
								scope : this
							},
							width : 120
						};
						this.attributesComboConfig = this.attributesComboConfig
								|| {};
						Ext.applyIf(this.attributesComboConfig,
								defAttributesComboConfig);
						this.items = this.createFilterItems();
						this.addEvents("change");
						gxp.form.FilterField.superclass.initComponent
								.call(this);
					},
					validateValue : function(value, preventMark) {
						if (this.filter.type === OpenLayers.Filter.Comparison.BETWEEN) {
							return (this.filter.property !== null
									&& this.filter.upperBoundary !== null && this.filter.lowerBoundary !== null);
						} else {
							return (this.filter.property !== null
									&& this.filter.value !== null && this.filter.type !== null);
						}
					},
					createDefaultFilter : function() {
						return new OpenLayers.Filter.Comparison();
					},
					createFilterItems : function() {
						var isBetween = this.filter.type === OpenLayers.Filter.Comparison.BETWEEN;
						return [
								this.attributesComboConfig,
								Ext.applyIf({
									xtype : "gxp_comparisoncombo",
									disabled : this.filter.property == null,
									allowBlank : this.allowBlank,
									value : this.filter.type,
									listeners : {
										select : function(combo, record) {
											this.items.get(2).enable();
											this.items.get(3).enable();
											this.items.get(4).enable();
											this.setFilterType(record
													.get("value"));
											this.fireEvent("change",
													this.filter, this);
										},
										scope : this
									}
								}, this.comparisonComboConfig),
								{
									xtype : "textfield",
									disabled : this.filter.type == null,
									hidden : isBetween,
									value : this.filter.value,
									width : 50,
									grow : true,
									growMin : 50,
									anchor : "100%",
									allowBlank : this.allowBlank,
									listeners : {
										"change" : function(field, value) {
											this.filter.value = value;
											this.fireEvent("change",
													this.filter, this);
										},
										scope : this
									}
								},
								{
									xtype : "textfield",
									disabled : this.filter.type == null,
									hidden : !isBetween,
									value : this.filter.lowerBoundary,
									tooltip : this.lowerBoundaryTip,
									grow : true,
									growMin : 30,
									anchor : "100%",
									allowBlank : this.allowBlank,
									listeners : {
										"change" : function(field, value) {
											this.filter.lowerBoundary = value;
											this.fireEvent("change",
													this.filter, this);
										},
										"render" : function(c) {
											Ext.QuickTips.register({
												target : c.getEl(),
												text : this.lowerBoundaryTip
											});
										},
										"autosize" : function(field, width) {
											field.setWidth(width);
											field.ownerCt.doLayout();
										},
										scope : this
									}
								},
								{
									xtype : "textfield",
									disabled : this.filter.type == null,
									hidden : !isBetween,
									grow : true,
									growMin : 30,
									value : this.filter.upperBoundary,
									allowBlank : this.allowBlank,
									listeners : {
										"change" : function(field, value) {
											this.filter.upperBoundary = value;
											this.fireEvent("change",
													this.filter, this);
										},
										"render" : function(c) {
											Ext.QuickTips.register({
												target : c.getEl(),
												text : this.upperBoundaryTip
											});
										},
										scope : this
									}
								} ];
					},
					setFilterType : function(type) {
						this.filter.type = type;
						if (type === OpenLayers.Filter.Comparison.BETWEEN) {
							this.items.get(2).hide();
							this.items.get(3).show();
							this.items.get(4).show();
						} else {
							this.items.get(2).show();
							this.items.get(3).hide();
							this.items.get(4).hide();
						}
						this.doLayout();
					}
				});
Ext.reg('gxp_filterfield', gxp.form.FilterField);
Ext.namespace("gxp.menu");
gxp.menu.TimelineMenu = Ext
		.extend(
				Ext.menu.Menu,
				{
					filterLabel : "Filter",
					attributeLabel : "Label",
					layers : null,
					subMenuSize : [ 350, 60 ],
					initComponent : function() {
						gxp.menu.TimelineMenu.superclass.initComponent.apply(
								this, arguments);
						this.timelinePanel = this.timelineTool
								&& this.timelineTool.getTimelinePanel();
						this.layers.on("add", this.onLayerAdd, this);
						this.onLayerAdd();
					},
					onRender : function(ct, position) {
						gxp.menu.TimelineMenu.superclass.onRender.apply(this,
								arguments);
					},
					beforeDestroy : function() {
						if (this.layers && this.layers.on) {
							this.layers.un("add", this.onLayerAdd, this);
						}
						delete this.layers;
						gxp.menu.TimelineMenu.superclass.beforeDestroy.apply(
								this, arguments);
					},
					onLayerAdd : function() {
						this.removeAll();
						this.layers
								.each(
										function(record) {
											var layer = record.getLayer();
											if (layer.displayInLayerSwitcher) {
												var key = this.timelinePanel
														.getKey(record);
												var schema = this.timelinePanel.schemaCache[key];
												var item = new Ext.menu.CheckItem(
														{
															text : record
																	.get("title"),
															checked : (this.timelinePanel.layerLookup[key] && this.timelinePanel.layerLookup[key].visible) || true,
															menu : new Ext.menu.Menu(
																	{
																		plain : true,
																		style : {
																			overflow : 'visible'
																		},
																		showSeparator : false,
																		items : [ {
																			xtype : 'container',
																			width : this.subMenuSize[0],
																			height : this.subMenuSize[1],
																			layout : 'vbox',
																			defaults : {
																				border : false
																			},
																			layoutConfig : {
																				align : 'stretch',
																				pack : 'start'
																			},
																			items : [
																					{
																						xtype : 'form',
																						labelWidth : 75,
																						height : 30,
																						items : [ {
																							xtype : 'combo',
																							forceSelection : true,
																							getListParent : function() {
																								return this.el
																										.up('.x-menu');
																							},
																							store : schema,
																							mode : 'local',
																							triggerAction : 'all',
																							value : this.timelinePanel.layerLookup[key] ? this.timelinePanel.layerLookup[key].titleAttr
																									: null,
																							listeners : {
																								"select" : function(
																										combo) {
																									this.timelinePanel
																											.setTitleAttribute(
																													record,
																													combo
																															.getValue());
																								},
																								scope : this
																							},
																							displayField : "name",
																							valueField : "name",
																							fieldLabel : this.attributeLabel
																						} ]
																					},
																					{
																						xtype : 'container',
																						layout : 'hbox',
																						id : 'gxp_timemenufilter',
																						layoutConfig : {
																							align : 'stretch',
																							pack : 'start'
																						},
																						defaults : {
																							border : false
																						},
																						items : [
																								{
																									width : 25,
																									xtype : 'container',
																									layout : 'fit',
																									items : [ {
																										xtype : 'checkbox',
																										ref : "../applyFilter",
																										listeners : {
																											'check' : function(
																													cb,
																													checked) {
																												var field = Ext
																														.getCmp('gxp_timemenufilter').filter;
																												if (field
																														.isValid()) {
																													this.timelinePanel
																															.applyFilter(
																																	record,
																																	field.filter,
																																	checked);
																												}
																											},
																											scope : this
																										}
																									} ]
																								},
																								{
																									flex : 1,
																									xtype : 'form',
																									labelWidth : 75,
																									items : [ {
																										xtype : "gxp_filterfield",
																										ref : "../filter",
																										listeners : {
																											'change' : function(
																													filter,
																													field) {
																												if (field
																														.isValid()) {
																													this.timelinePanel
																															.applyFilter(
																																	record,
																																	filter,
																																	Ext
																																			.getCmp('gxp_timemenufilter').applyFilter
																																			.getValue());
																												}
																											},
																											scope : this
																										},
																										attributesComboConfig : {
																											getListParent : function() {
																												return this.el
																														.up('.x-menu');
																											}
																										},
																										comparisonComboConfig : {
																											getListParent : function() {
																												return this.el
																														.up('.x-menu');
																											}
																										},
																										fieldLabel : this.filterLabel,
																										attributes : schema
																									} ]
																								} ],
																						height : 30
																					} ]
																		} ]
																	}),
															listeners : {
																checkchange : function(
																		item,
																		checked) {
																	this.timelinePanel
																			.setLayerVisibility(
																					item,
																					checked,
																					record);
																},
																scope : this
															}
														});
												this.add(item);
											}
										}, this);
					}
				});
Ext.reg('gxp_timelinemenu', gxp.menu.TimelineMenu);
Ext.namespace("gxp.plugins");
gxp.plugins.TimelineLayers = Ext.extend(gxp.plugins.Tool, {
	ptype : "gxp_timelinelayers",
	menuText : "Layers",
	addActions : function() {
		var timelineTool = this.target.tools[this.timelineTool];
		var actions = gxp.plugins.TimelineLayers.superclass.addActions.apply(
				this, [ {
					text : this.menuText,
					iconCls : "gxp-icon-layer-switcher",
					menu : new gxp.menu.TimelineMenu({
						layers : this.target.mapPanel.layers,
						timelineTool : timelineTool
					})
				} ]);
		return actions;
	}
});
Ext
		.preg(gxp.plugins.TimelineLayers.prototype.ptype,
				gxp.plugins.TimelineLayers);
Ext.namespace("gxp.form");
gxp.form.ComparisonComboBox = Ext
		.extend(
				Ext.form.ComboBox,
				{
					allowedTypes : [
							[ OpenLayers.Filter.Comparison.EQUAL_TO, "=" ],
							[ OpenLayers.Filter.Comparison.NOT_EQUAL_TO, "<>" ],
							[ OpenLayers.Filter.Comparison.LESS_THAN, "<" ],
							[ OpenLayers.Filter.Comparison.GREATER_THAN, ">" ],
							[
									OpenLayers.Filter.Comparison.LESS_THAN_OR_EQUAL_TO,
									"<=" ],
							[
									OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO,
									">=" ],
							[ OpenLayers.Filter.Comparison.LIKE, "like" ],
							[ OpenLayers.Filter.Comparison.BETWEEN, "between" ] ],
					allowBlank : false,
					mode : "local",
					typeAhead : true,
					forceSelection : true,
					triggerAction : "all",
					width : 50,
					editable : true,
					initComponent : function() {
						var defConfig = {
							displayField : "name",
							valueField : "value",
							store : new Ext.data.SimpleStore({
								data : this.allowedTypes,
								fields : [ "value", "name" ]
							}),
							value : (this.value === undefined) ? this.allowedTypes[0][0]
									: this.value,
							listeners : {
								"blur" : function() {
									var index = this.store.findExact("value",
											this.getValue());
									if (index != -1) {
										this.fireEvent("select", this,
												this.store.getAt(index));
									} else if (this.startValue != null) {
										this.setValue(this.startValue);
									}
								}
							}
						};
						Ext.applyIf(this, defConfig);
						gxp.form.ComparisonComboBox.superclass.initComponent
								.call(this);
					}
				});
Ext.reg("gxp_comparisoncombo", gxp.form.ComparisonComboBox);
GeoExt.Lang
		.add(
				"tr",
				{
					"gxp.menu.LayerMenu.prototype" : {
						layerText : "Katman"
					},
					"gxp.plugins.AddLayers.prototype" : {
						addActionMenuText : "Katman Ekle",
						addActionTip : "Katman Ekle",
						addServerText : "Yeni Server Ekle",
						addButtonText : "Katman Ekle",
						untitledText : "İsimsiz",
						addLayerSourceErrorText : "Wms özellikleri gösterilirken hata oluştu ({msg}).\nLütfen Url'yi kontrol ederek, tekrer deneyiniz.",
						availableLayersText : "Erisilebilir Katmanlar",
						expanderTemplateText : "<p><b>Amaç:</b> {abstract}</p>",
						panelTitleText : "İsim",
						layerSelectionText : "Erişilebilir veriler :",
						doneText : "Tamam",
						uploadText : "Veri Yukle"
					},
					"gxp.plugins.BingSource.prototype" : {
						title : "Bing Katmanları",
						roadTitle : "Bing Harita",
						aerialTitle : "Bing Uydu",
						labeledAerialTitle : "Bing Uydu(Etiketli)"
					},
					"gxp.plugins.FeatureEditor.prototype" : {
						createFeatureActionTip : "Yeni Nesne Oluştur",
						editFeatureActionTip : "Nesne Düzenle"
					},
					"gxp.plugins.FeatureGrid.prototype" : {
						displayFeatureText : "Display on map",
						firstPageTip : "First page",
						previousPageTip : "Previous page",
						zoomPageExtentTip : "Zoom to page extent",
						nextPageTip : "Next page",
						nextPageTip : "Last page",
						totalMsg : "Total: {0} records"
					},
					"gxp.plugins.GoogleEarth.prototype" : {
						apiKeyPrompt : "Please enter the Google API key for ",
						menuText : "3D Görüntüleyici",
						tooltip : "3D Google Görüntüleyici"
					},
					"gxp.plugins.GoogleSource.prototype" : {
						title : "Google Katmanları",
						roadmapAbstract : "Google Haritaları",
						satelliteAbstract : "Google Uydu Görüntüleri",
						hybridAbstract : "Google Hibrid",
						terrainAbstract : "Google Topografik"
					},
					"gxp.plugins.LayerProperties.prototype" : {
						menuText : "Katman Özellikleri",
						toolTip : "Katman Özellikleri"
					},
					"gxp.plugins.LayerTree.prototype" : {
						rootNodeText : "Katmanlar",
						overlayNodeText : "Katmanlar",
						baseNodeText : "Harita Altlıkları"
					},
					"gxp.plugins.Legend.prototype" : {
						menuText : "Lejand",
						tooltip : "Lejand"
					},
					"gxp.plugins.LoadingIndicator.prototype" : {
						loadingMapMessage : "Harita Yükleniyor..."
					},
					"gxp.plugins.MapBoxSource.prototype" : {
						title : "MapBox Katmanları",
						blueMarbleTopoBathyJanTitle : "Blue Marble Topography & Bathymetry (January)",
						blueMarbleTopoBathyJulTitle : "Blue Marble Topography & Bathymetry (July)",
						blueMarbleTopoJanTitle : "Blue Marble Topography (January)",
						blueMarbleTopoJulTitle : "Blue Marble Topography (July)",
						controlRoomTitle : "Control Room",
						geographyClassTitle : "Geography Class",
						naturalEarthHypsoTitle : "Natural Earth Hypsometric",
						naturalEarthHypsoBathyTitle : "Natural Earth Hypsometric & Bathymetry",
						naturalEarth1Title : "Natural Earth I",
						naturalEarth2Title : "Natural Earth II",
						worldDarkTitle : "World Dark",
						worldLightTitle : "World Light",
						worldPrintTitle : "World Print"
					},
					"gxp.plugins.Measure.prototype" : {
						lengthMenuText : "Uzunluk",
						areaMenuText : "Alan",
						lengthTooltip : "Uzunluk",
						areaTooltip : "Alan",
						measureTooltip : "Ölçü"
					},
					"gxp.plugins.Navigation.prototype" : {
						menuText : "Haritayı Kaydır",
						tooltip : "Haritayı Kaydır"
					},
					"gxp.plugins.NavigationHistory.prototype" : {
						previousMenuText : "Önceki Görünüme Git",
						nextMenuText : "Sonraki Görünüme Git",
						previousTooltip : "Önceki Görünüme Git",
						nextTooltip : "Sonraki Görünüme Git"
					},
					"gxp.plugins.OSMSource.prototype" : {
						title : "OpenStreetMap Katmanları",
						mapnikAttribution : "Data CC-By-SA by <a href='http://openstreetmap.org/'>OpenStreetMap</a>",
						osmarenderAttribution : "Data CC-By-SA by <a href='http://openstreetmap.org/'>OpenStreetMap</a>"
					},
					"gxp.plugins.Print.prototype" : {
						menuText : "Harita Yazdır",
						tooltip : "Harita Yazdır",
						previewText : "Yazdır Önizleme",
						notAllNotPrintableText : "Bütün katmanlar yazdırılamadı",
						nonePrintableText : "Harita üzerindeki katmanların hiçbiri yazdırılamadı."
					},
					"gxp.plugins.MapQuestSource.prototype" : {
						title : "MapQuest Katmanları",
						osmAttribution : "Tiles Courtesy of <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
						osmTitle : "MapQuest OpenStreetMap",
						naipAttribution : "Tiles Courtesy of <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
						naipTitle : "MapQuest Imagery"
					},
					"gxp.plugins.QueryForm.prototype" : {
						queryActionText : "Sorgu",
						queryMenuText : "Katman Sorgu",
						queryActionTip : "Seçili katmanı sorgula",
						queryByLocationText : "Mekansal sorgu",
						currentTextText : "Şimdiki mekansal konum",
						queryByAttributesText : "Veritabanı alanı ile sorgula",
						queryMsg : "Sorgulanıyor...",
						cancelButtonText : "İptal",
						noFeaturesTitle : "Benzer yok",
						noFeaturesMessage : "Sorgu sonucu, kayıt bulunamadı."
					},
					"gxp.plugins.RemoveLayer.prototype" : {
						removeMenuText : "Katmanı kaldır",
						removeActionTip : "Katmanı kaldır"
					},
					"gxp.plugins.Styler.prototype" : {
						menuText : "Sembol Düzenle",
						tooltip : "Sembol Düzenle"
					},
					"gxp.plugins.WMSGetFeatureInfo.prototype" : {
						infoActionTip : "Nense Bilgisini Al",
						popupTitle : "Nense Bilgisini Al"
					},
					"gxp.plugins.Zoom.prototype" : {
						zoomInMenuText : "Yaklaş",
						zoomOutMenuText : "Uzaklaş",
						zoomInTooltip : "Yaklaş",
						zoomOutTooltip : "Uzaklaş"
					},
					"gxp.plugins.ZoomToExtent.prototype" : {
						menuText : "Harita Maksimum Extent'e git",
						tooltip : "Harita Maksimum Extent'e git"
					},
					"gxp.plugins.ZoomToDataExtent.prototype" : {
						menuText : "Katmana Yaklaş",
						tooltip : "Katmana Yaklaş"
					},
					"gxp.plugins.ZoomToLayerExtent.prototype" : {
						menuText : "Katmana Yaklaş",
						tooltip : "Katmana Yaklaş"
					},
					"gxp.plugins.ZoomToSelectedFeatures.prototype" : {
						menuText : "Seçili nesnelere git",
						tooltip : "Seçili nesnelere git"
					},
					"gxp.FeatureEditPopup.prototype" : {
						closeMsgTitle : "Değişiklikleri kaydet?",
						closeMsg : "Bu nesne değişikliğe uğramış, değişiklikleri kaydetmek istiyormusunuz?",
						deleteMsgTitle : "Nesneyi sil?",
						deleteMsg : "Bu nesneyi silmek istediğinize eminmisiniz?",
						editButtonText : "Düzenle",
						editButtonTooltip : "Bu nesneyi düzenle",
						deleteButtonText : "Sil",
						deleteButtonTooltip : "Bu nesneyi sil",
						cancelButtonText : "İptal",
						cancelButtonTooltip : "Düzenlemeyi durdur, değişiklikleri iptal et",
						saveButtonText : "Kaydet",
						saveButtonTooltip : "Değişiklikleri kaydet"
					},
					"gxp.FillSymbolizer.prototype" : {
						fillText : "Dolgu",
						colorText : "Renk",
						opacityText : "Saydamlık"
					},
					"gxp.FilterBuilder.prototype" : {
						builderTypeNames : [ "any", "all", "none", "not all" ],
						preComboText : "Match",
						postComboText : "of the following:",
						addConditionText : "add condition",
						addGroupText : "add group",
						removeConditionText : "remove condition"
					},
					"gxp.grid.CapabilitiesGrid.prototype" : {
						nameHeaderText : "Adı",
						titleHeaderText : "Baslığı",
						queryableHeaderText : "Sorgulanabilir",
						layerSelectionLabel : "Görüntülenen veriler :",
						layerAdditionLabel : "yada yeni server ekle.",
						expanderTemplateText : "<p><b>Amaç:</b> {abstract}</p>"
					},
					"gxp.PointSymbolizer.prototype" : {
						graphicCircleText : "çember",
						graphicSquareText : "kare",
						graphicTriangleText : "üçgen",
						graphicStarText : "yıldız",
						graphicCrossText : "çarpı",
						graphicXText : "x",
						graphicExternalText : "harici",
						urlText : "URL",
						opacityText : "saydamlık",
						symbolText : "Sembol",
						sizeText : "Ölçü",
						rotationText : "Döndür"
					},
					"gxp.QueryPanel.prototype" : {
						queryByLocationText : "Mekansal Sorgu",
						currentTextText : "Şimdiki mekansal konum",
						queryByAttributesText : "Veritabanı alanı ile sorgula",
						layerText : "Katman"
					},
					"gxp.RulePanel.prototype" : {
						scaleSliderTemplate : "{scaleType} Ölcek 1:{scale}",
						labelFeaturesText : "Etiket Nesneleri",
						labelsText : "Etiketler",
						basicText : "Basit",
						advancedText : "Gelişmiş",
						limitByScaleText : "Ölçek ile sınırlandır",
						limitByConditionText : "Koşul ile sınırlandır",
						symbolText : "Sembol",
						nameText : "Adı"
					},
					"gxp.ScaleLimitPanel.prototype" : {
						scaleSliderTemplate : "{scaleType} Ölçek 1:{scale}",
						minScaleLimitText : "Minimum ölçek limiti",
						maxScaleLimitText : "Maksimum ölçek limiti"
					},
					"gxp.StrokeSymbolizer.prototype" : {
						solidStrokeName : "solid",
						dashStrokeName : "dash",
						dotStrokeName : "dot",
						titleText : "Çizgi",
						styleText : "Sembol",
						colorText : "Renk",
						widthText : "Genişlik",
						opacityText : "Saydamlık"
					},
					"gxp.StylePropertiesDialog.prototype" : {
						titleText : "Genel",
						nameFieldText : "İsim",
						titleFieldText : "Başlık",
						abstractFieldText : "Amaç"
					},
					"gxp.TextSymbolizer.prototype" : {
						labelValuesText : "Etiket değerleri",
						haloText : "Halo",
						sizeText : "Boyut"
					},
					"gxp.WMSLayerPanel.prototype" : {
						aboutText : "Hakkında",
						titleText : "Başlık",
						nameText : "Adı",
						descriptionText : "Tanımı",
						displayText : "Görünüm",
						opacityText : "Saydamlık",
						formatText : "Format",
						transparentText : "Transparan",
						cacheText : "Cache",
						cacheFieldText : "Cache versiyonunu kullan",
						stylesText : "Semboller",
						infoFormatText : "Bilgi Formatı",
						infoFormatEmptyText : "Format Seçimi"
					},
					"gxp.EmbedMapDialog.prototype" : {
						publishMessage : "Your map is ready to be published to the web! Simply copy the following HTML to embed the map in your website:",
						heightLabel : 'Height',
						widthLabel : 'Width',
						mapSizeLabel : 'Map Size',
						miniSizeLabel : 'Mini',
						smallSizeLabel : 'Small',
						premiumSizeLabel : 'Premium',
						largeSizeLabel : 'Large'
					},
					"gxp.WMSStylesDialog.prototype" : {
						addStyleText : "Ekle",
						addStyleTip : "Yeni sembol ekle",
						chooseStyleText : "Sembol Seç",
						deleteStyleText : "Kaldır",
						deleteStyleTip : "Seçilen sembolü sil",
						editStyleText : "Düzenle",
						editStyleTip : "Seçilen sembolü düzenle",
						duplicateStyleText : "Kopyala",
						duplicateStyleTip : "Seçilen sembolün kopyasını oluştur",
						addRuleText : "Ekle",
						addRuleTip : "Yeni Kural Ekle",
						newRuleText : "Yeni Kural",
						deleteRuleText : "Kaldır",
						deleteRuleTip : "Seçili kuralı sil",
						editRuleText : "Düzenle",
						editRuleTip : "Seçili kuralı düzenle",
						duplicateRuleText : "Kopyala",
						duplicateRuleTip : "Seçilen kuralın kopyasını oluştur",
						cancelText : "İptal",
						saveText : "Kaydet",
						styleWindowTitle : "Kullanıcı Sembol'u: {0}",
						ruleWindowTitle : "Sembol Kuralı: {0}",
						stylesFieldsetTitle : "Semboller",
						rulesFieldsetTitle : "Kurallar"
					},
					"gxp.LayerUploadPanel.prototype" : {
						titleLabel : "Title",
						titleEmptyText : "Layer title",
						abstractLabel : "Description",
						abstractEmptyText : "Layer description",
						fileLabel : "Data",
						fieldEmptyText : "Browse for data archive...",
						uploadText : "Upload",
						waitMsgText : "Uploading your data...",
						invalidFileExtensionText : "File extension must be one of: ",
						optionsText : "Options",
						workspaceLabel : "Workspace",
						workspaceEmptyText : "Default workspace",
						dataStoreLabel : "Store",
						dataStoreEmptyText : "Default datastore"
					},
					"gxp.NewSourceWindow.prototype" : {
						title : "Yeni Server Ekle...",
						cancelText : "İptal",
						addServerText : "Server Ekle",
						invalidURLText : "WMS son noktası olarak, doğru URL giriniz (örneğin- http://example.com/geoserver/wms)",
						contactingServerText : "Server'a bağlanılıyor..."
					},
					"gxp.ScaleOverlay.prototype" : {
						zoomLevelText : "Ölçek seviyesi"
					}
				});