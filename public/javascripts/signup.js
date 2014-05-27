
/*
$( window ).load(function() {
	document.getElementById("fm")["state"].name = "user[state]";
	
});
*/
$("#submit_button").click(function(){		
	if($("#agreeFlg").prop('checked')){
		this.form.submit();
	}
		else alert("You need to agree to the term of service.");
	});
(function(){
	for (var i = new Date().getFullYear(); i > 1900; i--){
	    $('#years').append($('<option />').val(i).html(i));
	}
})();
