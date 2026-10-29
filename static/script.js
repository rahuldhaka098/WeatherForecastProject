const searchForm = document.querySelector(".search-form");
const searchButton = searchForm.querySelector('button[type="submit"]');
const cityInput = searchForm.querySelector('input[name="city"]');
const clearButton = document.querySelector(".clear-button");

const unitButtons = document.querySelectorAll(".unit-button");
const temperatureElements = document.querySelectorAll(".temperature-number");
const unitLabels = document.querySelectorAll("[data-celsius-unit]");


const loadingOverlay = document.querySelector("#loading-overlay");

const recentSearchesContainer = document.querySelector("#recent-searches");
const recentSearchesList = document.querySelector("#recent-searches-list");
const clearHistoryButton = document.querySelector("#clear-history-button");


function showLoadingScreen() {
    if (loadingOverlay) {
        loadingOverlay.hidden = false;
    }
}

function hideLoadingScreen() {
    if (loadingOverlay) {
        loadingOverlay.hidden = true;
    }
}



// Show a loading state when searching
searchForm.addEventListener("submit", function (event) {
    const city = cityInput.value.trim();
    if (city !== "") {
    showLoadingScreen();
    }
    if (city !== "") {
    saveRecentSearch(city);
    }

    if (city === "") {
        return;
    }

    if (searchButton.disabled) {
        event.preventDefault();
        return;
    }

    searchButton.textContent = "Searching...";
    searchButton.disabled = true;
    searchButton.setAttribute("aria-busy", "true");
    clearButton.disabled = true;
    clearButton.textContent = "Please wait...";
});

// Clear the search and return to the homepage
clearButton.addEventListener("click", function () {
    window.location.href = "/";
});


let selectedUnit = "celsius";


unitButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        selectedUnit = button.dataset.unit;

        const thermometerIcon = document.querySelector(".thermometer-icon");

        if (thermometerIcon) {
            thermometerIcon.animate(
                [
                    { transform: "rotate(0deg)" },
                    { transform: "rotate(360deg)" }
                ],
                {
                    duration: 500,
                    easing: "ease-in-out"
                }
            );
        }
        unitButtons.forEach(function (unitButton) {
            const isSelected = unitButton.dataset.unit === selectedUnit;

            unitButton.classList.toggle("active", isSelected);
            unitButton.setAttribute("aria-pressed", String(isSelected));
        });

        console.log("Selected temperature unit:", selectedUnit);
        temperatureElements.forEach(function (element) {
            const celsius = Number(element.dataset.celsius);

            if (selectedUnit === "fahrenheit") {
                element.textContent = celsiusToFahrenheit(celsius).toFixed(1);
            } else {
                element.textContent = celsius;
            }
        });
        unitLabels.forEach(function (label) {
            label.textContent = selectedUnit === "fahrenheit" ? "°F" : "°C";
        });
        drawTemperatureChart();
    });
});

function celsiusToFahrenheit(celsius) {
    return (celsius * 9 / 5) + 32;
}



if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
}

window.addEventListener("load", function () {
    hideLoadingScreen();
    renderRecentSearches();
    requestAnimationFrame(function () {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: "instant"
        });
    });
});


const RECENT_SEARCHES_KEY = "weatherRecentSearches";
const MAX_RECENT_SEARCHES = 5;

function getRecentSearches() {
    try {
        const savedSearches = localStorage.getItem(RECENT_SEARCHES_KEY);
        const parsedSearches = savedSearches
            ? JSON.parse(savedSearches)
            : [];

        return Array.isArray(parsedSearches)
            ? parsedSearches.filter(
                city => typeof city === "string" && city.trim() !== ""
            ).slice(0, MAX_RECENT_SEARCHES)
            : [];
    } catch (error) {
        return [];
    }
}

function saveRecentSearch(city) {
    const searches = getRecentSearches();
    const normalizedCity = city.trim();

    const updatedSearches = [
        normalizedCity,
        ...searches.filter(
            existingCity =>
                existingCity.toLowerCase() !== normalizedCity.toLowerCase()
        )
    ].slice(0, MAX_RECENT_SEARCHES);

    try {
        localStorage.setItem(
            RECENT_SEARCHES_KEY,
            JSON.stringify(updatedSearches)
        );
    } catch (error) {
        console.warn("Could not save recent searches.", error);
    }
}

function renderRecentSearches() {
    if (!recentSearchesContainer || !recentSearchesList) {
        return;
    }

    const searches = getRecentSearches();

    recentSearchesList.replaceChildren();

    if (searches.length === 0) {
        recentSearchesContainer.hidden = true;
        return;
    }

    searches.forEach(function (city) {
        const cityButton = document.createElement("button");

        cityButton.type = "button";
        cityButton.className = "recent-city-button";
        cityButton.textContent = city;

        cityButton.addEventListener("click", function () {
            cityInput.value = city;
            searchForm.requestSubmit();
        });

        recentSearchesList.appendChild(cityButton);
    });

    recentSearchesContainer.hidden = false;
}


