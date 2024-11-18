/*
 * Copyright (C) 2024 con terra GmbH (info@conterra.de)
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
            title: "Add Portal content",
            tooltip: "Add Portal content to map"
        },
        ui: {
            all: "All portals",
            addToMap: "Add to map",
            searchForItems: "Search for items",
            searchForItemsPlaceholder: "Search for...",
            filterForPortal: "Select portal",
            tags: "Tags",
            noDataText: "No portal items",
            noResultsText: "No portal items found",
            spaceFilter: "Where to search",
            spaceFilters: {
                all: "Everywhere",
                organisation: "Only my organisation",
                "my-content": "Only my content"
            },
            allLayers: {
                all: "Everywhere",
                organisation: "Only my organisation",
                allLayers: "All layer types"
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
                "num-view": "Number of views"
            }
        }
    },
    de: true
};

