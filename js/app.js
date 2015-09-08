'use strict';

var Events = [];
var Images = [];
var Calendars  = {
	own: 'primary',
	support: 'ideo.com_p0gg0riugm6d554et1jic6okrg@group.calendar.google.com',
	creativeConnections: 'ideo.com_20hjl85r7mi3e2vtfncskfiabs@group.calendar.google.com',
	internal: 'ideo.com_3ksmp10u6g268lutghfpb8bkl4@group.calendar.google.com',
	external: 'ideo.com_20hjl85r7mi3e2vtfncskfiabs@group.calendar.google.com',
	projects: 'ideo.com_v4vpo5b47up8803v4omofvet4c@group.calendar.google.com'
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
	if(this.calendar === 'NY Support') {
		return '#EA643B';
	}
	if(this.calendar === 'NY - Creative Connections') {
		return '#4BC4A4';
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

Event.prototype.getImage = function() {
	var emailName = parseEmail(this.creator);
	callAjax(emailName, this.handler);
};

function callAjax(emailName, callback){
  var c = new XMLHttpRequest;
  c.onload = callback;
  c.open('GET', 'http://localhost:1235/api/teammembers?limit=10&offset=0&email='+emailName+'%40ideo.com');
  c.send();
}

var fetchImages = function() {
	for(var i = 0; i < Events.length; i++) {
		var thisEvent = Events[i];
		thisEvent.getImage();
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

var renderEvents = function(amt) {
	for(var i = 0; i < amt; i++) {
		var thisEvent = Events[i];
		var template = UI.tmpl.content.cloneNode(true);
	
		if(i === 0 || i > 0 && Events[i-1].day !== thisEvent.day) {
			template.querySelector('.event-day').innerHTML = thisEvent.day;
			template.querySelector('.event-date').innerHTML = thisEvent.date;
		}

		template.querySelector('.event').id = thisEvent.id;
		template.querySelector('.event-title').innerHTML = thisEvent.summary;
		template.querySelector('.event-location').innerHTML = thisEvent.where;
		template.querySelector('.event-time').innerHTML = thisEvent.time;
		template.querySelector('img').setAttribute('data-person', thisEvent.creator);
		template.querySelector('.event-info').style.background = thisEvent.getColor();
		UI.eventContainer.appendChild(template);
	}
};

function getEventDay(thisEvent) {
  var when;
  if(thisEvent.start.dateTime) {
    when = thisEvent.start.dateTime;
  }
  else {
    when = thisEvent.start.date;
  }
  return moment(when);
}

function getDisplayTime(thisEvent) {
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
}

function getCreator(thisEvent) {
  var creator;
  if(thisEvent.creator.email) {
    creator = thisEvent.creator.email;
  }
  else {
    creator = thisEvent.organizer.email;
  }
  return creator;
}

function getLocation(thisEvent) {
  var where;
  if(thisEvent.location) {
    where = thisEvent.location;
  }
  else {
    where = 'New York';
  }
  return where;
}

function getSortIndex(thisEvent) {
  var date;
  if(thisEvent.start.dateTime) {
    date = moment(thisEvent.start.dateTime);
  }
  else {
    date = moment(thisEvent.start.date);
  }
  var sortIndex = date.format('DD') + date.format('HH mm');
  return parseInt(sortIndex);
}

function buildEvents(events) {
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

var getRequest = function(calendar) {
  var request = gapi.client.calendar.events.list({
    'calendarId': calendar,
    'timeMin': (new Date()).toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'maxResults': 15,
    'orderBy': 'startTime'
  });
  return request;
};

var listUpcomingPrimaryEvents = function() {
  getRequest(Calendars.own).execute(function(resp) {
    buildEvents(resp.items);
  });
};

var listUpcomingSupportEvents = function() {
  getRequest(Calendars.support).execute(function(resp) {
    buildEvents(resp.items);
  });
};

var listUpcomingCreativeConnectionsEvents = function() {
  getRequest(Calendars.creativeConnections).execute(function(resp) {
    buildEvents(resp.items);
  });
};

function listAllEvents() {
  listUpcomingPrimaryEvents();
  listUpcomingSupportEvents();
  listUpcomingCreativeConnectionsEvents();

  setTimeout(function(){
  	  sortEventsByTime();
      renderEvents(10);
      fetchImages();
  }, 2000);
}

setInterval(function(){
	Events = [];
	listAllEvents();
}, 30000);