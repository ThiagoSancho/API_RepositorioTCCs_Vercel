const nodemailer = require("nodemailer");
const { htmlEmail, htmlInviteMessage } = require("./htmlModels.js");

async function sendEmail(message, dest, subject) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
    debug: false,
    logger: true,
  });

  const html = htmlEmail(message);

  const result = await transporter.sendMail({
    from: "Repositório TCC´s Univap Centro <repositoriotccsunivap@yahoo.com>",
    to: dest,
    subject: subject,
    html: html,
  });

  return result;
}

async function sendGroupInvites(
  students,
  groupTitle,
  groupLeader,
  groupId
) {
  try {
    for (let student of students) {
      let message = htmlInviteMessage(
        groupTitle,
        groupLeader,
        groupId,
        student.id
      );

      await sendEmail(message, student.email, "Convite de Grupo!");
    }
    return true;
  } catch (error) {
    return error;
  }
}

module.exports = { sendEmail, sendGroupInvites };
