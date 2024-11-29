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
        class="portal-item-card ct-flex-container ct-flex-container--column fullHeight"
    >
        <a
            :href="item.itemPageUrl"
            target="_blank"
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
        </a>
        <v-card-title
            class="ct-flex-item ct-flex-item--no-grow"
        >
            <h4 class="text-truncate">
                {{ item.title }}
            </h4>
        </v-card-title>
        <v-card-text
            class="ct-flex-item py-0"
        >
            <v-list dense>
                <v-list-tile
                    avatar
                    inactive
                >
                    <v-list-tile-avatar>
                        <v-icon>
                            category
                        </v-icon>
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                        <v-list-tile-title>{{ item.type }}</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-list-tile
                    avatar
                >
                    <v-list-tile-avatar>
                        <v-icon>
                            person
                        </v-icon>
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                        <v-list-tile-title>{{ item.owner }}</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-list-tile
                    avatar
                >
                    <v-list-tile-avatar>
                        <v-icon>
                            visibility
                        </v-icon>
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                        <v-list-tile-title>{{ item.numViews }}</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-list-tile
                    avatar
                >
                    <v-list-tile-avatar>
                        <v-icon>
                            more_time
                        </v-icon>
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                        <v-list-tile-title>{{ created }}</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
                <v-list-tile
                    avatar
                >
                    <v-list-tile-avatar>
                        <v-icon>
                            update
                        </v-icon>
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                        <v-list-tile-title>{{ modified }}</v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
            </v-list>
            <div class="item-text">
                {{ item.snippet }}
            </div>
        </v-card-text>
        <v-card-actions
            class="ct-flex-item ct-flex-item--no-grow ct-flex-item--no-shrink"
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
            created() {
                return moment(this.item.created).format("DD.MM.YYYY, HH:mm:ss");
            },
            modified() {
                return moment(this.item.modified).format("DD.MM.YYYY, HH:mm:ss");
            }
        }
    };
</script>
