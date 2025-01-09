/*
 * Copyright (C) 2025 con terra GmbH (info@conterra.de)
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
        title: "Inhalte hinzufügen",
        tooltip: "Inhalte zur Karte hinzufügen"
    },
    ui: {
        addToMap: "Zur Karte hinzufügen",
        myServicesTitle: "Eigene Dienste",
        searchForItems: "Nach Inhalten suchen",
        searchForItemsPlaceholder: "Suche nach...",
        showFilters: "Filter anzeigen",
        hideFilters: "Filter ausblenden",
        filterForPortal: "Quelle auswählen",
        tags: "Tags",
        noDataText: "Keine Inhalte vorhanden",
        noResultsText: "Es konnten keine Inhalte gefunden werden",
        spaceFilter: "Wo suchen",
        spaceFilters: {
            all: "Überall",
            organisation: "Nur meine Organisation",
            "my-content": "Nur meine Inhalte",
            fav: "Meine Favoriten"
        },
        typeFilter: "Nach Typ filtern",
        sortBy: "Sortieren nach",
        sortByFields: {
            title: "Titel",
            uploaded: "Hochgeladen",
            modified: "Zuletzt bearbeitet",
            username: "Nutzername",
            created: "Erstellt",
            type: "Dienstetyp",
            owner: "Besitzer",
            "avg-rating": "Durchschnittliche Bewertung",
            "num-ratings": "Anzahl der Bewertungen",
            "num-comments": "Anzahl der Kommentare",
            "num-views": "Anzahl der Zugriffe"
        },
        serviceType: "Dienstetyp",
        allServiceTypes: "Alle Dienstetypen",
        owner: "Besitzer",
        views: "Anzahl der Zugriffe",
        lastUpdate: "Zuletzt bearbeitet",
        noService: "Kein Dienst",
        errors: {
            noMapappsSDI: "Für diese Funktion wird map.apps SDI benötigt. Bitte wenden Sie sich an den Administrator."
        }
    }
};
