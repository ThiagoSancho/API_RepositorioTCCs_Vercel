import Groups from "../models/groupSchema.js";
import Users from "../models/userSchema.js";
import Courses from "../models/courseSchema.js";
import Projects from "../models/projectSchema.js";
import { sendEmail, sendGroupInvites } from "../utils/emailManager.js";
import { htmlInviteMessage } from "../utils/htmlModels.js";
import { ObjectId } from "mongodb";
import { set } from "mongoose";
/**
 *
 *
 * Funções GET
 *
 *
 */
export async function getOne(request, response) {
  const _id = request.params._id;

  try {
    const group = await Groups.findByIdPopulate(_id);

    if (group == null) {
      const arr = {
        status: "ERROR",
        message: "Grupo não encontrado!",
      };
      return response.status(404).send(arr);
    }

    const arr = {
      status: "SUCCESS",
      message: "Grupo recuperado com sucesso!",
      data: group,
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

export async function getAll(request, response) {
  let query = {};

  try {
    const userLogged = request.userLogged;

    if (userLogged.user_type == "Professor") {
      query = { supervisor_id: userLogged._id };
    }

    const groups = await Groups.findAllPopulate(query);

    if (groups.length == 0) {
      const arr = {
        status: "ERROR",
        message: "Nenhum grupo foi encontrado!",
      };
      return response.status(404).send(arr);
    }

    const arr = {
      status: "SUCCESS",
      message: "Grupos recuperados com sucesso!",
      data: groups,
      count: groups.length,
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
export async function insertOne(request, response) {
  const leader_id = request.body.leader_id;
  const supervisor_id = request.body.supervisor_id;
  const title = request.body.title;
  const course_id = request.body.course_id;

  try {
    if (!ObjectId.isValid(leader_id)) {
      const arr = {
        status: "ERROR",
        message: "Identificação do líder inválida!",
        data: { leader_id: leader_id },
      };

      return response.status(400).send(arr);
    }

    if (!ObjectId.isValid(supervisor_id)) {
      const arr = {
        status: "ERROR",
        message: "Identificação do orientador inválida!",
        data: { supervisor_id: supervisor_id },
      };

      return response.status(400).send(arr);
    }

    if (!ObjectId.isValid(course_id)) {
      const arr = {
        status: "ERROR",
        message: "Identificação do curso inválida!",
        data: { course_id: course_id },
      };

      return response.status(400).send(arr);
    }

    const leader = await Users.findByIdPopulate(leader_id);

    if (leader == null) {
      const arr = {
        status: "ERROR",
        message: "Líder não encontrado!",
        data: { leader_id: leader_id },
      };

      return response.status(404).send(arr);
    }

    if (leader.group_id != null) {
      const arr = {
        status: "ERROR",
        message: "Líder já possui grupo!",
      };

      return response.status(409).send(arr);
    }

    const supervisor = await Users.findById(supervisor_id).exec();

    if (supervisor == null) {
      const arr = {
        status: "ERROR",
        message: "Orientador não encontrado!",
        data: { supervisor_id: supervisor_id },
      };

      return response.status(404).send(arr);
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

    if (!title) {
      const arr = {
        status: "ERROR",
        message: "Título não poder vazio!",
      };

      return response.status(400).send(arr);
    }

    const group = new Groups({
      title: title.trim(),
      supervisor_id: supervisor.id,
      leader_id: leader.id,
      course_id: course.id,
      students: [leader._id],
      status: "0",
      project_id: null,
    });

    const result = await group.save();

    await Users.updateOne(
      { _id: leader._id },
      { $set: { group_id: result._id } }
    );

    //const data = await Groups.findByIdPopulate(result.id);

    const data = {
      _id: result._id,
      title: result.title,

      students: [
        {
          _id: leader._id,
          name: leader.name,
          register: leader.register,
          email: leader.email,
          link: leader.link,
          image: leader.image,
        },
      ],

      course_id: course._id,
      course: course.name,

      supervisor_id: supervisor._id,
      supervisor: supervisor.name,

      leader_id: leader._id,
      leader: leader.name,

      status: group.status,
      project: null,
    };
    const arr = {
      status: "SUCCESS",
      message: "Grupo inserido com sucesso!",
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

export async function insertOneAdmin(request, response) {
  const students = request.body.students;
  const leader_id = request.body.leader_id;
  const supervisor_id = request.body.supervisor_id;
  const course_id = request.body.course_id;
  const title = request.body.title;

  try {
    if (!title) {
      const arr = {
        status: "ERROR",
        message: "Título não pode ser vazio!",
      };

      return response.status(400).send(arr);
    }

    if (!ObjectId.isValid(leader_id)) {
      const arr = {
        status: "ERROR",
        message: "Identificação do líder inválida!",
        data: { leader_id: leader_id },
      };

      return response.status(400).send(arr);
    }

    if (!ObjectId.isValid(supervisor_id)) {
      const arr = {
        status: "ERROR",
        message: "Identificação do orientador inválida!",
        data: { supervisor_id: supervisor_id },
      };

      return response.status(400).send(arr);
    }

    if (!ObjectId.isValid(course_id)) {
      const arr = {
        status: "ERROR",
        message: "Identificação do curso inválida!",
        data: { course_id: course_id },
      };

      return response.status(400).send(arr);
    }

    const leader = await Users.findById(leader_id).exec();

    if (leader == null) {
      const arr = {
        status: "ERROR",
        message: "Líder não encontrado!",
        data: { leader_id: leader_id },
      };

      return response.status(404).send(arr);
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

    const supervisor = await Users.findById(supervisor_id)
      .where("user_type")
      .equals("Professor")
      .exec();

    if (supervisor == null) {
      const arr = {
        status: "ERROR",
        message: "Orientador não encontrado!",
        data: { supervisor_id: supervisor_id },
      };

      return response.status(404).send(arr);
    }

    let studentsRegister = [];

    for (let student_id of students) {
      if (ObjectId.isValid(student_id)) {
        const student = await Users.findById(student_id)
          .where("user_type")
          .equals("Estudante")
          .exec();

        if (student == null) {
          const arr = {
            status: "ERROR",
            message: "Um ou mais alunos não foram encontrados!",
          };

          return response.status(404).send(arr);
        }

        if (student.group_id != null) {
          const arr = {
            status: "ERROR",
            message: `Aluno ${student.name} já inserido em um grupo!`,
          };

          return response.status(409).send(arr);
        }

        studentsRegister.push(student.register);
      } else {
        const arr = {
          status: "ERROR",
          message: "Um ou mais alunos não foram encontrados!",
        };

        return response.status(404).send(arr);
      }
    }

    const group = new Groups({
      title: title.trim(),
      leader_id: leader.id,
      supervisor_id: supervisor.id,
      course_id: course.id,
      students: students,
      status: "0",
      project_id: null,
    });

    const result = await group.save();

    await Users.updateMany(
      { register: { $in: studentsRegister } },
      { $set: { group_id: result.id } }
    );

    const data = await Groups.findByIdPopulate(result.id);
    const arr = {
      status: "SUCCESS",
      message: "Grupo adicionado com sucesso!",
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

export async function inviteStudents(request, response) {
  const _id = request.params._id;
  const studentsRegister = request.body;

  try {
    if (!ObjectId.isValid(_id)) {
      const arr = {
        status: "ERROR",
        message: "Identificação do grupo inválida!",
        data: { _id: _id },
      };

      return response.status(400).send(arr);
    }

    const group = await Groups.findByIdPopulate(_id);

    if (group == null) {
      const arr = {
        status: "ERROR",
        message: "Grupo não encontrado!",
        data: { _id: _id },
      };

      return response.status(404).send(arr);
    }

    const students = await Users.find({
      register: { $in: studentsRegister },
    }).exec();

    sendGroupInvites(students, group.title, group.leader, group._id.toString());

    const arr = {
      status: "SUCCESS",
      message: "Convites enviados com sucesso!",
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
        message: "Identificação do grupo inválida!",
        data: { _id: _id },
      };

      return response.status(400).send(arr);
    }

    const group = await Groups.findByIdPopulate(_id);

    if (group == null) {
      const arr = {
        status: "ERROR",
        message: "Grupo não encontrado!",
        data: { _id: _id },
      };

      return response.status(404).send(arr);
    }

    if (group.project != null) {
      await Projects.findByIdAndDelete(group.project._id).exec();
    }

    let studentsRegister = [];
    for (let student of group.students) {
      studentsRegister.push(student.register);
    }

    await Users.updateMany(
      { register: { $in: studentsRegister } },
      { $set: { group_id: null } }
    ).exec();

    const result = await Groups.deleteOne({ _id: group._id }).exec();
    const arr = {
      status: "SUCCESS",
      message: "Grupo excluído com sucesso!",
      data: group,
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
    let objectIdList = [];
    let studentsRegister = [];
    //let projectsIdList = [];

    for (let _id of _id_list) {
      if (!ObjectId.isValid(_id)) {
        continue;
      }

      let objectId = ObjectId.createFromHexString(_id);
      objectIdList.push(new ObjectId(objectId));
    }

    let groups = await Groups.findAllPopulate({ _id: { $in: objectIdList } });

    for (let group of groups) {
      let students = group.students;

      for (let student of students) {
        studentsRegister.push(student.register);
      }

      /*
      if (group.project != null) {
        projectsIdList.push(group.project._id);
      }
      */
    }

    await Users.updateMany(
      { register: { $in: studentsRegister } },
      { $set: { group_id: null } }
    ).exec();

    // Excluir projeto junto ?
    //await Projects.deleteMany({ _id: { $in: projectsIdList } }).exec();

    const result = await Groups.deleteMany({
      _id: { $in: objectIdList },
    }).exec();

    const data = {
      deletedCount: result.deletedCount,
      deletedGroups: groups,
    };

    const arr = {
      status: "SUCCESS",
      message: "Grupos excluídos com sucesso!",
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

export async function leaveGroup(request, response) {
  const group_id = request.params.group_id;
  const student_id = request.body.student_id;

  try {
    if (!ObjectId.isValid(group_id)) {
      const arr = {
        status: "ERROR",
        message: "Identificação do grupo inválida!",
        data: { _id: group_id },
      };

      return response.status(400).send(arr);
    }

    if (!ObjectId.isValid(student_id)) {
      const arr = {
        status: "ERROR",
        message: "Identificação do aluno inválida!",
        data: { _id: student_id },
      };

      return response.status(400).send(arr);
    }

    const student = await Users.findById(student_id).exec();
    if (student == null) {
      const arr = {
        status: "ERROR",
        message: "Estudante não encontrado!",
        data: { _id: student_id },
      };

      return response.status(404).send(arr);
    }

    const group = await Groups.findById(group_id).exec();
    if (group == null) {
      const arr = {
        status: "ERROR",
        message: "Grupo não encontrado!",
        data: { _id: group_id },
      };

      return response.status(404).send(arr);
    }

    if (group.students.length == 1) {
      await Projects.deleteOne({ group_id: group._id }).exec();
      await Groups.deleteOne({ _id: group._id }).exec();

      student.group_id = null;
      await student.save();

      const arr = {
        status: "SUCCESS",
        message: "Grupo excluído com sucesso!",
      };

      return response.status(200).send(arr);
    }

    let newStudents = [];
    for (let studentId of group.students) {
      if (!studentId.equals(student._id)) {
        newStudents.push(studentId);
      }
    }
    group.students = newStudents;

    if (student._id.equals(group.leader_id)) {
      group.leader_id = newStudents[0];
    }

    student.group_id = null;
    await student.save();
    await group.save();

    const arr = {
      status: "SUCCESS",
      message: "Você saiu do grupo!",
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

export async function acceptGroup(request, response) {
  const student_id = request.body.student_id;
  const group_id = request.body.group_id;

  try {
    if (!ObjectId.isValid(student_id)) {
      const arr = {
        status: "ERROR",
        message: "Identificação do estudante inválida!",
        data: { _id: student_id },
      };

      return response.status(400).send(arr);
    }

    if (!ObjectId.isValid(group_id)) {
      const arr = {
        status: "ERROR",
        message: "Identificação do grupo inválida!",
        data: { _id: group_id },
      };

      return response.status(400).send(arr);
    }

    const group = await Groups.findById(group_id).exec();
    if (group == null) {
      const arr = {
        status: "ERROR",
        message: "Grupo não encontrado!",
      };

      return response.status(404).send(arr);
    }

    const student = await Users.findById(student_id).exec();
    if (student == null) {
      const arr = {
        status: "ERROR",
        message: "Estudante não encontrado!",
      };

      return response.status(404).send(arr);
    }

    if (student.group_id != null) {
      const arr = {
        status: "ERROR",
        message: "Estudante já está em um grupo!",
      };

      return response.status(409).send(arr);
    }

    let newStudents = group.students;
    newStudents.push(student._id);

    group.students = newStudents;
    student.group_id = group._id;

    await group.save();
    await student.save();

    const arr = {
      status: "SUCCESS",
      message: "Você entrou no grupo!",
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
  const status = request.params.status;
  const _id_list = request.body;

  try {
    let updatedCount = 0;
    let updatedGroups = [];
    for (let _id of _id_list) {
      if (ObjectId.isValid(_id)) {
        let filter = { _id: _id };
        let queryUpdate = { $set: { status: status } };
        let result = await Groups.updateOne(filter, queryUpdate).exec();

        if (result.modifiedCount == 1) {
          let group = await Groups.findByIdPopulate(_id);
          updatedCount += 1;
          updatedGroups.push(group);
        }
      }
    }

    const data = {
      updatedCount: updatedCount,
      updatedGroups: updatedGroups,
    };

    const arr = {
      status: "SUCCESS",
      message: "Grupos atualizados com sucesso!",
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
 * Função PUT
 *
 *
 */

export async function update(request, response) {
  const _id = request.params._id;
  try {
    if (!ObjectId.isValid(_id)) {
      const arr = {
        status: "ERROR",
        message: "Identificação do grupo inválida!",
        data: { _id: _id },
      };

      return response.status(400).send(arr);
    }

    const group = await Groups.findById(_id).exec();

    if (group == null) {
      const arr = {
        status: "ERROR",
        message: "Grupo não encontrado!",
      };

      return response.status(404).send(arr);
    }

    const title = request.body.title;
    const course_id = request.body.course_id;
    const supervisor_id = request.body.supervisor_id;
    const status = request.body.status;
    const students = request.body.students;
    const leader_id = request.body.leader_id;

    if (title) {
      group.title = title.trim();
    }

    if (status) {
      group.status = status;
    }

    if (course_id) {
      if (!ObjectId.isValid(course_id)) {
        const arr = {
          status: "ERROR",
          message: "Identificação do curso inválida!",
          data: { _id: course_id },
        };

        return response.status(400).send(arr);
      }

      let verify = await Courses.findById(course_id).exec();
      if (verify == null) {
        const arr = {
          status: "ERROR",
          message: "Curso não encontrado!",
        };

        return response.status(404).send(arr);
      }

      group.course_id = course_id;
    }

    if (supervisor_id) {
      if (!ObjectId.isValid(supervisor_id)) {
        const arr = {
          status: "ERROR",
          message: "Identificação do orientador inválida!",
          data: { _id: supervisor_id },
        };

        return response.status(400).send(arr);
      }

      let verify = await Users.findById(supervisor_id).exec();
      if (verify == null) {
        const arr = {
          status: "ERROR",
          message: "Orientador não encotrado!",
        };

        return response.status(404).send(arr);
      }

      group.supervisor_id = supervisor_id;
    }

    let newStudents = [];
    if (students) {
      for (let student_id of students) {
        if (!ObjectId.isValid(student_id)) {
          const arr = {
            status: "ERROR",
            message: "Um ou mais estudantes não foram enccontrados!",
          };

          return response.status(404).send(arr);
        }

        let student = await Users.findById(student_id).exec();

        if (student == null) {
          const arr = {
            status: "ERROR",
            message: "Um ou mais estudantes não foram enccontrados!",
          };

          return response.status(404).send(arr);
        }

        if (student.group_id != null && !group._id.equals(student.group_id)) {
          const arr = {
            status: "ERROR",
            message: `Estudante ${student.name} já possui grupo!`,
          };

          return response.status(409).send(arr);
        }

        newStudents.push(student.id);
      }

      group.students = newStudents
    }

    if (leader_id) {
      if (!ObjectId.isValid(leader_id)) {
        const arr = {
          status: "ERROR",
          message: "Identificação do líder inválida!",
          data: { _id: leader_id },
        };

        return response.status(400).send(arr);
      }

      let verify = await Users.findById(leader_id).exec();

      if (verify == null) {
        const arr = {
          status: "ERROR",
          message: "Líder não encotrado!",
        };

        return response.status(404).send(arr);
      }

      if (verify.group_id != null && !group._id.equals(verify.group_id)) {
        const arr = {
          status: "ERROR",
          message: "Líder já possui groupo!",
        };

        return response.status(409).send(arr);
      }

      if (!newStudents.includes(leader_id)) {
        const arr = {
          status: "ERROR",
          message: "Líder não incluso no grupo!",
        };

        return response.status(400).send(arr);
      }

      group.leader_id = leader_id;
    }

    await group.save();

    const filter = { _id: { $in: newStudents } };
    const queryUpdate = { $set: { group_id: group._id } };
    await Users.updateMany(filter, queryUpdate).exec();
    const data = await Groups.findByIdPopulate(group.id);

    const arr = {
      status: "SUCCESS",
      message: "Grupo atualizado com sucesso!",
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
