	var section = document.querySelector('section');
	var requestURL = 'https://forecast.weather.gov/MapClick.php?lat=41.276265&lon=-83.650922&FcstType=json'
	var request = new XMLHttpRequest();

	function updateForecast() {
		request.open('GET', requestURL);
		request.responseType = 'json';
		request.send();
	}
	
	request.onload = function() {
		var weather = request.response;
		showWeather(weather);
	}
	
	updateForecast();
	
	// get new forecast data every five minutes
	var updateInterval = setInterval(updateForecast, 300000);
	
	function showWeather(jsonObj) {
		var weather = jsonObj['currentobservation'];
		var data = jsonObj['data'];
		var times = jsonObj['time'];
		var parser = new DOMParser;
	
		var dom = parser.parseFromString(
			'<!doctype html><body>' + data.hazardUrl,
			'text/html');
		var decodedURL = dom.body.textContent;
		
		var myWeather = document.createElement('article');
		var wxHeader = document.createElement('h2');
		var wxCond = document.createElement('p');
		var forecastTable = document.createElement('table');
		var hazard = document.createElement('a');
		
		hazard.textContent = data.hazard;
		hazard.setAttribute('href', decodedURL);
		hazard.setAttribute('target', '_blank');
		
		wxHeader.textContent = 'Current Conditions: (' + weather.Date + ')';
		wxCond.textContent = 'Temperature ' + weather.Temp + '°F | Dew Point ' 
		+ weather.Dewp + '°F | Relative Humidity ' + weather.Relh + '% | Visibility ' + weather.Visibility
		+ ' miles | Barometer ' + weather.SLP + ' in | Winds ' + weather.Winds + ' mph |';
		
		forecastTable.setAttribute('id', 'fcTable');
		forecastTable.setAttribute('cellpadding', '10');
		
		for (var i = 0; i < 13; i++) {
			var tRow = document.createElement('tr');
			forecastTable.appendChild(tRow);
			
			var tDiv1 = document.createElement('td');
			tRow.appendChild(tDiv1);
			
			var iconPic = document.createElement('img');
			iconPic.setAttribute('src', data.iconLink[i]);
			tDiv1.appendChild(iconPic);
			
			var tDiv2 = document.createElement('td');
			tRow.appendChild(tDiv2);
			
			var day = document.createElement('p');
			day.textContent = times.startPeriodName[i] + ', ' + data.weather[i] + ', ' + times.tempLabel[i] + ' ' + data.temperature[i] + '°F';
			tDiv2.appendChild(day);

			var longDesc = document.createElement('p');
			longDesc.textContent = data.text[i];
			tDiv2.appendChild(longDesc);

		}

		myWeather.appendChild(wxHeader);
		myWeather.appendChild(wxCond);
		myWeather.appendChild(hazard);
		myWeather.appendChild(forecastTable);
		
		section.appendChild(myWeather);

	}					
