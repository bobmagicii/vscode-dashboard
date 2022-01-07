
(jQuery.fn)
.removeClassEx = function(pattern) {
	return (
		jQuery(this)
		.removeClass((key, classList)=> {
			return (
				classList
				.split(/[\s]+/)
				.filter((classItem)=> pattern.test(classItem))
				.join(' ')
			);
		})
	);
};

(jQuery.fn)
.tval = function() {
	return jQuery.trim(jQuery(this).val());
};


(jQuery.fn)
.arrayFilterById = function(whatYouSeek) {
	return this.filter(function(val, key) {
		return val.id === whatYouSeek;
	});
};

(jQuery.fn)
.arrayFindById = function(whatYouSeek) {
	return this.filter(function(val, key) {
		return val.id !== whatYouSeek;
	});
};
