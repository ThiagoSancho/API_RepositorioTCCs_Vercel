import Users from "../models/userSchema.js";
import Courses from "../models/courseSchema.js";
import Groups from "../models/groupSchema.js";
import JwtToken from "../models/jwtToken.js";
import md5 from "md5";
import fs from "fs";
import { ObjectId } from "mongodb";
import {
  validateFile,
  deleteFile,
  csvToArray,
  renameFile,
} from "../utils/fileManager.js";

/**
 *
 *
 * Funções GET
 *
 *
 */
export async function getAll(request, response) {
  let query = {};
  const user = request.userLogged;

  if (user.user_type == "Professor") {
    query = { course_id: user.course_id };
  } else if (user.user_type == "Estudante") {
    query = { course_id: user.course_id, user_type: "Professor" };
  }

  try {
    const result = await Users.findAllPopulate(query);

    const arr = {
      status: "SUCCESS",
      message: "Usuários recuperados com sucesso!",
      data: result,
    };
    return response.status(200).send(arr);
  } catch (error) {
    const arr = {
      status: "ERROR",
      message: "Erro de servidor, tente novamente mais tarde!",
      data: error,
    };
    return response.status(500).send(arr);
  }
}

export async function getOne(request, response) {
  const _id = request.params._id;
  try {
    if (!ObjectId.isValid(_id)) {
      const arr = {
        status: "ERROR",
        message: "Identificador do usuário inválido!",
        data: { _id: _id },
      };

      return response.status(400).send(arr);
    }

    const result = await Users.findByIdPopulate(_id);

    if (result == null) {
      const arr = {
        status: "ERROR",
        message: "Usuário não encontrado!",
      };
      return response.status(404).send(arr);
    }

    const arr = {
      status: "SUCCESS",
      message: "Usuário recuperado com sucesso!",
      data: result,
    };

    return response.status(200).send(arr);
  } catch (error) {
    const arr = {
      status: "ERROR",
      message: "Erro de servidor, tente novamente mais tarde!",
      data: error,
    };

    return response.status(500).send(arr);
  }
}

/**
 *
 *
 * Funções POST
 *
 *
 */
export async function login(request, response) {
  const password = request.body.password;
  const register = request.body.register;

  try {
    const user = await Users.login(register, password);

    if (user == null) {
      const arr = {
        status: "ERROR",
        message: "Registro ou senha incorretos!",
      };
      return response.status(401).send(arr);
    }

    const jwtToken = new JwtToken(process.env.SECRET_KEY);

    const payload = {
      _id: user.id,
      user_type: user.user_type,
    };
    const token = jwtToken.createToken(payload);

    const data = {
      _id: user.id,
      user_type: user.user_type,
      token: token,
    };
    const arr = {
      status: "SUCCESS",
      message: "Usuário conectado com sucesso!",
      data: data,
    };
    return response.status(200).send(arr);
  } catch (error) {
    const arr = {
      status: "ERROR",
      message: "Erro de servidor, tente novamente mais tarde!",
      data: error,
    };
    return response.status(500).send(arr);
  }
}

export async function insertOne(request, response) {
  const name = request.body.name;
  const register = request.body.register;
  const emailUser = request.body.email;
  const course_id = request.body.course_id;
  const phone_number = request.body.phone_number;
  const link = request.body.link;
  const user_type = request.body.user_type;

  try {
    if (!name || !register) {
      const arr = {
        status: "ERROR",
        message: "Nome e registros não devem ser vazios",
      };

      return response.status(400).send(arr);
    }

    let filter = { $or: [{ register: register }, { email: emailUser }] };
    const verifyUser = await Users.exists(filter).exec();
    if (verifyUser != null) {
      const arr = {
        status: "ERROR",
        message: "Email ou registro já em uso!",
        data: { register: register, email: emailUser },
      };

      return response.status(409).send(arr);
    }

    if (!["Estudante", "Professor", "Administrador"].includes(user_type)) {
      const arr = {
        status: "ERROR",
        message: "Tipo de usuário inválido!",
        data: { user_type: user_type },
      };

      return response.status(400).send(arr);
    }

    let course = null;

    if (course_id != "N/A") {
      course = await Courses.findById(course_id).exec();
    }
    if (course == null && course_id != "N/A") {
      const arr = {
        status: "ERROR",
        message: "Curso não encontrado!",
        data: { course_id: course_id },
      };

      return response.status(404).send(arr);
    }

    const user = new Users({
      name: name.trim(),
      register: register.trim(),
      user_type: user_type,
      email: emailUser ? emailUser.trim() : null,
      course_id: course_id == "N/A" ? null : course_id,
      phone_number: phone_number ? phone_number.trim() : null,
      link: link ? link.trim() : null,
      password: md5(register.trim()),
    });

    const result = await user.save();
    const data = await Users.findByIdPopulate(result.id);

    const arr = {
      status: "SUCCESS",
      message: "Usuário inserido com sucesso!",
      data: data,
    };
    return response.status(200).send(arr);
  } catch (error) {
    const arr = {
      status: "ERROR",
      message: "Erro de servidor, tente novamente mais tarde!",
      data: error,
    };
    return response.status(500).send(arr);
  }
}

