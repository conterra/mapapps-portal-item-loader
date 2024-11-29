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
import PortalContentController from "./PortalContentController";
import PortalContentModel from "./PortalContentModel";
import PortalContentWidget from "./templates/PortalContentWidget.vue";

export default class PortalContentWidgetFactory {

    private readonly _i18n!: InjectedReference<any>;
    private readonly _mapWidgetModel!: InjectedReference<MapWidgetModel>;
    private readonly _portalContentModel!: InjectedReference<typeof PortalContentModel>;
    private controller: PortalContentController;
    private vm: Vue;
    private binding: Binding;

    activate(): void {
        this.initComponent();
        const i18n = this._i18n.get().ui;
        this.controller = new PortalContentController(i18n, this._mapWidgetModel, this._portalContentModel);
    }

    deactivate(): void {
        this.binding.unbind();
        this.binding = undefined;
    }

    createInstance(): any {
        const controller = this.controller;
        const widget = VueDijit(this.vm, { class: "ct-portal-content-widget" });

        widget.activateTool = async () => {
            this.binding.enable().syncToLeftNow();
            const model = this._portalContentModel;
            controller.queryPortalItems(model.pagination, model.portalFilter, model.searchText,
                model.spaceFilter, model.sortAscending, model.sortByField);

            this.vm.$on("load-item", (item) => {
                controller.addPortalItemLayerToMap(item);
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
        const vm = this.vm = new Vue(PortalContentWidget);
        const model = this._portalContentModel;
        vm.i18n = this._i18n.get().ui;
        vm.pagination = model.pagination;
        vm.rowsPerPageItems = model.rowsPerPageItems;
        vm.portals = model.portals;
        vm.spaceFilters = model.spaceFilters;
        vm.typeFilters = model.typeFilters;
        vm.sortByField = model.sortByField;
        vm.sortByFields = model.sortByFields;

        this.binding = Binding.for(vm, model)
            .syncAll("portalFilter")
            .syncAllToLeft("portalItems", "totalItems", "loading", "authenticated")
            .syncAllToRight("pagination", "searchText", "sortByField", "sortAscending", "spaceFilter", "typeFilter");
    }

}
