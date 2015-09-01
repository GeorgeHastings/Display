'use strict';

var CLIENT_ID = '1054522317473-1q9d0u8sd9pqv7ie9cuvv27tsi47q9oo.apps.googleusercontent.com';

var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

/**
 * Check if current user has authorized this application.
 */
function checkAuth() {
  gapi.auth.authorize(
    {
      'client_id': CLIENT_ID,
      'scope': SCOPES,
      'immediate': true
    }, handleAuthResult);
}

function callAjax(emailName, callback){ // Url, Callback, just a placeholder
  var c = new XMLHttpRequest;
  c.open('GET', 'http://localhost:1235/api/teammembers?limit=10&offset=0&email='+emailName+'%40ideo.com');
  c.onload = callback;
  c.send();
}

/**
 * Handle response from authorization server.
 *
 * @param {Object} authResult Authorization result.
 */
function handleAuthResult(authResult) {
  var authorizeDiv = document.getElementById('authorize-div');
  if (authResult && !authResult.error) {
    // Hide auth UI, then load client library.
    authorizeDiv.style.display = 'none';
    loadCalendarApi();
  } else {
    // Show auth UI, allowing the user to initiate authorization by
    // clicking authorize button.
    authorizeDiv.style.display = 'inline';
  }
}

/**
 * Initiate auth flow in response to user clicking authorize button.
 *
 * @param {Event} event Button click event.
 */
function handleAuthClick(event) {
  gapi.auth.authorize(
    {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
    handleAuthResult);
  return false;
}

/**
 * Load Google Calendar client library. List upcoming events
 * once client library is loaded.
 */
function loadCalendarApi() {
  gapi.client.load('calendar', 'v3', listUpcomingEvents);
}

/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */

function isToday(whenObj) {
  if(moment().format('MMM Do YY') === whenObj.format('MMM Do YY')) {
    return true;
  }
}

function thereAreEvents(events) {
  if(events.length > 0) {
    return true;
  }
}

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
  if(creator) {
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

function listUpcomingEvents() {
  var request = gapi.client.calendar.events.list({
    'calendarId': 'primary',
    'timeMin': (new Date()).toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'maxResults': 10,
    'orderBy': 'startTime'
  });

  request.execute(function(resp) {
    var events = resp.items;

    if (thereAreEvents(events)) {
      for (var i = 0; i < events.length; i++) {
        var thisEvent = events[i];

        // if(isToday(getEventDay(thisEvent))){
          var summary = thisEvent.summary;
          var day = '';
          var date = '';
          var time = getDisplayTime(thisEvent)[2];
          var where = getLocation(thisEvent);
          var creator = getCreator(thisEvent);
          var calendar = thisEvent.organizer.displayName;

          if(i === 0 || i > 0 && getDisplayTime(events[i-1])[0] !== getDisplayTime(events[i])[0]) {
            day = getDisplayTime(thisEvent)[0];
            date = getDisplayTime(thisEvent)[1];
          }
          
          Events.push(new Event(summary, day, date, time, where, creator, calendar));

        // }
      }
      fetchImages();
      setTimeout(function(){
          renderEvents();
      }, 2000);
    }
  });
}