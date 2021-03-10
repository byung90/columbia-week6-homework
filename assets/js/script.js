var listOfCities;
var searchFormEl = $('.city-search-input');
var searchBtnEl = $('.city-search-btn');
var cityListEl = $('.city-list');
var weatherApiUrl = "https://api.weatherbit.io/v2.0/forecast/daily?&key=9060a4943ca944f1987566287f545732&";
var firstLoad = true;

//Search for new city
searchBtnEl.on("click", function (event) {
  event.preventDefault();
  let city = searchFormEl.val();

  if (listOfCities.indexOf(city) === -1) {
    addCity(city);
  }
  let location = {
    city: city,
    lon: null,
    lat: null,
    firstLoad: false
  };
  callWeather(location);
  displayCities();
});

//Load from saved city list
cityListEl.on("click", function (event) {
  console.log($(event.target).attr("class"));
  if ($(event.target).attr("class") === "list-group-item city") {
    let city = ($(event.target).text());
    let location = {
      city: city,
      lon: null,
      lat: null,
      firstLoad: false
    };
    callWeather(location);
  }
})


function loadWeatherFromSavedCity() {

}

//Call Weather
function callWeather(location) {
  if (location.city !== null) {
    let concatApiUrl = weatherApiUrl + "city=" + location.city;
    fetchWeather(concatApiUrl, false);
  }
  else {
    let concatApiUrl = weatherApiUrl + "lon=" + location.lon + "&lat=" + location.lat;
    fetchWeather(concatApiUrl, location.firstLoad);
  }
}

//Fetch Weather
function fetchWeather(concatApiUrl, firstLoad) {
  console.log(concatApiUrl);
  fetch(concatApiUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data);
      let cityName = data.city_name;
      let date = data.data[0].datetime;
      let weatherIcon = data.data[0].weather.icon;
      let temperature = data.data[0].temp;
      let humidity = data.data[0].rh;
      let windSpeed = data.data[0].wind_spd.toFixed(2);
      let uvIndex = data.data[0].uv.toFixed(2);
      let currentTemperatureEl = $(".current-temperature");

      currentTemperatureEl.children().remove();

      currentTemperatureEl.append("<h1 class=\"city-card-title\"></h1>");
      currentTemperatureEl.append("<p class=\"temperature\">Temperature: </p>");
      currentTemperatureEl.append("<p class=\"humidity\">Humdity: </p>");
      currentTemperatureEl.append("<p class=\"wind-speed\">Wind Speed: </p>");
      currentTemperatureEl.append("<p class=\"uv-index\">UV Index: </p>");

      $(".city-card-title").append(cityName + " (" + date + ") <img src=\"./assets/images/" + weatherIcon + ".png\" alt=\"" + weatherIcon + "\">");
      $(".temperature").append(temperature + "&#8451;");
      $(".humidity").append(humidity + "%");
      $(".wind-speed").append(windSpeed + "m/s");
      $(".uv-index").append("<span>" + uvIndex + "</span>");

      //Assign UV Scale
      if (uvIndex >= 0 && uvIndex < 3) {
        $(".uv-index").children("span").addClass("low uvSpan");
      }
      else if (uvIndex >= 3 && uvIndex < 6) {
        $(".uv-index").children("span").addClass("moderate uvSpan");
      }
      else if (uvIndex >= 6 && uvIndex < 8) {
        $(".uv-index").children("span").addClass("high uvSpan");
      }
      else if (uvIndex >= 8 && uvIndex < 11) {
        $(".uv-index").children("span").addClass("very-high uvSpan");
      }
      else {
        $(".uv-index").children("span").addClass("extreme uvSpan");
      }

      //Remove 5 Day Forecast to initialize
      $(".forecast-list").children().remove();

      //Next 5 Day Forecast
      for (let i = 1; i < 6; i++) {
        $(".forecast-list").append("<div class=\"card day-" + i + "\"></div>");
        $(".forecast-list").children(".day-" + [i]).append("<h3></h3>");
        $(".forecast-list").children(".day-" + [i]).append("<p></p>");
        $(".forecast-list").children(".day-" + [i]).append("<p>Temp: </p>");
        $(".forecast-list").children(".day-" + [i]).append("<p>Humidity: </p>");


        let futureDayEl = $(".day-" + [i]);
        let futureDate = data.data[i].datetime;
        let futureIcon = data.data[i].weather.icon;
        let futureTemp = data.data[i].temp;
        let futureHumidity = data.data[i].rh;

        futureDayEl.children("h3").append(futureDate);
        futureDayEl.children("p").first().append("<img src=\"./assets/images/" + futureIcon + ".png\" alt=\"" + futureIcon + "\">");
        futureDayEl.children("p").eq(1).append(futureTemp + "&#8451;");
        futureDayEl.children("p").last().append(futureHumidity + "%");

        if (firstLoad) {
          $("#loading-modal").modal('hide');
        }
      }
    })
    .catch(function (error) {
      listOfCities.pop();
      displayCities();
      window.alert("Enter valid city");
    })
}

//Add new city
function addCity(city) {
  listOfCities.push(city);
  localStorage.setItem("listOfCities", JSON.stringify(listOfCities));
};

//Display Cities
function displayCities() {
  cityListEl.children().remove();
  $(listOfCities).each(function (index) {
    cityListEl.append("<li class=\"list-group-item city\">" + listOfCities[index] + "</li>");
  });
};

//Load Cities
function loadListOfCities() {
  if (JSON.parse(localStorage.getItem("listOfCities") !== null)) {
    listOfCities = JSON.parse(localStorage.getItem("listOfCities"));
    displayCities();
  }
  else {
    listOfCities = [];
  }
};

function getCurrentLocation() {
  navigator.geolocation.watchPosition(function (position) {
    if (firstLoad === true) {
      let location = {
        city: null,
        lon: position.coords.longitude,
        lat: position.coords.latitude,
        firstLoad: true
      }
      callWeather(location);
      firstLoad = false;
    }
  },
    function (error) {
      console.log(error);
      if (error.code == error.PERMISSION_DENIED)
        window.alert("User denied current location.");
    });
}

$(window).on('load', function (event) {
  event.preventDefault();
  getCurrentLocation();
  loadListOfCities();
  $("#loading-modal").modal('show');
});

