var gauge = null;
var q = "0,0";
var index = 0;
var indexName = "";
var locality = "";
var language = "";

if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}

Date.prototype.today = function () { 
    return ((this.getDate() < 10) ? "0": "") + this.getDate() + "." + 
           (((this.getMonth() + 1) < 10) ? "0" : "") + 
           (this.getMonth() + 1) + "." + this.getFullYear();
};

Date.prototype.timeNow = function () {
     return ((this.getHours() < 10) ? "0" : "") + this.getHours() + ":"+ 
            ((this.getMinutes() < 10) ? "0" : "") + this.getMinutes() + ":" + 
            ((this.getSeconds() < 10) ? "0" : "") + this.getSeconds();
};

function init() {

	language = window.navigator.language || window.navigator.browserLanguage;
	language = language.toLowerCase();
	
	if(language.startsWith("es")) {
		language = "es-es";
	} else if(language.startsWith("de")) {
		language = "de-de";
	} else if(language.startsWith("nl")) {
		language = "nl-nl";
	} else if(language.startsWith("it")) {
		language = "it-it";
	}
	
	localize(language);
	
    gauge = new GaugeSVG({
		id: "gauge"
    });

    reposition();
    
	document.addEventListener("deviceready", onDeviceReady, false);
	window.addEventListener("resize", onOrientationChanged, false);
	
	onOrientationChanged();
	
	$("#swiper-container").css("height", window.innerHeight);
	$("#swiper-container").css("width", window.innerWidth);

}

function reposition() {
    $("#gauge").css("left", (window.innerWidth / 2) - $("#gauge").css("width").replace("px", "") / 2 + "px");
}

function onOrientationChanged() {
	if(portrait()) {
		reposition();
		$("#protectioninfocontainer").show();
		$("#protectioninfo").show();
		$("#buttons").show();
	} else {
		reposition();
		if(window.innerHeight <= 480) {
			$("#protectioninfocontainer").hide();
			$("#protectioninfo").hide();
			$("#buttons").hide();
		}
	}
}

function portrait() {
	if(window.innerHeight > window.innerWidth) {
		return true;
	} else {
		return false;
	}
}

function onDeviceReady() {
	admob.createBannerView({
		publisherId: "ca-app-pub-1309397168819129/6817482896",
		isTesting: false,
		offsetStatusBar: true,
		bannerAtTop: true
	});
    refresh(true);
}

