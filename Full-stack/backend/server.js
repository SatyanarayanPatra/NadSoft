require('dotenv').config();
const express = require('express');
const app = express();
const studentRoutes = require('./routes/studentRoutes');
const globalErrorHandler = require('./middlewares/globalErrorHandler');
const cors = require('cors');

// used a basic CORS setup for development
app.use(cors());
app.use(express.json());

app.use('/api/students', studentRoutes);

app.use((req, res) => {
	res.status(404).json({ error: 'Route not found' });
});

app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
