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
      console.log(
        "Login attempt with username:",
        credentials.username
      );

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

      console.log(
        "Sending login request to Firebase"
      );

      console.log(loginData);

      // Call the Firebase function
      const response = await login(loginData);

      // Check if we got a response
      if (!response || !response.data) {
        console.error(
          "No response data from login function"
        );
        throw new Error(
          "Login failed: No response from server"
        );
      }

      // Extract the token
      const token = response.data as string;
      console.log(
        "Received token from server:",
        token ? "Token received" : "No token"
      );

      if (!token) {
        throw new Error(
          "Login failed: No token received"
        );
      }

      // Dispatch the login action
      console.log(
        "Dispatching login action to store"
      );
      authStore.dispatch({
        type: AuthActionType.Login,
        payload: { token },
      });

      console.log("Login successful");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  public async logout(): Promise<void> {
    try {
      console.log(
        "AdminService: Logging out user"
      );

      // Dispatch the logout action to clear the auth state
      authStore.dispatch({
        type: AuthActionType.Logout,
      });

      console.log(
        "AdminService: Logout successful"
      );
    } catch (error) {
      console.error(
        "AdminService: Logout error:",
        error
      );
      throw error;
    }
  }
}

const adminService = new AdminService();
export default adminService;
