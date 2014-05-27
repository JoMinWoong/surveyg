$( document.body ).ready(function() {
	$("#exchange_request").click(function () {
		  if ( $( "#exchange_request_form" ).is( ":hidden" ) ) {
		    $( "#exchange_request_form" ).slideDown( "slow" );
		  } else {
		    $( "#exchange_request_form" ).hide();
		  }
	});
	$("#ask_kind_exchange").click(function () {
		$( "#ask_exchangelist" ).slideDown( "slow" );
	});
	$("#ask_kind_free").click(function () {
		$( "#ask_exchangelist" ).hide();
	});
	//like +1
	$("#mono_like").click(function () {
		$.post( "/like", {}).done(function( data ) {
		    if(data == "success"){
		    	var ml = document.getElementById("mono_like");
		    	ml.innerHTML = parseInt(ml.innerHTML) + 1;
		    }
		    else alert( "fail : "+data );
		});
	});
	//dislike +1
	$("#mono_dislike").click(function () {
		$.post( "/dislike", {}).done(function( data ) {
			if(data == "success"){
		    	var ml = document.getElementById("mono_dislike");
		    	ml.innerHTML = parseInt(ml.innerHTML) + 1;
		    }
		    else alert( "fail : "+data );
		});
	});
	$(".subimage").click(function(){
		if(this.id){
			//<iframe width="420" height="315" src="//www.youtube.com/embed/JZ5-Soe3NJ0?rel=0" frameborder="0" allowfullscreen></iframe>
			//$( "li.item-a" ).parent().css( "background-color", "red" );
			//$("#ifm").remove();
			$("#ifm").attr("src",'//www.youtube.com/embed/'+this.id+'?rel=0').show();
			$("#mainimage").hide();
		}
		else {
			$("#ifm").hide();
			//$("#mainimage").attr("src",this.src).hide();
			$("#mainimage").show().attr("src",this.src);
		}
	});
	//show messanger
	$("#sendmessagelink").click(function(){

		if(!$("#messageBox").is(':visible')){
			$(".all-floating").hide();
			if(!document.getElementById("user_screen_name").value){
				alert("you need to signin first");
				return;
			}
		}
		$("#messageBox").toggle();
	});
	//show messanger
	$("#cancelMessageBoxBtn").click(function(){
		document.getElementById("send_title").value = "";
		document.getElementById("send_message").value = "";
		$("#messageBox").hide();
	});
	//send message to writer
	$("#sendMessageBtn").click(function () {
		var title = document.getElementById("send_title").value
			,message = document.getElementById("send_message").value
			,sendTo = document.getElementById("sendTo").value;
			
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
});
