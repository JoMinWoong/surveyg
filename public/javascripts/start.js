//messagelink
$("#messageLink").click(function(){
	if(!$("#messageBox_head").is(':visible')){
		//$(".messanger").hide();
		openMSGBox();
	}
	else $("#messageBox_head").hide();
});

function openSendMSGBox(writer_id,writer_name){
	
	//$(".messanger").hide();
	$("#messageList").hide();
	document.getElementById("sendTo_Name_menu").innerHTML = writer_name;
	document.getElementById("sendTo_Id_menu").value = writer_id;
	$("#messageForm").show();
	
}
function openMSGBox(){
	$(".all-floating").hide();
	document.getElementById("send_title_menu").value = "";
	document.getElementById("send_message_menu").value = "";
	$("#messageForm").hide();
	$("#messageList").show();
	$("#messageBox_head").show();
}

function createCookie(name, value, days) {
    var expires;
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    }
    else {
        expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(c_name) {
    if (document.cookie.length > 0) {
        c_start = document.cookie.indexOf(c_name + "=");
        if (c_start != -1) {
            c_start = c_start + c_name.length + 1;
            c_end = document.cookie.indexOf(";", c_start);
            if (c_end == -1) {
                c_end = document.cookie.length;
            }
            return unescape(document.cookie.substring(c_start, c_end));
        }
    }
    return "";
}
//show messanger
$("#cancelMessageBoxBtn_menu").click(function(){$(".all-floating").hide();});
//send message to writer
$("#sendMessageBtn_menu").click(function () {
	var title = document.getElementById("send_title_menu").value
		,message = document.getElementById("send_message_menu").value
		,sendTo = document.getElementById("sendTo_Id_menu").value;
		
	if(!title || !message ){
		alert("correct input is required");
		return;
	}
	$.post( "/sendmessage", {title:title,message:message,sendTo:sendTo}).done(function( data ) {
	    if(data == "success"){
	    	$(".all-floating").hide("slow");
	    }
	    else {
	    	alert(data);
	    }
	});
});
$("#dispMode").click(function(){
	$("#contentList").toggleClass("res-mode");
	createCookie("resMode",($("#contentList").is(".res-mode"))?"1":"0",30);
});
(function(){
	var cn = "resMode";
	if(getCookie(cn) == "1"){
		$("#contentList").addClass("res-mode");
	}
	else {
		$("#contentList").removeClass("res-mode");
	}	
})();
