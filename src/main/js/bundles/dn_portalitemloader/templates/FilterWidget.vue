<!--

    Copyright (C) 2025 con terra GmbH (info@conterra.de)

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
    <div
        pa-0
        class="ct-portal-item-loader-widget__portal-item-filter"
    >
        <v-toolbar :extended="filterVisible">
            <v-text-field
                v-model="localSearchText"
                clearable
                prepend-inner-icon="search"
                :label="i18n.searchForItems"
                :placeholder="i18n.searchForItemsPlaceholder"
                hide-details
                class="ct-portal-item-loader-widget__portal-item-filter-search"
            />
            <v-spacer />
            <v-select
                v-if="portals.length>1"
                v-model="localPortalFilter"
                item-value="id"
                item-text="title"
                prepend-inner-icon="filter"
                :items="portals"
                :label="i18n.filterForPortal"
                hide-details
                class="ct-portal-item-loader-widget__portal-item-filter-portal-select"
            />
            <v-btn
                v-if="isMobile"
                icon
                flat
                :disabled="!filterAvailable"
                :input-value="filterVisible"
                :color="filterVisible ? 'primary' : undefined"
                @click="filterVisible=!filterVisible"
            >
                <v-icon>
                    filter_alt
                </v-icon>
            </v-btn>
            <v-btn
                v-else
                flat
                :disabled="!filterAvailable"
                :input-value="filterVisible"
                :color="filterVisible ? 'primary' : undefined"
                @click="filterVisible=!filterVisible"
            >
                {{ filterText }}
                <v-icon right>
                    filter_alt
                </v-icon>
            </v-btn>
            <template
                v-if="filterVisible && filterAvailable"
                #extension
            >
                <div
                    v-if="filterVisible && filterAvailable"
                    class="ct-portal-item-loader-widget__portal-item-filter-container"
                >
                    <v-select
                        v-if="authenticated && selectedPortalType==='portal'"
                        v-model="localSpaceFilter"
                        class="pb-2"
                        item-value="id"
                        item-text="title"
                        prepend-inner-icon="filter"
                        :items="spaceFilters"
                        :label="i18n.spaceFilter"
                        hide-details
                    />
                    <v-select
                        v-if="typeFilters.length && showTypeFilter"
                        v-model="localTypeFilter"
                        class="pb-2"
                        item-value="id"
                        item-text="title"
                        prepend-inner-icon="filter"
                        :items="typeFilters"
                        :label="i18n.typeFilter"
                        hide-details
                    />
                    <div
                        v-if="showSortBy"
                        class="ct-flex-container"
                    >
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
                                    arrow_upward
                                </v-icon>
                                <v-icon
                                    v-else
                                    left
                                >
                                    arrow_downward
                                </v-icon>
                            </v-btn>
                        </div>
                    </div>
                </div>
            </template>
        </v-toolbar>
    </div>
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
            authenticated: {
                type: Boolean,
                default: false
            },
            searchText: {
                type: String,
                default: ""
            },
            portalFilter: {
                type: String,
                default: ""
            },
            selectedPortalType: {
                type: String,
                default: ""
            },
            spaceFilter: {
                type: String,
                default: "all"
            },
            spaceFilters: {
                type: Array,
                default: () => []
            },
            typeFilter: {
                type: String,
                default: () => ""
            },
            typeFilters: {
                type: Array,
                default: () => []
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
            },
            showSortBy: {
                type: Boolean,
                default: true
            },
            showTypeFilter: {
                type: Boolean,
                default: true
            },
            isMobile: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                filterVisible: false
            };
        },
        computed: {
            allTypesSelected() {
                return this.typeFilter.length === this.typeFilters.length;
            },
            filterText() {
                if(this.filterVisible) {
                    return this.i18n.hideFilters;
                } else {
                    return this.i18n.showFilters;
                }
            },
            filterAvailable() {
                return this.authenticated || (this.typeFilters.length && this.showTypeFilter) || this.showSortBy;
            },
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
            },
            localTypeFilter: {
                get: function () {
                    return this.typeFilter;
                },
                set: function (typeFilter) {
                    this.$emit("update:type-filter", typeFilter);
                }
            }
        },
        methods: {
            toggle () {
                this.$nextTick(() => {
                    if (this.allTypesSelected) {
                        this.localTypeFilter = [];
                    } else {
                        this.localTypeFilter = this.typeFilters.map((type)=>type.id);
                    }
                });
            }
        }
    };
</script>
