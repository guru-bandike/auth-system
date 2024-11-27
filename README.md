<h1 align="center" style="font-weight: bolder; color: #059d06">Auth System</h1>

<p align="center">
  <a href="https://auth-system-xi.vercel.app/" target="_blank">View Live App</a>
</p>

## Project Description

**Auth System** is a secure user authentication application designed to handle user registration, login, password management, and session tracking. The system integrates Google reCAPTCHA to prevent bot access and supports Google OAuth for a streamlined login experience. The backend and frontend are built to offer a seamless and secure user experience with robust error handling.

## Key Features

- **User Authentication**: Secure user registration and login with encrypted passwords.
- **Password Management**: Allows users to reset passwords if forgotten.
- **Session Management**: Tracks user sessions using server-side sessions.
- **Google reCAPTCHA**: Protects login and signup pages from bot traffic.
- **Google OAuth**: Allows users to log in using their Google accounts.
- **Error Logging**: Custom error logging for enhanced debugging and monitoring.

## Tech Used

The **Auth System** application uses the following technologies and tools:

### Frontend

- **HTML5**: For structuring pages.
- **CSS3**: For styling and layout.
- **JavaScript**: For client-side scripting.
- **EJS**: Template engine For dynamic content rendering.

### Backend

- **bullmq**: For Job queue management.
- **Mongoose**: ODM library for MongoDB and Node.js.
- **MongoDB**: NoSQL database for storing user data.
- **Node.js**: JavaScript runtime for server-side development.
- **Passport.js**: For Google OAuth and local authentication.
- **Express.js**: Web framework for handling HTTP requests and routing.

### Development Tools

- **npm**: Package manager for managing project dependencies.
- **Git**: Version control system for tracking changes.

### Deployment

- **Render**: Cloud platform for deploying and hosting the application.

### Other Libraries and Packages

- **express-session**: For managing user sessions.
- **dotenv**: For managing environment variables.
- **winston**: For logging errors.
- **express-ejs-layouts**: For managing EJS layouts.
- **nodemailer**: For sending Emails.
- **express-useragent**: Device and platform detection.
- **bcrypt**: Password hashing.
- **connect-flash**: Temporary message storage.
- **connect-mongo**: MongoDB session storage.

## Folder Structure

```
# AUTH-SYSTEM

- config/
  - db.config.js           # MongoDB configuration
  - passport.config.js     # Google OAuth configuration
- Controllers/
  - user.controller.js
- errors/
  - RequestError.js        # Custom error handling
- Middlewares/
- Models/
  - user.model.js          # User schema/model
- node_modules/
- public/
  - css/
  - js/
  - logos/
- Repositories/
  - user.repository.js
- Routes/
  - home.routes.js
  - user.routes.js
- Utils/
  - EmailService.js       # Service for sending emails
  - errorLogger.js
- views/
  - layouts/
    - main.ejs
  - home.ejs
  - login.ejs
  - signup.ejs
- .env
- .env.example
- .gitignore
- app.js
- env.js
- error.log
- package-lock.json
- package.json
- server.js

```

## Installation

To get started with the **Auth System** project, follow these steps:

### Prerequisites

Make sure the following are installed on your machine:

- **npm**
- **Node.js**
- **MongoDB** (running locally or using a cloud instance)
- **Redis** (For job queue management with BullMQ)

### Clone the Repository

```bash
git clone https://github.com/guru-bandike/auth-system.git
cd Auth-System
```

### Install Dependencies

```bash
npm install
```

### Set Up Environment Variables

- Create a `.env` file in the root of the project by copying the `.env.example` file:

```bash
cp .env.example .env
```

- Open the **.env** file and set the values for your environment (e.g., MongoDB URI, Google OAuth credentials, reCAPTCHA keys).

### Start the Application

To start the app in development mode:

```bash
npm run dev
```

---

<h3 align="center" style="font-weight: bolder; color: #059d06">Good Luck and Happy Coding!</h3>
