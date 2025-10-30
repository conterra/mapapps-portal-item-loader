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

import apprtAsync from "apprt-core/async";
import type { InjectedReference } from "apprt-core/InjectedReference";

export default class LoadServiceAdder {

    private readonly _loadServiceTool!: InjectedReference<any>;
    private readonly _loadServiceWizard!: InjectedReference<any>;

    public addService(url: string): void {
        this._loadServiceTool.set("active", true);
        const vm = this._loadServiceWizard && this._loadServiceWizard.getVM();

        const serviceType = this.getServiceType(url);
        if (!serviceType) {
            return;
        }
        if (vm.isMounted) {
            this.initializeUI(vm, url, serviceType);
        } else {
            vm.$once('mounted', () => {
                this.initializeUI(vm, url, serviceType);
            });
        }
    }

    private initializeUI(vm: any, url: string, serviceType: string) {
        vm.reset();
        vm.initialInputTab = "url_input";
        vm.serviceUrl = url;
        vm.serviceType = serviceType;
        apprtAsync(() => { // We need to wait here until all event handlers watching the reset event have been executed.
            vm.updateFormData({ url, type: serviceType });
            vm.setValididation(true);
        }, 100);
    }

    private getServiceType(url: string): string | undefined {
        const urlLowerCase = url.toLocaleLowerCase();
        if (!urlLowerCase || urlLowerCase === "") {
            return;
        }
        if (urlLowerCase.includes("{x}") ||
            urlLowerCase.includes("{y}") ||
            urlLowerCase.includes("{z}")) {
            return "WEBTILE";
        }
        if (urlLowerCase.includes("ogc-api") ||
            urlLowerCase.includes("ogcapi") ||
            urlLowerCase.includes("ogcfeatureserver") ||
            urlLowerCase.includes("/collections")) {
            return "OGC_FEATURE";
        }
        if (urlLowerCase.indexOf("inspire") > -1) {
            return "INSPIRE_VIEW";
        }
        if (urlLowerCase.indexOf("MapServer/exts/InspireView".toLowerCase()) > -1) {
            return "INSPIRE_VIEW";
        }
        if (urlLowerCase.indexOf("MapServer/WMSServer".toLowerCase()) > -1) {
            return "WMS";
        }
        if (urlLowerCase.indexOf("ImageServer/WMSServer".toLowerCase()) > -1) {
            return "WMS";
        }
        if (urlLowerCase.indexOf("MapServer/WMTS".toLowerCase()) > -1) {
            return "WMTS";
        }
        if (urlLowerCase.indexOf("wms") > -1) {
            return "WMS";
        }
        if (urlLowerCase.indexOf("wmts") > -1) {
            return "WMTS";
        }
        if (urlLowerCase.indexOf("wfs") > -1) {
            return "WFS";
        }
        if (urlLowerCase.indexOf("featureserver") > -1) {
            return "AGS_FEATURE";
        }
        if (urlLowerCase.indexOf("imageserver") > -1) {
            return "AGS_IMAGE";
        }
        if (urlLowerCase.indexOf("mapserver") > -1) {
            return "AGS_DYNAMIC";
        }
        if (urlLowerCase.indexOf("sceneserver") > -1) {
            return this.getTypeOfSceneServer(urlLowerCase);
        }
        if (urlLowerCase.indexOf("vectortileserver") > -1) {
            return "AGS_VECTORTILE";
        }
        return "UNKNOWN";
    }

    private getTypeOfSceneServer(url: string): string {
        if (url.indexOf("building") > -1) {
            return "AGS_BUILDING";
        }
        if (url.indexOf("mesh") > -1) {
            return "AGS_INTEGRATEDMESH";
        }
        if (url.indexOf("pointcloud") > -1 || url.indexOf("lidar") > -1) {
            return "AGS_POINTCLOUD";
        }
        return "AGS_SCENE";
    }
}
