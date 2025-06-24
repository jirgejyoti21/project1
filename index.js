const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const API_KEY = "4f42444b998630d183edd5090b687bbd"; //API key for OpenweatherMap API
const weatherCardsDiv = document.querySelector(".weather-cards"); // Assuming you have a container for the weather cards
const currentWeatherDiv = document.querySelector(".current-weather"); // Assuming you have a container for the current weather


// Function to create a weather card HTML based on weather data, city name, and index
const createWeatherCard = (weatherItem, cityName, index) => {
    // Use backticks for template literals
    if (index === 0) { // For the main weather card
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon"> <!-- Use 4x for main icon -->
                    <h4>${weatherItem.weather[0].description}</h4> <!-- Display weather description -->
                </div>`;
    } else { // For the 4-day forecast cards
        return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon"> <!-- Use 2x for smaller cards -->
                    <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </li>`;
    }
}

const getWeatherDetails = (cityName, lat, lon) => {
    // Use backticks and correct string interpolation for the API key
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    // Clear previous weather data
    currentWeatherDiv.innerHTML = "";
    weatherCardsDiv.innerHTML = "";

    fetch(WEATHER_API_URL)
        .then(res => {
            if (!res.ok) { // Check for HTTP errors
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
         //   console.log(data);

            // Filter the forecasts to get one forecast per day (ideally around midday)
            const uniqueForcastDays = [];
            const fourDaysForcast = data.list.filter(forecast => {
                const forcastDate = new Date(forecast.dt_txt).getDate();
                 const forecastHour = new Date(forecast.dt_txt).getHours();

                 // Keep the first forecast for each unique day that is around midday (10 AM to 2 PM)
                if (!uniqueForcastDays.includes(forcastDate) && forecastHour >= 10 && forecastHour <= 14) {
                    uniqueForcastDays.push(forcastDate);
                    return true; // Keep this forecast
                }
                return false; // Discard this forecast
            }).slice(0, 6); // Get up to 6 forecasts (1 for current day + 5 for next days)

            //console.log(fourDaysForcast);

            // Display the current day's weather (first item in the filtered list)
            if (fourDaysForcast.length > 0) {
                 currentWeatherDiv.innerHTML = createWeatherCard(fourDaysForcast[0], cityName, 0);
            }

            // Display the 5-day forecast (remaining items in the filtered list)
			let cardsHTML = "";
            fourDaysForcast.slice(1).forEach((weatherItem, index) => { // Start from the second element
                cardsHTML += createWeatherCard(weatherItem, cityName, index + 1); // Pass cityName and increment index
            });
			weatherCardsDiv.innerHTML = cardsHTML;
        })
        .catch(error => { // Catch potential errors from fetch or processing
            console.error("An error occurred while fetching the weather forecast:", error);
            alert("An error occurred while fetching the weather forecast! Please try again.");
        });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim(); //Get user entered city name and remove extra spaces
    if (!cityName) return; //Return if cityName is empty

    // Use backticks and correct string interpolation for the API key
    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    //Get entered city coordinaes(latitude,longitude,and name)from API response
    fetch(GEOCODING_API_URL)
        .then(res => {
            if (!res.ok) { // Check for HTTP errors
                 throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data=> {
            if (!data.length) {
                return alert(`No coordinates found for "${cityName}"`); // Added quotes for clarity
            }
            const { name, lat, lon } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(error => { // Catch potential errors from fetch or processing
             console.error("An error occurred while fetching the coordinates:", error);
            alert("An error occurred while fetching the coordinates! Please try again.");
        });
}
document.addEventListener('DOMContentLoaded', () => {
	const getUserCoordinates = () => {
     navigator.geolocation.getCurrentPosition(
		position => {
		const { latitude, longitude } = position.coords;
			const REVERSE_GEOCODING_URL=`https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            //Get city name from coordinates using reverse geocoding API 
			fetch(REVERSE_GEOCODING_URL)
        .then(res => {
            if (!res.ok) { // Check for HTTP errors
                 throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
			console.log("Reverse geocoding result:",data);
        const name=data[0]?.name; 
			getWeatherDetails(name, latitude, longitude);
		})
        .catch(error => { // Catch potential errors from fetch or processing
             console.error("An error occurred while fetching the coordinates:", error);
            alert("An error occurred while fetching the city!");
        
		});
			

			
			//getWeatherDetails("Your Location", latitude, longitude);	
		},
		error => {
			console.log(error);
		}
	)};
	//};
const locationButton = document.querySelector(".location-btn");
locationButton.addEventListener("click",getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e=> e.key === "Enter" && getCityCoordinates());
// Optional: Fetch weather details for a default city on page load
// window.addEventListener("load", () => {
//     getCityCoordinates("London"); // Replace "London" with your desired default city
	});
