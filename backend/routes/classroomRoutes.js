const express = require('express');
const Classroom = require('../models/Classroom');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// Crear un nuevo subgrupo
router.post('/:id/subgroups', protect, authorize('teacher'), async (req, res) => {
  const { name } = req.body;
  try {
    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) {
      return res.status(404).json({ msg: 'Classroom not found' });
    }

    const newSubGroup = { name, students: [], grades: [], observations: [] };
    classroom.subGroups.push(newSubGroup);
    await classroom.save();
    res.status(201).json(classroom);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Unirse a un subgrupo
router.post('/:classroomId/subgroups/:subGroupId/join', protect, authorize('student'), async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.classroomId);
    if (!classroom) {
      return res.status(404).json({ msg: 'Classroom not found' });
    }

    const subGroup = classroom.subGroups.id(req.params.subGroupId);
    if (!subGroup) {
      return res.status(404).json({ msg: 'SubGroup not found' });
    }

    if (!subGroup.students.includes(req.user.id)) {
      subGroup.students.push(req.user.id);
      await classroom.save();
    }

    res.json(subGroup);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Añadir calificaciones y observaciones
router.post('/:classroomId/subgroups/:subGroupId/grade', protect, authorize('teacher'), async (req, res) => {
  const { studentId, grade, observation } = req.body;
  try {
    const classroom = await Classroom.findById(req.params.classroomId);
    if (!classroom) {
      return res.status(404).json({ msg: 'Classroom not found' });
    }

    const subGroup = classroom.subGroups.id(req.params.subGroupId);
    if (!subGroup) {
      return res.status(404).json({ msg: 'SubGroup not found' });
    }

    const gradeIndex = subGroup.grades.findIndex(g => g.student.toString() === studentId);
    if (gradeIndex > -1) {
      subGroup.grades[gradeIndex].grade = grade;
    } else {
      subGroup.grades.push({ student: studentId, grade });
    }

    const obsIndex = subGroup.observations.findIndex(o => o.student.toString() === studentId);
    if (obsIndex > -1) {
      subGroup.observations[obsIndex].observation = observation;
    } else {
      subGroup.observations.push({ student: studentId, observation });
    }

    await classroom.save();
    res.json(subGroup);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;