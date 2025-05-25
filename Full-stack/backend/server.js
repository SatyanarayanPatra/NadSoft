require('dotenv').config();
const express = require('express');
const studentRoutes = require('./routers/student.routes.js');
const globalErrorHandler = require('./middlewares/globalErrorHandler');
const cors = require('cors');
const { connectDB } = require('./db/index.js');
const app = express();

connectDB();

// CORS options to allow only React app
const corsOptions = {
	origin: function (origin, callback) {
		// allow requests with no origin (like Postman)
		if (!origin) return callback(null, true);

		const allowedOrigins = ['http://localhost:3000'];

		if (allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
	optionsSuccessStatus: 200, // for legacy browser support
};

// using CORS middleware with options
app.use(cors('*'));
app.use(express.json());

app.use('/api/students', studentRoutes);

app.use((req, res) => {
	res.status(404).json({ error: 'Route not found' });
});

app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
