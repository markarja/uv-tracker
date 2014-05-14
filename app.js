var background = {
	"2" : "#46a700", 
	"3" : "#fff900", 
	"6" : "#e97b00", 
	"8" : "#d81300", 
	"11" : "#a6589d"
};

var classification = {
	"2" : "#467400", 
	"3" : "#ff8500", 
	"6" : "#e90000", 
	"8" : "#fff900", 
	"11" : "#c9b0da"
};

var observatories = null;
var index = -1;
var start = new Date(new Date().getTime() - (3 * 60 * 60 * 1000));
var end = new Date();

function init() {
	
	language = window.navigator.language ||
    window.navigator.browserLanguage;
	language = language.toLowerCase();
	localize(language);
	window.addEventListener("resize", onOrientationChanged, false);
	document.getElementById("loadingmessage").innerHTML = getMessage("loading");
	var starttime = getTimestamp(start);
	var endtime = getTimestamp(end);
	
	$.ajax({
		url : "http://www.markuskarjalainen.com/rest/uv/?starttime=" + starttime + "&endtime=" + endtime,
		async : false,
		success : function(data) {
			observatories = jQuery.parseJSON(data);
		}
	});
	
	navigator.geolocation.getCurrentPosition(function(position) {
		
		var LAT = position.coords.latitude;
		var LNG = position.coords.longitude;
		
		var min = 999;
		
		for(var i = 0;i < observatories["data"].length;i++) {
			var lat = observatories["data"][i].latitude;
			var lng = observatories["data"][i].longitude;
			var a = 0;
			var b = 0;
			var c = 0;
			if(Math.abs(lat) >= 0 && Math.abs(LAT) >= 0) {
				a = Math.abs(Math.abs(LAT) - Math.abs(lat));
			} else {
				a = Math.abs(lat) + Math.abs(LAT);
			}
			
			if(Math.abs(lng) >= 0 && Math.abs(LNG) >= 0) {
				b = Math.abs(Math.abs(LNG) - Math.abs(lng));
			} else {
				b = Math.abs(lng) + Math.abs(LNG);
			}
			
			if(a == 0) {
				c = b;
			} else if(b == 0) {
				c = a;
			} else {
				c = a * a + b * b;
				c = Math.sqrt(c);
			}
			
			if(c < min) {
				index = i;
				min = c;
			}
		}
		
		displayObservation(index);
		document.getElementById("loadingoverlay").style.visibility = "hidden";
		
	});
}

function next(idx) {
	idx++;
	if(idx > observatories["data"].length - 1) {
		idx = 0;
	} 
	return idx;
}

function previous(idx) {
	idx--;
	if(idx < 0) {
		idx = observatories["data"].length - 1;
	} 
	return idx;
}

function displayObservation(idx) {
	
	var uvIndex = observatories["data"][idx].index;
	uvIndex = Math.round((uvIndex * 1) + Math.random() * 12, 1);
	document.getElementById("measurement").innerHTML = uvIndex;
	document.getElementById("location").innerHTML = 
		observatories["data"][idx].name;
	document.getElementById("origin").innerHTML =
		getDate(new Date()) + " " + getMessage("origin") + "<br />" + 
		getTime(start) + " - " + getTime(end) + " " + getMessage("averageof") + " " + 
		observatories["data"][idx].observations + " " + 
		getMessage("observations") + ".";

	if(uvIndex <= 3.0) {
		document.body.style.background = background["2"];
		document.body.style.color = "#ffffff";
		document.getElementById("previous").src = "res/previous.png";
		document.getElementById("next").src = "res/next.png";			
		document.getElementById("classification").innerHTML = getMessage("2");
		document.getElementById("classification").style.color = classification["2"];
		document.getElementById("message").innerHTML = getMessage("2-message");
	} else if(uvIndex <= 6.0) {
		document.body.style.background = background["3"];
		document.body.style.color = "#000000";
		document.getElementById("previous").src = "res/_previous.png";
		document.getElementById("next").src = "res/_next.png";
		document.getElementById("classification").innerHTML = getMessage("3");
		document.getElementById("classification").style.color = classification["3"];
		document.getElementById("message").innerHTML = getMessage("3-message");
	} else if(uvIndex <= 8.0) {
		document.body.style.background = background["6"];
		document.body.style.color = "#ffffff";
		document.getElementById("previous").src = "res/previous.png";
		document.getElementById("next").src = "res/next.png";
		document.getElementById("classification").innerHTML = getMessage("6");
		document.getElementById("classification").style.color = classification["6"];
		document.getElementById("message").innerHTML = getMessage("6-message");
	} else if(uvIndex <= 11.0) { 
		document.body.style.background = background["8"];
		document.body.style.color = "#ffffff";
		document.getElementById("previous").src = "res/previous.png";
		document.getElementById("next").src = "res/next.png";
		document.getElementById("classification").innerHTML = getMessage("8");
		document.getElementById("classification").style.color = classification["8"];
		document.getElementById("message").innerHTML = getMessage("8-message");
	} else {
		document.body.style.background = background["11"];
		document.body.style.color = "#ffffff";
		document.getElementById("previous").src = "res/previous.png";
		document.getElementById("next").src = "res/next.png";
		document.getElementById("classification").innerHTML = getMessage("11");
		document.getElementById("classification").style.color = classification["11"];
		document.getElementById("message").innerHTML = getMessage("11-message");
	}
	
	document.getElementById("previous").onclick = function () {
		displayObservation(previous(idx));
	};
	
	document.getElementById("next").onclick = function () {
		displayObservation(next(idx));
	};
}

function getTimestamp(d) {
    return d.getFullYear() + "-" +
           ((d.getMonth() + 1 < 10) ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1)) + "-" +
   		   ((d.getDate() < 10) ? "0" + d.getDate() : d.getDate()) +
           "T" +
           ((d.getHours() < 10) ? "0" + d.getHours() : d.getHours()) + ":00:00Z";
}

function getDate(d) {
	return ((d.getDate() < 10) ? "0" + d.getDate() : d.getDate()) + "." + 
		   ((d.getMonth() + 1 < 10) ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1)) + "." +
			d.getFullYear();
}

function getTime(d) {
	return ((d.getHours() < 10) ? "0" + d.getHours() : d.getHours()) + ":00";
}

function onOrientationChanged() {
	if(portrait()) {
		document.getElementById("footer").style.visibility = "visible";
	} else {
		document.getElementById("footer").style.visibility = "hidden";
	}
}

function portrait() {
	if(window.innerHeight > window.innerWidth) {
		return true;
	} else {
		return false;
	}
}
