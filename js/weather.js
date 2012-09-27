'use strict';

var Weather = {
	BASE_URL: 'http://free.worldweatheronline.com/feed/weather.ashx?format=json&num_of_days=5&key=ecc58979c2132816122609&callback=Weather.updateWeather&q=',

	svg: null,
	pt: null,
	geocoder: null,

	init: function weather_init() {
		this.initEvent();
		this.initGeo();
		this.updateWeekday();
	},

	initGeo: function weather_initGeo() {
		this.geocoder = new google.maps.Geocoder();
		var that = this;
		var geocoder = this.geocoder;
		if (navigator.geolocation) {
			//navigator.geolocation.getCurrentPosition(this.getPosSuccess, null);
			navigator.geolocation.getCurrentPosition((function (position) {
				var lat = position.coords.latitude;
	    		var lng = position.coords.longitude;
	    		this.getDistrict(lat, lng);
	    		this.getWeather(lat, lng);
			}).bind(this));
		}
	},

	initEvent: function weather_initEvent() {
		this.svg = document.getElementsByTagName('svg')[0];
		this.svg.addEventListener('touchmove', this, false);
		this.svg.addEventListener('mousemove', this, false);
		this.pt = this.svg.createSVGPoint();
	},

	getWeather: function weather_getWeather(lat, lng) {
		var script = document.createElement('script');
		script.src = this.BASE_URL + '25.09,121.59';
		document.getElementsByTagName('head')[0].appendChild(script);
	},

	updateWeather: function weather_updateWeather(result) {
		var i;
		var icon;
		this.updateInner('#current-temp > span', result.data.current_condition[0].temp_C);
		this.updateInner('#current-high > span', result.data.weather[0].tempMaxC);
		this.updateInner('#current-low > span', result.data.weather[0].tempMinC);
		this.updateInner('#current-condition', result.data.current_condition[0].weatherDesc[0].value);
		this.updateInner('#current-humidity > span', result.data.current_condition[0].humidity);
		this.updateInner('#current-wind > span', result.data.current_condition[0].windspeedKmph);

		icon = 'style/images/' + this.icons[result.data.current_condition[0].weatherCode]
		this.updateIcon('#current-weather-icon > img', icon);

		for (i = 0; i < 5; i++) {
			this.updateInner('#high-temp-' + i, result.data.weather[i].tempMaxC);
			this.updateInner('#low-temp-' + i, result.data.weather[i].tempMinC);

			icon = 'style/images/48x48/' + this.icons[result.data.weather[i].weatherCode];
			this.updateIcon('#weather-icon-' + i, icon);
		}
	},

	updateWeekday: function weather_updateWeekday() {
		var day = new Date().getDay();
		var i;
		var days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

		for (i = 0; i < 5; i++) {
			var d = document.querySelector('#day-' + i);
			d.innerHTML = days[(day+i) % 7];
		}

	},

	updateInner: function weather_updateInner(condition, value) {
		var el = document.querySelector(condition);
		el.innerHTML = value;
	},

	updateIcon: function weather_updateIcon(condition, src) {
		var el = document.querySelector(condition);
		el.setAttribute('src', src);
	},

	getDistrict: function weather_getDistrict(lat, lng) {
		var latlng = new google.maps.LatLng(lat, lng);
		var that = this;
		this.geocoder.geocode({'latLng': latlng}, function(results, status) {
  			if (status == google.maps.GeocoderStatus.OK) {
  				console.log(results)
    			if (results[1]) {
     				//formatted address
     				//alert(results[0].formatted_address)
     				var district;
    				//find country name
         			for (var i=0; i<results[0].address_components.length; i++) {
        				for (var b=0;b<results[0].address_components[i].types.length;b++) {
			                if (results[0].address_components[i].types[b] == "locality") {
			                    district= results[0].address_components[i];
			                    break;
			                }
			            }
    				}
			        that.updateDistrict(district.long_name);
    			} else {
      				alert("No results found");
    			}
  			} else {
    			alert("Geocoder failed due to: " + status);
  			}
		});
	},

	updateDistrict: function weather_updateDistrict(name) {
		document.getElementById('district').innerHTML = name;
	},

	cursorPoint: function weather_cursorPoint(evt){
		var target = evt.clientX === undefined ? evt.touches[0] : evt;
		this.pt.x = target.clientX;
		this.pt.y = target.clientY;
		return this.pt.matrixTransform(this.svg.getScreenCTM().inverse());
	},

	handleEvent: function weather_handleEvent(evt) {
		var line = document.getElementById('selected-line');
		var current = this.cursorPoint(evt);
		line.setAttribute('transform', 'translate(' + current.x + ',0)');
	},

	icons: {
		'353': 'weather-few-clouds.png',
		'359': 'weather-showers.png',
		'113': 'weather-clear.png',
		'116': 'weather-few-clouds.png',
		'356': 'weather-showers.png'
	}
};

window.addEventListener('load', function weatLoad(evt) {
	window.removeEventListener('load', weatLoad);
	Weather.init();
});

function test() {
	alert("");
}