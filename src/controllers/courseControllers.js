const Courses = require("../models/courseSchema.js");
const { ObjectId } = require("mongodb");

/**
 * Funções GET
 */

async function getAll(request, response) {
  Courses.find()
    .exec()
    .then((resolve) => {
      const arr = {
        status: "SUCCESS",
        message: "Cursos recuperados com sucesso!",
        data: resolve,
      };
      return response.status(200).send(arr);
    })
    .catch((reject) => {
      const arr = {
        status: "ERROR",
        message: "Erro de servidor, tente novamente mais tarde!",
        data: reject,
      };
      return response.status(500).send(arr);
    });
}

async function getOne(request, response) {
  const _id = request.params._id;
  Courses.findById(_id)
    .exec()
    .then((resolve) => {
      if (resolve == null) {
        const arr = {
          status: "SUCCESS",
          message: "Curso não encontrado!",
        };
        return response.status(404).send(arr);
      }
      const arr = {
        status: "SUCCESS",
        message: "Curso recuperado com sucesso!",
        data: resolve,
      };
      return response.status(200).send(arr);
    })
    .catch((reject) => {
      const arr = {
        status: "ERROR",
        message: "Erro de servidor, tente novamente mais tarde!",
        data: reject,
      };
      return response.status(500).send(arr);
    });
}

/**
 * Função POST
 */

async function insertOne(request, response) {
  const course = new Courses({
    name: request.body.name.trim(),
    description: request.body.description.trim(),
    status: "0",
  });

  course
    .save()
    .then((resolve) => {
      const arr = {
        status: "SUCCESS",
        message: "Curso inserido com sucesso!",
        data: resolve,
      };
      return response.status(200).send(arr);
    })
    .catch((reject) => {
      const arr = {
        status: "ERROR",
        message: "Erro de servidor, tente novamente mais tarde!",
        data: reject,
      };
      return response.status(500).send(arr);
    });
}

/**
 * Função PUT
 */

async function updateOne(request, response) {
  const _id = request.params._id;
  const name = request.body.name;
  const description = request.body.description;
  const status = request.body.status;

  try {
    const course = await Courses.findById(_id).exec();

    if (course == null) {
      const arr = {
        status: "ERROR",
        message: "O curso não foi encontrado!",
      };
      return response.status(404).send(arr);
    }

    if (name) {
      course.name = name.trim();
    }
    if (description) {
      course.description = description.trim();
    }
    if (status) {
      course.status = status.trim();
    }

    const result = await course.save();

    const arr = {
      status: "SUCCESS",
      message: "Curso atualizado com sucesso!",
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
 * Funções DELETE
 */
async function deleteOne(request, response) {
  const _id = request.params._id;

  Courses.findByIdAndDelete(_id)
    .exec()
    .then((resolve) => {
      const arr = {
        status: "SUCCESS",
        message: "Curso excluído com sucesso!",
        data: resolve,
      };
      return response.status(200).send(arr);
    })
    .catch((reject) => {
      const arr = {
        status: "ERROR",
        message: "Erro de servidor, tente novamente mais tarde!",
        data: reject,
      };
      return response.status(500).send(arr);
    });
}

async function deleteMany(request, response) {
  const _idListString = request.body;
  let _idList = [];

  try {
    for (let _id of _idListString) {
      if (ObjectId.isValid(_id)) {
        let objectId = ObjectId.createFromHexString(_id);

        _idList.push(new ObjectId(objectId));
      }
    }

    const result = await Courses.deleteMany({ _id: { $in: _idList } }).exec();

    const data = {
      deletedCount: result.deletedCount,
    };

    const arr = {
      status: "SUCCESS",
      message: "Cursos excluídos com sucesso!",
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

module.exports = {
  getAll,
  getOne,
  insertOne,
  updateOne,
  deleteOne,
  deleteMany
};
