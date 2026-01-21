'use strict';
const db = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const manager = await db.User.findOne({ where: { email: 'manager@example.com' } });

    if (!manager) {
      console.log('Manager user not found. Please run user seeder first.');
      return;
    }

    const currentDate = new Date();
    const futureDate = new Date();
    futureDate.setMonth(currentDate.getMonth() + 6); // Project ends 6 months from now

    await queryInterface.bulkInsert('Projects', [
      {
        name: 'Website Redesign',
        description: 'Redesign the company website for better UX and modern aesthetics.',
        budget: 15000.00,
        status: 'ONGOING',
        startDate: currentDate,
        endDate: futureDate,
        managerId: manager.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Mobile App Development',
        description: 'Develop a new mobile application for both Android and iOS platforms.',
        budget: 25000.00,
        status: 'ONGOING',
        startDate: currentDate,
        endDate: futureDate,
        managerId: manager.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Projects', null, {});
  }
};
