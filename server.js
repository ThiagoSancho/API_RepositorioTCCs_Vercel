import express from "express";
import connect from "./src/config/database.js";
import courseRoutes from "./src/routes/courseRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import groupRoutes from "./src/routes/groupRoutes.js";
import cors from "cors";
import dotenv from 'dotenv';

dotenv.config()

const app = express();

app.use("/uploads", express.static("uploads"));
app.use("/default", express.static("default"));

await connect(process.env.STRING_CONNECTION);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      callback(null, true);
    } else if (origin.includes(":8080")) {
      callback(null, true);
    } else {
      callback(new Error("Rota negada pelo CORS"));
    }
  },
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

courseRoutes(app);
userRoutes(app);
groupRoutes(app);

app.listen(3000, () => {
  console.log("Servidor rodando na porta: http://localhost:3000/repository/");
});
