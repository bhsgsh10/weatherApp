/* converts Kelvin temperature to Fahrenheit. Change can also be made in the API call to receive data directly
in Fahrenheit or Celcius*/
var kelvinToFahrenheit = function(kelvinTemp) {
    fahrenheitTemperature = (kelvinTemp * 9/5) - 459.67
    return Math.round(fahrenheitTemperature)
}

/* takes the 10-digit date and converts it into readable format */
var convertToReadableDate = function(timestamp) {
    var timestampDate = new Date(timestamp * 1000)
    var weekday=new Array("Sun","Mon","Tue","Wed","Thu","Fri","Sat")
    var monthname=new Array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec")
    var formattedDate = weekday[timestampDate.getDay()] + ' ' + monthname[timestampDate.getMonth()] + ' ' + timestampDate.getDate() + ', ' + timestampDate.getFullYear()
    return formattedDate
}

/* forms the rows for daily predictions table */
var formHTML = function(formDate, avgTemp, avgMinTemp, avgMaxTemp, avgHumidity, table_div) {

    var tr_tag = `<tr><th scope='row'>`+formDate+`</th>
                    <td>`+avgTemp+`</td>
                    <td>`+avgMinTemp+`</td>
                    <td>`+avgMaxTemp+`</td>
                    <td>`+avgHumidity+`</td>
                    </tr>`

    var whole_html = table_div + tr_tag

    return whole_html
}

/*calculates average of given values */
var average = function(values) {
    var sum = 0
    $.each(values, function(index, value){
        sum += value
    })

    return Math.round(sum/values.length)
}

/* shows hourly predictions for the next 24 hours */
var loadHourlyData = function(data) {
    var container_div = "<div class='forecast'><div class='container tab'>"
    var row_div = "<div class='row'>"
    var column_div = "<div class='col-md-12'>"
    var table_div = `<table class='table text-center'>
                    <thead><tr>
                    <th scope='col'>Hour</th>
                    <th scope='col'>Temperature(ºF)</th>
                    <th scope='col'>Minimum(ºF)</th>
                    <th scope='col'>Maximum(ºF)</th>
                    <th scope='col'>Humidity(%)</th>
                    </tr></thead>
                    <tbody>`

    $.each(data, function(index, hour_info){
        var mainInfo = hour_info["main"]
        var temp = kelvinToFahrenheit(mainInfo["temp"])
        var min_temp = kelvinToFahrenheit(mainInfo["temp_min"])
        var max_temp = kelvinToFahrenheit(mainInfo["temp_max"])
        var humidity = mainInfo["humidity"]
        console.log(hour_info)
        //show updates for the next 24 hours only
        var date_text = hour_info["dt_txt"]
        var hour_text = date_text.split(" ")[1]
        var tr_tag = "<tr><th scope='row'>"+hour_text+"</th>"
        var temp_tag = "<td>"+temp+"</td>"
        var mintemp_tag = "<td>"+min_temp+"</td>"
        var maxtemp_tag = "<td>"+max_temp+"</td>"
        var humidity_tag = "<td>"+humidity+"</td>"
        var tr_end = "</tr>"
        var table_element_tag = tr_tag + temp_tag + mintemp_tag + maxtemp_tag + humidity_tag + tr_end
        table_div = table_div + table_element_tag
    })
    var end_tags = "</tbody></table></div></div></div></div>"
    var whole_html = container_div + row_div + column_div + table_div + end_tags
    $(".option").append(whole_html)
}

