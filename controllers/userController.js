const userService = require('../services/userService');
const { createUserSchema, updateUserSchema, activateDeactivateUserSchema } = require('../validations/userValidation');

const createUser = async (req, res, next) => {
  try {
    const { error, value } = createUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const user = await userService.createUser(value);
    res.status(201).json({ message: 'User created successfully.', user });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, name, email, role, isActive } = req.query;
    const filters = { name, email, role, isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined };
    const { users, totalItems, currentPage, totalPages } = await userService.getAllUsers(parseInt(page), parseInt(limit), filters);
    res.status(200).json({
      users,
      totalItems,
      currentPage,
      totalPages,
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { error, value } = updateUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const user = await userService.updateUser(req.params.id, value);
    res.status(200).json({ message: 'User updated successfully.', user });
  } catch (error) {
    next(error);
  }
};

const activateDeactivateUser = async (req, res, next) => {
  try {
    const { error, value } = activateDeactivateUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const user = await userService.activateDeactivateUser(req.params.id, value.isActive);
    res.status(200).json({ message: `User ${value.isActive ? 'activated' : 'deactivated'} successfully.`, user });
  } catch (error) {
    next(error);
  }
};

module.exports = { createUser, getAllUsers, getUserById, updateUser, activateDeactivateUser };
