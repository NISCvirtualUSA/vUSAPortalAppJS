dojo.require("esri.map");
dojo.require("esri.tasks.geometry");
dojo.require("esri.dijit.Legend");
dojo.require("esri.dijit.Scalebar");
dojo.require("esri.arcgis.utils");
dojo.require("esri.IdentityManager");
dojo.require("esri.dijit.Popup");
dojo.require("esri.arcgis.Portal");
dojo.requireLocalization("esriTemplate", "template");

dojo.require("dijit.dijit");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.StackContainer");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit/form/TextBox");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.ComboBox");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit/form/Select");

dojo.require("dojo.window");
dojo.require("dojo.has");
dojo.require("dojo.date.locale");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dojo/json");
dojo.require("dojox.fx");
dojo.require("dojo.date.locale");

var map;
var configOptions;
var urlObject;

var i18n;
var popup;

var title;
var subtitle;

var ContentTabTitle1;
var ContentTabTitle2;
var ContentTabTitle3;

var portal;
var token;

var baseMapLayers = [];
var layerCounter = [];
var addedLayersOnMap = [];
var eventSelected = [];
var event;
var agolUrl = "http://www.arcgis.com";

var myGroups;
var mySelectGroup = "all";

//New variable for options
var selectOptions = [{ label: "Public Information Only" , value: "public" }];
var selectOptions = [{ label: "All My Groups" , value: "all" }];

function Init() {
    var ss = document.createElement('link');
    ss.type = 'text/css';
    ss.rel = 'stylesheet';
    require(['esri/dijit/Popup'], function () {
        popup = new esri.dijit.Popup(null, dojo.create("div"));
    });
    ss.href = "css/desktop.css";

    document.getElementsByTagName("head")[0].appendChild(ss);
    portalUrl = '';
    i18n = dojo.i18n.getLocalization('esriTemplate', 'template');

	//load configuration options from template.js
    configOptions = {
        //The ID for the map from ArcGIS.com
        groups: i18n.viewer.groups,
        applicationIcon: i18n.viewer.main.applicationIcon,
        leftPanelHeader: i18n.viewer.main.leftPanelHeader,
        //Enter a title, if no title is specified, the webmap's title is used.
        title: i18n.viewer.main.applicationName,
        //Enter a subtitle, if not specified the ArcGIS.com web map's summary is used
        subtitle: '',
        //If the webmap uses Bing Maps data, you will need to provided your Bing Maps Key
        //specify a proxy url
        proxyurl: i18n.viewer.main.proxyURL,
        //specify the url to a geometry service
        geometryserviceurl: 'http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer',

        //Modify this to point to your sharing service URL if you are using the portal
        sharingurl: '',
        baseMapId: i18n.viewer.main.baseMapId,
        defaultExtent: i18n.viewer.main.defaultExtent,
        labelESF: i18n.viewer.labelESF,
        HelpURL: i18n.viewer.HelpURL,
        agolError: i18n.viewer.errors.agolError,
        eventTagPatternPrefix: i18n.viewer.eventTagPatternPrefix,
        addItemUrl: i18n.viewer.main.addItemUrl,
        generateShareLink: i18n.viewer.main.generateShareLink,
        generateMapPublishLink: i18n.viewer.main.generateMapPublishLink,
        webMapItemDetail: i18n.viewer.main.webMapItemDetail,
		ContentTabTitle1: i18n.viewer.main.ContentTabTitle1,
		ContentTabTitle2: i18n.viewer.main.ContentTabTitle2,
		ContentTabTitle3: i18n.viewer.main.ContentTabTitle3
    };

    if (configOptions.geometryserviceurl && location.protocol === "https:") {
        configOptions.geometryserviceurl = configOptions.geometryserviceurl.replace('http:', 'https:');
    }
    esri.config.defaults.geometryService = new esri.tasks.GeometryService(configOptions.geometryserviceurl);
    esri.config.defaults.io.proxyUrl = configOptions.proxyurl;
    esriConfig.defaults.io.alwaysUseProxy = false;
    esriConfig.defaults.io.timeout = 180000;
    document.getElementById("divContainer").style.display = "block";
    dojo.byId("divEventContainer").style.display = "block";
    dojo.byId("tdDialogHeader").innerHTML = "Select Portal";
    dojo.byId("divAddressResultContainer").style.display = "none";
    CreatePortalValues();
}

function ToggleFullScreen() {
    if (!document.fullscreenElement && // alternative standard method
    !document.mozFullScreenElement && !document.webkitFullscreenElement) { // current working methods
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
        }
        dojo.byId("maximizeBaseMap").title = "Minimize";
    } else {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
        dojo.byId("maximizeBaseMap").title = "Full Screen";
    }
    map.resize();
}

