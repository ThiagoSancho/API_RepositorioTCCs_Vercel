const mongoose = require("mongoose");

async function connect(string_connection) {
  try {
    
    if (mongoose.connection.readyState == 1) {
      console.log("Já conectado ao banco de dados!");
      return true;
    }

    console.log("Conectando ao banco de dados...");
    await mongoose.connect(string_connection);
    console.log("Conectado ao banco de dados!");
    return true;
  } catch (error) {
    console.error("Ocorreu um erro ao conectar com o banco de dados!\n", error);
    process.exit();
  }
}

module.exports = connect;
