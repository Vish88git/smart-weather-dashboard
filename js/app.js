// Your API key from OpenWeatherMap
const API_KEY = "34a053cb6f5ccdfc1337e3141786b9de";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// Step 1: Grab all the HTML elements we need to update
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const cityName = document.getElementById("cityName");
const weatherIcon = document.getElementById("weatherIcon");
const description = document.getElementById("description");
const temperature = document.getElementById("temperature");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const errorMsg = document.getElementById("errorMsg");

// Step 2: Listen for the button click
searchBtn.addEventListener("click", function () {
  const city = cityInput.value.trim();
  if (city === "") {
    errorMsg.textContent = "Please enter a city name.";
    return;
  }
  fetchWeather(city);
});

// Step 3: Also search when user presses Enter key
cityInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

// Step 4: The main API call function
async function fetchWeather(city) {
  errorMsg.textContent = "";
  const url = `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.cod !== 200) {
      errorMsg.textContent = "City not found. Please try again.";
      return;
    }

    updateUI(data);

  } catch (error) {
    errorMsg.textContent = "Something went wrong. Check your connection.";
  }
}

// Step 5: Update the UI with API data
function updateUI(data) {
  cityName.textContent = `${data.name}, ${data.sys.country}`;
  description.textContent = data.weather[0].description;
  temperature.textContent = `${Math.round(data.main.temp)}\u00B0C`;
  humidity.textContent = `Humidity: ${data.main.humidity}%`;
  windSpeed.textContent = `Wind: ${data.wind.speed} m/s`;
  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  weatherIcon.alt = data.weather[0].description;
 // NEW LINE - update map when city is searched
 updateMap(data.coord.lat, data.coord.lon, `${data.name}, ${data.sys.country}`);
 // Call AQI with coordinates from weather response
 fetchAQI(data.coord.lat, data.coord.lon);

}



// Step 6: Initialize the map
let map = L.map('map').setView([20.5937, 78.9629], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

let marker = null;

// Step 7: Function to update map position
function updateMap(lat, lon, cityLabel) {
  map.setView([lat, lon], 10);

  if (marker) {
    marker.remove();
  }

  marker = L.marker([lat, lon])
    .addTo(map)
    .bindPopup(cityLabel)
    .openPopup();
}

// Step 8: Use My Location button
const locationBtn = document.getElementById("locationBtn");

locationBtn.addEventListener("click", function () {
  if (!navigator.geolocation) {
    errorMsg.textContent = "Geolocation is not supported by your browser.";
    return;
  }

  locationBtn.textContent = "📍 Detecting location...";

  navigator.geolocation.getCurrentPosition(
    async function (position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        updateUI(data);
        updateMap(lat, lon, `${data.name}, ${data.sys.country}`);
      } catch (error) {
        errorMsg.textContent = "Could not fetch weather for your location.";
      }

      locationBtn.textContent = "📍 Use My Location";
    },
    function () {
      errorMsg.textContent = "Location access denied.";
      locationBtn.textContent = "📍 Use My Location";
    }
  );
});

// Step 9: Update map when city is searched
const originalUpdateUI = updateUI;

// AQI data lookup tables
const aqiLevels = {
  1: { label: "Good", class: "aqi-good", advice: "Air quality is excellent. Perfect for outdoor activities!" },
  2: { label: "Fair", class: "aqi-fair", advice: "Air quality is acceptable. Sensitive individuals should limit prolonged outdoor exposure." },
  3: { label: "Moderate", class: "aqi-moderate", advice: "Sensitive groups may experience health effects. Consider reducing outdoor activities." },
  4: { label: "Poor", class: "aqi-poor", advice: "Health effects possible for everyone. Limit outdoor activities and wear a mask." },
  5: { label: "Very Poor", class: "aqi-verypoor", advice: "Health alert! Avoid outdoor activities. Keep windows closed." }
};

// Fetch AQI data using lat/lon
async function fetchAQI(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const aqi = data.list[0].main.aqi;
    const components = data.list[0].components;

    updateAQI(aqi, components);

  } catch (error) {
    console.error("AQI fetch failed:", error);
  }
}

// Update AQI UI
function updateAQI(aqi, components) {
  const level = aqiLevels[aqi];

  const aqiBadge = document.getElementById("aqiBadge");
  const aqiLabel = document.getElementById("aqiLabel");
  const aqiAdvice = document.getElementById("aqiAdvice");

  aqiBadge.textContent = aqi;
  aqiBadge.className = `aqi-badge ${level.class}`;
  aqiLabel.textContent = level.label;
  aqiLabel.className = `aqi-label ${level.class}`;
  aqiAdvice.textContent = level.advice;

  document.getElementById("pm25").textContent = `PM2.5: ${components.pm2_5.toFixed(1)}`;
  document.getElementById("pm10").textContent = `PM10: ${components.pm10.toFixed(1)}`;
  document.getElementById("co").textContent = `CO: ${components.co.toFixed(1)}`;
}