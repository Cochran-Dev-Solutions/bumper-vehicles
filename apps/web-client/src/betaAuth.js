import { ajax } from "client-logic";

class BetaAuth {
  constructor() {
    this.isProduction = import.meta.env.VITE_NODE_ENV === "production";
    this.storageKey = "bumper_beta_auth";
  }

  // Check if we're in production mode
  isProductionMode() {
    return this.isProduction;
  }

  // Check if user is already authenticated
  isAuthenticated() {
    if (!this.isProductionMode()) {
      return true; // Always allow in development
    }

    const authData = localStorage.getItem(this.storageKey);
    if (!authData) {
      return false;
    }

    try {
      const parsed = JSON.parse(authData);
      // Check if the auth data is still valid (not expired)
      if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
        localStorage.removeItem(this.storageKey);
        return false;
      }
      return true;
    } catch (error) {
      localStorage.removeItem(this.storageKey);
      return false;
    }
  }

  // Store authentication data
  storeAuthData(userData) {
    if (!this.isProductionMode()) {
      return;
    }

    const authData = {
      ...userData,
      authenticatedAt: new Date().toISOString(),
      // expires after 30 days
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    localStorage.setItem(this.storageKey, JSON.stringify(authData));
  }

  // Clear authentication data
  clearAuthData() {
    localStorage.removeItem(this.storageKey);
  }

  // Get stored authentication data
  getAuthData() {
    if (!this.isProductionMode()) {
      return null;
    }

    const authData = localStorage.getItem(this.storageKey);
    if (!authData) {
      return null;
    }

    try {
      return JSON.parse(authData);
    } catch (error) {
      this.clearAuthData();
      return null;
    }
  }

  // Show authentication prompt
  async promptForCredentials() {
    return new Promise((resolve, reject) => {
      const username = prompt("Enter your beta username:");

      if (username === null) {
        // User clicked cancel
        reject(new Error("Authentication cancelled"));
        return;
      }

      if (!username.trim()) {
        alert("Username is required");
        this.promptForCredentials().then(resolve).catch(reject);
        return;
      }

      const password = prompt("Enter your beta password:");

      if (password === null) {
        // User clicked cancel
        reject(new Error("Authentication cancelled"));
        return;
      }

      if (!password.trim()) {
        alert("Password is required");
        this.promptForCredentials().then(resolve).catch(reject);
        return;
      }

      resolve({ username: username.trim(), password: password.trim() });
    });
  }

  // Authenticate beta user
  async authenticate() {
    if (!this.isProductionMode()) {
      return { success: true, data: { isDevelopment: true } };
    }

    // Check if already authenticated
    if (this.isAuthenticated()) {
      return { success: true, data: this.getAuthData() };
    }

    try {
      // Prompt for credentials
      const credentials = await this.promptForCredentials();

      // Send authentication request
      const response = await ajax.post("/beta-auth", credentials);

      if (response.ok && response.data.success) {
        // Store authentication data
        this.storeAuthData(response.data.data);
        return { success: true, data: response.data.data };
      } else {
        // Authentication failed
        alert("Invalid username or password. Please try again.");
        // Refresh page to prompt again
        window.location.reload();
        return { success: false, error: "Invalid credentials" };
      }
    } catch (error) {
      if (error.message === "Authentication cancelled") {
        // User cancelled authentication, exit the page
        window.close();
        // If window.close() doesn't work, try to navigate away
        window.location.href = "about:blank";
        return { success: false, error: "Authentication cancelled" };
      }

      console.error("Beta authentication error:", error);
      alert("Authentication failed. Please try again.");
      window.location.reload();
      return { success: false, error: error.message };
    }
  }

  // Check authentication status with server
  async checkServerAuth() {
    if (!this.isProductionMode()) {
      return { success: true, authenticated: true };
    }

    try {
      const response = await ajax.get("/beta-auth/check");
      return response.data;
    } catch (error) {
      console.error("Server auth check error:", error);
      return { success: false, authenticated: false };
    }
  }

  // Initialize beta authentication
  async init() {
    if (!this.isProductionMode()) {
      console.log("Beta authentication skipped in development mode");
      return { success: true, data: { isDevelopment: true } };
    }

    console.log("Initializing beta authentication...");

    // Check server authentication status
    const serverAuth = await this.checkServerAuth();

    if (serverAuth.authenticated) {
      console.log("User is authenticated via server session");
      return { success: true, data: { authenticated: true } };
    }

    // Check local storage
    if (this.isAuthenticated()) {
      console.log("User is authenticated via local storage");
      return { success: true, data: this.getAuthData() };
    }

    // Need to authenticate
    console.log("User needs to authenticate");
    return await this.authenticate();
  }
}

// Create singleton instance
const betaAuth = new BetaAuth();
export default betaAuth;