/* displays daily or hourly weather info based on user preference. Be default we show daily predictions for the 
next 4 days */
var dailyHourlyWeatherInfo = function(city, appId) {
    //make another ajax call for hourly weather information
    var url_2 = "http://api.openweathermap.org/data/2.5/forecast/hourly?q="+city+"&appid="+appId
    $.ajax({
        dataType: "json",
        url: url_2,
        success: function(result) {
            var full_list = result["list"]
            
            if ($("#daily_hourly").is(':checked')) {
                var div = "<div class='subheader'>DAILY WEATHER</div>"
                $(".option").append(div)
                // create arrays to store data for next 24 hours. We would take average of this data to do daily 
                // predictions
                var temps = []
                var min_temps = []
                var max_temps = []
                var humidities = []
                var day_count = 1
                // create div for table here. We would iterate and add the separate rows
                var table_div = `<div class='forecast'><div class='container tab'><div class='row'>
                                <div class='col-md-12'>
                                <table class='table text-center'>
                                <thead><tr>
                                <th scope='col'>Date</th>
                                <th scope='col'>Temperature(ºF)</th>
                                <th scope='col'>Minimum(ºF)</th>
                                <th scope='col'>Maximum(ºF)</th>
                                <th scope='col'>Humidity(%)</th>
                                </tr></thead>
                                <tbody>`
                $.each(full_list, function(index, hour_info){
                    var formattedDate = convertToReadableDate(hour_info["dt"])
                    var mainInfo = hour_info["main"]
                    var temp = kelvinToFahrenheit(mainInfo["temp"])
                    var min_temp = kelvinToFahrenheit(mainInfo["temp_min"])
                    var max_temp = kelvinToFahrenheit(mainInfo["temp_max"])
                    var humidity = mainInfo["humidity"]
                    temps.push(temp)
                    min_temps.push(min_temp)
                    max_temps.push(max_temp)
                    humidities.push(humidity)
                    if (day_count%24 == 0) {
                        // form the HTML for the day using average temperatures
                        var avgTemp = average(temps)
                        var avgMinTemp = average(min_temps)
                        var avgMaxTemp = average(max_temps)
                        var avgHumidity = average(humidities)
                        table_div = formHTML(formattedDate, avgTemp, avgMinTemp, avgMaxTemp, avgHumidity, table_div)
                        // after a row is formed, we empty the arrays to store data for the next 24 hours
                        temps = []
                        min_temps = []
                        max_temps = []
                        humidities = []
                    }
                    day_count = day_count + 1
                })
                var end_tags = "</tbody></table></div></div></div></div>"
                table_div = table_div + end_tags
                // add the entire table under the switch
                $(".option").append(table_div)
            } else {
                var div = "<div class='subheader'>HOURLY WEATHER (24 HOURS)</div>"
                $(".option").append(div)
                loadHourlyData(full_list.slice(0, 23))
            }
        },
        error: function(request, status, error){
            console.log("Error");
            console.log(request)
            console.log(status)
            console.log(error)
        }
         
    })
}

/* displays current weather information */
var current_weather = function(city, appid) {
    //call API here for getting current weather data
        //get city name from the text box
        var url = "http://api.openweathermap.org/data/2.5/weather?q="+city+"&APPID="+appid
        $.ajax({
            dataType: "json",
            url: url,
            success: function(result){
                //parse data
                var main_weather = result["main"]
                var temp = kelvinToFahrenheit(main_weather["temp"])
                var min_temp = kelvinToFahrenheit(main_weather["temp_min"])
                var max_temp = kelvinToFahrenheit(main_weather["temp_max"])
                var humidity = main_weather["humidity"]
                var description = result["weather"][0]["description"]
                var wind = result["wind"]["speed"]
                var div = `<div class='weather-box'><div class='subheader'>CURRENT WEATHER IN `+ city.toUpperCase() +`</div>
                    <div class='container'>
                    <div class='row'> 
                        <div class='col-md-12'>
                            <div class="current_weather_info">
                                <div class="main_temp" id="temp">`+temp+`ºF</div>
                                <div class="main_temp" id="min_max">Minimum: `+min_temp+`ºF     , Maximum: `+max_temp+`ºF</div>
                                <div class="main_temp" id="humidity">Humidity: `+humidity+`%</div>
                                <div class="main_temp" id="wind">Wind speed: `+wind+` km/hr</div>
                                <div class="main_temp" id="description">Description: `+description+`</div>
                            </div>
                        </div>
                    </div>
                </div></div>`
                $("#weather_info").append(div)
            },
            error: function(request, status, error){
                alert("Current weather data not found for given city. Please check the city and try again")
                console.log("Error");
                console.log(request)
                console.log(status)
                console.log(error)
            }
          })
}

/*auto completes city name using Google map APIs */
var autocomplete;
function initialize() {
    autocomplete = new google.maps.places.Autocomplete(
        /** @type {HTMLInputElement} */(document.getElementById('city')),
        { types: ['geocode'] });
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
    });
}

$(document).ready(function() {

    $("#submit").on('click', function() {
        $(".weather-box" ).remove()
        $(".subheader").remove()
        $(".forecast").remove()
        var appId = "YOUR_WEATHER_MAPS_APPID_HERE"
        var city = $("#city").val()
        current_weather(city, appId)
        dailyHourlyWeatherInfo(city, appId)
    })

    $("#daily_hourly").change(function(){
        console.log("Called")
        var appId = "YOUR_WEATHER_MAPS_APPID_HERE"
        var city = $("#city").val()
        $(".subheader").remove()
        $(".forecast").remove()
        dailyHourlyWeatherInfo(city, appId)
    })
})