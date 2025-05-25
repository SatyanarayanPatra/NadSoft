const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router
	.route('/')
	.post(studentController.createStudent)
	.get(studentController.getAllStudents);

router
	.route('/:id')
	.post(studentController.createStudent)
	.get(studentController.getStudentById)
	.put(studentController.updateStudent)
	.delete(studentController.deleteStudent);

module.exports = router;
