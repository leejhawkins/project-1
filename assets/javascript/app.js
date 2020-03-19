

$(document).ready(function() {

    var movies = JSON.parse(localStorage.getItem("movies") || "[]");

    if (movies.length > 0) {
        for (var i = 0; i < movies.length; i++) {
            addFavoriteCard(movies[i].title, movies[i].poster);
        }
    }

    $("#submit").on("click", function(event) {
        $("#no-movie-info").css("display", "none");
        $("#movie-info").css("display", "none");
        event.preventDefault();
        var movie = $("#movie-input").val().trim();
        $("#movie-input").text("");
        getMovieInfo(movie);
    })

    // Adds favorites
    $("#fav-heart").on("click", function() {
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

    $("#list-favorites").on("click", ".info-btn", function() {
        getMovieInfo($(this).parent().parent().parent().attr("data-movie"));
    })

    // Removes favorites
    $("#list-favorites").on("click", ".remove-btn", function() {
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

    $(function() {
        $(window).scroll(sticktothetop);
        sticktothetop();
    });

    function getMovieInfo(movie) {

        //OMDB API Use
        var omdbQueryURL = "https://www.omdbapi.com/?t=" + movie + "&apikey=trilogy";

        $.ajax({
            url: omdbQueryURL,
            method: "GET",
            success: function(response) {
                getYoutubeTrailer(movie, response.Year);
            }
        }).then(function(response) {
            console.log(response);
            if (response.Error === "Movie not found!") {
                $("#no-movie-info").css("display", "block");
            } else {
                var imdbId = response.imdbID;
                console.log(imdbId)
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

                var ratedRt = response.Ratings[1].Value;
                $("#rt-aud-score").text(ratedRt);

                var ratedRTF = response.Ratings[2].Value;
                $("#rt-fresh-score").text(ratedRTF);
                $("#movie-info").css("display", "block");
                $("#streaming-info").css("display", "block");
                $("#trailer").css("display", "block");

                getStreamingInfo(imdbId);

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
    function getYoutubeTrailer(movie, year) {
         
        var youtubeQueryURL = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=" + movie + " " + year + " trailer&key=AIzaSyAUcvPuQEmB09VvUcwZNUfhtnQ0dt7ilhI";
        
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
        
            var streamingSites = [
                { displayName: "Amazon Prime", idRoot: "#amazon-prime-" },
                { displayName: "Netflix", idRoot: "#netflix-" },
                { displayName: "Disney Plus", idRoot: "#disney+-" },
                { displayName: "Hulu", idRoot: "#hulu-" }
            ]

            for (var i = 0; i < streamingSites.length; i++) {
                var iconX = $("<i>").attr("class", "fas fa-times fa-2x");
                $(streamingSites[i].idRoot + "button").empty();
                $(streamingSites[i].idRoot + "available").empty();
                $(streamingSites[i].idRoot + "available").append(iconX);
            }

            for (var i = 0; i < response.collection.locations.length; i++) {
                console.log(response.collection.locations[i].display_name);
                for (var j = 0; j < streamingSites.length; j++) {
                    if (response.collection.locations[i].display_name === streamingSites[j].displayName) {
                        var icon = $("<i>").attr("class", "fas fa-check fa-2x");
                        var streamButton = $("<a>").attr("href", response.collection.locations[i].url).attr("class", "button btn btn-success btn-sm btn-block my-1").attr("target", "_blank").text("Watch")
                        $(streamingSites[j].idRoot + "available").empty();
                        $(streamingSites[j].idRoot + "available").append(icon);
                        $(streamingSites[j].idRoot + "button").empty();
                        $(streamingSites[j].idRoot + "button").append(streamButton);
                    }
                }
            }
        });
    }
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
