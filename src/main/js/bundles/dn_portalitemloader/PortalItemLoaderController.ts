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
import { apprtFetch, ContentType } from "apprt-fetch";

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

    queryPortalItems(pagination: any, searchText: string, spaceFilter: "all" | "organisation" | "my-content" | "fav", typeFilter: string,
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
            if (portal.declaredClass === "esri.portal.Portal") {
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
            } else {
                const promise =
                    this.queryCSW(portal, pagination, searchText, spaceFilter, typeFilter, sortAscending, sortByField);
                promise.then((result) => {
                    this.abortController = undefined;
                    model.loading = false;
                    if (!result) {
                        return;
                    }
                    this.addCSWItemsToModel(result);
                    model.totalItems = result.total;
                });
            }
        }, 500);
    }

    private changeSelectedPortal(portalId: string): void {
        const model = this.portalItemLoaderModel;
        model.spaceFilter = "all";
        const selectedPortal = model.portals.find((portalConfig) => portalConfig.id === portalId);
        if (selectedPortal.type === "portal") {
            const portal = this.portal = new Portal({ url: selectedPortal.url, authMode: selectedPortal.authMode || "auto" });
            portal.load().then(() => {
                if (portal.user) {
                    model.authenticated = true;
                } else {
                    model.authenticated = false;
                }
            });
        } else if (selectedPortal.type === "csw") {
            this.portal = selectedPortal;
        }
    }

    private async queryPortal(portal: __esri.Portal, pagination: any, searchText: string, spaceFilter: "all" | "organisation" | "my-content" | "fav", typeFilter: string,
        sortAscending: boolean, sortByField: string): Promise<__esri.PortalQueryResult> {
        const page = pagination.page;
        const rowsPerPage = pagination.rowsPerPage;

        await this.loginToPortal();
        let filter = "typeKeywords:Service";
        switch (spaceFilter) {
            case "all":
            case "fav":
                break;
            case "organisation":
                filter += " AND orgid:" + portal.user.orgId;
                break;
            case "my-content":
                filter += " AND owner:" + portal.user.username;
                break;

        }
        if (spaceFilter === "fav") {
            // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
            filter += " AND group:" + portal.user.favGroupId;
        }
        let query = "";
        if (searchText !== "" && searchText !== undefined) {
            if (query !== "") {
                query += " AND ";
            }
            query += "(title:" + searchText + " OR description:" + searchText + " OR snippet:" + searchText + " OR tags:" + searchText + ")";
        }
        if (typeFilter !== "all") {
            if (query !== "") {
                query += " AND ";
            }
            query += "type:" + typeFilter;
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
        return portal.queryItems(queryParams, { signal: abortController.signal });
    }

    private loginToPortal(): Promise<void> {
        const portal = this.portal!;
        return new Promise(resolve => {
            portal.load().then(() => {
                resolve();
            }, (error) => {
                console.error(error);
                resolve();
            });
        });
    }

    private addPortalItemsToModel(result: __esri.PortalQueryResult): void {
        if (result?.results) {
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
                    portalUrl: portalItem.portal.url,
                    source: "portal"
                };
            });
            this.portalItemLoaderModel.portalItems = portalItems;
        }
    }

    async addItemLayerToMap(item: any): Promise<void> {
        const model = this.portalItemLoaderModel;
        const map = this.mapWidgetModel.map;
        let layer;
        if (item.source === "portal") {
            layer = await Layer.fromPortalItem({
                portalItem: {
                    id: item.id,
                    portal: {
                        url: item.portalUrl
                    }
                }
            });
        } else if (item.source === "csw") {
            layer = await Layer.fromArcGISServerUrl(item.url);
        }
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

    private async queryCSW(portal, pagination, searchText, spaceFilter, typeFilter, sortAscending, sortByField): Promise<any> {
        const url = portal.url;
        const response = await apprtFetch(url, {
            method: "GET",
            query: {
                service: "CSW",
                version: "2.0.2",
                request: "GetRecords",
                resultType: "results",
                outputFormat: "application/xml",
                outputSchema: "http://www.opengis.net/cat/csw/2.0.2",
                startPosition: (pagination.page - 1) * pagination.rowsPerPage + 1,
                maxRecords: pagination.rowsPerPage,
                typeNames: "csw:Record",
                elementSetName: "full"//,
                // CONSTRAINTLANGUAGE: "Filter",
                // constraint_language_version: "1.1.0",
                // constraint: '<ogc:Filter xmlns:ogc="http://www.opengis.net/ogc"><ogc:PropertyIsEqualTo><ogc:PropertyName>apiso:ResourceIdentifier</ogc:PropertyName><ogc:Literal>7988c147-7523-45bb-8f18-7f39d0d20541</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter>"'
            }
        });
        if (!response.ok) {
            throw new Error("Request failed");
        }
        const text = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");
        const searchResults = xmlDoc.getElementsByTagName("csw:SearchResults")[0];
        const total = parseInt(searchResults.getAttribute("numberOfRecordsMatched")!);
        const resultsHtmlCollection = searchResults.children;
        const results = Array.from(resultsHtmlCollection);
        return {
            total: total,
            results: results
        };
    }

    private addCSWItemsToModel(result: unknown): void {
        if (result?.results) {
            let portalItems = result.results.map((cswItem) => {
                return {
                    id: this.getCswItemAttribute(cswItem, "dc:identifier"),
                    title: this.getCswItemAttribute(cswItem, "dc:title"),
                    snippet: this.getCswItemAttribute(cswItem, "dct:abstract"),
                    description: this.getCswItemAttribute(cswItem, "dc:description"),
                    thumbnailUrl: this.getCswItemAttribute(cswItem, "dc:URI", "image/png"),
                    modified: new Date(this.getCswItemAttribute(cswItem, "dc:date")),
                    type: this.getCswItemAttribute(cswItem, "dc:format"),
                    url: this.getCswItemAttribute(cswItem, "dc:URI", "ESRI:REST"),
                    itemPageUrl: this.getCswItemAttribute(cswItem, "dc:URI", "DOI"),
                    source: "csw"
                };
            });
            portalItems = portalItems.filter((item) => {
                return item.url;
            });
            this.portalItemLoaderModel.portalItems = portalItems;
        }
    }

    private getCswItemAttribute(cswItem: HTMLElement, attributeName: string, protocol: string): string | undefined {
        const elements = cswItem.getElementsByTagName(attributeName);
        if (!protocol) {
            if (elements.length) {
                return elements[0].innerHTML;
            } else {
                return undefined;
            }
        } else {
            const protocolElements = Array.from(elements);
            const element = protocolElements.find((e) => e.getAttribute("protocol") === protocol);
            return element?.innerHTML;
        }
    }

}
