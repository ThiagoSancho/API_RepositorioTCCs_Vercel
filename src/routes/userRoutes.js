import express from "express";
import multer from "multer";
import {
  getAll,
  getOne,
  login,
  insertOne,
  deleteOne,
  deleteMany,
  updateOne,
  updatePassword,
  updateStatus,
  updateAdmin,
  updateImage,
  insertMany
} from "../controllers/userControllers.js";

import validateAdmin from "../middlewares/validateAdmin.js";
import validateToken from "../middlewares/validateToken.js";



const storage = multer.diskStorage({ destination: "./uploads/users_images" });

const upload = multer({ storage: storage });

const userRoutes = (app) => {
  app.use(express.json());

  app.get("/repository/users", validateToken, getAll);
  app.get("/repository/users/:_id", getOne);

  app.post("/repository/users", validateToken, validateAdmin, insertOne);
  app.post("/repository/users/login", login);
  app.post("/repository/users/csv" , validateToken , validateAdmin , upload.single("csv") , insertMany) 

  app.delete("/repository/users/:_id", validateToken, validateAdmin, deleteOne);
  app.delete("/repository/users", validateToken, validateAdmin, deleteMany);

  app.patch("/repository/users/:_id", validateToken, updateOne);
  app.patch("/repository/users/password/:_id", validateToken, updatePassword);
  app.patch("/repository/users/status/:status", validateToken, validateAdmin, updateStatus);
  app.patch("/repository/users/image/:_id", validateToken, upload.single("image"), updateImage);

  app.put("/repository/users/:_id", validateToken, validateAdmin, updateAdmin);
};

export default userRoutes;