//populate list of portals from template.config file
function CreatePortalValues() {
	console.log("create portal values function");

    var data = i18n.viewer.portal;
    for (var i = 0; i < data.length; i++) {
        var trPortal = document.createElement("tr");
        dojo.byId("tblPortalList").appendChild(trPortal);
        dojo.byId("tblPortalList").style.width = "100%";
        var tdPortal = document.createElement("td");
        tdPortal.align = "left";
        tdPortal.id = data[i].portalName + i;
        if (i % 2 == 0) {
            tdPortal.className = "labelEvent";
        } else {
            tdPortal.className = "labelEventSecondRow";
        }
        tdPortal.style.cursor = "pointer";
        tdPortal.innerHTML = data[i].portalName;
        tdPortal.setAttribute("portalURL", document.location.protocol + data[i].portalUrl);

		  //if only one entry for portal urls
        if (data.length==1){
            PortalObjectCreation(data[i].portalName);
            document.getElementById("divContainer").style.display = "none";
            dojo.byId("divEventContainer").style.display = "none";
            createMap(configOptions.defaultExtent);
        }

        tdPortal.onclick = function () {
            if (!dojo.hasClass(this, "labelEventNew1")) {
                dojo.removeClass(dojo.query(".labelEventNew1", dojo.byId("tblPortalList"))[0], "labelEventNew1");
                dojo.addClass(this, "labelEventNew1");
            };
        }
        if (i == 0) {
            dojo.addClass(tdPortal, "labelEventNew1");
        }
        trPortal.appendChild(tdPortal);
    }
}


//second authenticate function called by login button click on add content box
//updated to test for webmap= in url for opening shared webmap
function Authenticate() {
console.log("authenticating user here..");
dojo.byId("divAppContainer").style.display = "block";

    portal.signIn().then(function (loggedInUser) {
        //ShowProgressIndicator();
        portalUser = loggedInUser;
        dojo.byId("AddHeaderContentLogin").innerHTML = portalUser.fullName;
		console.log("portalUser = " + portalUser.fullName);
        sessionStorage.clear();

      //  FindArcGISUserInGroup(configOptions.defaultExtent);
        var data = portalUser.credential;
        token = data.token;
      //tst for webmap in url to see if being passed from sharing link
        var chk = window.location.toString();
        var chk1 = chk.split("=");
        if (chk.indexOf("webmap=") != -1) {
          //need to get group info in login but don't run the searches to bring add content window to screen
            FindUsersGroupsNoSearch();

            CreateMapLayers(chk1[1], null);


        } else {

           FindUsersGroups();
           CloseAddContentsContainer();
        }
    });

    //prompt user for credentials for selected portal
    if (dojo.query(".dijitDialogPaneContentArea")[0]) {
        dojo.query(".dijitDialogPaneContentArea")[0].childNodes[0].innerHTML = "Selected Portal: " + dojo.query(".labelEventNew1", dojo.byId("tblPortalList"))[0].innerHTML;
       
	   var divPortal = dojo.create("div");
        divPortal.innerHTML = "Enter your Username and Password";
        divPortal.style.marginTop = "3px";
        dojo.query(".dijitDialogPaneContentArea")[0].childNodes[1].appendChild(divPortal);
    }

}

//separate login function decoupled from the portal load
function Login(){
     setTimeout(function () {
        Authenticate();
    }, 500);
}


function FindUsersGroupsNoSearch(){
	console.log("finding user groups here..");
	//alert("finding groups");
	//following section to test 'getGroup' call
	myGroups = "";
	var grpCounter = 0;
	
	selectOptions=[{ label: "All My Groups" , value: "all" }];

	portalUser.getGroups().then(function(groups){
	 dojo.forEach(groups,function(group){
		//var description = group.description;
		if (grpCounter == 0) {
			myGroups = '(group:(\"' + group.id + '\"))';
		}
		if (grpCounter > 0) {
			myGroups = '(' +myGroups + ' OR ' + '(group:(\"' + group.id + '\"))' + ')';
		}

		selectOptions2=[{ label: group.title, value: group.id}];
		selectOptions= selectOptions.concat(selectOptions2);

		var grpUser = group.username;
		grpCounter = grpCounter + 1;


	 });
	});
}


// EGE: This function creates a  text variable containing all of the users groups (IDs)
function FindUsersGroups(){
	console.log("finding user groups here..");
	//alert("finding groups");
	//following section to test 'getGroup' call
	myGroups = "";
	var grpCounter = 0;
	
	selectOptions=[{ label: "All My Groups" , value: "all" }];

	portalUser.getGroups().then(function(groups){
	 dojo.forEach(groups,function(group){
		//var description = group.description;
	
		if (grpCounter == 0) {
			myGroups = '(group:(\"' + group.id + '\"))';
		}
		if (grpCounter > 0) {
			myGroups = '(' +myGroups + ' OR ' + '(group:(\"' + group.id + '\"))' + ')';
		}

		selectOptions2=[{ label: group.title, value: group.id}];
		selectOptions= selectOptions.concat(selectOptions2);

		var grpUser = group.username;
		grpCounter = grpCounter + 1;

		if (grpCounter==groups.length){
                     SearchWebMapsForAddContent();
                     FeatureSearch();
			}
	 });
	});
}