function refresh(init) {
	$("#spinner").show();
	gauge.refresh(0.0);
	document.getElementById("altitude").style.visibility = "hidden";	
	
	if(isLargeDisplay()) {
		document.getElementById("messagecontainer").style.top = "290px";
	} else {
		document.getElementById("messagecontainer").style.top = "225px";
	}
	
	$("#header").html(getMessage("header-nolocation"));
	$("#source").html("");
	$("#exposureinfo").html("");
	$("#protectioninfo").html(getMessage("loading") + "...");
	$("#valuename").html("");
	if(navigator.geolocation) {
    	navigator.geolocation.getCurrentPosition(function(position) {
    		
    		q = position.coords.latitude + "," + position.coords.longitude;
    		
    		var altitude = Math.round(position.coords.altitude);
    		var displayAltitude = altitude;
    		
    		if(position.coords.altitudeAccuracy == null || 
    		   position.coords.altitudeAccuracy < 1000) {
	    		if(altitude > 1000) {
	    			altitude = 1 + (altitude / (1000 * 10));
	    			document.getElementById("altitude").innerHTML = "altitude " + displayAltitude + " m impact +" + Math.round((altitude - 1) * 100) + " %";
	    			if(isLargeDisplay()) {
	    				document.getElementById("messagecontainer").style.top = "315px";
	    			} else {
	    				document.getElementById("messagecontainer").style.top = "245px";
	    			}
	    			document.getElementById("altitude").style.visibility = "visible";
	    		} else {
	    			document.getElementById("altitude").style.visibility = "hidden";
	    			if(isLargeDisplay()) {
	    				document.getElementById("messagecontainer").style.top = "290px";
	    			} else {
	    				document.getElementById("messagecontainer").style.top = "225px";
	    			}
	    			altitude = 1;
	    		}
    		} else {
    			document.getElementById("altitude").style.visibility = "hidden";
    			if(isLargeDisplay()) {
    				document.getElementById("messagecontainer").style.top = "225px";
    			} else {
    				document.getElementById("messagecontainer").style.top = "290px";
    			}
    			altitude = 1;
    		}
    		
    		start = new Date(new Date().getTime() - (3 * 60 * 60 * 1000));
    		end = new Date();
    		
    		var starttime = getTimestamp(start);
    		var endtime = getTimestamp(end);
    		
    		$.ajax({
				url : "https://www.markuskarjalainen.com/rest/uv/",
				data : {"apikey" : "dXYtdHJhY2tlci1pZA==", "q" : q, "starttime" : starttime, "endtime" : endtime, "language" : language, "free" : true},
				async : false,
				success : function(data) {
					var response = jQuery.parseJSON(data);
					index = response["data"][0].index;
					if(response["data"][0].location == '') {
						$("#header").html(getMessage("header-nolocation"));
					} else {
						$("#header").html(getMessage("header") + " " + response["data"][0].location);
					}
					locality = response["data"][0].location;
					$("#source").html(response["data"][0].source);				
					
					var displayIndex = parseFloat(index) * altitude;
					
				    gauge.refresh(Math.round((displayIndex + 0.5) * 10) / 10, true);
				    setTimeout(function () {
				        gauge.refresh(Math.round(displayIndex * 10) / 10, true);
				    }, 1700);
				    
			        index = Math.round((parseFloat(index) * altitude) * 10) / 10;
				    
				    var change = "";
				    var precentage = 100;
				    var previous = 0;
				    var result = 0;
				    
				    if(window.localStorage.getItem("index") != null) {
				    	previous = parseFloat(window.localStorage.getItem("index"));
				    	var lat = window.localStorage.getItem("lat");
				        var lng = window.localStorage.getItem("lng");
				        var distance = getDistance(lat, lng, position.coords.latitude, position.coords.longitude);
				        if(distance < 10) {
				        	result = parseFloat(index) - previous;
						    document.getElementById("previousindex").innerHTML = window.localStorage.getItem("index");
						    if(window.localStorage.getItem("index") < 3) {
						    	document.getElementById("previousindex").className = "index1-3";
						    } else if(window.localStorage.getItem("index") >= 3 && window.localStorage.getItem("index") < 6) {
						    	document.getElementById("previousindex").className = "index3-6";
						    } else if(window.localStorage.getItem("index") >= 6 && window.localStorage.getItem("index") < 8) {
						    	document.getElementById("previousindex").className = "index6-8";
						    } else if(window.localStorage.getItem("index") >= 8 && window.localStorage.getItem("index") < 11) {
						    	document.getElementById("previousindex").className = "index8-11";
						    } else {
						    	document.getElementById("previousindex").className = "index11";
						    }
						    document.getElementById("previouslocationvalue").innerHTML = window.localStorage.getItem("location");
						    document.getElementById("previoustime").innerHTML = window.localStorage.getItem("time");
				        	window.localStorage.setItem("index", index);
					    	window.localStorage.setItem("lat", position.coords.latitude);
					    	window.localStorage.setItem("lng", position.coords.longitude);
					    	window.localStorage.setItem("location", (locality != "") ? locality : "N/A");
					    	window.localStorage.setItem("time", end.today() + " " + end.timeNow());
					    	precentage = 100;
					    	if(previous > 0) {
					    		precentage = Math.abs(Math.round((result / previous) * 100));
					    	}
					    	if(result < 0) {					    		
					    		change = '&nbsp;<i class="fa fa-caret-down"></i> ' + precentage + ' %';
					    	} else if(result > 0) {
					    		change = '&nbsp;<i class="fa fa-caret-up"></i> ' + precentage + ' %';
					    	}
				        } else {
				        	window.localStorage.setItem("index", index);
					    	window.localStorage.setItem("lat", position.coords.latitude);
					    	window.localStorage.setItem("lng", position.coords.longitude);
					    	window.localStorage.setItem("location", (locality != "") ? locality : "N/A");
					    	window.localStorage.setItem("time", end.today() + " " + end.timeNow());
				        }
				    } else {
				    	window.localStorage.setItem("index", index);
				    	window.localStorage.setItem("lat", position.coords.latitude);
				    	window.localStorage.setItem("lng", position.coords.longitude);
				    	window.localStorage.setItem("location", (locality != "") ? locality : "N/A");
				    	window.localStorage.setItem("time", end.today() + " " + end.timeNow());
				    }
				    
				    if(window.localStorage.getItem("h.index") != null) {
				    	var highest = parseFloat(window.localStorage.getItem("h.index"));
				    	if(parseFloat(index) > highest) {
				    		window.localStorage.setItem("h.index", index);
					    	window.localStorage.setItem("h.lat", position.coords.latitude);
					    	window.localStorage.setItem("h.lng", position.coords.longitude);
					    	window.localStorage.setItem("h.location", (locality != "") ? locality : "N/A");
					    	window.localStorage.setItem("h.time", end.today() + " " + end.timeNow());
				    	}
				    } else {
				    	window.localStorage.setItem("h.index", index);
				    	window.localStorage.setItem("h.lat", position.coords.latitude);
				    	window.localStorage.setItem("h.lng", position.coords.longitude);
				    	window.localStorage.setItem("h.location", (locality != "") ? locality : "N/A");
				    	window.localStorage.setItem("h.time", end.today() + " " + end.timeNow());
				    }	

				    document.getElementById("currentindex").innerHTML = index;
				    
				    if(locality != "") {
				    	document.getElementById("currentlocationvalue").innerHTML = locality;
				    } else {
				    	document.getElementById("currentlocationvalue").innerHTML = "N/A";
				    }
				    document.getElementById("currenttime").innerHTML = end.today() + " " + end.timeNow();
				    
				    var globalChange = 0;
				    result = parseFloat(index) - previous;
				    precentage = 100;
			    	if(previous > 0) {
			    		precentage = Math.abs(Math.round((result / previous) * 100));
			    	}
			    	if(result < 0) {					    		
			    		globalChange = '&nbsp;<i class="fa fa-caret-down"></i> ' + precentage + ' %';
			    	} else if(result > 0) {
			    		globalChange = '&nbsp;<i class="fa fa-caret-up"></i> ' + precentage + ' %';
			    	}
				    
			    	if(globalChange != "") {
				    	document.getElementById("changevalue").innerHTML = globalChange;
				    } else {
				    	document.getElementById("changevalue").innerHTML = "0 %";
				    }
				    
				    document.getElementById("highestindex").innerHTML = window.localStorage.getItem("h.index");
				    if(window.localStorage.getItem("h.index") < 3) {
				    	document.getElementById("highestindex").className = "index1-3";
				    } else if(window.localStorage.getItem("h.index") >= 3 && window.localStorage.getItem("h.index") < 6) {
				    	document.getElementById("highestindex").className = "index3-6";
				    } else if(window.localStorage.getItem("h.index") >= 6 && window.localStorage.getItem("h.index") < 8) {
				    	document.getElementById("highestindex").className = "index6-8";
				    } else if(window.localStorage.getItem("h.index") >= 8 && window.localStorage.getItem("h.index") < 11) {
				    	document.getElementById("highestindex").className = "index8-11";
				    } else {
				    	document.getElementById("highestindex").className = "index11";
				    }
				    document.getElementById("highestlocationvalue").innerHTML = window.localStorage.getItem("h.location");
				    document.getElementById("highesttime").innerHTML = window.localStorage.getItem("h.time");
				    
				    if(index < 3) {
				    	$("#exposureinfo").html(getMessage("exposureinfo") + " " +  getMessage("2-exposureinfo"));
				    	$("#protectioninfo").html(getMessage("2-message"));
				    	$("#valuename").html(getMessage("2") + change);
				    	indexName = getMessage("2");
				    	$("#valuename").css("color", "#46a700");
				    	document.getElementById("currentindex").className = "index1-3";
					} else if(index >= 3 && index < 6) {
				    	$("#exposureinfo").html(getMessage("exposureinfo") + " " +  getMessage("3-exposureinfo"));
				    	$("#protectioninfo").html(getMessage("3-message"));
				    	$("#valuename").html(getMessage("3") + change);
				    	indexName = getMessage("3");
				    	$("#valuename").css("color", "#ffd800");
				    	document.getElementById("currentindex").className = "index3-6";
					} else if(index >= 6 && index < 8) {
				    	$("#exposureinfo").html(getMessage("exposureinfo") + " " +  getMessage("6-exposureinfo"));
				    	$("#protectioninfo").html(getMessage("6-message"));
				    	$("#valuename").html(getMessage("6") + change);
				    	indexName = getMessage("6");
				    	$("#valuename").css("color", "#e97b00");
				    	document.getElementById("currentindex").className = "index6-8";
					} else if(index >= 8 && index < 11) {	
				    	$("#exposureinfo").html(getMessage("exposureinfo") + " " +  getMessage("8-exposureinfo"));
				    	$("#protectioninfo").html(getMessage("8-message"));
				    	$("#valuename").html(getMessage("8") + change);
				    	$("#valuename").css("color", "#d81300");
				    	document.getElementById("currentindex").className = "index8-11";
					} else {
				    	$("#exposureinfo").html(getMessage("exposureinfo") + " " +  getMessage("11-exposureinfo"));
				    	$("#protectioninfo").html(getMessage("11-message"));
				    	$("#valuename").html(getMessage("11") + change);
				    	indexName = getMessage("11");
				    	$("#valuename").css("color", "#6b49c8");
				    	document.getElementById("currentindex").className = "index11";
					}
				    
				},
				error: function (xhr, ajaxOptions, thrownError) {
					connectionErrorHandler(thrownError);
			    }
			});
    		$("#spinner").hide();
    		if(init) {
        		$("#helpmessage").html(getMessage("tapheretorefresh"));
    			$("#help").css("visibility", "visible");
    			$("#help").fadeOut(3000);
    		}
    	}, connectionErrorHandler, { enableHighAccuracy: true });
    } else {
    	connectionErrorHandler(null);
    }
	
}

