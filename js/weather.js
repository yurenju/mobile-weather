'use strict';

var Weather = {
	svg: null,
	pt: null,
	geocoder: null,

	init: function weather_init() {
		this.initEvent();
		this.initGeo();
	},

	initGeo: function weather_initGeo() {
		this.geocoder = new google.maps.Geocoder();
		var that = this;
		var geocoder = this.geocoder;
		if (navigator.geolocation) {
			//navigator.geolocation.getCurrentPosition(this.getPosSuccess, null);
			var that = this;
			navigator.geolocation.getCurrentPosition(function (position) {
				var lat = position.coords.latitude;
	    		var lng = position.coords.longitude;
	    		that.fillDistrict(lat, lng);
			});
		}
	},

	fillDistrict: function weather_fillDistrict(lat, lng) {
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

	initEvent: function weather_initEvent() {
		this.svg = document.getElementsByTagName('svg')[0];
		this.svg.addEventListener('touchmove', this, false);
		this.svg.addEventListener('mousemove', this, false);
		this.pt = this.svg.createSVGPoint();
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
	}
};

window.addEventListener('load', function weatLoad(evt) {
	window.removeEventListener('load', weatLoad);
	Weather.init();
});