export async function insertMany(request, response) {
  const csv = request.file;
  try {
    if (!csv) {
      const arr = {
        status: "ERROR",
        message: "Arquivo não enviado!",
      };
      return response.status(400).send(arr);
    }

    const csvMime = csv.mimetype;
    const type = csvMime.split("/")[1];

    if (type != "csv") {
      deleteFile(csv.path);

      const arr = {
        status: "ERROR",
        message: "Tipo de arquivo inválido!",
      };
      return response.status(400).send(arr);
    }

    let data = csvToArray(csv.path, ",");

    let usersAdded = [];
    let usersError = [];
    let usersToAdd = [];

    for (let currentUser of data) {
      let register = currentUser["Registro"];
      let user_type = currentUser["Tipo de Usuário"];
      let name = currentUser["Nome"];
      let course_name = currentUser["Curso"];
      let email = currentUser["E-mail"];
      let phone_number = currentUser["Telefone"];
      let status = currentUser["Status"];

      if (!register) {
        usersError.push({
          name: name,
          error: "Registro não pode ser vazio!",
        });

        continue;
      }

      let validUserTypes = ["Administrador", "Professor", "Estudante"];
      let verifyUserType = validUserTypes.includes(user_type);
      if (!user_type || !verifyUserType) {
        usersError.push({
          name: name,
          error: "Tipo de usuário inválido!",
        });

        continue;
      }

      if (!name) {
        usersError.push({
          error: "Nome não pode ser vazio!",
        });

        continue;
      }

      if (!course_name & (user_type != "Administrador")) {
        usersError.push({
          name: name,
          error: "Curso não pode ser vazio!",
        });

        continue;
      }

      let course = null;
      if (course_name) {
        course = await Courses.findOne({ name: course_name }).exec();

        if (course == null) {
          usersError.push({
            name: name,
            error: "Curso não encontrado!",
          });

          continue;
        }
      }

      if (email) {
        let filter = { $or: [{ email: email }, { register: register }] };
        let verifyUser = await Users.findOne(filter).exec();

        if (verifyUser != null) {
          usersError.push({
            name: name,
            error: "Email ou registro já em uso!",
          });

          continue;
        }
      } else if (await Users.findOne({ register: register }).exec()) {
        usersError.push({
          name: name,
          error: "Registro já em uso!",
        });
        continue;
      }

      usersToAdd.push({
        name: name.trim(),
        user_type: user_type,
        register: register.trim(),
        course_id: course ? course.id : null,
        email: email ? email.trim() : null,
        phone_number: phone_number ? phone_number.trim() : null,
        status: status,
        password: md5(register),
      });

      const data = {
        name: name,
        register: register,
        user_type: user_type,
        status: status,
        course_id: course ? course.id : null,
        course: course ? course.name : null,
        group_id: null,
        email: email,
        phone_number: phone_number,
        link: null,
        image: `${process.env.API_PATH}${process.env.USER_PROFILE_PICTURE_DEFAULT}`,
      };

      usersAdded.push(data);
    }

    await Users.insertMany(usersToAdd);

    deleteFile(csv.path);

    const arr = {
      status: "SUCCESS",
      message: "Usuários cadastrados com sucesso!",
      data: {
        successes: usersAdded,
        errors: usersError,
        insertedCount: usersAdded.length,
        errorsCount: usersError.length,
      },
    };

    return response.status(200).send(arr);
  } catch (error) {
    const arr = {
      status: "ERROR",
      message: "Erro de servidor, tente novamente mais tarde!",
      data: error,
    };
    return response.status(500).send(arr);
  }
}

