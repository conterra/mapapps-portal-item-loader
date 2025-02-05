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

import Portal from "esri/portal/Portal";
import Layer from "esri/layers/Layer";
import MapWidgetModel from "map-widget/MapWidgetModel";
import PortalItemLoaderModel from "./PortalItemLoaderModel";
import GroupLayer from "esri/layers/GroupLayer";
import { apprtFetch } from "apprt-fetch";
import * as intl from "esri/intl";
import { Pagination, SortByField, SpaceFilter, PortalItem, VisibleElements } from "./api";

export default class PortalItemLoaderWidgetController {

    private readonly _i18n!: MapWidgetModel;
    private readonly _mapWidgetModel!: MapWidgetModel;
    private readonly _portalItemLoaderModel!: typeof PortalItemLoaderModel;
    private readonly _logService: any;
    private readonly _addLayerService: any;
    private readonly _serviceToWizardAdder: any;
    private readonly _componentContext: any;
    private defaultVisibleElements!: VisibleElements;
    private lastTimeout: any;
    private abortController: AbortController | undefined;
    private portal: __esri.Portal | undefined;
    private i18n: any;

    activate(): void {
        this.i18n = this._i18n.get().ui;
        const model = this._portalItemLoaderModel;
        this.defaultVisibleElements = model.visibleElements;
        model.portalFilter = model.portals[0].id;
        model.isMobile = this.isMobile();
        this.changeSelectedPortal(model.portalFilter);

        model.watch("portalFilter", ({ value }) => {
            // delete current results
            model.portalItems = [];
            // set new portal
            this.changeSelectedPortal(value);
            this.queryPortalItems(model.pagination, model.searchText, model.spaceFilter, model.typeFilter,
                model.sortAscending, model.sortByField);
        });

        model.watch("searchText", ({ value }) => {
            this.queryPortalItems(model.pagination, value, model.spaceFilter, model.typeFilter,
                model.sortAscending, model.sortByField);
        });

        model.watch("pagination", ({ value }) => {
            this.queryPortalItems(value, model.searchText, model.spaceFilter, model.typeFilter,
                model.sortAscending, model.sortByField);
        });

        model.watch("spaceFilter", ({ value }) => {
            this.queryPortalItems(model.pagination, model.searchText, value, model.typeFilter,
                model.sortAscending, model.sortByField);
        });

        model.watch("typeFilter", ({ value }) => {
            this.queryPortalItems(model.pagination, model.searchText, model.spaceFilter, value,
                model.sortAscending, model.sortByField);
        });

        model.watch("sortAscending", ({ value }) => {
            this.queryPortalItems(model.pagination, model.searchText, model.spaceFilter, model.typeFilter,
                value, model.sortByField);
        });

        model.watch("sortByField", ({ value }) => {
            this.queryPortalItems(model.pagination, model.searchText, model.spaceFilter, model.typeFilter,
                model.sortAscending, value);
        });
    }

