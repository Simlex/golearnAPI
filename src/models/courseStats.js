const mongoose = require("mongoose");

const courseStatsSchema = mongoose.Schema({
  totalStudents: {
    type: Number,
    default: 0,
  },
});

const CourseStats = mongoose.model("CourseStats", courseStatsSchema);

module.exports = CourseStats;
