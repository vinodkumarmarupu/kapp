// external js: isotope.pkgd.js, fit-columns.js


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

var id = '26FL7vvepT3IqNuUw';
if(queryString.length>0){
	id = queryString.replace('?id=','');
	console.log(id);
}






    var show_kulfy = $('#show-kulfy');
    var show_title = $('#content-title');
    var show_tags = $('#show-tags');
    var showData4 = $('#show-data4');

    $.getJSON('http://api.kulfyapp.com/gifs/getKulfy?id='+id, function (result) {
      console.log(result);
        var html =''
      if(result){
        if(result.content_type === 'video'){
                  console.log(result.video_url);
        document.getElementById("show-kulfy-video").setAttribute("src",result.video_url);

        }
        if(result.content_type === 'image'){
           $( "#show-kulfy-video" ).hide();
          console.log(result.image_url);
          html += '<img class="test" src="' + result.image_url + '"'  + ' width="640px"/>';;
        }
        if(result.content_type === 'gif'){
          $( "#show-kulfy-video" ).hide();
          console.log(result.image_url);
  
          var path = 'http://d3ed0349s2jlgi.cloudfront.net/basket/'+id+'/giphy.gif';
          html += '<img class="test" src="' + path +'"'  + 'width="640px" />';;
        }
        show_kulfy.append(html);
        show_title.append(result.name);
        
        var tags = ' ';
        for(var i=0,len=result.category.length;i<len;i++){
          tags += '<a href="search.html?keyword='+result.category[i]+'"' +'>'+result.category[i]+'</a>, '

        }
        console.log(tags);
        show_tags.append(tags);
        console.log(result.category.length);

      }

    });

});
