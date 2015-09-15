"use strict";var Events=[],Images=[],Calendars={own:"primary",support:"ideo.com_3ksmp10u6g268lutghfpb8bkl4@group.calendar.google.com",creativeConnections:"ideo.com_20hjl85r7mi3e2vtfncskfiabs@group.calendar.google.com",internal:"ideo.com_3ksmp10u6g268lutghfpb8bkl4@group.calendar.google.com",external:"ideo.com_20hjl85r7mi3e2vtfncskfiabs@group.calendar.google.com",projects:"ideo.com_v4vpo5b47up8803v4omofvet4c@group.calendar.google.com",ooo:"ideo.com_bdpb36toirhifucfijthud9dng@group.calendar.google.com",visitors:"ideo.com_34qgi5b59dtf8ljfls0ojtj804@group.calendar.google.com"},UI={tmpl:document.getElementById("event-template"),eventContainer:document.getElementById("event-container")},Event=function(e,t,r,n,a,o,i,s){this.summary=e,this.day=t,this.date=r,this.time=n,this.creator=o,this.where=a,this.calendar=i,this.sortIndex=s};Event.prototype.getColor=function(){return"NY Support"===this.calendar?"#255887":"NY - Creative Connections"===this.calendar?"#DE6B48":"NY - Internal"===this.calendar?"#25CED1":"NY - OOO"===this.calendar?"#379392":"NY - Visitors"===this.calendar?"#5995ED":"NY - External Events"===this.calendar?"#3F5478":"NY - Project Events"===this.calendar?"#E6AF2E":"rgb(0,155,255)"},Event.prototype.handler=function(e){var t=JSON.parse(e.target.response);if(t.results)for(var r=document.querySelectorAll('[data-person="'+t.results[0].email+'"]'),n=0;n<r.length;n++)r[n].src=""+t.results[0].image},Event.prototype.getImage=function(){var e=parseEmail(this.creator);callAjax(e,this.handler)};var callAjax=function(e,t){var r=new XMLHttpRequest;r.onload=t,r.open("GET","http://localhost:1235/api/teammembers?limit=10&offset=0&email="+e+"%40ideo.com"),r.send()},fetchImages=function(){for(var e=0;e<Events.length;e++){var t=Events[e];t.getImage()}},parseCreatorName=function(e){return e=e.replace(/\s/g,"")},parseEmail=function(e){return e.substring(0,e.indexOf("@"))},sortEventsByTime=function(){Events.sort(function(e,t){return e.sortIndex-t.sortIndex})},renderEvents=function(e){for(var t=0;e>t;t++){var r=Events[t],n=UI.tmpl.content.cloneNode(!0),a=document.getElementById(r.day);(0===t||t>0&&Events[t-1].day!==r.day)&&(n.querySelector(".event-day").innerHTML=r.day,n.querySelector(".event-date").innerHTML=r.date),n.querySelector(".event").id=r.id,n.querySelector(".event-title").innerHTML=r.summary,n.querySelector(".event-location").innerHTML=r.where,n.querySelector(".event-time").innerHTML=r.time,n.querySelector("img").setAttribute("data-person",r.creator),n.querySelector(".event-info").style.background=r.getColor(),a.appendChild(n)}},getEventDay=function(e){var t;return t=e.start.dateTime?e.start.dateTime:e.start.date,moment(t)},getDisplayTime=function(e){if(e.start.dateTime){var t=moment(e.start.dateTime).format("ddd"),r=moment(e.start.dateTime).format("D"),n=moment(e.start.dateTime),a=moment(e.end.dateTime);return[t,r,""+n.format("h:mm")+" - "+a.format("h:mm a")]}var o=e.start.date,t=moment(o).format("ddd"),r=moment(o).format("D");return[t,r,"All day"]},getCreator=function(e){var t;return t=e.creator.email?e.creator.email:e.organizer.email},getLocation=function(e){var t;return t=e.location?e.location:"New York"},getSortIndex=function(e){var t;t=e.start.dateTime?moment(e.start.dateTime):moment(e.start.date);var r=t.format("DD")+t.format("HH mm");return parseInt(r)},buildEvents=function(e){for(var t=0;t<e.length;t++){var r=e[t],n=r.summary,a=getDisplayTime(r)[0],o=getDisplayTime(r)[1],i=getDisplayTime(r)[2],s=getLocation(r),m=getCreator(r),l=r.organizer.displayName,c=getSortIndex(r);Events.push(new Event(n,a,o,i,s,m,l,c))}},getRequest=function(e){var t=gapi.client.calendar.events.list({calendarId:e,timeMin:(new Date).toISOString(),showDeleted:!1,singleEvents:!0,maxResults:15,orderBy:"startTime"});return t},listUpComingEvents=function(e){getRequest(Calendars[e]).execute(function(e){buildEvents(e.items)})},listAllEvents=function(){for(var e in Calendars)listUpComingEvents(e);setTimeout(function(){sortEventsByTime(),renderEvents(25),fetchImages()},2e3)};