function EventAndPortalSelection() {
	console.log("event and portal selection function triggered");
	
    if (dojo.byId("divAddressResultContainer").style.display != "none") {
		console.log("Event & Portal Selection case 1");
        dojo.byId("divContainer").style.display = "none";
        ShowProgressIndicator();
        if (document.getElementById("clearLayers").checked) {
            addLayerId = [];
            for (i in map._layers) {
                if (!baseMapLayers[i]) {
                    map.removeLayer(map._layers[i]);
                }
            }
            map.infoWindow.hide();
            if (dijit.byId("legendDiv")) {
                dijit.byId("legendDiv").layerInfos = [];
                dijit.byId("legendDiv").refresh();
            }
            document.getElementById("clearLayers").checked = false;
        }
        IconClick();
        dojo.byId("AddHeaderContent").innerHTML = "Add content";
        eventSelected = [];
        dojo.query(".labelEventNew").forEach(function (node) {
            var nodevalue = configOptions.eventTagPatternPrefix + node.innerHTML;
            eventSelected.push(nodevalue);
        });
        if (eventSelected.length != 0) {
            dojo.empty(dojo.byId("divAddContentContainer"));
            document.getElementById("divContainer").style.display = "none";
            dojo.byId("divEventContainer").style.display = "none";
            SearchWebMapsForEvent(eventSelected);
        } else {
            SearchWebMapsForEvent();
        }
    } else {
		console.log("Event & Portal Selection case 2");
		PortalObjectCreation(dojo.query(".labelEventNew1", dojo.byId("tblPortalList"))[0].getAttribute("portalURL"));
        document.getElementById("divContainer").style.display = "none";
        dojo.byId("divEventContainer").style.display = "none";
        dojo.byId("tdDialogHeader").innerHTML = "Select event(s)";
        dojo.byId("divAddressResultContainer").style.display = "block";
        dojo.byId("divLoginContainer").style.display = "none";
    }
}

function PortalObjectCreation(url) {
	console.log("Function PortalObjectCreation // current Portal = " + url);
	
    portalUrl = agolUrl;
	
	var url = agolUrl;
	
    configOptions.sharingurl = portalUrl + '/sharing/content/items';
    if (!configOptions.sharingurl) {
        configOptions.sharingurl = location.protocol + '//' + location.host + "/sharing/content/items";
    }
    esri.arcgis.utils.arcgisUrl = configOptions.sharingurl;
    portal = new esri.arcgis.Portal(url);
   //EGE: remove this function on 1/6/14 to override automatic authentication popup on startup
   //setTimeout(function () {
    //    AuthenticateUser();
   // }, 500);
}

//EGE: Load Map Dialogue triggered when application first loads, also when 'event chooser' button is clicked
function CreateLoadMapDialog() {
	console.log("Create Load Map Dialogue function called");
	
    if (tags.length == 0) {
		console.log("no tags associated, going straight to 'searchWebMapsForEvent funct");
        var webMapsEvtArray = [];
		
		SearchWebMapsForEvent();
        return;
    }
    dojo.empty(dojo.byId("divAddressResultContainer"));
    document.getElementById("divContainer").style.display = "block";
    setDragBehaviour("tblHeaderForEvents", "divContainer");
    var tableDiv = document.createElement("div");
    var dialogTable = document.createElement("table");
    dialogTable.cellPadding = 5;
    dialogTable.cellSpacing = 0;
    dialogTable.style.width = "100%";
    dialogTable.className = "dialogTable";
    dialogTable.id = "dialogTable";

    var dialogTableRow3 = dialogTable.insertRow(0);
    var dialogTableCell4 = dialogTableRow3.insertCell(0);

    var divEvent = document.createElement("div");
    divEvent.className = "ESFMainContainer";
    var i = 0;
    for (var j in tags) {
        var divLabelEvent = dojo.create("div");
        if (i % 2 == 0) {
            dojo.addClass(divLabelEvent, "labelEvent");
        } else {
            dojo.addClass(divLabelEvent, "labelEventSecondRow");
        }
        divLabelEvent.id = j;
        divLabelEvent.innerHTML = j;
        divEvent.appendChild(divLabelEvent);
        dojo.connect(divLabelEvent, "onclick", dojo.hitch(this, function (e) {
            if (dojo.hasClass(e.target, "labelEventNew")) {
                dojo.removeClass(e.target, "labelEventNew");
            } else {
                dojo.addClass(e.target, "labelEventNew");
            }
        }));
        i++;
    }
    dialogTableCell4.appendChild(divEvent);
    tableDiv.appendChild(dialogTable);
    document.getElementById("divAddressResultContainer").appendChild(tableDiv);
    if (eventSelected.length > 0) {
        for (var evtSelected = 0; evtSelected < eventSelected.length; evtSelected++) {
            var newEvent = eventSelected[evtSelected].split("_");
            dojo.addClass(dojo.byId(newEvent[2]), "labelEventNew");
        }
    }
}