/**
 *
 *
 * Funções DELETE
 *
 *
 */
export async function deleteOne(request, response) {
  const _id = request.params._id;

  try {
    if (!ObjectId.isValid(_id)) {
      const arr = {
        status: "ERROR",
        message: "Identificador do usuário inválido!",
        data: { _id: _id },
      };

      return response.status(400).send(arr);
    }

    const user = await Users.findById(_id).exec();
    const data = await Users.findByIdPopulate(_id);

    if (user == null) {
      const arr = {
        status: "ERROR",
        message: "Usuário não encontrado!",
        data: { _id: _id },
      };

      return response.status(404).send(arr);
    }

    if (user._id.equals(request.userLogged._id)) {
      const arr = {
        status: "ERROR",
        message: "Você não pode excluir a si mesmo!",
      };

      return response.status(403).send(arr);
    }

    if (user.group_id == null) {
      if (fs.existsSync(user.image)) {
        fs.unlink(user.image, (error) => {});
      }

      const result = await Users.findByIdAndDelete(_id).exec();
      const arr = {
        status: "SUCCESS",
        message: "Usuário excluído com sucesso!",
        data: data,
      };

      return response.status(200).send(arr);
    }

    const group = await Groups.findById(user.group_id).exec();
    const students = group.students;

    if (students.length == 1) {
      deleteFile(user.image)
      
      await Groups.findByIdAndDelete(user.group_id).exec();
      const result = await Users.findByIdAndDelete(_id).exec();
      const arr = {
        status: "SUCCESS",
        message: "Usuário foi excluído com sucesso!",
        data: data,
      };

      return response.status(200).send(arr);
    }

    let newStudents = [];
    for (let student of students) {
      if (!student.equals(user._id)) {
        newStudents.push(student);
      }
    }

    group.students = newStudents;
    await group.save();

    if (fs.existsSync(user.image)) {
      fs.unlink(user.image, (erro) => {});
    }

    const result = await Users.findByIdAndDelete(_id).exec();
    const arr = {
      status: "SUCCESS",
      message: "Usuário excluído com sucesso!",
      data: data,
    };

    return response.status(200).send(arr);
  } catch (error) {
    const arr = {
      status: "ERROR",
      message: "Erro de servidor, tente novamente mais tarde!",
      data: error,
    };
    return response.status(500).send(arr);
  }
}

export async function deleteMany(request, response) {
  const _id_list = request.body;
  try {
    if (_id_list.includes(request.userLogged._id.toString())) {
      const arr = {
        status: "ERROR",
        message: "Você não pode excuir a si mesmo!",
      };
      return response.status(403).send(arr);
    }

    let deletedCount = 0;
    let deletedUsers = [];

    for (let _id of _id_list) {
      if (ObjectId.isValid(_id)) {
        let user = await Users.findByIdPopulate(_id);

        if (user.group_id != null) {
          let group = await Groups.findById(user.group_id).exec();

          let students = group.students;
          let newStudents = [];
          for (let student of students) {
            if (!student.equals(user._id)) {
              newStudents.push(student);
            }
          }

          group.students = newStudents;
          await group.save();
        }

        if (user) {
          let result = await Users.findByIdAndDelete(_id).exec();
          deletedCount += 1;
          deletedUsers.push(user);
        }
      }
    }

    const data = {
      deletedCount: deletedCount,
      deletedUsers: deletedUsers,
    };
    const arr = {
      status: "SUCCESS",
      message: "Usuário excluídos com sucesso!",
      data: data,
    };

    return response.status(200).send(arr);
  } catch (error) {
    const arr = {
      status: "ERROR",
      message: "Erro de servidor, tente novamente mais tarde!",
      data: error,
    };
    return response.status(500).send(arr);
  }
}

/**
 *
 *
 * Funções PATCH
 *
 *
 */
