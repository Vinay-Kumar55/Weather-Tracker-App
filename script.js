// Get all HTML elements we need
let cityInput = document.getElementById("cityName");
let searchBtn = document.getElementById("searchBtn");
let locationBtn = document.getElementById("locationBtn");
let messageDiv = document.getElementById("message");
let weatherCard = document.getElementById("weatherCard");
let cityDisplay = document.getElementById("city");
let tempDisplay = document.getElementById("temp");
let weatherDisplay = document.getElementById("weather");
let humidityDisplay = document.getElementById("humidity");
let windDisplay = document.getElementById("wind");

// Show message function (error or loading)
function showMessage(text, type) {
    messageDiv.style.display = "block";
    messageDiv.innerHTML = text;
    messageDiv.className = "message " + type;

    // Hide message after 3 seconds if not loading
    if (type !== "loading") {
        setTimeout(() => {
            messageDiv.style.display = "none";
        }, 3000);
    }
}

// Hide message
function hideMessage() {
    messageDiv.style.display = "none";
}

// Get weather data from API
async function getWeather(city) {
    if (city === "") {
        showMessage("Please enter a city name", 'error');
        return;
    }

    // Show loading
    showMessage("Loading weather data...", "loading");
    weatherCard.style.display = 'none';

    try {
        // First get coordinates from city name
        let geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`;
        let geoResponse = await fetch(geoUrl);
        let geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            showMessage("City not found! Try another name", "error"); // ✅ Fixed: added missing )
            return;
        }

        let lat = geoData.results[0].latitude;
        let lon = geoData.results[0].longitude;
        let realCityName = geoData.results[0].name;
        let country = geoData.results[0].country;

        // Now get weather data - ✅ Fixed: changed " to `
        let weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m&timezone=auto`;
        let weatherResponse = await fetch(weatherUrl);
        let weatherData = await weatherResponse.json();

        let current = weatherData.current_weather;
        let temp = current.temperature;
        let wind = current.windspeed;
        let weatherCode = current.weathercode;

        // Get humidity from hourly data
        let humidity = "--";
        if (weatherData.hourly && weatherData.hourly.relativehumidity_2m) {
            humidity = weatherData.hourly.relativehumidity_2m[0];
        }

        // Convert weather code to text
        let weatherText = getWeatherText(weatherCode);

        // Show weather card with data
        cityDisplay.innerHTML = realCityName + ", " + country;
        tempDisplay.innerHTML = Math.round(temp) + "°C";
        weatherDisplay.innerHTML = weatherText;
        humidityDisplay.innerHTML = humidity;
        windDisplay.innerHTML = Math.round(wind);

        weatherCard.style.display = "block";
        hideMessage();

    } catch (error) {
        showMessage("Something went wrong! Try again", "error");
        console.log(error);
    }
}

// Convert weather code to simple text
function getWeatherText(code) {
    if (code === 0) return "☀️ Clear Sky";
    if (code === 1 || code === 2) return "⛅ Partly Cloudy";
    if (code === 3) return '☁️ Cloudy';
    if (code >= 45 && code <= 48) return "🌫️ Foggy";
    if (code >= 51 && code <= 67) return "🌧️ Rainy";
    if (code >= 71 && code <= 77) return "❄️ Snowy";
    if (code >= 80 && code <= 82) return "🌧️ Rain Showers";
    if (code >= 95 && code <= 99) return "⛈️ Thunderstorm";
    return "🌤️ Normal";
}

// Get weather using user's current location
function getLocationWeather() {
    if (!navigator.geolocation) {
        showMessage("Your browser does not support location", "error");
        return;
    }

    showMessage("Getting your location...", "loading");
    weatherCard.style.display = "none";

    navigator.geolocation.getCurrentPosition(async function(position) {
            let lat = position.coords.latitude;
            let lon = position.coords.longitude;

            try {
                // ✅ Fixed: changed " to `
                let weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m&timezone=auto`;
                let weatherResponse = await fetch(weatherUrl);
                let weatherData = await weatherResponse.json();

                let current = weatherData.current_weather;
                let temp = current.temperature;
                let wind = current.windspeed;
                let weatherCode = current.weathercode;

                let humidity = "--";
                if (weatherData.hourly && weatherData.hourly.relativehumidity_2m) {
                    humidity = weatherData.hourly.relativehumidity_2m[0];
                }

                let weatherText = getWeatherText(weatherCode);

                cityDisplay.innerHTML = "📍 Your Location";
                // ✅ Fixed: changed " to `
                tempDisplay.innerHTML = `${Math.round(temp)}°C`;
                weatherDisplay.innerHTML = weatherText;
                humidityDisplay.innerHTML = humidity;
                windDisplay.innerHTML = Math.round(wind);

                weatherCard.style.display = "block";
                hideMessage();

            } catch (error) {
                showMessage("Could not get weather for your location", "error");
            }
        },
        function(error) {
            if (error.code === 1) {
                showMessage("Please allow location access", "error");
            } else {
                showMessage("Could not get your location", "error");
            }
        });
}

// Button click events
searchBtn.addEventListener("click", function() {
    getWeather(cityInput.value);
});

locationBtn.addEventListener("click", function() {
    getLocationWeather();
});

// Press Enter key to search
cityInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        getWeather(cityInput.value);
    }
});

// Load default city when page opens
getWeather("Hyderabad");
