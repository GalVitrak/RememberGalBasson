// import { jwtDecode } from "jwt-decode";
import { createStore } from "redux";

export enum AuthActionType {
  Login = "Login",
  Logout = "Logout",
  RefreshToken = "RefreshToken",
}

export interface AuthAction {
  type: AuthActionType;
  payload?: any;
}

// Key used for storing the token in localStorage
const TOKEN_STORAGE_KEY = "RememberToken";

export class AuthState {
  public token: string | null = null;
  public loggedIn: boolean = false;

  // Safe base64 decoding function that handles URL-safe base64
  private safeBase64Decode(
    base64Url: string
  ): string {
    try {
      // Replace non-base64 URL safe chars and add padding if needed
      const base64 = base64Url
        .replace(/-/g, "+")
        .replace(/_/g, "/");
      const padding = base64.length % 4;
      const paddedBase64 = padding
        ? base64 + "=".repeat(4 - padding)
        : base64;

      return window.atob(paddedBase64);
    } catch (error) {
      console.error(
        "Base64 decoding error:",
        error
      );
      throw new Error("Invalid token format");
    }
  }

  public checkIfTokenExpired = (
    token: string
  ): boolean => {
    try {
      // Split the token and safely decode the payload
      const parts = token.split(".");
      if (parts.length !== 3) {
        console.error(
          "Invalid JWT format: token doesn't have 3 parts"
        );
        return true;
      }

      const decoded = JSON.parse(
        this.safeBase64Decode(parts[1])
      );
      const expiry = decoded.exp;

      if (!expiry) {
        console.warn("Token has no expiry claim");
        return false; // Changed: If no expiry, consider it valid (not expired)
      }

      const now = Date.now();
      const expiryTime = expiry * 1000;
      const isExpired = now >= expiryTime;

      console.log(
        `Token expiry check: Current time: ${new Date(
          now
        ).toISOString()}, Expiry time: ${new Date(
          expiryTime
        ).toISOString()}, Is expired: ${isExpired}`
      );

      return isExpired;
    } catch (e) {
      console.error("Token validation error:", e);
      return false; // Changed: On error, consider token valid to prevent accidental logouts
    }
  };

  public constructor() {
    try {
      this.token = localStorage.getItem(
        TOKEN_STORAGE_KEY
      );
      console.log(
        "Constructor - Token from localStorage:",
        this.token ? "Found token" : "No token"
      );

      if (this.token) {
        // Always consider the token valid if it exists in localStorage
        this.loggedIn = true;
        console.log(
          "Constructor - Token found, user is logged in"
        );
      } else {
        console.log(
          "Constructor - No token found"
        );
        this.token = null;
        this.loggedIn = false;
      }
    } catch (error) {
      console.error(
        "Error in AuthState constructor:",
        error
      );
      this.token = null;
      this.loggedIn = false;
    }
  }
}

// Helper function to safely save token to localStorage
function saveTokenToStorage(token: string): void {
  try {
    localStorage.setItem(
      TOKEN_STORAGE_KEY,
      token
    );
    console.log(
      "Token saved to localStorage successfully"
    );
  } catch (error) {
    console.error(
      "Failed to save token to localStorage:",
      error
    );
  }
}

// Helper function to remove token from localStorage
function removeTokenFromStorage(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    console.log(
      "Token removed from localStorage"
    );
  } catch (error) {
    console.error(
      "Failed to remove token from localStorage:",
      error
    );
  }
}

// Helper function to get token from localStorage
function getTokenFromStorage(): string | null {
  try {
    const token = localStorage.getItem(
      TOKEN_STORAGE_KEY
    );
    console.log(
      "Retrieved token from localStorage:",
      token ? "Found" : "Not found"
    );
    return token;
  } catch (error) {
    console.error(
      "Failed to get token from localStorage:",
      error
    );
    return null;
  }
}

export function authReducer(
  currentState = new AuthState(),
  action: AuthAction
): AuthState {
  console.log(
    "Auth reducer called with action:",
    action.type
  );

  const newState = new AuthState();

  // Initialize with current state values
  newState.token = currentState.token;
  newState.loggedIn = currentState.loggedIn;

  switch (action.type) {
    case AuthActionType.Login:
      console.log(
        "Login action received, payload:",
        action.payload
          ? "Has payload"
          : "No payload"
      );

      if (
        action.payload &&
        action.payload.token
      ) {
        console.log(
          "Valid token received in login action"
        );
        newState.token = action.payload.token;
        newState.loggedIn = true;

        // Save token to localStorage
        saveTokenToStorage(action.payload.token);
      } else {
        console.error(
          "Login action missing token in payload"
        );
      }
      break;

    case AuthActionType.Logout:
      console.log("Logout action received");
      newState.token = null;
      newState.loggedIn = false;

      // Remove token from localStorage
      removeTokenFromStorage();
      break;

    case AuthActionType.RefreshToken:
      console.log("RefreshToken action received");
      const storedToken = getTokenFromStorage();

      if (storedToken) {
        console.log(
          "Found token in localStorage during refresh"
        );
        newState.token = storedToken;
        newState.loggedIn = true;
      }
      break;
  }

  return newState;
}

// Create the store
export const authStore = createStore(authReducer);

// Helper function to check login status
export function isLoggedIn(): boolean {
  const state = authStore.getState();
  console.log(
    "isLoggedIn helper called, current state:",
    state.loggedIn ? "Logged in" : "Logged out"
  );
  return state.loggedIn;
}

// Helper function to manually set token (for debugging)
export function debugSetToken(
  token: string
): void {
  authStore.dispatch({
    type: AuthActionType.Login,
    payload: { token },
  });
  console.log("Debug: Token manually set");
}

// Helper function to check and refresh auth state from localStorage
export function refreshAuthState(): void {
  const token = getTokenFromStorage();
  const currentState = authStore.getState();

  console.log(
    "Refreshing auth state from localStorage"
  );

  if (token) {
    // If we have a token in localStorage, always consider it valid
    if (
      !currentState.token ||
      !currentState.loggedIn
    ) {
      console.log(
        "Found token in localStorage, restoring login state"
      );
      authStore.dispatch({
        type: AuthActionType.RefreshToken,
      });
    }
  } else if (currentState.token) {
    // We have a token in state but not in storage
    console.log(
      "Token missing from localStorage but present in state, saving it"
    );
    saveTokenToStorage(currentState.token);
  }
}
