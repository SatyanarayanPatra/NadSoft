// utils/errorHandler.js

/**
 * Send a formatted error response.
 * @param {Response} res - Express response object
 * @param {Object} options - Options for error handling
 * @param {string} options.message - Error message to send to client
 * @param {number} options.statusCode - HTTP status code
 * @param {Object} [options.details] - Optional additional error details
 */
exports.handleError = (
	res,
	{ message = 'Internal Server Error', statusCode = 500, details = null }
) => {
	const errorResponse = { error: message };

	if (details) {
		errorResponse.details = details;
	}

	res.status(statusCode).json(errorResponse);
};

/**
 * For catching uncaught errors in try-catch blocks.
 * @param {Function} fn - Async function (controller)
 */
exports.asyncHandler = (fn) => {
	return (req, res, next) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
};
