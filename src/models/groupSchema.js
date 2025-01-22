import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    status: {
      type: String,
    },
    students: {
      type: [mongoose.Types.ObjectId],
      ref: "user",
    },
    course_id: {
      type: mongoose.Types.ObjectId,
      ref: "course",
    },
    supervisor_id: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
    project_id: {
      type: mongoose.Types.ObjectId,
      ref: "project",
      default: null,
    },
    leader_id: {
      type: mongoose.Types.ObjectId,
      ref: "user",
    },
  },
  {
    statics: {
      async findAllPopulate(query) {
        const groups = await this.find(query)
          .populate(
            "students",
            ["name", "register", "email", "link", "image"],
            "user"
          )
          .populate("leader_id", "name", "user")
          .populate("course_id", "name", "course")
          .populate("project_id", [
            "title",
            "summary",
            "grade",
            "status",
            "monography",
            "zip",
            "image",
            "date",
          ])
          .populate("supervisor_id", "name", "user")
          .exec();

        return groups.map((group) => ({
          _id: group._id,
          title: group.title,

          students: group.students,

          course_id: group.course_id ? group.course_id._id : null,
          course: group.course_id ? group.course_id.name : null,

          supervisor_id: group.supervisor_id ? group.supervisor_id._id : null,
          supervisor: group.supervisor_id ? group.supervisor_id.name : null,

          project: group.project_id ? group.project_id : null,

          leader_id: group.leader_id ? group.leader_id._id : null,
          leader: group.leader_id ? group.leader_id.name : null,

          status: group.status,
        }));
      },
      async findByIdPopulate(_id) {
        const group = await this.findById(_id)
          .populate(
            "students",
            ["name", "register", "email", "link", "image"],
            "user"
          )
          .populate("leader_id", "name", "user")
          .populate("course_id", "name", "course")
          .populate("project_id", [
            "title",
            "summary",
            "grade",
            "status",
            "monography",
            "zip",
            "image",
            "date",
          ])
          .populate("supervisor_id", "name", "user")
          .exec();

        if (group == null) {
          return null;
        }

        return {
          _id: group._id,
          title: group.title,

          students: group.students,

          course_id: group.course_id ? group.course_id._id : null,
          course: group.course_id ? group.course_id.name : null,

          supervisor_id: group.supervisor_id ? group.supervisor_id._id : null,
          supervisor: group.supervisor_id ? group.supervisor_id.name : null,

          project: group.project_id ? group.project_id : null,

          leader_id: group.leader_id ? group.leader_id._id : null,
          leader: group.leader_id ? group.leader_id.name : null,

          status: group.status,
        };
      },
    },
  }
);

const Groups = mongoose.model("group", groupSchema, "groups");

export default Groups;
