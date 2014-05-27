$SIGNUP = {
	mono_delete:function(mid,did){
		if(confirm("delete mono??")){
			$.post( "/deletemono", {id:mid}).done(function( data ) {
				if(data == "success"){
			    	$("#"+did).hide();
			    }
			    else alert( "fail : "+data );
			});
		}
	},
	to_edit:function(mid){
		location.href = "/monoedit?m="+mid;
	}
};
