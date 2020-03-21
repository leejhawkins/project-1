$(document).ready(function() {
   
    var movies = JSON.parse(localStorage.getItem("movies") || "[]");
    var yourStreaming = [];
    var streamingSites = [
        { displayName: "Netflix", image: document.images[0] },
        { displayName: "Amazon Prime Video", image: document.images[1] },
        { displayName: "Hulu", image: document.images[2] },
        { displayName: "Google Play", image: document.images[3] },
        { displayName: "iTunes", image: document.images[4] },
        { displayName: "HBO", image: document.images[5] }
    ]
    if (movies.length > 0) {
        for (var i = 0; i < movies.length; i++) {
            addFavoriteCard(movies[i].title, movies[i].poster);
        }
    }

    $("#submit").on("click", function (event) {
        $("#no-movie-info").css("display", "none");
        $("#movie-info").css("display", "none");
        event.preventDefault();
        var movie = $("#movie-input").val().trim();
        $("#movie-input").val("");
        $("#streaming-services").empty()
        getMovieInfo(movie);
    })

    // Adds favorites
    $("#fav-heart").on("click", function () {
        var movieTitle = $("#movie-title").text();
        var moviePoster = $("#movie-poster").attr("src");
        function isMovieMatch(movie) {
            return movie.title === movieTitle && movie.poster === moviePoster;
        }

        if (movies.findIndex(isMovieMatch) == -1) {
            movies.push({ poster: moviePoster, title: movieTitle });
            localStorage.setItem("movies", JSON.stringify(movies));
            addFavoriteCard($("#movie-title").text(), $("#movie-poster").attr("src"));
        }
    })

    $("#list-favorites").on("click", ".info-btn", function () {
        getMovieInfo($(this).parent().parent().parent().attr("data-movie"));
    })

    // Removes favorites
    $("#list-favorites").on("click", ".remove-btn", function () {
        var movieTitle = $(this).parent().parent().parent().attr("data-movie");

        function isMovieMatch(movie) {
            return movie.title === movieTitle;
        }
        var movieIndex = movies.findIndex(isMovieMatch);
        if (movieIndex > -1) {
            movies.splice(movieIndex, 1);
        }
        localStorage.setItem("movies", JSON.stringify(movies));
        $(this).parent().parent().parent().remove();
    })

    $(function () {
        $(window).scroll(sticktothetop);
        sticktothetop();
    });
    //OMDB API Use
    function getMovieInfo(movie) {

        var omdbQueryURL = "https://www.omdbapi.com/?t=" + movie + "&apikey=trilogy";

        $.ajax({
            url: omdbQueryURL,
            method: "GET"
        }).then(function (response) {
            console.log(response);
            if (response.Error === "Movie not found!") {
                $("#no-movie-info").css("display", "block");
            } else {
                var imdbId = response.imdbID;

                var director = response.Director;
                $("#movie-director").text(director);

                var rating = response.Rated;
                $("#movie-rated").text(rating);

                var title = response.Title;
                $("#movie-title").text(title);

                var genre = response.Genre;
                $("#movie-genre").text(genre);

                var plot = response.Plot;
                $("#movie-plot").text(plot);

                var imgURL = response.Poster;
                $("#movie-poster").attr("src", imgURL);

                var released = response.Released;
                $("#movie-release").text(released);

                var runtime = response.Runtime;
                $("#movie-runtime").text(runtime);

                var actors = response.Actors;
                $("#movie-actors").text(actors);

                var ratedIMDB = response.Ratings[0].Value;
                $("#imdb-score").text(ratedIMDB);

                console.log(response.Ratings.length)
                if (response.Ratings.length > 1) {
                    var ratedRt = response.Ratings[1].Value;
                    $("#rt-aud-score").text(ratedRt);

                    var ratedRTF = response.Ratings[2].Value;
                    $("#rt-fresh-score").text(ratedRTF);
                }

                $("#movie-info").css("display", "block");
                $("#streaming-info").css("display", "block");
                $("#trailer").css("display", "block");

                getStreamingInfo(imdbId);
                getYoutubeTrailer(movie, released)
            }
        })
    }

    // Adds movie card to favorites div
    function addFavoriteCard(title, poster) {
        var favoriteCard = $("<div>")
            .addClass("card favorite-card")
            .attr("data-movie", title);
        var cardBody = $("<div>").addClass("card-body fav-buttons-below");
        var buttonsDiv = $("<div>").addClass("btn-group fav-info-buttons");
        buttonsDiv.append(($("<button>")
            .attr("type", "button")
            .addClass("btn btn-secondary btn-sm btn-success info-btn")
            .text("Info")));
        buttonsDiv.append(($("<button>")
            .attr("type", "button")
            .addClass("btn btn-secondary btn-sm btn-danger remove-btn")
            .text("Remove")));
        cardBody.append(buttonsDiv);
        favoriteCard.append(($("<img>")
            .attr("src", poster)
            .addClass("card-img-top fav-img")));
        favoriteCard.append(cardBody);
        $("#list-favorites").append(favoriteCard);
    }

    // Youtube API Use
    function getYoutubeTrailer(imdbId) {

        var youtubeQueryURL = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=" +imdbId +" trailer&key=AIzaSyC_VBnzUWZnu_i1CYl1oqzpytR8vnFNrkY";
        
        $.ajax({
            url: youtubeQueryURL,
            method: "GET"
        }).then(function(response) {
            console.log(response);
            $("#trailer").empty();
            var trailer = $("<iframe>").addClass("embed-responsive-item pr-3");
            trailer.attr("src", "https://www.youtube.com/embed/" + response.items[0].id.videoId);
            $("#trailer").append(trailer);
        });
    }


    // Streaming the movie 
    function getStreamingInfo(imdbId) {

        var settings = {
            "async": true,
            "crossDomain": true,
            "url": "https://utelly-tv-shows-and-movies-availability-v1.p.rapidapi.com/idlookup?country=US&source_id="+imdbId+"&source=imdb",
            "method": "GET",
            "headers": {
                "x-rapidapi-host": "utelly-tv-shows-and-movies-availability-v1.p.rapidapi.com",
                "x-rapidapi-key": "5ab9c085a4mshd943485782db908p11fe0djsn292b49c261e6"
            }
        }

        $.ajax(settings).done(function (response) {
            console.log(response);

            for (var i=0;i<yourStreaming.length;i++) {
                var streamDiv = $('<div>')
                streamDiv.addClass("card card-title col-xs-6")
                streamDiv.val(yourStreaming[i])
                var imgDiv = $('<div>')
                imgDiv.addClass("card-img-top")
                for (var j=0;j<streamingSites.length;j++) {
                    if (yourStreaming[i]===streamingSites[j].displayName) {
                        imgDiv.append(streamingSites[j].image)
                        streamDiv.append(imgDiv)
                        var canStream = false;
                        
                        for (var k=0;k<response.collection.locations.length;k++) {
                            if (response.collection.locations[k].display_name === yourStreaming[i]) {
                                var icon = $("<i>").attr("class", "fas fa-check fa-2x");
                                var streamButton = $("<a>").attr("href", response.collection.locations[k].url).attr("class", "button btn btn-success btn-sm btn-block my-1").attr("target", "_blank").text("Watch")
                                streamDiv.append(icon);
                                streamDiv.append(streamButton);
                                canStream = true
                                console.log(canStream)
                            } 
                            else if (k===response.collection.locations.length-1 && !canStream) {
                                var iconX = $("<i>").attr("class", "fas fa-times fa-2x");
                                streamDiv.append(iconX)
                            }
                        }
                    }
                    $("#streaming-services").append(streamDiv)
                }
            }
        });
    }

    $("#streaming").on("click", ".form-check-input", function () {

        var checked = $(this).val();
        var unchecked = false;
    
        if (yourStreaming==""){
            yourStreaming.push(checked)
            console.log(yourStreaming)  
        } 
        else { 
            for (var i=0;i<yourStreaming.length;i++) {
                if (checked===yourStreaming[i]) {
                    yourStreaming.splice(i,1)
                    unchecked = true
                }
            }
            if (!unchecked) {
            yourStreaming.push(checked)
            }
        }
        console.log(yourStreaming)
        $("#streaming-services").empty();
        for (var i=0;i<yourStreaming.length;i++) {
            var streamDiv = $('<div>')          
            streamDiv.addClass("card card-title")
            streamDiv.val(yourStreaming[i])
            var imgDiv = $('<div>')
            imgDiv.addClass("card-img-top")
            for (var j=0;j<streamingSites.length;j++) {
                if (yourStreaming[i]===streamingSites[j].displayName) {
                    imgDiv.append(streamingSites[j].image)
                    streamDiv.append(imgDiv)
                }
            }
            $('#streaming-services').append(streamDiv)
        }
    })
    // List-favorites div
    function addFavoriteCard(title, poster) {
        var favoriteCard = $("<div>")
            .addClass("card favorite-card")

            .attr("data-movie", title);

        var cardBody = $("<div>").addClass("card-body fav-buttons-below");
        var buttonsDiv = $("<div>").addClass("btn-group fav-info-buttons");
        buttonsDiv.append(($("<button>")
            .attr("type", "button")
            .addClass("btn btn-secondary btn-sm btn-success info-btn")
            .text("Info")));
        buttonsDiv.append(($("<button>")
            .attr("type", "button")
            .addClass("btn btn-secondary btn-sm btn-danger remove-btn")
            .text("Remove")));
        cardBody.append(buttonsDiv);
        favoriteCard.append(($("<img>")
            .attr("src", poster)
            .addClass("card-img-top fav-img")));
        favoriteCard.append(cardBody);
        $("#list-favorites").append(favoriteCard);
    }

    function sticktothetop() {
        var window_top = $(window).scrollTop();
        var top = $('#stick-here').offset().top;
        if (window_top > top && window.innerWidth >= 993) {
            $('#stickThis').addClass('stick');
            $('#stick-here').height($('#stickThis').outerHeight());
        } else {
            $('#stickThis').removeClass('stick');
            $('#stick-here').height(0);
        }

    }
})