export async function updateOne(request, response) {
  const _id = request.params._id;
  const phone_number = request.body.phone_number;
  const link = request.body.link;
  const email = request.body.email;

  const userLogged = request.userLogged;
  try {
    if (!ObjectId.isValid(_id)) {
      const arr = {
        status: "ERROR",
        message: "Identificador do usuário inválido!",
        data: { _id: _id },
      };
      return response.status(400).send(arr);
    }

    const user = await Users.findById(_id).exec();

    if (user == null) {
      const arr = {
        status: "ERROR",
        message: "Usuário não encontrado!",
        data: { _id: _id },
      };
      return response.status(404).send(arr);
    }

    if (!user._id.equals(userLogged._id)) {
      const arr = {
        status: "ERROR",
        message: "Você não pode atualizar outro usuário!",
      };
      return response.status(403).send(arr);
    }

    if (phone_number) {
      user.phone_number = phone_number.trim();
    }

    if (link) {
      user.link = link.trim();
    }

    if (email) {
      const verifyEmail = await Users.findOne({ email: email }).exec();

      if (verifyEmail) {
        if (!verifyEmail._id.equals(user._id)) {
          const arr = {
            status: "ERROR",
            message: "Email já em uso!",
            data: { email: email },
          };
          return response.status(409).send(arr);
        }
      }

      user.email = email.trim();
    }

    await user.save();

    const result = await Users.findByIdPopulate(_id);

    const arr = {
      status: "SUCCESS",
      message: "Usuário atualizado com sucesso!",
      data: result,
    };

    return response.status(200).send(arr);
  } catch (error) {
    const arr = {
      status: "ERROR",
      message: "Erro de servidor, tente novamente mais tarde!",
      data: error,
    };

    return response.status(500).send(arr);
  }
}

export async function updatePassword(request, response) {
  const _id = request.params._id;
  const password = request.body.password;
  const newPassword = request.body.newPassword;
  const userLogged = request.userLogged;

  try {
    if (!ObjectId.isValid(_id)) {
      const arr = {
        status: "ERROR",
        message: "Identificador do usuário inválido!",
        data: { _id: _id },
      };

      return response.status(400).send(arr);
    }

    const user = await Users.findById(_id).exec();

    if (user == null) {
      const arr = {
        status: "ERROR",
        message: "Usuário não encontrado!",
        data: { _id: _id },
      };

      return response.status(404).send(arr);
    }

    if (!user._id.equals(userLogged._id)) {
      const arr = {
        status: "ERROR",
        message: "Você não pode atualizar a senha de outro usuário!",
      };

      return response.status(403).send(arr);
    }

    const newPasswordMd5 = md5(newPassword);
    const passwordMd5 = md5(password);

    if (user.password != passwordMd5) {
      const arr = {
        status: "ERROR",
        message: "Senha incorreta!",
      };
      return response.status(401).send(arr);
    }

    user.password = newPasswordMd5;

    await user.save();
    const result = await Users.findByIdPopulate(_id);

    const arr = {
      status: "SUCCESS",
      message: "Senha atualizada com sucesso!",
      data: result,
    };

    return response.status(200).send(arr);
  } catch (error) {
    const arr = {
      status: "ERROR",
      message: "Erro de servidor, tente novamente mais tarde!",
      data: error,
    };

    return response.status(500).send(arr);
  }
}

export async function updateStatus(request, response) {
  const _id_list = request.body;
  const status = request.params.status;

  try {
    let updatedCount = 0;
    let updatedUsers = [];

    for (let _id of _id_list) {
      if (ObjectId.isValid(_id)) {
        let result = await Users.updateOne(
          { _id: _id },
          { $set: { status: status } }
        ).exec();

        if (result.modifiedCount == 1) {
          let user = await Users.findByIdPopulate(_id);
          updatedCount += 1;
          updatedUsers.push(user);
        }
      }
    }

    const data = {
      updatedCount: updatedCount,
      updatedUsers: updatedUsers,
    };
    const arr = {
      status: "SUCCESS",
      message: "Usuários atualizados com sucesso!",
      data: data,
    };

    return response.status(200).send(arr);
  } catch (error) {
    const arr = {
      status: "ERROR",
      message: "Erro de servidor, tente novamente mais tarde!",
      data: error,
    };

    return response.status(500).send(arr);
  }
}

