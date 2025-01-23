const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
  },
  grade: {
    type: Number,
  },
  date: {
    type: Date,
    default: function () {
      const date = new Date();
      return date.toISOString();
    },
  },
  status: {
    type: String,
  },
  monography: {
    type: String,
  },
  document: {
    type: String,
  },
  zip: {
    type: String,
  },
  course_id: {
    type: mongoose.Types.ObjectId,
    ref: "course",
  },
  course: {
    type: String,
  },
  group_id: {
    type: mongoose.Types.ObjectId,
    ref: "group",
  },
  students: {
    type: String,
  },
  supervisor_id: {
    type: mongoose.Types.ObjectId,
    ref: "user",
  },
  supervisor: {
    type: String,
  },
});

const Projects = mongoose.model("project", projectSchema, "projects");

module.exports = Projects;
