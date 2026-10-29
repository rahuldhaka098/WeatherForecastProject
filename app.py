
from flask import Flask, render_template, request
from datetime import datetime
import requests

app = Flask(__name__)

# Open-Meteo API addresses
GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
WEATHER_URL = "https://api.open-meteo.com/v1/forecast"


# Convert weather codes into readable descriptions
def get_weather_description(code):
    descriptions = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        56: "Freezing drizzle",
        57: "Freezing drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        66: "Freezing rain",
        67: "Heavy freezing rain",
        71: "Slight snowfall",
        73: "Moderate snowfall",
        75: "Heavy snowfall",
        77: "Snow grains",
        80: "Rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        85: "Snow showers",
        86: "Heavy snow showers",
        95: "Thunderstorm",
        96: "Thunderstorm with hail",
        99: "Thunderstorm with heavy hail"
    }

    return descriptions.get(code, "Weather conditions unavailable")


def get_weather_icon(code):
    if code == 0:
        return "☀️"
    elif code in (1, 2):
        return "🌤️"
    elif code == 3:
        return "☁️"
    elif code in (45, 48):
        return "🌫️"
    elif code in (51, 53, 55, 56, 57):
        return "🌦️"
    elif code in (61, 63, 65, 66, 67, 80, 81, 82):
        return "🌧️"
    elif code in (71, 73, 75, 77, 85, 86):
        return "❄️"
    elif code in (95, 96, 99):
        return "⛈️"
    else:
        return "🌡️"



# Homepage
@app.route("/", methods=["GET", "POST"])
def home():
    weather = None
    forecast = None
    error = None
    city = ""

    if request.method == "POST":
        city = request.form.get("city", "").strip()

        if not city:
            error = "Please enter a city name."

        else:
            try:
                # Find the city's coordinates
                geo_response = requests.get(
                    GEOCODING_URL,
                    params={
                        "name": city,
                        "count": 1,
                        "language": "en",
                        "format": "json"
                    },
                    timeout=15
                )
                geo_response.raise_for_status()
                geo_data = geo_response.json()

                if not geo_data.get("results"):
                    error = "City not found. Please check the spelling."

                else:
                    place = geo_data["results"][0]

                    latitude = place["latitude"]
                    longitude = place["longitude"]

                    city = place["name"]
                    country = place.get("country", "")

                    # Get current weather and a 5-day forecast
                    weather_response = requests.get(
                        WEATHER_URL,
                        params={
                            "latitude": latitude,
                            "longitude": longitude,
                            "current": (
                                "temperature_2m,"
                                "relative_humidity_2m,"
                                "apparent_temperature,"
                                "wind_speed_10m,"
                                "weather_code"
                            ),
                            "daily": (
                                "weather_code,"
                                "temperature_2m_max,"
                                "temperature_2m_min"
                            ),
                            "forecast_days": 5,
                            "timezone": "auto"
                        },
                        timeout=15
                    )
                    weather_response.raise_for_status()
                    data = weather_response.json()

                    current = data["current"]

                    weather = {
                        "city": city,
                        "country": country,
                        "temperature": current["temperature_2m"],
                        "feels_like": current["apparent_temperature"],
                        "humidity": current["relative_humidity_2m"],
                        "wind_speed": current["wind_speed_10m"],
                        "description": get_weather_description(
                            current["weather_code"]
                        ),
                        "icon": get_weather_icon(current["weather_code"]),
                        "time": current["time"]
                    }

                    # Prepare the daily forecast for the webpage
                    daily = data["daily"]
                    forecast = []

                    for i in range(len(daily["time"])):
                        forecast.append({
                            "date": datetime.strptime(
                                daily["time"][i], "%Y-%m-%d"
                            ).strftime("%a, %d %b"),
                            "description": get_weather_description(
                                daily["weather_code"][i]
                            ),
                            "icon": get_weather_icon(daily["weather_code"][i]),
                            "max_temp": daily["temperature_2m_max"][i],
                            "min_temp": daily["temperature_2m_min"][i]
                        })

            except requests.exceptions.Timeout:
                error = "The weather service took too long to respond."

            except requests.exceptions.RequestException:
                error = (
                    "Unable to connect to the weather service. "
                    "Please check your internet connection and try again."
                )

            except (KeyError, IndexError, TypeError, ValueError):
                error = (
                    "The weather service returned unexpected data. "
                    "Please try again later."
                )

    return render_template(
        "index.html",
        weather=weather,
        forecast=forecast,
        error=error,
        city=city
    )


# Start the local development server
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
