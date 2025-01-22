import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    default: 0
  },
});

const Courses = mongoose.model("course", courseSchema , "courses");

export default Courses;
