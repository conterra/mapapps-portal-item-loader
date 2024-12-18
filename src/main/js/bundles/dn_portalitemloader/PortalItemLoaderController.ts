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
import { apprtFetch } from "apprt-fetch";
import * as intl from "esri/intl";
import { Pagination, SortByField, SpaceFilter, PortalItem } from "./api";

export default class PortalItemLoaderWidgetController {

    private readonly i18n: MapWidgetModel;
    private readonly mapWidgetModel: MapWidgetModel;
    private readonly portalItemLoaderModel: typeof PortalItemLoaderModel;
    private readonly logService: any;
    private readonly addLayerService: any;
    private readonly serviceToWizardAdder: any;
    private lastTimeout: any;
    private abortController: AbortController | undefined;
    private portal: __esri.Portal | undefined;

    constructor(i18n: any, mapWidgetModel: MapWidgetModel,
        portalItemLoaderModel: typeof PortalItemLoaderModel, logService: any,
        addLayerService: any, serviceToWizardAdder: any) {
        this.i18n = i18n;
        this.mapWidgetModel = mapWidgetModel;
        this.logService = logService;
        this.addLayerService = addLayerService;
        this.serviceToWizardAdder = serviceToWizardAdder;
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

    queryPortalItems(pagination: Pagination, searchText: string, spaceFilter: SpaceFilter, typeFilter: string,
        sortAscending: boolean,
        sortByField: SortByField): void {
        const model = this.portalItemLoaderModel;
        const portal = this.portal!;
        clearTimeout(this.lastTimeout);
        this.lastTimeout = setTimeout(() => {
            model.loading = true;
            if (this.abortController) {
                this.abortController.abort();
            }
            if (portal.declaredClass === "esri.portal.Portal") {
                const promise = this.queryPortal(portal, pagination,
                    searchText, spaceFilter, typeFilter, sortAscending, sortByField);
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
                    this.queryCSW(portal, pagination, searchText, typeFilter, sortAscending, sortByField);
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
        let portal: __esri.Portal;
        const selectedPortal = model.portals.find((portalConfig) => portalConfig.id === portalId);
        model.selectedPortalType = selectedPortal.type;
        if (selectedPortal.showSortBy === false) {
            model.showSortBy = false;
        } else {
            model.showSortBy = true;
        }
        if (selectedPortal.showTypeFilter === false) {
            model.showTypeFilter = false;
        } else {
            model.showTypeFilter = true;
        }
        if (selectedPortal.showItemThumbnail === false) {
            model.showItemThumbnail = false;
        } else {
            model.showItemThumbnail = true;
        }
        if (selectedPortal.type === "portal") {
            model.typeFilters = model.typeFiltersPortal;
            portal = this.portal = new Portal({ url: selectedPortal.url, authMode: selectedPortal.authMode || "auto" });
            portal.load().then(() => {
                if (portal.user) {
                    model.authenticated = true;
                } else {
                    model.authenticated = false;
                }
            });
        } else if (selectedPortal.type === "csw") {
            model.typeFilters = model.typeFiltersCSW;
            portal = this.portal = selectedPortal;
        }
        model.spaceFilter = "all";
        model.typeFilter = "all";
    }

    private async queryPortal(portal: __esri.Portal, pagination: Pagination,
        searchText: string, spaceFilter: SpaceFilter, typeFilter: string,
        sortAscending: boolean, sortByField: SortByField): Promise<__esri.PortalQueryResult> {
        const model = this.portalItemLoaderModel;
        const selectedPortal = model.portals.find((portalConfig) => portalConfig.id === model.portalFilter);
        const page = pagination.page!;
        const rowsPerPage = pagination.rowsPerPage;

        await this.loginToPortal();
        let filter = "typeKeywords:Service";
        if (selectedPortal.filter) {
            filter += ` AND ${selectedPortal.filter}`;
        }
        switch (spaceFilter) {
            case "all":
            case "fav":
                break;
            case "organisation":
                filter += ` AND orgid:"${portal.user.orgId}`;
                break;
            case "my-content":
                filter += ` AND owner:${portal.user.username}`;
                break;

        }
        if (spaceFilter === "fav") {
            filter += ` AND group:${portal.user.favGroupId}`;
        }
        let query = "";
        if (searchText !== "" && searchText !== undefined) {
            if (query !== "") {
                query += " AND ";
            }
            query += `(title:${searchText} OR description:${searchText} OR snippet:${searchText} OR ` +
                `tags:${searchText})`;
        }
        if (typeFilter !== "all") {
            if (query !== "") {
                query += " AND ";
            }
            query += `type:${typeFilter}`;
        }
        const queryParams: __esri.PortalQueryParamsProperties = {
            query: query,
            sortField: sortByField,
            sortOrder: sortAscending ? "asc" : "desc",
            filter: filter,
            num: rowsPerPage,
            start: (page - 1) * rowsPerPage + 1
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
            let filteredPortalItems = result.results.filter((result) => result.isLayer);
            filteredPortalItems = filteredPortalItems.map((portalItem) => {
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
            this.portalItemLoaderModel.portalItems = filteredPortalItems;
        }
    }

    async addItemLayerToMap(item: PortalItem): Promise<void> {
        const model = this.portalItemLoaderModel;
        const map = this.mapWidgetModel.map;
        let root;
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
            try {
                layer = await Layer.fromArcGISServerUrl(item.url);
            } catch (error) {
                console.error(error);
            }
        }
        if (layer) {
            if (this.addLayerService) {
                this.addLayerService.addLayerToMap(layer);
                console.info("PortalItemLoader: Used sdi_loadservice to add layer to map");
            } else {
                root = map.findLayerById(model.rootId) as __esri.GroupLayer;
                if (!root) {
                    root = new GroupLayer({
                        id: model.rootId,
                        title: model.rootTitle || model.rootId
                    });
                }
                map.add(root);
                root.add(layer);
                console.info("PortalItemLoader: Used default esri methods to add layer to map");
            }
        } else if (this.serviceToWizardAdder) {
            this.serviceToWizardAdder.addService(item.url);
        } else {
            console.error("PortalItemLoader: ServiceToWizardAdder not available. Layer count not be added to map. Please add sdi_loadservice to app.");
            this.logService.warn(this.i18n.errors.noMapappsSDI);
        }
    }

    private async queryCSW(portal: Portal, pagination: Pagination, searchText: string,
        typeFilter: string, sortAscending: boolean, sortByField: SortByField): Promise<any> {
        const url = portal.url;
        if (!searchText) {
            searchText = "";
        }
        const model = this.portalItemLoaderModel;
        const selectedPortal = model.portals.find((portalConfig) => portalConfig.id === model.portalFilter);
        const page = pagination.page!;
        const rowsPerPage = pagination.rowsPerPage;

        let sortBy;
        if (selectedPortal.showSortBy) {
            sortBy = this.getCSWSortBy(sortAscending, sortByField);
        }

        const response = await apprtFetch(url, {
            method: "GET",
            query: {
                service: "CSW",
                version: "2.0.2",
                request: "GetRecords",
                resultType: "results",
                outputFormat: "application/xml",
                outputSchema: "http://www.opengis.net/cat/csw/2.0.2",
                startPosition: (page - 1) * rowsPerPage + 1,
                maxRecords: rowsPerPage,
                SortBy: sortBy,
                typeNames: "csw:Record",
                elementSetName: "full",
                CONSTRAINTLANGUAGE: "FILTER",
                CONSTRAINT_LANGUAGE_VERSION: "1.1.0",
                Constraint: this.getCSWFilter(searchText, typeFilter, selectedPortal)
            }
        });
        if (!response.ok) {
            throw new Error("Request failed");
        }
        const text = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");
        const exeptionElement = xmlDoc.getElementsByTagName("ExceptionText");
        if (exeptionElement.length) {
            const errorText = exeptionElement[0].innerHTML;
            console.error(errorText);
            this.logService.warn(errorText);
            return {
                total: 0,
                results: []
            };
        }
        const searchResults = xmlDoc.getElementsByTagName("csw:SearchResults")[0];
        const total = parseInt(searchResults.getAttribute("numberOfRecordsMatched")!);
        const resultsHtmlCollection = searchResults.children;
        const results = Array.from(resultsHtmlCollection);
        return {
            total: total,
            results: results
        };
    }

    private getCSWSortBy(sortAscending: boolean, sortByField: string) {
        let cswSortByField;
        switch (sortByField) {
            case "modified":
                cswSortByField = "modified";
                break;
            case "title":
                cswSortByField = "title";
                break;
            case "created":
                cswSortByField = "created";
                break;
            case "type":
                cswSortByField = "type";
                break;
            case "owner":
                cswSortByField = "owner";
                break;
            case "avg-rating":
                cswSortByField = "avgrating";
                break;
            case "num-rating":
                cswSortByField = "numratings";
                break;
            case "num-comments":
                cswSortByField = "numcomments";
                break;
            case "num-views":
                cswSortByField = "numViews";
                break;
            default:
                cswSortByField = "modified";
                break;
        }
        const order = sortAscending ? "A" : "D";
        return `${cswSortByField}:${order}`;
    }

    private getCSWFilter(searchText: string, typeFilter: string, selectedPortal: any) {
        let constraint = `<ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">`;
        if (selectedPortal.filter || typeFilter !== "all") {
            constraint += `<ogc:And>`;
        }
        if (selectedPortal.filter) {
            constraint += selectedPortal.filter;
        }
        if (typeFilter !== "all") {
            constraint += `<ogc:PropertyIsEqualTo>`;
            constraint += `<ogc:PropertyName>OnlineResourceType</ogc:PropertyName>`;
            constraint += `<ogc:Literal>${typeFilter}</ogc:Literal>`;
            constraint += `</ogc:PropertyIsEqualTo>`;
        }
        constraint += `<ogc:PropertyIsLike wildCard="*" singleChar="?" escapeChar="\\">`;
        constraint += `<ogc:PropertyName>AnyText</ogc:PropertyName><ogc:Literal>*${searchText}*</ogc:Literal>`;
        constraint += `</ogc:PropertyIsLike>`;
        if (selectedPortal.filter || typeFilter !== "all") {
            constraint += `</ogc:And>`;
        }
        constraint += `</ogc:Filter>`;
        return constraint;
    }

    private addCSWItemsToModel(result: unknown): void {
        const model = this.portalItemLoaderModel;
        const selectedPortal = model.portals.find((portalConfig) => portalConfig.id === model.portalFilter);
        if (result?.results) {
            const portalItems = result.results.map((cswItem: any) => {
                const id = this.getCswItemAttribute(cswItem, "dc:identifier");
                // handle modified date
                let modified = this.getCswItemAttribute(cswItem, "dct:modified");
                let modifiedDate;
                if (!modified) {
                    modified = this.getCswItemAttribute(cswItem, "dc:date");
                }
                if (modified) {
                    modifiedDate = new Date(modified);
                }
                // handle url and type
                let type = this.i18n.noService;
                const esriUrl = this.getCswItemAttribute(cswItem, "dc:URI", "ESRI:REST");
                if (esriUrl)
                    type = "ESRI";
                const wmsUrl = this.getCswItemAttribute(cswItem, "dc:URI", "OGC:WMS");
                if (wmsUrl)
                    type = "WMS";
                const wfsUrl = this.getCswItemAttribute(cswItem, "dc:URI", "OGC:WMS");
                if (esriUrl)
                    type = "WFS";
                const url = esriUrl || wmsUrl || wfsUrl;
                // handle item page url
                let itemPageUrl = this.getCswItemAttribute(cswItem, "dc:URI", "DOI");
                if (selectedPortal.itemPageUrl) {
                    itemPageUrl = intl.substitute(selectedPortal.itemPageUrl, { id: id });
                }
                return {
                    id: id,
                    title: this.getCswItemAttribute(cswItem, "dc:title"),
                    snippet: this.getCswItemAttribute(cswItem, "dct:abstract") || this.getCswItemAttribute(cswItem, "dc:description"),
                    description: this.getCswItemAttribute(cswItem, "dc:description"),
                    thumbnailUrl: this.getCswItemAttribute(cswItem, "dc:URI", "image/png"),
                    modified: modifiedDate,
                    type: type,
                    url: url,
                    itemPageUrl: itemPageUrl,
                    source: "csw"
                };
            });
            this.portalItemLoaderModel.portalItems = portalItems;
        }
    }

    private getCswItemAttribute(cswItem: HTMLElement, attributeName: string, protocol?: string): string | undefined {
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
