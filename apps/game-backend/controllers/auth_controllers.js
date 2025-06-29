import bcrypt from "bcryptjs";
import { UserDal, UnverifiedUserDal } from "@bumper-vehicles/database";
import {
  sendVerificationEmail,
  generateVerificationCode,
  generateExpirationTime,
} from "@bumper-vehicles/mailer";

// Store the DAL instances
let userDal = null;
let unverifiedUserDal = null;

// Initialize the DALs
export const initializeAuthDal = () => {
  userDal = new UserDal();
  unverifiedUserDal = new UnverifiedUserDal();
};

// POST /signup - Create unverified user and send verification email
export const signup = async (request, reply) => {
  try {
    if (!userDal || !unverifiedUserDal) {
      throw new Error("Auth DALs not initialized");
    }

    const { username, email, password } = request.body;

    // Validate required fields
    if (!username || !email || !password) {
      return reply.status(400).send({
        success: false,
        message: "Username, email, and password are required",
      });
    }

    // Check if user already exists in verified users
    const existingUser = await userDal.getUserByUsernameOrEmail(username);
    if (existingUser.success) {
      return reply.status(400).send({
        success: false,
        message: "User already exists",
      });
    }

    const existingUserByEmail = await userDal.getUserByUsernameOrEmail(email);
    if (existingUserByEmail.success) {
      return reply.status(400).send({
        success: false,
        message: "Email already registered",
      });
    }

    // Check if user exists in unverified users
    const existingUnverified = await unverifiedUserDal.getUnverifiedUserByEmail(
      email
    );
    if (existingUnverified.success) {
      return reply.status(400).send({
        success: false,
        message:
          "Email verification already pending. Please check your email or request a new verification code.",
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = generateExpirationTime();

    // Create unverified user
    const unverifiedUserData = {
      username,
      email,
      password: hashedPassword,
      verification_code: verificationCode,
      expires_at: expiresAt,
    };

    const result = await unverifiedUserDal.createUnverifiedUser(
      unverifiedUserData
    );

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationCode, username);
    } catch (emailError) {
      // If email fails, delete the unverified user
      await unverifiedUserDal.deleteUnverifiedUser(result.data.id);
      console.error("Email sending failed:", emailError.message);
      return reply.status(500).send({
        success: false,
        message: "Failed to send verification email. Please try again.",
        error: emailError.message,
      });
    }

    return reply.status(201).send({
      success: true,
      message:
        "Signup successful. Please check your email for verification code.",
      data: {
        email,
        username,
      },
    });
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: "Failed to create account",
      error: error.message,
    });
  }
};

// POST /verify - Verify email and move user to verified table
export const verify = async (request, reply) => {
  try {
    if (!userDal || !unverifiedUserDal) {
      throw new Error("Auth DALs not initialized");
    }

    const { email, verification_code } = request.body;

    if (!email || !verification_code) {
      return reply.status(400).send({
        success: false,
        message: "Email and verification code are required",
      });
    }

    // Find unverified user by verification code
    const unverifiedUserResult =
      await unverifiedUserDal.getUnverifiedUserByVerificationCode(
        verification_code
      );

    if (!unverifiedUserResult.success) {
      return reply.status(400).send({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    const unverifiedUser = unverifiedUserResult.data;

    // Verify email matches
    if (unverifiedUser.email !== email) {
      return reply.status(400).send({
        success: false,
        message: "Email does not match verification code",
      });
    }

    // Create verified user
    const userData = {
      username: unverifiedUser.username,
      email: unverifiedUser.email,
      display_name: unverifiedUser.username, // Use username as display_name for now
      password: unverifiedUser.password,
    };

    const createUserResult = await userDal.createUser(userData);

    if (!createUserResult.success) {
      return reply.status(500).send({
        success: false,
        message: "Failed to create verified user",
      });
    }

    // Delete unverified user
    await unverifiedUserDal.deleteUnverifiedUser(unverifiedUser.id);

    return reply.status(200).send({
      success: true,
      message: "Email verified successfully. You can now log in.",
      data: {
        username: unverifiedUser.username,
        email: unverifiedUser.email,
      },
    });
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: "Failed to verify email",
      error: error.message,
    });
  }
};

// POST /resend-verification - Resend verification email
export const resendVerification = async (request, reply) => {
  try {
    if (!unverifiedUserDal) {
      throw new Error("Auth DALs not initialized");
    }

    const { email } = request.body;

    if (!email) {
      return reply.status(400).send({
        success: false,
        message: "Email is required",
      });
    }

    // Find unverified user
    const unverifiedUserResult =
      await unverifiedUserDal.getUnverifiedUserByEmail(email);

    if (!unverifiedUserResult.success) {
      return reply.status(404).send({
        success: false,
        message: "No pending verification found for this email",
      });
    }

    const unverifiedUser = unverifiedUserResult.data;

    // Generate new verification code
    const newVerificationCode = generateVerificationCode();
    const newExpiresAt = generateExpirationTime();

    // Update verification code
    await unverifiedUserDal.updateVerificationCode(
      email,
      newVerificationCode,
      newExpiresAt
    );

    // Send new verification email
    try {
      await sendVerificationEmail(
        email,
        newVerificationCode,
        unverifiedUser.username
      );
    } catch (emailError) {
      console.error("Email sending failed:", emailError.message);
      return reply.status(500).send({
        success: false,
        message: "Failed to send verification email. Please try again.",
        error: emailError.message,
      });
    }

    return reply.status(200).send({
      success: true,
      message: "Verification email sent successfully",
    });
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: "Failed to resend verification email",
      error: error.message,
    });
  }
};

// POST /login - Authenticate user
export const login = async (request, reply) => {
  try {
    if (!userDal) {
      throw new Error("Auth DALs not initialized");
    }

    const { identifier, password } = request.body; // identifier can be username or email

    if (!identifier || !password) {
      return reply.status(400).send({
        success: false,
        message: "Username/email and password are required",
      });
    }

    // Find user by username or email
    const userResult = await userDal.getUserByUsernameOrEmail(identifier);

    if (!userResult.success) {
      return reply.status(401).send({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = userResult.data;

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return reply.status(401).send({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Set session
    request.session.set("userId", user.id);
    request.session.set("username", user.username);
    request.session.set("email", user.email);

    return reply.status(200).send({
      success: true,
      message: "Login successful",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
      },
    });
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: "Failed to login",
      error: error.message,
    });
  }
};

// POST /logout - Logout user
export const logout = async (request, reply) => {
  try {
    // Destroy session
    request.session.delete();

    return reply.status(200).send({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: "Failed to logout",
      error: error.message,
    });
  }
};

// GET /me - Get current user info
export const getCurrentUser = async (request, reply) => {
  try {
    const userId = request.session.get("userId");

    if (!userId) {
      return reply.status(401).send({
        success: false,
        message: "Not authenticated",
      });
    }

    const userResult = await userDal.getUserById(userId);

    if (!userResult.success) {
      return reply.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    const user = userResult.data;

    return reply.status(200).send({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
      },
    });
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: "Failed to get user info",
      error: error.message,
    });
  }
};
