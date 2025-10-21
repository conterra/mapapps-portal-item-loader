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
    <v-card
        :class="{ 'no-item-thumbnail': !visibleElements.itemThumbnail, 'ct-portal-item-loader-widget__portal-item-card': true }"
    >
        <div
            v-if="visibleElements.itemThumbnail"
            class="ct-portal-item-loader-widget__portal-item-card-image"
        >
            <v-img
                v-if="item.thumbnailUrl"
                class="ct-portal-item-loader-widget__portal-item-card-thumbnail"
                :src="item.thumbnailUrl"
            />
            <v-icon
                v-else
                class="ct-portal-item-loader-widget__portal-item-card-backup-icon"
                x-large
            >
                panorama
            </v-icon>
        </div>
        <div class="ct-portal-item-loader-widget__portal-item-card-title-container">
            <v-tooltip top>
                <template #activator="{ on }">
                    <div
                        class="ct-portal-item-loader-widget__portal-item-card-title"
                        v-on="on"
                    >
                        {{ item.title }}
                    </div>
                </template>
                <span>{{ item.title }}</span>
            </v-tooltip>
            <v-tooltip top>
                <template #activator="{ on }">
                    <v-icon
                        v-if="item.authoritative"
                        class="ct-portal-item-loader-widget__portal-item-card-authoritative-icon"
                        color="green"
                        small
                        v-on="on"
                    >
                        verified_user
                    </v-icon>
                </template>
                <span>{{ i18n.authorativeItemTooltip }}</span>
            </v-tooltip>
            <v-tooltip top>
                <template #activator="{ on }">
                    <v-icon
                        v-if="item.deprecated"
                        class="ct-portal-item-loader-widget__portal-item-card-deprecated-icon"
                        color="red"
                        small
                        v-on="on"
                    >
                        block
                    </v-icon>
                </template>
                <span>{{ i18n.deprecatedItemTooltip }}</span>
            </v-tooltip>
        </div>
        <div
            class="ct-portal-item-loader-widget__portal-item-card-snippet"
        >
            {{ item.snippet }}
        </div>
        <div
            class="ct-portal-item-loader-widget__portal-item-card-list"
        >
            <v-list dense>
                <v-list-tile
                    v-if="item.type && visibleElements.serviceType"
                    avatar
                >
                    <v-list-tile-avatar>
                        <v-tooltip bottom>
                            <template #activator="{ on }">
                                <v-icon
                                    v-on="on"
                                >
                                    category
                                </v-icon>
                            </template>
                            <span>{{ i18n.serviceType }}</span>
                        </v-tooltip>
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                        <v-list-tile-title>{{ item.type }}</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-list-tile
                    v-if="item.owner && visibleElements.owner"
                    avatar
                >
                    <v-list-tile-avatar>
                        <v-tooltip bottom>
                            <template #activator="{ on }">
                                <v-icon
                                    v-on="on"
                                >
                                    person
                                </v-icon>
                            </template>
                            <span>{{ i18n.owner }}</span>
                        </v-tooltip>
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                        <v-list-tile-title>{{ item.owner }}</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-list-tile
                    v-if="views !== 'NaN' && visibleElements.views"
                    avatar
                >
                    <v-list-tile-avatar>
                        <v-tooltip bottom>
                            <template #activator="{ on }">
                                <v-icon
                                    v-on="on"
                                >
                                    visibility
                                </v-icon>
                            </template>
                            <span>{{ i18n.views }}</span>
                        </v-tooltip>
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                        <v-list-tile-title>{{ views }}</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-list-tile
                    v-if="modified && visibleElements.modified"
                    avatar
                >
                    <v-list-tile-avatar>
                        <v-tooltip bottom>
                            <template #activator="{ on }">
                                <v-icon
                                    v-on="on"
                                >
                                    update
                                </v-icon>
                            </template>
                            <span>{{ i18n.lastUpdate }}</span>
                        </v-tooltip>
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                        <v-list-tile-title>{{ modified }}</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>
        </div>
        <v-card-actions
            class="ct-portal-item-loader-widget__portal-item-card-actions"
        >
            <v-tooltip top>
                <template #activator="{ on }">
                    <v-btn
                        :disabled="!item.url"
                        class="ct-portal-item-loader-widget__portal-item-add-to-map-button"
                        block
                        small
                        color="primary"
                        @click="$emit('load-item', item)"
                        v-on="on"
                    >
                        <v-icon
                            left
                        >
                            add
                        </v-icon>
                        {{ i18n.addToMap }}
                    </v-btn>
                </template>
                <span>{{ i18n.addToMap }}</span>
            </v-tooltip>
            <v-tooltip
                v-if="visibleElements.advancedLayerAdding"
                top
            >
                <template #activator="{ on }">
                    <v-btn
                        :disabled="!item.url"
                        class="ct-portal-item-loader-widget__portal-item-add-to-map-advanced-button"
                        icon
                        small
                        color="primary"
                        @click="$emit('load-item-advanced', item)"
                        v-on="on"
                    >
                        <v-icon>
                            add_card
                        </v-icon>
                    </v-btn>
                </template>
                <span>{{ i18n.addToMapAdvanced }}</span>
            </v-tooltip>
            <v-tooltip top>
                <template #activator="{ on }">
                    <v-btn
                        v-if="item.itemPageUrl"
                        class="ct-portal-item-loader-widget__portal-item-details-button"
                        icon
                        small
                        color="secondary"
                        :href="item.itemPageUrl"
                        target="_blank"
                        v-on="on"
                    >
                        <v-icon>
                            open_in_new
                        </v-icon>
                    </v-btn>
                </template>
                <span>{{ i18n.detailButtonTooltip }}</span>
            </v-tooltip>
        </v-card-actions>
    </v-card>
</template>
<script lang="ts">
    import moment from 'moment';
    import * as intl from "esri/intl";
    import { PortalItem, VisibleElements } from "../api";

    export default {
        props: {
            i18n: {
                type: Object,
                default: (): any => {
                    return {};
                }
            },
            item: {
                type: Object as () => PortalItem,
                default: (): PortalItem => {
                    return {
                        id: '',
                        title: '',
                        snippet: '',
                        description: '',
                        thumbnailUrl: '',
                        tags: [],
                        owner: '',
                        numViews: 0,
                        created: new Date(),
                        modified: new Date(),
                        type: '',
                        url: '',
                        itemPageUrl: '',
                        portalUrl: '',
                        source: "portal"
                    };
                }
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
                        modified: true,
                        advancedLayerAdding: false
                    };
                }
            }
        },
        computed: {
            modified(): string | undefined {
                const modified = moment(this.item.modified);
                if(modified.isValid()) {
                    return moment(modified).format("DD.MM.YYYY");
                } else {
                    return undefined;
                }
            },
            views(): string {
                const numberFormatIntlOptions = intl.convertNumberFormatToIntlOptions({
                    digitSeparator: true
                });
                return intl.formatNumber(this.item.numViews, numberFormatIntlOptions);
            }
        }
    };
</script>
