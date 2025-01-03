# dn_portalitemloader

This bundle allows to add portal or csw content to your map.apps app.

## Usage

1. First you need to add the bundle dn_mapapps-portal-item-loader to your app.
2. Next, configure your portals as described in the configuration section below.

To make the functions of this bundle available to the user, the following tool can be added to a toolset:

| Tool ID                    | Component                  | Description              |
| -------------------------- | -------------------------- | ------------------------ |
| portalItemLoaderToggleTool | PortalItemLoaderToggleTool | Show or hide the widget. |

### Configure your portals

Sample

```json
"dn_portalitemloader": {
    "Config": {
        "portals": [
            {
                "id": "living_atlas",
                "title": "ArcGIS Living Atlas",
                "url": "https://arcgis.com",
                "type": "portal",
                "filter": "group:47dd57c9a59d458c86d3d6b978560088",
                "authMode": "auto"
            },
            {
                "id": "gdi_de",
                "title": "GDI-DE",
                "url": "https://gdk.gdi-de.org/gdi-de/srv/ger/csw",
                "type": "csw",
                "filter": "<ogc:PropertyIsEqualTo><ogc:PropertyName>dc:type</ogc:PropertyName><ogc:Literal>service</ogc:Literal></ogc:PropertyIsEqualTo>",
                "itemPageUrl": "https://gdk.gdi-de.org/gdi-de/srv/ger/catalog.search#/metadata/{id}",
                "showSortBy": true,
                "showTypeFilter": true,
                "showItemThumbnail": false
            }
        ]
    }
}
```

| Property          | Type           | Possible Values                                                                 | Default    | Description                                                                          |
| ----------------- | -------------- | ------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------ |
| id                | String         |                                                                                 |            | The unique identifier of the portal.                                                 |
| title             | String         |                                                                                 |            | The title of the portal.                                                             |
| url               | String         |                                                                                 |            | The URL of the portal.                                                               |
| type              | PortalType     | ```portal```  &#124; ```csw```                                                  |            | The type of the portal.                                                              |
| filter            | PortalAuthMode |                                                                                 |            | The predefined filter of the portal.                                                 |
| authMode          | PortalAuthMode | ```auto``` &#124; ```anonymous``` &#124; ```immediate``` &#124; ```no-prompt``` |            | The authentication mode of the portal. Only applicable for portals of type 'portal'. |
| itemPageUrl       | String         |                                                                                 |            | The URL of the item page. Only applicable for portals of type 'csw'.                 |
| showSortBy        | Boolean        | ```true```  &#124; ```false```                                                  | ```true``` | Indicates whether to show the sort by option.                                        |
| showTypeFilter    | Boolean        | ```true```  &#124; ```false```                                                  | ```true``` | Indicates whether to show the type filter.                                           |
| showItemThumbnail | Boolean        | ```true```  &#124; ```false```                                                  | ```true``` | Indicates whether to show item thumbnails.                                           |

### Configurable Components of dn_portalitemloader:

#### Config
```

"dn_portalitemloader": {
    "Config": {
        "portals": [
            {
                "id": "living_atlas",
                "title": "ArcGIS Living Atlas",
                "url": "https://arcgis.com",
                "type": "portal",
                "filter": "group:47dd57c9a59d458c86d3d6b978560088",
                "authMode": "auto"
            },
            {
                "id": "gdi_de",
                "title": "GDI-DE",
                "url": "https://gdk.gdi-de.org/gdi-de/srv/ger/csw",
                "type": "csw",
                "filter": "<ogc:PropertyIsEqualTo><ogc:PropertyName>dc:type</ogc:PropertyName><ogc:Literal>service</ogc:Literal></ogc:PropertyIsEqualTo>",
                "itemPageUrl": "https://gdk.gdi-de.org/gdi-de/srv/ger/catalog.search#/metadata/{id}",
                "showSortBy": true,
                "showTypeFilter": true,
                "showItemThumbnail": false
            }
        ],
        "rowsPerPageItems": [
            25,
            50,
            100
        ],
        "pagination": {
            "rowsPerPage": 25
        }
    }
}
```
| Property         | Type   | Possible Values | Default                                   | Description                                                                          |
| ---------------- | ------ | --------------- | ----------------------------------------- | ------------------------------------------------------------------------------------ |
| portals          | Object |                 |                                           | A list of portals available for selection.                                           |
| rowsPerPageItems | Array  |                 | ```25``` &#124; ```50``` &#124; ```100``` | An array of possible values for the number of rows displayed per page.               |
| pagination       | Object |                 | "rowsPerPage": ```25```                   | Configuration object for pagination, specifying the default number of rows per page. |






