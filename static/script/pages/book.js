var id = location.href.split('?id=').pop();
$.get('/ajax/book?id=' + id,function(d){
	var windowWidth = $(window).width();
	if(windowWidth<320){
		  windowWidth = 320;
	}
	new Vue({
		el:'#app',
		data: {
			book: d.item,
			screen_width: windowWidth,
		  	double_screen_width: windowWidth*2
		},
		methods:{
			readBook:function(){
				location.href = "/reader"
			}
		}
	});
},'json');
/*pop() 方法用于删除并返回数组的最后一个元素。*/