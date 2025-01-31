# API Repositório TCC's

O Repositório de TCC's (Trabalhos de Conclusão de Cursos) é uma ferramenta criada para armazenar, gerenciar e publicar TCC's feitos em uma instituição de ensino. A ferramenta tem o objetivo de ajudar a instituição a organizar de maneira eficiente os Trabalhos de Conclusão de Cursos e ainda poder disponibiliza-los na Web para a consulta de outros pesquisadores.

A API do repositório tem como função poder disponibilizar esse sistema a diversas instituições que estejam interessadas, dando a flexibilidade de cada uma utilizar as ferramentas da forma desejada com a interface que escolherem.

O sistema foi planejado de forma que, dentro da instituição existam vários cursos nos quais podem estar ligados aos TCC's, admnistradores que poderão manter todas as partes do sistema, professores orientadores que terão acesso aos TCC's nos quais são resposáveis, alunos que poderão criar um TCC no qual poderão editar e atribuir arquivos da sua escolha.

Todas essas ferramentas e muitas outras estão disponíveis por meio das rotas da API, que podem ser executadas a partir de uma requisição de uma plataforma criada pela própria instituição que deseja aplicar o sistema.

A API e suas ferramentas ainda estão em fase de desenvolvimento e muitas outras funcionalidades serão adicionadas, além da mudança das ferramentas já existentes.

## API
A API foi criada totalmente em JavaScript, no modelo MVC (model, view, control), sendo executado no Node.js e para o gerenciamento das rotas foi usado o framework do Express.

Para armazenagem de dados foi se usado o MongoDB e para realizar as requisições com o banco de dados foi utilizado a biblioteca Mongoose.

Por fim, as rotas da API foram confeccionadas no padrão Rest para que se tenha um controle padronizado quanto a consumação das requisições.

