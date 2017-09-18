(function() {
	// 声明严格模式,才能使用ES6
	'use strict';

	// 数据本地缓存部分
	var Util = (function() {
		/* 存储名前缀 */
		var prefix = 'himl5_reader_';
		var StorageGetter = function(key) {
			return localStorage.getItem(prefix + key);
		}
		var StorageSetter = function(key, val) {
			return localStorage.setItem(prefix + key, val);
		}

		// 事件委托的函数
		var addHandler = function(element, type, handler){
			if(element.addEventListener){
				element.addEventListener(type, handler, false);
			}else if(element.attachEvent){
				element.attachEvent('on'+type, handler);
			}else{
				element['on'+type] = handler;
			}
		};
		var getEvent = function(event){
			return event? event:window.event;
		}
		var getTarget = function(event){
			return event.target || event.srcElement;
		}
		var changeBkColor = function(BkColor) {
			initBkColor = BkColor;
			RootContainer.css('background-color', initBkColor);
			Util.StorageSetter('background_color',initBkColor);
		}
		var changeBkClass = function(target_id) {
			$('.color1-bk').removeClass('bk-container-cur');
			$('.color2-bk').removeClass('bk-container-cur');
			$('.color3-bk').removeClass('bk-container-cur');
			$('.color4-bk').removeClass('bk-container-cur');
			$('.color5-bk').removeClass('bk-container-cur');

			$('.'+ target_id+ '-bk').addClass('bk-container-cur');
		}

		// 获取解密后的json数据
		var getJSONP = function(url, callback) {
			return $.jsonp({
				url: url,
				cache: true,
				callback: 'duokan_fiction_chapter',
				success: function(result) {
					// debugger; 调试是否解密成功(base64加密数据解码)
					var data = $.base64.decode(result);
					var json = decodeURIComponent(escape(data));
					callback(json);
				}
			})
		}

		return {
			StorageGetter: StorageGetter,
			StorageSetter: StorageSetter,
			addHandler: addHandler,
			getEvent: getEvent,
			getTarget: getTarget,
			changeBkColor: changeBkColor,
			changeBkClass: changeBkClass,
			getJSONP: getJSONP
		}
	})();

	var Dom = {
		bottom_tool_bar : $('#bottom_tool_bar'),
		top_nav: $('#top-nav'),
		bottom_nav: $('.bottom_nav'),
		font_container: $('.font-container'),
		font_btn: $('#font_btn'),
		day_icon: $('#day_icon'),
		night_icon: $('#night_icon')
	}
	var Win = $(window);
	var Doc = $(document);
	var Body = $('body');
	var readerModel;
	var readerUI;
	var RootContainer = $('#fition_container');

	// 获取字体大小
	var initFontSize = Util.StorageGetter('font_size');
	initFontSize = parseInt(initFontSize);
	if (!initFontSize) {
		initFontSize = 14;
	}
	RootContainer.css('font-size', initFontSize);

	// 获取背景颜色
	var initBkColor = Util.StorageGetter('background_color');
	if (!initBkColor) {
		initBkColor = '#f7eee5';
	}
	RootContainer.css('background-color', initBkColor);

	// 整个项目的入口函数
	function main() {
		EventHanlder();
		// 获得数据
		readerModel = ReaderModel();
		readerUI = ReaderBaseFrame(RootContainer);
		readerModel.init(function(data) {
			readerUI(data);
		});
	}

	// 获得阅读器内容数据的方法
	function ReaderModel() {
		var Chapter_id;
		var ChapterTotal;
		var init = function(UIcallback) {
			getFictionInfo(function() {
				getCurChapterContent(Chapter_id, function(data) {
					UIcallback && UIcallback(data);
				});
			});
			/*getFictionInfoPromise().then(function(d){
				return getCurChapterContentPromise();
			}).then(function(data) {
				UIcallback && UIcallback(data);
			});*/
		}

		// 方法一: 回调函数获取数据
		var getFictionInfo = function(callback) {
			$.get('/ajax/chapter', function(data) {
				// 获得章节信息后的回调
				Chapter_id = Util.StorageGetter('last_chapter_id');
				if (Chapter_id == null) {
					Chapter_id = data.chapters[1].chapter_id;
				}
				ChapterTotal = data.chapters.length;
				callback && callback();
			}, 'json');
		}
		// 方法二: Promise异步获取数据resolve(成功), reject(失败)
		/*var getFictionInfoPromise = new Promise(function(resolve, reject) {
				$.get('/ajax/chapter', function(data) {
					// 获得章节信息后的回调
					if (data.result == 0) {
						Chapter_id = Util.StorageGetter('last_chapter_id');
						if (Chapter_id == null) {
							Chapter_id = data.chapters[1].chapter_id;
						}
						ChapterTotal = data.chapters.length;
						resolve();
					} else {
						reject();
					}
				}, 'json');
			});
		}*/

		// 方法一: 获得当前章节内容
		var getCurChapterContent = function(chapter_id, callback) {
			$.get("/ajax/chapter_data",{
				id : Chapter_id
			}, function(data) {
				if (data.result == 0) {
					var url = data.jsonp;
					Util.getJSONP(url, function(data) {
						callback && callback(data);
					});
					
					setTimeout(function() {
						Body.scrollTop = 0;
					}, 20);
				}
			}, 'json');
		}
		// 方法二: Promise异步获取数据resolve(成功), reject(失败)
		/*var getCurChapterContentPromise = new Promise(function(resolve, reject) {
				$.get("/ajax/chapter_data",{
					id : Chapter_id
				}, function(data) {
					if (data.result == 0) {
						var url = data.jsonp;
						Util.getJSONP(url, function(data) {
							resolve(data);
						});
					} else {
						reject();
					}
				}, 'json');
			});
		}*/

		var prevChapter = function(UIcallback) {
			Chapter_id = parseInt(Chapter_id, 10);
			if (Chapter_id == 0) {
				return;
			}
			Chapter_id -= 1;
			getCurChapterContent(Chapter_id, UIcallback);
			Util.StorageSetter('last_chapter_id', Chapter_id);
		}
		var nextChapter = function(UIcallback) {
			Chapter_id = parseInt(Chapter_id, 10);
			if (Chapter_id == ChapterTotal - 1) {
				return;
			}
			Chapter_id += 1;
			getCurChapterContent(Chapter_id, UIcallback);
			Util.StorageSetter('last_chapter_id', Chapter_id);
		}

		return {
			init: init,
			prevChapter: prevChapter,
			nextChapter: nextChapter
		}
	}

	// 初始化渲染UI结构
	function ReaderBaseFrame(container) {
		function parseChapterData(jsonData) {
			var jsonObj = JSON.parse(jsonData);
			var html = '<h4>' + jsonObj.t + '</h4>';
			for (var i = 0; i < jsonObj.p.length; i++) {
				html += '<p>' + jsonObj.p[i] + '</p>';
			}
			return html;
		}
		return function(data) {
			container.html(parseChapterData(data));
		}
	}

	// 交互的事件绑定
	function EventHanlder() {
		// 点击屏幕中间区域，上下边栏出现或消失
		$('#action-mid').click(function() {
			if(Dom.top_nav.css('display') == 'none') {
				Dom.top_nav.show();
				Dom.bottom_nav.show();
			}else {
				Dom.top_nav.hide();
				Dom.bottom_nav.hide();
				Dom.font_container.hide();
			}
		});

		// 点击字体按钮,控制面板出现或隐藏
		Dom.font_btn.click(function() {
			if(Dom.font_container.css('display') == 'none') {
				Dom.font_container.show();
				Dom.font_btn.addClass('cur');
			}else {
				Dom.font_container.hide();
				Dom.font_btn.removeClass('cur');
			}
		})

		// 点击白天或夜晚,背景模式切换
		$('#night_btn').click(function() {
			if (Dom.day_icon.css('display') == 'none') {
				Dom.day_icon.show();
				Dom.night_icon.hide();
				initBkColor = '#f7eee5';
				RootContainer.css('background-color', initBkColor);
				Util.StorageSetter('background_color', initBkColor);
			}else {
				Dom.day_icon.hide();
				Dom.night_icon.show();
				initBkColor = '#283548';
				RootContainer.css('background-color', initBkColor);
				Util.StorageSetter('background_color', initBkColor);
			}
		})

		// 字体放大或缩小
		$('#large-font').click(function() {
			if (initFontSize > 20) { return; }
			initFontSize += 1;
			RootContainer.css('font-size', initFontSize);
			Util.StorageSetter('font_size', initFontSize);
		})

		$('#small-font').click(function() {
			if (initFontSize < 12) { return; }
			initFontSize -= 1;
			RootContainer.css('font-size', initFontSize);
			Util.StorageSetter('font_size', initFontSize);
		})

		// 设置背景色
		// 使用事件委托的方式
		Util.addHandler($('.color-pannel')[0], 'click', function(event) {
			var event = Util.getEvent(event);
			var target = Util.getTarget(event);

			switch(target.id) {
				case 'color1':
					Util.changeBkColor('#f7eee5');
					Util.changeBkClass(target.id);
					break;
				case 'color2':
					Util.changeBkColor('#e9dfc7');
					Util.changeBkClass(target.id);
					break;
				case 'color3':
					Util.changeBkColor('#a4a4a4');
					Util.changeBkClass(target.id);
					break;
				case 'color4':
					Util.changeBkColor('#cdefce');
					Util.changeBkClass(target.id);
					break;
				case 'color5':
					Util.changeBkColor('#283548');
					Util.changeBkClass(target.id);
					break;
				default:
					break;
			}
		});

		// 上下翻页
		$('#prev_btn').click(function() {
			// 获取章节翻页后的数据 -> 渲染数据
			readerModel.prevChapter(function(data) {
				readerUI(data);
			});
		});
		$('#next_btn').click(function() {
			readerModel.nextChapter(function(data) {
				readerUI(data);
			});
		});

		// 滚动页面,上下边栏消失,控制面板消失
		Win.scroll(function() {
			Dom.top_nav.hide();
			Dom.bottom_nav.hide();
			Dom.font_container.hide();
		});
	}

	main();
})();