/*
 * Copyright (C) 2024 con terra GmbH (info@conterra.de)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
module.exports = {
    bundleName: "Portalinhalte",
    bundleDescription: "Dieses Modul ermöglicht es Portalinhalte zu laden.",
    tool: {
        title: "Portalinhalte hinzufügen",
        tooltip: "Portalinhalte zur Karte hinzufügen"
    },
    ui: {
        all: "Alle Portale",
        addToMap: "Zur Karte hinzufügen",
        searchForItems: "Nach Inhalten suchen",
        searchForItemsPlaceholder: "Suchen nach...",
        showFilters: "Filter anzeigen",
        hideFilters: "Filter ausblenden",
        filterForPortal: "Portal auswählen",
        tags: "Tags",
        noDataText: "Keine Portalinhalte vorhanden",
        noResultsText: "Es konnten keine Portalinhalte gefunden werden",
        spaceFilter: "Wo suchen",
        spaceFilters: {
            all: "Überall",
            organisation: "Nur meine Organisation",
            "my-content": "Nur meine Inhalte"
        },
        allLayers: {
            all: "Everywhere",
            organisation: "Only my organisation",
            allLayers: "Alle Layer-Typen"
        },
        typeFilter: "Nach Typ filtern",
        sortBy: "Sortieren nach",
        sortByFields: {
            title: "Titel",
            uploaded: "Hochgeladen",
            modified: "Zuletzt bearbeitet",
            username: "Nutzername",
            created: "Erstellt",
            type: "Typ",
            owner: "Besitzer",
            "avg-rating": "Durchschnittliche Bewertung",
            "num-ratings": "Anzahl der Bewertungen",
            "num-comments": "Anzahl der Kommentare",
            "num-view": "Anzahl der Zugriffe"
        }
    }
};