    queryPortalItems(pagination: Pagination, searchText: string, spaceFilter: SpaceFilter, typeFilter: string,
        sortAscending: boolean,
        sortByField: SortByField): void {
        const model = this._portalItemLoaderModel;
        const portal = this.portal;
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

    private async changeSelectedPortal(portalId: string): Promise<void> {
        const model = this._portalItemLoaderModel;
        let portal: __esri.Portal;
        const selectedPortal = model.portals.find((portalConfig) => portalConfig.id === portalId);
        model.selectedPortalType = selectedPortal.type;
        if (selectedPortal.visibleElements) {
            model.visibleElements = JSON.parse(JSON.stringify(selectedPortal.visibleElements));
        } else {
            model.visibleElements = this.defaultVisibleElements;
        }
        // fallback for old properties
        if (selectedPortal.showSortBy !== undefined) {
            model.visibleElements.sortBy = selectedPortal.showSortBy;
        }
        if (selectedPortal.showTypeFilter !== undefined) {
            model.visibleElements.typeFilter = selectedPortal.showTypeFilter;
        }
        if (selectedPortal.showItemThumbnail !== undefined) {
            model.visibleElements.itemThumbnail = selectedPortal.showItemThumbnail;
        }
        // end of fallback
        if (selectedPortal.type === "portal") {
            portal = this.portal = new Portal({ url: selectedPortal.url, authMode: selectedPortal.authMode || "auto" });
            portal.load().then(() => {
                if (portal.user) {
                    model.authenticated = true;
                } else {
                    model.authenticated = false;
                }
            });
            await portal.load();
            model.typeFilters = model.typeFiltersPortal;
            if (portal.isPortal) {
                model.spaceFilters = model.spaceFiltersPortal;
            }
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
        const model = this._portalItemLoaderModel;
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
                filter += ` AND orgid:${portal.user.orgId}`;
                break;
            case "living-atlas":
                filter += ` AND owner:esri_livingatlas`;
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
            let filteredPortalItems = result.results.filter((result: __esri.PortalItem) => result.isLayer);
            filteredPortalItems = filteredPortalItems.map((portalItem: __esri.PortalItem) => {
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
            this._portalItemLoaderModel.portalItems = filteredPortalItems;
        }
    }

    async addItemLayerToMap(item: PortalItem): Promise<void> {
        const model = this._portalItemLoaderModel;
        const map = this._mapWidgetModel.map;
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
            if (this._addLayerService) {
                this._addLayerService.addLayerToMap(layer);
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
        } else if (this._serviceToWizardAdder) {
            this._serviceToWizardAdder.addService(item.url);
        } else {
            console.error("PortalItemLoader: ServiceToWizardAdder not available. Layer count not be added to map. Please add sdi_loadservice to app.");
            this._logService.warn(this.i18n.errors.noMapappsSDI);
        }
    }

    private async queryCSW(portal: Portal, pagination: Pagination, searchText: string,
        typeFilter: string, sortAscending: boolean, sortByField: SortByField): Promise<any> {
        const url = portal.url;
        if (!searchText) {
            searchText = "";
        }
        const model = this._portalItemLoaderModel;
        const selectedPortal = model.portals.find((portalConfig) => portalConfig.id === model.portalFilter);
        const page = pagination.page!;
        const rowsPerPage = pagination.rowsPerPage;

        let sortBy;
        if (selectedPortal.showSortBy || selectedPortal.visibleElements.sortBy) {
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
            this._logService.warn(errorText);
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
        const model = this._portalItemLoaderModel;
        const selectedPortal = model.portals.find((portalConfig) => portalConfig.id === model.portalFilter);
        if (result?.results) {
            const portalItems: PortalItem[] = [];
            result.results.forEach((cswItem: any) => {
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
                let type;
                const esriUrl = this.getCswItemAttribute(cswItem, "dc:URI", "protocol", "ESRI:REST");
                const wmsUrl = this.getCswItemAttribute(cswItem, "dc:URI", "protocol", "OGC:WMS") || this.getCswItemAttribute(cswItem, "dc:URI", undefined, "WMS");
                const wfsUrl = this.getCswItemAttribute(cswItem, "dc:URI", "protocol", "OGC:WFS") || this.getCswItemAttribute(cswItem, "dc:URI", undefined, "WFS");
                if (esriUrl) {
                    type = "ESRI";
                } else if (wmsUrl) {
                    type = "WMS";
                } else if (wfsUrl) {
                    type = "WFS";
                }
                if (!type) {
                    if (model.hideCswContentWithoutService) {
                        return;
                    } else {
                        type = this.i18n.noService;
                    }
                }
                let url = esriUrl || wmsUrl || wfsUrl;
                if (url) {
                    url = this.htmlDecode(url);
                }
                // handle item page url
                let itemPageUrl = this.getCswItemAttribute(cswItem, "dc:URI", "protocol", "DOI");
                if (selectedPortal.itemPageUrl) {
                    itemPageUrl = intl.substitute(selectedPortal.itemPageUrl, { id: id });
                }
                portalItems.push({
                    id: id,
                    title: this.getCswItemAttribute(cswItem, "dc:title"),
                    snippet: this.getCswItemAttribute(cswItem, "dct:abstract") || this.getCswItemAttribute(cswItem, "dc:description"),
                    description: this.getCswItemAttribute(cswItem, "dc:description"),
                    thumbnailUrl: this.getCswItemAttribute(cswItem, "dc:URI", "protocol", "image/png"),
                    modified: modifiedDate,
                    type: type,
                    url: url,
                    itemPageUrl: itemPageUrl,
                    source: "csw"
                });
            });
            this._portalItemLoaderModel.portalItems = portalItems;
        }
    }

    private getCswItemAttribute(cswItem: HTMLElement, attributeName: string,
        contentName?: string, value?: string): string | undefined {
        const elements = cswItem.getElementsByTagName(attributeName);
        if (!contentName) {
            if (elements.length) {
                const innerHTML = elements[0].innerHTML;
                if (value && innerHTML.includes(value)) {
                    return innerHTML;
                } else if (!value) {
                    return innerHTML;
                } else {
                    return undefined;
                }
            } else {
                return undefined;
            }
        } else if (value) {
            const protocolElements = Array.from(elements);
            const element = protocolElements.find((e) => e.getAttribute(contentName)?.includes(value));
            return element?.innerHTML;
        } else {
            return undefined;
        }
    }

    private isMobile(): boolean {
        const envs = this._componentContext.getBundleContext().getCurrentExecutionEnvironment();
        return envs.some((env: any) => {
            let mobile = false;
            const mobileEnvs = ["Mobile", "Android", "iPhone"];
            mobileEnvs.forEach((mobileEnv) => {
                if (env.name === mobileEnv) {
                    mobile = true;
                }
            });
            return mobile;
        });
    }

    private htmlDecode(input: string): string | undefined {
        const doc = new DOMParser().parseFromString(input, "text/html");
        return doc.documentElement.textContent ? doc.documentElement.textContent : undefined;
    }

}
