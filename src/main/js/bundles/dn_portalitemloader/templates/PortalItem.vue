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
    <v-card
        class="ct-portal-item-loader-widget__portal-item-card"
    >
        <div
            class="ct-portal-item-loader-widget__portal-item-card-image"
        >
            <v-img
                v-if="item.thumbnailUrl"
                class="ct-flex-item ct-flex-item--no-grow"
                :src="item.thumbnailUrl + '&w=400'"
            />
            <v-icon
                v-else
                class="backup-icon"
                x-large
            >
                panorama
            </v-icon>
        </div>
        <div
            class="ct-portal-item-loader-widget__portal-item-card-title"
        >
            {{ item.title }}
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
            <v-btn
                block
                small
                color="primary"
                @click="$emit('load-item', item)"
            >
                <v-icon
                    left
                >
                    add
                </v-icon>
                {{ i18n.addToMap }}
            </v-btn>
            <v-btn
                icon
                small
                color="secondary"
                :href="item.itemPageUrl"
                target="_blank"
            >
                <v-icon>
                    open_in_new
                </v-icon>
            </v-btn>
        </v-card-actions>
    </v-card>
</template>
<script>
    import moment from 'moment';
    import * as intl from "esri/intl";

    export default {
        props: {
            i18n: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            item: {
                type: Object,
                default: () => {
                    return {};
                }
            }
        },
        computed: {
            modified() {
                return moment(this.item.modified).format("DD.MM.YYYY");
            },
            views() {
                const numberFormatIntlOptions = intl.convertNumberFormatToIntlOptions({
                    digitSeparator: true
                });
                return intl.formatNumber(this.item.numViews, numberFormatIntlOptions);
            }
        }
    };
</script>
