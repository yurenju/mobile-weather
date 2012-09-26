'use strict';

var Weather = {
	svg: null,
	pt: null,

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
		this.handleMove(evt);
	},

	handleMove: function weather_handleMove(evt) {
		var line = document.getElementById('selected-line');
		var current = this.cursorPoint(evt);
		line.setAttribute('transform', 'translate(' + current.x + ',0)');
	}
};

window.addEventListener('load', function weatLoad(evt) {
	window.removeEventListener('load', weatLoad);
	Weather.initEvent();
});