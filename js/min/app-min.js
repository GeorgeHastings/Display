"use strict";function callAjax(e,t){var n=new XMLHttpRequest;n.onload=t,n.open("GET","http://localhost:1235/api/teammembers?limit=10&offset=0&email="+e+"%40ideo.com"),n.send()}var Events=[],Images=[],Calendars={internal:"ideo.com_3ksmp10u6g268lutghfpb8bkl4@group.calendar.google.com",external:"ideo.com_20hjl85r7mi3e2vtfncskfiabs@group.calendar.google.com",projects:"ideo.com_v4vpo5b47up8803v4omofvet4c@group.calendar.google.com"},UI={tmpl:document.getElementById("event-template"),eventContainer:document.getElementById("event-container")},Event=function(e,t,n,r,a,o,i,s){this.summary=e,this.day=t,this.date=n,this.time=r,this.creator=o,this.where=a,this.calendar=i,this.sortIndex=s};Event.prototype.getColor=function(){return"NY Support"===this.calendar?"#33AD9B":"NY - Internal"===this.calendar?"#64BDE3":"NY - OOO"===this.calendar||"NYC Staff Vacations"===this.calendar?"brown":"NY - Visitors"===this.calendar?"#F37F82":"NY - External Events"===this.calendar?"#9BCE7A":"NY - Client Events"===this.calendar?"#F6A23E":"black"},Event.prototype.handler=function(e){var t=JSON.parse(e.target.response);if(t.results)for(var n=document.querySelectorAll('[data-person="'+t.results[0].email+'"]'),r=0;r<n.length;r++)n[r].src=""+t.results[0].image},Event.prototype.getImage=function(){var e=parseEmail(this.creator);callAjax(e,this.handler)};var fetchImages=function(){for(var e=0;e<Events.length;e++){var t=Events[e];t.getImage()}},parseCreatorName=function(e){return e=e.replace(/\s/g,"")},parseEmail=function(e){return e.substring(0,e.indexOf("@"))},sortEventsByTime=function(){Events.sort(function(e,t){return e.sortIndex-t.sortIndex})},renderEvents=function(e){for(var t=0;e>t;t++){var n=Events[t],r=UI.tmpl.content.cloneNode(!0);(0===t||t>0&&Events[t-1].day!==n.day)&&(r.querySelector(".event-day").innerHTML=n.day,r.querySelector(".event-date").innerHTML=n.date),r.querySelector(".event").id=n.id,r.querySelector(".event-title").innerHTML=n.summary,r.querySelector(".event-location").innerHTML=n.where,r.querySelector(".event-time").innerHTML=n.time,r.querySelector("img").setAttribute("data-person",n.creator),r.querySelector(".event-info").style.background=n.getColor(),"All day"===n.time&&(r.querySelector(".event").className+=" all-day"),UI.eventContainer.appendChild(r)}},getEventDay=function(e){var t;return t=e.start.dateTime?e.start.dateTime:e.start.date,moment(t)},getDisplayTime=function(e){if(e.start.dateTime){var t=moment(e.start.dateTime).format("ddd"),n=moment(e.start.dateTime).format("D"),r=moment(e.start.dateTime),a=moment(e.end.dateTime);return[t,n,""+r.format("h:mm")+" - "+a.format("h:mm a")]}var o=e.start.date,t=moment(o).format("ddd"),n=moment(o).format("D");return[t,n,"All day"]},getCreator=function(e){var t;return t=e.creator.email?e.creator.email:e.organizer.email},getLocation=function(e){var t;return t=e.location?e.location:"New York"},getSortIndex=function(e){var t;t=e.start.dateTime?moment(e.start.dateTime):moment(e.start.date);var n=t.format("MM")+t.format("DD")+t.format("HH mm");return parseInt(n)},buildEvents=function(e){for(var t=0;t<e.length;t++){var n=e[t],r=n.summary,a=getDisplayTime(n)[0],o=getDisplayTime(n)[1],i=getDisplayTime(n)[2],s=getLocation(n),m=getCreator(n),l=n.organizer.displayName,c=getSortIndex(n);Events.push(new Event(r,a,o,i,s,m,l,c))}},getRequest=function(e){var t=gapi.client.calendar.events.list({calendarId:e,timeMin:(new Date).toISOString(),showDeleted:!1,singleEvents:!0,maxResults:10,orderBy:"startTime"});return t},listUpComingEvents=function(e){getRequest(Calendars[e]).execute(function(e){e.items&&buildEvents(e.items)})},listAllEvents=function(){for(var e in Calendars)listUpComingEvents(e);setTimeout(function(){sortEventsByTime(),renderEvents(10),fetchImages()},2e3)};