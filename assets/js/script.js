var listOfCities;
var searchFormEl = $('.city-search-input');
var searchBtnEl = $('.city-search-btn');
var cityListEl = $('.city-list');
var weatherApiUrl = "https://api.weatherbit.io/v2.0/forecast/daily?&key=9060a4943ca944f1987566287f545732&";
var firstLoad = false;

//Search for new city
searchBtnEl.on("click", function (event) {
  event.preventDefault();
  let city = searchFormEl.val();
  callWeather(city);
  addCity(city);
  displayCities();
});

//Call Weather
function callWeather(location) {
  if (location.city !== null) {
    let concatApiUrl = weatherApiUrl + "city=" + city;
    fetchWeather(concatApiUrl, false);
  }
  else {
    let concatApiUrl = weatherApiUrl + "lon=" + lon + "&lat=" + lat;
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
      let windSpeed = data.data[0].wind_spd;
      let uvIndex = data.data[0].uv;

      $(".city-card-title").append(cityName + " (" + date + ") <img src=\"./assets/images/" + weatherIcon + ".png\" alt=\"" + weatherIcon + "\">");
      $(".temperature").append(temperature + "&#8451;");
      $(".humidity").append(humidity + "%");
      $(".wind-speed").append(windSpeed + "m/s");
      $(".uv-index").append("<span>" + uvIndex + "</span>");

      //Assign UV Scale
      if (uvIndex >= 0 && uvIndex < 3) {
        $(".uv-index").children(".span").addClass("low");
      }
      else if (uvIndex >= 3 && uvIndex < 6) {
        $(".uv-index").children(".span").addClass("moderate");
      }
      else if (uvIndex >= 6 && uvIndex < 8) {
        $(".uv-index").children(".span").addClass("high");
      }
      else if (uvIndex >= 8 && uvIndex < 11) {
        $(".uv-index").children(".span").addClass("very-high");
      }
      else {
        $(".uv-index").children(".span").addClass("extreme");
      }

      //Next 5 Day Forecast
      for (let i = 1; i < 6; i++) {
        console.log($(".day-" + [i]));

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
      console.log(error);
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
    cityListEl.append("<li class=\"list-group-item\">" + listOfCities[index] + "</li>");
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
    if (firstLoad === false) {
      let location = {
        city: null,
        lon: position.coords.longitude,
        lat: position.coords.latitude,
        firstLoad: false
      }
      callWeather(location);
      firstLoad = true;
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