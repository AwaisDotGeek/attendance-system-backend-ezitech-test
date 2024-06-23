const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'declined', 'approved'],
        default: 'pending',
    },
});

leaveSchema.index({ userId: 1, date: 1 }, { unique: true });

const Leave = mongoose.model('Leave', leaveSchema);

module.exports = Leave;