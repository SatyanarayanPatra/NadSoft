const studentModel = require('../models/studentModel');
const { handleError, asyncHandler } = require('../utils/errorHandler');
const pool = require('../db/index.js');

exports.createStudent = asyncHandler(async (req, res) => {
	const { name, email, age, marks } = req.body;

	if (!name || !email || !age) {
		return handleError(res, {
			message: 'Name, email, and age are required',
			statusCode: 400,
			details: { fields: ['name', 'email', 'age'] },
		});
	}

	const studentRes = await pool.query(
		'INSERT INTO students (name, email, age) VALUES ($1, $2, $3) RETURNING *',
		[name, email, age]
	);
	const student = studentRes.rows[0];

	if (Array.isArray(marks)) {
		const markInserts = marks.map((subject) => {
			return pool.query(
				'INSERT INTO marks (student_id, subject, score) VALUES ($1, $2, $3)',
				[student.id, subject.subject, subject.score]
			);
		});
		await Promise.all(markInserts);
	}

	res.status(201).json({ message: 'Student created', student });
});

// Get All Students (Paginated)
exports.getAllStudents = asyncHandler(async (req, res) => {
	const { page = 1, limit = 10 } = req.query;
	const offset = (page - 1) * limit;

	const studentsRes = await pool.query(
		'SELECT * FROM students ORDER BY id LIMIT $1 OFFSET $2',
		[limit, offset]
	);
	const totalRes = await pool.query('SELECT COUNT(*) FROM students');

	res.status(200).json({
		data: studentsRes.rows,
		meta: {
			total: parseInt(totalRes.rows[0].count),
			page: parseInt(page),
			limit: parseInt(limit),
			totalPages: Math.ceil(totalRes.rows[0].count / limit),
		},
	});
});

// Get Student By ID
exports.getStudentById = asyncHandler(async (req, res) => {
	const { id } = req.params;

	const studentRes = await pool.query(
		'SELECT * FROM students WHERE id = $1',
		[id]
	);
	if (studentRes.rows.length === 0) {
		return handleError(res, {
			message: 'Student not found',
			statusCode: 404,
		});
	}

	const marksRes = await pool.query(
		'SELECT * FROM marks WHERE student_id = $1',
		[id]
	);

	res.status(200).json({
		student: studentRes.rows[0],
		marks: marksRes.rows,
	});
});

// Update Student
exports.updateStudent = asyncHandler(async (req, res) => {
	const { id } = req.params;
	const { name, email, age } = req.body;

	const existing = await pool.query('SELECT * FROM students WHERE id = $1', [
		id,
	]);
	if (existing.rows.length === 0) {
		return handleError(res, {
			message: 'Student not found',
			statusCode: 404,
		});
	}

	const updated = await pool.query(
		'UPDATE students SET name = $1, email = $2, age = $3 WHERE id = $4 RETURNING *',
		[
			name || existing.rows[0].name,
			email || existing.rows[0].email,
			age || existing.rows[0].age,
			id,
		]
	);

	res.status(200).json({
		message: 'Student updated',
		student: updated.rows[0],
	});
});

// Delete Student
exports.deleteStudent = asyncHandler(async (req, res) => {
	const { id } = req.params;

	const student = await pool.query('SELECT * FROM students WHERE id = $1', [
		id,
	]);
	if (student.rows.length === 0) {
		return handleError(res, {
			message: 'Student not found',
			statusCode: 404,
		});
	}

	await pool.query('DELETE FROM marks WHERE student_id = $1', [id]);
	await pool.query('DELETE FROM students WHERE id = $1', [id]);

	res.status(200).json({ message: 'Student deleted successfully' });
});
