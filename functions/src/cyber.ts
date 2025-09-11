import * as jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

dotenv.config();

const JWT = process.env.JWT_SECRET;

if (!JWT) {
  throw new Error(
    "JWT_SECRET environment variable is required"
  );
}
// // a function to generate a new Token
function getNewToken(user: {}): string {
  const container = { user };
  const options = { expiresIn: 31536000 }; // 1 year in seconds

  const token = jwt.sign(
    container,
    JWT as string,
    options
  );
  return token;
}

// Function to verify a token
function verifyToken(token: string): any {
  try {
    const decoded = jwt.verify(
      token,
      JWT as string
    );
    return decoded;
  } catch (error) {
    return null;
  }
}

export default {
  getNewToken,
  verifyToken,
};
