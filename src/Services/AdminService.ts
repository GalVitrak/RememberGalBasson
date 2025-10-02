import CredentialsModel from "../Models/CredentialsModel";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase-config";
import cyber from "../Utils/cyber";
import { AuthActionType } from "../Context/AuthState";
import { authStore } from "../Context/AuthState";

class AdminService {
  public async login(
    credentials: CredentialsModel
  ): Promise<void> {
    try {
      // Get the Firebase function
      const login = httpsCallable(
        functions,
        "login"
      );

      // Hash the password
      const hashedPassword = await cyber.hash(
        credentials.password
      );
      if (!hashedPassword)
        throw new Error("Cannot hash password");

      // Create a copy of credentials with the hashed password
      const loginData = {
        username: credentials.username,
        password: hashedPassword,
      };

      // Call the Firebase function
      const response = await login(loginData);

      // Check if we got a response
      if (!response || !response.data) {
        throw new Error(
          "Login failed: No response from server"
        );
      }

      // Extract the token
      const token = response.data;

      if (!token) {
        throw new Error(
          "Login failed: No token received"
        );
      }

      // Dispatch the login action
      authStore.dispatch({
        type: AuthActionType.Login,
        payload: { token },
      });
    } catch (error) {
      throw error;
    }
  }

  public async logout(): Promise<void> {
    try {
      // Dispatch the logout action to clear the auth state
      authStore.dispatch({
        type: AuthActionType.Logout,
      });
    } catch (error) {
      throw error;
    }
  }

  public async approveCandle(
    candleId: string,
    action: "approve" | "reject",
    deleteCandle: boolean = false
  ): Promise<any> {
    try {
      const approveCandle = httpsCallable(
        functions,
        "approveCandle"
      );

      const result = await approveCandle({
        candleId,
        action,
        deleteCandle,
      });

      return result.data;
    } catch (error) {
      throw error;
    }
  }

  public async deleteForbiddenWord(
    wordId: string
  ): Promise<any> {
    try {
      const deleteForbiddenWord = httpsCallable(
        functions,
        "deleteForbiddenWord"
      );

      const result = await deleteForbiddenWord({
        wordId,
      });

      return result.data;
    } catch (error) {
      throw error;
    }
  }
}

const adminService = new AdminService();
export { adminService };
export default adminService;
