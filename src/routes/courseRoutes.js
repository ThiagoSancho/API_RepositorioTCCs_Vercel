const express = require("express");
const {
  getAll,
  getOne,
  insertOne,
  deleteOne,
  deleteMany,
  updateOne,
} = require("../controllers/courseControllers.js");
const validateToken = require("../middlewares/validateToken.js");
const validateAdmin = require("../middlewares/validateAdmin.js");

const courseRoutes = (app) => {
  app.use(express.json());

  app.get("/repository/courses", getAll);
  app.get("/repository/courses/:_id", getOne);

  app.post("/repository/courses", validateToken, validateAdmin, insertOne);

  app.delete("/repository/courses/:_id", validateToken , validateAdmin , deleteOne);
  app.delete("/repository/courses", validateToken , validateAdmin, deleteMany);

  app.put("/repository/courses/:_id", validateToken, validateAdmin, updateOne);
};

module.exports = courseRoutes;
