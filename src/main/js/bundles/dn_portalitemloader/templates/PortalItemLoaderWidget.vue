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
    <div class="ct-portal-item-loader-widget__main">
        <filter-widget
            :i18n="i18n"
            :layout.sync="layout"
            :portals="portals"
            :authenticated="authenticated"
            :space-filters="spaceFilters"
            :type-filters="typeFilters"
            :sort-by-fields="sortByFields"
            :search-text.sync="searchText"
            :portal-filter.sync="portalFilter"
            :selected-portal-type.sync="selectedPortalType"
            :space-filter.sync="spaceFilter"
            :type-filter.sync="typeFilter"
            :sort-ascending.sync="sortAscending"
            :sort-by-field.sync="sortByField"
            :show-sort-by="showSortBy"
            :show-type-filter="showTypeFilter"
            :is-mobile="isMobile"
        />
        <v-data-iterator
            v-if="layout==='grid'"
            :items="portalItems"
            :total-items="totalItems"
            :rows-per-page-items="rowsPerPageItems"
            :pagination.sync="pagination"
            :loading="loading"
            :no-results-text="i18n.noResultsText"
            :no-data-text="i18n.noDataText"
            content-tag="div"
            CCCCcontent-class="ct-portal-item-loader-widget__portal-grid-item-gallery-content"
            content-class="ct-portal-item-loader-widget__portal-item-gallery ct-portal-item-loader-widget__portal-item-gallery--grid-view"
            class="ct-portal-item-loader-widget__portal-item-gallery"
        >
            <template
                #header
            >
                <div
                    class="ct-portal-item-loader-widget__loading-indicator"
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
                <portal-item
                    :i18n="i18n"
                    :item="props.item"
                    :show-item-thumbnail="showItemThumbnail"
                    @load-item="$emit('load-item', $event)"
                />
            </template>
        </v-data-iterator>
        <v-data-iterator
            v-else-if="layout==='list'"
            :items="portalItems"
            :total-items="totalItems"
            :rows-per-page-items="rowsPerPageItems"
            :pagination.sync="pagination"
            :loading="loading"
            :no-results-text="i18n.noResultsText"
            :no-data-text="i18n.noDataText"
            content-tag="div"
            CCCcontent-class="ct-portal-item-loader-widget__portal-list-item-gallery-content"
            content-class="ct-portal-item-loader-widget__portal-item-gallery ct-portal-item-loader-widget__portal-item-gallery--list-view"
            class="ct-portal-item-loader-widget__portal-item-gallery"
        >
            <template
                #header
            >
                <div
                    class="ct-portal-item-loader-widget__loading-indicator"
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
                <portal-list-item
                    :i18n="i18n"
                    :item="props.item"
                    :show-item-thumbnail="showItemThumbnail"
                    @load-item="$emit('load-item', $event)"
                />
            </template>
        </v-data-iterator>
    </div>
</template>
<script>
    import Bindable from "apprt-vue/mixins/Bindable";
    import PortalItem from "./PortalItem.vue";
    import PortalListItem from "./PortalListItem.vue";
    import FilterWidget from "./FilterWidget.vue";

    export default {
        components: {
            "portal-item": PortalItem,
            "portal-list-item": PortalListItem,
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
            layout: {
                type: String,
                default: "grid"
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
            showItemThumbnail: {
                type: Boolean,
                default: true
            },
            isMobile: {
                type: Boolean,
                default: false
            }
        },
        watch: {
            layout(value) {
                console.warn(value);
            }
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