export async function updateAdmin(request, response) {
  const _id = request.params._id;

  const name = request.body.name;
  const email = request.body.email;
  const register = request.body.register;
  const phone_number = request.body.phone_number;
  const link = request.body.link;
  const user_type = request.body.user_type;
  const status = request.body.status;
  const course_id = request.body.course_id;

  try {
    if (!ObjectId.isValid(_id)) {
      const arr = {
        status: "ERROR",
        message: "Identificador do usuário inválido!",
        data: { _id: _id },
      };
      return response.status(400).send(arr);
    }

    const user = await Users.findById(_id).exec();

    if (user == null) {
      const arr = {
        status: "ERROR",
        message: "Usuário não encontrado!",
        data: { _id: _id },
      };
      return response.status(404).send(arr);
    }

    if (name) {
      user.name = name.trim();
    }

    if (phone_number) {
      user.phone_number = phone_number.trim();
    }

    if (link) {
      user.link = link.trim();
    }

    if (status) {
      user.status = status.trim();
    }

    if (user_type) {
      if (!["Estudante", "Professor", "Administrador"].includes(user_type)) {
        const arr = {
          status: "ERROR",
          message: "Tipo de usuário inválido!",
          data: { user_type: user_type },
        };
        return response.status(400).send(arr);
      }

      user.user_type = user_type;
    }

    if (email) {
      const verifyEmail = await Users.findOne({ email: email }).exec();

      if (verifyEmail) {
        if (!user._id.equals(verifyEmail._id)) {
          const arr = {
            status: "ERROR",
            message: "Email já em uso!",
            data: { email: email },
          };

          return response.status(409).send(arr);
        }
      }

      user.email = email.trim();
    }

    if (register) {
      const verifyRegister = await Users.findOne({ register: register }).exec();

      if (verifyRegister) {
        if (!user._id.equals(verifyRegister._id)) {
          const arr = {
            status: "ERROR",
            message: "Registro já em uso!",
            data: { register: register },
          };
          return response.status(409).send(arr);
        }
      }

      user.register = register.trim();
    }

    if (course_id) {
      if (
        course_id == "N/A" &&
        (user.user_type == "Administrador" || user_type == "Administrador")
      ) {
        user.course_id = null;
      } else {
        if (!ObjectId.isValid(course_id)) {
          const arr = {
            status: "ERROR",
            message: "Identificador do curso inválido!",
            data: { course_id: course_id },
          };

          return response.status(400).send(arr);
        }

        const course = await Courses.findById(course_id).exec();

        if (course == null) {
          const arr = {
            status: "ERROR",
            message: "Curso não encontrado!",
            data: { course_id: course_id },
          };

          return response.status(404).send(arr);
        }
        user.course_id = course_id;
      }
    }

    await user.save();

    const result = await Users.findByIdPopulate(_id);

    const arr = {
      status: "SUCCESS",
      message: "Usuário atualizado com sucesso!",
      data: result,
    };

    return response.status(200).send(arr);
  } catch (error) {
    const arr = {
      status: "ERROR",
      message: "Erro de servidor, tente novamente mais tarde!",
      data: error,
    };
    return response.status(500).send(arr);
  }
}

export async function updateImage(request, response) {
  const _id = request.params._id;
  try {
    const image = request.file;
    if (!image) {
      const arr = {
        status: "ERROR",
        message: "Imagem não enviada!",
      };

      return response.status(400).send(arr);
    }

    if (!ObjectId.isValid(_id)) {
      const arr = {
        status: "ERROR",
        message: "Identificador do usuário inválido!",
        data: { _id: _id },
      };

      return response.status(400).send(arr);
    }

    const user = await Users.findById(_id).exec();

    if (user == null) {
      const arr = {
        status: "ERROR",
        message: "Usuário não existe!",
      };

      return response.status(404).send(arr);
    }

    const mimeImage = image.mimetype;
    const typeImage = mimeImage.split("/")[1];

    const newPath = `uploads/users_images/${user.id}.${typeImage}`;

    const validTypes = ["jpg", "jpeg", "png", "webp"];
    const maxSize = 1024 * 1024 * 10; // 10 mb

    const validateResult = validateFile(image, validTypes, maxSize);
    if (validateResult.status == false) {
      deleteFile(image.path);

      const arr = {
        status: "ERROR",
        message: validateResult.message,
      };
      return response.status(400).send(arr);
    }

    const renameResult = renameFile(image.path, newPath);
    if (renameResult.status == false) {
      deleteFile(image.path);

      const arr = {
        status: "ERROR",
        message: renameResult.message,
      };

      return response.status(500).send(arr);
    }

    user.image = newPath;
    await user.save();

    const data = await Users.findByIdPopulate(_id);

    const arr = {
      status: "SUCCESS",
      message: "Imagem cadastrada com sucesso!",
      data: data,
    };

    return response.status(200).send(arr);
  } catch (error) {
    const arr = {
      status: "ERROR",
      message: "Erro de servidor, tente novamente mais tarde!",
      data: error,
    };

    return response.status(500).send(arr);
  }
}