if (clearHistoryButton) {
    clearHistoryButton.addEventListener("click", function () {
        try {
            localStorage.removeItem(RECENT_SEARCHES_KEY);
        } catch (error) {
            console.warn("Could not clear recent searches.", error);
        }

        renderRecentSearches();
    });
}


// ===== Temperature Forecast Chart =====
const temperatureChartCanvas = document.querySelector("#temperature-chart");
const temperatureChartStatus = document.querySelector("#temperature-chart-status");
const forecastChartDataElement = document.querySelector(
    "#forecast-chart-data"
);

let forecastChartData = [];

if (forecastChartDataElement) {
    try {
        forecastChartData = JSON.parse(
            forecastChartDataElement.textContent
        );
    } catch (error) {
        console.error("Could not read forecast chart data.", error);
    }
}
if (!Array.isArray(forecastChartData) || forecastChartData.length === 0) {
    if (temperatureChartStatus) {
        temperatureChartStatus.textContent =
            "Forecast data is not available yet.";
    }
}

function drawTemperatureChart() {
    if (!temperatureChartCanvas || forecastChartData.length === 0) {
        return;
    }

    const context = temperatureChartCanvas.getContext("2d");
        const chartWidth = temperatureChartCanvas.clientWidth;
        const chartHeight = temperatureChartCanvas.clientHeight;

        temperatureChartCanvas.width = chartWidth;
        temperatureChartCanvas.height = chartHeight;

        context.clearRect(0, 0, chartWidth, chartHeight);

        const validForecast = forecastChartData.filter(day =>
            Number.isFinite(Number(day.max_temp)) &&
            Number.isFinite(Number(day.min_temp))
        );

        if (validForecast.length === 0) {
        if (temperatureChartStatus) {
                temperatureChartStatus.textContent =
                    "No valid temperature data is available for the chart.";
            }
            return;
        }

         const convertChartTemperature = temperature =>
            selectedUnit === "fahrenheit"
                ? celsiusToFahrenheit(temperature)
                : temperature;
      

        const allTemperatures = validForecast.flatMap(day => [
            convertChartTemperature(Number(day.max_temp)),
            convertChartTemperature(Number(day.min_temp))
        ]);

        const minTemperature = Math.min(...allTemperatures);
        const maxTemperature = Math.max(...allTemperatures);
        const temperatureRange = Math.max(
            maxTemperature - minTemperature,
            1
        );

        const chartPadding = {
            top: 20,
            right: 16,
            bottom: 40,
            left: 38
        };

        const plotWidth =
            chartWidth - chartPadding.left - chartPadding.right;

        const plotHeight =
            chartHeight - chartPadding.top - chartPadding.bottom;
        const getXPosition = index =>
            chartPadding.left +
            (validForecast.length === 1
                ? plotWidth / 2
                : (index / (validForecast.length - 1)) * plotWidth);

                            // Draw horizontal grid lines and temperature labels.
            context.font = "12px sans-serif";
            context.textAlign = "right";
            context.textBaseline = "middle";

            for (let i = 0; i <= 4; i++) {
                const temperature = maxTemperature - (temperatureRange * i / 4);
                const y = chartPadding.top + (plotHeight * i / 4);

                context.beginPath();
                context.strokeStyle = "#e2e8f0";
                context.lineWidth = 1;
                context.moveTo(chartPadding.left, y);
                context.lineTo(chartWidth - chartPadding.right, y);
                context.stroke();

                context.fillStyle = "#64748b";
                context.fillText(
                    `${Math.round(temperature)}°`,
                    chartPadding.left - 8,
                    y
                );
            }

            const getYPosition = temperature =>
                chartPadding.top +
                ((maxTemperature - temperature) / temperatureRange) * plotHeight;

            // Draw the high and low temperature lines.
            function drawTemperatureLine(key, color) {
                context.beginPath();
                context.strokeStyle = color;
                context.lineWidth = 3;
                context.lineJoin = "round";
                context.lineCap = "round";

                validForecast.forEach((day, index) => {
                    const x = getXPosition(index);
                    const y = getYPosition(
                        convertChartTemperature(Number(day[key]))
                    );

                    if (index === 0) {
                        context.moveTo(x, y);
                    } else {
                        context.lineTo(x, y);
                    }
                });

                context.stroke();

                // Draw a circle at each forecast temperature.
                validForecast.forEach((day, index) => {
                    const x = getXPosition(index);
                    const y = getYPosition(Number(day[key]));

                    context.beginPath();
                    context.fillStyle = color;
                    context.arc(x, y, 4, 0, Math.PI * 2);
                    context.fill();
                });
            }

            drawTemperatureLine("max_temp", "#f97316");
            drawTemperatureLine("min_temp", "#0ea5e9");

            // Add forecast-day labels along the bottom.
            context.fillStyle = "#475569";
            context.font = "11px sans-serif";
            context.textAlign = "center";
            context.textBaseline = "top";

            validForecast.forEach((day, index) => {
                const date = new Date(`${day.date}T12:00:00`);
                const label = date.toLocaleDateString("en-IN", {
                    weekday: "short"
                });

                context.fillText(
                    label,
                    getXPosition(index),
                    chartHeight - chartPadding.bottom + 12
                );
            });

            if (temperatureChartStatus) {
                temperatureChartStatus.textContent =
                    "Orange: daily high · Blue: daily low";
            }


       
    if (!context) {
        if (temperatureChartStatus) {
            temperatureChartStatus.textContent =
                "Your browser cannot display the temperature chart.";
        }
        return;
    }

    if (temperatureChartStatus) {
        temperatureChartStatus.textContent =
            "Forecast data is ready for the chart.";
    }
}
drawTemperatureChart();
// Redraw the temperature chart when the window is resized.
window.addEventListener("resize", function () {
    drawTemperatureChart();
});
// ===== Dynamic Weather Background =====
function updateWeatherBackground() {
    const descriptionElement = document.querySelector(
        "#current-weather-description"
    );

    if (!descriptionElement) {
        return;
    }

    const description = descriptionElement.textContent.toLowerCase();
    const body = document.body;

    body.classList.remove(
        "weather-sunny",
        "weather-cloudy",
        "weather-rainy"
    );

    if (
        description.includes("rain") ||
        description.includes("drizzle") ||
        description.includes("shower") ||
        description.includes("thunderstorm")
    ) {
        body.classList.add("weather-rainy");
    } else if (
        description.includes("cloud") ||
        description.includes("overcast") ||
        description.includes("fog") ||
        description.includes("mist")
    ) {
        body.classList.add("weather-cloudy");
    } else {
        body.classList.add("weather-sunny");
    }
}

