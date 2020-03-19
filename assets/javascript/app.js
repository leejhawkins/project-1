function buildQueryURL() {
    var queryURL = ": https://imdb-internet-movie-database-unofficial.p.rapidapi.com/search/inception"
    queryParams = {"x-rapidapi-key":"7b724f78f5msh2f9c6b6b67592fbp19f39ejsn86e6e6fe03ae"}
}
var movie= ""
function populatePage(movieData) {
    var title = movieData.titles[0].title
    var imageURL = movieData.titles[0].image
    var image =$('<img>').attr("src",imageURL)
    image.css("height","400px")
    $("#movie-title").text(title)
    $("#movie-poster").empty()
    $("#movie-poster").append(image)
    

}

$("#submit").on("click", function(event){
    event.preventDefault();
    movie = $("#movie-input").val().trim()

var settings = {
	"async": true,
	"crossDomain": true,
	"url": "https://imdb-internet-movie-database-unofficial.p.rapidapi.com/search/"+ movie ,
	"method": "GET",
	"headers": {
		"x-rapidapi-host": "imdb-internet-movie-database-unofficial.p.rapidapi.com",
		"x-rapidapi-key": "7b724f78f5msh2f9c6b6b67592fbp19f39ejsn86e6e6fe03ae"
	}
}

$.ajax(settings).then(function (response) {
    console.log(response);
    populatePage(response)
    
});
});