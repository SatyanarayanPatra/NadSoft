const studentModel = require('../models/student.model.js');
const { handleError } = require('../utils/error.handler.js');
const { pool } = require('../db/index.js');

exports.createStudent = async (req, res) => {
	try {
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
			const markInserts = marks.map(({ subject, score }) =>
				pool.query(
					'INSERT INTO marks (student_id, subject, score) VALUES ($1, $2, $3)',
					[student.id, subject, score]
				)
			);
			await Promise.all(markInserts);
		}

		res.status(201).json({ message: 'Student created', student });
	} catch (error) {
		handleError(res, {
			message: 'Failed to create student',
			statusCode: 500,
			details: error.message,
		});
	}
};

exports.getAllStudents = async (req, res) => {
	try {
		let page = parseInt(req.query.page, 10);
		let limit = parseInt(req.query.limit, 10);

		if (isNaN(page) || page < 1) page = 1;
		if (isNaN(limit) || limit < 1) limit = 10;

		const offset = (page - 1) * limit;

		const studentsRes = await pool.query(
			'SELECT * FROM students ORDER BY id LIMIT $1 OFFSET $2',
			[limit, offset]
		);
		const totalRes = await pool.query('SELECT COUNT(*) FROM students');

		res.status(200).json({
			data: studentsRes.rows,
			meta: {
				total: parseInt(totalRes.rows[0].count, 10),
				page,
				limit,
				totalPages: Math.ceil(totalRes.rows[0].count / limit),
			},
		});
	} catch (error) {
		handleError(res, {
			message: 'Failed to fetch students',
			statusCode: 500,
			details: error.message,
		});
	}
};

exports.getStudentById = async (req, res) => {
	try {
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
	} catch (error) {
		handleError(res, {
			message: 'Failed to fetch student',
			statusCode: 500,
			details: error.message,
		});
	}
};

exports.updateStudent = async (req, res) => {
	try {
		const { id } = req.params;
		const { name, email, age } = req.body;

		const existingRes = await pool.query(
			'SELECT * FROM students WHERE id = $1',
			[id]
		);

		if (existingRes.rows.length === 0) {
			return handleError(res, {
				message: 'Student not found',
				statusCode: 404,
			});
		}

		const existing = existingRes.rows[0];

		const updatedRes = await pool.query(
			'UPDATE students SET name = $1, email = $2, age = $3 WHERE id = $4 RETURNING *',
			[
				name || existing.name,
				email || existing.email,
				age || existing.age,
				id,
			]
		);

		res.status(200).json({
			message: 'Student updated',
			student: updatedRes.rows[0],
		});
	} catch (error) {
		handleError(res, {
			message: 'Failed to update student',
			statusCode: 500,
			details: error.message,
		});
	}
};

exports.deleteStudent = async (req, res) => {
	try {
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

		await pool.query('DELETE FROM marks WHERE student_id = $1', [id]);
		await pool.query('DELETE FROM students WHERE id = $1', [id]);

		res.status(200).json({ message: 'Student deleted successfully' });
	} catch (error) {
		handleError(res, {
			message: 'Failed to delete student',
			statusCode: 500,
			details: error.message,
		});
	}
};