function getTimestamp(d) {
    return d.getFullYear() + "-" +
           ((d.getMonth() + 1 < 10) ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1)) + "-" +
   		   ((d.getDate() < 10) ? "0" + d.getDate() : d.getDate()) +
           "T" +
           ((d.getHours() < 10) ? "0" + d.getHours() : d.getHours()) + ":00:00Z";
}

function connectionErrorHandler(error) {
	$("#spinner").hide();
	navigator.notification.alert(
		    getMessage("noconnection"),
		    function() { },
		    getMessage("noconnection-title"),
		    'OK'
	);
}

function rate(buttonIndex) {
	
	if(buttonIndex == 1) {
	
		var devicePlatform = device.platform;
		
		if (devicePlatform == "iOS") {
			
			cordova.InAppBrowser.open("itms-apps://itunes.apple.com/app/uv-radiation-now/id1173659659?mt=8", "_system");
			
	    } else if (devicePlatform == "Android") {
	    	
	    	cordova.InAppBrowser.open("market://details?id=com.markuskarjalainen.uvradiationnowfree", "_system");
	    }
	
	} else {
		
		cordova.InAppBrowser.open("https://uvradiationnow.markuskarjalainen.com/feedback.php?language=" + language, "_system", "location=no,toolbar=no");
		
	}
}

