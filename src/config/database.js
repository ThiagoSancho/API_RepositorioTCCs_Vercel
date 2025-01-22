import mongoose from "mongoose";

export default async function connect(string_connection) {
  try {
    console.log("Conectando ao banco de dados...");
    await mongoose.connect(string_connection);
    console.log("Conectado ao banco de dados!");
    return true;
  } catch (error) {
    console.error("Ocorreu um erro ao conectar com o banco de dados!\n", error);
    process.exit();
  }
}
