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
    }, 3000);
}

// main function
async function getWeather(city) {
    if (!city || city.trim() === '') {
        showMsg('Enter city first!', 'error');
        return;
    }

    // Clear previous data and show loading
    msg.style.display = 'block';
    msg.innerHTML = '⏳ Loading weather data...';
    msg.className = 'message loading';
    card.style.display = 'none';

    try {
        console.log('Searching for city:', city);
        
        // get coordinates
        let geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
        
        if (!geo.ok) {
            throw new Error('Geocoding API failed');
        }
        
        let geoJson = await geo.json();
        console.log('Geo response:', geoJson);

        if (!geoJson.results || geoJson.results.length === 0) {
            showMsg(`❌ City "${city}" not found`, 'error');
            return;
        }

        let data = geoJson.results[0];
        let lat = data.latitude;
        let lon = data.longitude;
        
        console.log(`Coordinates: ${lat}, ${lon}`);

        // get weather
        let weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m`;
        let res = await fetch(weatherUrl);
        
        if (!res.ok) {
            throw new Error('Weather API failed');
        }
        
        let wData = await res.json();
        console.log('Weather data:', wData);

        if (!wData.current_weather) {
            throw new Error('No weather data received');
        }

        let cur = wData.current_weather;
        let temp = cur.temperature;
        let wind = cur.windspeed;
        let code = cur.weathercode;

        // Get humidity safely
        let humidity = '--';
        if (wData.hourly && wData.hourly.relativehumidity_2m && wData.hourly.relativehumidity_2m.length > 0) {
            humidity = wData.hourly.relativehumidity_2m[0];
            if (humidity !== undefined && !isNaN(humidity)) {
                humidity = Math.round(humidity);
            }
        }

        // Update UI
        cityTxt.innerHTML = `${data.name}, ${data.country || 'Unknown'}`;
        tempTxt.innerHTML = `${Math.round(temp)}°C`;
        weatherTxt.innerHTML = getWeatherText(code);
        humidityTxt.innerHTML = humidity;
        windTxt.innerHTML = Math.round(wind);

        // Show weather card
        card.style.display = 'block';
        msg.style.display = 'none';
        
        console.log('Weather displayed successfully');

    } catch (e) {
        console.error('Detailed error:', e);
        showMsg(`❌ Error: ${e.message}. Check console for details.`, 'error');
        card.style.display = 'none';
    }
}

// weather text mapping
function getWeatherText(code) {
    const weatherMap = {
        0: '☀️ Clear sky',
        1: '🌤️ Mainly clear',
        2: '⛅ Partly cloudy',
        3: '☁️ Overcast',
        45: '🌫️ Fog',
        48: '🌫️ Fog',
        51: '🌧️ Light rain',
        53: '🌧️ Moderate rain',
        55: '🌧️ Heavy rain',
        61: '🌧️ Rain',
        63: '🌧️ Moderate rain',
        65: '🌧️ Heavy rain',
        71: '❄️ Snow',
        73: '❄️ Moderate snow',
        75: '❄️ Heavy snow',
        95: '⛈️ Thunderstorm'
    };
    
    if (weatherMap[code]) return weatherMap[code];
    if (code >= 51 && code <= 67) return '🌧️ Rain';
    if (code >= 71 && code <= 77) return '❄️ Snow';
    if (code >= 95) return '⛈️ Storm';
    return '🌥️ Cloudy';
}

// location weather
function getLocationWeather() {
    if (!navigator.geolocation) {
        showMsg('❌ Location not supported by your browser', 'error');
        return;
    }

    showMsg('📍 Getting your location...', 'loading');
    card.style.display = 'none';

    navigator.geolocation.getCurrentPosition(async (pos) => {
        let lat = pos.coords.latitude;
        let lon = pos.coords.longitude;
        
        showMsg('🌤️ Fetching weather...', 'loading');

        try {
            let res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            
            if (!res.ok) throw new Error('Weather fetch failed');
            
            let data = await res.json();

            if (!data.current_weather) {
                throw new Error('No weather data');
            }

            let cur = data.current_weather;
            
            cityTxt.innerHTML = '📍 Your Location';
            tempTxt.innerHTML = `${Math.round(cur.temperature)}°C`;
            weatherTxt.innerHTML = getWeatherText(cur.weathercode);
            humidityTxt.innerHTML = '--';
            windTxt.innerHTML = Math.round(cur.windspeed);

            card.style.display = 'block';
            msg.style.display = 'none';

        } catch (error) {
            console.error('Location error:', error);
            showMsg('❌ Failed to get weather for your location', 'error');
        }
    }, (error) => {
        console.error('Geolocation error:', error);
        showMsg('❌ Please allow location access to use this feature', 'error');
    });
}

// events
btn.onclick = () => getWeather(input.value);
locBtn.onclick = () => getLocationWeather();
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getWeather(input.value);
    }
});

// Load default city on startup
getWeather('London');
