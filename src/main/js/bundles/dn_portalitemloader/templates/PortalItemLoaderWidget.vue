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
    <div class="ct-portal-item-loader-widget__main">
        <div
            class="ct-portal-item-loader-widget__portal-item-filter"
        >
            <filter-widget
                :i18n="i18n"
                :portals="portals"
                :authenticated="authenticated"
                :space-filters="spaceFilters"
                :type-filters="typeFilters"
                :sort-by-fields="sortByFields"
                :search-text.sync="searchText"
                :portal-filter.sync="portalFilter"
                :space-filter.sync="spaceFilter"
                :type-filter.sync="typeFilter"
                :sort-ascending.sync="sortAscending"
                :sort-by-field.sync="sortByField"
            />
        </div>
        <v-data-iterator
            :items="portalItems"
            :total-items="totalItems"
            :rows-per-page-items="rowsPerPageItems"
            :pagination.sync="pagination"
            :loading="loading"
            :no-results-text="i18n.noResultsText"
            :no-data-text="i18n.noDataText"
            content-tag="div"
            content-class="ct-portal-item-loader-widget__portal-item-gallery-content"
            class="ct-portal-item-loader-widget__portal-item-gallery"
        >
            <template
                #header
            >
                <div
                    class="loading-indicator"
                >
                    <v-progress-linear
                        v-show="loading"
                        :indeterminate="true"
                        class="pa-0 ma-0"
                    />
                </div>
            </template>
            <template
                #item="props"
            >
                <div
                    class="portal-flex-item"
                >
                    <portal-item
                        :i18n="i18n"
                        :item="props.item"
                        @load-item="$emit('load-item', $event)"
                    />
                </div>
            </template>
        </v-data-iterator>
    </div>
</template>
<script>
    import Bindable from "apprt-vue/mixins/Bindable";
    import PortalItem from "./PortalItem.vue";
    import FilterWidget from "./FilterWidget.vue";

    export default {
        components: {
            "portal-item": PortalItem,
            "filter-widget": FilterWidget
        },
        mixins: [Bindable],
        props: {
            i18n: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            portalItems: {
                type: Array,
                default: () => []
            },
            portals: {
                type: Array,
                default: () => []
            },
            authenticated: {
                type: Boolean,
                default: false
            },
            loading: {
                type: Boolean,
                default: false
            },
            totalItems: {
                type: Number,
                default: 0
            },
            rowsPerPageItems: {
                type: Array,
                default: () => [
                    10,
                    50,
                    100
                ]
            },
            pagination: {
                type: Object,
                default: () => {
                    return {
                        "rowsPerPage": 10
                    };
                }
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
            typeFilters: {
                type: Array,
                default: () => []
            },
            typeFilter: {
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
        data() {
            return {
            };
        },
        methods: {
            filterItems: function (items, search) {
                return items.filter(r => this.customFilter(r, search));
            },
            customFilter: function (object, search) {
                const searchString = search.toLowerCase();
                let portalFilter = false;
                let searchFilter = false;
                if (this.portalFilter.length) {
                    portalFilter = this.portalFilter.some((portalId)=>{
                        const portal = this.portals.find((p) => p.id === portalId);
                        if (portal.url === object?.portal?.url) {
                            return true;
                        }
                    });
                } else {
                    portalFilter = true;
                }
                if (object.title?.toLowerCase().includes(searchString)) {
                    searchFilter = true;
                }
                if (portalFilter && searchFilter) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    };
</script>