updateWeatherBackground();


/* ===== Rahul's Welcome Screen ===== */

const welcomeScreen = document.querySelector("#welcome-screen");
const getStartedButton = document.querySelector("#get-started-button");

const WELCOME_SESSION_KEY = "rahulWeatherWelcomeStarted";

if (welcomeScreen && getStartedButton) {
    // Keep the welcome screen hidden after it has been dismissed
    // during the current browser tab session.
    try {
        if (sessionStorage.getItem(WELCOME_SESSION_KEY) === "true") {
            welcomeScreen.style.display = "none";
        }
    } catch (error) {
        // Continue normally if session storage is unavailable.
    }

    getStartedButton.addEventListener("click", function () {
        welcomeScreen.classList.add("hide");

        try {
            sessionStorage.setItem(WELCOME_SESSION_KEY, "true");
        } catch (error) {
            // The button still works if storage is unavailable.
        }

        window.setTimeout(function () {
            welcomeScreen.style.display = "none";
        }, 500);
    });
}




/* ===== Welcome Screen: Fixed Version ===== */

(function () {
    const welcomeScreen = document.querySelector("#welcome-screen");
    const getStartedButton = document.querySelector("#get-started-button");
    const searchForm = document.querySelector(".search-form");

    const SKIP_WELCOME_ONCE_KEY = "rahulWeatherSkipWelcomeOnce";

    if (!welcomeScreen || !getStartedButton) {
        return;
    }

    // If the previous page load was caused by a city search,
    // hide the welcome screen on this response only.
    let skipWelcomeOnce = false;

    try {
        skipWelcomeOnce =
            sessionStorage.getItem(SKIP_WELCOME_ONCE_KEY) === "true";

        if (skipWelcomeOnce) {
            sessionStorage.removeItem(SKIP_WELCOME_ONCE_KEY);
        }
    } catch (error) {
        // The welcome screen still works if storage is unavailable.
    }

    if (skipWelcomeOnce) {
        welcomeScreen.style.display = "none";
    }

    // Mark a city search so the welcome screen does not cover
    // the dashboard returned by the Flask POST request.
    if (searchForm) {
        searchForm.addEventListener("submit", function (event) {
            const cityInput = searchForm.querySelector('input[name="city"]');

            if (cityInput && cityInput.value.trim() !== "") {
                try {
                    sessionStorage.setItem(SKIP_WELCOME_ONCE_KEY, "true");
                } catch (error) {
                    // Searching should still work if storage is unavailable.
                }
            }
        });
    }

    // Hide the welcome screen when Get Started is clicked.
    getStartedButton.addEventListener("click", function () {
        welcomeScreen.classList.add("hide");

        window.setTimeout(function () {
            welcomeScreen.style.display = "none";
        }, 500);
    });
})();
