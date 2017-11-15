
var myApp = angular.module('myApp', ["ngClickCopy","ngRoute","ngCookies","ui.multiselect","autocomplete","720kb.socialshare","infinite-scroll" ,"ngSanitize",
            "com.2fdevs.videogular",
            "com.2fdevs.videogular.plugins.controls",
            "com.2fdevs.videogular.plugins.overlayplay",
            "com.2fdevs.videogular.plugins.poster",
            "com.2fdevs.videogular.plugins.buffering"]);



myApp.config(['$routeProvider','$locationProvider',
  function($routeProvider,$locationProvider) {
    $routeProvider.
      when('/', {
    templateUrl: 'index.html',
    controller: 'KulfyController'
      }).
      when('/search/:keyword', {
    templateUrl: 'search.html',
    controller: 'KulfyController'
      }).
      when('/kulfy/:kid', {
    templateUrl: 'tv.html',
    controller: 'KulfyDetailController'
      }).
      otherwise({
    redirectTo: '/'
      });

$locationProvider.html5Mode(true);

}]);

myApp.config(['$cookiesProvider', function ($cookiesProvider) {
     $cookiesProvider.defaults.path = '/'; 
}]);

// the service that retrieves some movie title from an url
myApp.factory('MovieRetriever', function($http, $q, $timeout){
  var MovieRetriever = new Object();

  MovieRetriever.getmovies = function(typed_text) {
    var moviedata = $q.defer();
    var movies;
    if(typed_text.length > 2){
            var url = "https://api.kulfyapp.com/gifs/getTags?tag="+typed_text;

    $http.get(url).success(function(data) {
        var suggestions = [];
        for(var i=0;i<data.length;i++) {
          suggestions.push(data[i].text);
        }
        movies = suggestions;
    });
    }


    $timeout(function(){
      moviedata.resolve(movies);
    },500);

    return moviedata.promise
  }

  return MovieRetriever;
});





myApp.service("kulfyService",function($http,$q,$location,$cookies,$routeParams){

    var kulfy_id = '';
    var path = $location.path();
    if(path.startsWith('/kulfy/')){
        kulfy_id = path.replace('/kulfy/','');
    }

    var deffered = $q.defer();
    var dashboard_deffered = $q.defer();
    if(kulfy_id){
        var url = "https://api.kulfyapp.com/gifs/getKulfy?id="+kulfy_id;
        $http.get(url).success(function(data){
             deffered.resolve(data);
        })
    }else{

        var url = "https://api.kulfyapp.com/gifs/getDashboard?skip=0&limit=95&language=telugu";
        $http.get(url).success(function(data){
        dashboard_deffered.resolve(data);
         })
    }

    this.getDashboardData = function () {
        return dashboard_deffered.promise;
    }

    this.getKulfyData = function () {
        return deffered.promise;
    }

    

   var lang = $cookies.get('AKC');
   if(!lang){
     lang = 'telugu';
   }


})


myApp.controller('MainCtrl',
        ["$scope","$cookies", function ($scope,$cookies) {
  $scope.name = 'World';
    $scope.cars = [{id:1, name: 'Hindi'}, {id:2, name: 'Telugu'}, {id:1, name: 'Tamil'}];
    $scope.selectedCar = [];
    //$cookies.put('AKC', "Hindi,Telugu,Tamil");
    $scope.selected = function(){
          

            if($scope.selectedCar.length > 0 ){
            var lang = []

             for(var i=0;i<$scope.selectedCar.length;i++) {
                lang.push($scope.selectedCar[i].name);
             }

               var expireDate = new Date();
                expireDate.setDate(expireDate.getDate() + 100);
                //$cookies.put('AKC', lang, {'expires': expireDate});

                $scope.$emit('showLanguageBasedKulfys', lang);

            }

        }

    }]
);


