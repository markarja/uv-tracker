var gauge = null;
var q = "0,0";
var index = 0;
var indexName = "";
var locality = "";
function init() {
	language = window.navigator.language ||
    window.navigator.browserLanguage;
	language = language.toLowerCase();
	localize(language);
	
    gauge = new GaugeSVG({
		id: "gauge"
    });
    
    if(window.innerWidth > $("#gauge").css("width").replace("px", "")) {
        $("#gauge").css("left", (window.innerWidth / 2) - $("#gauge").css("width").replace("px", "") / 2 + "px");
    }
    
    refresh(true);
    
}

function refresh(init) {
	gauge.refresh(0.0);
	$("#exposureinfo").html("");
	$("#protectioninfo").html("");
	$("#valuename").html("");
	if(navigator.geolocation) {
    	navigator.geolocation.getCurrentPosition(function(position) {
    		q = position.coords.latitude + "," + position.coords.longitude;
    		$.ajax({
				url : "http://www.markuskarjalainen.com/rest/test/",
				data : {"apikey" : "dXYtdHJhY2tlci1pZA==", "q" : q},
				async : false,
				success : function(data) {
					var response = jQuery.parseJSON(data);
					index = response["data"][0].index;
					$("#header").html(getMessage("header") + " " + response["data"][0].location);
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
				    	$("#valuename").css("color", "#fff900");
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
					alert(thrownError);
			    }
			});
    		if(init) {
        		$("#helpmessage").html(getMessage("tapheretorefresh"));
    			$("#help").css("visibility", "visible");
    			$("#help").fadeOut(3000);
    		}
    	});
    }
}

function rate() {
	AppRate.preferences.storeAppURL.android = "market://details?id=com.markuskarjalainen.uvtracker";
	AppRate.preferences.storeAppURL.ios = '882320475';
	AppRate.preferences.storeAppURL.windows8 = 'ms-windows-store:Review?name=<the Package Family Name of the application>';	
	AppRate.promptForRating(true);
}

function share() {
	navigator.share(getMessage("header") + " " + locality + ": " + index + " = " + indexName + "! " + getMessage("sharemessage"), getMessage("alert"), "plain/text");
}
