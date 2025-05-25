const { pool } = require('./db');

pool.query('SELECT current_database()', (err, res) => {
	if (err) {
		console.error('DB check failed:', err);
	} else {
		console.log('✅ Connected to DB:', res.rows[0].current_database);
	}
});
