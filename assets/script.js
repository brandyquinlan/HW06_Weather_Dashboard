var currentDay = moment().format("l");

var sidebar = $("#sidebar");
var searchBar = $("#search");
var searchBtn = $("#search-btn");
var search_form = $("#search_form");
var cardBox = $("#card-box");

$(document).ready(function() {
    populatePage();
    search_form.on("submit", getCityName);
})

function populatePage() {
    var searchedCities = getCity();
    if (!searchedCities.length) return;

    getLatLon(searchedCities[0]);
    sidebar.empty()
    for (var i = 0; i < searchedCities.length; i++) {
        var citySidebar = $("<li>").attr("class", "list-group-item").text(searchedCities[i]);
        citySidebar.on("click", getSidebarData);
        sidebar.append(citySidebar);
    }
}

function getSidebarData() {
    var clicked = $(this).text();
    saveCity(clicked);
}

function getCityName(event) {
    event.preventDefault();
    var cityVal = searchBar.val();
    searchBar.val('')
    saveCity(cityVal);
}

function getLatLon(cityName) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=4a60c194641c2fd1c1e8454a09aaa123";
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function(response) {
        var lat = response.coord.lat;
        var lon = response.coord.lon;

        predictedDays(lat, lon, cityName);
    });
}

function predictedDays(lat, lon, cityName) {
    var queryURLDay = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&exclude=hourly,minutely&appid=4a60c194641c2fd1c1e8454a09aaa123"

    $.ajax({
        url: queryURLDay,
        method: "GET"
    }).then(function(response) {

        createCards();

        var arr = response.daily;

        for (var i = 0; i < arr.length; i++) {
            var temp = arr[i].temp.day;
            var humidity = arr[i].humidity;
            var windSpeed = arr[i].wind_speed;
            var uvIndex = arr[i].uvi;
            var iconCode = arr[i].weather[0].icon;

            var iconUrl = "http://openweathermap.org/img/wn/" + iconCode + "@2x.png"

            if (i === 0) {
                cityName = cityName.charAt(0).toUpperCase() + cityName.slice(1);
                $("#city-name").text(cityName + " (" + currentDay + ")");
                $("#temp").text(temp + "°F");
                $("#humidity").text(humidity + "%");
                $("#wind").text(windSpeed + "MPH");
                $("#uv").text(uvIndex);
                if (uvIndex >= 3 && uvIndex < 6) {
                    $("#uv").attr("class", "badge badge-warning")
                } else if (uvIndex < 3) {
                    $("#uv").attr("class", "badge badge-success")
                } else {
                    $("#uv").attr("class", "badge badge-danger")
                }
                var img = $("<img>").attr("src", iconUrl)
                img.attr("class", "big-icon");
                $("#icon").empty();
                $("#icon").append(img);
            } else {
                var card = $("#card-" + i);
                var img = $("<img>").attr("src", iconUrl)
                img.attr("style", "height: 4rem; width: 4rem")
                card.append($("<h5>").text(moment().add(i, 'days').format("l")))
                card.append(img);
                card.append($("<p>").text("Temp: " + temp + "°F"));
                card.append($("<p>").text("Humidity: " + humidity + "%"));
            }

        }
    });
}

function createCards() {
    cardBox.empty();
    for (var i = 1; i < 6; i++) {
        var card = $("<div>").attr("class", "weather-card").attr("id", "card-" + i);
        cardBox.append(card);
    }
}

function saveCity(cityVal) {
    var searchedCities = getCity();

    while (searchedCities.indexOf(cityVal) !== -1) {
        searchedCities.splice(searchedCities.indexOf(cityVal), 1)
    }
    searchedCities.unshift(cityVal);
    while (searchedCities.length > 6) {
        searchedCities.pop()
    }
    setCity(searchedCities);

    populatePage()
}

function getCity() {
    return JSON.parse(localStorage.getItem("searchedCities")) || []
}

function setCity(val) {
    localStorage.setItem("searchedCities", JSON.stringify(val))
}