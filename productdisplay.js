//-----------------------------------------------------------------
// Licensed Materials - Property of IBM
//
// WebSphere Commerce
//
// (C) Copyright IBM Corp. 2013, 2016 All Rights Reserved.
//
// US Government Users Restricted Rights - Use, duplication or
// disclosure restricted by GSA ADP Schedule Contract with
// IBM Corp.
//-----------------------------------------------------------------

productDisplayJS={

	/** The language ID currently in use **/
	langId: "-1",
	
	/** The store ID currently in use **/
	storeId: "",
	
	/** The catalog ID currently in use **/
	catalogId: "",
	
	/** Holds the current user type such as guest or registered user. Allowed values are 'G' for guest and 'R' for registered.**/
	userType:"",
	
	/** A boolean used in a variety of the add to cart methods to tell whether or not the base item was added to the cart. **/
	baseItemAddedToCart:false,
	
	/** An array of entitled items which is used in various methods throughout ShoppingActions.js **/
	entitledItems:[],
	
	/** a JSON object that holds attributes of an entitled item **/
    entitledItemJsonObject: null,
	
	/** A map of attribute name value pairs for the currently selected attribute values **/
	selectedAttributesList: new Object(),
	
	/** A map of currently selected attribute values for a catalog entry **/
	selectedAttributeValues: new Object(),
	
	/** A map of HTML element ids associated with an attribute name **/
	registeredAttributeIds: new Object(),
	
	/** A variable used to form the url dynamically for the more info link in the Quickinfo popup */
	moreInfoUrl :"",
	
	/**
	* A boolean used to to determine is it from a Qick info popup or not. 
	**/
	isPopup : false,
	
	/**
	* A boolean used to to determine whether or not to display the price range when the catEntry is selected. 
	**/
	displayPriceRange : true,

	/**
	* This array holds the json object returned from the service, holding the price information of the catEntry.
	**/
	itemPriceJsonOject : [],
	allItemPricesOject : [],
	
	/** 
	* stores all name and value of all swatches 
	* this is a 2 dimension array and each record i contains the following information:
	* allSwatchesArray[i][0] - attribute name of the swatch
	* allSwatchesArray[i][1] - attribute value of the swatch
	* allSwatchesArray[i][2] - image1 of swatch (image to use for enabled state)
	* allSwatchesArray[i][3] - image2 of swatch (image to use for disabled state)
	* allSwatchesArray[i][4] - onclick action of the swatch when enabled
	**/
	allSwatchesArrayList : new Object(),
	
	/**
	* stores all name and id of all dropdowns 
	**/
	allDropdownsList : new Object(),

	/**
	* Holds the ID of the image used for swatch
	**/
	skuImageId:"",
	
	/**
	 * The prefix of the cookie key that is used to store item IDs. 
	 */
	cookieKeyPrefix: "CompareItems_",
	
	/**
	 * The delimiter used to separate item IDs in the cookie.
	 */
	cookieDelimiter: ";",
	
	/**
	 * The maximum number of items allowed in the compare zone. 
	 */
	maxNumberProductsAllowedToCompare: 4,
	
	/**
	 * The minimum number of items allowed in the compare zone. 
	 */
	minNumberProductsAllowedToCompare: 2,
	
	/**
	 * Id of the base catalog entry. 
	 */
	baseCatalogEntryId: 0,

	/**
	 * An map which holds the attributes of a set of products
	 */
	selectedProducts: new Object(),
	
	/**
	 * An array to keep the quantity of the products in a list (bundle)
	 */
	productList: new Object(),
	
	/**
	 * stores the currency symbol
	 */
	currencySymbol: "",
	
	/**
	 * stores the compare return page name
	 */
	compareReturnName: "",
	/**
	 * stores the search term
	 */
	searchTerm: "",
	
	search01: "'",

	/**
	 * Variable for repeat delivery
	 *
	 */

	isRepeatDeliveryProduct: false,

	selectedCatalogEntryId:"",
	search02: '"',
	
	replaceStr01: /\\\'/g,
	
	replaceStr02: /\\\"/g,
	
	ampersandChar: /&/g,
	
	ampersandEntityName: "&amp;" ,
	
	singleSKUProductWithoutDefiningAttribute: false,

	replaceStr001: "&#039;",
	replaceStr002: "&#034;",
	
	canSwapProductPriceDiv: true,
	
	setCommonParameters:function(langId,storeId,catalogId,userType,currencySymbol){
		productDisplayJS.langId = langId;
		productDisplayJS.storeId = storeId;
		productDisplayJS.catalogId = catalogId;
		productDisplayJS.userType = userType;
		productDisplayJS.currencySymbol = currencySymbol;
	},
	
	setEntitledItems : function(entitledItemArray){
		productDisplayJS.entitledItems = entitledItemArray;
	},
	
	getCatalogEntryId : function(entitledItemId){
		var attributeArray = [];
		var selectedAttributes = productDisplayJS.selectedAttributesList[entitledItemId];
		for(attribute in selectedAttributes){
			attributeArray.push(attribute + "_" + selectedAttributes[attribute]);
		}
		// there are no selected attribute and no entitled item, this must be a single sku item without defining attribute
		if (selectedAttributes == null && this.entitledItems == null) {
			return entitledItemId.substring(entitledItemId.indexOf("_") + 1);
		}
		return productDisplayJS.resolveSKU(attributeArray);
	},
//	getCatalogEntryId : function(entitledItemId){
//		var attributeArray = [];
//		var selectedAttributes = productDisplayJS.selectedAttributesList[entitledItemId];
//		for(attribute in selectedAttributes){
//			attributeArray.push(attribute + "_" + selectedAttributes[attribute]);
//		}
//		return productDisplayJS.resolveSKU(attributeArray);
//	},

	postCallCatentryDetailsById: function(parameters){
		dojo.xhrPost({
			url: getAbsoluteURL() + "GetCatalogEntryDetailsByIDView",
			handleAs: "json-comment-filtered",
			content: parameters,
			service: productDisplayJS,
			load: productDisplayJS.publishAttributeResolvedEventServiceResponse,
			error: function(errObj,ioArgs) {
				console.debug("productDisplayJS.notifyAttributeChange: Unexpected error occurred during an xhrPost request.");
			}
		});
	},
	showAddToCartSubmit: function(){
		dojo.forEach(dojo.query('div[id="cart-submit-button"]'),function(obj){
			obj.className = "col-8 col-center hide";
		})
		dojo.forEach(dojo.query('div[id="pdp-submit-button"]'),function(obj){
				obj.className = "col-8 col-center show";
		})
		dojo.forEach(dojo.query('div[id="wishList-submit-button"]'),function(obj){
			obj.className = "col-8 col-center hide";
		})
		var isRXMedicine = false;
		if($("#rxMedicine").length >0 && $("#rxMedicine").val() == 'true' ){
			isRXMedicine = true;
		}
		if(isRXMedicine){
			$('[id^="wishList-submit-button"]').addClass("hide");
			$('[id^="wishList-submit-button"]').removeClass("show");
			$('[id^="pdp-submit-button"]').removeClass("hide");
			$('[id^="pdp-submit-button"]').addClass("show");
			petcoCommonJS.showModal('rxmedicine');
			petcoPersonalizationJS.rxGoToPage("1");
			$('#rxPersonilaztionDisplay').addClass('active');
		}else{
			petcoCommonJS.showModal('Personalization');
			$('#Personalization_1').show();
			$('#personilaztionDisplay').addClass('active');
		}
	},
	addToCart : function(entitledItemId)
	{
		var catalogEntryId = productDisplayJS.getCatalogEntryId(entitledItemId);
		this.selectedCatalogEntryId = catalogEntryId;
		var repeatDeliveryItemIds = document.getElementById("repearDeliveryItemIds").value;
		var oneTimeDeliveryItemIds = document.getElementById("oneTimeDeliveryItemIds").value;
		var allProductIds = document.getElementById("allProductIds").value;

		var repeatDeliveryOption = document.getElementById("repeat-delivery-radio");
		var oneTimeDeliveryOption = document.getElementById("one-time-delivery-radio");

		if(repeatDeliveryOption != null && repeatDeliveryOption != undefined && repeatDeliveryOption.checked)
		{
			this.isRepeatDeliveryProduct = true;
		}
		else
		{
			this.isRepeatDeliveryProduct = false;
		}

		if(allProductIds == '')
		{
			return true;
		}

		else
		{
			if(this.isRepeatDeliveryProduct)
			{
				if(oneTimeDeliveryItemIds.indexOf(catalogEntryId) == -1)
				{
					return true;
				}
				else
				{
					alert(" product is already there as one time delivery product");
					return false;
				}
			}
			else
			{
				if(repeatDeliveryItemIds.indexOf(catalogEntryId) == -1)
				{
					return true;
				}
				else
				{
					alert("product is already there as repeat delivery product");
					return false;
				}
			}
		}
	},
	
	/**
	* getCatalogEntryIdforProduct Returns the catalog entry ID for a catalog entry that has the same attribute values as a specified product's selected attributes as passed in via the selectedAttributes parameter.
	*
	* @param {String[]} selectedAttributes The array of selected attributes upon which to resolve the SKU.
	*
	* @return {String} catalog entry ID of the SKU.
	*
	**/
	getCatalogEntryIdforProduct : function(selectedAttributes){
		var attributeArray = [];
		for(attribute in selectedAttributes){
			attributeArray.push(attribute + "_" + selectedAttributes[attribute]);
		}
		return productDisplayJS.resolveSKU(attributeArray);
	},
	
	/**
     * retrieves the entitledItemJsonObject
     */
    getEntitledItemJsonObject: function () {
    	return productDisplayJS.entitledItemJsonObject;
    },
	
	/**
	* resolveSKU Resolves a SKU using an array of defining attributes.
	*
	* @param {String[]} attributeArray An array of defining attributes upon which to resolve a SKU.
	*
	* @return {String} catentry_id The catalog entry ID of the SKU.
	*
	**/
	resolveSKU : function(attributeArray){
		console.debug("Resolving SKU >> " + attributeArray +">>"+ this.entitledItems);
		var catentry_id = "";
		var attributeArrayCount = attributeArray.length;
		
		// if there is only one item, no need to check the attributes to resolve the sku
		if(this.entitledItems.length == 1){
			return this.entitledItems[0].catentry_id;
		}
		for(x in this.entitledItems){
			var catentry_id = this.entitledItems[x].catentry_id;
			var Attributes = this.entitledItems[x].Attributes;
			var attributeCount = 0;
			for(index in Attributes){
				attributeCount ++;
			}

			// Handle special case where a catalog entry has one sku with no attributes
			if (attributeArrayCount == 0 && attributeCount == 0){
				return catentry_id;
			}
			if(attributeCount != 0 && attributeArrayCount >= attributeCount){
				var matchedAttributeCount = 0;

				for(attributeName in attributeArray){
					var attributeValue = attributeArray[attributeName];
					if(attributeValue in Attributes){
						matchedAttributeCount ++;
					}
				}
				
				if(attributeCount == matchedAttributeCount){
					console.debug("CatEntryId:" + catentry_id + " for Attribute: " + attributeArray);
					this.disableBuyButtonforUnbuyable(x);
					return catentry_id;
				}
			}
		}
		return null;
	},
	
	/**
	 * disables add2cart button in case where the buyable flag is set to false
	 */
	disableBuyButtonforUnbuyable :function(entitledItemIndex){
		var buyableFlag = this.entitledItems[entitledItemIndex].buyable;
		//disable the add to cart button
		var btn = document.getElementById("add2CartBtn");
		if(buyableFlag != null && btn != null){
			if(buyableFlag == 'false'){
				btn.className += " add2CartButtonDisabled";
			}
			else{  
				btn.className = btn.className.replace(" add2CartButtonDisabled", "");
			}
		}
	},
	
	/**
	* registerAttributeIds Register the ids of HTML attributes that are associated with the specified attribute.
	*
	* @param {String} attributeName The name of the attribute.
	* @param {String} entitledItemId The element id where the json object of the sku is stored
	* @param {Object} ids Map of named HTML element ids
	*
	**/
	registerAttributeIds: function(attributeName, entitledItemId, ids) {
		var attributeIds = productDisplayJS.registeredAttributeIds[entitledItemId];
		if (attributeIds == null) {
			attributeIds = new Object();
			productDisplayJS.registeredAttributeIds[entitledItemId] = attributeIds;
		}

		attributeIds[productDisplayJS.removeQuotes(attributeName)] = ids;
	},
	
	/**
	* getAttributeIds Get the map of ids of HTML attributes that are associated with the specified attribute.
	*
	* @param {String} attributeName The name of the attribute.
	* @param {String} entitledItemId The element id where the json object of the sku is stored
	*
	* @return {Object} ids Map of named HTML element ids
	*
	**/
	getAttributeIds: function(attributeName, entitledItemId) {
		var ids = null;
		var attributeIds = productDisplayJS.registeredAttributeIds[entitledItemId];
		if (attributeIds != null) {
			ids = attributeIds[productDisplayJS.removeQuotes(attributeName)];
		}
		return ids;
	},
	
	/**
	* setSelectedAttribute Sets the selected attribute value for a particular attribute not in reference to any catalog entry.
	*					   One place this function is used is on CachedProductOnlyDisplay.jsp where there is a drop down box of attributes.
	*					   When an attribute is selected from that drop down this method is called to update the selected value for that attribute.
	*
	* @param {String} selectedAttributeName The name of the attribute.
	* @param {String} selectedAttributeValue The value of the selected attribute.
	* @param {String} entitledItemId The element id where the json object of the sku is stored
	* @param {String} skuImageId This is optional. The element id of the product image - image element id is different in product page and category list view. Product page need not pass it because it is set separately
	* @param {String} imageField This is optional. The json field from which image should be picked. Pass value if a different size image need to be picked
	* @param {String} selectedAttributeDisplayValue This is optional. The attribute display value formatted with UOM
	*
	**/
	setSelectedAttribute : function(selectedAttributeName , selectedAttributeValue, entitledItemId, skuImageId, imageField, selectedAttributeDisplayValue){ 		
		var selectedAttributes = productDisplayJS.selectedAttributesList[entitledItemId];
		if(selectedAttributes == null){
			selectedAttributes = new Object();
		}
		selectedAttributeValue = selectedAttributeValue.replace(productDisplayJS.replaceStr001, productDisplayJS.search01);
		selectedAttributeValue = selectedAttributeValue.replace(productDisplayJS.replaceStr002, productDisplayJS.search02);
		if(selectedAttributeValue == ""){
			if(dojo.byId("notifyMe")!=null)
				dojo.style("notifyMe","display","none");
		}
		if(dojo.byId("notifyMeSuccess")!=null)
			dojo.style("notifyMeSuccess","display","none");

		if(dojo.byId("splDlvFlag")!=null)
			dojo.byId("splDelvMsg").innerHTML=dojo.byId("splDlvFlag").value;
		selectedAttributeValue = selectedAttributeValue.replace(productDisplayJS.replaceStr01, productDisplayJS.search01);
		selectedAttributeValue = selectedAttributeValue.replace(productDisplayJS.replaceStr02, productDisplayJS.search02);
		selectedAttributeValue = selectedAttributeValue.replace(productDisplayJS.ampersandChar, productDisplayJS.ampersandEntityName);
		selectedAttributes[selectedAttributeName] = selectedAttributeValue;
		productDisplayJS.moreInfoUrl=productDisplayJS.moreInfoUrl+'&'+selectedAttributeName+'='+selectedAttributeValue;
		productDisplayJS.selectedAttributesList[entitledItemId] = selectedAttributes;
		if(skuImageId != undefined){
			productDisplayJS.setSKUImageId(skuImageId);
		}
		var entitledItemJSON;
		if (dojo.byId(entitledItemId)!=null && !productDisplayJS.isPopup) {
			//the json object for entitled items are already in the HTML. 
			 entitledItemJSON = eval('('+ dojo.byId(entitledItemId).innerHTML +')');
		}else{
			//if dojo.byId(entitledItemId) is null, that means there's no <div> in the HTML that contains the JSON object. 
			//in this case, it must have been set in catalogentryThumbnailDisplay.js when the quick info
			entitledItemJSON = productDisplayJS.getEntitledItemJsonObject(); 
		}
		productDisplayJS.setEntitledItems(entitledItemJSON);
		var attributeIds = productDisplayJS.getAttributeIds(selectedAttributeName, entitledItemId);
		if (attributeIds != null) {
			var usedFilterValue = dojo.byId(attributeIds.usedFilterValueId);
			if (usedFilterValue != null) {
				if (selectedAttributeDisplayValue) {
					usedFilterValue.innerHTML = selectedAttributeDisplayValue;
				} else {
					usedFilterValue.innerHTML = selectedAttributeValue;
				}
			}
			if (selectedAttributeValue == "") {
				dojo.removeClass(attributeIds.usedFilterId, "visible");
				var hideCurrentUsedFilters = true;
				var dropdownList = this.allDropdownsList[entitledItemId];
				for (var i in dropdownList) {
					if (selectedAttributes[dropdownList[i].name] != "") {
						hideCurrentUsedFilters = false;
						break;
					}
				}
				if (hideCurrentUsedFilters) {
					dojo.addClass("currentUsedFilters_" + entitledItemId, "hidden");
				}
			}
			else {
				dojo.addClass(attributeIds.usedFilterId, "visible");
				dojo.removeClass("currentUsedFilters_" + entitledItemId, "hidden");
				var selectedAttributeNameId = selectedAttributeName.replace(productDisplayJS.search01, "\\\'").replace(productDisplayJS.search02,'\\\"');
				dojo.addClass("attr_" + entitledItemId + '_' + selectedAttributeNameId, "hidden");
			}
			
			productDisplayJS.makeDropdownSelection(selectedAttributeName, selectedAttributeValue, entitledItemId);
		}
	},
	 /***
	  * PDWEB-595: Added Ajax Call to Add the ITEM to Shopping Cart
	  * AddtoShopCartAjax This function is used to add a catalog entry to the shopping cart using an AJAX call
	  * **/
	 AddtoShopCartAjax: function(entitledItemId, quantity, prdId, isPopup, customParams) {
	         var entitledItemJSON;
	         var isRDAddOn = false;

	         // check if the item being added is an RD add on
	         if (customParams != null && customParams != 'undefined') {
	             // check if rd add on flag is in custom param and it's true
	             if (customParams['catalogEntryType'] == 'repeatDeliveryAddOn') {
	                 isRDAddOn = true; // set RD add on flag to true
	             }
	         }

	         var catalogEntryId = entitledItemId;
	         //var addCart = productDisplayJS.addToCart(entitledItemId);
	         var repeatDeliveryOption = document.getElementById("RDScheduleFrqValue").value;

	         if (repeatDeliveryOption != null || repeatDeliveryOption != "") {
	             selectedProductId = catalogEntryId;
	         }

	         if (catalogEntryId != null) {
	             var productId = prdId; // need to get the product ID
	             // check if item is an RD add on
	             if (isRDAddOn) {
	                 this.AddItem2RecurringOrderAjax(catalogEntryId, quantity, customParams, productId);
	             } else {
	                 this.AddItemToShopCartAjax(catalogEntryId, quantity, customParams, productId);
	                 this.baseItemAddedToCart = true;
	             }
	         }
	     },

	     /***
	      * PDWEB-595: Added Ajax Call to Add the ITEM to Shopping Cart
	      * AddToShopCartAjax This function is used to add a catalog entry to the shopping cart using an AJAX call
	      * **/
	     AddItemToShopCartAjax: function(catEntryIdentifier, quantity, customParams, productId) {
	         var params = [];
	         params.storeId = document.getElementById('storeId').value;
	         params.catalogId = document.getElementById('catalogId').value;
	         params.langId = "-1";
	         params.orderId = ".";
	         params.calculationUsage = "-1,-2,-5,-6,-7";
			 params.callToODM = true;
	         params.inventoryValidation = "true";
	         var isRDAddOn = false;


				if($("#isBopusDelete").length > 0 && $("#physicalSToreId").length > 0 && $("#bopusShipModeId").length > 0 && $("#isBopusDelete").val() == "true"){
					params.physicalStoreId		= $("#physicalSToreId").val();
					params.shipModeId		=  $("#bopusShipModeId").val();
					params.fromBopusPage = true;				
				}else{
					if($("#defaultShipMode").length > 0 && $("#defaultFFMCenter").length > 0 && $("#defaultShipMode").val() !="" && $("#defaultFFMCenter").val() != ""){
						params.shipModeId		= $("#defaultShipMode").val();
						params.fulfillmentCenterId = $("#defaultFFMCenter").val();
					}
					params.fromBopusPage = false;
				}
				
				if($("#isBopusDelete").length > 0 && $("#physicalSToreId").length > 0 && $("#bopusShipModeId").length > 0 
				&& $("#defaultShipMode").length > 0 && $("#defaultFFMCenter").length > 0){
									$("#isBopusDelete").val("false");
									$("#physicalSToreId").val("");
									$("#bopusShipModeId").val("");
									$("#defaultShipMode").val("");
									$("#defaultFFMCenter").val("");																
				}
	         var donationOtion = document.getElementById("RemovedDonation").value;
	         if (donationOtion != "") {
	             params.catalogEntryType = "donation";
	         }

	         var repeatDeliveryOption = document.getElementById("RDScheduleFrqValue").value;
	         if (repeatDeliveryOption != null && repeatDeliveryOption != "") {
	             this.isRepeatDeliveryProduct = true;
	         } else {
	             this.isRepeatDeliveryProduct = false;
	         }

	         if (this.isRepeatDeliveryProduct) {
	             params.rdFrequency = document.getElementById('RDScheduleFrqValue').value;
	         }
	         var ajaxShopCartService = "AjaxAddOrderItem_shopCart";

	         shoppingActionsJS.productAddedList = new Object();
	         if (dojo.isArray(catEntryIdentifier) && dojo.isArray(quantity)) {
	             for (var i = 0; i < catEntryIdentifier.length; i++) {
	                 if (!isPositiveInteger(quantity[i])) {
	                     MessageHelper.displayErrorMessage(storeNLS['QUANTITY_INPUT_ERROR']);
	                     return;
	                 }
	                 params["catEntryId_" + (i + 1)] = catEntryIdentifier[i];
	                 params["quantity_" + (i + 1)] = quantity[i];
	             }
	         } else {
	             if (!isPositiveInteger(quantity)) {
	                 MessageHelper.displayErrorMessage(storeNLS['QUANTITY_INPUT_ERROR']);
	                 return;
	             }
	             //personalization ITEM Check
	             if (document.getElementById("removedAttrNames").value != "") {
	                 customParams = true;
	                 var i = 0;
	                 params["isPersonalized_" + (i + 1)] = true;
	                 params["catEntryId_" + (i + 1)] = catEntryIdentifier;
	                 params["quantity_" + (i + 1)] = 1;
	                 var AttrNames = document.getElementById("removedAttrNames").value
	                 var personalizationName = AttrNames.split(',');
	                 if(document.getElementById("isRxProd").value != "" && document.getElementById("isRxProd").value == "true"){
	                	 params["isRxPersonalized_"+((i*1)+1)] = true;
	                	 params["isTemplatePersonalizedOrder_"+((i*1)+1)] = true;
	                	 var rxProdParameters = $("#rxProdParameters");
	                	 if(rxProdParameters.length > 0 ){

	                     	
	                		 var rxProdParametersArr = $(rxProdParameters).html().split("||^||");
	                		 for(var j = 0 ; j < rxProdParametersArr.length ; j++){
	                			params["pAttrName"+((j*1)+1)+'_'+((i*1)+1)] = rxProdParametersArr[j].split("||*||")[0].replace("pAttr","");
	                			params["pAttrId"+((j*1)+1)+'_'+((i*1)+1)] = rxProdParametersArr[j].split("||*||")[6]; 
	 							params["pAttrValue"+((j*1)+1)+'_'+((i*1)+1)] = rxProdParametersArr[j].split("||*||")[1]; 
	 							params["pAttrOrder"+((j*1)+1)+'_'+((i*1)+1)] = rxProdParametersArr[j].split("||*||")[4];
	 							params["pAttrReq"+((j*1)+1)+'_'+((i*1)+1)] = rxProdParametersArr[j].split("||*||")[5]; 
	 							params["pAttrFieldId"+((j*1)+1)+'_'+((i*1)+1)] = rxProdParametersArr[j].split("||*||")[2];
	 							params["pAttrReqInCart"+((j*1)+1)+'_'+((i*1)+1)] = rxProdParametersArr[j].split("||*||")[3];
	                		 }
	                	 }
	                 }else{
	                 for (var j = 0; j < (personalizationName.length); j++) {
	                     var nameAttr = personalizationName[j] + '_' + (i + 1);
	                     params["pAttrId" + (j + 1) + '_' + (i + 1)] = personalizationName[j];
	                 }

	                 if (document.getElementById("removedAttrvalue").value != "") {
	                     var AttrValue = document.getElementById("removedAttrvalue").value
	                     var personalizationValue = AttrValue.split(',');

	                     for (var k = 0; k < (personalizationValue.length); k++) {
	                         var nameAttrvalue = personalizationValue[k] + '_' + (i + 1);
	                         params["pAttrValue" + (k + 1) + '_' + (i + 1)] = personalizationValue[k];
	                     }
	                 }
	                 }

	             } else {
	                 params.catEntryId = catEntryIdentifier;
	                 params.quantity = quantity;
	             }

	         }
	         //Pass any other customParams set by other add on features
	         if (customParams != null && customParams != 'undefined') {
	             for (i in customParams) {
	                 params[i] = customParams[i];
	             }
	             if (customParams['catalogEntryType'] == 'dynamicKit') {
	                 ajaxShopCartService = "AddPreConfigurationToCart";
	             } else if (customParams['catalogEntryType'] == 'repeatDeliveryAddOn') {
	                 isRDAddOn = true; // set RD add on flag to true
	                 ajaxShopCartService = 'RepeatDeliveryOrderAdd'; // set service to add RD order item
	                 params.orderId = '**'; // this is needed to create a new order
	             }
	         }

	         //For Handling multiple clicks
	         if (!submitRequest()) {
	             return;
	         }
	         cursor_wait();

	         wc.service.invoke(ajaxShopCartService, params);
	         // check if item is not an RD add on
	         if (!isRDAddOn) {
	             productDisplayJS.baseItemAddedToCart = true;
	         }
	     },


	/**
	* resetSelectedAttribute Resets the the selected attribute value for the specified attribute.
	*
	* @param {String} attributeName The name of the attribute.
	* @param {String} entitledItemId The element id where the json object of the sku is stored
	* @param {String} productUrl The url of the parent product
	*
	**/
	resetSelectedAttribute: function(attributeName, entitledItemId) {
		var attributeName = attributeName.replace(productDisplayJS.search01, "\\\'").replace(productDisplayJS.search02,'\\\"');
		dojo.removeClass("attr_" + entitledItemId + '_' + attributeName, "hidden");
		
		var attributeIds = productDisplayJS.getAttributeIds(attributeName, entitledItemId);
		if (attributeIds != null) {
			var selectWidget = dijit.byId(attributeIds.selectAttributeValueId);
			if (selectWidget != null) {
				selectWidget.set("value", "");
			}
		}
		
		var dropdownList = this.allDropdownsList[entitledItemId];
		var remainingSelectedAttributes = {};
		
		for (var i=0; i<dropdownList.length; i++) {			
			if (dropdownList[i].name.replace(/\\'/g, "'") == attributeName.replace(/\\'/g, "'")) {
				dojo.removeClass(dropdownList[i].node, "hidden");
				dijit.byNode(dropdownList[i].node).set('value', '');
			} else {
				for (var j=0; j<dropdownList[i].options.length; j++) {
					if (dropdownList[i].options[j].selected === true) {
						remainingSelectedAttributes[dropdownList[i].name] = dropdownList[i].options[j].value;
					}
				}
			}
		}
		
		var urlWithoutParams = document.location.href.split('?')[0];
		var params = "?";
		
		var productUrl = "";
		if (dojo.byId('ProductDisplayURL')) {
			productUrl = dojo.byId('ProductDisplayURL').innerHTML;			
		}
		
		var displaySKUContextData = false;		
		if (dojo.byId('displaySKUContextData')) {
			displaySKUContextData = eval('('+ dojo.byId('displaySKUContextData').innerHTML +')');
		}
		 
		if (displaySKUContextData && urlWithoutParams !== productUrl) {
			for (attr in remainingSelectedAttributes) {
				if (remainingSelectedAttributes.hasOwnProperty(attr)) {
					params += attr + '=' + remainingSelectedAttributes[attr] + '&';
			    }
			}
			
			params = params.slice(0, -1);
			params = params.replace("\\\'", "'").replace('\\\"','"');
			document.location.replace(productUrl + params);
		}
	},
	
	/**
	* setSelectedAttributeName Set the selected attribute name and make the drop-down associated with the attribute visible.
	*
	* @param {String} attributeName The name of the attribute.
	* @param {String} entitledItemId The element id where the json object of the sku is stored
	*
	**/
	setSelectedAttributeName: function(attributeName, entitledItemId) {
		var oldSelectedAttributeValuesId = productDisplayJS.selectedAttributeValues[entitledItemId];
		if (oldSelectedAttributeValuesId != null && oldSelectedAttributeValuesId != "") {
			dojo.addClass(oldSelectedAttributeValuesId, "mobileHidden");
		}
		var selectedAttributeValuesId = null;
		var attributeIds = productDisplayJS.getAttributeIds(attributeName, entitledItemId);
		if (attributeIds != null) {
			selectedAttributeValuesId = attributeIds.attributeValuesId;
		}
		if (selectedAttributeValuesId != null && selectedAttributeValuesId != "") {
			dojo.removeClass(selectedAttributeValuesId, "mobileHidden");
		}
		productDisplayJS.selectedAttributeValues[entitledItemId] = selectedAttributeValuesId;
	},
	
	/**
	* Add2ShopCartAjax This function is used to add a catalog entry to the shopping cart using an AJAX call. This will resolve the catentryId using entitledItemId and adds the item to the cart.
	*				This function will resolve the SKU based on the entitledItemId passed in and call {@link fastFinderJS.AddItem2ShopCartAjax}.
	* @param {String} entitledItemId A DIV containing a JSON object which holds information about a catalog entry. You can reference CachedProductOnlyDisplay.jsp to see how that div is constructed.
	* @param {int} quantity The quantity of the item to add to the cart.
	* @param {String} isPopup If the value is true, then this implies that the function was called from a quick info pop-up. 	
	* @param {Object} customParams - Any additional parameters that needs to be passed during service invocation.
	*
	**/
	Add2ShopCartAjax : function(entitledItemId,quantity,isPopup,customParams)
	{	
		var entitledItemJSON;
		var isRDAddOn = false;
		var isAddToExistingRD = false;		
		if (dojo.byId(entitledItemId)!=null) {
			//the json object for entitled items are already in the HTML. 
			 entitledItemJSON = eval('('+ dojo.byId(entitledItemId).innerHTML +')');
		}else{
			//if dojo.byId(entitledItemId) is null, that means there's no <div> in the HTML that contains the JSON object. 
			//in this case, it must have been set in catalogentryThumbnailDisplay.js when the quick info
			entitledItemJSON = this.getEntitledItemJsonObject(); 
		}
		// check if the item being added is an RD add on
		if (customParams != null && customParams != 'undefined') {
			// check if rd add on flag is in custom param and it's true
			if (customParams['catalogEntryType'] == 'repeatDeliveryAddOn') {
				isRDAddOn = true;	// set RD add on flag to true
			}
		}
		// check if the item being added is an add to existing RD item
		if (customParams != null && customParams != 'undefined') {
			// check if add to existing RD flag is in custom param and it's true
			if (customParams['catalogEntryType'] == 'addToExistingRepeatDeliveryOrder') {
				isAddToExistingRD = true;	// set add to existing RD flag to true
			}
		}
		productDisplayJS.setEntitledItems(entitledItemJSON);
		var catalogEntryId = productDisplayJS.getCatalogEntryId(entitledItemId);
		//var addCart = productDisplayJS.addToCart(entitledItemId);
		var repeatDeliveryOption = document.getElementById("repeat-delivery-radio");
		//if (addCart == true )
		{
			if(repeatDeliveryOption!=null || repeatDeliveryOption!=undefined)
			{
    		   if(repeatDeliveryOption && repeatDeliveryOption.checked){

    			   selectedProductId = catalogEntryId;
    		   }
    	   }
		 if(null != document.getElementById("isWHMemberShipSKU")){			 
				var  customParams = {};			 
				customParams['isWHMembershipSKU'] =true;
			}
		if(catalogEntryId!=null){
			var productId = entitledItemId.substring(entitledItemId.indexOf("_")+1);
			// check if item is an RD add on or add to existing RD
			if (isRDAddOn || isAddToExistingRD) {
				this.AddItem2RecurringOrderAjax(catalogEntryId , quantity, customParams, productId);
			}
			else {
			productDisplayJS.AddItem2ShopCartAjax(catalogEntryId , quantity,customParams, productId);
			productDisplayJS.baseItemAddedToCart=true;
			}
			if(dijit.byId('second_level_category_popup') != null){
				hidePopup('second_level_category_popup');
			}
		}
		else if (isPopup == true){
			dojo.byId('second_level_category_popup').style.zIndex = '1';
			MessageHelper.formErrorHandleClient('addToCartLinkAjax', storeNLS['ERR_RESOLVING_SKU']);			
		} else{
			MessageHelper.displayErrorMessage(storeNLS['ERR_RESOLVING_SKU']);
			productDisplayJS.baseItemAddedToCart=false;
		}
		}
	},

	/**
	 *
	 */
	Add2RecurringOrderAjax : function(entitledItemId, quantity, isPopup, customParams) {

		// declare function variable(s)
		var subscriptionIdField = null;
		var subscriptionId = null;
		var isLTLDeliveryRequired = null;

		// get subscription id field if only one rd option
		subscriptionIdField = dojo.query('input[type=hidden][name=subscriptionId]');
		// check if field does not exist
		if (subscriptionIdField.length == 0) {
			// get subscription field if multiple rd options
			subscriptionIdField = dojo.query('input[type=radio][name=subscriptionId]:checked');
		}
		// get subscription field value
		subscriptionId = subscriptionIdField[0].value;
		console.log('subscriptionId == ' + subscriptionId);
		// check custom parameters if not populated
		if (customParams == null || (customParams != null && customParams == ''))
			customParams = {};	// create an array
		else {
			isLTLDeliveryRequired = customParams;
			customParams = {};
			customParams['isLTLDeliveryRequired'] = isLTLDeliveryRequired;
		}
		var entitledItemJSON;
		if (dojo.byId(entitledItemId)!=null) {
		//the json object for entitled items are already in the HTML.
		 entitledItemJSON = eval('('+ dojo.byId(entitledItemId).innerHTML +')');
		}else{
		//if dojo.byId(entitledItemId) is null, that means there's no <div> in the HTML that contains the JSON object.
		//in this case, it must have been set in catalogentryThumbnailDisplay.js when the quick info
		entitledItemJSON = this.getEntitledItemJsonObject();
		}
		productDisplayJS.setEntitledItems(entitledItemJSON);
		var catalogEntryId = productDisplayJS.getCatalogEntryId(entitledItemId);
		var catEntry = productDisplayJS.itemPriceJsonOject[catalogEntryId].catalogEntry;
		var rdSkuPartNumber = catEntry.catalogEntryIdentifier.externalIdentifier.partNumber;
		// add add on custom parameters
		customParams['catalogEntryType'] = 'repeatDeliveryAddOn';
		customParams['subscriptionId'] = subscriptionId;
		customParams['isAddOn'] = 'Y';
		customParams['rdSkuPartNumber'] = rdSkuPartNumber;
		this.Add2ShopCartAjax(entitledItemId, quantity, isPopup, customParams);
	},

	/**
	 *Method is used for adding an item to existing repeat delivery order.
	 */
	Add2ExistingRDOrderAjax : function(entitledItemId, quantity, isPopup, customParams) {

		// declare function variable(s)
		var subscriptionIdField = null;
		var subscriptionId = null;
		var isLTLDeliveryRequired = null;

		// get subscription id field if only one rd option
		subscriptionIdField = dojo.query('input[type=hidden][name=subscriptionId]');
		// check if field does not exist
		if (subscriptionIdField.length == 0) {
			// get subscription field if multiple rd options
			subscriptionIdField = dojo.query('input[type=radio][name=subscriptionId]:checked');
		}
		// get subscription field value
		subscriptionId = subscriptionIdField[0].value;
		console.log('subscriptionId == ' + subscriptionId);
		// check custom parameters if not populated
		if (customParams == null || (customParams != null && customParams == ''))
			customParams = {};	// create an array
		else {
			isLTLDeliveryRequired = customParams;
			customParams = {};
			customParams['isLTLDeliveryRequired'] = isLTLDeliveryRequired;
		}
		var entitledItemJSON;
		if (dojo.byId(entitledItemId)!=null) {
		//the json object for entitled items are already in the HTML.
		 entitledItemJSON = eval('('+ dojo.byId(entitledItemId).innerHTML +')');
		}else{
		//if dojo.byId(entitledItemId) is null, that means there's no <div> in the HTML that contains the JSON object.
		//in this case, it must have been set in catalogentryThumbnailDisplay.js when the quick info
		entitledItemJSON = this.getEntitledItemJsonObject();
		}
		productDisplayJS.setEntitledItems(entitledItemJSON);
		var catalogEntryId = productDisplayJS.getCatalogEntryId(entitledItemId);
		var catEntry = productDisplayJS.itemPriceJsonOject[catalogEntryId].catalogEntry;
		var rdSkuPartNumber = catEntry.catalogEntryIdentifier.externalIdentifier.partNumber;
		// add add to existing RD custom parameters
		customParams['catalogEntryType'] = 'addToExistingRepeatDeliveryOrder';
		customParams['subscriptionId'] = subscriptionId;
		customParams['isInclusive'] = 'Y';
		customParams['rdSkuPartNumber'] = rdSkuPartNumber;
		this.Add2ShopCartAjax(entitledItemId, quantity, isPopup, customParams);
	},
	
	AddItem2ShopCartAjax : function(catEntryIdentifier, quantity, customParams, productId)
	{
		var params = {};
		params.storeId		= this.storeId;
		params.catalogId	= this.catalogId;
		params.langId		= this.langId;
		params.orderId		= ".";
		// Remove calculations for performance
		// params.calculationUsage = "-1,-2,-5,-6,-7";
		params.inventoryValidation = "true";
		var defaultShipMode= productDisplayJS.getShipModeIdForDefault();
		var defaultFFMCenter = productDisplayJS.getFfmCenterDefault();
		/**
		 * For a page where bopus is enabled and radio button is visible, we need to pass 
		 * the physical store id and shipmodeId for the items to ad to cart. also for other items we need to pass the 
		 * Default shipmode id and ffm center ids
		 * **/
		//check if store id bopus enabled from storeconf and as well as the stlocattr entry
		if($("div#bopusSelectEnabledBopusAttrOn.show").length > 0  &&
				$("#bopusSelectStails").length > 0 && $("#bopusSelectStails").val() == "true"){
			//Check if the radio button for bopus is selected or not
			if($("div#bopusSelectEnabledBopusAttrOn input#store-pickup:checked").length > 0){
				var storeId = productDisplayJS.getStoreIdFromPhyicalSToreIdCookie();
				var bopusShipMode = productDisplayJS.getShipModeIdForBOPUS();
				if(storeId != "" && storeId != "NA" && bopusShipMode != ""){
					params.physicalStoreId		= storeId;
					params.shipModeId		= bopusShipMode;
					params.fromBopusPage = true;
				}else if(defaultShipMode != "" && defaultFFMCenter != ""){
					params.shipModeId		= defaultShipMode;
					params.fulfillmentCenterId = defaultFFMCenter;
					params.fromBopusPage = false;
				}
			}else{
				if(defaultShipMode != "" && defaultFFMCenter != ""){
					params.shipModeId		= defaultShipMode;
					params.fulfillmentCenterId = defaultFFMCenter;
					params.fromBopusPage = false;
				}
			}
			
		}
		
		var isRDAddOn = false;

		var repeatDeliveryOption = document.getElementById("repeat-delivery-radio");
		var oneTimeDeliveryOption = document.getElementById("one-time-delivery-radio");

		if(repeatDeliveryOption != null && repeatDeliveryOption != undefined && repeatDeliveryOption.checked)
		{
			this.isRepeatDeliveryProduct = true;
		}
		else
		{
			this.isRepeatDeliveryProduct = false;
		}

		if(this.isRepeatDeliveryProduct)
		{
			// Putting a check for hidden class so that values are not overridden by hidden <div> data values
			if ($('#repeat-delivery-dropdown').hasClass('collapsible') && !$('#repeat-delivery-dropdown').hasClass('open')) {
				if(document.getElementById("repeat-delivery-first-ship-options") != undefined && document.getElementById("repeat-delivery-first-ship-options") != null){
					var rdInitialFirstOrderValue = document.getElementById('repeat-delivery-first-ship-options').value;
					if(rdInitialFirstOrderValue != null && rdInitialFirstOrderValue != undefined) {
						if (rdInitialFirstOrderValue == "now") {
							params.rdFrequency = document.getElementById('repeat-delivery-freq-options_future_order').value;
						} else {
							params.rdFrequency = document.getElementById('repeat-delivery-freq-options_future_order').value;
							params.rdInitialFirstOrder = rdInitialFirstOrderValue;
						}
					}
				}
			} else {
				params.rdFrequency = document.getElementById('repeat-delivery-freq-options').value;
			}
		}
		var ajaxShopCartService = "AddOrderItem";
		
		shoppingActionsJS.productAddedList = new Object();
		if(dojo.isArray(catEntryIdentifier) && dojo.isArray(quantity)){
			for(var i=0; i<catEntryIdentifier.length; i++){
				if(!isPositiveInteger(quantity[i])){
					MessageHelper.displayErrorMessage(storeNLS['QUANTITY_INPUT_ERROR']);
					return;
				}
				params["catEntryId_" + (i+1)] = catEntryIdentifier[i];
				params["quantity_" + (i+1)]	= quantity[i];
			}
		}
		else{
			if(!isPositiveInteger(quantity)){
				MessageHelper.displayErrorMessage(storeNLS['QUANTITY_INPUT_ERROR']);
				return;
			}
			if(petcoPersonalizationJS.isPersonalizedItem() && !petcoPersonalizationJS.isRxMedicineItem()){ // and personalization
				var invalidChars = petcoPersonalizationJS.findInvalidCharSetForUserInput(quantity,customParams);
				if(invalidChars!=""){
					//alert("please do not use "+invalidChars);
					return false;
				}
				if(!petcoPersonalizationJS.validatePersonalizedRequiredField(quantity,customParams)){
					return false;
				}
				if(!petcoPersonalizationJS.validatePersonalizedTextInputType(quantity,customParams)){
					return false;
				}
				params = petcoPersonalizationJS.addPersonalizationAttr(catEntryIdentifier,quantity,params)
			}else if(petcoPersonalizationJS.isRxMedicineItem()){				
				params = petcoPersonalizationJS.addRxMedicinePersonalizationAttr(catEntryIdentifier,quantity,params);				
			}else
			{
				params.catEntryId	= catEntryIdentifier;
				params.quantity		= quantity;
			}
			var selectedAttrList = new Object();
			for(attr in productDisplayJS.selectedAttributesList['entitledItem_'+productId]){
				selectedAttrList[attr] = productDisplayJS.selectedAttributesList['entitledItem_'+productId][attr];
			}			
			
			if(productId == undefined){
				shoppingActionsJS.saveAddedProductInfo(quantity, catEntryIdentifier, catEntryIdentifier, selectedAttrList);
			} else {
				shoppingActionsJS.saveAddedProductInfo(quantity, productId, catEntryIdentifier, selectedAttrList);
			}
		}		

		//Pass any other customParams set by other add on features
		if(customParams != null && customParams != 'undefined'){
			for(i in customParams){
				params[i] = customParams[i];				
			}						
			if(customParams['catalogEntryType'] == 'dynamicKit' ){
				ajaxShopCartService = "AddPreConfigurationToCart";
			}
			else if (customParams['catalogEntryType'] == 'repeatDeliveryAddOn' || customParams['catalogEntryType'] == 'addToExistingRepeatDeliveryOrder') {
				isRDAddOn = true;	// set RD add on flag to true
				ajaxShopCartService = 'RepeatDeliveryOrderAdd';	// set service to add RD order item
				params.orderId = '**'; // this is needed to create a new order
			}
		}

		var contractIdElements = document.getElementsByName('contractSelectForm_contractId');
		if (contractIdElements != null && contractIdElements != "undefined") {
			for (i=0; i<contractIdElements.length; i++) {
				if (contractIdElements[i].checked) {
					params.contractId = contractIdElements[i].value;
					break;
				}
			}
		}
		
		//For Handling multiple clicks
		if(!submitRequest()){
			return;
		}   
				
		cursor_wait();	
		//Start:Tealium conversion Tagging Change: New RD SKU
		if (this.isRepeatDeliveryProduct) {
			var rd_schedule = document.getElementById('repeat-delivery-freq-options').value;
			var catEntry = productDisplayJS.itemPriceJsonOject[catEntryIdentifier].catalogEntry;
			var rd_sku = catEntry.catalogEntryIdentifier.externalIdentifier.partNumber;
			try{
				var name = catEntry.description[0].name;
				var productName = name.replace(/["']/g, "");
				if (rd_sku != null && rd_sku != "undefined") { 
					var cartEventRDDetails = {};
					cartEventRDDetails["product_id"] = productId;
					cartEventRDDetails["product_sku"] = rd_sku;
					cartEventRDDetails["product_name"] = productName;
					if($('#tel_product_id').size()>0){
						cartEventRDDetails["product_parent_sku"] = $('#tel_product_id').val();
					}
					cartEventRDDetails["conversion_action_type"] = "1";
					cartEventRDDetails["conversion_category_id"] = "Repeat Delivery";
					cartEventRDDetails["conversion_event_id"] = "New Repeat Delivery";
					cartEventRDDetails["event_name"] = "new_repeat_delivery";               

					pushEvent(cartEventRDDetails);
				}
			}catch(err){
				console.log(err);
			}
		}
		//End:Tealium conversion Tagging Change: New RD SKU
		
		wc.service.invoke(ajaxShopCartService, params);
		// check if item is not an RD add on
		if (!isRDAddOn) {
			productDisplayJS.baseItemAddedToCart=true;
		}
		//window.location.hash = '#mini-cart';
	},

	AddItem2RecurringOrderAjax : function(catEntryIdentifier, quantity, customParams, productId) {

		this.AddItem2ShopCartAjax(catEntryIdentifier, quantity, customParams, productId);
	},
	
	AddItem2ShopCartAjaxFromHome : function(partnumber){
		var params = [];
		params.storeId		= WCParamJS.storeId;
		params.catalogId	= WCParamJS.catalogId;
		params.langId		= WCParamJS.langId;
		params.orderId		= ".";
		params.calculationUsage = "-1";
		params.inventoryValidation = "true";
		var defaultShipMode= productDisplayJS.getShipModeIdForDefault();
		var defaultFFMCenter = productDisplayJS.getFfmCenterDefault();
		params.partNumber = partnumber;
		params.inventoryValidation = "true";
		params.quantity		= '1';
		var ajaxShopCartService = "AddOrderItemAddService";
	

		//For Handling multiple clicks
		if(!submitRequest()){
			return;
		}
		cursor_wait();
		
		shoppingActionsServicesDeclarationJS.setCommonParameters(WCParamJS.langId,WCParamJS.storeId,WCParamJS.catalogId);
		wc.service.invoke(ajaxShopCartService, params);
		
			productDisplayJS.baseItemAddedToCart=true;
		
		
	},
	
	/* SwatchCode start */

	/**
	* Sets the ID of the image to use for swatch.
	* @param {String} skuImageId The ID of the full image element.
	**/
	setSKUImageId:function(skuImageId){
		productDisplayJS.skuImageId = skuImageId;
	},
	
	/**
	* getImageForSKU Returns the full image of the catalog entry with the selected attributes as specified in the {@link fastFinderJS.selectedAttributes} value.
	*					This method uses resolveImageForSKU to find the SKU image with the selected attributes values.
	*
	* @param {String} imageField, the field name from which the image should be picked
	* @return {String} path to the SKU image.
	* 
	*
	**/
	getImageForSKU : function(entitledItemId, imageField){
		var attributeArray = [];
		var selectedAttributes = productDisplayJS.selectedAttributesList[entitledItemId];
		for(attribute in selectedAttributes){
			attributeArray.push(attribute + "_|_" + selectedAttributes[attribute]);
		}
		return productDisplayJS.resolveImageForSKU(attributeArray, imageField);
	},
	
	/**
	* resolveImageForSKU Resolves image of a SKU using an array of defining attributes.
	*
	* @param {String[]} attributeArray An array of defining attributes upon which to resolve a SKU.
	* @param {String} imageField, the field name from which the image should be picked
	*
	* @return {String} imagePath The location of SKU image.
	*
	**/
	resolveImageForSKU : function(attributeArray, imageField){
		console.debug("Resolving SKU >> " + attributeArray +">>"+ this.entitledItems);
		var imagePath = "";
		var attributeArrayCount = attributeArray.length;
		
		for(x in this.entitledItems){
			if(null != imageField){
				var imagePath = this.entitledItems[x][imageField];
			} else {
			var imagePath = this.entitledItems[x].ItemImage467;
			}
			
			var Attributes = this.entitledItems[x].Attributes;
			var attributeCount = 0;
			for(index in Attributes){
				attributeCount ++;
			}

			// Handle special case where a catalog entry has one sku with no attributes
			if (attributeArrayCount == 0 && attributeCount == 0){
				return imagePath;
			}
			if(attributeCount != 0 && attributeArrayCount >= attributeCount){
				var matchedAttributeCount = 0;

				for(attributeName in attributeArray){
					var attributeValue = attributeArray[attributeName];
					if(attributeValue in Attributes){
						matchedAttributeCount ++;
					}
				}
				
				if(attributeCount == matchedAttributeCount){
					console.debug("ItemImage:" + imagePath + " for Attribute: " + attributeArray);
					var imageArray = [];
					imageArray.push(imagePath);
					imageArray.push(this.entitledItems[x].ItemThumbnailImage);
					if(this.entitledItems[x].ItemAngleThumbnail != null && this.entitledItems[x].ItemAngleThumbnail != undefined){
						imageArray.push(this.entitledItems[x].ItemAngleThumbnail);
						imageArray.push(this.entitledItems[x].ItemAngleFullImage);
						imageArray.push(this.entitledItems[x].ItemAngleThumbnailShortDesc);
					}
					return imageArray;
				}
			}
		}
		return null;
	},


	/**
	* changeViewImages Updates the angle views of the SKU.
	*
	* @param {String[]} itemAngleThumbnail An array of SKU view thumbnails.
	* @param {String[]} itemAngleFullImage An array of SKU view full images.
	* @param {String[]} itemAngleThumbnailShortDesc An array of short description for the SKU view thumbnails.
	**/
	changeViewImages : function(itemAngleThumbnail, itemAngleFullImage, itemAngleThumbnailShortDesc){	
		var imageCount = 0;
		for (x in itemAngleThumbnail) {
			var prodAngleCount = imageCount;
			imageCount++;
			
			var thumbnailWidgets = dojo.query("ul[id^='ProductAngleImagesAreaList']");
			if(thumbnailWidgets != null){
				for(var i = 0; i<thumbnailWidgets.length; i++){			
					if(null != thumbnailWidgets[i]){
						var angleThumbnail = document.createElement("li");						
						var angleThumbnailLink = document.createElement("a");
						var angleThumbnailImg = document.createElement("img");
						
						angleThumbnail.id = "productAngleLi" + prodAngleCount;
						
						angleThumbnailLink.href = "JavaScript:changeThumbNail('productAngleLi" + prodAngleCount + "','" + itemAngleFullImage[x] + "');";
						angleThumbnailLink.id = "WC_CachedProductOnlyDisplay_links_1_" + imageCount ;
						if(itemAngleThumbnailShortDesc != 'undefined' && itemAngleThumbnailShortDesc != null){
							angleThumbnailLink.title = itemAngleThumbnailShortDesc[x];
						}
						
						angleThumbnailImg.src = itemAngleThumbnail[x];
						angleThumbnailImg.id = "WC_CachedProductOnlyDisplay_images_1_" + imageCount;
						if(itemAngleThumbnailShortDesc != 'undefined' && itemAngleThumbnailShortDesc != null){
							angleThumbnailImg.alt = itemAngleThumbnailShortDesc[x];
						}
						
						if(prodAngleCount == 0){
							dojo.empty(thumbnailWidgets[i]);						
						}						
						
						angleThumbnailLink.appendChild(angleThumbnailImg);
						angleThumbnail.appendChild(angleThumbnailLink);
						thumbnailWidgets[i].appendChild(angleThumbnail);
					}
				}				
			}			
		}
		
		var displayImageArea = "";
		if(imageCount > 0){
			displayImageArea = 'block';
		} else {
			displayImageArea = 'none';
		}
		var angleImageArea = dojo.query("div[id^='ProductAngleImagesArea']");
		if(angleImageArea != null){
			for(var i = 0; i<angleImageArea.length; i++){			
				if(null != angleImageArea[i]){
					angleImageArea[i].style.display = displayImageArea;
				}
			}
		}		
	},
	
	/**
	* Updates the swatches selections on list view.
	* Sets up the swatches array and sku images, then selects a default swatch value.
	**/	
	updateSwatchListView: function(){
			var swatchArray = dojo.query("a[id^='swatch_array_']");
			for(var i = 0; i<swatchArray.length; i++){
				var swatchArrayElement = swatchArray[i];
				eval(dojo.attr(swatchArrayElement,"href"));
			}
			
			var swatchSkuImage = dojo.query("a[id^='swatch_setSkuImage_']");
			for(var i = 0; i<swatchSkuImage.length; i++){
				var swatchSkuImageElement = swatchSkuImage[i];
				eval(dojo.attr(swatchSkuImageElement,"href"));
			}			
			
			var swatchDefault = dojo.query("a[id^='swatch_selectDefault_']");
			for(var i = 0; i<swatchDefault.length; i++){
				var swatchDefaultElement = swatchDefault[i];
				eval(dojo.attr(swatchDefaultElement,"href"));
			}		
	},
		
	/**
	* Handles the case when a swatch is selected. Set the border of the selected swatch.
	* @param {String} selectedAttributeName The name of the selected swatch attribute.
	* @param {String} selectedAttributeValue The value of the selected swatch attribute.
	* @param {String} entitledItemId The ID of the SKU
	* @param {String} doNotDisable The name of the swatch attribute that should never be disabled.
	* @param {String} imageField, the field name from which the image should be picked
	* @return boolean Whether the swatch is available for selection
	**/
	selectSwatch: function(selectedAttributeName, selectedAttributeValue, entitledItemId, doNotDisable, selectedAttributeDisplayValue, skuImageId, imageField) {
		if(dojo.hasClass("swatch_" + entitledItemId + "_" + selectedAttributeValue, "color_swatch_disabled")){
			return;
		}
		var selectedAttributes = this.selectedAttributesList[entitledItemId];
		for (attribute in selectedAttributes) {
			if (attribute == selectedAttributeName) {
				// case when the selected swatch is already selected with a value, if the value is different than
				// what's being selected, reset other swatches and deselect the previous value and update selection
				if (selectedAttributes[attribute] != selectedAttributeValue) {
					// deselect previous value and update swatch selection
					var swatchElement = dojo.byId("swatch_" + entitledItemId + "_" + selectedAttributes[attribute]);
					swatchElement.className = "color_swatch";
					swatchElement.src = swatchElement.src.replace("_disabled.png","_enabled.png");
					
					//change the title text of the swatch link
					dojo.byId("swatch_link_" + entitledItemId + "_" + selectedAttributes[attribute]).title = swatchElement.alt;
				}
			}
			if (document.getElementById("swatch_link_" + entitledItemId + "_" + selectedAttributes[attribute]) != null) {
				document.getElementById("swatch_link_" + entitledItemId + "_" + selectedAttributes[attribute]).setAttribute("aria-checked", "false");
			}
		}
		this.makeSwatchSelection(selectedAttributeName, selectedAttributeValue, entitledItemId, doNotDisable, selectedAttributeDisplayValue, skuImageId, imageField);
	},

	/**
	* Make swatch selection - add to selectedAttribute, select image, and update other swatches and SKU image based on current selection.
	* @param {String} swatchAttrName The name of the selected swatch attribute.
	* @param {String} swatchAttrValue The value of the selected swatch attribute.
	* @param {String} entitledItemId The ID of the SKU.
	* @param {String} doNotDisable The name of the swatch attribute that should never be disabled.	
	* @param {String} skuImageId This is optional. The element id of the product image - image element id is different in product page and category list view. Product page need not pass it because it is set separately
	* @param {String} imageField This is optional. The json field from which image should be picked. Pass value if a different size image need to be picked
	**/
	makeSwatchSelection: function(swatchAttrName, swatchAttrValue, entitledItemId, doNotDisable, selectedAttributeDisplayValue, skuImageId, imageField) {
		productDisplayJS.setSelectedAttribute(swatchAttrName, swatchAttrValue, entitledItemId, skuImageId, imageField);
		document.getElementById("swatch_" + entitledItemId + "_" + swatchAttrValue).className = "color_swatch_selected";
		document.getElementById("swatch_link_" + entitledItemId + "_" + swatchAttrValue).setAttribute("aria-checked", "true");
		document.getElementById("swatch_selection_label_" + entitledItemId + "_" + swatchAttrName).className = "header color_swatch_label";
		if (document.getElementById("swatch_selection_" + entitledItemId + "_" + swatchAttrName).style.display == "none") {
			document.getElementById("swatch_selection_" + entitledItemId + "_" + swatchAttrName).style.display = "inline";
		}
		if (selectedAttributeDisplayValue != null) {
			document.getElementById("swatch_selection_" + entitledItemId + "_" + swatchAttrName).innerHTML = selectedAttributeDisplayValue;
		} else {
			document.getElementById("swatch_selection_" + entitledItemId + "_" + swatchAttrName).innerHTML = swatchAttrValue;
		}
		productDisplayJS.updateSwatchImages(swatchAttrName, entitledItemId, doNotDisable,imageField);
	},
	
	/**
	* Make dropdown selection.
	* @param {String} selectedAttrName The name of the selected dropdown attribute.
	* @param {String} selectedAttrValue The value of the selected dropdown attribute.
	* @param {String} entitledItemId The ID of the SKU.
	**/
	makeDropdownSelection: function(selectedAttrName, selectedAttrValue, entitledItemId) {
		//Add indexOf function to arrays for IE8
		if (!Array.prototype.indexOf) {
	        Array.prototype.indexOf = function(obj, start) {
	            for (var i = (start || 0), j = this.length; i < j; i++) {
	                if (this[i] === obj) {
	                    return i;
	                }
	            }
	            return -1;
	        };
	    }
		
		var dropdownsToUpdate = [];
		var selectedAttributes = productDisplayJS.selectedAttributesList[entitledItemId];
		var selectedAttrValues = selectedAttributes[selectedAttrName];
		var dropdownList = productDisplayJS.allDropdownsList[entitledItemId];
		
		// finds out which dropdowns needs to be updated, add to dropdownsToUpdate array
		for (var i=0; i<dropdownList.length; i++) {
			if (productDisplayJS.removeQuotes(dropdownList[i].name) != productDisplayJS.removeQuotes(selectedAttrName)) {
				dropdownsToUpdate.push(dropdownList[i]);
			}
		}
		
		//Finds out which attributes are entitled and add them to list of enabled
		var attributesToEnable = new Object();
		for (var x in productDisplayJS.entitledItems) {
			var Attributes = productDisplayJS.entitledItems[x].Attributes;

			// Turn Attributes into object
			var attrList = new Object();
			for (var y in Attributes) {
				var index = y.indexOf("_|_");
				var entitledDropdownName = y.substring(0, index);
				var entitledDropdownValue = y.substring(index + 3);
				
				attrList[entitledDropdownName] = entitledDropdownValue;
			}
			
			for (var attrName in attrList) {
				//the current entitled item has the selected attribute value
				if (productDisplayJS.removeQuotes(attrName) == productDisplayJS.removeQuotes(selectedAttrName)
						&& (attrList[attrName] == selectedAttrValue || selectedAttrValue == '')) {
					//go through the other attributes that are available to the selected attribute
					for (var attrName2 in attrList) {
						var attrName2NQ = productDisplayJS.removeQuotes(attrName2);
						//only check the non-selected attribute
						if (productDisplayJS.removeQuotes(attrName) != attrName2NQ){ 
							// Find all entitled items that match the current list of selected attributes other than attrName2
							var matchSelectedAttributes = true;
							for (var selected in selectedAttributes) {
								if (productDisplayJS.removeQuotes(selected) != attrName2NQ) {
									if (selectedAttributes[selected] && selectedAttributes[selected] !== attrList[selected]) {
										matchSelectedAttributes = false;
									}
								}				
							}
							
							// Find all enabled values for the unselected attributes
							if (matchSelectedAttributes && attrList[attrName2]) {
								if (!attributesToEnable[attrName2NQ]) {
									attributesToEnable[attrName2NQ] = [];
								} 
								if (attributesToEnable[attrName2NQ].indexOf(attrList[attrName2].replace(/^\s+|\s+$/g, '')) == -1) {
									attributesToEnable[attrName2NQ].push(attrList[attrName2].replace(/^\s+|\s+$/g, ''));
								}
							}							
						}
					}
				}
			}
		}				
		
		//Flag all attributes that should be enabled as enabled
		for (var i in dropdownsToUpdate) {
			var attrValues = attributesToEnable[productDisplayJS.removeQuotes(dropdownsToUpdate[i].name)];
			if (attrValues) {
				for (var j = 0; j < dropdownsToUpdate[i].options.length; j++) {										
					var dropdownToUpdateOption = dropdownsToUpdate[i].options[j];
					if (attrValues.indexOf(dropdownToUpdateOption.value.replace(/^\s+|\s+$/g, '')) != -1 || dropdownToUpdateOption.value == '') {
						dropdownToUpdateOption.enabled = true;
					}
				}
			}
		}
			
		//Set all dropdown options that are enabled to disabled = false, others to disabled = true
		for (var i in dropdownsToUpdate) {
			if (dropdownsToUpdate[i].options) {
				for (var j = 0; j < dropdownsToUpdate[i].options.length; j++) {
					var dropdownToUpdateOption = dropdownsToUpdate[i].options[j];
					
					if (dropdownToUpdateOption.enabled) {
						dropdownToUpdateOption.disabled = false;
					} else {
						dropdownToUpdateOption.disabled = true;
					}
					
					delete dropdownToUpdateOption.enabled;
				}
				
				var dropdown = dijit.byNode(dropdownsToUpdate[i].node);
				dropdown.startup();				
			}
		}
	},

	/**
	* Constructs record and add to this.allSwatchesArray.
	* @param {String} swatchName The name of the swatch attribute.
	* @param {String} swatchValue The value of the swatch attribute.	
	* @param {String} swatchImg1 The path to the swatch image.
	**/
	addToAllSwatchsArray: function(swatchName, swatchValue, swatchImg1, entitledItemId, swatchDisplayValue) {
		var swatchList = this.allSwatchesArrayList[entitledItemId];
		if(swatchList == null){
			swatchList = new Array();;
		}
		if (!this.existInAllSwatchsArray(swatchName, swatchValue, swatchList)) {
			var swatchRecord = new Array();
			swatchRecord[0] = swatchName;
			swatchRecord[1] = swatchValue;
			swatchRecord[2] = swatchImg1;
			swatchRecord[4] = document.getElementById("swatch_link_" + entitledItemId + "_" + swatchValue).onclick;
			swatchRecord[5] = null;
			swatchRecord[6] = swatchDisplayValue;
			swatchList.push(swatchRecord);
			this.allSwatchesArrayList[entitledItemId] = swatchList;
		}
	},

	/**
	* Constructs record and add to this.allDropdownsArray.
	* @param {String} attributeName The name of the dropdown attribute.
	* @param {String} dropdownId The id of the dropdown.	
	**/
	addToAllDropdownsArray: function(attributeName, dropdownId, entitledItemId) {
		var dropdownList = this.allDropdownsList[entitledItemId];
		if(dropdownList == null){
			dropdownList = new Array();
		}

		var dropdownNode = productDisplayJS.findDropdownById(dropdownId);
		
		if (!this.existInAllDropdownsArray(attributeName, dropdownId, dropdownList)) {
			dropdownList.push({
				name: attributeName,
				id: dropdownId,
				node: dropdownNode,
				options: dijit.byNode(dropdownNode).getOptions(),
			});
			this.allDropdownsList[entitledItemId] = dropdownList;
		}		
	},

	/**
	* Checks if a swatch is already exist in this.allSwatchesArray.
	* @param {String} swatchName The name of the swatch attribute.
	* @param {String} swatchValue The value of the swatch attribute.		
	* @return boolean Value indicating whether or not the specified swatch name and value exists in the allSwatchesArray.
	*/
	existInAllSwatchsArray: function(swatchName, swatchValue, swatchList) {
		for(var i=0; i<swatchList.length; i++) {
			var attrName = swatchList[i][0];
			var attrValue = swatchList[i][1];
			if (attrName == swatchName && attrValue == swatchValue) {
				return true;
			}
		}
		return false;
	},
	
	/**
	* Checks if a dropdown already exists in this.allDropdownsArray.
	* @param {String} dropdownName The name of the dropdown.
	* @param {String} dropdownId The id of the dropdown.		
	* @return boolean Value indicating whether or not the specified dropdown name and value exists in the allDropdownsArray.
	*/
	existInAllDropdownsArray: function(dropdownName, dropdownId, dropdownsList) {
		for(var i=0; i<dropdownsList.length; i++) {
			if (dropdownsList[i].name == dropdownName && dropdownsList[i].id == dropdownId) {
				return true;
			}
		}
		return false;
	},
	
	/**
	* Check the entitledItems array and pre-select the first entitled SKU as the default swatch selection.
	* @param {String} entitledItemId The ID of the SKU.
	* @param {String} doNotDisable The name of the swatch attribute that should never be disabled.		
	**/
	makeDefaultSwatchSelection: function(entitledItemId, doNotDisable) {
		if (this.entitledItems.length == 0) {
			if (dojo.byId(entitledItemId)!=null) {
				 entitledItemJSON = eval('('+ dojo.byId(entitledItemId).innerHTML +')');
			}
			productDisplayJS.setEntitledItems(entitledItemJSON);
		}
		
		// need to make selection for every single swatch
		for(x in this.entitledItems){
			var Attributes = this.entitledItems[x].Attributes;
			for(y in Attributes){
				var index = y.indexOf("_|_");
				var swatchName = y.substring(0, index);
				var swatchValue = y.substring(index+3);
				this.makeSwatchSelection(swatchName, swatchValue, entitledItemId, doNotDisable, null, imageField);
			}
			break;
		}
	},
	
	/**
	* Update swatch images - this is called after selection of a swatch is made, and this function checks for
	* entitlement and disable swatches that are not available
	* @param {String} selectedAttrName The attribute that is selected
	* @param {String} entitledItemId The ID of the SKU.
	* @param {String} doNotDisable The name of the swatch attribute that should never be disabled.	
	**/
	updateSwatchImages: function(selectedAttrName, entitledItemId, doNotDisable,imageField) {
		var swatchToUpdate = new Array();
		var selectedAttributes = productDisplayJS.selectedAttributesList[entitledItemId];
		var selectedAttrValue = selectedAttributes[selectedAttrName];
		var swatchList = productDisplayJS.allSwatchesArrayList[entitledItemId];
		
		// finds out which swatch needs to be updated, add to swatchToUpdate array
		for(var i=0; i<swatchList.length; i++) {
			var attrName = swatchList[i][0];
			var attrValue = swatchList[i][1];
			var attrImg1 = swatchList[i][2];
			var attrImg2 = swatchList[i][3];
			var attrOnclick = swatchList[i][4];
			var attrDisplayValue = swatchList[i][6];
			
			if (attrName != doNotDisable && attrName != selectedAttrName) {
				var swatchRecord = new Array();
				swatchRecord[0] = attrName;
				swatchRecord[1] = attrValue;
				swatchRecord[2] = attrImg1;
				swatchRecord[4] = attrOnclick;
				swatchRecord[5] = false;
				swatchRecord[6] = attrDisplayValue;
				swatchToUpdate.push(swatchRecord);
			}
		}
		
		// finds out which swatch is entitled, if it is, image should be set to enabled
		// go through entitledItems array and find out swatches that are entitled 
		for (x in productDisplayJS.entitledItems) {
			var Attributes = productDisplayJS.entitledItems[x].Attributes;

			for(y in Attributes){
				var index = y.indexOf("_|_");
				var entitledSwatchName = y.substring(0, index);
				var entitledSwatchValue = y.substring(index+3);	
				
				//the current entitled item has the selected attribute value
				if (entitledSwatchName == selectedAttrName && entitledSwatchValue == selectedAttrValue) {
					//go through the other attributes that are available to the selected attribute
					//exclude the one that is selected
					for (z in Attributes) {
						var index2 = z.indexOf("_|_");
						var entitledSwatchName2 = z.substring(0, index2);
						var entitledSwatchValue2 = z.substring(index2+3);
						
						if(y != z){ //only check the attributes that are not the one selected
							for (i in swatchToUpdate) {
								var swatchToUpdateName = swatchToUpdate[i][0];
								var swatchToUpdateValue = swatchToUpdate[i][1];
								
								if (entitledSwatchName2 == swatchToUpdateName && entitledSwatchValue2 == swatchToUpdateValue) {
									swatchToUpdate[i][5] = true;
								}
							}
						}
					}
				}
			}
		}

		// Now go through swatchToUpdate array, and update swatch images
		var disabledAttributes = [];
		for (i in swatchToUpdate) {
			var swatchToUpdateName = swatchToUpdate[i][0];
			var swatchToUpdateValue = swatchToUpdate[i][1];
			var swatchToUpdateImg1 = swatchToUpdate[i][2];
			var swatchToUpdateImg2 = swatchToUpdate[i][3];
			var swatchToUpdateOnclick = swatchToUpdate[i][4];
			var swatchToUpdateEnabled = swatchToUpdate[i][5];		
			
			if (swatchToUpdateEnabled) {
				if(document.getElementById("swatch_" + entitledItemId + "_" + swatchToUpdateValue).className != "color_swatch_selected"){
					var swatchElement = dojo.byId("swatch_" + entitledItemId + "_" + swatchToUpdateValue);
					swatchElement.className = "color_swatch";
					swatchElement.src = swatchElement.src.replace("_disabled.png","_enabled.png");
					
					//change the title text of the swatch link
					dojo.byId("swatch_link_" + entitledItemId + "_" + swatchToUpdateValue).title = swatchElement.alt;
				}
				document.getElementById("swatch_link_" + entitledItemId + "_" + swatchToUpdateValue).setAttribute("aria-disabled", "false");
				document.getElementById("swatch_link_" + entitledItemId + "_" + swatchToUpdateValue).onclick = swatchToUpdateOnclick;
			} else {
				if(swatchToUpdateName != doNotDisable){
					var swatchElement = dojo.byId("swatch_" + entitledItemId + "_" + swatchToUpdateValue);
					var swatchLinkElement = dojo.byId("swatch_link_" + entitledItemId + "_" + swatchToUpdateValue);
					swatchElement.className = "color_swatch_disabled";					
					swatchLinkElement.onclick = null;
					swatchElement.src = swatchElement.src.replace("_enabled.png","_disabled.png");
					
					//change the title text of the swatch link
					var titleText = storeNLS["INV_ATTR_UNAVAILABLE"];
					swatchLinkElement.title = dojo.string.substitute(titleText,{0: swatchElement.alt});
					
					document.getElementById("swatch_link_" + entitledItemId + "_" + swatchToUpdateValue).setAttribute("aria-disabled", "true");
					
					//The previously selected attribute is now unavailable for the new selection
					//Need to switch the selection to an available value
					if(selectedAttributes[swatchToUpdateName] == swatchToUpdateValue){
						disabledAttributes.push(swatchToUpdate[i]);
					}
				}
			}
		}
		
		//If there were any previously selected attributes that are now unavailable
		//Find another available value for that attribute and update other attributes according to the new selection
		for(i in disabledAttributes){
			var disabledAttributeName = disabledAttributes[i][0];
			var disabledAttributeValue = disabledAttributes[i][1];

			for (i in swatchToUpdate) {
				var swatchToUpdateName = swatchToUpdate[i][0];
				var swatchToUpdateValue = swatchToUpdate[i][1];
				var swatchToUpdateDisplayValue = swatchToUpdate[i][6];
				var swatchToUpdateEnabled = swatchToUpdate[i][5];	
				
				if(swatchToUpdateName == disabledAttributeName && swatchToUpdateValue != disabledAttributeValue && swatchToUpdateEnabled){
						productDisplayJS.makeSwatchSelection(swatchToUpdateName, swatchToUpdateValue, entitledItemId, doNotDisable, swatchToUpdateDisplayValue, imageField);
					break;
				}
			}
		}
	},
	/* SwatchCode end */

	/**
	 * This method will display and format the repeat delivery price for a catentry id
	 *
	 *
	 */
	isRdProduct : false,
	isAddOnToggleCallMade : false,	
	displayRDPrice : function(catentry_id, productId, rdFlag, rdPrice, rdSavings){
			//console.debug('rdFlag in ProductDisplay.displayRDPrice == ' + rdFlag.value);
			var innerHTML = "";
			if(rdFlag.value != null && rdFlag.value != undefined && rdFlag.value == '0')
			{
				var rdPriceDiv =  dojo.byId('product-price-rd');

				if(document.getElementById('rdPriceDiv') != null && document.getElementById('rdPriceDiv') != undefined)
				{
					rdPriceDiv.setAttribute("class","product-price");
					if(rdPrice.price != null && rdPrice.price != undefined && rdPrice.price != 'Price pending')
					{
						var itemRDClass = '';
						if(document.getElementById('itemOrProd') != null && document.getElementById('itemOrProd') != undefined){
							var itemOrProd = document.getElementById('itemOrProd').value;
							itemRDClass = (itemOrProd == 'Item') ? 'item-rd-price' : '';
						}
						document.getElementById('rdPriceDiv').innerHTML="<span class='product-price-rddetail "+itemRDClass+"'>"+rdPrice.price+"</span>"
						+ "<span class='rd-logo'>"+ MessageHelper.messages["REPEAT_DELIVERY_CART"] +"</span> <span>"+ productDisplayJS.allItemPricesOject[catentry_id].savingsOnRDPrice +"</span>";
					
						if(rdSavings != ""){
							document.getElementById('rdPriceDiv').innerHTML = document.getElementById('rdPriceDiv').innerHTML + " <span class='product-price-banner'><img src='/wcsstore/PetcoSAS/img/r-d-logo.png' alt='Repeat Delivery'/></span>";
						}
					}
					else
					{
						document.getElementById('rdPriceDiv').innerHTML="<span class='form-required'>Price pending</span>";
					}
				}
				//var rdDeliverySelectDiv =  dojo.byId('repeat-delivery-select');
				//rdDeliverySelectDiv.setAttribute("class","repeat-delivery-select");
				productDisplayJS.isRdProduct = true;
				
				if(dojo.byId("rd-option-container")!= null){
					dojo.removeClass("rd-option-container","hide");
					dojo.addClass("rd-option-container","show");
				}
				
				
				if(!productDisplayJS.isAddOnToggleCallMade){
					dojo.topic.subscribe("ajax_usertype_changed", function(usertypes){
						productDisplayJS.toggleAddonButton();	 
						
					});
					productDisplayJS.isAddOnToggleCallMade = true;
				}
				productDisplayJS.toggleAddonButton();
			}
			else
			{
				productDisplayJS.isRdProduct = false;
				if(dojo.byId("rd-option-container")!= null){
					dojo.addClass("rd-option-container","hide");
					dojo.removeClass("rd-option-container","show");
					
					if($('#repeat-delivery-radio:checked.rd-option-input').length > 0){
						if($("input#store-pickup:checked").length == 0 && $("#repeat-delivery-select.instore-deliveryBox").length == 0 && $("#repeat-delivery-select.paramStore-deliveryBox").length == 0 ){
							document.getElementById("one-time-delivery").click();
						}
						
					}
					
				}
				//var rdDeliverySelectDiv =  dojo.byId('repeat-delivery-select');
				//rdDeliverySelectDiv.setAttribute("class","repeat-delivery-select hide");
				var rdPriceDiv =  dojo.byId('product-price-rd');
				if(document.getElementById('rdPriceDiv') != null && document.getElementById('rdPriceDiv') != undefined)
					rdPriceDiv.setAttribute("class","product-price hide");

			}
			//Changes-PJRESP-2027
			if(undefined != document.getElementById('rd-item-price') ){
				var catEntry = productDisplayJS.itemPriceJsonOject[catentry_id].catalogEntry;
				if("" !=catEntry.listPrice ){
					var ltPrice = catEntry.listPrice.replace ('\$', '');
					var bestPrice = rdPrice.price.replace ('\$', '');
					if(parseFloat(bestPrice) < parseFloat(ltPrice)){
						document.getElementById("best-price").className = "best-price show";
					}
				}else if ("" != catEntry.offerPrice){
					var ofrPrice = catEntry.offerPrice.replace ('\$', '');
					var bestPrice = rdPrice.price.replace ('\$', '');
					if(parseFloat(bestPrice) < parseFloat(ofrPrice)){
						document.getElementById("best-price").className = "best-price show";
					}
				}
				if(rdPrice.price != null && rdPrice.price != undefined && rdPrice.price != 'Price pending'){
					innerHTML = '<span class="product-price-rdradio">'+ rdPrice.price+'</span>';
				}
				document.getElementById("rd-item-price").innerHTML = innerHTML;
			}
			if($('#rd-next-item-price .product-price-rdradio').length != 0){
				if(rdPrice.price != null && rdPrice.price != undefined && rdPrice.price != 'Price pending'){
					$('#rd-next-item-price .product-price-rdradio')[0].innerHTML = rdPrice.price;
				}
			}
			if(document.getElementById('itemOrProd') != null && document.getElementById('itemOrProd') != undefined){
				var itemOrProd = document.getElementById('itemOrProd').value;
				if(itemOrProd == 'Prod' && productDisplayJS.canSwapProductPriceDiv){
					var productPriceNormal = $('#pdp-product-info .product-price-normal');
					var productPriceRD = $('#pdp-product-info #product-price-rd');
					
					if(productPriceNormal != null && productPriceNormal != undefined && productPriceRD != null && productPriceRD != undefined){
						var productPriceNormalCopy = productPriceNormal.clone();
						var productPriceRDCopy = productPriceRD.clone();
							productPriceNormal.replaceWith(productPriceRDCopy);
						    productPriceRD.replaceWith(productPriceNormalCopy);
					}
				}
			}
			
	},
	toggleAddonButton : function(){
		if("R" == dojo.cookie("WC_UserType") ){
			var hasIos = false;
			require(["dojo/has", "dojo/sniff"], function(has){
				var iosVal = has("ios");
				  if(typeof(iosVal)!= "undefined" && iosVal != null && iosVal){
					hasIos=true;
				  }else{
					hasIos=false;
				  }
			});
			var nextRepeatedDeliveryDateCookie = "NEXT_REPEAT_DELIVERY_DATE";
			var  palsPointCookie = "PALS_POINTS";
			var nextRepeatedDeliveryDateCookieValue;
			if(typeof(localStorageHelper) != "undefined"){
				nextRepeatedDeliveryDateCookieValue = localStorageHelper.get(nextRepeatedDeliveryDateCookie,hasIos);
			}
			palsPointCookieValue = localStorageHelper.get(palsPointCookie,hasIos);
			if (null != nextRepeatedDeliveryDateCookieValue
				&& nextRepeatedDeliveryDateCookieValue
				&& 	nextRepeatedDeliveryDateCookieValue != ""
				&&  nextRepeatedDeliveryDateCookieValue != 'none'
				&& 	nextRepeatedDeliveryDateCookieValue != 'paused') {
				var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
				var nextDate = localStorageHelper.get(nextRepeatedDeliveryDateCookie,hasIos);
				var dateString = nextDate.replace(/-/g, '/')+" 00:00:00";
				var nextDateVal =  new Date(dateString);
				var isnotify = false;
				if(dojo.byId("notifybutton") != null){
					isnotify = dojo.hasClass(dojo.byId("notifybutton"),'show');
				}
				
				if($('#rd-add-on').length >0){
					if(!isnotify){
						document.getElementById("rd-add-on").className = "radio rd-option show";
					}else{
						document.getElementById("rd-add-on").className = "radio rd-option hide";
					}
				}
					var innerHTML = months[nextDateVal.getMonth()]+" "+nextDateVal.getDate()+", "+ nextDateVal.getFullYear();
					if(document.getElementById('rd-next-date') != null && typeof(months[nextDateVal.getMonth()]) != "undefined"){
						document.getElementById("rd-next-date").innerHTML = innerHTML;
					}
			}else{
				var aParams = [],
				bUpdateCookies = false,
				nextRepeatedDeliveryDateCookieValue = localStorageHelper.get(nextRepeatedDeliveryDateCookie,hasIos);
				if (dojo.cookie("WC_UserType")  === 'R') {
					// Set the langId in the aParams array
					aParams.langId = WCParamJS.langId;
					// Set the storeId in the aParams array
					aParams.storeId = WCParamJS.storeId;
					// Set the catalogId in the aParams array
					aParams.catalogId = WCParamJS.catalogId;
					// Set the palsPointCookie name "PALS_POINTS" in the aParams array
					aParams.palsPointCookie = palsPointCookie;
					// Set the nextRepeatedDeliveryDateCookie name "NEXT_REPEAT_DELIVERY_DATE" in the aParams array
					aParams.nextRepeatedDeliveryDateCookie = nextRepeatedDeliveryDateCookie;
					// If the bUpdateCookies is true or there are no cookies set for pals points or repeat delivery,
					// call the service and add the cookies and their values
					if(bUpdateCookies || palsPointCookieValue == null || nextRepeatedDeliveryDateCookieValue == null){
						aParams.updateCookies = true;
						wc.service.invoke("AjaxPetcoPalsRewardsPointsSubscription",aParams);
					}
				}
			}
		}
	},
	/**
	 * This method will calculate the savings on catentry Id between crossed out list price and offer price
	 * This will also calculate the savings for an RD product between the crossed out list price and offer price
	 *
	 * @param {string} catEntryId The identifier of the sku.
	 * @param {string} productId The identifier of the product.
	 */

	calculateSavings: function(catEntryId, productId){

		var rdPriceObject = productDisplayJS.entitledItems;
		var entitledItemIdsObject = document.getElementById("entitledItem_"+productId);
		var entitledItemIds = eval('('+entitledItemIdsObject.innerHTML +')');
		rdPriceObject = entitledItemIds;
		//collecting required pricing information
		productDisplayJS.allItemPricesOject[catEntryId] = [];
		productDisplayJS.allItemPricesOject[catEntryId].catalogEntryIdentifier = productDisplayJS.itemPriceJsonOject[catEntryId].catalogEntry.catalogEntryIdentifier;
		productDisplayJS.allItemPricesOject[catEntryId].listPrice = productDisplayJS.itemPriceJsonOject[catEntryId].catalogEntry.listPrice;
		productDisplayJS.allItemPricesOject[catEntryId].offerPrice = productDisplayJS.itemPriceJsonOject[catEntryId].catalogEntry.offerPrice;
		productDisplayJS.allItemPricesOject[catEntryId].listPriced = productDisplayJS.itemPriceJsonOject[catEntryId].catalogEntry.listPriced;
		for(var i=0; i<rdPriceObject.length; i++){
			if(rdPriceObject[i].catentry_id == catEntryId){
				productDisplayJS.allItemPricesOject[catEntryId].RepeatDeliveryPrice = rdPriceObject[i].RepeatDeliveryPrice;
				productDisplayJS.allItemPricesOject[catEntryId].RepeatDeliveryFlag = rdPriceObject[i].RepeatDeliveryFlag;
			}
		}

		//calculate savings for the catentry

		if(productDisplayJS.allItemPricesOject[catEntryId].listPriced
				//&& (productDisplayJS.allItemPricesOject[catEntryId].listPrice > productDisplayJS.allItemPricesOject[catEntryId].offerPrice)
				&& productDisplayJS.allItemPricesOject[catEntryId].listPrice != ""){

			var listPrice = productDisplayJS.allItemPricesOject[catEntryId].listPrice.replace('$','');
			listPrice = parseFloat(listPrice.split(",").join(""));
			var offerPrice = productDisplayJS.allItemPricesOject[catEntryId].offerPrice.replace('$','');
			offerPrice = parseFloat(offerPrice.split(",").join(""));

			var savings = ((listPrice-offerPrice)*100)/listPrice;

			if(savings > 0 && savings < 100)
				productDisplayJS.allItemPricesOject[catEntryId].savingsOnOfferPrice = "save " +Math.round(savings) + "%";
			else
				productDisplayJS.allItemPricesOject[catEntryId].savingsOnOfferPrice = "";

		}else{
			productDisplayJS.allItemPricesOject[catEntryId].savingsOnOfferPrice = "";
		}

		//calculate savings on Repeat Delivery Price
		if(productDisplayJS.allItemPricesOject[catEntryId].RepeatDeliveryPrice.price != ""
			&& productDisplayJS.allItemPricesOject[catEntryId].listPrice != ""
				//&& productDisplayJS.allItemPricesOject[catEntryId].listPrice > productDisplayJS.allItemPricesOject[catEntryId].RepeatDeliveryPrice.price
				){

			var listPrice = productDisplayJS.allItemPricesOject[catEntryId].listPrice.replace('$','');
			listPrice = parseFloat(listPrice.split(",").join(""));
			var rdPrice = productDisplayJS.allItemPricesOject[catEntryId].RepeatDeliveryPrice.price.replace('$','');
			rdPrice = parseFloat(rdPrice.split(",").join(""));

			var rdSavings = ((listPrice-rdPrice)*100)/listPrice;

			if(rdSavings > 0 && rdSavings < 100)
				productDisplayJS.allItemPricesOject[catEntryId].savingsOnRDPrice = "save " +Math.round(rdSavings) + "%";
			else
				productDisplayJS.allItemPricesOject[catEntryId].savingsOnRDPrice = "";

		}else{
			productDisplayJS.allItemPricesOject[catEntryId].savingsOnRDPrice = "";
		}

		console.log(productDisplayJS.allItemPricesOject);
	},

	/**
	* Displays price of the attribute selected with the catalog entry id.
	* 
	* @param {string} catEntryId The identifier of the sku.
	* @param {string} productId The identifier of the product.
	*/	
	displayPrice : function(catEntryId, productId){
		var catEntry = productDisplayJS.itemPriceJsonOject[catEntryId].catalogEntry;
	var isBopusProduct = catEntry.isBopusProduct;
	var isFrozenProduct = catEntry.isFrozenProduct;
		var tempString;
		var popup = productDisplayJS.isPopup;
		var priceEnabled = document.getElementById('priceEnabled_'+productId);

		var inStoreSku = false;
		for (x in productDisplayJS.entitledItems) {
			var catId = productDisplayJS.entitledItems[x].catentry_id;
			if(catId == catEntryId){
				var inStore = productDisplayJS.entitledItems[x].InStoreOnly;
				if(inStore == 'true'){
					inStoreSku = true;
				}
			}
		}
		var omnitureFlag = document.getElementById('omnitureEnabled');
		var omnitureEnabled = '';
		if(omnitureFlag != null && omnitureFlag != "undefined"){
		 omnitureEnabled = omnitureFlag.value; }
		var deliveryMsgWrapperBopus = dojo.byId("splDelvMsgWrapperBopus");
		var priceDiv = dojo.byId("price_display_"+productId);
		var pdpProductAttributes = dojo.byId("pdp-product-attributes_id");
		var pdpProductFeatures = dojo.byId("pdp-product-features_id");
		var repeatDeliverySelect = dojo.byId("repeat-delivery-select");
		var priceMatchGuarantee = dojo.byId("PriceMatchGuarantee");
		var pricestackpromo2 = dojo.byId("pricestack-promo-2");
		var pricestackpromo1 = dojo.byId("pricestack-promo-1");
		var atcControls = dojo.byId("add-to-controls");
		var inStoreNoticeBox = dojo.byId("inStoreNoticeBox");
		$("#repeat-delivery-select").removeClass("instore-deliveryBox");
		$("#repeat-delivery-select").removeClass("paramStore-deliveryBox");
		if(!inStoreSku || (inStoreSku && isBopusProduct== 'yes' )){
			$("div#pdp_atc").addClass("show");
			$("div#pdp_atc").removeClass("hide");
			$(atcControls).css("display","block");
			if(inStoreSku && isBopusProduct== 'yes' && isFrozenProduct == 'yes'){
				$("#frozenFood").addClass("show");
				$("#frozenFood").removeClass("hide");
				$("span.selectableBopusSection").addClass("hide");
				$("span.selectableBopusSection").removeClass("show");
				$("div#pdp_atc").removeClass("show");
				$("div#pdp_atc").addClass("hide");
				$(atcControls).css("display","none");
			}else if(isBopusProduct== 'yes' && isFrozenProduct == 'no'){
				$("#frozenFood").addClass("hide");
				$("#frozenFood").removeClass("show");
				$("span.selectableBopusSection").addClass("show");
				$("span.selectableBopusSection").removeClass("hide");
			}
			if(pdpProductAttributes != null){
				dojo.removeClass(pdpProductAttributes,"hide");
				dojo.addClass(pdpProductAttributes,"show");
			}
			if(pdpProductFeatures != null){
				dojo.removeClass(pdpProductFeatures,"hide");
				dojo.addClass(pdpProductFeatures,"show");
			}
			if(repeatDeliverySelect != null){
				dojo.removeClass(repeatDeliverySelect,"hide");
				dojo.addClass(repeatDeliverySelect,"show");
			}			
			if(priceMatchGuarantee != null && null != dojo.byId("pdp-persistent-container") && !dojo.hasClass("pdp-persistent-container","fixed")){
				dojo.addClass(priceMatchGuarantee,"show");
				dojo.removeClass(priceMatchGuarantee,"hide");
 			}
			
			if(pricestackpromo2 != null && null != dojo.byId("pdp-persistent-container") && !dojo.hasClass("pdp-persistent-container","fixed")){
				dojo.addClass(pricestackpromo2,"show");
				dojo.removeClass(pricestackpromo2,"hide");
 			}
			
			if(pricestackpromo1 != null && null != dojo.byId("pdp-persistent-container") && !dojo.hasClass("pdp-persistent-container","fixed")){
				dojo.addClass(pricestackpromo1,"show");
				dojo.removeClass(pricestackpromo1,"hide");
 			}
			
			
			if(inStoreNoticeBox != null){
				dojo.addClass(inStoreNoticeBox,"hide");
				dojo.removeClass(inStoreNoticeBox,"show");
			}
			if(null != atcControls){
				 dojo.style(atcControls, "display", "block");
			}
			/* Available Online / NOT In Store Only */
			if(null != priceDiv){
				 dojo.style(priceDiv, "display", "block");
			}
			 if(null != dojo.byId("inStoreMessaging")){
				 dojo.style("inStoreMessaging", "display", "none");
			 }
			 if(null != dojo.byId("inStoreMessagingforfixedscroll")){
				 dojo.removeClass(dojo.byId("inStoreMessagingforfixedscroll"),'showonscrollforinstock');
				 if(null != dojo.byId("pdp-persistent-container") && dojo.hasClass("pdp-persistent-container","fixed")){
						document.getElementById("inStoreMessagingforfixedscroll").classList.add("hide");
						document.getElementById("inStoreMessagingforfixedscroll").classList.remove("show");
					}
			 }


			if(dojo.byId("inStoreMessaging") != null && dojo.byId("repeat-delivery-select") != null){
				dojo.place(dojo.byId("inStoreMessaging"),dojo.byId("repeat-delivery-select"),'before');
				dojo.addClass(dojo.byId("repeat-delivery-select"),'show');
			}

			if(popup == true){
				document.getElementById('productPrice').innerHTML = catEntry.offerPrice;				
			}
			if(popup == false){
				// added for special product with hide price property true - starts;
				if(priceEnabled!='undefined' && priceEnabled!=null){
					if(priceEnabled.value == "true"){
						if(document.getElementById('product-price_'+productId) != null && document.getElementById('product-price_'+productId) != undefined)
							document.getElementById('product-price_'+productId).innerHTML = "See price in cart";
						return;
					}
				}
				// added for special product with hide price property true - ends;
				var innerHTML = "";
				var listPrice = dojo.currency.parse(catEntry.listPrice,{symbol: this.currencySymbol});
				var offerPrice = dojo.currency.parse(catEntry.offerPrice,{symbol: this.currencySymbol});
				if(!catEntry.listPriced || listPrice <= offerPrice){					
					innerHTML = "<span id='offerPrice_" + catEntry.catalogEntryIdentifier.uniqueID + "' class='price'>" + catEntry.offerPrice + "</span>";
				}
				else{
					productDisplayJS.calculateSavings(catEntryId, productId);					
					if(catEntry.listPrice != ""){
						innerHTML = "<span id='offerPrice_" + catEntry.catalogEntryIdentifier.uniqueID + "' class='product-price-promo'>" + catEntry.offerPrice + "</span>"
						+ "&nbsp;<span id='listPrice_" + catEntry.catalogEntryIdentifier.uniqueID + "' class='product-price-crossout'>" + "was " + catEntry.listPrice + "</span>"
						+ "&nbsp;<span id='savings_" +catEntry.catalogEntryIdentifier.uniqueID + "' class='product-price-save'>&nbsp;"
						+productDisplayJS.allItemPricesOject[catEntry.catalogEntryIdentifier.uniqueID].savingsOnOfferPrice +"</span>";
						$("#PriceStack-RedPrice").removeClass("hide");
					}else{
						innerHTML = "<span id='offerPrice_" + catEntry.catalogEntryIdentifier.uniqueID + "' class='product-price-promo'>" + catEntry.offerPrice + "</span>"
						+ "&nbsp;<span id='savings_" +catEntry.catalogEntryIdentifier.uniqueID + "' class='product-price-save'>"
						+productDisplayJS.allItemPricesOject[catEntry.catalogEntryIdentifier.uniqueID].savingsOnOfferPrice +"</span>";
					}
					
				}
				// change the old div price_display_'+productId to price div
				if(document.getElementById('product-price_'+productId) != null && document.getElementById('product-price_'+productId) != undefined){
					document.getElementById('product-price_'+productId).innerHTML = innerHTML
					+ "<input type='hidden' id='ProductInfoPrice_" + catEntry.catalogEntryIdentifier.uniqueID + "' value='" + catEntry.offerPrice.replace(/"/g, "&#034;").replace(/'/g, "&#039;") + "'/>";
				}
				innerHTML = "";
				productDisplayJS.allItemPricesOject[catEntry.catalogEntryIdentifier.uniqueID].RepeatDeliveryPrice.price = catEntry.rdPrice;
				productDisplayJS.displayRDPrice(catEntry.catalogEntryIdentifier.uniqueID,productId,
						productDisplayJS.allItemPricesOject[catEntry.catalogEntryIdentifier.uniqueID].RepeatDeliveryFlag,
						productDisplayJS.allItemPricesOject[catEntry.catalogEntryIdentifier.uniqueID].RepeatDeliveryPrice,
						productDisplayJS.allItemPricesOject[catEntry.catalogEntryIdentifier.uniqueID].savingsOnRDPrice);

				if(productDisplayJS.displayPriceRange == true){
					for(var i in catEntry.priceRange){
						if(catEntry.priceRange[i].endingNumberOfUnits == catEntry.priceRange[i].startingNumberOfUnits){
							tempString = storeNLS['PQ_PRICE_X'];
							innerHTML = innerHTML + "<p>" + dojo.string.substitute(tempString,{0: catEntry.priceRange[i].startingNumberOfUnits});
						}
						else if(catEntry.priceRange[i].endingNumberOfUnits != 'null'){
							tempString = storeNLS['PQ_PRICE_X_TO_Y'];
							innerHTML = innerHTML + "<p>" + dojo.string.substitute(tempString,{0: catEntry.priceRange[i].startingNumberOfUnits,
								1: catEntry.priceRange[i].endingNumberOfUnits});
						}
						else{
							tempString = storeNLS['PQ_PRICE_X_OR_MORE'];
							innerHTML = innerHTML + "<p>" + dojo.string.substitute(tempString,{0: catEntry.priceRange[i].startingNumberOfUnits});
						}
						innerHTML = innerHTML + " <span class='price'>" + catEntry.priceRange[i].localizedPrice + "</span></p>";
					}
				}
				if(dojo.byId("ProductInfoPrice_"+catEntry.catalogEntryIdentifier.uniqueID)!=null){
					var itemId=catEntry.catalogEntryIdentifier.uniqueID;
					if(dojo.byId("ProductInfoPrice_"+itemId).value==''){
						if(dojo.byId("offerPrice_"+itemId)!=null)
							dojo.byId("offerPrice_"+itemId).innerHTML='Price pending';
					}
				}
				// Append productId so that element is unique in bundle page, where there can be multiple components
				var quantityDiscount = dojo.byId("productLevelPriceRange_"+productId);
				var itemQuantityDiscount = dojo.byId("itemLevelPriceRange_"+productId);

				// if product level price exists and no section to update item level price
				if(null != quantityDiscount && null == itemQuantityDiscount){
					dojo.style(quantityDiscount, "display", ""); //display product level price range
				}
				// if item level price range is present
				else if("" != innerHTML && null != itemQuantityDiscount){
					innerHTML = storeNLS['PQ_PURCHASE'] + innerHTML;
					itemQuantityDiscount.innerHTML = innerHTML;
					dojo.style(itemQuantityDiscount, "display", "");
					// hide the product level price range
					if(null != quantityDiscount){
						dojo.style(quantityDiscount, "display", "none");
					}
				}
				// if item level price range is not present
				else if("" == innerHTML){
					if(null != itemQuantityDiscount){
						dojo.style(itemQuantityDiscount, "display", "none"); //hide item level price range
					}
					if(null != quantityDiscount){
						dojo.style(quantityDiscount, "display", ""); //display product level price range
					}
				}
			}
			 if(null != dojo.byId("deliveryMsgWrapperBopus")){
				 dojo.style("deliveryMsgWrapperBopus","display","block");
			 }
				
			
			if(inStoreSku){
				$("#repeat-delivery-select").addClass("instore-deliveryBox");
				
				deliveryMsgWrapperBopus.style.display='none';
				
				if($("#store-pickup").length > 0){
					$("#store-pickup")[0].click();
					if(null != atcControls){
						 dojo.style(atcControls, "display", "block");
					}
				}else{
					if(null != atcControls){
						 dojo.style(atcControls, "display", "none");
				}
				}
				if(null != priceDiv){
				 dojo.style(priceDiv, "display", "none");
				}
				if(dojo.byId("inStoreMessaging") != null && dojo.byId("repeat-delivery-select") != null){
					dojo.place(dojo.byId("inStoreMessaging"),dojo.byId("repeat-delivery-select"),'before');
					if(dojo.byId("pdp-product-features_id")!= null && dojo.query("div#inStoreMessaging p.notice-box").length > 0){
						dojo.place(dojo.query("div#inStoreMessaging p.notice-box")[0],dojo.byId("pdp-product-features_id"),"before");
					}				
					$("#inStoreNoticeBox").addClass("show");
					dojo.addClass(dojo.byId("repeat-delivery-select"),'hide');
				}
				
				
				 if(null != dojo.byId("notifyMe"))
					 dojo.style("notifyMe","display","none");
				 if(null != dojo.byId("splDelvMsg"))
					 dojo.style("splDelvMsg","display","none");
				 if(null != dojo.byId("deliveryMsgWrapperBopus"))
					 dojo.style("deliveryMsgWrapperBopus","display","none");
				 
				 
				 
			} 	
		}
		else{ /* Not Available Online / In Store Only */
			// make product availablitity text invisible
			//make In-Store Only Messaging visible
			if(dojo.byId("inStoreMessaging") != null && dojo.byId("repeat-delivery-select") != null){
				
				dojo.place(dojo.byId("inStoreMessaging"),dojo.byId("repeat-delivery-select"),'before');
				dojo.style("inStoreMessaging", "display", "block");
				if(dojo.byId("pdp-product-features_id")!= null && dojo.query("div#inStoreMessaging p.notice-box").length > 0){
					dojo.place(dojo.query("div#inStoreMessaging p.notice-box")[0],dojo.byId("pdp-product-features_id"),"before");
				}				
				dojo.addClass(dojo.byId("repeat-delivery-select"),'hide');
			}
			if(pdpProductAttributes != null){
				dojo.removeClass(pdpProductAttributes,"hide");
				dojo.addClass(pdpProductAttributes,"show");
			}
			if(pdpProductFeatures != null){
				dojo.removeClass(pdpProductFeatures,"hide");
				dojo.addClass(pdpProductFeatures,"show");
			}
			if(repeatDeliverySelect != null){
				dojo.removeClass(repeatDeliverySelect,"show");
				dojo.addClass(repeatDeliverySelect,"hide");
			}
			if(null != priceDiv){
				 dojo.style(priceDiv, "display", "none");
			}
			if(priceMatchGuarantee != null){
				dojo.addClass(priceMatchGuarantee,"hide");
				dojo.removeClass(priceMatchGuarantee,"show");
			}
			
			if(pricestackpromo2 != null){
				dojo.addClass(pricestackpromo2,"hide");
				dojo.removeClass(pricestackpromo2,"show");
			}
			
			if(pricestackpromo1 != null){
				dojo.addClass(pricestackpromo1,"hide");
				dojo.removeClass(pricestackpromo1,"show");
			}
			
			if(null != atcControls){
				 dojo.style(atcControls, "display", "none");
			}
			

			if(dojo.byId("pdp-persistent-container") != null && !dojo.hasClass("pdp-persistent-container","fixed") && inStoreNoticeBox != null){
				dojo.addClass(inStoreNoticeBox,"show");
				dojo.removeClass(inStoreNoticeBox,"hide");
			}
			
			var productAvailabilityDivs = dojo.query(".product-availability");
			if(productAvailabilityDivs.length > 0) {
				var productAvailabilityDiv = productAvailabilityDivs[0];
				dojo.style(productAvailabilityDiv, "display", "none");
			}
			// make product attributes selects (weight, color, size, etc.) invisible
			var attributeInputDivs = dojo.query(".pdp-product-attributes");
			if(attributeInputDivs.length > 0) {
				var attributeInputDiv = attributeInputDivs[0];
				dojo.style(attributeInputDiv, "display", "none");
			}
			
			 if(null != dojo.byId("inStoreMessagingforfixedscroll")){
				 dojo.addClass(dojo.byId("inStoreMessagingforfixedscroll"),'showonscrollforinstock');
				 if(null != dojo.byId("pdp-persistent-container") && dojo.hasClass("pdp-persistent-container","fixed")){
						document.getElementById("inStoreMessagingforfixedscroll").classList.add("show");
						document.getElementById("inStoreMessagingforfixedscroll").classList.remove("hide");
					}
			 }


			// make other delivery-related blocks invisible, since the customer must purchase in-store.
			 if(null != dojo.byId("add-to-controls"))
				 dojo.style("add-to-controls","display","none");
			 if(null != dojo.byId("notifyMe"))
				 dojo.style("notifyMe","display","none");
			 if(null != dojo.byId("pdp_atc"))
				 dojo.style("pdp_atc","display","none");
			 if(null != dojo.byId("splDelvMsg"))
				 dojo.style("splDelvMsg","display","none");
		}
		if(typeof(petcoCommonJS) != 'undefined' ){petcoCommonJS.clearPromotionLessThanZero()}

		//Changes-PJRESP-2027
		if(undefined != document.getElementById('item-price') ){
			if(catEntry.listPrice != ""){
				innerHTML = "<strong>"+ catEntry.offerPrice+"</strong>";
			}else{
				innerHTML = "<strong>"+ catEntry.offerPrice+"</strong>";
			}
			document.getElementById("item-price").innerHTML = innerHTML;
		}
		
		//PDWEB-15852: Display bopus price from price subcore
		if(undefined != document.getElementById('item-price-bopus') ){
			/*if(catEntry.listPrice != ""){
				innerHTML = "<strong>"+ catEntry.offerPrice +"</strong>";
			}else{
				innerHTML = "<strong>"+ catEntry.offerPrice +"</strong>";
			}*/
			innerHTML = "<strong>"+ catEntry.bopusPrice +"</strong>";
			document.getElementById("item-price-bopus").innerHTML = innerHTML;
		}
		/*if($("#pdpInventoryAvaiableitySchema").size()>0 ){
			var offerPrice = catEntry.offerPrice;
			if(offerPrice != null){
				offerPrice = offerPrice.replace('$','');
				
				$('#pdpInventoryAvaiableitySchema').attr('itemtype', 'http://schema.org/Offer');
								
				$('#pdpInventoryAvaiableitySchema span#itemPropCurrency').attr('itemprop', 'priceCurrency');				
				$('#pdpInventoryAvaiableitySchema span#itemPropCurrency').attr('content', 'USD');
				$('#pdpInventoryAvaiableitySchema span#itemPropCurrency').text = '$';
								
				$('#pdpInventoryAvaiableitySchema span#itemPropPrice').attr('itemprop', 'price');				
				$('#pdpInventoryAvaiableitySchema span#itemPropPrice').attr('content', offerPrice);	
			}
		}*/
	},addBOPUSDetailsForInstock : function(stateVal){
		if($("#repeat-delivery-select.instore-deliveryBox").length == 0 && $("#repeat-delivery-select.paramStore-deliveryBox").length == 0){
			return;
		}
		var catEntryId = productDisplayJS.bopusShowStoreDetailsCatEntryId;
		var productId = 	productDisplayJS.bopusShowStoreDetailsProductId;
		var catEntry = productDisplayJS.itemPriceJsonOject[catEntryId].catalogEntry;
		var isBopusProduct = catEntry.isBopusProduct;
		
		var isBOPUSAreaRestictionItem = catEntry.isBOPUSAreaExcludedItem;
		var isBOPUSAreaRestictionEnabeled = false;
		$("#PDP-Promo5-bopus").addClass("hide");
		if($("#isBOPUSAreaRestictionEnabeled").length > 0 && $("#isBOPUSAreaRestictionEnabeled").val() == 'true'
			&& isBOPUSAreaRestictionItem.toLowerCase() == 'yes' && isBopusProduct.toLowerCase() == 'yes'){
			var states = "";
			if($("#BOPUSAreaRestictionState").length > 0){
				states = $("#BOPUSAreaRestictionState").val();
				var stateArray = states.split(",");
				for(var ix = 0 ; ix < stateArray.length ; ix++){
					if(stateArray[ix] == stateVal){
						isBOPUSAreaRestictionEnabeled = true;
						$("#BOPUSDeliveryDetailsConatiner").addClass("hide");
						$("#BOPUSDeliveryDetailsConatiner").removeClass("show");
						$("#PDP-Promo5-bopus").removeClass("hide");
						if($('#add2CartBtn_bopus').length > 0){
							$('#add2CartBtn_bopus')[0].innerHTML="Not Available";
							$('#add2CartBtn_bopus')[0].disabled = true;
							if($("#store-pickup").length > 0){
								$("#store-pickup")[0].click();
							}
						}
	
					}
				}
			}
			
		}
		
		
		var tempString;
	
		var popup = productDisplayJS.isPopup;
		var priceEnabled = document.getElementById('priceEnabled_'+productId);

		var inStoreSku = false;
		for (x in productDisplayJS.entitledItems) {
			var catId = productDisplayJS.entitledItems[x].catentry_id;
			if(catId == catEntryId){
				var inStore = productDisplayJS.entitledItems[x].InStoreOnly;
				if(inStore == 'true'){
					inStoreSku = true;
				}
			}
		}
		var omnitureFlag = document.getElementById('omnitureEnabled');
		var omnitureEnabled = '';
		if(omnitureFlag != null && omnitureFlag != "undefined"){
		 omnitureEnabled = omnitureFlag.value; }
			
		var priceDiv = dojo.byId("price_display_"+productId);
		var pdpProductAttributes = dojo.byId("pdp-product-attributes_id");
		var pdpProductFeatures = dojo.byId("pdp-product-features_id");
		var repeatDeliverySelect = dojo.byId("repeat-delivery-select");
		var priceMatchGuarantee = dojo.byId("PriceMatchGuarantee");
		var pricestackpromo2 = dojo.byId("pricestack-promo-2");
		var pricestackpromo1 = dojo.byId("pricestack-promo-1");
		var atcControls = dojo.byId("add-to-controls");
		var inStoreNoticeBox = dojo.byId("inStoreNoticeBox");
			if(dojo.byId("inStoreMessaging") != null && dojo.byId("repeat-delivery-select") != null){
				
				dojo.place(dojo.byId("inStoreMessaging"),dojo.byId("repeat-delivery-select"),'before');
				dojo.style("inStoreMessaging", "display", "block");
				if(dojo.byId("pdp-product-features_id")!= null && dojo.query("div#inStoreMessaging p.notice-box").length > 0){
					dojo.place(dojo.query("div#inStoreMessaging p.notice-box")[0],dojo.byId("pdp-product-features_id"),"before");
				}				
				dojo.addClass(dojo.byId("repeat-delivery-select"),'hide');
			}
			if(pdpProductAttributes != null){
				dojo.removeClass(pdpProductAttributes,"hide");
				dojo.addClass(pdpProductAttributes,"show");
			}
			if(pdpProductFeatures != null){
				dojo.removeClass(pdpProductFeatures,"hide");
				dojo.addClass(pdpProductFeatures,"show");
			}
			if(repeatDeliverySelect != null){
				dojo.removeClass(repeatDeliverySelect,"show");
				dojo.addClass(repeatDeliverySelect,"hide");
			}
			if(null != priceDiv){
				 dojo.style(priceDiv, "display", "none");
			}
			if(priceMatchGuarantee != null){
				dojo.addClass(priceMatchGuarantee,"hide");
				dojo.removeClass(priceMatchGuarantee,"show");
			}
			
			if(pricestackpromo1 != null){
				dojo.addClass(pricestackpromo1,"hide");
				dojo.removeClass(pricestackpromo1,"show");
			}
			
			if(pricestackpromo2 != null){
				dojo.addClass(pricestackpromo2,"hide");
				dojo.removeClass(pricestackpromo2,"show");
			}
			
		
			if(null != atcControls){
				 dojo.style(atcControls, "display", "none");
			}
			

			if(dojo.byId("pdp-persistent-container") != null && !dojo.hasClass("pdp-persistent-container","fixed") && inStoreNoticeBox != null){
				dojo.addClass(inStoreNoticeBox,"show");
				dojo.removeClass(inStoreNoticeBox,"hide");
			}
			
			var productAvailabilityDivs = dojo.query(".product-availability");
			if(productAvailabilityDivs.length > 0) {
				var productAvailabilityDiv = productAvailabilityDivs[0];
				dojo.style(productAvailabilityDiv, "display", "none");
			}
			// make product attributes selects (weight, color, size, etc.) invisible
			var attributeInputDivs = dojo.query(".pdp-product-attributes");
			if(attributeInputDivs.length > 0) {
				var attributeInputDiv = attributeInputDivs[0];
				dojo.style(attributeInputDiv, "display", "none");
			}
			
			 if(null != dojo.byId("inStoreMessagingforfixedscroll")){
				 dojo.addClass(dojo.byId("inStoreMessagingforfixedscroll"),'showonscrollforinstock');
				 if(null != dojo.byId("pdp-persistent-container") && dojo.hasClass("pdp-persistent-container","fixed")){
						document.getElementById("inStoreMessagingforfixedscroll").classList.add("show");
						document.getElementById("inStoreMessagingforfixedscroll").classList.remove("hide");
					}
			 }


			 
		
			// make other delivery-related blocks invisible, since the customer must purchase in-store.
			 if(null != dojo.byId("add-to-controls"))
				 dojo.style("add-to-controls","display","none");
			 if(null != dojo.byId("notifyMe"))
				 dojo.style("notifyMe","display","none");
			 if(null != dojo.byId("pdp_atc"))
				 dojo.style("pdp_atc","display","none");
			 if(null != dojo.byId("splDelvMsg"))
				 dojo.style("splDelvMsg","display","none");
		
	},
	/** variable which store the CatEntryId value which is changed when resloving attribute**/
	bopusShowStoreDetailsCatEntryId:"",
	/** variable which store the ProductId value which is changed when resloving attribute**/
	bopusShowStoreDetailsProductId:"",
	/** Flag which confirms that the defining attribute have been resolved**/
	definngaAttributeResolved:false,
	/**  
	 * function that enable and disable the bopus location details area
	 * based on the item reolved from attribute
	**/
	bopusShowStoreDetails:function(catEntryId, productId){
		productDisplayJS.bopusShowStoreDetailsCatEntryId = catEntryId;
		productDisplayJS.bopusShowStoreDetailsProductId = productId;
		if(dojo.byId("catEntryIdForBOPUSModal") != null){
			dojo.byId("catEntryIdForBOPUSModal").value = catEntryId;
		}
		productDisplayJS.definngaAttributeResolved = true;
		var inStoreSku = false;
		for (x in productDisplayJS.entitledItems) {
			var catId = productDisplayJS.entitledItems[x].catentry_id;
			if(catId == catEntryId){
				var inStore = productDisplayJS.entitledItems[x].InStoreOnly;
				if(inStore == 'true'){
					inStoreSku = true;
				}
			}
		}
		
			var BOPUSDeliveryDetailsConatiner = dojo.byId("BOPUSDeliveryDetailsConatiner");
			var isBOPUSHideEle = dojo.byId("isBOPUSHide");
			var isBOPUSHide = true;
			if(isBOPUSHideEle != null && isBOPUSHideEle.value == "no"){
				isBOPUSHide = false;
			}			
			if(productDisplayJS.itemPriceJsonOject[catEntryId].catalogEntry.isBopusProduct == 'yes' && !isBOPUSHide){
				if(BOPUSDeliveryDetailsConatiner !=null){
						dojo.removeClass(BOPUSDeliveryDetailsConatiner,"hide");
						dojo.addClass(BOPUSDeliveryDetailsConatiner,"show");
				}
			}else{
				if(!inStoreSku){
				if(BOPUSDeliveryDetailsConatiner !=null){
						dojo.removeClass(BOPUSDeliveryDetailsConatiner,"show");
						dojo.addClass(BOPUSDeliveryDetailsConatiner,"hide");
						/** PDWEB-14710 if the store pick up radio button is checked and we have to hide bopus container itself for whatever reason 
						 * then select the one-time delivery option automatically **/
						if($('#store-pickup:checked.store-pickup-option-input').length > 0){
							document.getElementById("one-time-delivery").click();
						}
				}				
			}
		}
			var catEntry = productDisplayJS.itemPriceJsonOject[catEntryId].catalogEntry;
			var isBOPUSAreaRestictionItem = catEntry.isBOPUSAreaExcludedItem;
			var isBopusProductTemp =  catEntry.isBopusProduct;
			var isBOPUSAreaRestictionEnabeled = false;
			var stateVal = "";
			if($('#CurrentBOPUSState').length > 0){
				stateVal = $('#CurrentBOPUSState').val();
			}
			$("#PDP-Promo5-bopus").addClass("hide");
			if($("#isBOPUSAreaRestictionEnabeled").length > 0 && $("#isBOPUSAreaRestictionEnabeled").val() == 'true'
				&& isBOPUSAreaRestictionItem.toLowerCase() == 'yes' && isBopusProductTemp.toLowerCase() == 'yes'){
				$("#BOPUSAreaRestictionEnabeledItem").val('yes');
				var states = "";
				if($("#BOPUSAreaRestictionState").length > 0){
					states = $("#BOPUSAreaRestictionState").val();
					var stateArray = states.split(",");
					for(var ix = 0 ; ix < stateArray.length ; ix++){
						if(stateArray[ix] == stateVal){
							isBOPUSAreaRestictionEnabeled = true;
							$("#BOPUSDeliveryDetailsConatiner").addClass("hide");
							$("#BOPUSDeliveryDetailsConatiner").removeClass("show");
							$("#PDP-Promo5-bopus").removeClass("hide");
							if($('#add2CartBtn_bopus').length > 0){
								$('#add2CartBtn_bopus')[0].innerHTML="Not Available";
								$('#add2CartBtn_bopus')[0].disabled = true;
								if($("#store-pickup").length > 0){
									$("#store-pickup")[0].click();
								}
								
							}
			
							
						}
					}
				}
				
			}
	},
	/**  
	 * function which is called when the event ChangeBasedOnLocationCallCompleted is triggered 
	 * from petco.nearest.locations.js whhen the api call is completed.
	 * This function that enable and disable the bopus location details area
	 * 
	**/
	bopusShowStoreDetailsBasedOnLocaltionCallComplete:function(task){
		var iterationCount = 20;
		var inventorySystem = $('#inventorySystem').val();
		var IntervalValue = setInterval(function(){
			if(productDisplayJS.definngaAttributeResolved){
				productDisplayJS.bopusShowStoreDetails(productDisplayJS.bopusShowStoreDetailsCatEntryId,productDisplayJS.bopusShowStoreDetailsProductId);
				if(inventorySystem != -4) {
					if(document.getElementById("isInventoryCallMadeForBopus")!=null && document.getElementById("isInventoryCallMadeForBopus").value == "false" ){
						productDisplayJS.fetchInventoryDetailsFromYIH(productDisplayJS.bopusShowStoreDetailsCatEntryId,productDisplayJS.bopusShowStoreDetailsProductId);
					}
				}
				clearTimeout(IntervalValue);
			}
			if(iterationCount == 0){
				clearTimeout(IntervalValue);
			}		
			iterationCount--;
		},500);
		if(inventorySystem == -4) {
			if(productDisplayJS.definngaAttributeResolved){				
				if(productDisplayJS.bopusInventoryDetailsPopulated == false && productDisplayJS.InventoryDetailsDetailsCallCompleted == true){
					productDisplayJS.fetchInventoryDetailsForAllProducts(productDisplayJS.bopusShowStoreDetailsCatEntryId,productDisplayJS.bopusShowStoreDetailsProductId);
				}
			}
		}
		$("#repeat-delivery-select").removeClass("paramStore-deliveryBox");
		if(task == 'show'){
			if($("#store-pickup").length > 0){
				 var urlParam = window.location.search.substring(1);
				 if( urlParam != "" ){
					 var urlParamArray = urlParam.split("&");
					 for( var i = 0 ; i < urlParamArray.length ; i++ ){
						 var urlParamArrayVal = urlParamArray[i].split("=");
						 if(urlParamArrayVal[0] == 'store_code' && urlParamArrayVal[1].trim() != '' ){
			$("#repeat-delivery-select").addClass("paramStore-deliveryBox");
				$("#store-pickup")[0].click();
			}
		}
				 }
			}
		}
	},

	/**
	* Updates the product name in the NameAndPrice widget. 
	* 
	* @param {string} catEntryId The identifier of the sku.
	* @param {string} productId The identifier of the product.
	*/
	updateProductName: function(catEntryId, productId){
		var catEntry = productDisplayJS.itemPriceJsonOject[catEntryId].catalogEntry;	 
	 
		if(productDisplayJS.isPopup == true){
			document.getElementById('productName').innerHTML = catEntry.description[0].name;
		} else {	 
			if(dojo.query(".top > div[id^='PageHeading_']") != null){
				dojo.query(".top > div[id^='PageHeading_']").forEach(function(node){
					if(node.childNodes != null && node.childNodes.length == 3){
						node.childNodes[1].innerHTML = catEntry.description[0].name;
					}
				});		
			}
			
			var productInfoWidgets = dojo.query("input[id^='ProductInfoName_"+productId+"']");
			if(productInfoWidgets != null){
				for(var i = 0; i<productInfoWidgets.length; i++){				
					if(productInfoWidgets[i] != null){
						productInfoWidgets[i].value = catEntry.description[0].name;
					}
				}
			}
			//PJRESP-3336: Product Name Update
			if(dojo.query("div[id^='PageHeading_']") != null){
				dojo.query("div[id^='PageHeading_']").forEach(function(node){
					if(node.childNodes != null && node.childNodes.length == 3){
						node.childNodes[1].innerHTML = catEntry.description[0].name;
					}
				});
			}
		}
	},
	
	/** 
	* Updates the product part number in the NameAndPrice widget. 
	* 
	* @param {string} catEntryId The identifier of the sku.
	* @param {string} productId The identifier of the product.
	*/	 
	updateProductPartNumber: function(catEntryId, productId){
		var catEntry = productDisplayJS.itemPriceJsonOject[catEntryId].catalogEntry;	 
		var attrCount =0;
		var ptealium = getCookie("ptealiumData");
		if(ptealium != undefined && ptealium != null && ptealium != ""){
	    	var ptealiumArray = ptealium.split("|");
	    	if(ptealiumArray.length == 1){
	    		ptealium = decodeURIComponent(getCookie("pcustData"));
	    		ptealiumArray = ptealium.split("|");
	    	}
	    	if(document.getElementById('NotifyName')!=null){
	    		document.getElementById('NotifyName').value= ptealiumArray[0]+" "+ptealiumArray[1];
	    	}
	    	if(document.getElementById('NotifyEmail')!=null){
	    		document.getElementById('NotifyEmail').value= ptealiumArray[2];
	    	}
	    	if(document.getElementById('sender-name')!=null){
	    		document.getElementById('sender-name').value= ptealiumArray[0]+" "+ptealiumArray[1];
	    	}
	    	if(document.getElementById('sender-email')!=null){
	    		document.getElementById('sender-email').value= ptealiumArray[2];
	    	}
	    }

	
	/*	var reviewBV ="";
		reviewBV =dojo.query('.bv-content-pagination-pages-current');
		var bvReviewCount =0;
		var i=0;
		var j=0;
		 if(reviewBV!=""){
			 bvReviewCount = reviewBV[0].innerHTML;
			 i= bvReviewCount.indexOf("of") ;
			 j = bvReviewCount.indexOf("Reviews") ;
			 if(i>0 && j>3){
				 bvReviewCount = bvReviewCount.substring(i+2,j);
				 utag_data["product_reviews"] =  bvReviewCount;
			 }

		 }*/


		if(productDisplayJS.isPopup == true){
			document.getElementById('productSKUValue').innerHTML = catEntry.catalogEntryIdentifier.externalIdentifier.partNumber;

		} else {
			var partnumWidgets = dojo.query("div[id^='product_SKU_"+productId+"']");

			var tel_product_sku = new Array();
			var product_sku ="";
			if(partnumWidgets != null){
				for(var i = 0; i<partnumWidgets.length; i++){
					if(partnumWidgets[i]){
						partnumWidgets[i].innerHTML = storeNLS['SKU'] + " " + catEntry.catalogEntryIdentifier.externalIdentifier.partNumber;
						product_sku = catEntry.catalogEntryIdentifier.externalIdentifier.partNumber;						
					}
				}
			}
		}
		
	 },
	 
	 updateLtlItemOncHange:function(catEntryId, productId){
		 var iscallMade = false;
		 var catEntry = productDisplayJS.itemPriceJsonOject[catEntryId].catalogEntry;	
		 if(catEntry.isPersonalysedProduct == 'yes'){
				
				if($("#isLTLDeliveryRequired").length > 0){
					$("#isLTLDeliveryRequired").addClass("show");
					$("#isLTLDeliveryRequired").removeClass("hide");
					$("#personalization").val("true");
					$("#ltlproduct").val(catEntryId);
					$("#isltlproduct").val("true");
					var ltlorRxflagCatentryId="";
					if( $("#ltlproduct").length > 0){
	                	ltlorRxflagCatentryId = $("#ltlproduct").val();
	                }
					CheckoutHelperJS.isshowpersonalizationPopup = false;
				  wc.render.updateContext('personilaztionDisplayContext',
			                    {'quantity':$("#quantity_"+productId).val(),
			                    'persAttr':petcoPersonalizationJS.findPersonalizedAttr($("#quantity_"+productId).val()),
			                    'maxUserInputQuantity':petcoPersonalizationJS.findMaxUserInputQuantity(),
								"ltlproduct":ltlorRxflagCatentryId,
								"catentryId":productId}
			                );
				  iscallMade = true;
					
				}
				
			}else if(catEntry.isPersonalysedProduct == 'no'){
				if($("#isLTLDeliveryRequired").length > 0){
					$("#isLTLDeliveryRequired").addClass("hide");
					$("#isLTLDeliveryRequired").removeClass("show");
					$("#personalization").val("false");
					$("#ltlproduct").val("");
					$("#isltlproduct").val("false");
				}
			}
		 var personalization = $("#personalization");
		 var rxmedicine = $("#rxMedicine");
		 if(!iscallMade && personalization.length > 0 && rxmedicine.length > 0 && rxmedicine.val() == "true" && personalization.val() == "true"){
				setTimeout(function(){
					$("#quantity_"+productId).trigger("change");
			},300);
		 }
		 
		 
		 
	 },
	 displayAttributeInfo: function(catEntryId, productId){
	   if(document.getElementById("product_attributes_"+catEntryId)!=null) {
		   var attrLists = document.querySelectorAll(".product-attributes-table");
		   for (var i=0; i<attrLists.length; i++) {
			   attrLists[i].classList.add("hide");
		   }
		   document.getElementById("product_attributes_"+catEntryId).classList.remove("hide");
	   }
	   if(document.getElementById('attrCount')!=null){
				attrCount=document.getElementById('attrCount').value;
				for(var i=1;i<=attrCount;i++){
					if(document.getElementById('catId_'+i)!=null){
						var fagValue = document.getElementById('catId_'+i).value;
						if(fagValue == catEntryId){
							//dojo.style("attrGroupDesc_"+catEntryId,"display","block");
							if(document.getElementById("attrGroupSpecFlag_"+catEntryId)!=null)
								document.getElementById("attrGroupSpec_"+catEntryId).classList.add("active");
							if(document.getElementById("directionsFlag_"+fagValue)!=null)
								document.getElementById("directionsDisp_"+fagValue).classList.add("active");
							if(document.getElementById("warrantyFlag_"+fagValue)!=null)
								document.getElementById("warrantyDisp_"+fagValue).classList.add("active");

							if(document.getElementById("ingredientsDispFlag_"+fagValue)!=null)
								document.getElementById("ingredientsDisp_"+fagValue).classList.add("active");

							if(document.getElementById("guaranteDispFlag_"+fagValue)!=null)
								document.getElementById("guaranteDispFlag_"+fagValue).classList.add("active");

							if(document.getElementById("featuredCntntFlag_"+fagValue)!=null)
								document.getElementById("featuredDisp_"+fagValue).classList.add("active");

							if(document.getElementById("shippingReturns_"+fagValue)!=null)
								document.getElementById("shippingReturns_"+fagValue).classList.add("active");

						}
						else{
							//dojo.style("attrGroupDesc_"+fagValue,"display","none");
							if(document.getElementById("attrGroupSpec_"+fagValue)!=null)
								document.getElementById("attrGroupSpec_"+fagValue).classList.remove("active");
							if(document.getElementById("directionsDisp_"+fagValue)!=null)
								document.getElementById("directionsDisp_"+fagValue).classList.remove("active");
							if(document.getElementById("directionsFlag_"+fagValue)!=null)
								document.getElementById("directionsDisp_"+fagValue).classList.remove("active");
							if(document.getElementById("warrantyFlag_"+fagValue)!=null)
								document.getElementById("warrantyDisp_"+fagValue).classList.remove("active");

							if(document.getElementById("ingredientsDispFlag_"+fagValue)!=null)
								document.getElementById("ingredientsDisp_"+fagValue).classList.remove("active");

							if(document.getElementById("guaranteDispFlag_"+fagValue)!=null)
								document.getElementById("guaranteDispFlag_"+fagValue).classList.remove("active");

							if(document.getElementById("featuredCntntFlag_"+fagValue)!=null)
								document.getElementById("featuredDisp_"+fagValue).classList.remove("active");

							if(document.getElementById("shippingReturns_"+fagValue)!=null)
								document.getElementById("shippingReturns_"+fagValue).classList.remove("active");
						}


					}
				}

				if (document.querySelectorAll(".panel-heading.active")) {
					// Unselect all but the first panel-heading - Note that we unselect both active an inactive headings.
					$(".panel-heading").removeClass("selected");
					// select the first panel-heading
					document.querySelectorAll(".panel-heading.active")[0].classList.add("selected");

					var allPanels = document.querySelectorAll(".panel-heading"),
					 openID = document.querySelectorAll(".panel-heading.active.selected")[0].id,
					 openPanel = document.querySelectorAll("." + openID);


					for (var j=0; j < allPanels.length; j++){
						var current = allPanels[j];
						// Close all of the panels - the first one will be opened below.
						if (current && current.id) {
							$('.' + current.id).removeClass('open');
						}
						if (current.classList.contains('active')) {

							current.onclick = function(e){
								var isSelected = this.classList.contains("selected");
								var isMobile = window.matchMedia( "(max-width: 768px)" ).matches;

								if (!isSelected) {
									var selectedHeadings = document.querySelectorAll(".panel-heading.selected");
									if (selectedHeadings.length > 0) {
										// close the other open panel and de-select it's panel-heading (+/- icon)
										selectedHeadings[0].classList.remove("selected");
										document.querySelectorAll(".panel.open")[0].classList.remove("open");
									}
									// select this panel-heading and open it's panel
									this.classList.add("selected");
									document.querySelectorAll("."+this.id)[0].classList.add("open");

									// On mobile we'll scroll to the top of the accordion when it opens
									if (isMobile) {
										$('html, body').animate({
											scrollTop: $("#"+this.id).offset().top - $('#header').height()
										}, 300);
									}
								} else {
									// if it's mobile and already selected, then collapse.
									if (isMobile && isSelected) {
										this.classList.remove("selected");
										document.querySelectorAll("."+this.id)[0].classList.remove("open");
									}
								}
							}
						}
					}
					openPanel[0].classList.add("open");

					$(window).on("orientationchange",function(event){
						var isMobile = window.matchMedia( "(max-width: 768px)" ).matches;
						if (!isMobile) {
							//desktop view
							var selectedHeadings = document.querySelectorAll(".panel-heading.selected");
							if (selectedHeadings.length === 0) {
								// desktop view and no headings selected, select first panel-heading
								document.querySelectorAll(".panel-heading.active")[0].classList.add("selected");
								var openID = document.querySelectorAll(".panel-heading.active.selected")[0].id,
								 openPanel = document.querySelectorAll("." + openID);
								openPanel[0].classList.add("open");
							}
						}
					});

				}
			}


	 },
	 /**
	  * Creates Desktop Image Tiles.  Intended to be called one time on page render.
	  */
	 initializeImages: function(catEntryId) {
		var images = $('#imagesFor_' + catEntryId).find('input[type="hidden"]');
		var productName="";
		if(document.getElementById("tel_product_name")!=null)
			productName = document.getElementById("tel_product_name").value;
		productName = productName.replace(/'/g, '');
		var that = this;
		images.each(function(i) {
			var imgLink = this.value;
			var imgId = this.id;
			var idparts = /^img_(.*)_(\d+)$/.exec(this.id);
			if (idparts) {
				var sku = idparts[1];
				var imgIndex = idparts[2];
				var flareImg = 1;
				if (imgIndex == 1) {
					if(document.getElementById("flare_" + sku) != null) {
						flareImg = document.getElementById("flare_" + sku).value;
					}
				}
				var imgSource = imgLink + "?$Thumbnail$";
				that.createAltImageContentPane(i + 1, imgLink, flareImg, productName, imgSource, sku);
			}
		});
	 },
	 /**
	  * Creates Mobile Image Tiles.  Intended to be called every time the current selection changes.
	  */
	 initializeImages_Mobile: function(catEntryId, sku) {
		var images = $('#imagesFor_' + catEntryId).find('input[type="hidden"]');
		var that = this;
		var to_insert = [];
		images.each(function(i) {
			var imgLink = this.value;
			var imgId = this.id;
			var idparts = /^img_(.*)_(\d+)$/.exec(this.id);
			if (idparts) {
				var imgSku = idparts[1];
				var imgIndex = idparts[2];
				if (sku == imgSku) {
					to_insert.push(imgLink);
				}
			}
		});
		// Prepend the list items in reverse; This way any videos that are already in the mobile-slider can stay
		// in place and will be at the end of the list.
		for(var i = to_insert.length - 1; i >= 0; i--) {
			imgLink = to_insert[i];
			$("#mobile-slider").prepend("<div class=\"imgContainer\"><img class=\"image-pane\" src=\""+imgLink+"?$ProductDetail-large$\" data-largesrc=\""+imgLink+"?$ProductDetail-xlarge$\" /></div>");
		}
	 },
	 displayAEMContent : function(catEntryId, partNumb){
		if(document.getElementById('inStoreOnly')!=null){
			if(document.getElementById('inStoreOnlyMsg')!=null)
				document.getElementById('inStoreOnlyMsg').innerHTML =document.getElementById('inStoreOnly').value;
		 }
		if(document.getElementById('itemRelatedMessaging_'+partNumb)!=null){
			document.getElementById('itemRelatedMsg').innerHTML =document.getElementById('itemRelatedMessaging_'+partNumb).value;
		 }
		 if(document.getElementById('didYouKnow')!=null){
				if(document.getElementById('didYouKnowMsg')!=null){
					var imgMsg="<img alt='Did ou know?' src='https://www.petco.com/assets/shop/didYouKnow.gif'><br>";
					document.getElementById('didYouKnowMsg').innerHTML =imgMsg+""+document.getElementById('didYouKnow').value;
				}
		}
		productDisplayJS.updateDisplayedImages(catEntryId, partNumb);
	 },
	 /**
	  * Called whenever the current selection changes, will toggle desktop thumbnails or replace mobile images as needed.
	  */
	 updateDisplayedImages: function(catEntryId, partNumb) {
		// Re-initialize the mobile slider
		destroyMobileImageSlider();

		var mq = window.matchMedia( "(max-width: 768px)" );
		if (!mq.matches) {
			$('.pdpthumb').hide();
			$('.pdpthumb.sku_' + partNumb).show();
			$('.pdpthumb.videothumb').show();
			this.createAltImageCarousel();
			// If live-clicker is currently displaying their video, we have to click the tile to hide the video.
			// Otherwise we can simply zoom to the image (the click is less desirable because it may notify CoreMetrics, etc).
		if( $('.pdpthumb:visible').length > 0){
			if ($('#imgZoom:visible').length > 0) {
				zoomThisData($('.pdpthumb:visible')[0].childNodes[0]);
			} else {
				$('.pdpthumb:visible')[0].click();
			}
			}
		} else {
			var that = this;
			$(function() {
				// Remove all of the existing mobile images and re-create the appropriate ones.
				var mobileImagesToDelete = $(".imgContainer");
				mobileImagesToDelete.remove();
				that.initializeImages_Mobile(catEntryId, partNumb);
				var imgPanes = $(".image-pane"),
					slider = $("[data-tns-role]");

				if (imgPanes.length > 1 && slider.length < 1){
					var imagesToLoad = imgPanes.length;
					var imagesLoaded = 0;
					$(".image-pane").each(function() {
						// Can't initialize the mobile slider until all the images are loaded - otherwise it loads broken.
						var incLoad = function() {
							imagesLoaded += 1;
							if (imagesToLoad == imagesLoaded) {
								if (!globalSliderRef)
									initializeMobileImageSlider();
									//Note: There is an issue in the liveclicker js while calling the below function. The mobile slider get 
									//reinitiated and thus braking page on attribute change. This need to be corrected in liveclick side
									//_liveclickerComponent.updateVideoIndex(globalSliderRef);
							}
						}
						if (this.complete) {
							incLoad();
						} else {
							$(this).load(incLoad);
						}
					})
				}
			});
		}
	 },
	 createAltImageContentPane: function(index,imgLink,flareImg,productName,imgSource,sku) {
		 var that = this;
		 $(function() {
			 var pane = null;
			 if(!document.getElementById('alt'+index)) {
				 // Desktop
				 pane = new dijit.layout.ContentPane({
					 content: "<div class=\"pdpthumb sku_" + sku + "\"  id=\"alt"+index+"\"><a href='#' manual_cm_sp=\"PDP-_-Image_"+index+"\" data-baseImageUrl='" + imgLink + "' data-altImageId='" + flareImg + "' onclick=\"zoomThisData(this);cmManuallyTriggerEventTrack(this);\"><img   alt= '"+productName+" - Thumbnail'  src="+imgSource+" class=''></a></div>",
					 postCreate: function() { dojo.addClass(this.domNode,"imgContainer");}
				 }).placeAt("imageRow", index);
			 }
		 });
	 },

	 createAltImageCarousel: function(){
		 var tileContainer = document.getElementById("imageRow"),
		 	fullSlider = document.getElementById("thumbnail-slider"),
		 	mq = window.matchMedia( "(min-width: 768px)" ),
			// --
			arrowPrev = document.querySelectorAll(".page-prev")[0],
			arrowNext = document.querySelectorAll(".page-next")[0],

			visibleTiles = $('.pdpthumb:visible');

		 // Push back up to the top any time this is re-initialized.
		 arrowPrev.classList.add("disable");
		 tileContainer.removeAttribute("style");

		 // Only enable scroller if we have more than four thumbnail images
		 // and the screen width shows the desktop version of the site
		 if (visibleTiles.length > 4 && mq.matches){

			 // Trigger carousel styles
			 fullSlider.classList.remove("inactive");
			 arrowNext.classList.remove("disable");

			var tile = $(".pdpthumb:visible")[0],
				tileHeight = tile.offsetHeight,
				tileStyle = getComputedStyle(tile),
				tileHeightMargin = parseInt(tileStyle.marginTop) + parseInt(tileStyle.marginBottom),
				tileTotalHeight = tileHeight + tileHeightMargin,
				//--
				tileWidth = tile.offsetWidth,
				tileWidthMargin = parseInt(tileStyle.marginLeft) + parseInt(tileStyle.marginRight),
				tileTotalWidth = tileWidth + tileWidthMargin;
				// --


				tileContainer.style.width = (tileTotalWidth * visibleTiles.length) +"px";


		    arrowNext.onclick = function(event){
		    	var tileContainerDirection= "left",
		    		tileContainerPosition = parseInt(getComputedStyle(tileContainer).left, 10),
		    		tileContainerSize = parseInt(tileContainer.offsetWidth, 10),
		    		tileSize = tileTotalWidth;

		    	event.preventDefault();

		    	// Enable top arrow any time we scroll down
		    	arrowPrev.classList.remove("disable");

		    	posChange = tileContainerPosition - (tileSize * 3);

		    	// If scroller will hit the bottom or further, set to stick at the bottom
		    	if ( posChange <= -(tileContainerSize - (tileSize * 4)) ){
		    		tileContainer.style.setProperty(tileContainerDirection, -(tileContainerSize - (tileSize * 4))+"px");
		    		arrowNext.classList.add("disable");
		    	} else {
		    		tileContainer.style.setProperty(tileContainerDirection, posChange + "px");
		    	}

		    };

		    arrowPrev.onclick = function(event){
		    	var tileContainerDirection = "left",
		    		tileContainerPosition = parseInt(getComputedStyle(tileContainer).left, 10),
		    		tileSize = tileTotalWidth;

		    	event.preventDefault();

		    	arrowNext.classList.remove("disable");

		    	if (parseInt(tileContainerPosition, 10) === 0){
		    		return; // Don't scroll if container is already at top
		    	} else {
		    		var posChange = tileContainerPosition + (tileSize * 3);

		    		// If scroller will hit the top or further, set at top and disable up arrow
		    		if (posChange >= 0) {
		    			posChange = 0;
		    			arrowPrev.classList.add("disable");
		    		}

		    		tileContainer.style.setProperty(tileContainerDirection, posChange +"px");

		    	}
		    };

		 }
	 },
	 changeDescIcon: function(){
		var icon_sign_desc = document.getElementById('description_span');
		if(icon_sign_desc != null){
			if(icon_sign_desc.className == "glyphicon glyphicon-chevron-right")
				icon_sign_desc.className = "glyphicon glyphicon-chevron-down";
			else
				icon_sign_desc.className = "glyphicon glyphicon-chevron-right";
		}
	 },
	 changeDirIcon: function(skuId){
		var icon_sign_dir = document.getElementById('directions_span_'+skuId);
		if(icon_sign_dir != null){
			if(icon_sign_dir.className == "glyphicon glyphicon-chevron-right")
				icon_sign_dir.className = "glyphicon glyphicon-chevron-down";
			else
				icon_sign_dir.className = "glyphicon glyphicon-chevron-right";
		}
	 },
	 changeAttrIcon: function(skuId){
		var icon_sign_attr = document.getElementById('attributes_span_'+skuId);
		if(icon_sign_attr != null){
			if(icon_sign_attr.className == "glyphicon glyphicon-chevron-right")
				icon_sign_attr.className = "glyphicon glyphicon-chevron-down";
			else
				icon_sign_attr.className = "glyphicon glyphicon-chevron-right";
		}
	 },
	 changeIngIcon: function(skuId){
		var icon_sign_ing = document.getElementById('ingredients_span_'+skuId);
		if(icon_sign_ing != null){
			if(icon_sign_ing.className == "glyphicon glyphicon-chevron-right")
				icon_sign_ing.className = "glyphicon glyphicon-chevron-down";
			else
				icon_sign_ing.className = "glyphicon glyphicon-chevron-right";
		}
	 },
	 changeWrtIcon: function(skuId){
		var icon_sign_wrt = document.getElementById('warranty_span_'+skuId);
		if(icon_sign_wrt != null){
			if(icon_sign_wrt.className == "glyphicon glyphicon-chevron-right")
				icon_sign_wrt.className = "glyphicon glyphicon-chevron-down";
			else
				icon_sign_wrt.className = "glyphicon glyphicon-chevron-right";
		}
	 },
	 changeShrIcon: function(skuId){
		var icon_sign_ftr = document.getElementById('shipping_span_'+skuId);
		if(icon_sign_ftr != null){
			if(icon_sign_ftr.className == "glyphicon glyphicon-chevron-right")
				icon_sign_ftr.className = "glyphicon glyphicon-chevron-down";
			else
				icon_sign_ftr.className = "glyphicon glyphicon-chevron-right";
		}
	 },
	 changeFtrIcon: function(skuId){
		var icon_sign_ftr = document.getElementById('featured_span_'+skuId);
		if(icon_sign_ftr != null){
			if(icon_sign_ftr.className == "glyphicon glyphicon-chevron-right")
				icon_sign_ftr.className = "glyphicon glyphicon-chevron-down";
			else
				icon_sign_ftr.className = "glyphicon glyphicon-chevron-right";
		}
	 },
	 changeCmtIcon: function(){
		var icon_sign_cmt = document.getElementById('comments_span');
		if(icon_sign_cmt != null){
			if(icon_sign_cmt.className == "glyphicon glyphicon-chevron-right")
				icon_sign_cmt.className = "glyphicon glyphicon-chevron-down";
			else
				icon_sign_cmt.className = "glyphicon glyphicon-chevron-right";
		}
	 },
	 changeSRIcon: function(id){
		var icon_sign_sr = document.getElementById('headerTitle_'+id);
		if(icon_sign_sr != null){
			if(icon_sign_sr.className == "glyphicon glyphicon-chevron-right")
				icon_sign_sr.className = "glyphicon glyphicon-chevron-down";
			else
				icon_sign_sr.className = "glyphicon glyphicon-chevron-right";
		}
	 },
	 
	/** 
	* Updates the product short description in the ShortDescription widget. 
	* 
	* @param {string} catEntryId The identifier of the sku.
	* @param {string} productId The identifier of the product.
	*/	
	updateProductShortDescription: function(catEntryId, productId){
		var catEntry = productDisplayJS.itemPriceJsonOject[catEntryId].catalogEntry;	 
		
		var shortDescWidgets = dojo.query("p[id^='product_shortdescription_"+productId+"']");
		if(shortDescWidgets != null){
			for(var i = 0; i<shortDescWidgets.length; i++){		
				if(shortDescWidgets[i]) {
					shortDescWidgets[i].innerHTML = catEntry.description[0].shortDescription;
				}
			}
		}
	},	 

	/** 
	* Updates the product long description in the LongDescription widget. 
	* 
	* @param {string} catEntryId The identifier of the sku.
	* @param {string} productId The identifier of the product.
	*/	
	updateProductLongDescription: function(catEntryId, productId){
		var catEntry = productDisplayJS.itemPriceJsonOject[catEntryId].catalogEntry;	 
		
		var longDescWidgets = dojo.query("p[id^='product_longdescription_"+productId+"']");
		if(longDescWidgets != null){
			for(var i = 0; i<longDescWidgets.length; i++){		
				if(longDescWidgets[i]) {
					longDescWidgets[i].innerHTML = catEntry.description[0].longDescription;
				}
			}
		}
	},	 
	
	/** 
	* Updates the product discounts in the Discounts widget. 
	* 
	* @param {string} catEntryId The identifier of the sku.
	* @param {string} productId The identifier of the product.
	*/	
	updateProductDiscount: function(catEntryId, productId){
		var catEntry = productDisplayJS.itemPriceJsonOject[catEntryId].catalogEntry;
		
		var newHtml = '';
		if(typeof catEntry.discounts != 'undefined'){
			for(var i=0; i<catEntry.discounts.length; i++){
				if(i > 0){
					newHtml += '<div class="clear_float"></div><div class="item_spacer_2px"></div>';
				}
				/* catEntry.discounts[i].description comes from short description associated with the promotion.
				 * If it is blank or missing, the link text is blank, thus is not clickable or displayed.
				 */
				newHtml += '<a class="promotion" href="' + catEntry.discounts[i].url + '">' + catEntry.discounts[i].description + '</a>';
			}
		}		
		
		var discountWidgets = dojo.query("div[id^='Discounts_']");
		if(discountWidgets != null){
			for(var i = 0; i<discountWidgets.length; i++){
				if(discountWidgets[i]){
					discountWidgets[i].innerHTML = newHtml;
				}
			}
		}
	},	 
	 
	/** 
	* Updates the product full image and angle images in the FullImage widget. 
	* 
	* @param {string} catEntryId The identifier of the sku.
	* @param {string} productId The identifier of the product.
	*/		 
	updateProductImage:function(catEntryId, productId){
		var newFullImage = null;
		var newAngleThumbnail = null;
		var newAngleFullImage = null;
		var newAngleThumbnailShortDesc = null;
		
		var skuFullImageFromService = null;
		var catEntry = null;
		if (productDisplayJS.itemPriceJsonOject[catEntryId] != null) {
			catEntry = productDisplayJS.itemPriceJsonOject[catEntryId].catalogEntry;
		}
		if (catEntry != null) {
			skuFullImageFromService = catEntry.description[0].fullImage;
		}
		
		var entitledItemId = "entitledItem_" + productId;
		var imageArr = productDisplayJS.getImageForSKU(entitledItemId);	
		if(imageArr != null){
			newAngleThumbnail = imageArr[2];
			newAngleFullImage = imageArr[3];	
			newAngleThumbnailShortDesc = imageArr[4];	
		}
		
		if(catEntryId != null &&  imageArr != null){
			newFullImage = imageArr[0];
			if (skuFullImageFromService != null && skuFullImageFromService != "") {
				newFullImage = skuFullImageFromService;
			}
		} else if (productId != null && productDisplayJS.singleSKUProductWithoutDefiningAttribute) {
			newFullImage = productDisplayJS.entitledItems[0].ItemImage467;
			if (skuFullImageFromService != null && skuFullImageFromService != "") {
				newFullImage = skuFullImageFromService;
			}
			newAngleThumbnail = productDisplayJS.entitledItems[0].ItemAngleThumbnail;
			newAngleFullImage = productDisplayJS.entitledItems[0].ItemAngleFullImage;						
			newAngleThumbnailShortDesc = productDisplayJS.entitledItems[0].ItemAngleThumbnailShortDesc;
		} else {		
			var imageFound = false;
			var selectedAttributes = productDisplayJS.selectedAttributesList[entitledItemId];
			for (x in productDisplayJS.entitledItems) {
				var Attributes = productDisplayJS.entitledItems[x].Attributes;
	
				for(attribute in selectedAttributes){
					var matchingAttributeFound = false;
					if (selectedAttributes[attribute] !== '') {
						for(y in Attributes){
							var index = y.indexOf("_|_");
							var entitledSwatchName = y.substring(0, index);
							var entitledSwatchValue = y.substring(index+3);
							
							if (entitledSwatchName == attribute && entitledSwatchValue == selectedAttributes[attribute]) {
								matchingAttributeFound = true;
								break;
							}
						}
						
						// No matching attributes found, so this is not the correct SKU
						if (!matchingAttributeFound) {
							imageFound = false;
							break;
						}
						imageFound = true;
					}
				}
				
				// imageFound will only be true if all attributes have been matched (so the first correct SKU)
				if (imageFound) {
					newFullImage = productDisplayJS.entitledItems[x].ItemImage467;
					newAngleThumbnail = productDisplayJS.entitledItems[x].ItemAngleThumbnail;
					newAngleFullImage = productDisplayJS.entitledItems[x].ItemAngleFullImage;						
					newAngleThumbnailShortDesc = productDisplayJS.entitledItems[x].ItemAngleThumbnailShortDesc;
					break;
				}
			}			
		}
		
		var imgWidgets = dojo.query("img[id^='"+productDisplayJS.skuImageId+"']");
		for(var i = 0; i<imgWidgets.length; i++){				
			if(imgWidgets[i] != null && newFullImage != null){
				imgWidgets[i].src = newFullImage;
			}
		}
		
		var productImgWidgets = dojo.query("input[id^='ProductInfoImage_"+productId+"']");
		for(var i = 0; i<productImgWidgets.length; i++){			
			if(productImgWidgets[i] != null && newFullImage != null){
				productImgWidgets[i].value = newFullImage;
			}
		}
		
		var prodAngleImageArea = dojo.query("div[id^='ProductAngleProdImagesArea']");
		var skuAngleImageArea = dojo.query("div[id^='ProductAngleImagesArea']");
		
		if(newAngleThumbnail != null && newAngleFullImage != null){
			if(prodAngleImageArea != null){
				for(var i = 0; i<prodAngleImageArea.length; i++){			
					if(null != prodAngleImageArea[i]){
						prodAngleImageArea[i].style.display = 'none';
					}
				}
			}			
			productDisplayJS.changeViewImages(newAngleThumbnail, newAngleFullImage, newAngleThumbnailShortDesc);
		} else {
			var prodDisplayClass = 'block';
			var selectedAttributes = productDisplayJS.selectedAttributesList[entitledItemId]; 
			for (attribute in selectedAttributes){
				if(null != selectedAttributes[attribute] && '' != selectedAttributes[attribute]){
					prodDisplayClass = 'none';
				}
			}

			if(prodAngleImageArea != null){
				for(var i = 0; i < prodAngleImageArea.length; i++){			
					if(null != prodAngleImageArea[i]){
						prodAngleImageArea[i].style.display = prodDisplayClass;
					}
				}
			}

			if (skuAngleImageArea != null){
				for(var i = 0; i < skuAngleImageArea.length; i++){			
					if(null != skuAngleImageArea[i]){
						skuAngleImageArea[i].style.display = 'none';
					}
				}
			}		
		}
	}, 
	
	/**
	 * Changing the drop down values based on the defining attribute selection that is subscribed to 'DefiningAttributes_Changed' or 'DefiningAttributes_Resolved' event.
	 *
	 * @param {string} productId The identifier of the product.
	 * @param {string} attrName The selected identifier name.
	 * @param {string} attrValue The selected identifier value.
	 *	@param {string} entitledItemId The identifier of the entitled item.
	 */

	 changeAttributeSelction : function(productId, attrName,attrValue,entitledItemId){

		/*var omnitureFlag = document.getElementById('omnitureEnabled');
		var omnitureEnabled = '';
		if(omnitureFlag != null && omnitureFlag != "undefined"){
			omnitureEnabled = omnitureFlag.value;
			if(omnitureEnabled === 'true'){
				var eventStatus = {"event_status" : "start", "event_action" : "", "event_name" : "pdpView","event_type" : ""};
				pushEvent(eventStatus);
			}
		}*/
		productDisplayJS.canSwapProductPriceDiv = false;
		var temp="";
		var tempSelVal=""
		var catentry_id = "";
		productDisplayJS.baseCatalogEntryId = productId;
		var selectedAttributes = productDisplayJS.selectedAttributesList[entitledItemId];
		var catalogEntryId = null;
		/*if(productDisplayJS.selectedProducts[productId]){
			catalogEntryId = productDisplayJS.getCatalogEntryIdforProduct(productDisplayJS.selectedProducts[productId]);
		} else {
			catalogEntryId = productDisplayJS.getCatalogEntryId(entitledItemId);
		}*/
		var tempCatentryId=null;
		var counter=0;


		for(a in this.entitledItems[0].Attributes){
			var index = a.indexOf("_");
			var tmpAttrName = a.substring(0, index);
			tempSelVal = tempSelVal+tmpAttrName+'_'+document.getElementById(tmpAttrName).value+',';
		}

		for(x in this.entitledItems)
		{
			var Attributes = this.entitledItems[x].Attributes;
			for(y in Attributes){
				var index = y.indexOf("_");
				var attrName1 = y.substring(0, index);
				var attrValue1 = y.substring(index+1);
				catentry_id = this.entitledItems[x].catentry_id;
				if(attrName == attrName1 && attrValue==attrValue1){
					temp=temp+x+",";
					catalogEntryId=catentry_id;

					/*if(catalogEntryId==catentry_id){
						tempCatentryId=catalogEntryId;
					}else if(catalogEntryId==null){
						if(counter==0){
							tempCatentryId=catentry_id;
							counter++;
						}
					}
*/

				}
			}
		}
		var temp1 = temp.split(',');
		var temp2= temp1;
		var attrNameDisp="";
		var attrValueDisp="";
		var j="";

		var tmp="";
		for(index in temp2){
			j=temp2[index];
			if(j!=""){
				if(this.entitledItems[j]!=undefined){
					var Attributes = this.entitledItems[j].Attributes;
					for(z in Attributes){
						var index = z.indexOf("_");
						attrNameDisp=z.substring(0, index);
						attrValueDisp=z.substring(index+1);
						catentryid = this.entitledItems[j].catentry_id;

						if(attrNameDisp != attrName && tempSelVal.indexOf(z) != -1){
							tmp=tmp+j+",";
							catalogEntryId=catentryid;
						}

					}
				}
			}
		}
		if(tmp == ""){
			tmp = temp;
		}

		var tmp1 = tmp.split(',');
		var tmp2= tmp1;
		var attrNameDis="";
		var attrValueDis="";
		var selectedAttr="";
		var tempAttrName;
		var attrNameSpace;
		var k="";

		for(index in tmp2){
			k=tmp[index];
			if(k!=""){
				if(this.entitledItems[k]!=undefined){
					var Attributes = this.entitledItems[k].Attributes;

					for(z in Attributes){
						var index = z.indexOf("_");
						attrNameDis=z.substring(0, index);
						attrValueDis = z.substring(index+1);

							if(document.getElementById(attrNameDis).value != null && document.getElementById(attrNameDis).value == attrValueDis){
								attrValDis = document.getElementById(attrNameDis).value;
							}else{
								attrValDis=z.substring(index+1);
							}
							document.getElementById(attrNameDis).value =attrValDis;
							this.setSelectedAttribute(attrNameDis, attrValDis, entitledItemId);
					}
				}


			}

		}
		///alert(catalogEntryId+"catalogEntryId");
		/*if(catalogEntryId==null){
			catalogEntryId =tempCatentryId;
		}*/
		if(catalogEntryId != null && productId!=null){			
			dojo.topic.publish('DefiningAttributes_Resolved_'+productId, catalogEntryId, productId);

			//check if the json object is already present for the catEntry.
			var catEntry = productDisplayJS.itemPriceJsonOject[catalogEntryId];

			if(catEntry != null && catEntry != undefined){
				productDisplayJS.publishAttributeResolvedEvent(catalogEntryId, productId);
			}else{
				var parameters = {};
				parameters.storeId = productDisplayJS.storeId;
				parameters.langId= productDisplayJS.langId;
				parameters.catalogId= productDisplayJS.catalogId;
				parameters.catalogEntryId= catalogEntryId;
				parameters.productId = productId;
				productDisplayJS.postCallCatentryDetailsById(parameters);
			}

			for(x in this.entitledItems)
			{
				var catentry_id = this.entitledItems[x].catentry_id;
				var rdPrice = "";
				var rdFlag = "";
				var rdSavings = "";
				if(catentry_id == catalogEntryId)
				{
					rdPrice = this.entitledItems[x].RepeatDeliveryPrice;
					rdFlag = this.entitledItems[x].RepeatDeliveryFlag;
					//productDisplayJS.displayRDPrice(catentry_id, productId, rdFlag, rdPrice, rdSavings);
			 }
			}
			//set explicitly to remove progress bar
			setTimeout("cursor_clear()",18000);

		}
		/*if(catalogEntryId != null){
			this.displayAttributeInfo(catalogEntryId, productId);
			var catEntry1 = productDisplayJS.itemPriceJsonOject[catalogEntryId].catalogEntry;
			var partNumb = catEntry1.catalogEntryIdentifier.externalIdentifier.partNumber;
			this.displayAEMContent(catalogEntryId,partNumb);
		}*/
	},
    
	/*updatePriceDetailsForTP:function(catEntry){
		try{			
		if($("#itemPropPrice").size()>0 ){
			var offerPrice = catEntry.offerPrice;
			var inStoreSku = catEntry.InStoreOnly;			
				if(inStoreSku == 'yes'){
					$("#pdpInventoryAvaiableitySchema span#itemPropPrice").text('InStore');
					$("#pdpInventoryAvaiableitySchema span#itemPropPrice").attr("content", 'InStore');	
				}else{	
					if(offerPrice != null){	
						offerPrice = offerPrice.replace('$','');
						$("#pdpInventoryAvaiableitySchema span#itemPropCurrency").text('$');
						$("#pdpInventoryAvaiableitySchema span#itemPropPrice").text(offerPrice);
						$("#pdpInventoryAvaiableitySchema span#itemPropPrice").attr("content", offerPrice);
					}
				}
			}
		}catch(err){
			console.log(err);
		}
	},*/
	
	/*
	 * Method to show Hide prop 65 warning message. If SKU has below descriptive attribute and if user's current location is California,
	 * display Prop 65 warning message at PDP.
	 * 
	 *  PTC_OMNI_PROP_65_FLAG 
	 *  PTC_OMNI_PROP_65_DESC
	 */
	displayProp65WarningMessage: function(catEntry){
		
		var warningMessage = catEntry.warningMessage;
		if(undefined != warningMessage || null != warningMessage ){	
			var warningSignText = $('#product-prop65-warning-sign-text').html();
			var warningReference = $('#product-prop65-warning-reference').html();
			warningMessage = warningSignText + warningMessage + warningReference;
			var prop65State = getCookie("Edgescape-State");
			if(prop65State === undefined || prop65State == null || prop65State.length <= 0){
			   $('#product-prop65-warning').removeClass('hide').addClass('show');
			   $('#product-prop65-warning').html(warningMessage);
			}
			else if(prop65State == 'CA'){
			   $('#product-prop65-warning').removeClass('hide').addClass('show');
			   $('#product-prop65-warning').html(warningMessage);			   
			}
			else{
			   $('#product-prop65-warning').removeClass('show').addClass('hide');
			   $('#product-prop65-warning').html("");
			}		  
		}
		else if($('#product-prop65-warning').hasClass('show')){
		   $('#product-prop65-warning').removeClass('show').addClass('hide');
		}		
	},

	/** 
	* To notify the change in attribute to other components that is subscribed to 'DefiningAttributes_Changed' or 'DefiningAttributes_Resolved' event.
	* 
	* @param {string} productId The identifier of the product.
	* @param {string} entitledItemId The identifier of the entitled item.
	* @param {boolean} isPopup If the value is true, then this implies that the function was called from a quick info pop-up.
	* @param {boolean} displayPriceRange A boolean used to to determine whether or not to display the price range when the catEntry is selected. 	
	*/		 
	notifyAttributeChange: function(productId, entitledItemId, isPopup, displayPriceRange){
		productDisplayJS.baseCatalogEntryId = productId;	
		var selectedAttributes = productDisplayJS.selectedAttributesList[entitledItemId];
		
		productDisplayJS.displayPriceRange = displayPriceRange;
		productDisplayJS.isPopup = isPopup;
		
		var catalogEntryId = null;		
		if(productDisplayJS.selectedProducts[productId]){
			catalogEntryId = productDisplayJS.getCatalogEntryIdforProduct(productDisplayJS.selectedProducts[productId]);
		} else {
			catalogEntryId = productDisplayJS.getCatalogEntryId(entitledItemId);
		}
		
		if(catalogEntryId != null){
			dojo.topic.publish('DefiningAttributes_Resolved_'+productId, catalogEntryId, productId);
			
			//check if the json object is already present for the catEntry.
			var catEntry = productDisplayJS.itemPriceJsonOject[catalogEntryId];		
			
			if(catEntry != null && catEntry != undefined){
				productDisplayJS.publishAttributeResolvedEvent(catalogEntryId, productId);
			}
			//if json object is not present, call the service to get the details.
			else{
				var parameters = {};
				parameters.storeId = productDisplayJS.storeId;
				parameters.langId= productDisplayJS.langId;
				parameters.catalogId= productDisplayJS.catalogId;
				parameters.catalogEntryId= catalogEntryId;
				parameters.productId = productId;
				productDisplayJS.postCallCatentryDetailsById(parameters);
				
				//Declare a service for retrieving catalog entry detailed information for an item...
				wc.service.declare({
					id: "getCatalogEntryDetails",
					actionId: "getCatalogEntryDetails",
					url: getAbsoluteURL() + appendWcCommonRequestParameters("GetCatalogEntryDetailsByIDView"),
					formId: ""

					,successHandler: function(serviceResponse, ioArgs) {
						productDisplayJS.publishAttributeResolvedEventServiceResponse(serviceResponse, ioArgs);
					}

					,failureHandler: function(serviceResponse, ioArgs) {
						console.debug("productDisplayJS.notifyAttributeChange: Unexpected error occurred during an xhrPost request.");
					}

				});
				wc.service.invoke("getCatalogEntryDetails", parameters);
			}
			for(x in this.entitledItems)
			{
				var catentry_id = this.entitledItems[x].catentry_id;
				var rdPrice = "";
				var rdFlag = "";
				//pass empty savings message since while loading initially this function is called early so there will be no savings message
				var rdSavings = "";
				if(catentry_id == catalogEntryId)
				{
					rdPrice = this.entitledItems[x].RepeatDeliveryPrice;
					//rdPrice.price="$0.05";
					rdFlag = this.entitledItems[x].RepeatDeliveryFlag;
					//productDisplayJS.displayRDPrice(catentry_id, productId, rdFlag, rdPrice, rdSavings);
				}
			}			
			//set explicitly to remove progress bar
			cursor_clear();
		}
		else{
			dojo.topic.publish('DefiningAttributes_Changed', catalogEntryId, productId);
			dojo.topic.publish('DefiningAttributes_Changed_' + productId, catalogEntryId, productId);
			console.debug("Publishing event 'DefiningAttributes_Changed' with params: catEntryId="+catalogEntryId+", productId="+productId);
			//if unable to resolve the catentry,
			// disable the add2cartBtn
			if(document.getElementById("add2CartBtn")!=null && document.getElementById("add2CartBtn")!='undefined'){
				document.getElementById("add2CartBtn").disabled = true;
			}
			// disable the selectRDOrderBtn
			if(document.getElementById("selectRDOrderBtn")!=null && document.getElementById("selectRDOrderBtn")!='undefined'){
				document.getElementById("selectRDOrderBtn").disabled = true;
			}
			if(document.getElementById("selectRDOrderBtnCpy")!=null && document.getElementById("selectRDOrderBtnCpy")!='undefined'){
				document.getElementById("selectRDOrderBtnCpy").disabled = true;
			}

		}
	},
	
	/** 
	* Publishes the 'DefiningAttributes_Resolved' event using the JSON object returned from the server.
	* 
	* @param {object} serviceRepsonse The JSON response from the service.
	* @param {object} ioArgs The arguments from the service call.
	*/		
	publishAttributeResolvedEventServiceResponse: function(serviceResponse, ioArgs){		
		var productId = ioArgs['args'].content['productId'];
		//stores the json object, so that the service is not called when same catEntry is selected.
		productDisplayJS.itemPriceJsonOject[serviceResponse.catalogEntry.catalogEntryIdentifier.uniqueID] = serviceResponse;		
		
		productDisplayJS.publishAttributeResolvedEvent(serviceResponse.catalogEntry.catalogEntryIdentifier.uniqueID, productId);
	 },
	
	/** 
	* Publishes the 'DefiningAttributes_Resolved' event with the necessary parameters. 
	* 
	* @param {string} catEntryId The identifier of the sku.
	* @param {string} productId The identifier of the product.
	*/		
	publishAttributeResolvedEvent: function(catEntryId, productId){		
		if (!productDisplayJS.isPopup) {
			/* TODO: Uncomment if needed ..... <end> if (this.entitledItems) {
				for (x in this.entitledItems) {
					var sku = this.entitledItems[x]; 
					if (sku.catentry_id === catEntryId) {
						if (sku.displaySKUContextData === 'true') {
							if (document.location.href !== sku.seo_url) {
								document.location.replace(sku.seo_url);
							} else {
								dojo.topic.publish('DefiningAttributes_Resolved', catEntryId, productId);
								console.debug("Publishing event 'DefiningAttributes_Resolved' with params: catEntryId="+catEntryId +", productId="+productId);
							}
						} else {
							dojo.topic.publish('DefiningAttributes_Resolved', catEntryId, productId);
							console.debug("Publishing event 'DefiningAttributes_Resolved' with params: catEntryId="+catEntryId +", productId="+productId);
						} 
					}
				}
			} else {
				console.debug("Publishing event 'DefiningAttributes_Resolved' with params: catEntryId="+catEntryId +", productId="+productId);
				dojo.topic.publish('DefiningAttributes_Resolved', catEntryId, productId);					
			}*/
			dojo.topic.publish('DefiningAttributes_Resolved', catEntryId, productId);
			if( document.getElementById("notifyCatentry")!=null){

				document.getElementById("notifyCatentry").value=catEntryId;

			}			
			//update the part number on change of attributes
			this.updateProductPartNumber(catEntryId, productId);
			this.updateProductName(catEntryId, productId);
			this.displayAccessoriesMAForItem(catEntryId);
			this.displayAttributeInfo(catEntryId, productId);
			var catEntry = productDisplayJS.itemPriceJsonOject[catEntryId].catalogEntry;
			//this.updatePriceDetailsForTP(catEntry);
			this.displayProp65WarningMessage(catEntry);
			//build Data layer if catEntry object is already available in page.
			buildProductDataLayerVariable(catEntry);
			if(null!=productDisplayJS.InventoryDetailsforItems && undefined != productDisplayJS.InventoryDetailsforItems[catEntryId]){
				buildProductInventoryDataLayer(productDisplayJS.InventoryDetailsforItems[catEntryId].onlineInventory_status,'onChange');
			}
			var partNumb = catEntry.catalogEntryIdentifier.externalIdentifier.partNumber;
			this.displayAEMContent(catEntryId,partNumb);
					
			console.debug("Publishing event 'DefiningAttributes_Resolved' with params: catEntryId="+catEntryId +", productId="+productId);
		}
	},
	
	/**
	 * To notify the change in quantity to other components that is subscribed to ShopperActions_Changed event.
	 */
	notifyQuantityChange: function(quantity){	
		if(isNaN(quantity)){
			return false;
		}		
		if($('#quantity') != null && $('#quantity') != undefined){
			var qtyChanged = false;
			if($('#quantity').val() != '' && $('#quantity').val() == 0){
				$('#quantity').val('1');
				localStorage.setItem('qtyChangedOnBlur', '1');
	    	}
			if (parseInt($('#quantity').val()) > 1 && parseInt($('#quantity').val()) <= 999) {
				qtyChanged = true;
			}
			petcoCommonJS.updateItemButton(qtyChanged);	
		}
		dojo.topic.publish('ShopperActions_Changed', quantity);		
		console.debug("Publishing event 'ShopperActions_Changed' with params: quantity="+quantity);
	},	

	displayAccessoriesMAForItem: function(catEntryId){
		if(document.getElementById("skuHasAccssoryMAListIds")!='undefined' && document.getElementById("skuHasAccssoryMAListIds")!=null){
			var skuList = document.getElementById("skuHasAccssoryMAListIds").value;
			var skuId = skuList.split(',');
			for(var i = 0;i<(skuId.length);i++){
				var accessoryMADiv = document.getElementById('accessoriesMA_'+skuId[i]);
				if(accessoryMADiv!=undefined || accessoryMADiv!=null){
					if(catEntryId == skuId[i]){
						dojo.style("accessoriesMA_"+skuId[i],"display","block");
					}else{
						dojo.style("accessoriesMA_"+skuId[i],"display","none");
					}
				}
			}

		}
	},

	updateItemSpecificData: function(catEntryId, productId){
		var entitledItemIdsObject = document.getElementById("entitledItem_"+productId);
		var entitledItemIds = eval('('+entitledItemIdsObject.innerHTML +')');
			var parameters = {};
			parameters.storeId = productDisplayJS.storeId;
			parameters.langId= productDisplayJS.langId;
			parameters.catalogId= productDisplayJS.catalogId;
			parameters.catalogEntryId= catEntryId;
			parameters.productId = productId;
			productDisplayJS.postCallCatentryDetailsById(parameters);
	},

	/**
	 * RD Add On: Takes user to login screen and back to PDP when guest user choose for adding an add on item to RD orders.
	 */
	rdAddOnLoginOptions: function(signInUrl,quantity,customParams,isAddToRDRequest) {
		var userType = dojo.cookie('WC_UserType');
		if(petcoPersonalizationJS.isPersonalizedItem() && !petcoPersonalizationJS.isRxMedicineItem()){
				var invalidChars = petcoPersonalizationJS.findInvalidCharSetForUserInput(quantity,customParams);
				if(invalidChars!=""){

					return false;
				}
				if(!petcoPersonalizationJS.validatePersonalizedRequiredField(quantity,customParams)){
					return false;
				}
				if(!petcoPersonalizationJS.validatePersonalizedTextInputType(quantity,customParams)){
					return false;
				}
		}
		if(userType != 'R'){
			var urlParams = window.location.href;
			var rdSignInUrl = "";
			if (signInUrl != null && signInUrl != 'undefined') {
				rdSignInUrl = signInUrl;
				rdSignInUrl = rdSignInUrl+'&URL='+urlParams;
				dojo.cookie('oneTimeAddOnRD', 'true', {path:'/'});
				document.location.href = rdSignInUrl;
			}
		} else if (isAddToRDRequest) {
			PetcoAddToRepeatDeliveryJS.updateContextForAddToRepeatDelivery();
		} else {
			PetcoRepeatDeliveryAddOnJS.updateContextForRDAddOn();
		}
	},

	/**
	 * Pre-select radio button on PDP.
	 */
	preSelectRadioButtonOnPDP: function() {

		if($("#repeat-delivery-select.instore-deliveryBox").length == 0 && $("#repeat-delivery-select.paramStore-deliveryBox").length == 0){
		var oneTimeAddOnRDFlag = dojo.cookie('oneTimeAddOnRD');
		if (oneTimeAddOnRDFlag != null && oneTimeAddOnRDFlag != '' && oneTimeAddOnRDFlag == 'true') {
			var userType = dojo.cookie('WC_UserType');
			if(userType == 'R'){
				if($("input#store-pickup:checked").length == 0 && $("#repeat-delivery-select.instore-deliveryBox").length == 0 ){
				document.getElementById("repeat-delivery-add-on").click();
				document.getElementById("selectRDOrderBtn").click();
				}
				dojo.cookie("oneTimeAddOnRD", null, {expires: -1, path:'/'});
			} else {
				if($("input#store-pickup:checked").length == 0 && $("#repeat-delivery-select.instore-deliveryBox").length == 0 && $("#repeat-delivery-select.paramStore-deliveryBox").length == 0 ){
				document.getElementById("one-time-delivery").click();
				}
				dojo.cookie("oneTimeAddOnRD", null, {expires: -1, path:'/'});
			}
		} else {
			if($("input#store-pickup:checked").length == 0 && $("#repeat-delivery-select.instore-deliveryBox").length == 0 && $("#repeat-delivery-select.paramStore-deliveryBox").length == 0 ){
			document.getElementById("one-time-delivery").click();
			}
		}
			
		}

	},

	/**
	 * Show RD frequency options.
	 * Show future ship and RD frequency options based on isEASession or isOBOSession cookie. Only displayed in OBO and EA.
	 */
	showRDFrequencyOptions: function(optionVal) {
		// check if Schedule Repeat Delivery button is clicked
		if (optionVal == 'repeat-delivery') {
			dojo.query("#repeat-delivery-buybutton").addClass('open');
			dojo.query("#rd-option-selectBox").addClass('selected-option-box');


			// Fetching cookie data
			var isEASession = dojo.cookie('isEASession');
			var isOBOSession = dojo.cookie('isOBOSession');
			var isOBOOrEASession = "no";
			if (isEASession == "yes" || isOBOSession == "yes"){
				isOBOOrEASession = "yes";
			}

			if("yes" == isOBOOrEASession){
				// show future ship and RD frequency drop down
				dojo.query('#future-ship-repeat-delivery-dropdown').addClass('open');
				// hide frequency drop down
				dojo.query('#repeat-delivery-dropdown').removeClass('open');
			}else{
				// show RD frequency drop down
				dojo.query('#repeat-delivery-dropdown').addClass('open');
				// hide future ship and RD frequency drop down
				dojo.query('#future-ship-repeat-delivery-dropdown').removeClass('open');
			}
		}
		else {
			// hide frequency drop down
			dojo.query("#repeat-delivery-buybutton").removeClass('open');
			dojo.query('#repeat-delivery-dropdown').removeClass('open');

			// hide future ship and RD frequency drop down
			dojo.query('#future-ship-repeat-delivery-dropdown').removeClass('open');
			dojo.query("#rd-option-selectBox").removeClass('selected-option-box');
		}


		if(optionVal == 'one-time-delivery'){
			dojo.query("#onetimeDelivery-buybutton").addClass('open');
			dojo.query("#onetimeDelivery-option-selectBox").addClass('selected-option-box');

		}else{
			dojo.query("#onetimeDelivery-buybutton").removeClass('open');
			dojo.query("#onetimeDelivery-option-selectBox").removeClass('selected-option-box');

		}
		if(optionVal == 'repeat-delivery-add-on'){
			dojo.query("#rd-add-on-buybutton").addClass('open');
			dojo.query("#rd-add-on").addClass('selected-option-box');

		}else{
			dojo.query("#rd-add-on-buybutton").removeClass('open');
			dojo.query("#rd-add-on").removeClass('selected-option-box');

		}

	},


	
	/**
	 * To display attachment page.
	 */
	showAttachmentPage:function(data){
		var pageNumber = data['pageNumber'];
		var pageSize = data['pageSize'];
		pageNumber = dojo.number.parse(pageNumber);
		pageSize = dojo.number.parse(pageSize);

		setCurrentId(data["linkId"]);

		if(!submitRequest()){
			return;
		}
			
		console.debug(wc.render.getRefreshControllerById('AttachmentPagination_Controller').renderContext.properties);
		var beginIndex = pageSize * ( pageNumber - 1 );
		cursor_wait();
		wc.render.updateContext('AttachmentPagination_Context', {'beginIndex':beginIndex});
		MessageHelper.hideAndClearMessage();
	},
	
	/**
	 * Register mouse down event 
	 */
	registerMouseDown:function(node){
		dojo.connect(dojo.byId(node), "onmousedown", 
			function(){
				productDisplayJS.calculateScrollingHeight(node);
			}
		);		
	},
	
	/**
	 * Calculate scrolling height.
	 */
	calculateScrollingHeight:function(node){
		var domGeometry = require("dojo/dom-geometry");		
		var selectedNode = productDisplayJS.findDropdownById(node);
		var nodePosition = null;
		if (selectedNode) {
			nodePosition = domGeometry.position(selectedNode);
		} else {
			return;
		}
		var windowHeight = window.innerHeight;
		if (windowHeight - nodePosition.y > nodePosition.y){
			var newHeight = windowHeight - nodePosition.y;
		}else{
			var newHeight = nodePosition.y;
		}
		if (dojo.byId(node + "_dropdown") != null){
			if (windowHeight - nodePosition.y > nodePosition.y){
				var newHeight = windowHeight - nodePosition.y;
			}else{
				var newHeight = nodePosition.y;
			}
			var dropdownHeight = dojo.byId(node + "_dropdown").clientHeight;	
			if (dropdownHeight > newHeight){
				dojo.byId(node + "_dropdown").style.height = newHeight + "px"; 		
			}				
		}else{
//			dojo.byId(node + "_dropdown").style.height = windowHeight + "px";
		}	
	},
	
	findDropdownById: function(node) {
		var newNode = productDisplayJS.removeQuotes(node);
		var nodes = dojo.query('[id^=attrValue_]');
		var foundNode = null;
		
		dojo.forEach(nodes, function(domNode, key) {
			var id = productDisplayJS.removeQuotes(domNode.id);
			if (newNode === id) {
				foundNode = domNode;
			}
		});
		
		return foundNode;
	},

	/**
	 * This function refreshes action button on PDP.
	 */
	refreshActionButton:function(optionVal, entitledItemId) {
		// check if select repeat delivery button is clicked
		var isSHowNotifyButton = false;
		if(dojo.byId('notifybutton') != null){
			isSHowNotifyButton = dojo.hasClass('notifybutton','show');
		}
		if(!isSHowNotifyButton){
		if (optionVal == 'repeat-delivery-add-on') {
			// hide add to cart button
			dojo.query('#add2CartBtn').addClass('hide');
			dojo.query('#add2CartBtn').removeClass('show');
			// show select repeat delivery button
			dojo.query('#selectRDOrderBtn').removeClass('hide');
			dojo.query('#selectRDOrderBtnCpy').removeClass('hide');
			dojo.query('#selectRDOrderBtn').addClass('show');
			dojo.query('#selectRDOrderBtnCpy').addClass('show');
			// hide add to existing repeat delivery button
			dojo.query('#addToRDOrderBtn').addClass('hide');
			//Start:Tealium conversion Tagging Change: RD Add On item
			var entitledItemJSON;
			if (dojo.byId(entitledItemId)!=null) {
			//the json object for entitled items are already in the HTML.
			 entitledItemJSON = eval('('+ dojo.byId(entitledItemId).innerHTML +')');
			}else{
			//if dojo.byId(entitledItemId) is null, that means there's no <div> in the HTML that contains the JSON object.
			//in this case, it must have been set in catalogentryThumbnailDisplay.js when the quick info
			entitledItemJSON = this.getEntitledItemJsonObject();
			}
			productDisplayJS.setEntitledItems(entitledItemJSON);
			var catalogEntryId = productDisplayJS.getCatalogEntryId(entitledItemId);
			var catEntry = productDisplayJS.itemPriceJsonOject[catalogEntryId].catalogEntry;
			try{
				var name = catEntry.description[0].name;
				var productId = catalogEntryId;
				var productName = name.replace(/["']/g, "");
				var rd_sku = catEntry.catalogEntryIdentifier.externalIdentifier.partNumber;
				if (rd_sku != null && rd_sku != "undefined") {
					if($('#tel_product_id').size()>0){
						  var product_parent_sku = $('#tel_product_id').val();
						}
					var productRDJSON = {"product_id" : productId , 
										 "product_name" : productName , 
										  "conversion_event_id" : "New Product Existing RD Order", 
										  "conversion_category_id" : "Repeat Delivery", 
										  "conversion_action_type" : "1", 
										  "product_sku" : rd_sku, 
										  "product_parent_sku":product_parent_sku,
										  "event_name" : "repeat_delivery_new_prod"};
					pushEvent(productRDJSON);
				}
			}catch(err){
				console.log(err);
			}
			//End:Tealium conversion Tagging Change: RD Add On item
		} else if (optionVal == 'add-to-repeat-delivery') { // check if add to existing repeat delivery button is clicked
			// hide add to cart button
			dojo.query('#add2CartBtn').addClass('hide');
			dojo.query('#add2CartBtn').removeClass('show');
			// hide select repeat delivery button
			dojo.query('#selectRDOrderBtn').addClass('hide');
			dojo.query('#selectRDOrderBtnCpy').addClass('hide');
			dojo.query('#selectRDOrderBtn').removeClass('show');
			dojo.query('#selectRDOrderBtnCpy').removeClass('show');
			// show add to existing repeat delivery button
			dojo.query('#addToRDOrderBtn').removeClass('hide');
			
		} else {
				// show add to cart button
				dojo.query('#add2CartBtn').removeClass('hide');
				dojo.query('#add2CartBtn').addClass('show');
				// hide select repeat delivery button
				dojo.query('#selectRDOrderBtn').addClass('hide');
				dojo.query('#selectRDOrderBtnCpy').addClass('hide');
				dojo.query('#selectRDOrderBtn').removeClass('show');
				dojo.query('#selectRDOrderBtnCpy').removeClass('show');
				// hide add to existing repeat delivery button
				dojo.query('#addToRDOrderBtn').addClass('hide');
		}
		
		if (document.getElementById("HolidayShipMsgFlag") != null && document.getElementById("HolidayShipMsgFlag").value == 'Y') {
			console.log(dojo.byId("tabselected").value + " :: " + optionVal + " :: " + entitledItemId + " :: " + productDisplayJS.getCatalogEntryId(entitledItemId));
			if (dojo.byId("tabselected").value != '') {
				// user is clicking different tab
				if (dojo.byId("tabselected").value != optionVal) {
					console.log("different tab");
					var itemId = productDisplayJS.getCatalogEntryId(entitledItemId);
					if ("store-pickup" == optionVal) {
						getShippingMessage(productDisplayJS.storeId, productDisplayJS.catalogId, productDisplayJS.langId, 
								'', 'Y', itemId, true);
					} else {
						getShippingMessage(productDisplayJS.storeId, productDisplayJS.catalogId, productDisplayJS.langId, 
								'', 'Y', itemId, 'N');
					}
					
					dojo.byId("tabselected").value = optionVal;
				}
			} else {
				// First time click
				dojo.byId("tabselected").value = optionVal;
			}
		}// HolidayShipMsgFl
		
		}
	},
	/**
	 * To sort items in drop down
	 */
	sortItemsInCombo:function(){
		dojo.forEach(dojo.query('select[name="attrValue"]'),function(obj){
			 var optionsValue = obj.options;
			 var optionList = {};
			 var optionvaluearray = [];
			 for(var i = 0;i<optionsValue.length;i++){
					var valofoption = optionsValue[i].value;
					if(valofoption == ""){
						valofoption = "0" ;
					}
					var numb = valofoption.match(/[0-9.]/g);
					var numbcombin = (numb.join(""));
					optionList[numbcombin] = optionsValue[i];
					optionvaluearray.push(numbcombin);
			}
			  var j;
			    for(j = obj.options.length - 1 ; j >= 0 ; j--)
			    {
			        obj.remove(j);
			    }
				optionvaluearray = optionvaluearray.sort(function(a, b){return a-b});
				for(var x=0 ; x<optionvaluearray.length ; x++){
					obj.add(optionList[optionvaluearray[x]])
				}
			})
	}/*,
	callRouteToIntemetiantCartLandingPage:false,
	urlToIntemetiantCartLandingPage:"",
	routeToIntemetiantCartLandingPage:function(){
		productDisplayJS.callRouteToIntemetiantCartLandingPage=false;
		var urlToFire = productDisplayJS.urlToIntemetiantCartLandingPage;
		productDisplayJS.urlToIntemetiantCartLandingPage = "";
		if(document.getElementById("isCartInterstialEnabled") != undefined
				&& document.getElementById("isCartInterstialEnabled") != null
				&& document.getElementById("isCartInterstialEnabled").value == 'Yes'){
						document.location.href = urlToFire;
		}
	}*/
	,changeQuanityInPdP:function(action,catalogEntryID,templateOrder,templateOrderVal,SIGN_IN_URL,ltlorRxflag){
		if(action == 'PREVIOUS'){
		    if (parseInt($('#quantity_'+catalogEntryID).val()) > 1) {
	            $('#quantity_'+catalogEntryID).val((parseInt($('#quantity_'+catalogEntryID).val()) - 1));
	            petcoCommonJS.rateLimiter(250, 'qtyChange', function(){
	            	CheckoutHelperJS.isshowpersonalizationPopup = false;
	            	if(templateOrder == 'true'){
	            		productDisplayJS.updateValueQuanityInPdPUnderTemplateProduct(catalogEntryID,templateOrderVal,$('#quantity_'+catalogEntryID)[0],SIGN_IN_URL,ltlorRxflag);
	            	}else{
	            	productDisplayJS.updateValueQuanityInPdP(catalogEntryID);
	            	}
	            	
	            });
	            
	        }
		}else if(action == 'NEXT'){
			 if (parseInt($('#quantity_'+catalogEntryID).val()) < 999){
				 	if(localStorage.getItem('qtyChangedOnBlur') != null && localStorage.getItem('qtyChangedOnBlur') == '1' && parseInt($('#quantity_'+catalogEntryID).val()) == 1){
				 		localStorage.setItem('qtyChangedOnBlur', '0');
					}else{
						$('#quantity_'+catalogEntryID).val((parseInt($('#quantity_'+catalogEntryID).val()) + 1));
					}
	                petcoCommonJS.rateLimiter(250, 'qtyChange', function(){
	                	CheckoutHelperJS.isshowpersonalizationPopup = false;
	                	if(templateOrder == 'true'){
	                		productDisplayJS.updateValueQuanityInPdPUnderTemplateProduct(catalogEntryID,templateOrderVal,$('#quantity_'+catalogEntryID)[0],SIGN_IN_URL,ltlorRxflag);
		            	}else{
	                	productDisplayJS.updateValueQuanityInPdP(catalogEntryID);
		            	}
	                });
	            }
		}
		try{
			var omnitureEnabled
			if(dojo.byId("omnitureEnabled") != undefined && dojo.byId("omnitureEnabled") != null)
				omnitureEnabled = dojo.byId("omnitureEnabled").value;
			if(omnitureEnabled != "undefined" && null != omnitureEnabled && omnitureEnabled !='' && omnitureEnabled == 'true'){
				var productId = productDisplayJS.bopusShowStoreDetailsCatEntryId;
				if(productId != undefined && null != productId){
					var catEntry = productDisplayJS.itemPriceJsonOject[productId].catalogEntry;
					if(catEntry != undefined && catEntry != null){
						var cartOrderId = dojo.cookie("WC_CartOrderId_10151");
						var cartEventDetails = {};
						if(action == 'NEXT'){
							cartEventDetails["event_name"] = "cart_add_units";
							cartEventDetails["cart_units_add"] = "1";}						
						else if(action == 'PREVIOUS'){
							cartEventDetails["event_name"] = "cart_remove_units";
							cartEventDetails["cart_units_remove"] = "1";}							
						if(cartOrderId != null && cartOrderId != "")
							cartEventDetails["cart_id"] = cartOrderId;
						cartEventDetails["product_id"] = productId;
						cartEventDetails["product_sku"] = catEntry.catalogEntryIdentifier.externalIdentifier.partNumber;
						cartEventDetails["product_name"] = catEntry.description[0].name;
						cartEventDetails["product_quantity"] = $('#quantity_'+catalogEntryID).val();
						if($('#tel_product_id').size()>0){
							cartEventDetails["product_parent_sku"] = $('#tel_product_id').val();
						}
						pushEvent(cartEventDetails);
					}		
				}
			}
		}catch(err){
			console.log(err);
		}
		

	},updateValueQuanityInPdP:function(catalogEntryID){
		var thisobj =  $('#quantity_'+catalogEntryID);
		if(thisobj.length != 0 ){
			  if(petcoPersonalizationJS.checkPersonalizationUserInput(catalogEntryID,thisobj.val())) {
	                productDisplayJS.notifyQuantityChange(thisobj.val());
	                CheckoutHelperJS.isshowpersonalizationPopup = false;
	                var ltlorRxflagCatentryId = "";
	                if( $("#ltlproduct").length > 0){
	                	ltlorRxflagCatentryId = $("#ltlproduct").val();
	                }
	                wc.render.updateContext('personilaztionDisplayContext',
	                    {'quantity':thisobj.val(),
	                    'persAttr':petcoPersonalizationJS.findPersonalizedAttr(thisobj.val()),
	                    'maxUserInputQuantity':petcoPersonalizationJS.findMaxUserInputQuantity(),
	                    "ltlproduct":ltlorRxflagCatentryId,
						"catentryId":catalogEntryID}
	                );
	            }
	            cmManuallyTriggerEventTrack(thisobj,thisobj.val());
		}
	},
	updateValueQuanityInPdPUnderTemplateProduct:function(catalogEntryID,templateFlagVal,obj,SIGN_IN_URL,ltlorRxflag){
		if(obj.length != 0 ){
			  if(petcoPersonalizationJS.checkPersonalizationUserInput(catalogEntryID,obj.value)) {
	                productDisplayJS.notifyQuantityChange(obj.value);
	                CheckoutHelperJS.isshowpersonalizationPopup = false;
	                wc.render.updateContext('rxPersonilaztionDisplayContext',
	                		{'SIGN_IN_URL':SIGN_IN_URL,'ltlorRxflag':ltlorRxflag,'catentryId':catalogEntryID,'quantity':obj.value, 'fromPage': 'pdp','persAttr':'','maxUserInputQuantity':"1"});
	            }
	            cmManuallyTriggerEventTrack(obj,obj.value);
		}
	}
	
	,
	
	addtoWIshListClicked:function(){
		
	if (document.getElementById('addToShoppingList') != null && 
			document.getElementById('addToShoppingList') != 'undefined' && 
			"G" == dojo.cookie("WC_UserType")) {
			var urlParams = window.location.href;
			var signInURL = document.getElementById('addToShoppingList').href;
			var currentItemsUrl = "";
			if( typeof(productDisplayJS.itemPriceJsonOject) != "undefined" && 
				typeof(productDisplayJS.itemPriceJsonOject[productDisplayJS.bopusShowStoreDetailsCatEntryId])!= "undefined" ){
			
				currentItemsUrl = productDisplayJS.itemPriceJsonOject[productDisplayJS.bopusShowStoreDetailsCatEntryId].catalogEntry.description[0].seourl;
			}
			if(currentItemsUrl != ""){
				urlParams = currentItemsUrl;				
			}
			if(urlParams.indexOf('TopCategories') == -1  && urlParams.indexOf('CSR') == -1 && urlParams.indexOf('LogonForm') == -1){
				document.getElementById('addToShoppingList').href=signInURL+'&URL='+urlParams						
			}
		 }

		
		if(typeof(localStorageHelper) != "undefined"){
			localStorageHelper.set("isWhishListButtonClicked",'yes',1,false);
		}
	},
	addtoWIshListClickedRemoved:function(){
		if(typeof(localStorageHelper) != "undefined"){
			window.localStorage.removeItem('isWhishListButtonClicked');
		}
	},
	InventoryDetailsforItems:{},
	InventoryDetailsDetailsCallCompleted:false,
	bopusInventoryDetailsPopulated: false,
	fetchInventoryDetailsForAllProducts:function(catEntryId, productId){
	
		var inventorySystem = $('#inventorySystem').val();
		if(null != dojo.byId("pdp_atc"))
			dojo.style("pdp_atc","display","block");
		
		if(null != dojo.byId("splDelvMsg")) {
			// move location of splDelvMsg
			var deliveryMsg = dojo.byId("splDelvMsg");
			var deliveryMsgWrapper = dojo.byId("splDelvMsgWrapper");
			var deliveryMsg_clone = dojo.clone(deliveryMsg);
			deliveryMsg_clone.id = "splDelvMsgBopus"
			var deliveryMsgWrapperBopus = dojo.byId("splDelvMsgWrapperBopus");
			if(deliveryMsg != null && deliveryMsgWrapper != null){
				deliveryMsgWrapper.innerHTML = "";
				dojo.place(deliveryMsg, deliveryMsgWrapper);
			}
			if(deliveryMsg_clone != null && deliveryMsgWrapperBopus != null){
				deliveryMsgWrapperBopus.innerHTML = "";
				dojo.place(deliveryMsg_clone, deliveryMsgWrapperBopus);
			}
			// make visible
			dojo.style("splDelvMsg","display","inline");
			dojo.style("splDelvMsgBopus","display","inline");
		}
		var partsList = "";
		var infininteInventoryItem;
		var infinteInvItemList = "";
		if(inventorySystem == -4) {
			for(var item in productDisplayJS.entitledItems){
				infininteInventoryItem = productDisplayJS.entitledItems[item].isInfiniteInventoryItem;
				if(infininteInventoryItem != 'undefined' && infininteInventoryItem == 'true') {
					if(infinteInvItemList !=""){
						infinteInvItemList = infinteInvItemList+",";
					}
					infinteInvItemList = infinteInvItemList + productDisplayJS.entitledItems[item].catentry_id;
				} else {
					if(partsList !=""){
						partsList = partsList+",";
					}
					partsList = partsList + productDisplayJS.entitledItems[item].catentry_id;
				}			
			}	
		} else {
			for(var item in productDisplayJS.entitledItems){
				if(partsList !=""){
					partsList = partsList+",";
				}
				partsList = partsList + productDisplayJS.entitledItems[item].catentry_id;
			}
		}
		
		//PDWEB-17958: Changes to set 'ExternalInventory' as store's inventory system
		//YIH var isBOPUSEnabledItem = dojo.byId("isBOPUSEnabledItem");
		var isBOPUSEnabledItem = $("#isBOPUSEnabledItem").val();
		var isBOPUSEnabledItemflag = false;
		if(isBOPUSEnabledItem != null && isBOPUSEnabledItem == "yes"){
			isBOPUSEnabledItemflag = true;
		}
		
		
		if(inventorySystem == -4) {
			if(!isBOPUSEnabledItemflag){
				if(productDisplayJS.InventoryDetailsDetailsCallCompleted){
					productDisplayJS.displayInventoryBasedOnFetchedDetails(catEntryId,productId);
				} else {
					productDisplayJS.fetchInventoryDetailsForAllTheProducts(partsList, "", infinteInvItemList);
				}
			} else {
				var iterationCount = 7;
				if(productDisplayJS.bopusInventoryDetailsPopulated && productDisplayJS.InventoryDetailsDetailsCallCompleted){
					productDisplayJS.displayInventoryBasedOnFetchedDetails(catEntryId,productId);
				} else {
					/**
					 * The is to tackle the case where the physical store cookie is expired and waiting for the
					 * local storage to get cleared. This will handle the edge case where the store id is not
					 * passed to back end even if it exists in local storage
					 */
					var stlocId = productDisplayJS.getStoreIdFromPhyicalSToreIdCookie();
					if(stlocId != "" && stlocId != "NA"){
						productDisplayJS.fetchInventoryDetailsForAllTheProducts(partsList,stlocId, infinteInvItemList);
					}else if(stlocId != "NA"){								
						/** the code which keep checking WC_physicalStores in cookie for a user with no cookie and wait for 2 sec
						 * after that it assume the call to fetch physical store is failed and continue with fetch for online 
						 * inventory data. If at any point we get value for the cookie it stop and execute call to fetch inventory details.				 
						**/ 
						var IntervalValue = setInterval(function(){
							stlocId = productDisplayJS.getStoreIdFromPhyicalSToreIdCookie();
							if(stlocId != "" && stlocId != "NA"){
								productDisplayJS.fetchInventoryDetailsForAllTheProducts(partsList,stlocId,infinteInvItemList);
								clearTimeout(IntervalValue);
							} else if(stlocId == "NA"){							
								clearTimeout(IntervalValue);
							}
							if(iterationCount == 0){
								clearTimeout(IntervalValue);
								productDisplayJS.fetchInventoryDetailsForAllTheProducts(partsList,"",infinteInvItemList);
							}		
							iterationCount--;
						},200)					
					}
				}
			}
		} else {
			if(productDisplayJS.InventoryDetailsDetailsCallCompleted){
				productDisplayJS.displayInventoryBasedOnFetchedDetails(catEntryId,productId);
			} else {
				productDisplayJS.fetchInventoryDetailsForAllTheProducts(partsList, "", "");
			}		
		}
	},
	fetchInventoryDetailsForAllTheProducts:function(items, stlocId, infiniteInvItems){
		var params = new Object();
		params.itemId = items;
		params.langId = productDisplayJS.langId;
		params.storeId = productDisplayJS.storeId;
		params.catalogId = productDisplayJS.catalogId;		
		//PDWEB-17958: Changes to set 'ExternalInventory' as store's inventory system
		var inventorySystem = $('#inventorySystem').val();
		if(inventorySystem == -4) {
			var isBOPUSEnabledItemflag = false;
			var isBOPUSEnabledItem = dojo.byId("isBOPUSEnabledItem");
			if(isBOPUSEnabledItem != null && isBOPUSEnabledItem.value == "yes"){
				if(stlocId != 'undefined' && stlocId != ""){
					isBOPUSEnabledItemflag = true;
					params.storeLoc = stlocId;
				}			
			}
			if(infiniteInvItems != "") {
				params.infiniteInvItems = infiniteInvItems;
			}
			params.fetchStoreInventory = isBOPUSEnabledItemflag;
		} else {
			params.fetchStoreInventory = false;	
		}

		dojo.xhrPost({
				url: getAbsoluteURL() + "GetInventoryStatusByIDView",
				handleAs: "json-comment-filtered",
				content: params,
				service: this,
				load: productDisplayJS.populateInvDetails,
				error: function(errObj,ioArgs) {
					console.log(storeNLS["INV_STATUS_RETRIEVAL_ERROR"]);
				}
		});
	},
	/**
	* Populate the contents of the inventory details section in the product display page with the JSON returned 
	* from the server. This is the callback function that is called after the AJAX call to get the inventory 
	* details successfully returns to the client.
	* 
	* @param {Object} serviceResponse response object from dojo.xhrPost
	* @param {dojo.__IoCallbackArgs} ioArgs Argument to the IO call from dojo.xhrPost
	*/
	populateInvDetails:function(serviceResponse, ioArgs){		
		var onlineInventoryDetails = serviceResponse.onlineInventory;		
		var inventoryDetails = {};
		if(serviceResponse.itemCounter > 1){
			for(var i = 0 ; i < serviceResponse.itemCounter ; i++){				
				var individualItems = {};
				individualItems["onlineInventory_status"] = onlineInventoryDetails[i].status;
				individualItems["onlineInventory_image"] = onlineInventoryDetails[i].image;
				individualItems["onlineInventory_altText"] = onlineInventoryDetails[i].altText;
				individualItems["onlineInventory_itemCounter"] = serviceResponse.itemCounter;
				inventoryDetails[onlineInventoryDetails[i].catentryId] = individualItems;
			}
		}else{			
			var individualItems = {};
			individualItems["onlineInventory_status"] = onlineInventoryDetails.status;
			individualItems["onlineInventory_image"] = onlineInventoryDetails.image;
			individualItems["onlineInventory_altText"] = onlineInventoryDetails.altText;
			individualItems["onlineInventory_itemCounter"] = serviceResponse.itemCounter;
			inventoryDetails[onlineInventoryDetails.catentryId] = individualItems;
		}		
		
		//PDWEB-17958: Changes to set 'ExternalInventory' as store's inventory system
		var inventorySystem = $('#inventorySystem').val();
		if(inventorySystem == -4) {
			productDisplayJS.InventoryDetailsforBOPUSItems = {};
			if(typeof(serviceResponse.inStoreInventory) != 'undefined'){
				var storeInventoryDetails = serviceResponse.inStoreInventory.stores; 
				for(var j = 0 ; j < serviceResponse.storeCounter ; j++) {
					var individualItems = {};
					if(typeof(inventoryDetails[storeInventoryDetails[j].catentryId]) != "undefined"){
						individualItems = inventoryDetails[storeInventoryDetails[j].catentryId];
					}
					var catEntryId = storeInventoryDetails[j].catentryId;
					var availableQuantity = storeInventoryDetails[j].availableQuantity;
					var alertLevel = storeInventoryDetails[j].alertLevel;
					var stlocId = storeInventoryDetails[j].id;	
					if(!productDisplayJS.isBopusEligibileForStore(stlocId,catEntryId)){
						alertLevel = 'RED';
					}
					individualItems["inStoreInventory_availableQuantity_"+stlocId] = storeInventoryDetails[j].availableQuantity;
					individualItems["inStoreInventory_alertLevel_"+stlocId] = alertLevel;
					inventoryDetails[catEntryId] = individualItems;
				}
				productDisplayJS.bopusInventoryDetailsPopulated = true;
			}
		} 
		
		productDisplayJS.InventoryDetailsDetailsCallCompleted = true;
		productDisplayJS.InventoryDetailsforItems = inventoryDetails;
		buildProductInventoryDataLayer(inventoryDetails,'onload');
		productDisplayJS.displayInventoryBasedOnFetchedDetails(productDisplayJS.bopusShowStoreDetailsCatEntryId,productDisplayJS.bopusShowStoreDetailsProductId );
		
	},
	displayInventoryBasedOnFetchedDetails : function(itemId,productId){ 
		
		if (document.getElementById("HolidayShipMsgFlag") != null) {
			if (document.getElementById("HolidayShipMsgFlag").value == 'Y') {
				getShippingMessage(productDisplayJS.storeId, productDisplayJS.catalogId, productDisplayJS.langId, 
					'', 'Y', itemId, 'N');
			}
		}

		var invdetailsforItem = productDisplayJS.InventoryDetailsforItems[itemId];
		var catEntry = productDisplayJS.itemPriceJsonOject[itemId].catalogEntry;
		var isBopusProduct = catEntry.isBopusProduct;
		var isInstoreItem = catEntry.InStoreOnly;
		var isOutOfStock = false;
		if(typeof(invdetailsforItem["onlineInventory_itemCounter"]) != 'undefined' &&
		invdetailsforItem["onlineInventory_itemCounter"] > 0 && 
		isInstoreItem != 'yes'){
			var invStatusTextBopusId = "InventoryStatus_OnlineStatusBopus_"+productId;
			dojo.removeClass(invStatusTextBopusId, "in_stock out_of_stock");
			dojo.place("<img id='InventoryStatus_OnlineStatusBopus_Img_"+productId+"' src='"
					+ imageDirectoryPath + "\img/" + invdetailsforItem["onlineInventory_image"]
					+ "' alt='"+invdetailsforItem["onlineInventory_altText"]+"' border='0' />", 
					"InventoryStatus_OnlineStatusBopus_Img_"+productId, "replace");
			dojo.html.set(dojo.byId("InventoryStatus_OnlineStatusBopus_"+productId),invdetailsforItem["onlineInventory_status"]);
			dojo.style("InventoryStatus_Availability_SectionBopus_"+productId,"display","block");
			
			if(document.getElementById("notifybutton")!=null){
				$("#notifybutton").removeClass("show");				
				$("#notifybutton").addClass("hide");
			}
			if(document.getElementById("add2CartBtn")!=null){
				document.getElementById("add2CartBtn").style.display = "block";
			}
			
			if(invdetailsforItem["onlineInventory_status"] != 'In-Stock' ){
				dojo.addClass(invStatusTextBopusId, "out_of_stock");
				if(document.getElementById("notice-box")!=null ){
					dojo.style("notice-box","display","none");
				}
				if(document.getElementById("add2CartBtn")!=null){
					document.getElementById("add2CartBtn").style.display = "none";
					document.getElementById("add2CartBtn").disabled = true;
				}
				$("#add2CartBtn").removeClass("show");
				$("#pdp_atc").parent().removeClass("show");
				$("#notifybutton").removeClass("hide");				
				$("#notifybutton").addClass("show");
				$("#add2CartBtn").addClass("hide");
				$("#pdp_atc").parent().addClass("hide");
				$("#selectRDOrderBtn").hide();
				$("#selectRDOrderBtnCpy").hide();
				$("#selectRDOrderBtn").addClass("hide");
				$("#selectRDOrderBtn").removeClass("show");
				$("#selectRDOrderBtnCpy").addClass("hide");
				$("#selectRDOrderBtnCpy").removeClass("show");
				if(document.getElementById("notifybutton")!=null){
					$("#notifybutton").addClass("show");
					// Add captch JS when Notify button is enabled.
					loadreCAPTCHAJSfile();
				}
				if (document.getElementById("selectRDOrderBtn") != null) {
					document.getElementById("selectRDOrderBtn").disabled = true;
				}
				if (document.getElementById("selectRDOrderBtnCpy") != null) {
					document.getElementById("selectRDOrderBtnCpy").disabled = true;
				}
				if(document.getElementById("WC_QuickInfo_Link_addtocart")!=null){
					document.getElementById("WC_QuickInfo_Link_addtocart").style.cursor = "default";
					document.getElementById("WC_QuickInfo_Link_addtocart").style.pointerEvents  = "none";
					document.getElementById("WC_QuickInfo_Link_addtocart").style.opacity = "0.65";
				}
				if(document.getElementById("add2RDOrderBtn")!=null){
					document.getElementById("add2RDOrderBtn").style.cursor = "default";
					document.getElementById("add2RDOrderBtn").style.pointerEvents  = "none";
					document.getElementById("add2RDOrderBtn").style.opacity = "0.65";
				}
				var rdOptioncontainer = dojo.byId("rd-option-container");
				var rdAddOnOptioncontainer = dojo.byId("rd-add-on");
				if(rdOptioncontainer  != null){
					dojo.addClass(rdOptioncontainer ,"hide");
					dojo.removeClass(rdOptioncontainer ,"show");
				}
				if(rdAddOnOptioncontainer  != null){
					dojo.addClass(rdAddOnOptioncontainer ,"hide");
					dojo.removeClass(rdAddOnOptioncontainer ,"show");
				}
				/*var inventorySchema = dojo.query("div#pdpInventoryAvaiableitySchema link");
				if(inventorySchema.length > 0 ){
					dojo.attr(inventorySchema[0],'itemprop','availability');
					dojo.attr(inventorySchema[0],'href','http://schema.org/OutOfStock');
				}*/
				productDisplayJS.disableAllButtoninpage();
			}else{
				isOutOfStock = true;
				dojo.addClass(invStatusTextBopusId, "in_stock");
				var rdOptioncontainer = dojo.byId("rd-option-container");
				if(rdOptioncontainer != null && productDisplayJS.isRdProduct){
					dojo.addClass(rdOptioncontainer ,"show");
					dojo.removeClass(rdOptioncontainer ,"hide");
				}
				$("#add2CartBtn").removeClass("hide");
				$("#pdp_atc").parent().removeClass("hide");
				$("#notifybutton").removeClass("show");				
				$("#notifybutton").addClass("hide");
				$("#add2CartBtn").addClass("show");
				$("#pdp_atc").parent().addClass("show");
				$("#selectRDOrderBtn").show();
				$("#selectRDOrderBtnCpy").show();	
				$("#selectRDOrderBtn").removeClass("hide");
				$("#selectRDOrderBtn").addClass("show");
				$("#selectRDOrderBtnCpy").removeClass("hide");
				$("#selectRDOrderBtnCpy").addClass("show");
				if(document.getElementById("notice-box")!=null && document.getElementById("notice-box")!='undefined'){
					if(document.getElementById("pdp-persistent-container")!= null && document.getElementById("pdp-persistent-container") != undefined){
						if(document.getElementById("pdp-persistent-container").classList.contains("fixed")){
							dojo.style("notice-box","display","none");
						}else{
					dojo.style("notice-box","display","block");
				}
					}				
				}
				if(document.getElementById("add2CartBtn")!=null && document.getElementById("add2CartBtn")!='undefined'){
					document.getElementById("add2CartBtn").disabled = false;
				}
				if (document.getElementById("selectRDOrderBtn") != null && document.getElementById("selectRDOrderBtn") != 'undefined') {
					document.getElementById("selectRDOrderBtn").disabled = false;
				}
				if (document.getElementById("selectRDOrderBtnCpy") != null && document.getElementById("selectRDOrderBtnCpy") != 'undefined') {
					document.getElementById("selectRDOrderBtnCpy").disabled = false;
				}
				
				if(document.getElementById("WC_QuickInfo_Link_addtocart")!=null && document.getElementById("WC_QuickInfo_Link_addtocart")!='undefined'){
					document.getElementById("WC_QuickInfo_Link_addtocart").style.cursor = "pointer";
					document.getElementById("WC_QuickInfo_Link_addtocart").style.pointerEvents  = "auto";
					document.getElementById("WC_QuickInfo_Link_addtocart").style.opacity = "1.0";
				}
				if(document.getElementById("add2RDOrderBtn")!=null && document.getElementById("add2RDOrderBtn")!='undefined'){
					document.getElementById("add2RDOrderBtn").style.cursor = "pointer";
					document.getElementById("add2RDOrderBtn").style.pointerEvents  = "auto";
					document.getElementById("add2RDOrderBtn").style.opacity = "1.0";
				}
				/*var inventorySchema = dojo.query("div#pdpInventoryAvaiableitySchema link");
				if(inventorySchema.length > 0){
					dojo.attr(inventorySchema[0],'itemprop','availability');
					dojo.attr(inventorySchema[0],'href','http://schema.org/InStock');
				}*/
				productDisplayJS.enableAllButtoninpage();
			}
			
			if(typeof(productDisplayJS) != 'undefined'){
				productDisplayJS.toggleAddonButton();
			}
		}else {
			console.log(storeNLS["INV_STATUS_RETRIEVAL_ERROR"]);
		}
		
		var inventorySystem = $('#inventorySystem').val();
		if(inventorySystem == -4){
			//var isOutOfStock = false;
			var instockstatus = dojo.byId("bopusdeailsInStock");
			var outstockstatus = dojo.byId("bopusdeailsNotAvailable");
			var lowstockstatus = dojo.byId("bopusdeailsLowInventory");	
			var instockstatusSelectable = dojo.byId("bopusdeailsInStockSelectable");
			var outstockstatusSelectable = dojo.byId("bopusdeailsNotAvailableSelectable");
			var lowstockstatusSelectable = dojo.byId("bopusdeailsLowInventorySelectable");	
			var storeId = productDisplayJS.getStoreIdFromPhyicalSToreIdCookie();
			if(storeId != "" && storeId != "NA"){			
				dojo.forEach(dojo.query(".bopustockavailabilitymsg"),function(obj){
					dojo.removeClass(obj,"show");
				})
				dojo.forEach(dojo.query(".bopustockavailabilitymsg"),function(obj){
					dojo.addClass(obj,"hide");
				})
			
				// removing the in store section if present
				dojo.query("#InventoryStatus_InStore_Section_"+productId).orphan();			
				if(invdetailsforItem["inStoreInventory_alertLevel_"+storeId] == 'RED'){
					if(lowstockstatus != null){
						dojo.addClass(outstockstatus,"show");
						dojo.removeClass(outstockstatus,"hide");
					}
					if(outstockstatusSelectable != null){
						dojo.addClass(outstockstatusSelectable,"show");
						dojo.removeClass(outstockstatusSelectable,"hide");
					}
					
				}else if(invdetailsforItem["inStoreInventory_alertLevel_"+storeId] == 'GREEN'){
					if(instockstatus != null){
						dojo.addClass(instockstatus,"show");
						dojo.removeClass(instockstatus,"hide");
					}
					if(instockstatusSelectable != null){
						dojo.addClass(instockstatusSelectable,"show");
						dojo.removeClass(instockstatusSelectable,"hide");
					}
				}else{
					if(lowstockstatus != null){
						dojo.addClass(lowstockstatus,"show");
						dojo.removeClass(lowstockstatus,"hide");
					}
					if(lowstockstatusSelectable != null){
						dojo.addClass(lowstockstatusSelectable,"show");
						dojo.removeClass(lowstockstatusSelectable,"hide");
					}
				}		
			}
			if(dojo.query(".bopustockavailabilitymsg.show").length==0 && outstockstatus != null ){
				dojo.addClass(outstockstatus,"show");
				dojo.removeClass(outstockstatus,"hide");
			}
			if(dojo.query(".bopustockavailabilitymsg.show").length==0 && outstockstatusSelectable != null ){
				dojo.addClass(outstockstatusSelectable,"show");
				dojo.removeClass(outstockstatusSelectable,"hide");
			}
		
			if(($('#bopusdeailsNotAvailableSelectable.show').length > 0 || $('#bopusdeailsLowInventorySelectable.show').length > 0) && $('#add2CartBtn_bopus').length > 0){
				$('#add2CartBtn_bopus')[0].innerHTML="Not Available";
				$('#add2CartBtn_bopus')[0].disabled = true;
			}else if(($('#bopusdeailsInStockSelectable.show').length > 0) && $('#add2CartBtn_bopus').length > 0){
				$('#add2CartBtn_bopus')[0].innerHTML="Add to Cart";
				$('#add2CartBtn_bopus')[0].disabled = false;
				if($("#pdp_atc").parent().length > 0 && $("#pdp_atc").parent()[0].classList.contains("hide")){
					 $("#pdp_atc").parent().removeClass('hide');
				}
			}
		}
		
		var addToCartButton = dojo.byId("add2CartBtn");
		var addToCartButton_cpy1 = dojo.byId("add2CartBtn_cpy1");
		var addToCartButton_cpy2 = dojo.byId("add2CartBtn_cpy2");
		var notifyButton = dojo.byId("notifybutton");
		var notifyButton_cpy1 = dojo.byId("notifybutton_cpy1");
		
		if(addToCartButton != null){
			if(addToCartButton_cpy1 != null){
				var addToCartButton_cpy1_clone = dojo.clone(addToCartButton);
				addToCartButton_cpy1_clone.id = "add2CartBtn_cpy1";
				dojo.place(addToCartButton_cpy1_clone,'add2CartBtn_cpy1','replace');
			}
			if(addToCartButton_cpy2 != null){
				var addToCartButton_cpy2_clone = dojo.clone(addToCartButton);
				addToCartButton_cpy2_clone.id = "add2CartBtn_cpy2";
				dojo.place(addToCartButton_cpy2_clone,'add2CartBtn_cpy2','replace');
			}
		}
		
		if(notifyButton != null){
			if(notifyButton_cpy1 != null){
				var notifyButton_cpy1_clone = dojo.clone(notifyButton);
				notifyButton_cpy1_clone.id = "notifybutton_cpy1";
				dojo.place(notifyButton_cpy1_clone,'notifybutton_cpy1','replace');
			}
		}
		
		var inStoreSku = false;
		for (var x in productDisplayJS.entitledItems) {
			var catId = productDisplayJS.entitledItems[x].catentry_id;
			if(typeof(itemId) != "undefined" && catId == itemId){
				var inStore = productDisplayJS.entitledItems[x].InStoreOnly;
				if(inStore == 'true'){
					inStoreSku = true;
				}
			}
		}
		if(inStoreSku){
			  if(null != dojo.byId("add-to-controls") && isBopusProduct != 'yes'){
			 dojo.style("add-to-controls","display","none");
			  }
		
			 if(null != dojo.byId("notifyMe"))
				 dojo.style("notifyMe","display","none");
			 if(null != dojo.byId("pdp_atc")&& isBopusProduct != 'yes'){
				 dojo.style("pdp_atc","display","none");
			 }
				 
			 if(null != dojo.byId("splDelvMsg"))
				 dojo.style("splDelvMsg","display","none");
		 }
		
		if(($('#bopusdeailsNotAvailableSelectable.show').length > 0 || $('#bopusdeailsLowInventorySelectable.show').length > 0) && $('#add2CartBtn_bopus').length > 0){
			$('#add2CartBtn_bopus')[0].innerHTML="Not Available";
			$('#add2CartBtn_bopus')[0].disabled = true;
		}else if(($('#bopusdeailsInStockSelectable.show').length > 0) && $('#add2CartBtn_bopus').length > 0){
			$('#add2CartBtn_bopus')[0].innerHTML="Add to Cart";
			$('#add2CartBtn_bopus')[0].disabled = false;
			if($("#pdp_atc").parent().length > 0 && $("#pdp_atc").parent()[0].classList.contains("hide")){
				 $("#pdp_atc").parent().removeClass('hide');
			}
		}
		
			if (dojo.byId("tabselected") != null) {
				dojo.byId("tabselected").value = '';	
			}
			
			if($(".instore-deliveryBox").length == 0 && $(".paramStore-deliveryBox").length == 0 && !inStoreSku){
				productDisplayJS.correctAndFixButtonBasedOnSelection(isOutOfStock);
			}
			
			if($(".delivery-option-input:checked").length > 0 && $(".delivery-option-input:checked").length == 1 && productDisplayJS.bopusShowStoreDetailsProductId != ""){
				
				productDisplayJS.refreshActionButton($(".delivery-option-input:checked").val(), 'entitledItem_'+productDisplayJS.bopusShowStoreDetailsProductId);
			}
			document.getElementById("restrictionMessage").innerHTML ="";
			if(!inStoreSku){
				var zipcode= productDisplayJS.getZipCodeForRestrictedCheck();					
				document.getElementById("restrictionMessage").innerHTML ="";
				var brand =document.getElementById("brand_pdp").value;
				if(zipcode !=null ) {					
					isRestricted(itemId,zipcode,brand);
				} 
			}
		
		
	},
	resetAddToCartollPosition:function(){
		if(dojo.query('div#pdp-persistent-spacer div#pdp-persistent-placeholder').length >0 ){
			if(dojo.byId("pdp-persistent-placeholder") != null && dojo.byId("pdp-persistent-placeholder") != null  ){
				dojo.place('pdp-persistent-placeholder','pdp-product-info',"after");
			}
		}
	},
	//API to fetch availability from YIH '/wcs/resources/store/<storeId>/yih/inventoryavailability/<itemIds>?physicalStoreId=<physicalStoreIds>
	findYIHInvetoryAvailabilityURL: function(items,storeId){
		if(typeof(storeId) == "undefined"){
			storeId = productDisplayJS.getStoreIdFromPhyicalSToreIdCookie();
		}
		var url = '';
		// http or https protocol
 		var protocol = window.location.protocol;
 		// domain e.g petco.com, sit-www.petco.com
 		var hostname = window.location.hostname;
 		// REST API root path 
		var portname = window.location.port;
		if( portname != "" ){
	 		hostname = hostname+":"+portname;
	 	}
 		var rootPath = '/wcs/resources/store/'+productDisplayJS.storeId+'/yih/inventoryavailability/';
 		if($('div.previewEspot[id^="ShowInformation_ID_"]').length > 0 ){
	 			rootPath = '/wcs/previewresources/store/'+productDisplayJS.storeId+'/yih/inventoryavailability/';
	 	}
		url = protocol + '//' + hostname + rootPath + items + "?physicalStoreId=" + storeId;
 		return url;
	},
	//Inventory availability check from YIH for BOPUS eligible items
	InventoryDetailsforBOPUSItems:{},
	YIHCallCompleted:false,
	fetchInventoryDetailsFromYIH:function(catEntryId, productId){
		if(null != dojo.byId("pdp_atc"))
			dojo.style("pdp_atc","display","block");
		
		if(null != dojo.byId("splDelvMsg")) {
			// move location of splDelvMsg
			var deliveryMsg = dojo.byId("splDelvMsg");
			var deliveryMsgWrapper = dojo.byId("splDelvMsgWrapper");
			var deliveryMsg_clone = dojo.clone(deliveryMsg);
			deliveryMsg_clone.id = "splDelvMsgBopus"
			var deliveryMsgWrapperBopus = dojo.byId("splDelvMsgWrapperBopus");
			if(deliveryMsg != null && deliveryMsgWrapper != null){
				deliveryMsgWrapper.innerHTML = "";
				dojo.place(deliveryMsg, deliveryMsgWrapper);
			}
			if(deliveryMsg_clone != null && deliveryMsgWrapperBopus != null){
				deliveryMsgWrapperBopus.innerHTML = "";
				dojo.place(deliveryMsg_clone, deliveryMsgWrapperBopus);
			}
			// make visible
			dojo.style("splDelvMsg","display","inline");
			dojo.style("splDelvMsgBopus","display","inline");
		}
		var partsList = "";
		for(var item in productDisplayJS.entitledItems){
			var isBOPUSEligibleItem = productDisplayJS.entitledItems[item].isBopusEligibleItem;
			if(isBOPUSEligibleItem == 'true') {
				if(partsList !=""){
					partsList = partsList+",";
				}
			
				partsList = partsList + productDisplayJS.entitledItems[item].catentry_id;
			}			
		}		
		var isBOPUSEnabledItem = dojo.byId("isBOPUSEnabledItem");
		var isBOPUSEnabledItemflag = false;
		if(isBOPUSEnabledItem != null && isBOPUSEnabledItem.value == "yes"){
			if(partsList != ""){
			isBOPUSEnabledItemflag = true;
			}
		}
		
		if(productDisplayJS.YIHCallCompleted){
			var storeId = productDisplayJS.getStoreIdFromPhyicalSToreIdCookie();
			var storedDetailsForInv = productDisplayJS.InventoryDetailsforBOPUSItems[catEntryId]["inStoreInventory_alertLevel_"+storeId];
			if(typeof(storedDetailsForInv) == "undefined" && isBOPUSEnabledItemflag && storeId != "" && storeId != "NA"){
				productDisplayJS.fetchInventoryDetailsForAllTheProductsFromYIH(partsList,stlocId);
			}else{
				productDisplayJS.displayInventoryBasedOnDetailsFetchedFromYIH(catEntryId,productId);
			}
		}else{			
			var iterationCount = 7;
			if(isBOPUSEnabledItemflag){
				/**
				 * The is to tackle the case where the physical store cookie is expired and waiting for the
				 * local storage to get cleared. This will handle the edge case where the store id is not
				 * passed to back end even if it exists in local storage
				 */
				var stlocId = productDisplayJS.getStoreIdFromPhyicalSToreIdCookie();
				if(stlocId != "" && stlocId != "NA"){
					productDisplayJS.fetchInventoryDetailsForAllTheProductsFromYIH(partsList,stlocId);
				}else if(stlocId != "NA"){
					/** the code which keep checking WC_physicalStores in cookie for a user with no cookie and wait for 2 sec
					 * after that it assume the call to fetch physical store is failed and continue with fetch for online 
					 * inventory data. If at any point we get value for the cookie it stop and execute call to fetch inventory details.				 
					**/ 
					var IntervalValue = setInterval(function(){
						stlocId = productDisplayJS.getStoreIdFromPhyicalSToreIdCookie();
						var fetchedVal = false;
						if(stlocId != "" && stlocId != "NA"){
							productDisplayJS.fetchInventoryDetailsForAllTheProductsFromYIH(partsList,stlocId);
							fetchedVal = true;
							clearTimeout(IntervalValue);
						}else if(stlocId == "NA"){							
							clearTimeout(IntervalValue);
						}
						if(iterationCount == 0){
							clearTimeout(IntervalValue);
						}		
						iterationCount--;
					},200)					
				}
			}
		}
	},
	fetchInventoryDetailsForAllTheProductsFromYIH:function(items,storeId){
		
		if(typeof(storeId) == "undefined"){
			storeId =  productDisplayJS.getStoreIdFromPhyicalSToreIdCookie();
		}
		if(document.getElementById("isInventoryCallMadeForBopus")!=null){
			if(storeId != "" && storeId != "NA"){
				document.getElementById("isInventoryCallMadeForBopus").value = "true";
			}
		}
		
		var url = productDisplayJS.findYIHInvetoryAvailabilityURL(items,storeId);
		
		//Invoke WCS REST API to get inventory availability from YIH / INVAVL (fallback)
	 	$.ajax({
	 		url : url,
	 		type : 'GET',
	 		 cache: false,
	 		contentType: 'application/json',
	 		dataType: 'json',
	 		data: '',
	 		success: function(data){
	 			productDisplayJS.populateInvDetailsFromYIH(data);
	 		},
	 		error: function(){
	 			console.log(storeNLS["INV_STATUS_RETRIEVAL_ERROR"]);
	 		}
	 	});  		
	},
	
	/**
	* Populate the contents of the inventory details section in the product display page with the JSON returned 
	* from YIH inventory availability call. This is the callback function that is called after the AJAX call to get the inventory 
	* details successfully returns to the client.
	* 
	* @param {Object} serviceResponse response object from the AJAX call
	* 
	*/
	populateInvDetailsFromYIH:function(serviceResponse){	
		var inventoryDetails = {};
		if(typeof(serviceResponse.inStoreInventory) != 'undefined'){
			var storeInventoryDetails = serviceResponse.inStoreInventory; 
			for(var j = 0 ; j < storeInventoryDetails.length ; j++){				
				var individualItems = {};
				if(typeof(inventoryDetails[storeInventoryDetails[j].catentryId]) != "undefined"){
					individualItems = inventoryDetails[storeInventoryDetails[j].catentryId];
				}
				var catEntryId = storeInventoryDetails[j].catEntryId;
				var qtyAvailable = storeInventoryDetails[j].qtyAvailable;
				var alertLevel = storeInventoryDetails[j].alertLevel;
				var stlocId = storeInventoryDetails[j].stlocId;		
				if(!productDisplayJS.isBopusEligibileForStore(stlocId,catEntryId)){
					alertLevel = 'RED';
				}
				
				individualItems["inStoreInventory_availableQuantity_"+stlocId] = storeInventoryDetails[j].qtyAvailable;
				individualItems["inStoreInventory_alertLevel_"+stlocId] = alertLevel;
				inventoryDetails[catEntryId] = individualItems;
			}
		}
		productDisplayJS.YIHCallCompleted = true;
		productDisplayJS.InventoryDetailsforBOPUSItems = inventoryDetails;
		productDisplayJS.displayInventoryBasedOnDetailsFetchedFromYIH(productDisplayJS.bopusShowStoreDetailsCatEntryId,productDisplayJS.bopusShowStoreDetailsProductId );
		
	},
	displayInventoryBasedOnDetailsFetchedFromYIH : function(itemId,productId){
		var invdetailsforItem = productDisplayJS.InventoryDetailsforBOPUSItems[itemId];
		var isOutOfStock = false;
		var instockstatus = dojo.byId("bopusdeailsInStock");
		var outstockstatus = dojo.byId("bopusdeailsNotAvailable");
		var lowstockstatus = dojo.byId("bopusdeailsLowInventory");	
		var instockstatusSelectable = dojo.byId("bopusdeailsInStockSelectable");
		var outstockstatusSelectable = dojo.byId("bopusdeailsNotAvailableSelectable");
		var lowstockstatusSelectable = dojo.byId("bopusdeailsLowInventorySelectable");	
		var storeId = productDisplayJS.getStoreIdFromPhyicalSToreIdCookie();
		if(storeId != "" && storeId != "NA"){
			
			dojo.forEach(dojo.query(".bopustockavailabilitymsg"),function(obj){
				dojo.removeClass(obj,"show");
			})
			dojo.forEach(dojo.query(".bopustockavailabilitymsg"),function(obj){
				dojo.addClass(obj,"hide");
			})
			
			// removing the in store section if present
			dojo.query("#InventoryStatus_InStore_Section_"+productId).orphan();
			
				if(invdetailsforItem["inStoreInventory_alertLevel_"+storeId] == 'RED'){
					if(lowstockstatus != null){
						dojo.addClass(outstockstatus,"show");
						dojo.removeClass(outstockstatus,"hide");
					}
					if(outstockstatusSelectable != null){
						dojo.addClass(outstockstatusSelectable,"show");
						dojo.removeClass(outstockstatusSelectable,"hide");
					}
					
				}else if(invdetailsforItem["inStoreInventory_alertLevel_"+storeId] == 'GREEN'){
					if(instockstatus != null){
						dojo.addClass(instockstatus,"show");
						dojo.removeClass(instockstatus,"hide");
					}
					if(instockstatusSelectable != null){
						dojo.addClass(instockstatusSelectable,"show");
						dojo.removeClass(instockstatusSelectable,"hide");
					}
				}else{
					if(lowstockstatus != null){
						dojo.addClass(lowstockstatus,"show");
						dojo.removeClass(lowstockstatus,"hide");
					}
					if(lowstockstatusSelectable != null){
						dojo.addClass(lowstockstatusSelectable,"show");
						dojo.removeClass(lowstockstatusSelectable,"hide");
					}
				}
			
		
		}
		if(dojo.query(".bopustockavailabilitymsg.show").length==0 && outstockstatus != null ){
			dojo.addClass(outstockstatus,"show");
			dojo.removeClass(outstockstatus,"hide");
		}
		if(dojo.query(".bopustockavailabilitymsg.show").length==0 && outstockstatusSelectable != null ){
			dojo.addClass(outstockstatusSelectable,"show");
			dojo.removeClass(outstockstatusSelectable,"hide");
		}
		
		if(($('#bopusdeailsNotAvailableSelectable.show').length > 0 || $('#bopusdeailsLowInventorySelectable.show').length > 0) && $('#add2CartBtn_bopus').length > 0){
			$('#add2CartBtn_bopus')[0].innerHTML="Not Available";
			$('#add2CartBtn_bopus')[0].disabled = true;
		}else if(($('#bopusdeailsInStockSelectable.show').length > 0) && $('#add2CartBtn_bopus').length > 0){
			$('#add2CartBtn_bopus')[0].innerHTML="Add to Cart";
			$('#add2CartBtn_bopus')[0].disabled = false;
			if($("#pdp_atc").parent().length > 0 && $("#pdp_atc").parent()[0].classList.contains("hide")){
				 $("#pdp_atc").parent().removeClass('hide');
			}
		}
	},
	/**
	 * Get the default ship mode id from the json stored in local storage
	 */
	getShipModeIdForDefault:function(){
		var defaultShipMode = "";
		var LOCALSTORAGE_STORES_KEY = 'petcostores';
		var oShipModes = JSON.parse(localStorage.getItem(LOCALSTORAGE_STORES_KEY)) != null ? JSON.parse(localStorage.getItem(LOCALSTORAGE_STORES_KEY)) : {};
		if(typeof(oShipModes.shipmodes) != "undefined" && oShipModes.shipmodes.length > 0 ){
			var shipmodes = JSON.parse(oShipModes.shipmodes);
			if(typeof(shipmodes.DEFAULT_SHIPMODE) != "undefined"){
				defaultShipMode = shipmodes.DEFAULT_SHIPMODE;
			}
		}
		return defaultShipMode;
	},
	/**
	 * Get the zip code  from the json stored in local storage
	 */
	getZipCodeForRestrictedCheck:function(){
		var zipcode = null;
		var LOCALSTORAGE_STORES_KEY = 'petcostores';
		var zipcodes = JSON.parse(localStorage.getItem(LOCALSTORAGE_STORES_KEY)) != null ? JSON.parse(localStorage.getItem(LOCALSTORAGE_STORES_KEY)) : {};
		if(typeof(zipcodes.petcostores) != "undefined" && zipcodes.petcostores.length > 0 ){
			var nearestZip = JSON.parse(zipcodes.petcostores);
			if(nearestZip.length > 0){
				zipcode = JSON.parse(zipcodes.petcostores)[0].ZIPCODE;
			}
		}
		return zipcode;
	},
	/**
	 * Get the default ffm center id from the json stored in local storage
	 */
	getFfmCenterDefault:function(){
		var defaultFfmCeter = "";
		var LOCALSTORAGE_STORES_KEY = 'petcostores';
		var oShipModes = JSON.parse(localStorage.getItem(LOCALSTORAGE_STORES_KEY)) != null ? JSON.parse(localStorage.getItem(LOCALSTORAGE_STORES_KEY)) : {};
		if(typeof(oShipModes.shipmodes) != "undefined" && oShipModes.shipmodes.length > 0 ){
			var shipmodes = JSON.parse(oShipModes.shipmodes);
			if(typeof(shipmodes.DEFAULT_FFMCENTER) != "undefined"){
				defaultFfmCeter = shipmodes.DEFAULT_FFMCENTER;
			}
		}
		return defaultFfmCeter;
	},
	/**
	 * Get the BOPUS shipmode id from the json stored in local storage
	 */
	getShipModeIdForBOPUS:function(){
		var bopusShipMode = "";
		var LOCALSTORAGE_STORES_KEY = 'petcostores';
		var oShipModes = JSON.parse(localStorage.getItem(LOCALSTORAGE_STORES_KEY)) != null ? JSON.parse(localStorage.getItem(LOCALSTORAGE_STORES_KEY)) : {};
		if(typeof(oShipModes.shipmodes) != "undefined" && oShipModes.shipmodes.length > 0 ){
			var shipmodes = JSON.parse(oShipModes.shipmodes);
			if(typeof(shipmodes.BOPUS_SHIPMODE) != "undefined"){
				bopusShipMode = shipmodes.BOPUS_SHIPMODE;
			}
		}
		return bopusShipMode;
	},
	/**
	 * Get the physical store id from the json stored in local storage
	 */
	getStoreIdFromPhyicalSToreIdCookie:function(){
		var storeId = "";
		var physicalStoreCookie = dojo.cookie("WC_physicalStores");
		if(typeof(physicalStoreCookie) != "undefined"){
			var stores = dojo.cookie("WC_physicalStores").split(",");
			if(stores.length > 0 && stores[0] != "undefined"){
				storeId = stores[0];
			}
		}
		if(storeId == ""){
			var LOCALSTORAGE_STORES_KEY = 'petcostores';
			var oNeareststores = JSON.parse(localStorage.getItem(LOCALSTORAGE_STORES_KEY)) != null ? JSON.parse(localStorage.getItem(LOCALSTORAGE_STORES_KEY)) : {};
			if(typeof(oNeareststores.petcostores) != "undefined" && oNeareststores.petcostores.length > 0 ){
				var nearestSTores = JSON.parse(oNeareststores.petcostores);
				if(nearestSTores.length > 0){
					storeId = JSON.parse(oNeareststores.petcostores)[0].STLOC_ID;
				}
			}else if(typeof(oNeareststores.petcostores) == "undefined" && typeof(oNeareststores.userDetails) != "undefined"){
				storeId = 'NA';
			}
			
		}
		
		return storeId;
	},
	
	removeQuotes: function(str) {
		if (str) {
			return str.replace(/&#039;/g, '').replace(/\\'/g, '').replace(/'/g, '');
		} else {
			return str; }
		},
	correctAndFixButtonBasedOnSelection:function(isOutOfStock){
		var rdOptionsSelectarray = dojo.query('input[name="rdOptionsSelect"][type=radio]:checked');
		if(rdOptionsSelectarray.length > 0 ){
			var rdOptionsSelectVal = rdOptionsSelectarray[0].value;
			if(!isOutOfStock){
				var rdOptionsSelectarray = dojo.query('input#one-time-delivery[name="rdOptionsSelect"][type=radio]');
				if(rdOptionsSelectarray.length > 0){
					rdOptionsSelectarray[0].checked = true;
				  var $radioButtons = $("input[type='radio'].delivery-option-input");
				  $radioButtons.parents('.radio').removeClass('selected');
			      $radioButtons.filter(':not(:checked)').removeAttr('checked');
			      $radioButtons.filter(':checked').attr('checked', '');
			      $radioButtons.filter(':checked').parents('.radio').addClass('selected');
			      if($('#store-pickup-dropdown').length > 0){
			          if($('#store-pickup:checked.store-pickup-option-input').length > 0){
			     	$('#store-pickup-dropdown').removeClass('half').addClass('open');
			     }else{
			     	$('#store-pickup-dropdown').addClass('half').removeClass('open');
			     }
			      }
				}
			}else{

				if(rdOptionsSelectVal == 'repeat-delivery-add-on'){
					if(dojo.byId("selectRDOrderBtn") != null){
					dojo.addClass("selectRDOrderBtn","show");
					dojo.removeClass("selectRDOrderBtn","hide");
					}
					if(dojo.byId("add2CartBtn") != null){
					dojo.removeClass("add2CartBtn","show");
					dojo.addClass("add2CartBtn","hide");
					}
					
				}else{
					
					if(document.getElementById('itemOrProd') != null && document.getElementById('itemOrProd') != undefined
					&& $("input#store-pickup:checked").length == 0 && $("#repeat-delivery-select.instore-deliveryBox").length == 0 && $("#repeat-delivery-select.paramStore-deliveryBox").length == 0 ){
						var itemOrProd = document.getElementById('itemOrProd').value;
						var rdNotDisplay = document.getElementById('rdNotDisplay').value;
						if(itemOrProd == 'Item'){
							document.getElementById("one-time-delivery").click();
						} else if(itemOrProd == 'Prod'){
							if(rdNotDisplay == 'Yes') {
								document.getElementById("repeat-delivery-radio").click();
							} else {
								document.getElementById("one-time-delivery").click();
							}
							
						}
					}
					
				}
			}
		}
	},
	disableAllButtoninpage: function(){
		$("#selectRDOrderBtn").prop("disabled",true);
		$("#add2CartBtn").prop("disabled",true);
		$("#add2CartBtn_cpy1").prop("disabled",true);
		$("#add2CartBtn_cpy2").prop("disabled",true);
		$("#selectRDOrderBtnCpy").prop("disabled",true);
	},
	enableAllButtoninpage: function(){
		$("#selectRDOrderBtn").prop("disabled",false);
		$("#add2CartBtn").prop("disabled",false);
		$("#add2CartBtn_cpy1").prop("disabled",false);
		$("#add2CartBtn_cpy2").prop("disabled",false);
		$("#selectRDOrderBtnCpy").prop("disabled",false);
	},
    loadRxLegalInformation:function(){
		var catEntry = productDisplayJS.itemPriceJsonOject[productDisplayJS.bopusShowStoreDetailsCatEntryId].catalogEntry;
		var partnumber = catEntry.catalogEntryIdentifier.externalIdentifier.partNumber;
    	if($("#rxLegalInfoUrl").length > 0){
    		var url=$("#rxLegalInfoUrl").val();
    		url = url+"/"+partnumber+"/?format=json";
    	 	$.ajax({
    	 		url : url,
    	 		type : 'GET',
    	 		 cache: false,
    	 		contentType: 'application/json',
    	 		dataType: 'json',
    	 		data: '',
    	 		success: function(data){
    	 		if(data.pharmainfo != null){
    	 			$('div#rxMoreInformation div.rxMoreInformationContainer').html(data.pharmainfo.html);
    	 		}else{
    	 			$('div#rxMoreInformation div.rxMoreInformationContainer').html("");
	}
    	 		},
    	 		error: function(){
    	 			console.log(storeNLS["INV_STATUS_RETRIEVAL_ERROR"]);
    	 		}
    	 	});  
    	}
    },
    isBopusEligibileForStore:function(StoreId,catentryid){
    	
		var LOCALSTORAGE_STORES_KEY = 'petcostores';
		var oNeareststores = JSON.parse(localStorage.getItem(LOCALSTORAGE_STORES_KEY)) != null ? JSON.parse(localStorage.getItem(LOCALSTORAGE_STORES_KEY)) : {};
		if(typeof(oNeareststores.petcostores) != "undefined" && oNeareststores.petcostores.length > 0 ){
			var nearestSTores = JSON.parse(oNeareststores.petcostores);
			var vflag = 'N';
			if(nearestSTores.length == 1){
				vflag = nearestSTores.BOPUS;
			}else if(nearestSTores.length > 0){
				vflag = nearestSTores[0].BOPUS;
			}
			if(vflag == "Y" && $('#CurrentBOPUSState').length > 0 ){
				
				var currentbopuststae = $('#CurrentBOPUSState').val();
				
				var catEntryObj = productDisplayJS.itemPriceJsonOject[catentryid];
				var isBOPUSAreaExcludedItemArray = {};
				for (x in productDisplayJS.entitledItems) {
					if(typeof(productDisplayJS.entitledItems[x].isBOPUSAreaExcludedItem) != 'undefined'){
						isBOPUSAreaExcludedItemArray[productDisplayJS.entitledItems[x].catentry_id] = productDisplayJS.entitledItems[x].catentry_id;
					}
					
				}
				
				if(typeof(isBOPUSAreaExcludedItemArray[catentryid]) != 'undefined'){
					var isBOPUSAreaRestictionItem = isBOPUSAreaExcludedItemArray[catentryid];
					if($("#isBOPUSAreaRestictionEnabeled").length > 0 && $("#isBOPUSAreaRestictionEnabeled").val() == 'true'
						&& isBOPUSAreaRestictionItem == catentryid){
						var states = "";
						if($("#BOPUSAreaRestictionState").length > 0){
							states = $("#BOPUSAreaRestictionState").val();
							var stateArray = states.split(",");
							
							for(var ix = 0 ; ix < stateArray.length ; ix++){
								if(stateArray[ix] == currentbopuststae){
									vflag = "N";
								}
							}
						}
					}
				}
	
				
			}
			if(vflag == "Y"){
				return true;
			}else{
			 return false;
			}
			
		}else if(typeof(oNeareststores.petcostores) == "undefined" && typeof(oNeareststores.userDetails) != "undefined"){
			return false;
		}
    
    
    }

}
require(["dojo/on", "dojo/has", "dojo/_base/sniff", "dojo/domReady!"], function(on, has) {
	if (has("ie") < 9) {
		on(document, ".compare_target > input[type=\"checkbox\"]:click", function(event) {
			this.blur();
			this.focus();
		});
	}
	if(typeof(petcoCommonJS) != 'undefined' ){petcoCommonJS.clearPromotionLessThanZero()}
	productDisplayJS.sortItemsInCombo();
});


//holder for zoomImg vars, values pulled from size os one of the large versions of the PDP product image. This used as a catch for IE.
var zoomImg ={
    height: 1500,
    width: 1500
}

function setZoomImgDimensions(zoomImgSrc, img) {
	var image = new Image();
	image.onload = function() {
	  // variables to hold the height and width ratios of xLarge to large versions of PDP product image.  Used for zoom math.
  	zoomImg.height = image.height;
  	zoomImg.width = image.width;
	};
	image.src = zoomImgSrc;
}

function zoomThisData(element) {
	if (element && element.getAttribute) {
		var baseImageUrl = element.getAttribute("data-baseImageUrl");
		var altImageId = element.getAttribute("data-altImageId");
		zoomThis(baseImageUrl, altImageId);
		$('.thumb-active').removeClass('thumb-active');
		$(element).parent().addClass('thumb-active');
	}
}
function zoomThis(id,altImage) {
	id= id+"?$ProductDetail-large$";
	if(altImage!='1' && altImage!=''){
		id=id+"&$"+altImage+"$";
	}
	var img = document.getElementById("imgZoom");
	var element = document.getElementById("overlay");
	img.src = id;
	zoomImgSrc = img.src.replace("large","xlarge")
	element.style.backgroundImage = 'url("' + zoomImgSrc + '")';
	setZoomImgDimensions(zoomImgSrc, img);
}

function getPageTopLeft(el) {
    var rect = el.getBoundingClientRect();
    var docEl = document.documentElement;
    return {
        left: rect.left + (window.pageXOffset || docEl.scrollLeft || 0),
        top: rect.top + (window.pageYOffset || docEl.scrollTop || 0)
    };
}

function zoomIn(event) {
  var element = document.getElementById("overlay");
  //element.style.display = "inline-block";
  element.classList.add("active");
  var img = document.getElementById("imgZoom");
  var zoomImgWidth = zoomImg.width;
  var zoomImgHeight = zoomImg.height;

  var posY, posX;

  if (event.type === "touchmove"){
	  event.preventDefault();
	  posX = event.originalEvent.touches ?  event.originalEvent.touches[0].pageX : event.pageX - img.offsetLeft;
	  posY = event.originalEvent.touches ?  event.originalEvent.touches[0].pageY - getPageTopLeft(img).top : event.pageY - img-offsetTop;
  } else {
	  posX = event.offsetX ? (event.offsetX) : event.pageX - img.offsetLeft;
	  posY = event.offsetY ? (event.offsetY) : event.pageY - img.offsetTop;
  }

  var zoomXRatio = zoomImgWidth / img.clientWidth;
  var zoomYRatio = zoomImgHeight / img.clientHeight;
  var zoomXOffset = -posX * zoomXRatio + element.offsetWidth / 2;
  var zoomYOffset = -posY * zoomYRatio + element.offsetHeight / 2;
  element.style.backgroundPosition=zoomXOffset.toString()+"px "+zoomYOffset.toString()+"px";
  element.style.backgroundSize =  zoomImg.width+"px "+ zoomImg.height+"px";
}

$(function(){
	$('#imgZoom').on('mousemove touchmove', function(e){
		zoomIn(e);
	});

	$('#imgZoom').on('mouseout touchend', function(e){
		zoomOut(e);
	});
});
globalSliderRef = null;
/**
 * This function may be called by Live Clicker, and therefore should be adjusted with care.
 */
function initializeMobileImageSlider() {
	// Only initialize the slider on mobile.
	if (!window.matchMedia( "(max-width: 768px)" ).matches)
		return;
	globalSliderRef = tns({
		container: document.querySelector("#mobile-slider"),
		items: 1,
		controls: false,
		mousedrag: true,
		nav: true,
		speed: 100,
		loop: false,
		slideBy: "page"
	});
}
/**
 * This function may be called by Live Clicker, and therefore should be adjusted with care.
 */
function destroyMobileImageSlider() {
	var cleanup = false;
	// No need to check if we are on mobile here - If the slider exists, we'll destroy it.
	if (globalSliderRef) {
		globalSliderRef.destroy();
		globalSliderRef = null;
		cleanup = true;
	}
	// This is the slider that Live Clicker currently creates.  We can probably remove this once they update their code.
	if (window.sliderC !== undefined) {
		if (sliderC) {
			sliderC.destroy();
			sliderC = null;
			cleanup = true;
		}
	}
	// Clean up after the Tiny-Slider by removing style and id attributes on the tiles.
	if (cleanup) {
		$("#mobile-slider").children().attr("style", "").attr("id", "");
	}
}

function zoomOut() {
  var element = document.getElementById("overlay");
  //element.style.display = "none";
  element.classList.remove("active");
}

function hidePersistentAddToCart() {
	var persistentCTA = document.getElementById("pdp-persistent-container");
	var placeholder = document.getElementById("pdp-persistent-placeholder");
	if (persistentCTA && persistentCTA.classList.contains("fixed")) {
		persistentCTA.classList.remove("fixed");
		$('#pdp-promo-1').show();
		$('#notice-box').show();
		if (placeholder) {
			placeholder.style.height = "auto";
		}
		if (window.matchMedia("(max-width: 768px)").matches) {
			removeFooterAddToCart();
		}
	}
}

function removeFooterAddToCart() {
	var persistentCTA = document.getElementById("pdp-persistent-container");
	if (persistentCTA) {
		persistentCTA.classList.remove("fixed-to-footer");
		persistentCTA.style.top = "auto";
	}
}

var initialBottomPositionPixelMobile = 0;

function persistentPDP(){
	var header = document.querySelectorAll("#header")[0];
	var bottomPromo = document.querySelectorAll(".banner-promo")[0];
	var attrSection = document.getElementById("attrGroupDesc");
	var persistentCTA = document.getElementById("pdp-persistent-container");
	var placeholder = document.getElementById("pdp-persistent-placeholder");
	var placeholderMobile = document.getElementById("repeat-delivery-select");
	var spacer = document.getElementById("pdp-persistent-spacer");
	var isMobile = window.matchMedia("(max-width: 768px)").matches;
	// Contrary to a lot of documentation, IE (sometimes?) needs this song and dance to get scrollTop. document.body.scrollTop is a valid property, even in IE, but it (sometimes?) returns 0.
	var scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;

	
	if (!isMobile) {
		// Desktop PDP Persist
		persistentCTA.style.top = null;
		var bottomPromoOffsetHeight = 0;
		if(bottomPromo != null){
			bottomPromoOffsetHeight = bottomPromo.offsetHeight;
		}
		if (scrollTop <= placeholder.offsetTop + placeholder.offsetHeight + bottomPromoOffsetHeight - header.offsetHeight){
			//at top of page, above product attributes
			hideAddtocartButtonOnScroll()
			hidePersistentAddToCart();
			if(dojo.byId("pdp-product-features_id") != null && dojo.hasClass("pdp-product-features_id","hide")){
				dojo.removeClass("pdp-product-features_id","hide")
			}

			if(dojo.byId("inStoreNoticeBox") != null && dojo.hasClass("inStoreNoticeBox","hide")){
				dojo.removeClass("inStoreNoticeBox","hide");
				dojo.addClass("inStoreNoticeBox","show");
			}
			
		} else if (!persistentCTA.classList.contains("fixed")) {
			//scrolled down on page, product-info has become persistent (fixed)
			 showAddtocartButtonOnScroll()
			placeholder.style.height = 0;

			// Hide persistent on desktop only if more than one selectable attribute
			//if ($('.pdp-product-attributes .form-group').length <= 1){
				//make stage 1 product-info visible
				persistentCTA.classList.add("fixed");
				$('#pdp-promo-1').hide();
				$('#notice-box').hide();
			//}

			spacer.style.height = "0";
			
			if(dojo.byId("inStoreNoticeBox") != null && dojo.hasClass("inStoreNoticeBox","show")){
				dojo.removeClass("inStoreNoticeBox","show");
				dojo.addClass("inStoreNoticeBox","hide");
			}
		}

	} else {
		 //Added for PDWEB-16903: Mobile- Unable to select RD/bopus options in mobile devices. 
		// Mobile PDP Persist
		showAddtocartButtonOnScroll();
		
		//PDWEB-14836 : Calculate bottom pixel position for floating ATC button at initial page load time
		if(!initialBottomPositionPixelMobile){
			initialBottomPositionPixelMobile = attrSection.offsetTop - placeholderMobile.offsetHeight;
		}
		
		if (scrollTop <= initialBottomPositionPixelMobile){
			
			//at top of page, above product attributes
			hideAddtocartButtonOnScroll();
			hidePersistentAddToCart();
			if(dojo.byId("pdp-product-features_id") != null && dojo.hasClass("pdp-product-features_id","hide")){
				dojo.removeClass("pdp-product-features_id","hide")
			}

		} else if (!persistentCTA.classList.contains("fixed")) {
			//scrolled down on page, product-info has become persistent (fixed)

			//fix for "page jumping when product-info become persistent on mobile" bug
			var preFixedHeight = (persistentCTA.offsetHeight).toString() + "px";
			placeholder.style.height = preFixedHeight; // sets the placeholder height so that there is no "jumping" in mobile
			 showAddtocartButtonOnScroll();

			persistentCTA.classList.add("fixed");
			$('#pdp-promo-1').hide();
			$('#notice-box').hide();
			//fix for "product-info coving footer" bug
			var postFixedHeight = (persistentCTA.offsetHeight).toString() + "px";
			spacer.style.height = postFixedHeight; // sets the spacer height so that there is room for it to become fixed-to-footer when users scrolls to bottom.

		} else if (persistentCTA.classList.contains("fixed")) {
			var	footer = document.getElementById("footer");
			 showAddtocartButtonOnScroll();
			if (scrollTop + $(window).height() >= footer.offsetTop) {
				persistentCTA.classList.add("fixed-to-footer");
				//console.log(scrollTop + $(window).height());
				//persistentCTA.style.top =  (footer.offsetTop - (persistentCTA.offsetHeight).toString()  + "px";
						dojo.place('pdp-persistent-placeholder','pdp-persistent-spacer')
						var postFixedHeight = (persistentCTA.offsetHeight).toString() + "px";
						spacer.style.height = postFixedHeight; // sets the spacer height so that there is room for it to become fixed-to-footer when users scrolls to bottom.
				
			} else {
				dojo.place('pdp-persistent-placeholder','pdp-product-info',"after")
				//spacer.style.height = "0";
				removeFooterAddToCart();
				}	
			}
	}
	

	if($("div.store-pickup.show.selected#bopusSelectEnabledBopusAttrOn input#store-pickup:checked").length > 0 && $("div.store-pickup.show.selected#bopusSelectEnabledBopusAttrOn button#add2CartBtn_bopus:disabled").length > 0){
		if($("div#add-to-controls div#BOPUS_hide_addtocartButton.show button#add2CartBtn").length > 0 ){
			$("div#add-to-controls div#BOPUS_hide_addtocartButton.show button#add2CartBtn")[0].disabled = true;
		}
	}else{
	if($("div#add-to-controls div#BOPUS_hide_addtocartButton.show button#add2CartBtn").length > 0 ){
			$("div#add-to-controls div#BOPUS_hide_addtocartButton.show button#add2CartBtn")[0].disabled = false;
		}
	}
}


function showAddtocartButtonOnScroll(){
	var  restricted = document.getElementById("restrictionMessage").innerHTML;
	var InStoreDisplay= document.getElementById("inStoreMessaging").style.display;	
	 if(restricted != "" && InStoreDisplay =='none') {	   
		 $("#restrictionMessage").addClass("hide");
			$("#restrictionMessage").removeClass("show");		
   }
	if(document.getElementById("BOPUS_hide_addtocartButton") != null && restricted == "" ){
		document.getElementById("BOPUS_hide_addtocartButton").classList.add("show");
		document.getElementById("BOPUS_hide_addtocartButton").classList.remove("hide");
	}
	if(document.getElementById("BuyNowLinkbtn") != null){
		document.getElementById("BuyNowLinkbtn").classList.add("show");
		document.getElementById("BuyNowLinkbtn").classList.remove("hide");
	}
	if(null != dojo.byId("inStoreMessagingforfixedscroll") && dojo.hasClass("inStoreMessagingforfixedscroll","showonscrollforinstock")){
		document.getElementById("inStoreMessagingforfixedscroll").classList.add("show");
		document.getElementById("inStoreMessagingforfixedscroll").classList.remove("hide");
	}
	var PriceMatchGuarantee = dojo.byId("PriceMatchGuarantee");
	if(PriceMatchGuarantee != null){
		dojo.addClass(PriceMatchGuarantee,"hide");
		dojo.removeClass(PriceMatchGuarantee,"show");
	}
	var pricestackpromo2 = dojo.byId("pricestack-promo-2");
	if(pricestackpromo2 != null){
		dojo.addClass(pricestackpromo2,"hide");
		dojo.removeClass(pricestackpromo2,"show");
	}
	var pricestackpromo1 = dojo.byId("pricestack-promo-1");
	if(pricestackpromo1 != null){
		dojo.addClass(pricestackpromo1,"hide");
		dojo.removeClass(pricestackpromo1,"show");
	}
}
function hideAddtocartButtonOnScroll(){
	if(document.getElementById("BOPUS_hide_addtocartButton") != null){
		document.getElementById("BOPUS_hide_addtocartButton").classList.remove("show");
		document.getElementById("BOPUS_hide_addtocartButton").classList.add("hide");
	}
	if(document.getElementById("BuyNowLinkbtn") != null){
		document.getElementById("BuyNowLinkbtn").classList.remove("show");
		document.getElementById("BuyNowLinkbtn").classList.add("hide");
	}
	if(null != dojo.byId("inStoreMessagingforfixedscroll") && dojo.hasClass("inStoreMessagingforfixedscroll","showonscrollforinstock")){
		document.getElementById("inStoreMessagingforfixedscroll").classList.add("hide");
		document.getElementById("inStoreMessagingforfixedscroll").classList.remove("show");
	}

	var InStoreDisplay= document.getElementById("inStoreMessaging").style.display;
	var PriceMatchGuarantee = dojo.byId("PriceMatchGuarantee");
	if(PriceMatchGuarantee != null && InStoreDisplay != null && InStoreDisplay =='none'){
		dojo.removeClass(PriceMatchGuarantee,"hide");
		dojo.addClass(PriceMatchGuarantee,"show");
	}
	var pricestackpromo2 = dojo.byId("pricestack-promo-2");
	if(pricestackpromo2 != null && InStoreDisplay != null && InStoreDisplay =='none'){
		dojo.removeClass(pricestackpromo2,"hide");
		dojo.addClass(pricestackpromo2,"show");
	}
	var pricestackpromo1 = dojo.byId("pricestack-promo-1");
	if(pricestackpromo1 != null && InStoreDisplay != null && InStoreDisplay =='none'){
		dojo.removeClass(pricestackpromo1,"hide");
		dojo.addClass(pricestackpromo1,"show");
	}
	var  restricted = document.getElementById("restrictionMessage").innerHTML;	
	   if(restricted != "" && InStoreDisplay =='none') {		   
		   $("#restrictionMessage").addClass("show");
			$("#restrictionMessage").removeClass("hide");		
	   }
}

function setUpPersistentPDP(){
	if (document.querySelectorAll(".pdp-fixed-product-info")[0] && document.querySelectorAll(".pdp-product-features")[0]){
		var parent = document.querySelectorAll('.pdp-product-right #repeat-delivery-select')[0],
			pdpFixedInfo = document.querySelectorAll(".pdp-fixed-product-info")[0],
			pdpAtts = document.querySelectorAll(".pdp-product-attributes")[0],
			pdpFeats = document.querySelectorAll(".pdp-product-features")[0],
			newWrapper = document.createElement("div"),
			newContainer = document.createElement("div"),
			newPlaceholder = document.createElement("div"),
			newFooterSpacer = document.createElement("div"),
			// Using original height and offset before it's changed by becoming persistent
			featuresHeight = pdpFeats.offsetHeight,
			featuresTop = pdpFeats.offsetTop;

		// Wrapping in a new container to be made persistent on scroll
		newFooterSpacer.setAttribute("id", "pdp-persistent-spacer");
		newPlaceholder.setAttribute("id", "pdp-persistent-placeholder");
		newContainer.setAttribute("id", "pdp-persistent-container");
		newWrapper.setAttribute("id", "pdp-persistent-wrapper");
		newWrapper.appendChild(pdpFixedInfo);
		newWrapper.appendChild(pdpAtts);
		newWrapper.appendChild(pdpFeats);
		newContainer.appendChild(newWrapper);
		newPlaceholder.appendChild(newContainer);
		$(newPlaceholder).insertAfter('#pdp-product-info');
		var footer = document.querySelectorAll('.footer_wrapper_position')[0];
		$(footer).prepend(newFooterSpacer);

		initialBottomPositionPixelMobile = 0;
		window.onscroll = function(){
			if (!$('#personilaztionDisplay').hasClass('active') && !$('#rxPersonilaztionDisplay').hasClass('active') ) {
				persistentPDP();
			}
		}
	}
}
function moveMobilePDPTitle(){
	if (document.querySelectorAll(".pdp-product-info-mobile")[0]){
		var parent = document.querySelectorAll(".pdp-product-top")[0],
			mobileInfo = document.querySelectorAll(".pdp-product-info-mobile")[0];
		//PDWEB-14715
		$(parent).prepend(mobileInfo);
	}
}


$(document).on({
    mouseenter: function(){
		var left = $(this).offset().left + ($(this).outerWidth()/2),
		top = $(this).offset().top - ($(this).outerHeight()),
		dataModal = $(this).data('target');

		$(dataModal).show().find('.modal-dialog').css({
		top: top,
		left: left
		});

		$(dataModal).removeClass('modal').removeClass('fade');

    },
    mouseleave: function(){
    	var dataModal = $(this).data('target');
		$(dataModal).hide();
		$(dataModal).addClass('modal').addClass('fade');
    }
}, '.rd-help');


function loadreCAPTCHAJSfile() {
	var captchURL = "https://www.google.com/recaptcha/api.js?onload=CaptchaCallback&render=explicit";
	if (!isScriptAlreadyIncluded(captchURL)) {
		var fileref=document.createElement('script');
	    fileref.setAttribute("type","text/javascript");
	    fileref.setAttribute("src", captchURL);
	    if (typeof fileref!="undefined") {
	        document.getElementsByTagName("head")[0].appendChild(fileref);
		}
	}
}

function isScriptAlreadyIncluded(src){
    var scripts = document.getElementsByTagName("script");
    for(var i = 0; i < scripts.length; i++) 
       if(scripts[i].getAttribute('src') == src) return true;
    return false;
}

function getShippingMessage(storeId, catalogId, langId, orderId, fromPDP, catalogEntryID, bopusSKU) { 
	var params = [];
	
 	params["storeId"] = storeId;
 	params["catalogId"] = catalogId;
 	params["langId"] = langId;
 	params["orderId"] = orderId;
 	params["fromPDP"] = fromPDP;
 	params["catalogEntryID"] = catalogEntryID;
 	params["isBopusSku"] = bopusSKU;
				
	wc.service.invoke("AjaxHolidayShippingMsg", params);
	
}
function isRestricted(catentryId,zipcode,brand) { 
	var params = [];
	
 	params["sku"] = catentryId; 	
 	params["zipcode"] = zipcode; 
 	params["brand"] = brand; 	
				
	wc.service.invoke("AjaxRestrictedAddCart", params);
	
}