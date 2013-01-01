var jsdom = require('jsdom').jsdom;
var assert = require('chai').assert;
var html = require('fs').readFileSync('index.html').toString();
var window, document, Weather;

suite('Weather', function() {
  setup(function() {
    document = jsdom(html);
    window = document.createWindow();
    Weather = require(__dirname + '/../js/weather.js').Weather;
    Weather.init(window, document);
  });

  test('getAllElements', function() {
    assert.equal('temp-graph', Weather.tempGraph.id);
    assert.equal('current-temp', Weather.currentTemp.parentNode.id);
    assert.equal('high-temp-0', Weather['maxTemp0'].id);
  });

  test('updateWeekday', function() {
    //2013/1/1 is Tuesday
    Weather.updateWeekday(new Date('Jan 01, 2013'));
    assert.equal(Weather.day0.textContent, 'T', 'day0 is [T]uesday');
    assert.equal(Weather.day4.textContent, 'S', 'day4 is [S]aturday');
  });
});
