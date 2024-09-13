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

    constructor(i18n: any, mapWidgetModel: MapWidgetModel, portalContentModel: typeof PortalContentModel) {
        this.mapWidgetModel = mapWidgetModel;
        const model = this.portalContentModel = portalContentModel;
        model.portalFilter = model.portals[0].id;

        portalContentModel.watch("portalFilter", ({ value }) => {
            model.portalItems = [];
            this.queryPortalItems(model.pagination, value, model.searchText, model.spaceFilter,
                model.sortAscending, model.sortByField);
        });

        portalContentModel.watch("searchText", ({ value }) => {
            this.queryPortalItems(model.pagination, model.portalFilter, value, model.spaceFilter,
                model.sortAscending, model.sortByField);
        });

        portalContentModel.watch("pagination", ({ value }) => {
            this.queryPortalItems(value, model.portalFilter, model.searchText, model.spaceFilter,
                model.sortAscending, model.sortByField);
        });

        portalContentModel.watch("spaceFilter", ({ value }) => {
            this.queryPortalItems(model.pagination, model.portalFilter, model.searchText, value,
                model.sortAscending, model.sortByField);
        });

        portalContentModel.watch("sortAscending", ({ value }) => {
            this.queryPortalItems(model.pagination, model.portalFilter, model.searchText, model.spaceFilter,
                value, model.sortByField);
        });

        portalContentModel.watch("sortByField", ({ value }) => {
            this.queryPortalItems(model.pagination, model.portalFilter, model.searchText, model.spaceFilter,
                model.sortAscending, value);
        });
    }

    queryPortalItems(pagination: any, portalFilter: string, searchText: string, spaceFilter: "all" | "organisation" | "my-content",
        sortAscending: boolean,
        sortByField: Fields): void {
        const model = this.portalContentModel;
        clearTimeout(this.lastTimeout);
        this.lastTimeout = setTimeout(() => {
            model.loading = true;
            if (this.abortController) {
                this.abortController.abort();
            }
            const selectedPortal = model.portals.find((portalConfig) => portalConfig.id === model.portalFilter);
            const promise =
                this.queryPortal(selectedPortal, pagination, searchText, spaceFilter, sortAscending, sortByField);
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

    private queryPortal(portalConfig: any, pagination: any, searchText: string, spaceFilter: "all" | "organisation" | "my-content",
        sortAscending: boolean,
        sortByField: Fields): Promise<__esri.PortalQueryResult> {
        const page = pagination.page;
        const rowsPerPage = pagination.rowsPerPage;
        const portal = new Portal(portalConfig.url);
        return new Promise(resolve => {
            portal.load().then(() => {
                let query;
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
                    query += " AND title:" + searchText;
                }
                const queryParams: __esri.PortalQueryParamsProperties = {
                    query: query,
                    sortField: sortByField,
                    sortOrder: sortAscending ? "asc" : "desc",
                    filter: 'typeKeywords:Service',
                    // filter: 'type:"Feature Service"',
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
