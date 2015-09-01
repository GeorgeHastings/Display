'use strict';

// clientId: 1054522317473-1q9d0u8sd9pqv7ie9cuvv27tsi47q9oo.apps.googleusercontent.com
// clientSecret: Uj2TcoNu85MPoxkNxmmybmFW

var Events = [];
var Images = [];

var tmpl = document.getElementById('event-template');
var container = document.getElementById('event-container');

var Event = function(summary, time, creator, where) {
	this.summary = summary;
	this.time = time;
	this.creator = creator;
	this.where = where;
};

Event.prototype.handler = function(e) {
	var obj = JSON.parse(e.target.response);
	if(obj.results === null) {
		Images.push('http://newyork.ideo.com/assets/img/Community/Default.jpg');
	}
	else {
		Images.push('http://newyork.ideo.com/'+obj.results[0].image+'');
	}	
};

Event.prototype.getImage = function() {
	var emailName = parseEmail(this.creator);
	callAjax(emailName, this.handler);
};

var parseCreatorName = function(creator) {
		creator = creator.replace(/\s/g, '');
		return creator;
};

var parseEmail = function(email) {
	return email.substring(0, email.indexOf('@'));
};

var fetchImages = function() {
	for(var i = 0; i < Events.length; i++) {
		var thisEvent = Events[i];
		thisEvent.getImage(i);
	}
};

var genEvents = function() {
	for(var i = 0; i < Events.length; i++) {
		var thisEvent = Events[i];
		var template = tmpl.content.cloneNode(true);
		template.querySelector('.event-title').innerHTML = thisEvent.summary;
		template.querySelector('.event-location').innerHTML = thisEvent.where;
		template.querySelector('.time').innerHTML = thisEvent.time;
		template.querySelector('img').src = Images[i];
		container.appendChild(template);
	}
};

var renderToday = function(){
	document.getElementById('today').innerHTML = moment().format('dddd');
};

document.addEventListener('DOMContentLoaded', function(){
	renderToday();
	checkAuth();
	loadCalendarApi();
	listUpcomingEvents();
});

