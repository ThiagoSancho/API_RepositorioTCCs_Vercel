import jwt from "jsonwebtoken";

export default class JwtToken {
  constructor(secret_key) {
    this.secret_key = secret_key;
  }
  createToken(payload) {
    return jwt.sign(payload, this.secret_key);
  }
  validateToken(token_string) {
    try {
      const tokenArray = token_string.split(" ");
      if (tokenArray.length != 2 || tokenArray[0].toLowerCase() != "bearer") {
        return false;
      }

      const [schema, token] = tokenArray;
      const decoded = jwt.verify(token, this.secret_key, { complete: true });
      return {
        status: true,
        decoded: decoded,
      };
    } catch (error) {
      console.error("Ocorreu um erro ao verificar a chave de acesso!\n", error);
      return false;
    }
  }
}
