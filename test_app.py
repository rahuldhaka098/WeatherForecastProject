from app import app, get_weather_description, get_weather_icon


def test_homepage_loads():
    app.config["TESTING"] = True

    with app.test_client() as client:
        response = client.get("/")

    assert response.status_code == 200


def test_weather_description_for_clear_sky():
    assert get_weather_description(0) == "Clear sky"


def test_weather_description_for_rain():
    assert get_weather_description(61) == "Slight rain"


def test_weather_description_for_unknown_code():
    assert get_weather_description(999) == "Weather conditions unavailable"


def test_weather_icon_for_clear_sky():
    assert get_weather_icon(0) == "☀️"


def test_weather_icon_for_thunderstorm():
    assert get_weather_icon(95) == "⛈️"


def test_weather_icon_for_unknown_code():
    assert get_weather_icon(999) == "🌡️"