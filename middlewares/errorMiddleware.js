export const notFound = (req, res, next) => {
	const err = new Error(`Not Found : ${req.originalUrl}`);
	err.status = 404;
	throw err;
};

export const errorHandler = (err, req, res, next) => {
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	if (err.status == 500) return res.render('500');
	if (err.status == 404) return res.render('404');
	res.render('error');
};