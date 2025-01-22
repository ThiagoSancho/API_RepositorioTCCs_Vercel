import express from "express";
import {
  getOne,
  getAll,
  insertOne,
  insertOneAdmin,
  inviteStudents,
  deleteOne,
  deleteMany,
  leaveGroup,
  acceptGroup,
  updateStatus,
  update
} from "../controllers/groupControllers.js";
import validateToken from "../middlewares/validateToken.js";
import validateAdminTeacher from "../middlewares/validateAdminTeacher.js";


const groupRoutes = (app) => {
  app.use(express.json());

  app.get("/repository/groups/:_id", getOne);
  app.get("/repository/groups", validateToken, validateAdminTeacher, getAll);

  app.post("/repository/groups", validateToken, insertOne);
  app.post("/repository/groups/administrator", validateToken, validateAdminTeacher, insertOneAdmin);
  app.post("/repository/groups/invite/:_id", inviteStudents);

  app.delete("/repository/groups/:_id", validateToken, validateAdminTeacher, deleteOne);
  app.delete("/repository/groups", validateToken, validateAdminTeacher, deleteMany);

  app.patch("/repository/groups/leave/:group_id", validateToken, leaveGroup);
  app.patch("/repository/groups/accept", acceptGroup);
  app.patch("/repository/groups/update/status/:status", validateToken, validateAdminTeacher, updateStatus);

  app.put("/repository/groups/:_id" , validateToken , validateAdminTeacher, update);
};

export default groupRoutes;
