$("#submit").click(function() {
    var movie = $("#movie-input").val().trim();
    // will not change text in movie title
    $("#movie-title").text(movie);
    alert("You are searching for " + movie);
});

// this is moving the entire h5 to favorites
$("#fav-heart").click(function() {
    var movieTitle = $("#movie-title");
    $("#list-favorites").append(movieTitle);
});

$("#search").click(function() {
    var zipcode = $("#zipCode").val().trim();
    alert("Your zip code is " + zipcode);
});

