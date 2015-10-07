'use strict';

var Events = [];
var OutOfOffice = [];
var OutOfOfficeImages = [];
var Calendars  = {
	internal: 'ideo.com_p0gg0riugm6d554et1jic6okrg@group.calendar.google.com',
	external: 'ideo.com_20hjl85r7mi3e2vtfncskfiabs@group.calendar.google.com',
	projects: 'ideo.com_v4vpo5b47up8803v4omofvet4c@group.calendar.google.com',
	ooo: 'ideo.com_bdpb36toirhifucfijthud9dng@group.calendar.google.com',
	visitors: 'ideo.com_34qgi5b59dtf8ljfls0ojtj804@group.calendar.google.com'
};

var UI = {
	tmpl: document.getElementById('event-template'),
	eventContainer: document.getElementById('event-container')
};

var Event = function(summary, day, date, time, where, creator, calendar, sortIndex, dateMonthDay) {
	this.summary = summary;
	this.day = day;
	this.date = date;
	this.time = time;
	this.creator = creator;
	this.where = where;
	this.calendar = calendar;
	this.sortIndex = sortIndex;
	this.dateMonthDay = dateMonthDay;
};

var handler = function(e) {
	var obj = JSON.parse(e.target.response);
	if(obj.results) {
		var set = document.querySelectorAll('[data-person="'+obj.results[0].email+'"]');
		for(var i = 0; i < set.length; i++) {
			set[i].src = ''+obj.results[0].image+'';
		}
	}	
};

function callAjax(emailName, callback){
  var c = new XMLHttpRequest;
  c.onload = callback;
  c.open('GET', 'http://localhost:1235/api/teammembers?limit=10&offset=0&email='+emailName+'%40ideo.com');
  c.send();
}

var logger = function(e) {
	console.log(e.target.response);
};

function getProfile(){
    var request = gapi.client.directory.users.photos.get({
    	'userKey': 'dwandrey@ideo.com'
    });

	request.execute(function(resp) {
	  console.log(resp);
	});
}

var fetchImages = function() {
	for(var i = 0; i < OutOfOfficeImages.length; i++) {
		var img = parseEmail(OutOfOfficeImages[i]);
		callAjax(img, handler);
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

var renderOutOfOffice = function(thisEvent) {
	var OutOfOfficePeople = '';

	for(var i = 0; i < OutOfOffice.length; i++) {
		if(getSortIndex(OutOfOffice[i]) < thisEvent.sortIndex && getDisplayTime(OutOfOffice[i])[3] > thisEvent.dateMonthDay) {
			OutOfOfficePeople += '<img data-person="'+OutOfOffice[i].attendees[0].email+'">';
			OutOfOfficeImages.push(OutOfOffice[i].attendees[0].email);
		}
	}
	return OutOfOfficePeople;
};

var newDay = function(i, thisEvent) {
	if(i === 0 || i > 0 && Events[i-1].day !== thisEvent.day) {
		return true;
	}
};

var renderEvents = function() {
	for(var i = 0; i < Events.length; i++) {
		var thisEvent = Events[i];
		var template = UI.tmpl.content.cloneNode(true);
	
		if(newDay(i, thisEvent)) {
			template.querySelector('.date-container').style.display = 'block';
			template.querySelector('.event-date').innerHTML = thisEvent.day +' '+ thisEvent.date;
			template.querySelector('.ooo-container').innerHTML = renderOutOfOffice(thisEvent);
		}

		template.querySelector('.event').id = thisEvent.id;
		template.querySelector('.event-title').innerHTML = thisEvent.summary;
		template.querySelector('.event-location').innerHTML = thisEvent.where;
		template.querySelector('.event-time').innerHTML = thisEvent.time;

		if(thisEvent.time === 'All day') {
			template.querySelector('.event').className += ' all-day';
		}

		UI.eventContainer.appendChild(template);
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
    var day = moment(thisEvent.start.dateTime).format('dddd');
    var date = moment(thisEvent.start.dateTime).format('M/D');
    var start = moment(thisEvent.start.dateTime);
    var end = moment(thisEvent.end.dateTime);
    var dateMonthDay = moment(thisEvent.start.dateTime).format('MDD');
    return [day, date, ''+start.format('h:mm')+' - '+end.format('h:mm a')+'', dateMonthDay];
  }
  else {
    var when = thisEvent.start.date;
    var end = moment(thisEvent.end.date).format('MDD');
    var day = moment(when).format('dddd');
    var date = moment(when).format('M/D');
    var dateMonthDay = moment(thisEvent.start.date).format('MDD');
    return [day, date, 'All day', end];
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
    for (var i = 0; i < events.length; i++) {
	  	var thisEvent = events[i];
		var summary = thisEvent.summary;
		var day = getDisplayTime(thisEvent)[0];
		var date = getDisplayTime(thisEvent)[1];
		var time = getDisplayTime(thisEvent)[2];
		var dateMonthDay = getDisplayTime(thisEvent)[3];
		var where = getLocation(thisEvent);
		var creator = getCreator(thisEvent);
		var calendar = thisEvent.organizer.displayName;
		var sortIndex = getSortIndex(thisEvent);

		Events.push(new Event(summary, day, date, time, where, creator, calendar, sortIndex, dateMonthDay));
	}
};

var buildOutOfOffice = function(events) {
	for (var i = 0; i < events.length; i++) {
		var thisOutOfOffice = events[i];
		OutOfOffice.push(thisOutOfOffice);
	}
};

var getRequest = function(calendar) {
  var request = gapi.client.calendar.events.list({
    'calendarId': calendar,
    'timeMin': (new Date()).toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'maxResults': 10,
    'orderBy': 'startTime'
  });
  return request;
};

var listUpComingEvents = function(calendar) {
  getRequest(Calendars[calendar]).execute(function(resp) {
    if(resp.summary === 'NY - OOO') {
    	buildOutOfOffice(resp.items);
    }
    else {
    	buildEvents(resp.items);
    }	
  });
};

var listAllEvents = function () {

  for(var calendar in Calendars) {
    listUpComingEvents(calendar);
  }

  setTimeout(function(){
  	  sortEventsByTime();
      renderEvents();
      fetchImages();
  }, 2000);
};