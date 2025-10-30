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

import { InjectedReference } from "apprt-core/InjectedReference";
import Portal from "esri/portal/Portal";
import Layer from "esri/layers/Layer";
import MapWidgetModel from "map-widget/MapWidgetModel";
import PortalItemLoaderModel from "./PortalItemLoaderModel";
import GroupLayer from "esri/layers/GroupLayer";
import { apprtFetch } from "apprt-fetch";
import * as intl from "esri/intl";
import { Pagination, SortByField, SpaceFilter, PortalItem, VisibleElements } from "./api";
import async from "apprt-core/async";

export default class PortalItemLoaderWidgetController {

    private readonly _i18n!: InjectedReference<any>;
    private readonly _mapWidgetModel!: InjectedReference<MapWidgetModel>;
    private _portalItemLoaderModel!: InjectedReference<typeof PortalItemLoaderModel>;
    private readonly _logService: InjectedReference<any>;
    private readonly _addLayerService: InjectedReference<any>;
    private readonly _loadServiceAdder: InjectedReference<any>;
    private readonly _componentContext: InjectedReference<any>;
    private readonly _tocToggleTool: InjectedReference<any>;
    private readonly _tocWidget: InjectedReference<any>;
    private defaultVisibleElements!: VisibleElements;
    private lastTimeout: any;
    private abortController: AbortController | undefined;
    private portal: __esri.Portal | undefined;
    private portalUserGroups: __esri.PortalGroup[];
    private i18n: any;

