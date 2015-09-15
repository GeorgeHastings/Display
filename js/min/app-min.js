"use strict";var Events=[],Images=[],Calendars={own:"primary",support:"ideo.com_3ksmp10u6g268lutghfpb8bkl4@group.calendar.google.com",creativeConnections:"ideo.com_20hjl85r7mi3e2vtfncskfiabs@group.calendar.google.com",internal:"ideo.com_3ksmp10u6g268lutghfpb8bkl4@group.calendar.google.com",external:"ideo.com_20hjl85r7mi3e2vtfncskfiabs@group.calendar.google.com",projects:"ideo.com_v4vpo5b47up8803v4omofvet4c@group.calendar.google.com",visitors:"ideo.com_34qgi5b59dtf8ljfls0ojtj804@group.calendar.google.com"},UI={tmpl:document.getElementById("event-template"),eventContainer:document.getElementById("event-container")},Event=function(e,t,n,r,a,o,i,s){this.summary=e,this.day=t,this.date=n,this.time=r,this.creator=o,this.where=a,this.calendar=i,this.sortIndex=s};Event.prototype.getColor=function(){return"NY Support"===this.calendar?"#255887":"NY - Creative Connections"===this.calendar?"#DE6B48":"NY - Internal"===this.calendar?"#25CED1":"NY - OOO"===this.calendar?"#379392":"NY - Visitors"===this.calendar?"#5995ED":"NY - External Events"===this.calendar?"#3F5478":"NY - Project Events"===this.calendar?"#E6AF2E":"rgb(0,155,255)"},Event.prototype.handler=function(e){var t=JSON.parse(e.target.response);if(t.results)for(var n=document.querySelectorAll('[data-person="'+t.results[0].email+'"]'),r=0;r<n.length;r++)n[r].src=""+t.results[0].image},Event.prototype.getImage=function(){var e=parseEmail(this.creator);callAjax(e,this.handler)};var callAjax=function(e,t){var n=new XMLHttpRequest;n.onload=t,n.open("GET","http://localhost:1235/api/teammembers?limit=10&offset=0&email="+e+"%40ideo.com"),n.send()},fetchImages=function(){for(var e=0;e<Events.length;e++){var t=Events[e];t.getImage()}},parseCreatorName=function(e){return e=e.replace(/\s/g,"")},parseEmail=function(e){return e.substring(0,e.indexOf("@"))},sortEventsByTime=function(){Events.sort(function(e,t){return e.sortIndex-t.sortIndex})},renderEvents=function(e){for(var t=0;e>t;t++){var n=Events[t],r=UI.tmpl.content.cloneNode(!0),a;if(n.day&&(a=document.getElementById(n.day)),(0===t||t>0&&Events[t-1].day!==n.day)&&(r.querySelector(".event-day").innerHTML=n.day,r.querySelector(".event-date").innerHTML=n.date),r.querySelector(".event").id=n.id,r.querySelector(".event-title").innerHTML=n.summary,r.querySelector(".event-time").innerHTML=n.time,r.querySelector(".event-info").style.background=n.getColor(),!n.day)return;a.appendChild(r)}},getEventDay=function(e){var t;return t=e.start.dateTime?e.start.dateTime:e.start.date,moment(t)},getDisplayTime=function(e){if(e.start.dateTime){var t=moment(e.start.dateTime).format("ddd"),n=moment(e.start.dateTime).format("D"),r=moment(e.start.dateTime),a=moment(e.end.dateTime);return[t,n,""+r.format("h:mm")+" - "+a.format("h:mm a")]}var o=e.start.date,t=moment(o).format("ddd"),n=moment(o).format("D");return[t,n,"All day"]},getCreator=function(e){var t;return t=e.creator.email?e.creator.email:e.organizer.email},getLocation=function(e){var t;return t=e.location?e.location:"New York"},getSortIndex=function(e){var t;t=e.start.dateTime?moment(e.start.dateTime):moment(e.start.date);var n=t.format("DD")+t.format("HH mm");return parseInt(n)},buildEvents=function(e){if(e)for(var t=0;t<e.length;t++){var n=e[t],r=n.summary,a=getDisplayTime(n)[0],o=getDisplayTime(n)[1],i=getDisplayTime(n)[2],s=getLocation(n),m=getCreator(n),l=n.organizer.displayName,c=getSortIndex(n);Events.push(new Event(r,a,o,i,s,m,l,c))}},getRequest=function(e){var t=gapi.client.calendar.events.list({calendarId:e,timeMin:(new Date).toISOString(),timeMax:moment().endOf("isoWeek").toISOString(),showDeleted:!1,singleEvents:!0,maxResults:15,orderBy:"startTime"});return t},listUpComingEvents=function(e){getRequest(Calendars[e]).execute(function(e){buildEvents(e.items)})},listAllEvents=function(){for(var e in Calendars)listUpComingEvents(e);setTimeout(function(){sortEventsByTime(),renderEvents(30)},2e3)};