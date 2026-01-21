'use strict';
const db = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const project1 = await db.Project.findOne({ where: { name: 'Website Redesign' } });
    const employee = await db.User.findOne({ where: { email: 'employee@example.com' } });

    if (!project1 || !employee) {
      console.log('Project or Employee user not found. Please run project and user seeders first.');
      return;
    }

    await queryInterface.bulkInsert('Tasks', [
      {
        title: 'Design Homepage Mockups',
        description: 'Create high-fidelity mockups for the new website homepage.',
        estimatedHours: 40.00,
        status: 'TODO',
        projectId: project1.id,
        assignedTo: employee.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Develop User Authentication',
        description: 'Implement user registration and login functionality.',
        estimatedHours: 60.00,
        status: 'IN_PROGRESS',
        projectId: project1.id,
        assignedTo: employee.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Tasks', null, {});
  }
};
