///
/// Copyright (C) 2025 con terra GmbH (info@conterra.de)
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///         http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

import type { ActionDefinition } from "toc/api";
import { TocItem } from "toc/model/TocItem";

const ID = "portal-item-link";

export default class PortalItemLinkActionDefinitionFactory {
    private _i18n: any;

    private readonly supportedIds: Array<string>;

    constructor() {
        this.supportedIds = [ID];
    }

    public createDefinitionById(id: string): ActionDefinition | undefined {
        if (ID !== id) {
            return;
        }
        const i18n = this._i18n.get().ui;
        return {
            id: ID,
            type: "button",
            label: i18n.linkActionTitle,
            icon: "material-icon-open_in_new",

            isVisibleForItem(tocItem: TocItem): boolean {
                const ref = tocItem.ref;
                return ref.portalItem;
            },

            trigger(tocItem: TocItem): void {
                const ref = tocItem.ref;
                const url = ref.portalItem.itemPageUrl;
                window.open(url, "_blank");
            }
        };
    }
}