## Vercel
Para fins de testes, a API foi colocada em produção no Vercel, um website criado para desenvolvedores colocarem seu sistema (como API's e Websites) de forma online. Como o Vercel oferece um dominio gratuito, foi se utilizado ele testes do sistema online.

Abaixo está a rota o link da rota da API no Vercel:

    https://api-repositorio-tcc-s-vercel.vercel.app/

O Vercel também exige um arquivo de configuração localizado na raiz do projeto dominado como vercel.json. Esse arquivo serve para dizer ao sistema do Vercel qual arquivo executar e direcionar as rotas. 

## Rotas
Por usar o padrão Rest, a API utiliza os principais verbos de requisição: GET, POST, DELETE, PUT, PATCH.

### Rotas de cursos
|Verbo|Rota|Descrição|
|:---:|:--:|:-------:|
| GET |/repository/courses| Retorna todos os cursos.|
| GET |/repository/courses/:_id | Filtro de curso por Id.|
| POST|/repository/courses|Adiciona um grupo.|
| DELETE|/repository/courses/:_id| Exclui um curso.|
|DELETE|/repository/courses|Exclui vários cursos.|
|PUT|/repository/courses/:_id|Atualiza um curso.|

### Rotas de usuários
|Verbo|Rota|Descrição|
|:---:|:--:|:-------:|
|GET|/repository/users|Retorna todos os usuários dos sistema.
|GET|/repository/users/:_id| Filtro de usuário por Id.|
|POST|/repository/users| Adiciona um usuário.|
|POST|/repository/users/login|Faz o login do usuário gerando um token para autenticação.|
|POST|/repository/users/csv| Adiciona vários usuários por meio de um arquivo CSV.|
|DELETE|/repository/users/:_id| Exclui um  usuário.
|DELETE|/repository/users|Exclui vários usuários.|
|PATCH|/repository/users/:_id|Atualiza o usuário.|
|PATCH|/repository/users/password/:_id| Atualiza a senha do usuário.|
|PATCH|/repository/users/status/:status| Atualiza o status de vário usuários.|
|PATCH|/repository/users/image/:_id| Atualiza a imagem do usuário.|
|PUT|/repository/users/:_id| Atualiza todos os dados de qualquer usuário.|

### Rotas de grupos
|Verbo|Rota|Descrição|
|:---:|:--:|:-------:|
|GET|/repository/groups| Retorna todos os grupos.|
|GET| /repository/groups/:_id| Filtro de curso por Id.|
|POST|/repository/groups| Adiciona um grupo.|
|POST|/repository/groups/administrator| Permite a um administrador a adicionar um grupo.|
|POST|/repository/groups/invite/:_id| Envia um convite de grupo a um estudante.|
|DELETE|/repository/groups/:_id| Exclui um grupo.|
|DELETE|/repository/groups|Exclui vários grupos.|
|PATCH|/repository/groups/leave/:group_id| Permite a um estudante sair de um grupo.|
|PATCH| /repository/groups/accept| Permite a um estudante aceitar o convite de um grupo.|
|PATCH|/repository/groups/update/status/:stauts| Atualiza o status de vários grupos.|
|PUT| /repository/groups/:_id| Permite um professor atualizar o grupo.|

### Parâmetros, body e autenticação das rotas
Algumas rotas listadas acima não precisam de nenhum parâmetro, nenhum body ou até mesmo autenticação de token. Entretanto, muitas delas, por tratarem de dados sensíveis, possuem autenticações especiais que só podem ser garantidas pelo token gerado pelo sistema ao fazer login. Em contrapartida, outras rotas só precisam de parâmetros especiais como "_id", ou algum conteúdo em seu "body" para funcionar corretamente e obter-se  o resultado esperado.

#### Rotas GET (para requisições de apenas um documento):

    /repository/courses/:_id

    /repository/users/:_id

    /repository/groups/:_id
    
O parâmetro _id das rotas acima se refere ao indentificador único do documento que será acessado. O _id é gerado pelo próprio MongoDB, ou seja, é necessário fornecer uma string válida para conversão em um ObjectId.

Possíveis status:
* 200 (OK): O documento será retornado.
* 400 (BAD REQUEST): O _id fornecido é inválido.
    * Verifique se a String fornecida pertence a um ObjectId.
* 404 (NOT FOUND): O _id não foi encontrado no banco de dados.
    * Verifique se o _id existe no banco de dados.
* 500 (INTERNAL SERVER ERROR): Erro de servidor.

#### Rota POST (para login):
A rota de login de usuário é crucial para o funcionamento das outras rotas pois gerará um Token que serve para autenticar o usuário que está fazendo a requisição. Como muitas rotas fazem alterações em dados sensíveis no banco de dados, a autenticação é crucial para garantir que apenas pessoas autorizadas tenham acesso ao sistema.
    
    /repository/users/login

Body:{<br>
    "register": "registro ou Email",<br>
    "password": "senhaUsuario"<br>
}

register : String -> O registro único cadastrado no sistema do usuário ou o email.<br>
password : String -> A senha do usuário.

Possíveis  status:
* 200 (OK): Será retornado o token do usuário juntamente com suas informações.
* 401 (UNAUTHORIZED): Senha ou email do usuário errado(s).
    * Verifique se a senha está correta.
    * Verifique se o email está correto.
* 500 (INTERNAL SERVER ERROR): Erro de servidor.
    
#### Rotas POST (para inserção de documentos):
    
A maioria das rotas POST possuem propósito de inserção de novos documentos. Nesses casos, todas elas precisarão de um token criado pelo sistema ao efetuar o login. É importante ressaltar que professores, administradores e estudantes possuem tokens com permissões diferentes, o que é checado na requisição também. 

Inserir um curso:

    /repository/courses
    
* Authorization: Token administrador

 Body: {<br>
 "name": "nomeCurso", <br>
 "description": "descriçãCurso",<br> 
 "status": "statusCurso" <br>
}

name : String ->  Nome do curso.<br>
description : String -> Breve resumo do curso.<br>
status : String | Int ->  Status do curso; 0: Inativo, 1: Ativo.

<br><br>
Inserir um usuário:


    /repository/users
* Authorization: Token administrador

Body:{<br>
    "name": "nomeUsuário",<br>
    "register": "registroUsuário",<br>
    "email": "emailUsuário",<br>
    "course_id": "idCurso",<br>
    "phone_number": "telefoneUsuário",<br>
    "link": "linkUsuário",<br>
    "user_type": "tipoUsuário"<br>
}

name : String -> Nome do usuário. <br>
register : String -> Identificador único da instituição do usuário.<br>
email: String -> Email do usuário.<br>
course_id : String -> Uma string valida de um ObjectId de um curso cadastrado no sistema; Opcional.<br>
phone_number : String -> Número de telefone do usuário; Opcional. <br>
link : String -> Um link para alguma rede social do usuário (ex: GitHub); Opcional.<br>
user_type : String -> O tipo de usuário sendo cadastrado: "Estudante", "Professor", "Administrador".

<br><br>
Inserir um grupo:

    /repository/groups

* Authorization: Token administrador, professor ou estudante.

Body:{<br>
    "title": "títuloGrupo", <br>
    "course_id": "idCurso",<br>
    "supervisor_id": "idProfessor",<br>
    "leader_id": "idLíder",<br>
}

title : String -> Título do projeto do grupo.<br>
course_id : String -> Uma string válida de um ObjectId de um curso do sistema.<br>
supervisor_id : String -> String do ObjectId do orientador do grupo.<br>
leader_id : String -> String do ObjectId do líder do grupo.<br>

<br><br>
Inserir vários usuários:

    /repository/users/csv
* Authorization: Token administrador

Nessa rota, a API inseri vários usuários por meio de um arquivo CSV enviado pela requisição por meio de um Multipart Form que será lido pelo Multer.

O arquivo CSV precisa ter a seguinte estrutura:

|Registro|Tipo de Usuário|Nome|Curso|E-mail|Telefone|Status|
|:---:|:--:|:-------:|:---:|:---:|:---:|:---:|
|Registro único|Estudante,Professor,Administrador|Nome|Id curso|Email|Telefone|Status

<br><br>
Inserção de grupo, rota exclusiva para administrador ou professor:
    
    /repository/groups/administrator

A diferença dessa requisição para a outra de inserção de grupo, é a capacidade de o administrador ou professor poderem criar um grupo com todos os integrantes, enquanto o estudante terá que convidar os outros membros e esperar a aceitação do convite.

* Authorization: Token administrador ou professor.


Body:{<br>
    "title": "títuloGrupo", <br>
    "course_id": "idCurso",<br>
    "supervisor_id": "idProfessor",<br>
    "leader_id": "idLíder",<br>
    "students": ["arrayIds"]<br>
}


title : String -> Título do projeto do grupo.<br>
course_id : String -> Uma string válida de um ObjectId de um curso do sistema.<br>
supervisor_id : String -> String do ObjectId do orientador do grupo.<br>
leader_id : String -> String do ObjectId do líder do grupo.<br>
students : Array -> Array de string contendo os Ids dos estudantes.

Possíveis status:
* 200 (OK): O(s) documento(s) foi cadastrado(s).
* 400 (BAD REQUEST): Os dados possuem algum erro.
    * Verifique mensagem de erro para obter mais informações.
* 401 (UNAUTHORIZED): O servidor negou sua requisição devido as suas 
* 403 (FORBIDDEN): O servidor negou sua requisição porque os dados do Token e do usuário não são coerentes.
    * Esse erro ocorre quando as credenciais do Token não são iguais as cadastradas no banco de dados.
    * Tente fazer login novamente e refaça a requisição.
* 404 (NOT FOUND): Algum _id fornecido (como _id's de curso ou supervisor) não foi encontrado.
    * Verifique se o _id pertence a um documento existente no banco de dados.
* 409 (CONFLICT): Dados como email ou registro informados já existem no banco de dados.
    * Informe outro email e/ou registro. 
    * No caso da inserção de grupos, um estudante não pode estar em dois ou mais grupos ao mesmo tempo.
* 500 (INTERNAL SERVER ERROR): Erro de servidor.
