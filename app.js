var background = {
	"2" : "#46a700", 
	"3" : "#fff900", 
	"6" : "#e97b00", 
	"8" : "#d81300", 
	"11" : "#6b49c8"
};

var classification = {
	"2" : "#ffffff", 
	"3" : "#000000", 
	"6" : "#ffffff", 
	"8" : "#ffffff", 
	"11" : "#ffffff"
};

var observatories = null;
var index = -1;
var start = new Date(new Date().getTime() - (3 * 60 * 60 * 1000));
var end = new Date();
var country = 1;
var countryCoordinates = 
	{"data":[{"name":"Finland","latitude":"64.2885818","longitude":"25.9894028"},
	         {"name":"Australia","latitude":"-25.5852413","longitude":"134.5041199"}]};

function init() {
	language = window.navigator.language ||
    window.navigator.browserLanguage;
	language = language.toLowerCase();
	localize(language);
	$("#country").ddslick({
	    data: [
	      {
	        text: getMessage("finland"),
	        value: 1,
	        selected: true,
	        description: getMessage("fmi"),
	        imageSrc: "res/finland.png"
	      },
	      {
		        text: getMessage("australia"),
		        value: 2,
		        selected: false,
		        description: getMessage("arpansa"),
		        imageSrc: "res/australia.png"
		  }
	    ],
	    width: window.innerWidth,
	    imagePosition: "left",
	    selectText: "Select a country",
	    onSelected: function (data) {
	        country = data["selectedData"].value;
	        resolveLocationAndFetchObservationData();
	    }
	});
	
	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var i = findIndexOfClosestCoordinate(position.coords.latitude, 
					position.coords.longitude, countryCoordinates["data"]);
			$("#country").ddslick("select", {index: i});
		});
	}
	
	window.addEventListener("resize", onOrientationChanged, false);
	document.getElementById("loadingmessage").innerHTML = getMessage("loading");
	resolveLocationAndFetchObservationData();
	
}

function resolveLocationAndFetchObservationData() {
	
	document.getElementById("loadingoverlay").style.visibility = "visible";
	
	var starttime = getTimestamp(start);
	var endtime = getTimestamp(end);
	
	$.ajax({
		url : "http://www.markuskarjalainen.com/rest/test/",
		data : { "apikey" : "dXYtdHJhY2tlci1pZA==", "starttime" : starttime, "endtime" : endtime, "country" : $("#country").data("ddslick").selectedIndex + 1},
		async : false,
		success : function(data) {
			observatories = jQuery.parseJSON(data);
		},
		error: function (xhr, ajaxOptions, thrownError) {
			document.getElementById("loadingimage").src = "res/noconnection.png";
			document.getElementById("loadingmessage").innerHTML = getMessage("noconnection");
	    }
	});
	
	if(navigator.geolocation) {
		
		navigator.geolocation.getCurrentPosition(function(position) {
			
			var index = findIndexOfClosestCoordinate(position.coords.latitude, position.coords.longitude, observatories["data"]);
			
			displayObservation(index);
			document.getElementById("loadingoverlay").style.visibility = "hidden";
		
		});
	
	} else {
		
		displayObservation(0);
		document.getElementById("loadingoverlay").style.visibility = "hidden";
		
	}
}

function findIndexOfClosestCoordinate(lat, lng, data) {
	
	var LAT = lat;
	var LNG = lng;
	
	var min = 999;
	
	for(var i = 0;i < data.length;i++) {
		var lat = data[i].latitude;
		var lng = data[i].longitude;
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
	
	return index;
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
	document.getElementById("measurement").innerHTML = uvIndex;
	document.getElementById("location").innerHTML = 
		observatories["data"][idx].name;
	if(country == 2) {
		document.getElementById("origin").innerHTML = 
			observatories["data"][idx].observations + "<br />" +
			getMessage("origin." + country); 
	} else {
		document.getElementById("origin").innerHTML =
			getDate(new Date()) + " " + getMessage("origin." + country) + "<br />" + 
			getTime(start) + " - " + getTime(end) + " " + getMessage("averageof") + " " + 
			observatories["data"][idx].observations + " " + 
			getMessage("observations") + ".";
	}

	var s = window.innerWidth / 11;
	
	if(uvIndex == 0) {
		document.getElementById("arrow").style.paddingLeft = "0px";
	} else if(uvIndex >= 11) {
		document.getElementById("arrow").style.paddingLeft = (s * 11 - s) + "px";
	} else {
		var padding = s * uvIndex - s;
		if(padding < 0) {
			document.getElementById("arrow").style.paddingLeft = "0px";
		} else if(padding == 0) {
			document.getElementById("arrow").style.paddingLeft = s + "px";
		} else {
			document.getElementById("arrow").style.paddingLeft = padding + "px";
		}
	}
	
	if(uvIndex <= 2.9) {
		document.body.style.background = background["2"];
		document.body.style.color = "#ffffff";
		document.getElementById("previous").src = "res/previous.png";
		document.getElementById("next").src = "res/next.png";			
		document.getElementById("classification").innerHTML = getMessage("2");
		document.getElementById("classification").style.color = classification["2"];
		document.getElementById("message").innerHTML = getMessage("2-message");
	} else if(uvIndex <= 5.9) {
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
	} else if(uvIndex <= 10.9) { 
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
		document.getElementById("country").style.visibility = "visible";
		document.getElementById("country").style.display = "block";
		document.getElementById("message").style.visibility = "visible";
		document.getElementById("footer").style.visibility = "visible";
	} else {
		document.getElementById("country").style.visibility = "hidden";
		document.getElementById("country").style.display = "none";
		document.getElementById("message").style.visibility = "hidden";
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
