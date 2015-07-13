define(function(require) {
	/*
	 * test code
	 * function Person(name) {
			this.name = name;
		}

		Person.prototype.getName = function() {
			return this.name;
		};

		function Author(name,books) {
			// Person.call(this,name);
			Author.superCls.constructor.call(this,name);
			this.books = books;
		}
		extend(Author,Object);
		Author.prototype.getBooks = function() {
			return this.books;
		};

		console.log(new Author('dujie',[2,3]));
	 */


	function extend(subClass, superClass) {
		function F() {}
		F.prototype = superClass.prototype;
		subClass.prototype = new F();
		subClass.prototype.constructor = subClass;

		if (superClass.prototype.constructor == Object.prototype.constructor) {
			superClass.prototype.constructor = superClass;
		}
		subClass.superCls = superClass.prototype;
	}



});