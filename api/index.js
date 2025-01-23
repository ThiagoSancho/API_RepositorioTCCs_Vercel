const express = require("express");
const connect = require("../src/config/database.js");
const courseRoutes = require("../src/routes/courseRoutes.js");
const userRoutes = require("../src/routes/userRoutes.js");
const groupRoutes = require("../src/routes/groupRoutes.js");
const cors = require("cors");
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use("/uploads", express.static("uploads"));
app.use("/default", express.static("default"));

connect(process.env.STRING_CONNECTION);


courseRoutes(app);
userRoutes(app);
groupRoutes(app);

app.get("/", (request, response) => {
  console.log("Servidor no Vercel!");
  response.send("Servidor Vercel!")
});

app.listen(4000, () => {
  console.log("Servidor rodando na porta: http://localhost:4000/repository/");
});

module.exports = app;
