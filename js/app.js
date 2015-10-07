'use strict';

var CurrentWeek = 0;
var Events = [];
var Calendars  = {
	internal: 'ideo.com_p0gg0riugm6d554et1jic6okrg@group.calendar.google.com',
	external: 'ideo.com_20hjl85r7mi3e2vtfncskfiabs@group.calendar.google.com',
	projects: 'ideo.com_v4vpo5b47up8803v4omofvet4c@group.calendar.google.com',
};

var UI = {
	tmpl: document.getElementById('event-template'),
	eventContainer: document.getElementById('event-container')
};

var Event = function(summary, day, date, time, where, creator, calendar, sortIndex) {
	this.summary = summary;
	this.day = day;
	this.date = date;
	this.time = time;
	this.creator = creator;
	this.where = where;
	this.calendar = calendar;
	this.sortIndex = sortIndex;
};

Event.prototype.getColor = function() {
	if(this.calendar === 'NY - Creative Connections') {
		return '#DE6B48';
	}
	if(this.calendar === 'NY - Internal' || this.calendar === 'NY - Internal Events') {
		return '#25CED1';
	}
	if(this.calendar === 'NY - OOO' || this.calendar === 'NY - Staff Vacations') {
		return '#379392';
	}
	if(this.calendar === 'NY - External Events') {
		return '#3F5478';
	}
	if(this.calendar === 'NY - Client Events') {
		return '#E6AF2E';
	}
	else {
		return 'rgb(0,155,255)';
	}
};

Event.prototype.handler = function(e) {
	var obj = JSON.parse(e.target.response);
	if(obj.results) {
		var set = document.querySelectorAll('[data-person="'+obj.results[0].email+'"]');
		for(var i = 0; i < set.length; i++) {
			set[i].src = ''+obj.results[0].image+'';
		}
	}	
};

var parseCreatorName = function(creator) {
		creator = creator.replace(/\s/g, '');
		return creator;
};

var parseEmail = function(email) {
	return email.substring(0, email.indexOf('@'));
};

var sortEventsByTime = function() {
	Events.sort(function(a, b){
	  return a.sortIndex-b.sortIndex;
	});
};

var renderDateTitles = function(weekNum) {
	var days = document.querySelectorAll('.week-container li');
	var names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
	for(var i = 0; i < days.length; i++) {
		days[i].innerHTML += ('<div class="date">'+moment().add(weekNum, 'week').day(names[i]).format('dddd M/D')+'</div>');
	}
};

var renderEvents = function(amt) {
	for(var i = 0; i < amt; i++) {
		var thisEvent = Events[i];
		var template = UI.tmpl.content.cloneNode(true);
		var container = document.getElementById(thisEvent.day);

		if(thisEvent.time === 'All day') {
			template.querySelector('.event-time').style.display = 'none';
		}

		template.querySelector('.event').id = thisEvent.id;
		template.querySelector('.event-title').innerHTML = thisEvent.summary;
		template.querySelector('.event-time').innerHTML = thisEvent.time;
		template.querySelector('.event-info').style.background = thisEvent.getColor();
		
		if(container) {
			container.appendChild(template);
		}
		else {
			return;
		}
	}
};

var clearCalendar = function() {
	Events = [];
	var days = document.querySelectorAll('.week-container li');
	for(var i = 0; i < days.length; i++) {
		days[i].innerHTML = '';
	}
};

var getEventDay = function(thisEvent) {
  var when;
  if(thisEvent.start.dateTime) {
    when = thisEvent.start.dateTime;
  }
  else {
    when = thisEvent.start.date;
  }
  return moment(when);
};

var getDisplayTime = function(thisEvent) {
  if(thisEvent.start.dateTime) {
    var day = moment(thisEvent.start.dateTime).format('ddd');
    var date = moment(thisEvent.start.dateTime).format('D');
    var start = moment(thisEvent.start.dateTime);
    var end = moment(thisEvent.end.dateTime);
    return [day, date, ''+start.format('h:mm')+' - '+end.format('h:mm a')+''];
  }
  else {
    var when = thisEvent.start.date;
    var day = moment(when).format('ddd');
    var date = moment(when).format('D');
    return [day, date, 'All day'];
  } 
};

var getCreator = function(thisEvent) {
  var creator;
  if(thisEvent.creator.email) {
    creator = thisEvent.creator.email;
  }
  else {
    creator = thisEvent.organizer.email;
  }
  return creator;
};

var getLocation = function(thisEvent) {
  var where;
  if(thisEvent.location) {
    where = thisEvent.location;
  }
  else {
    where = 'New York';
  }
  return where;
};

var getSortIndex = function(thisEvent) {
  var date;
  if(thisEvent.start.dateTime) {
    date = moment(thisEvent.start.dateTime);
  }
  else {
    date = moment(thisEvent.start.date);
  }
  var sortIndex = date.format('MM') + date.format('DD') + date.format('HH mm');
  return parseInt(sortIndex);
};

var buildEvents = function(events) {
	if(events) {
		for (var i = 0; i < events.length; i++) {
		  	var thisEvent = events[i];
			var summary = thisEvent.summary;
			var day = getDisplayTime(thisEvent)[0];
			var date = getDisplayTime(thisEvent)[1];
			var time = getDisplayTime(thisEvent)[2];
			var where = getLocation(thisEvent);
			var creator = getCreator(thisEvent);
			var calendar = thisEvent.organizer.displayName;
			var sortIndex = getSortIndex(thisEvent);

			Events.push(new Event(summary, day, date, time, where, creator, calendar, sortIndex));
		}
	}    
	else {
		return;
	}
};

var getRequest = function(calendar, weekNum) {
  var request = gapi.client.calendar.events.list({
    'calendarId': calendar,
    'timeMin': moment().add(weekNum, 'week').format(),
    'timeMax': moment().add(weekNum+1, 'week').endOf('isoWeek').toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'maxResults': 20,
    'orderBy': 'startTime'
  });
  return request;
};

var listUpComingEvents = function(calendar, weekNum) {
  getRequest(Calendars[calendar], weekNum).execute(function(resp) {
    buildEvents(resp.items);
  });
};

var listAllEvents = function (weekNum) {

  for(var calendar in Calendars) {
    listUpComingEvents(calendar, weekNum);
  }

  setTimeout(function(){
  	  sortEventsByTime();
      renderEvents(20);
  }, 2000);
};

document.addEventListener('DOMContentLoaded', function(){
	renderDateTitles(0);
});

document.getElementById('pageCalRight').addEventListener('click', function(){
	CurrentWeek++;
	clearCalendar();
	listAllEvents(CurrentWeek);
	renderDateTitles(CurrentWeek);
});
document.getElementById('pageCalLeft').addEventListener('click', function(){
	CurrentWeek--;
	clearCalendar();
	listAllEvents(CurrentWeek);
	renderDateTitles(CurrentWeek);
});