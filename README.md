# Smart Project Work Management System (PMS) Backend

This is the backend for the Smart Project Work Management System, built with Node.js, Express, PostgreSQL, and Sequelize.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup Steps](#setup-steps)
- [Database Setup](#database-setup)
- [Running Migrations & Seeders](#running-migrations--seeders)
- [Starting the Server](#starting-the-server)
- [API Endpoints](#api-endpoints)
- [User Roles and Access Control](#user-roles-and-access-control)

## Features

- User Authentication (JWT)
- Role-Based Access Control (RBAC)
- User Management (CRUD, Activate/Deactivate)
- Project Management (CRUD, Assign Manager, Update Status)
- Task Management (CRUD, Assign Employee, Update Status)
- Timesheet Management (CRUD, validations)
- Reporting Module (Project Cost, Employee Work Hour, Task Completion, Monthly Summary)
- Centralized Error Handling
- Input Validation (Joi)
- Pagination for list APIs

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT for Authentication
- bcryptjs for password hashing
- Joi for input validation

## Setup Steps

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd pms
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Create `.env` file:**

    Copy the `.env.example` file to `.env` and fill in your database credentials and JWT secret.

    ```bash
    cp .env.example .env
    ```

    Example `.env` content:

    ```
    # Database Configuration
    DB_USERNAME=pms_user
    DB_PASSWORD=password
    DB_DATABASE=pms_dev
    DB_HOST=127.0.0.1
    DB_PORT=5432

    # Application Port
    PORT=3000

    # JWT Secret
    JWT_SECRET=supersecretjwtkey
    JWT_EXPIRES_IN=1h
    ```

## Database Setup

This project uses PostgreSQL. Ensure you have a PostgreSQL server running.

1.  **Create a PostgreSQL database:**

    You can create a new user and database using `psql` or a GUI tool like pgAdmin.

    ```sql
    CREATE USER pms_user WITH PASSWORD 'password';
    CREATE DATABASE pms_dev OWNER pms_user;
    GRANT ALL PRIVILEGES ON DATABASE pms_dev TO pms_user;
    ```

    _Note: Replace `pms_user`, `password`, and `pms_dev` with your desired credentials._

## Running Migrations & Seeders

After setting up your `.env` file and database, run the migrations and seeders to set up your tables and initial data.

1.  **Run migrations:**

    ```bash
    npm run sequelize db:migrate
    ```

2.  **Run seeders (optional, but recommended for initial data):**

    ```bash
    npm run sequelize db:seed:all
    ```

    This will create an `ADMIN`, `MANAGER`, and `EMPLOYEE` user with the password `password123`.

## Starting the Server

```bash
npm start
# or
node server.js
```

The API will be running on `http://localhost:3000` (or the port specified in your `.env` file).

## API Endpoints

_Detailed API documentation (e.g., Swagger) is planned for future implementation._

### Authentication

-   `POST /api/auth/register` (Admin only) - Register a new user
-   `POST /api/auth/login` - Login and get JWT token

### User Management (Admin only)

-   `POST /api/users` - Create user
-   `GET /api/users` - List users with pagination
-   `GET /api/users/:id` - Get user by ID
-   `PUT /api/users/:id` - Update user
-   `PATCH /api/users/:id/status` - Activate / Deactivate user

### Project Management

-   `POST /api/projects` (Admin) - Create project
-   `PUT /api/projects/:id/assign-manager` (Admin) - Assign manager to project
-   `GET /api/projects` (Admin, Manager) - List projects (role-based filtering)
-   `GET /api/projects/:id` (Admin, Manager) - Get project by ID
-   `PUT /api/projects/:id` (Admin, Manager) - Update project (including status)

### Task Management

-   `POST /api/tasks` (Admin, Manager) - Create task under a project
-   `GET /api/tasks` (Admin, Manager, Employee) - List tasks by project / by user
-   `GET /api/tasks/:id` (Admin, Manager, Employee) - Get task by ID
-   `PUT /api/tasks/:id` (Admin, Manager, Employee*) - Update task status with controlled transitions. *Employees can only update their assigned task's status.
-   `PATCH /api/tasks/:id/assign` (Admin, Manager) - Assign task to employee

### Timesheet Management

-   `POST /api/timesheets` (Employee, Manager, Admin) - Create timesheet (rules enforced)
-   `GET /api/timesheets` (Employee, Manager, Admin) - View timesheets (role-based filtering)
-   `GET /api/timesheets/:id` (Employee, Manager, Admin) - View specific timesheet
-   `PUT /api/timesheets/:id` (Employee, Admin) - Update timesheet (with permission check)
-   `DELETE /api/timesheets/:id` (Employee, Admin) - Delete timesheet (controlled)

### Reports Module (Admin, Manager, Employee - permissions vary per report)

-   `GET /api/reports/project-cost` (Admin, Manager) - Project Cost Report
-   `GET /api/reports/employee-work-hour` (Admin, Manager, Employee) - Employee Work Hour Report
-   `GET /api/reports/task-completion` (Admin, Manager, Employee) - Task Completion Report
-   `GET /api/reports/monthly-summary` (Admin, Manager, Employee) - Monthly Summary Report

## User Roles and Access Control

-   **Admin:** Full control over users, projects, tasks, timesheets, and all reports.
-   **Manager:** Create and manage projects assigned to them. Assign tasks. View timesheets and project-level reports for their managed projects.
-   **Employee:** View assigned tasks, create and view their own timesheets, view their own work hour reports and task completion reports.

All access control is enforced at the backend level. Only active users can log in.
