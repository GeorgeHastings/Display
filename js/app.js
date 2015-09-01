'use strict';

// clientId: 1054522317473-1q9d0u8sd9pqv7ie9cuvv27tsi47q9oo.apps.googleusercontent.com
// clientSecret: Uj2TcoNu85MPoxkNxmmybmFW

var Events = [];
var Images = [];

var tmpl = document.getElementById('event-template');
var container = document.getElementById('event-container');

var Event = function(summary, day, date, time, where, creator, calendar) {
	this.summary = summary;
	this.day = day;
	this.date = date;
	this.time = time;
	this.creator = creator;
	this.where = where;
	this.calendar = calendar;
};

Event.prototype.getColor = function() {
	if(this.calendar === 'NY Support') {
		return '#E56548';
	}
	else {
		return 'rgb(0,155,255)';
	}
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

var renderEvents = function() {
	console.log(Images);
	for(var i = 0; i < Events.length; i++) {
		var thisEvent = Events[i];
		var template = tmpl.content.cloneNode(true);
		template.querySelector('.event-day').innerHTML = thisEvent.day;
		template.querySelector('.event-date').innerHTML = thisEvent.date;
		template.querySelector('.event-title').innerHTML = thisEvent.summary;
		template.querySelector('.event-location').innerHTML = thisEvent.where;
		template.querySelector('.event-time').innerHTML = thisEvent.time;
		template.querySelector('img').src = Images[i];
		template.querySelector('.event-info').style.background = thisEvent.getColor();
		container.appendChild(template);
	}
};

document.addEventListener('DOMContentLoaded', function(){
	checkAuth();
	loadCalendarApi();
	listUpcomingEvents();
});

// setInterval(function(){
// 	location.reload();
// }, 30000);