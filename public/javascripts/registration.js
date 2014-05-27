/*
var $F = {
	PreviewImage:function() {
	    var oFReader = new FileReader(),prev = document.getElementById("uploadPreview"),uimg=document.getElementById("uploadImage");
	    oFReader.readAsDataURL(uimg.files[0]);
	    oFReader.onload = function (oFREvent) {
	    	if(oFREvent.total > 1000 * 300){
		    	alert("file size is over");
		    	$( prev ).hide( "slow" );
		    	uimg.value = "";
		    	prev.src = "";
		    	return;
	    	}
	    	//set value of base64 encoded string data
		    document.getElementById("mono_imagedata").value = oFREvent.target.result;
		    $( prev ).attr("src", oFREvent.target.result).load(function() { $(this).slideDown( "slow" ); });
		    prev.src = oFREvent.target.result;
	    };
	}
};
*/
$( window ).load(function() {
	var _doc = document;
	_doc.getElementById("fm")["state"].name = "mono[state]";
	$(".image-file").change(function(){
	    var oFReader = new FileReader(),
	    	idhd = this.id.replace("-file",""),
	    	prev = _doc.getElementById(idhd+"-uploadPreview"),
	    	inputE = _doc.getElementById(idhd+"-imagedata-input");
	    	//uimg=_doc.getElementById("uploadImage");
	    oFReader.readAsDataURL(this.files[0]);
	    oFReader.onload = function (oFREvent) {
	    	if(oFREvent.total > 1000 * 300){
		    	alert("file size is over");
		    	$( prev ).hide( "slow" );
		    	this.value = "";
		    	prev.src = "";
		    	return;
	    	}
	    	//set value of base64 encoded string data
	    	inputE.value = prev.value = oFREvent.target.result;

		    $( prev ).attr("src", oFREvent.target.result).load(function() { $(this).slideDown( "slow" ); });
		    //prev.src = oFREvent.target.result;
	    };
	});
	$("[name='mono[imageurl][]']").blur(function(){
		if(!this.value)return;
	    $(  "#"+this.id.split("-")[0]+"-uploadPreview"  ).attr("src", this.value).load(function() { $(this).slideDown( "slow" ); });
	});
	$("[name='mono[imageyoutube][]']").blur(function(){
		if(!this.value){
			return;
		}
		else if(!/([A-Za-z0-9_\-]{11})/.test(this.value)){
			alert("anavailable youtube id");
			return;
		}
		var hdid = this.id.split("-")[0],prevImgE = _doc.getElementById(hdid+"-uploadPreview");
	    $( "#"+this.id.split("-")[0]+"-uploadPreview" ).attr("src", _lib.getYoutubeInfo(this.value).imgs[0]).load(function() { $(this).slideDown( "slow" ); });
	});
	//click image mode
	$(".image-type").click(function(){
		var hdid = this.name,
			clickedElmId = this.id,
			prevImgE = _doc.getElementById(hdid+"-uploadPreview"),
			fileE = _doc.getElementById(hdid+"-file");
		prevImgE.src = "";
		fileE.value="";
		fileE.style.display = ((clickedElmId == hdid+"-imagedata")?"":"none");
		prevImgE.style.display = "none";
		$("."+hdid+"-input").each(function(){
			this.value = "";
			this.disabled = (this.id != clickedElmId+"-input");
			this.style.display = (this.id != clickedElmId+"-input")?"none":""; 
			
			
		});
	});
});