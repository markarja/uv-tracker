var gauge = null;
var q = "0,0";
var index = 0;
var indexName = "";
var locality = "";

if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}

function init() {

	language = window.navigator.language || window.navigator.browserLanguage;
	language = language.toLowerCase();
	
	if(language.startsWith("es")) {
		language = "es-es";
	}
	
	localize(language);
	
    gauge = new GaugeSVG({
		id: "gauge"
    });

    reposition();
    
	document.addEventListener("deviceready", onDeviceReady, false);
	window.addEventListener("resize", onOrientationChanged, false);
	
	onOrientationChanged();

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
    refresh(true);
}

function refresh(init) {
	$("#spinner").show();
	gauge.refresh(0.0);
	$("#exposureinfo").html("");
	$("#protectioninfo").html(getMessage("loading") + "...");
	$("#valuename").html("");
	if(navigator.geolocation) {
    	navigator.geolocation.getCurrentPosition(function(position) {
    		
    		q = position.coords.latitude + "," + position.coords.longitude;
    		
    		start = new Date(new Date().getTime() - (3 * 60 * 60 * 1000));
    		end = new Date();
    		
    		var starttime = getTimestamp(start);
    		var endtime = getTimestamp(end);
    		
    		$.ajax({
				url : "http://www.markuskarjalainen.com/rest/uv/",
				data : {"apikey" : "dXYtdHJhY2tlci1pZA==", "q" : q, "starttime" : starttime, "endtime" : endtime, "language" : language},
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
				    gauge.refresh(parseFloat(index) + 0.5, true);
				    setTimeout(function () {
				        gauge.refresh(index, true);
				    }, 1700);
				    
				    if(index < 3) {
				    	$("#exposureinfo").html(getMessage("exposureinfo") + " " +  getMessage("2-exposureinfo"));
				    	$("#protectioninfo").html(getMessage("2-message"));
				    	$("#valuename").html(getMessage("2"));
				    	indexName = getMessage("2");
				    	$("#valuename").css("color", "#46a700");
					} else if(index >= 3 && index < 6) {
				    	$("#exposureinfo").html(getMessage("exposureinfo") + " " +  getMessage("3-exposureinfo"));
				    	$("#protectioninfo").html(getMessage("3-message"));
				    	$("#valuename").html(getMessage("3"));
				    	indexName = getMessage("3");
				    	$("#valuename").css("color", "#ffd800");
					} else if(index >= 6 && index < 8) {
				    	$("#exposureinfo").html(getMessage("exposureinfo") + " " +  getMessage("6-exposureinfo"));
				    	$("#protectioninfo").html(getMessage("6-message"));
				    	$("#valuename").html(getMessage("6"));
				    	indexName = getMessage("6");
				    	$("#valuename").css("color", "#e97b00");
					} else if(index >= 8 && index < 11) {	
				    	$("#exposureinfo").html(getMessage("exposureinfo") + " " +  getMessage("8-exposureinfo"));
				    	$("#protectioninfo").html(getMessage("8-message"));
				    	$("#valuename").html(getMessage("8"));
				    	$("#valuename").css("color", "#d81300");
					} else {
				    	$("#exposureinfo").html(getMessage("exposureinfo") + " " +  getMessage("11-exposureinfo"));
				    	$("#protectioninfo").html(getMessage("11-message"));
				    	$("#valuename").html(getMessage("11"));
				    	indexName = getMessage("11");
				    	$("#valuename").css("color", "#6b49c8");
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

function rate() {
	if(language == 'fi-fi') {
		var customLocale = {};
		customLocale.title = "Arvostele sovellus";
		customLocale.message = "Tyykkätkö tästä sovelluksesta? Haluatko kirjoittaa sille arvostelun? Arvostelun kirjoittamiseen ei mene montaa minuuttia. Kiitos tuestasi!";
		customLocale.cancelButtonLabel = "Ei kiitos";
		customLocale.laterButtonLabel = "Muistuta minua myöhemmin";
		customLocale.rateButtonLabel = "Arvostele nyt";
		AppRate.preferences.customLocale = customLocale;
	}
	
	AppRate.preferences.storeAppURL.android = "market://details?id=com.markuskarjalainen.uvtracker";
	AppRate.preferences.storeAppURL.ios = '882320475';
	AppRate.preferences.storeAppURL.windows8 = 'ms-windows-store:Review?name=8837MarkusKarjalainen.UVradiationnow';	
	AppRate.promptForRating(true);
}

function share() {
	var platform = device.platform;
	var message = getMessage("header") + " " + locality + ": " + index + " = " + indexName + "! " + getMessage("sharemessage");
	var title = getMessage("alert");
	if(platform == "WinCE") {
		window.plugins.socialsharing.share(message, title, null, null);
	} else {
		window.plugins.socialsharing.share(message, title);
	}
}
