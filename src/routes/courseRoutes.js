import express from "express";
import {
  getAll,
  getOne,
  insertOne,
  deleteOne,
  deleteMany,
  updateOne,
} from "../controllers/courseControllers.js";
import validateToken from "../middlewares/validateToken.js";
import validateAdmin from "../middlewares/validateAdmin.js";


const courseRoutes = (app) => {
  app.use(express.json());

  app.get("/repository/courses", getAll);
  app.get("/repository/courses/:_id", getOne);

  app.post("/repository/courses", validateToken, validateAdmin, insertOne);

  app.delete("/repository/courses/:_id", validateToken , validateAdmin , deleteOne);
  app.delete("/repository/courses",validateToken , validateAdmin, deleteMany);

  app.put("/repository/courses/:_id", validateToken, validateAdmin, updateOne);
};

export default courseRoutes;
