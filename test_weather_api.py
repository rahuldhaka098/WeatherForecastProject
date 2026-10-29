
import requests

# City we want to search
city = "Delhi"

try:
    # Step 1: Find the city's coordinates
    geo_url = "https://geocoding-api.open-meteo.com/v1/search"

    geo_params = {
        "name": city,
        "count": 1,
        "language": "en",
        "format": "json"
    }

    geo_response = requests.get(
        geo_url,
        params=geo_params,
        timeout=15
    )
    geo_response.raise_for_status()
    geo_data = geo_response.json()

    # Check whether the city was found
    if not geo_data.get("results"):
        print("City not found. Please try another city name.")
    else:
        place = geo_data["results"][0]

        latitude = place["latitude"]
        longitude = place["longitude"]

        print("City:", place["name"])
        print("Country:", place.get("country", "Unknown"))
        print("Latitude:", latitude)
        print("Longitude:", longitude)

        # Step 2: Request current weather
        weather_url = "https://api.open-meteo.com/v1/forecast"

        weather_params = {
            "latitude": latitude,
            "longitude": longitude,
            "current": (
                "temperature_2m,"
                "relative_humidity_2m,"
                "apparent_temperature,"
                "wind_speed_10m,"
                "weather_code"
            ),
            "timezone": "auto"
        }

        weather_response = requests.get(
            weather_url,
            params=weather_params,
            timeout=15
        )
        weather_response.raise_for_status()
        weather_data = weather_response.json()

        # Step 3: Display the weather information
        current = weather_data["current"]

        print("\n--- Current Weather ---")
        print("Temperature:", current["temperature_2m"], "°C")
        print("Feels like:", current["apparent_temperature"], "°C")
        print("Humidity:", current["relative_humidity_2m"], "%")
        print("Wind speed:", current["wind_speed_10m"], "km/h")
        print("Weather code:", current["weather_code"])
        print("Observation time:", current["time"])

except requests.exceptions.RequestException as error:
    print("Network or API error:", error)

except (KeyError, IndexError, TypeError, ValueError) as error:
    print("Could not process the weather data:", error)
