module.exports = async function validateAdminTeacher(request, response, next) {
  const user = request.userLogged;

  if (user.user_type == "Administrador" || user.user_type == "Professor") {
    next();
  } else {
    const arr = {
      status: "ERROR",
      message: "Operação negada devido as permissões do usuário!",
    };
    return response.status(401).send(arr);
  }
}
