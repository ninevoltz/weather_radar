	var section = document.querySelector('section');
	var requestURL = 'https://forecast.weather.gov/MapClick.php?lat=41.276265&lon=-83.650922&FcstType=json'
	var request = new XMLHttpRequest();
	var myWeather = document.createElement('article');
	var wxHeader = document.createElement('h2');
	var wxCond = document.createElement('p');
	var forecastTable = document.createElement('table');
	var hazard = document.createElement('a');
	var audioIndex = 0;
	var speechText = [];
	
	function updateForecast() {
		request.open('GET', requestURL);
		request.responseType = 'json';
		request.send();
	}
	
	request.onload = function() {
		var weather = request.response;
		showWeather(weather);
	}
	
	function createDocument() {
		
		for (var i = 0; i < 13; i++) {
			var tRow = document.createElement('tr');
			tRow.setAttribute('id', 'row' + i);
			forecastTable.appendChild(tRow);
			
			var tDiv1 = document.createElement('td');
			tDiv1.setAttribute('id', 'picCol' + i);
			tRow.appendChild(tDiv1);
			
			var iconPic = document.createElement('img');
			iconPic.setAttribute('src', "images/layers-2x.png");
			iconPic.setAttribute('id', 'icon' + i);
			tDiv1.appendChild(iconPic);
			
			var tDiv2 = document.createElement('td');
			tDiv2.setAttribute('id', 'textCol' + i);
			tRow.appendChild(tDiv2);
			
			var day = document.createElement('p');
			day.setAttribute('id', 'day' + i);
			day.textContent = "short info";
			tDiv2.appendChild(day);

			var longDesc = document.createElement('p');
			longDesc.setAttribute('id', 'desc' + i);
			longDesc.textContent = "long description";
			tDiv2.appendChild(longDesc);

		}	
		
		forecastTable.setAttribute('id', 'fcTable');
		forecastTable.setAttribute('cellpadding', '10');
		
		myWeather.appendChild(wxHeader);
		myWeather.appendChild(wxCond);
		myWeather.appendChild(hazard);
		myWeather.appendChild(forecastTable);
		
		section.appendChild(myWeather);
	}
	
	createDocument();
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
		
		hazard.textContent = data.hazard;
		hazard.setAttribute('href', decodedURL);
		hazard.setAttribute('target', '_blank');
		
		wxHeader.textContent = 'Current Conditions: (' + weather.Date + ')';
		wxCond.textContent = 'Temperature ' + weather.Temp + '°F | Dew Point ' 
		+ weather.Dewp + '°F | Relative Humidity ' + weather.Relh + '% | Visibility ' + weather.Visibility
		+ ' miles | Barometer ' + weather.SLP + ' in | Winds ' + weather.Winds + ' mph |';
		
		for (var i = 0; i < 13; i++) {
			
			document.getElementById("icon" + i).setAttribute("src", data.iconLink[i]);

			( function(index) {document.getElementById("icon" + index).onclick = function(){speakForecast(data.text[index]);} } )(i);
			
			document.getElementById("day" + i).innerHTML = times.startPeriodName[i] + ', ' + data.weather[i] + ', ' + times.tempLabel[i] + ' ' + data.temperature[i] + '°F';
			
			document.getElementById("desc" + i).innerHTML = data.text[i];
		}

	}					

	function speakForecast(say) {
		speechText = say.split(".");
		audioIndex = 0;
		playSpeech();

	}
	
	function playSpeech() {
		if (audioIndex < speechText.length - 1) {
			var audio = new Audio('https://translate.google.com/translate_tts?ie=UTF-8&tl=en-US&client=tw-ob&q=' + escape(speechText[audioIndex]) + '%20');
			audio.onended = function(){audioIndex++; playSpeech();};
			audio.play();
		}
	}

	