function confirmFeedback(buttonIndex) {
	if(buttonIndex == 2) {
		cordova.InAppBrowser.open("https://uvradiationnow.markuskarjalainen.com/feedback.php?language=" + language, "_system", "location=no,toolbar=no");
	} 
}

function confirmReview(buttonIndex) {
	if(buttonIndex == 1) {
		navigator.notification.confirm(
			"", 
			confirmFeedback,              
			getMessage("feedbackquestion"),           
			getMessage("buttonlabelno") + "," + getMessage("buttonlabelyes")
	    );
	} else {	
		var devicePlatform = device.platform;
		
		if (devicePlatform == "iOS") {
			
			cordova.InAppBrowser.open("itms-apps://itunes.apple.com/app/uv-radiation-now/id1173659659?mt=8", "_system");
			
	    } else if (devicePlatform == "Android") {
	    	
	    	cordova.InAppBrowser.open("market://details?id=com.markuskarjalainen.uvradiationnowfree", "_system");
	    }
	} 
}

function confirmRateOrFeedback(buttonIndex) {
	if(buttonIndex == 1) {
		navigator.notification.confirm(
			"", 
			confirmFeedback,              
		    getMessage("feedbackquestion"),           
		    getMessage("buttonlabelno") + "," + getMessage("buttonlabelyes")
	    );
	} else {
		navigator.notification.confirm(
			"", 
			confirmReview,              
			getMessage("reviewquestion"),           
		    getMessage("buttonlabelno") + "," + getMessage("buttonlabelyes")
	    );	
	}
}

function feedback() {
	navigator.notification.confirm(
		"", 
		confirmRateOrFeedback,              
		getMessage("enjoytheappquestion"),           
		getMessage("buttonlabelno") + "," + getMessage("buttonlabelyes")
    );
}

function share() {
	var platform = device.platform;
	var message = getMessage("header") + " " + locality + ": " + index + " = " + indexName + "! " + getMessage("sharemessage");
	if(locality == "") {
		message = getMessage("uvindexinmyarea") + ": " + index + " = " + indexName + "! " + getMessage("sharemessage");
	}
	var title = getMessage("alert");
	if(platform == "WinCE") {
		window.plugins.socialsharing.share(message, title, null, null);
	} else {
		window.plugins.socialsharing.share(message, title);
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

function isLargeDisplay() {
	return (window.innerWidth >= 600) ? true : false;
}

function notify() {
	if(document.getElementById("exposure-alert").checked) {
		if ("Notification" in window) {
		  Notification.requestPermission(function (permission) {
		    if (permission === "granted") {
		      var notification = new Notification("Exposure Alert", {
		           tag: "Exposure Alert", 
		           body: "You have been exposed to UV radiation for 1 hour now." 
		      }); 
		      notification.onshow  = function() { console.log("show"); };
		      notification.onclose = function() { console.log("close"); };
		      notification.onclick = function() { console.log("click"); };
		    }
		  });
		}
	} else {
		
	}
}