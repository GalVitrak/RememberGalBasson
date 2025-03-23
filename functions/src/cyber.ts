import * as jwt from "jsonwebtoken";
import { JWT } from "./config";
// // a function to generate a new Token
function getNewToken(user: {}): string {
  const container = { user };
  const options = { expiresIn: 31536000 }; // 1 year in seconds

  const token = jwt.sign(container, JWT, options);
  return token;
}

export default {
  getNewToken,
};
