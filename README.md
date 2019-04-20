# weatherApp
Website to display weather information of a city of user's choice. Current, daily and hourly predictions available

The website uses the following API to get current weather information:
http://api.openweathermap.org/data/2.5/weather?q=London,uk&APPID=<api_key>

And uses the following API for daily and hourly forecasts(for the next 4 days):
http://api.openweathermap.org/data/2.5/forecast/hourly?q=New%20York&appid=<api_key>

I could get access to only the above two APIs using a free account.  
For daily predictions, I took the average of 24 hour-data for calculating temperatures.
For hourly predictions, I have shown data for the next 24 hours for the selected city. 

API keys:
You would need your Weather Maps API key. That key has to be inserted in 2 places in the weather.js file:
Look for var appId = "YOUR_WEATHER_MAPS_APPID_HERE"
Replace "YOUR_WEATHER_MAPS_APPID_HERE" with your key.

You would also need a Google Maps and Places API key. That key can be inserted in the HTML file:
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places"></script>
Replace YOUR_GOOGLE_MAPS_API_KEY with your key.

To run the website, just open weather.html on your browser.
