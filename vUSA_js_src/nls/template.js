/*

//////////////////////////////////////////////////////////////////
// Copyright (c) 2008-2013 Esri. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Developed initially by esri for vUSA
//
// This version Modified by G&H International Services, Inc. on behalf of the National Information Sharing Consortium (NISC)
// Some funtionality of the Hydration app was removed to allow a more basic search and discovery within vUSA Common Library
// along with other groups where the user has content shared with them
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


This file contains various configuration settings for Virtual USA application
Use this file to perform the following:
// 1.  Set application title                                   - [ Tag(s) to look for: applicationName ]
// 2.  Set path and filename for application icon              - [ Tag(s) to look for: applicationIcon ]
// 3.  Set header for Legends panel                            - [ Tag(s) to look for: leftPanelHeader ] 
// 6.  Set webmap Id for basemap                               - [ Tag(s) to look for: baseMapId ]
// 7.  Set initial map extent                                  - [ Tag(s) to look for: defaultExtent ] 
// 8.  Set URL to create webmap ID while sharing               - [ Tag(s) to look for: addItemUrl, parameter 0 = Username, parameter 1 = Token ]
// 9.  Set URL to share the content with Organization or Group - [ Tag(s) to look for: generateShareLink, parameter 0 = Username, parameter 1 = Webmap ID, parameter 2 = Token ]
//10.  Set URL to publish webmap for sharing                   - [ Tag(s) to look for: generateMapPublishLink, parameter 0 = Webmap ID, parameter 1 = Token]
//
//11.  Set groups in which the content will be searched        - [ Tag(s) to look for: groupID ]
//12.  Set list of portals user can access                     - [ Tag(s) to look for: portalName, portalUrl ]

//13.  Customize error messages
//13a. When map cannot be created with content                 - [ Tag(s) to look for: createMap ]
//13b. Header for error dialog                                 - [ Tag(s) to look for: general ]
//13c. If no contents are found for search term                - [ Tag(s) to look for: agolError ]

*/
define({
    root: ({
        viewer: {
            main: {
                //Set application title...covered up by our current application Icon in upper left of app title bar
                applicationName: "vUSA",
                //                 Set path and filename for application icon 
                applicationIcon: "images/NISC_vUSA.png",
                //                Set header for Legends panel 
                leftPanelHeader: "<b>Legend</b>",
                //                Set webmap Id for basemap  http://www.arcgis.com/features/maps/basemaps.html
                baseMapId:     "d5e02a0c1f2b4ec399823fdd3c2fdebd",
                //                Set initial map extent
	        defaultExtent: "-13907000, 3655000, -8037000, 5495000",
                //               Set group Id for ESRI feature Group
		featureGroupId: "2394b887a80347fb8544610cfa30489c",  // ESRI featured content Group
                //              The add content window has three tabs the we made more configurable
		//               Set title for first tab in 'add content' panel
                ContentTabTitle1: "vUSA",
		//               Set title for second tab in 'add content' panel
                ContentTabTitle2: "ArcGIS Online",
		//               Set title for third tab in 'add content' panel
                ContentTabTitle3: "My Groups",
                //                 Set URL to create webmap ID while sharing
                addItemUrl: "http://www.arcgis.com/sharing/content/users/${0}/addItem?f=json&token=${1}",
                //                Set URL to share the content with Organization or Group
                generateShareLink: "http://www.arcgis.com/sharing/content/users/${0}/items/${1}/share?f=json&token=${2}",
                //                Set URL for the webMap Item Detail
                webMapItemDetail: "http://www.arcgis.com/home/item.html?id=",
                //                Set URL to publish webmap for sharing   
                generateMapPublishLink: "http://www.arcgis.com/sharing/content/items/${0}?f=json&token=${1}",
                 //                Set URL for your proxy https://developers.arcgis.com/javascript/jshelp/ags_proxy.html
                proxyURL: "https://developers.arcgis.com/javascript/jshelp/ags_proxy.html"
            },
            //            Set groups in which the content will be searched
            groups: [{
                groupID: "6e4b9e40f5c74be99564234160d26938"//, vUSA group id used for the first add content tab

            }
            ],
            //            Set list of portals user can access  
            portal: [{portalName: "arcgis.com",
                portalUrl: "//www.arcgis.com"
            }
			
            ],
            //            Set URL for help page 
            HelpURL: "help.htm",

            errors: {
                //            When map cannot be created with content 
                createMap: "Unable to create map",
                //             Header for error dialog   
                general: "Error",
                //              If no contents are found for search term 
                agolError: "No results found"
            }
        }
    })
});