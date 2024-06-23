const express = require('express');
const { markAttendance, viewAttendance, requestLeave, getLeaveApplications, declineLeave, approveLeave, getRecord, markPresent } = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/mark', markAttendance);
router.get('/view/:userId', viewAttendance);
router.post('/request-leave', authMiddleware, requestLeave);
router.get('/getLeaves', getLeaveApplications);
router.post('/declineLeave', declineLeave);
router.post('/approveLeave', approveLeave);
router.get('/getRecord/:userId', getRecord);
router.post('/mark-present', markPresent);


module.exports = router;
