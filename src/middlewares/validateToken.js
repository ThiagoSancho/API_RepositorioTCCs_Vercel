const JwtToken = require("../models/jwtToken.js");
const Users = require("../models/userSchema.js");
const Groups = require("../models/groupSchema.js");

module.exports = async function validateToken(request, response, next) {
  const jwtToken = new JwtToken(process.env.SECRET_KEY);
  const token = request.headers.authorization;
  const tokenResult = jwtToken.validateToken(token);

  try {
    if (tokenResult.status) {
      const token_id = tokenResult.decoded.payload._id;
      const token_user_type = tokenResult.decoded.payload.user_type;

      const user = await Users.findByIdPopulate(token_id);
      if (user == null) {
        const arr = {
          status: "ERROR",
          message: "Usuário que requisitou o pedido não existe!",
        };
        return response.status(404).send(arr);
      }
      if (user.user_type != token_user_type) {
        const arr = {
          status: "ERROR",
          message: "Dados do usuário que solicitou a requisição não são coerentes!",
          data: user,
        };
        return response.status(403).send(arr);
      }
      let group = null;
      if (user.group_id) {
        group = await Groups.findById(user.group_id);
      }
      user.project_id = group ? group.project_id : null;

      request.userLogged = user;
      next();
    } else {
      const arr = {
        status: "ERROR",
        message: "Chave de validação inválida!",
      };
      return response.status(401).send(arr);
    }
  } catch (error) {
    const arr = {
      status: "ERROR",
      message: "Ocorreu ao fazer a validação do usuário!",
      data: error,
    };
    return response.status(500).send(arr);
  }
};