    activate(): void {
        this.i18n = this._i18n.get().ui;
        const model = this._portalItemLoaderModel!;
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
        const model = this._portalItemLoaderModel!;
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

    public async changeSelectedPortal(portalId: string): Promise<void> {
        const model = this._portalItemLoaderModel!;
        let portal: __esri.Portal;
        const selectedPortal = model.portals.find((portalConfig) => portalConfig.id === portalId);
        if (!selectedPortal) {
            console.error("Selected portal not found");
            return;
        }
        model.selectedPortalId = portalId;
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
                    portal.user.fetchGroups().then((groups: __esri.PortalGroup[]) => {
                        this.portalUserGroups = groups;
                    });
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
        const model = this._portalItemLoaderModel!;
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
            case "my-groups":
                if (this.portalUserGroups.length > 0) {
                    this.portalUserGroups.forEach((group, index) => {
                        if (index > 0) {
                            filter += ` OR group:${group.id}`;
                        } else {
                            filter += ` AND (group:${group.id}`;
                        }
                    });
                    filter += `)`;
                }
                break;

        }
        if (spaceFilter === "fav") {
            filter += ` AND group:${portal.user.favGroupId}`;
        }
        let query = "";
        if (searchText !== null && searchText !== undefined && searchText !== "") {
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
                    authoritative: portalItem.sourceJSON.contentStatus &&
                        typeof portalItem.sourceJSON.contentStatus === 'string' &&
                        portalItem.sourceJSON.contentStatus.toLowerCase().includes('authoritative'),
                    deprecated: portalItem.sourceJSON.contentStatus &&
                        typeof portalItem.sourceJSON.contentStatus === 'string' &&
                        portalItem.sourceJSON.contentStatus.toLowerCase().includes('deprecated'),
                    source: "portal"
                };
            });
            this._portalItemLoaderModel!.portalItems = filteredPortalItems;
        }
    }

    async addItemLayerToMap(item: PortalItem, advancedLayerAdding?: boolean): Promise<void> {
        const model = this._portalItemLoaderModel!;
        const map = this._mapWidgetModel!.map;
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
        if (this._loadServiceAdder && (advancedLayerAdding || ((model.useMapAppsSdiWizardAdderForPortalItems && item.source === "portal") || item.source === "csw"))) {
            this._loadServiceAdder.addService(item.url);
        } else if (layer) {
            root = map.findLayerById(model.rootId) as __esri.GroupLayer;
            if (!root) {
                root = new GroupLayer({
                    id: model.rootId,
                    title: model.rootTitle || model.rootId
                });
                root.isLoadServiceRoot = true;
            }
            map.add(root);
            root.add(layer);
            console.info("PortalItemLoader: Used default esri methods to add layer to map");
            this._logService.info(`${item.title} ${this.i18n.addedToMap}`);

            // highlight layer in toc
            await layer.load();
            if (this._tocToggleTool && this._tocWidget) {
                this._tocToggleTool.set("active", true);
                this.openEveryLayer(layer);
                async(() => {
                    this.highlightTocEntry(layer);
                }, 100);
            }
        } else {
            console.error("PortalItemLoader: ServiceToWizardAdder not available. Layer could not be added to map. Please add sdi_loadservice to app.");
            this._logService.warn(this.i18n.errors.noMapappsSDI);
        }
    }

    private async queryCSW(portal: Portal, pagination: Pagination, searchText: string,
        typeFilter: string, sortAscending: boolean, sortByField: SortByField): Promise<any> {
        const url = portal.url;
        if (!searchText) {
            searchText = "";
        }
        const model = this._portalItemLoaderModel!;
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
        const model = this._portalItemLoaderModel!;
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
                const wmsUrl = this.getCswItemAttribute(cswItem, "dc:URI", "protocol", "OGC:WMS") || this.getCswItemAttribute(cswItem, "dc:URI", "protocol", "OGC Web Map Service") || this.getCswItemAttribute(cswItem, "dc:URI", undefined, "WMS");
                const wfsUrl = this.getCswItemAttribute(cswItem, "dc:URI", "protocol", "OGC:WFS") || this.getCswItemAttribute(cswItem, "dc:URI", "protocol", "OGC Web Feature Service") || this.getCswItemAttribute(cswItem, "dc:URI", undefined, "WFS");
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
                    id: id!,
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
            model.portalItems = portalItems;
        }
    }

    private getCswItemAttribute(cswItem: HTMLElement, attributeName: string,
        contentName?: string, value?: string): string | undefined {
        const elements = cswItem.getElementsByTagName(attributeName);
        if (!contentName) {
            if (elements.length) {
                let result;
                Array.from(elements).forEach((element) => {
                    if (value && element.innerHTML.includes(value)) {
                        result = element.innerHTML;
                    } else if (!value) {
                        result = element.innerHTML;
                    }
                });
                if (result) {
                    return result;
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

    /**
     * Function used to recursively make all parent layers of a layer visible
     *
     * @param layer Esri Layer which has to made visible, including all parents
     */
    private openEveryLayer(layer: any): void {
        // set visible property to true
        layer.visible = true;

        // get toc model item and set open to true
        const tocModelItem = this.getTocModelItem(layer.uid);
        if (tocModelItem) {
            tocModelItem.open = true;
        }

        // if layer has parent call method again
        if (layer.parent) {
            this.openEveryLayer(layer.parent);
        }
    }

    private getTocModelItem(uid: any): object {
        const tocWidget = this._tocWidget;
        const vm = tocWidget.getVM();
        const operationalRoot: any = vm.operationalRoot;

        let tocItem: any;
        operationalRoot.visitTree((it: { reference: { uid: any; }; }) => {
            if (it.reference.uid === uid) {
                tocItem = it;
            }
        });

        return tocItem;
    }

    private highlightTocEntry(layer: any): void {
        const scrollDelay = 500;
        const tocEntryHiglightTime = 5000;

        // highlight layer entry in toc
        const tocItemUid: string = this.buildUID(layer);
        const cssValidId: string = tocItemUid.replace(/[^_a-zA-Z0-9-]/g, '_');
        const domElementList: HTMLCollectionOf<Element> = document.getElementsByClassName("ct-toc__layer-tree-item--" + cssValidId);
        const domElement: Element = domElementList.length ? domElementList[0] : undefined;
        domElement?.classList.add("highlight");
        // scroll to highlighted layer
        async(() => {
            const rect = domElement.getBoundingClientRect();
            if (rect.top < 0 || rect.bottom > window.innerHeight) {
                domElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
        }, scrollDelay);
        // remove highlight from layer entry after a configurable time
        async(() => {
            domElement?.classList.remove("highlight");
        }, tocEntryHiglightTime);
    }

    /**
     * Method copied from TocItemsToMapSync file in mapapps.
     *
     * @param layerOrSublayer
     * @returns {string|*}
     * @private
     */
    private buildUID(layerOrSublayer: { id: string; layer: any; }): string | undefined {
        if (!layerOrSublayer) {
            return;
        }
        const localId: string = layerOrSublayer.id;
        if (!this.isSublayer(layerOrSublayer)) {
            // assumed to be unique
            return localId;
        }
        const uidOfSublayersRoot: string = this.buildUID(layerOrSublayer.layer) || "defaultUID";
        return uidOfSublayersRoot + "$" + localId;
    }

    private isSublayer(layer: { hasOwnProperty: (arg0: string) => any; }): boolean {
        // eslint-disable-next-line no-prototype-builtins
        return layer.hasOwnProperty("layer");
    }

    public setModel(model: typeof PortalItemLoaderModel): void {
        this._portalItemLoaderModel = model;
    }

}
