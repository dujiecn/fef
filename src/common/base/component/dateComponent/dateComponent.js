/*
	日期组件
*/
define("common/base/component/dateComponent/dateComponent",function(require, exports, module) {
	var WEEK_NAME = ["日", "一", "二", "三", "四", "五", "六"];
	var MONTH_DAY_ARRAY = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

	function Calendar(option) {
		this.isChange = false;
		this.element = $(option.element);

		if (option.date) {
			if (typeof option.date == "string") { // 2013-05-18
				var temp = option.date.split("-");
				this.date = new Date(temp[0], parseInt(temp[1]) - 1, temp[2]);
			} else {
				this.date = option.date;
			}
		} else {
			this.date = new Date();
		}

		this.parse(this.date);

		this.mark = option.mark || [];
		this.disable = option.disable || false;
		this.width = option.width;
		this.height = option.height;

		this.render();
		!this.disable && this.bind();
	};
	Calendar.prototype.parse = function(date) {
		this.year = date.getFullYear();
		this.month = date.getMonth();
		this.dateOfMonth = date.getDate();
		date.setFullYear(this.year, this.month, 1); // 设置时间为当前所在月份1号
		this.firstDayOfMonth = date.getDay(); // 每月一号是周几
	};
	Calendar.prototype.render = function() {
		var _this = this;
		if (!this.isChange) {
			this.element.html(function() {
				return $('<div>').addClass('m-datePanel')
					.append('<div class="dateHeader"></div>')
					.append('<div class="dateContent"></div>');
			});
		}


		((this.year % 4 == 0 && this.year % 100 != 0) || this.year % 400 == 0) && (MONTH_DAY_ARRAY[1] = 29);
		var tempMonth = this.month + 1 < 10 ? "0" + (this.month + 1) : this.month + 1;
		var totalDaysOfMonth = MONTH_DAY_ARRAY[this.month];
		// 根据每个月的一号是周几 计算出总共是多少天（以每行7天计算，方便下面计算行数）
		var tempTotalDays = 0;
		switch (this.firstDayOfMonth) {
			case 1:
				tempTotalDays = totalDaysOfMonth + 1;
				break;
			case 2:
				tempTotalDays = totalDaysOfMonth + 2;
				break;
			case 3:
				tempTotalDays = totalDaysOfMonth + 3;
				break;
			case 4:
				tempTotalDays = totalDaysOfMonth + 4;
				break;
			case 5:
				tempTotalDays = totalDaysOfMonth + 5;
				break;
			case 6:
				tempTotalDays = totalDaysOfMonth + 6;
				break;
			case 0:
				tempTotalDays = totalDaysOfMonth;
				break;
			default:
				tempTotalDays = totalDaysOfMonth
				break;
		}



		var trSize = Math.ceil(tempTotalDays / 7); // table总行数
		var tdSize = 7; // 默认总列数

		/*===============初始化时间表格================*/
		var $table = $("<table id='datePanel'>");
		var $weekTr = $("<tr>");
		for (var k = 0; k < WEEK_NAME.length; k++) {
			$("<td>").width($(this.element).width() / 7).text(WEEK_NAME[k]).appendTo($weekTr);
		}
		$table.append($weekTr);


		for (var i = 0; i < trSize; i++) {
			var $tr = $("<tr>");
			for (var j = 0; j < tdSize; j++) {
				$("<td>").appendTo($tr);
			}
			$table.append($tr);
		}


		// 给有日期的表格td添加日期数字
		$table.find("tr:gt(0) td").eq(this.firstDayOfMonth).addClass("hasDate").text(1);
		$table.find("tr:gt(0) td:gt(" + this.firstDayOfMonth + ")").each(function(index) {
			if (index >= totalDaysOfMonth - 1)
				return;
			$(this).addClass("hasDate").text(index + 2);
		});

		// 给每个td添加自己的时间，便于外面调用
		$table.find("td.hasDate").each(function() {
			$(this).data("date",_this.year + "-" + tempMonth + "-" + ($(this).text() < 10 ? "0" + $(this).text() : $(this).text()));
		});


		// 根据有标记（有通知）的日期判断是否需要加上标记 icon
		$table.find(".hasDate").each(function(index) {
			var _self = $(this);
			var text = _self.text();
			var dateStr = _this.year + "-" + tempMonth + "-" + (text < 10 ? "0" + text : text);
			_this.mark.forEach(function(obj) {
				if (obj == dateStr) {
					_self.addClass('icon');
				}
			});
		});

		// 默认给当前时间的日期加上选中样式
		!_this.isChange && $table.find(".hasDate").eq(this.dateOfMonth - 1).addClass("now");

		if ($(".dateHeader").children().length == 0) {
			$(".dateHeader").html('<table><tr><td class="changeYearLeft"></td><td>' + _this.year + '年</td><td class="changeYearRight"></td><td class="changeLeft"></td><td>' + tempMonth + '月</td><td class="changeRight"></td></tr></table>');
		} else {
			$(".dateHeader .changeYearLeft").next().html(_this.year + "年");
			$(".dateHeader .changeLeft").next().html(tempMonth + "月");
		}
		$(".dateContent").html($table);
	};
	Calendar.prototype.bind = function(func) {
		func && func.call(this);
		return;

		var _this = this;
		$(".changeLeft").bind("click", function() {
			_this.changeMonthLeft();
			_this.render();
		});
		$(".changeRight").bind("click", function() {
			_this.changeMonthRight();
			_this.render();
		});
		$(".changeYearRight").on("click", function() {
			_this.changeYearRight();
			_this.render();
		});
		$(".changeYearLeft").on("click", function() {
			_this.changeYearLeft();
			_this.render();
		});
	}
	Calendar.prototype.changeMonthLeft = function() {
		this.isChange = true;
		if (this.month == 0) {
			this.month = 11;
			this.year--;
		} else {
			this.month--;
		}
		this.date.setFullYear(this.year, this.month);
		this.parse(this.date);
	};
	Calendar.prototype.changeMonthRight = function() {
		this.isChange = true;
		if (this.month == 11) {
			this.month = 0;
			this.year++;
		} else {
			this.month++;
		}
		this.date.setFullYear(this.year, this.month);
		this.parse(this.date);
	};
	Calendar.prototype.changeYearLeft = function() {
		this.isChange = true;
		this.date.setFullYear(--this.year);
		this.parse(this.date);
	};
	Calendar.prototype.changeYearRight = function() {
		this.isChange = true;
		this.date.setFullYear(++this.year);
		this.parse(this.date);
	};

	module.exports.Calendar = Calendar;
});