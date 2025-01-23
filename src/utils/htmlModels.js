function htmlEmail(message) {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4; 
    }
    .container {
      max-width: 600px;
      margin: auto;
      padding: 20px;
      background-color: #fff; 
      border-radius: 8px; 
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
    }
    .header {
      background-color: #007bff; 
      color: white;
      padding: 10px 0;
      text-align: center;
      border-top-left-radius: 8px; 
      border-top-right-radius: 8px;
    }
    .content {
      padding: 20px 0;
      color: #333; 
    }
    .footer {
      background-color: #007bff; 
      padding: 10px 0;
      text-align: center;
      border-bottom-left-radius: 8px; 
      border-bottom-right-radius: 8px;
    }
  </style>
  </head>
  <body>
  
  <div class="container">
    <div class="header">
      <h1>Repositório TCC's Univap Centro</h1>
    </div>
    <div class="content">
      ${message}
    </div>
    <div class="footer">
      
    </div>
  </div>
  
  </body>
  </html> `;
}

function htmlInviteMessage(groupTitle, groupLeader, groupId, studentId) {
  return `
      <br><p>Você foi convidado para participar de um grupo no Repositório de TCC's da Univap Centro!</p>
      <br>Dados do grupo:<br>
      Título: ${groupTitle}<br>
      Líder: ${groupLeader}<br>
      Para aceitar <a href= "${
        "http://localhost:5173/" +
        "authorization/group/" +
        groupId +
        "/user/" +
        studentId
      }">clique aqui</a> 
      `;
}

module.exports = { htmlEmail, htmlInviteMessage, ht };
