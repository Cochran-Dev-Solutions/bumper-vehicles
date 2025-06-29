import { UserDal } from "@bumper-vehicles/database";

// Store the UserDal instance
let userDal = null;

// Initialize the UserDal
export const initializeUserDal = () => {
  userDal = new UserDal();
};

// GET /users - Get all users
export const getAllUsers = async (request, reply) => {
  try {
    if (!userDal) {
      throw new Error("UserDal not initialized");
    }

    const result = await userDal.getAllUsers();
    return reply.send(result);
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// GET /users/:id - Get user by ID
export const getUserById = async (request, reply) => {
  try {
    if (!userDal) {
      throw new Error("UserDal not initialized");
    }

    const { id } = request.params;
    const result = await userDal.getUserById(id);

    if (!result.success) {
      return reply.status(404).send(result);
    }

    return reply.send(result);
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

// POST /users - Create new user
export const createUser = async (request, reply) => {
  try {
    if (!userDal) {
      throw new Error("UserDal not initialized");
    }

    const userData = request.body;
    const result = await userDal.createUser(userData);

    return reply.status(201).send(result);
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: "Failed to create user",
      error: error.message,
    });
  }
};

// PATCH /users/:id - Update user by ID
export const updateUserById = async (request, reply) => {
  try {
    if (!userDal) {
      throw new Error("UserDal not initialized");
    }

    const { id } = request.params;
    const updateData = request.body;

    const result = await userDal.updateUser(id, updateData);

    if (!result.success) {
      return reply.status(404).send(result);
    }

    return reply.send(result);
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
};

// DELETE /users/:id - Delete user by ID
export const deleteUserById = async (request, reply) => {
  try {
    if (!userDal) {
      throw new Error("UserDal not initialized");
    }

    const { id } = request.params;
    const result = await userDal.deleteUser(id);

    if (!result.success) {
      return reply.status(404).send(result);
    }

    return reply.send(result);
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};
