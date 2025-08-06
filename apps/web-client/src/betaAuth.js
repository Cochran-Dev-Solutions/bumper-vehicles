import { ajax } from "client-logic";

class BetaAuth {
  constructor() {
    this.isProduction = import.meta.env.VITE_NODE_ENV === "production";
    this.storageKey = "bumper_beta_auth";
    this.isExplicitlyCancelling = false; // Flag to track explicit cancellation
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

  // Show authentication prompt with better UX
  async promptForCredentials() {
    return new Promise((resolve, reject) => {
      // Show a more helpful message
      const username = prompt("Enter your beta username:");

      if (username === null) {
        // User clicked cancel - mark as explicit cancellation
        this.isExplicitlyCancelling = true;
        reject(new Error("Authentication cancelled"));
        return;
      }

      if (!username.trim()) {
        alert("Username is required. Please try again.");
        this.promptForCredentials().then(resolve).catch(reject);
        return;
      }

      const password = prompt("Enter your beta password:");

      if (password === null) {
        // User clicked cancel - mark as explicit cancellation
        this.isExplicitlyCancelling = true;
        reject(new Error("Authentication cancelled"));
        return;
      }

      if (!password.trim()) {
        alert("Password is required. Please try again.");
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
      // Reset the cancellation flag
      this.isExplicitlyCancelling = false;

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
        // Only exit if this was an explicit cancellation (user clicked Cancel)
        if (this.isExplicitlyCancelling) {
          this.exitApplication();
        }
        return { success: false, error: "Authentication cancelled" };
      }

      console.error("Beta authentication error:", error);
      alert("Authentication failed. Please try again.");
      window.location.reload();
      return { success: false, error: error.message };
    }
  }

  // Exit the application properly - only call this for explicit cancellation
  exitApplication() {
    // Only proceed if this was an explicit cancellation
    if (!this.isExplicitlyCancelling) {
      console.log("Preventing exit - not an explicit cancellation");
      return;
    }

    try {
      // Try to close the window/tab
      window.close();

      // If window.close() doesn't work (due to browser security),
      // try alternative methods
      setTimeout(() => {
        // Try to navigate to a blank page
        window.location.href = "about:blank";

        // If that doesn't work, try to redirect to the landing page
        setTimeout(() => {
          window.location.href = "https://bumpervehicles.com";
        }, 100);
      }, 100);
    } catch (error) {
      console.error("Failed to exit application:", error);
      // Fallback: redirect to landing page
      window.location.href = "https://bumpervehicles.com";
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
