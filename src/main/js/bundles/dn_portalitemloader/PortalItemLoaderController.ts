///
/// Copyright (C) 2024 con terra GmbH (info@conterra.de)
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

import Portal from "esri/portal/Portal";
import Layer from "esri/layers/Layer";
import MapWidgetModel from "map-widget/MapWidgetModel";
import PortalItemLoaderModel from "./PortalItemLoaderModel";
import GroupLayer from "esri/layers/GroupLayer";

export default class PortalItemLoaderWidgetController {

    private readonly mapWidgetModel: MapWidgetModel;
    private readonly portalItemLoaderModel: typeof PortalItemLoaderModel;
    private readonly addLayerService: any;
    private lastTimeout: any;
    private abortController: AbortController | undefined;
    private portal: __esri.Portal | undefined;

    constructor(i18n: any, mapWidgetModel: MapWidgetModel,
        portalItemLoaderModel: typeof PortalItemLoaderModel, addLayerService: any) {
        this.mapWidgetModel = mapWidgetModel;
        this.addLayerService = addLayerService;
        const model = this.portalItemLoaderModel = portalItemLoaderModel;
        model.portalFilter = model.portals[0].id;
        this.changeSelectedPortal(model.portalFilter);

        portalItemLoaderModel.watch("portalFilter", ({ value }) => {
            // delete current results
            model.portalItems = [];
            // set new portal
            this.changeSelectedPortal(value);
            this.queryPortalItems(model.pagination, model.searchText, model.spaceFilter, model.typeFilter,
                model.sortAscending, model.sortByField);
        });

        portalItemLoaderModel.watch("searchText", ({ value }) => {
            this.queryPortalItems(model.pagination, value, model.spaceFilter, model.typeFilter,
                model.sortAscending, model.sortByField);
        });

        portalItemLoaderModel.watch("pagination", ({ value }) => {
            this.queryPortalItems(value, model.searchText, model.spaceFilter, model.typeFilter,
                model.sortAscending, model.sortByField);
        });

        portalItemLoaderModel.watch("spaceFilter", ({ value }) => {
            this.queryPortalItems(model.pagination, model.searchText, value, model.typeFilter,
                model.sortAscending, model.sortByField);
        });

        portalItemLoaderModel.watch("typeFilter", ({ value }) => {
            this.queryPortalItems(model.pagination, model.searchText, model.spaceFilter, value,
                model.sortAscending, model.sortByField);
        });

        portalItemLoaderModel.watch("sortAscending", ({ value }) => {
            this.queryPortalItems(model.pagination, model.searchText, model.spaceFilter, model.typeFilter,
                value, model.sortByField);
        });

        portalItemLoaderModel.watch("sortByField", ({ value }) => {
            this.queryPortalItems(model.pagination, model.searchText, model.spaceFilter, model.typeFilter,
                model.sortAscending, value);
        });
    }

    queryPortalItems(pagination: any, searchText: string, spaceFilter: "all" | "organisation" | "my-content", typeFilter: string,
        sortAscending: boolean,
        sortByField: string): void {
        const model = this.portalItemLoaderModel;
        const portal = this.portal!;
        clearTimeout(this.lastTimeout);
        this.lastTimeout = setTimeout(() => {
            model.loading = true;
            if (this.abortController) {
                this.abortController.abort();
            }
            const promise =
                this.queryPortal(portal, pagination, searchText, spaceFilter, typeFilter, sortAscending, sortByField);
            promise.then((result) => {
                this.abortController = undefined;
                model.loading = false;
                if (!result) {
                    return;
                }
                this.addPortalItemsToModel(result);
                model.totalItems = result.total;
            });
        }, 500);
    }

    private changeSelectedPortal(portalId: string) {
        const model = this.portalItemLoaderModel;
        const selectedPortal = model.portals.find((portalConfig) => portalConfig.id === portalId);
        const portal = this.portal = new Portal(selectedPortal.url);
        portal.load().then(() => {
            if (portal.user) {
                model.authenticated = true;
            } else {
                model.authenticated = false;
            }
        });
    }

    private queryPortal(portal: __esri.Portal, pagination: any, searchText: string, spaceFilter: "all" | "organisation" | "my-content", typeFilter: string,
        sortAscending: boolean, sortByField: string): Promise<__esri.PortalQueryResult> {
        const page = pagination.page;
        const rowsPerPage = pagination.rowsPerPage;
        return new Promise(resolve => {
            portal.load().then(() => {
                let query = "";
                const filter = "typeKeywords:Service";
                switch (spaceFilter) {
                    case "all":
                        query = "1=1";
                        break;
                    case "organisation":
                        query = "orgid:" + portal.user.orgId;
                        break;
                    case "my-content":
                        query = "owner:" + portal.user.username;
                }
                if (searchText !== "") {
                    query += " AND (title:" + searchText + " OR description:" + searchText + " OR snippet:" + searchText + " OR tags:" + searchText + ")";
                }
                if (typeFilter !== "all") {
                    query += " AND type:" + typeFilter;
                }
                const queryParams: __esri.PortalQueryParamsProperties = {
                    query: query,
                    sortField: sortByField,
                    sortOrder: sortAscending ? "asc" : "desc",
                    filter: filter,
                    num: rowsPerPage,
                    start: page * rowsPerPage - rowsPerPage + 1
                };

                const abortController = this.abortController = new AbortController();
                portal.queryItems(queryParams, { signal: abortController.signal }).then((result) => {
                    resolve(result);
                });
            }, (error) => {
                resolve(error);
            });
        });

    }

    private addPortalItemsToModel(result: __esri.PortalQueryResult): void {
        let portalItems = result.results.filter((result) => result.isLayer);
        portalItems = portalItems.map((portalItem) => {
            return {
                id: portalItem.id,
                title: portalItem.title,
                snippet: portalItem.snippet,
                description: portalItem.description,
                thumbnailUrl: portalItem.thumbnailUrl,
                tags: portalItem.tags,
                owner: portalItem.owner,
                numViews: portalItem.numViews,
                created: portalItem.created,
                modified: portalItem.modified,
                type: portalItem.type,
                url: portalItem.url,
                itemPageUrl: portalItem.itemPageUrl,
                portalUrl: portalItem.portal.url
            };
        });
        this.portalItemLoaderModel.portalItems = portalItems;
    }

    async addPortalItemLayerToMap(item: any): Promise<void> {
        const model = this.portalItemLoaderModel;
        const map = this.mapWidgetModel.map;
        const layer = await Layer.fromPortalItem({
            portalItem: {
                id: item.id,
                portal: {
                    url: item.portalUrl
                }
            }
        });

        if (this.addLayerService) {
            this.addLayerService.addLayerToMap(layer);
            console.info("PortalItemLoader: Used sdi_loadservice to add layer to map");
        } else {
            let root = map.findLayerById(model.rootId);
            if (!root) {
                root = new GroupLayer({
                    id: model.rootId,
                    title: model.rootTitle || model.rootId
                });
            }
            map.add(root);
            root.add(layer);
        }
    }

}
