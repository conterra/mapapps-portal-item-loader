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

import { Mutable, properties } from "apprt-core/Mutable";
import { Layout, Pagination, PortalItem, PortalType, SortByField, SpaceFilter, VisibleElements, TypeFilter } from "./api";

function defineProperties<Impl, P>(mutableDefinition: any, mutableProperties: P): Impl & Mutable<P> {
    properties(mutableDefinition, mutableProperties);
    return mutableDefinition;
}

class PortalItemLoaderModel extends Mutable { }

interface PortalItemLoaderModelProps {
    portals: any[],
    portalItems: PortalItem[],
    authenticated: boolean,
    loading: boolean,
    totalItems: number,
    layout: Layout,
    rowsPerPageItems: number[],
    pagination: Pagination,
    searchText: string,
    portalFilter: string,
    selectedPortalId: string | undefined,
    selectedPortalType: PortalType,
    spaceFilter: SpaceFilter,
    spaceFilters: any[],
    spaceFiltersPortal: any[],
    typeFilter: string,
    typeFilters: TypeFilter[],
    typeFiltersPortal: TypeFilter[],
    typeFiltersCSW: TypeFilter[],
    sortAscending: boolean,
    sortByField: SortByField,
    sortByFields: any[],
    isMobile: boolean,
    hideCswContentWithoutService: boolean
    visibleElements: VisibleElements,
    useMapAppsSdiWizardAdderForPortalItems: boolean
}

export default defineProperties<PortalItemLoaderModel, PortalItemLoaderModelProps>(PortalItemLoaderModel, {
    portals: [],
    portalItems: [],
    authenticated: false,
    loading: false,
    totalItems: 0,
    layout: "grid",
    rowsPerPageItems: [
        25,
        50,
        100
    ],
    pagination: {
        rowsPerPage: 25
    },
    searchText: "",
    portalFilter: "",
    selectedPortalId: undefined,
    selectedPortalType: "portal",
    spaceFilter: "all",
    spaceFilters: [],
    spaceFiltersPortal: [],
    typeFilter: "",
    typeFilters: [],
    typeFiltersPortal: [],
    typeFiltersCSW: [],
    sortAscending: false,
    sortByField: "modified",
    sortByFields: [],
    isMobile: false,
    hideCswContentWithoutService: true,
    visibleElements: {
        sortBy: true,
        typeFilter: true,
        itemThumbnail: true,
        serviceType: true,
        owner: true,
        views: true,
        modified: true,
        advancedLayerAdding: false
    },
    useMapAppsSdiWizardAdderForPortalItems: true
});
