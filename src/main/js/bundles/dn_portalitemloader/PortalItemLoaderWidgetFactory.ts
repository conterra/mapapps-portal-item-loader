///
/// Copyright (C) 2024 con terra GmbH (info@conterra.de)
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

import type { InjectedReference } from "apprt-core/InjectedReference";
import Vue from "apprt-vue/Vue";
import VueDijit from "apprt-vue/VueDijit";
import Binding from "apprt-binding/Binding";
import MapWidgetModel from "map-widget/MapWidgetModel";
import PortalItemLoaderController from "./PortalItemLoaderController";
import PortalItemLoaderModel from "./PortalItemLoaderModel";
import PortalItemLoaderWidget from "./templates/PortalItemLoaderWidget.vue";

export default class PortalItemLoaderWidgetFactory {

    private readonly _i18n!: InjectedReference<any>;
    private readonly _mapWidgetModel!: InjectedReference<MapWidgetModel>;
    private readonly _portalItemLoaderModel!: InjectedReference<typeof PortalItemLoaderModel>;
    private readonly _logService!: InjectedReference<any>;
    private readonly _addLayerService!: InjectedReference<any>;
    private readonly _serviceToWizardAdder!: InjectedReference<any>;
    private controller: PortalItemLoaderController;
    private vm: Vue;
    private binding: Binding;

    activate(): void {
        this.initComponent();
        const i18n = this._i18n.get().ui;
        this.controller = new PortalItemLoaderController(i18n, this._mapWidgetModel,
            this._portalItemLoaderModel, this._logService, this._addLayerService, this._serviceToWizardAdder);
    }

    deactivate(): void {
        this.binding.unbind();
        this.binding = undefined;
    }

    createInstance(): any {
        const controller = this.controller;
        const widget = VueDijit(this.vm, { class: "ct-portal-item-loader-widget" });

        widget.activateTool = async () => {
            this.binding.enable().syncToLeftNow();
            const model = this._portalItemLoaderModel!;
            controller.queryPortalItems(model.pagination, model.portalFilter, model.searchText,
                model.spaceFilter, model.sortAscending, model.sortByField);

            this.vm.$on("load-item", (item: any) => {
                controller.addItemLayerToMap(item);
            });
        };
        widget.deactivateTool = () => {
            this.binding.disable();
            this.vm.$off();
        };

        widget.own({
            remove() {
                this.binding.unbind();
                this.binding = undefined;
                this.vm.$off();
            }
        });
        return widget;
    }

    private initComponent(): void {
        const vm = this.vm = new Vue(PortalItemLoaderWidget);
        const model = this._portalItemLoaderModel!;
        vm.i18n = this._i18n.get().ui;
        vm.pagination = model.pagination;
        vm.rowsPerPageItems = model.rowsPerPageItems;
        vm.portals = model.portals;
        vm.spaceFilters = model.spaceFilters;
        vm.typeFilter = model.typeFilter;
        vm.sortByFields = model.sortByFields;
        vm.sortByField = model.sortByField;

        this.binding = Binding.for(vm, model)
            .syncAll("portalFilter", "typeFilter")
            .syncAllToLeft("selectedPortalType", "portalItems", "totalItems", "loading", "authenticated", "enableSortBy", "enableItemThumbnail", "typeFilters")
            .syncAllToRight("pagination", "searchText", "sortByField", "sortAscending", "spaceFilter");
    }

}
