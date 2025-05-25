module.exports = (err, req, res, next) => {
	console.error('Unhandled Error:', err.stack || err);

	res.status(500).json({
		error: 'Something went wrong',
		details: err.message || 'Unexpected server error',
	});
};