function SearchWebMapsForEvent(selected) {
	console.log("SearchWebMapForEvent Function called");
	
    setDragBehaviour("AddHeaderContent", "divAddContent");
    //document.getElementById("backGroundImage").style.visibility = "visible";
    document.getElementById("divAddContent").style.display = "block";

    var addContentDiv = document.createElement("div");
    addContentDiv.id = "addContentContainer";
    addContentDiv.className = "addContentContainer";
    var obj = "";
    if (selected) {
        for (i in selected) {
            if (i == 0) {
                obj = selected[0];
            } else {
                obj = obj + '" OR "' + selected[i];
            }
        }
    }
    for (var j in configOptions.labelESF) {
        if (obj == "") {
            obj = configOptions.labelESF[0].ESF;
        } else {
            obj = obj + '" OR "' + configOptions.labelESF[j].ESF;
        }
    }

    for (var j in i18n.viewer.labelICS) {
        obj = obj + '" OR "' + i18n.viewer.labelICS[j].ICS;
    }

    for (var j in i18n.viewer.labelEMAgencyGroup) {
        obj = obj + '" OR "' + i18n.viewer.labelEMAgencyGroup[j].EMG;
    }

    for (var j in i18n.viewer.labelEMTask) {
        obj = obj + '" OR "' + i18n.viewer.labelEMTask[j].EMT;
    }

    for (var j in i18n.viewer.labelEMFunction) {
        obj = obj + '" OR "' + i18n.viewer.labelEMFunction[j].EMF;
    }

    for (var j in i18n.viewer.labelCISector) {
        obj = obj + '" OR "' + i18n.viewer.labelCISector[j].CIS;
    }

    for (var j in i18n.viewer.labelHazardType) {
        obj = obj + '" OR "' + i18n.viewer.labelHazardType[j].HAZ;
    }
    var groups = "";
    for (var i in configOptions.groups) {
        if (groups == "") {
            groups = configOptions.groups[0].groupID;
        } else {
            groups = groups + '" OR "' + configOptions.groups[i].groupID;
        }
    }

    var queryString;
    if (i18n.viewer.main.jurisdiction == "") {
        queryString = 'group:("' + groups + '")' + ' OR (accountid:"' + portalUser.orgId + '") AND (tags: ("' + obj + '"))';
    }
    else {
        queryString = 'group:("' + groups + '")' + ' OR (accountid:"' + portalUser.orgId + '") AND (tags: ("' + obj + '") AND "' + i18n.viewer.main.jurisdiction + '")';
    }
    var params = {
        q: queryString,
        num: 100,
        sortField: "modified",
        sortOrder: "desc"
    }
    var postlength = esri.config.defaults.io.postLength;
    esri.config.defaults.io.postLength = 100;

    portal.queryItems(params).then(function (groupdata) {
        sessionStorage.clear();
        CreateAddContentsTable(groupdata, "divAddContentContainer");

    }, {
        useProxy: true
    });
    esri.config.defaults.io.postLength = postlength;
}

//function to create textbox and search image for tab container
function CreateSearchPanel(txtBoxId, searchImgId) {
    var divAddressPodPlaceHolder = dojo.create("div");
    var txtDiv = dojo.create("div");
	txtDiv.width = "30px";
	
	//txtDiv.className = "searchBar";
    var selectDiv  = dojo.create("div");
    selectDiv.id="selectDiv";
	selectDiv.className = "selectBar";
	
	var sb = new dijit.form.Select({
      name: "select2",
      onChange: function(e){
        searchByGroupId(sb.value);
       },
      options:  selectOptions
    });
	sb.className = "sbGroupSelect";

	selectDiv.appendChild(sb.domNode);

    var tb = new dijit.form.TextBox({
        name: "firstname",
        id: txtBoxId,
        value: "" /* no or empty value! */,
        placeHolder: "Search ArcGIS Online"
    });
	divAddressPodPlaceHolder.className = "searchBox";
	
    txtDiv.appendChild(tb.domNode);
    var image = dojo.create("img");
    image.src = "images/search.png";
    image.className = "imgSearchLocate";
    image.title = "Search";
    image.id = searchImgId;
    image.style.cursor = "pointer";
    image.style.height = "16px";
    image.style.width = "16px";

	//following code to handle on keypress event
    if (searchImgId == "imgSearchvUsa") {
        dojo.connect(tb, "onKeyPress", function (event) {
            CreateAdditionalContentOnKeyPress(event, "inputvUsaText");
			//console.log(event);
        });
        image.onclick = function () {
            CreateAddContentsvUsaTable();
        }
    }
    if (searchImgId == "imgSearch") {
        dojo.connect(tb, "onKeyPress", function (event) {
            CreateAdditionalContentOnKeyPress(event, "inputAGOLText");
        });
        image.onclick = function () {
            CreateAddContentsAGOLTable();
        }
    }
	if (searchImgId == "imgSearchMP") {
        dojo.connect(tb, "onKeyPress", function (event) {
            CreateAdditionalContentOnKeyPress(event, "inputMPText");
        });   
        image.onclick = function () {
            CreateAddContentsMPTable(myGroups);
        }
         divAddressPodPlaceHolder.appendChild(selectDiv);
    }

    divAddressPodPlaceHolder.appendChild(txtDiv);
    divAddressPodPlaceHolder.appendChild(image);
    return divAddressPodPlaceHolder;
}


//not sure what needs to be in this function yet
//created a new function CreateAdContentsById() 

function searchByGroupId(id){
	var groupId="group:('" + id + ")";
	if (id=="all") {
		console.log("searching by myGroups");
		mySelectGroup = 'all';
		CreateAddContentsMPTable(myGroups);
     }
     else {
       console.log("searching by groupId");
	   mySelectGroup = 'group:(\"' + id + '\")';
          CreateAddContentsMPTable(groupId);
     }
}

