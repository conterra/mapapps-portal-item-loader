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
        :class="{ 'no-item-thumbnail': !visibleElements.itemThumbnail,
                  'ct-portal-item-loader-widget__portal-list-item-card': true }"
    >
        <div
            v-if="visibleElements.itemThumbnail"
            class="ct-portal-item-loader-widget__portal-list-item-card-image"
        >
            <v-img
                v-if="item.thumbnailUrl"
                class="ct-portal-item-loader-widget__portal-list-item-card-thumbnail"
                :src="item.thumbnailUrl"
            />
            <v-icon
                v-else
                class="ct-portal-item-loader-widget__portal-list-item-card-backup-icon"
                x-large
            >
                panorama
            </v-icon>
        </div>
        <div class="ct-portal-item-loader-widget__portal-list-item-card-texts">
            <div
                class="ct-portal-item-loader-widget__portal-list-item-card-title"
            >
                {{ item.title }}
            </div>
            <div
                class="ct-portal-item-loader-widget__portal-list-item-card-snippet"
            >
                {{ item.snippet }}
            </div>
            <div
                class="ct-portal-item-loader-widget__portal-list-item-card-type"
            >
                {{ item.type }}
            </div>
        </div>
        <div
            class="ct-portal-item-loader-widget__portal-list-item-card-actions"
        >
            <v-btn
                :disabled="!item.url"
                block
                small
                color="primary"
                @click="$emit('load-item', item)"
            >
                <v-icon>
                    add
                </v-icon>
            </v-btn>
            <v-btn
                v-if="item.itemPageUrl"
                block
                small
                color="secondary"
                :href="item.itemPageUrl"
                target="_blank"
            >
                <v-icon>
                    open_in_new
                </v-icon>
            </v-btn>
        </div>
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
                        modified: true
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
