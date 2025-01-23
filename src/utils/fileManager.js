const fs = require("fs");
const csv = require("csv-parser");

function validateFile(file, types, maxSize) {
  try {
    if (file.size > maxSize) {
      return {
        status: false,
        message: "Arquivo muito grande!",
      };
    }

    const fileMime = file.mimetype;
    const fileType = fileMime.split("/")[1];

    if (!types.includes(fileType)) {
      return {
        status: false,
        message: "Tipo de arquivo inválido!",
      };
    }

    return {
      status: true,
      message: null,
    };
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
}

function renameFile(oldPath, newPath) {
  try {
    fs.renameSync(oldPath, newPath);
    return {
      status: true,
      message: "Arquivo renomeado com sucesso!",
    };
  } catch (error) {
    return {
      status: false,
      message: error.message,
    };
  }
}

function deleteFile(path) {
  try {
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);

      return {
        status: true,
        message: "Arquivo excluído com sucesso!",
      };
    }

    return {
      status: true,
      message: "Arquivo não existe",
    };
  } catch (error) {
    return {
      status: false,
      message: "Ocorreu um erro ao excluir o arquivo!",
    };
  }
}

function csvToArray(path, separator) {
  let results = [];
  const fileContent = fs.readFileSync(path, "utf8");

  const rows = fileContent.split("\n");
  const headers = rows[0].split(separator);

  for (let i = 1; i <= rows.length - 1; i++) {
    let row = rows[i].split(separator);
    let data = {};

    for (let j = 0; j <= headers.length - 1; j++) {
      data[headers[j].replace("\r", "")] = row[j] ? row[j].replace("\r", "") : null;
    }
    
    results.push(data);
  }

  return results;
}

module.exports = { validateFile, renameFile, deleteFile, csvToArray };
