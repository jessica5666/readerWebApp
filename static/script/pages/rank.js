$.get('/ajax/rank',function(d){
	var windowWidth = $(window).width();
	if(windowWidth<320){
		  windowWidth = 320;
	}
	for(var i=0;i< d.items.length;i++){
		d.items[i].description = d.items[i].description.split('\n');
	}
	new Vue({
		el: '#app',
	  	data: {
		  	rank: d.items,
		  	screen_width: windowWidth,
		    double_screen_width: windowWidth*2
		}
	});
},'json');