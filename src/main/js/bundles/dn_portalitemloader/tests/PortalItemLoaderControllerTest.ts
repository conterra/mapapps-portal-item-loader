///
/// Copyright (C) 2025 con terra GmbH (info@conterra.de)
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///         http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

import { assert } from "chai";
const sourceId = "PortalLoaderControllerTest";
import { default as PortalItemLoaderController } from "../PortalItemLoaderController";
import { default as PortalItemLoaderModel } from "../PortalItemLoaderModel";

describe(sourceId, function () {
    it("should update type and space filters when the selected portal changes to an ArcGIS portal", async function () {
        const portalItemLoaderController = createPortalItemLoaderController();
        const model = createPortalItemLoaderModel();
        portalItemLoaderController.setModel(model);
        await portalItemLoaderController.changeSelectedPortal("arcgis");
        assert.deepEqual(model.selectedPortalId, "arcgis");
        assert.deepEqual(model.selectedPortalType, "portal");
        assert.deepEqual(model.typeFilter, "all");
        assert.deepEqual(model.spaceFilter, "all");
        assert.deepEqual(model.typeFilters, model.typeFiltersPortal);
        assert.deepEqual(model.spaceFilters, model.spaceFiltersPortal);
    });

    it("should update type and space filters when the selected portal changes to a csw portal", function () {
        const portalItemLoaderController = createPortalItemLoaderController();
        const model = createPortalItemLoaderModel();
        portalItemLoaderController.setModel(model);
        portalItemLoaderController.changeSelectedPortal("copernicus");
        assert.deepEqual(model.selectedPortalId, "copernicus");
        assert.deepEqual(model.selectedPortalType, "csw");
        assert.deepEqual(model.typeFilter, "all");
        assert.deepEqual(model.spaceFilter, "all");
        assert.deepEqual(model.typeFilters, model.typeFiltersCSW);
        assert.deepEqual(model.spaceFilters, model.typeFiltersCSW);
    });
});

function createPortalItemLoaderController() {
    return new PortalItemLoaderController();
}

function createPortalItemLoaderModel() {
    const model = new PortalItemLoaderModel();
    model.portals = [
        {
            "id": "arcgis",
            "title": "ArcGIS Online",
            "url": "https://arcgis.com",
            "authMode": "auto",
            "type": "portal",
            "visibleElements": {
                "sortBy": true,
                "typeFilter": true,
                "itemThumbnail": true,
                "serviceType": true,
                "owner": true,
                "views": true,
                "modified": true
            }
        },
        {
            "id": "copernicus",
            "title": "Copernicus",
            "url": "https://sdi.eea.europa.eu/catalogue/copernicus/eng/csw",
            "type": "csw",
            "visibleElements": {
                "sortBy": true,
                "typeFilter": true,
                "itemThumbnail": true,
                "serviceType": true,
                "owner": true,
                "views": true,
                "modified": true
            }
        },
        {
            "id": "metaver",
            "title": "MetaVer",
            "url": "https://metaver.de/csw",
            "type": "csw",
            "filter": "<ogc:PropertyIsEqualTo><ogc:PropertyName>dc:type</ogc:PropertyName><ogc:Literal>service</ogc:Literal></ogc:PropertyIsEqualTo>",
            "itemPageUrl": "https://metaver.de/trefferanzeige?docuuid={id}",
            "visibleElements": {
                "sortBy": false,
                "typeFilter": false,
                "itemThumbnail": false,
                "serviceType": true,
                "owner": true,
                "views": true,
                "modified": true
            }
        }
    ];
    return model;
}
