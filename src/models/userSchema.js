const mongoose = require("mongoose");
const md5 = require("md5");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    course_id: {
      type: mongoose.Types.ObjectId,
      ref: "course",
    },
    group_id: {
      type: mongoose.Types.ObjectId,
      ref: "group",
    },
    register: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
    },
    link: {
      type: String,
    },
    user_type: {
      type: String,
      default: "Estudante",
    },
    image: {
      type: String,
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
  },
  {
    statics: {
      async findAllPopulate(query) {
        const users = await this.find(query)
          .populate("course_id", "name", "course")
          .exec();

        return users.map((user) => ({
          _id: user._id,
          register: user.register,
          name: user.name,

          user_type: user.user_type,
          status: user.status,

          course_id: user.course_id ? user.course_id._id : "N/A",
          course: user.course_id ? user.course_id.name : "N/A",

          group_id: user.group_id ? user.group_id : null,

          email: user.email ? user.email : null,
          phone_number: user.phone_number ? user.phone_number : null,
          link: user.link ? user.link : null,

          image: user.image
            ? `${process.env.API_PATH}${user.image}`
            : `${process.env.API_PATH}${process.env.USER_PROFILE_PICTURE_DEFAULT}`,
        }));
      },
      async findByIdPopulate(_id) {
        const user = await this.findById(_id)
          .populate("course_id", "name", "course")
          .exec();

        if (user == null) {
          return null;
        }

        return {
          _id: user._id,
          register: user.register,
          name: user.name,

          user_type: user.user_type,
          status: user.status,

          course_id: user.course_id ? user.course_id._id : "N/A",
          course: user.course_id ? user.course_id.name : "N/A",

          group_id: user.group_id ? user.group_id : null,

          email: user.email ? user.email : null,
          phone_number: user.phone_number ? user.phone_number : null,
          link: user.link ? user.link : null,

          image: user.image
            ? `${process.env.API_PATH}${user.image}`
            : `${process.env.API_PATH}${process.env.USER_PROFILE_PICTURE_DEFAULT}`,
        };
      },
      async login(register, password) {
        const password_md5 = md5(password);
        const user = await this.findOne({
          $or: [{ register: register }, { email: register }],
          password: password_md5,
          status: "1",
        }).exec();

        return user;
      },
    },
  }
);

const Users = mongoose.model("user", userSchema, "users");

module.exports = Users;
