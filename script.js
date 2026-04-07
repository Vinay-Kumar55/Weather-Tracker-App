// getting elements
let input = document.getElementById('cityName');
let btn = document.getElementById('searchBtn');
let locBtn = document.getElementById('locationBtn');

let msg = document.getElementById('message');
let card = document.getElementById('weatherCard');

let cityTxt = document.getElementById('city');
let tempTxt = document.getElementById('temp');
let weatherTxt = document.getElementById('weather');
let humidityTxt = document.getElementById('humidity');
let windTxt = document.getElementById('wind');


// message display
function showMsg(text, type) {
    msg.style.display = 'block';
    msg.innerHTML = text;
    msg.className = 'message ' + type;

    setTimeout(() => {
        msg.style.display = 'none';
    }, 2500);
}


// main function
async function getWeather(city) {

    if (!city) {
        showMsg('Enter city first!', 'error');
        return;
    }

    msg.style.display = 'block';
    msg.innerHTML = 'Loading...';
    card.style.display = 'none';

    try {
        // get coordinates
        let geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}`);
        let geoJson = await geo.json();

        if (!geoJson.results) {
            showMsg('City not found', 'error');
            return;
        }

        let data = geoJson.results[0];
        let lat = data.latitude;
        let lon = data.longitude;

        // get weather
        let res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m`);
        let wData = await res.json();

        let cur = wData.current_weather;

        let temp = cur.temperature;
        let wind = cur.windspeed;
        let code = cur.weathercode;

        let humidity = '--';
        if (wData.hourly && wData.hourly.relativehumidity_2m) {
            humidity = wData.hourly.relativehumidity_2m[0];
        }

        cityTxt.innerHTML = data.name + ', ' + data.country;
        tempTxt.innerHTML = Math.round(temp) + '°C';
        weatherTxt.innerHTML = getText(code);
        humidityTxt.innerHTML = humidity;
        windTxt.innerHTML = Math.round(wind);

        card.style.display = 'block';
        msg.style.display = 'none';

    } catch (e) {
        showMsg('Error getting data', 'error');
        console.log(e);
    }
}


// weather text
function getText(c) {
    if (c == 0) return 'Clear';
    if (c <= 2) return 'Cloudy';
    if (c == 3) return 'Very Cloudy';
    if (c >= 45 && c <= 48) return 'Fog';
    if (c >= 51 && c <= 67) return 'Rain';
    if (c >= 71 && c <= 77) return 'Snow';
    if (c >= 95) return 'Storm';

    return 'Normal';
}


// location weather
function getLocationWeather() {

    if (!navigator.geolocation) {
        showMsg('Location not supported', 'error');
        return;
    }

    showMsg('Getting location...', 'loading');
    card.style.display = 'none';

    navigator.geolocation.getCurrentPosition(async (pos) => {

        let lat = pos.coords.latitude;
        let lon = pos.coords.longitude;

        try {
            let res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            let data = await res.json();

            let cur = data.current_weather;

            cityTxt.innerHTML = 'Your Location';
            tempTxt.innerHTML = Math.round(cur.temperature) + '°C';
            weatherTxt.innerHTML = getText(cur.weathercode);
            humidityTxt.innerHTML = '--';
            windTxt.innerHTML = Math.round(cur.windspeed);

            card.style.display = 'block';
            msg.style.display = 'none';

        } catch {
            showMsg('Failed to load location weather', 'error');
        }

    }, () => {
        showMsg('Allow location access', 'error');
    });
}


// events
btn.onclick = function () {
    getWeather(input.value);
};

locBtn.onclick = function () {
    getLocationWeather();
};

input.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        getWeather(input.value);
    }
});


// default
getWeather('Delhi');
