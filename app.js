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
var userLat = 0;
var userLng = 0;

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
	
	document.getElementById("loadingmessage").innerHTML = getMessage("loading");
	resolveLocationAndFetchObservationData(true);
	$("#helpmessage").html(getMessage("tapheretorefresh"));
}

function resolveLocationAndFetchObservationData(appinit) {
	
	document.getElementById("loadingoverlay").style.visibility = "visible";
	
	start = new Date(new Date().getTime() - (3 * 60 * 60 * 1000));
	end = new Date();
	
	var starttime = getTimestamp(start);
	var endtime = getTimestamp(end);
	
	$.ajax({
		url : "http://www.markuskarjalainen.com/rest/uv/",
		data : {"apikey" : "dXYtdHJhY2tlci1pZA==", "starttime" : starttime, "endtime" : endtime, "country" : $("#country").data("ddslick").selectedIndex + 1},
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
			userLat = position.coords.latitude;
			userLng = position.coords.longitude;
			displayObservation(index, getDistance(userLat, userLng,
							    observatories["data"][index].latitude,
							    observatories["data"][index].longitude));
			document.getElementById("loadingoverlay").style.visibility = "hidden";
			if(appinit) {
				$("#help").css("visibility", "visible");
				$("#help").fadeOut(3000);
			}
		
		});
	
	} else {
		
		displayObservation(0, "N/A");
		document.getElementById("loadingoverlay").style.visibility = "hidden";
		if(appinit) {
			$("#help").css("visibility", "visible");
			$("#help").fadeOut(3000);
		}
		
	}
	
}

function findIndexOfClosestCoordinate(lat, lng, data) {
	
	var LAT = lat;
	var LNG = lng;
	
	var min = 9999999;
	
	for(var i = 0;i < data.length;i++) {
		var lat = data[i].latitude;
		var lng = data[i].longitude;
		var distance = getDistance(LAT, LNG, lat, lng);
		
		if(distance < min) {
			min = distance;
			index = i;
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

function displayObservation(idx, distance) {
	
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
	
	document.getElementById("distance").innerHTML = Math.round(distance) + " " + getMessage("distance");

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
		displayObservation(previous(idx), getDistance(userLat, userLng,
			    observatories["data"][previous(idx)].latitude,
			    observatories["data"][previous(idx)].longitude));
	};
	
	document.getElementById("next").onclick = function () {
		displayObservation(next(idx), getDistance(userLat, userLng,
			    observatories["data"][next(idx)].latitude,
			    observatories["data"][next(idx)].longitude));
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

function getDistance(lat1,lng1,lat2,lng2) {
    var R = 6371; 
    var dLat = deg2rad(lat2-lat1);
    var dLng = deg2rad(lng2-lng1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180);
}
