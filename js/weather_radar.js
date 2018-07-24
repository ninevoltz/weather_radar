	var MS_PER_MINUTE = 60000;
	var START_TIME = 240; // minutes in the past to start from
	var TIME_STEP = 20; // time to step in minutes
	var ANIMATE = true;
	var slider = document.getElementById("speedRange");
	var progressBar = document.getElementById("progressBarVal");
	var updateInterval;
	var animateInterval;
	var animateSpeed = 300;
	var layersLoaded = 0;
	var layerNo = 12;
	
	var Map = L.map('map').setView([41.276265, -83.650922], 6);

	var radar = [];
	var layerTime = [];
	
	// OpenStreetMaps
	var osm = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
		transparent: false
	});
	
	// ESRI map with satellite imagery
	var esri_imagery = L.esri.basemapLayer('Imagery');
	var esri_labels = L.esri.basemapLayer('ImageryLabels');
	
	var homeIcon = L.icon({
		iconUrl: 'images/marker-icon.png',
		shadowUrl: 'images/marker-shadow.png',
		
		iconSize:     [25, 41],
		shadowSize:   [41, 41],
		iconAnchor:   [12, 41],
		shadowAnchor: [12, 41],
		popupAnchor:  [-3, -76] 
	});
	
	var home = L.marker([41.276265, -83.650922], {icon: homeIcon});
	
	// add the OpenStreetMaps map layer
	osm.addTo(Map);
	osm.setZIndex(1);
	
	// add a pin at home
	home.addTo(Map).bindPopup("Home Sweet Home");
	// initialize the radar layers
	initLayers();
	
	// get new radar data every five minutes
	updateInterval = setInterval(updateLayers, 300000);
	// animate the radar data with speed set by slider
	animateInterval = setInterval(drawCurrentLayer, animateSpeed);
	
	// toggle animation on and off with a button
	function toggleAnimation() {
		if (ANIMATE == true) {
			ANIMATE = false;
			clearInterval(animateInterval);
			document.getElementById("toggleButton").innerHTML = "Start";
		} else {
			ANIMATE = true;
			animateInterval = setInterval(drawCurrentLayer, animateSpeed);
			document.getElementById("toggleButton").innerHTML = "Stop";
		}
	}
	
	function selectMap() {
		var x = document.getElementById("mapType");
		var i = x.selectedIndex;
		var mt = x.options[i].value;
		
		switch (mt) {
			case ("OSM"):
				osm.addTo(Map);
				osm.setZIndex(1);
				esri_imagery.removeFrom(Map);
				esri_labels.removeFrom(Map);
			break;				
			case ("ESRI"):
				// add ESRI map layer
				esri_imagery.addTo(Map);
				esri_labels.addTo(Map);
				esri_imagery.setZIndex(1);
				esri_labels.setZIndex(1);
				osm.removeFrom(Map);
			break;
		}
	}
	
	// adjust animation speed with a slider
	slider.oninput = function() {
		animateSpeed = this.max - this.value;
		clearInterval(animateInterval);
		animateInterval = setInterval(drawCurrentLayer, animateSpeed);
	} 
	
	// update the radar layers
	function updateLayers() {
		
		clearInterval(animateInterval); // pause animation
		
		for (var i = 0; i < 13; i++) {
			radar[i].setParams({time: formatDateTime(i)});  // set the new layer times
			radar[i].redraw(); // redraw the layer
 		}
		
		animateInterval = setInterval(drawCurrentLayer, animateSpeed); //start animation
	}	
	
	// initialize the radar layers
	function initLayers() {
		document.getElementById("theTime").innerHTML = "Loading radar layers..."
		for (var i = 0; i < 13; i++) {
			radar[i] = L.tileLayer.wms('http://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r-t.cgi', {
				attribution: '&copy; <a href="https://mesonet.agron.iastate.edu">Iowa State University</a> of Science and Technology',
				layers: 'nexrad-n0r-wmst',
				transparent: true,
				format: 'image/png',
				time: formatDateTime(i)
			});
			radar[i].addTo(Map);
			radar[i].setZIndex(0);
			radar[i].on("load", layerLoaded);
			radar[i].on("loading", layerLoading);
 		}
	}

	function layerLoaded() {
		layersLoaded++;
		loadProgress();
	}
	
	function layerLoading() {
		layersLoaded--;
	}
	
	// show loading progress
	function loadProgress() {
		document.getElementById("theTime").innerHTML = "Updating radar layers..."
		progressBar.style.width = ((layersLoaded / 13) * 100) + '%'; 
		progressBar.innerHTML = Math.floor((layersLoaded / 13) * 100)  + '%';
	}
	
	// show the current radar layer
	function drawCurrentLayer() {
		if (layersLoaded == 13) {
		
			for (var i = 0; i < 13; i++) radar[i].setZIndex(0); // hide the radar layers
			radar[layerNo].setZIndex(2); // show the current layer

			document.getElementById("theTime").innerHTML = layerTime[layerNo]; // show the layer time

			layerNo--;	
			if (layerNo == -1) {
				layerNo = 12;
			} 
		}
	}

	// pad time digits with a leading zero
	function pad(num) {
		var s = num + "";
		while (s.length < 2) s = "0" + s;
		return s;
	}
	
	// format the date and time to match the expected mesonet WMS time format
	function formatDateTime(i) {
		var dn = "";
		var dateNow = new Date(Date.now() - ((START_TIME + (i * TIME_STEP)) * MS_PER_MINUTE));
		var year = dateNow.getUTCFullYear();
		var month = pad(dateNow.getUTCMonth() + 1);
		var day = pad(dateNow.getUTCDate());
		var hrs = pad(dateNow.getUTCHours());
		var mins = pad(Math.floor(dateNow.getUTCMinutes() / 5) * 5); // mesonet WMS expects requests on 5 minute intervals

		layerTime[i] = hrs + ":" + mins + " " + month + "/" + day + "/" + year; // time to display in window
		dn = year + "-" + month + "-" + day + "T" + hrs + ":" + mins; // time formatted to send to mesonet
		return dn;
	}
