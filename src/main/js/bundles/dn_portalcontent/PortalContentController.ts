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
import PortalContentModel from "./PortalContentModel";
import type Fields from "../../types/Fields.d.ts";

export default class PortalContentWidgetController {

    private readonly mapWidgetModel: MapWidgetModel;
    private readonly portalContentModel: typeof PortalContentModel;
    private lastTimeout: any;
    private abortController: AbortController;
    private portal: __esri.Portal;

    constructor(i18n: any, mapWidgetModel: MapWidgetModel, portalContentModel: typeof PortalContentModel) {
        this.mapWidgetModel = mapWidgetModel;
        const model = this.portalContentModel = portalContentModel;
        model.portalFilter = model.portals[0].id;
        this.changeSelectedPortal(model.portalFilter);

        portalContentModel.watch("portalFilter", ({ value }) => {
            // delete current results
            model.portalItems = [];
            // set new portal
            this.changeSelectedPortal(value);
            this.queryPortalItems(model.pagination, this.portal, model.searchText, model.spaceFilter, model.typeFilters,
                model.sortAscending, model.sortByField);
        });

        portalContentModel.watch("searchText", ({ value }) => {
            this.queryPortalItems(model.pagination, this.portal, value, model.spaceFilter, model.typeFilter,
                model.sortAscending, model.sortByField);
        });

        portalContentModel.watch("pagination", ({ value }) => {
            this.queryPortalItems(value, this.portal, model.searchText, model.spaceFilter, model.typeFilter,
                model.sortAscending, model.sortByField);
        });

        portalContentModel.watch("spaceFilter", ({ value }) => {
            this.queryPortalItems(model.pagination, this.portal, model.searchText, value, model.typeFilter,
                model.sortAscending, model.sortByField);
        });

        portalContentModel.watch("typeFilter", ({ value }) => {
            this.queryPortalItems(model.pagination, this.portal, model.searchText, model.spaceFilter, value,
                model.sortAscending, model.sortByField);
        });

        portalContentModel.watch("sortAscending", ({ value }) => {
            this.queryPortalItems(model.pagination, this.portal, model.searchText, model.spaceFilter, model.typeFilter,
                value, model.sortByField);
        });

        portalContentModel.watch("sortByField", ({ value }) => {
            this.queryPortalItems(model.pagination, this.portal, model.searchText, model.spaceFilter, model.typeFilter,
                model.sortAscending, value);
        });
    }

    queryPortalItems(pagination: any, portal: __esri.Portal, searchText: string, spaceFilter: "all" | "organisation" | "my-content", typeFilter: string,
        sortAscending: boolean,
        sortByField: Fields): void {
        const model = this.portalContentModel;
        clearTimeout(this.lastTimeout);
        this.lastTimeout = setTimeout(() => {
            model.loading = true;
            if (this.abortController) {
                this.abortController.abort();
            }
            const promise =
                this.queryPortal(portal, pagination, searchText, spaceFilter, typeFilter, sortAscending, sortByField);
            promise.then((result) => {
                this.abortController = null;
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
        const model = this.portalContentModel;
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
        sortAscending: boolean,
        sortByField: Fields): Promise<__esri.PortalQueryResult> {
        const page = pagination.page;
        const rowsPerPage = pagination.rowsPerPage;
        return new Promise(resolve => {
            portal.load().then(() => {
                let query = "";
                let filter = "typeKeywords:Service";
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
                    query += " AND (title:" + searchText + " OR description:" + searchText + " OR snippet:" + searchText + ")";
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
                resolve(null);
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
        this.portalContentModel.portalItems = portalItems;
    }

    addPortalItemLayerToMap(item: any): void {
        Layer.fromPortalItem({
            portalItem: {
                // autocasts new PortalItem()
                id: item.id,
                // autocastable to Portal
                portal: {
                    url: item.portalUrl
                }
            }
        }).then((layer) => {
            // add the layer to the map
            this.mapWidgetModel.map.add(layer);
        });
    }

}
