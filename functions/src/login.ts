import * as functions from "firebase-functions/v1";
import { db } from "./index";
import cyber from "./cyber";

const login = functions.https.onCall(
  async (data, context) => {
    const { username, password } = data;
    console.log(username, password);

    const user = await db
      .collection("admin")
      .where("username", "==", username)
      .where("password", "==", password)
      .get();
    if (user.empty) {
      throw new functions.https.HttpsError(
        "not-found",
        "User not found"
      );
    }
    const userData = user.docs[0].data();
    userData.password = undefined;
    const token = cyber.getNewToken(userData);
    return { token };
  }
);

export default login;
