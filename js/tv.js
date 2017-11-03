'use strict';
angular.module('myApp',
        [
            "ngSanitize",
            "com.2fdevs.videogular",
            "com.2fdevs.videogular.plugins.controls",
            "com.2fdevs.videogular.plugins.overlayplay"
        ]
    )
    .controller('HomeCtrl',
        ["$sce", function ($sce) {
            this.config = {
                preload: "none",
                sources: [
                    {src: $sce.trustAsResourceUrl("https://j.gifs.com/48Noq7.mp4"), type: "video/mp4"}
                ],
                tracks: [
                    {
                        src: "pale-blue-dot.vtt",
                        kind: "subtitles",
                        srclang: "en",
                        label: "English",
                        default: ""
                    }
                ],
                theme: {
          url: "https://unpkg.com/videogular@2.1.2/dist/themes/default/videogular.css"
                }
            };
        }]
    );