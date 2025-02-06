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
            :is-mobile="isMobile"
            :visible-elements="visibleElements"
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
                    :visible-elements="visibleElements"
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
                    :visible-elements="visibleElements"
                    @load-item="$emit('load-item', $event)"
                />
            </template>
        </v-data-iterator>
    </div>
</template>
<script lang="ts">
    import Bindable from "apprt-vue/mixins/Bindable";
    import PortalItemVue from "./PortalItem.ts.vue";
    import PortalListItem from "./PortalListItem.ts.vue";
    import FilterWidget from "./FilterWidget.ts.vue";
    import { Portal, PortalItem, PortalType, SpaceFilter, TypeFilter, VisibleElements, Pagination, Layout } from "../api";

    export default {
        components: {
            "portal-item": PortalItemVue,
            "portal-list-item": PortalListItem,
            "filter-widget": FilterWidget
        },
        mixins: [Bindable],
        props: {
            i18n: {
                type: Object,
                default: (): Object => {
                    return {};
                }
            },
            layout: {
                type: String as () => Layout,
                default: "grid"
            },
            portalItems: {
                type: Array,
                default: (): Array<PortalItem> => []
            },
            portals: {
                type: Array,
                default: (): Array<Portal> => []
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
                default: (): Array<number> => [
                    10,
                    50,
                    100
                ]
            },
            pagination: {
                type: Object,
                default: (): Pagination => {
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
                type: String as () => PortalType,
                default: "portal"
            },
            spaceFilter: {
                type: String as () => SpaceFilter,
                default: "all"
            },
            spaceFilters: {
                type: Array,
                default: (): Array<SpaceFilter> => []
            },
            typeFilter: {
                type: String,
                default: (): string => ""
            },
            typeFilters: {
                type: Array,
                default: (): Array<TypeFilter> => []
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
                default: (): Array<string> => []
            },
            isMobile: {
                type: Boolean,
                default: false
            },
            visibleElements: {
                type: Object as () => VisibleElements,
                default: (): VisibleElements => {
                    return {
                        sortBy: true,
                        typeFilter: true,
                        itemThumbnail: true,
                        serviceType: true,
                        owner: true,
                        views: true,
                        modified: true
                    };
                }
            }
        }
    };
</script>
