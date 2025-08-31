
# Mediterranean College Alumni Portal

A full-stack alumni portal for Mediterranean College built with React and Node.js. This web application allows graduates to register, log in, update their profiles, and stay connected through a centralized alumni database and messaging system.

---

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Dependencies](#dependencies)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributors](#contributors)
- [License](#license)

---

## Introduction

This project enables former students of Mediterranean College to:

- Create and manage user accounts
- View and edit personal alumni profiles
- Stay connected with other graduates
- Receive email notifications via the portal
- Use a responsive, mobile-friendly interface

---

## Features

- 🔐 User registration and JWT-based login
- 📄 Alumni profile management
- ✉️ Email integration (e.g. confirmation, communication)
- 🧰 PostgreSQL database via Sequelize ORM
- 📦 React frontend with Bootstrap styling
- 🔁 Secure API using Express and CORS

---

## Installation

### Prerequisites

- Node.js (v16+)
- PostgreSQL database
- Git

---

### Backend Setup

```bash
cd server
npm install
cp .env.example .env  # Create and edit environment variables
npm run dev           # Or use: npm start
```

Environment variables in `.env` include:

- `PORT`
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`
- `EMAIL_USER`, `EMAIL_PASS`

---

### Frontend Setup

```bash
cd client
npm install
npm start
```

Visit `http://localhost:3000` to use the application.

---

## Configuration

- Frontend uses environment configs in `client/.env`
- Backend environment handled via `server/.env`
- Email integration via `nodemailer`
- Database connection via Sequelize (`pg`, `pg-hstore`)

---

## Dependencies

### Backend

- `express`, `cors`, `dotenv`
- `sequelize`, `pg`, `pg-hstore`
- `bcrypt`, `jsonwebtoken`
- `nodemailer`, `validator`

### Frontend

- `react`, `react-dom`, `react-router-dom`
- `axios`
- `bootstrap`, `bootstrap-icons`

---

## Deployment

To deploy this project:

1. Set up PostgreSQL hosting (e.g. Render, Supabase, Heroku)
2. Deploy the server (e.g. Render or Railway)
3. Build the client:
   ```bash
   npm run build
   ```
4. Serve with Nginx or integrate into backend

---

## Troubleshooting

| Issue                      | Solution                                                                 |
|----------------------------|--------------------------------------------------------------------------|
| API not responding         | Ensure server is running and `.env` is configured correctly              |
| Database connection failed | Confirm PostgreSQL is running and credentials are correct                |
| Emails not sending         | Set up valid SMTP credentials in `.env`                                  |
| React app not loading data | Confirm `axios` base URL matches the backend server                      |

---

## Contributors

- Developed and maintained by Mediterranean College developers
- Structured for academic and community engagement

---

## License

This project is open-source and available for academic or non-commercial use.