//function to create tabs for Tab container
function CreateTabs(containerId) {
	console.log("createTabs function");
    var mainContainerTab = dojo.create("div");
    var divAddContentContainerTabContainer = dojo.create("div");
    divAddContentContainerTabContainer.id = containerId;
    divAddContentContainerTabContainer.style.height = "317px";

    var tableTab = dojo.create("table");
    tableTab.style.height = "44px";
    var tableTabRow = tableTab.insertRow(0);
    var tableTabCell = tableTabRow.insertCell(0);
    var label = dojo.create("label");
    label.innerHTML = "                             "; // label for search box
    tableTabCell.appendChild(label);
	
	var tableTabCell2 = tableTabRow.insertCell(1);

	// Focus Group Tab (1st tab)
    if (containerId == "divAddContentContainerTabContainer") {
        var divPodPlaceHolder = CreateSearchPanel("inputvUsaText", "imgSearchvUsa");
    }
	// Public Tab (2nd tab)
    if (containerId == "divAddArcGISContentContainer") {
        var divPodPlaceHolder = CreateSearchPanel("inputAGOLText", "imgSearch");
    }
	// My Groups Tab (3rd tab)
	
	if (containerId == "divAddMPContentContainer") {
		var divPodPlaceHolder = CreateSearchPanel("inputMPText", "imgSearchMP");
		divAddContentContainerTabContainer.style.height = "300px";
	}

    tableTabCell2.appendChild(divPodPlaceHolder);

    mainContainerTab.appendChild(divAddContentContainerTabContainer);
    mainContainerTab.appendChild(tableTab);

    return mainContainerTab;
}

//function to create Tab container for add additional contents
function SearchWebMapsForAddContent() {
	console.log("SearchWebMapsForAddContent function called");
	
    document.getElementById("backGroundImage").style.visibility = "visible";
    document.getElementById("divAddContent").style.display = "block";
    setDragBehaviour("AddHeaderContent", "divAddContent");
    var mainContainervUsaTab = CreateTabs("divAddContentContainerTabContainer"); // Focus Group Tab (1st tab)
    var mainContainerAgolTab = CreateTabs("divAddArcGISContentContainer"); // Public Tab (2nd tab)
	var mainContainerMPTab = CreateTabs("divAddMPContentContainer"); // My Groups Tab (3rd tab)
	
    var divT = dojo.create("div");
    divT.style.width = "100%";
    divT.style.height = "300px";
    document.getElementById("tabContainerMainDiv").appendChild(divT);
    var tc = new dijit.layout.TabContainer({
        tabPosition: "bottom",
        tabstrip: "true",
        style: "height: 100%; width: 100%;"
    }, divT);

    var cp1 = new dijit.layout.ContentPane({
		title: i18n.viewer.main.ContentTabTitle1,
        selected: "true",
        content: mainContainervUsaTab // Focus Group Tab
    });
    tc.addChild(cp1);

    var cp2 = new dijit.layout.ContentPane({
        title: i18n.viewer.main.ContentTabTitle2,
        content: mainContainerAgolTab // Public Content Tab
    });
    tc.addChild(cp2);

    var cp3 = new dijit.layout.ContentPane({
		title: i18n.viewer.main.ContentTabTitle3,
        content: mainContainerMPTab // My Groups Tab
    });
	
    if (typeof(portalUser) == "undefined"){
		console.log("not logged in; no my groups tab for you");
		tc.addChild(cp3);
	}
	else{
		console.log("logged in, gonna add the tab for you");
		tc.addChild(cp3);
	}
	
    tc.startup();

    setTimeout(dojo.hitch(this, function () {
        tc.resize();
    }), 1000);

    var groups = "";
    for (var i in configOptions.groups) {
        if (groups == "") {
            groups = configOptions.groups[0].groupID;

        } else {
            groups = groups + '" OR "' + configOptions.groups[i].groupID;
        }
    }
    var params = {
        q: 'group:' + groups,
        sortField: "modified",
        sortOrder: "desc",
        num: 100
    }
    portal.queryItems(params).then(function (groupdata) {
        HideProgressIndicator();
        sessionStorage.clear();
        CreateAddContentsTable(groupdata, "divAddContentContainerTabContainer");
    });
}

var tags = [];

/* function EventList() {
	console.log("EventList Function called");

    var groups = "";
    for (var i in configOptions.groups) {
        if (groups == "") {
            groups = configOptions.groups[0].groupID;
        } else {
            groups = groups + '" OR "' + configOptions.groups[i].groupID;
        }
    }

    var queryString;
    if (i18n.viewer.main.jurisdiction == "") {
        queryString = 'group:("' + groups + '")' + ' OR (accountid:"' + portalUser.orgId + '") AND (tags: ("' + configOptions.eventTagPatternPrefix + '"))';
    }
    else {
        queryString = 'group:("' + groups + '")' + ' OR (accountid:"' + portalUser.orgId + '") AND (tags: ("' + configOptions.eventTagPatternPrefix + '") AND "' + i18n.viewer.main.jurisdiction + '")';
    }

    var params = {
        q: queryString,
        num: 100,
        sortField: "modified",
        sortOrder: "desc"
    }
    portal.queryItems(params).then(function (tagdetails) {
        for (i in tagdetails.results) {
            for (j in tagdetails.results[i].tags) {
                var k = tagdetails.results[i].tags[j].search(configOptions.eventTagPatternPrefix);
                if (k != -1) {
                    var l = tagdetails.results[i].tags[j].split(configOptions.eventTagPatternPrefix);
                    if (!tags[l[1]]) {
                        tags[l[1]] = l[1];
                        tags.length = 1;
                    }
                }
            }
        }
        //EGE 12/19/13, tried removed call to create the map dialogue, but map became unusable
		//CreateLoadMapDialog();
        
		//EGE 12/20/13; SearchWebMapsForEvent not originally in the app at this point, tried to short circuit the webmap dialog on launch.
		//SearchWebMapsForEvent();
		
        HideProgressIndicator();
    });
} */