myApp.controller('HomeCtrl',
        ["$scope","$sce", "$timeout","$location","$rootScope","kulfyService", function ($scope,$sce, $timeout,$location,$rootScope,kulfyService) {
            var controller = this;
            controller.state = null;
            controller.API = null;
            controller.currentVideo = 0;
            $scope.showKulfyTV = true;
            $scope.showKulfyStories = false;

        var kulfyTVPromise = kulfyService.getDashboardData();
        kulfyTVPromise.then(function(data){
            controller.kulfy_id = data.kulfy_tv_story;
            controller.name = "Chiru chindeste";
            controller.category = ["chiru","trending","dance"];
            controller.content_type = "story";
            controller.kulfy_ids = data.kulfy_tv;
            var tv = data.kulfy_tv
            var tv_item = {};
             for(var i=0;i<tv.length;i++) {
                tv_item ={
                sources: [
                    {src: tv[i], type: "video/mp4"},
                ]
            };
                controller.videos.push(tv_item);
                tv_item = {};
             }
        });

             var promise = kulfyService.getKulfyData();
             $scope.kulfy_name = '';
             $scope.kulfy_tags = [];
             $scope.show_video = false;
             $scope.show_image = true;
             $scope.kulfy_image_url = '';
             promise.then(function(data){
                $scope.$emit('kulfyDetailed', data);
                if(data.content_type === 'story' ){
                    $scope.show_image = false;
                    $scope.kulfy_image_url =  data.image_url;
                    $scope.show_video = false;
                    $scope.showKulfyTV = false;
                    $scope.showKulfyStories = true;
                    $scope.detail_image_url =  data.original_gif;
                    $scope.share_url = data.image_url;
                    console.log(data.story_ids);
                    console.log('showing kulfy tv',controller.videos);
            var tv = data.story_ids
            var tv_item = {};


            while(controller.videos.length > 0) {
                controller.videos.pop();
            }


             for(var i=0;i<tv.length;i++) {
                tv_item ={
                sources: [
                    {src: "https://j.gifs.com/"+tv[i]+".mp4" , type: "video/mp4"},
                ]
            };
                controller.videos.push(tv_item);
                tv_item = {};
             }
      
                }

             })
        

    $scope.showTV = function(){

        $scope.showImage = false;
    var kulfy_item = '';
    //$scope.players.pause();
    
    var redirect = 'kulfy/'+controller.kulfy_id;
    $location.path(redirect);
    $scope.$emit('kulfyDetailed', controller);
  }

        $scope.showDetails = function (){
            var temp = controller.videos[controller.currentVideo].sources[0].src;
            temp = temp.replace('https://j.gifs.com/','');
            var kulfy_id = temp.replace('.mp4','');
            var redirect = 'kulfy/'+kulfy_id;
            $location.path(redirect);
            window.location.reload();

            //controller.API.stop();
        }

        $scope.setVolume = function (){
            controller.API.setVolume(0.5);
        }

        $scope.mute = function (){
            
        }

        $rootScope.$on('showHome', function(event, data) {
            $scope.showKulfyTV = true;
        });

         $rootScope.$on('kulfyDetailed', function(event, data) {
                
                $scope.showKulfyTV = false;
                if(data.click){
                  controller.API.setVolume(0);
                  $scope.showKulfyStories = false;
                }     
          });

         $rootScope.$on('pauseDetail', function(event, data) {
                controller.API.setVolume(0);
        });

         $rootScope.$on('Searchkulfy', function(event, data) {
            $scope.showKulfyTV = false;
        });

            controller.onPlayerReady = function(API) {
                controller.API = API;
                controller.API.setVolume(0);
            };

            controller.next = function() {
                controller.isCompleted = true;

                controller.currentVideo++;

                if (controller.currentVideo >= controller.videos.length) controller.currentVideo = 0;

                controller.setVideo(controller.currentVideo);
            };

            controller.onCompleteVideo = function() {
                controller.isCompleted = true;

                controller.currentVideo++;

                if (controller.currentVideo >= controller.videos.length) controller.currentVideo = 0;

                controller.setVideo(controller.currentVideo);
            };

            controller.onCompleteStory = function(API) {
                controller.isCompleted = true;

                controller.currentVideo++;

                if (controller.currentVideo >= controller.videos.length){
                    controller.API = API;
                    controller.API.stop();
                } 

                controller.setVideo(controller.currentVideo);
            };

            controller.videos = [
            {
                sources: [
                    {src: "https://j.gifs.com/66g7oR.mp4", type: "video/mp4"},
                ]
            }
        ];

            controller.config = {
                preload: "'preload'",
                autoHide: false,
                autoHideTime: 3000,
                autoPlay: false,
                sources: controller.videos[0].sources,
                theme: {
                    url: "https://unpkg.com/videogular@2.1.2/dist/themes/default/videogular.css"
                },
                plugins: {
                    poster: "https://kulfyapp.com/logo.png"
                }
            };

            controller.setVideo = function(index) {
                controller.API.stop();
                controller.currentVideo = index;
                controller.config.sources = controller.videos[index].sources;
                $timeout(controller.API.play.bind(controller.API), 100);
            };
        }]
    );

