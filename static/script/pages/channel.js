var sex = location.href.split('/').pop();
$.get('/ajax/' + sex,function(d){
	var windowWidth = $(window).width();
	if(windowWidth<320){
		  windowWidth = 320;
	}
	new Vue({
	  	el: '#app',
	  	data: {
	  		sex: d.items,
			screen_width: windowWidth,
   	  	  	double_screen_width: windowWidth*2
	  	}
	});
},'json');