// Function to do...
// EGE Note: need to assess the different calls in this function 
function FindArcGISUserInGroup(extent) {
	console.log("Function FindArcGISUserInGroup called");
	
    sessionStorage.clear();
    var data = portalUser.credential;
    token = data.token;
    arrSubjectGroups = [];
    var popup = new esri.dijit.Popup({
        fillSymbol: new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]))
    }, dojo.create("div"));

    esri.arcgis.utils.createMap(configOptions.baseMapId, "map", {
        slider: true,
        infoWindow: popup
    }).then(function (response) {
        dojo.byId("map1").style.height = "0px";
        map = response.map;
        BuildDesktopDOM();
        for (var i in map._layers) {
            baseMapLayers[i] = i;
        }

        var zoomExtent = extent.split(",");
        var startExtent = new esri.geometry.Extent(parseFloat(zoomExtent[0]), parseFloat(zoomExtent[1]), parseFloat(zoomExtent[2]), parseFloat(zoomExtent[3]), map.spatialReference);
        map.setExtent(startExtent);
        //EventList();

        var chk = window.location.toString();
        var chk1 = chk.split("=");
        if (chk.indexOf("webmap=") != -1) {
            CreateMapLayers(chk1[1], null);
        } else {
			//EGE, 12/20/13: removed the divEventContainer  in order to shortcut the 'add content' popup on app load
           //dojo.byId("divEventContainer").style.display = "block";
        }
        dojo.connect(map, "onLayerAdd", function (layer) {
            if (layer.type == "Feature Layer") {
                if (!layer.infoTemplate) {
                    var infoTemplate;
                    var template = [];
                    var divTemplate = document.createElement("div");
                    var table = document.createElement("table");
                    divTemplate.appendChild(table);
                    var tbody = document.createElement("tbody");
                    table.appendChild(tbody);
                    for (var i = 0; i < layer.fields.length; i++) {
                        var tr = document.createElement("tr");
                        tbody.appendChild(tr);

                        var tdDisplayText = document.createElement("td");
                        tdDisplayText.style.verticalAlign = "top";
                        tdDisplayText.innerHTML = ((layer.fields[i].alias) ? layer.fields[i].alias : layer.fields[i].name) + ": ";
                        tr.appendChild(tdDisplayText);

                        var tdFieldName = document.createElement("td");
                        tdFieldName.setAttribute("data", true);
                        tdFieldName.style.verticalAlign = "top";
                        tdFieldName.innerHTML = "${" + layer.fields[i].name + "}";
                        tr.appendChild(tdFieldName);
                    }
                    template.push(divTemplate);
                    var template1 = new esri.InfoTemplate(layer.name, template[0].outerHTML);
                    layer.setInfoTemplate(template1);
                }
            }
        });

    }, function (err) {
        showDailog("error", err);
    });
}

// EGE: 1/6/14, createMap function based on FindArcGISUserInGroup,
function createMap(extent) {
	console.log("Function createMap called");

    sessionStorage.clear();
   // var data = portalUser.credential;
   // token = data.token;
    arrSubjectGroups = [];
    var popup = new esri.dijit.Popup({
        fillSymbol: new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 0, 0.25]))
    }, dojo.create("div"));

    esri.arcgis.utils.createMap(configOptions.baseMapId, "map", {
        slider: true,
        infoWindow: popup
    }).then(function (response) {
        dojo.byId("map1").style.height = "0px";
        map = response.map;
        BuildDesktopDOM();
        for (var i in map._layers) {
            baseMapLayers[i] = i;
        }

        var zoomExtent = extent.split(",");
        var startExtent = new esri.geometry.Extent(parseFloat(zoomExtent[0]), parseFloat(zoomExtent[1]), parseFloat(zoomExtent[2]), parseFloat(zoomExtent[3]), map.spatialReference);
        map.setExtent(startExtent);
        //EventList();

        var chk = window.location.toString();
        var chk1 = chk.split("=");
        if (chk.indexOf("webmap=") != -1) {
            CreateMapLayers(chk1[1], null);
        } else {
			//EGE, 12/20/13: removed the divEventContainer  in order to shortcut the 'add content' popup on app load
           //dojo.byId("divEventContainer").style.display = "block";
        }
        dojo.connect(map, "onLayerAdd", function (layer) {
            if (layer.type == "Feature Layer") {
                if (!layer.infoTemplate) {
                    var infoTemplate;
                    var template = [];
                    var divTemplate = document.createElement("div");
                    var table = document.createElement("table");
                    divTemplate.appendChild(table);
                    var tbody = document.createElement("tbody");
                    table.appendChild(tbody);
                    for (var i = 0; i < layer.fields.length; i++) {
                        var tr = document.createElement("tr");
                        tbody.appendChild(tr);

                        var tdDisplayText = document.createElement("td");
                        tdDisplayText.style.verticalAlign = "top";
                        tdDisplayText.innerHTML = ((layer.fields[i].alias) ? layer.fields[i].alias : layer.fields[i].name) + ": ";
                        tr.appendChild(tdDisplayText);

                        var tdFieldName = document.createElement("td");
                        tdFieldName.setAttribute("data", true);
                        tdFieldName.style.verticalAlign = "top";
                        tdFieldName.innerHTML = "${" + layer.fields[i].name + "}";
                        tr.appendChild(tdFieldName);
                    }
                    template.push(divTemplate);
                    var template1 = new esri.InfoTemplate(layer.name, template[0].outerHTML);
                    layer.setInfoTemplate(template1);
                }
            }
        });

    }, function (err) {
        showDailog("error", err);
    });
}