myApp.controller('SearchController', function($scope,$location,kulfyService,MovieRetriever){



	if(localStorage.getItem("language")){
		console.log("lang exists");
		/* $scope.data=[
		{	"language":"telugu","checked":true},
		{	"language":"tamil","checked":false},
		{	"language":"hindi","checked":false}
		]; */
 $scope.data1=localStorage.getItem("language");
 $scope.data= JSON.parse($scope.data1);
 
 
	}
	else{
		console.log("lang not exists");
		$scope.data=[
{	"language":"telugu","checked":true},
{	"language":"tamil","checked":false},
{	"language":"hindi","checked":false}
];
	}
	if(localStorage.getItem("kulfies")){
		console.log("kulfies exists");
$scope.data2=localStorage.getItem("kulfies");
 $scope.type= JSON.parse($scope.data2);
	}
	else{
		console.log("kulfies not exists");
			$scope.type=[
{	"types":"Gifs","checked":true},
{	"types":"Images","checked":false},
{	"types":"Videos","checked":true}
] 
	}
/* $scope.data=[
{	"language":"telugu","checked":true},
{	"language":"tamil","checked":false},
{	"language":"hindi","checked":false}
];
$scope.type=[
{	"types":"Gifs","checked":true},
{	"types":"Images","checked":false},
{	"types":"Videos","checked":true}
] */
var languages=[];
var kulfies=[];

$scope.update=function(a,b,index){
	
		if($scope.data[index].checked)
			$scope.data[index].checked=false;
		else
			$scope.data[index].checked=true;
	
	
	
}
$scope.change=function(a,b,index){
	
		if($scope.type[index].checked)
			$scope.type[index].checked=false;
		else
			$scope.type[index].checked=true;
	
	
	
}


$scope.getData=function(data){
	
	
	for(i=0;i<3;i++){
		//if($scope.data[i].checked)
			languages.push($scope.data[i]);
	}
	for(i=0;i<3;i++){
		//if($scope.type[i].checked)
			kulfies.push($scope.type[i]);
	}

	localStorage.setItem("language", JSON.stringify(languages));
	localStorage.setItem("kulfies", JSON.stringify(kulfies));
	//localStorage.clear();
console.log(localStorage.getItem("language"));
	
	
	
} 

$scope.show_search = true;
  $scope.movies = MovieRetriever.getmovies("");
  $scope.movies.then(function(data){
    $scope.movies = data;
  });

 var suggestionPromise = kulfyService.getDashboardData();
 suggestionPromise.then(function(data){
        $scope.tending_keywords = data.trending_words;
 });


  $scope.getmovies = function(){
    return $scope.movies;
  }


  $scope.getResults = function (){
    $scope.search = null;
    $scope.$emit('Searchkulfy', $scope.result);
    var redirect = 'search/'+$scope.result;
    $location.path(redirect);
    $scope.result = '';
    
  }

  $scope.getSuggestions = function(typedthings){
      $scope.newmovies = MovieRetriever.getmovies(typedthings);
      $scope.newmovies.then(function(data){
      $scope.movies = data;
    });
  }

    $scope.showHomePage = function(){
        $location.path('/');
        $scope.keyword = 'trending';
        $scope.$emit('showHome', 'trending');
        $scope.result = '';
        $scope.movies = [];
    }

  $scope.getSearchResults = function(suggestion){
   $scope.searchParam = null;
    $scope.$emit('Searchkulfy', suggestion);
    var redirect = 'search/'+suggestion
    $location.path(redirect);
    $scope.movies = [];
  }

});

