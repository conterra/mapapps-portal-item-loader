/*
 * Copyright (C) 2025 con terra GmbH (info@conterra.de)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
module.exports = {
    root: {
        bundleName: "Portal Content",
        bundleDescription: "This bundle provides access to portal content.",
        tool: {
            title: "Add content",
            tooltip: "Add content to map"
        },
        ui: {
            addToMap: "Add to map",
            myServicesTitle: "My Services",
            searchForItems: "Search for items",
            searchForItemsPlaceholder: "Search for...",
            showFilters: "Show filters",
            hideFilters: "Hide filters",
            filterForPortal: "Select source",
            tags: "Tags",
            noDataText: "No items",
            noResultsText: "No items found",
            spaceFilter: "Where to search",
            spaceFilters: {
                all: "Everywhere",
                organisation: "Only my organisation",
                "my-content": "Only my content",
                fav: "My favourites"
            },
            typeFilter: "What type to search",
            sortBy: "Sort by",
            sortByFields: {
                title: "Title",
                uploaded: "Uploaded",
                modified: "Modified",
                username: "Username",
                created: "Created",
                type: "Type",
                owner: "Owner",
                "avg-rating": "Average rating",
                "num-ratings": "Number of ratings",
                "num-comments": "Number of comments",
                "num-views": "Number of views"
            },
            serviceType: "Service type",
            allServiceTypes: "All service types",
            owner: "Owner",
            views: "Number of views",
            lastUpdate: "Last update",
            noService: "No Service",
            errors: {
                noMapappsSDI: "For this function, map.apps SDI is required. Please contact the administrator."
            }
        }
    },
    de: true
};

