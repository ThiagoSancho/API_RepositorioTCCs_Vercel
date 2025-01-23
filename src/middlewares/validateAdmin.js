module.exports = async function validateAdmin(request, response, next) {
  const user = request.userLogged;

  if (user.user_type != "Administrador") {
    const arr = {
      status: "ERROR",
      message: "Operação negada devido as permissões do usuário!",
    };
    return response.status(401).send(arr);
  } else {
    next();
  }
};