myApp.controller('KulfyDetailController',
        ["$sce","$http","$scope","$location","$rootScope","$q","$routeParams","kulfyService", function ($sce,$http,$scope,$location,$rootScope,$routeParams,$q,kulfyService) {

    $scope.show_details = false;
    $scope.detail_image_url = '';
    var kulfy_id = $routeParams.kid;
    $scope.detail_kulfy = '';
    

   $scope.share = function (){
    FB.ui({
  method: 'feed',
  link: $scope.detail_image_url,
  caption: 'Sample test',
  redirect_uri: 'http://beta.kulfy.co.in/',
}, function(response){});   
  }

    $rootScope.$on('$routeChangeStart', function(event, next, current) {

       
    });

    $rootScope.$on('$locationChangeSuccess', function() {
        $rootScope.actualLocation = $location.path();    
    });

    $rootScope.$watch(function() { return $location.path() },
        function(newLocation, oldLocation) {
        if($rootScope.actualLocation === newLocation) {
            window.location.reload();
        }

        }); 
    


    $scope.getTags = function(index){
        $scope.show_details = false;
        $scope.$emit('Searchkulfy', $scope.kulfy_tags[index]);
        var redirect = 'search/'+$scope.kulfy_tags[index];
        $location.path(redirect);
    }

    this.getKulfy = function () {
        return deffered.promise;
    }



$rootScope.$on('showHome', function(event, data) {
    $scope.show_details = false;
    controller.config.sources =[
                    {src: $sce.trustAsResourceUrl(''), type: "video/mp4"}
                ]
        });

$rootScope.$on('Searchkulfy', function(event, data) {
    $scope.show_details = false;
    controller.API.stop();
        });

$rootScope.$on('pauseDetail', function(event, data) {
    //controller.API.setVolume(0);
    controller.API.pause();
        });


  $scope.$on('kulfyDetailed', function(event, data) {
    $scope.show_details = true;

                console.log('Kulfy details',data);
                if(data.content_type === 'story' ){
                    $scope.show_image = false;
                    $scope.show_video = false;
                    $scope.detail_image_url =  data.image_url;
                    $scope.share_url = data.image_url;
                    controller.config.sources =[
                    {src: $sce.trustAsResourceUrl(data.video_url), type: "video/mp4"}
                    ]
                }
                
                if(data.content_type === 'gif'){
                    $scope.show_video = false;
                    $scope.show_image = true;
                    $scope.detail_image_url =  data.original_gif;
                    $scope.share_url = data.image_url;
                }
                if(data.content_type === 'image'){
                    $scope.show_video = false;
                    $scope.show_image = true;

                    $scope.detail_image_url =  data.image_url;
                    $scope.share_url = data.image_url;
                }
                if(data.content_type === 'video' ){
                    $scope.show_image = false;
                    $scope.show_video = true;
                    $scope.detail_image_url =  data.image_url;
                    $scope.share_url = data.image_url;
                    controller.config.sources =[
                    {src: $sce.trustAsResourceUrl(data.video_url), type: "video/mp4"}
                    ]
                }
                $scope.kulfy_name = data.name;
                $scope.kulfy_tags = data.category;
                $scope.url = 'https://kulfyapp.com/kulfy/'+((typeof data.kulfy_id == 'undefined') ? data.giphy_id  : data.kulfy_id);

        window.scrollTo(0,0);
  });

          this.config = {
                preload: "none",
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


             var controller = this;
             var promise = kulfyService.getKulfyData();
             $scope.kulfy_name = '';
             $scope.kulfy_tags = [];
             $scope.show_video = false;
             $scope.show_image = true;
             $scope.kulfy_image_url = '';
             promise.then(function(data){
                $scope.$emit('kulfyDetailed', data);
                $scope.show_details = true;
                if(data.content_type === 'image' || data.content_type === 'gif'){
                    $scope.show_video = false;
                    $scope.show_image = true;
                    $scope.kulfy_image_url =  data.image_url;
                }
                if(data.content_type === 'video' ){
                    $scope.show_image = false;
                    $scope.show_video = true;
                    $scope.kulfy_image_url =  data.image_url;
                }
                $scope.kulfy_name = data.name;
                $scope.kulfy_tags = data.category;
                
                controller.config.sources =[
                    {src: $sce.trustAsResourceUrl(data.video_url), type: "video/mp4"}
                ]
             })
        }]
    );


myApp.controller('DetailCtrl',
        ["$sce","$http","$scope","$location","$rootScope","$routeParams","kulfyService", function ($sce,$http,$scope,$location,$rootScope,$routeParams,kulfyService) {

  $scope.showImage = true;
  $scope.showVideo = false;
  $scope.show_details = true;
  $scope.player_index = 0;
  $scope.players = [];
  $scope.kulfy_image_url = '';

      this.getTags = function(){
    }

  $scope.showDetails = function(){
    $scope.showImage = false;
    var kulfy_item = '';
    
        if ("undefined" !== typeof $scope.item1) {
        kulfy_item = $scope.item1;
    }
        if ("undefined" !== typeof $scope.item2) {
        kulfy_item = $scope.item2;
    }
        if ("undefined" !== typeof $scope.item3) {
        kulfy_item = $scope.item3;
    }
        if ("undefined" !== typeof $scope.item4) {
        kulfy_item = $scope.item4;
    }

    if(kulfy_item.content_type === 'video'){
        $scope.players.pause();
    }

    var redirect = 'kulfy/'+kulfy_item.kulfy_id;
    $location.path(redirect);
    kulfy_item.click = true;
    $scope.$emit('kulfyDetailed', kulfy_item);
  }


     $scope.playVideo = function (){
        $scope.$emit('pauseDetail', 'test');
        var kulfy = '';
 
    if ("undefined" !== typeof $scope.item1) {
        kulfy = $scope.item1;
        $scope.item1.kulfy_image_url = $scope.item1.image_url;
        if($scope.item1.content_type === 'gif'){
            $scope.item1.image_url = $scope.item1.fixed_width;
        }        
    }
        if ("undefined" !== typeof $scope.item2) {
        kulfy = $scope.item2;
        $scope.item2.kulfy_image_url = $scope.item2.image_url;
        if($scope.item2.content_type === 'gif'){
            $scope.item2.image_url = $scope.item2.fixed_width;
        }   
    }
        if ("undefined" !== typeof $scope.item3) {
        kulfy = $scope.item3;
        $scope.item3.kulfy_image_url = $scope.item3.image_url;
        if($scope.item3.content_type === 'gif'){
            $scope.item3.image_url = $scope.item3.fixed_width;
        }   
    }
        if ("undefined" !== typeof $scope.item4) {
        kulfy = $scope.item4;
        $scope.item4.kulfy_image_url = $scope.item4.image_url;
        if($scope.item4.content_type === 'gif'){
            $scope.item4.image_url = $scope.item4.fixed_width;
        }   
    }

    if(kulfy.content_type === 'video'){
        $scope.showImage = false;
        $scope.showVideo = true;
        controller.API.setVolume(1);
        controller.config.sources =[
                    {src: $sce.trustAsResourceUrl(kulfy.video_url), type: "video/mp4"}
                ];
    }
    if(kulfy.content_type === 'gif'){
        $scope.showVideo = false;
        $scope.showImage = true;
        
    }
  }

$scope.stopVideo = function (){

    var kulfy = '';
 
    if ("undefined" !== typeof $scope.item1) {
        kulfy = $scope.item1;
        $scope.item1.image_url = $scope.item1.kulfy_image_url;
    }
        if ("undefined" !== typeof $scope.item2) {
        kulfy = $scope.item2;
        $scope.item2.image_url = $scope.item2.kulfy_image_url;
    }
        if ("undefined" !== typeof $scope.item3) {
        kulfy = $scope.item3;
        $scope.item3.image_url = $scope.item3.kulfy_image_url;
    }
        if ("undefined" !== typeof $scope.item4) {
        kulfy = $scope.item4;
        $scope.item4.image_url = $scope.item4.kulfy_image_url;
    }

    if(kulfy.content_type === 'video'){
        $scope.players.pause();
        $scope.showVideo = false;
        $scope.showImage = true;
    }
  }


            var controller = this;
            controller.state = null;
            controller.API = null;
            controller.currentVideo = 0;

            this.players = [];

            controller.onPlayerReady = function(API,index) {
                this.players[index] = API;
                controller.API = API;
            };

           this.config = {
                preload: "none",
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

             var controller = this;
             var promise = kulfyService.getKulfyData();
             $scope.kulfy_name = '';
             $scope.share_url = '';
             $scope.kulfy_tags = [];
             $scope.kulfy_image_url = '';
             promise.then(function(data){
                if(data.content_type === 'image' || data.content_type === 'gif'){
                    $scope.show_video = false;
                    $scope.show_image = true;
                    $scope.kulfy_image_url =  data.image_url;
                    $scope.share_url = data.image_url;
                }
                if(data.content_type === 'video' ){
                    $scope.show_image = false;
                    $scope.show_video = true;
                    $scope.kulfy_image_url =  data.image_url;
                    $scope.share_url = data.video_url;
                }
                $scope.kulfy_name = data.name;
                $scope.kulfy_tags = data.category;
                /*
                controller.config.sources =[
                    {src: $sce.trustAsResourceUrl(data.video_url), type: "video/mp4"}
                ]*/
             })
        $rootScope.$on('kulfyClick', function(event, data) {
        if(data.content_type === 'gif' ){
                    $scope.show_video = false;
                    $scope.show_image = true;

                    $scope.kulfy_image_url =  data.image_url; 
                    controller.config.sources = '';
                    $scope.share_url = data.share_url;
        }
        if(data.content_type === 'image'){
                    $scope.show_video = false;
                    $scope.show_image = true;
                    $scope.kulfy_image_url =  data.image_url; 
                    controller.config.sources = '';
                    $scope.share_url = data.image_url;
        }
        if(data.content_type === 'video' ){
                    $scope.show_image = false;
                    $scope.show_video = true;
                    $scope.share_url = data.image_url;
                    
                    controller.config.sources =[
                    {src: $sce.trustAsResourceUrl(data.video_url), type: "video/mp4"}
                ];
        }




        $scope.kulfy_name = data.name;
        $scope.kulfy_tags = data.category;
       
                window.scrollTo(0,0);
        });

                this.onUpdateState = function (state, index) {
                    $scope.player_index = index;
                    $scope.players = this.players[index];
        };

        }]
    );


myApp.controller('KulfyController', function($scope,$location,$cookies,$rootScope,$routeParams, Reddit,kulfyService) {
  $scope.reddit = new Reddit();
  $scope.reddit.keyword = 'trending';
  $scope.showResultsCount = false;


    var search_keyword = '';
    var path = $location.path();
    if(path.startsWith('/search/')){
        search_keyword = path.replace('/search/','');
        $scope.reddit.cleanScreen();
        $scope.reddit.keyword = search_keyword;
        $scope.reddit.request_type = 'search';
        $scope.reddit.getSearchResults();
        $scope.showResultsCount =true;
        $scope.$emit('Searchkulfy', $scope.result);
        $scope.mapheight = {'margin-top': "0px"};
    }


   var lang = $cookies.get('AKC');
   if(lang){
    $scope.reddit.language = lang;
   }

 $rootScope.$on('$routeChangeStart', function (scope, next, current) {
    console.log('test');
    });

        $rootScope.$on('Searchkulfy', function(event, keyword) {
        $scope.reddit.cleanScreen();
        $scope.reddit.keyword = keyword;
        $scope.reddit.request_type = 'search';
        $scope.reddit.getSearchResults();
        $scope.showResultsCount =true;
        });

        $rootScope.$on('showLanguageBasedKulfys', function(event, data) {
        $scope.reddit.cleanScreen();
        $scope.reddit.language = data;
        $scope.reddit.getSearchResults();
        });
        

        $rootScope.$on('showHome', function(event, data) {
        $scope.showResultsCount =false;      
        $scope.reddit.cleanScreen();
        $scope.reddit.request_type = 'dashboard';
        $scope.reddit.keyword = 'trending';
        $scope.reddit.getSearchResults();
        
        });

    $rootScope.$on('kulfyDetailed', function(event, data) {
        $scope.mapheight = {'margin-top': "0px"};
    });


    $rootScope.$on('showHome', function(event, data) {
        $scope.mapheight = {'margin-top': "-420px"};
    });

    $rootScope.$on('Searchkulfy', function(event, data) {
        $scope.mapheight = {'margin-top': "0px"};
    });


    var search_keyword = '';

    // Example - http://my.site.com/?myparam=33
    if ( $location.search().hasOwnProperty( 'q' ) ) {
        search_keyword = $location.search()['q'];
        $scope.reddit.keyword = search_keyword;
    }

    var kulfy_id = '';

    // Example - http://my.site.com/?myparam=33
    if ( $location.search().hasOwnProperty( 'k' ) ) {
        kulfy_id = $location.search()['k'];
        $scope.reddit.kulfy_id = kulfy_id;
        $scope.reddit.kulfy_detail = true;
    }

  $scope.showKulfy = function(kulfy){
    $scope.kulfy = kulfy;
    $scope.$emit('kulfyClick', $scope.kulfy);
  }


  

  $scope.filter = function(content_type){     
        $scope.reddit.cleanScreen();
        if(content_type === 'all'){
            content_type = 'video,gif,image';
        }
        $scope.reddit.content_type = content_type;
        $scope.reddit.getSearchResults();
  }
    $scope.myFunc = function() {
      $scope.count++;
    };
        
});

// Reddit constructor function to encapsulate HTTP and pagination logic
myApp.factory('Reddit', function($http) {
  var Reddit = function() {
    this.items = [];
    this.busy = false;
    this.kulfy_detail = false;
    this.kulfy_id = '';
    this.after = 0;
    this.total = 0;
    this.kulfys1 = [];
    this.kulfys2 = [];
    this.kulfys3 = [];
    this.kulfys4 = [];
    this.request_type = 'dashboard'
    this.keyword = 'trending';
    this.language = 'telugu';
    this.content_type = 'video,gif,image';
  };


 Reddit.prototype.cleanScreen = function() {
            this.after = 0;
        this.kulfys1 = [];
        this.kulfys2 = [];
       this.kulfys3 = [];
        this.kulfys4 = [];
        this.content_type = 'video,gif,image'
 }
 
  Reddit.prototype.getSearchResults = function() {
    if (this.busy) return;
        this.busy = true;

    var lang = localStorage.language;
    if(typeof lang == 'undefined'){
        lang = ["hindi","telugu","tamil"];    
    }else{
        lang = JSON.parse(lang);
        lang = lang.map(lan => lan.language);
    }
    console.log(lang);
    this.language = lang.join(',');

    var url = "https://api.kulfyapp.com/gifs/getDashboard?skip="+this.after+"&limit=101&language="+this.language+"&content="+this.content_type;
    if(this.request_type !== 'dashboard'){
        url = "https://api.kulfyapp.com/gifs/search?keyword="+this.keyword+"&skip="+this.after+"&limit=100&language="+this.language+"&content="+this.content_type;
    }

    $http.get(url).success(function(data) {
      var kulfys = data.data;
      this.total = data.results_count;

        for(var i=0;i<kulfys.length;i++) {

            if(kulfys[i].content_type === 'gif'){
                kulfys[i].image_url = kulfys[i].downsized_still;
            }

            if(i%4 === 0){
                this.kulfys1.push(kulfys[i]);
            }
            if(i%4 === 1){
                this.kulfys2.push(kulfys[i]);
            }
            if(i%4 === 2){
                this.kulfys3.push(kulfys[i]);
            }
            if(i%4 === 3){
                this.kulfys4.push(kulfys[i]);
            }
        }
      this.after = this.after +100;
      this.busy = false;
    }.bind(this));

  };

  return Reddit;
});



