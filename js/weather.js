'use strict';

var Weather = {
  BASE_URL: 'http://free.worldweatheronline.com/feed/weather.ashx?' +
    'format=json&num_of_days=5&key=ecc58979c2132816122609&' +
    'callback=Weather.updateWeather&q=',

  init: function weather_init(geocoder) {
    this.geocoder = geocoder;
    this.getAllElements();
    this.initEvent();
    this.initGeo();
    this.updateWeekday();
  },

  getAllElements: function weather_getAllElements() {
    var elements = ['temp-graph', 'selected-line', 'selected-temp-max',
        'selected-temp-min', 'selected-condition', 'selected-wind'];

    var toCamelCase = function toCamelCase(str) {
      return str.replace(/\-(.)/g, function replacer(str, p1) {
        return p1.toUpperCase();
      });
    };

    elements.forEach((function createElementRef(name) {
      this[toCamelCase(name)] = document.getElementById(name);
    }).bind(this));

    this.currentTemp = document.querySelector('#current-temp > span');
    this.currentMax = document.querySelector('#current-high > span');
    this.currentMin = document.querySelector('#current-low > span');
    this.currentCondition = document.querySelector('#current-condition');
    this.currentHumidity = document.querySelector('#current-humidity > span');
    this.currentWind = document.querySelector('#current-wind > span');
    this.currentIcon = document.querySelector('#current-weather-icon > img');
    this.maxTempStroke = document.querySelector('#max-temp-stroke');
    this.maxTempFill = document.querySelector('#max-temp-fill');
    this.minTempStroke = document.querySelector('#min-temp-stroke');
    this.minTempFill = document.querySelector('#min-temp-fill');

    for (var i = 0; i < 5; i++) {
      this['maxTemp' + i] = document.querySelector('#high-temp-' + i);
      this['minTemp' + i] = document.querySelector('#low-temp-' + i);
      this['weatherIcon' + i] = document.querySelector('#weather-icon-' + i);
      this['day' + i] = document.querySelector('#day-' + i);
    }
  },

  initGeo: function weather_initGeo() {
    var that = this;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((function(position) {
        var lat = position.coords.latitude;
          var lng = position.coords.longitude;
          this.getDistrict(lat, lng);
          this.getWeather(lat, lng);
      }).bind(this));
    }
  },

  initEvent: function weather_initEvent() {
    this.tempGraph.addEventListener('touchmove', this, false);
    this.tempGraph.addEventListener('mousemove', this, false);
    this.pt = this.tempGraph.createSVGPoint();
  },

  getWeather: function weather_getWeather(lat, lng) {
    var script = document.createElement('script');
    script.src = this.BASE_URL + lat + ',' + lng;
    document.getElementsByTagName('head')[0].appendChild(script);
  },

  updateWeather: function weather_updateWeather(result) {
    var i;
    var icon;
    var data = result.data;
    this.days = data.weather;
    this.currentTemp.textContent = data.current_condition[0].temp_C;
    this.currentMax.textContent = data.weather[0].tempMaxC;
    this.currentMin.textContent = data.weather[0].tempMinC;
    this.currentHumidity.textContent = data.current_condition[0].humidity;
    this.currentWind.textContent = data.current_condition[0].windspeedKmph;
    this.currentCondition.textContent =
      data.current_condition[0].weatherDesc[0].value;

    this.currentIcon.src = 'style/images/' +
      this.icons[data.current_condition[0].weatherCode] + '.png';

    for (i = 0; i < 5; i++) {
      this['maxTemp' + i].textContent = data.weather[i].tempMaxC;
      this['minTemp' + i].textContent = data.weather[i].tempMinC;
      this['weatherIcon' + i].src = 'style/images/48x48/' +
        this.icons[data.weather[i].weatherCode] + '.png';
    }

    this.updateGraph(data);
  },

  updateGraph: function weather_updateGraph(data) {
    var max = -1000;
    var min = 1000;
    var maxLine = '';
    var minLine = '';
    var i;
    var yoffset;
    var xoffset;

    for (i = 0; i < 5; i++) {
      if (data.weather[i].tempMaxC > max) {
        max = data.weather[i].tempMaxC;
      }
      if (data.weather[i].tempMinC < min) {
        min = data.weather[i].tempMinC;
      }
    }

    yoffset = 300 / (max - min + 2);
    xoffset = 500 / 4;

    for (i = 0; i < 5; i++) {
      maxLine += (i * xoffset).toString() + ',' +
        ((max - data.weather[i].tempMaxC + 1) * yoffset).toString() + ' ';
      minLine += (i * xoffset).toString() + ',' +
        ((max - data.weather[i].tempMinC + 1) * yoffset).toString() + ' ';
    }
    this.maxTempStroke.setAttribute('d', 'M ' + maxLine);
    this.maxTempFill.setAttribute('d', 'M ' + maxLine + '500,300 0,300 z');
    this.minTempStroke.setAttribute('d', 'M ' + minLine);
    this.minTempFill.setAttribute('d', 'M ' + minLine + '500,300 0,300 z');
  },

  updateWeekday: function weather_updateWeekday() {
    var day = new Date().getDay();
    var i;
    var days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    for (i = 0; i < 5; i++) {
      this['day' + i].textContent = days[(day + i) % 7];
    }
  },

  getDistrict: function weather_getDistrict(lat, lng) {
    var latlng = new google.maps.LatLng(lat, lng);
    var self = this;
    this.geocoder.geocode({'latLng': latlng}, function(res, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (res[1]) {
          var district;
          for (var i = 0; i < res[0].address_components.length; i++) {
            var len = res[0].address_components[i].types.length;
            for (var b = 0; b < len; b++) {
              if (res[0].address_components[i].types[b] === 'locality') {
                district = res[0].address_components[i];
                break;
              }
            }
          }
          self.updateDistrict(district.long_name);
        } else {
          alert('No results found');
        }
      } else {
        alert('Geocoder failed due to: ' + status);
      }
    });
  },

  updateDistrict: function weather_updateDistrict(name) {
    document.getElementById('district').innerHTML = name;
  },

  updateSelected: function weather_updateSelected(x) {
    var el;
    var selected = Math.round(x / (500 / 4));

    this.selectedTempMax.textContent = this.days[selected].tempMaxC;
    this.selectedTempMin.textContent = this.days[selected].tempMinC;
    this.selectedWind = this.days[selected].windspeedKmph;
    this.selectedCondition.textContent =
      this.days[selected].weatherDesc[0].value;
  },

  cursorPoint: function weather_cursorPoint(evt) {
    var target = evt.clientX === undefined ? evt.touches[0] : evt;
    this.pt.x = target.clientX;
    this.pt.y = target.clientY;
    return this.pt.matrixTransform(this.tempGraph.getScreenCTM().inverse());
  },

  handleEvent: function weather_handleEvent(evt) {
    var current = this.cursorPoint(evt);
    this.selectedLine.setAttribute('transform', 'translate(' + current.x + ',0)');
    this.updateSelected(current.x);
  },

  icons: {
    '353': 'weather-few-clouds',
    '359': 'weather-showers',
    '113': 'weather-clear',
    '116': 'weather-few-clouds',
    '356': 'weather-showers',
    '296': 'weather-showers-scattered',
    '302': 'weather-showers-scattered',
    '263': 'weather-few-clouds'
  }
};

window.addEventListener('load', function weatLoad(evt) {
  window.removeEventListener('load', weatLoad);
  Weather.init(new google.maps.Geocoder());
});
