"use strict";function checkAuth(){gapi.auth.authorize({client_id:CLIENT_ID,scope:SCOPES,immediate:!0},handleAuthResult)}function callAjax(e,t){var a=new XMLHttpRequest;a.open("GET","http://localhost:1235/api/teammembers?limit=10&offset=0&email="+e+"%40ideo.com"),a.onload=t,a.send()}function handleAuthResult(e){var t=document.getElementById("authorize-div");e&&!e.error?(t.style.display="none",loadCalendarApi()):t.style.display="inline"}function handleAuthClick(e){return gapi.auth.authorize({client_id:CLIENT_ID,scope:SCOPES,immediate:!1},handleAuthResult),!1}function loadCalendarApi(){gapi.client.load("calendar","v3",listUpcomingEvents)}function isToday(e){return moment().format("MMM Do YY")===e.format("MMM Do YY")?!0:void 0}function thereAreEvents(e){return e.length>0?!0:void 0}function getEventDay(e){var t;return t=e.start.dateTime?e.start.dateTime:e.start.date,moment(t)}function getDisplayTime(e){if(e.start.dateTime){var t=moment(e.start.dateTime).format("ddd"),a=moment(e.start.dateTime).format("D"),n=moment(e.start.dateTime),i=moment(e.end.dateTime);return[t,a,""+n.format("h:mm")+" - "+i.format("h:mm a")]}var o=e.start.date,t=moment(o).format("ddd"),a=moment(o).format("D");return[t,a,"All day"]}function getCreator(e){var t;return t=t?e.creator.email:e.organizer.email}function getLocation(e){var t;return t=e.location?e.location:"New York"}function listUpcomingEvents(){var e=gapi.client.calendar.events.list({calendarId:"primary",timeMin:(new Date).toISOString(),showDeleted:!1,singleEvents:!0,maxResults:10,orderBy:"startTime"});e.execute(function(e){var t=e.items;if(thereAreEvents(t)){for(var a=0;a<t.length;a++){var n=t[a],i=n.summary,o="",r="",m=getDisplayTime(n)[2],s=getLocation(n),l=getCreator(n),d=n.organizer.displayName;(0===a||a>0&&getDisplayTime(t[a-1])[0]!==getDisplayTime(t[a])[0])&&(o=getDisplayTime(n)[0],r=getDisplayTime(n)[1]),Events.push(new Event(i,o,r,m,s,l,d))}fetchImages(),setTimeout(function(){renderEvents()},2e3)}})}var CLIENT_ID="1054522317473-1q9d0u8sd9pqv7ie9cuvv27tsi47q9oo.apps.googleusercontent.com",SCOPES=["https://www.googleapis.com/auth/calendar.readonly"];