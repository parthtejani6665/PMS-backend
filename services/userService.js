const db = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const createUser = async (userData) => {
  const { email, password } = userData;

  const userExists = await db.User.findOne({ where: { email } });
  if (userExists) {
    throw new Error('User with that email already exists.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await db.User.create({
    ...userData,
    password: hashedPassword,
  });

  // Exclude password from the returned object
  const { password: _, ...userResponse } = user.toJSON();
  return userResponse;
};

const getAllUsers = async (page = 1, limit = 10, filters = {}) => {
  const offset = (page - 1) * limit;
  const { name, email, role, isActive } = filters;

  const where = {};
  if (name) where.name = { [Op.iLike]: `%${name}%` };
  if (email) where.email = { [Op.iLike]: `%${email}%` };
  if (role) where.role = role;
  if (isActive !== undefined) where.isActive = isActive;

  const { count, rows: users } = await db.User.findAndCountAll({
    where,
    limit,
    offset,
    attributes: { exclude: ['password'] },
    order: [['createdAt', 'DESC']],
  });

  return {
    users,
    totalItems: count,
    currentPage: page,
    totalPages: Math.ceil(count / limit),
  };
};

const getUserById = async (id) => {
  const user = await db.User.findByPk(id, {
    attributes: { exclude: ['password'] },
  });
  if (!user) {
    throw new Error('User not found.');
  }
  return user;
};

const updateUser = async (id, updateData) => {
  const user = await db.User.findByPk(id);
  if (!user) {
    throw new Error('User not found.');
  }

  if (updateData.email && updateData.email !== user.email) {
    const emailExists = await db.User.findOne({ where: { email: updateData.email } });
    if (emailExists) {
      throw new Error('Email already in use.');
    }
  }

  await user.update(updateData);
  const { password: _, ...userResponse } = user.toJSON();
  return userResponse;
};

const activateDeactivateUser = async (id, isActive) => {
  const user = await db.User.findByPk(id);
  if (!user) {
    throw new Error('User not found.');
  }

  await user.update({ isActive });
  const { password: _, ...userResponse } = user.toJSON();
  return userResponse;
};

module.exports = { createUser, getAllUsers, getUserById, updateUser, activateDeactivateUser };
