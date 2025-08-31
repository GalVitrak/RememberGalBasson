import CredentialsModel from "../Models/CredentialsModel";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase-config";
import cyber from "../Utils/cyber";
import { AuthActionType } from "../Context/AuthState";
import { authStore } from "../Context/AuthState";
import { EventType } from "firebase/database";

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

  public async addEventType(
    eventType: EventType
  ): Promise<void> {
    try {
      console.log(
        "Adding event type:",
        eventType
      );
      const addEventType = httpsCallable(
        functions,
        "addEventType"
      );
      const response = await addEventType({
        eventType,
      });
      console.log(response.data);
    } catch (error) {
      console.error(
        "Error adding event type:",
        error
      );
      throw error;
    }
  }

  public async addForbiddenWords(
    words: string[]
  ): Promise<{
    message: string;
    addedWords: number;
    words: string[];
  }> {
    try {
      console.log(
        "Adding forbidden words:",
        words
      );

      const addForbiddenWords = httpsCallable(
        functions,
        "addForbiddenWords"
      );

      const response = await addForbiddenWords({
        words,
      });

      console.log(
        "Forbidden words added successfully:",
        response.data
      );

      return response.data as {
        message: string;
        addedWords: number;
        words: string[];
      };
    } catch (error) {
      console.error(
        "Error adding forbidden words:",
        error
      );
      throw error;
    }
  }

  public async addEvent(
    eventData: any
  ): Promise<void> {
    try {
      console.log("Adding event:", eventData);

      const addEvent = httpsCallable(
        functions,
        "addEvent"
      );

      const response = await addEvent({
        event: eventData,
      });

      console.log(
        "Event added successfully:",
        response.data
      );
    } catch (error) {
      console.error("Error adding event:", error);
      throw error;
    }
  }

  public async addEventType(eventTypeData: {
    name: string;
    description: string;
    imageData: {
      fileName: string;
      mimeType: string;
      base64Data: string;
    };
  }): Promise<{
    success: boolean;
    message: string;
    id: string;
  }> {
    try {
      console.log(
        "Adding event type:",
        eventTypeData
      );

      const addEventType = httpsCallable(
        functions,
        "addEventType"
      );

      const response = await addEventType(
        eventTypeData
      );

      console.log(
        "Event type added successfully:",
        response.data
      );

      return response.data as {
        success: boolean;
        message: string;
        id: string;
      };
    } catch (error) {
      console.error(
        "Error adding event type:",
        error
      );
      throw error;
    }
  }
}

const adminService = new AdminService();
export { adminService };
export default adminService;
