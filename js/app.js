// Your API key from OpenWeatherMap
const API_KEY = "eafa2862f9b8dbef92ab2e675d2e9a13";
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
}