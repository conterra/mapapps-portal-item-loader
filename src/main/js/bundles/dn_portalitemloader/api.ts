export type SpaceFilter = "all" | "organisation" | "my-content" | "fav";

export type SortByField = "modified" | "title" | "uploaded" | "username" | "created" | "type" | "owner" | "avg-rating" | "num-ratings" | "num-comments" | "num-views"

export type PortalAuthMode = "auto" | "anonymous" | "immediate" | "no-prompt";

export type PortalType = "portal" | "csw";

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
    enableSortBy: boolean,
    enableItemThumbnail: boolean
}

export interface Pagination {
    descending: boolean,
    page: number,
    rowsPerPage: number,
    totalItems: number
}
