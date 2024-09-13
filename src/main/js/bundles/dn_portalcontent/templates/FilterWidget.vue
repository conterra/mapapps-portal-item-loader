<!--

    Copyright (C) 2024 con terra GmbH (info@conterra.de)

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

            http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

-->
<template>
    <v-container
        fluid
        grid-list-md
        pa-1
        class="filter-widget"
    >
        <v-select
            v-if="portals.length>1"
            v-model="localPortalFilter"
            class="pb-2"
            item-value="id"
            item-text="title"
            prepend-inner-icon="filter"
            :items="portals"
            :label="i18n.filterForPortal"
            hide-details
        />
        <v-text-field
            v-model="localSearchText"
            class="pb-2"
            clearable
            prepend-inner-icon="search"
            :label="i18n.searchForItems"
            :placeholder="i18n.searchForItemsPlaceholder"
            hide-details
        />
        <v-select
            v-model="localSpaceFilter"
            class="pb-2"
            item-value="id"
            item-text="title"
            prepend-inner-icon="filter"
            :items="spaceFilters"
            :label="i18n.spaceFilter"
            hide-details
        />
        <div class="ct-flex-container">
            <div class="ct-flex-item">
                <v-select
                    v-model="localSortByField"
                    class="pb-2"
                    item-value="id"
                    item-text="title"
                    prepend-inner-icon="sort"
                    :items="sortByFields"
                    :label="i18n.sortBy"
                    hide-details
                />
            </div>
            <div class="ct-flex-item ct-flex-item--no-grow">
                <v-btn
                    icon
                    flat
                    class="sort-ascending-button"
                    color="primary"
                    @click="localSortAscending=!localSortAscending"
                >
                    <v-icon
                        v-if="localSortAscending"
                        left
                    >
                        arrow_downward
                    </v-icon>
                    <v-icon
                        v-else
                        left
                    >
                        arrow_upward
                    </v-icon>
                </v-btn>
            </div>
        </div>
    </v-container>
</template>
<script>
    export default {
        props: {
            i18n: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            portals: {
                type: Array,
                default: () => []
            },
            searchText: {
                type: String,
                default: ""
            },
            portalFilter: {
                type: String,
                default: ""
            },
            spaceFilters: {
                type: Array,
                default: () => []
            },
            spaceFilter: {
                type: String,
                default: "all"
            },
            sortAscending: {
                type: Boolean,
                default: false
            },
            sortByField: {
                type: String,
                default: "modified"
            },
            sortByFields: {
                type: Array,
                default: () => []
            }
        },
        computed: {
            localSearchText: {
                get: function () {
                    return this.searchText;
                },
                set: function (searchText) {
                    this.$emit("update:search-text", searchText);
                }
            },
            localPortalFilter: {
                get: function () {
                    return this.portalFilter;
                },
                set: function (portalFilter) {
                    this.$emit("update:portal-filter", portalFilter);
                }
            },
            localSortByField: {
                get: function () {
                    return this.sortByField;
                },
                set: function (sortByField) {
                    this.$emit("update:sort-by-field", sortByField);
                }
            },
            localSortAscending: {
                get: function () {
                    return this.sortAscending;
                },
                set: function (sortAscending) {
                    this.$emit("update:sort-ascending", sortAscending);
                }
            },
            localSpaceFilter: {
                get: function () {
                    return this.spaceFilter;
                },
                set: function (spaceFilter) {
                    this.$emit("update:space-filter", spaceFilter);
                }
            }
        }
    };
</script>