var counter1 = 0;

function CreateMapLayers(mapId, btid) {
	console.log("Create Map Layers function called");

    if (counter1 == 0) {
        var arr = [];
        var legendDijit = new esri.dijit.Legend({
            map: map,
            layerInfos: arr
        }, "legendDiv");
        legendDijit.startup();
        counter1++;
    }
    var arr = [];

    if (mapId) {
		console.log("mapID exists, check for token");
       // esriConfig.defaults.io.alwaysUseProxy = true;
        var k1 = portalUrl + "/sharing/content/items/${0}?f=json&token=${0}";

        var userGroupDetails = k1.split("${0}");
		
		//check if token exists, if it doesn't then go through the login process
		if (token){

			console.log("token exists");
			var userGroupLink = userGroupDetails[0] + mapId + userGroupDetails[1] + token;
			

		}
		else{
		console.log("token does not exist");
                        var chk = window.location.toString();

                        var chk1 = chk.split("=");
                      if (chk.indexOf("webmap=") != -1) {
                           Login();
                           //exit this function until login gets a token
                           return;

                      } else {

                         var userGroupLink = userGroupDetails[0] + mapId + userGroupDetails[1];
                      }


		}
		
		esri.request({
                    url: userGroupLink,
                    callbackParamName: "callback",
                    load: function (data) {
        
                        if (data.type == "KML") {
        				
        					console.log("KML being added");
                            addedLayersOnMap.push(data);
                            AddKMLLayer(mapId, btid, data.url, data.title);
        					
                        } else if (data.type == "Web Map") {
        					console.log("WebMap being added");
                            AddWebMap(mapId, btid);
        					
                        } else if (data.type == "Feature Service") {
        					console.log("Feature Service being added");
                            addLayerId[mapId] = mapId;
                            var layerType = data.url.substring(((data.url.lastIndexOf("/")) + 1), (data.url.length));
        					
                            if (!isNaN(layerType)) {
                                addedLayersOnMap.push(data);
                                AddFeatureLayer(data.url, btid, data.id, data.title);
        						
                            } else {
                                addedLayersOnMap.push(data);
        			//check for token
        			if (token){
        				var url1 = data.url + "?f=json&token=" + token;
        			}
        			else{
        				console.log("no token for FS");
        				var url1 = data.url + "?f=json"; 
        			}
        						
                                esri.request({
                                    url: url1,
                                    handleAs: "json",
                                    load: function (jsondata) {
        
                                        if (jsondata.layers.length > 0) {
                                            for (var j = 0; j < jsondata.layers.length; j++) {
                                                var layerUrl = data.url + "/" + jsondata.layers[j].id;
                                                AddFeatureLayer(layerUrl, btid, data.id + "_" + j, data.title);
                                            }
                                        }
                                    },
                                    error: function (err) {
                                        HideProgressIndicatorAdditionalContent();
                                        showDailog("error", err);
                                    }
                                });
                            }
                        } else if (data.type == "Map Service") {
        					console.log("Map Service being added");
                            addLayerId[mapId] = mapId;
                            var layerType = data.url.substring(((data.url.lastIndexOf("/")) + 1), (data.url.length));
                            if (!isNaN(layerType)) {
        						console.log("Map Service being added / !isNaN(layerType)");
                                addedLayersOnMap.push(data);
                                AddFeatureLayer(data.url, btid, data.id, data.title);
                            } else {
        						console.log("Map Service being added / NOT !isNaN(layerType)");
                                addedLayersOnMap.push(data);
                                AddChashedAndDynamicService(data.url, data.id, btid, data.title);
                            }
                        }
                    },
                    error: function (err) {
                        HideProgressIndicatorAdditionalContent();
                        showDailog("error", err);
                    }
                });

    }
}

function AddKMLLayer(mapId, btid, url, title) {
	console.log("Add KMLLayer function called");

    addLayerId[mapId] = mapId;
    var kml = new esri.layers.KMLLayer(url);
    kml.id = mapId;
    map.addLayer(kml);
    dijit.byId("legendDiv").layerInfos.push({
        "layer": kml,
        "title": title
    });
    if (btid) {
        dojo.byId(btid).innerHTML = "Remove";
    }
}

