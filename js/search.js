// external js: isotope.pkgd.js, fit-columns.js
var $grid = $('.grid').isotope({
  layoutMode: 'fitColumns',
  itemSelector: '.grid-item'
});



$(document).ready(function () {
$('#get-data').click(function () {
	 console.log('test');
	 var search_word = $('#search-term').val();
	 console.log(search_word);
	 console.log(window.location);
	 window.location.href = "search.html?keyword="+search_word;
  });


$("#search-term").keypress(function(event) {
    if (event.which == 13) {
        $('#get-data').click();
     }
});



var queryString = window.location.search;
console.log(queryString);

var request_url = 'http://api.kulfyapp.com/gifs/getDashboard?skip=0&limit=100&language=telugu,hindi,tamil';
var keyword = 'trending';
if(queryString.length>0){
	keyword = queryString.replace('?keyword=','');
  request_url = 'http://api.kulfyapp.com/gifs/getGifs?keyword='+keyword+'&skip=0&limit=40&language=telugu,hindi,tamil'
	console.log(keyword);
}






    var showData1 = $('#show-data1');
    var showData2 = $('#show-data2');
    var showData3 = $('#show-data3');
    var showData4 = $('#show-data4');
    var show_resutls = $('#show-resutls');





    $.getJSON(request_url, function (result) {
      console.log(result);
      console.log(result.data);
	var html =''



  console.log(result.kulfy_tv);

    videoSource = result.kulfy_tv; 


      console.log(result.results_count)

      html = result.results_count +' Kulfys found for '+decodeURIComponent(keyword);
      show_resutls.append(html);
      html = '';



      for(var i=0, len=result.data.length;i<len;i=i+1){
      	console.log(result.data[i].image_url);
      	var kulfy = result.data[i];
      	var kulfy_url = kulfy.image_url;

      	if(kulfy.content_type === 'video' && kulfy.auto_play === true){
      		//kulfy_url = kulfy.image_url.replace('.jpg','.gif');
      	}

      	if(kulfy.content_type === 'gif' ){
      		kulfy_url = kulfy.fixed_width;
      	}



     html += '<a href="kulfy.html?id='+encodeURI(kulfy.kulfy_id)+'" >';
        html += '<img src="' + kulfy_url + '" width="'+'225'+'"'  + '/>';
        html += '</a>';
      
    
        showData1.append(html);
        html = '';

        kulfy = result.data[i+0];
        kulfy_url = kulfy.image_url;
        if(kulfy.content_type === 'gif' ){
          kulfy_url = kulfy.fixed_width;
        }

        html += '<a href="kulfy.html?id='+encodeURI(kulfy.kulfy_id)+'" >';
        html += '<img src="' + kulfy_url + '" width="'+'225'+'"'  + '/>';
        html += '</a>';
      
    
        showData2.append(html);
        html = '';

        kulfy = result.data[i+1];
        kulfy_url = kulfy.image_url;
        if(kulfy.content_type === 'gif' ){
          kulfy_url = kulfy.fixed_width;
        }

        html += '<a href="kulfy.html?id='+encodeURI(kulfy.kulfy_id)+'" >';
        html += '<img src="' + kulfy_url + '" width="'+'225'+'"'  + '/>';
        html += '</a>';


        showData3.append(html);
        html = '';


        kulfy = result.data[i+1];
        kulfy_url = kulfy.image_url;
        if(kulfy.content_type === 'gif' ){
          kulfy_url = kulfy.fixed_width;
        }

        html += '<a href="kulfy.html?id='+encodeURI(kulfy.kulfy_id)+'" >';
        html += '<img src="' + kulfy_url + '" width="'+'225'+'"'  + '/>';
        html += '</a>';

        showData4.append(html);
        html = '';



      }

      console.log(html);
 
        showData1.append(html);

    });


});
