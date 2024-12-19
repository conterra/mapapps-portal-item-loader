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

import { Mutable, properties } from "apprt-core/Mutable";
import { Pagination, PortalItem, PortalType, SortByField, SpaceFilter } from "./api";

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
    rowsPerPageItems: number[],
    pagination: Pagination,
    searchText: string,
    portalFilter: string,
    selectedPortalType: PortalType,
    spaceFilter: SpaceFilter,
    spaceFilters: any[],
    typeFilter: string,
    typeFilters: any[],
    typeFiltersPortal: any[],
    typeFiltersCSW: any[],
    sortAscending: boolean,
    sortByField: SortByField,
    sortByFields: any[],
    showSortBy: boolean,
    showTypeFilter: boolean,
    showItemThumbnail: boolean,
    isMobile: boolean
}

export default defineProperties<PortalItemLoaderModel, PortalItemLoaderModelProps>(PortalItemLoaderModel, {
    portals: [],
    portalItems: [],
    authenticated: false,
    loading: false,
    totalItems: 0,
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
    selectedPortalType: "portal",
    spaceFilter: "all",
    spaceFilters: [],
    typeFilter: "",
    typeFilters: [],
    typeFiltersPortal: [],
    typeFiltersCSW: [],
    sortAscending: false,
    sortByField: "modified",
    sortByFields: [],
    showSortBy: true,
    showTypeFilter: true,
    showItemThumbnail: true,
    isMobile: false
});