function AddWebMap(mapId, btid) {
	console.log("Add WebMap function called");
	
    esri.arcgis.utils.createMap(mapId, "map1", {
        mapOptions: {
            slider: true
        },
        geometryServiceURL: "https://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer"
    }).then(function (response) {
        dojo.byId("map1").style.height = "0px";
        esriConfig.defaults.io.alwaysUseProxy = false;
        var kml = [];
        var layers1 = response.itemInfo.itemData.operationalLayers;
        dojo.forEach(layers1, function (layer) {
            if (!layer.featureCollection) {
                if (layer.type == "KML") {
                    if (layer.visibility) {
                        addedLayersOnMap.push(layer);
                    }
                    kml[layer.id] = layer;
                } else {
                    if (layer.visibility) {
                        addedLayersOnMap.push(layer);
                    }
                    dijit.byId("legendDiv").layerInfos.push({
                        "layer": layer.layerObject,
                        "title": layer.title
                    });
                }
            }
        });

        dijit.byId('legendDiv').refresh();
        var layers = [];
        for (i in response.map._layers) {
            if ((i != response.itemInfo.itemData.baseMap.baseMapLayers[0].id) && (i != "map1_graphics")) {
                if (!kml[i]) {
                    if (response.map._layers[i].url) {
                        layers.push(response.map._layers[i]);
                    }
                }
            }
        }
        var extent = response.map.extent;

        response.map.removeAllLayers();
        response.map.destroy();

        if (layers) {
            var k = 0;
            for (i in layers) {
                layers[i].id = mapId + "_" + k;
                map.addLayer(layers[i]);
                layerCounter[layers[i].id] = layers[i].id;
                k++;
            }
            for (j in kml) {
                if (btid) {
                    AddKMLLayer(mapId + "_" + k, btid, kml[j].url, kml[j].title);
                } else {
                    AddKMLLayer(mapId + "_" + k, null, kml[j].url, kml[j].title);
                }
                layerCounter[mapId + "_" + k] = mapId + "_" + k;
                k++;
            }
            addLayerId[mapId] = mapId;
            kml = [];
        }
        map.setExtent(extent);
        if (btid) {
            dojo.byId(btid).innerHTML = "Remove";
        }
    }, function (err) {
        dojo.byId(btid).innerHTML = "Failed";
        showDailog("error", err);
    });
}

function AddFeatureLayer(url, btid, id, title) {
	console.log("Add FeatureLayer function called");

    var featureLayer = new esri.layers.FeatureLayer(url, {
        mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
        outFields: ["*"]
    });
    featureLayer.id = id;
    map.addLayer(featureLayer);
    map.getLayer(featureLayer.id).show();
    dijit.byId("legendDiv").layerInfos.push({
        "layer": featureLayer,
        "title": title
    });
    SetExtentForLayer(url);
    dojo.byId(btid).innerHTML = "Remove";
}

function SetExtentForLayer(url, type) {
	console.log("SetExtentForLayer called for: "+url);
	//check for token
	if (token){
			var url1 = url + "?f=json&token="+ token;
		}
		else{
			var url1 = url + "?f=json";
		}
    esri.request({
        url: url1,
        handleAs: "json",
        load: function (data) {

            geometryService = new esri.tasks.GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
            var layerExtent;
            if (type) {
                layerExtent = CreateExtent(data.fullExtent);
            } else {
                layerExtent = CreateExtent(data.extent);
            }
            if (layerExtent.spatialReference.wkid == map.spatialReference.wkid) {
                map.setExtent(layerExtent);
            } else {
                var project = geometryService.project([layerExtent], map.spatialReference);
                project.then(Success, Failure);
            }
        },
        error: function (err) {
            HideProgressIndicatorAdditionalContent();
            showDailog("error", err);
        }
    });
}

function CreateExtent(ext) {
    var projExtent;
    if (ext.spatialReference.wkid) {
        projExtent = new esri.geometry.Extent({
            "xmin": ext.xmin,
            "ymin": ext.ymin,
            "xmax": ext.xmax,
            "ymax": ext.ymax,
            "spatialReference": {
                "wkid": ext.spatialReference.wkid
            }
        });
    } else {
        projExtent = new esri.geometry.Extent({
            "xmin": ext.xmin,
            "ymin": ext.ymin,
            "xmax": ext.xmax,
            "ymax": ext.ymax,
            "spatialReference": {
                "wkid": ext.spatialReference.wkt
            }
        });
    }
    return projExtent;
}

function Success(result) {
    if (result.length) {
        map.setExtent(result[0]);
    } else {
        console.log("No results were returned.");
    }
}

function Failure(err) {
    showDailog("error", err);
}

function AddChashedAndDynamicService(url, id, btid, title) {
    var url1 = url + "?f=json";
    esri.request({
        url: url1,
        handleAs: "json",
        load: function (data) {

            if (data.singleFusedMapCache) {
                AddTiledService(url, id, btid, title);
            } else {
                AddDynamicService(url, id, btid, title);
            }
        },
        error: function (err) {
            HideProgressIndicatorAdditionalContent();
            showDailog("error", err);
        }
    });
}

function AddTiledService(url, id, btid, title) {
    var overlaymap = new esri.layers.ArcGISTiledMapServiceLayer(url);
    overlaymap.id = id;
    map.addLayer(overlaymap);
    dijit.byId("legendDiv").layerInfos.push({
        "layer": overlaymap,
        "title": title
    });
    SetExtentForLayer(url, true);
    dojo.byId(btid).innerHTML = "Remove";
}

function AddDynamicService(url, id, btid, title) {
    var imageParameters = new esri.layers.ImageParameters();
    var overlaymap = new esri.layers.ArcGISDynamicMapServiceLayer(url, {
        "imageParameters": imageParameters
    });
    overlaymap.id = id;
    map.addLayer(overlaymap);
    dijit.byId("legendDiv").layerInfos.push({
        "layer": overlaymap,
        "title": title
    });
    SetExtentForLayer(url, true);
    dojo.byId(btid).innerHTML = "Remove";
}