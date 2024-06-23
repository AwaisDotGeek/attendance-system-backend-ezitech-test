const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
// const Leave = require('../models/User');

exports.markAttendance = async (req, res) => {
  try {
    const { userId, date, status } = req.body;
    const existingRecord = await Attendance.findOne({ userId, date });
    if (existingRecord) {
      return res.status(400).send('Attendance already marked for this date');
    }
    const attendance = new Attendance({ userId, date, status });
    await attendance.save();
    res.status(201).send('Attendance marked');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.viewAttendance = async (req, res) => {
  try {
    const { userId } = req.params;
    let records = await Attendance.find({ userId });
    records = records.reverse();
    res.json(records);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.requestLeave = async (req, res) => {
  try {
    const { userId, date, leaveSubject, leaveBody } = req.body;
    const existingRecord = await Attendance.findOne({ userId, date });
    if (existingRecord) {
      return res.status(400).send('Attendance already marked for this date');
    }
    const attendance = new Attendance({ userId, date, status: 'waiting' });
    await attendance.save();

    const leave = new Leave({ userId, subject: leaveSubject, body: leaveBody, date });
    await leave.save();

    res.status(201).send('Leave request posted');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.getLeaveApplications = async (req, res) => {
  try {
    let leaves = await Leave.find({}).populate('userId', 'username studentId email');
    leaves = leaves.filter((leave) => leave.status === 'pending');
    res.json(leaves);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.declineLeave = async (req, res) => {
  try {
    const { leaveId, date } = req.body;
    const leave = await Leave.findOne({ _id: leaveId, date }).populate('userId', '_id');
    leave.status = 'declined';
    
    updateAttendance(leave.userId._id, 'absent', date);
    await leave.save();

    res.status(201).send('Leave declined successfully');
  } catch (error) {
    res.status(500).json(error.message);
  }
};

exports.approveLeave = async (req, res) => {
  try {
    const { leaveId, date } = req.body;
    const leave = await Leave.findOne({ _id: leaveId, date: date }).populate('userId', '_id');
    leave.status = 'approved';
    
    updateAttendance(leave.userId._id, 'leave', date);
    await leave.save();
    
    res.status(201).send('Leave approved successfully');
  } catch (error) {
    res.status(500).json(error.message);
  }
};

exports.getRecord = async (req, res) => {
  try {
    const { userId } = req.params;
    const attendances = await Attendance.find({ userId });
    res.json(attendances);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.markPresent = async (req, res) => {
  try {
    const { _id, date } = req.body;
    const attendance = await Attendance.findOne({ _id, date });
    attendance.status = 'present';
    await attendance.save();
    
    res.status(200).send('Marked present!');
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const updateAttendance = async (userId, status, date) => {
  try {
    const attendance = await Attendance.findOne({ userId, date });
    attendance.status = status;
    await attendance.save();
  } catch (error) { 
    console.log(error);
  }
};

