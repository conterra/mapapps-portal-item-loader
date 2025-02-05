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

export type SpaceFilter = "all" | "organisation" | "my-content" | "living-atlas" | "fav";

export type SortByField = "modified" | "title" | "uploaded" | "username" | "created" | "type" | "owner" | "avg-rating" | "num-ratings" | "num-comments" | "num-views"

export type PortalAuthMode = "auto" | "anonymous" | "immediate" | "no-prompt";

export type PortalType = "portal" | "csw";

export type Layout = "grid" | "list";

export interface PortalItem {
    id: string,
    title: string,
    snippet: string,
    description: string,
    thumbnailUrl: string,
    tags: string[],
    owner: string,
    numViews: number,
    created: Date,
    modified: Date,
    type: string,
    url: string,
    itemPageUrl: string,
    portalUrl: string,
    source: PortalType
}

export interface Portal {
    id: string,
    title: string,
    url: string,
    type: PortalType,
    // only for type portal
    authMode: PortalAuthMode,
    filter: string,
    // only for type csw
    itemPageUrl: string
    visibleElements: VisibleElements,
}

export interface Pagination {
    descending?: boolean,
    page?: number,
    rowsPerPage: number,
    totalItems?: number
}

export interface VisibleElements {
    sortBy: boolean,
    typeFilter: boolean,
    itemThumbnail: boolean,
    serviceType: boolean,
    owner: boolean,
    views: boolean,
    modified: boolean
}

export interface TypeFilter {
    id: string,
    title: string
}
