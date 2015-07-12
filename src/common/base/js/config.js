var scripts = document.scripts;
var baseScriptEl = scripts[scripts.length - 1];
var baseUrl = baseScriptEl.getAttribute("src").match(/^(\.\.\/)*/g);

// 保存app应用的前缀路径（发布应用包的时候应用名称会改变）
window.APP_PATH = location.pathname.match(/\bapp\/.+\//);

seajs.config({
	debug:true,
	base:baseUrl,
	paths:{
		base:"common/base",
		"lib":"common/lib",
		"components":"common/components"
	},
	alias:{
		/*＝＝＝＝＝＝＝＝依赖库＝＝＝＝＝＝＝＝*/
		"jquery":"lib/jquery/jquery",
		"seajs-css":"lib/seajs/seajs-css",
		"seajs-text":"lib/seajs/seajs-text",
		"seajs-log":"lib/seajs/seajs-log",
		"hammer":"lib/hammer/hammer.min",
		"ejs":"lib/ejs/ejs.min",
		"d3":"lib/d3/d3.min",
		/*＝＝＝＝＝＝＝＝组件＝＝＝＝＝＝＝＝＝*/
		"loading":"components/loading/loading",
		/*＝＝＝＝＝＝＝＝公共模块＝＝＝＝＝＝＝*/
		"request":"base/js/request",
		"layout":"base/js/layout",
		"base":"base/js/base",
		"login":"base/js/login"
	}
});

seajs.use("jquery",function() {
	seajs.use(["seajs-css","seajs-text","seajs-log","ejs","base"]);
});







