
(jQuery.fn)
.removeClassEx = function(pattern) {
	return (
		jQuery(this)
		.removeClass((key, classList)=> {
			return (
				classList
				.split(/[\s\h]+/)
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
