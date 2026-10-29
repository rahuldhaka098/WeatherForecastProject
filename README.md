# Weather Forecast Web Application

## 1. Project Overview

Weather Forecast is a web-based application developed using Python, Flask, HTML, CSS, and JavaScript. It allows users to search for a city and view its current weather conditions and five-day forecast.

The application retrieves weather information from the Open-Meteo API and presents it through a responsive dashboard.

## 2. Features

- Search for weather by city name
- Display current temperature and feels-like temperature
- Display humidity and wind speed
- Show weather conditions with corresponding icons
- Display a five-day weather forecast
- Validate empty and invalid city searches
- Show loading feedback during searches
- Provide a Clear button to return to the homepage
- Responsive layout for different screen sizes
- Handle weather-service timeouts and connection errors
- Include automated tests using pytest

## 3. Technologies Used

- Python
- Flask
- Requests
- HTML5
- CSS3
- JavaScript
- Open-Meteo Geocoding API
- Open-Meteo Weather Forecast API
- Pytest

## 4. Project Structure

```text
WeatherForecastProject/
├── app.py
├── hello.py
├── test_app.py
├── requirements.txt
├── README.md
├── templates/
│   └── index.html
├── static/
│   ├── style.css
│   └── script.js
└── .venv/
```

## 5. Installation and Setup

### Prerequisites

- Python installed on your computer
- An internet connection
- Visual Studio Code or another code editor

### Create a virtual environment

```bash
py -m venv .venv
```

### Activate the virtual environment on Windows PowerShell

```powershell
.\.venv\Scripts\Activate.ps1
```

### Install dependencies

```bash
python -m pip install -r requirements.txt
```

## 6. Run the Application

Start the Flask development server:

```bash
python app.py
```

Open the following address in your browser:

http://127.0.0.1:5000/

Enter a city name, such as Delhi, and click Search to view its weather information.

## 7. Run Automated Tests

Run the automated test suite using:

```bash
python -m pytest -v
```

The tests check the homepage response, weather descriptions, and weather icons.

## 8. Weather Data Source

Weather information is retrieved from Open-Meteo.

- Geocoding API: https://geocoding-api.open-meteo.com/v1/search
- Forecast API: https://api.open-meteo.com/v1/forecast

Internet access is required to retrieve live weather data. API availability and service limits may affect results.

## 9. Error Handling

The application handles empty city input, unknown cities, request timeouts, connection failures, and unexpected API response data.

## 10. Future Enhancements

- Hourly weather forecast
- Sunrise and sunset information
- Recent city search history
- Temperature unit conversion
- Improved automated tests for API failures
- Deployment to a production hosting platform

## 11. Author

Student Name: Rahul 230010130143

Course: B.Tech Computer Science and Engineering

Project Title: Weather Forecast Web Application