"use strict";var CurrentWeek=0,Events=[],Calendars={internal:"ideo.com_p0gg0riugm6d554et1jic6okrg@group.calendar.google.com",external:"ideo.com_20hjl85r7mi3e2vtfncskfiabs@group.calendar.google.com",projects:"ideo.com_v4vpo5b47up8803v4omofvet4c@group.calendar.google.com"},UI={tmpl:document.getElementById("event-template"),eventContainer:document.getElementById("event-container")},Event=function(e,t,n,r,a,o,i,s){this.summary=e,this.day=t,this.date=n,this.time=r,this.creator=o,this.where=a,this.calendar=i,this.sortIndex=s};Event.prototype.getColor=function(){return"NY - Creative Connections"===this.calendar?"#DE6B48":"NY - Internal"===this.calendar||"NY - Internal Events"===this.calendar?"#25CED1":"NY - OOO"===this.calendar||"NY - Staff Vacations"===this.calendar?"#379392":"NY - External Events"===this.calendar?"#3F5478":"NY - Client Events"===this.calendar?"#E6AF2E":"rgb(0,155,255)"},Event.prototype.handler=function(e){var t=JSON.parse(e.target.response);if(t.results)for(var n=document.querySelectorAll('[data-person="'+t.results[0].email+'"]'),r=0;r<n.length;r++)n[r].src=""+t.results[0].image};var parseCreatorName=function(e){return e=e.replace(/\s/g,"")},parseEmail=function(e){return e.substring(0,e.indexOf("@"))},sortEventsByTime=function(){Events.sort(function(e,t){return e.sortIndex-t.sortIndex})},renderDateTitles=function(e){for(var t=document.querySelectorAll(".week-container li"),n=["Monday","Tuesday","Wednesday","Thursday","Friday"],r=0;r<t.length;r++)t[r].innerHTML+='<div class="date">'+moment().add(e,"week").day(n[r]).format("dddd M/D")+"</div>"},renderEvents=function(e){for(var t=0;e>t;t++){var n=Events[t],r=UI.tmpl.content.cloneNode(!0),a=document.getElementById(n.day);if("All day"===n.time&&(r.querySelector(".event-time").style.display="none"),r.querySelector(".event").id=n.id,r.querySelector(".event-title").innerHTML=n.summary,r.querySelector(".event-time").innerHTML=n.time,r.querySelector(".event-info").style.background=n.getColor(),!a)return;a.appendChild(r)}},clearCalendar=function(){Events=[];for(var e=document.querySelectorAll(".week-container li"),t=0;t<e.length;t++)e[t].innerHTML=""},getEventDay=function(e){var t;return t=e.start.dateTime?e.start.dateTime:e.start.date,moment(t)},getDisplayTime=function(e){if(e.start.dateTime){var t=moment(e.start.dateTime).format("ddd"),n=moment(e.start.dateTime).format("D"),r=moment(e.start.dateTime),a=moment(e.end.dateTime);return[t,n,""+r.format("h:mm")+" - "+a.format("h:mm a")]}var o=e.start.date,t=moment(o).format("ddd"),n=moment(o).format("D");return[t,n,"All day"]},getCreator=function(e){var t;return t=e.creator.email?e.creator.email:e.organizer.email},getLocation=function(e){var t;return t=e.location?e.location:"New York"},getSortIndex=function(e){var t;t=e.start.dateTime?moment(e.start.dateTime):moment(e.start.date);var n=t.format("MM")+t.format("DD")+t.format("HH mm");return parseInt(n)},buildEvents=function(e){if(e)for(var t=0;t<e.length;t++){var n=e[t],r=n.summary,a=getDisplayTime(n)[0],o=getDisplayTime(n)[1],i=getDisplayTime(n)[2],s=getLocation(n),d=getCreator(n),l=n.organizer.displayName,m=getSortIndex(n);Events.push(new Event(r,a,o,i,s,d,l,m))}},getRequest=function(e,t){var n=gapi.client.calendar.events.list({calendarId:e,timeMin:moment().add(t,"week").format(),timeMax:moment().add(t+1,"week").endOf("isoWeek").toISOString(),showDeleted:!1,singleEvents:!0,maxResults:20,orderBy:"startTime"});return n},listUpComingEvents=function(e,t){getRequest(Calendars[e],t).execute(function(e){buildEvents(e.items)})},listAllEvents=function(e){for(var t in Calendars)listUpComingEvents(t,e);setTimeout(function(){sortEventsByTime(),renderEvents(20)},2e3)};document.addEventListener("DOMContentLoaded",function(){renderDateTitles(0)}),document.getElementById("pageCalRight").addEventListener("click",function(){CurrentWeek++,clearCalendar(),listAllEvents(CurrentWeek),renderDateTitles(CurrentWeek)}),document.getElementById("pageCalLeft").addEventListener("click",function(){CurrentWeek--,clearCalendar(),listAllEvents(CurrentWeek),renderDateTitles(CurrentWeek)});