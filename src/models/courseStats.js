const mongoose = require("mongoose");

const courseStatsSchema = mongoose.Schema({
  courseId: {
    type: mongoose.Schema.ObjectId,
    ref: "Course",
    required: true,
  },
  totalStudents: {
    type: Number,
    default: 0,
  },
});

const CourseStats = mongoose.model("CourseStats", courseStatsSchema);

module.exports = CourseStats;
