const apiKey = "e616a721f2021313b3441b18d78fb42c";

window.onload = function () {
    let savedCity = localStorage.getItem("city");
    if (savedCity) {
        getWeather(savedCity);
    }
};

function getWeather(cityInput) {
    let city = cityInput || document.getElementById("city").value.trim();

    if (city === "") {
        alert("Please enter city name");
        return;
    }

    document.getElementById("weather").innerHTML = "Loading...";

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
        .then(res => res.json())
        .then(data => {
            console.log(data);

            if (data.cod !== 200) {
                document.getElementById("weather").innerHTML = "❌ " + data.message;
                return;
            }

            displayData(data);
            localStorage.setItem("city", city);
        })
        .catch(() => {
            document.getElementById("weather").innerHTML = "Error fetching data";
        });
}

function getLocation() {
    document.getElementById("weather").innerHTML = "Getting location...";

    navigator.geolocation.getCurrentPosition(position => {
        let lat = position.coords.latitude;
        let lon = position.coords.longitude;

        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
            .then(res => res.json())
            .then(data => {
                if (data.cod !== 200) {
                    document.getElementById("weather").innerHTML = "❌ " + data.message;
                    return;
                }

                displayData(data);
            })
            .catch(() => {
                document.getElementById("weather").innerHTML = "Error fetching location weather";
            });

    }, () => {
        document.getElementById("weather").innerHTML = "Location access denied";
    });
}

function displayData(data) {
    if (!data.main || !data.weather) {
        document.getElementById("weather").innerHTML = "No data available";
        return;
    }

    let iconCode = data.weather[0].icon;
    let iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    let temp = Math.round(data.main.temp);

    document.getElementById("weather").innerHTML = `
    <h2>${data.name}</h2>

    <img src="${iconUrl}" alt="weather icon"
         onerror="this.style.display='none'; this.nextElementSibling.style.display='block'" />

    <p style="display:none; font-size:40px;">☁️</p>

    <p style="font-size:30px;">🌡️ ${temp}°C</p>
    <p>☁️ ${data.weather[0].description}</p>
    <p>💧 Humidity: ${data.main.humidity}%</p>
    <p>🌬️ Wind: ${data.wind.speed} km/h</p>
`;
}
