define(function(require){require("./nav.css"),$(".navbar").each(function(){var a=$(this),v=$('<nav class="navbar-header">'),c=a.data("navs").split(","),b=a.data("active");$.each(c,function(a,d){v.append('<a class="navbar-brand'+(d==b?" active":"")+'" href="javascript:void(0);">'+d+"</a>")}),a.append(v)});var a=$(".navbar-brand"),v=require("hammer");a.each(function(i,c){var b=new v(c);b.on("tap",function(){var v=a.eq(i).parents(".spa-page-body").find(".spa-page-container");v.removeClass("active"),v.eq(i).addClass("active"),a.removeClass("active"),a.eq(i).addClass("active")})})});