define(function(require){function a(){var a=$(".spa-page").length;$(".spa-page").each(function(i){$(this).css("z-index",h+a-i)})}function c(){$(".navbar-brand").parents(".spa-page-body").children(".page-container-navbar");$(".spa-page-body .navbar-brand").each(function(i,a){var c=new v(a);c.on("tap",function(e){var a=$(e.target),c=a.parents(".spa-page-body").children(".page-container-navbar");c.addClass("spa-hide").removeClass("spa-show"),c.eq(a.index()).removeClass("spa-hide").addClass("spa-show"),a.parent().children().removeClass("active"),a.addClass("active")})})}var v=require("hammer"),h=100;!function(){a(),c()}()});