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

function defineProperties<Impl, P>(mutableDefinition: any, mutableProperties: P): Impl & Mutable<P> {
    properties(mutableDefinition, mutableProperties);
    return mutableDefinition;
}

class PortalContentModel extends Mutable { }

interface PortalContentModelProps {
    portals: any[],
    portalItems: __esri.PortalItem[],
    authenticated: boolean,
    loading: boolean,
    totalItems: number,
    rowsPerPageItems: number[],
    pagination: object,
    portalFilter: string,
    spaceFilters: any[],
    spaceFilter: "all" | "organisation" | "my-content",
    typeFilter: string,
    typeFilters: any[],
    searchText: "",
    sortAscending: boolean,
    sortByField: "modified" | "title" | "uploaded" | "username" | "created" | "type" | "owner" | "avg-rating" | "num-ratings" | "num-comments" | "num-views",
    sortByFields: any[]
}

export default defineProperties<PortalContentModel, PortalContentModelProps>(PortalContentModel, {
    portals: [],
    portalItems: [],
    authenticated: false,
    loading: false,
    totalItems: 0,
    rowsPerPageItems: [
        10,
        50,
        100
    ],
    pagination: {
        rowsPerPage: 10
    },
    portalFilter: "",
    spaceFilters: [],
    spaceFilter: "all",
    typeFilter: "all",
    typeFilters: ["Feature Service", "Vector Tile Service", "Image Service", "Scene Service", "MapService", "all"],
    searchText: "",
    sortAscending: false,
    sortByField: "modified",
    sortByFields: []
});
