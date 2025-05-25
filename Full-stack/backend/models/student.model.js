const pool = require('../db/index.js');

exports.createStudent = async ({ name, email, age }) => {
	const res = await pool.query(
		'INSERT INTO students (name, email, age) VALUES ($1, $2, $3) RETURNING *',
		[name, email, age]
	);
	return res.rows[0];
};

exports.createMarks = async (studentId, marks) => {
	const queries = marks.map((mark) =>
		pool.query(
			'INSERT INTO marks (student_id, subject, score) VALUES ($1, $2, $3)',
			[studentId, mark.subject, mark.score]
		)
	);
	await Promise.all(queries);
};

// Add other CRUD methods similarly
