# dn_portalitemloader

This bundle allows to add portal content

## Usage

1. First you need to add the bundle dn_mapapps-portal-item-loader to your app.
2. Then you can configure it.
3. The last thing you need to do is add the portalContentToggleTool 



### Configurable Components of dn_portalitemloader:

#### ActivateLayerAction
```

"dn_portalitemloader": {
    "Config": {
          "portals": [
                    {
                        "id": "arcgis",
                        "title": "ArcGIS Online",
                        "url": "https://arcgis.com"
                    }
                ],
                "rowsPerPageItems": [
                    10,
                    25,
                    50,
                    100
                ],
                "pagination": {
                    "rowsPerPage": 10
                },
                "spaceFilters": [
                    {
                        "id": "all",
                        "title": "${ui.spaceFilters.all}"
                    },
                    {
                        "id": "organisation",
                        "title": "${ui.spaceFilters.organisation}"
                    },
                    {
                        "id": "my-content",
                        "title": "${ui.spaceFilters.my-content}"
                    }
                ],
                "spaceFilter": "all",
                "typeFilters": [
                    "Feature Service",
                    "Vector Tile Service",
                    "Image Service",
                    "Scene Service",
                    "MapService"
                ],
                "typeFilter": "all",
                "sortAscending": false,
                "sortByField": "modified",
                "sortByFields": [
                    {
                        "id": "modified",
                        "title": "${ui.sortByFields.modified}"
                    },
                    {
                        "id": "title",
                        "title": "${ui.sortByFields.title}"
                    },
                    {
                        "id": "uploaded",
                        "title": "${ui.sortByFields.uploaded}"
                    },
                    {
                        "id": "username",
                        "title": "${ui.sortByFields.username}"
                    },
                    {
                        "id": "created",
                        "title": "${ui.sortByFields.created}"
                    },
                    {
                        "id": "type",
                        "title": "${ui.sortByFields.type}"
                    },
                    {
                        "id": "owner",
                        "title": "${ui.sortByFields.owner}"
                    },
                    {
                        "id": "avg-rating",
                        "title": "${ui.sortByFields.avg-rating}"
                    },
                    {
                        "id": "num-ratings",
                        "title": "${ui.sortByFields.num-ratings}"
                    },
                    {
                        "id": "num-comments",
                        "title": "${ui.sortByFields.num-comments}"
                    },
                    {
                        "id": "num-view",
                        "title": "${ui.sortByFields.num-view}"
                    }
                ]
            }
}
```
| Property         | Type   | Possible Values                                                                                                                                                                                                                                      | Default                                                                                                                                   | Description                      |
|------------------|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------|
| typeFilters      | Array  | ```Feature Service ``` &#124; ```Vector Tile Service ``` &#124; ```Image Service ``` &#124; ```Scene Service ``` &#124; ```MapService ```  &#124; ```all ```                                                                                                           | ```Feature Service ``` &#124; ```Vector Tile Service ``` &#124; ```Image Service ``` &#124; ```Scene Service ``` &#124; ```MapService ``` | All filter types                      |
| typeFilter     | Array  | ```Feature Service ``` &#124; ```Vector Tile Service ``` &#124; ```Image Service ``` &#124; ```Scene Service ``` &#124; ```MapService ``` &#124; ```all ```                                                                                                           |  ```all ``` | Filter type                      |
| sortbyFields     | Array  | ``` modified ``` &#124; ```title``` &#124; ```uploaded ``` &#124; ```username``` &#124; ```created ``` &#124; ```type ``` &#124; ```owner ``` &#124; ```avg-rating ``` &#124; ```num-ratings ``` &#124; ```num-comments ``` &#124; ```num-views" ``` | ``` modified ```                                                                                                                          | Sort fields                      |
| portals          | Object |                                                                                                                                                                                                                                                      |                                                                                                                                           | used portal                      |
| rowsPerPageItems | Array  | ```  10 ``` &#124;``` 25``` &#124;```50``` &#124;```100```                                                                                                                                                                                           | ```  10 ``` &#124;``` 25``` &#124;```50``` &#124;```100```                                                                                | possible number of rows per page |
| pagination       | Object | [```  10 ``` &#124;``` 25``` &#124;```50``` &#124;```100```  ]                                                                                                                                                                                         | ```  10 ```                                                                                                                               | number of rows per page          |
| spaceFilter      | Array  | ```all```  &#124; ``` orgarnisation``` &#124; ```my-content```                                                                                                                                                                                       | ```all```                                                                                                                                 | all possible filter portal spaces             |
| spaceFilters      | Array  | ```all```  &#124; ``` orgarnisation``` &#124; ```my-content```                                                                                                                                                                                       | ```all```                                                                                                                                 | filter portal space              |






